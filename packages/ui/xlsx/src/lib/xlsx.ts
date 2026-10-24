import { zip } from './zip';

/** Tipo de dato (y formato) de una columna de Excel. */
export type CbXlsxType = 'text' | 'number' | 'integer' | 'currency' | 'percent' | 'date';

/** Columna de una hoja. */
export interface CbXlsxColumn {
  readonly header: string;
  readonly type?: CbXlsxType;
  /** Ancho en caracteres (si no, se calcula con el contenido). */
  readonly width?: number;
  /** Decimales de `number`, `currency` y `percent` (2 por defecto). */
  readonly decimals?: number;
  /** Símbolo de moneda de `currency` (`$` por defecto). */
  readonly symbol?: string;
  /** Negativos con signo o entre paréntesis; siempre en rojo. */
  readonly negative?: 'minus' | 'parens';
}

/** Fila con opciones. */
export interface CbXlsxRow {
  readonly cells: readonly unknown[];
  /** Nivel de agrupación (esquema de Excel, de 0 a 7): las filas se pliegan bajo su padre. */
  readonly level?: number;
  /** Fila en negrita (totales, cuentas mayores). */
  readonly bold?: boolean;
  /** Sangría de la primera celda (niveles de un árbol). */
  readonly indent?: number;
}

/** Hoja del libro. */
export interface CbXlsxSheet {
  /** Nombre de la pestaña (máx. 31 caracteres; se quitan `\ / ? * [ ] :`). */
  readonly name: string;
  readonly columns: readonly CbXlsxColumn[];
  readonly rows: readonly (readonly unknown[] | CbXlsxRow)[];
  /** Líneas de título sobre el encabezado (empresa, informe, periodo). */
  readonly title?: readonly string[];
  /** Fila de totales al final, en negrita. */
  readonly totals?: readonly unknown[];
  /** Deja fijo el encabezado al desplazarse (por defecto `true`). */
  readonly freeze?: boolean;
  /** Filtros en el encabezado (por defecto `true`). */
  readonly autoFilter?: boolean;
}

/** Opciones de `exportExcel()` de Table, TreeTable y Data Grid. */
export interface CbExcelExportOptions {
  /** Líneas de título sobre el encabezado (empresa, informe, periodo). */
  readonly title?: readonly string[];
  /** Nombre de la pestaña. */
  readonly sheetName?: string;
}

/** Símbolo corto de una moneda (`COP` → `$`, `EUR` → `€`). */
export function currencySymbol(code: string, locale = 'es'): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' }).formatToParts(0).find((p) => p.type === 'currency')?.value ?? code;
  } catch {
    return code;
  }
}

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // Caracteres de control que XML no admite.
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
}

/** Letra(s) de columna: 0 → A, 26 → AA. */
export function columnName(index: number): string {
  let n = index + 1;
  let name = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    name = String.fromCharCode(65 + r) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

/** Fecha a número de serie de Excel (días desde el 30/12/1899, hora local). */
export function excelDate(date: Date): number {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
  return utc / 86400000 + 25569;
}

/** Código de formato numérico de Excel para una columna. */
export function numberFormat(col: CbXlsxColumn): string | null {
  const type = col.type ?? 'text';
  const decimals = col.decimals ?? (type === 'integer' ? 0 : 2);
  const frac = decimals > 0 ? '.' + '0'.repeat(decimals) : '';
  const parens = col.negative === 'parens';
  const signed = (pos: string) => `${pos};[Red]${parens ? `(${pos})` : `-${pos}`}`;
  switch (type) {
    case 'number':
    case 'integer':
      return signed(`#,##0${frac}`);
    case 'currency': {
      const symbol = (col.symbol ?? '$').replace(/"/g, '');
      return signed(`"${symbol}" #,##0${frac}`);
    }
    case 'percent':
      return signed(`0${frac}%`);
    case 'date':
      return 'dd/mm/yyyy';
    default:
      return null;
  }
}

/** Registro de estilos (formatos de número, negrita, sangría) → índices de `cellXfs`. */
class Styles {
  private readonly fmts = new Map<string, number>();
  private readonly xfs: string[] = ['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'];
  private readonly keys = new Map<string, number>();

  style(options: { format?: string | null; bold?: boolean; header?: boolean; indent?: number; title?: boolean }): number {
    const key = JSON.stringify(options);
    const known = this.keys.get(key);
    if (known !== undefined) return known;
    let fmtId = 0;
    if (options.format) {
      fmtId = this.fmts.get(options.format) ?? 164 + this.fmts.size;
      this.fmts.set(options.format, fmtId);
    }
    const fontId = options.title ? 2 : options.bold || options.header ? 1 : 0;
    const fillId = options.header ? 2 : 0;
    const borderId = options.header ? 1 : 0;
    const align = options.indent ? `<alignment indent="${Math.min(options.indent, 15)}"/>` : '';
    const attrs = `numFmtId="${fmtId}" fontId="${fontId}" fillId="${fillId}" borderId="${borderId}" xfId="0"${fmtId ? ' applyNumberFormat="1"' : ''}${fontId ? ' applyFont="1"' : ''}${fillId ? ' applyFill="1"' : ''}${borderId ? ' applyBorder="1"' : ''}${align ? ' applyAlignment="1"' : ''}`;
    this.xfs.push(align ? `<xf ${attrs}>${align}</xf>` : `<xf ${attrs}/>`);
    const index = this.xfs.length - 1;
    this.keys.set(key, index);
    return index;
  }

  xml(): string {
    const fmts = [...this.fmts].map(([code, id]) => `<numFmt numFmtId="${id}" formatCode="${esc(code)}"/>`).join('');
    return (
      XML_HEADER +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      (fmts ? `<numFmts count="${this.fmts.size}">${fmts}</numFmts>` : '') +
      '<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="13"/><name val="Calibri"/></font></fonts>' +
      '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/><bgColor indexed="64"/></patternFill></fill></fills>' +
      '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right/><top/><bottom style="thin"><color rgb="FF94A3B8"/></bottom><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      `<cellXfs count="${this.xfs.length}">${this.xfs.join('')}</cellXfs>` +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
      '</styleSheet>'
    );
  }
}

function toRow(row: readonly unknown[] | CbXlsxRow): CbXlsxRow {
  return Array.isArray(row) ? { cells: row as readonly unknown[] } : (row as CbXlsxRow);
}

function cellXml(ref: string, value: unknown, style: number, type: CbXlsxType): string {
  const s = style ? ` s="${style}"` : '';
  if (value === null || value === undefined || value === '') return style ? `<c r="${ref}"${s}/>` : '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) return `<c r="${ref}"${s}><v>${excelDate(value)}</v></c>`;
  if (type === 'date' && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [y, m, d] = value.slice(0, 10).split('-').map(Number);
    return `<c r="${ref}"${s}><v>${excelDate(new Date(y, m - 1, d))}</v></c>`;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${ref}"${s}><v>${value}</v></c>`;
  if (typeof value === 'boolean') return `<c r="${ref}"${s} t="b"><v>${value ? 1 : 0}</v></c>`;
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(String(value))}</t></is></c>`;
}

function sheetXml(sheet: CbXlsxSheet, styles: Styles): string {
  const cols = sheet.columns;
  const title = sheet.title ?? [];
  const headerRow = title.length ? title.length + 2 : 1;
  const rows = sheet.rows.map(toRow);
  const out: string[] = [];
  let r = 0;
  const titleStyle = styles.style({ title: true });
  title.forEach((line, i) => {
    r++;
    out.push(`<row r="${r}">${cellXml(`A${r}`, line, i === 0 ? titleStyle : 0, 'text')}</row>`);
  });
  if (title.length) r++;
  r++;
  const headerStyle = styles.style({ header: true });
  out.push(`<row r="${r}">${cols.map((c, i) => cellXml(`${columnName(i)}${r}`, c.header, headerStyle, 'text')).join('')}</row>`);
  let maxLevel = 0;
  const write = (row: CbXlsxRow, forceBold = false) => {
    r++;
    const level = Math.max(0, Math.min(7, row.level ?? 0));
    maxLevel = Math.max(maxLevel, level);
    const bold = forceBold || !!row.bold;
    const cells = cols
      .map((c, i) => {
        const style = styles.style({ format: numberFormat(c), bold, indent: i === 0 ? row.indent : undefined });
        return cellXml(`${columnName(i)}${r}`, row.cells[i], style === 0 ? 0 : style, c.type ?? 'text');
      })
      .join('');
    out.push(`<row r="${r}"${level ? ` outlineLevel="${level}"` : ''}>${cells}</row>`);
  };
  rows.forEach((row) => write(row));
  if (sheet.totals) write({ cells: sheet.totals }, true);

  // Anchos: el indicado o el del texto más largo (con margen), entre 6 y 60.
  const widths = cols.map((c, i) => {
    if (c.width) return c.width;
    let max = c.header.length;
    for (const row of rows) {
      const v = row.cells[i];
      const len = v instanceof Date ? 10 : typeof v === 'number' ? v.toFixed(c.decimals ?? 2).length + 4 : String(v ?? '').length + (i === 0 ? (row.indent ?? 0) * 2 : 0);
      if (len > max) max = len;
    }
    return Math.max(6, Math.min(60, max + 2));
  });
  const lastCol = columnName(Math.max(0, cols.length - 1));
  const freeze = sheet.freeze ?? true;
  return (
    XML_HEADER +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    (maxLevel ? '<sheetPr><outlinePr summaryBelow="0"/></sheetPr>' : '') +
    `<dimension ref="A1:${lastCol}${Math.max(r, 1)}"/>` +
    (freeze
      ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${headerRow}" topLeftCell="A${headerRow + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
      : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>') +
    `<sheetFormatPr defaultRowHeight="15"${maxLevel ? ` outlineLevelRow="${maxLevel}"` : ''}/>` +
    `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` +
    `<sheetData>${out.join('')}</sheetData>` +
    ((sheet.autoFilter ?? true) && cols.length ? `<autoFilter ref="A${headerRow}:${lastCol}${headerRow}"/>` : '') +
    '</worksheet>'
  );
}

function sheetName(name: string, used: Set<string>): string {
  let base = (name.replace(/[\\/?*[\]:]/g, ' ').trim() || 'Hoja').slice(0, 31);
  let candidate = base;
  for (let n = 2; used.has(candidate.toLowerCase()); n++) candidate = `${base.slice(0, 28)} ${n}`;
  used.add(candidate.toLowerCase());
  return candidate;
}

/** Bytes del libro .xlsx con una o varias hojas. */
export function cbXlsxBytes(sheets: CbXlsxSheet | readonly CbXlsxSheet[]): Uint8Array {
  const list = Array.isArray(sheets) ? (sheets as readonly CbXlsxSheet[]) : [sheets as CbXlsxSheet];
  const styles = new Styles();
  const used = new Set<string>();
  const names = list.map((s) => sheetName(s.name, used));
  const sheetsXml = list.map((s) => sheetXml(s, styles));
  const enc = new TextEncoder();
  const file = (name: string, text: string) => ({ name, data: enc.encode(text) });
  return zip([
    file(
      '[Content_Types].xml',
      XML_HEADER +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        list.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') +
        '</Types>',
    ),
    file(
      '_rels/.rels',
      XML_HEADER +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    ),
    file(
      'xl/workbook.xml',
      XML_HEADER +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
        names.map((n, i) => `<sheet name="${esc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') +
        '</sheets>' +
        // El filtro necesita su nombre definido para que Excel lo reconozca.
        `<definedNames>${list
          .map((s, i) => {
            if (!(s.autoFilter ?? true) || !s.columns.length) return '';
            const hr = s.title?.length ? s.title.length + 2 : 1;
            return `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${esc(names[i].replace(/'/g, "''"))}'!$A$${hr}:$${columnName(s.columns.length - 1)}$${hr}</definedName>`;
          })
          .join('')}</definedNames>` +
        '</workbook>',
    ),
    file(
      'xl/_rels/workbook.xml.rels',
      XML_HEADER +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        list.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') +
        `<Relationship Id="rId${list.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
        '</Relationships>',
    ),
    file('xl/styles.xml', styles.xml()),
    ...sheetsXml.map((xml, i) => file(`xl/worksheets/sheet${i + 1}.xml`, xml)),
  ]);
}

/** Libro .xlsx como `Blob`. */
export function cbXlsx(sheets: CbXlsxSheet | readonly CbXlsxSheet[]): Blob {
  return new Blob([cbXlsxBytes(sheets) as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/** Descarga el libro (`nombre.xlsx`). */
export function cbDownloadXlsx(filename: string, sheets: CbXlsxSheet | readonly CbXlsxSheet[]): void {
  const url = URL.createObjectURL(cbXlsx(sheets));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.toLowerCase().endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url));
}
