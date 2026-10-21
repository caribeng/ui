import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbInlineAlert } from './inline-alert.component';

@Component({
  imports: [CbInlineAlert],
  template: `
    <cb-inline-alert [title]="title()" [status]="status()" [closable]="closable()" [(visible)]="visible" (closed)="closed = closed + 1">
      Tu solicitud está en revisión.
    </cb-inline-alert>
  `,
})
class HostComponent {
  title = signal('Pendiente');
  status = signal<'success' | 'warning' | 'error' | 'info'>('warning');
  closable = signal(true);
  visible = signal(true);
  closed = 0;
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  return { fixture, el, box: () => el.querySelector<HTMLElement>('[role="status"]'), host: fixture.componentInstance };
}

describe('CbInlineAlert', () => {
  it('es un role="status" con título, contenido, estado e icono decorativo', () => {
    const { box } = setup();
    expect(box()!.classList).toContain('cb-inline-alert--warning');
    expect(box()!.querySelector('.cb-inline-alert__title')!.textContent).toBe('Pendiente');
    expect(box()!.querySelector('.cb-inline-alert__body')!.textContent!.trim()).toBe('Tu solicitud está en revisión.');
    expect(box()!.querySelector('.cb-inline-alert__icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('sin título no renderiza el encabezado', () => {
    const { fixture, box } = setup();
    fixture.componentInstance.title.set('');
    fixture.detectChanges();
    expect(box()!.querySelector('.cb-inline-alert__title')).toBeNull();
  });

  it('cerrar la oculta y emite closed; sin closable no hay botón', () => {
    const { fixture, el, box, host } = setup();
    const close = el.querySelector<HTMLButtonElement>('.cb-inline-alert__close')!;
    expect(close.getAttribute('aria-label')).toBe('Cerrar');
    close.click();
    fixture.detectChanges();
    expect(box()).toBeNull();
    expect(host.closed).toBe(1);

    host.visible.set(true);
    host.closable.set(false);
    fixture.detectChanges();
    expect(el.querySelector('.cb-inline-alert__close')).toBeNull();
  });
});
