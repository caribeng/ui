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
import { DocCodeService } from '../services/doc-code.service';
import { I18nService } from '../services/i18n.service';

/**
 * Bloque de documentación: título anclado, demo en vivo y código (HTML/TypeScript).
 * La pestaña TypeScript muestra el componente standalone completo generado por
 * `scripts/gen-doc-code.mjs`; un `codeTs` manual solo se usa si no hay generado
 * o si ya es un componente completo (`@Component`).
 */
@Component({
  selector: 'doc-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'fsOpen.set(false)' },
  imports: [CodeBlockComponent, CbIcon],
  template: `
    <section [id]="id()" class="doc-section">
      <h2 class="doc-section__title">
        <a [href]="'#' + id()" class="doc-section__anchor">{{ i18n.auto(title()) }}</a>
      </h2>
      @if (description()) {
        <p class="doc-section__desc">{{ i18n.auto(description()) }}</p>
      }

      <div class="doc-card">
        <div class="doc-card__demo" [class.doc-card__demo--fs]="fsOpen()">
          <button
            type="button"
            class="doc-card__fs-btn"
            [attr.aria-label]="fsOpen() ? i18n.t('Salir de pantalla completa', 'Exit full screen') : i18n.t('Pantalla completa', 'Full screen')"
            (click)="fsOpen.set(!fsOpen())"
          >
            <cb-icon [name]="fsOpen() ? 'x' : 'expand'" [size]="16" aria-hidden="true" />
          </button>
          <ng-content />
        </div>

        @if (code() || tsCode()) {
          <div class="doc-card__toolbar">
            @if (code() && tsCode()) {
              <div class="doc-card__tabs">
                <button
                  type="button"
                  class="doc-card__tab"
                  [class.doc-card__tab--active]="tab() === 'html'"
                  (click)="tab.set('html')"
                >
                  HTML
                </button>
                <button
                  type="button"
                  class="doc-card__tab"
                  [class.doc-card__tab--active]="tab() === 'ts'"
                  (click)="tab.set('ts')"
                >
                  TypeScript
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
            } @else if (tsCode()) {
              <doc-code-block [code]="tsCode()" lang="typescript" />
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
  private readonly docCode = inject(DocCodeService);
  protected readonly i18n = inject(I18nService);

  readonly id = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly code = input<string>('');
  readonly codeTs = input<string>('');

  protected readonly showCode = signal(false);
  protected readonly fsOpen = signal(false);
  protected readonly tab = signal<'html' | 'ts'>('html');
  protected readonly tsCode = computed(() => {
    const manual = this.codeTs();
    if (manual.includes('@Component')) return manual;
    return this.docCode.forHtml(this.code()) || manual;
  });
  protected readonly currentTab = computed(() =>
    this.code() ? this.tab() : 'ts',
  );

  constructor() {
    afterNextRender(() => {
      this.docCode.load();
      // La etiqueta se guarda en español; el TOC la traduce al renderizar.
      this.toc.register({ id: this.id(), label: this.title() });
    });
  }
}
