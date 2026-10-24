import { describe, expect, it } from 'vitest';
import {
  hexToRgb,
  inkBounds,
  mergeLineRects,
  moveRect,
  pdfToView,
  rectToView,
  scaleRect,
  simplifyPath,
  toPdfJsAnnotation,
  viewToPdf,
  viewToRect,
  type CbPdfAnnotation,
} from './pdf-annotations';

// Página A4 cuya caja no empieza en 0 (como algunos PDF recortados).
const GEOM = { x0: 20, y0: 30, width: 595, height: 842, userUnit: 1 };

describe('geometría de anotaciones', () => {
  it('pdfToView coincide con la vista de pdf.js en los cuatro giros', () => {
    // Valores de PageViewport.convertToViewportPoint con viewBox [20, 30, 615, 872] y escala 2.
    const view = (rotation: number) => ({ factor: 2, rotation });
    expect(pdfToView(GEOM, view(0), 20, 872)).toEqual([0, 0]);
    expect(pdfToView(GEOM, view(0), 120, 772)).toEqual([200, 200]);
    expect(pdfToView(GEOM, view(90), 20, 872)).toEqual([1684, 0]);
    expect(pdfToView(GEOM, view(180), 20, 872)).toEqual([1190, 1684]);
    expect(pdfToView(GEOM, view(270), 20, 872)).toEqual([0, 1190]);
  });

  it('viewToPdf deshace pdfToView con cualquier giro', () => {
    for (const rotation of [0, 90, 180, 270, -90, 450]) {
      const view = { factor: 1.37, rotation };
      const [px, py] = pdfToView(GEOM, view, 333.3, 444.4);
      const [x, y] = viewToPdf(GEOM, view, px, py);
      expect(x).toBeCloseTo(333.3, 6);
      expect(y).toBeCloseTo(444.4, 6);
    }
  });

  it('rectToView y viewToRect son inversas y normalizan el rectángulo', () => {
    const view = { factor: 1.5, rotation: 90 };
    const box = rectToView(GEOM, view, [100, 200, 300, 260]);
    expect(box.width).toBeCloseTo(90);
    expect(box.height).toBeCloseTo(300);
    expect(viewToRect(GEOM, view, box.left, box.top, box.width, box.height)).toEqual([100, 200, 300, 260]);
  });

  it('moveRect no deja salir el rectángulo de la página', () => {
    expect(moveRect(GEOM, [100, 100, 200, 150], 10, -5)).toEqual([110, 95, 210, 145]);
    expect(moveRect(GEOM, [100, 100, 200, 150], -500, 5000)).toEqual([20, 822, 120, 872]);
  });

  it('scaleRect escala desde la esquina superior izquierda con un ancho mínimo', () => {
    expect(scaleRect([100, 100, 200, 150], 2)).toEqual([100, 50, 300, 150]);
    expect(scaleRect([100, 100, 200, 150], 0.01)).toEqual([100, 138, 124, 150]);
  });

  it('mergeLineRects une las cajas de cada línea y separa las líneas', () => {
    const lines = mergeLineRects([
      { left: 10, top: 10, width: 40, height: 12 },
      { left: 52, top: 10.5, width: 30, height: 11 },
      { left: 10, top: 30, width: 50, height: 12 },
      { left: 90, top: 10, width: 0, height: 12 },
    ]);
    expect(lines).toEqual([
      { left: 10, top: 10, width: 72, height: 12 },
      { left: 10, top: 30, width: 50, height: 12 },
    ]);
  });

  it('simplifyPath quita los puntos alineados y conserva las esquinas', () => {
    expect(simplifyPath([0, 0, 1, 0.01, 2, 0, 3, 0, 3, 3], 0.1)).toEqual([0, 0, 3, 0, 3, 3]);
    expect(simplifyPath([0, 0, 5, 5], 1)).toEqual([0, 0, 5, 5]);
  });

  it('inkBounds incluye medio grosor de margen', () => {
    expect(inkBounds({ paths: [[10, 10, 50, 30]], thickness: 4 })).toEqual([7, 7, 53, 33]);
  });

  it('hexToRgb', () => {
    expect(hexToRgb('#fde047')).toEqual([253, 224, 71]);
    expect(hexToRgb('nope')).toEqual([0, 0, 0]);
  });
});

describe('toPdfJsAnnotation', () => {
  const base = { id: 'a1', page: 2, author: 'Ana', date: '2026-10-23T10:00:00.000Z' };

  it('resaltado: Highlight con un QuadPoints por línea y el comentario como nota emergente', () => {
    const a: CbPdfAnnotation = { ...base, type: 'highlight', rects: [[10, 100, 200, 112], [10, 80, 120, 92]], color: 'yellow', text: 'Cargo', comment: 'Revisar' };
    const out = toPdfJsAnnotation(a, 0)!;
    expect(out).toMatchObject({ annotationType: 9, pageIndex: 1, user: 'Ana', color: [253, 224, 71], rect: [10, 80, 200, 112] });
    expect(out['quadPoints']).toEqual([10, 112, 200, 112, 10, 100, 200, 100, 10, 92, 120, 92, 10, 80, 120, 80]);
    expect(out['outlines']).toEqual([
      [10, 100, 200, 100, 200, 112, 10, 112],
      [10, 80, 120, 80, 120, 92, 10, 92],
    ]);
    expect(out['popup']).toEqual({ contents: 'Revisar', rect: [200, 52, 360, 112] });
    expect((out['date'] as Date).toISOString()).toBe(base.date);
  });

  it('nota: FreeText con el color oscuro y el tamaño de letra', () => {
    const a: CbPdfAnnotation = { ...base, type: 'note', rect: [50, 50, 150, 70], text: 'Hola\nmundo', color: 'red', fontSize: 14 };
    expect(toPdfJsAnnotation(a, 90)).toMatchObject({ annotationType: 3, value: 'Hola\nmundo', fontSize: 14, color: [185, 28, 28], rect: [50, 50, 150, 70], rotation: 90 });
  });

  it('dibujo: Ink con segmentos rectos (NaN×4) y la lista de puntos', () => {
    const a: CbPdfAnnotation = { ...base, type: 'ink', paths: [[0, 0, 10, 10, 20, 0]], color: 'blue', thickness: 2 };
    const out = toPdfJsAnnotation(a, 0)!;
    expect(out).toMatchObject({ annotationType: 15, thickness: 2, rect: [-2, -2, 22, 12] });
    const { lines, points } = out['paths'] as { lines: number[][]; points: number[][] };
    expect(points).toEqual([[0, 0, 10, 10, 20, 0]]);
    expect(lines[0].length).toBe(18);
    expect(lines[0].slice(4, 6)).toEqual([0, 0]);
    expect(lines[0].slice(6, 10).every(Number.isNaN)).toBe(true);
  });

  it('firma: Stamp con la imagen; sin bitmap no se escribe', () => {
    const a: CbPdfAnnotation = { ...base, type: 'signature', rect: [300, 100, 480, 160], image: 'data:image/png;base64,AAAA' };
    expect(toPdfJsAnnotation(a, 0)).toBeNull();
    const bitmap = {} as ImageBitmap;
    expect(toPdfJsAnnotation(a, 0, bitmap)).toMatchObject({ annotationType: 13, bitmap, bitmapId: 'cb_sig_a1', rect: [300, 100, 480, 160] });
  });
});
