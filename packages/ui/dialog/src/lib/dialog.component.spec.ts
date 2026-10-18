import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbDialog } from './dialog.component';

@Component({
  imports: [CbDialog],
  template: `
    <cb-dialog
      [visible]="open()"
      (visibleChange)="open.set($event)"
      (onHide)="hidden = true"
      header="Confirmar"
    >
      <p class="cuerpo">¿Deseas continuar?</p>
    </cb-dialog>
  `,
})
class HostComponent {
  open = signal(false);
  hidden = false;
}

describe('CbDialog', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const dialog = (): HTMLElement | null =>
      document.querySelector('.cb-dialog[role="dialog"]');
    // El overlay se crea dentro de un effect; TestBed.tick lo vacía.
    const openDialog = () => {
      fixture.componentInstance.open.set(true);
      fixture.detectChanges();
      TestBed.tick();
    };
    return { fixture, dialog, openDialog };
  }

  it('no renderiza el diálogo mientras visible es false', () => {
    const { dialog } = setup();
    expect(dialog()).toBeNull();
  });

  it('abre un diálogo modal con encabezado y contenido proyectado', () => {
    const { dialog, openDialog } = setup();
    openDialog();
    expect(dialog()).toBeTruthy();
    expect(dialog()!.getAttribute('aria-modal')).toBe('true');
    expect(document.querySelector('.cb-dialog__title')?.textContent?.trim()).toBe(
      'Confirmar',
    );
    expect(document.querySelector('.cb-dialog__body .cuerpo')).toBeTruthy();
  });

  it('el botón cerrar oculta el diálogo y emite onHide', () => {
    const { fixture, dialog, openDialog } = setup();
    openDialog();
    const closeBtn = document.querySelector<HTMLButtonElement>('.cb-dialog__close')!;
    closeBtn.click();
    fixture.detectChanges();
    TestBed.tick();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.componentInstance.hidden).toBe(true);
    expect(dialog()).toBeNull();
  });
});
