import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbResult, type CbResultStatus } from './result.component';

@Component({
  imports: [CbResult],
  template: `
    <cb-result [status]="status()" title="Transferencia enviada" subtitle="Comprobante #48213">
      <button type="button" class="action">Volver al inicio</button>
    </cb-result>
  `,
})
class HostComponent {
  status = signal<CbResultStatus>('success');
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, el, host: el.querySelector<HTMLElement>('cb-result')! };
}

describe('CbResult', () => {
  it('muestra un icono decorativo, el título como encabezado, el subtítulo y las acciones', () => {
    const { el, host } = setup();
    expect(host.classList).toContain('cb-result--success');
    expect(el.querySelector('.cb-result__icon')!.getAttribute('aria-hidden')).toBe('true');
    const heading = el.querySelector('[role="heading"]')!;
    expect(heading.textContent).toBe('Transferencia enviada');
    expect(heading.getAttribute('aria-level')).toBe('2');
    expect(el.querySelector('.cb-result__subtitle')!.textContent).toBe('Comprobante #48213');
    expect(el.querySelector('.cb-result__content .action')).not.toBeNull();
  });

  it('cada estado usa su clase de color', () => {
    const { fixture, host } = setup();
    for (const status of ['error', 'warning', 'info'] as const) {
      fixture.componentInstance.status.set(status);
      fixture.detectChanges();
      expect(host.classList).toContain(`cb-result--${status}`);
    }
  });

  it('los errores HTTP muestran el código grande (decorativo) en lugar del icono', () => {
    const { fixture, el, host } = setup();
    fixture.componentInstance.status.set('404');
    fixture.detectChanges();
    const code = el.querySelector('.cb-result__code')!;
    expect(code.textContent).toBe('404');
    expect(code.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('.cb-result__icon')).toBeNull();
    expect(host.classList).toContain('cb-result--http');
  });
});
