import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbButton } from '@caribeng/ui/button';
import { CbInput } from '@caribeng/ui/input';
import { CbPassword } from '@caribeng/ui/password';
import { CbChart } from '@caribeng/ui/chart';
import { CbFocusTrapDirective } from '@caribeng/ui/focustrap';

@Component({
  imports: [
    CbButton,
    CbInput,
    CbPassword,
    CbChart,
    CbFocusTrapDirective,
  ],
  template: `
    <div cbFocusTrap>
      <cb-input ariaLabel="Correo electrónico" />
      <cb-password value="Caribe2026!" />
      <cb-button>Enviar</cb-button>
      <cb-chart
        type="bar"
        ariaLabel="Ventas trimestrales"
        [data]="{ labels: ['T1', 'T2'], datasets: [{ label: '2026', data: [40, 80] }] }"
      />
    </div>
  `,
})
class A11yAuditHostComponent {}

describe('Auditoría transversal WCAG 2.2 AA y Contratos ARIA', () => {
  it('garantiza roles semánticos, etiquetas accesibles y regiones live en controles compuestos', () => {
    const fixture = TestBed.createComponent(A11yAuditHostComponent);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;

    // 1. Todo botón interactivo tiene nombre accesible no vacío
    const buttons = Array.from(host.querySelectorAll('button'));
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    for (const btn of buttons) {
      const name = (btn.getAttribute('aria-label') || btn.textContent || '').trim();
      expect(name.length).toBeGreaterThan(0);
    }

    // 2. El medidor de contraseña anuncia cambios mediante role="status" y aria-live="polite"
    const liveMeter = host.querySelector('.cb-password__meter');
    expect(liveMeter?.getAttribute('role')).toBe('status');
    expect(liveMeter?.getAttribute('aria-live')).toBe('polite');

    // 3. El gráfico es un grupo enfocable con nombre; el SVG es decorativo y los
    //    datos llegan al lector de pantalla como tabla con el mismo título.
    const plot = host.querySelector('.cb-chart__plot');
    expect(plot?.getAttribute('role')).toBe('group');
    expect(plot?.getAttribute('tabindex')).toBe('0');
    expect(plot?.getAttribute('aria-label')).toBe('Ventas trimestrales');
    expect(host.querySelector('svg.cb-chart__svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelector('cb-chart table caption')?.textContent).toBe('Ventas trimestrales');
  });
});
