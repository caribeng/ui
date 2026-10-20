import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  | 'min-w-0';

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

  constructor() {
    inject(TocService).reset();
  }

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
  ];
}
