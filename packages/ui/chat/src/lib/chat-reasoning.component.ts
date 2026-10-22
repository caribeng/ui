import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  input,
  model,
  untracked,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import { cbMarkdownToHtml } from './markdown';

let nextUid = 0;

/**
 * Razonamiento del modelo ("Pensando…"), plegable. Mientras llega se abre y
 * muestra un brillo; al terminar se pliega solo (`autoCollapse`) y resume
 * "Razonó durante N s". El texto admite markdown seguro.
 *
 * @example
 * ```html
 * <cb-chat-reasoning [text]="m.reasoning" [streaming]="m.pensando" [duration]="m.segundos" />
 * ```
 */
@Component({
  selector: 'cb-chat-reasoning',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-chat-reasoning', '[class.cb-chat-reasoning--streaming]': 'streaming()' },
  template: `
    <button
      type="button"
      class="cb-chat-reasoning__toggle"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="uid"
      (click)="open.set(!open())"
    >
      <cb-icon name="sparkles" [size]="14" aria-hidden="true" />
      <span class="cb-chat-reasoning__label">{{ summary() }}</span>
      <cb-icon class="cb-chat-reasoning__chevron" name="chevron-down" [size]="14" aria-hidden="true" />
    </button>
    @if (open()) {
      <div class="cb-chat-reasoning__body" [id]="uid" role="region" [attr.aria-label]="t().chatReasoning" [attr.aria-busy]="streaming() ? 'true' : null">
        @if (text()) {
          <div class="cb-chat-reasoning__markdown" [innerHTML]="html()"></div>
        }
        <ng-content />
      </div>
    }
  `,
  styleUrl: './chat-reasoning.component.css',
})
export class CbChatReasoning {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly uid = `cb-chat-reasoning-${++nextUid}`;

  /** Texto del razonamiento (markdown). */
  readonly text = input<string>('');
  /** El razonamiento sigue llegando. */
  readonly streaming = input(false, { transform: booleanAttribute });
  /** Segundos que duró (se muestra al terminar). */
  readonly duration = input<number | undefined>(undefined);
  /** Desplegado. */
  readonly open = model(false);
  /** Se abre mientras llega y se pliega al terminar. */
  readonly autoCollapse = input(true, { transform: booleanAttribute });

  protected readonly html = computed(() => cbMarkdownToHtml(this.text()));
  protected readonly summary = computed(() => {
    if (this.streaming()) return this.t().chatThinking;
    const seconds = this.duration();
    return seconds !== undefined ? cbFormat(this.t().chatThoughtFor, String(Math.max(1, Math.round(seconds)))) : this.t().chatReasoning;
  });

  constructor() {
    effect(() => {
      const streaming = this.streaming();
      untracked(() => {
        if (this.autoCollapse()) this.open.set(streaming);
      });
    });
  }
}
