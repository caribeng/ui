import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CodeBlockComponent } from '../shared/code-block.component';

@Component({
  selector: 'cb-doc-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlockComponent],
  template: `
    <section class="cb-doc-example">
      <h2>{{ title() }}</h2>
      @if (description()) { <p>{{ description() }}</p> }
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
  readonly title = input.required<string>();
  readonly description = input('');
  readonly code = input('');
}
