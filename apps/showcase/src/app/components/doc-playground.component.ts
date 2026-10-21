import { NgComponentOutlet } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EnvironmentInjector,
  afterNextRender,
  afterRenderEffect,
  computed,
  createComponent,
  inject,
  input,
  linkedSignal,
  reflectComponentType,
  untracked,
  viewChild,
  type ComponentRef,
  type OutputRefSubscription,
  type Type,
} from '@angular/core';
import { CodeBlockComponent } from '../shared/code-block.component';
import { I18nService } from '../services/i18n.service';
import { TocService } from '../services/toc.service';
import { injectCbTranslation } from '@caribeng/ui';
import type { DocApi, DocChild, DocProp } from './doc-api.model';

/**
 * Playground interactivo y tabla de API completa para un componente.
 *
 * Renderiza una instancia viva del componente (vía NgComponentOutlet), un panel
 * de controles generados a partir de los metadatos (select para enums, switch
 * para booleanos, input para string/number), el código correspondiente y las
 * tablas completas de Propiedades y Eventos.
 */
@Component({
  selector: 'doc-playground',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet, CodeBlockComponent],
  template: `
    <section id="playground" class="pg-section">
      <h2 class="pg-section__title"><a href="#playground">Playground</a></h2>
      <p class="pg-section__desc">
        {{ i18n.t('Ajusta las propiedades y observa el componente en vivo.', 'Tweak the properties and see the component live.') }}
      </p>
      <div class="pg">
        <div class="pg__stage">
          <!-- Demo viva -->
          <div class="pg__preview">
            @if (openable() && !model()['visible']) {
              <button type="button" class="pg__open" (click)="set('visible', true)">
                {{ i18n.t('Abrir', 'Open') }} {{ api().selector }}
              </button>
            }
            <ng-container
              [ngComponentOutlet]="api().demo ?? api().component"
              [ngComponentOutletInputs]="inputs()"
              [ngComponentOutletContent]="contentNodes()"
            ></ng-container>
          </div>

          <!-- Controles -->
          <div class="pg__controls">
            <h4 class="pg__controls-title">{{ i18n.t('Controles', 'Controls') }}</h4>
            @for (p of controlProps(); track p.name) {
              <label class="pg__control">
                <span class="pg__control-label">{{ p.name }}</span>
                @switch (p.kind) {
                  @case ('enum') {
                    <select
                      class="pg__select"
                      (change)="set(p.name, fromOption(p, $any($event.target).value))"
                    >
                      @if (hasEmptyOption(p)) {
                        <option value="" [selected]="model()[p.name] === p.default">—</option>
                      }
                      @for (opt of p.options ?? []; track opt) {
                        <option [value]="opt" [selected]="opt === model()[p.name]">{{ opt }}</option>
                      }
                    </select>
                  }
                  @case ('boolean') {
                    <input
                      type="checkbox"
                      class="pg__checkbox"
                      [checked]="$any(model()[p.name])"
                      (change)="set(p.name, $any($event.target).checked)"
                    />
                  }
                  @case ('number') {
                    <input
                      type="number"
                      class="pg__input"
                      [value]="display(model()[p.name])"
                      (input)="set(p.name, fromNumber(p, $any($event.target).value))"
                    />
                  }
                  @default {
                    <input
                      type="text"
                      class="pg__input"
                      [value]="display(model()[p.name])"
                      (input)="set(p.name, fromText(p, $any($event.target).value))"
                    />
                  }
                }
              </label>
            }
            @if (api().content && !api().content?.children) {
              <label class="pg__control">
                <span class="pg__control-label">{{ i18n.t('Contenido', 'Content') }}</span>
                <input
                  type="text"
                  class="pg__input"
                  [value]="content()"
                  (input)="content.set($any($event.target).value)"
                />
              </label>
            }
          </div>
        </div>

        <doc-code-block [code]="code()" lang="markup" />
      </div>
    </section>

    <section id="api" class="pg-section">
      <h2 class="pg-section__title"><a href="#api">API</a></h2>
      <div class="pg">
        <!-- Tabla de propiedades -->
        <h4 class="pg__table-title">{{ i18n.t('Propiedades', 'Properties') }}</h4>
        <div class="pg__table-wrap">
          <table class="pg__table">
            <thead>
              <tr>
                <th>{{ i18n.t('Nombre', 'Name') }}</th>
                <th>{{ i18n.t('Tipo', 'Type') }}</th>
                <th>{{ i18n.t('Por defecto', 'Default') }}</th>
                <th>{{ i18n.t('Descripción', 'Description') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (p of api().props; track p.name) {
                <tr>
                  <td><code>{{ p.name }}</code></td>
                  <td><code>{{ p.type }}</code></td>
                  <td><code>{{ formatDefault(p.default, p.localeKey) }}</code></td>
                  <td>{{ i18n.auto(p.description) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Tabla de eventos -->
        @if (api().events?.length) {
          <h4 class="pg__table-title">{{ i18n.t('Eventos', 'Events') }}</h4>
          <div class="pg__table-wrap">
            <table class="pg__table">
              <thead>
                <tr>
                  <th>{{ i18n.t('Nombre', 'Name') }}</th>
                  <th>{{ i18n.t('Tipo', 'Type') }}</th>
                  <th>{{ i18n.t('Descripción', 'Description') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (e of api().events ?? []; track e.name) {
                  <tr>
                    <td><code>{{ e.name }}</code></td>
                    <td><code>{{ e.type }}</code></td>
                    <td>{{ i18n.auto(e.description) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </section>
  `,
  styleUrl: './doc-playground.component.css',
})
export class DocPlaygroundComponent {
  protected readonly i18n = inject(I18nService);
  /** Textos de la librería en el idioma activo (para valores por defecto traducibles). */
  private readonly translation = injectCbTranslation();

  readonly api = input.required<DocApi>();

  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly outlet = viewChild(NgComponentOutlet);
  private children: ComponentRef<unknown>[] = [];
  private synced: unknown;
  private subscriptions: OutputRefSubscription[] = [];

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyChildren();
      this.unsubscribe();
    });
    // Va al final de la página: sus secciones se registran tras las de ejemplos.
    const toc = inject(TocService);
    afterNextRender(() => {
      toc.register({ id: 'playground', label: 'Playground' });
      toc.register({ id: 'api', label: 'API' });
    });
    // Los model() que cambia el propio componente (cerrar un diálogo, elegir un valor)
    // vuelven a los controles; si no, el control quedaría desfasado.
    afterRenderEffect(() => {
      const props = this.api().props;
      const instance = this.outlet()?.componentInstance as Record<string, unknown> | null | undefined;
      if (instance === this.synced) return;
      this.unsubscribe();
      this.synced = instance;
      if (!instance) return;
      for (const p of props) {
        const output = instance[`${p.name}Change`] as { subscribe?: (fn: (v: unknown) => void) => OutputRefSubscription } | undefined;
        if (typeof output?.subscribe === 'function') {
          this.subscriptions.push(output.subscribe((value) => this.set(p.name, value)));
        }
      }
    });
  }

  /** Valores actuales de cada prop; se reinicia si cambia la API. */
  protected readonly model = linkedSignal<Record<string, unknown>>(() => {
    const rec: Record<string, unknown> = {};
    // La demo arranca con el valor de ejemplo (si lo hay); la tabla muestra el default real.
    for (const p of this.api().props) rec[p.name] = p.example !== undefined ? p.example : p.default;
    return rec;
  });

  /** Texto proyectado actual. */
  protected readonly content = linkedSignal<string>(
    () => this.api().content?.default ?? '',
  );

  /** Overlays que arrancan cerrados (`visible` = false): la vista previa ofrece un botón para abrirlos. */
  protected readonly openable = computed(() =>
    this.api().props.some((p) => p.name === 'visible' && p.kind === 'boolean' && p.default === false),
  );

  /** Props que generan control interactivo. */
  protected readonly controlProps = computed(() =>
    this.api().props.filter((p) => p.control !== false),
  );

  /** Props que ya recibieron un valor (para volver a pasarles `undefined` al vaciarlas). */
  private readonly touched = computed(() => (this.api(), new Set<string>()));

  /**
   * Inputs que recibe la instancia viva. Un `undefined` que nunca se tocó no se
   * pasa: pisaría defaults generados (como el `inputId` de cada campo).
   */
  protected readonly inputs = computed(() => {
    const touched = this.touched();
    const inputs: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(this.model())) {
      if (value !== undefined) touched.add(name);
      if (value !== undefined || touched.has(name)) inputs[name] = value;
    }
    return inputs;
  });

  /** Nodos proyectados en cada `<ng-content>` del componente. */
  protected readonly contentNodes = computed<Node[][] | undefined>(() => {
    const content = this.api().content;
    if (!content || typeof document === 'undefined') return undefined;
    if (content.children) {
      const component = this.api().demo ?? this.api().component;
      const children = content.children;
      return untracked(() => this.project(component, children));
    }
    return [[document.createTextNode(this.content())]];
  });

  /** Crea los hijos y los reparte por slots según su atributo `slot`. */
  private project(component: Type<unknown>, children: DocChild[]): Node[][] {
    this.destroyChildren();
    const selectors = reflectComponentType(component)?.ngContentSelectors ?? ['*'];
    const nodes: Node[][] = selectors.map(() => []);
    const wildcard = Math.max(0, selectors.indexOf('*'));
    for (const child of children) {
      const node = this.createChild(child);
      const index = child.slot ? selectors.indexOf(`[${child.slot}]`) : -1;
      (nodes[index >= 0 ? index : wildcard] ??= []).push(node);
    }
    return nodes;
  }

  private createChild(child: DocChild): Node {
    const text = child.text ? [document.createTextNode(child.text)] : [];
    let element: HTMLElement;
    if (child.component) {
      const selectors = reflectComponentType(child.component)?.ngContentSelectors ?? [];
      const projectableNodes = selectors.map((s) => (s === '*' ? text : []));
      const ref = createComponent(child.component, { environmentInjector: this.environmentInjector, projectableNodes });
      for (const [name, value] of Object.entries(child.inputs ?? {})) ref.setInput(name, value);
      this.appRef.attachView(ref.hostView);
      this.children.push(ref);
      element = ref.location.nativeElement as HTMLElement;
    } else {
      element = document.createElement(child.selector);
      element.append(...text);
    }
    for (const [name, value] of Object.entries(child.attrs ?? {})) element.setAttribute(name, value);
    if (child.slot) element.setAttribute(child.slot, '');
    return element;
  }

  private destroyChildren(): void {
    for (const ref of this.children) ref.destroy();
    this.children = [];
  }

  private unsubscribe(): void {
    for (const sub of this.subscriptions) sub.unsubscribe();
    this.subscriptions = [];
  }

  /** Código generado a partir del estado actual. */
  protected readonly code = computed(() => {
    const m = this.model();
    const sel = this.api().selector;
    const parts: string[] = [];
    for (const p of this.api().props) {
      const v = m[p.name];
      if (v === undefined || v === null || v === p.default) continue;
      if (p.control === false) {
        // Datos (arrays, objetos): se enlazan a una propiedad con el mismo nombre.
        if (isEmpty(v)) continue;
        parts.push(typeof v === 'string' ? `${p.name}="${v}"` : `[${p.name}]="${p.name}"`);
      } else if (p.kind === 'boolean') {
        parts.push(v === true ? p.name : `[${p.name}]="false"`);
      } else if (p.kind === 'number' || typeof v === 'number') {
        parts.push(`[${p.name}]="${v}"`);
      } else if (Array.isArray(v) || typeof v === 'object') {
        parts.push(`[${p.name}]="${p.name}"`);
      } else if (v !== '') {
        parts.push(`${p.name}="${v}"`);
      }
    }
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    const codeContent = this.api().codeContent;
    if (codeContent) {
      const inner = codeContent.split('\n').map((line) => `  ${line}`).join('\n');
      return `<${sel}${attrs}>\n${inner}\n</${sel}>`;
    }
    const children = this.api().content?.children;
    if (children) {
      const lines = children.map((c) => {
        const childAttrs = [
          ...(c.slot ? [c.slot] : []),
          ...Object.entries(c.attrs ?? {}).map(([k, v]) => `${k}="${v}"`),
          ...Object.entries(c.inputs ?? {}).map(([k, v]) => (typeof v === 'string' ? `${k}="${v}"` : `[${k}]="${v}"`)),
        ];
        const open = `<${c.selector}${childAttrs.length ? ' ' + childAttrs.join(' ') : ''}`;
        if (c.text) return `  ${open}>${c.text}</${c.selector}>`;
        return c.component ? `  ${open} />` : `  ${open}></${c.selector}>`;
      });
      return `<${sel}${attrs}>\n${lines.join('\n')}\n</${sel}>`;
    }
    const inner = this.api().content ? this.content() : '';
    return inner ? `<${sel}${attrs}>${inner}</${sel}>` : `<${sel}${attrs} />`;
  });

  protected set(name: string, value: unknown): void {
    this.model.update((m) => (Object.is(m[name], value) ? m : { ...m, [name]: value }));
  }

  /** Valor que muestra un campo de texto o número (null / undefined = vacío). */
  protected display(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
  }

  /** Un campo vacío vuelve al default si es null / undefined (p. ej. `locale`, `max`). */
  protected fromText(p: DocProp, value: string): unknown {
    return value === '' && (p.default === null || p.default === undefined) ? p.default : value;
  }

  protected fromNumber(p: DocProp, value: string): unknown {
    if (value === '') return p.default === null || p.default === undefined ? p.default : 0;
    const n = Number(value);
    return Number.isNaN(n) ? 0 : n;
  }

  /** El select ofrece "—" cuando el default (null / undefined) no es una de las opciones. */
  protected hasEmptyOption(p: DocProp): boolean {
    return !(p.options ?? []).includes(p.default as string);
  }

  /** Valor del select de un enum ("" = default fuera de las opciones). */
  protected fromOption(p: DocProp, value: string): unknown {
    return value === '' ? p.default : value;
  }

  protected formatDefault(value: unknown, localeKey?: string): string {
    // Valor por defecto tomado del idioma activo de la librería.
    if (localeKey) return `'${(this.translation() as unknown as Record<string, string>)[localeKey] ?? ''}'`;
    if (value === undefined || value === '') return '—';
    if (value === null) return 'null';
    if (typeof value === 'string') return `'${value}'`;
    if (Array.isArray(value)) return value.length ? '[…]' : '[]';
    if (typeof value === 'object') return '{…}';
    return String(value);
  }
}

function isEmpty(value: unknown): boolean {
  if (value === '' || value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}
