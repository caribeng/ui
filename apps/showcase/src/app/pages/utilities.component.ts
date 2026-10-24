import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbBreakpoints } from '@caribeng/ui';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

type PreviewKind =
  | 'flex-row'
  | 'inline-flex'
  | 'grid'
  | 'flex-col'
  | 'flex-wrap'
  | 'flex-1'
  | 'items-center'
  | 'items-start'
  | 'items-end'
  | 'justify-center'
  | 'justify-between'
  | 'justify-end'
  | 'gap'
  | 'padding'
  | 'margin'
  | 'w-full'
  | 'h-full'
  | 'max-w-full'
  | 'min-w-0'
  | 'justify'
  | 'self'
  | 'gap-axis'
  | 'grid-cols'
  | 'col-span'
  | 'text'
  | 'truncate'
  | 'surface'
  | 'none';

interface UtilRow {
  cls: string;
  cssRule: string;
  kind: PreviewKind;
  es: string;
  en: string;
}

interface UtilGroup {
  id: string;
  es: string;
  en: string;
  descEs: string;
  descEn: string;
  code: string;
  rows: UtilRow[];
}

@Component({
  selector: 'doc-utilities',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPageHeaderComponent, DocSectionComponent],
  template: `
    <doc-page-header
      eyebrow="Fundamentos"
      [title]="i18n.t('Utilidades CSS', 'CSS Utilities')"
      [lead]="
        i18n.t(
          'Clases utilitarias propias de CaribeNG (prefijo cb-), ligeras e independientes de Tailwind. Se basan directamente en los design tokens --cb-*.',
          'CaribeNG\\'s built-in utility classes (cb- prefix), lightweight and independent of Tailwind. Powered directly by the --cb-* design tokens.'
        )
      "
    />

    <doc-section
      id="composition"
      [title]="i18n.t('Ejemplo de composición en vivo', 'Live Composition Example')"
      [description]="
        i18n.t(
          'Combina utilidades de layout, alineación y espaciado para construir contenedores responsivos sin escribir CSS adicional.',
          'Combine layout, alignment, and spacing utilities to build responsive containers without writing custom CSS.'
        )
      "
      [code]="compositionCode"
    >
      <div class="cb-flex cb-items-center cb-justify-between cb-gap-4 cb-p-4 util-demo-card">
        <div class="cb-flex cb-items-center cb-gap-3">
          <div class="util-demo-avatar">CB</div>
          <div class="cb-flex cb-flex-col">
            <strong class="util-demo-title">{{ i18n.t('Cuenta de Ahorros', 'Savings Account') }}</strong>
            <span class="util-demo-sub">**** 4829 · {{ i18n.t('Activa', 'Active') }}</span>
          </div>
        </div>
        <div class="cb-flex cb-items-center cb-gap-2">
          <span class="util-demo-badge">$ 4.250.000</span>
        </div>
      </div>
    </doc-section>

    <doc-section
      id="responsive"
      [title]="i18n.t('Responsive (sm:, md:, lg:, xl:, 2xl:)', 'Responsive (sm:, md:, lg:, xl:, 2xl:)')"
      [description]="
        i18n.t(
          'Las utilidades de layout, flex, grid, alineación, espaciado, tamaño, posición y tipografía tienen variantes con prefijo de breakpoint. Son mobile-first: md:cb-flex aplica desde 768 px hacia arriba y, por debajo, manda la clase sin prefijo. Dependen del ancho de la ventana, no del contenedor: cambia el tamaño de la ventana para ver el ejemplo.',
          'Layout, flex, grid, alignment, spacing, sizing, position and typography utilities have breakpoint-prefixed variants. They are mobile-first: md:cb-flex applies from 768 px up and, below that, the unprefixed class wins. They depend on the window width, not the container: resize the window to see the example.'
        )
      "
      [code]="responsiveCode"
    >
      <div class="cb-flex cb-flex-col cb-gap-4 cb-w-full">
        <p class="util-bp-now">
          {{ i18n.t('Breakpoint actual', 'Current breakpoint') }}: <strong>{{ bp.current() }}</strong>
          <span class="md:cb-hidden"> · {{ i18n.t('vista móvil', 'mobile view') }}</span>
          <span class="cb-hidden md:cb-inline"> · {{ i18n.t('vista de escritorio', 'desktop view') }}</span>
        </p>
        <div class="cb-grid cb-grid-cols-1 sm:cb-grid-cols-2 lg:cb-grid-cols-4 cb-gap-3">
          @for (card of cards; track card.es) {
            <div class="util-demo-card cb-flex cb-flex-col md:cb-flex-row md:cb-items-center cb-gap-2 cb-p-3 lg:cb-p-4">
              <div class="util-demo-avatar">{{ card.code }}</div>
              <div class="cb-flex cb-flex-col cb-min-w-0">
                <strong class="util-demo-title cb-truncate">{{ i18n.t(card.es, card.en) }}</strong>
                <span class="util-demo-sub">{{ card.amount }}</span>
              </div>
            </div>
          }
        </div>
      </div>
      <div class="util-table-wrap">
        <table class="util-table">
          <thead>
            <tr>
              <th style="width: 7rem">{{ i18n.t('Prefijo', 'Prefix') }}</th>
              <th style="width: 9rem">{{ i18n.t('Desde', 'From') }}</th>
              <th>{{ i18n.t('Uso típico', 'Typical use') }}</th>
            </tr>
          </thead>
          <tbody>
            @for (row of breakpointRows; track row.prefix) {
              <tr>
                <td><code class="util-cls-badge">{{ row.prefix }}</code></td>
                <td><code class="util-css-prop">{{ row.min }}</code></td>
                <td class="util-desc-cell">{{ i18n.t(row.es, row.en) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </doc-section>

    <doc-section
      id="breakpoints-service"
      [title]="i18n.t('Breakpoints en código (CbBreakpoints)', 'Breakpoints in code (CbBreakpoints)')"
      [description]="
        i18n.t(
          'Para lo que el CSS no puede hacer, como no renderizar una parte o cambiar un input, CbBreakpoints da el breakpoint como signals: current(), up(), down(), between() y matches() para cualquier media query. En el servidor todo es false y current() es xs.',
          'For what CSS cannot do, such as not rendering a part or changing an input, CbBreakpoints exposes the breakpoint as signals: current(), up(), down(), between() and matches() for any media query. On the server everything is false and current() is xs.'
        )
      "
      [code]="breakpointsCode"
    >
      <dl class="util-bp-list">
        <dt><code>current()</code></dt>
        <dd>{{ bp.current() }}</dd>
        <dt><code>up('lg')()</code></dt>
        <dd>{{ desktop() }}</dd>
        <dt><code>down('md')()</code></dt>
        <dd>{{ mobile() }}</dd>
        <dt><code>matches('(orientation: portrait)')()</code></dt>
        <dd>{{ portrait() }}</dd>
      </dl>
    </doc-section>

    @for (group of groups; track group.id) {
      <doc-section
        [id]="group.id"
        [title]="i18n.t(group.es, group.en)"
        [description]="i18n.t(group.descEs, group.descEn)"
        [code]="group.code"
      >
        <div class="util-table-wrap">
          <table class="util-table">
            <thead>
              <tr>
                <th style="width: 11rem">{{ i18n.t('Clase', 'Class') }}</th>
                <th style="width: 13rem">{{ i18n.t('Propiedad CSS', 'CSS Property') }}</th>
                <th>{{ i18n.t('Efecto', 'Effect') }}</th>
                <th style="width: 16rem">{{ i18n.t('Vista previa en vivo', 'Live Preview') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of group.rows; track row.cls) {
                <tr>
                  <td><code class="util-cls-badge">.{{ row.cls }}</code></td>
                  <td><code class="util-css-prop">{{ row.cssRule }}</code></td>
                  <td class="util-desc-cell">{{ i18n.t(row.es, row.en) }}</td>
                  <td>
                    <div class="util-stage">
                      @switch (row.kind) {
                        @case ('flex-row') {
                          <div class="util-box cb-flex cb-gap-2">
                            <span class="util-chip">1</span>
                            <span class="util-chip">2</span>
                            <span class="util-chip">3</span>
                          </div>
                        }
                        @case ('inline-flex') {
                          <div class="util-box util-box--inline cb-inline-flex cb-gap-2">
                            <span class="util-chip">A</span>
                            <span class="util-chip">B</span>
                            <span class="util-chip">C</span>
                          </div>
                        }
                        @case ('grid') {
                          <div class="util-box util-box--grid3 cb-grid cb-gap-2">
                            <span class="util-chip util-chip--block">1</span>
                            <span class="util-chip util-chip--block">2</span>
                            <span class="util-chip util-chip--block">3</span>
                          </div>
                        }
                        @case ('flex-col') {
                          <div class="util-box cb-flex cb-flex-col cb-gap-1">
                            <span class="util-bar">1 · {{ i18n.t('Fila', 'Row') }}</span>
                            <span class="util-bar">2 · {{ i18n.t('Fila', 'Row') }}</span>
                          </div>
                        }
                        @case ('flex-wrap') {
                          <div class="util-box util-box--narrow cb-flex cb-flex-wrap cb-gap-1">
                            <span class="util-pill">Tag 1</span>
                            <span class="util-pill">Tag 2</span>
                            <span class="util-pill">Tag 3</span>
                            <span class="util-pill">Tag 4</span>
                          </div>
                        }
                        @case ('flex-1') {
                          <div class="util-box cb-flex cb-gap-2">
                            <span class="util-chip">Auto</span>
                            <span class="util-chip util-chip--accent cb-flex-1">flex-1 (100%)</span>
                          </div>
                        }
                        @case ('items-center') {
                          <div class="util-box util-box--tall cb-flex cb-items-center cb-gap-2">
                            <span class="util-vline util-vline--sm">1</span>
                            <span class="util-vline util-vline--lg">2</span>
                            <span class="util-vline util-vline--md">3</span>
                          </div>
                        }
                        @case ('items-start') {
                          <div class="util-box util-box--tall cb-flex cb-items-start cb-gap-2">
                            <span class="util-vline util-vline--sm">1</span>
                            <span class="util-vline util-vline--lg">2</span>
                            <span class="util-vline util-vline--md">3</span>
                          </div>
                        }
                        @case ('items-end') {
                          <div class="util-box util-box--tall cb-flex cb-items-end cb-gap-2">
                            <span class="util-vline util-vline--sm">1</span>
                            <span class="util-vline util-vline--lg">2</span>
                            <span class="util-vline util-vline--md">3</span>
                          </div>
                        }
                        @case ('justify-center') {
                          <div class="util-box cb-flex cb-justify-center cb-gap-2">
                            <span class="util-chip">1</span>
                            <span class="util-chip">2</span>
                            <span class="util-chip">3</span>
                          </div>
                        }
                        @case ('justify-between') {
                          <div class="util-box cb-flex cb-justify-between">
                            <span class="util-chip">1</span>
                            <span class="util-chip">2</span>
                            <span class="util-chip">3</span>
                          </div>
                        }
                        @case ('justify-end') {
                          <div class="util-box cb-flex cb-justify-end cb-gap-2">
                            <span class="util-chip">1</span>
                            <span class="util-chip">2</span>
                            <span class="util-chip">3</span>
                          </div>
                        }
                        @case ('gap') {
                          <div [class]="'util-box cb-flex cb-items-center ' + row.cls">
                            <span class="util-chip">1</span>
                            <span class="util-chip">2</span>
                            <span class="util-chip">3</span>
                          </div>
                        }
                        @case ('padding') {
                          <div [class]="'util-pad-zone ' + row.cls">
                            <div class="util-pad-inner">{{ row.cls }}</div>
                          </div>
                        }
                        @case ('margin') {
                          <div class="util-margin-frame">
                            <div [class]="'util-margin-inner ' + row.cls">{{ row.cls }}</div>
                          </div>
                        }
                        @case ('w-full') {
                          <div class="util-box">
                            <div class="cb-w-full util-size-bar">100% width (.cb-w-full)</div>
                          </div>
                        }
                        @case ('h-full') {
                          <div class="util-box util-box--tall">
                            <div class="cb-h-full util-size-bar">100% height (.cb-h-full)</div>
                          </div>
                        }
                        @case ('max-w-full') {
                          <div class="util-box">
                            <div class="cb-max-w-full util-size-bar">max-width: 100%</div>
                          </div>
                        }
                        @case ('min-w-0') {
                          <div class="util-box cb-flex cb-gap-2">
                            <div class="cb-min-w-0 cb-flex-1 util-truncate-demo">
                              Texto largo truncado dentro de hijo flex (.cb-min-w-0)
                            </div>
                          </div>
                        }
                        @case ('justify') {
                          <div [class]="'util-box cb-flex ' + row.cls">
                            <span class="util-chip">1</span>
                            <span class="util-chip">2</span>
                            <span class="util-chip">3</span>
                          </div>
                        }
                        @case ('self') {
                          <div class="util-box util-box--tall cb-flex cb-gap-2">
                            <span class="util-chip">1</span>
                            <span [class]="'util-chip util-chip--accent ' + row.cls">{{ row.cls.replace('cb-', '') }}</span>
                            <span class="util-chip">3</span>
                          </div>
                        }
                        @case ('gap-axis') {
                          <div [class]="'util-box cb-grid cb-grid-cols-3 ' + row.cls">
                            @for (n of six; track n) {
                              <span class="util-chip util-chip--block">{{ n }}</span>
                            }
                          </div>
                        }
                        @case ('grid-cols') {
                          <div [class]="'util-box cb-grid cb-gap-1 ' + row.cls">
                            @for (n of six; track n) {
                              <span class="util-chip util-chip--block">{{ n }}</span>
                            }
                          </div>
                        }
                        @case ('col-span') {
                          <div class="util-box cb-grid cb-grid-cols-3 cb-gap-1">
                            <span [class]="'util-chip util-chip--block util-chip--accent ' + row.cls">{{ row.cls.replace('cb-', '') }}</span>
                            <span class="util-chip util-chip--block">2</span>
                            <span class="util-chip util-chip--block">3</span>
                          </div>
                        }
                        @case ('text') {
                          <span [class]="'util-text-sample ' + row.cls">{{ i18n.t('Saldo disponible', 'Available balance') }}</span>
                        }
                        @case ('truncate') {
                          <div class="util-box util-box--narrow">
                            <div [class]="row.cls">{{ i18n.t('Transferencia a cuenta de ahorros 4829', 'Transfer to savings account 4829') }}</div>
                          </div>
                        }
                        @case ('surface') {
                          <div [class]="'util-swatch ' + row.cls">{{ i18n.t('Muestra', 'Sample') }}</div>
                        }
                        @case ('none') {
                          <span class="util-desc-cell">—</span>
                        }
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </doc-section>
    }

    <doc-section
      id="a11y"
      [title]="i18n.t('Accesibilidad (.cb-sr-only)', 'Accessibility (.cb-sr-only)')"
      [description]="
        i18n.t(
          'Oculta el elemento visualmente en pantalla manteniendo su lectura intacta para tecnologías de asistencia (lectores de pantalla).',
          'Visually hides the element on screen while keeping it accessible to assistive technologies (screen readers).'
        )
      "
      [code]="srOnlyCode"
    >
      <div class="cb-flex cb-items-center cb-gap-3">
        <button type="button" class="util-a11y-btn">
          <span aria-hidden="true">🔔</span>
          <span class="cb-sr-only">{{ i18n.t('3 notificaciones sin leer', '3 unread notifications') }}</span>
        </button>
        <span class="util-demo-sub">
          {{
            i18n.t(
              'El botón contiene un elemento .cb-sr-only con el texto descriptivo para lectores de pantalla.',
              'The button contains a .cb-sr-only element with descriptive text for screen readers.'
            )
          }}
        </span>
      </div>
    </doc-section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* Demo card in composition section */
      .util-demo-card {
        background: var(--cb-color-surface);
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg);
      }
      .util-demo-avatar {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: var(--cb-radius-full);
        background: color-mix(in srgb, var(--cb-color-primary-500) 15%, transparent);
        color: var(--cb-color-primary-600);
        font-weight: 700;
        font-size: var(--cb-text-sm);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      :host-context([data-theme='dark']) .util-demo-avatar {
        color: var(--cb-color-primary-400);
      }
      .util-demo-title {
        font-size: var(--cb-text-sm);
        color: var(--cb-color-text);
      }
      .util-demo-sub {
        font-size: var(--cb-text-xs);
        color: var(--cb-color-text-muted);
      }
      .util-demo-badge {
        padding: 0.25rem 0.625rem;
        border-radius: var(--cb-radius-md);
        background: color-mix(in srgb, var(--cb-color-primary-500) 14%, transparent);
        color: var(--cb-color-primary-700);
        font-weight: 600;
        font-size: var(--cb-text-xs);
        font-family: var(--cb-font-mono);
      }
      :host-context([data-theme='dark']) .util-demo-badge {
        color: var(--cb-color-primary-300);
      }

      /* Table styles */
      .util-table-wrap {
        width: 100%;
        overflow-x: auto;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-md);
        background: var(--cb-color-bg);
      }
      .util-table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--cb-text-sm);
      }
      .util-table th,
      .util-table td {
        padding: var(--cb-space-3) var(--cb-space-4);
        border-bottom: 1px solid var(--cb-color-border);
        text-align: left;
        vertical-align: middle;
      }
      .util-table tbody tr:last-child td {
        border-bottom: none;
      }
      .util-table th {
        font-weight: var(--cb-font-weight-semibold);
        font-size: var(--cb-text-xs);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--cb-color-text-muted);
        background: var(--cb-color-surface);
      }
      .util-cls-badge {
        display: inline-block;
        font-family: var(--cb-font-mono);
        font-size: var(--cb-text-xs);
        font-weight: 600;
        padding: 0.15rem 0.45rem;
        border-radius: var(--cb-radius-sm);
        background: color-mix(in srgb, var(--cb-color-primary-500) 12%, transparent);
        color: var(--cb-color-primary-700);
      }
      :host-context([data-theme='dark']) .util-cls-badge {
        color: var(--cb-color-primary-300);
      }
      .util-css-prop {
        font-family: var(--cb-font-mono);
        font-size: var(--cb-text-xs);
        color: var(--cb-color-text-muted);
      }
      .util-desc-cell {
        color: var(--cb-color-text);
      }

      /* Preview stage & boxes */
      .util-stage {
        min-width: 13.5rem;
      }
      .util-box {
        padding: 0.4rem;
        background: var(--cb-color-surface);
        border: 1px dashed var(--cb-color-border-strong);
        border-radius: var(--cb-radius-sm);
      }
      .util-box--inline {
        width: auto;
      }
      .util-box--grid3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .util-box--narrow {
        max-width: 9.5rem;
      }
      .util-box--tall {
        height: 3.25rem;
      }

      /* Visual tokens inside previews */
      .util-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.65rem;
        height: 1.5rem;
        padding: 0 0.4rem;
        border-radius: var(--cb-radius-sm);
        background: var(--cb-color-primary-500);
        color: #ffffff;
        font-size: 0.7rem;
        font-weight: 700;
        font-family: var(--cb-font-mono);
      }
      .util-chip--block {
        width: 100%;
      }
      .util-chip--accent {
        background: var(--cb-color-primary-600);
      }
      .util-bar {
        display: flex;
        align-items: center;
        padding: 0.2rem 0.5rem;
        border-radius: var(--cb-radius-sm);
        background: var(--cb-color-primary-500);
        color: #ffffff;
        font-size: 0.7rem;
        font-weight: 600;
      }
      .util-pill {
        display: inline-flex;
        align-items: center;
        padding: 0.15rem 0.45rem;
        border-radius: var(--cb-radius-sm);
        background: var(--cb-color-primary-500);
        color: #ffffff;
        font-size: 0.68rem;
        font-weight: 600;
      }
      .util-vline {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        border-radius: var(--cb-radius-sm);
        background: var(--cb-color-primary-500);
        color: #ffffff;
        font-size: 0.7rem;
        font-weight: 700;
      }
      .util-vline--sm {
        height: 1.15rem;
      }
      .util-vline--md {
        height: 1.65rem;
      }
      .util-vline--lg {
        height: 2.25rem;
      }

      /* Padding & Margin visualizers */
      .util-pad-zone {
        background: color-mix(in srgb, var(--cb-color-warning-500, #f59e0b) 22%, transparent);
        border: 1px dashed var(--cb-color-warning-500, #f59e0b);
        border-radius: var(--cb-radius-sm);
      }
      .util-pad-inner {
        background: var(--cb-color-primary-500);
        color: #ffffff;
        font-family: var(--cb-font-mono);
        font-size: 0.7rem;
        font-weight: 600;
        text-align: center;
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
      }
      .util-margin-frame {
        display: flow-root;
        background: color-mix(in srgb, var(--cb-color-info-500, #0ea5e9) 18%, transparent);
        border: 1px dashed var(--cb-color-info-500, #0ea5e9);
        border-radius: var(--cb-radius-sm);
      }
      .util-margin-inner {
        background: var(--cb-color-primary-500);
        color: #ffffff;
        font-family: var(--cb-font-mono);
        font-size: 0.7rem;
        font-weight: 600;
        text-align: center;
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
      }

      /* Sizing visualizers */
      .util-size-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 1.5rem;
        background: var(--cb-color-primary-500);
        color: #ffffff;
        font-family: var(--cb-font-mono);
        font-size: 0.7rem;
        font-weight: 600;
        border-radius: 3px;
        padding: 0 0.4rem;
      }
      .util-truncate-demo {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        background: var(--cb-color-primary-500);
        color: #ffffff;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 0.25rem 0.5rem;
        border-radius: 3px;
      }
      .util-text-sample {
        display: inline-block;
      }
      .util-swatch {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 2.25rem;
        padding: 0 0.5rem;
        font-family: var(--cb-font-mono);
        font-size: 0.7rem;
        font-weight: 600;
      }
      .util-bp-now {
        margin: 0;
        font-size: var(--cb-text-sm);
        color: var(--cb-color-text-muted);
      }
      .util-bp-now strong {
        color: var(--cb-color-text);
        font-family: var(--cb-font-mono);
      }
      .util-bp-list {
        display: grid;
        grid-template-columns: max-content auto;
        gap: var(--cb-space-2) var(--cb-space-4);
        margin: 0;
        font-size: var(--cb-text-sm);
      }
      .util-bp-list dd {
        margin: 0;
        font-family: var(--cb-font-mono);
        font-weight: var(--cb-font-weight-semibold);
      }
      .util-a11y-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: var(--cb-radius-md);
        border: 1px solid var(--cb-color-border);
        background: var(--cb-color-surface);
        cursor: pointer;
        font-size: 1.1rem;
      }
    `,
  ],
})
export class UtilitiesComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly bp = inject(CbBreakpoints);
  protected readonly desktop = this.bp.up('lg');
  protected readonly mobile = this.bp.down('md');
  protected readonly portrait = this.bp.matches('(orientation: portrait)');

  constructor() {
    inject(TocService).reset();
  }

  protected readonly cards = [
    { code: 'AH', es: 'Cuenta de ahorros', en: 'Savings account', amount: '$ 4.250.000' },
    { code: 'CC', es: 'Cuenta corriente', en: 'Checking account', amount: '$ 1.180.500' },
    { code: 'TC', es: 'Tarjeta de crédito', en: 'Credit card', amount: '$ 312.900' },
    { code: 'CD', es: 'CDT a 90 días', en: '90-day deposit', amount: '$ 10.000.000' },
  ];

  protected readonly breakpointRows = [
    { prefix: '—', min: '0', es: 'Móvil: la clase sin prefijo es la base para todos los tamaños.', en: 'Mobile: the unprefixed class is the base for every size.' },
    { prefix: 'sm:', min: '576px', es: 'Móvil en horizontal.', en: 'Mobile in landscape.' },
    { prefix: 'md:', min: '768px', es: 'Tableta.', en: 'Tablet.' },
    { prefix: 'lg:', min: '992px', es: 'Portátil y escritorio.', en: 'Laptop and desktop.' },
    { prefix: 'xl:', min: '1200px', es: 'Escritorio ancho.', en: 'Wide desktop.' },
    { prefix: '2xl:', min: '1400px', es: 'Pantallas grandes.', en: 'Large screens.' },
  ];

  protected readonly responsiveCode = `<!-- Una columna en móvil, dos desde sm y cuatro desde lg -->
<div class="cb-grid cb-grid-cols-1 sm:cb-grid-cols-2 lg:cb-grid-cols-4 cb-gap-3">
  <div class="cb-flex cb-flex-col md:cb-flex-row md:cb-items-center cb-gap-2 cb-p-3 lg:cb-p-4">…</div>
</div>

<!-- Visible solo en móvil / solo desde md -->
<span class="md:cb-hidden">Vista móvil</span>
<span class="cb-hidden md:cb-inline">Vista de escritorio</span>

<!-- Menú lateral fijo en escritorio -->
<aside class="cb-hidden lg:cb-block lg:cb-sticky lg:cb-top-0">…</aside>`;

  protected readonly breakpointsCode = `import { CbBreakpoints } from '@caribeng/ui';

export class Page {
  protected readonly bp = inject(CbBreakpoints);
  protected readonly desktop = this.bp.up('lg');        // Signal<boolean>
  protected readonly mobile = this.bp.down('md');        // por debajo de 768px
  protected readonly tablet = this.bp.between('md', 'lg');
  protected readonly portrait = this.bp.matches('(orientation: portrait)');
}

<!-- En la plantilla -->
@if (desktop()) {
  <app-side-panel />
}
<cb-paginator [maxPageLinks]="mobile() ? 3 : 7" />`;

  protected readonly compositionCode = `<div class="cb-flex cb-items-center cb-justify-between cb-gap-4 cb-p-4">
  <div class="cb-flex cb-items-center cb-gap-3">
    <div class="avatar">CB</div>
    <div class="cb-flex cb-flex-col">
      <strong>Cuenta de Ahorros</strong>
      <span>**** 4829 · Activa</span>
    </div>
  </div>
  <div class="cb-flex cb-items-center cb-gap-2">
    <span>$ 4.250.000</span>
  </div>
</div>`;

  protected readonly srOnlyCode = `<button type="button">
  <span aria-hidden="true">🔔</span>
  <span class="cb-sr-only">3 notificaciones sin leer</span>
</button>`;

  protected readonly six = [1, 2, 3, 4, 5, 6];

  protected readonly groups: UtilGroup[] = [
    {
      id: 'layout',
      es: 'Layout (Flexbox & Grid)',
      en: 'Layout (Flexbox & Grid)',
      descEs: 'Controla el modo de visualización y el flujo de los elementos hijos.',
      descEn: 'Control the display mode and directional flow of child elements.',
      code: `<div class="cb-flex cb-gap-2">
  <span>1</span>
  <span>2</span>
  <span>3</span>
</div>

<div class="cb-flex cb-flex-col cb-gap-2">
  <span>Fila 1</span>
  <span>Fila 2</span>
</div>`,
      rows: [
        { cls: 'cb-flex', cssRule: 'display: flex', kind: 'flex-row', es: 'Contenedor flexbox en fila.', en: 'Row flexbox container.' },
        { cls: 'cb-inline-flex', cssRule: 'display: inline-flex', kind: 'inline-flex', es: 'Flexbox ajustado al contenido.', en: 'Content-sized inline flexbox.' },
        { cls: 'cb-grid', cssRule: 'display: grid', kind: 'grid', es: 'Contenedor CSS Grid.', en: 'CSS Grid container.' },
        { cls: 'cb-flex-col', cssRule: 'flex-direction: column', kind: 'flex-col', es: 'Apila los hijos en columna vertical.', en: 'Stacks children vertically in a column.' },
        { cls: 'cb-flex-wrap', cssRule: 'flex-wrap: wrap', kind: 'flex-wrap', es: 'Permite salto de línea automático.', en: 'Allows items to wrap onto multiple lines.' },
        { cls: 'cb-flex-1', cssRule: 'flex: 1 1 0%', kind: 'flex-1', es: 'Crece y ocupa el espacio restante.', en: 'Grows to fill available flex space.' },
      ],
    },
    {
      id: 'alignment',
      es: 'Alineación (Eje cruzado y principal)',
      en: 'Alignment (Cross & Main Axis)',
      descEs: 'Combínalas con .cb-flex o .cb-grid para distribuir y alinear elementos.',
      descEn: 'Combine with .cb-flex or .cb-grid to align and distribute items.',
      code: `<div class="cb-flex cb-items-center cb-justify-between">
  <span>Izquierda</span>
  <span>Centro</span>
  <span>Derecha</span>
</div>`,
      rows: [
        { cls: 'cb-items-center', cssRule: 'align-items: center', kind: 'items-center', es: 'Centra verticalmente en el eje cruzado.', en: 'Centers items along the cross axis.' },
        { cls: 'cb-items-start', cssRule: 'align-items: flex-start', kind: 'items-start', es: 'Alinea al borde superior (inicio).', en: 'Aligns items to the start of the cross axis.' },
        { cls: 'cb-items-end', cssRule: 'align-items: flex-end', kind: 'items-end', es: 'Alinea al borde inferior (final).', en: 'Aligns items to the end of the cross axis.' },
        { cls: 'cb-justify-center', cssRule: 'justify-content: center', kind: 'justify-center', es: 'Agrupa los hijos en el centro.', en: 'Centers items along the main axis.' },
        { cls: 'cb-justify-between', cssRule: 'justify-content: space-between', kind: 'justify-between', es: 'Distribuye con espacio uniforme entre hijos.', en: 'Distributes items evenly with space between.' },
        { cls: 'cb-justify-end', cssRule: 'justify-content: flex-end', kind: 'justify-end', es: 'Empuja los hijos al final del eje.', en: 'Packs items toward the end of the main axis.' },
      ],
    },
    {
      id: 'spacing',
      es: 'Espaciado (Gap, Padding & Margin)',
      en: 'Spacing (Gap, Padding & Margin)',
      descEs: 'Escala conectada directamente a los tokens --cb-space-1 (0.25rem) hasta --cb-space-8 (2rem).',
      descEn: 'Scale mapped directly to tokens --cb-space-1 (0.25rem) through --cb-space-8 (2rem).',
      code: `<div class="cb-flex cb-gap-4 cb-p-4">
  <div>Elemento A</div>
  <div>Elemento B</div>
</div>`,
      rows: [
        { cls: 'cb-gap-1', cssRule: 'gap: var(--cb-space-1)', kind: 'gap', es: 'Separación de 4px (0.25rem) entre hijos.', en: '4px (0.25rem) gap between children.' },
        { cls: 'cb-gap-2', cssRule: 'gap: var(--cb-space-2)', kind: 'gap', es: 'Separación de 8px (0.5rem) entre hijos.', en: '8px (0.5rem) gap between children.' },
        { cls: 'cb-gap-4', cssRule: 'gap: var(--cb-space-4)', kind: 'gap', es: 'Separación de 16px (1rem) entre hijos.', en: '16px (1rem) gap between children.' },
        { cls: 'cb-gap-6', cssRule: 'gap: var(--cb-space-6)', kind: 'gap', es: 'Separación de 24px (1.5rem) entre hijos.', en: '24px (1.5rem) gap between children.' },
        { cls: 'cb-p-2', cssRule: 'padding: var(--cb-space-2)', kind: 'padding', es: 'Relleno interno de 8px (zona ámbar).', en: '8px inner padding (amber zone).' },
        { cls: 'cb-p-4', cssRule: 'padding: var(--cb-space-4)', kind: 'padding', es: 'Relleno interno de 16px (zona ámbar).', en: '16px inner padding (amber zone).' },
        { cls: 'cb-m-2', cssRule: 'margin: var(--cb-space-2)', kind: 'margin', es: 'Margen externo de 8px (zona azul).', en: '8px outer margin (blue zone).' },
        { cls: 'cb-m-4', cssRule: 'margin: var(--cb-space-4)', kind: 'margin', es: 'Margen externo de 16px (zona azul).', en: '16px outer margin (blue zone).' },
      ],
    },
    {
      id: 'sizing',
      es: 'Tamaño y Desbordamiento',
      en: 'Sizing & Overflow',
      descEs: 'Utilidades de dimensión para contenedores fluidos e hijos flexibles.',
      descEn: 'Dimension utilities for fluid containers and flexible children.',
      code: `<div class="cb-flex cb-w-full">
  <div class="cb-min-w-0 cb-flex-1">Contenido truncable...</div>
</div>`,
      rows: [
        { cls: 'cb-w-full', cssRule: 'width: 100%', kind: 'w-full', es: 'Ocupa el 100% del ancho disponible.', en: 'Spans 100% of available width.' },
        { cls: 'cb-h-full', cssRule: 'height: 100%', kind: 'h-full', es: 'Ocupa el 100% del alto del contenedor.', en: 'Spans 100% of container height.' },
        { cls: 'cb-max-w-full', cssRule: 'max-width: 100%', kind: 'max-w-full', es: 'Evita que el elemento desborde su contenedor.', en: 'Prevents element from overflowing its parent.' },
        { cls: 'cb-min-w-0', cssRule: 'min-width: 0', kind: 'min-w-0', es: 'Permite encoger y truncar texto dentro de flexbox.', en: 'Allows shrinking and text truncation inside flex.' },
      ],
    },
    {
      id: 'spacing-sides',
      es: 'Espaciado por lado y por eje',
      en: 'Per-side and per-axis spacing',
      descEs: 'Padding y margin por eje (x, y) o por lado (t, r, b, l), y gap por eje. Misma escala 0–8. Combínalas con el shorthand: cb-p-4 cb-pt-0.',
      descEn: 'Padding and margin per axis (x, y) or per side (t, r, b, l), and per-axis gap. Same 0–8 scale. Combine with the shorthand: cb-p-4 cb-pt-0.',
      code: `<div class="cb-px-4 cb-py-2">Botón ancho</div>
<div class="cb-p-4 cb-pt-0">Sin relleno arriba</div>
<div class="cb-mx-auto" style="max-width: 40rem">Centrado</div>
<div class="cb-grid cb-grid-cols-3 cb-gap-x-4 cb-gap-y-1">…</div>`,
      rows: [
        { cls: 'cb-px-4', cssRule: 'padding-left/right: var(--cb-space-4)', kind: 'padding', es: 'Relleno horizontal (cb-px-0…8).', en: 'Horizontal padding (cb-px-0…8).' },
        { cls: 'cb-py-2', cssRule: 'padding-top/bottom: var(--cb-space-2)', kind: 'padding', es: 'Relleno vertical (cb-py-0…8).', en: 'Vertical padding (cb-py-0…8).' },
        { cls: 'cb-pt-4', cssRule: 'padding-top: var(--cb-space-4)', kind: 'padding', es: 'Un solo lado: cb-pt, cb-pr, cb-pb, cb-pl.', en: 'Single side: cb-pt, cb-pr, cb-pb, cb-pl.' },
        { cls: 'cb-ml-4', cssRule: 'margin-left: var(--cb-space-4)', kind: 'margin', es: 'Margen de un lado: cb-mt, cb-mr, cb-mb, cb-ml (también cb-mx, cb-my).', en: 'Single-side margin: cb-mt, cb-mr, cb-mb, cb-ml (also cb-mx, cb-my).' },
        { cls: 'cb-mx-auto', cssRule: 'margin-left/right: auto', kind: 'none', es: 'Centra un bloque con ancho máximo. También cb-ml-auto, cb-mr-auto, cb-mt-auto.', en: 'Centers a block with a max width. Also cb-ml-auto, cb-mr-auto, cb-mt-auto.' },
        { cls: 'cb-gap-x-4', cssRule: 'column-gap: var(--cb-space-4)', kind: 'gap-axis', es: 'Separación solo entre columnas.', en: 'Gap between columns only.' },
        { cls: 'cb-gap-y-3', cssRule: 'row-gap: var(--cb-space-3)', kind: 'gap-axis', es: 'Separación solo entre filas.', en: 'Gap between rows only.' },
      ],
    },
    {
      id: 'grid',
      es: 'Grid (columnas)',
      en: 'Grid (columns)',
      descEs: 'Rejillas de 1 a 12 columnas iguales y celdas que ocupan varias columnas.',
      descEn: 'Grids of 1 to 12 equal columns and cells spanning several columns.',
      code: `<div class="cb-grid cb-grid-cols-3 cb-gap-4">
  <div class="cb-col-span-2">Principal</div>
  <div>Lateral</div>
</div>`,
      rows: [
        { cls: 'cb-grid-cols-2', cssRule: 'grid-template-columns: repeat(2, minmax(0, 1fr))', kind: 'grid-cols', es: 'Dos columnas iguales (cb-grid-cols-1…12).', en: 'Two equal columns (cb-grid-cols-1…12).' },
        { cls: 'cb-grid-cols-3', cssRule: 'grid-template-columns: repeat(3, minmax(0, 1fr))', kind: 'grid-cols', es: 'Tres columnas iguales.', en: 'Three equal columns.' },
        { cls: 'cb-grid-cols-6', cssRule: 'grid-template-columns: repeat(6, minmax(0, 1fr))', kind: 'grid-cols', es: 'Seis columnas iguales.', en: 'Six equal columns.' },
        { cls: 'cb-col-span-2', cssRule: 'grid-column: span 2 / span 2', kind: 'col-span', es: 'La celda ocupa dos columnas (cb-col-span-1…12).', en: 'The cell spans two columns (cb-col-span-1…12).' },
        { cls: 'cb-col-span-full', cssRule: 'grid-column: 1 / -1', kind: 'col-span', es: 'La celda ocupa toda la fila.', en: 'The cell spans the whole row.' },
      ],
    },
    {
      id: 'flex-extra',
      es: 'Flex: crecer, encoger y alinear un hijo',
      en: 'Flex: grow, shrink and align one child',
      descEs: 'Control fino de los hijos flex y distribuciones adicionales.',
      descEn: 'Fine control of flex children and extra distributions.',
      code: `<div class="cb-flex cb-items-center cb-gap-2">
  <cb-icon class="cb-shrink-0" name="user" />
  <span class="cb-flex-1 cb-truncate">Nombre muy largo…</span>
  <button class="cb-self-start">⋮</button>
</div>`,
      rows: [
        { cls: 'cb-justify-around', cssRule: 'justify-content: space-around', kind: 'justify', es: 'Espacio alrededor de cada hijo.', en: 'Space around each child.' },
        { cls: 'cb-justify-evenly', cssRule: 'justify-content: space-evenly', kind: 'justify', es: 'Mismo espacio entre hijos y bordes.', en: 'Equal space between children and edges.' },
        { cls: 'cb-self-start', cssRule: 'align-self: flex-start', kind: 'self', es: 'Alinea un solo hijo arriba (también cb-self-center, -end, -stretch).', en: 'Aligns a single child to the top (also cb-self-center, -end, -stretch).' },
        { cls: 'cb-self-end', cssRule: 'align-self: flex-end', kind: 'self', es: 'Alinea un solo hijo abajo.', en: 'Aligns a single child to the bottom.' },
        { cls: 'cb-shrink-0', cssRule: 'flex-shrink: 0', kind: 'none', es: 'Impide que el hijo se encoja (iconos, avatares).', en: 'Prevents the child from shrinking (icons, avatars).' },
        { cls: 'cb-grow', cssRule: 'flex-grow: 1', kind: 'none', es: 'Crece para ocupar el espacio libre. También cb-flex-auto, cb-flex-none, cb-flex-nowrap.', en: 'Grows to fill free space. Also cb-flex-auto, cb-flex-none, cb-flex-nowrap.' },
      ],
    },
    {
      id: 'typography',
      es: 'Tipografía',
      en: 'Typography',
      descEs: 'Tamaños --cb-text-xs…2xl, pesos --cb-font-weight-*, alineación y recorte de texto.',
      descEn: 'Sizes --cb-text-xs…2xl, --cb-font-weight-* weights, alignment and text clipping.',
      code: `<h2 class="cb-text-xl cb-font-bold">Resumen</h2>
<p class="cb-text-sm cb-text-muted">Actualizado hoy</p>
<span class="cb-truncate">Texto que se corta con puntos suspensivos…</span>`,
      rows: [
        { cls: 'cb-text-xs', cssRule: 'font-size: var(--cb-text-xs)', kind: 'text', es: '12px (0.75rem).', en: '12px (0.75rem).' },
        { cls: 'cb-text-sm', cssRule: 'font-size: var(--cb-text-sm)', kind: 'text', es: '14px (0.875rem).', en: '14px (0.875rem).' },
        { cls: 'cb-text-base', cssRule: 'font-size: var(--cb-text-base)', kind: 'text', es: '16px (1rem).', en: '16px (1rem).' },
        { cls: 'cb-text-lg', cssRule: 'font-size: var(--cb-text-lg)', kind: 'text', es: '18px (1.125rem).', en: '18px (1.125rem).' },
        { cls: 'cb-text-xl', cssRule: 'font-size: var(--cb-text-xl)', kind: 'text', es: '20px (1.25rem).', en: '20px (1.25rem).' },
        { cls: 'cb-text-2xl', cssRule: 'font-size: var(--cb-text-2xl)', kind: 'text', es: '24px (1.5rem).', en: '24px (1.5rem).' },
        { cls: 'cb-font-medium', cssRule: 'font-weight: var(--cb-font-weight-medium)', kind: 'text', es: 'Peso medio (también cb-font-regular).', en: 'Medium weight (also cb-font-regular).' },
        { cls: 'cb-font-semibold', cssRule: 'font-weight: var(--cb-font-weight-semibold)', kind: 'text', es: 'Seminegrita.', en: 'Semibold.' },
        { cls: 'cb-font-bold', cssRule: 'font-weight: var(--cb-font-weight-bold)', kind: 'text', es: 'Negrita.', en: 'Bold.' },
        { cls: 'cb-font-mono', cssRule: 'font-family: var(--cb-font-mono)', kind: 'text', es: 'Monoespaciada (códigos, cifras).', en: 'Monospace (codes, figures).' },
        { cls: 'cb-uppercase', cssRule: 'text-transform: uppercase', kind: 'text', es: 'Mayúsculas (también cb-capitalize).', en: 'Uppercase (also cb-capitalize).' },
        { cls: 'cb-truncate', cssRule: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap', kind: 'truncate', es: 'Una línea con puntos suspensivos.', en: 'Single line with ellipsis.' },
        { cls: 'cb-text-center', cssRule: 'text-align: center', kind: 'none', es: 'Alineación (también cb-text-left, cb-text-right).', en: 'Alignment (also cb-text-left, cb-text-right).' },
        { cls: 'cb-nowrap', cssRule: 'white-space: nowrap', kind: 'none', es: 'Sin saltos de línea. cb-break-words corta palabras largas.', en: 'No line breaks. cb-break-words breaks long words.' },
      ],
    },
    {
      id: 'text-color',
      es: 'Color de texto',
      en: 'Text color',
      descEs: 'Colores semánticos que siguen el tema. Las severidades usan el tono 700 en claro y el 400 en oscuro para mantener el contraste.',
      descEn: 'Semantic colors that follow the theme. Severities use the 700 shade in light mode and 400 in dark mode to keep contrast.',
      code: `<span class="cb-text-success">+ $ 120.000</span>
<span class="cb-text-danger">- $ 45.000</span>
<small class="cb-text-muted">Hace 2 horas</small>`,
      rows: [
        { cls: 'cb-text-default', cssRule: 'color: var(--cb-color-text)', kind: 'text', es: 'Texto normal.', en: 'Default text.' },
        { cls: 'cb-text-muted', cssRule: 'color: var(--cb-color-text-muted)', kind: 'text', es: 'Texto secundario.', en: 'Secondary text.' },
        { cls: 'cb-text-strong', cssRule: 'color: var(--cb-color-text-strong)', kind: 'text', es: 'Texto destacado.', en: 'Emphasized text.' },
        { cls: 'cb-text-primary', cssRule: 'color: var(--cb-color-primary-700)', kind: 'text', es: 'Color de marca.', en: 'Brand color.' },
        { cls: 'cb-text-success', cssRule: 'color: var(--cb-color-success-700)', kind: 'text', es: 'Éxito, ingresos.', en: 'Success, income.' },
        { cls: 'cb-text-warning', cssRule: 'color: var(--cb-color-warning-700)', kind: 'text', es: 'Advertencia.', en: 'Warning.' },
        { cls: 'cb-text-danger', cssRule: 'color: var(--cb-color-danger-700)', kind: 'text', es: 'Error, egresos.', en: 'Error, expenses.' },
        { cls: 'cb-text-info', cssRule: 'color: var(--cb-color-info-700)', kind: 'text', es: 'Información (también cb-text-help).', en: 'Information (also cb-text-help).' },
      ],
    },
    {
      id: 'backgrounds',
      es: 'Fondos',
      en: 'Backgrounds',
      descEs: 'Superficies del tema y fondos por severidad. Los sólidos ponen también el color de contraste; los -subtle tiñen con transparencia y funcionan en claro y en oscuro.',
      descEn: 'Theme surfaces and per-severity backgrounds. Solid ones also set the contrast color; -subtle ones tint with transparency and work in light and dark.',
      code: `<div class="cb-bg-subtle cb-p-4 cb-rounded-lg">Panel</div>
<span class="cb-bg-success-subtle cb-text-success cb-px-2 cb-rounded-full">Aprobado</span>
<div class="cb-bg-primary cb-p-3">Destacado</div>`,
      rows: [
        { cls: 'cb-bg-surface', cssRule: 'background-color: var(--cb-color-surface)', kind: 'surface', es: 'Superficie base.', en: 'Base surface.' },
        { cls: 'cb-bg-subtle', cssRule: 'background-color: var(--cb-color-surface-subtle)', kind: 'surface', es: 'Superficie suave para paneles.', en: 'Soft surface for panels.' },
        { cls: 'cb-bg-raised', cssRule: 'background-color: var(--cb-color-surface-raised)', kind: 'surface', es: 'Superficie elevada (tarjetas, menús).', en: 'Raised surface (cards, menus).' },
        { cls: 'cb-bg-primary', cssRule: 'background-color: var(--cb-color-primary); color: …-contrast', kind: 'surface', es: 'Fondo sólido con texto de contraste (todas las severidades).', en: 'Solid background with contrast text (all severities).' },
        { cls: 'cb-bg-danger', cssRule: 'background-color: var(--cb-color-danger); color: …-contrast', kind: 'surface', es: 'Fondo sólido de peligro.', en: 'Solid danger background.' },
        { cls: 'cb-bg-success-subtle', cssRule: 'background-color: color-mix(… success 12%, transparent)', kind: 'surface', es: 'Tinte suave de éxito (badges, alertas).', en: 'Soft success tint (badges, alerts).' },
        { cls: 'cb-bg-warning-subtle', cssRule: 'background-color: color-mix(… warning 12%, transparent)', kind: 'surface', es: 'Tinte suave de advertencia.', en: 'Soft warning tint.' },
      ],
    },
    {
      id: 'borders',
      es: 'Bordes, radio y sombras',
      en: 'Borders, radius and shadows',
      descEs: 'Bordes con --cb-color-border, radios --cb-radius-* y sombras --cb-shadow-* (más intensas en oscuro).',
      descEn: 'Borders with --cb-color-border, --cb-radius-* radii and --cb-shadow-* shadows (stronger in dark mode).',
      code: `<div class="cb-border cb-rounded-lg cb-shadow-sm cb-p-4">Tarjeta</div>
<li class="cb-border-b cb-py-2">Fila de lista</li>
<input class="cb-border cb-border-danger cb-rounded-md" />`,
      rows: [
        { cls: 'cb-border', cssRule: 'border: 1px solid var(--cb-color-border)', kind: 'surface', es: 'Borde en los cuatro lados (cb-border-0 lo quita).', en: 'Border on all four sides (cb-border-0 removes it).' },
        { cls: 'cb-border-b', cssRule: 'border-bottom: 1px solid var(--cb-color-border)', kind: 'surface', es: 'Un solo lado: cb-border-t, -r, -b, -l.', en: 'Single side: cb-border-t, -r, -b, -l.' },
        { cls: 'cb-border cb-border-primary', cssRule: 'border-color: var(--cb-color-primary)', kind: 'surface', es: 'Color del borde por severidad (o cb-border-strong).', en: 'Border color per severity (or cb-border-strong).' },
        { cls: 'cb-border cb-rounded-sm', cssRule: 'border-radius: var(--cb-radius-sm)', kind: 'surface', es: 'Radio pequeño (también cb-rounded-none).', en: 'Small radius (also cb-rounded-none).' },
        { cls: 'cb-border cb-rounded-lg', cssRule: 'border-radius: var(--cb-radius-lg)', kind: 'surface', es: 'Radio grande (también cb-rounded-md).', en: 'Large radius (also cb-rounded-md).' },
        { cls: 'cb-border cb-rounded-full', cssRule: 'border-radius: var(--cb-radius-full)', kind: 'surface', es: 'Píldora o círculo.', en: 'Pill or circle.' },
        { cls: 'cb-bg-raised cb-shadow-sm', cssRule: 'box-shadow: var(--cb-shadow-sm)', kind: 'surface', es: 'Sombra suave (cb-shadow-none la quita).', en: 'Soft shadow (cb-shadow-none removes it).' },
        { cls: 'cb-bg-raised cb-shadow-md', cssRule: 'box-shadow: var(--cb-shadow-md)', kind: 'surface', es: 'Sombra media.', en: 'Medium shadow.' },
        { cls: 'cb-bg-raised cb-shadow-lg', cssRule: 'box-shadow: var(--cb-shadow-lg)', kind: 'surface', es: 'Sombra grande (diálogos, menús).', en: 'Large shadow (dialogs, menus).' },
      ],
    },
    {
      id: 'position',
      es: 'Posición y desbordamiento',
      en: 'Position & overflow',
      descEs: 'Posicionamiento y control del contenido que no cabe.',
      descEn: 'Positioning and control of overflowing content.',
      code: `<div class="cb-relative">
  <img … />
  <span class="cb-absolute cb-top-0">Nuevo</span>
</div>
<div class="cb-overflow-x-auto"><table>…</table></div>`,
      rows: [
        { cls: 'cb-relative', cssRule: 'position: relative', kind: 'none', es: 'Referencia para hijos absolutos (también cb-absolute, cb-fixed).', en: 'Reference for absolute children (also cb-absolute, cb-fixed).' },
        { cls: 'cb-sticky', cssRule: 'position: sticky', kind: 'none', es: 'Se queda pegado al hacer scroll (con cb-top-0).', en: 'Sticks while scrolling (with cb-top-0).' },
        { cls: 'cb-inset-0', cssRule: 'inset: 0', kind: 'none', es: 'Ocupa todo el contenedor posicionado.', en: 'Fills the whole positioned container.' },
        { cls: 'cb-overflow-hidden', cssRule: 'overflow: hidden', kind: 'none', es: 'Recorta lo que sobresale.', en: 'Clips overflowing content.' },
        { cls: 'cb-overflow-x-auto', cssRule: 'overflow-x: auto', kind: 'none', es: 'Scroll horizontal si hace falta (tablas). También cb-overflow-auto, cb-overflow-y-auto.', en: 'Horizontal scroll when needed (tables). Also cb-overflow-auto, cb-overflow-y-auto.' },
      ],
    },
  ];
}
