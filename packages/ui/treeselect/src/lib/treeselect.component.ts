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
import { cbFormat, cbFieldState, injectCbTranslation } from '@caribeng/ui';

export interface CbTreeSelectNode {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  children?: CbTreeSelectNode[];
}

interface FlatTreeSelectNode {
  node: CbTreeSelectNode;
  depth: number;
  hasChildren: boolean;
}

/**
 * TreeSelect de CaribeNG: selector desplegable jerárquico con soporte CVA.
 */
@Component({
  selector: 'cb-tree-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [OverlayModule, CbIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbTreeSelect),
      multi: true,
    },
  ],
  host: {
    class: 'cb-tree-select',
    '[class.cb-is-open]': 'open()',
    '(keydown.escape)': 'closeOnEscape($event)',
    '[class.cb-is-disabled]': 'isDisabled()',
  },
  template: `
    <button
      #trigger
      type="button"
      class="cb-tree-select__trigger"
      [class.cb-is-invalid]="fieldState.invalid()"
      [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
      [attr.aria-required]="fieldState.required() || null"
      role="combobox"
      [attr.aria-expanded]="open()"
      aria-haspopup="tree"
      [disabled]="isDisabled()"
      (click)="toggleOpen()"
    >
      <span class="cb-tree-select__label" [class.cb-is-placeholder]="!selectedLabel()">
        {{ selectedLabel() || (placeholder() ?? t().select) }}
      </span>
      <cb-icon name="chevron-down" [size]="16" aria-hidden="true" />
    </button>

    <!-- El panel va en un overlay: no lo recorta un contenedor con overflow (tarjetas, diálogos, tablas). -->
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayWidth]="triggerWidth()"
      [cdkConnectedOverlayPositions]="positions"
      (overlayOutsideClick)="onOutsideClick($event)"
      (overlayKeydown)="closeOnEscape($event)"
      (detach)="open.set(false)"
    >
      <div class="cb-tree-select__panel" role="tree">
        @for (item of visibleNodes(); track item.node.key) {
          <div
            class="cb-tree-select__item"
            role="treeitem"
            [class.cb-is-selected]="value() === item.node.key"
            [style.paddingLeft.rem]="0.5 + item.depth * 1.1"
            [attr.aria-selected]="value() === item.node.key"
            [attr.aria-expanded]="item.hasChildren ? isExpanded(item.node.key) : null"
          >
            @if (item.hasChildren) {
              <button
                type="button"
                class="cb-tree-select__expander"
                (click)="toggleNode(item.node.key, $event)"
                [attr.aria-label]="fmt(t().expandItem, item.node.label)"
              >
                <cb-icon
                  [name]="isExpanded(item.node.key) ? 'chevron-down' : 'chevron-right'"
                  [size]="14"
                />
              </button>
            } @else {
              <span class="cb-tree-select__spacer"></span>
            }
            <button
              type="button"
              class="cb-tree-select__node-btn"
              [disabled]="item.node.disabled"
              (click)="selectNode(item.node)"
            >
              @if (item.node.icon) {
                <cb-icon [name]="item.node.icon" [size]="14" aria-hidden="true" />
              }
              <span>{{ item.node.label }}</span>
            </button>
          </div>
        }
      </div>
    </ng-template>
  `,
  styleUrl: './treeselect.component.css',
})
export class CbTreeSelect implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  readonly nodes = input<CbTreeSelectNode[]>([]);
  readonly placeholder = input<string | undefined>(undefined);
  readonly disabled = input<boolean>(false);
  /** Marca visual y ARIA de estado inválido (también se activa con Angular Forms). */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });

  readonly value = model<string | null>(null);
  readonly open = signal(false);

  private readonly expandedKeys = signal<ReadonlySet<string>>(new Set());
  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected readonly selectedLabel = computed(() => {
    const key = this.value();
    if (!key) return '';
    return this.findLabel(this.nodes(), key) ?? '';
  });

  protected readonly visibleNodes = computed<FlatTreeSelectNode[]>(() => {
    const result: FlatTreeSelectNode[] = [];
    const expanded = this.expandedKeys();
    const walk = (list: CbTreeSelectNode[], depth: number) => {
      for (const n of list) {
        const hasChildren = Boolean(n.children && n.children.length > 0);
        result.push({ node: n, depth, hasChildren });
        if (hasChildren && expanded.has(n.key)) {
          walk(n.children!, depth + 1);
        }
      }
    };
    walk(this.nodes(), 0);
    return result;
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

  isExpanded(key: string): boolean {
    return this.expandedKeys().has(key);
  }

  toggleNode(key: string, event: Event): void {
    event.stopPropagation();
    const next = new Set(this.expandedKeys());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.expandedKeys.set(next);
  }

  selectNode(node: CbTreeSelectNode): void {
    if (node.disabled) return;
    this.value.set(node.key);
    this.onChange(node.key);
    this.onTouched();
    this.open.set(false);
  }

  private findLabel(list: CbTreeSelectNode[], key: string): string | null {
    for (const n of list) {
      if (n.key === key) return n.label;
      if (n.children) {
        const found = this.findLabel(n.children, key);
        if (found) return found;
      }
    }
    return null;
  }
}
