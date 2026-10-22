import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

/** Distancia (px) al final por debajo de la cual la lista sigue los mensajes nuevos. */
const PIN_THRESHOLD = 48;

/**
 * Lista de mensajes de chat de CaribeNG (`role="log"`). Se mantiene pegada al
 * final mientras llegan mensajes o se alarga una respuesta en streaming, pero
 * no mueve el scroll si el usuario subió a leer: entonces ofrece "Ir al último
 * mensaje". Con `typing` muestra el indicador de escritura.
 *
 * Accesibilidad: con `busy` (respuesta generándose) el log se marca
 * `aria-busy` para que el lector no lea cada fragmento, y al terminar se
 * anuncia "Respuesta lista".
 *
 * @example
 * ```html
 * <cb-chat-messages [busy]="generando()" [typing]="pensando()" style="height: 30rem">
 *   @for (m of mensajes(); track m.id) {
 *     <cb-chat-message [role]="m.role" [text]="m.text" />
 *   }
 * </cb-chat-messages>
 * ```
 */
@Component({
  selector: 'cb-chat-messages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-chat-messages' },
  template: `
    <div
      #scroller
      class="cb-chat-messages__scroller"
      role="log"
      tabindex="0"
      [attr.aria-label]="ariaLabel() ?? t().chatConversation"
      [attr.aria-busy]="busy() ? 'true' : null"
      (scroll)="onScroll()"
    >
      <div #content class="cb-chat-messages__content">
        <ng-content />
        @if (typing()) {
          <div class="cb-chat-messages__typing">
            <span class="cb-chat-messages__dots" aria-hidden="true"><span></span><span></span><span></span></span>
            <span class="cb-chat-messages__typing-label">{{ typingLabel() ?? t().chatTyping }}</span>
          </div>
        }
      </div>
    </div>
    @if (!pinned()) {
      <button type="button" class="cb-chat-messages__jump" (click)="scrollToBottom(true)">
        <cb-icon name="arrow-down" [size]="16" aria-hidden="true" />
        <span>{{ t().chatJumpToLatest }}</span>
      </button>
    }
    <div class="cb-chat-messages__status" role="status">{{ announcement() }}</div>
  `,
  styleUrl: './chat-messages.component.css',
})
export class CbChatMessages {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');

  /** Una respuesta se está generando (marca el log como ocupado). */
  readonly busy = input(false, { transform: booleanAttribute });
  /** Muestra el indicador "Escribiendo…". */
  readonly typing = input(false, { transform: booleanAttribute });
  /** Texto del indicador (p. ej. "Laura está escribiendo…"). */
  readonly typingLabel = input<string | undefined>(undefined);
  /** Nombre del log. Por defecto, "Conversación". */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** La vista está en el final (sigue los mensajes nuevos). */
  readonly pinned = signal(true);
  protected readonly announcement = signal('');
  private wasBusy = false;

  constructor() {
    afterNextRender(() => {
      this.scrollToBottom(false);
      const view = this.document.defaultView as (Window & { ResizeObserver?: typeof ResizeObserver; MutationObserver?: typeof MutationObserver }) | null;
      const follow = () => {
        if (this.pinned()) this.scrollToBottom(false);
      };
      const content = this.content().nativeElement;
      if (view?.ResizeObserver) {
        const resize = new view.ResizeObserver(follow);
        resize.observe(content);
        this.destroyRef.onDestroy(() => resize.disconnect());
      }
      if (view?.MutationObserver) {
        const mutation = new view.MutationObserver(follow);
        mutation.observe(content, { childList: true, subtree: true, characterData: true });
        this.destroyRef.onDestroy(() => mutation.disconnect());
      }
    });

    // Al terminar una respuesta, se anuncia una sola vez (en vez de cada fragmento).
    effect(() => {
      const busy = this.busy();
      untracked(() => {
        if (this.wasBusy && !busy) this.announcement.set(this.t().chatResponseReady);
        else if (busy) this.announcement.set('');
        this.wasBusy = busy;
      });
    });
  }

  protected onScroll(): void {
    const el = this.scroller().nativeElement;
    this.pinned.set(el.scrollHeight - el.scrollTop - el.clientHeight <= PIN_THRESHOLD);
  }

  /** Lleva la vista al último mensaje y vuelve a seguir los nuevos. */
  scrollToBottom(smooth = true): void {
    const el = this.scroller().nativeElement;
    const reduce = this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (typeof el.scrollTo === 'function') el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reduce ? 'smooth' : 'auto' });
    else el.scrollTop = el.scrollHeight;
    this.pinned.set(true);
  }
}
