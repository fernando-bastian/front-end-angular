import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it.each(['/', '/endereco-inexistente'])('should open categories from %s', async (url) => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    await router.navigateByUrl(url);
    await fixture.whenStable();

    expect(router.url).toBe('/pagina1');
    expect(fixture.nativeElement.querySelector('input')?.value).toBe('Categoria 1');
  });

  it('should navigate to accounts using the menu', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/pagina1');
    await fixture.whenStable();

    const link = fixture.nativeElement.querySelector('nav a[href="/conta"]') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    link.click();
    await fixture.whenStable();

    expect(router.url).toBe('/conta');
    expect(fixture.nativeElement.querySelector('app-conta')).not.toBeNull();
  });
});
