import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { Api } from './api';

describe('integração HTTP', () => {
  let api: Api;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    api = TestBed.inject(Api);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('obtém CSRF antes do login e mantém apenas os dados do usuário em memória', () => {
    api.login('ana@exemplo.com', 'senha').subscribe();
    http.expectOne('/api/auth/csrf').flush({ token: 'token-original' });
    const login = http.expectOne('/api/auth/login');
    expect(login.request.withCredentials).toBe(true);
    expect(login.request.headers.get('X-XSRF-TOKEN')).toBe('token-original');
    expect(login.request.body).toEqual({ email: 'ana@exemplo.com', senha: 'senha' });
    login.flush({ id: 1, nome: 'Ana', email: 'ana@exemplo.com' });
    expect(api.usuario()?.nome).toBe('Ana');
  });

  it('envia os dois filtros juntos e omite filtros vazios', () => {
    api.transacoes('1', '2').subscribe();
    http.expectOne('/api/transacoes?contaId=1&categoriaId=2').flush([]);
    api.transacoes('', '').subscribe();
    http.expectOne('/api/transacoes').flush([]);
  });

  it('envia receita com centavos como texto, sem arredondar no JavaScript', () => {
    api
      .lancar({
        contaId: 1,
        categoriaId: 2,
        tipo: 'RECEITA',
        valor: '9007199254740993.01',
        data: '2026-11-16',
        descricao: '',
      })
      .subscribe();
    http.expectOne('/api/auth/csrf').flush({ token: 'csrf' });
    const request = http.expectOne('/api/transacoes');
    expect(request.request.body.valor).toBe('9007199254740993.01');
    expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('csrf');
    request.flush({ id: 1 });
  });

  it('reconhece sessão existente pelo cookie enviado pelo navegador', async () => {
    const restore = api.restaurarSessao();
    const request = http.expectOne('/api/auth/me');
    expect(request.request.withCredentials).toBe(true);
    request.flush({ id: 1, nome: 'Ana', email: 'ana@exemplo.com' });
    expect((await restore)?.nome).toBe('Ana');
  });

  it('trata sessão ausente sem confundir com indisponibilidade da API', async () => {
    const restore = api.restaurarSessao();
    http
      .expectOne('/api/auth/me')
      .flush({ mensagem: 'Autenticação necessária.' }, { status: 401, statusText: 'Unauthorized' });
    expect(await restore).toBeNull();
    expect(api.usuario()).toBeNull();
  });

  it('limpa a sessão e volta ao login quando uma consulta protegida expira', () => {
    api.usuario.set({ id: 1, nome: 'Ana', email: 'ana@exemplo.com' });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    api.contas().subscribe({ error: () => {} });
    http.expectOne('/api/contas').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(api.usuario()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('protege também o logout com CSRF e limpa os dados da sessão', () => {
    api.usuario.set({ id: 1, nome: 'Ana', email: 'ana@exemplo.com' });
    api.logout().subscribe();
    http.expectOne('/api/auth/csrf').flush({ token: 'csrf' });
    const request = http.expectOne('/api/auth/logout');
    expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('csrf');
    request.flush(null, { status: 204, statusText: 'No Content' });
    expect(api.usuario()).toBeNull();
  });

  it('encerra a sessão local quando o JWT já expirou ao sair', () => {
    api.login('ana@exemplo.com', 'senha').subscribe();
    http.expectOne('/api/auth/csrf').flush({ token: 'csrf-anterior' });
    http.expectOne('/api/auth/login').flush({ id: 1, nome: 'Ana', email: 'ana@exemplo.com' });
    let concluido = false;
    api.logout().subscribe({ next: () => (concluido = true), error: () => {} });
    http.expectOne('/api/auth/csrf').flush({ token: 'novo-csrf' });
    http.expectOne('/api/auth/logout').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(concluido).toBe(true);
    expect(api.usuario()).toBeNull();
  });
});
