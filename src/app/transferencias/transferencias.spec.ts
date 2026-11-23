import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { Transferencias } from './transferencias';

describe('transferências', () => {
  it('impede enviar uma transferência para a mesma conta', async () => {
    TestBed.configureTestingModule({
      imports: [Transferencias],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Transferencias);
    fixture.detectChanges();
    http.expectOne('/api/contas').flush([
      { id: 1, nome: 'Carteira' },
      { id: 2, nome: 'Banco' },
    ]);
    await fixture.whenStable();
    for (const id of ['origem', 'destino']) {
      const select = fixture.nativeElement.querySelector(`#${id}`) as HTMLSelectElement;
      select.value = '1';
      select.dispatchEvent(new Event('change'));
    }
    const value = fixture.nativeElement.querySelector('#valor') as HTMLInputElement;
    value.value = '10,50';
    value.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'contas diferentes',
    );
    http.expectNone('/api/transferencias');
    http.verify();
  });
});
