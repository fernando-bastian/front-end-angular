import { HttpErrorResponse } from '@angular/common/http';

export function mensagemErro(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (typeof error.error?.mensagem === 'string') {
      const detalhes = Array.isArray(error.error.detalhes) ? error.error.detalhes.join(' ') : '';
      return `${error.error.mensagem} ${detalhes}`.trim();
    }
    if (error.status === 0 || [500, 502, 503, 504].includes(error.status)) {
      return 'Não foi possível acessar o back-end. Confira se ele foi iniciado corretamente.';
    }
    if (error.status === 200 && typeof error.error?.text === 'string') {
      return 'A resposta da API não é válida. Reinicie o front-end para carregar a configuração de conexão.';
    }
  }
  return 'Não foi possível concluir a operação. Tente novamente.';
}

export function valorMonetario(value: string): string | null {
  const valor = value.trim().replace(',', '.');
  if (!/^\d{1,17}(\.\d{1,2})?$/.test(valor) || !/[1-9]/.test(valor)) return null;
  return valor;
}

export function hoje(): string {
  const data = new Date();
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}
