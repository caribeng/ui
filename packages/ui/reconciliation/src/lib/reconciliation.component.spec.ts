import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { provideCaribeNG } from '@caribeng/ui';
import { CbReconciliation } from './reconciliation.component';
import { autoMatch, type CbReconItem, type CbReconMatch } from './reconciliation-model';

const EXTRACTO: CbReconItem[] = [
  { id: 's1', date: '2026-10-02', description: 'Consignación cliente', amount: 2450000, reference: 'RC-87' },
  { id: 's2', date: '2026-10-05', description: 'Pago proveedor', amount: -900000, reference: 'CE-124' },
  { id: 's3', date: '2026-10-08', description: 'Transferencia recibida', amount: 1000000 },
  { id: 's4', date: '2026-10-31', description: 'Comisión bancaria', amount: -18900 },
];
const LIBROS: CbReconItem[] = [
  { id: 'l1', date: '2026-10-01', description: 'Recaudo FV-1203', amount: 2450000, reference: 'RC-87' },
  { id: 'l2', date: '2026-10-04', description: 'Pago Enel', amount: -900000, reference: 'CE-124' },
  { id: 'l3', date: '2026-10-07', description: 'Abono FV-1210', amount: 600000 },
  { id: 'l4', date: '2026-10-07', description: 'Abono FV-1211', amount: 400000 },
  { id: 'l5', date: '2026-10-20', description: 'Cheque 1045', amount: -350000 },
];

afterEach(() => document.body.replaceChildren());

describe('modelo de conciliación', () => {
  it('empareja por valor y fecha cercana, prefiriendo la misma referencia', () => {
    expect(autoMatch(EXTRACTO, LIBROS, [])).toEqual([
      { statement: ['s1'], ledger: ['l1'] },
      { statement: ['s2'], ledger: ['l2'] },
    ]);
    expect(autoMatch(EXTRACTO, LIBROS, [{ statement: ['s1'], ledger: ['l1'] }], 0)).toEqual([]);
  });
});

@Component({
  imports: [CbReconciliation],
  template: `<cb-reconciliation [statement]="extracto" [ledger]="libros" [(matches)]="matches" allowCreate (createEntry)="created.push($event.id)" />`,
})
class HostComponent {
  extracto = EXTRACTO;
  libros = LIBROS;
  matches = signal<readonly CbReconMatch[]>([]);
  created: (string | number)[] = [];
}

describe('CbReconciliation', () => {
  it('concilia solo, empareja uno con varios cuando las sumas coinciden y deshace', async () => {
    TestBed.configureTestingModule({ providers: [provideCaribeNG({ locale: 'es', numberLocale: 'es-CO', currency: 'COP' })] });
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    await settle();
    const el = fixture.nativeElement as HTMLElement;
    const host = fixture.componentInstance;
    const button = (text: string) => Array.from(el.querySelectorAll('button')).find((b) => b.textContent!.trim().startsWith(text))!;
    const check = (desc: string) => Array.from(el.querySelectorAll<HTMLLabelElement>('.cb-rc__label')).find((l) => l.textContent!.includes(desc))!.querySelector('input')!;
    button('Conciliar automáticamente').click();
    await settle();
    expect(host.matches().length).toBe(2);
    expect(el.querySelectorAll('.cb-rc__item--matched').length).toBe(4);
    check('Transferencia recibida').click();
    check('Abono FV-1210').click();
    await settle();
    expect(button('Emparejar').disabled).toBe(true);
    expect(el.querySelector('.cb-rc__selection')!.textContent!.replace(/\s/g, ' ')).toContain('diferencia $ 400.000,00');
    check('Abono FV-1211').click();
    await settle();
    expect(button('Emparejar').disabled).toBe(false);
    button('Emparejar').click();
    await settle();
    expect(host.matches().at(-1)).toEqual({ statement: ['s3'], ledger: ['l3', 'l4'] });
    expect(el.querySelector('.cb-rc__stat-value')!.textContent!.replace(/\s/g, ' ')).toBe('-$ 18.900,00');
    el.querySelector<HTMLButtonElement>('.cb-rc__create')!.click();
    expect(host.created).toEqual(['s4']);
    check('Transferencia recibida').click();
    await settle();
    button('Deshacer emparejamiento').click();
    await settle();
    expect(host.matches().length).toBe(2);
  });
});
