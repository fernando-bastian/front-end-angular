export interface Usuario {
  id: number;
  nome: string;
  email: string;
}
export interface Cadastro {
  id: number;
  nome: string;
}
export type Natureza = 'RECEITA' | 'DESPESA';
export interface Lancamento {
  contaId: number;
  categoriaId: number;
  tipo: Natureza;
  valor: string;
  data: string;
  descricao: string;
}
export interface Transferencia {
  contaOrigemId: number;
  contaDestinoId: number;
  valor: string;
  data: string;
  descricao: string;
}
export interface Transacao {
  id: number;
  contaId: number;
  categoriaId: number | null;
  tipo: Natureza | 'TRANSFERENCIA_SAIDA' | 'TRANSFERENCIA_ENTRADA';
  valor: string;
  data: string;
  descricao: string | null;
  transferenciaId: string | null;
}
export interface SaldoConta {
  contaId: number;
  nome: string;
  saldo: string;
}
export interface Saldos {
  contas: SaldoConta[];
  saldoGeral: string;
}
