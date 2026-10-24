/** Rectángulo en puntos PDF de la página (`[x1, y1, x2, y2]`, con y hacia arriba, sin el giro del visor). */
export type CbPdfRect = readonly [number, number, number, number];

/** Herramienta de anotación activa. */
export type CbPdfTool = 'none' | 'highlight' | 'note' | 'ink' | 'signature';

/** Colores de anotación: el claro se usa para resaltar y el oscuro para notas y dibujos. */
export type CbPdfAnnotationColor = 'yellow' | 'green' | 'blue' | 'red';

export const CB_PDF_COLORS: Readonly<Record<CbPdfAnnotationColor, { light: string; dark: string }>> = {
  yellow: { light: '#fde047', dark: '#a16207' },
  green: { light: '#86efac', dark: '#15803d' },
  blue: { light: '#93c5fd', dark: '#1d4ed8' },
  red: { light: '#fca5a5', dark: '#b91c1c' },
};

interface CbPdfAnnotationBase {
  readonly id: string;
  /** Página, desde 1. */
  readonly page: number;
  /** Autor (campo `T` del PDF). */
  readonly author?: string;
  /** Fecha de creación (ISO 8601). */
  readonly date?: string;
}

/** Texto resaltado, con un comentario opcional (nota emergente en el PDF). */
export interface CbPdfHighlight extends CbPdfAnnotationBase {
  readonly type: 'highlight';
  /** Un rectángulo por línea resaltada. */
  readonly rects: readonly CbPdfRect[];
  readonly color: CbPdfAnnotationColor;
  /** Texto que se resaltó. */
  readonly text: string;
  readonly comment?: string;
}

/** Nota de texto visible sobre la página (`FreeText` en el PDF). */
export interface CbPdfNote extends CbPdfAnnotationBase {
  readonly type: 'note';
  readonly rect: CbPdfRect;
  /** Texto; cada salto de línea es una línea en el PDF. */
  readonly text: string;
  readonly color: CbPdfAnnotationColor;
  /** Tamaño de letra en puntos (12 por defecto). */
  readonly fontSize?: number;
}

/** Dibujo a mano alzada (`Ink` en el PDF). */
export interface CbPdfInk extends CbPdfAnnotationBase {
  readonly type: 'ink';
  /** Trazos, cada uno como puntos PDF seguidos: `[x1, y1, x2, y2, …]`. */
  readonly paths: readonly (readonly number[])[];
  readonly color: CbPdfAnnotationColor;
  /** Grosor en puntos. */
  readonly thickness: number;
}

/** Firma como imagen (`Stamp` en el PDF). */
export interface CbPdfSignature extends CbPdfAnnotationBase {
  readonly type: 'signature';
  readonly rect: CbPdfRect;
  /** Imagen de la firma (data URL PNG, como la da `cb-signature-pad`). */
  readonly image: string;
}

/** Anotación del visor. Las coordenadas son puntos PDF: no cambian con el zoom ni con el giro. */
export type CbPdfAnnotation = CbPdfHighlight | CbPdfNote | CbPdfInk | CbPdfSignature;

/** Geometría de una página: su caja (`view`) en puntos y la unidad de usuario. */
export interface CbPdfPageGeometry {
  readonly x0: number;
  readonly y0: number;
  /** Ancho y alto sin girar, ya multiplicados por `userUnit`. */
  readonly width: number;
  readonly height: number;
  readonly userUnit: number;
}

/** Píxeles por punto y giro total (el de la página más el del visor). */
export interface CbPdfViewTransform {
  readonly factor: number;
  readonly rotation: number;
}

/** Punto PDF → píxeles CSS dentro de la página dibujada. */
export function pdfToView(geom: CbPdfPageGeometry, view: CbPdfViewTransform, x: number, y: number): [number, number] {
  const f = view.factor;
  const u = (x - geom.x0) * geom.userUnit * f;
  const v = (geom.height - (y - geom.y0) * geom.userUnit) * f;
  const w = geom.width * f;
  const h = geom.height * f;
  switch (normalize(view.rotation)) {
    case 90:
      return [h - v, u];
    case 180:
      return [w - u, h - v];
    case 270:
      return [v, w - u];
    default:
      return [u, v];
  }
}

/** Píxeles CSS dentro de la página dibujada → punto PDF. */
export function viewToPdf(geom: CbPdfPageGeometry, view: CbPdfViewTransform, px: number, py: number): [number, number] {
  const f = view.factor;
  const w = geom.width * f;
  const h = geom.height * f;
  let u: number;
  let v: number;
  switch (normalize(view.rotation)) {
    case 90:
      [u, v] = [py, h - px];
      break;
    case 180:
      [u, v] = [w - px, h - py];
      break;
    case 270:
      [u, v] = [w - py, px];
      break;
    default:
      [u, v] = [px, py];
  }
  return [geom.x0 + u / (geom.userUnit * f), geom.y0 + (geom.height - v / f) / geom.userUnit];
}

/** Rectángulo PDF → caja CSS (`left`, `top`, `width`, `height`) en la página dibujada. */
export function rectToView(geom: CbPdfPageGeometry, view: CbPdfViewTransform, rect: CbPdfRect): { left: number; top: number; width: number; height: number } {
  const [ax, ay] = pdfToView(geom, view, rect[0], rect[1]);
  const [bx, by] = pdfToView(geom, view, rect[2], rect[3]);
  return { left: Math.min(ax, bx), top: Math.min(ay, by), width: Math.abs(bx - ax), height: Math.abs(by - ay) };
}

/** Caja CSS en la página dibujada → rectángulo PDF normalizado (x1 < x2, y1 < y2). */
export function viewToRect(geom: CbPdfPageGeometry, view: CbPdfViewTransform, left: number, top: number, width: number, height: number): CbPdfRect {
  const [ax, ay] = viewToPdf(geom, view, left, top);
  const [bx, by] = viewToPdf(geom, view, left + width, top + height);
  return [round(Math.min(ax, bx)), round(Math.min(ay, by)), round(Math.max(ax, bx)), round(Math.max(ay, by))];
}

/** Desplaza un rectángulo `dx`, `dy` puntos sin salirse de la página. */
export function moveRect(geom: CbPdfPageGeometry, rect: CbPdfRect, dx: number, dy: number): CbPdfRect {
  const w = rect[2] - rect[0];
  const h = rect[3] - rect[1];
  const maxX = geom.x0 + geom.width / geom.userUnit - w;
  const maxY = geom.y0 + geom.height / geom.userUnit - h;
  const x = clamp(rect[0] + dx, geom.x0, Math.max(geom.x0, maxX));
  const y = clamp(rect[1] + dy, geom.y0, Math.max(geom.y0, maxY));
  return [round(x), round(y), round(x + w), round(y + h)];
}

/** Escala un rectángulo desde su esquina superior izquierda (en el PDF, x1 e y2 se quedan). */
export function scaleRect(rect: CbPdfRect, factor: number, minWidth = 24): CbPdfRect {
  const w = rect[2] - rect[0];
  const h = rect[3] - rect[1];
  const k = Math.max(factor, minWidth / Math.max(1, w));
  return [rect[0], round(rect[3] - h * k), round(rect[0] + w * k), rect[3]];
}

/**
 * Une los rectángulos de una selección de texto (`getClientRects()`, ya relativos a la página) en
 * uno por línea: los que se solapan en vertical y se tocan en horizontal.
 */
export function mergeLineRects(rects: readonly { left: number; top: number; width: number; height: number }[]): { left: number; top: number; width: number; height: number }[] {
  const sorted = rects.filter((r) => r.width > 0.5 && r.height > 0.5).sort((a, b) => a.top - b.top || a.left - b.left);
  const lines: { left: number; top: number; right: number; bottom: number }[] = [];
  for (const r of sorted) {
    const right = r.left + r.width;
    const bottom = r.top + r.height;
    const line = lines.find((l) => {
      const overlap = Math.min(l.bottom, bottom) - Math.max(l.top, r.top);
      return overlap > Math.min(l.bottom - l.top, r.height) / 2 && r.left <= l.right + r.height && right >= l.left - r.height;
    });
    if (line) {
      line.left = Math.min(line.left, r.left);
      line.top = Math.min(line.top, r.top);
      line.right = Math.max(line.right, right);
      line.bottom = Math.max(line.bottom, bottom);
    } else {
      lines.push({ left: r.left, top: r.top, right, bottom });
    }
  }
  return lines.map((l) => ({ left: l.left, top: l.top, width: l.right - l.left, height: l.bottom - l.top }));
}

/** Rectángulo que contiene a todos. */
export function boundsOf(rects: readonly CbPdfRect[]): CbPdfRect {
  return [
    Math.min(...rects.map((r) => r[0])),
    Math.min(...rects.map((r) => r[1])),
    Math.max(...rects.map((r) => r[2])),
    Math.max(...rects.map((r) => r[3])),
  ];
}

/** Caja de un dibujo, con medio grosor de margen. */
export function inkBounds(ink: Pick<CbPdfInk, 'paths' | 'thickness'>): CbPdfRect {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const path of ink.paths) {
    for (let i = 0; i + 1 < path.length; i += 2) {
      xs.push(path[i]);
      ys.push(path[i + 1]);
    }
  }
  const m = ink.thickness / 2 + 1;
  return [round(Math.min(...xs) - m), round(Math.min(...ys) - m), round(Math.max(...xs) + m), round(Math.max(...ys) + m)];
}

/** Quita puntos casi alineados de un trazo (Ramer–Douglas–Peucker), con tolerancia en las mismas unidades. */
export function simplifyPath(points: readonly number[], tolerance: number): number[] {
  if (points.length <= 4) return [...points];
  const n = points.length / 2;
  const keep = new Uint8Array(n);
  keep[0] = keep[n - 1] = 1;
  const stack: [number, number][] = [[0, n - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const [ax, ay, bx, by] = [points[a * 2], points[a * 2 + 1], points[b * 2], points[b * 2 + 1]];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    let max = 0;
    let at = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((by - ay) * points[i * 2] - (bx - ax) * points[i * 2 + 1] + bx * ay - by * ax) / len;
      if (d > max) [max, at] = [d, i];
    }
    if (at !== -1 && max > tolerance) {
      keep[at] = 1;
      stack.push([a, at], [at, b]);
    }
  }
  const out: number[] = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(points[i * 2], points[i * 2 + 1]);
  return out;
}

/** Prefijo que pdf.js reconoce como anotación nueva al guardar o imprimir. */
export const PDFJS_EDITOR_PREFIX = 'pdfjs_internal_editor_';

/** Tipos de anotación nueva de pdf.js (`AnnotationEditorType`). */
const EDITOR_TYPE = { freeText: 3, highlight: 9, stamp: 13, ink: 15 } as const;

/**
 * La anotación en el formato que pdf.js escribe en el PDF al guardar (`saveDocument`) o imprimir.
 * La firma necesita su imagen como `ImageBitmap` (`bitmap`): pdf.js la transfiere al worker, así
 * que hay que crear una nueva cada vez.
 */
export function toPdfJsAnnotation(annotation: CbPdfAnnotation, pageRotation: number, bitmap?: ImageBitmap): Record<string, unknown> | null {
  const base = {
    pageIndex: annotation.page - 1,
    rotation: normalize(pageRotation),
    user: annotation.author || undefined,
    date: annotation.date ? new Date(annotation.date) : new Date(),
    structTreeParentId: null,
  };
  switch (annotation.type) {
    case 'highlight': {
      if (!annotation.rects.length) return null;
      const rect = boundsOf(annotation.rects);
      return {
        ...base,
        annotationType: EDITOR_TYPE.highlight,
        color: hexToRgb(CB_PDF_COLORS[annotation.color].light),
        opacity: 1,
        rect,
        quadPoints: annotation.rects.flatMap(([x1, y1, x2, y2]) => [x1, y2, x2, y2, x1, y1, x2, y1]),
        outlines: annotation.rects.map(([x1, y1, x2, y2]) => [x1, y1, x2, y1, x2, y2, x1, y2]),
        popup: annotation.comment ? { contents: annotation.comment, rect: [rect[2], rect[3] - 60, rect[2] + 160, rect[3]] } : undefined,
      };
    }
    case 'note':
      return {
        ...base,
        annotationType: EDITOR_TYPE.freeText,
        color: hexToRgb(CB_PDF_COLORS[annotation.color].dark),
        fontSize: annotation.fontSize ?? 12,
        value: annotation.text,
        rect: [...annotation.rect],
      };
    case 'ink': {
      const paths = annotation.paths.filter((p) => p.length >= 2);
      if (!paths.length) return null;
      return {
        ...base,
        annotationType: EDITOR_TYPE.ink,
        color: hexToRgb(CB_PDF_COLORS[annotation.color].dark),
        thickness: annotation.thickness,
        opacity: 1,
        rect: [...inkBounds({ paths, thickness: annotation.thickness })],
        // pdf.js escribe cada trazo como segmentos: NaN×4 indica "línea recta hasta x, y".
        paths: {
          lines: paths.map((p) => {
            const line = [Number.NaN, Number.NaN, Number.NaN, Number.NaN, p[0], p[1]];
            for (let i = 2; i + 1 < p.length; i += 2) line.push(Number.NaN, Number.NaN, Number.NaN, Number.NaN, p[i], p[i + 1]);
            return line;
          }),
          points: paths.map((p) => [...p]),
        },
      };
    }
    case 'signature':
      if (!bitmap) return null;
      return {
        ...base,
        annotationType: EDITOR_TYPE.stamp,
        bitmapId: `cb_sig_${annotation.id}`,
        bitmap,
        isSvg: false,
        rect: [...annotation.rect],
      };
  }
}

/**
 * Recorta el margen transparente de una firma (el área de `cb-signature-pad` suele estar casi
 * vacía) y da su tamaño en píxeles. Sin canvas, la devuelve tal cual.
 */
export async function trimSignature(dataUrl: string, doc: Document): Promise<{ url: string; width: number; height: number }> {
  const img = await loadImage(dataUrl, doc);
  const fallback = { url: dataUrl, width: img?.naturalWidth || 300, height: img?.naturalHeight || 100 };
  if (!img?.naturalWidth) return fallback;
  const canvas = doc.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  let ctx: CanvasRenderingContext2D | null = null;
  try {
    ctx = canvas.getContext('2d', { willReadFrequently: true });
  } catch {
    ctx = null;
  }
  if (!ctx) return fallback;
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let [minX, minY, maxX, maxY] = [width, height, -1, -1];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 16) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return fallback;
  const pad = 4;
  const x = Math.max(0, minX - pad);
  const y = Math.max(0, minY - pad);
  const w = Math.min(width, maxX + pad + 1) - x;
  const h = Math.min(height, maxY + pad + 1) - y;
  const out = doc.createElement('canvas');
  out.width = w;
  out.height = h;
  out.getContext('2d')?.drawImage(canvas, x, y, w, h, 0, 0, w, h);
  return { url: out.toDataURL('image/png'), width: w, height: h };
}

/** La imagen de una firma como `ImageBitmap`, para que pdf.js la escriba en el PDF. */
export async function imageToBitmap(dataUrl: string): Promise<ImageBitmap | undefined> {
  if (typeof createImageBitmap !== 'function') return undefined;
  try {
    const blob = await (await fetch(dataUrl)).blob();
    return await createImageBitmap(blob);
  } catch {
    return undefined;
  }
}

function loadImage(src: string, doc: Document): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = doc.createElement('img');
    const timer = setTimeout(() => resolve(null), 3000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

/** `#rrggbb` → `[r, g, b]` (0–255), como los colores de pdf.js. */
export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
}

function normalize(rotation: number): number {
  return ((Math.round(rotation / 90) * 90) % 360 + 360) % 360;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
