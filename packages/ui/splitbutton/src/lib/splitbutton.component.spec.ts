import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { CbMenuItem } from '@caribeng/ui/menu';
import { CbSplitButton } from './splitbutton.component';

@Component({
  imports: [CbSplitButton],
  template: `
    <cb-split-button
      label="Guardar"
      icon="check"
      [items]="items"
      [disabled]="disabled()"
      (primaryClick)="primary = primary + 1"
      (itemSelect)="chosen = $event.label"
    />
  `,
})
class HostComponent {
  items: CbMenuItem[] = [{ label: 'Guardar como borrador' }, { label: 'Guardar y enviar' }];
  disabled = signal(false);
  primary = 0;
  chosen = '';
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  document.body.appendChild(el);
  const main = () => el.querySelector<HTMLButtonElement>('.cb-split-button__main button')!;
  const toggle = () => el.querySelector<HTMLButtonElement>('.cb-split-button__toggle button')!;
  const menuItems = () => Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container [role="menuitem"]'));
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  return { fixture, el, main, toggle, menuItems, settle, host: fixture.componentInstance };
}

describe('CbSplitButton', () => {
  it('es un grupo nombrado con la acción principal y la flecha con nombre y aria-haspopup', async () => {
    const { el, main, toggle } = await setup();
    const group = el.querySelector('cb-split-button')!;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Guardar');
    expect(main().textContent).toContain('Guardar');
    expect(toggle().getAttribute('aria-label')).toBe('Más acciones');
    expect(toggle().getAttribute('aria-haspopup')).toBe('menu');
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    el.remove();
  });

  it('la acción principal emite primaryClick sin abrir el menú', async () => {
    const { main, menuItems, host, el } = await setup();
    main().click();
    expect(host.primary).toBe(1);
    expect(menuItems()).toHaveLength(0);
    el.remove();
  });

  it('la flecha abre el menú, refleja aria-expanded y elegir una opción emite itemSelect y cierra', async () => {
    const { toggle, menuItems, settle, host, el } = await setup();
    toggle().click();
    await settle();
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(menuItems().map((i) => i.textContent!.trim())).toEqual(['Guardar como borrador', 'Guardar y enviar']);
    menuItems()[1].click();
    await settle();
    expect(host.chosen).toBe('Guardar y enviar');
    expect(menuItems()).toHaveLength(0);
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle());
    el.remove();
  });

  it('Flecha abajo sobre la flecha abre el menú', async () => {
    const { toggle, menuItems, settle, el } = await setup();
    toggle().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    await settle();
    expect(menuItems()).toHaveLength(2);
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    await settle();
    el.remove();
  });

  it('deshabilitado desactiva los dos botones', async () => {
    const { fixture, main, toggle, host, el } = await setup();
    host.disabled.set(true);
    fixture.detectChanges();
    expect(main().disabled).toBe(true);
    expect(toggle().disabled).toBe(true);
    el.remove();
  });
});
