/*
 * Codificador QR propio de CaribeNG (ISO/IEC 18004), sin dependencias.
 * Modos numérico, alfanumérico y byte (UTF-8), versiones 1–40, niveles de
 * corrección L/M/Q/H y elección automática de la máscara con menor penalización.
 */

/** Nivel de corrección de errores: recupera ~7 % (L), 15 % (M), 25 % (Q) o 30 % (H) del código. */
export type CbQrErrorCorrection = 'L' | 'M' | 'Q' | 'H';

/** Matriz QR: `modules[y][x]` es `true` en los módulos oscuros. */
export interface CbQrMatrix {
  /** Versión elegida (1–40). */
  readonly version: number;
  /** Módulos por lado (17 + 4 × versión). */
  readonly size: number;
  readonly errorCorrection: CbQrErrorCorrection;
  /** Máscara aplicada (0–7). */
  readonly mask: number;
  readonly modules: readonly (readonly boolean[])[];
}

export interface CbQrEncodeOptions {
  /** Por defecto `M`. */
  errorCorrection?: CbQrErrorCorrection;
  /** Versión mínima (1–40). Por defecto 1. */
  minVersion?: number;
}

// --- Tablas del estándar, indexadas por [nivel][versión] (índice 0 sin uso) ---

const EC_ORDER: readonly CbQrErrorCorrection[] = ['L', 'M', 'Q', 'H'];
/** Bits del nivel en la información de formato. */
const EC_FORMAT_BITS: Record<CbQrErrorCorrection, number> = { L: 1, M: 0, Q: 3, H: 2 };

const EC_CODEWORDS_PER_BLOCK: Record<CbQrErrorCorrection, readonly number[]> = {
  L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};

const EC_BLOCKS: Record<CbQrErrorCorrection, readonly number[]> = {
  L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};

const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

type Mode = 'numeric' | 'alphanumeric' | 'byte';
const MODE_INDICATOR: Record<Mode, number> = { numeric: 0b0001, alphanumeric: 0b0010, byte: 0b0100 };
/** Bits del contador de caracteres para las versiones 1–9, 10–26 y 27–40. */
const COUNT_BITS: Record<Mode, readonly [number, number, number]> = {
  numeric: [10, 12, 14],
  alphanumeric: [9, 11, 13],
  byte: [8, 16, 16],
};

// --- Aritmética en GF(256) con el polinomio x^8 + x^4 + x^3 + x^2 + 1 ---

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
}

function gfMul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

/** Coeficientes (sin el término principal) del generador Reed-Solomon de grado `degree`. */
function rsGenerator(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  return poly.slice(1);
}

/** Codewords de corrección de `data` (resto de la división por el generador). */
export function cbQrReedSolomon(data: readonly number[], degree: number): number[] {
  const generator = rsGenerator(degree);
  const remainder = new Array<number>(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ remainder.shift()!;
    remainder.push(0);
    for (let i = 0; i < degree; i++) remainder[i] ^= gfMul(generator[i], factor);
  }
  return remainder;
}

// --- Capacidad ---

/** Módulos disponibles para datos y corrección (sin patrones de función ni formato). */
function rawDataModules(version: number): number {
  let modules = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const align = Math.floor(version / 7) + 2;
    modules -= (25 * align - 10) * align - 55;
    if (version >= 7) modules -= 36;
  }
  return modules;
}

function dataCodewords(version: number, ec: CbQrErrorCorrection): number {
  return Math.floor(rawDataModules(version) / 8) - EC_CODEWORDS_PER_BLOCK[ec][version] * EC_BLOCKS[ec][version];
}

// --- Segmento de datos ---

class BitBuffer {
  readonly bits: number[] = [];
  push(value: number, length: number): void {
    for (let i = length - 1; i >= 0; i--) this.bits.push((value >>> i) & 1);
  }
}

function chooseMode(text: string): Mode {
  if (/^\d*$/.test(text)) return 'numeric';
  if ([...text].every((c) => ALPHANUMERIC.includes(c))) return 'alphanumeric';
  return 'byte';
}

function countBits(mode: Mode, version: number): number {
  return COUNT_BITS[mode][version <= 9 ? 0 : version <= 26 ? 1 : 2];
}

/** Bits del contenido (sin modo ni contador) y número de caracteres a declarar. */
function encodeContent(text: string, mode: Mode): { bits: BitBuffer; count: number } {
  const bits = new BitBuffer();
  if (mode === 'numeric') {
    for (let i = 0; i < text.length; i += 3) {
      const group = text.slice(i, i + 3);
      bits.push(Number(group), group.length * 3 + 1);
    }
    return { bits, count: text.length };
  }
  if (mode === 'alphanumeric') {
    for (let i = 0; i < text.length; i += 2) {
      const a = ALPHANUMERIC.indexOf(text[i]);
      if (i + 1 < text.length) bits.push(a * 45 + ALPHANUMERIC.indexOf(text[i + 1]), 11);
      else bits.push(a, 6);
    }
    return { bits, count: text.length };
  }
  const bytes = new TextEncoder().encode(text);
  for (const b of bytes) bits.push(b, 8);
  return { bits, count: bytes.length };
}

// --- Matriz ---

function alignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const count = Math.floor(version / 7) + 2;
  const size = version * 4 + 17;
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2;
  const positions = [6];
  for (let i = 0, pos = size - 7; i < count - 1; i++, pos -= step) positions.splice(1, 0, pos);
  return positions;
}

/** Resto BCH: `value` desplazado `degree` bits módulo `generator`. */
function bchRemainder(value: number, generator: number, degree: number): number {
  let rem = value << degree;
  for (let bit = 31 - Math.clz32(rem); bit >= degree; bit--) {
    if ((rem >>> bit) & 1) rem ^= generator << (bit - degree);
  }
  return rem;
}

/** 15 bits de formato (nivel + máscara), ya con la máscara XOR del estándar. */
export function cbQrFormatBits(ec: CbQrErrorCorrection, mask: number): number {
  const data = (EC_FORMAT_BITS[ec] << 3) | mask;
  return ((data << 10) | bchRemainder(data, 0x537, 10)) ^ 0x5412;
}

const MASKS: readonly ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

class Grid {
  readonly dark: boolean[][];
  /** Módulos de patrones de función y formato: no llevan datos ni máscara. */
  readonly reserved: boolean[][];

  constructor(readonly size: number) {
    this.dark = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
    this.reserved = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  }

  set(x: number, y: number, dark: boolean): void {
    this.dark[y][x] = dark;
    this.reserved[y][x] = true;
  }
}

function drawFunctionPatterns(grid: Grid, version: number): void {
  const size = grid.size;
  // Patrones de posición (7×7) con su separador claro.
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const ring = Math.max(Math.abs(dx), Math.abs(dy));
        grid.set(x, y, ring !== 2 && ring !== 4);
      }
    }
  }
  // Patrones de alineación (5×5), salvo los que pisan los de posición.
  const align = alignmentPositions(version);
  for (const cy of align) {
    for (const cx of align) {
      if (grid.reserved[cy][cx]) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) grid.set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }
  // Líneas de temporización.
  for (let i = 8; i < size - 8; i++) {
    grid.set(i, 6, i % 2 === 0);
    grid.set(6, i, i % 2 === 0);
  }
  // Reserva del formato (se escribe después) y módulo oscuro fijo.
  drawFormat(grid, 0);
  // Información de versión (v7+).
  if (version >= 7) {
    const bits = (version << 12) | bchRemainder(version, 0x1f25, 12);
    for (let i = 0; i < 18; i++) {
      const dark = ((bits >>> i) & 1) === 1;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      grid.set(a, b, dark);
      grid.set(b, a, dark);
    }
  }
}

function drawFormat(grid: Grid, bits: number): void {
  const size = grid.size;
  const bit = (i: number) => ((bits >>> i) & 1) === 1;
  // Copia junto al patrón superior izquierdo.
  for (let i = 0; i <= 5; i++) grid.set(8, i, bit(i));
  grid.set(8, 7, bit(6));
  grid.set(8, 8, bit(7));
  grid.set(7, 8, bit(8));
  for (let i = 9; i < 15; i++) grid.set(14 - i, 8, bit(i));
  // Copia repartida entre los otros dos patrones.
  for (let i = 0; i < 8; i++) grid.set(size - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) grid.set(8, size - 15 + i, bit(i));
  grid.set(8, size - 8, true);
}

/** Coloca los codewords en zigzag de dos columnas, de derecha a izquierda, saltando la columna 6. */
function drawCodewords(grid: Grid, codewords: readonly number[]): void {
  const size = grid.size;
  let index = 0;
  const total = codewords.length * 8;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    const upward = ((right + 1) & 2) === 0;
    for (let step = 0; step < size; step++) {
      const y = upward ? size - 1 - step : step;
      for (let k = 0; k < 2; k++) {
        const x = right - k;
        if (grid.reserved[y][x]) continue;
        if (index < total) grid.dark[y][x] = ((codewords[index >>> 3] >>> (7 - (index & 7))) & 1) === 1;
        index++;
      }
    }
  }
}

function applyMask(grid: Grid, mask: number): void {
  const test = MASKS[mask];
  for (let y = 0; y < grid.size; y++) {
    for (let x = 0; x < grid.size; x++) {
      if (!grid.reserved[y][x] && test(x, y)) grid.dark[y][x] = !grid.dark[y][x];
    }
  }
}

/** Penalización del estándar (reglas N1–N4): menor es más legible. */
function penalty(dark: readonly (readonly boolean[])[]): number {
  const size = dark.length;
  let score = 0;
  const lines: boolean[][] = [];
  for (let i = 0; i < size; i++) {
    lines.push([...dark[i]]);
    lines.push(dark.map((row) => row[i]));
  }
  // N1: rachas de 5 o más módulos iguales. N3: patrones 1:1:3:1:1 con 4 claros a un lado.
  const finderA = [true, false, true, true, true, false, true, false, false, false, false];
  const finderB = [...finderA].reverse();
  for (const line of lines) {
    let run = 1;
    for (let i = 1; i <= size; i++) {
      if (i < size && line[i] === line[i - 1]) {
        run++;
      } else {
        if (run >= 5) score += run - 2;
        run = 1;
      }
    }
    const padded = [false, false, false, false, ...line, false, false, false, false];
    for (let i = 0; i + 11 <= padded.length; i++) {
      if (finderA.every((v, k) => padded[i + k] === v) || finderB.every((v, k) => padded[i + k] === v)) score += 40;
    }
  }
  // N2: bloques 2×2 del mismo color.
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const c = dark[y][x];
      if (c === dark[y][x + 1] && c === dark[y + 1][x] && c === dark[y + 1][x + 1]) score += 3;
    }
  }
  // N4: proporción de módulos oscuros lejos del 50 %.
  const darkCount = dark.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
  const percent = (darkCount * 100) / (size * size);
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;
  return score;
}

/**
 * Codifica `text` como matriz QR. Elige el modo más compacto, la versión más
 * pequeña que lo contiene y la máscara con menor penalización.
 *
 * @throws RangeError si el texto no cabe en la versión 40 con ese nivel.
 */
export function cbQrEncode(text: string, options: CbQrEncodeOptions = {}): CbQrMatrix {
  const ec = options.errorCorrection ?? 'M';
  const mode = chooseMode(text);
  const { bits: content, count } = encodeContent(text, mode);

  let version = Math.max(1, Math.min(40, options.minVersion ?? 1));
  for (; ; version++) {
    if (version > 40) throw new RangeError(`cbQrEncode: el texto no cabe en un QR (nivel ${ec}).`);
    const needed = 4 + countBits(mode, version) + content.bits.length;
    if (count < 2 ** countBits(mode, version) && needed <= dataCodewords(version, ec) * 8) break;
  }

  // Segmento + terminador + relleno hasta la capacidad.
  const buffer = new BitBuffer();
  buffer.push(MODE_INDICATOR[mode], 4);
  buffer.push(count, countBits(mode, version));
  buffer.bits.push(...content.bits);
  const capacity = dataCodewords(version, ec) * 8;
  buffer.push(0, Math.min(4, capacity - buffer.bits.length));
  buffer.push(0, (8 - (buffer.bits.length % 8)) % 8);
  const data: number[] = [];
  for (let i = 0; i < buffer.bits.length; i += 8) data.push(buffer.bits.slice(i, i + 8).reduce((acc, b) => (acc << 1) | b, 0));
  for (let pad = 0xec; data.length < capacity / 8; pad ^= 0xec ^ 0x11) data.push(pad);

  // Bloques con su corrección, intercalados.
  const blocks = EC_BLOCKS[ec][version];
  const ecLength = EC_CODEWORDS_PER_BLOCK[ec][version];
  const totalCodewords = Math.floor(rawDataModules(version) / 8);
  const shortBlocks = blocks - (totalCodewords % blocks);
  const shortLength = Math.floor(totalCodewords / blocks) - ecLength;
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  for (let b = 0, offset = 0; b < blocks; b++) {
    const length = shortLength + (b < shortBlocks ? 0 : 1);
    const block = data.slice(offset, offset + length);
    offset += length;
    dataBlocks.push(block);
    ecBlocks.push(cbQrReedSolomon(block, ecLength));
  }
  const codewords: number[] = [];
  for (let i = 0; i <= shortLength; i++) {
    for (const block of dataBlocks) if (i < block.length) codewords.push(block[i]);
  }
  for (let i = 0; i < ecLength; i++) {
    for (const block of ecBlocks) codewords.push(block[i]);
  }

  // Matriz con la mejor máscara.
  const size = version * 4 + 17;
  let best: { mask: number; dark: boolean[][]; score: number } | null = null;
  for (let mask = 0; mask < 8; mask++) {
    const grid = new Grid(size);
    drawFunctionPatterns(grid, version);
    drawCodewords(grid, codewords);
    applyMask(grid, mask);
    drawFormat(grid, cbQrFormatBits(ec, mask));
    const score = penalty(grid.dark);
    if (!best || score < best.score) best = { mask, dark: grid.dark, score };
  }

  return { version, size, errorCorrection: ec, mask: best!.mask, modules: best!.dark };
}

/** Niveles ordenados de menor a mayor corrección. */
export const CB_QR_ERROR_CORRECTION_LEVELS = EC_ORDER;
