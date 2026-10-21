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
  /** Valor con el que arranca la demo del playground cuando el default real es vacío. */
  example?: unknown;
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
  /**
   * Hijos que se proyectan en lugar del texto (p. ej. los `<cb-avatar>` de un
   * `<cb-avatar-group>`). Con ellos no hay control de texto.
   */
  children?: DocChild[];
}

/** Hijo proyectado: un componente o un elemento nativo, con texto opcional. */
export interface DocChild {
  /** Clase del componente hijo; sin ella se crea el elemento nativo `selector`. */
  component?: Type<unknown>;
  /** Etiqueta del hijo (ej. "cb-avatar", "label", "span"). */
  selector: string;
  /** Inputs del componente hijo; también se muestran en el código. */
  inputs?: Record<string, string | number | boolean>;
  /** Atributos HTML (ej. `{ for: 'email' }`). */
  attrs?: Record<string, string>;
  /** Texto dentro del hijo. */
  text?: string;
  /**
   * Atributo con el que el padre lo proyecta en un slot concreto
   * (ej. "cb-toolbar-end" para `<ng-content select="[cb-toolbar-end]">`).
   */
  slot?: string;
}

export interface DocApi {
  /** Clase del componente a instanciar en la demo viva. */
  component: Type<unknown>;
  /**
   * Envoltorio para la demo viva cuando el componente no se ve solo (p. ej. un
   * popover necesita un botón que lo abra). Debe aceptar los mismos inputs.
   */
  demo?: Type<unknown>;
  /**
   * Marcado de los hijos que declara `demo` (cuando no se pueden proyectar
   * aparte); solo se usa en el código generado.
   */
  codeContent?: string;
  /** Selector para el código generado (ej. "cb-button"). */
  selector: string;
  /** Propiedades (inputs) del componente. */
  props: DocProp[];
  /** Eventos (outputs) del componente. */
  events?: DocEvent[];
  /** Define el slot de contenido proyectado, si aplica. */
  content?: DocContent;
}
