// Genera los PDF de ejemplo del showcase (datos ficticios):
//   public/pdf/extracto-demo.pdf        — extracto de 3 páginas
//   public/pdf/extracto-protegido.pdf   — el mismo, cifrado con la contraseña "caribe"
// Uso: node apps/showcase/scripts/gen-sample-pdfs.mjs
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'pdf');
const W = 595; // A4 en puntos
const H = 842;

// --- Contenido ------------------------------------------------------------------

const movimientos = [
  ['02/09', 'Nómina Industrias Mangle S.A.S.', 4850000],
  ['03/09', 'Pago tarjeta de crédito', -1250000],
  ['04/09', 'Supermercado La Ceiba', -386400],
  ['05/09', 'Transferencia a Carlos Ruiz', -200000],
  ['07/09', 'Servicio de energía', -164300],
  ['08/09', 'Farmacia Brisa del Mar', -58900],
  ['10/09', 'Retiro cajero automático', -300000],
  ['11/09', 'Restaurante El Muelle', -97500],
  ['12/09', 'Abono intereses', 12480],
  ['14/09', 'Plan de telefonía móvil', -79900],
  ['15/09', 'Transferencia de Laura Gómez', 150000],
  ['16/09', 'Gasolinera Ruta Norte', -180000],
  ['18/09', 'Suscripción de música', -16900],
  ['19/09', 'Librería Puerto Viejo', -64000],
  ['20/09', 'Cuota de administración', -420000],
  ['21/09', 'Supermercado La Ceiba', -255700],
  ['22/09', 'Servicio de acueducto', -91200],
  ['23/09', 'Transferencia a Carlos Ruiz', -120000],
  ['24/09', 'Cine Bahía', -48000],
  ['25/09', 'Reembolso compra en línea', 89900],
  ['26/09', 'Pago seguro del vehículo', -210000],
  ['27/09', 'Panadería La Esquina', -23500],
  ['28/09', 'Retiro cajero automático', -200000],
  ['29/09', 'Gimnasio Coral', -95000],
  ['30/09', 'Cuota de manejo', -14900],
];

const cop = (n) => `${n < 0 ? '-' : ''}$ ${Math.abs(n).toLocaleString('es-CO').replace(/,/g, '.')}`;
const saldoAnterior = 2340000;
const abonos = movimientos.filter((m) => m[2] > 0).reduce((s, m) => s + m[2], 0);
const cargos = movimientos.filter((m) => m[2] < 0).reduce((s, m) => s + m[2], 0);

// Anchos de Helvetica (1/1000 em) para alinear importes a la derecha.
const WIDTHS = { ' ': 278, $: 556, '.': 278, ',': 278, '-': 333 };
const textWidth = (s, size) => [...s].reduce((w, c) => w + (WIDTHS[c] ?? 556), 0) * (size / 1000);

function pageContent(n, total, body) {
  const ops = [];
  const text = (x, y, s, { size = 10, bold = false, color = [0.1, 0.12, 0.16] } = {}) =>
    ops.push(`${color.join(' ')} rg BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${esc(s)}) Tj ET`);
  const right = (x, y, s, opts = {}) => text(x - textWidth(s, opts.size ?? 10), y, s, opts);
  const line = (x1, y1, x2, y2, gray = 0.85) => ops.push(`${gray} G 0.6 w ${x1} ${y1} m ${x2} ${y2} l S`);
  const rect = (x, y, w, h, color) => ops.push(`${color.join(' ')} rg ${x} ${y} ${w} ${h} re f`);

  rect(0, H - 90, W, 90, [0.05, 0.36, 0.55]);
  text(48, H - 50, 'Cooperativa Arrecife', { size: 20, bold: true, color: [1, 1, 1] });
  text(48, H - 70, 'Extracto de cuenta de ahorros  ·  Documento de demostración', { size: 10, color: [0.85, 0.93, 1] });
  body({ text, right, line, rect });
  line(48, 60, W - 48, 60);
  text(48, 44, 'Datos ficticios generados para la documentación de CaribeNG.', { size: 8, color: [0.45, 0.48, 0.55] });
  right(W - 48, 44, `Página ${n} de ${total}`, { size: 8, color: [0.45, 0.48, 0.55] });
  return ops.join('\n');
}

function tablaMovimientos(t, rows, top) {
  t.rect(48, top - 6, W - 96, 22, [0.94, 0.96, 0.98]);
  t.text(56, top, 'Fecha', { bold: true });
  t.text(110, top, 'Descripción', { bold: true });
  t.right(W - 56, top, 'Valor', { bold: true });
  let y = top - 24;
  for (const [fecha, desc, valor] of rows) {
    t.text(56, y, fecha);
    t.text(110, y, desc);
    t.right(W - 56, y, cop(valor), { color: valor < 0 ? [0.1, 0.12, 0.16] : [0.08, 0.5, 0.25] });
    t.line(48, y - 7, W - 48, y - 7, 0.92);
    y -= 22;
  }
  return y;
}

const pages = [
  (t) => {
    t.text(48, H - 130, 'Titular', { size: 9, color: [0.45, 0.48, 0.55] });
    t.text(48, H - 146, 'Ana Pérez Gómez', { size: 12, bold: true });
    t.text(300, H - 130, 'Cuenta', { size: 9, color: [0.45, 0.48, 0.55] });
    t.text(300, H - 146, 'Ahorros **** 4821', { size: 12, bold: true });
    t.text(48, H - 172, 'Dirección de envío: Calle 12 # 4-56, Barrio El Puerto', { size: 10 });
    t.text(48, H - 188, 'Periodo: 1 al 30 de septiembre de 2026', { size: 10 });

    t.text(48, H - 230, 'Resumen', { size: 14, bold: true });
    const resumen = [
      ['Saldo anterior', saldoAnterior],
      ['Abonos', abonos],
      ['Cargos', cargos],
      ['Saldo final', saldoAnterior + abonos + cargos],
    ];
    let y = H - 256;
    for (const [label, value] of resumen) {
      const bold = label === 'Saldo final';
      t.text(56, y, label, { bold });
      t.right(W - 56, y, cop(value), { bold });
      t.line(48, y - 7, W - 48, y - 7, 0.92);
      y -= 22;
    }
    t.text(48, y - 24, 'Movimientos', { size: 14, bold: true });
    tablaMovimientos(t, movimientos.slice(0, 12), y - 52);
  },
  (t) => {
    t.text(48, H - 130, 'Movimientos (continuación)', { size: 14, bold: true });
    tablaMovimientos(t, movimientos.slice(12), H - 160);
  },
  (t) => {
    t.text(48, H - 130, 'Información importante', { size: 14, bold: true });
    const parrafos = [
      'Revise este extracto y comunique cualquier inconsistencia dentro de los 30 días siguientes a su',
      'recepción. Pasado este plazo, los movimientos se entenderán aceptados.',
      '',
      'Tasa de interés efectiva anual de la cuenta de ahorros: 1,5 %. La cuota de manejo se cobra el',
      'último día hábil de cada mes.',
      '',
      'Para actualizar su dirección de envío o sus datos de contacto, use la banca en línea o',
      'acérquese a cualquiera de nuestras oficinas.',
      '',
      'Este documento se generó para la documentación de CaribeNG y no corresponde a ninguna',
      'entidad ni persona real.',
    ];
    let y = H - 160;
    for (const p of parrafos) {
      if (p) t.text(48, y, p, { size: 11 });
      y -= 18;
    }
    t.text(48, y - 20, 'Fin del extracto.', { size: 11, bold: true });
  },
];

// --- Escritura del PDF --------------------------------------------------------------------

function esc(s) {
  return s.replace(/[\\()]/g, (c) => `\\${c}`);
}

/** Texto a bytes WinAnsi (los caracteres usados están en Latin-1, salvo el punto medio que también). */
const latin1 = (s) => Buffer.from(s, 'latin1');

function buildPdf({ password } = {}) {
  const fileId = createHash('md5').update(`caribeng-extracto-${password ?? ''}`).digest();
  const crypt = password ? standardSecurity(password, fileId) : null;
  const objects = [];
  const add = (fn) => {
    objects.push(fn);
    return objects.length;
  };

  const catalog = add(() => `<< /Type /Catalog /Pages 2 0 R >>`);
  const pagesId = add(null);
  const f1 = add(() => `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
  const f2 = add(() => `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);
  const kids = [];
  pages.forEach((body, i) => {
    const content = latin1(pageContent(i + 1, pages.length, body));
    const contentId = add((id) => {
      const data = crypt ? crypt.encrypt(id, content) : content;
      return [latin1(`<< /Length ${data.length} >>\nstream\n`), data, latin1('\nendstream')];
    });
    kids.push(
      add(
        () =>
          `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${contentId} 0 R >>`,
      ),
    );
  });
  objects[pagesId - 1] = () => `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;
  const encryptId = crypt ? add(() => crypt.dictionary) : 0;

  const chunks = [latin1('%PDF-1.7\n%\xe2\xe3\xcf\xd3\n')];
  let offset = chunks[0].length;
  const offsets = [];
  objects.forEach((fn, i) => {
    const id = i + 1;
    const body = fn(id);
    const parts = [latin1(`${id} 0 obj\n`), ...(Array.isArray(body) ? body : [latin1(body)]), latin1('\nendobj\n')];
    offsets.push(offset);
    for (const p of parts) {
      chunks.push(p);
      offset += p.length;
    }
  });
  const xref = [`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`, ...offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`)].join('');
  const hexId = fileId.toString('hex');
  const trailer =
    `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R /ID [<${hexId}> <${hexId}>]` +
    (crypt ? ` /Encrypt ${encryptId} 0 R` : '') +
    ` >>\nstartxref\n${offset}\n%%EOF\n`;
  chunks.push(latin1(xref + trailer));
  return Buffer.concat(chunks);
}

// --- Cifrado estándar de PDF (RC4 de 128 bits, revisión 3) ---------------------------------------

const PAD = Buffer.from('28bf4e5e4e758a4164004e56fffa01082e2e00b6d0683e802f0ca9fe6453697a', 'hex');
const md5 = (...parts) => createHash('md5').update(Buffer.concat(parts)).digest();

function rc4(key, data) {
  const s = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 0, j = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
  }
  const out = Buffer.alloc(data.length);
  for (let k = 0, i = 0, j = 0; k < data.length; k++) {
    i = (i + 1) & 255;
    j = (j + s[i]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
    out[k] = data[k] ^ s[(s[i] + s[j]) & 255];
  }
  return out;
}

const xorKey = (key, n) => Buffer.from(key.map((b) => b ^ n));
const padded = (pw) => Buffer.concat([latin1(pw), PAD]).subarray(0, 32);

function standardSecurity(userPassword, fileId) {
  const P = -4;
  // Algoritmo 3: entrada /O (la contraseña de propietario es la misma).
  let hash = md5(padded(userPassword));
  for (let i = 0; i < 50; i++) hash = md5(hash);
  let o = rc4(hash, padded(userPassword));
  for (let i = 1; i <= 19; i++) o = rc4(xorKey(hash, i), o);
  // Algoritmo 2: clave de cifrado.
  const p = Buffer.alloc(4);
  p.writeInt32LE(P);
  let key = md5(padded(userPassword), o, p, fileId);
  for (let i = 0; i < 50; i++) key = md5(key);
  // Algoritmo 5: entrada /U.
  let u = rc4(key, md5(PAD, fileId));
  for (let i = 1; i <= 19; i++) u = rc4(xorKey(key, i), u);
  u = Buffer.concat([u, Buffer.alloc(16)]);
  return {
    dictionary: `<< /Filter /Standard /V 2 /R 3 /Length 128 /P ${P} /O <${o.toString('hex')}> /U <${u.toString('hex')}> >>`,
    // Algoritmo 1: clave por objeto.
    encrypt(id, data) {
      const objKey = md5(key, Buffer.from([id & 255, (id >> 8) & 255, (id >> 16) & 255, 0, 0]));
      return rc4(objKey, data);
    },
  };
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'extracto-demo.pdf'), buildPdf());
writeFileSync(join(OUT, 'extracto-protegido.pdf'), buildPdf({ password: 'caribe' }));
console.log('PDF de ejemplo generados en', OUT);
