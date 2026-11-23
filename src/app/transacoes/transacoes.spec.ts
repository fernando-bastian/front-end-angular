import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { Transacoes } from './transacoes';

describe('consulta de transações', () => {
  it('envia os filtros escolhidos na tela e mostra somente o resultado retornado', async () => {
    TestBed.configureTestingModule({
      imports: [Transacoes],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Transacoes);
    fixture.detectChanges();
    http.expectOne('/api/contas').flush([{ id: 1, nome: 'Carteira' }]);
    http.expectOne('/api/categorias').flush([{ id: 2, nome: 'Salário' }]);
    http.expectOne('/api/transacoes').flush([]);
    await fixture.whenStable();
    for (const [id, value] of [
      ['filtro-conta', '1'],
      ['filtro-categoria', '2'],
    ]) {
      const select = fixture.nativeElement.querySelector(`#${id}`) as HTMLSelectElement;
      select.value = value;
      select.dispatchEvent(new Event('change'));
    }
    await fixture.whenStable();
    fixture.nativeElement
      .querySelector('form.filtros')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    http
      .expectOne('/api/transacoes?contaId=1&categoriaId=2')
      .flush([
        {
          id: 1,
          contaId: 1,
          categoriaId: 2,
          tipo: 'RECEITA',
          valor: 100,
          data: '2026-11-16',
          descricao: 'Pagamento',
        },
      ]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('tbody').textContent).toContain('Pagamento');
    expect(fixture.nativeElement.querySelector('tbody').textContent).toContain('Salário');
    http.verify();
  });
});
