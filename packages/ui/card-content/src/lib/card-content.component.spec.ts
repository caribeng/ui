import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCardContent } from './card-content.component';

describe('CbCardContent', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbCardContent] }).compileComponents();
    const fixture = TestBed.createComponent(CbCardContent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra subtítulo opcional y la acción emite action', () => {
    const fixture = TestBed.createComponent(CbCardContent);
    fixture.componentRef.setInput('title', 'Cuenta de ahorros');
    fixture.componentRef.setInput('actionLabel', 'Ver movimientos');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cb-card-content__subtitle')).toBeNull();
    const button = el.querySelector<HTMLButtonElement>('.cb-card-content__action')!;
    expect(button.textContent!.trim()).toBe('Ver movimientos');
    let actions = 0;
    fixture.componentInstance.action.subscribe(() => actions++);
    button.click();
    expect(actions).toBe(1);

    fixture.componentRef.setInput('subtitle', '**** 1234');
    fixture.detectChanges();
    expect(el.querySelector('.cb-card-content__subtitle')!.textContent).toBe('**** 1234');
  });
});
