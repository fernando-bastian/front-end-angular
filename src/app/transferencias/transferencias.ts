import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { Cadastro } from '../core/modelos';
import { hoje, mensagemErro, valorMonetario } from '../core/formulario';

@Component({
  selector: 'app-transferencias',
  imports: [FormsModule, RouterLink],
  templateUrl: './transferencias.html',
})
export class Transferencias implements OnInit {
  private api = inject(Api);
  readonly contas = signal<Cadastro[]>([]);
  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly erro = signal('');
  readonly sucesso = signal('');
  origem = '';
  destino = '';
  valor = '';
  data = hoje();
  descricao = '';

  ngOnInit() {
    this.api.contas().subscribe({
      next: (contas) => {
        this.contas.set(contas);
        this.carregando.set(false);
      },
      error: (error) => {
        this.erro.set(mensagemErro(error));
        this.carregando.set(false);
      },
    });
  }

  salvar() {
    if (this.salvando()) return;
    this.erro.set('');
    this.sucesso.set('');
    const valor = valorMonetario(this.valor);
    if (!this.origem || !this.destino || this.origem === this.destino || !valor || !this.data) {
      this.erro.set(
        'Selecione duas contas diferentes, uma data e um valor positivo com até duas casas decimais.',
      );
      return;
    }
    this.salvando.set(true);
    this.api
      .transferir({
        contaOrigemId: Number(this.origem),
        contaDestinoId: Number(this.destino),
        valor,
        data: this.data,
        descricao: this.descricao.trim(),
      })
      .subscribe({
        next: () => {
          this.valor = '';
          this.descricao = '';
          this.salvando.set(false);
          this.sucesso.set('Transferência realizada. O saldo geral foi mantido.');
        },
        error: (error) => {
          this.erro.set(mensagemErro(error));
          this.salvando.set(false);
        },
      });
  }
}
