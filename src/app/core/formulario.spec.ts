import { describe, expect, it } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { mensagemErro, valorMonetario } from './formulario';

describe('erros de comunicação', () => {
  it.each([0, 500, 502, 503, 504])(
    'explica indisponibilidade sem resposta JSON no HTTP %s',
    (status) => {
      const erro = new HttpErrorResponse({ status, error: '' });
      expect(mensagemErro(erro)).toContain('back-end');
      expect(mensagemErro(erro)).toContain('iniciado');
    },
  );

  it('preserva a mensagem compreensível enviada pela API', () => {
    const erro = new HttpErrorResponse({
      status: 500,
      error: { mensagem: 'Erro interno ao processar a requisição.', detalhes: [] },
    });
    expect(mensagemErro(erro)).toBe('Erro interno ao processar a requisição.');
  });

  it('identifica uma resposta HTML recebida no lugar do JSON da API', () => {
    const erro = new HttpErrorResponse({
      status: 200,
      error: { text: '<!doctype html><html></html>' },
    });
    expect(mensagemErro(erro)).toContain('resposta da API');
    expect(mensagemErro(erro)).toContain('Reinicie o front-end');
  });
});

describe('valores monetários', () => {
  it.each([
    ['10,25', '10.25'],
    [' 0.01 ', '0.01'],
    ['9007199254740993,01', '9007199254740993.01'],
  ])('normaliza %s sem perder centavos', (value, expected) => {
    expect(valorMonetario(value)).toBe(expected);
  });
  it.each(['', '0', '0.00', '-1', '1,001', '1.000,00', 'abc', '1e3'])('rejeita %s', (value) => {
    expect(valorMonetario(value)).toBeNull();
  });
});
