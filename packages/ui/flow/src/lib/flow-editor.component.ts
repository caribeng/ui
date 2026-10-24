import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbIcon, CbIconRegistry } from '@caribeng/ui/icon';
import { scan, spline, workflow, zoomIn, zoomOut } from '@caribeng/ui/icons';
import {
  CB_FLOW_NODE_SIZE,
  EMPTY_FLOW,
  canConnect,
  cbLayoutFlow,
  cbValidateFlow,
  edgeGeometry,
  flowBounds,
  readingOrder,
  snap,
  type CbFlow,
  type CbFlowEdge,
  type CbFlowIssue,
  type CbFlowNode,
  type CbFlowNodeType,
} from './flow-model';

let nextUid = 0;
let nextId = 0;

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 1.2;

const FLOW_ICONS: Record<string, string> = { 'zoom-in': zoomIn, 'zoom-out': zoomOut, scan, workflow, spline };

/** Conexión ya colocada: trazado, flecha, etiqueta y nombre accesible. */
interface EdgeView {
  readonly edge: CbFlowEdge;
  readonly d: string;
  readonly arrow: string;
  readonly mid: readonly [number, number];
  readonly label: string;
}

/** Edición en línea del nombre de un nodo o de la etiqueta de una conexión. */
interface Editing {
  readonly id: string;
  readonly kind: 'node' | 'edge';
}

/**
 * Editor de flujos (aprobaciones, procesos): nodos de inicio, tarea, decisión y fin unidos por
 * conexiones con etiqueta. Se arrastran los nodos, se conectan desde su tirador y el lienzo se
 * desplaza y amplía. Todo se puede hacer con el teclado, y la vista Lista es una alternativa
 * sin lienzo para editar el flujo con lector de pantalla. Valida el flujo (`issues`) y lo ordena
 * por niveles (`layout()`).
 *
 * @example
 * ```html
 * <cb-flow-editor [(flow)]="aprobacion" />
 * ```
 */
@Component({
  selector: 'cb-flow-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-flow',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel() || t().flowEditor',
    '(keydown)': 'onHostKeydown($event)',
  },
  template: `
    <div class="cb-flow__bar">
      @if (!readonly()) {
        <div class="cb-flow__group" role="group" [attr.aria-label]="t().flowAdd">
          @for (type of types; track type) {
            <button type="button" class="cb-flow__btn" (click)="addNode(type)">
              <span class="cb-flow__swatch" [class]="'cb-flow__swatch cb-flow__swatch--' + type" aria-hidden="true"></span>
              {{ typeLabel(type) }}
            </button>
          }
        </div>
        <div class="cb-flow__group">
          <button
            type="button"
            class="cb-flow__btn"
            [attr.aria-pressed]="!!connectFrom()"
            [disabled]="!selectedNode() || selectedNode()!.type === 'end'"
            (click)="toggleConnect()"
          >
            <cb-icon name="spline" [size]="16" aria-hidden="true" />{{ t().flowConnect }}
          </button>
          <button type="button" class="cb-flow__btn" [disabled]="!selected() || !selectedExists()" (click)="deleteSelected()">
            <cb-icon name="trash" [size]="16" aria-hidden="true" />{{ t().flowDelete }}
          </button>
          <button type="button" class="cb-flow__btn" [disabled]="!flow().nodes.length" (click)="layout()">
            <cb-icon name="workflow" [size]="16" aria-hidden="true" />{{ t().flowLayout }}
          </button>
        </div>
      }
      @if (view() === 'diagram') {
        <div class="cb-flow__group" role="group" [attr.aria-label]="t().flowZoom">
          <button type="button" class="cb-flow__icon" [attr.aria-label]="t().flowZoomOut" [disabled]="zoom() <= minZoom" (click)="zoomBy(1 / step)">
            <cb-icon name="zoom-out" [size]="18" aria-hidden="true" />
          </button>
          <span class="cb-flow__percent" aria-hidden="true">{{ percent() }}</span>
          <button type="button" class="cb-flow__icon" [attr.aria-label]="t().flowZoomIn" [disabled]="zoom() >= maxZoom" (click)="zoomBy(step)">
            <cb-icon name="zoom-in" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-flow__icon" [attr.aria-label]="t().flowFit" [attr.title]="t().flowFit" [disabled]="!flow().nodes.length" (click)="fit()">
            <cb-icon name="scan" [size]="18" aria-hidden="true" />
          </button>
        </div>
      }
      <span class="cb-flow__spacer"></span>
      <div class="cb-flow__views" role="group" [attr.aria-label]="t().flowView">
        <button type="button" class="cb-flow__view" [attr.aria-pressed]="view() === 'diagram'" (click)="view.set('diagram')">{{ t().flowDiagram }}</button>
        <button type="button" class="cb-flow__view" [attr.aria-pressed]="view() === 'list'" (click)="view.set('list')">{{ t().flowList }}</button>
      </div>
    </div>

    @if (view() === 'diagram') {
      <div
        #viewport
        class="cb-flow__viewport"
        tabindex="-1"
        [class.cb-flow__viewport--connect]="!!connectFrom()"
        [class.cb-flow__viewport--panning]="panning()"
        [style.background-size]="gridBackground().size"
        [style.background-position]="gridBackground().position"
        (pointerdown)="onBackgroundPointerDown($event)"
        (wheel)="onWheel($event)"
      >
        @if (!flow().nodes.length) {
          <p class="cb-flow__empty">{{ t().flowEmpty }}</p>
        }
        <div class="cb-flow__world" [style.transform]="worldTransform()">
          @for (n of nodes(); track n.id) {
            <div
              class="cb-flow__node"
              [class]="'cb-flow__node cb-flow__node--' + n.type"
              [class.cb-is-selected]="selected() === n.id"
              [class.cb-is-source]="connectFrom() === n.id"
              [class.cb-flow__node--issue]="issuesByNode().has(n.id)"
              [attr.data-node]="n.id"
              tabindex="0"
              role="button"
              [attr.aria-label]="nodeLabel(n)"
              [attr.aria-describedby]="uid + (readonly() ? '-ro-hint' : '-node-hint')"
              [style.left.px]="n.x"
              [style.top.px]="n.y"
              [style.width.px]="sizes[n.type].w"
              [style.height.px]="sizes[n.type].h"
              (pointerdown)="onNodePointerDown($event, n)"
              (dblclick)="onNodeDblClick(n)"
              (keydown)="onNodeKeydown($event, n)"
              (focus)="selected.set(n.id)"
            >
              <svg class="cb-flow__shape" [attr.viewBox]="'0 0 ' + sizes[n.type].w + ' ' + sizes[n.type].h" aria-hidden="true">
                @switch (n.type) {
                  @case ('decision') {
                    <polygon [attr.points]="diamond(n.type)" />
                  }
                  @case ('task') {
                    <rect x="1" y="1" rx="8" [attr.width]="sizes[n.type].w - 2" [attr.height]="sizes[n.type].h - 2" />
                  }
                  @default {
                    <rect x="1" y="1" [attr.rx]="(sizes[n.type].h - 2) / 2" [attr.width]="sizes[n.type].w - 2" [attr.height]="sizes[n.type].h - 2" />
                  }
                }
              </svg>
              <span class="cb-flow__label">{{ n.label }}</span>
              @if (issuesByNode().has(n.id)) {
                <span class="cb-flow__badge" aria-hidden="true">!</span>
              }
              @if (!readonly() && n.type !== 'end') {
                <span class="cb-flow__handle" aria-hidden="true" (pointerdown)="onHandlePointerDown($event, n)"></span>
              }
            </div>
          }
          <svg
            class="cb-flow__edges"
            [attr.viewBox]="svgBox().x + ' ' + svgBox().y + ' ' + svgBox().w + ' ' + svgBox().h"
            [style.left.px]="svgBox().x"
            [style.top.px]="svgBox().y"
            [style.width.px]="svgBox().w"
            [style.height.px]="svgBox().h"
          >
            @for (e of edgeViews(); track e.edge.id) {
              <g
                class="cb-flow__edge"
                [class.cb-is-selected]="selected() === e.edge.id"
                [attr.data-edge]="e.edge.id"
                tabindex="0"
                role="button"
                [attr.aria-label]="e.label"
                [attr.aria-describedby]="readonly() ? null : uid + '-edge-hint'"
                (pointerdown)="onEdgePointerDown($event, e.edge)"
                (dblclick)="startEdit(e.edge.id, 'edge')"
                (keydown)="onEdgeKeydown($event, e.edge)"
                (focus)="selected.set(e.edge.id)"
              >
                <path class="cb-flow__edge-hit" [attr.d]="e.d" />
                <path class="cb-flow__edge-line" [attr.d]="e.d" />
                <polygon class="cb-flow__edge-arrow" [attr.points]="e.arrow" />
              </g>
            }
            @if (tempLine(); as line) {
              <path class="cb-flow__edge-line cb-flow__edge-line--temp" [attr.d]="line" />
            }
          </svg>
          @for (e of edgeViews(); track e.edge.id) {
            @if (e.edge.label) {
              <span
                class="cb-flow__edge-label"
                [class.cb-is-selected]="selected() === e.edge.id"
                aria-hidden="true"
                [style.left.px]="e.mid[0]"
                [style.top.px]="e.mid[1]"
                (pointerdown)="onEdgePointerDown($event, e.edge)"
                (dblclick)="startEdit(e.edge.id, 'edge')"
                >{{ e.edge.label }}</span
              >
            }
          }
          @if (editorBox(); as box) {
            <input
              #editor
              class="cb-flow__editor"
              [attr.aria-label]="box.label"
              [style.left.px]="box.x"
              [style.top.px]="box.y"
              [style.width.px]="box.w"
              (keydown)="onEditorKeydown($event)"
              (blur)="commitEdit()"
              (pointerdown)="$event.stopPropagation()"
            />
          }
        </div>
      </div>
    } @else {
      <ol class="cb-flow__list" [attr.aria-label]="t().flowList">
        @if (!flow().nodes.length) {
          <li class="cb-flow__empty cb-flow__empty--list">{{ t().flowEmpty }}</li>
        }
        @for (n of ordered(); track n.id) {
          <li class="cb-flow__item" [class.cb-flow__item--issue]="issuesByNode().has(n.id)">
            <div class="cb-flow__item-head">
              <span class="cb-flow__type" [class]="'cb-flow__type cb-flow__type--' + n.type">{{ typeLabel(n.type) }}</span>
              @if (readonly()) {
                <strong class="cb-flow__item-name">{{ n.label }}</strong>
              } @else {
                <input
                  class="cb-flow__field cb-flow__item-name"
                  [attr.data-name]="n.id"
                  [value]="n.label"
                  [attr.aria-label]="format(t().flowNameOf, typeLabel(n.type))"
                  (change)="rename(n.id, $any($event.target).value)"
                />
                <button type="button" class="cb-flow__icon" [attr.aria-label]="format(t().flowDeleteNode, n.label)" (click)="removeNode(n.id)">
                  <cb-icon name="trash" [size]="16" aria-hidden="true" />
                </button>
              }
            </div>
            @for (issue of issuesByNode().get(n.id) ?? []; track $index) {
              <p class="cb-flow__item-issue">{{ issueText(issue) }}</p>
            }
            <ul class="cb-flow__exits" [attr.aria-label]="format(t().flowExitsOf, n.label)">
              @for (e of outgoing().get(n.id) ?? []; track e.id) {
                <li class="cb-flow__exit">
                  <span aria-hidden="true">→</span>
                  <span class="cb-flow__exit-target">{{ nameOf(e.to) }}</span>
                  @if (readonly()) {
                    @if (e.label) {
                      <span class="cb-flow__exit-label">{{ e.label }}</span>
                    }
                  } @else {
                    <input
                      class="cb-flow__field cb-flow__field--sm"
                      [value]="e.label ?? ''"
                      [placeholder]="t().flowEdgeLabel"
                      [attr.aria-label]="format(t().flowEdgeLabelOf, n.label, nameOf(e.to))"
                      (change)="relabel(e.id, $any($event.target).value)"
                    />
                    <button type="button" class="cb-flow__icon" [attr.aria-label]="format(t().flowRemoveConnection, nameOf(e.to))" (click)="removeEdge(e.id)">
                      <cb-icon name="x" [size]="16" aria-hidden="true" />
                    </button>
                  }
                </li>
              } @empty {
                <li class="cb-flow__exit cb-flow__exit--none">{{ t().flowNoExits }}</li>
              }
            </ul>
            @if (!readonly() && n.type !== 'end' && targetsFor(n).length) {
              <div class="cb-flow__connect-row">
                <select #target class="cb-flow__field" [attr.aria-label]="format(t().flowConnectTo, n.label)">
                  <option value="">{{ t().flowChooseTarget }}</option>
                  @for (o of targetsFor(n); track o.id) {
                    <option [value]="o.id">{{ typeLabel(o.type) }}: {{ o.label }}</option>
                  }
                </select>
                <button type="button" class="cb-flow__btn" (click)="connectFromList(n.id, target)">{{ t().flowAddConnection }}</button>
              </div>
            }
          </li>
        }
      </ol>
    }

    @if (showValidation() && flow().nodes.length) {
      @if (issues().length) {
        <details class="cb-flow__issues" open>
          <summary>{{ format(t().flowIssues, issues().length) }}</summary>
          <ul class="cb-flow__issues-list">
            @for (issue of issues(); track $index) {
              <li [class.cb-flow__issue--warning]="issue.severity === 'warning'">
                @if (issue.nodeId) {
                  <button type="button" class="cb-flow__issue-link" (click)="reveal(issue.nodeId)">{{ issueText(issue) }}</button>
                } @else {
                  {{ issueText(issue) }}
                }
              </li>
            }
          </ul>
        </details>
      } @else {
        <p class="cb-flow__valid">
          <cb-icon name="check" [size]="16" aria-hidden="true" />{{ t().flowNoIssues }}
        </p>
      }
    }

    <span class="cb-flow__sr" [id]="uid + '-node-hint'">{{ t().flowNodeHint }}</span>
    <span class="cb-flow__sr" [id]="uid + '-ro-hint'">{{ t().flowReadonlyHint }}</span>
    <span class="cb-flow__sr" [id]="uid + '-edge-hint'">{{ t().flowEdgeHint }}</span>
    <span class="cb-flow__sr" aria-live="polite">{{ announcement() }}</span>
  `,
  styleUrl: './flow-editor.component.css',
})
export class CbFlowEditor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly format = cbFormat;

  /** El flujo: nodos y conexiones. */
  readonly flow = model<CbFlow>(EMPTY_FLOW);
  /** Solo lectura: se puede recorrer, desplazar y ampliar, pero no editar. Intro abre el nodo (`nodeOpen`). */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Rejilla en px: los nodos se ajustan a ella al moverlos (1 la desactiva). */
  readonly gridSize = input(16, { transform: numberAttribute });
  /** Zoom (1 = 100 %). */
  readonly zoom = model<number>(1);
  /** Diagrama o lista (alternativa sin lienzo, para teclado y lector de pantalla). */
  readonly view = model<'diagram' | 'list'>('diagram');
  /** Nodo o conexión seleccionada (su `id`). */
  readonly selected = model<string | null>(null);
  /** Muestra los problemas del flujo bajo el editor. */
  readonly showValidation = input(true, { transform: booleanAttribute });
  /** Ajusta el zoom para ver todo el flujo al cargarlo. */
  readonly fitOnLoad = input(true, { transform: booleanAttribute });
  /** Nombre accesible (por defecto, "Editor de flujo"). */
  readonly ariaLabel = input<string>('');

  /** Se abrió un nodo: doble clic, o Intro en solo lectura. */
  readonly nodeOpen = output<CbFlowNode>();

  protected readonly uid = `cb-flow-${++nextUid}`;
  protected readonly types: readonly CbFlowNodeType[] = ['start', 'task', 'decision', 'end'];
  protected readonly sizes = CB_FLOW_NODE_SIZE;
  protected readonly minZoom = MIN_ZOOM;
  protected readonly maxZoom = MAX_ZOOM;
  protected readonly step = ZOOM_STEP;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');
  private readonly editor = viewChild<ElementRef<HTMLInputElement>>('editor');

  /** Desplazamiento del lienzo (px de pantalla). */
  protected readonly pan = signal({ x: 0, y: 0 });
  protected readonly panning = signal(false);
  /** Posición provisional de un nodo mientras se arrastra. */
  private readonly dragPos = signal<{ id: string; x: number; y: number } | null>(null);
  /** Nodo desde el que se conecta (con el teclado o con el botón Conectar). */
  protected readonly connectFrom = signal<string | null>(null);
  /** Conexión que se arrastra desde un tirador, hasta el puntero (coordenadas del lienzo). */
  private readonly linkDrag = signal<{ from: string; x: number; y: number } | null>(null);
  protected readonly editing = signal<Editing | null>(null);
  protected readonly announcement = signal('');
  private announceFlip = false;
  private fitted = false;

  /** Problemas del flujo (los mismos que muestra el editor). */
  readonly issues = computed(() => cbValidateFlow(this.flow()));

  protected readonly nodes = computed(() => {
    const drag = this.dragPos();
    const nodes = this.flow().nodes;
    return drag ? nodes.map((n) => (n.id === drag.id ? { ...n, x: drag.x, y: drag.y } : n)) : nodes;
  });

  private readonly nodeMap = computed(() => new Map(this.nodes().map((n) => [n.id, n])));

  protected readonly outgoing = computed(() => {
    const map = new Map<string, CbFlowEdge[]>();
    for (const e of this.flow().edges) (map.get(e.from) ?? map.set(e.from, []).get(e.from)!).push(e);
    return map;
  });

  protected readonly issuesByNode = computed(() => {
    const map = new Map<string, CbFlowIssue[]>();
    for (const issue of this.issues()) if (issue.nodeId) (map.get(issue.nodeId) ?? map.set(issue.nodeId, []).get(issue.nodeId)!).push(issue);
    return map;
  });

  protected readonly edgeViews = computed<EdgeView[]>(() => {
    const nodes = this.nodeMap();
    const views: EdgeView[] = [];
    for (const edge of this.flow().edges) {
      const from = nodes.get(edge.from);
      const to = nodes.get(edge.to);
      if (!from || !to) continue;
      const g = edgeGeometry(from, to);
      const name = cbFormat(this.t().flowEdgeOf, from.label, to.label);
      views.push({ edge, d: g.d, arrow: g.arrow, mid: g.mid, label: edge.label ? `${name}: ${edge.label}` : name });
    }
    return views;
  });

  /** Caja del SVG de conexiones: la de los nodos con margen para las curvas que rodean. */
  protected readonly svgBox = computed(() => {
    const b = flowBounds(this.nodes()) ?? { x: 0, y: 0, w: 0, h: 0 };
    const drag = this.linkDrag();
    const [x1, y1] = drag ? [Math.min(b.x, drag.x), Math.min(b.y, drag.y)] : [b.x, b.y];
    const [x2, y2] = drag ? [Math.max(b.x + b.w, drag.x), Math.max(b.y + b.h, drag.y)] : [b.x + b.w, b.y + b.h];
    return { x: x1 - 160, y: y1 - 160, w: x2 - x1 + 320, h: y2 - y1 + 320 };
  });

  protected readonly tempLine = computed(() => {
    const drag = this.linkDrag();
    const from = drag && this.nodeMap().get(drag.from);
    if (!drag || !from) return '';
    const { w, h } = CB_FLOW_NODE_SIZE[from.type];
    return `M${from.x + w / 2} ${from.y + h} L${drag.x} ${drag.y}`;
  });

  protected readonly worldTransform = computed(() => {
    const { x, y } = this.pan();
    return `translate(${x}px, ${y}px) scale(${this.zoom()})`;
  });

  protected readonly gridBackground = computed(() => {
    const size = Math.max(4, this.gridSize() * this.zoom());
    const { x, y } = this.pan();
    return { size: `${size}px ${size}px`, position: `${x}px ${y}px` };
  });

  protected readonly percent = computed(() => `${Math.round(this.zoom() * 100)} %`);

  protected readonly ordered = computed(() => readingOrder(this.flow()));

  protected readonly selectedNode = computed(() => {
    const id = this.selected();
    return id ? (this.flow().nodes.find((n) => n.id === id) ?? null) : null;
  });

  protected readonly selectedExists = computed(() => {
    const id = this.selected();
    return !!id && (this.flow().nodes.some((n) => n.id === id) || this.flow().edges.some((e) => e.id === id));
  });

  /** Caja del campo de edición en línea (sobre el nodo o en el punto medio de la conexión). */
  protected readonly editorBox = computed(() => {
    const editing = this.editing();
    if (!editing) return null;
    if (editing.kind === 'node') {
      const n = this.nodeMap().get(editing.id);
      if (!n) return null;
      const { w, h } = CB_FLOW_NODE_SIZE[n.type];
      const width = Math.min(w - 16, 160);
      return { x: n.x + (w - width) / 2, y: n.y + h / 2 - 15, w: width, label: cbFormat(this.t().flowNameOf, this.typeLabel(n.type)) };
    }
    const e = this.edgeViews().find((v) => v.edge.id === editing.id);
    if (!e) return null;
    return { x: e.mid[0] - 70, y: e.mid[1] - 15, w: 140, label: cbFormat(this.t().flowEdgeLabelOf, this.nameOf(e.edge.from), this.nameOf(e.edge.to)) };
  });

  constructor() {
    const registry = inject(CbIconRegistry);
    for (const [name, body] of Object.entries(FLOW_ICONS)) {
      if (!registry.has(name)) registry.register({ [name]: body });
    }

    // Ajusta el zoom la primera vez que hay nodos y lienzo.
    effect(() => {
      const hasNodes = this.flow().nodes.length > 0;
      const viewport = this.viewport();
      if (!hasNodes || !viewport || this.fitted || !untracked(this.fitOnLoad)) return;
      this.fitted = true;
      afterNextRender(() => this.fit(), { injector: this.injector });
    });

    // Un nodo o conexión que desaparece del flujo deja de estar seleccionado.
    effect(() => {
      const id = this.selected();
      if (id && !this.selectedExists()) untracked(() => this.selected.set(null));
    });
  }

  // --- API pública ------------------------------------------------------------

  /** Añade un nodo. Con un nodo seleccionado, lo pone debajo y lo conecta desde él; después abre su nombre. */
  addNode(type: CbFlowNodeType): CbFlowNode {
    const flow = this.flow();
    const source = this.selectedNode();
    const size = CB_FLOW_NODE_SIZE[type];
    const grid = this.gridSize();
    let x: number;
    let y: number;
    if (source) {
      const s = CB_FLOW_NODE_SIZE[source.type];
      // Debajo del nodo; si ya tiene salidas, a la derecha de la última.
      const siblings = (this.outgoing().get(source.id) ?? []).map((e) => this.nodeMap().get(e.to)).filter((n): n is CbFlowNode => !!n);
      const below = source.y + s.h + 64;
      const right = siblings.length ? Math.max(...siblings.map((n) => n.x + CB_FLOW_NODE_SIZE[n.type].w)) + 48 : null;
      [x, y] = [right ?? source.x + (s.w - size.w) / 2, below];
    } else if (flow.nodes.length) {
      const b = flowBounds(flow.nodes)!;
      [x, y] = [b.x + (b.w - size.w) / 2, b.y + b.h + 64];
    } else {
      [x, y] = [0, 0];
    }
    const count = flow.nodes.filter((n) => n.type === type).length + 1;
    const node: CbFlowNode = { id: `${type}-${Date.now().toString(36)}${++nextId}`, type, label: `${this.typeLabel(type)} ${count}`, x: snap(x, grid), y: snap(y, grid) };
    const edges = source && canConnect({ ...flow, nodes: [...flow.nodes, node] }, source.id, node.id) ? [...flow.edges, this.newEdge(source.id, node.id)] : flow.edges;
    this.flow.set({ nodes: [...flow.nodes, node], edges });
    this.announce(cbFormat(this.t().flowAdded, cbFormat(this.t().flowNodeOf, this.typeLabel(type), node.label)));
    this.selected.set(node.id);
    afterNextRender(
      () => {
        if (this.view() === 'list') {
          const input = this.host.nativeElement.querySelector<HTMLInputElement>(`[data-name="${node.id}"]`);
          input?.focus();
          input?.select();
        } else {
          this.ensureVisible(node);
          this.startEdit(node.id, 'node');
        }
      },
      { injector: this.injector },
    );
    return node;
  }

  /** Conecta dos nodos (si se puede: no consigo mismo, no repetida, no hacia un inicio ni desde un fin). */
  connect(from: string, to: string, label?: string): CbFlowEdge | null {
    const flow = this.flow();
    if (!canConnect(flow, from, to)) {
      this.announce(cbFormat(this.t().flowCannotConnect, this.nameOf(from), this.nameOf(to)));
      return null;
    }
    const edge = this.newEdge(from, to, label);
    this.flow.set({ ...flow, edges: [...flow.edges, edge] });
    this.announce(cbFormat(this.t().flowConnected, this.nameOf(from), this.nameOf(to)));
    return edge;
  }

  removeNode(id: string): void {
    const flow = this.flow();
    const node = flow.nodes.find((n) => n.id === id);
    if (!node) return;
    const order = readingOrder(flow);
    const next = order[order.findIndex((n) => n.id === id) + 1] ?? order[order.findIndex((n) => n.id === id) - 1];
    this.flow.set({ nodes: flow.nodes.filter((n) => n.id !== id), edges: flow.edges.filter((e) => e.from !== id && e.to !== id) });
    if (this.connectFrom() === id) this.connectFrom.set(null);
    this.announce(cbFormat(this.t().flowRemoved, cbFormat(this.t().flowNodeOf, this.typeLabel(node.type), node.label)));
    this.focusAfterRemoval(next && next.id !== id ? next.id : null);
  }

  removeEdge(id: string): void {
    const flow = this.flow();
    const edge = flow.edges.find((e) => e.id === id);
    if (!edge) return;
    this.flow.set({ ...flow, edges: flow.edges.filter((e) => e.id !== id) });
    this.announce(cbFormat(this.t().flowRemoved, cbFormat(this.t().flowEdgeOf, this.nameOf(edge.from), this.nameOf(edge.to))));
    this.focusAfterRemoval(edge.from);
  }

  rename(id: string, label: string): void {
    const clean = label.trim();
    if (!clean) return;
    this.flow.update((f) => ({ ...f, nodes: f.nodes.map((n) => (n.id === id ? { ...n, label: clean } : n)) }));
  }

  relabel(id: string, label: string): void {
    const clean = label.trim();
    this.flow.update((f) => ({ ...f, edges: f.edges.map((e) => (e.id === id ? { ...e, label: clean || undefined } : e)) }));
  }

  /** Coloca los nodos por niveles de arriba abajo y ajusta la vista. */
  layout(): void {
    this.flow.set(cbLayoutFlow(this.flow(), this.gridSize()));
    this.announce(this.t().flowLaidOut);
    afterNextRender(() => this.fit(), { injector: this.injector });
  }

  /** Ajusta zoom y desplazamiento para ver todo el flujo. */
  fit(): void {
    const el = this.viewport()?.nativeElement;
    const b = flowBounds(this.flow().nodes);
    if (!el || !b || !el.clientWidth) return;
    const pad = 48;
    const zoom = clamp(Math.min((el.clientWidth - pad * 2) / b.w, (el.clientHeight - pad * 2) / b.h, 1.25), MIN_ZOOM, MAX_ZOOM);
    this.zoom.set(round2(zoom));
    this.pan.set({ x: (el.clientWidth - b.w * zoom) / 2 - b.x * zoom, y: (el.clientHeight - b.h * zoom) / 2 - b.y * zoom });
  }

  /** Multiplica el zoom por `factor` alrededor del centro de la vista (o del punto `at`, en px de la vista). */
  zoomBy(factor: number, at?: { x: number; y: number }): void {
    const el = this.viewport()?.nativeElement;
    const z1 = this.zoom();
    const z2 = round2(clamp(z1 * factor, MIN_ZOOM, MAX_ZOOM));
    if (z2 === z1) return;
    const p = at ?? { x: (el?.clientWidth ?? 0) / 2, y: (el?.clientHeight ?? 0) / 2 };
    const { x, y } = this.pan();
    this.pan.set({ x: p.x - ((p.x - x) * z2) / z1, y: p.y - ((p.y - y) * z2) / z1 });
    this.zoom.set(z2);
  }

  // --- Barra -------------------------------------------------------------------

  protected toggleConnect(): void {
    const node = this.selectedNode();
    if (this.connectFrom()) this.cancelConnect();
    else if (node) this.beginConnect(node);
  }

  protected deleteSelected(): void {
    const id = this.selected();
    if (!id) return;
    if (this.flow().nodes.some((n) => n.id === id)) this.removeNode(id);
    else this.removeEdge(id);
  }

  protected connectFromList(from: string, select: HTMLSelectElement): void {
    if (!select.value) return;
    if (this.connect(from, select.value)) select.value = '';
  }

  protected reveal(id: string): void {
    this.selected.set(id);
    afterNextRender(
      () => {
        if (this.view() === 'list') {
          this.host.nativeElement.querySelector<HTMLElement>(`[data-name="${id}"]`)?.focus();
        } else {
          const node = this.nodeMap().get(id);
          if (node) this.ensureVisible(node);
          this.focusNode(id);
        }
      },
      { injector: this.injector },
    );
  }

  // --- Teclado ---------------------------------------------------------------------

  protected onNodeKeydown(event: KeyboardEvent, rendered: CbFlowNode): void {
    if (event.target !== event.currentTarget || event.ctrlKey || event.metaKey || event.altKey) return;
    // La de la plantilla puede ser de antes del último repintado (tecla mantenida).
    const node = this.flow().nodes.find((n) => n.id === rendered.id) ?? rendered;
    const grid = Math.max(1, this.gridSize());
    const step = event.shiftKey ? grid * 4 : grid;
    const arrows: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const key = event.key;
    if (key === 'Enter' || key === ' ' || key === 'F2') {
      const from = this.connectFrom();
      if (from && from !== node.id && key !== 'F2') {
        this.connect(from, node.id);
        this.connectFrom.set(null);
      } else if (this.readonly()) {
        if (key !== 'F2') this.nodeOpen.emit(node);
      } else {
        this.startEdit(node.id, 'node');
      }
    } else if (this.readonly()) {
      return;
    } else if (arrows[key]) {
      const [dx, dy] = arrows[key];
      this.moveNode(node.id, snap(node.x + dx, grid), snap(node.y + dy, grid));
      afterNextRender(() => this.ensureVisible(this.nodeMap().get(node.id) ?? node), { injector: this.injector });
    } else if (key === 'Delete' || key === 'Backspace') {
      this.removeNode(node.id);
    } else if ((key === 'c' || key === 'C') && node.type !== 'end') {
      if (this.connectFrom() === node.id) this.cancelConnect();
      else this.beginConnect(node);
    } else {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  protected onEdgeKeydown(event: KeyboardEvent, edge: CbFlowEdge): void {
    if (this.readonly() || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'F2') this.startEdit(edge.id, 'edge');
    else if (event.key === 'Delete' || event.key === 'Backspace') this.removeEdge(edge.id);
    else return;
    event.preventDefault();
    event.stopPropagation();
  }

  protected onHostKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Escape' && this.connectFrom()) {
      this.cancelConnect();
    } else if (this.view() === 'diagram' && (event.key === '+' || event.key === '=')) {
      this.zoomBy(ZOOM_STEP);
    } else if (this.view() === 'diagram' && event.key === '-') {
      this.zoomBy(1 / ZOOM_STEP);
    } else if (this.view() === 'diagram' && event.key === '0') {
      this.fit();
    } else {
      return;
    }
    event.preventDefault();
  }

  // --- Edición en línea ----------------------------------------------------------------

  protected startEdit(id: string, kind: 'node' | 'edge'): void {
    if (this.readonly()) return;
    this.editing.set({ id, kind });
    afterNextRender(
      () => {
        const input = this.editor()?.nativeElement;
        if (!input) return;
        const flow = this.flow();
        input.value = kind === 'node' ? (flow.nodes.find((n) => n.id === id)?.label ?? '') : (flow.edges.find((e) => e.id === id)?.label ?? '');
        input.focus();
        input.select();
      },
      { injector: this.injector },
    );
  }

  protected onEditorKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitEdit(true);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEdit();
    }
  }

  /** Guarda lo escrito (al pulsar Intro o al salir del campo). */
  protected commitEdit(refocus = false): void {
    const editing = this.editing();
    const input = this.editor()?.nativeElement;
    if (!editing || !input) return;
    this.editing.set(null);
    if (editing.kind === 'node') this.rename(editing.id, input.value);
    else this.relabel(editing.id, input.value);
    if (refocus) this.focusItem(editing);
  }

  private cancelEdit(): void {
    const editing = this.editing();
    this.editing.set(null);
    if (editing) this.focusItem(editing);
  }

  private focusItem(editing: Editing): void {
    afterNextRender(
      () => {
        const selector = editing.kind === 'node' ? `[data-node="${editing.id}"]` : `[data-edge="${editing.id}"]`;
        this.host.nativeElement.querySelector<HTMLElement | SVGElement>(selector)?.focus();
      },
      { injector: this.injector },
    );
  }

  // --- Puntero ----------------------------------------------------------------------

  protected onNodePointerDown(event: PointerEvent, node: CbFlowNode): void {
    if (event.button !== 0) return;
    event.stopPropagation();
    const el = event.currentTarget as HTMLElement;
    const from = this.connectFrom();
    if (from && from !== node.id) {
      event.preventDefault();
      this.connect(from, node.id);
      this.connectFrom.set(null);
      el.focus();
      return;
    }
    if (this.editing()) this.commitEdit();
    this.selected.set(node.id);
    if (this.readonly()) return;
    // Sin el default no se selecciona texto al arrastrar; el foco se da a mano.
    event.preventDefault();
    el.focus({ preventScroll: true });
    const start = { x: event.clientX, y: event.clientY, nx: node.x, ny: node.y };
    const zoom = this.zoom();
    const grid = this.gridSize();
    let moved = false;
    this.track(event, el, (e) => {
      const [dx, dy] = [(e.clientX - start.x) / zoom, (e.clientY - start.y) / zoom];
      if (!moved && Math.hypot(dx, dy) * zoom < 3) return;
      moved = true;
      this.dragPos.set({ id: node.id, x: start.nx + dx, y: start.ny + dy });
    }, () => {
      const pos = this.dragPos();
      this.dragPos.set(null);
      if (moved && pos) this.moveNode(node.id, snap(pos.x, grid), snap(pos.y, grid));
    });
  }

  protected onNodeDblClick(node: CbFlowNode): void {
    if (this.readonly()) this.nodeOpen.emit(node);
    else this.startEdit(node.id, 'node');
  }

  /** Arrastrar desde el tirador crea una conexión con el nodo donde se suelta. */
  protected onHandlePointerDown(event: PointerEvent, node: CbFlowNode): void {
    if (event.button !== 0 || this.readonly()) return;
    event.stopPropagation();
    event.preventDefault();
    const el = event.currentTarget as HTMLElement;
    this.selected.set(node.id);
    this.linkDrag.set({ from: node.id, ...this.toWorld(event) });
    this.track(event, el, (e) => this.linkDrag.set({ from: node.id, ...this.toWorld(e) }), (e) => {
      this.linkDrag.set(null);
      const target = (this.host.nativeElement.ownerDocument.elementFromPoint?.(e.clientX, e.clientY) as HTMLElement | null)?.closest<HTMLElement>('[data-node]');
      const to = target?.dataset['node'];
      if (to && to !== node.id) this.connect(node.id, to);
    });
  }

  protected onEdgePointerDown(event: PointerEvent, edge: CbFlowEdge): void {
    if (event.button !== 0) return;
    event.stopPropagation();
    if (this.editing()) this.commitEdit();
    this.selected.set(edge.id);
    const g = this.host.nativeElement.querySelector<SVGElement>(`[data-edge="${edge.id}"]`);
    event.preventDefault();
    g?.focus({ preventScroll: true });
  }

  /** Arrastrar el fondo desplaza el lienzo; un clic sin moverse quita la selección. */
  protected onBackgroundPointerDown(event: PointerEvent): void {
    if (event.button !== 0 && event.button !== 1) return;
    if (this.editing()) this.commitEdit();
    const el = event.currentTarget as HTMLElement;
    const pointer = { x: event.clientX, y: event.clientY };
    const origin = this.pan();
    let moved = false;
    this.track(event, el, (e) => {
      const [dx, dy] = [e.clientX - pointer.x, e.clientY - pointer.y];
      if (!moved && Math.hypot(dx, dy) < 3) return;
      moved = true;
      this.panning.set(true);
      this.pan.set({ x: origin.x + dx, y: origin.y + dy });
    }, () => {
      this.panning.set(false);
      if (!moved) {
        if (this.connectFrom()) this.cancelConnect();
        this.selected.set(null);
      }
    });
  }

  /** Rueda: desplaza; con Ctrl (o el gesto de pellizcar del panel táctil), amplía alrededor del puntero. */
  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      this.zoomBy(event.deltaY < 0 ? 1.1 : 1 / 1.1, { x: event.clientX - rect.left, y: event.clientY - rect.top });
    } else {
      const { x, y } = this.pan();
      this.pan.set({ x: x - event.deltaX, y: y - event.deltaY });
    }
  }

  private track(event: PointerEvent, el: Element, move: (e: PointerEvent) => void, end: (e: PointerEvent) => void): void {
    el.setPointerCapture?.(event.pointerId);
    const up = (e: PointerEvent) => {
      el.removeEventListener('pointermove', move as EventListener);
      el.removeEventListener('pointerup', up as EventListener);
      el.removeEventListener('pointercancel', up as EventListener);
      end(e);
    };
    el.addEventListener('pointermove', move as EventListener);
    el.addEventListener('pointerup', up as EventListener);
    el.addEventListener('pointercancel', up as EventListener);
  }

  // --- Utilidades ---------------------------------------------------------------------

  private beginConnect(node: CbFlowNode): void {
    this.connectFrom.set(node.id);
    this.announce(cbFormat(this.t().flowConnectFrom, node.label));
  }

  private cancelConnect(): void {
    this.connectFrom.set(null);
    this.announce(this.t().flowConnectCancelled);
  }

  private moveNode(id: string, x: number, y: number): void {
    this.flow.update((f) => ({ ...f, nodes: f.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)) }));
  }

  private newEdge(from: string, to: string, label?: string): CbFlowEdge {
    return { id: `edge-${Date.now().toString(36)}${++nextId}`, from, to, ...(label ? { label } : {}) };
  }

  /** Coordenadas del lienzo bajo el puntero. */
  private toWorld(event: PointerEvent): { x: number; y: number } {
    const rect = this.viewport()?.nativeElement.getBoundingClientRect();
    const { x, y } = this.pan();
    const zoom = this.zoom();
    return { x: (event.clientX - (rect?.left ?? 0) - x) / zoom, y: (event.clientY - (rect?.top ?? 0) - y) / zoom };
  }

  /** Desplaza el lienzo lo justo para que se vea el nodo. */
  private ensureVisible(node: CbFlowNode): void {
    const el = this.viewport()?.nativeElement;
    if (!el || !el.clientWidth) return;
    const { w, h } = CB_FLOW_NODE_SIZE[node.type];
    const zoom = this.zoom();
    const margin = 24;
    let { x, y } = this.pan();
    const [left, top] = [node.x * zoom + x, node.y * zoom + y];
    const [right, bottom] = [left + w * zoom, top + h * zoom];
    if (left < margin) x += margin - left;
    else if (right > el.clientWidth - margin) x -= right - (el.clientWidth - margin);
    if (top < margin) y += margin - top;
    else if (bottom > el.clientHeight - margin) y -= bottom - (el.clientHeight - margin);
    this.pan.set({ x, y });
  }

  private focusNode(id: string): void {
    this.host.nativeElement.querySelector<HTMLElement>(`[data-node="${id}"]`)?.focus();
  }

  private focusAfterRemoval(nextNode: string | null): void {
    const hadFocus = this.host.nativeElement.contains(this.host.nativeElement.ownerDocument.activeElement);
    if (!hadFocus) return;
    afterNextRender(
      () => {
        if (this.view() === 'list') {
          const target = nextNode && this.host.nativeElement.querySelector<HTMLElement>(`[data-name="${nextNode}"]`);
          (target || this.host.nativeElement.querySelector<HTMLElement>('.cb-flow__view[aria-pressed="true"]'))?.focus();
        } else if (nextNode && this.flow().nodes.some((n) => n.id === nextNode)) {
          this.focusNode(nextNode);
        } else {
          this.viewport()?.nativeElement.focus();
        }
      },
      { injector: this.injector },
    );
  }

  protected nodeLabel(n: CbFlowNode): string {
    const t = this.t();
    const exits = (this.outgoing().get(n.id) ?? []).map((e) => (e.label ? `${this.nameOf(e.to)} (${e.label})` : this.nameOf(e.to)));
    const parts = [cbFormat(t.flowNodeOf, this.typeLabel(n.type), n.label)];
    if (n.type !== 'end') parts.push(exits.length ? cbFormat(t.flowExits, exits.join(', ')) : t.flowNoExits);
    for (const issue of this.issuesByNode().get(n.id) ?? []) parts.push(cbFormat(t.flowIssueOf, this.issueText(issue)));
    return parts.join('. ');
  }

  protected typeLabel(type: CbFlowNodeType): string {
    const t = this.t();
    return { start: t.flowStart, task: t.flowTask, decision: t.flowDecision, end: t.flowEnd }[type];
  }

  protected nameOf(id: string): string {
    return this.flow().nodes.find((n) => n.id === id)?.label ?? id;
  }

  /** Destinos posibles en la lista: todos menos él mismo, los inicios y los ya conectados. */
  protected targetsFor(node: CbFlowNode): CbFlowNode[] {
    const flow = this.flow();
    return this.ordered().filter((o) => canConnect(flow, node.id, o.id));
  }

  protected issueText(issue: CbFlowIssue): string {
    const t = this.t();
    const name = issue.nodeId ? this.nameOf(issue.nodeId) : '';
    const text: Record<CbFlowIssue['code'], string> = {
      'no-start': t.flowIssueNoStart,
      'many-starts': t.flowIssueManyStarts,
      'no-end': t.flowIssueNoEnd,
      'start-incoming': t.flowIssueStartIncoming,
      'end-outgoing': t.flowIssueEndOutgoing,
      'dead-end': t.flowIssueDeadEnd,
      'decision-branches': t.flowIssueBranches,
      'branch-label': t.flowIssueBranchLabel,
      unreachable: t.flowIssueUnreachable,
    };
    return cbFormat(text[issue.code], name);
  }

  protected diamond(type: CbFlowNodeType): string {
    const { w, h } = CB_FLOW_NODE_SIZE[type];
    return `${w / 2},1 ${w - 1},${h / 2} ${w / 2},${h - 1} 1,${h / 2}`;
  }

  private announce(text: string): void {
    // Un espacio duro alterno hace que se repita aunque el texto sea el mismo.
    this.announceFlip = !this.announceFlip;
    this.announcement.set(this.announceFlip ? text : `${text} `);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
