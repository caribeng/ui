import { describe, expect, it } from 'vitest';
import { cbXlsxBytes, columnName, excelDate, numberFormat } from './xlsx';
import { crc32 } from './zip';

/** Archivos del ZIP (sin compresión) con su texto. */
function unzip(bytes: Uint8Array): Record<string, string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out: Record<string, string> = {};
  let pos = 0;
  const dec = new TextDecoder();
  while (view.getUint32(pos, true) === 0x04034b50) {
    const size = view.getUint32(pos + 18, true);
    const nameLen = view.getUint16(pos + 26, true);
    const name = dec.decode(bytes.subarray(pos + 30, pos + 30 + nameLen));
    const start = pos + 30 + nameLen;
    const data = bytes.subarray(start, start + size);
    expect(view.getUint32(pos + 14, true)).toBe(crc32(data));
    out[name] = dec.decode(data);
    pos = start + size;
  }
  return out;
}

describe('xlsx', () => {
  it('columnas, fechas de Excel y formatos contables', () => {
    expect([columnName(0), columnName(25), columnName(26), columnName(701)]).toEqual(['A', 'Z', 'AA', 'ZZ']);
    expect(excelDate(new Date(2026, 9, 1))).toBe(46296);
    expect(numberFormat({ header: 'x', type: 'currency', negative: 'parens' })).toBe('"$" #,##0.00;[Red]("$" #,##0.00)');
    expect(numberFormat({ header: 'x', type: 'integer' })).toBe('#,##0;[Red]-#,##0');
    expect(numberFormat({ header: 'x', type: 'percent', decimals: 1 })).toBe('0.0%;[Red]-0.0%');
    expect(numberFormat({ header: 'x' })).toBeNull();
  });

  it('genera un libro con hojas, títulos, encabezado fijo, filtro, niveles y totales', () => {
    const files = unzip(
      cbXlsxBytes([
        {
          name: 'Balance: octubre',
          title: ['CaribeNG S.A.S.'],
          columns: [{ header: 'Cuenta' }, { header: 'Saldo', type: 'currency', symbol: '$' }],
          rows: [{ cells: ['1 Activo', 100], bold: true }, { cells: ['1105 Caja <&>', -5.5], level: 1, indent: 1 }],
          totals: ['Total', 94.5],
        },
        { name: 'Balance: octubre', columns: [{ header: 'X' }], rows: [['a']] },
      ]),
    );
    expect(Object.keys(files)).toEqual(['[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml', 'xl/_rels/workbook.xml.rels', 'xl/styles.xml', 'xl/worksheets/sheet1.xml', 'xl/worksheets/sheet2.xml']);
    expect(files['xl/workbook.xml']).toContain('<sheet name="Balance  octubre" sheetId="1"');
    expect(files['xl/workbook.xml']).toContain('<sheet name="Balance  octubre 2" sheetId="2"');
    const sheet = files['xl/worksheets/sheet1.xml'];
    expect(sheet).toContain('<pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/>');
    expect(sheet).toContain('<autoFilter ref="A3:B3"/>');
    expect(sheet).toContain('<row r="5" outlineLevel="1">');
    expect(sheet).toContain('1105 Caja &lt;&amp;&gt;');
    expect(sheet).toContain('<c r="B5"');
    expect(sheet).toMatch(/<c r="B6" s="\d+"><v>94.5<\/v><\/c>/);
    expect(files['xl/styles.xml']).toContain('formatCode="&quot;$&quot; #,##0.00;[Red]-&quot;$&quot; #,##0.00"');
  });
});
