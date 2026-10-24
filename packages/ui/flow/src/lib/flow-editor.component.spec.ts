import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbFlowEditor } from './flow-editor.component';
import type { CbFlow, CbFlowNode } from './flow-model';

const FLOW: CbFlow = {
  nodes: [
    { id: 'ini', type: 'start', label: 'Solicitud', x: 0, y: 0 },
    { id: 'dec', type: 'decision', label: '¿Monto alto?', x: 0, y: 112 },
    { id: 'com', type: 'task', label: 'Comité', x: -160, y: 272 },
    { id: 'fin', type: 'end', label: 'Fin', x: 0, y: 400 },
  ],
  edges: [
    { id: 'e1', from: 'ini', to: 'dec' },
    { id: 'e2', from: 'dec', to: 'com', label: 'Sí' },
    { id: 'e3', from: 'com', to: 'fin' },
  ],
};

@Component({
  imports: [CbFlowEditor],
  template: `<cb-flow-editor [(flow)]="flow" [(selected)]="selected" [(view)]="view" [readonly]="readonly()" (nodeOpen)="opened = $event" />`,
})
class HostComponent {
  flow = signal<CbFlow>(FLOW);
  selected = signal<string | null>(null);
  view = signal<'diagram' | 'list'>('diagram');
  readonly = signal(false);
  opened: CbFlowNode | null = null;
}

async function settle(fixture: ComponentFixture<unknown>) {
  for (let i = 0; i < 4; i++) {
    await new Promise((r) => setTimeout(r));
    fixture.detectChanges();
    await fixture.whenStable();
  }
}

async function setup(options: { readonly?: boolean; view?: 'diagram' | 'list' } = {}) {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.readonly.set(!!options.readonly);
  fixture.componentInstance.view.set(options.view ?? 'diagram');
  fixture.detectChanges();
  await settle(fixture);
  const el = fixture.nativeElement as HTMLElement;
  const host = fixture.componentInstance;
  const nodeEl = (id: string) => el.querySelector<HTMLElement>(`[data-node="${id}"]`)!;
  const edgeEl = (id: string) => el.querySelector<SVGElement>(`[data-edge="${id}"]`)!;
  const button = (text: string) => Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => (b.getAttribute('aria-label') ?? b.textContent!.trim()) === text)!;
  const live = () => el.querySelector('.cb-flow__sr[aria-live]')!.textContent!.trim();
  const key = async (target: Element, k: string, init: KeyboardEventInit = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
    await settle(fixture);
  };
  const node = (id: string) => host.flow().nodes.find((n) => n.id === id)!;
  return { fixture, el, host, nodeEl, edgeEl, button, live, key, node };
}

describe('CbFlowEditor', () => {
  it('cada nodo y conexión es un botón con nombre: tipo, nombre, salidas y problemas', async () => {
    const { el, nodeEl, edgeEl } = await setup();
    expect(el.querySelector('cb-flow-editor')!.getAttribute('aria-label')).toBe('Editor de flujo');
    expect(nodeEl('ini').getAttribute('role')).toBe('button');
    expect(nodeEl('ini').getAttribute('aria-label')).toBe('Inicio: Solicitud. Salidas: ¿Monto alto?');
    expect(nodeEl('dec').getAttribute('aria-label')).toBe('Decisión: ¿Monto alto?. Salidas: Comité (Sí). Problema: La decisión ¿Monto alto? necesita al menos dos salidas.');
    expect(nodeEl('fin').getAttribute('aria-label')).toBe('Fin: Fin');
    expect(document.getElementById(nodeEl('ini').getAttribute('aria-describedby')!)!.textContent).toContain('C para conectar');
    expect(edgeEl('e2').getAttribute('aria-label')).toBe('Conexión de ¿Monto alto? a Comité: Sí');
    expect(el.querySelector('.cb-flow__edge-label')!.textContent!.trim()).toBe('Sí');
    expect(el.querySelector('.cb-flow__issues summary')!.textContent).toBe('Problemas (1)');
  });

  it('flechas mueven el nodo por la rejilla (Mayús, cuatro veces más) y Supr lo borra con sus conexiones', async () => {
    const { host, nodeEl, key, node, live } = await setup();
    nodeEl('com').focus();
    await key(nodeEl('com'), 'ArrowRight');
    expect(node('com')).toMatchObject({ x: -144, y: 272 });
    await key(nodeEl('com'), 'ArrowUp', { shiftKey: true });
    expect(node('com')).toMatchObject({ x: -144, y: 208 });
    await key(nodeEl('com'), 'Delete');
    expect(host.flow().nodes.map((n) => n.id)).toEqual(['ini', 'dec', 'fin']);
    expect(host.flow().edges.map((e) => e.id)).toEqual(['e1']);
    expect(live()).toBe('Eliminado: Tarea: Comité');
    expect(document.activeElement).toBe(nodeEl('fin'));
  });

  it('Añadir con un nodo seleccionado lo pone debajo, lo conecta y abre su nombre', async () => {
    const { el, host, nodeEl, button, live, fixture } = await setup();
    nodeEl('com').focus();
    fixture.detectChanges();
    button('Tarea').click();
    await settle(fixture);
    const added = host.flow().nodes.at(-1)!;
    expect(added).toMatchObject({ type: 'task', label: 'Tarea 2', y: 400 });
    // 272 + 60 + 64 = 396, ajustado a la rejilla de 16.
    expect(host.flow().edges.at(-1)).toMatchObject({ from: 'com', to: added.id });
    expect(live()).toBe('Añadido: Tarea: Tarea 2');
    const input = el.querySelector<HTMLInputElement>('.cb-flow__editor')!;
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe('Tarea 2');
    input.value = 'Firmar contrato';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle(fixture);
    expect(host.flow().nodes.at(-1)!.label).toBe('Firmar contrato');
    expect(document.activeElement).toBe(nodeEl(added.id));
  });

  it('C conecta desde el nodo: Intro en el destino crea la conexión; Escape cancela', async () => {
    const { host, nodeEl, key, live } = await setup();
    await key(nodeEl('dec'), 'c');
    expect(live()).toBe('Conectar desde ¿Monto alto?: ve al nodo de destino y pulsa Intro. Escape cancela.');
    expect(nodeEl('dec').classList).toContain('cb-is-source');
    await key(nodeEl('fin'), 'Enter');
    expect(host.flow().edges.at(-1)).toMatchObject({ from: 'dec', to: 'fin' });
    expect(live()).toBe('Conectado: ¿Monto alto? → Fin');
    expect(host.flow().edges.length).toBe(4);
    // Hacia un inicio no se puede.
    await key(nodeEl('com'), 'c');
    await key(nodeEl('ini'), 'Enter');
    expect(live()).toBe('No se puede conectar Comité con Solicitud.');
    await key(nodeEl('dec'), 'c');
    await key(nodeEl('dec'), 'Escape');
    expect(live()).toBe('Conexión cancelada');
    expect(nodeEl('dec').classList).not.toContain('cb-is-source');
  });

  it('en una conexión, Intro edita la etiqueta y Supr la borra', async () => {
    const { el, host, edgeEl, key, fixture } = await setup();
    await key(edgeEl('e1'), 'Enter');
    const input = el.querySelector<HTMLInputElement>('.cb-flow__editor')!;
    expect(input.getAttribute('aria-label')).toBe('Etiqueta de Solicitud a ¿Monto alto?');
    input.value = 'Enviada';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle(fixture);
    expect(host.flow().edges[0].label).toBe('Enviada');
    await key(edgeEl('e1'), 'Delete');
    expect(host.flow().edges.map((e) => e.id)).toEqual(['e2', 'e3']);
  });

  it('Escape en el nombre deja el que había', async () => {
    const { el, host, nodeEl, key } = await setup();
    await key(nodeEl('com'), 'F2');
    const input = el.querySelector<HTMLInputElement>('.cb-flow__editor')!;
    input.value = 'Otro';
    await key(input, 'Escape');
    expect(host.flow().nodes.find((n) => n.id === 'com')!.label).toBe('Comité');
    expect(el.querySelector('.cb-flow__editor')).toBeNull();
  });

  it('vista Lista: renombra, conecta con un select, quita conexiones y muestra los problemas', async () => {
    const { el, host, button, fixture } = await setup({ view: 'list' });
    const names = Array.from(el.querySelectorAll('.cb-flow__item-name'), (i) => (i as HTMLInputElement).value);
    expect(names).toEqual(['Solicitud', '¿Monto alto?', 'Comité', 'Fin']);
    expect(el.querySelectorAll('.cb-flow__item-issue')[0].textContent).toBe('La decisión ¿Monto alto? necesita al menos dos salidas.');
    const rename = el.querySelector<HTMLInputElement>('[data-name="com"]')!;
    expect(rename.getAttribute('aria-label')).toBe('Nombre (Tarea)');
    rename.value = 'Comité de crédito';
    rename.dispatchEvent(new Event('change'));
    await settle(fixture);
    expect(host.flow().nodes.find((n) => n.id === 'com')!.label).toBe('Comité de crédito');
    const select = el.querySelector<HTMLSelectElement>('select[aria-label="Conectar ¿Monto alto? con"]')!;
    // Ni ella misma, ni el inicio, ni Comité (ya conectada).
    expect(Array.from(select.options, (o) => o.value)).toEqual(['', 'fin']);
    select.value = 'fin';
    select.closest('.cb-flow__connect-row')!.querySelector('button')!.click();
    await settle(fixture);
    expect(host.flow().edges.at(-1)).toMatchObject({ from: 'dec', to: 'fin' });
    button('Quitar la conexión a Fin').click();
    await settle(fixture);
    expect(host.flow().edges.some((e) => e.from === 'dec' && e.to === 'fin')).toBe(false);
  });

  it('solo lectura: sin herramientas de edición; Intro abre el nodo', async () => {
    const { el, host, nodeEl, key } = await setup({ readonly: true });
    expect(el.querySelector('[role="group"][aria-label="Añadir"]')).toBeNull();
    expect(el.querySelector('.cb-flow__handle')).toBeNull();
    expect(document.getElementById(nodeEl('com').getAttribute('aria-describedby')!)!.textContent).toBe('Intro para abrir.');
    await key(nodeEl('com'), 'ArrowRight');
    expect(host.flow()).toBe(FLOW);
    await key(nodeEl('com'), 'Enter');
    expect(host.opened?.id).toBe('com');
  });

  it('zoom: botones y teclas + / −; Ordenar coloca los nodos por niveles', async () => {
    const { el, host, button, key, fixture } = await setup();
    const editor = fixture.debugElement.children[0].componentInstance as CbFlowEditor;
    button('Acercar').click();
    fixture.detectChanges();
    expect(editor.zoom()).toBe(1.2);
    await key(el.querySelector('.cb-flow__viewport')!, '-');
    expect(editor.zoom()).toBe(1);
    button('Ordenar').click();
    await settle(fixture);
    const ys = host.flow().nodes.map((n) => n.y);
    expect(new Set(ys).size).toBe(4);
    expect(ys[0]).toBeLessThan(ys[1]);
  });

  it('un flujo válido lo dice', async () => {
    const { el, host, fixture } = await setup();
    host.flow.set({ ...FLOW, edges: [...FLOW.edges.map((e) => (e.id === 'e2' ? e : e)), { id: 'e4', from: 'dec', to: 'fin', label: 'No' }] });
    await settle(fixture);
    expect(el.querySelector('.cb-flow__valid')!.textContent!.trim()).toBe('El flujo es válido.');
  });
});
