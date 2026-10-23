import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CB_PDF_VIEWER_OPTIONS, CbPdfEngine, type CbPdfJs, type CbPdfSource } from './pdf-engine';
import { CbPdfViewer, type CbPdfZoom } from './pdfviewer.component';

interface FakeOptions {
  password?: string;
  fail?: boolean;
}

/** pdf.js simulado: páginas de 600×800 pt con el texto indicado. */
function fakePdfJs(pages: string[][], options: FakeOptions = {}) {
  const calls = { getDocument: [] as Record<string, unknown>[], renders: [] as number[] };

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

  const page = (n: number) => ({
    rotate: 0,
    userUnit: 1,
    getViewport: ({ scale = 1, rotation = 0 }: { scale?: number; rotation?: number }) =>
      rotation % 180 ? { width: 800 * scale, height: 600 * scale, scale, rotation } : { width: 600 * scale, height: 800 * scale, scale, rotation },
    render: () => {
      calls.renders.push(n);
      return { promise: Promise.resolve(), cancel() {} };
    },
    getTextContent: async () => ({ items: pages[n - 1].map((str) => ({ str, hasEOL: true })) }),
    cleanup() {},
  });
  const pdf = { numPages: pages.length, getPage: async (n: number) => page(n), getData: async () => new Uint8Array([37, 80, 68, 70]) };

  const pdfjs = {
    GlobalWorkerOptions: { workerSrc: '', workerPort: null },
    PasswordResponses: { NEED_PASSWORD: 1, INCORRECT_PASSWORD: 2 },
    TextLayer,
    getDocument(params: Record<string, unknown>) {
      calls.getDocument.push(params);
      const task = {
        onPassword: null as null | ((update: (pw: string) => void, reason: number) => void),
        onProgress: null as null | ((p: { loaded: number; total: number }) => void),
        destroy: async () => undefined,
        promise: new Promise((resolve, reject) => {
          if (options.fail) return void setTimeout(() => reject(new Error('Invalid PDF')));
          const attempt = (pw: string | undefined, reason: number) => {
            if (!options.password || pw === options.password) resolve(pdf);
            else task.onPassword?.((next) => attempt(next, 2), reason);
          };
          setTimeout(() => attempt(params['password'] as string | undefined, 1));
        }),
      };
      return task;
    },
  };
  return { pdfjs: pdfjs as unknown as CbPdfJs, calls, raw: pdfjs };
}

@Component({
  imports: [CbPdfViewer],
  template: `<cb-pdf-viewer
    [src]="src()"
    [(page)]="page"
    [(zoom)]="zoom"
    [(sidebar)]="sidebar"
    (loaded)="loaded = $event"
    (loadError)="error = $event"
  />`,
})
class HostComponent {
  src = signal<CbPdfSource | null>('docs/extracto.pdf');
  page = signal(1);
  zoom = signal<CbPdfZoom>('page-width');
  sidebar = signal(false);
  loaded: { numPages: number } | null = null;
  error: unknown = null;
}

const PAGES = [['Extracto de cuenta', 'Dirección de envío'], ['Movimientos del mes'], ['Nueva direccion registrada', 'Fin']];

async function settle(fixture: ComponentFixture<unknown>) {
  for (let i = 0; i < 8; i++) {
    await new Promise((r) => setTimeout(r));
    fixture.detectChanges();
    await fixture.whenStable();
  }
}

async function setup(pages = PAGES, options: FakeOptions = {}) {
  const fake = fakePdfJs(pages, options);
  TestBed.configureTestingModule({
    providers: [{ provide: CB_PDF_VIEWER_OPTIONS, useValue: { loader: () => Promise.resolve(fake.pdfjs) } }],
  });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  await settle(fixture);
  const el = fixture.nativeElement as HTMLElement;
  const viewer = fixture.debugElement.children[0].componentInstance as CbPdfViewer;
  const q = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s)!;
  const qa = <T extends Element = HTMLElement>(s: string) => Array.from(el.querySelectorAll<T>(s));
  const button = (label: string) => qa<HTMLButtonElement>('button').find((b) => b.getAttribute('aria-label') === label)!;
  return { fixture, el, viewer, host: fixture.componentInstance, fake, q, qa, button };
}

afterEach(() => vi.restoreAllMocks());

describe('CbPdfViewer', () => {
  it('abre el documento, pasa recursos absolutos y renderiza cada página con su nombre', async () => {
    const { host, fake, qa, q } = await setup();
    const params = fake.calls.getDocument[0];
    // Relativa al <base href>, no a la ruta actual (pdf.js la resolvería contra location).
    expect(params['url']).toBe(new URL('docs/extracto.pdf', document.baseURI).href);
    expect(params['cMapUrl']).toMatch(/^https?:\/\/.+\/pdfjs\/cmaps\/$/);
    expect(fake.raw.GlobalWorkerOptions.workerSrc).toMatch(/\/pdfjs\/build\/pdf\.worker\.min\.mjs$/);
    expect(host.loaded).toEqual({ numPages: 3 });
    const pages = qa('.cb-pdf__page');
    expect(pages.map((p) => p.getAttribute('aria-label'))).toEqual(['Página 1 de 3', 'Página 2 de 3', 'Página 3 de 3']);
    expect(pages[0].getAttribute('role')).toBe('group');
    expect(q('.cb-pdf__total').textContent!.trim()).toBe('de 3');
    expect(new Set(fake.calls.renders)).toEqual(new Set([1, 2, 3]));
    expect(pages[0].querySelector('canvas')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('la capa de texto deja el contenido legible y seleccionable', async () => {
    const { qa } = await setup();
    const text = qa('.cb-pdf__text')[0];
    expect(Array.from(text.querySelectorAll('span'), (s) => s.textContent)).toEqual(['Extracto de cuenta', 'Dirección de envío']);
  });

  it('la búsqueda ignora tildes y mayúsculas, resalta y recorre las coincidencias', async () => {
    const { fixture, viewer, q, qa, button } = await setup();
    await viewer.search('DIRECCION');
    await settle(fixture);
    expect(q('.cb-pdf__status').textContent!.trim()).toBe('1 de 2');
    expect(q('.cb-pdf__status').getAttribute('aria-live')).toBe('polite');
    const selected = () => qa('.cb-pdf__hl.cb-is-selected').map((h) => h.textContent);
    expect(qa('.cb-pdf__hl').map((h) => h.textContent)).toEqual(['Dirección', 'direccion']);
    expect(selected()).toEqual(['Dirección']);
    button('Coincidencia siguiente').click();
    await settle(fixture);
    expect(selected()).toEqual(['direccion']);
    expect(q('.cb-pdf__status').textContent!.trim()).toBe('2 de 2');
    button('Coincidencia siguiente').click();
    await settle(fixture);
    expect(selected()).toEqual(['Dirección']);
  });

  it('sin resultados lo anuncia y limpiar la búsqueda restaura el texto', async () => {
    const { fixture, viewer, q, qa } = await setup();
    await viewer.search('inexistente');
    await settle(fixture);
    expect(q('.cb-pdf__status').textContent!.trim()).toBe('Sin resultados');
    await viewer.search('cuenta');
    await settle(fixture);
    expect(qa('.cb-pdf__hl')).toHaveLength(1);
    await viewer.search('');
    await settle(fixture);
    expect(qa('.cb-pdf__hl')).toHaveLength(0);
    expect(qa('.cb-pdf__text')[0].querySelector('span')!.textContent).toBe('Extracto de cuenta');
    expect(q('.cb-pdf__status').textContent!.trim()).toBe('');
  });

  it('navega entre páginas con los botones y el campo de número', async () => {
    const { fixture, host, q, button } = await setup();
    expect(button('Página anterior').disabled).toBe(true);
    button('Página siguiente').click();
    await settle(fixture);
    expect(host.page()).toBe(2);
    const input = q<HTMLInputElement>('.cb-pdf__page-input');
    expect(input.getAttribute('aria-label')).toBe('Número de página');
    input.value = '9';
    input.dispatchEvent(new Event('change'));
    await settle(fixture);
    expect(host.page()).toBe(3);
    expect(input.value).toBe('3');
    expect(button('Página siguiente').disabled).toBe(true);
  });

  it('zoom: botones, selector y tamaño de página en píxeles CSS (100 % = tamaño real)', async () => {
    const { fixture, host, q, qa, button } = await setup();
    // Sin ancho medible (jsdom), "ajustar al ancho" equivale a 100 %: 600 pt = 800 px.
    expect(qa('.cb-pdf__page')[0].style.width).toBe('800px');
    button('Acercar').click();
    await settle(fixture);
    expect(host.zoom()).toBe(1.25);
    const select = q<HTMLSelectElement>('.cb-pdf__zoom');
    select.value = '2';
    select.dispatchEvent(new Event('change'));
    await settle(fixture);
    expect(host.zoom()).toBe(2);
    expect(qa('.cb-pdf__page')[0].style.width).toBe('1600px');
    button('Alejar').click();
    await settle(fixture);
    expect(host.zoom()).toBe(1.5);
  });

  it('girar intercambia ancho y alto y vuelve a renderizar', async () => {
    const { fixture, viewer, qa, button, fake } = await setup();
    const before = fake.calls.renders.length;
    button('Rotar a la derecha').click();
    await settle(fixture);
    expect(viewer.rotation()).toBe(90);
    const page = qa('.cb-pdf__page')[0];
    expect([page.style.width, page.style.height]).toEqual(['1066px', '800px']);
    expect(fake.calls.renders.length).toBeGreaterThan(before);
  });

  it('miniaturas: botón con aria-expanded, página actual marcada y navegación', async () => {
    const { fixture, host, q, qa, button } = await setup();
    const toggle = button('Miniaturas');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click();
    await settle(fixture);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const nav = q('.cb-pdf__sidebar nav.cb-pdf__thumbs');
    expect(nav.getAttribute('aria-label')).toBe('Miniaturas');
    expect(toggle.getAttribute('aria-controls')).toBe(q('.cb-pdf__sidebar').id);
    // Sin índice en el documento no hay pestañas.
    expect(qa('.cb-pdf__view').length).toBe(0);
    const thumbs = qa<HTMLButtonElement>('.cb-pdf__thumb');
    expect(thumbs[0].getAttribute('aria-current')).toBe('page');
    expect(thumbs[0].querySelector('canvas')).not.toBeNull();
    thumbs[0].focus();
    thumbs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(thumbs[1]);
    thumbs[2].click();
    await settle(fixture);
    expect(host.page()).toBe(3);
    expect(thumbs[2].getAttribute('aria-current')).toBe('page');
  });

  it('pide la contraseña y avisa si es incorrecta', async () => {
    const { fixture, host, q } = await setup(PAGES, { password: 'secreta' });
    const input = q<HTMLInputElement>('input[type="password"]');
    expect(q('label').textContent!.trim()).toBe('Contraseña');
    expect(input.getAttribute('aria-describedby')).toBe(q('.cb-pdf__password-text').id);
    input.value = 'mal';
    q('form').dispatchEvent(new Event('submit'));
    await settle(fixture);
    expect(q('[role="alert"]').textContent).toContain('Contraseña incorrecta');
    expect(q<HTMLInputElement>('input[type="password"]').getAttribute('aria-invalid')).toBe('true');
    q<HTMLInputElement>('input[type="password"]').value = 'secreta';
    q('form').dispatchEvent(new Event('submit'));
    await settle(fixture);
    expect(host.loaded).toEqual({ numPages: 3 });
  });

  it('si no se puede abrir muestra un error y emite loadError', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { host, q } = await setup(PAGES, { fail: true });
    expect(q('[role="alert"]').textContent!.trim()).toBe('No se pudo abrir el documento.');
    expect(host.error).toBeInstanceOf(Error);
    expect(log).toHaveBeenCalledWith('[cb-pdf-viewer]', host.error);
    log.mockRestore();
  });

  it('acepta bytes y Blob (copia los datos antes de enviarlos a pdf.js)', async () => {
    const { fixture, host, fake } = await setup();
    const bytes = new Uint8Array([1, 2, 3]);
    host.src.set(bytes);
    await settle(fixture);
    const data = fake.calls.getDocument.at(-1)!['data'] as Uint8Array;
    expect(Array.from(data)).toEqual([1, 2, 3]);
    expect(data).not.toBe(bytes);
    host.src.set(new Blob([new Uint8Array([4, 5])], { type: 'application/pdf' }));
    await settle(fixture);
    expect(Array.from(fake.calls.getDocument.at(-1)!['data'] as Uint8Array)).toEqual([4, 5]);
  });

  it('descarga con el nombre del archivo de la URL', async () => {
    const { button } = await setup();
    const create = vi.fn(() => 'blob:pdf');
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() });
    let name = '';
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      name = this.download;
    });
    button('Descargar').click();
    await new Promise((r) => setTimeout(r));
    expect(create).toHaveBeenCalled();
    expect(name).toBe('extracto.pdf');
  });

  it('atajos: Ctrl+F lleva a la búsqueda y Ctrl++ acerca', async () => {
    const { fixture, el, host, q } = await setup();
    const viewer = el.querySelector('cb-pdf-viewer')!;
    viewer.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true }));
    expect(document.activeElement).toBe(q('.cb-pdf__search-input'));
    viewer.dispatchEvent(new KeyboardEvent('keydown', { key: '+', ctrlKey: true, bubbles: true }));
    await settle(fixture);
    expect(host.zoom()).toBe(1.25);
  });

  it('es una región con nombre y los controles tienen nombre accesible', async () => {
    const { el, qa } = await setup();
    const viewer = el.querySelector('cb-pdf-viewer')!;
    expect(viewer.getAttribute('role')).toBe('region');
    expect(viewer.getAttribute('aria-label')).toBe('Visor de PDF');
    for (const b of qa('.cb-pdf__toolbar button')) expect(b.getAttribute('aria-label')).toBeTruthy();
    for (const icon of qa('.cb-pdf__toolbar cb-icon')) expect(icon.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('CbPdfEngine', () => {
  it('carga pdf.js una vez y respeta un worker ya configurado', async () => {
    const fake = fakePdfJs([['a']]);
    fake.raw.GlobalWorkerOptions.workerSrc = '/mi/worker.mjs';
    const loader = vi.fn(() => Promise.resolve(fake.pdfjs));
    TestBed.configureTestingModule({ providers: [{ provide: CB_PDF_VIEWER_OPTIONS, useValue: { loader, assetsUrl: '/static/pdfjs' } }] });
    const engine = TestBed.inject(CbPdfEngine);
    await engine.load();
    await engine.load();
    expect(loader).toHaveBeenCalledTimes(1);
    expect(fake.raw.GlobalWorkerOptions.workerSrc).toBe('/mi/worker.mjs');
    expect(engine.resources().standardFontDataUrl).toMatch(/^https?:\/\/[^/]+\/static\/pdfjs\/standard_fonts\/$/);
  });
});
