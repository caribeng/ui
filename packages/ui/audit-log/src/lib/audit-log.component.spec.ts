import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { CbAuditLog, type CbAuditEntry } from './audit-log.component';

const ENTRIES: CbAuditEntry[] = [
  { id: 1, date: '2026-10-22T09:15:00', user: 'Ana Ruiz', action: 'create', entity: 'Comprobante CE-000124' },
  {
    id: 2,
    date: '2026-10-23T11:40:00',
    user: 'Leo Mora',
    action: 'update',
    entity: 'Comprobante CE-000124',
    changes: [
      { field: 'debit', label: 'Débito línea 1', before: 800000, after: 845000 },
      { field: 'description', label: 'Descripción', before: '', after: 'Factura octubre' },
    ],
  },
  { id: 3, date: '2026-10-23T16:05:00', user: 'Ana Ruiz', action: 'approve', entity: 'Comprobante CE-000124', note: 'Revisado con soporte.' },
];

@Component({
  imports: [CbAuditLog],
  template: `<cb-audit-log [entries]="entries" [format]="format" [actionLabels]="{ approve: 'aprobó' }" />`,
})
class HostComponent {
  entries = ENTRIES;
  format = (field: string, v: unknown) => (field === 'debit' ? `$ ${Number(v).toLocaleString('es-CO')}` : String(v));
}

afterEach(() => document.body.replaceChildren());

describe('CbAuditLog', () => {
  it('agrupa por día del más reciente al más antiguo, abre la diferencia y filtra', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const text = (n: Element) => n.textContent!.replace(/\s+/g, ' ').trim();
    expect(Array.from(el.querySelectorAll('.cb-al__day-title')).map(text)).toEqual(['Viernes, 23 de octubre de 2026', 'Jueves, 22 de octubre de 2026']);
    const lines = Array.from(el.querySelectorAll('.cb-al__line')).map(text);
    expect(lines[0].startsWith('Ana Ruiz aprobó Comprobante CE-000124')).toBe(true);
    expect(el.querySelector('time')!.getAttribute('datetime')).toBe(new Date('2026-10-23T16:05:00').toISOString());
    expect(lines[1]).toMatch(/^Leo Mora modificó Comprobante CE-000124/);
    const toggle = el.querySelector<HTMLButtonElement>('.cb-al__toggle')!;
    expect(text(toggle)).toBe('2 cambios');
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(Array.from(el.querySelectorAll('.cb-al__diff tbody tr')).map((tr) => Array.from(tr.children).map(text).join(' '))).toEqual(['Débito línea 1 $ 800.000 $ 845.000', 'Descripción (vacío) Factura octubre']);
    const search = el.querySelector<HTMLInputElement>('input[type="search"]')!;
    search.value = 'factura';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(el.querySelectorAll('.cb-al__entry').length).toBe(1);
    const audit = fixture.debugElement.children[0].componentInstance as CbAuditLog;
    expect(audit.toExcelSheet().rows.length).toBe(2);
  });
});
