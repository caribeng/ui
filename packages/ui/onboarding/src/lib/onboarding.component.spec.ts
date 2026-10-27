import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbOnboarding } from './onboarding.component';

@Component({
  imports: [CbOnboarding],
  template: `
    <cb-onboarding [steps]="steps" [(visible)]="visible" [(index)]="index" (currentStepIndex)="changes.push($event)">
      <p class="body">Bienvenido a tu banca.</p>
    </cb-onboarding>
  `,
})
class HostComponent {
  steps = ['Bienvenido', 'Seguridad', 'Listo'];
  visible = signal(true);
  index = signal(0);
  changes: number[] = [];
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const dialog = () => el.querySelector<HTMLElement>('[role="dialog"]');
  const buttons = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-onboarding__btn'));
  const click = (i: number) => {
    buttons()[i].click();
    fixture.detectChanges();
  };
  return { fixture, el, dialog, buttons, click, host: fixture.componentInstance };
}

describe('CbOnboarding', () => {
  it('muestra el paso actual, el contenido proyectado y los indicadores decorativos', () => {
    const { el, dialog } = setup();
    expect(dialog()!.getAttribute('aria-label')).toBeTruthy();
    expect(el.querySelector('.cb-onboarding__title')!.textContent).toBe('Bienvenido');
    expect(el.querySelector('.body')!.textContent).toBe('Bienvenido a tu banca.');
    expect(el.querySelector('.cb-onboarding__dots')!.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelectorAll('.cb-onboarding__dot.cb-is-active')).toHaveLength(1);
  });

  it('anuncia "Paso N de M" en la región viva y oculta al lector el contador visual', () => {
    const { el, click } = setup();
    const live = el.querySelector('[aria-live="polite"]')!;
    expect(el.querySelector('.cb-onboarding__counter')!.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('.cb-onboarding__counter')!.textContent!.trim()).toBe('1 / 3');
    expect(el.querySelector('.cb-onboarding__sr')!.textContent).toBe('Paso 1 de 3');
    click(2);
    expect(live.textContent).toContain('Paso 2 de 3');
    expect(live.textContent).toContain('Seguridad');
  });

  it('avanza y retrocede emitiendo currentStepIndex; el último paso cierra', () => {
    const { buttons, click, host } = setup();
    expect(buttons()[1].disabled).toBe(true);
    click(2);
    click(2);
    expect(buttons()[2].textContent!.trim()).toBe('Comenzar');
    click(1);
    expect(host.changes).toEqual([1, 2, 1]);
    click(2);
    click(2);
    expect(host.visible()).toBe(false);
  });

  it('Omitir y Escape cierran el recorrido', () => {
    const { fixture, dialog, click, host } = setup();
    click(0);
    expect(host.visible()).toBe(false);
    host.visible.set(true);
    fixture.detectChanges();
    dialog()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(host.visible()).toBe(false);
  });
});
