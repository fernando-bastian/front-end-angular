import { Component, inject, OnInit, signal } from '@angular/core';
import { MoedaPipe } from '../core/moeda.pipe';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { Saldos } from '../core/modelos';
import { mensagemErro } from '../core/formulario';

@Component({
  selector: 'app-inicio',
  imports: [MoedaPipe, RouterLink],
  templateUrl: './inicio.html',
})
export class Inicio implements OnInit {
  private api = inject(Api);
  readonly saldos = signal<Saldos | null>(null);
  readonly erro = signal('');

  ngOnInit() {
    this.api
      .saldos()
      .subscribe({
        next: (saldos) => this.saldos.set(saldos),
        error: (error) => this.erro.set(mensagemErro(error)),
      });
  }
}
