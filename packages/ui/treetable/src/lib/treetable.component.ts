import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

export interface CbTreeTableColumn {
  field: string;
  header: string;
}

export interface CbTreeTableNode {
  /** Identificador único en toda la tabla. */
  key: string;
  data: Record<string, unknown>;
  children?: readonly CbTreeTableNode[];
}

/** Contexto de `<ng-template cbTreeTableCell="campo" let-value let-node="node">`. */
export interface CbTreeTableCellContext {
  $implicit: unknown;
  node: CbTreeTableNode;
  level: number;
}

/** Plantilla para las celdas de una columna (`cbTreeTableCell="campo"`). */
@Directive({ selector: 'ng-template[cbTreeTableCell]' })
export class CbTreeTableCellTemplate {
  readonly field = input.required<string>({ alias: 'cbTreeTableCell' });
  readonly template = inject<TemplateRef<CbTreeTableCellContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbTreeTableCellTemplate, ctx: unknown): ctx is CbTreeTableCellContext {
    return true;
  }
}

/** Fila visible con su nivel y posición, en orden de lectura. */
interface Row {
  node: CbTreeTableNode;
  level: number;
  parentKey: string | null;
  setSize: number;
  posInSet: number;
}

let nextUid = 0;

/**
 * Tabla jerárquica de CaribeNG (patrón *treegrid* de WAI-ARIA): niveles
 * ilimitados con sangría, filas expandibles y navegación con teclado.
 *
 * @example
 * ```html
 * <cb-treetable [value]="nodes" [columns]="columns" ariaLabel="Archivos" />
 * ```
 */
@Component({
  selector: 'cb-treetable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet, CbIcon],
  host: { class: 'cb-treetable-host' },
  template: `
    <table class="cb-treetable" role="treegrid" [attr.aria-label]="ariaLabel() || null" (keydown)="onKeydown($event)">
      <thead>
        <tr>
          @for (col of columns(); track col.field) {
            <th scope="col">{{ col.header }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (row of rows(); track row.node.key) {
          <tr
            class="cb-treetable__row"
            [id]="rowId(row.node)"
            [attr.aria-level]="row.level"
            [attr.aria-setsize]="row.setSize"
            [attr.aria-posinset]="row.posInSet"
            [attr.aria-expanded]="hasChildren(row.node) ? isExpanded(row.node) : null"
            [attr.tabindex]="row.node.key === tabbableKey() ? 0 : -1"
            (focus)="activeKey.set(row.node.key)"
          >
            @for (col of columns(); track col.field; let first = $first) {
              <td [class.cb-treetable__first]="first">
                @if (first) {
                  <span
                    class="cb-treetable__indent"
                    [style.inline-size]="'calc(' + (row.level - 1) + ' * var(--cb-treetable-indent, 1.25rem))'"
                    aria-hidden="true"
                  ></span>
                  @if (hasChildren(row.node)) {
                    <button
                      type="button"
                      class="cb-treetable__toggler"
                      tabindex="-1"
                      [attr.aria-label]="fmt(isExpanded(row.node) ? t().collapseItem : t().expandItem, label(row.node))"
                      (click)="toggle(row.node)"
                    >
                      <cb-icon name="chevron-right" [size]="14" [class.cb-is-open]="isExpanded(row.node)" aria-hidden="true" />
                    </button>
                  } @else {
                    <span class="cb-treetable__spacer" aria-hidden="true"></span>
                  }
                }
                @if (cellTemplate(col.field); as tpl) {
                  <ng-container *ngTemplateOutlet="tpl; context: { $implicit: row.node.data[col.field], node: row.node, level: row.level }" />
                } @else {
                  {{ row.node.data[col.field] }}
                }
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
  styleUrl: './treetable.component.css',
})
export class CbTreeTable {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly uid = `cb-treetable-${++nextUid}`;

  /** Nodos raíz. */
  readonly value = input<readonly CbTreeTableNode[]>([]);
  /** Columnas; la primera muestra la jerarquía. */
  readonly columns = input<readonly CbTreeTableColumn[]>([]);
  /** Nombre accesible de la tabla. */
  readonly ariaLabel = input<string>('');

  /** Se emite al expandir una fila. */
  readonly nodeExpand = output<CbTreeTableNode>();
  /** Se emite al contraer una fila. */
  readonly nodeCollapse = output<CbTreeTableNode>();

  private readonly cellTemplates = contentChildren(CbTreeTableCellTemplate);
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());
  protected readonly activeKey = signal<string | null>(null);
  protected readonly tabbableKey = computed(() => this.activeKey() ?? this.value()[0]?.key ?? null);

  /** Filas visibles: las de las ramas expandidas, en orden. */
  protected readonly rows = computed<Row[]>(() => {
    const out: Row[] = [];
    const walk = (nodes: readonly CbTreeTableNode[], level: number, parentKey: string | null) =>
      nodes.forEach((node, i) => {
        out.push({ node, level, parentKey, setSize: nodes.length, posInSet: i + 1 });
        if (node.children?.length && this.expanded().has(node.key)) walk(node.children, level + 1, node.key);
      });
    walk(this.value(), 1, null);
    return out;
  });

  /** Expande todas las filas. */
  expandAll(): void {
    const keys = new Set<string>();
    const walk = (nodes: readonly CbTreeTableNode[]) =>
      nodes.forEach((n) => {
        if (n.children?.length) {
          keys.add(n.key);
          walk(n.children);
        }
      });
    walk(this.value());
    this.expanded.set(keys);
  }

  /** Contrae todas las filas. */
  collapseAll(): void {
    this.expanded.set(new Set());
  }

  protected hasChildren(node: CbTreeTableNode): boolean {
    return !!node.children?.length;
  }

  protected isExpanded(node: CbTreeTableNode): boolean {
    return this.expanded().has(node.key);
  }

  protected rowId(node: CbTreeTableNode): string {
    return `${this.uid}-${node.key}`;
  }

  /** Texto de la primera columna, para las etiquetas accesibles. */
  protected label(node: CbTreeTableNode): string {
    const field = this.columns()[0]?.field;
    return field ? String(node.data[field] ?? '') : node.key;
  }

  protected cellTemplate(field: string): TemplateRef<CbTreeTableCellContext> | null {
    return this.cellTemplates().find((c) => c.field() === field)?.template ?? null;
  }

  protected toggle(node: CbTreeTableNode): void {
    this.setExpanded(node, !this.isExpanded(node));
  }

  protected onKeydown(event: KeyboardEvent): void {
    const rows = this.rows();
    const index = rows.findIndex((r) => r.node.key === this.tabbableKey());
    if (index < 0) return;
    const current = rows[index];
    let target: Row | undefined;

    switch (event.key) {
      case 'ArrowDown':
        target = rows[index + 1];
        break;
      case 'ArrowUp':
        target = rows[index - 1];
        break;
      case 'Home':
        target = rows[0];
        break;
      case 'End':
        target = rows[rows.length - 1];
        break;
      case 'ArrowRight':
        if (this.hasChildren(current.node) && !this.isExpanded(current.node)) this.setExpanded(current.node, true);
        else if (this.isExpanded(current.node)) target = rows[index + 1];
        break;
      case 'ArrowLeft':
        if (this.isExpanded(current.node)) this.setExpanded(current.node, false);
        else if (current.parentKey) target = rows.find((r) => r.node.key === current.parentKey);
        break;
      case 'Enter':
      case ' ':
        if (this.hasChildren(current.node)) this.toggle(current.node);
        break;
      default:
        return;
    }
    event.preventDefault();
    if (target) {
      this.activeKey.set(target.node.key);
      const id = this.rowId(target.node);
      Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('tr[id]'))
        .find((el) => el.id === id)
        ?.focus();
    }
  }

  private setExpanded(node: CbTreeTableNode, open: boolean): void {
    if (open === this.isExpanded(node)) return;
    const next = new Set(this.expanded());
    if (open) next.add(node.key);
    else next.delete(node.key);
    this.expanded.set(next);
    (open ? this.nodeExpand : this.nodeCollapse).emit(node);
  }
}
