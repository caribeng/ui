import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CodeBlockComponent } from '../shared/code-block.component';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'cb-doc-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlockComponent],
  template: `
    <section class="cb-doc-example">
      <h2>{{ i18n.auto(title()) }}</h2>
      @if (description()) { <p>{{ i18n.auto(description()) }}</p> }
      <div class="cb-doc-example__demo"><ng-content /></div>
      @if (code()) { <doc-code-block [code]="code()" lang="markup" /> }
    </section>
  `,
  styles: [`
    :host { display:block; }
    .cb-doc-example { margin:1.5rem 0; }
    .cb-doc-example p { color:var(--cb-color-text-muted); }
    .cb-doc-example__demo { display:flex; align-items:center; min-height:4rem; padding:1rem; border:1px solid var(--cb-color-border); border-radius:var(--cb-radius-md); }
  `],
})
export class CbDocExampleComponent {
  protected readonly i18n = inject(I18nService);
  readonly title = input.required<string>();
  readonly description = input('');
  readonly code = input('');
}
