import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

/** Mensaje que el usuario envía. */
export interface CbChatSendEvent {
  readonly text: string;
  readonly files: readonly File[];
}

let nextUid = 0;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Campo para escribir mensajes (prompt) de CaribeNG: crece con el texto hasta
 * `maxRows`, envía con Enter (Shift + Enter = salto de línea, respetando la
 * composición de teclados asiáticos), adjunta archivos (botón, pegar o
 * arrastrar), muestra sugerencias y, mientras se genera una respuesta, cambia
 * "Enviar" por "Detener".
 *
 * @example
 * ```html
 * <cb-chat-input [streaming]="generando()" attachments (send)="enviar($event)" (stop)="detener()" />
 * ```
 */
@Component({
  selector: 'cb-chat-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-chat-input',
    '[class.cb-chat-input--disabled]': 'disabled()',
    '[class.cb-chat-input--dragging]': 'dragging()',
  },
  template: `
    @if (suggestions().length && !value() && !files().length) {
      <div class="cb-chat-input__suggestions">
        @for (s of suggestions(); track s) {
          <button type="button" class="cb-chat-input__suggestion" [disabled]="disabled() || streaming()" (click)="useSuggestion(s)">{{ s }}</button>
        }
      </div>
    }
    <form
      class="cb-chat-input__box"
      (submit)="$event.preventDefault(); submit()"
      (dragover)="onDragOver($event)"
      (dragleave)="dragging.set(false)"
      (drop)="onDrop($event)"
    >
      @if (files().length) {
        <ul class="cb-chat-input__files" role="list">
          @for (file of files(); track $index) {
            <li class="cb-chat-input__file">
              <cb-icon [name]="file.type.startsWith('image/') ? 'image' : 'file'" [size]="16" aria-hidden="true" />
              <span class="cb-chat-input__file-name">{{ file.name }}</span>
              <span class="cb-chat-input__file-size">{{ size(file) }}</span>
              <button type="button" class="cb-chat-input__file-remove" [attr.aria-label]="fmt(t().removeItem, file.name)" (click)="removeFile($index)">
                <cb-icon name="x" [size]="14" aria-hidden="true" />
              </button>
            </li>
          }
        </ul>
      }
      <div class="cb-chat-input__row">
        @if (attachments()) {
          <button type="button" class="cb-chat-input__icon-btn" [attr.aria-label]="t().chatAttach" [disabled]="disabled()" (click)="fileInput.click()">
            <cb-icon name="plus" [size]="20" aria-hidden="true" />
          </button>
          <input #fileInput type="file" hidden [attr.accept]="accept() || null" [multiple]="multiple()" (change)="onFilesChosen($event)" />
        }
        <textarea
          #textarea
          class="cb-chat-input__textarea"
          rows="1"
          [id]="inputId"
          [value]="value()"
          [placeholder]="placeholder() ?? t().chatPlaceholder"
          [disabled]="disabled()"
          [attr.maxlength]="maxLength() || null"
          [attr.aria-label]="ariaLabel() ?? t().chatMessage"
          [attr.aria-describedby]="maxLength() ? inputId + '-count' : null"
          (input)="onInput($event)"
          (keydown)="onKeydown($event)"
          (paste)="onPaste($event)"
        ></textarea>
        @if (streaming()) {
          <button type="button" class="cb-chat-input__send cb-chat-input__send--stop" [attr.aria-label]="t().chatStop" (click)="stop.emit()">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" /></svg>
          </button>
        } @else {
          <button type="submit" class="cb-chat-input__send" [attr.aria-label]="t().chatSend" [disabled]="!canSend()">
            <cb-icon name="arrow-up" [size]="18" aria-hidden="true" />
          </button>
        }
      </div>
    </form>
    @if (maxLength()) {
      <div class="cb-chat-input__count" [id]="inputId + '-count'">{{ value().length }} / {{ maxLength() }}</div>
    }
  `,
  styleUrl: './chat-input.component.css',
})
export class CbChatInput {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly injector = inject(Injector);
  private readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');
  protected readonly inputId = `cb-chat-input-${++nextUid}`;

  /** Texto escrito (bidireccional). */
  readonly value = model('');
  /** Archivos adjuntos (bidireccional). */
  readonly files = model<readonly File[]>([]);
  readonly placeholder = input<string | undefined>(undefined);
  /** Nombre del campo. Por defecto, "Mensaje". */
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Se está generando una respuesta: muestra "Detener" y no deja enviar. */
  readonly streaming = input(false, { transform: booleanAttribute });
  /** Permite adjuntar archivos (botón, pegar o arrastrar). */
  readonly attachments = input(false, { transform: booleanAttribute });
  /** Tipos aceptados (`image/*,.pdf`). */
  readonly accept = input<string>('');
  readonly multiple = input(true, { transform: booleanAttribute });
  /** Máximo de caracteres, con contador. 0 = sin límite. */
  readonly maxLength = input<number>(0);
  /** Filas máximas antes de hacer scroll. */
  readonly maxRows = input<number>(8);
  /** Enter envía (Shift + Enter, salto de línea). Con `false`, Ctrl/⌘ + Enter envía. */
  readonly submitOnEnter = input(true, { transform: booleanAttribute });
  /** Vacía el campo y los adjuntos al enviar. */
  readonly clearOnSend = input(true, { transform: booleanAttribute });
  /** Sugerencias de inicio (se muestran con el campo vacío; al pulsar, se envían). */
  readonly suggestions = input<readonly string[]>([]);

  /** El usuario envió un mensaje. */
  readonly send = output<CbChatSendEvent>();
  /** El usuario pidió detener la respuesta. */
  readonly stop = output<void>();

  protected readonly dragging = signal(false);
  protected readonly canSend = computed(
    () => !this.disabled() && !this.streaming() && (this.value().trim().length > 0 || this.files().length > 0),
  );

  constructor() {
    // Ajusta la altura cuando el valor cambia desde fuera (p. ej. al vaciarse tras enviar).
    effect(() => {
      this.value();
      untracked(() => afterNextRender(() => this.resize(), { injector: this.injector }));
    });
  }

  /** Enfoca el campo. */
  focus(): void {
    this.textarea().nativeElement.focus();
  }

  /** Envía el mensaje si hay texto o adjuntos. */
  submit(): void {
    if (!this.canSend()) return;
    this.send.emit({ text: this.value().trim(), files: [...this.files()] });
    if (this.clearOnSend()) {
      this.value.set('');
      this.files.set([]);
    }
  }

  protected size(file: File): string {
    return formatSize(file.size);
  }

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLTextAreaElement).value);
    this.resize();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.isComposing || event.keyCode === 229) return;
    const mod = event.ctrlKey || event.metaKey;
    const sends = this.submitOnEnter() ? !event.shiftKey : mod;
    if (!sends) return;
    event.preventDefault();
    this.submit();
  }

  protected useSuggestion(text: string): void {
    this.value.set(text);
    this.submit();
  }

  protected onFilesChosen(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
    input.value = '';
  }

  protected onPaste(event: ClipboardEvent): void {
    if (!this.attachments()) return;
    const pasted = Array.from(event.clipboardData?.files ?? []);
    if (!pasted.length) return;
    event.preventDefault();
    this.addFiles(pasted);
  }

  protected onDragOver(event: DragEvent): void {
    if (!this.attachments() || this.disabled() || !event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    this.dragging.set(false);
    if (!this.attachments() || this.disabled()) return;
    const dropped = Array.from(event.dataTransfer?.files ?? []);
    if (!dropped.length) return;
    event.preventDefault();
    this.addFiles(dropped);
  }

  protected removeFile(index: number): void {
    this.files.update((list) => list.filter((_f, i) => i !== index));
    this.focus();
  }

  private addFiles(incoming: File[]): void {
    const accepted = incoming.filter((file) => this.isAccepted(file));
    if (!accepted.length) return;
    this.files.update((list) => (this.multiple() ? [...list, ...accepted] : [accepted[0]]));
  }

  private isAccepted(file: File): boolean {
    const accept = this.accept().trim();
    if (!accept) return true;
    return accept.split(',').some((rule) => {
      const r = rule.trim().toLowerCase();
      if (!r) return false;
      if (r.startsWith('.')) return file.name.toLowerCase().endsWith(r);
      if (r.endsWith('/*')) return file.type.toLowerCase().startsWith(r.slice(0, -1));
      return file.type.toLowerCase() === r;
    });
  }

  private resize(): void {
    const el = this.textarea().nativeElement;
    const style = el.ownerDocument.defaultView?.getComputedStyle(el);
    const line = parseFloat(style?.lineHeight ?? '') || 20;
    const padding = (parseFloat(style?.paddingTop ?? '') || 0) + (parseFloat(style?.paddingBottom ?? '') || 0);
    el.style.height = 'auto';
    const max = line * Math.max(1, this.maxRows()) + padding;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
  }
}
