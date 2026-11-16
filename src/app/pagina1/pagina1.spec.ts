import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Pagina1 } from './pagina1';

describe('Pagina1', () => {
  let component: Pagina1;
  let fixture: ComponentFixture<Pagina1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pagina1],
    }).compileComponents();

    fixture = TestBed.createComponent(Pagina1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the category name entered in the field', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    try {
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = 'Alimentação';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();

      fixture.nativeElement.querySelector('button').click();

      expect(alertSpy).toHaveBeenCalledExactlyOnceWith('Alimentação');
    } finally {
      alertSpy.mockRestore();
    }
  });
});
