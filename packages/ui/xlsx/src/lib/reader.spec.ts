import { describe, expect, it } from 'vitest';
import { cbReadXlsx, excelSerialToDate } from './reader';
import { XLSX_FIXTURE } from './reader.fixture';
import { cbXlsxBytes } from './xlsx';

const fromBase64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

describe('lector de xlsx', () => {
  it('lee un libro de Excel comprimido: hojas, cadenas compartidas, números y fechas', async () => {
    const sheets = await cbReadXlsx(fromBase64(XLSX_FIXTURE));
    expect(sheets.map((s) => s.name)).toEqual(['Terceros', 'Otra']);
    const [head, first, second] = sheets[0].rows;
    expect(head).toEqual(['NIT', 'Razón social', 'Saldo', 'Fecha']);
    expect(first.slice(0, 3)).toEqual(['900123456', 'Distribuidora El Caribe', 1234567.5]);
    expect(excelSerialToDate(first[3] as number)).toEqual(new Date(2026, 9, 1));
    expect(second[2]).toBe(-300);
  });

  it('lee lo que escribe cbXlsxBytes (sin compresión, cadenas en línea)', async () => {
    const bytes = cbXlsxBytes({ name: 'Datos', columns: [{ header: 'Cuenta' }, { header: 'Valor', type: 'number' }], rows: [['1105', 10.5], ['', true]] });
    const [sheet] = await cbReadXlsx(bytes);
    expect(sheet.name).toBe('Datos');
    expect(sheet.rows).toEqual([['Cuenta', 'Valor'], ['1105', 10.5], [null, true]]);
  });
});
