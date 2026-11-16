import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Conta } from './conta';

describe('Conta', () => {
  let component: Conta;
  let fixture: ComponentFixture<Conta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Conta],
    }).compileComponents();

    fixture = TestBed.createComponent(Conta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
