import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CB_PDF_VIEWER_OPTIONS, type CbPdfJs } from './pdf-engine';
import { CbPdfViewer } from './pdfviewer.component';

const REF2 = { num: 12, gen: 0 };
const REF3 = { num: 13, gen: 0 };

interface LinkServiceLike {
  addLinkAttributes(link: HTMLAnchorElement, url: string, newWindow?: boolean): void;
  goToDestination(dest: unknown): void;
  executeNamedAction(action: string): void;
}

/** pdf.js simulado con índice, destinos, enlaces y un formulario. */
function fakePdfJs() {
  const calls = { renders: [] as { page: number; annotationMode: unknown }[], layers: [] as { linkService: LinkServiceLike; renderForms: boolean }[], saved: 0 };

  class AnnotationStorage {
    private readonly values = new Map<string, { value: unknown }>();
    onSetModified: null | (() => void) = null;
    getValue(id: string, fallback: { value: unknown }) {
      return this.values.get(id) ?? fallback;
    }
    setValue(id: string, value: { value: unknown }) {
      const first = this.values.size === 0;
      this.values.set(id, value);
      if (first) this.onSetModified?.();
    }
  }
  const storage = new AnnotationStorage();

  class AnnotationLayer {
    constructor(private readonly p: { div: HTMLElement; linkService: LinkServiceLike }) {}
    async render(params: { linkService: LinkServiceLike; renderForms: boolean; div: HTMLElement }) {
      calls.layers.push({ linkService: params.linkService, renderForms: params.renderForms });
      const section = document.createElement('section');
      section.className = 'linkAnnotation';
      section.append(document.createElement('a'));
      this.p.div.append(section);
    }
  }

  const page = (n: number) => ({
    rotate: 0,
    userUnit: 1,
    getViewport: ({ scale = 1 }: { scale?: number }) => ({ width: 600 * scale, height: 800 * scale, scale, rotation: 0, clone: () => ({}) }),
    render: (params: { annotationMode?: unknown }) => {
      calls.renders.push({ page: n, annotationMode: params.annotationMode });
      return { promise: Promise.resolve(), cancel() {} };
    },
    getTextContent: async () => ({ items: [] }),
    getAnnotations: async () => (n === 1 ? [{ subtype: 'Link', dest: 'datos' }] : []),
    cleanup() {},
  });

  const pdf = {
    numPages: 3,
    annotationStorage: storage,
    getPage: async (n: number) => page(n),
    getData: async () => new Uint8Array([37, 80, 68, 70]),
    saveDocument: async () => {
      calls.saved++;
      return new Uint8Array([37, 80, 68, 70, 1]);
    },
    getOutline: async () => [
      { title: '1. Datos', dest: [REF2, { name: 'XYZ' }, 0, 700, null], url: null, bold: true, italic: false, items: [] },
      {
        title: '2. Condiciones',
        dest: 'condiciones',
        url: null,
        bold: false,
        italic: false,
        items: [{ title: '2.1 Tasas', dest: [REF3, { name: 'FitH' }, 500], url: null, bold: false, italic: true, items: [] }],
      },
    ],
    getDestination: async (name: string) => (name === 'condiciones' || name === 'datos' ? [name === 'datos' ? REF2 : REF3, { name: 'Fit' }] : null),
    getPageIndex: async (ref: { num: number }) => (ref.num === 12 ? 1 : 2),
    getFieldObjects: async () =>
      new Map<string, object[]>([
        ['nombre', [{ id: '1R', type: 'text', value: '' }]],
        ['tipo', [{ id: '2R', type: 'combobox', value: 'Ahorros' }]],
        ['acepto', [{ id: '3R', type: 'checkbox', value: 'Off', exportValues: 'Si' }]],
      ]),
  };

  const pdfjs = {
    GlobalWorkerOptions: { workerSrc: '', workerPort: null },
    AnnotationMode: { DISABLE: 0, ENABLE: 1, ENABLE_FORMS: 2, ENABLE_STORAGE: 3 },
    AnnotationLayer,
    getDocument: () => ({ onPassword: null, onProgress: null, destroy: async () => undefined, promise: Promise.resolve(pdf) }),
  };
  return { pdfjs: pdfjs as unknown as CbPdfJs, calls, storage };
}

@Component({
  imports: [CbPdfViewer],
  template: `<cb-pdf-viewer src="doc.pdf" [(page)]="page" [sidebar]="true" [forms]="forms()" (formChange)="changes = changes + 1" />`,
})
class HostComponent {
  page = signal(1);
  forms = signal(true);
  changes = 0;
}

async function settle(fixture: ComponentFixture<unknown>) {
  for (let i = 0; i < 8; i++) {
    await new Promise((r) => setTimeout(r));
    fixture.detectChanges();
    await fixture.whenStable();
  }
}

async function setup(forms = true) {
  const fake = fakePdfJs();
  TestBed.configureTestingModule({
    providers: [{ provide: CB_PDF_VIEWER_OPTIONS, useValue: { loader: () => Promise.resolve(fake.pdfjs) } }],
  });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.forms.set(forms);
  fixture.detectChanges();
  await settle(fixture);
  const el = fixture.nativeElement as HTMLElement;
  const viewer = fixture.debugElement.children[0].componentInstance as CbPdfViewer;
  return { fixture, el, viewer, host: fixture.componentInstance, ...fake };
}

describe('CbPdfViewer: índice, enlaces y formularios', () => {
  it('muestra la pestaña Índice con las entradas del documento (negrita, cursiva y subniveles)', async () => {
    const { el, fixture } = await setup();
    const tabs = Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-pdf__view'));
    expect(tabs.map((t) => t.textContent!.trim())).toEqual(['Miniaturas', 'Índice']);
    expect(tabs[0].getAttribute('aria-pressed')).toBe('true');
    tabs[1].click();
    await settle(fixture);
    const links = Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-pdf__outline-link'));
    expect(links.map((l) => l.textContent!.trim())).toEqual(['1. Datos', '2. Condiciones', '2.1 Tasas']);
    expect(links[0].classList).toContain('cb-pdf__outline-link--bold');
    expect(links[2].classList).toContain('cb-pdf__outline-link--italic');
    expect(el.querySelector('nav.cb-pdf__outline')!.getAttribute('aria-label')).toBe('Índice');
  });

  it('las entradas llevan a su página (destino explícito o con nombre) y se contraen', async () => {
    const { el, fixture, viewer, host } = await setup();
    viewer.sidebarView.set('outline');
    await settle(fixture);
    const link = (title: string) => Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-pdf__outline-link')).find((l) => l.textContent!.includes(title))!;
    link('2.1').click();
    await settle(fixture);
    expect(host.page()).toBe(3);
    link('1. Datos').click();
    await settle(fixture);
    expect(host.page()).toBe(2);
    await viewer.goToDestination('condiciones');
    await settle(fixture);
    expect(host.page()).toBe(3);

    const toggle = el.querySelector<HTMLButtonElement>('.cb-pdf__outline-toggle')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Contraer 2. Condiciones');
    toggle.click();
    await settle(fixture);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelectorAll('.cb-pdf__outline-link').length).toBe(2);
  });

  it('pinta la capa de enlaces y campos; el canvas no dibuja los campos si son HTML', async () => {
    const { el, calls } = await setup();
    expect(el.querySelector('.cb-pdf__page[data-page="1"] .cb-pdf__annotations .linkAnnotation')).toBeTruthy();
    expect(calls.layers[0].renderForms).toBe(true);
    // Las páginas (no las miniaturas) se pintan sin los campos.
    const pages = calls.renders.filter((r) => r.annotationMode !== undefined);
    expect(pages.length).toBeGreaterThan(0);
    expect(pages.every((r) => r.annotationMode === 2)).toBe(true);
  });

  it('con [forms]="false" los campos se pintan en el canvas', async () => {
    const { calls } = await setup(false);
    expect(calls.layers[0].renderForms).toBe(false);
    const pages = calls.renders.filter((r) => r.annotationMode !== undefined);
    expect(pages.length).toBeGreaterThan(0);
    expect(pages.every((r) => r.annotationMode === 1)).toBe(true);
  });

  it('el servicio de enlaces abre solo URL seguras en otra pestaña y navega a destinos y acciones', async () => {
    const { calls, fixture, host } = await setup();
    const links = calls.layers[0].linkService;
    const safe = document.createElement('a');
    links.addLinkAttributes(safe, 'https://www.example.com/cuentas', true);
    expect(safe.href).toBe('https://www.example.com/cuentas');
    expect(safe.target).toBe('_blank');
    expect(safe.rel).toContain('noopener');
    const unsafe = document.createElement('a');
    links.addLinkAttributes(unsafe, 'javascript:alert(1)', true);
    expect(unsafe.hasAttribute('href')).toBe(false);

    links.goToDestination('datos');
    await settle(fixture);
    expect(host.page()).toBe(2);
    links.executeNamedAction('LastPage');
    await settle(fixture);
    expect(host.page()).toBe(3);
    links.executeNamedAction('FirstPage');
    await settle(fixture);
    expect(host.page()).toBe(1);
  });

  it('getFormData devuelve los valores por nombre (texto, desplegable y casilla)', async () => {
    const { viewer, storage } = await setup();
    expect(await viewer.getFormData()).toEqual({ nombre: '', tipo: 'Ahorros', acepto: false });
    storage.setValue('1R', { value: 'Ana Pérez' });
    storage.setValue('2R', { value: ['Corriente'] });
    storage.setValue('3R', { value: true });
    expect(await viewer.getFormData()).toEqual({ nombre: 'Ana Pérez', tipo: ['Corriente'], acepto: true });
  });

  it('al rellenar, Descargar cambia de nombre y guarda el PDF con los datos; los cambios emiten formChange', async () => {
    const { el, fixture, viewer, storage, calls, host } = await setup();
    const download = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-pdf__tool')).find((b) => b.getAttribute('aria-label')!.startsWith('Descargar'))!;
    expect(download().getAttribute('aria-label')).toBe('Descargar');
    expect(await viewer.save()).toBeInstanceOf(Blob);
    expect(calls.saved).toBe(0);

    storage.setValue('1R', { value: 'Ana' });
    el.querySelector('.cb-pdf__annotations')!.dispatchEvent(new Event('input', { bubbles: true }));
    await settle(fixture);
    expect(viewer.formModified()).toBe(true);
    expect(host.changes).toBe(1);
    expect(download().getAttribute('aria-label')).toBe('Descargar con los datos del formulario');
    const blob = await viewer.save();
    expect(calls.saved).toBe(1);
    expect(blob!.size).toBe(5);
  });
});
