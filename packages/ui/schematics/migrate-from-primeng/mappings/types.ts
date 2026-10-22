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
  /**
   * La traducción cambia la estructura y no se puede hacer elemento a elemento
   * (p. ej. radios sueltos → `<cb-radio-group>`): el elemento no se toca y se
   * deja este aviso. Sus módulos no se renombran, para que siga compilando.
   */
  readonly manual?: string;
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
  /**
   * Para componentes cuya estructura cambia (p. ej. `p-tabs` con `p-tablist` y
   * `p-tabpanels` → `cb-tabs` con un `cb-tab` por panel). Recibe el árbol del
   * elemento y lo edita con `r`. Devuelve `null` si lo hizo, o el motivo por el
   * que no se puede (se deja el elemento como está con ese aviso).
   */
  readonly restructure?: (node: TemplateNode, r: Restructure) => string | null;
  /** Símbolo a importar para `to`, si no es el del componente (`cb-accordion-panel` → `CbAccordionPanel`). */
  readonly symbol?: string;
}

/** Nodo de una plantilla, para `restructure`. */
export interface TemplateNode {
  readonly kind: 'element' | 'text' | 'block' | 'other';
  /** Tag (solo elementos). */
  readonly name: string;
  readonly bindings: readonly Binding[];
  readonly children: readonly TemplateNode[];
  /** Texto fuente del contenido (entre las etiquetas, o el texto del nodo). */
  readonly inner: string;
}

/** Ediciones que puede hacer `restructure`. */
export interface Restructure {
  /** Traduce el elemento con un mapeo normal (tag, atributos y reglas), conservando su contenido. */
  convert(node: TemplateNode, mapping: ElementMapping): void;
  /** Elimina el nodo entero (sus líneas si está solo en ellas); su contenido no se migra. */
  remove(node: TemplateNode): void;
  /** Quita las etiquetas del elemento y deja su contenido. */
  unwrap(node: TemplateNode): void;
}

/**
 * Directiva de atributo que se traduce sin cambiar el elemento que la lleva
 * (`<span pTooltip="x">` → `<span cbTooltip="x">`). Se aplica en cualquier
 * tag, también sobre elementos que migra otro mapeo (`<p-button pTooltip>`).
 */
export interface DirectiveMapping {
  /** Atributo PrimeNG (`pTooltip`). */
  readonly attr: string;
  /** Atributo CaribeNG que lo sustituye (`cbTooltip`). */
  readonly to: string;
  /** Reglas de los inputs/outputs asociados (`tooltipPosition`…). */
  readonly rules: Readonly<Record<string, AttrRule>>;
  /** Inputs con el mismo nombre en las dos librerías (se comprueban en un test). */
  readonly same?: readonly string[];
}

/** Ediciones de TypeScript que un mapeo hace sobre el uso de sus servicios. */
export interface SourceEdit {
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

/** Lo que una reescritura de TypeScript sabe del archivo y puede pedir. */
export interface SourceContext {
  /** Símbolos PrimeNG importados en el archivo → nombre local. */
  readonly locals: ReadonlyMap<string, string>;
  /** Plantillas de los componentes del archivo (en línea y `templateUrl`), antes de migrar. */
  readonly templates: readonly string[];
  /** Iconos de CaribeNG que usa el código (se registran si no son del set núcleo). */
  readonly icons: Set<string>;
  /** Importa un símbolo CaribeNG en el archivo (si no estaba). */
  addImport(name: string, entry: string): void;
  /** Marca un símbolo PrimeNG como ya traducido: se quita de su import. */
  consume(symbol: string): void;
}

/**
 * Reescribe usos de PrimeNG en el código de un archivo que dependen del
 * contexto (llamadas a `MessageService.add`, arrays de `MenuItem`…).
 */
export type SourceRewriter = (sf: import('typescript').SourceFile, context: SourceContext, edits: SourceEdit[]) => void;

/** Mapeo completo de un componente. */
export interface ComponentMapping {
  /** Nombre corto (para informes y tests). */
  readonly name: string;
  /** Entry point CaribeNG del que se importan los símbolos. */
  readonly entry: string;
  /** Símbolo que importa un componente cuando su plantilla usa el tag o la directiva CaribeNG. */
  readonly symbol: string;
  /** Otros tags CaribeNG que genera el mapeo (p. ej. desde `restructure`) → símbolo a importar. */
  readonly tags?: Readonly<Record<string, string>>;
  /**
   * Módulo PrimeNG → (símbolo PrimeNG → símbolo CaribeNG). El símbolo se
   * importa de `entry`, salvo que indique el suyo (`{ name, entry }`), p. ej.
   * un servicio del entry point primario `@caribeng/ui`.
   */
  readonly modules: Readonly<Record<string, Readonly<Record<string, string | { readonly name: string; readonly entry: string }>>>>;
  /** Selectores que se traducen en las plantillas. */
  readonly elements: readonly ElementMapping[];
  /** Directivas de atributo que se traducen sin cambiar el elemento. */
  readonly directives?: readonly DirectiveMapping[];
  /**
   * Servicios CaribeNG `providedIn: 'root'`: se quitan de los `providers` de
   * componentes y módulos (PrimeNG obligaba a proveerlos; aquí una instancia
   * local dejaría de compartir estado con la del resto de la app).
   */
  readonly rootServices?: readonly string[];
  /** Reescritura del uso de sus servicios en TypeScript. */
  readonly rewriteSource?: SourceRewriter;
}
