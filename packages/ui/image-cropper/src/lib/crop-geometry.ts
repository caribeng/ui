/** Recuadro de recorte en fracciones de la imagen (0–1). */
export interface CbCropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Opciones de la imagen recortada. */
export interface CbCropOutput {
  /** `image/png` (por defecto, o el tipo de la original si es JPEG), `image/jpeg` o `image/webp`. */
  readonly type?: 'image/png' | 'image/jpeg' | 'image/webp';
  /** Calidad de JPEG y WebP (0–1). */
  readonly quality?: number;
  /** Tamaño máximo en píxeles: el recorte se reduce (nunca se amplía) para no pasar de él. */
  readonly maxWidth?: number;
  readonly maxHeight?: number;
  /** Recorte circular (PNG con fondo transparente), p. ej. para fotos de perfil. */
  readonly circle?: boolean;
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

/** Tamaño en píxeles del recorte, reducido para no pasar de `maxWidth` × `maxHeight`. */
export function outputSize(rect: CbCropRect, imageWidth: number, imageHeight: number, output: CbCropOutput = {}): { w: number; h: number } {
  const w = Math.max(1, Math.round(rect.w * imageWidth));
  const h = Math.max(1, Math.round(rect.h * imageHeight));
  const scale = Math.min(1, (output.maxWidth ?? Infinity) / w, (output.maxHeight ?? Infinity) / h);
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) };
}

/**
 * Estilo de una vista previa del recorte hecha con CSS (sin canvas): la imagen como fondo,
 * ampliada y desplazada para que solo se vea el recuadro.
 */
export function previewStyle(src: string, rect: CbCropRect): Record<string, string> {
  const pos = (start: number, size: number) => (size >= 1 ? '0%' : `${(start / (1 - size)) * 100}%`);
  return {
    'background-image': `url("${src.replace(/"/g, '%22')}")`,
    'background-size': `${100 / rect.w}% ${100 / rect.h}%`,
    'background-position': `${pos(rect.x, rect.w)} ${pos(rect.y, rect.h)}`,
    'background-repeat': 'no-repeat',
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  if (!/^(data|blob):/i.test(src)) image.crossOrigin = 'anonymous';
  return new Promise((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    image.src = src;
  });
}

/**
 * Recorta los píxeles de la imagen. Las imágenes de otro dominio necesitan que
 * su servidor permita CORS; si no, el navegador bloquea la lectura y se rechaza.
 */
export async function cropImage(src: string, rect: CbCropRect, doc: Document, output: CbCropOutput = {}): Promise<Blob> {
  const image = await loadImage(src);
  const nw = image.naturalWidth;
  const nh = image.naturalHeight;
  const sw = Math.max(1, Math.round(rect.w * nw));
  const sh = Math.max(1, Math.round(rect.h * nh));
  const size = outputSize(rect, nw, nh, output);
  const canvas = doc.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D no disponible');
  if (output.circle) {
    ctx.beginPath();
    ctx.ellipse(size.w / 2, size.h / 2, size.w / 2, size.h / 2, 0, 0, Math.PI * 2);
    ctx.clip();
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, Math.round(rect.x * nw), Math.round(rect.y * nh), sw, sh, 0, 0, size.w, size.h);
  // Un círculo necesita transparencia: siempre PNG.
  const type = output.circle ? 'image/png' : (output.type ?? (/^data:image\/jpe?g|\.jpe?g(\?|$)/i.test(src) ? 'image/jpeg' : 'image/png'));
  // toBlob lanza SecurityError si el canvas quedó "contaminado" (imagen sin CORS).
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Sin datos'))), type, output.quality ?? 0.92),
  );
}

/** Gira la imagen un cuarto de vuelta (`1` a la derecha, `-1` a la izquierda) y la devuelve como data URL PNG. */
export async function rotateImage(src: string, turns: 1 | -1, doc: Document): Promise<string> {
  const image = await loadImage(src);
  const canvas = doc.createElement('canvas');
  canvas.width = image.naturalHeight;
  canvas.height = image.naturalWidth;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D no disponible');
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((turns * Math.PI) / 2);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  return canvas.toDataURL('image/png');
}

/** Lee un archivo como data URL. */
export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
