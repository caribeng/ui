import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

interface UtilRow {
  cls: string;
  es: string;
  en: string;
}

interface UtilGroup {
  id: string;
  es: string;
  en: string;
  rows: UtilRow[];
}

@Component({
  selector: 'doc-utilities',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Foundations"
      [title]="i18n.t('Utilidades CSS', 'CSS Utilities')"
      [lead]="
        i18n.t(
          'Clases utilitarias propias de CaribeNG (prefijo cb-), opcionales e independientes de Tailwind. Se apoyan en los design tokens --cb-*.',
          'CaribeNG\\'s own utility classes (cb- prefix), optional and independent of Tailwind. They build on the --cb-* design tokens.'
        )
      "
    />

    <p class="util-intro">
      {{
        i18n.t(
          'Impórtalas con los estilos de CaribeNG. Combínalas libremente; cada clase hace una sola cosa.',
          'Import them with the CaribeNG styles. Combine them freely; each class does one thing.'
        )
      }}
    </p>

    @for (group of groups; track group.id) {
      <section [id]="group.id" class="util-group">
        <h2 class="util-group__title">{{ i18n.t(group.es, group.en) }}</h2>
        <div class="util-table-wrap">
          <table class="util-table">
            <thead>
              <tr>
                <th>{{ i18n.t('Clase', 'Class') }}</th>
                <th>{{ i18n.t('Efecto', 'Effect') }}</th>
                <th>{{ i18n.t('Vista previa', 'Preview') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of group.rows; track row.cls) {
                <tr>
                  <td><code>{{ row.cls }}</code></td>
                  <td>{{ i18n.t(row.es, row.en) }}</td>
                  <td>
                    <div class="util-preview" [attr.data-cls]="row.cls">
                      <span class="util-preview__box" [class]="row.cls">
                        <span class="util-dot"></span>
                        <span class="util-dot"></span>
                        <span class="util-dot"></span>
                      </span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    }

    <section [id]="'a11y'" class="util-group">
      <h2 class="util-group__title">{{ i18n.t('Accesibilidad', 'Accessibility') }}</h2>
      <p class="util-note">
        <code>.cb-sr-only</code> —
        {{
          i18n.t(
            'oculta el contenido visualmente pero lo mantiene para lectores de pantalla.',
            'visually hides content while keeping it available to screen readers.'
          )
        }}
      </p>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .util-intro,
      .util-note {
        color: var(--cb-color-text-muted);
        max-width: 65ch;
      }
      .util-group {
        margin: var(--cb-space-8) 0;
      }
      .util-group__title {
        font-size: 1.3rem;
        font-weight: var(--cb-font-weight-bold);
        color: var(--cb-color-text-strong);
        margin: 0 0 var(--cb-space-4);
      }
      .util-table-wrap {
        overflow-x: auto;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-md);
      }
      .util-table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--cb-text-sm);
      }
      .util-table th,
      .util-table td {
        padding: var(--cb-space-3);
        border-bottom: 1px solid var(--cb-color-border);
        text-align: left;
        vertical-align: middle;
      }
      .util-table tbody tr:last-child td {
        border-bottom: none;
      }
      .util-table th {
        font-weight: var(--cb-font-weight-semibold);
        color: var(--cb-color-text-muted);
        background: var(--cb-color-surface-50);
      }
      .util-table code {
        font-family: var(--cb-font-mono);
        font-size: var(--cb-text-xs);
        color: var(--cb-color-primary-700);
      }
      :host-context([data-theme='dark']) .util-table code {
        color: var(--cb-color-primary-300);
      }
      .util-preview {
        min-width: 10rem;
      }
      .util-preview__box {
        gap: var(--cb-space-1);
        padding: var(--cb-space-2);
        min-height: 2.5rem;
        background: var(--cb-color-surface-100);
        border: 1px dashed var(--cb-color-border-strong);
        border-radius: var(--cb-radius-sm);
      }
      /* Las utilidades reales (.cb-flex, .cb-grid, …) provienen del CSS global. */
      .util-dot {
        display: block;
        width: 1.25rem;
        height: 1.25rem;
        background: var(--cb-color-primary-500);
        border-radius: var(--cb-radius-sm);
      }
    `,
  ],
})
export class UtilitiesComponent {
  protected readonly i18n = inject(I18nService);

  constructor() {
    inject(TocService).reset();
  }

  protected readonly groups: UtilGroup[] = [
    {
      id: 'layout',
      es: 'Layout',
      en: 'Layout',
      rows: [
        { cls: 'cb-flex', es: 'Contenedor flexbox (fila).', en: 'Flexbox container (row).' },
        { cls: 'cb-inline-flex', es: 'Flexbox en línea.', en: 'Inline flexbox.' },
        { cls: 'cb-grid', es: 'Contenedor grid.', en: 'Grid container.' },
        { cls: 'cb-flex-col', es: 'Dirección en columna.', en: 'Column direction.' },
        { cls: 'cb-flex-wrap', es: 'Permite salto de línea.', en: 'Allows wrapping.' },
      ],
    },
    {
      id: 'alignment',
      es: 'Alineación',
      en: 'Alignment',
      rows: [
        { cls: 'cb-items-center', es: 'Centra en el eje cruzado.', en: 'Center on cross axis.' },
        { cls: 'cb-items-start', es: 'Alinea al inicio.', en: 'Align to start.' },
        { cls: 'cb-justify-center', es: 'Centra en el eje principal.', en: 'Center on main axis.' },
        { cls: 'cb-justify-between', es: 'Reparte con espacio entre.', en: 'Space between items.' },
      ],
    },
    {
      id: 'spacing',
      es: 'Espaciado',
      en: 'Spacing',
      rows: [
        { cls: 'cb-gap-2', es: 'Separación entre hijos (token space-2).', en: 'Gap between children (space-2 token).' },
        { cls: 'cb-gap-4', es: 'Separación mayor (space-4).', en: 'Larger gap (space-4).' },
        { cls: 'cb-p-4', es: 'Relleno interno (space-4).', en: 'Inner padding (space-4).' },
        { cls: 'cb-m-4', es: 'Margen externo (space-4).', en: 'Outer margin (space-4).' },
      ],
    },
    {
      id: 'sizing',
      es: 'Tamaño',
      en: 'Sizing',
      rows: [
        { cls: 'cb-w-full', es: 'Ancho 100%.', en: 'Full width.' },
        { cls: 'cb-h-full', es: 'Alto 100%.', en: 'Full height.' },
        { cls: 'cb-max-w-full', es: 'Ancho máximo 100%.', en: 'Max width 100%.' },
        { cls: 'cb-min-w-0', es: 'Permite encogerse en flex.', en: 'Allows shrinking in flex.' },
      ],
    },
  ];
}
