import { ChangeDetectionStrategy, Component, afterNextRender, inject, input } from '@angular/core';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { I18nService } from '../services/i18n.service';
import { TocService } from '../services/toc.service';

export interface CbDocApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/**
 * Página de documentación (Caribe Design): encabezado → Importación → ejemplos
 * proyectados (incluido el playground al final) → API (solo si no hay playground).
 */
@Component({
  selector: 'cb-doc-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPageHeaderComponent, CodeBlockComponent],
  template: `
    <div class="cb-doc-page">
      <doc-page-header [eyebrow]="i18n.auto(category())" [title]="title()" [lead]="i18n.auto(subtitle())" />
      @if (importCode()) {
        <section id="import" class="cb-doc-page__import">
          <h2><a href="#import">{{ i18n.t('Importación', 'Import') }}</a></h2>
          <doc-code-block [code]="importCode()" lang="typescript" />
        </section>
      }
      <ng-content />
      @if (api().length) {
        <section id="api" class="cb-doc-page__api">
          <h2><a href="#api">API</a></h2>
          <div class="cb-doc-page__table-wrap">
            <table>
              <thead><tr><th>{{ i18n.t('Nombre', 'Name') }}</th><th>{{ i18n.t('Tipo', 'Type') }}</th><th>{{ i18n.t('Por defecto', 'Default') }}</th><th>{{ i18n.t('Descripción', 'Description') }}</th></tr></thead>
              <tbody>@for (row of api(); track row.name) {
                <tr><td><code>{{ row.name }}</code></td><td><code>{{ row.type }}</code></td><td><code>{{ row.default }}</code></td><td>{{ i18n.auto(row.description) }}</td></tr>
              }</tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    :host { display:block; color:var(--cb-color-text); }
    .cb-doc-page__import, .cb-doc-page__api { margin:1.5rem 0; scroll-margin-top:5rem; }
    h2 { font-size:1.2rem; }
    h2 a { color:inherit; text-decoration:none; }
    h2 a:hover { color:var(--cb-color-primary-500); }
    .cb-doc-page__table-wrap { overflow:auto; }
    table { width:100%; border-collapse:collapse; }
    th, td { padding:.65rem; border-bottom:1px solid var(--cb-color-border); text-align:left; }
  `],
})
export class CbDocPageComponent {
  protected readonly i18n = inject(I18nService);
  readonly category = input('');
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly importCode = input('');
  readonly api = input<readonly CbDocApiRow[]>([]);

  constructor() {
    const toc = inject(TocService);
    // Se crea antes que los ejemplos proyectados: reinicia el TOC de la página.
    toc.reset();
    afterNextRender(() => {
      if (this.importCode()) toc.register({ id: 'import', label: 'Importación' });
      if (this.api().length) toc.register({ id: 'api', label: 'API' });
    });
  }
}
