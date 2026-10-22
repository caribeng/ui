import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import type { CbMenuItem } from '@caribeng/ui/menu';
import { CbFolderCard } from './folder-card.component';

@Component({
  imports: [CbFolderCard],
  template: `
    <cb-folder-card
      name="Imágenes"
      [files]="345"
      [actions]="actions"
      clickable
      (actionSelect)="chosen = $event.label"
      (open)="opened = opened + 1"
    />
  `,
})
class HostComponent {
  actions: CbMenuItem[] = [
    { label: 'Abrir', icon: 'chevron-right' },
    { label: 'Renombrar', icon: 'settings' },
    { label: 'Eliminar', icon: 'x', disabled: true },
  ];
  chosen = '';
  opened = 0;
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  document.body.appendChild(el);
  const trigger = () => el.querySelector<HTMLButtonElement>('.cb-folder-card__menu-button')!;
  const openButton = () => el.querySelector<HTMLButtonElement>('.cb-folder-card__open')!;
  const menuItems = () => Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container [role="menuitem"]'));
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  return { fixture, el, trigger, openButton, menuItems, settle, host: fixture.componentInstance };
}

describe('CbFolderCard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbFolderCard] });
  });

  it('muestra nombre, archivos y tamaño', () => {
    const fixture = TestBed.createComponent(CbFolderCard);
    fixture.componentRef.setInput('name', 'Imágenes');
    fixture.componentRef.setInput('files', 345);
    fixture.componentRef.setInput('size', '26.4 GB');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.cb-folder-card__name')!.textContent).toContain('Imágenes');
    expect(el.querySelector('.cb-folder-card__meta')!.textContent).toContain('345');
    expect(el.querySelector('.cb-folder-card__meta')!.textContent).toContain('26.4 GB');
  });

  it('no muestra la etiqueta de archivos sin número y usa filesLabel si se indica', () => {
    const fixture = TestBed.createComponent(CbFolderCard);
    fixture.componentRef.setInput('name', 'Vacía');
    fixture.detectChanges();
    const meta = () => (fixture.nativeElement as HTMLElement).querySelector('.cb-folder-card__meta')!.textContent!.trim();
    expect(meta()).toBe('');

    fixture.componentRef.setInput('files', 3);
    fixture.componentRef.setInput('filesLabel', 'documentos');
    fixture.detectChanges();
    expect(meta()).toBe('3 documentos');
  });

  it('sin actions ni clickable no muestra el botón ⋮ ni el botón de abrir', () => {
    const fixture = TestBed.createComponent(CbFolderCard);
    fixture.componentRef.setInput('name', 'Imágenes');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.cb-folder-card__menu-button')).toBeNull();
    expect(el.querySelector('.cb-folder-card__open')).toBeNull();
  });

  it('el botón ⋮ tiene nombre con la carpeta, aria-haspopup y aria-expanded', async () => {
    const { trigger, el } = await setup();
    expect(trigger().getAttribute('aria-label')).toBe('Más acciones: Imágenes');
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    el.remove();
  });

  it('actionsAriaLabel reemplaza el nombre por defecto', async () => {
    const fixture = TestBed.createComponent(CbFolderCard);
    fixture.componentRef.setInput('actions', [{ label: 'Abrir' }]);
    fixture.componentRef.setInput('actionsAriaLabel', 'Opciones de carpeta');
    fixture.detectChanges();
    const trigger = (fixture.nativeElement as HTMLElement).querySelector('.cb-folder-card__menu-button')!;
    expect(trigger.getAttribute('aria-label')).toBe('Opciones de carpeta');
  });

  it('⋮ abre el menú; elegir una acción emite actionSelect, cierra y devuelve el foco', async () => {
    const { trigger, menuItems, settle, host, el } = await setup();
    trigger().click();
    await settle();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(menuItems().map((i) => i.textContent!.trim())).toEqual(['Abrir', 'Renombrar', 'Eliminar']);
    menuItems()[1].click();
    await settle();
    expect(host.chosen).toBe('Renombrar');
    expect(host.opened).toBe(0);
    expect(menuItems()).toHaveLength(0);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger());
    el.remove();
  });

  it('una acción deshabilitada no emite actionSelect', async () => {
    const { trigger, menuItems, settle, host, el } = await setup();
    trigger().click();
    await settle();
    menuItems()[2].click();
    await settle();
    expect(host.chosen).toBe('');
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    await settle();
    el.remove();
  });

  it('Flecha abajo sobre ⋮ abre el menú', async () => {
    const { trigger, menuItems, settle, el } = await setup();
    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    await settle();
    expect(menuItems()).toHaveLength(3);
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    await settle();
    el.remove();
  });

  it('clickable: el nombre es un botón que emite open sin abrir el menú', async () => {
    const { openButton, menuItems, host, el } = await setup();
    expect(el.querySelector('cb-folder-card')!.classList).toContain('cb-folder-card--clickable');
    expect(openButton().tagName).toBe('BUTTON');
    expect(openButton().textContent!.trim()).toBe('Imágenes');
    openButton().click();
    expect(host.opened).toBe(1);
    expect(menuItems()).toHaveLength(0);
    el.remove();
  });

  it('sigue proyectando un trigger propio por [cb-folder-actions]', () => {
    @Component({
      imports: [CbFolderCard],
      template: `<cb-folder-card name="X"><button cb-folder-actions id="custom">⋮</button></cb-folder-card>`,
    })
    class ProjectedHost {}
    const fixture = TestBed.createComponent(ProjectedHost);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.cb-folder-card__actions #custom')).not.toBeNull();
    expect(el.querySelector('.cb-folder-card__menu-button')).toBeNull();
  });
});
