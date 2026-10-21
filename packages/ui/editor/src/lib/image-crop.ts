/** Recuadro de recorte en fracciones de la imagen (0–1). */
export interface CbCropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Tamaño mínimo del recuadro (fracción del lado). */
const MIN = 0.05;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Mantiene el recuadro dentro de la imagen y con un tamaño mínimo. */
export function clampRect(rect: CbCropRect): CbCropRect {
  const w = clamp(rect.w, MIN, 1);
  const h = clamp(rect.h, MIN, 1);
  return { x: clamp(rect.x, 0, 1 - w), y: clamp(rect.y, 0, 1 - h), w, h };
}

/**
 * Ajusta el recuadro a una proporción (ancho / alto en píxeles), lo más grande
 * posible dentro del actual y centrado en él. `ratio` null = libre.
 */
export function fitRatio(rect: CbCropRect, ratio: number | null, imageWidth: number, imageHeight: number): CbCropRect {
  if (!ratio || !imageWidth || !imageHeight) return clampRect(rect);
  // Proporción expresada en fracciones de la imagen.
  const r = ratio * (imageHeight / imageWidth);
  let w = rect.w;
  let h = w / r;
  if (h > rect.h) {
    h = rect.h;
    w = h * r;
  }
  if (w > 1) {
    w = 1;
    h = w / r;
  }
  if (h > 1) {
    h = 1;
    w = h * r;
  }
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  return clampRect({ x: cx - w / 2, y: cy - h / 2, w, h });
}

/** Recuadro inicial: el mayor posible con la proporción, centrado. */
export function initialRect(ratio: number | null, imageWidth: number, imageHeight: number): CbCropRect {
  return fitRatio({ x: 0, y: 0, w: 1, h: 1 }, ratio, imageWidth, imageHeight);
}

/**
 * Redimensiona arrastrando una esquina (`nw`, `ne`, `sw`, `se`) un desplazamiento
 * (dx, dy) en fracciones; con proporción, el alto sigue al ancho.
 */
export function resizeRect(
  rect: CbCropRect,
  corner: 'nw' | 'ne' | 'sw' | 'se',
  dx: number,
  dy: number,
  ratio: number | null,
  imageWidth: number,
  imageHeight: number,
): CbCropRect {
  let { x, y, w, h } = rect;
  const right = x + w;
  const bottom = y + h;
  if (corner.includes('w')) x = clamp(x + dx, 0, right - MIN);
  const newRight = corner.includes('e') ? clamp(right + dx, x + MIN, 1) : right;
  if (corner.includes('n')) y = clamp(y + dy, 0, bottom - MIN);
  const newBottom = corner.includes('s') ? clamp(bottom + dy, y + MIN, 1) : bottom;
  w = newRight - x;
  h = newBottom - y;
  if (ratio && imageWidth && imageHeight) {
    const r = ratio * (imageHeight / imageWidth);
    h = w / r;
    if (corner.includes('n')) y = bottom - h;
    if (y < 0 || y + h > 1) {
      // No cabe: se limita por el alto.
      h = corner.includes('n') ? bottom : 1 - y;
      w = h * r;
      if (corner.includes('w')) x = right - w;
      if (corner.includes('n')) y = bottom - h;
    }
  }
  return clampRect({ x, y, w, h });
}

/**
 * Recorta los píxeles de la imagen. Las imágenes de otro dominio necesitan que
 * su servidor permita CORS; si no, el navegador bloquea la lectura y se rechaza.
 */
export async function cropImage(src: string, rect: CbCropRect, doc: Document): Promise<Blob> {
  const image = new Image();
  if (!/^(data|blob):/i.test(src)) image.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    image.src = src;
  });
  const sw = Math.max(1, Math.round(rect.w * image.naturalWidth));
  const sh = Math.max(1, Math.round(rect.h * image.naturalHeight));
  const canvas = doc.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D no disponible');
  ctx.drawImage(image, Math.round(rect.x * image.naturalWidth), Math.round(rect.y * image.naturalHeight), sw, sh, 0, 0, sw, sh);
  const type = /^data:image\/jpe?g|\.jpe?g(\?|$)/i.test(src) ? 'image/jpeg' : 'image/png';
  // toBlob lanza SecurityError si el canvas quedó "contaminado" (imagen sin CORS).
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Sin datos'))), type, 0.92));
}
