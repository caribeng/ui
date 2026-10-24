import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { CbImportWizard } from './import-wizard.component';
import { autoMap, convertRows, detectDelimiter, parseAmount, parseDate, parseDelimited, type CbImportField, type CbImportResult } from './import-model';

const FIELDS: CbImportField[] = [
  { key: 'nit', label: 'NIT', required: true, aliases: ['documento', 'identificacion'] },
  { key: 'nombre', label: 'Razón social', required: true, aliases: ['nombre'] },
  { key: 'saldo', label: 'Saldo', type: 'number' },
  { key: 'fecha', label: 'Fecha de corte', type: 'date', aliases: ['fecha'] },
  { key: 'activo', label: 'Activo', type: 'boolean' },
];

const TEXTS = { required: 'Obligatorio.', number: 'No es un número.', date: 'Fecha mal.', boolean: 'Sí o No.' };

afterEach(() => document.body.replaceChildren());

describe('modelo de importación', () => {
  it('lee CSV con punto y coma, comillas y saltos de línea', () => {
    const text = '﻿NIT;Nombre;Saldo\n900123;"Distribuidora ""El Caribe""";1.234,50\n52876;"Ana\nRuiz";-300\n\n';
    expect(detectDelimiter(text)).toBe(';');
    expect(parseDelimited(text)).toEqual([['NIT', 'Nombre', 'Saldo'], ['900123', 'Distribuidora "El Caribe"', '1.234,50'], ['52876', 'Ana\nRuiz', '-300']]);
  });

  it('interpreta importes y fechas en varios formatos', () => {
    expect(['$ 1.234,56', '1,234.56', '(1.234)', '-1234', '1.234.567', '1.5', '12,5', '$1.000', 'abc'].map((v) => parseAmount(v))).toEqual([1234.56, 1234.56, -1234, -1234, 1234567, 1.5, 12.5, 1000, undefined]);
    expect(parseDate('05/03/2026')).toEqual(new Date(2026, 2, 5));
    expect(parseDate('2026-03-05')).toEqual(new Date(2026, 2, 5));
    expect(parseDate(46296)).toEqual(new Date(2026, 9, 1));
    expect(parseDate('31/02/2026')).toBeUndefined();
  });

  it('asigna columnas por nombre o alias y marca los errores por celda', () => {
    const mapping = autoMap(['Identificación', 'Nombre', 'Saldo', 'Fecha', 'Otra'], FIELDS);
    expect(mapping).toEqual({ nit: 0, nombre: 1, saldo: 2, fecha: 3, activo: null });
    const { rows, errors } = convertRows(
      [
        ['900123', 'El Caribe', '1.200,50', '01/10/2026'],
        ['', 'Sin NIT', 'diez', '2026-13-01'],
      ],
      mapping,
      FIELDS,
      TEXTS,
    );
    expect(rows[0]).toEqual({ nit: '900123', nombre: 'El Caribe', saldo: 1200.5, fecha: new Date(2026, 9, 1), activo: null });
    expect(errors).toEqual([
      { row: 2, field: 'nit', message: 'Obligatorio.' },
      { row: 2, field: 'saldo', message: 'No es un número.' },
      { row: 2, field: 'fecha', message: 'Fecha mal.' },
    ]);
  });
});

@Component({
  imports: [CbImportWizard],
  template: `<cb-import-wizard [fields]="fields" (import)="result = $event" />`,
})
class HostComponent {
  fields = FIELDS;
  result: CbImportResult | null = null;
}

describe('CbImportWizard', () => {
  it('pegar datos, asignar columnas, revisar errores e importar solo las válidas', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    await settle();
    const el = fixture.nativeElement as HTMLElement;
    const button = (text: string) => Array.from(el.querySelectorAll('button')).find((b) => b.textContent!.trim().startsWith(text))!;
    expect(el.querySelector('[aria-current="step"]')!.textContent).toContain('Archivo');
    expect(button('Siguiente').disabled).toBe(true);
    const textarea = el.querySelector('textarea')!;
    textarea.value = 'Documento\tNombre\tSaldo\tFecha\n900123\tEl Caribe\t1.200,50\t01/10/2026\n\tSin NIT\tdiez\t\n52876\tAna Ruiz\t(300)\t2026-09-09';
    textarea.dispatchEvent(new Event('input'));
    await settle();
    expect(el.querySelector('.cb-iw__info')!.textContent).toContain('3 filas y 4 columnas');
    button('Siguiente').click();
    await settle();
    expect(el.querySelector('[aria-current="step"]')!.textContent).toContain('Columnas');
    expect(Array.from(el.querySelectorAll('.cb-iw__example')).map((td) => td.textContent!.trim())).toEqual(['900123', 'El Caribe', '1.200,50', '1 oct 2026', '']);
    button('Siguiente').click();
    await settle();
    expect(el.querySelector('.cb-iw__summary')!.textContent).toContain('2 filas válidas');
    expect(el.querySelector('.cb-iw__summary')!.textContent).toContain('1 filas con errores');
    expect(el.querySelectorAll('cb-data-grid td[aria-invalid="true"]').length).toBe(2);
    button('Importar 2 filas').click();
    await settle();
    const result = fixture.componentInstance.result!;
    expect(result.skipped).toBe(1);
    expect(result.rows.map((r) => [r['nit'], r['saldo']])).toEqual([['900123', 1200.5], ['52876', -300]]);
    expect(result.errors.map((e) => e.field)).toEqual(['nit', 'saldo']);
  });
});
