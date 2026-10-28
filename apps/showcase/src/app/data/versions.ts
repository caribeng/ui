/**
 * Versionado de CaribeNG alineado al major de Angular soportado:
 * el major de la librería = major de Angular (v22 = Angular 22, v21 = Angular 21…),
 * igual que Angular Material / PrimeNG / NG-ZORRO. Minor = features,
 * patch = correcciones (p. ej. 22.1.2). La doc se despliega por major y este
 * selector cambia entre ellas.
 *
 * Modelo de líneas (como las librerías grandes):
 * - Una sola línea ACTIVA, pegada al Angular más reciente (hoy v22 = Angular 22):
 *   recibe todas las features. Es `latest`/`current`.
 * - Los majors anteriores quedan en MANTENIMIENTO (`maintenance`): solo reciben
 *   bugfixes/seguridad (cherry-pick desde la activa), sin features nuevas.
 *   Hoy: v21 (Angular 21) para quien aún no ha migrado.
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
export const CARIBENG_VERSION = '22.6.0';

/**
 * Versiones de documentación disponibles (más reciente primero). La línea activa
 * se marca `current`/`latest` (sirve este sitio); los majors anteriores quedan en
 * `maintenance` apuntando a su propio despliegue (p. ej. https://v21.caribeng.dev).
 */
export const DOC_VERSIONS: CbDocVersion[] = [
  { label: 'v22', angular: 'Angular 22+', url: '/', current: true, status: 'latest' },
  { label: 'v21', angular: 'Angular 21', url: 'https://v21.caribeng.dev', status: 'maintenance' },
];

/** Entrada marcada como actual (fallback: la primera). */
export const CURRENT_DOC_VERSION: CbDocVersion =
  DOC_VERSIONS.find((v) => v.current) ?? DOC_VERSIONS[0];
