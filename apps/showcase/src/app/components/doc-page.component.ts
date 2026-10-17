import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DocPageHeaderComponent } from '../shared/page-header.component';

export interface CbDocApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

@Component({
  selector: 'cb-doc-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPageHeaderComponent],
  template: `
    <div class="cb-doc-page">
      <doc-page-header [eyebrow]="category()" [title]="title()" [lead]="subtitle()" />
      <section class="cb-doc-page__import">
        <h2>Import</h2>
        <pre><code>{{ importCode() }}</code></pre>
      </section>
      <ng-content />
      @if (api().length) {
        <section class="cb-doc-page__api">
          <h2>API</h2>
          <div class="cb-doc-page__table-wrap">
            <table>
              <thead><tr><th>Nombre</th><th>Tipo</th><th>Por defecto</th><th>Descripción</th></tr></thead>
              <tbody>@for (row of api(); track row.name) {
                <tr><td><code>{{ row.name }}</code></td><td><code>{{ row.type }}</code></td><td><code>{{ row.default }}</code></td><td>{{ row.description }}</td></tr>
              }</tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    :host { display:block; color:var(--cb-color-text); }
    .cb-doc-page__import, .cb-doc-page__api { margin:1.5rem 0; }
    h2 { font-size:1.2rem; }
    pre { overflow:auto; padding:1rem; border-radius:var(--cb-radius-md); background:var(--cb-color-surface-raised); }
    .cb-doc-page__table-wrap { overflow:auto; }
    table { width:100%; border-collapse:collapse; }
    th, td { padding:.65rem; border-bottom:1px solid var(--cb-color-border); text-align:left; }
  `],
})
export class CbDocPageComponent {
  readonly category = input('');
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly importCode = input('');
  readonly api = input<readonly CbDocApiRow[]>([]);
}
