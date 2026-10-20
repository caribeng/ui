import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  effect,
  forwardRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CbIcon } from '@caribeng/ui/icon';

/**
 * Editor de CaribeNG: editor de texto enriquecido sin dependencias de terceros,
 * con barra de herramientas accesible (encabezados, formato, listas, cita,
 * alineación, enlaces, deshacer/rehacer) e integración CVA.
 */
@Component({
  selector: 'cb-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbEditor),
      multi: true,
    },
  ],
  host: {
    class: 'cb-editor',
    '[class.cb-is-disabled]': 'isDisabled()',
  },
  template: `
    <div class="cb-editor__toolbar" role="toolbar" aria-label="Formato de texto">
      <select
        class="cb-editor__select"
        [disabled]="isDisabled()"
        aria-label="Estilo de párrafo"
        (change)="format($any($event.target).value)"
      >
        <option value="P">Normal</option>
        <option value="H1">Título 1</option>
        <option value="H2">Título 2</option>
        <option value="H3">Título 3</option>
      </select>

      <span class="cb-editor__sep" aria-hidden="true"></span>

      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="exec('bold')" aria-label="Negrita">
        <strong aria-hidden="true">B</strong>
      </button>
      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="exec('italic')" aria-label="Cursiva">
        <em aria-hidden="true">I</em>
      </button>
      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="exec('underline')" aria-label="Subrayado">
        <span style="text-decoration: underline" aria-hidden="true">U</span>
      </button>
      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="exec('strikeThrough')" aria-label="Tachado">
        <span style="text-decoration: line-through" aria-hidden="true">S</span>
      </button>

      <span class="cb-editor__sep" aria-hidden="true"></span>

      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="exec('insertUnorderedList')" aria-label="Lista con viñetas">
        <span aria-hidden="true">•≡</span>
      </button>
      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="exec('insertOrderedList')" aria-label="Lista numerada">
        <span aria-hidden="true">1.</span>
      </button>
      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="format('BLOCKQUOTE')" aria-label="Cita">
        <span aria-hidden="true">❝</span>
      </button>

      <span class="cb-editor__sep" aria-hidden="true"></span>

      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="exec('justifyLeft')" aria-label="Alinear a la izquierda">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
      </button>
      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="exec('justifyCenter')" aria-label="Centrar">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
      </button>
      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="exec('justifyRight')" aria-label="Alinear a la derecha">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
      </button>

      <span class="cb-editor__sep" aria-hidden="true"></span>

      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="insertLink()" aria-label="Insertar enlace">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </button>
      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="pickImage()" aria-label="Insertar imagen">
        <cb-icon name="image" [size]="15" aria-hidden="true" />
      </button>
      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="exec('removeFormat')" aria-label="Limpiar formato">
        <span aria-hidden="true">T✕</span>
      </button>

      <span class="cb-editor__sep" aria-hidden="true"></span>

      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="exec('undo')" aria-label="Deshacer">
        <cb-icon name="undo" [size]="15" aria-hidden="true" />
      </button>
      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (mousedown)="hold($event)" (click)="exec('redo')" aria-label="Rehacer">
        <cb-icon name="redo" [size]="15" aria-hidden="true" />
      </button>
    </div>
    <div
      #surface
      class="cb-editor__surface"
      role="textbox"
      aria-multiline="true"
      [attr.contenteditable]="!isDisabled()"
      [attr.data-placeholder]="placeholder()"
      [style.minHeight]="height()"
      (input)="onSurfaceInput()"
      (blur)="onBlur()"
    ></div>
    <input
      #imageInput
      type="file"
      accept="image/*"
      hidden
      (change)="onImageFile($event)"
    />
  `,
  styleUrl: './editor.component.css',
})
export class CbEditor implements ControlValueAccessor {
  readonly placeholder = input<string>('Escribe aquí…');
  readonly height = input<string>('180px');
  readonly disabled = input<boolean>(false);

  readonly value = model<string>('');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private readonly surfaceRef = viewChild<ElementRef<HTMLElement>>('surface');
  private readonly imageInputRef = viewChild<ElementRef<HTMLInputElement>>('imageInput');
  private savedRange: Range | null = null;

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const val = this.value() ?? '';
      const el = this.surfaceRef()?.nativeElement;
      if (el && el.innerHTML !== val) {
        el.innerHTML = val;
      }
    });
  }

  writeValue(val: string | null | undefined): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  /** Evita que el botón robe la selección del área editable. */
  protected hold(event: MouseEvent): void {
    event.preventDefault();
  }

  exec(command: string, value?: string): void {
    if (this.isDisabled()) return;
    const el = this.surfaceRef()?.nativeElement;
    el?.focus();
    if (typeof document.execCommand === 'function') {
      document.execCommand(command, false, value);
    }
    this.onSurfaceInput();
  }

  /** Aplica un bloque (encabezado, párrafo o cita). */
  protected format(tag: string): void {
    this.exec('formatBlock', tag);
  }

  /** Inserta un enlace sobre la selección actual. */
  protected insertLink(): void {
    if (this.isDisabled()) return;
    const url = window.prompt('URL del enlace:', 'https://');
    if (url) this.exec('createLink', url);
  }

  /** Abre el selector de archivos guardando la posición del cursor. */
  protected pickImage(): void {
    if (this.isDisabled()) return;
    const el = this.surfaceRef()?.nativeElement;
    const sel = window.getSelection();
    const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
    this.savedRange = el && range && el.contains(range.commonAncestorContainer) ? range.cloneRange() : null;
    this.imageInputRef()?.nativeElement.click();
  }

  /** Inserta la imagen elegida (como data URL) donde estaba el cursor. */
  protected onImageFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const el = this.surfaceRef()?.nativeElement;
      if (!el) return;
      el.focus();
      if (this.savedRange) {
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(this.savedRange);
        this.savedRange = null;
      }
      this.exec('insertImage', reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  protected onSurfaceInput(): void {
    const el = this.surfaceRef()?.nativeElement;
    if (!el) return;
    const html = el.innerHTML;
    this.value.set(html);
    this.onChange(html);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
