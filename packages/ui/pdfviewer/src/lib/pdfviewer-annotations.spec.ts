import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CbPdfAnnotation } from './pdf-annotations';
import { CB_PDF_VIEWER_OPTIONS, type CbPdfJs } from './pdf-engine';
import { CbPdfViewer } from './pdfviewer.component';

/** Lo que había en el annotationStorage de pdf.js cuando se llamó a saveDocument. */
let savedStorage: Map<string, Record<string, unknown>> | null = null;

/** pdf.js simulado: dos páginas de 600×800 pt con texto. */
function fakePdfJs() {
  const storage = new Map<string, Record<string, unknown>>();
  class TextLayer {
    readonly textDivs: HTMLElement[] = [];
    readonly textContentItemsStr: string[] = [];
    constructor(private readonly p: { textContentSource: { items: { str: string }[] }; container: HTMLElement }) {}
    async render() {
      for (const item of this.p.textContentSource.items) {
        const span = document.createElement('span');
        span.textContent = item.str;
        this.p.container.append(span);
        this.textDivs.push(span);
        this.textContentItemsStr.push(item.str);
      }
    }
    cancel() {}
  }
  const page = () => ({
    rotate: 0,
    userUnit: 1,
    view: [0, 0, 600, 800],
    getViewport: ({ scale = 1, rotation = 0 }: { scale?: number; rotation?: number }) =>
      rotation % 180 ? { width: 800 * scale, height: 600 * scale } : { width: 600 * scale, height: 800 * scale },
    render: () => ({ promise: Promise.resolve(), cancel() {} }),
    getTextContent: async () => ({ items: [{ str: 'Cargo de supermercado', hasEOL: true }] }),
    cleanup() {},
  });
  const pdf = {
    numPages: 2,
    getPage: async () => page(),
    getData: async () => new Uint8Array([37, 80, 68, 70]),
    saveDocument: async () => {
      savedStorage = new Map(storage);
      return new Uint8Array([37, 80, 68, 70, 1]);
    },
    annotationStorage: {
      onSetModified: null as null | (() => void),
      setValue(key: string, value: Record<string, unknown>) {
        storage.set(key, value);
        this.onSetModified?.();
      },
      remove: (key: string) => storage.delete(key),
      get size() {
        return storage.size;
      },
    },
  };
  return {
    pdfjs: {
      GlobalWorkerOptions: { workerSrc: 'x', workerPort: null },
      TextLayer,
      getDocument: () => ({ promise: Promise.resolve(pdf), destroy: async () => undefined }),
    } as unknown as CbPdfJs,
    storage,
  };
}

@Component({
  imports: [CbPdfViewer],
  template: `<cb-pdf-viewer src="a.pdf" annotatable author="Ana" [(annotations)]="annotations" [(sidebar)]="sidebar" (annotationRemove)="removed = $event" />`,
})
class HostComponent {
  annotations = signal<readonly CbPdfAnnotation[]>([]);
  sidebar = signal(false);
  removed: CbPdfAnnotation | null = null;
}

async function settle(fixture: ComponentFixture<unknown>) {
  for (let i = 0; i < 8; i++) {
    await new Promise((r) => setTimeout(r));
    fixture.detectChanges();
    await fixture.whenStable();
  }
}

async function setup(annotations: CbPdfAnnotation[] = []) {
  const fake = fakePdfJs();
  TestBed.configureTestingModule({ providers: [{ provide: CB_PDF_VIEWER_OPTIONS, useValue: { loader: () => Promise.resolve(fake.pdfjs) } }] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.annotations.set(annotations);
  fixture.detectChanges();
  await settle(fixture);
  const el = fixture.nativeElement as HTMLElement;
  const viewer = fixture.debugElement.children[0].componentInstance as CbPdfViewer;
  const host = fixture.componentInstance;
  const button = (label: string) => Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.getAttribute('aria-label') === label)!;
  const marks = () => Array.from(el.querySelectorAll<HTMLElement>('.cb-pdf__mark'));
  const live = () => el.querySelector('.cb-pdf__sr[aria-live]')!.textContent!.trim();
  const key = async (target: Element, k: string, init: KeyboardEventInit = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
    await settle(fixture);
  };
  return { fixture, el, viewer, host, fake, button, marks, live, key };
}

// Con el área sin medir (jsdom), el zoom es 100 %: 1 pt = 96/72 px.
const PX = 96 / 72;
const note = (over: Partial<CbPdfAnnotation> = {}) => ({ id: 'n1', page: 1, type: 'note', rect: [60, 700, 180, 718], text: 'Revisar', color: 'red', ...over }) as CbPdfAnnotation;

afterEach(() => {
  savedStorage = null;
  vi.restoreAllMocks();
});

describe('CbPdfViewer · anotaciones', () => {
  it('con annotatable hay un grupo Anotar con herramientas conmutables y Escape las suelta', async () => {
    const { el, fixture, button, viewer, key } = await setup();
    const group = el.querySelector('[role="group"][aria-label="Anotar"]')!;
    expect(Array.from(group.querySelectorAll('button'), (b) => b.getAttribute('aria-label'))).toEqual(['Resaltar', 'Nota', 'Dibujar', 'Firmar']);
    expect(group.querySelector('select')!.getAttribute('aria-label')).toBe('Color');
    button('Dibujar').click();
    fixture.detectChanges();
    expect(button('Dibujar').getAttribute('aria-pressed')).toBe('true');
    expect(viewer.tool()).toBe('ink');
    expect(el.querySelector('.cb-pdf__hint')!.textContent).toContain('Dibuja sobre la página');
    await key(el.querySelector('.cb-pdf__viewport')!, 'Escape');
    expect(viewer.tool()).toBe('none');
    expect(el.querySelector('.cb-pdf__hint')).toBeNull();
  });

  it('pinta las anotaciones en su sitio (puntos PDF → píxeles) con su nombre accesible', async () => {
    const { marks } = await setup([
      { id: 'h1', page: 1, type: 'highlight', rects: [[100, 700, 200, 712]], color: 'yellow', text: 'Cargo de supermercado', comment: 'No lo reconozco' },
      note({ page: 2 }),
    ]);
    const [hl, n] = marks();
    expect(hl.getAttribute('aria-label')).toBe('Resaltado: Cargo de supermercado. Comentario: No lo reconozco');
    expect(hl.getAttribute('role')).toBe('button');
    expect(parseFloat(hl.style.left)).toBeCloseTo(100 * PX);
    expect(parseFloat(hl.style.top)).toBeCloseTo((800 - 712) * PX);
    expect(parseFloat(hl.style.width)).toBeCloseTo(100 * PX);
    expect(n.closest('.cb-pdf__page')!.getAttribute('data-page')).toBe('2');
    expect(n.getAttribute('aria-label')).toBe('Nota: Revisar');
    expect(n.textContent!.trim()).toBe('Revisar');
  });

  it('con el teclado, Nota pone una nota en la página, abre su editor y Escape vuelve a ella', async () => {
    const { el, host, button, marks, live, key, fixture } = await setup();
    // Un clic de teclado (Intro / Espacio) tiene detail 0.
    button('Nota').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    await settle(fixture);
    const textarea = el.querySelector<HTMLTextAreaElement>('.cb-pdf__card textarea')!;
    expect(document.activeElement).toBe(textarea);
    expect(el.querySelector('.cb-pdf__card label')!.textContent).toBe('Texto de la nota');
    expect(live()).toBe('Añadido en la página 1: Nota');
    textarea.value = 'Llamar al banco';
    textarea.dispatchEvent(new Event('input'));
    await key(textarea, 'Escape');
    const [mark] = marks();
    expect(el.querySelector('.cb-pdf__card')).toBeNull();
    expect(document.activeElement).toBe(mark);
    expect(mark.getAttribute('aria-label')).toBe('Nota: Llamar al banco');
    expect(host.annotations()[0]).toMatchObject({ type: 'note', page: 1, text: 'Llamar al banco', author: 'Ana', color: 'yellow' });
  });

  it('una nota que se cierra vacía se descarta', async () => {
    const { el, host, button, key, fixture } = await setup();
    button('Nota').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    await settle(fixture);
    await key(el.querySelector('.cb-pdf__card textarea')!, 'Escape');
    expect(host.annotations()).toEqual([]);
  });

  it('flechas mueven la anotación (Mayús, más) y lo anuncian; Supr la borra', async () => {
    const { host, marks, live, key } = await setup([note()]);
    const [mark] = marks();
    mark.focus();
    await key(mark, 'ArrowRight');
    expect(host.annotations()[0]).toMatchObject({ rect: [63, 700, 183, 718] });
    expect(live()).toMatch(/^Movido a \d+ %, \d+ %$/);
    await key(marks()[0], 'ArrowDown', { shiftKey: true });
    expect(host.annotations()[0]).toMatchObject({ rect: [63, 685, 183, 703] });
    await key(marks()[0], 'Delete');
    expect(host.annotations()).toEqual([]);
    expect(host.removed?.id).toBe('n1');
    expect(live()).toBe('Anotación eliminada');
  });

  it('dos flechas antes de repintar (tecla mantenida) mueven dos veces', async () => {
    const { host, marks, fixture } = await setup([note()]);
    const mark = marks()[0];
    for (let i = 0; i < 2; i++) mark.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    await settle(fixture);
    expect(host.annotations()[0]).toMatchObject({ rect: [66, 700, 186, 718] });
  });

  it('+ y − cambian el tamaño de la letra de una nota', async () => {
    const { host, marks, live, key } = await setup([note()]);
    await key(marks()[0], '+');
    expect(host.annotations()[0]).toMatchObject({ fontSize: 13 });
    expect(live()).toBe('Letra de 13 pt');
  });

  it('Resaltar con texto seleccionado lo resalta al momento, en puntos PDF', async () => {
    const { el, host, button, fixture } = await setup();
    const span = el.querySelector('.cb-pdf__page[data-page="1"] .cb-pdf__text span')!;
    const range = document.createRange();
    range.selectNodeContents(span);
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    // jsdom no calcula cajas: la línea seleccionada ocupa 40,40 → 160×16 px en la página.
    Object.defineProperty(Range.prototype, 'getClientRects', { configurable: true, value: () => [{ left: 40, top: 40, width: 160, height: 16 }] });
    try {
      button('Resaltar').click();
      await settle(fixture);
    } finally {
      delete (Range.prototype as { getClientRects?: unknown }).getClientRects;
    }
    const [hl] = host.annotations();
    expect(hl).toMatchObject({ type: 'highlight', page: 1, text: 'Cargo de supermercado', color: 'yellow', rects: [[30, 758, 150, 770]] });
    expect(selection.isCollapsed).toBe(true);
    expect(el.querySelector<HTMLElement>('.cb-pdf__mark')!.getAttribute('aria-label')).toBe('Resaltado: Cargo de supermercado');
  });

  it('Intro en un resaltado abre el comentario', async () => {
    const { el, host, marks, key } = await setup([{ id: 'h1', page: 1, type: 'highlight', rects: [[100, 700, 200, 712]], color: 'green', text: 'Saldo' }]);
    await key(marks()[0], 'Enter');
    const textarea = el.querySelector<HTMLTextAreaElement>('.cb-pdf__card textarea')!;
    expect(el.querySelector('.cb-pdf__card label')!.textContent).toBe('Comentario');
    expect(marks()[0].getAttribute('aria-expanded')).toBe('true');
    textarea.value = 'Ok';
    textarea.dispatchEvent(new Event('input'));
    expect(host.annotations()[0]).toMatchObject({ comment: 'Ok' });
  });

  it('con Dibujar, un trazo del puntero crea un dibujo simplificado en puntos PDF', async () => {
    const { el, host, button, fixture } = await setup();
    button('Dibujar').click();
    fixture.detectChanges();
    const layer = el.querySelector<HTMLElement>('.cb-pdf__page[data-page="1"] .cb-pdf__marks')!;
    expect(layer.classList).toContain('cb-pdf__marks--capture');
    const pointer = (type: string, x: number, y: number) => layer.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y }));
    pointer('pointerdown', 0, 0);
    pointer('pointermove', 40, 0);
    pointer('pointermove', 80, 0.1);
    pointer('pointermove', 80, 40);
    pointer('pointerup', 80, 40);
    await settle(fixture);
    const [ink] = host.annotations();
    expect(ink).toMatchObject({ type: 'ink', page: 1, thickness: 2 });
    expect((ink as Extract<CbPdfAnnotation, { type: 'ink' }>).paths).toEqual([[0, 800, 60, 799.93, 60, 770]]);
    expect(el.querySelector('.cb-pdf__mark--ink path')!.getAttribute('d')).toMatch(/^M[\d.]+ [\d.]+ L/);
  });

  it('la pestaña Anotaciones las lista por página y lleva a cada una', async () => {
    const { el, host, fixture, button } = await setup([note({ id: 'n2', page: 2, text: 'Segunda' }), note()]);
    host.sidebar.set(true);
    await settle(fixture);
    const tab = Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-pdf__view')).find((b) => b.textContent!.trim() === 'Anotaciones')!;
    tab.click();
    await settle(fixture);
    const items = Array.from(el.querySelectorAll('.cb-pdf__notes-link'), (b) => b.textContent!.replace(/\s+/g, ' ').trim());
    expect(items).toEqual(['Página 1 de 2, Nota: Revisar', 'Página 2 de 2, Nota: Segunda']);
    el.querySelector<HTMLButtonElement>('.cb-pdf__notes-link')!.click();
    await settle(fixture);
    expect(document.activeElement).toBe(el.querySelector('.cb-pdf__mark[data-id="n1"]'));
    button('Eliminar anotación: Nota: Segunda').click();
    await settle(fixture);
    expect(host.annotations().map((a) => a.id)).toEqual(['n1']);
  });

  it('al guardar, las anotaciones se escriben en el PDF y después se quitan del storage', async () => {
    const { viewer, fake } = await setup([note(), { id: 'h1', page: 2, type: 'highlight', rects: [[100, 700, 200, 712]], color: 'yellow', text: 'x' }]);
    const blob = await viewer.save();
    expect(blob!.size).toBe(5);
    expect([...savedStorage!.keys()]).toEqual(['pdfjs_internal_editor_n1', 'pdfjs_internal_editor_h1']);
    expect(savedStorage!.get('pdfjs_internal_editor_n1')).toMatchObject({ annotationType: 3, pageIndex: 0, value: 'Revisar' });
    expect(savedStorage!.get('pdfjs_internal_editor_h1')).toMatchObject({ annotationType: 9, pageIndex: 1 });
    expect(fake.storage.size).toBe(0);
    // Escribirlas no cuenta como rellenar el formulario.
    expect(viewer.formModified()).toBe(false);
  });

  it('el botón de descarga dice que lleva las anotaciones', async () => {
    const { button } = await setup([note()]);
    expect(button('Descargar con las anotaciones')).toBeTruthy();
  });
});
