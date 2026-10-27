import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCardMove } from './card-move.component';

@Component({
  imports: [CbCardMove],
  template: `<cb-card-move [(items)]="items" />`,
})
class HostComponent {
  items = signal<readonly string[]>(['Ahorros', 'Corriente', 'CDT']);
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  document.body.appendChild(el);
  const rows = () => Array.from(el.querySelectorAll<HTMLElement>('.cb-card-move__item'));
  const btn = (row: number, dir: 'up' | 'down') => rows()[row].querySelectorAll<HTMLButtonElement>('.cb-card-move__btn')[dir === 'up' ? 0 : 1];
  const click = async (b: HTMLButtonElement) => {
    b.focus();
    b.click();
    fixture.detectChanges();
    await fixture.whenStable();
  };
  return { fixture, el, rows, btn, click, host: fixture.componentInstance };
}

describe('CbCardMove', () => {
  it('mueve los elementos arriba y abajo actualizando [(items)]', async () => {
    const { el, btn, click, host } = await setup();
    await click(btn(0, 'down'));
    expect(host.items()).toEqual(['Corriente', 'Ahorros', 'CDT']);
    await click(btn(2, 'up'));
    expect(host.items()).toEqual(['Corriente', 'CDT', 'Ahorros']);
    el.remove();
  });

  it('deshabilita subir en el primero y bajar en el último', async () => {
    const { el, btn } = await setup();
    expect(btn(0, 'up').disabled).toBe(true);
    expect(btn(2, 'down').disabled).toBe(true);
    expect(btn(1, 'up').disabled).toBe(false);
    el.remove();
  });

  it('cada botón tiene nombre y se describe con la etiqueta de su elemento', async () => {
    const { el, rows, btn } = await setup();
    const label = rows()[1].querySelector('.cb-card-move__label')!;
    expect(btn(1, 'up').getAttribute('aria-label')).toBeTruthy();
    expect(btn(1, 'up').getAttribute('aria-describedby')).toBe(label.id);
    expect(btn(1, 'down').getAttribute('aria-describedby')).toBe(label.id);
    expect(label.id).not.toBe(rows()[0].querySelector('.cb-card-move__label')!.id);
    el.remove();
  });

  it('el foco sigue al elemento movido y cambia de botón al llegar a un extremo', async () => {
    const { el, btn, click } = await setup();
    await click(btn(2, 'up'));
    expect(document.activeElement).toBe(btn(1, 'up'));
    await click(btn(1, 'up'));
    expect(document.activeElement).toBe(btn(0, 'down'));
    el.remove();
  });
});
