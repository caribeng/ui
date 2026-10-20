import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { CodeBlockComponent } from '../shared/code-block.component';
import { I18nService } from '../services/i18n.service';
import { DocCodeService } from '../services/doc-code.service';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'cb-doc-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlockComponent],
  template: `
    <section class="cb-doc-example" [id]="anchor()">
      <h2><a [href]="'#' + anchor()">{{ i18n.auto(title()) }}</a></h2>
      @if (description()) { <p>{{ i18n.auto(description()) }}</p> }
      <div class="cb-doc-example__demo"><ng-content /></div>
      @if (code()) {
        @if (tsCode()) {
          <div class="cb-doc-example__tabs" role="tablist">
            <button type="button" role="tab" [attr.aria-selected]="tab() === 'html'" (click)="tab.set('html')">HTML</button>
            <button type="button" role="tab" [attr.aria-selected]="tab() === 'ts'" (click)="tab.set('ts')">TypeScript</button>
          </div>
        }
        @if (tab() === 'ts' && tsCode()) {
          <doc-code-block [code]="tsCode()" lang="typescript" />
        } @else {
          <doc-code-block [code]="code()" lang="markup" />
        }
      }
    </section>
  `,
  styles: [`
    :host { display:block; }
    .cb-doc-example { margin:1.5rem 0; scroll-margin-top:5rem; }
    .cb-doc-example h2 a { color:inherit; text-decoration:none; }
    .cb-doc-example h2 a:hover { color:var(--cb-color-primary-500); }
    .cb-doc-example p { color:var(--cb-color-text-muted); }
    .cb-doc-example__demo { display:flex; align-items:center; min-height:4rem; padding:1rem; border:1px solid var(--cb-color-border); border-radius:var(--cb-radius-md); }
    .cb-doc-example__tabs { display:flex; gap:var(--cb-space-1); margin:.75rem 0 .5rem; }
    .cb-doc-example__tabs button { font:inherit; font-size:var(--cb-text-sm); font-weight:var(--cb-font-weight-medium); color:var(--cb-color-text-muted); background:transparent; border:none; padding:var(--cb-space-1) var(--cb-space-3); border-radius:var(--cb-radius-sm); cursor:pointer; }
    .cb-doc-example__tabs button:hover { color:var(--cb-color-text); background:var(--cb-color-surface-100); }
    .cb-doc-example__tabs button[aria-selected="true"] { color:var(--cb-color-primary-500); background:color-mix(in srgb, var(--cb-color-primary-500) 12%, transparent); }
  `],
})
export class CbDocExampleComponent {
  protected readonly i18n = inject(I18nService);
  private readonly docCode = inject(DocCodeService);
  readonly title = input.required<string>();
  readonly description = input('');
  readonly code = input('');
  /** Ancla de la sección; por defecto se deriva del título. */
  readonly id = input('');

  protected readonly anchor = computed(
    () =>
      this.id() ||
      this.title()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
  );
  protected readonly tab = signal<'html' | 'ts'>('html');
  /** Componente standalone completo generado por `scripts/gen-doc-code.mjs`. */
  protected readonly tsCode = computed(() => this.docCode.forHtml(this.code()));

  constructor() {
    const toc = inject(TocService);
    afterNextRender(() => {
      this.docCode.load();
      toc.register({ id: this.anchor(), label: this.title() });
    });
  }
}
