/** Tipo de nodo de un flujo. */
export type CbFlowNodeType = 'start' | 'task' | 'decision' | 'end';

/** Nodo: `x`, `y` es su esquina superior izquierda en el lienzo (px a zoom 100 %). */
export interface CbFlowNode {
  readonly id: string;
  readonly type: CbFlowNodeType;
  readonly label: string;
  readonly x: number;
  readonly y: number;
}

/** Conexión dirigida de `from` a `to`, con una etiqueta opcional ("Aprobado"). */
export interface CbFlowEdge {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly label?: string;
}

/** Un flujo: nodos y conexiones. */
export interface CbFlow {
  readonly nodes: readonly CbFlowNode[];
  readonly edges: readonly CbFlowEdge[];
}

/** Problema de un flujo (`cbValidateFlow`). */
export type CbFlowIssueCode =
  | 'no-start'
  | 'many-starts'
  | 'no-end'
  | 'start-incoming'
  | 'end-outgoing'
  | 'dead-end'
  | 'decision-branches'
  | 'branch-label'
  | 'unreachable';

export interface CbFlowIssue {
  readonly code: CbFlowIssueCode;
  /** Nodo afectado (si lo hay). */
  readonly nodeId?: string;
  /** `warning` no impide usar el flujo (una salida de decisión sin etiqueta). */
  readonly severity: 'error' | 'warning';
}

/** Tamaño de cada tipo de nodo (px a zoom 100 %). */
export const CB_FLOW_NODE_SIZE: Readonly<Record<CbFlowNodeType, { readonly w: number; readonly h: number }>> = {
  start: { w: 136, h: 44 },
  end: { w: 136, h: 44 },
  task: { w: 176, h: 60 },
  decision: { w: 160, h: 92 },
};

export const EMPTY_FLOW: CbFlow = { nodes: [], edges: [] };

/**
 * Problemas del flujo: falta un inicio o un fin, nodos sin salida o inalcanzables desde el inicio,
 * decisiones con menos de dos salidas (o salidas sin etiqueta), y conexiones que entran en un inicio
 * o salen de un fin. Un flujo vacío no tiene problemas.
 */
export function cbValidateFlow(flow: CbFlow): CbFlowIssue[] {
  const issues: CbFlowIssue[] = [];
  if (!flow.nodes.length) return issues;
  const out = adjacency(flow);
  const incoming = new Map<string, number>();
  for (const e of flow.edges) incoming.set(e.to, (incoming.get(e.to) ?? 0) + 1);
  const starts = flow.nodes.filter((n) => n.type === 'start');
  if (!starts.length) issues.push({ code: 'no-start', severity: 'error' });
  for (const extra of starts.slice(1)) issues.push({ code: 'many-starts', nodeId: extra.id, severity: 'error' });
  if (!flow.nodes.some((n) => n.type === 'end')) issues.push({ code: 'no-end', severity: 'error' });

  const reachable = new Set<string>();
  const queue = starts.map((s) => s.id);
  while (queue.length) {
    const id = queue.shift()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const e of out.get(id) ?? []) queue.push(e.to);
  }

  for (const n of flow.nodes) {
    const exits = out.get(n.id) ?? [];
    if (n.type === 'start' && incoming.get(n.id)) issues.push({ code: 'start-incoming', nodeId: n.id, severity: 'error' });
    if (n.type === 'end' && exits.length) issues.push({ code: 'end-outgoing', nodeId: n.id, severity: 'error' });
    if (n.type !== 'end' && !exits.length) issues.push({ code: 'dead-end', nodeId: n.id, severity: 'error' });
    if (n.type === 'decision' && exits.length === 1) issues.push({ code: 'decision-branches', nodeId: n.id, severity: 'error' });
    if (n.type === 'decision' && exits.length > 1 && exits.some((e) => !e.label?.trim())) {
      issues.push({ code: 'branch-label', nodeId: n.id, severity: 'warning' });
    }
    if (starts.length && !reachable.has(n.id)) issues.push({ code: 'unreachable', nodeId: n.id, severity: 'error' });
  }
  return issues;
}

/** Si se puede conectar `from` con `to`: no consigo mismo, no repetida, no hacia un inicio ni desde un fin. */
export function canConnect(flow: CbFlow, from: string, to: string): boolean {
  if (from === to) return false;
  const a = flow.nodes.find((n) => n.id === from);
  const b = flow.nodes.find((n) => n.id === to);
  if (!a || !b || a.type === 'end' || b.type === 'start') return false;
  return !flow.edges.some((e) => e.from === from && e.to === to);
}

/** Orden de lectura: recorrido en anchura desde los inicios y, después, lo que quede. */
export function readingOrder(flow: CbFlow): CbFlowNode[] {
  const out = adjacency(flow);
  const byId = new Map(flow.nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  const order: CbFlowNode[] = [];
  const visit = (roots: string[]) => {
    const queue = [...roots];
    while (queue.length) {
      const id = queue.shift()!;
      if (seen.has(id) || !byId.has(id)) continue;
      seen.add(id);
      order.push(byId.get(id)!);
      for (const e of out.get(id) ?? []) queue.push(e.to);
    }
  };
  visit(flow.nodes.filter((n) => n.type === 'start').map((n) => n.id));
  for (const n of flow.nodes) visit([n.id]);
  return order;
}

/**
 * Coloca los nodos por niveles de arriba abajo (el inicio arriba y cada paso debajo del anterior),
 * centrados y sin cruzar más de lo necesario. Las conexiones que vuelven atrás no cuentan para
 * los niveles. Las posiciones se ajustan a la rejilla `grid`.
 */
export function cbLayoutFlow(flow: CbFlow, grid = 16): CbFlow {
  if (!flow.nodes.length) return flow;
  const order = readingOrder(flow);
  const index = new Map(order.map((n, i) => [n.id, i]));
  // Conexiones hacia delante: las que no vuelven a un nodo anterior en el orden de lectura.
  const forward = flow.edges.filter((e) => (index.get(e.from) ?? 0) < (index.get(e.to) ?? 0));
  const level = new Map<string, number>(order.map((n) => [n.id, 0]));
  for (const n of order) {
    for (const e of forward) if (e.from === n.id) level.set(e.to, Math.max(level.get(e.to)!, level.get(n.id)! + 1));
  }
  const rows: CbFlowNode[][] = [];
  for (const n of order) (rows[level.get(n.id)!] ??= []).push(n);

  // Orden dentro de cada nivel: el medio de sus padres (baricentro), en dos pasadas.
  const slot = new Map<string, number>();
  rows.forEach((row) => row.forEach((n, i) => slot.set(n.id, i)));
  for (let pass = 0; pass < 2; pass++) {
    for (const row of rows.slice(1)) {
      const bary = (n: CbFlowNode) => {
        const parents = forward.filter((e) => e.to === n.id).map((e) => slot.get(e.from) ?? 0);
        return parents.length ? parents.reduce((a, b) => a + b, 0) / parents.length : slot.get(n.id)!;
      };
      row.sort((a, b) => bary(a) - bary(b));
      row.forEach((n, i) => slot.set(n.id, i));
    }
  }

  const gapX = 48;
  const gapY = 64;
  const pos = new Map<string, { x: number; y: number }>();
  let y = 0;
  for (const row of rows) {
    const height = Math.max(...row.map((n) => CB_FLOW_NODE_SIZE[n.type].h));
    const width = row.reduce((s, n) => s + CB_FLOW_NODE_SIZE[n.type].w, 0) + gapX * (row.length - 1);
    let x = -width / 2;
    for (const n of row) {
      const size = CB_FLOW_NODE_SIZE[n.type];
      pos.set(n.id, { x: snap(x, grid), y: snap(y + (height - size.h) / 2, grid) });
      x += size.w + gapX;
    }
    y += height + gapY;
  }
  return { ...flow, nodes: flow.nodes.map((n) => ({ ...n, ...pos.get(n.id)! })) };
}

/** Ajusta a la rejilla. */
export function snap(value: number, grid: number): number {
  return grid > 1 ? Math.round(value / grid) * grid : Math.round(value);
}

export interface FlowEdgeGeometry {
  /** Trazado SVG. */
  readonly d: string;
  /** Punto medio de la curva (para la etiqueta). */
  readonly mid: readonly [number, number];
  /** Punta de flecha en la llegada (puntos de un polígono SVG). No se usa `marker`: con `<base href>` su `url(#id)` falla en algunos navegadores. */
  readonly arrow: string;
}

type Side = 'top' | 'bottom' | 'left' | 'right';

/**
 * Curva de una conexión entre los lados enfrentados de los nodos. Hacia abajo sale por abajo y
 * entra por arriba; en horizontal, por los lados; si vuelve hacia arriba (un bucle), rodea por la
 * derecha para no cruzar los nodos de en medio.
 */
export function edgeGeometry(from: CbFlowNode, to: CbFlowNode): FlowEdgeGeometry {
  const a = centerOf(from);
  const b = centerOf(to);
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  let s: [number, number];
  let t: [number, number];
  let c1: [number, number];
  let c2: [number, number];
  if (Math.abs(dy) >= Math.abs(dx) * 0.6 && dy > 0) {
    s = sidePoint(from, 'bottom');
    t = sidePoint(to, 'top');
    const k = Math.max(24, (t[1] - s[1]) / 2);
    [c1, c2] = [[s[0], s[1] + k], [t[0], t[1] - k]];
  } else if (Math.abs(dy) >= Math.abs(dx) * 0.6) {
    // Hacia arriba: rodea por la derecha.
    s = sidePoint(from, 'right');
    t = sidePoint(to, 'right');
    const bulge = Math.max(s[0], t[0]) + 56;
    [c1, c2] = [[bulge, s[1]], [bulge, t[1]]];
  } else {
    const right = dx > 0;
    s = sidePoint(from, right ? 'right' : 'left');
    t = sidePoint(to, right ? 'left' : 'right');
    const k = Math.max(24, Math.abs(t[0] - s[0]) / 2) * (right ? 1 : -1);
    [c1, c2] = [[s[0] + k, s[1]], [t[0] - k, t[1]]];
  }
  const mid: [number, number] = [(s[0] + 3 * c1[0] + 3 * c2[0] + t[0]) / 8, (s[1] + 3 * c1[1] + 3 * c2[1] + t[1]) / 8];
  // La flecha sigue la tangente final de la curva (de c2 a t).
  const len = Math.hypot(t[0] - c2[0], t[1] - c2[1]) || 1;
  const [ux, uy] = [(t[0] - c2[0]) / len, (t[1] - c2[1]) / len];
  const [bx, by] = [t[0] - ux * 10, t[1] - uy * 10];
  const arrow = [[t[0], t[1]], [bx - uy * 5, by + ux * 5], [bx + uy * 5, by - ux * 5]].map(([x, y]) => `${r(x)},${r(y)}`).join(' ');
  return { d: `M${r(s[0])} ${r(s[1])} C${r(c1[0])} ${r(c1[1])} ${r(c2[0])} ${r(c2[1])} ${r(t[0])} ${r(t[1])}`, mid, arrow };
}

/** Caja que contiene a todos los nodos (o `null` si no hay). */
export function flowBounds(nodes: readonly CbFlowNode[]): { x: number; y: number; w: number; h: number } | null {
  if (!nodes.length) return null;
  const x = Math.min(...nodes.map((n) => n.x));
  const y = Math.min(...nodes.map((n) => n.y));
  const right = Math.max(...nodes.map((n) => n.x + CB_FLOW_NODE_SIZE[n.type].w));
  const bottom = Math.max(...nodes.map((n) => n.y + CB_FLOW_NODE_SIZE[n.type].h));
  return { x, y, w: right - x, h: bottom - y };
}

export function centerOf(n: CbFlowNode): [number, number] {
  const size = CB_FLOW_NODE_SIZE[n.type];
  return [n.x + size.w / 2, n.y + size.h / 2];
}

function sidePoint(n: CbFlowNode, side: Side): [number, number] {
  const { w, h } = CB_FLOW_NODE_SIZE[n.type];
  switch (side) {
    case 'top':
      return [n.x + w / 2, n.y];
    case 'bottom':
      return [n.x + w / 2, n.y + h];
    case 'left':
      return [n.x, n.y + h / 2];
    case 'right':
      return [n.x + w, n.y + h / 2];
  }
}

function adjacency(flow: CbFlow): Map<string, CbFlowEdge[]> {
  const out = new Map<string, CbFlowEdge[]>();
  for (const e of flow.edges) (out.get(e.from) ?? out.set(e.from, []).get(e.from)!).push(e);
  return out;
}

function r(v: number): number {
  return Math.round(v * 10) / 10;
}
