import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';
import { CbCopyButton } from '@caribeng/ui/copy-button';
import { CbIcon } from '@caribeng/ui/icon';
import { cbMarkdownToHtml } from './markdown';

/** Quién escribe el mensaje. */
export type CbChatRole = 'user' | 'assistant' | 'system';
/** Estado de envío de un mensaje propio. */
export type CbChatStatus = 'sending' | 'sent' | 'error';

/**
 * Mensaje de chat de CaribeNG: burbuja con autor, hora, avatar y estado de
 * envío. `text` se pinta como markdown seguro; también acepta contenido
 * proyectado. Con `streaming` muestra un cursor mientras llega la respuesta.
 *
 * @example
 * ```html
 * <cb-chat-message role="user" text="¿Cuál es mi saldo?" time="10:30" />
 * <cb-chat-message role="assistant" [text]="respuesta" [streaming]="generando" copyable />
 * ```
 */
@Component({
  selector: 'cb-chat-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon, CbCopyButton],
  host: {
    class: 'cb-chat-message',
    role: 'article',
    '[class.cb-chat-message--user]': "role() === 'user'",
    '[class.cb-chat-message--assistant]': "role() === 'assistant'",
    '[class.cb-chat-message--system]': "role() === 'system'",
    '[class.cb-chat-message--error]': "status() === 'error'",
    '[attr.aria-label]': 'label()',
    '[attr.aria-busy]': 'streaming() ? "true" : null',
  },
  template: `
    @if (role() !== 'system' && showAvatar()) {
      <span class="cb-chat-message__avatar" aria-hidden="true">
        @if (avatar()) {
          <img [src]="avatar()" alt="" />
        } @else if (role() === 'assistant') {
          <cb-icon name="sparkles" [size]="16" />
        } @else {
          {{ initials() }}
        }
      </span>
    }
    <div class="cb-chat-message__body">
      @if (role() !== 'system' && (showAuthor() || time())) {
        <div class="cb-chat-message__meta" aria-hidden="true">
          @if (showAuthor()) {
            <span class="cb-chat-message__author">{{ authorName() }}</span>
          }
          @if (time()) {
            <span class="cb-chat-message__time">{{ time() }}</span>
          }
        </div>
      }
      <div class="cb-chat-message__bubble">
        @if (text()) {
          @if (markdown()) {
            <div class="cb-chat-message__markdown" [innerHTML]="html()"></div>
          } @else {
            <p class="cb-chat-message__plain">{{ text() }}</p>
          }
        }
        <ng-content />
        @if (streaming()) {
          <span class="cb-chat-message__caret" aria-hidden="true"></span>
        }
      </div>
      <div class="cb-chat-message__footer">
        @switch (status()) {
          @case ('sending') {
            <span class="cb-chat-message__status">{{ t().chatSending }}</span>
          }
          @case ('error') {
            <span class="cb-chat-message__status cb-chat-message__status--error">
              <cb-icon name="circle-alert" [size]="14" aria-hidden="true" /> {{ t().chatError }}
            </span>
            <button type="button" class="cb-chat-message__action" (click)="retry.emit()">
              <cb-icon name="rotate-ccw" [size]="14" aria-hidden="true" /> {{ t().chatRetry }}
            </button>
          }
        }
        <ng-content select="[cb-chat-message-actions]" />
        @if (copyable() && text() && !streaming()) {
          <cb-copy-button [value]="text()" size="sm" />
        }
      </div>
    </div>
  `,
  styleUrl: './chat-message.component.css',
})
export class CbChatMessage {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();

  readonly role = input<CbChatRole>('assistant');
  /** Contenido del mensaje (markdown por defecto). */
  readonly text = input<string>('');
  /** Interpreta `text` como markdown seguro. Con `false` se muestra tal cual. */
  readonly markdown = input(true, { transform: booleanAttribute });
  /** Nombre del autor. Por defecto, "Tú" o "Asistente". */
  readonly author = input<string | undefined>(undefined);
  /** Hora o fecha ya formateada ("10:30"). */
  readonly time = input<string>('');
  /** Imagen del avatar. Sin ella, iniciales (usuario) o un icono (asistente). */
  readonly avatar = input<string>('');
  readonly showAvatar = input(true, { transform: booleanAttribute });
  readonly showAuthor = input(false, { transform: booleanAttribute });
  /** Estado de envío (mensajes propios). `error` muestra "Reintentar". */
  readonly status = input<CbChatStatus | undefined>(undefined);
  /** La respuesta sigue llegando: muestra un cursor y marca el mensaje como ocupado. */
  readonly streaming = input(false, { transform: booleanAttribute });
  /** Botón para copiar el texto (cuando termina de llegar). */
  readonly copyable = input(false, { transform: booleanAttribute });

  /** Se pulsó "Reintentar" en un mensaje con error. */
  readonly retry = output<void>();

  protected readonly html = computed(() => cbMarkdownToHtml(this.text()));
  protected readonly authorName = computed(
    () => this.author() ?? (this.role() === 'user' ? this.t().chatYou : this.t().chatAssistant),
  );
  protected readonly initials = computed(() =>
    this.authorName()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join(''),
  );
  protected readonly label = computed(() => {
    if (this.role() === 'system') return null;
    return this.time() ? `${this.authorName()}, ${this.time()}` : this.authorName();
  });
}
