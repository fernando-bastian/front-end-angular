import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'moeda' })
export class MoedaPipe implements PipeTransform {
  // Intl aceita texto decimal sem perder precisão; a tipagem do TypeScript ainda exige number.
  private formatar = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format as (valor: string | number | bigint) => string;

  transform(valor: string): string {
    return this.formatar(valor);
  }
}
