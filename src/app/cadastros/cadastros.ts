import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../core/api';
import { Cadastro } from '../core/modelos';
import { mensagemErro } from '../core/formulario';

@Component({ selector: 'app-cadastros', imports: [FormsModule], templateUrl: './cadastros.html' })
export class Cadastros implements OnInit {
  private api = inject(Api);
  private route = inject(ActivatedRoute);
  readonly recurso = this.route.snapshot.data['recurso'] as 'contas' | 'categorias';
  readonly titulo = this.route.snapshot.data['titulo'] as string;
  readonly itens = signal<Cadastro[]>([]);
  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly erro = signal('');
  readonly sucesso = signal('');
  readonly editando = signal<Cadastro | null>(null);
  readonly exclusao = signal<Cadastro | null>(null);
  nome = '';

  ngOnInit() {
    this.api[this.recurso]().subscribe({
      next: (itens) => {
        this.itens.set(itens);
        this.carregando.set(false);
      },
      error: (error) => {
        this.erro.set(mensagemErro(error));
        this.carregando.set(false);
      },
    });
  }

  salvar() {
    if (this.salvando() || this.carregando()) return;
    this.erro.set('');
    this.sucesso.set('');
    if (!this.nome.trim() || this.nome.trim().length > 100) {
      this.erro.set('Informe um nome com até 100 caracteres.');
      return;
    }
    this.salvando.set(true);
    const conta = this.editando();
    const request = conta
      ? this.api.atualizarConta(conta.id, this.nome.trim())
      : this.api.criar(this.recurso, this.nome.trim());
    request.subscribe({
      next: (item) => {
        this.itens.update((itens) =>
          conta ? itens.map((atual) => (atual.id === item.id ? item : atual)) : [...itens, item],
        );
        this.nome = '';
        this.editando.set(null);
        this.salvando.set(false);
        this.sucesso.set('Cadastro salvo.');
      },
      error: (error) => {
        this.erro.set(mensagemErro(error));
        this.salvando.set(false);
      },
    });
  }

  editar(item: Cadastro) {
    if (this.salvando() || this.recurso !== 'contas') return;
    this.editando.set(item);
    this.exclusao.set(null);
    this.nome = item.nome;
    this.erro.set('');
    this.sucesso.set('');
  }

  cancelarEdicao() {
    if (this.salvando()) return;
    this.editando.set(null);
    this.nome = '';
  }

  excluir() {
    const item = this.exclusao();
    if (!item || this.salvando() || this.recurso !== 'contas') return;
    this.salvando.set(true);
    this.erro.set('');
    this.sucesso.set('');
    this.api.excluirConta(item.id).subscribe({
      next: () => {
        this.itens.update((itens) => itens.filter((atual) => atual.id !== item.id));
        this.salvando.set(false);
        if (this.editando()?.id === item.id) this.cancelarEdicao();
        this.exclusao.set(null);
        this.sucesso.set('Conta excluída.');
      },
      error: (error) => {
        this.erro.set(mensagemErro(error));
        this.salvando.set(false);
        this.exclusao.set(null);
      },
    });
  }
}
