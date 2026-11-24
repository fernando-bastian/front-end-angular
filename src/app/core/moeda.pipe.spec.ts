import { describe, expect, it } from 'vitest';
import { MoedaPipe } from './moeda.pipe';

describe('formatação de moeda', () => {
  it.each([
    ['0', 'R$\u00a00,00'],
    ['0.01', 'R$\u00a00,01'],
    ['100.10', 'R$\u00a0100,10'],
    ['-30.05', '-R$\u00a030,05'],
    ['99999999999999999.99', 'R$\u00a099.999.999.999.999.999,99'],
    ['-9007199254740992.99', '-R$\u00a09.007.199.254.740.992,99'],
    ['1E+17', 'R$\u00a0100.000.000.000.000.000,00'],
  ])('exibe %s sem converter para ponto flutuante', (valor, esperado) => {
    expect(new MoedaPipe().transform(valor)).toBe(esperado);
  });
});
