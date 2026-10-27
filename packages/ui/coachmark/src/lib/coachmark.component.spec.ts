import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCoachmark } from './coachmark.component';

@Component({
  imports: [CbCoachmark],
  template: `<cb-coachmark [steps]="steps" [(visible)]="visible" [(index)]="index" (stepChange)="changes.push($event)" />`,
})
class HostComponent {
  steps = ['Consulta tu saldo', 'Transfiere dinero', 'Paga tus facturas'];
  visible = signal(true);
  index = signal(0);
  changes: number[] = [];
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const dialog = () => el.querySelector<HTMLElement>('[role="dialog"]');
  const buttons = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-coachmark__btn'));
  const click = (i: number) => {
    buttons()[i].click();
    fixture.detectChanges();
  };
  return { fixture, el, dialog, buttons, click, host: fixture.componentInstance };
}

describe('CbCoachmark', () => {
  it('muestra el paso actual en un diálogo con nombre y región viva', () => {
    const { el, dialog } = setup();
    expect(dialog()!.getAttribute('aria-label')).toBe('Ayuda guiada');
    const live = el.querySelector('[aria-live="polite"]')!;
    expect(live.textContent).toContain('Paso 1 de 3');
    expect(live.textContent).toContain('Consulta tu saldo');
  });

  it('avanza y retrocede emitiendo stepChange; Anterior está deshabilitado en el primero', () => {
    const { el, buttons, click, host } = setup();
    expect(buttons()[1].disabled).toBe(true);
    click(2);
    click(2);
    expect(host.index()).toBe(2);
    expect(el.querySelector('.cb-coachmark__title')!.textContent).toBe('Paga tus facturas');
    expect(buttons()[2].textContent!.trim()).toBe('Finalizar');
    click(1);
    expect(host.index()).toBe(1);
    expect(host.changes).toEqual([1, 2, 1]);
  });

  it('Finalizar en el último paso y Omitir cierran la guía', () => {
    const { fixture, dialog, click, host } = setup();
    host.index.set(2);
    fixture.detectChanges();
    click(2);
    expect(host.visible()).toBe(false);
    expect(dialog()).toBeNull();

    host.visible.set(true);
    fixture.detectChanges();
    click(0);
    expect(host.visible()).toBe(false);
  });

  it('Escape cierra la guía', () => {
    const { fixture, dialog, host } = setup();
    dialog()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(host.visible()).toBe(false);
  });

  it('sin pasos no muestra nada', () => {
    const fixture = TestBed.createComponent(CbCoachmark);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]')).toBeNull();
  });
});
