/** Punto de un trazo, en unidades del `viewBox` (`t` en ms, `p` presión 0–1). */
export interface CbSignaturePoint {
  readonly x: number;
  readonly y: number;
  readonly t: number;
  readonly p: number;
}

export type CbSignatureStroke = readonly CbSignaturePoint[];

/** Firma serializable: trazos dibujados o nombre escrito, con su lienzo y su tinta. */
export interface CbSignatureData {
  readonly width: number;
  readonly height: number;
  readonly strokes: readonly CbSignatureStroke[];
  /** Nombre escrito (modo `type`); si hay texto, se pinta en lugar de los trazos. */
  readonly text?: string;
  readonly color: string;
}

/** Formato de `value`. */
export type CbSignatureFormat = 'png' | 'jpeg' | 'svg';

/** Cómo se firma: a mano o escribiendo el nombre. */
export type CbSignatureMode = 'draw' | 'type';

/** Segmento listo para pintar: un trozo de curva con su grosor. */
export interface CbSignatureSegment {
  readonly d: string;
  readonly width: number;
}

/** Tipografías manuscritas del sistema (sin descargar fuentes) para el modo escrito. */
export const CB_SIGNATURE_FONT = "'Segoe Script', 'Bradley Hand', 'Brush Script MT', 'Snell Roundhand', 'URW Chancery L', cursive";

const r = (n: number) => Math.round(n * 100) / 100;

/**
 * Convierte un trazo en segmentos de curva (cuadráticas por los puntos medios) con grosor
 * variable: más fino cuanto más rápido se mueve el trazo y más grueso con más presión.
 * Un toque sin movimiento es un punto.
 */
export function strokeSegments(stroke: CbSignatureStroke, minWidth: number, maxWidth: number): CbSignatureSegment[] {
  if (!stroke.length) return [];
  const widthAt = (speed: number, pressure: number) => {
    const bySpeed = maxWidth - (maxWidth - minWidth) * Math.min(1, speed / 2.5);
    // Ratón y dedo informan 0.5 (o 0): no alteran el grosor.
    const byPressure = pressure > 0 && pressure !== 0.5 ? 0.6 + pressure * 0.8 : 1;
    return Math.max(minWidth * 0.5, bySpeed * byPressure);
  };
  if (stroke.length === 1) {
    const p = stroke[0];
    return [{ d: `M${r(p.x)} ${r(p.y)}l0 0.01`, width: r(maxWidth * 1.1) }];
  }
  const segments: CbSignatureSegment[] = [];
  let width = widthAt(0, stroke[0].p);
  const mid = (a: CbSignaturePoint, b: CbSignaturePoint) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  for (let i = 1; i < stroke.length; i++) {
    const a = stroke[i - 1];
    const b = stroke[i];
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const speed = dist / Math.max(1, b.t - a.t);
    // Suavizado del grosor para que no dé saltos entre segmentos.
    width = width * 0.65 + widthAt(speed, b.p) * 0.35;
    const from = i === 1 ? a : mid(stroke[i - 2], a);
    const to = i === stroke.length - 1 ? b : mid(a, b);
    const d = i === 1 && stroke.length > 2
      ? `M${r(from.x)} ${r(from.y)}L${r(to.x)} ${r(to.y)}`
      : `M${r(from.x)} ${r(from.y)}Q${r(a.x)} ${r(a.y)} ${r(to.x)} ${r(to.y)}`;
    segments.push({ d, width: r(width) });
  }
  return segments;
}

/** Tamaño de letra estimado del nombre escrito (el componente lo ajusta midiendo el texto pintado). */
export function typedFontSize(text: string, width: number, height: number): number {
  const chars = Math.max(1, text.trim().length);
  return Math.round(Math.min(height * 0.42, (width * 0.85) / (chars * 0.55)));
}

function escapeXml(text: string): string {
  return text.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);
}

/** ¿Hay algo firmado? */
export function isSignatureEmpty(data: CbSignatureData): boolean {
  return data.text !== undefined ? !data.text.trim() : !data.strokes.length;
}

/**
 * La firma como documento SVG independiente (sin dependencias de la página). `background`
 * vacío o `transparent` lo deja sin fondo; `image` es una firma previa que va debajo.
 */
export function signatureToSvg(
  data: CbSignatureData,
  options: { minWidth: number; maxWidth: number; background?: string; font?: string; fontSize?: number; image?: string },
): string {
  const { width: w, height: h } = data;
  const parts: string[] = [];
  if (options.background && options.background !== 'transparent') {
    parts.push(`<rect width="${w}" height="${h}" fill="${escapeXml(options.background)}"/>`);
  }
  if (options.image) parts.push(`<image href="${escapeXml(options.image)}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`);
  if (data.text !== undefined) {
    if (data.text.trim()) {
      const size = options.fontSize ?? typedFontSize(data.text, w, h);
      parts.push(
        `<text x="${w / 2}" y="${r(h * 0.62)}" text-anchor="middle" font-family="${escapeXml(options.font ?? CB_SIGNATURE_FONT)}" font-size="${size}" fill="${escapeXml(data.color)}">${escapeXml(data.text.trim())}</text>`,
      );
    }
  } else {
    const paths = data.strokes
      .flatMap((s) => strokeSegments(s, options.minWidth, options.maxWidth))
      .map((seg) => `<path d="${seg.d}" stroke-width="${seg.width}"/>`);
    if (paths.length) {
      parts.push(`<g fill="none" stroke="${escapeXml(data.color)}" stroke-linecap="round" stroke-linejoin="round">${paths.join('')}</g>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${parts.join('')}</svg>`;
}

/** Data URL de un SVG. */
export function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Pinta el SVG en un canvas y lo devuelve como PNG o JPEG (a `scale` × el tamaño, para que no pixele). */
export async function rasterize(svg: string, width: number, height: number, type: 'png' | 'jpeg', scale = 2): Promise<string> {
  const img = new Image();
  img.src = svgDataUrl(svg);
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d no disponible');
  if (type === 'jpeg') {
    // JPEG no tiene transparencia: fondo blanco si la firma no trae uno.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(`image/${type}`, 0.92);
}
