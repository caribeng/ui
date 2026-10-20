import { Type } from '@angular/core';

/** Tipo de control que se renderiza para una propiedad en el playground. */
export type DocPropKind = 'enum' | 'boolean' | 'string' | 'number';

export interface DocProp {
  /** Nombre del input tal cual en el componente. */
  name: string;
  /** Clase de control a renderizar. */
  kind: DocPropKind;
  /** Tipo mostrado en la tabla (ej. "'solid' | 'outlined' | 'text'"). */
  type: string;
  /** Valor por defecto del input. */
  default?: unknown;
  /** Descripción en español (se traduce vía i18n.auto). */
  description: string;
  /** Opciones para `kind: 'enum'`. */
  options?: readonly string[];
  /** Si es false, aparece en la tabla pero no genera control interactivo. */
  control?: boolean;
  /**
   * Clave de `CbTranslation` cuando el valor por defecto sale del idioma activo
   * (p. ej. `select` para el placeholder de Select). La tabla muestra ese texto.
   */
  localeKey?: string;
}

export interface DocEvent {
  /** Nombre del output. */
  name: string;
  /** Tipo del payload (ej. "boolean", "MouseEvent"). */
  type: string;
  /** Descripción en español. */
  description: string;
}

export interface DocContent {
  /** Texto proyectado inicial (para componentes con <ng-content>). */
  default: string;
}

export interface DocApi {
  /** Clase del componente a instanciar en la demo viva. */
  component: Type<unknown>;
  /** Selector para el código generado (ej. "cb-button"). */
  selector: string;
  /** Propiedades (inputs) del componente. */
  props: DocProp[];
  /** Eventos (outputs) del componente. */
  events?: DocEvent[];
  /** Define el slot de contenido proyectado, si aplica. */
  content?: DocContent;
}
