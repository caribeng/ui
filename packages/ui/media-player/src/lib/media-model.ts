/** Fuente del medio (varias para que el navegador elija el formato que soporte). */
export interface CbMediaSource {
  readonly src: string;
  /** Tipo MIME (`video/mp4`, `audio/mpeg`…). */
  readonly type?: string;
}

/** Pista de texto: subtítulos, subtítulos para personas sordas (`captions`) o descripciones. */
export interface CbMediaTrack {
  /** Archivo WebVTT. */
  readonly src: string;
  readonly kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters';
  /** Idioma BCP 47 (`es`, `en`). */
  readonly srclang: string;
  readonly label: string;
  readonly default?: boolean;
}

/** Velocidades por defecto. */
export const CB_MEDIA_RATES: readonly number[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

/** "1:05" o "1:02:05" (con `total` de una hora o más, siempre con horas). */
export function formatTime(seconds: number, total = seconds): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 || total >= 3600 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Tiempo para lectores de pantalla: "1 minuto 5 segundos". */
export function spokenTime(seconds: number, units: { hours: string; minutes: string; seconds: string }): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds / 60) % 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (h) parts.push(`${h} ${units.hours}`);
  if (m) parts.push(`${m} ${units.minutes}`);
  if (s || !parts.length) parts.push(`${s} ${units.seconds}`);
  return parts.join(' ');
}

/** Acción de un atajo de teclado del reproductor. */
export type CbMediaShortcut =
  | { readonly action: 'toggle' | 'mute' | 'fullscreen' | 'captions' }
  | { readonly action: 'seekBy'; readonly seconds: number }
  | { readonly action: 'seekTo'; readonly fraction: number }
  | { readonly action: 'volumeBy'; readonly delta: number };

/**
 * Atajo para una tecla (como en YouTube): Espacio / K reproduce o pausa, ← → 5 s, J / L 10 s,
 * ↑ ↓ volumen, M silencio, F pantalla completa, C subtítulos, Inicio / Fin y 0–9 saltan al
 * 0–90 %. Devuelve null si la tecla no es un atajo o viene con Ctrl, Alt o ⌘.
 */
export function shortcutFor(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'altKey' | 'metaKey'>): CbMediaShortcut | null {
  if (event.ctrlKey || event.altKey || event.metaKey) return null;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  switch (key) {
    case ' ':
    case 'k':
      return { action: 'toggle' };
    case 'ArrowLeft':
      return { action: 'seekBy', seconds: -5 };
    case 'ArrowRight':
      return { action: 'seekBy', seconds: 5 };
    case 'j':
      return { action: 'seekBy', seconds: -10 };
    case 'l':
      return { action: 'seekBy', seconds: 10 };
    case 'ArrowUp':
      return { action: 'volumeBy', delta: 0.1 };
    case 'ArrowDown':
      return { action: 'volumeBy', delta: -0.1 };
    case 'm':
      return { action: 'mute' };
    case 'f':
      return { action: 'fullscreen' };
    case 'c':
      return { action: 'captions' };
    case 'Home':
      return { action: 'seekTo', fraction: 0 };
    case 'End':
      return { action: 'seekTo', fraction: 1 };
    default:
      return /^[0-9]$/.test(key) ? { action: 'seekTo', fraction: Number(key) / 10 } : null;
  }
}
