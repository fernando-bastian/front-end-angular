import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Api } from './core/api';
import { mensagemErro } from './core/formulario';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  readonly api = inject(Api);
  private router = inject(Router);
  readonly saindo = signal(false);
  readonly erro = signal('');

  sair() {
    if (this.saindo()) return;
    this.saindo.set(true);
    this.erro.set('');
    this.api.logout().subscribe({
      next: () => {
        this.saindo.set(false);
        void this.router.navigate(['/login']);
      },
      error: (error) => {
        this.saindo.set(false);
        this.erro.set(mensagemErro(error));
      },
    });
  }
}
