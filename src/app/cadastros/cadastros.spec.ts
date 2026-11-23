import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, expect, it } from 'vitest';
import { Cadastros } from './cadastros';

describe('cadastros', () => {
  it('aguarda a lista inicial antes de permitir salvar outro cadastro', () => {
    TestBed.configureTestingModule({
      imports: [Cadastros],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { recurso: 'contas', titulo: 'Contas' } } },
        },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Cadastros);
    fixture.detectChanges();
    fixture.componentInstance.nome = 'Reserva';
    fixture.componentInstance.salvar();
    http.expectNone('/api/auth/csrf');
    http.expectOne('/api/contas').flush([]);
    http.verify();
  });

  it.each(['contas', 'categorias'])(
    'persiste %s e mostra o registro retornado pela API',
    async (recurso) => {
      TestBed.configureTestingModule({
        imports: [Cadastros],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { data: { recurso, titulo: recurso } } },
          },
        ],
      });
      const http = TestBed.inject(HttpTestingController);
      const fixture = TestBed.createComponent(Cadastros);
      fixture.detectChanges();
      http.expectOne(`/api/${recurso}`).flush([]);
      await fixture.whenStable();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = 'Reserva';
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
      expect(fixture.componentInstance.nome).toBe('Reserva');
      fixture.nativeElement
        .querySelector('form')
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      http.expectOne('/api/auth/csrf').flush({ token: 'csrf' });
      const request = http.expectOne(`/api/${recurso}`);
      expect(request.request.body).toEqual({ nome: 'Reserva' });
      request.flush({ id: 1, nome: 'Reserva' });
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('ul').textContent).toContain('Reserva');
      expect(input.value).toBe('');
      http.verify();
    },
  );
});

describe('edição e exclusão de contas', () => {
  async function preparar() {
    TestBed.configureTestingModule({
      imports: [Cadastros],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { recurso: 'contas', titulo: 'Contas' } } },
        },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Cadastros);
    fixture.detectChanges();
    http.expectOne('/api/contas').flush([{ id: 1, nome: 'Carteira' }]);
    await fixture.whenStable();
    const clicar = async (texto: string) => {
      const botao = [...fixture.nativeElement.querySelectorAll('button')].find(
        (item: any) => item.textContent.trim() === texto,
      ) as HTMLButtonElement | undefined;
      expect(botao, `botão ${texto}`).toBeDefined();
      botao!.click();
      await fixture.whenStable();
    };
    return { http, fixture, clicar };
  }

  it('edita uma conta existente e substitui seu nome na lista', async () => {
    const { http, fixture, clicar } = await preparar();
    await clicar('Editar');
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('Carteira');
    input.value = 'Reserva';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    await clicar('Salvar');
    http.expectOne('/api/auth/csrf').flush({ token: 'csrf' });
    const request = http.expectOne('/api/contas/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ nome: 'Reserva' });
    expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('csrf');
    request.flush({ id: 1, nome: 'Reserva' });
    await fixture.whenStable();
    expect(fixture.componentInstance.itens()).toEqual([{ id: 1, nome: 'Reserva' }]);
    expect(input.value).toBe('');
    http.verify();
  });

  it('permite cancelar edição sem alterar a conta', async () => {
    const { http, fixture, clicar } = await preparar();
    await clicar('Editar');
    await clicar('Cancelar edição');
    expect(fixture.componentInstance.nome).toBe('');
    expect(fixture.componentInstance.itens()[0].nome).toBe('Carteira');
    http.expectNone('/api/auth/csrf');
    http.verify();
  });

  it('pede confirmação e exclui apenas após a API confirmar', async () => {
    const { http, fixture, clicar } = await preparar();
    await clicar('Excluir');
    http.expectNone('/api/auth/csrf');
    await clicar('Confirmar exclusão');
    http.expectOne('/api/auth/csrf').flush({ token: 'csrf' });
    const request = http.expectOne('/api/contas/1');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('csrf');
    expect(fixture.componentInstance.itens()).toHaveLength(1);
    request.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();
    expect(fixture.componentInstance.itens()).toHaveLength(0);
    http.verify();
  });

  it('mantém a conta e mostra o motivo se há lançamentos', async () => {
    const { http, fixture, clicar } = await preparar();
    await clicar('Excluir');
    await clicar('Confirmar exclusão');
    http.expectOne('/api/auth/csrf').flush({ token: 'csrf' });
    http
      .expectOne('/api/contas/1')
      .flush(
        { mensagem: 'Não é possível excluir uma conta com lançamentos.' },
        { status: 409, statusText: 'Conflict' },
      );
    await fixture.whenStable();
    expect(fixture.componentInstance.itens()).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'lançamentos',
    );
    http.verify();
  });
});
