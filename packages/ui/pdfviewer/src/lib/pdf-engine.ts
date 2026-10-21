import { DOCUMENT } from '@angular/common';
import { Injectable, InjectionToken, inject, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

/** Módulo de pdf.js (`pdfjs-dist`) que usa el visor. */
export type CbPdfJs = typeof import('pdfjs-dist');

/** Documento abierto por pdf.js. */
export type CbPdfDocument = import('pdfjs-dist').PDFDocumentProxy;

/** Página de un documento de pdf.js. */
export type CbPdfPage = import('pdfjs-dist').PDFPageProxy;

/** Origen del documento: URL, bytes o un `Blob` / `File`. */
export type CbPdfSource = string | URL | ArrayBuffer | Uint8Array | Blob;

/** Opciones globales del visor (`provideCbPdfViewer`). */
export interface CbPdfViewerOptions {
  /**
   * URL del worker de pdf.js. Por defecto `pdfjs/build/pdf.worker.min.mjs`,
   * relativa al `<base href>` (ver la configuración de assets en la documentación).
   */
  workerSrc?: string;
  /**
   * Carpeta con los recursos de pdf.js (`cmaps/`, `standard_fonts/`, `wasm/`,
   * `iccs/`). Por defecto `pdfjs/`.
   */
  assetsUrl?: string;
  /** Carga de pdf.js. Por defecto `import('pdfjs-dist')` (se descarga al abrir el primer PDF). */
  loader?: () => Promise<CbPdfJs>;
}

export const CB_PDF_VIEWER_OPTIONS = new InjectionToken<CbPdfViewerOptions>('CB_PDF_VIEWER_OPTIONS');

/**
 * Configura el visor de PDF (worker, recursos y carga de pdf.js).
 *
 * @example
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [provideCaribeNG(), provideCbPdfViewer({ workerSrc: '/static/pdf.worker.min.mjs' })],
 * });
 * ```
 */
export function provideCbPdfViewer(options: CbPdfViewerOptions): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: CB_PDF_VIEWER_OPTIONS, useValue: options }]);
}

/** Recursos que pdf.js necesita, ya resueltos como URLs absolutas. */
export interface CbPdfResources {
  cMapUrl: string;
  standardFontDataUrl: string;
  wasmUrl: string;
  iccUrl: string;
}

/**
 * Carga pdf.js una sola vez y configura su worker. Las URLs se resuelven contra
 * el `<base href>` del documento: el worker de pdf.js las pediría relativas a
 * su propio script.
 */
@Injectable({ providedIn: 'root' })
export class CbPdfEngine {
  private readonly options = inject(CB_PDF_VIEWER_OPTIONS, { optional: true }) ?? {};
  private readonly document = inject(DOCUMENT);
  private pdfjs?: Promise<CbPdfJs>;

  load(): Promise<CbPdfJs> {
    this.pdfjs ??= (this.options.loader ?? (() => import('pdfjs-dist')))().then((pdfjs) => {
      if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc && !pdfjs.GlobalWorkerOptions.workerPort) {
        pdfjs.GlobalWorkerOptions.workerSrc = this.resolve(this.options.workerSrc ?? 'pdfjs/build/pdf.worker.min.mjs');
      }
      return pdfjs;
    });
    // Si falla (p. ej. pdfjs-dist no está instalado) se puede reintentar.
    this.pdfjs.catch(() => (this.pdfjs = undefined));
    return this.pdfjs;
  }

  resources(): CbPdfResources {
    const base = this.resolve(withSlash(this.options.assetsUrl ?? 'pdfjs/'));
    return {
      cMapUrl: `${base}cmaps/`,
      standardFontDataUrl: `${base}standard_fonts/`,
      wasmUrl: `${base}wasm/`,
      iccUrl: `${base}iccs/`,
    };
  }

  private resolve(url: string): string {
    try {
      return new URL(url, this.document.baseURI).href;
    } catch {
      return url;
    }
  }
}

function withSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}
