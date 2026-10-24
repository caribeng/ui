/** Hoja leída de un .xlsx: su nombre y las celdas como texto o número. */
export interface CbXlsxReadSheet {
  readonly name: string;
  readonly rows: (string | number | boolean | null)[][];
}

interface Entry {
  readonly name: string;
  readonly method: number;
  readonly offset: number;
  readonly compressedSize: number;
}

/** Entradas del directorio central de un ZIP. */
function entries(bytes: Uint8Array): Entry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error('No es un archivo ZIP/XLSX válido.');
  const count = view.getUint16(end + 10, true);
  let pos = view.getUint32(end + 16, true);
  const dec = new TextDecoder();
  const out: Entry[] = [];
  for (let n = 0; n < count; n++) {
    if (view.getUint32(pos, true) !== 0x02014b50) break;
    const method = view.getUint16(pos + 10, true);
    const compressedSize = view.getUint32(pos + 20, true);
    const nameLen = view.getUint16(pos + 28, true);
    const extraLen = view.getUint16(pos + 30, true);
    const commentLen = view.getUint16(pos + 32, true);
    const local = view.getUint32(pos + 42, true);
    const name = dec.decode(bytes.subarray(pos + 46, pos + 46 + nameLen));
    // El contenido empieza tras la cabecera local (con su propio nombre y extra).
    const localName = view.getUint16(local + 26, true);
    const localExtra = view.getUint16(local + 28, true);
    out.push({ name, method, compressedSize, offset: local + 30 + localName + localExtra });
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const source = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });
  const reader = source.pipeThrough(new DecompressionStream('deflate-raw') as unknown as ReadableWritablePair<Uint8Array, Uint8Array>).getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
  }
  const out = new Uint8Array(size);
  let pos = 0;
  for (const c of chunks) {
    out.set(c, pos);
    pos += c.length;
  }
  return out;
}

async function readEntry(bytes: Uint8Array, entry: Entry): Promise<string> {
  const raw = bytes.subarray(entry.offset, entry.offset + entry.compressedSize);
  const data = entry.method === 0 ? raw : await inflate(raw);
  return new TextDecoder().decode(data);
}

/** Índice de columna a partir de una referencia (`C12` → 2). */
function columnIndex(ref: string): number {
  let n = 0;
  for (const ch of ref.replace(/\d+$/, '')) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/** Texto de un nodo `<si>` o `<is>` (con o sin formato enriquecido). */
function richText(node: Element): string {
  return Array.from(node.getElementsByTagName('t'))
    .map((t) => t.textContent ?? '')
    .join('');
}

/**
 * Lee un libro .xlsx (Excel, LibreOffice, Google Sheets) en el navegador: todas
 * las hojas con sus celdas como texto, número o booleano. Las fechas quedan
 * como número de serie de Excel (ver `excelSerialToDate`).
 */
export async function cbReadXlsx(input: Blob | ArrayBuffer | Uint8Array): Promise<CbXlsxReadSheet[]> {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input instanceof Blob ? await input.arrayBuffer() : input);
  const list = entries(bytes);
  const get = async (name: string) => {
    const e = list.find((x) => x.name === name);
    return e ? readEntry(bytes, e) : null;
  };
  const parser = new DOMParser();
  const xml = (text: string) => parser.parseFromString(text, 'application/xml');

  const shared: string[] = [];
  const sst = await get('xl/sharedStrings.xml');
  if (sst) for (const si of Array.from(xml(sst).getElementsByTagName('si'))) shared.push(richText(si));

  // Nombres y orden de las hojas según el libro y sus relaciones.
  const workbook = xml((await get('xl/workbook.xml')) ?? '<workbook/>');
  const rels = xml((await get('xl/_rels/workbook.xml.rels')) ?? '<Relationships/>');
  const targets = new Map(Array.from(rels.getElementsByTagName('Relationship')).map((r) => [r.getAttribute('Id'), r.getAttribute('Target') ?? '']));
  const sheets = Array.from(workbook.getElementsByTagName('sheet')).map((s) => {
    const rid = s.getAttribute('r:id') ?? s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
    const target = (targets.get(rid) ?? '').replace(/^\/?xl\//, '').replace(/^\//, '');
    return { name: s.getAttribute('name') ?? 'Hoja', path: `xl/${target}` };
  });

  const out: CbXlsxReadSheet[] = [];
  for (const sheet of sheets) {
    const text = await get(sheet.path);
    if (!text) continue;
    const rows: (string | number | boolean | null)[][] = [];
    for (const row of Array.from(xml(text).getElementsByTagName('row'))) {
      const r = Number(row.getAttribute('r') ?? rows.length + 1) - 1;
      const cells: (string | number | boolean | null)[] = [];
      for (const c of Array.from(row.getElementsByTagName('c'))) {
        const ref = c.getAttribute('r');
        const ci = ref ? columnIndex(ref) : cells.length;
        const type = c.getAttribute('t');
        const v = c.getElementsByTagName('v')[0]?.textContent ?? null;
        let value: string | number | boolean | null = null;
        if (type === 's') value = v === null ? null : (shared[Number(v)] ?? '');
        else if (type === 'inlineStr') value = richText(c.getElementsByTagName('is')[0] ?? c);
        else if (type === 'b') value = v === '1';
        else if (type === 'str' || type === 'e') value = v;
        else value = v === null || v === '' ? null : Number(v);
        while (cells.length < ci) cells.push(null);
        cells[ci] = value;
      }
      while (rows.length < r) rows.push([]);
      rows[r] = cells;
    }
    out.push({ name: sheet.name, rows });
  }
  return out;
}

/** Número de serie de Excel a fecha local. */
export function excelSerialToDate(serial: number): Date {
  const utc = new Date(Math.round((serial - 25569) * 86400000));
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}
