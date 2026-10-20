import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CB_DYNAMIC_DIALOG_DATA, CbDialogService, CbDynamicDialogRef } from './dialog.service';
import { CbDynamicDialog } from './dynamicdialog.component';

@Component({
  template: `
    <p class="saludo">Hola, {{ data.nombre }}</p>
    <button type="button" class="guardar" (click)="ref.close('guardado')">Guardar</button>
  `,
})
class EditarCliente {
  readonly data = inject<{ nombre: string }>(CB_DYNAMIC_DIALOG_DATA);
  readonly ref = inject(CbDynamicDialogRef<string>);
}

const dialog = () => document.querySelector<HTMLElement>('.cb-dynamic-dialog');

describe('CbDialogService', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')));

  it('abre un componente con datos y devuelve su resultado', async () => {
    const service = TestBed.inject(CbDialogService);
    const ref = service.open<EditarCliente, { nombre: string }, string>(EditarCliente, {
      header: 'Editar cliente',
      data: { nombre: 'Ana' },
    });
    const result = vi.fn();
    ref.onClose.subscribe(result);
    await Promise.resolve();
    TestBed.tick();

    expect(dialog()!.querySelector('.saludo')!.textContent).toBe('Hola, Ana');
    const title = document.getElementById(dialog()!.getAttribute('aria-labelledby')!);
    expect(title!.textContent).toBe('Editar cliente');
    expect(dialog()!.getAttribute('aria-modal')).toBe('true');

    dialog()!.querySelector<HTMLElement>('.guardar')!.click();
    expect(result).toHaveBeenCalledWith('guardado');
    expect(dialog()).toBeNull();
  });

  it('se cierra con Escape y con el botón de cerrar', async () => {
    const service = TestBed.inject(CbDialogService);
    const closed = vi.fn();
    service.open(EditarCliente, { data: { nombre: 'Ana' } }).onClose.subscribe(closed);
    TestBed.tick();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(closed).toHaveBeenCalledWith(undefined);
    expect(dialog()).toBeNull();

    service.open(EditarCliente, { data: { nombre: 'Ana' } });
    TestBed.tick();
    const close = dialog()!.querySelector<HTMLElement>('.cb-dynamic-dialog__close')!;
    expect(close.getAttribute('aria-label')).toBe('Cerrar');
    close.click();
    expect(dialog()).toBeNull();
  });

  it('sin header usa un nombre accesible', () => {
    TestBed.inject(CbDialogService).open(EditarCliente, { data: { nombre: 'Ana' }, ariaLabel: 'Cliente' });
    TestBed.tick();
    expect(dialog()!.getAttribute('aria-label')).toBe('Cliente');
  });
});

describe('CbDynamicDialog (declarativo)', () => {
  it('muestra el texto dentro de un cb-dialog y emite closed al cerrarse', () => {
    TestBed.configureTestingModule({ imports: [CbDynamicDialog] });
    const fixture = TestBed.createComponent(CbDynamicDialog);
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    fixture.componentRef.setInput('header', 'Detalle');
    fixture.componentRef.setInput('content', 'Solicitud enviada');
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();
    const panel = document.querySelector<HTMLElement>('.cb-dialog')!;
    expect(panel.textContent).toContain('Solicitud enviada');
    expect(panel.textContent).toContain('Detalle');
    fixture.componentInstance.visible.set(false);
    fixture.detectChanges();
    expect(closed).toHaveBeenCalledOnce();
  });
});
