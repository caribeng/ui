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
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CbIconComponent } from '@caribeng/ui/icon';

export interface CbCascadeOption {
  label: string;
  value?: string;
  children?: CbCascadeOption[];
}

/**
 * CascadeSelect de CaribeNG: selector en cascada multinivel con integración CVA.
 */
@Component({
  selector: 'cb-cascade-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbCascadeSelectComponent),
      multi: true,
    },
  ],
  host: {
    class: 'cb-cascade-select',
    '[class.cb-is-open]': 'open()',
  },
  template: `
    <button
      type="button"
      class="cb-cascade-select__trigger"
      role="combobox"
      [attr.aria-expanded]="open()"
      [disabled]="isDisabled()"
      (click)="toggleOpen()"
    >
      <span class="cb-cascade-select__label" [class.cb-is-placeholder]="!selectedLabel()">
        {{ selectedLabel() || placeholder() }}
      </span>
      <cb-icon name="chevron-down" [size]="16" aria-hidden="true" />
    </button>

    @if (open()) {
      <div class="cb-cascade-select__menus">
        <ul class="cb-cascade-select__list" role="listbox">
          @for (group of options(); track group.label) {
            <li>
              <button
                type="button"
                class="cb-cascade-select__option"
                [class.cb-is-active]="activeGroup()?.label === group.label"
                (click)="onGroupClick(group)"
              >
                <span>{{ group.label }}</span>
                @if (group.children?.length) {
                  <cb-icon name="chevron-right" [size]="14" aria-hidden="true" />
                }
              </button>
            </li>
          }
        </ul>
        @if (activeGroup()?.children?.length) {
          <ul class="cb-cascade-select__list" role="listbox">
            @for (leaf of activeGroup()!.children!; track leaf.label) {
              <li>
                <button
                  type="button"
                  class="cb-cascade-select__option"
                  [class.cb-is-selected]="value() === (leaf.value ?? leaf.label)"
                  (click)="selectLeaf(leaf)"
                >
                  <span>{{ leaf.label }}</span>
                </button>
              </li>
            }
          </ul>
        }
      </div>
    }
  `,
  styleUrl: './cascadeselect.component.css',
})
export class CbCascadeSelectComponent implements ControlValueAccessor {
  readonly options = input<CbCascadeOption[]>([]);
  readonly placeholder = input<string>('Seleccionar opción…');
  readonly disabled = input<boolean>(false);

  readonly value = model<string | null>(null);
  readonly open = signal(false);
  readonly activeGroup = signal<CbCascadeOption | null>(null);

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected readonly selectedLabel = computed(() => {
    const val = this.value();
    if (!val) return '';
    for (const g of this.options()) {
      if ((g.value ?? g.label) === val && !g.children?.length) return g.label;
      for (const c of g.children ?? []) {
        if ((c.value ?? c.label) === val) return `${g.label} / ${c.label}`;
      }
    }
    return val;
  });

  private onChange: (val: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string | null): void {
    this.value.set(val ?? null);
  }

  registerOnChange(fn: (val: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  toggleOpen(): void {
    if (this.isDisabled()) return;
    this.open.set(!this.open());
  }

  onGroupClick(group: CbCascadeOption): void {
    if (group.children?.length) {
      this.activeGroup.set(group);
    } else {
      this.selectLeaf(group);
    }
  }

  selectLeaf(item: CbCascadeOption): void {
    const val = item.value ?? item.label;
    this.value.set(val);
    this.onChange(val);
    this.onTouched();
    this.open.set(false);
  }
}
