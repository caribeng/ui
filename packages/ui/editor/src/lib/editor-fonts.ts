import type { CbTranslation } from '@caribeng/ui';

/** Una tipografía del selector: nombre visible y pila CSS que se guarda en el HTML (`''` = predeterminada). */
export interface CbEditorFont {
  name: string;
  value: string;
}

/** Grupo del selector de tipografía (`<optgroup>`). */
export interface CbEditorFontGroup {
  label: string | ((t: CbTranslation) => string);
  fonts: readonly CbEditorFont[];
}

/**
 * Tipografías por defecto, todas libres (Google Fonts). Las "clásicas de Office" son
 * métricamente compatibles con Arial, Times New Roman y Courier New, y Carlito con Calibri,
 * así un documento conserva su maquetación.
 */
export const CB_EDITOR_FONTS: readonly CbEditorFontGroup[] = [
  { label: (t) => t.fontDefault, fonts: [{ name: 'Carlito', value: '' }] },
  {
    label: (t) => t.fontGroupRecommended,
    fonts: [
      { name: 'Carlito', value: 'Carlito, Calibri, sans-serif' },
      { name: 'Source Sans 3', value: "'Source Sans 3', sans-serif" },
      { name: 'Noto Sans', value: "'Noto Sans', sans-serif" },
    ],
  },
  {
    label: (t) => t.fontGroupOffice,
    fonts: [
      { name: 'Arimo', value: 'Arimo, Arial, sans-serif' },
      { name: 'Tinos', value: "Tinos, 'Times New Roman', serif" },
      { name: 'Cousine', value: "Cousine, 'Courier New', monospace" },
    ],
  },
  {
    label: (t) => t.fontGroupSans,
    fonts: [
      { name: 'Google Sans', value: "'Google Sans', sans-serif" },
      { name: 'Inter', value: 'Inter, sans-serif' },
      { name: 'Open Sans', value: "'Open Sans', sans-serif" },
    ],
  },
  {
    label: (t) => t.fontGroupSerif,
    fonts: [
      { name: 'Source Serif 4', value: "'Source Serif 4', serif" },
      { name: 'Merriweather', value: 'Merriweather, serif' },
      { name: 'Lora', value: 'Lora, serif' },
    ],
  },
  {
    label: (t) => t.fontGroupMono,
    fonts: [
      { name: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
      { name: 'Roboto Mono', value: "'Roboto Mono', monospace" },
      { name: 'Source Code Pro', value: "'Source Code Pro', monospace" },
    ],
  },
  { label: (t) => t.fontGroupAccessible, fonts: [{ name: 'Atkinson Hyperlegible', value: "'Atkinson Hyperlegible', sans-serif" }] },
  { label: (t) => t.fontGroupFun, fonts: [{ name: 'Comic Neue', value: "'Comic Neue', 'Comic Sans MS', cursive" }] },
];

/** Hoja de Google Fonts con las tipografías por defecto (regular, negrita y sus cursivas). */
export const CB_EDITOR_FONTS_HREF =
  'https://fonts.googleapis.com/css2?' +
  [
    'Carlito', 'Source Sans 3', 'Noto Sans', 'Arimo', 'Tinos', 'Cousine', 'Google Sans', 'Inter', 'Open Sans',
    'Source Serif 4', 'Merriweather', 'Lora', 'JetBrains Mono', 'Roboto Mono', 'Source Code Pro',
    'Atkinson Hyperlegible', 'Comic Neue',
  ]
    .map((name) => `family=${name.replace(/ /g, '+')}:ital,wght@0,400;0,700;1,400;1,700`)
    .join('&') +
  '&display=swap';

/** Pilas CSS de todas las tipografías de unos grupos (sin la predeterminada). */
export function fontStacks(groups: readonly CbEditorFontGroup[]): string[] {
  return groups.flatMap((g) => g.fonts.map((f) => f.value)).filter(Boolean);
}

/** Primer nombre de una pila CSS, sin comillas y en minúsculas (`"'Open Sans', sans-serif"` → `open sans`). */
export function firstFamily(value: string): string {
  return (value.split(',')[0] ?? '').trim().replace(/^["']|["']$/g, '').trim().toLowerCase();
}

/** La pila conocida cuyo primer nombre coincide con el de `value`, o `null`. */
export function matchFont(value: string | null | undefined, stacks: readonly string[]): string | null {
  if (!value) return null;
  const name = firstFamily(value);
  return (name && stacks.find((s) => firstFamily(s) === name)) || null;
}
