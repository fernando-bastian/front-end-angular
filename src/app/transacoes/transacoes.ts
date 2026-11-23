import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Api } from '../core/api';
import { Cadastro, Natureza, Transacao } from '../core/modelos';
import { hoje, mensagemErro, valorMonetario } from '../core/formulario';

@Component({
  selector: 'app-transacoes',
  imports: [FormsModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './transacoes.html',
})
export class Transacoes implements OnInit {
  private api = inject(Api);
  readonly contas = signal<Cadastro[]>([]);
  readonly categorias = signal<Cadastro[]>([]);
  readonly itens = signal<Transacao[]>([]);
  readonly pronto = signal(false);
  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly erro = signal('');
  readonly sucesso = signal('');
  contaId = '';
  categoriaId = '';
  tipo: Natureza = 'DESPESA';
  valor = '';
  data = hoje();
  descricao = '';
  filtroConta = '';
  filtroCategoria = '';

  ngOnInit() {
    forkJoin({ contas: this.api.contas(), categorias: this.api.categorias() }).subscribe({
      next: (dados) => {
        this.contas.set(dados.contas);
        this.categorias.set(dados.categorias);
        this.pronto.set(true);
      },
      error: (error) => this.erro.set(mensagemErro(error)),
    });
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.api.transacoes(this.filtroConta, this.filtroCategoria).subscribe({
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
    if (this.salvando()) return;
    this.erro.set('');
    this.sucesso.set('');
    const valor = valorMonetario(this.valor);
    if (!valor || !this.contaId || !this.categoriaId || !this.data) {
      this.erro.set(
        'Informe conta, categoria, data e um valor positivo com até duas casas decimais.',
      );
      return;
    }
    this.salvando.set(true);
    this.api
      .lancar({
        contaId: Number(this.contaId),
        categoriaId: Number(this.categoriaId),
        tipo: this.tipo,
        valor,
        data: this.data,
        descricao: this.descricao.trim(),
      })
      .subscribe({
        next: () => {
          this.valor = '';
          this.descricao = '';
          this.salvando.set(false);
          this.sucesso.set('Transação salva.');
          this.carregar();
        },
        error: (error) => {
          this.erro.set(mensagemErro(error));
          this.salvando.set(false);
        },
      });
  }

  nomeConta(id: number) {
    return this.contas().find((conta) => conta.id === id)?.nome || `Conta ${id}`;
  }
  nomeCategoria(id: number | null) {
    return id === null
      ? 'Transferência'
      : this.categorias().find((categoria) => categoria.id === id)?.nome || `Categoria ${id}`;
  }
  tipoTexto(tipo: Transacao['tipo']) {
    return {
      RECEITA: 'Receita',
      DESPESA: 'Despesa',
      TRANSFERENCIA_ENTRADA: 'Transferência recebida',
      TRANSFERENCIA_SAIDA: 'Transferência enviada',
    }[tipo];
  }
}
