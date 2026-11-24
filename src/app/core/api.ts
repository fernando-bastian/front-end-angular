import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { isLosslessNumber, parse } from 'lossless-json';
import {
  catchError,
  defer,
  firstValueFrom,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { Cadastro, Lancamento, Saldos, Transacao, Transferencia, Usuario } from './modelos';

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);
  private router = inject(Router);
  private csrf: string | null = null;
  private sessaoVerificada = false;
  readonly usuario = signal<Usuario | null>(null);
  readonly erroSessao = signal('');

  async restaurarSessao(): Promise<Usuario | null> {
    if (this.sessaoVerificada) return this.usuario();
    try {
      const usuario = await firstValueFrom(this.get<Usuario>('auth/me'));
      this.usuario.set(usuario);
      this.sessaoVerificada = true;
      return usuario;
    } catch (error) {
      this.usuario.set(null);
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.sessaoVerificada = true;
        return null;
      }
      throw error;
    }
  }

  login(email: string, senha: string) {
    this.csrf = null;
    return this.enviar<Usuario>('auth/login', { email, senha }).pipe(
      tap((usuario) => {
        this.usuario.set(usuario);
        this.erroSessao.set('');
        this.sessaoVerificada = true;
      }),
    );
  }

  logout() {
    this.csrf = null;
    return this.enviar<void>('auth/logout', null).pipe(
      catchError((error) =>
        error instanceof HttpErrorResponse && error.status === 401
          ? of(undefined)
          : throwError(() => error),
      ),
      tap(() => {
        this.usuario.set(null);
        this.sessaoVerificada = true;
        this.csrf = null;
      }),
    );
  }

  contas() {
    return this.get<Cadastro[]>('contas');
  }
  categorias() {
    return this.get<Cadastro[]>('categorias');
  }
  criar(recurso: 'contas' | 'categorias', nome: string) {
    return this.enviar<Cadastro>(recurso, { nome });
  }
  atualizarConta(id: number, nome: string) {
    return this.enviar<Cadastro>(`contas/${id}`, { nome }, 'PUT');
  }
  excluirConta(id: number) {
    return this.enviar<void>(`contas/${id}`, null, 'DELETE');
  }
  saldos() {
    return this.get<Saldos>('saldos');
  }
  lancar(dados: Lancamento) {
    return this.enviar<Transacao>('transacoes', dados);
  }
  transferir(dados: Transferencia) {
    return this.enviar<{ id: string }>('transferencias', dados);
  }

  transacoes(contaId = '', categoriaId = '') {
    let params = new HttpParams();
    if (contaId) params = params.set('contaId', contaId);
    if (categoriaId) params = params.set('categoriaId', categoriaId);
    return this.get<Transacao[]>('transacoes', params);
  }

  private get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http
      .get(`/api/${path}`, { withCredentials: true, params, responseType: 'text' })
      .pipe(
        map((body) => this.lerResposta<T>(body)),
        catchError((error) => this.tratarErro(error, path)),
      );
  }

  private enviar<T>(
    path: string,
    body: unknown,
    metodo: 'POST' | 'PUT' | 'DELETE' = 'POST',
  ): Observable<T> {
    // o cookie CSRF é assinado; o cabeçalho usa o token original retornado pela API
    return defer(() =>
      this.csrf
        ? of(this.csrf)
        : this.get<{ token: string }>('auth/csrf').pipe(
            tap((response) => (this.csrf = response.token)),
            map((response) => response.token),
          ),
    ).pipe(
      switchMap((token) =>
        this.http.request(metodo, `/api/${path}`, {
          body,
          withCredentials: true,
          responseType: 'text',
          headers: { 'X-XSRF-TOKEN': token },
        }),
      ),
      map((body) => this.lerResposta<T>(body)),
      catchError((error) => this.tratarErro(error, path)),
    );
  }

  private lerResposta<T>(body: string | null): T {
    // Os decimais precisam ser preservados antes da conversão padrão do JSON para number.
    try {
      return (
        body
          ? parse(body, (key, value) => {
              if (!isLosslessNumber(value)) return value;
              return ['valor', 'saldo', 'saldoGeral'].includes(key)
                ? value.toString()
                : Number(value);
            })
          : null
      ) as T;
    } catch (error) {
      throw new HttpErrorResponse({ status: 200, error: { error, text: body } });
    }
  }

  private tratarErro(error: HttpErrorResponse, path: string): Observable<never> {
    if (typeof error.error === 'string') {
      try {
        error = new HttpErrorResponse({
          ...error,
          url: error.url ?? undefined,
          error: JSON.parse(error.error),
        });
      } catch {
        // Respostas de proxies podem conter HTML em vez do erro JSON da API.
      }
    }
    if (error.status === 401 && !path.startsWith('auth/')) {
      this.usuario.set(null);
      this.sessaoVerificada = false;
      this.csrf = null;
      void this.router.navigate(['/login']);
    }
    return throwError(() => error);
  }
}
