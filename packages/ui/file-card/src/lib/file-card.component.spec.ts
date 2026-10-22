import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import type { CbMenuItem } from '@caribeng/ui/menu';
import { CbFileCard } from './file-card.component';

@Component({
  imports: [CbFileCard],
  template: `
    <cb-file-card
      icon="search"
      title="Imágenes"
      value="245 archivos"
      [actions]="actions"
      clickable
      (actionSelect)="chosen = $event.label"
      (open)="opened = opened + 1"
    />
  `,
})
class HostComponent {
  actions: CbMenuItem[] = [{ label: 'Ver', icon: 'search' }, { label: 'Liberar espacio', icon: 'x' }];
  chosen = '';
  opened = 0;
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  document.body.appendChild(el);
  const trigger = () => el.querySelector<HTMLButtonElement>('.cb-file-card__menu-button')!;
  const openButton = () => el.querySelector<HTMLButtonElement>('.cb-file-card__open')!;
  const menuItems = () => Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container [role="menuitem"]'));
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  return { el, trigger, openButton, menuItems, settle, host: fixture.componentInstance };
}

describe('CbFileCard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbFileCard] });
  });

  it('muestra título, subtítulo y valores', () => {
    const fixture = TestBed.createComponent(CbFileCard);
    fixture.componentRef.setInput('icon', 'image');
    fixture.componentRef.setInput('title', 'Imágenes');
    fixture.componentRef.setInput('subtitle', '17% usado');
    fixture.componentRef.setInput('value', '245 archivos');
    fixture.componentRef.setInput('valueSub', '26.4 GB');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.cb-file-card__title')!.textContent).toContain('Imágenes');
    expect(el.querySelector('.cb-file-card__subtitle')!.textContent).toContain('17% usado');
    expect(el.querySelector('.cb-file-card__value')!.textContent).toContain('245 archivos');
    expect(el.querySelector('.cb-file-card__value-sub')!.textContent).toContain('26.4 GB');
  });

  it('tiñe el fondo del icono con cualquier color CSS y oculta los textos opcionales vacíos', () => {
    const fixture = TestBed.createComponent(CbFileCard);
    fixture.componentRef.setInput('title', 'Vídeos');
    fixture.componentRef.setInput('color', 'var(--cb-color-primary-500)');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const icon = el.querySelector<HTMLElement>('.cb-file-card__icon')!;
    expect(icon.getAttribute('style')).toContain('color-mix(in srgb, var(--cb-color-primary-500) 12%, transparent)');
    expect(el.querySelector('.cb-file-card__subtitle')).toBeNull();
    expect(el.querySelector('.cb-file-card__value-sub')).toBeNull();
    expect(el.querySelector('cb-icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('sin actions ni clickable no muestra el botón ⋮ ni el botón de abrir', () => {
    const fixture = TestBed.createComponent(CbFileCard);
    fixture.componentRef.setInput('title', 'Imágenes');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.cb-file-card__menu-button')).toBeNull();
    expect(el.querySelector('.cb-file-card__open')).toBeNull();
  });

  it('⋮ abre el menú con nombre accesible; elegir una acción emite actionSelect sin abrir la tarjeta', async () => {
    const { trigger, menuItems, settle, host, el } = await setup();
    expect(trigger().getAttribute('aria-label')).toBe('Más acciones: Imágenes');
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
    trigger().click();
    await settle();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    menuItems()[1].click();
    await settle();
    expect(host.chosen).toBe('Liberar espacio');
    expect(host.opened).toBe(0);
    expect(document.activeElement).toBe(trigger());
    el.remove();
  });

  it('clickable: el título es un botón que emite open', async () => {
    const { openButton, host, el } = await setup();
    expect(el.querySelector('cb-file-card')!.classList).toContain('cb-file-card--clickable');
    expect(openButton().textContent!.trim()).toBe('Imágenes');
    openButton().click();
    expect(host.opened).toBe(1);
    el.remove();
  });
});
