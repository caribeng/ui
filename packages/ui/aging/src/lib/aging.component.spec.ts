import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { provideCaribeNG } from '@caribeng/ui';
import { CbAging } from './aging.component';
import { ageDocuments, agingTotals, cbDefaultBuckets, daysOverdue, type CbAgingDocument } from './aging-model';

const AS_OF = new Date(2026, 9, 31);
const DOCS: CbAgingDocument[] = [
  { id: 1, party: 'Distribuidora El Caribe', number: 'FV-1201', date: '2026-09-01', due: '2026-10-01', balance: 1200000 },
  { id: 2, party: 'Distribuidora El Caribe', number: 'FV-1250', date: '2026-10-15', due: '2026-11-14', balance: 800000 },
  { id: 3, party: 'Ana Ruiz', number: 'FV-1100', date: '2026-06-01', due: '2026-07-01', balance: 450000 },
  { id: 4, party: 'Ana Ruiz', number: 'FV-1180', date: '2026-08-10', due: '2026-09-09', balance: 300000.5 },
];
const BUCKETS = cbDefaultBuckets({ current: 'Por vencer', range: '{0}–{1} días', over: 'Más de {0} días' });

afterEach(() => document.body.replaceChildren());

describe('modelo de antigüedad', () => {
  it('días vencidos, tramos por tercero y totales', () => {
    expect(daysOverdue('2026-10-01', AS_OF)).toBe(30);
    expect(daysOverdue('2026-11-14', AS_OF)).toBe(-14);
    const rows = ageDocuments(DOCS, BUCKETS, AS_OF);
    expect(rows.find((r) => r.party === 'Ana Ruiz')).toMatchObject({ total: 750000.5, maxDays: 122, buckets: { current: 0, d30: 0, d60: 300000.5, d90: 0, over: 450000 } });
    expect(rows.find((r) => r.party === 'Distribuidora El Caribe')!.buckets).toMatchObject({ current: 800000, d30: 1200000 });
    expect(agingTotals(rows, BUCKETS)).toEqual({ buckets: { current: 800000, d30: 1200000, d60: 300000.5, d90: 0, over: 450000 }, total: 2750000.5 });
  });
});

@Component({
  imports: [CbAging],
  template: `<cb-aging title="Cartera" partyHeader="Cliente" [documents]="docs" [asOf]="asOf" [(sort)]="sort" />`,
})
class HostComponent {
  docs = DOCS;
  asOf = AS_OF;
  sort = signal<{ key: string; order: 1 | -1 }>({ key: 'total', order: -1 });
}

describe('CbAging', () => {
  it('muestra los tramos, ordena por total, abre los documentos y suma en el pie', async () => {
    TestBed.configureTestingModule({ providers: [provideCaribeNG({ locale: 'es', numberLocale: 'es-CO', currency: 'COP' })] });
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const text = (n: Element) => n.textContent!.replace(/\s+/g, ' ').trim();
    expect(Array.from(el.querySelectorAll('.cb-ag__table > thead th')).map(text)).toEqual(['Cliente', 'Por vencer', '1–30 días', '31–60 días', '61–90 días', 'Más de 90 días', 'Total', 'Más antiguo']);
    const rows = el.querySelectorAll('.cb-ag__row');
    expect(text(rows[0].querySelector('th')!)).toBe('Distribuidora El Caribe (2 doc.)');
    expect(text(rows[1].querySelectorAll('td')[6])).toBe('122 días');
    expect(Array.from(el.querySelectorAll('tfoot td')).map(text).slice(0, 6)).toEqual(['$ 800.000,00', '$ 1.200.000,00', '$ 300.000,50', '$ 0,00', '$ 450.000,00', '$ 2.750.000,50']);
    const toggle = rows[1].querySelector<HTMLButtonElement>('.cb-ag__toggle')!;
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(Array.from(el.querySelectorAll('.cb-ag__detail tbody tr')).map((r) => text(r.querySelectorAll('td')[3]))).toEqual(['122 días', '52 días']);
    el.querySelectorAll<HTMLButtonElement>('.cb-ag__sort')[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.sort()).toEqual({ key: 'party', order: 1 });
    expect(text(el.querySelector('.cb-ag__row th')!)).toContain('Ana Ruiz');
    const aging = fixture.debugElement.children[0].componentInstance as CbAging;
    const [summary, detail] = aging.toExcelSheets();
    expect(summary.totals).toEqual(['Total', 800000, 1200000, 300000.5, 0, 450000, 2750000.5, null]);
    expect(detail.rows.length).toBe(4);
  });
});
