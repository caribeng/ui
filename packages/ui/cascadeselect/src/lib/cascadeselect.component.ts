import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  ElementRef,
  computed,
  forwardRef,
  input,
  model,
  signal,
  viewChild,
  booleanAttribute,
  inject,
} from '@angular/core';
import { OverlayModule, type ConnectedPosition } from '@angular/cdk/overlay';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CbIcon } from '@caribeng/ui/icon';
import { cbFieldState, injectCbTranslation } from '@caribeng/ui';

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
  imports: [OverlayModule, CbIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbCascadeSelect),
      multi: true,
    },
  ],
  host: {
    class: 'cb-cascade-select',
    '[class.cb-is-open]': 'open()',
    '(keydown.escape)': 'closeOnEscape($event)',
  },
  template: `
    <button
      #trigger
      type="button"
      class="cb-cascade-select__trigger"
      [class.cb-is-invalid]="fieldState.invalid()"
      [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
      [attr.aria-required]="fieldState.required() || null"
      role="combobox"
      [attr.aria-expanded]="open()"
      [disabled]="isDisabled()"
      (click)="toggleOpen()"
    >
      <span class="cb-cascade-select__label" [class.cb-is-placeholder]="!selectedLabel()">
        {{ selectedLabel() || (placeholder() ?? t().select) }}
      </span>
      <cb-icon name="chevron-down" [size]="16" aria-hidden="true" />
    </button>

    <!-- El panel va en un overlay: no lo recorta un contenedor con overflow (tarjetas, diálogos, tablas). -->
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayMinWidth]="triggerWidth()"
      [cdkConnectedOverlayPositions]="positions"
      (overlayOutsideClick)="onOutsideClick($event)"
      (overlayKeydown)="closeOnEscape($event)"
      (detach)="open.set(false)"
    >
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
    </ng-template>
  `,
  styleUrl: './cascadeselect.component.css',
})
export class CbCascadeSelect implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly options = input<CbCascadeOption[]>([]);
  readonly placeholder = input<string | undefined>(undefined);
  readonly disabled = input<boolean>(false);
  /** Marca visual y ARIA de estado inválido (también se activa con Angular Forms). */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });

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

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly triggerWidth = signal(0);
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
  ];

  /** Un clic fuera del panel lo cierra (el del disparador ya lo alterna). */
  protected onOutsideClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }

  /** Escape cierra el panel y devuelve el foco al disparador. */
  protected closeOnEscape(event: Event): void {
    if (!this.open() || (event as KeyboardEvent).key !== 'Escape') return;
    event.preventDefault();
    this.open.set(false);
    this.trigger().nativeElement.focus();
  }

  toggleOpen(): void {
    if (this.isDisabled()) return;
    this.triggerWidth.set(this.trigger().nativeElement.offsetWidth);
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
