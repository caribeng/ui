import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { CodeBlockComponent } from '../shared/code-block.component';
import { I18nService } from '../services/i18n.service';
import { TocService } from '../services/toc.service';
import { injectCbTranslation } from '@caribeng/ui';
import type { DocApi } from './doc-api.model';

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
            <ng-container
              [ngComponentOutlet]="api().component"
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
                      (change)="set(p.name, $any($event.target).value)"
                    >
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
                      [value]="$any(model()[p.name])"
                      (input)="set(p.name, toNumber($any($event.target).value))"
                    />
                  }
                  @default {
                    <input
                      type="text"
                      class="pg__input"
                      [value]="$any(model()[p.name])"
                      (input)="set(p.name, $any($event.target).value)"
                    />
                  }
                }
              </label>
            }
            @if (api().content) {
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

  constructor() {
    // Va al final de la página: sus secciones se registran tras las de ejemplos.
    const toc = inject(TocService);
    afterNextRender(() => {
      toc.register({ id: 'playground', label: 'Playground' });
      toc.register({ id: 'api', label: 'API' });
    });
  }

  /** Valores actuales de cada prop; se reinicia si cambia la API. */
  protected readonly model = linkedSignal<Record<string, unknown>>(() => {
    const rec: Record<string, unknown> = {};
    for (const p of this.api().props) rec[p.name] = p.default;
    return rec;
  });

  /** Texto proyectado actual. */
  protected readonly content = linkedSignal<string>(
    () => this.api().content?.default ?? '',
  );

  /** Props que generan control interactivo. */
  protected readonly controlProps = computed(() =>
    this.api().props.filter((p) => p.control !== false),
  );

  /** Inputs que recibe la instancia viva. */
  protected readonly inputs = computed(() => this.model());

  /** Nodos proyectados (un único slot de texto). */
  protected readonly contentNodes = computed<Node[][] | undefined>(() => {
    if (!this.api().content || typeof document === 'undefined') return undefined;
    return [[document.createTextNode(this.content())]];
  });

  /** Código generado a partir del estado actual. */
  protected readonly code = computed(() => {
    const m = this.model();
    const sel = this.api().selector;
    const parts: string[] = [];
    for (const p of this.api().props) {
      if (p.control === false) continue;
      const v = m[p.name];
      if (v === undefined || v === p.default) continue;
      if (p.kind === 'boolean') {
        parts.push(v === true ? p.name : `[${p.name}]="false"`);
      } else if (p.kind === 'number') {
        parts.push(`[${p.name}]="${v}"`);
      } else {
        parts.push(`${p.name}="${v}"`);
      }
    }
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    const inner = this.api().content ? this.content() : '';
    return inner ? `<${sel}${attrs}>${inner}</${sel}>` : `<${sel}${attrs} />`;
  });

  protected set(name: string, value: unknown): void {
    this.model.update((m) => ({ ...m, [name]: value }));
  }

  protected toNumber(value: string): number {
    const n = Number(value);
    return Number.isNaN(n) ? 0 : n;
  }

  protected formatDefault(value: unknown, localeKey?: string): string {
    // Valor por defecto tomado del idioma activo de la librería.
    if (localeKey) return `'${(this.translation() as unknown as Record<string, string>)[localeKey] ?? ''}'`;
    if (value === undefined || value === '') return '—';
    if (typeof value === 'string') return `'${value}'`;
    return String(value);
  }
}
