import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../core/api';
import { mensagemErro } from '../core/formulario';

@Component({ selector: 'app-login', imports: [FormsModule], templateUrl: './login.html' })
export class Login implements OnInit {
  private api = inject(Api);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly erro = signal('');
  readonly entrando = signal(false);
  email = '';
  senha = '';

  async ngOnInit() {
    this.erro.set(this.api.erroSessao());
    try {
      if (await this.api.restaurarSessao()) void this.router.navigate(['/']);
    } catch (error) {
      this.erro.set(mensagemErro(error));
    }
  }

  entrar() {
    if (this.entrando()) return;
    this.erro.set('');
    this.entrando.set(true);
    this.api.login(this.email.trim(), this.senha).subscribe({
      next: () => {
        this.senha = '';
        this.entrando.set(false);
        const retorno = this.route.snapshot.queryParamMap.get('retorno') || '/';
        void this.router.navigateByUrl(
          retorno.startsWith('/') && !retorno.startsWith('//') && !retorno.startsWith('/login')
            ? retorno
            : '/',
        );
      },
      error: (error) => {
        this.erro.set(mensagemErro(error));
        this.entrando.set(false);
      },
    });
  }
}
