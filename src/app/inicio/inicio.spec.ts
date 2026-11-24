import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { Inicio } from './inicio';

describe('exibição dos saldos', () => {
  it('mostra saldos grandes e negativos com os centavos exatos recebidos da API', async () => {
    TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Inicio);
    fixture.detectChanges();
    http
      .expectOne('/api/saldos')
      .flush(
        '{"contas":[{"contaId":1,"nome":"Banco","saldo":9007199254740993.01}],"saldoGeral":-9007199254740992.99}',
      );
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.valor-destaque').textContent).toBe(
      '-R$\u00a09.007.199.254.740.992,99',
    );
    expect(fixture.nativeElement.querySelector('.valor-conta').textContent).toBe(
      'R$\u00a09.007.199.254.740.993,01',
    );
    http.verify();
  });
});
