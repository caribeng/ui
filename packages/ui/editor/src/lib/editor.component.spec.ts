import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbEditor } from './editor.component';

@Component({
  imports: [CbEditor],
  template: `<cb-editor [(value)]="html" [disabled]="disabled()" [ariaLabel]="label()" />`,
})
class HostComponent {
  html = signal('<p>Hola</p>');
  disabled = signal(false);
  label = signal<string | undefined>(undefined);
}

@Component({
  imports: [CbEditor, ReactiveFormsModule],
  template: `<cb-editor [formControl]="ctrl" />`,
})
class FormHostComponent {
  ctrl = new FormControl('<p>Inicial</p>', Validators.required);
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  document.body.appendChild(el);
  const surface = () => el.querySelector<HTMLElement>('.cb-editor__surface')!;
  const tools = () => Array.from(el.querySelectorAll<HTMLElement>('.cb-editor__toolbar select, .cb-editor__toolbar button'));
  const key = (k: string) => {
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };
  return { fixture, el, surface, tools, key };
}

describe('CbEditor', () => {
  it('sincroniza el valor inicial y actualiza el modelo al editar', async () => {
    const { fixture, el, surface } = await setup();
    expect(surface().innerHTML).toBe('<p>Hola</p>');

    surface().innerHTML = '<p>Actualizado</p>';
    surface().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.html()).toBe('<p>Actualizado</p>');

    fixture.componentInstance.html.set('<p>Desde fuera</p>');
    fixture.detectChanges();
    expect(surface().innerHTML).toBe('<p>Desde fuera</p>');
    el.remove();
  });

  it('el área editable es un textbox multilínea con nombre accesible', async () => {
    const { fixture, el, surface } = await setup();
    expect(surface().getAttribute('role')).toBe('textbox');
    expect(surface().getAttribute('aria-multiline')).toBe('true');
    expect(surface().getAttribute('aria-label')).toBe('Editor de texto');
    fixture.componentInstance.label.set('Descripción del producto');
    fixture.detectChanges();
    expect(surface().getAttribute('aria-label')).toBe('Descripción del producto');
    el.remove();
  });

  it('la barra es un toolbar con nombre y todas sus herramientas están etiquetadas', async () => {
    const { el, tools } = await setup();
    const bar = el.querySelector('.cb-editor__toolbar')!;
    expect(bar.getAttribute('role')).toBe('toolbar');
    expect(bar.getAttribute('aria-label')).toBeTruthy();
    expect(tools().every((t) => t.getAttribute('aria-label'))).toBe(true);
    el.remove();
  });

  it('la barra tiene un solo tabindex activo y se recorre con flechas, Inicio y Fin', async () => {
    const { el, tools, key } = await setup();
    expect(tools().filter((t) => t.tabIndex === 0)).toEqual([tools()[0]]);

    tools()[0].focus();
    key('ArrowRight');
    expect(document.activeElement).toBe(tools()[1]);
    expect(tools()[1].tabIndex).toBe(0);
    expect(tools()[0].tabIndex).toBe(-1);

    key('ArrowLeft');
    key('ArrowLeft');
    expect(document.activeElement).toBe(tools().at(-1));
    key('Home');
    expect(document.activeElement).toBe(tools()[0]);
    key('End');
    expect(document.activeElement).toBe(tools().at(-1));
    el.remove();
  });

  it('deshabilitado no es editable y bloquea la barra', async () => {
    const { fixture, el, surface, tools } = await setup();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(surface().getAttribute('contenteditable')).toBe('false');
    expect(surface().getAttribute('aria-disabled')).toBe('true');
    expect(tools().every((t) => (t as HTMLButtonElement).disabled)).toBe(true);
    expect(el.querySelector('cb-editor')!.classList).toContain('cb-is-disabled');
    el.remove();
  });

  it('se integra con Reactive Forms: valor inicial, touched, inválido y disable()', async () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const surface = el.querySelector<HTMLElement>('.cb-editor__surface')!;
    const ctrl = fixture.componentInstance.ctrl;
    expect(surface.innerHTML).toBe('<p>Inicial</p>');

    surface.innerHTML = '';
    surface.dispatchEvent(new Event('input'));
    surface.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(ctrl.value).toBe('');
    expect(ctrl.touched).toBe(true);
    expect(surface.getAttribute('aria-invalid')).toBe('true');
    expect(surface.getAttribute('aria-required')).toBe('true');

    ctrl.disable();
    fixture.detectChanges();
    expect(surface.getAttribute('contenteditable')).toBe('false');
  });
});
