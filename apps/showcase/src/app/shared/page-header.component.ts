import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'doc-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-head">
      @if (eyebrow()) {
        <p class="page-head__eyebrow">{{ i18n.auto(eyebrow()) }}</p>
      }
      <h1 class="page-head__title">{{ i18n.auto(title()) }}</h1>
      @if (lead()) {
        <p class="page-head__lead">{{ i18n.auto(lead()) }}</p>
      }
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
        margin-bottom: var(--cb-space-8);
      }
      .page-head__eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: var(--cb-text-xs);
        font-weight: var(--cb-font-weight-bold);
        color: var(--cb-color-primary-600);
        margin: 0 0 var(--cb-space-2);
      }
      :host-context([data-theme='dark']) .page-head__eyebrow {
        color: var(--cb-color-primary-400);
      }
      .page-head__title {
        font-size: 2.25rem;
        line-height: 1.1;
        font-weight: var(--cb-font-weight-bold);
        color: var(--cb-color-text-strong);
        margin: 0 0 var(--cb-space-3);
      }
      .page-head__lead {
        font-size: var(--cb-text-lg);
        color: var(--cb-color-text-muted);
        margin: 0;
        max-width: 65ch;
      }
    `,
  ],
})
export class DocPageHeaderComponent {
  protected readonly i18n = inject(I18nService);
  readonly eyebrow = input<string>('');
  readonly title = input.required<string>();
  readonly lead = input<string>('');
}
