/** Tipo de cambio (secciones de Keep a Changelog + `breaking`). */
export type CbChangeType =
  | 'breaking'
  | 'added'
  | 'changed'
  | 'deprecated'
  | 'removed'
  | 'fixed'
  | 'security';

export interface CbChangelogItem {
  /** Componente o área afectada (texto en negrita en CHANGELOG.md). */
  component: string;
  /** Descripción; lo que va entre comillas invertidas se muestra como código. */
  text: string;
}

export interface CbChangelogSection {
  type: CbChangeType;
  items: CbChangelogItem[];
}

export interface CbChangelogRelease {
  /** Versión semántica; `null` = próxima versión (`[Unreleased]`). */
  version: string | null;
  /** Fecha ISO (`YYYY-MM-DD`) o `null` si no se ha publicado. */
  date: string | null;
  sections: CbChangelogSection[];
}
