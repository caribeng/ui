import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';
import { CbCodeBlock } from '@caribeng/ui/code-block';
import { CbCopyButton } from '@caribeng/ui/copy-button';
import { CbIcon } from '@caribeng/ui/icon';
import { cbMarkdownToBlocks } from './markdown';

/** Quién escribe el mensaje. */
export type CbChatRole = 'user' | 'assistant' | 'system';
/** Estado de envío de un mensaje propio. */
export type CbChatStatus = 'sending' | 'sent' | 'error';
/** Valoración de una respuesta. */
export type CbChatFeedback = 'up' | 'down' | null;

/** Archivo adjunto a un mensaje. */
export interface CbChatAttachment {
  readonly name: string;
  /** Tipo MIME (`image/png`); las imágenes se muestran en miniatura. */
  readonly type?: string;
  /** Tamaño en bytes. */
  readonly size?: number;
  /** URL para ver o descargar (y la miniatura de las imágenes). */
  readonly url?: string;
}

function formatSize(bytes: number | undefined): string {
  if (bytes === undefined) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Mensaje de chat de CaribeNG: burbuja con autor, hora, avatar y estado de
 * envío. `text` se pinta como markdown seguro y sus bloques de código con
 * `cb-code-block` (resaltado y copiar). Admite adjuntos, valoración 👍/👎 y
 * "Regenerar"; con `streaming` muestra un cursor mientras llega la respuesta.
 * El contenido proyectado (p. ej. `cb-chat-reasoning`, `cb-chat-tool`) va
 * antes del texto.
 *
 * @example
 * ```html
 * <cb-chat-message role="user" text="¿Cuál es mi saldo?" time="10:30" />
 * <cb-chat-message role="assistant" [text]="respuesta" [streaming]="generando" copyable showFeedback [(feedback)]="voto" />
 * ```
 */
@Component({
  selector: 'cb-chat-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon, CbCopyButton, CbCodeBlock],
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
      <ng-content select="cb-chat-reasoning, cb-chat-tool, [cb-chat-message-before]" />
      @if (attachments().length) {
        <ul class="cb-chat-message__attachments" role="list" [attr.aria-label]="t().chatAttachments">
          @for (a of attachments(); track $index) {
            <li class="cb-chat-message__attachment">
              @if (isImage(a) && a.url) {
                <a class="cb-chat-message__thumb" [href]="a.url" target="_blank" rel="noopener noreferrer">
                  <img [src]="a.url" [alt]="a.name" loading="lazy" />
                </a>
              } @else {
                <a class="cb-chat-message__file" [attr.href]="a.url || null" [attr.target]="a.url ? '_blank' : null" [attr.rel]="a.url ? 'noopener noreferrer' : null">
                  <cb-icon [name]="isImage(a) ? 'image' : 'file'" [size]="18" aria-hidden="true" />
                  <span class="cb-chat-message__file-text">
                    <span class="cb-chat-message__file-name">{{ a.name }}</span>
                    @if (a.size !== undefined) {
                      <span class="cb-chat-message__file-size">{{ size(a) }}</span>
                    }
                  </span>
                </a>
              }
            </li>
          }
        </ul>
      }
      <!-- Sin texto ni contenido proyectado queda vacía y el CSS la oculta (:empty). -->
      <div class="cb-chat-message__bubble">
          @if (text()) {
            @if (markdown()) {
              @for (block of blocks(); track $index) {
                @if (block.kind === 'html') {
                  <div class="cb-chat-message__markdown" [innerHTML]="block.html"></div>
                } @else {
                  <cb-code-block class="cb-chat-message__code" [code]="block.code" [language]="block.language" />
                }
              }
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
        @if (!streaming()) {
          @if (copyable() && text()) {
            <cb-copy-button [value]="text()" size="sm" />
          }
          @if (showFeedback()) {
            <button type="button" class="cb-chat-message__icon-btn" [attr.aria-pressed]="feedback() === 'up'" [attr.aria-label]="t().chatHelpful" (click)="vote('up')">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v11" /><path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 7A2 2 0 0 1 17.5 21H7V10l4.6-7.5a1.9 1.9 0 0 1 3.4 1.5z" /></svg>
            </button>
            <button type="button" class="cb-chat-message__icon-btn" [attr.aria-pressed]="feedback() === 'down'" [attr.aria-label]="t().chatNotHelpful" (click)="vote('down')">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 14V3" /><path d="M9 18.1 10 14H4.2a2 2 0 0 1-1.9-2.6l2.3-7A2 2 0 0 1 6.5 3H17v11l-4.6 7.5a1.9 1.9 0 0 1-3.4-1.5z" /></svg>
            </button>
          }
          @if (regenerable()) {
            <button type="button" class="cb-chat-message__icon-btn" [attr.aria-label]="t().chatRegenerate" (click)="regenerate.emit()">
              <cb-icon name="refresh-cw" [size]="15" aria-hidden="true" />
            </button>
          }
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
  /** Archivos adjuntos (las imágenes con URL, en miniatura). */
  readonly attachments = input<readonly CbChatAttachment[]>([]);
  /** Muestra los botones 👍 / 👎. */
  readonly showFeedback = input(false, { transform: booleanAttribute });
  /** Valoración elegida (bidireccional). Pulsar la misma la quita. */
  readonly feedback = model<CbChatFeedback>(null);
  /** Muestra el botón "Regenerar respuesta". */
  readonly regenerable = input(false, { transform: booleanAttribute });

  /** Se pulsó "Reintentar" en un mensaje con error. */
  readonly retry = output<void>();
  /** Se pulsó "Regenerar respuesta". */
  readonly regenerate = output<void>();

  protected readonly blocks = computed(() => cbMarkdownToBlocks(this.text()));
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

  protected isImage(a: CbChatAttachment): boolean {
    return !!a.type?.startsWith('image/');
  }

  protected size(a: CbChatAttachment): string {
    return formatSize(a.size);
  }

  protected vote(value: 'up' | 'down'): void {
    this.feedback.set(this.feedback() === value ? null : value);
  }
}
