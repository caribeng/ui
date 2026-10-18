import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CodeBlockComponent } from './code-block.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

/** Bloque de documentación: título anclado, demo en vivo y código (Template/Component). */
@Component({
  selector: 'doc-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlockComponent, CbIcon],
  template: `
    <section [id]="id()" class="doc-section">
      <h2 class="doc-section__title">
        <a [href]="'#' + id()" class="doc-section__anchor">{{ title() }}</a>
      </h2>
      @if (description()) {
        <p class="doc-section__desc">{{ description() }}</p>
      }

      <div class="doc-card">
        <div class="doc-card__demo">
          <ng-content />
        </div>

        @if (code() || codeTs()) {
          <div class="doc-card__toolbar">
            @if (code() && codeTs()) {
              <div class="doc-card__tabs">
                <button
                  type="button"
                  class="doc-card__tab"
                  [class.doc-card__tab--active]="tab() === 'html'"
                  (click)="tab.set('html')"
                >
                  Template
                </button>
                <button
                  type="button"
                  class="doc-card__tab"
                  [class.doc-card__tab--active]="tab() === 'ts'"
                  (click)="tab.set('ts')"
                >
                  Component
                </button>
              </div>
            }
            <button
              type="button"
              class="doc-card__toggle"
              style="display: inline-flex; align-items: center; gap: 0.35rem"
              (click)="showCode.set(!showCode())"
            >
              <cb-icon [name]="showCode() ? 'chevron-up' : 'chevron-down'" [size]="16" aria-hidden="true" />
              {{ showCode() ? i18n.t('Ocultar código', 'Hide code') : i18n.t('Ver código', 'Show code') }}
            </button>
          </div>

          @if (showCode()) {
            @if (currentTab() === 'html' && code()) {
              <doc-code-block [code]="code()!" lang="markup" />
            } @else if (codeTs()) {
              <doc-code-block [code]="codeTs()!" lang="typescript" />
            }
          }
        }
      </div>
    </section>
  `,
  styleUrl: './doc-section.component.css',
})
export class DocSectionComponent {
  private readonly toc = inject(TocService);
  protected readonly i18n = inject(I18nService);

  readonly id = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly code = input<string>('');
  readonly codeTs = input<string>('');

  protected readonly showCode = signal(false);
  protected readonly tab = signal<'html' | 'ts'>('html');
  protected readonly currentTab = computed(() =>
    this.code() ? this.tab() : 'ts',
  );

  constructor() {
    afterNextRender(() => {
      this.toc.register({ id: this.id(), label: this.title() });
    });
  }
}
