/** Opciones de `ng add @caribeng/ui` (ver `schema.json`). */
export interface Schema {
  /** Proyecto donde configurar CaribeNG; por defecto, la única aplicación del workspace. */
  project?: string;
  /** Idioma de los textos de interfaz. */
  locale: 'es' | 'en';
  /** Tema inicial. */
  theme: 'light' | 'dark' | 'system';
  /** Paleta primaria. */
  preset: 'emerald' | 'ocean' | 'coral' | 'amber' | 'violet' | 'rose';
  /** Añadir la hoja de estilos a angular.json. */
  styles: boolean;
}
