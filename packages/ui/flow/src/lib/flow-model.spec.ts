import { describe, expect, it } from 'vitest';
import { canConnect, cbLayoutFlow, cbValidateFlow, edgeGeometry, readingOrder, type CbFlow, type CbFlowNode } from './flow-model';

const node = (id: string, type: CbFlowNode['type'], x = 0, y = 0): CbFlowNode => ({ id, type, label: id, x, y });

/** Aprobación de un crédito: inicio → revisar → ¿monto alto? → (sí) comité / (no) aprobar → fin. */
const CREDITO: CbFlow = {
  nodes: [node('ini', 'start'), node('rev', 'task'), node('dec', 'decision'), node('com', 'task'), node('apr', 'task'), node('fin', 'end')],
  edges: [
    { id: 'e1', from: 'ini', to: 'rev' },
    { id: 'e2', from: 'rev', to: 'dec' },
    { id: 'e3', from: 'dec', to: 'com', label: 'Sí' },
    { id: 'e4', from: 'dec', to: 'apr', label: 'No' },
    { id: 'e5', from: 'com', to: 'fin' },
    { id: 'e6', from: 'apr', to: 'fin' },
  ],
};

describe('cbValidateFlow', () => {
  it('un flujo completo no tiene problemas; uno vacío tampoco', () => {
    expect(cbValidateFlow(CREDITO)).toEqual([]);
    expect(cbValidateFlow({ nodes: [], edges: [] })).toEqual([]);
  });

  it('detecta inicio y fin que faltan, nodos sin salida e inalcanzables', () => {
    const issues = cbValidateFlow({ nodes: [node('a', 'task'), node('b', 'task')], edges: [{ id: 'x', from: 'a', to: 'b' }] });
    expect(issues.map((i) => i.code)).toEqual(['no-start', 'no-end', 'dead-end']);
    const lost = cbValidateFlow({ ...CREDITO, nodes: [...CREDITO.nodes, node('suelto', 'task')] });
    expect(lost).toEqual([
      { code: 'dead-end', nodeId: 'suelto', severity: 'error' },
      { code: 'unreachable', nodeId: 'suelto', severity: 'error' },
    ]);
  });

  it('decisiones con una sola salida o sin etiquetas, conexiones hacia un inicio o desde un fin', () => {
    const flow: CbFlow = {
      nodes: [node('ini', 'start'), node('ini2', 'start'), node('dec', 'decision'), node('fin', 'end'), node('dec2', 'decision')],
      edges: [
        { id: '1', from: 'ini', to: 'dec' },
        { id: '2', from: 'dec', to: 'fin' },
        { id: '3', from: 'fin', to: 'ini' },
        { id: '4', from: 'ini2', to: 'dec2' },
        { id: '5', from: 'dec2', to: 'fin', label: 'Sí' },
        { id: '6', from: 'dec2', to: 'dec' },
      ],
    };
    const codes = cbValidateFlow(flow).map((i) => `${i.code}:${i.nodeId ?? ''}`);
    expect(codes).toEqual(['many-starts:ini2', 'start-incoming:ini', 'decision-branches:dec', 'end-outgoing:fin', 'branch-label:dec2']);
    expect(cbValidateFlow(flow).find((i) => i.code === 'branch-label')!.severity).toBe('warning');
  });
});

describe('canConnect', () => {
  it('no consigo mismo, no repetida, no hacia un inicio ni desde un fin', () => {
    expect(canConnect(CREDITO, 'rev', 'apr')).toBe(true);
    expect(canConnect(CREDITO, 'rev', 'rev')).toBe(false);
    expect(canConnect(CREDITO, 'ini', 'rev')).toBe(false);
    expect(canConnect(CREDITO, 'rev', 'ini')).toBe(false);
    expect(canConnect(CREDITO, 'fin', 'rev')).toBe(false);
    expect(canConnect(CREDITO, 'rev', 'nope')).toBe(false);
  });
});

describe('readingOrder', () => {
  it('recorre en anchura desde el inicio y deja al final lo inalcanzable', () => {
    const flow = { ...CREDITO, nodes: [node('suelto', 'task'), ...CREDITO.nodes] };
    expect(readingOrder(flow).map((n) => n.id)).toEqual(['ini', 'rev', 'dec', 'com', 'apr', 'fin', 'suelto']);
  });
});

describe('cbLayoutFlow', () => {
  it('pone cada paso en un nivel más abajo, las ramas lado a lado y respeta la rejilla', () => {
    const laid = cbLayoutFlow(CREDITO, 16);
    const at = (id: string) => laid.nodes.find((n) => n.id === id)!;
    expect(at('ini').y).toBeLessThan(at('rev').y);
    expect(at('rev').y).toBeLessThan(at('dec').y);
    expect(at('com').y).toBe(at('apr').y);
    expect(at('com').x).toBeLessThan(at('apr').x);
    expect(at('fin').y).toBeGreaterThan(at('com').y);
    expect(laid.nodes.every((n) => n.x % 16 === 0 && n.y % 16 === 0)).toBe(true);
    expect(laid.edges).toBe(CREDITO.edges);
  });

  it('una conexión que vuelve atrás (bucle) no baja de nivel al nodo anterior', () => {
    const loop: CbFlow = { ...CREDITO, edges: [...CREDITO.edges, { id: 'back', from: 'com', to: 'rev', label: 'Corregir' }] };
    const laid = cbLayoutFlow(loop);
    const at = (id: string) => laid.nodes.find((n) => n.id === id)!;
    expect(at('rev').y).toBeLessThan(at('com').y);
  });
});

describe('edgeGeometry', () => {
  it('hacia abajo sale por abajo y entra por arriba, con la flecha en la llegada', () => {
    const g = edgeGeometry(node('a', 'task', 0, 0), node('b', 'task', 0, 200));
    expect(g.d).toBe('M88 60 C88 130 88 130 88 200');
    expect(g.mid).toEqual([88, 130]);
    expect(g.arrow.split(' ')[0]).toBe('88,200');
  });

  it('hacia un lado sale por el costado', () => {
    expect(edgeGeometry(node('a', 'task', 0, 0), node('b', 'task', 400, 0)).d).toMatch(/^M176 30 C/);
    expect(edgeGeometry(node('a', 'task', 400, 0), node('b', 'task', 0, 0)).d).toMatch(/^M400 30 C/);
  });

  it('hacia arriba (un bucle) rodea por la derecha', () => {
    const g = edgeGeometry(node('a', 'task', 0, 300), node('b', 'task', 0, 0));
    expect(g.d).toBe('M176 330 C232 330 232 30 176 30');
  });
});
