import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

/** Nodo de un `<cb-tree>`. */
export interface CbTreeNode {
  /** Identificador único en todo el árbol. */
  key: string;
  label: string;
  /** Icono opcional (nombre del set de iconos). */
  icon?: string;
  /** El nodo no se puede seleccionar (sí expandir). */
  disabled?: boolean;
  children?: readonly CbTreeNode[];
  /** Datos propios, disponibles en la plantilla de nodo. */
  data?: unknown;
}

/** Contexto de la plantilla `<ng-template cbTreeNode let-node let-level="level">`. */
export interface CbTreeNodeContext {
  $implicit: CbTreeNode;
  level: number;
  expanded: boolean;
  selected: boolean;
}

/** Plantilla para el contenido de cada nodo. */
@Directive({ selector: 'ng-template[cbTreeNode]' })
export class CbTreeNodeTemplate {
  readonly template = inject<TemplateRef<CbTreeNodeContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbTreeNodeTemplate, ctx: unknown): ctx is CbTreeNodeContext {
    return true;
  }
}

/** Nodo visible, con su posición, para la navegación con teclado. */
interface VisibleNode {
  node: CbTreeNode;
  level: number;
  parentKey: string | null;
}

let nextUid = 0;

/**
 * Árbol jerárquico de CaribeNG con niveles ilimitados, selección simple y
 * navegación con teclado según el patrón *tree* de WAI-ARIA.
 *
 * @example
 * ```html
 * <cb-tree [value]="nodes" [(selection)]="selected" ariaLabel="Documentos" />
 *
 * <cb-tree [value]="nodes">
 *   <ng-template cbTreeNode let-node>{{ node.label }} ({{ node.children?.length ?? 0 }})</ng-template>
 * </cb-tree>
 * ```
 */
@Component({
  selector: 'cb-tree',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet, CbIcon],
  host: { class: 'cb-tree-host' },
  template: `
    <ul class="cb-tree" role="tree" [attr.aria-label]="ariaLabel() || null" (keydown)="onKeydown($event)">
      <ng-container *ngTemplateOutlet="branch; context: { $implicit: value(), level: 1 }" />
    </ul>

    <ng-template #branch let-nodes let-level="level">
      @for (node of nodes; track node.key; let i = $index) {
        <li
          class="cb-tree__item"
          role="treeitem"
          [id]="itemId(node)"
          [attr.aria-level]="level"
          [attr.aria-setsize]="nodes.length"
          [attr.aria-posinset]="i + 1"
          [attr.aria-expanded]="hasChildren(node) ? isExpanded(node) : null"
          [attr.aria-selected]="node.disabled ? null : isSelected(node)"
          [attr.aria-disabled]="node.disabled ? 'true' : null"
          [attr.tabindex]="node.key === tabbableKey() ? 0 : -1"
          (focus)="activeKey.set(node.key)"
          (click)="onClick($event, node)"
        >
          <div
            class="cb-tree__row"
            [class.cb-is-selected]="isSelected(node)"
            [class.cb-is-disabled]="node.disabled"
            [style.padding-inline-start]="'calc(' + (level - 1) + ' * var(--cb-tree-indent, 1.25rem) + 0.25rem)'"
          >
            @if (hasChildren(node)) {
              <button
                type="button"
                class="cb-tree__toggler"
                tabindex="-1"
                [attr.aria-label]="fmt(isExpanded(node) ? t().collapseItem : t().expandItem, node.label)"
                (click)="toggle(node, $event)"
              >
                <cb-icon name="chevron-right" [size]="14" [class.cb-is-open]="isExpanded(node)" aria-hidden="true" />
              </button>
            } @else {
              <span class="cb-tree__spacer" aria-hidden="true"></span>
            }
            @if (node.icon) {
              <cb-icon class="cb-tree__icon" [name]="node.icon" [size]="16" aria-hidden="true" />
            }
            <span class="cb-tree__label">
              @if (nodeTemplate(); as tpl) {
                <ng-container
                  *ngTemplateOutlet="tpl.template; context: { $implicit: node, level, expanded: isExpanded(node), selected: isSelected(node) }"
                />
              } @else {
                {{ node.label }}
              }
            </span>
          </div>
          @if (hasChildren(node) && isExpanded(node)) {
            <ul class="cb-tree__group" role="group">
              <ng-container *ngTemplateOutlet="branch; context: { $implicit: node.children, level: level + 1 }" />
            </ul>
          }
        </li>
      }
    </ng-template>
  `,
  styleUrl: './tree.component.css',
})
export class CbTree {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly uid = `cb-tree-${++nextUid}`;

  /** Nodos raíz. */
  readonly value = input<readonly CbTreeNode[]>([]);
  /** Nodo seleccionado (two-way). */
  readonly selection = model<CbTreeNode | null>(null);
  /** Nombre accesible del árbol. */
  readonly ariaLabel = input<string>('');

  /** Se emite al expandir un nodo. */
  readonly nodeExpand = output<CbTreeNode>();
  /** Se emite al contraer un nodo. */
  readonly nodeCollapse = output<CbTreeNode>();
  /** Se emite al seleccionar un nodo. */
  readonly nodeSelect = output<CbTreeNode>();

  protected readonly nodeTemplate = contentChild(CbTreeNodeTemplate);
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());
  /** Último nodo enfocado por el usuario. */
  protected readonly activeKey = signal<string | null>(null);
  /** Nodo que recibe el foco con Tab (roving tabindex): el activo, el seleccionado o el primero. */
  protected readonly tabbableKey = computed(
    () => this.activeKey() ?? this.selection()?.key ?? this.value()[0]?.key ?? null,
  );

  /** Nodos visibles en orden de lectura (solo ramas expandidas). */
  private readonly visible = computed<VisibleNode[]>(() => {
    const out: VisibleNode[] = [];
    const walk = (nodes: readonly CbTreeNode[], level: number, parentKey: string | null) => {
      for (const node of nodes) {
        out.push({ node, level, parentKey });
        if (node.children?.length && this.expanded().has(node.key)) walk(node.children, level + 1, node.key);
      }
    };
    walk(this.value(), 1, null);
    return out;
  });

  /** Expande todos los nodos. */
  expandAll(): void {
    const keys = new Set<string>();
    const walk = (nodes: readonly CbTreeNode[]) =>
      nodes.forEach((n) => {
        if (n.children?.length) {
          keys.add(n.key);
          walk(n.children);
        }
      });
    walk(this.value());
    this.expanded.set(keys);
  }

  /** Contrae todos los nodos. */
  collapseAll(): void {
    this.expanded.set(new Set());
  }

  protected hasChildren(node: CbTreeNode): boolean {
    return !!node.children?.length;
  }

  protected isExpanded(node: CbTreeNode): boolean {
    return this.expanded().has(node.key);
  }

  protected isSelected(node: CbTreeNode): boolean {
    return this.selection()?.key === node.key;
  }

  protected itemId(node: CbTreeNode): string {
    return `${this.uid}-${node.key}`;
  }

  protected toggle(node: CbTreeNode, event?: Event): void {
    event?.stopPropagation();
    this.setExpanded(node, !this.isExpanded(node));
  }

  protected onClick(event: Event, node: CbTreeNode): void {
    event.stopPropagation();
    this.activeKey.set(node.key);
    this.select(node);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const list = this.visible();
    const index = list.findIndex((v) => v.node.key === this.tabbableKey());
    if (index < 0) return;
    const current = list[index];
    let target: VisibleNode | undefined;

    switch (event.key) {
      case 'ArrowDown':
        target = list[index + 1];
        break;
      case 'ArrowUp':
        target = list[index - 1];
        break;
      case 'Home':
        target = list[0];
        break;
      case 'End':
        target = list[list.length - 1];
        break;
      case 'ArrowRight':
        if (this.hasChildren(current.node)) {
          if (!this.isExpanded(current.node)) this.setExpanded(current.node, true);
          else target = list[index + 1];
        }
        break;
      case 'ArrowLeft':
        if (this.hasChildren(current.node) && this.isExpanded(current.node)) this.setExpanded(current.node, false);
        else if (current.parentKey) target = list.find((v) => v.node.key === current.parentKey);
        break;
      case 'Enter':
      case ' ':
        this.select(current.node);
        break;
      default:
        return;
    }
    event.preventDefault();
    if (target) this.focus(target.node);
  }

  private select(node: CbTreeNode): void {
    if (node.disabled) return;
    this.selection.set(node);
    this.nodeSelect.emit(node);
  }

  private setExpanded(node: CbTreeNode, open: boolean): void {
    if (open === this.isExpanded(node)) return;
    const next = new Set(this.expanded());
    if (open) next.add(node.key);
    else next.delete(node.key);
    this.expanded.set(next);
    (open ? this.nodeExpand : this.nodeCollapse).emit(node);
  }

  private focus(node: CbTreeNode): void {
    this.activeKey.set(node.key);
    const id = this.itemId(node);
    Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('[role="treeitem"]'))
      .find((el) => el.id === id)
      ?.focus();
  }
}
