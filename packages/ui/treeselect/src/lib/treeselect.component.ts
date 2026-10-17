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
  imports: [CbIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbTreeSelectComponent),
      multi: true,
    },
  ],
  host: {
    class: 'cb-tree-select',
    '[class.cb-is-open]': 'open()',
    '[class.cb-is-disabled]': 'isDisabled()',
  },
  template: `
    <button
      type="button"
      class="cb-tree-select__trigger"
      role="combobox"
      [attr.aria-expanded]="open()"
      aria-haspopup="tree"
      [disabled]="isDisabled()"
      (click)="toggleOpen()"
    >
      <span class="cb-tree-select__label" [class.cb-is-placeholder]="!selectedLabel()">
        {{ selectedLabel() || placeholder() }}
      </span>
      <cb-icon name="chevron-down" [size]="16" aria-hidden="true" />
    </button>

    @if (open()) {
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
                [attr.aria-label]="'Expandir ' + item.node.label"
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
    }
  `,
  styleUrl: './treeselect.component.css',
})
export class CbTreeSelectComponent implements ControlValueAccessor {
  readonly nodes = input<CbTreeSelectNode[]>([]);
  readonly placeholder = input<string>('Seleccionar nodo…');
  readonly disabled = input<boolean>(false);

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

  toggleOpen(): void {
    if (this.isDisabled()) return;
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
