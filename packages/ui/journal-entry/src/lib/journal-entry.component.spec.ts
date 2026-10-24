import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { provideCaribeNG } from '@caribeng/ui';
import type { CbAccount } from '@caribeng/ui/account-picker';
import { CbJournalEntry, type CbJournalEntryData } from './journal-entry.component';

const PUC: CbAccount[] = [
  { code: '1110', name: 'Bancos' },
  { code: '111005', name: 'Moneda nacional' },
  { code: '13', name: 'Deudores' },
  { code: '130505', name: 'Clientes nacionales' },
  { code: '5135', name: 'Servicios' },
  { code: '513530', name: 'Energía eléctrica' },
];

const ENTRY: CbJournalEntryData = {
  date: new Date(2030, 2, 13),
  type: 'CE',
  number: '000123',
  description: 'Pago de energía',
  lines: [
    { id: 1, account: '513530', thirdParty: 'enel', description: null, debit: 845000, credit: null },
    { id: 2, account: '111005', thirdParty: null, description: 'Transferencia', debit: null, credit: 800000 },
    { id: 3, account: null, thirdParty: null, description: null, debit: null, credit: null },
  ],
};

@Component({
  imports: [CbJournalEntry],
  template: `<cb-journal-entry [(entry)]="entry" [accounts]="accounts" [thirdParties]="terceros" [types]="tipos" [thirdPartyRequired]="['13']" currency="COP" (save)="saved.push($event)" (invalid)="problems.push($event)" />`,
})
class HostComponent {
  readonly editor = viewChild.required(CbJournalEntry);
  entry = signal<CbJournalEntryData>(ENTRY);
  accounts = PUC;
  terceros = [
    { label: 'Enel Colombia', value: 'enel' },
    { label: 'Ana Ruiz', value: 'ana' },
  ];
  tipos = [{ label: 'CE Comprobante de egreso', value: 'CE' }];
  saved: CbJournalEntryData[] = [];
  problems: string[][] = [];
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
  const button = (text: string) => Array.from(el.querySelectorAll('button')).find((b) => b.textContent!.trim() === text)!;
  const totals = () => Array.from(el.querySelectorAll('.cb-je__totals dd')).map((d) => d.textContent!.replace(/\s/g, ' ').trim());
  return { fixture, el, settle, button, totals, host: fixture.componentInstance };
}

describe('CbJournalEntry', () => {
  it('muestra cabecera, líneas con cuenta y tercero, y totales con la diferencia', async () => {
    const { el, totals } = await setup();
    expect(el.querySelector('table')!.getAttribute('aria-label')).toBe('Líneas del comprobante');
    expect(Array.from(el.querySelectorAll('thead th')).map((th) => th.textContent!.trim())).toEqual(['', 'Cuenta', 'Tercero', 'Detalle', 'Débito', 'Crédito']);
    expect(el.querySelector('tbody tr')!.textContent).toContain('513530 Energía eléctrica');
    expect(el.querySelector('tbody tr')!.textContent).toContain('Enel Colombia');
    expect(totals()).toEqual(['$ 845.000,00', '$ 800.000,00', '$ 45.000,00']);
    expect(el.querySelector('.cb-je__status')!.textContent).toContain('Descuadrado');
    // La línea vacía no se marca con errores.
    expect(el.querySelectorAll('tbody tr')[2].querySelectorAll('[aria-invalid="true"]').length).toBe(0);
  });

  it('no guarda si no cuadra y lista los problemas', async () => {
    const { button, settle, el, host } = await setup();
    button('Guardar comprobante').click();
    await settle();
    expect(host.saved.length).toBe(0);
    expect(el.querySelector('.cb-je__errors')!.textContent!.replace(/\s/g, ' ')).toContain('no cuadran (diferencia $ 45.000,00)');
    expect(host.problems[0].length).toBe(1);
  });

  it('Cuadrar pone la diferencia en la línea vacía; al guardar quita las vacías y hereda la descripción', async () => {
    const { button, settle, host, totals, el } = await setup();
    button('Cuadrar').click();
    await settle();
    expect(host.entry().lines[2]).toMatchObject({ credit: 45000, debit: null });
    expect(totals()[2]).toBe('$ 0,00');
    expect(el.querySelector('.cb-je__status')!.textContent).toContain('Cuadrado');
    // Falta la cuenta en la línea cuadrada: no se puede guardar.
    button('Guardar comprobante').click();
    await settle();
    expect(host.saved.length).toBe(0);
    expect(el.querySelector('.cb-je__errors')!.textContent).toContain('1 celdas con errores');
    host.entry.update((e) => ({ ...e, lines: e.lines.map((l) => (l.id === host.entry().lines[2].id ? { ...l, account: '111005' } : l)) }));
    await settle();
    el.querySelector('cb-journal-entry')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
    await settle();
    expect(host.saved.length).toBe(1);
    expect(host.saved[0].lines.length).toBe(3);
    expect(host.saved[0].lines[0].description).toBe('Pago de energía');
    expect(host.saved[0].lines[1].description).toBe('Transferencia');
  });

  it('las cuentas que exigen tercero se marcan sin él', async () => {
    const { host, settle, el, button } = await setup();
    host.entry.update((e) => ({ ...e, lines: [...e.lines.slice(0, 2), { id: 9, account: '130505', thirdParty: null, description: null, debit: null, credit: 45000 }] }));
    await settle();
    const third = el.querySelectorAll('tbody tr')[2].querySelectorAll('td')[1];
    expect(third.getAttribute('aria-invalid')).toBe('true');
    expect(third.textContent).toContain('Esta cuenta exige tercero.');
    button('Guardar comprobante').click();
    await settle();
    expect(host.saved.length).toBe(0);
  });
});
