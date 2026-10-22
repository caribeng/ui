import { describe, expect, it } from 'vitest';
import { cbQrEncode, cbQrFormatBits, cbQrReedSolomon } from './qr-encoder';

/** Módulos de un patrón de posición 7×7 (anillo oscuro, claro y centro 3×3). */
function isFinder(modules: readonly (readonly boolean[])[], x0: number, y0: number): boolean {
  for (let dy = 0; dy < 7; dy++) {
    for (let dx = 0; dx < 7; dx++) {
      const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
      if (modules[y0 + dy][x0 + dx] !== (ring !== 2)) return false;
    }
  }
  return true;
}

describe('cbQrEncode', () => {
  it('calcula la corrección Reed-Solomon del ejemplo de referencia "HELLO WORLD" 1-M', () => {
    const data = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17];
    expect(cbQrReedSolomon(data, 10)).toEqual([196, 35, 39, 119, 235, 215, 231, 226, 93, 23]);
  });

  it('genera los bits de formato del estándar', () => {
    // Nivel M + máscara 0: datos 00000 → solo queda la máscara XOR 101010000010010.
    expect(cbQrFormatBits('M', 0)).toBe(0b101010000010010);
    // Nivel L + máscara 4 (valor de la tabla del estándar).
    expect(cbQrFormatBits('L', 4)).toBe(0b110011000101111);
  });

  it('elige la versión más pequeña y coloca los patrones de posición y el módulo oscuro', () => {
    const qr = cbQrEncode('HELLO WORLD', { errorCorrection: 'M' });
    expect(qr.version).toBe(1);
    expect(qr.size).toBe(21);
    expect(qr.modules).toHaveLength(21);
    expect(isFinder(qr.modules, 0, 0)).toBe(true);
    expect(isFinder(qr.modules, 14, 0)).toBe(true);
    expect(isFinder(qr.modules, 0, 14)).toBe(true);
    expect(qr.modules[13][8]).toBe(true);
  });

  it('crece de versión con más datos o más corrección y respeta la capacidad del estándar', () => {
    // Capacidad en modo byte de la versión 1: L 17, M 14, Q 11, H 7.
    expect(cbQrEncode('a'.repeat(17), { errorCorrection: 'L' }).version).toBe(1);
    expect(cbQrEncode('a'.repeat(18), { errorCorrection: 'L' }).version).toBe(2);
    expect(cbQrEncode('a'.repeat(7), { errorCorrection: 'H' }).version).toBe(1);
    expect(cbQrEncode('a'.repeat(8), { errorCorrection: 'H' }).version).toBe(2);
    // Versión 21, modo byte: L 929 caracteres.
    expect(cbQrEncode('a'.repeat(929), { errorCorrection: 'L' }).version).toBe(21);
    expect(cbQrEncode('a'.repeat(930), { errorCorrection: 'L' }).version).toBe(22);
  });

  it('usa el modo numérico y el alfanumérico cuando caben (más capacidad por versión)', () => {
    // Versión 1-L: 41 dígitos o 25 alfanuméricos.
    expect(cbQrEncode('1'.repeat(41), { errorCorrection: 'L' }).version).toBe(1);
    expect(cbQrEncode('A'.repeat(25), { errorCorrection: 'L' }).version).toBe(1);
    expect(cbQrEncode('a'.repeat(25), { errorCorrection: 'L' }).version).toBe(2);
  });

  it('codifica UTF-8 y añade la información de versión desde la 7', () => {
    const qr = cbQrEncode('Pago a José · ✓ '.repeat(10), { errorCorrection: 'M' });
    expect(qr.version).toBeGreaterThanOrEqual(7);
    expect(qr.size).toBe(qr.version * 4 + 17);
    expect(qr.mask).toBeGreaterThanOrEqual(0);
    expect(qr.mask).toBeLessThan(8);
  });

  it('respeta minVersion y lanza RangeError si el texto no cabe', () => {
    expect(cbQrEncode('hola', { minVersion: 5 }).version).toBe(5);
    expect(() => cbQrEncode('x'.repeat(3000), { errorCorrection: 'L' })).toThrow(RangeError);
  });
});
