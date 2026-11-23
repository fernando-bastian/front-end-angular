import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { routes } from './app.routes';
import { Api } from './core/api';

describe('navegação e sessão', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('mantém a área de conteúdo da aplicação', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });

  it.each(['/', '/endereco-inexistente'])(
    'encaminha acesso anônimo em %s para o login',
    async (url) => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const navigation = TestBed.inject(Router).navigateByUrl(url);
      const request = await vi.waitFor(() => http.expectOne('/api/auth/me'));
      request.flush({}, { status: 401, statusText: 'Unauthorized' });
      await navigation;
      await fixture.whenStable();
      expect(TestBed.inject(Router).url).toContain('/login');
      expect(fixture.nativeElement.querySelector('input[type="password"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('nav')).toBeNull();
    },
  );

  it('abre a lista real de contas pelo menu após autenticar', async () => {
    const api = TestBed.inject(Api);
    api.login('ana@exemplo.com', 'senha').subscribe();
    http.expectOne('/api/auth/csrf').flush({ token: 'csrf' });
    http.expectOne('/api/auth/login').flush({ id: 1, nome: 'Ana', email: 'ana@exemplo.com' });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('a[href="/contas"]').click();
    const request = await vi.waitFor(() => http.expectOne('/api/contas'));
    request.flush([{ id: 1, nome: 'Carteira' }]);
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/contas');
    expect(fixture.nativeElement.textContent).toContain('Carteira');
  });
});
