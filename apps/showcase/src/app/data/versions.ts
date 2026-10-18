/**
 * Versionado de CaribeNG alineado al major de Angular soportado:
 * el major de la librería = major de Angular (v21 = Angular 21+, v22 = Angular 22…),
 * igual que Angular Material / PrimeNG. Minor = features, patch = correcciones
 * (p. ej. 21.1.2). La doc se despliega por major y este selector cambia entre ellas.
 *
 * Línea de tiempo: v21 es la versión ACTUAL (primer release, Angular 21+).
 * v22 se publicará más adelante (previsto 2027); al hacerlo se añade su entrada
 * aquí, pasa a `latest`/`current` y v21 queda en `maintenance` con su propia URL.
 */
export interface CbDocVersion {
  /** Etiqueta visible del major, p. ej. "v22". */
  label: string;
  /** Major de Angular soportado. */
  angular: string;
  /** URL del sitio de documentación de esta versión (raíz "/" = este sitio). */
  url: string;
  /** Versión que sirve actualmente este sitio. */
  current?: boolean;
  /** Estado en el ciclo de vida: estable, en mantenimiento o próxima. */
  status: 'latest' | 'maintenance' | 'next';
}

/** Versión exacta del paquete @caribeng/ui que documenta este sitio. */
export const CARIBENG_VERSION = '21.0.0';

/**
 * Versiones de documentación disponibles (más reciente primero). Al publicar un
 * nuevo major se añade su entrada con la URL de su despliegue y se marca
 * `current` la que sirve este sitio; los majors anteriores quedan en
 * `maintenance` apuntando a su propio despliegue (p. ej. https://v21.caribeng.dev).
 */
export const DOC_VERSIONS: CbDocVersion[] = [
  { label: 'v21', angular: 'Angular 21+', url: '/', current: true, status: 'latest' },
  // v22 (Angular 22) — previsto 2027. Al publicarlo:
  // { label: 'v22', angular: 'Angular 22+', url: 'https://v22.caribeng.dev', current: true, status: 'latest' },
  // y v21 pasa a: { label: 'v21', angular: 'Angular 21+', url: 'https://v21.caribeng.dev', status: 'maintenance' },
];

/** Entrada marcada como actual (fallback: la primera). */
export const CURRENT_DOC_VERSION: CbDocVersion =
  DOC_VERSIONS.find((v) => v.current) ?? DOC_VERSIONS[0];
