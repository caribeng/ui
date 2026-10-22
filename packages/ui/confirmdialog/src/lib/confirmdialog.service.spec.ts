import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbConfirmationService } from '@caribeng/ui';
import { describe, expect, it, vi } from 'vitest';
import { CbConfirmDialog } from './confirmdialog.component';

@Component({
  imports: [CbConfirmDialog],
  template: `
    <cb-confirm-dialog service />
    <cb-confirm-dialog service key="otro" header="Otro" />
    <!-- Declarativo: no responde al servicio. -->
    <cb-confirm-dialog header="Declarativo" />
  `,
})
class HostComponent {}

function setup() {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const fixture = TestBed.createComponent(HostComponent);
  document.body.appendChild(fixture.nativeElement);
  fixture.detectChanges();
  const service = TestBed.inject(CbConfirmationService);
  const dialogs = () => Array.from(document.querySelectorAll<HTMLElement>('[role="alertdialog"]'));
  const buttons = () => Array.from(dialogs()[0].querySelectorAll<HTMLElement>('button'));
  return { fixture, service, dialogs, buttons };
}

describe('CbConfirmDialog con CbConfirmationService', () => {
  it('muestra los textos de la confirmación y ejecuta accept al aceptar', () => {
    const { fixture, service, dialogs, buttons } = setup();
    const accept = vi.fn();
    const reject = vi.fn();
    service.confirm({ header: 'Eliminar', message: '¿Eliminar el pedido?', acceptLabel: 'Sí', rejectLabel: 'No', accept, reject });
    fixture.detectChanges();

    expect(dialogs()).toHaveLength(1);
    expect(dialogs()[0].textContent).toContain('Eliminar');
    expect(dialogs()[0].textContent).toContain('¿Eliminar el pedido?');
    expect(buttons().map((b) => b.textContent?.trim())).toEqual(['No', 'Sí']);

    buttons()[1].click();
    fixture.detectChanges();
    expect(accept).toHaveBeenCalledOnce();
    expect(reject).not.toHaveBeenCalled();
    expect(dialogs()).toHaveLength(0);
    expect(service.request()).toBeNull();
  });

  it('ejecuta reject al cancelar con Escape', () => {
    const { fixture, service, dialogs } = setup();
    const reject = vi.fn();
    service.confirm({ message: '¿Seguro?', reject });
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(reject).toHaveBeenCalledOnce();
    expect(dialogs()).toHaveLength(0);
  });

  it('aplica la severidad del botón de aceptar', () => {
    const { fixture, service, buttons } = setup();
    service.confirm({ message: '¿Eliminar?', acceptSeverity: 'danger' });
    fixture.detectChanges();
    expect(buttons()[1].className).toContain('cb-button--danger');
  });

  it('un diálogo declarativo (sin service) no se abre con el servicio', () => {
    const { fixture, service, dialogs } = setup();
    service.confirm({ message: '¿Seguro?' });
    fixture.detectChanges();
    expect(dialogs()).toHaveLength(1);
    expect(dialogs()[0].textContent).not.toContain('Declarativo');
  });

  it('la atiende solo el diálogo con el mismo key', () => {
    const { fixture, service, dialogs } = setup();
    service.confirm({ key: 'otro', message: 'Con key' });
    fixture.detectChanges();
    expect(dialogs()).toHaveLength(1);
    expect(dialogs()[0].textContent).toContain('Otro');
    expect(dialogs()[0].textContent).toContain('Con key');
  });

  it('close() del servicio la cierra sin llamar a accept ni reject', () => {
    const { fixture, service, dialogs } = setup();
    const accept = vi.fn();
    const reject = vi.fn();
    service.confirm({ message: '¿Seguro?', accept, reject });
    fixture.detectChanges();
    service.close();
    fixture.detectChanges();
    expect(dialogs()).toHaveLength(0);
    expect(accept).not.toHaveBeenCalled();
    expect(reject).not.toHaveBeenCalled();
  });

  it('accept puede pedir otra confirmación encadenada', () => {
    const { fixture, service, dialogs, buttons } = setup();
    service.confirm({ message: 'Primera', accept: () => service.confirm({ message: 'Segunda' }) });
    fixture.detectChanges();
    buttons()[1].click();
    fixture.detectChanges();
    expect(dialogs()).toHaveLength(1);
    expect(dialogs()[0].textContent).toContain('Segunda');
  });
});
