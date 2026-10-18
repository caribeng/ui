import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { CbIcon } from '@caribeng/ui/icon';

let nextUid = 0;

/**
 * ListBox de CaribeNG: lista de opciones seleccionables siempre visible (sin
 * overlay). Simple o múltiple, con filtro opcional. Integrado con Angular Forms
 * vía `ControlValueAccessor`.
 *
 * @example
 * ```html
 * <cb-listbox [options]="ciudades" optionLabel="nombre" optionValue="id"
 *             multiple filter formControlName="ciudades" />
 * ```
 */
@Component({
  selector: 'cb-listbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-listbox-host' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbListBox),
      multi: true,
    },
  ],
  template: `
    <div class="cb-listbox" [class.cb-is-disabled]="isDisabled()">
      @if (filter()) {
        <div class="cb-listbox__filter">
          <input
            type="text"
            class="cb-listbox__filter-input"
            [placeholder]="filterPlaceholder()"
            [value]="filterText()"
            [disabled]="isDisabled()"
            (input)="onFilter($event)"
            aria-label="Filtrar opciones"
          />
        </div>
      }
      <ul
        class="cb-listbox__list"
        role="listbox"
        [id]="listboxId"
        [attr.aria-multiselectable]="multiple() ? 'true' : null"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-activedescendant]="activeIndex() >= 0 ? optionId(activeIndex()) : null"
        [attr.tabindex]="isDisabled() ? -1 : 0"
        (keydown)="onKeydown($event)"
        (blur)="onTouched()"
      >
        @for (opt of filteredOptions(); track trackOption(opt); let i = $index) {
          <li
            class="cb-listbox__option"
            [class.cb-is-active]="i === activeIndex()"
            [class.cb-is-selected]="isSelected(opt)"
            [class.cb-is-disabled]="isOptionDisabled(opt)"
            role="option"
            [id]="optionId(i)"
            [attr.aria-selected]="isSelected(opt)"
            [attr.aria-disabled]="isOptionDisabled(opt) ? 'true' : null"
            (click)="select(opt)"
            (mouseenter)="activeIndex.set(i)"
          >
            @if (multiple()) {
              <span class="cb-listbox__check" [class.cb-is-checked]="isSelected(opt)">
                @if (isSelected(opt)) { <cb-icon name="check" [size]="14" aria-hidden="true" /> }
              </span>
            }
            {{ labelOf(opt) }}
          </li>
        } @empty {
          <li class="cb-listbox__empty" role="option" aria-disabled="true">
            {{ emptyMessage() }}
          </li>
        }
      </ul>
    </div>
  `,
  styleUrl: './listbox.component.css',
})
export class CbListBox implements ControlValueAccessor {
  readonly options = input<readonly unknown[]>([]);
  readonly optionLabel = input<string>('label');
  readonly optionValue = input<string | null>(null);
  readonly optionDisabled = input<string>('disabled');
  readonly multiple = input<boolean, unknown>(false, { transform: toBoolean });
  readonly filter = input<boolean, unknown>(false, { transform: toBoolean });
  readonly filterPlaceholder = input<string>('Buscar…');
  readonly emptyMessage = input<string>('Sin resultados');
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  readonly ariaLabel = input<string>('');
  readonly inputId = input<string>(`cb-listbox-${++nextUid}`);

  readonly value = model<unknown>(null);

  protected readonly activeIndex = signal(-1);
  protected readonly filterText = signal('');

  protected readonly listboxId = `${this.inputId()}-list`;

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  protected readonly filteredOptions = computed(() => {
    const q = this.filterText().trim().toLowerCase();
    const opts = this.options();
    if (!this.filter() || !q) return opts;
    return opts.filter((o) => this.labelOf(o).toLowerCase().includes(q));
  });

  private onChange: (value: unknown) => void = () => {};
  protected onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: unknown): void {
    this.value.set(this.multiple() ? (Array.isArray(value) ? [...value] : []) : value ?? null);
  }
  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // --- Interacción -----------------------------------------------------------
  protected select(opt: unknown): void {
    if (this.isDisabled() || this.isOptionDisabled(opt)) return;
    const val = this.valueOf(opt);
    let next: unknown;
    if (this.multiple()) {
      const arr = Array.isArray(this.value()) ? (this.value() as unknown[]) : [];
      next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
    } else {
      next = this.value() === val ? null : val;
    }
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
  }

  protected onFilter(event: Event): void {
    this.filterText.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(-1);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const opts = this.filteredOptions();
    if (!opts.length) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.move(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabled());
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(opts.length - 1);
        break;
      case 'Enter':
      case ' ': {
        const opt = opts[this.activeIndex()];
        if (opt !== undefined) {
          event.preventDefault();
          this.select(opt);
        }
        break;
      }
    }
  }

  // --- Helpers ---------------------------------------------------------------
  protected isSelected(opt: unknown): boolean {
    const val = this.valueOf(opt);
    const v = this.value();
    return Array.isArray(v) ? v.includes(val) : v === val;
  }
  protected labelOf(opt: unknown): string {
    const key = this.optionLabel();
    if (opt != null && typeof opt === 'object' && key in (opt as object)) {
      return String((opt as Record<string, unknown>)[key]);
    }
    return String(opt);
  }
  protected valueOf(opt: unknown): unknown {
    const key = this.optionValue();
    if (key && opt != null && typeof opt === 'object') {
      return (opt as Record<string, unknown>)[key];
    }
    return opt;
  }
  protected isOptionDisabled(opt: unknown): boolean {
    const key = this.optionDisabled();
    return !!(opt != null && typeof opt === 'object' && (opt as Record<string, unknown>)[key]);
  }
  protected optionId(index: number): string {
    return `${this.inputId()}-opt-${index}`;
  }
  protected trackOption(opt: unknown): unknown {
    return this.valueOf(opt);
  }

  private firstEnabled(): number {
    return this.filteredOptions().findIndex((o) => !this.isOptionDisabled(o));
  }
  private move(delta: number): void {
    const opts = this.filteredOptions();
    let i = this.activeIndex();
    for (let s = 0; s < opts.length; s++) {
      i = (i + delta + opts.length) % opts.length;
      if (!this.isOptionDisabled(opts[i])) {
        this.activeIndex.set(i);
        return;
      }
    }
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
