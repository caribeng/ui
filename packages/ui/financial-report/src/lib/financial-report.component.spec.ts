import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { provideCaribeNG } from '@caribeng/ui';
import type { CbAccount } from '@caribeng/ui/account-picker';
import { CbFinancialReport, type CbReportBalances, type CbReportTotal } from './financial-report.component';

const PUC: CbAccount[] = [
  { code: '4', name: 'Ingresos', nature: 'credit' },
  { code: '41', name: 'Operacionales' },
  { code: '4135', name: 'Comercio' },
  { code: '413595', name: 'Venta de otros productos' },
  { code: '5', name: 'Gastos', nature: 'debit' },
  { code: '51', name: 'Administración' },
  { code: '5135', name: 'Servicios' },
  { code: '513530', name: 'Energía' },
  { code: '513540', name: 'Internet' },
  { code: '1', name: 'Activo' },
  { code: '1105', name: 'Caja' },
];

// Saldos contables: los ingresos (crédito) son negativos.
const SALDOS: CbReportBalances = {
  '413595': [-10000000, -8000000],
  '513530': [1200000, 1000000],
  '513540': [300000, 0],
  '1105': [5, 5],
};

const UTILIDAD: CbReportTotal[] = [{ label: 'Utilidad del ejercicio', terms: [{ code: '4' }, { code: '5', sign: -1 }] }];

@Component({
  imports: [CbFinancialReport],
  template: `<cb-financial-report title="Estado de resultados" [subtitle]="['CaribeNG S.A.S.']" [accounts]="puc" [balances]="saldos" [periods]="['2026', '2025']" comparative [classes]="['4', '5']" [totals]="totales" [(level)]="level" [(hideZero)]="hideZero" currency="COP" (accountOpen)="opened.push($event.code)" />`,
})
class HostComponent {
  puc = PUC;
  saldos = SALDOS;
  totales = UTILIDAD;
  level = signal(4);
  hideZero = signal(false);
  opened: string[] = [];
}

afterEach(() => document.body.replaceChildren());

async function setup() {
  TestBed.configureTestingModule({ providers: [provideCaribeNG({ numberLocale: 'es-CO' })] });
  const fixture = TestBed.createComponent(HostComponent);
  document.body.appendChild(fixture.nativeElement);
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  await settle();
  const el = fixture.nativeElement as HTMLElement;
  const rows = () => Array.from(el.querySelectorAll('tbody tr')).map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => td.textContent!.replace(/\s+/g, ' ').trim()));
  return { fixture, el, settle, rows, host: fixture.componentInstance };
}

describe('CbFinancialReport', () => {
  it('suma las cuentas mayores, muestra los ingresos en positivo, la variación, el % y la utilidad', async () => {
    const { rows, el } = await setup();
    expect(el.querySelector('h2')!.textContent).toBe('Estado de resultados');
    expect(rows()).toEqual([
      ['4 Ingresos', '$ 10.000.000,00', '$ 8.000.000,00', '$ 2.000.000,00', '25,0%'],
      ['41 Operacionales', '$ 10.000.000,00', '$ 8.000.000,00', '$ 2.000.000,00', '25,0%'],
      ['4135 Comercio', '$ 10.000.000,00', '$ 8.000.000,00', '$ 2.000.000,00', '25,0%'],
      ['413595 Venta de otros productos', '$ 10.000.000,00', '$ 8.000.000,00', '$ 2.000.000,00', '25,0%'],
      ['5 Gastos', '$ 1.500.000,00', '$ 1.000.000,00', '$ 500.000,00', '50,0%'],
      ['51 Administración', '$ 1.500.000,00', '$ 1.000.000,00', '$ 500.000,00', '50,0%'],
      ['5135 Servicios', '$ 1.500.000,00', '$ 1.000.000,00', '$ 500.000,00', '50,0%'],
      ['513530 Energía', '$ 1.200.000,00', '$ 1.000.000,00', '$ 200.000,00', '20,0%'],
      ['513540 Internet', '$ 300.000,00', '$ 0,00', '$ 300.000,00', ''],
      ['Utilidad del ejercicio', '$ 8.500.000,00', '$ 7.000.000,00', '$ 1.500.000,00', '21,4%'],
    ]);
    expect(el.querySelectorAll('tbody tr')[9].classList).toContain('cb-fr__total');
  });

  it('los niveles abren el árbol hasta esa profundidad y se pueden ocultar las cuentas en cero', async () => {
    const { rows, el, settle, host } = await setup();
    const level1 = Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-fr__level')).find((b) => b.textContent!.trim() === '1')!;
    expect(el.querySelectorAll('.cb-fr__level').length).toBe(4);
    level1.click();
    await settle();
    expect(rows().map((r) => r[0])).toEqual(['4 Ingresos', '5 Gastos', 'Utilidad del ejercicio']);
    host.saldos = { ...SALDOS, '513540': [0, 0] };
    host.level.set(4);
    host.hideZero.set(true);
    await settle();
    expect(rows().map((r) => r[0])).not.toContain('513540 Internet');
    expect(rows().map((r) => r[0])).toContain('513530 Energía');
  });

  it('Enter o clic en una cuenta de movimiento emite accountOpen; la hoja de Excel lleva títulos y niveles', async () => {
    const { el, settle, host, fixture } = await setup();
    const leaf = el.querySelectorAll<HTMLElement>('tbody tr')[3];
    leaf.click();
    await settle();
    expect(host.opened).toEqual(['413595']);
    const report = fixture.debugElement.children[0].componentInstance as CbFinancialReport;
    const sheet = report.toExcelSheet();
    expect(sheet.title).toEqual(['Estado de resultados', 'CaribeNG S.A.S.']);
    expect(sheet.columns.map((c) => c.header)).toEqual(['Cuenta', '2026', '2025', 'Variación', '%']);
    const rows = sheet.rows as { cells: unknown[]; level?: number; bold?: boolean }[];
    expect(rows.at(-1)).toMatchObject({ bold: true, level: 0, cells: ['Utilidad del ejercicio', 8500000, 7000000, 1500000, 1500000 / 7000000] });
    expect(rows[3]).toMatchObject({ level: 3, cells: ['413595 Venta de otros productos', 10000000, 8000000, 2000000, 0.25] });
  });
});
