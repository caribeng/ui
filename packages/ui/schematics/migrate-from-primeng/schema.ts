/** Opciones de `ng generate @caribeng/ui:migrate-from-primeng` (ver `schema.json`). */
export interface Schema {
  /** Carpeta a migrar; por defecto, todo el workspace. */
  path?: string;
  /** Quitar los paquetes de PrimeNG cuando ya no queden referencias. */
  removePrimeng?: boolean;
  /** Escribir `caribeng-migration-report.md`. */
  report?: boolean;
  /** No instalar dependencias al terminar. */
  skipInstall?: boolean;
  /** Saltar las comprobaciones previas. */
  force?: boolean;
}
