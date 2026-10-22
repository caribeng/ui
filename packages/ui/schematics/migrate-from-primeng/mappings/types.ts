/**
 * Tipos de los mapeos PrimeNG → CaribeNG.
 *
 * Cada componente se describe con datos (qué módulos/símbolos importa PrimeNG,
 * qué selector usa y cómo se traduce cada input/output). El motor de
 * plantillas (`../template.ts`) y el de TypeScript (`../typescript.ts`) solo
 * aplican estos datos: añadir un componente no exige tocar los motores.
 */

/** Un atributo del elemento PrimeNG, ya clasificado. */
export interface Binding {
  /** `static`: `label="x"` · `property`: `[label]="x"` · `twoWay`: `[(visible)]="x"` · `event`: `(onClick)="x()"`. */
  readonly kind: 'static' | 'property' | 'twoWay' | 'event';
  /** Nombre del input/output, sin `[]`, `()` ni prefijos `bind-`/`on-`. */
  readonly name: string;
  /** Valor literal (`static`) o expresión (resto). */
  readonly value: string;
  /** Atributo sin valor (`<p-button outlined>`). */
  readonly bare: boolean;
  /** Texto original del atributo, tal cual estaba en la plantilla. */
  readonly source: string;
}

/** Estado del elemento destino mientras se aplican las reglas. */
export interface ElementRewrite {
  /** Tag CaribeNG de destino. */
  readonly tag: string;
  /** Atributos del destino (texto final, en orden). */
  readonly attrs: string[];
  /** Contenido a insertar al principio del elemento (antes de sus hijos). */
  readonly before: string[];
  /** Contenido a insertar al final del elemento (después de sus hijos). */
  readonly after: string[];
  /** Avisos que se escriben como `<!-- TODO(caribeng): … -->` encima del elemento. */
  readonly todos: string[];
  /** Iconos de CaribeNG usados por el elemento (para registrarlos). */
  readonly icons: Set<string>;
  /** Todos los bindings del elemento original (para reglas que miran a otros atributos). */
  readonly bindings: readonly Binding[];
  /** Busca un binding del elemento original por nombre (input u output). */
  find(name: string): Binding | undefined;
}

/** Regla de un input u output: escribe en `el` lo que corresponda a `binding`. */
export type AttrRule = (binding: Binding, el: ElementRewrite) => void;

/** Hijo directo del elemento (p. ej. `<ng-template #footer>` en un diálogo). */
export interface ChildElement {
  readonly name: string;
  readonly bindings: readonly Binding[];
  /** Nombres de las referencias locales (`#footer` → `footer`). */
  readonly references: readonly string[];
}

/** Cómo reescribir un hijo directo: nuevo tag/atributos, o solo un aviso. */
export type ChildRewrite = { readonly tag: string; readonly attrs: readonly string[] } | { readonly todo: string };

/** Traducción de un selector PrimeNG a un componente CaribeNG. */
export interface ElementMapping {
  /** Tag PrimeNG (`p-button`). */
  readonly tag?: string;
  /** Directiva de atributo PrimeNG (`pButton`). */
  readonly attr?: string;
  /** Tags donde la directiva se puede convertir (`button`). En otros tags se deja un aviso. */
  readonly on?: readonly string[];
  /** Sugerencia del aviso cuando la directiva está en otro tag (`<a pButton>`). */
  readonly otherTags?: string;
  /** Tag CaribeNG de destino (`cb-button`). */
  readonly to: string;
  /** El destino no admite contenido: se escribe auto-cerrado (`<cb-input />`). */
  readonly selfClosing?: boolean;
  /**
   * Reglas por input (`label`) y por output (`(onClick)`). Los atributos sin
   * regla se copian tal cual (`class`, `id`, `formControlName`, `(click)`…).
   */
  readonly rules: Readonly<Record<string, AttrRule>>;
  /**
   * Inputs/outputs con el mismo nombre y significado en las dos librerías. No
   * cambian nada en la migración (se copian como cualquier atributo sin regla),
   * pero un test comprueba que siguen existiendo en el componente CaribeNG.
   */
  readonly same?: readonly string[];
  /** Se ejecuta tras las reglas; para traducciones que combinan varios atributos. */
  readonly finalize?: (el: ElementRewrite) => void;
  /** Reescritura de hijos directos; `null` los deja como están. */
  readonly child?: (child: ChildElement) => ChildRewrite | null;
}

/** Mapeo completo de un componente. */
export interface ComponentMapping {
  /** Nombre corto (para informes y tests). */
  readonly name: string;
  /** Entry point CaribeNG del que se importan los símbolos. */
  readonly entry: string;
  /** Módulo PrimeNG → (símbolo PrimeNG → símbolo CaribeNG). */
  readonly modules: Readonly<Record<string, Readonly<Record<string, string>>>>;
  /** Selectores que se traducen en las plantillas. */
  readonly elements: readonly ElementMapping[];
}
