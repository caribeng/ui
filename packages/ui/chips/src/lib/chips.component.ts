import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { CbIcon } from '@caribeng/ui/icon';
import { cbFormat, cbFieldState, type CbSize, injectCbTranslation } from '@caribeng/ui';

let nextUid = 0;

/**
 * Entrada de etiquetas (chips) de CaribeNG, integrada con Angular Forms vía
 * `ControlValueAccessor`. El modelo es `string[]`.
 *
 * @example
 * ```html
 * <cb-chips formControlName="tags" placeholder="Añade una etiqueta y pulsa Enter" />
 * ```
 */
@Component({
  selector: 'cb-chips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-chips-host' },
  template: `
    <div
      class="cb-chips"
      [class]="'cb-chips--' + size()"
      [class.cb-is-invalid]="fieldState.invalid()"
      [class.cb-is-disabled]="isDisabled()"
      (click)="focusInput()"
    >
      @for (chip of value(); track $index) {
        <span class="cb-chips__chip">
          <span class="cb-chips__label">{{ chip }}</span>
          @if (!isDisabled() && !readonly()) {
            <button
              type="button"
              class="cb-chips__remove"
              [attr.aria-label]="fmt(t().removeItem, chip)"
              (click)="remove($index); $event.stopPropagation()"
            >
              <cb-icon name="x" [size]="14" aria-hidden="true" />
            </button>
          }
        </span>
      }
      <input
        #field
        class="cb-chips__input"
        type="text"
        [id]="inputId()"
        [placeholder]="value().length ? '' : placeholder()"
        [disabled]="isDisabled()"
        [readonly]="readonly()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
        [attr.aria-required]="fieldState.required() || null"
        autocomplete="off"
        (keydown)="onKeydown($event)"
        (blur)="onBlur()"
      />
    </div>
  `,
  styleUrl: './chips.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbChips),
      multi: true,
    },
  ],
})
export class CbChips implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  readonly value = model<string[]>([]);

  readonly placeholder = input<string>('');
  readonly size = input<CbSize>('md');
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });
  readonly readonly = input<boolean, unknown>(false, { transform: toBoolean });
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  /** Máximo de chips (0 = sin límite). */
  readonly max = input<number>(0);
  /** Permite valores repetidos. */
  readonly allowDuplicate = input<boolean, unknown>(false, { transform: toBoolean });
  readonly ariaLabel = input<string>('');
  readonly inputId = input<string>(`cb-chips-${++nextUid}`);

  readonly added = output<string>();
  readonly removed = output<string>();

  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: string[] | null): void {
    this.value.set(Array.isArray(value) ? [...value] : []);
  }
  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // --- Interacción -----------------------------------------------------------
  protected focusInput(): void {
    if (!this.isDisabled()) this.field()?.nativeElement.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.add(input.value);
      input.value = '';
    } else if (event.key === 'Backspace' && input.value === '' && this.value().length) {
      this.remove(this.value().length - 1);
    }
  }

  protected onBlur(): void {
    this.onTouched();
  }

  private add(raw: string): void {
    if (this.isDisabled() || this.readonly()) return;
    const v = raw.trim();
    if (!v) return;
    const max = this.max();
    if (max > 0 && this.value().length >= max) return;
    if (!this.allowDuplicate() && this.value().includes(v)) return;
    const next = [...this.value(), v];
    this.value.set(next);
    this.onChange(next);
    this.added.emit(v);
  }

  protected remove(index: number): void {
    if (this.isDisabled() || this.readonly()) return;
    const removed = this.value()[index];
    const next = this.value().filter((_, i) => i !== index);
    this.value.set(next);
    this.onChange(next);
    if (removed !== undefined) this.removed.emit(removed);
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
