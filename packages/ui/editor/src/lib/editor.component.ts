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

/**
 * Editor de CaribeNG: editor de texto enriquecido sin dependencias de terceros,
 * con barra de herramientas accesible e integración CVA.
 */
@Component({
  selector: 'cb-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbEditorComponent),
      multi: true,
    },
  ],
  host: {
    class: 'cb-editor',
    '[class.cb-is-disabled]': 'isDisabled()',
  },
  template: `
    <div class="cb-editor__toolbar" role="toolbar" aria-label="Formato de texto">
      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (click)="exec('bold')" aria-label="Negrita">
        <strong aria-hidden="true">B</strong>
      </button>
      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (click)="exec('italic')" aria-label="Cursiva">
        <em aria-hidden="true">I</em>
      </button>
      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (click)="exec('underline')" aria-label="Subrayado">
        <span style="text-decoration: underline" aria-hidden="true">U</span>
      </button>
      <button type="button" class="cb-editor__tool" [disabled]="isDisabled()" (click)="exec('insertUnorderedList')" aria-label="Lista">
        <span aria-hidden="true">•≡</span>
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
  `,
  styleUrl: './editor.component.css',
})
export class CbEditorComponent implements ControlValueAccessor {
  readonly placeholder = input<string>('Escribe aquí…');
  readonly height = input<string>('140px');
  readonly disabled = input<boolean>(false);

  readonly value = model<string>('');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private readonly surfaceRef = viewChild<ElementRef<HTMLElement>>('surface');

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

  exec(command: string): void {
    if (this.isDisabled()) return;
    const el = this.surfaceRef()?.nativeElement;
    el?.focus();
    if (typeof document.execCommand === 'function') {
      document.execCommand(command, false);
    }
    this.onSurfaceInput();
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
