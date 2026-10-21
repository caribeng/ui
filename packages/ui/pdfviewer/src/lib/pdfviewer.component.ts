import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  PLATFORM_ID,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  isDevMode,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbIcon, CbIconRegistry } from '@caribeng/ui/icon';
import { panelLeft, printer, zoomIn, zoomOut } from '@caribeng/ui/icons';
import { CbSpinner } from '@caribeng/ui/spinner';
import { CbPdfEngine, type CbPdfDocument, type CbPdfJs, type CbPdfPage, type CbPdfSource } from './pdf-engine';
import { printPdfDocument } from './pdf-print';
import { buildTextIndex, findMatches, highlightMatches, type CbPdfMatch, type CbPdfTextIndex } from './pdf-search';

let nextUid = 0;

/** Zoom: factor (1 = 100 %), ajustar al ancho o página completa. */
export type CbPdfZoom = number | 'page-width' | 'page-fit';

/** Giro del documento, en grados. */
export type CbPdfRotation = 0 | 90 | 180 | 270;

/** Puntos PDF (1/72") a píxeles CSS (1/96"): 100 % es el tamaño real. */
const CSS_UNITS = 96 / 72;
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 5;
/** Margen alrededor de las páginas (px), igual que en el CSS. */
const PAGE_GAP = 16;
/** Píxeles máximos de un canvas (evita agotar la memoria en zoom alto). */
const MAX_CANVAS_PIXELS = 2 ** 24;
const THUMB_WIDTH = 112;

type ViewerState = 'idle' | 'loading' | 'password' | 'ready' | 'error';
type TextContent = Awaited<ReturnType<CbPdfPage['getTextContent']>>;

interface PageSize {
  /** Ancho y alto en puntos (con `userUnit`), sin girar. */
  width: number;
  height: number;
  rotate: number;
  userUnit: number;
}

interface TextLayerLike {
  render(): Promise<unknown>;
  cancel(): void;
  readonly textDivs: HTMLElement[];
  readonly textContentItemsStr: string[];
}

interface RenderedPage {
  key: string;
  cancel: () => void;
  textLayer?: TextLayerLike;
}

const PDF_ICONS: Record<string, string> = {
  'zoom-in': zoomIn,
  'zoom-out': zoomOut,
  printer,
  'panel-left': panelLeft,
};

/**
 * Visor de PDF sobre [pdf.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`,
 * dependencia opcional que se carga al abrir el primer documento).
 *
 * Renderiza las páginas a medida que se ven, con texto seleccionable y
 * legible por lectores de pantalla, búsqueda (ignora tildes y mayúsculas),
 * miniaturas, zoom, giro, descarga, impresión y documentos con contraseña.
 *
 * @example
 * ```html
 * <cb-pdf-viewer src="/docs/extracto.pdf" [(page)]="pagina" zoom="page-width" />
 * ```
 */
@Component({
  selector: 'cb-pdf-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon, CbSpinner],
  host: {
    class: 'cb-pdf-viewer',
    role: 'region',
    '[attr.aria-label]': 'ariaLabel() || t().pdfViewer',
    '(keydown)': 'onHostKeydown($event)',
  },
  template: `
    @if (showToolbar()) {
      <div class="cb-pdf__toolbar">
        @if (showThumbnails()) {
          <div class="cb-pdf__group">
            <button
              type="button"
              class="cb-pdf__tool"
              [attr.aria-label]="t().thumbnails"
              [attr.aria-expanded]="sidebar()"
              [attr.aria-controls]="uid + '-thumbs'"
              [disabled]="state() !== 'ready'"
              (click)="sidebar.set(!sidebar())"
            >
              <cb-icon name="panel-left" [size]="18" aria-hidden="true" />
            </button>
          </div>
        }

        <div class="cb-pdf__group" role="group" [attr.aria-label]="t().pagination">
          <button
            type="button"
            class="cb-pdf__tool"
            [attr.aria-label]="t().previousPage"
            [disabled]="state() !== 'ready' || page() <= 1"
            (click)="previousPage()"
          >
            <cb-icon name="chevron-up" [size]="18" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="cb-pdf__tool"
            [attr.aria-label]="t().nextPage"
            [disabled]="state() !== 'ready' || page() >= numPages()"
            (click)="nextPage()"
          >
            <cb-icon name="chevron-down" [size]="18" aria-hidden="true" />
          </button>
          <input
            class="cb-pdf__field cb-pdf__page-input"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            [id]="uid + '-page'"
            [attr.aria-label]="t().pageNumber"
            [attr.aria-describedby]="uid + '-total'"
            [value]="page()"
            [disabled]="state() !== 'ready'"
            (change)="onPageInput($event)"
            (keydown.enter)="onPageInput($event)"
          />
          <span class="cb-pdf__total" [id]="uid + '-total'">{{ format(t().ofTotal, numPages() || '–') }}</span>
        </div>

        <div class="cb-pdf__group" role="group" [attr.aria-label]="t().zoomLevel">
          <button type="button" class="cb-pdf__tool" [attr.aria-label]="t().zoomOut" [disabled]="state() !== 'ready' || scale() <= 0.25" (click)="zoomOut()">
            <cb-icon name="zoom-out" [size]="18" aria-hidden="true" />
          </button>
          <select
            class="cb-pdf__field cb-pdf__zoom"
            [attr.aria-label]="t().zoomLevel"
            [disabled]="state() !== 'ready'"
            (change)="onZoomSelect($any($event.target).value)"
          >
            <option value="page-width" [selected]="zoomValue() === 'page-width'">{{ t().fitWidth }}</option>
            <option value="page-fit" [selected]="zoomValue() === 'page-fit'">{{ t().fitPage }}</option>
            @if (customZoom(); as custom) {
              <option [value]="custom" selected>{{ percent(custom) }}</option>
            }
            @for (level of zoomLevels; track level) {
              <option [value]="level" [selected]="zoomValue() === '' + level">{{ percent(level) }}</option>
            }
          </select>
          <button type="button" class="cb-pdf__tool" [attr.aria-label]="t().zoomIn" [disabled]="state() !== 'ready' || scale() >= 5" (click)="zoomIn()">
            <cb-icon name="zoom-in" [size]="18" aria-hidden="true" />
          </button>
          @if (showRotate()) {
            <button type="button" class="cb-pdf__tool" [attr.aria-label]="t().rotateRight" [disabled]="state() !== 'ready'" (click)="rotate()">
              <cb-icon name="rotate-cw" [size]="18" aria-hidden="true" />
            </button>
          }
        </div>

        <span class="cb-pdf__spacer"></span>

        @if (showSearch()) {
          <div class="cb-pdf__group cb-pdf__search" role="search">
            <cb-icon class="cb-pdf__search-icon" name="search" [size]="16" aria-hidden="true" />
            <input
              #searchInput
              class="cb-pdf__field cb-pdf__search-input"
              type="search"
              autocomplete="off"
              [attr.aria-label]="t().searchInDocument"
              [attr.aria-describedby]="uid + '-status'"
              [placeholder]="t().searchInDocument"
              [disabled]="state() !== 'ready'"
              (input)="onSearchInput(searchInput.value)"
              (keydown)="onSearchKeydown($event, searchInput.value)"
            />
            <span class="cb-pdf__status" [id]="uid + '-status'" aria-live="polite">{{ searchStatus() }}</span>
            <button type="button" class="cb-pdf__tool" [attr.aria-label]="t().previousMatch" [disabled]="!matches().length" (click)="findPrevious()">
              <cb-icon name="chevron-left" [size]="18" aria-hidden="true" />
            </button>
            <button type="button" class="cb-pdf__tool" [attr.aria-label]="t().nextMatch" [disabled]="!matches().length" (click)="findNext()">
              <cb-icon name="chevron-right" [size]="18" aria-hidden="true" />
            </button>
          </div>
        }

        @if (downloadable() || printable()) {
          <div class="cb-pdf__group">
            @if (downloadable()) {
              <button type="button" class="cb-pdf__tool" [attr.aria-label]="t().download" [disabled]="state() !== 'ready'" (click)="download()">
                <cb-icon name="download" [size]="18" aria-hidden="true" />
              </button>
            }
            @if (printable()) {
              <button
                type="button"
                class="cb-pdf__tool"
                [attr.aria-label]="t().print"
                [disabled]="state() !== 'ready' || !!printProgress()"
                (click)="print()"
              >
                <cb-icon name="printer" [size]="18" aria-hidden="true" />
              </button>
            }
          </div>
        }
      </div>
    }

    <div class="cb-pdf__body">
      @if (state() === 'ready' && sidebar() && showThumbnails()) {
        <nav class="cb-pdf__sidebar" [id]="uid + '-thumbs'" [attr.aria-label]="t().thumbnails">
          @for (thumb of thumbBoxes(); track $index; let i = $index) {
            <button
              #thumbEl
              type="button"
              class="cb-pdf__thumb"
              [class.cb-is-active]="page() === i + 1"
              [attr.data-page]="i + 1"
              [attr.aria-label]="format(t().pageOf, i + 1, numPages())"
              [attr.aria-current]="page() === i + 1 ? 'page' : null"
              (click)="goToPage(i + 1)"
              (keydown)="onThumbKeydown($event, i + 1)"
            >
              <span class="cb-pdf__thumb-canvas" [style.width.px]="thumb.width" [style.height.px]="thumb.height"></span>
              <span class="cb-pdf__thumb-label" aria-hidden="true">{{ i + 1 }}</span>
            </button>
          }
        </nav>
      }

      <div
        #viewport
        class="cb-pdf__viewport"
        tabindex="0"
        role="document"
        [attr.aria-label]="t().pdfDocument"
        [attr.aria-busy]="state() === 'loading' ? 'true' : null"
        (scroll)="onScroll()"
        (wheel)="onWheel($event)"
      >
        @switch (state()) {
          @case ('loading') {
            <div class="cb-pdf__message" role="status">
              <cb-spinner [size]="32" aria-hidden="true" />
              <span>{{ t().loadingDocument }}@if (progress() !== null) { {{ progress() }} %}</span>
            </div>
          }
          @case ('error') {
            <div class="cb-pdf__message cb-pdf__message--error" role="alert">{{ t().documentError }}</div>
          }
          @case ('password') {
            <form class="cb-pdf__password" (submit)="submitPassword($event, passwordInput.value)">
              <cb-icon name="lock" [size]="28" aria-hidden="true" />
              <p class="cb-pdf__password-text" [id]="uid + '-pwd-text'">{{ t().protectedDocument }}</p>
              <label class="cb-pdf__password-label" [for]="uid + '-pwd'">{{ t().password }}</label>
              <div class="cb-pdf__password-row">
                <input
                  #passwordInput
                  class="cb-pdf__field"
                  type="password"
                  autocomplete="off"
                  [id]="uid + '-pwd'"
                  [attr.aria-describedby]="passwordIncorrect() ? uid + '-pwd-error' : uid + '-pwd-text'"
                  [attr.aria-invalid]="passwordIncorrect() ? 'true' : null"
                />
                <button type="submit" class="cb-pdf__submit">{{ t().open }}</button>
              </div>
              @if (passwordIncorrect()) {
                <p class="cb-pdf__password-error" [id]="uid + '-pwd-error'" role="alert">{{ t().incorrectPassword }}</p>
              }
            </form>
          }
          @case ('ready') {
            <div class="cb-pdf__pages">
              @for (box of pageBoxes(); track $index; let i = $index) {
                <div
                  #pageEl
                  class="cb-pdf__page"
                  role="group"
                  [attr.data-page]="i + 1"
                  [attr.aria-label]="format(t().pageOf, i + 1, numPages())"
                  [style.width.px]="box.width"
                  [style.height.px]="box.height"
                  [style.--scale-factor]="box.scaleFactor"
                  [style.--user-unit]="box.userUnit"
                >
                  <div class="cb-pdf__canvas"></div>
                  <div class="cb-pdf__text"></div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>

    @if (printProgress(); as p) {
      <div class="cb-pdf__toast" role="status">{{ format(t().preparingPrint, p.done, p.total) }}</div>
    }
  `,
  styleUrl: './pdfviewer.component.css',
})
export class CbPdfViewer {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly format = cbFormat;

  /** Documento: URL, `ArrayBuffer`, `Uint8Array`, `Blob` o `File`. */
  readonly src = input<CbPdfSource | null | undefined>(undefined);
  /** Nombre del archivo al descargar (por defecto, el de la URL o del `File`). */
  readonly fileName = input<string | undefined>(undefined);
  /** Contraseña para abrir el documento sin pedirla. */
  readonly password = input<string | undefined>(undefined);
  /** Envía cookies en peticiones a otro origen. */
  readonly withCredentials = input(false, { transform: booleanAttribute });
  /** Cabeceras HTTP para descargar el documento (p. ej. `Authorization`). */
  readonly httpHeaders = input<Record<string, string> | undefined>(undefined);

  /** Página actual (desde 1). */
  readonly page = model<number>(1);
  readonly zoom = model<CbPdfZoom>('page-width');
  readonly rotation = model<CbPdfRotation>(0);
  /** Panel de miniaturas abierto. */
  readonly sidebar = model<boolean>(false);

  readonly showToolbar = input(true, { transform: booleanAttribute });
  readonly showSearch = input(true, { transform: booleanAttribute });
  readonly showThumbnails = input(true, { transform: booleanAttribute });
  readonly showRotate = input(true, { transform: booleanAttribute });
  readonly downloadable = input(true, { transform: booleanAttribute });
  readonly printable = input(true, { transform: booleanAttribute });
  /** Nombre accesible del visor (por defecto, "Visor de PDF"). */
  readonly ariaLabel = input<string>('');

  /** Documento abierto. */
  readonly loaded = output<{ numPages: number }>();
  /** No se pudo abrir el documento. */
  readonly loadError = output<unknown>();

  private readonly engine = inject(CbPdfEngine);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly uid = `cb-pdf-${++nextUid}`;
  protected readonly state = signal<ViewerState>('idle');
  protected readonly progress = signal<number | null>(null);
  protected readonly passwordIncorrect = signal(false);
  protected readonly printProgress = signal<{ done: number; total: number } | null>(null);
  protected readonly numPages = signal(0);
  private readonly sizes = signal<PageSize[]>([]);
  private readonly box = signal({ width: 0, height: 0 });

  protected readonly query = signal('');
  protected readonly matches = signal<CbPdfMatch[]>([]);
  protected readonly matchIndex = signal(-1);
  protected readonly searching = signal(false);

  protected readonly zoomLevels = ZOOM_LEVELS;

  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');
  private readonly pageEls = viewChildren<ElementRef<HTMLElement>>('pageEl');
  private readonly thumbEls = viewChildren<ElementRef<HTMLElement>>('thumbEl');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly passwordInput = viewChild<ElementRef<HTMLInputElement>>('passwordInput');

  /** Factor de zoom efectivo (1 = 100 %). */
  readonly scale = computed(() => {
    const zoom = this.zoom();
    if (typeof zoom === 'number') return clamp(zoom, MIN_ZOOM, MAX_ZOOM);
    const size = this.sizes()[this.page() - 1] ?? this.sizes()[0];
    const { width, height } = this.box();
    if (!size || width <= 0) return 1;
    const [w, h] = this.rotatedPoints(size);
    const fitWidth = (width - PAGE_GAP * 2) / (w * CSS_UNITS);
    const fit = zoom === 'page-fit' && height > 0 ? Math.min(fitWidth, (height - PAGE_GAP * 2) / (h * CSS_UNITS)) : fitWidth;
    return clamp(fit, MIN_ZOOM, MAX_ZOOM);
  });

  /** Tamaño de cada página en píxeles CSS con el zoom y el giro actuales. */
  protected readonly pageBoxes = computed(() => {
    const factor = this.scale() * CSS_UNITS;
    return this.sizes().map((size) => {
      const [w, h] = this.rotatedPoints(size);
      return { width: Math.floor(w * factor), height: Math.floor(h * factor), scaleFactor: factor, userUnit: size.userUnit };
    });
  });

  protected readonly thumbBoxes = computed(() =>
    this.sizes().map((size) => {
      const [w, h] = this.rotatedPoints(size);
      return { width: THUMB_WIDTH, height: Math.round((THUMB_WIDTH * h) / w) };
    }),
  );

  /** Valor del selector de zoom. */
  protected readonly zoomValue = computed(() => {
    const zoom = this.zoom();
    return typeof zoom === 'number' ? String(zoom) : zoom;
  });
  protected readonly customZoom = computed(() => {
    const zoom = this.zoom();
    return typeof zoom === 'number' && !ZOOM_LEVELS.includes(zoom) ? zoom : null;
  });

  protected readonly searchStatus = computed(() => {
    if (!this.query().trim()) return '';
    const total = this.matches().length;
    if (total) return cbFormat(this.t().matchOf, this.matchIndex() + 1, total);
    return this.searching() ? this.t().searching : this.t().noResults;
  });

  private pdfjs?: CbPdfJs;
  private pdf?: CbPdfDocument;
  private loadingTask?: { destroy(): Promise<void> };
  private passwordCallback?: (password: string) => void;
  private loadToken = 0;
  private searchToken = 0;
  private searchTimer?: ReturnType<typeof setTimeout>;
  private readonly pages = new Map<number, Promise<CbPdfPage>>();
  private readonly texts = new Map<number, Promise<TextContent>>();
  private readonly indexes = new Map<number, Promise<CbPdfTextIndex>>();
  private readonly rendered = new Map<number, RenderedPage>();
  private readonly thumbs = new Map<number, string>();
  private readonly visible = new Set<number>();
  private readonly visibleThumbs = new Set<number>();
  private pageObserver?: IntersectionObserver;
  private thumbObserver?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  /** Página que se ve al desplazarse (distingue el scroll del usuario de un cambio de `page`). */
  private visiblePage = 1;
  private scrollFrame = 0;
  private scrollToMatch = false;

  constructor() {
    const registry = inject(CbIconRegistry);
    for (const [name, body] of Object.entries(PDF_ICONS)) {
      if (!registry.has(name)) registry.register({ [name]: body });
    }

    effect(() => {
      const src = this.src();
      const password = this.password();
      untracked(() => void this.open(src, password));
    });

    // Al cambiar el zoom o el giro se conserva el punto de lectura.
    effect(() => {
      this.scale();
      this.rotation();
      if (untracked(this.state) !== 'ready') return;
      const anchor = this.readAnchor();
      afterNextRender(
        () => {
          if (anchor) this.restoreAnchor(anchor);
          this.renderVisible();
          this.renderThumbs();
        },
        { injector: this.injector },
      );
    });

    // Cambio de `page` desde fuera (o desde la barra): desplaza hasta ella.
    effect(() => {
      const page = this.page();
      if (this.state() !== 'ready' || page === this.visiblePage) return;
      afterNextRender(() => this.scrollToPage(page), { injector: this.injector });
    });

    effect(() => {
      this.pageEls();
      if (this.state() === 'ready') untracked(() => this.observePages());
    });

    effect(() => {
      this.thumbEls();
      if (this.sidebar() && this.state() === 'ready') untracked(() => this.observeThumbs());
    });

    effect(() => {
      this.matches();
      this.matchIndex();
      untracked(() => this.refreshHighlights());
    });

    inject(DestroyRef).onDestroy(() => {
      this.loadToken++;
      this.close();
      this.resizeObserver?.disconnect();
      clearTimeout(this.searchTimer);
      if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
    });
  }

  // --- API pública -----------------------------------------------------------

  goToPage(page: number): void {
    const n = clamp(Math.round(page), 1, Math.max(1, this.numPages()));
    this.page.set(n);
    if (n === this.visiblePage) this.scrollToPage(n);
  }

  previousPage(): void {
    this.goToPage(this.page() - 1);
  }

  nextPage(): void {
    this.goToPage(this.page() + 1);
  }

  zoomIn(): void {
    const scale = this.scale();
    this.zoom.set(ZOOM_LEVELS.find((z) => z > scale + 0.01) ?? Math.min(MAX_ZOOM, round2(scale * 1.25)));
  }

  zoomOut(): void {
    const scale = this.scale();
    this.zoom.set([...ZOOM_LEVELS].reverse().find((z) => z < scale - 0.01) ?? Math.max(MIN_ZOOM, round2(scale / 1.25)));
  }

  /** Gira 90° a la derecha (o a la izquierda con `-1`). */
  rotate(direction: 1 | -1 = 1): void {
    this.rotation.set((((this.rotation() + direction * 90) % 360) + 360) % 360 as CbPdfRotation);
  }

  /** Busca en todo el documento; resalta y lleva a la primera coincidencia. */
  async search(query: string): Promise<void> {
    clearTimeout(this.searchTimer);
    this.query.set(query);
    const token = ++this.searchToken;
    this.matches.set([]);
    this.matchIndex.set(-1);
    if (!query.trim() || !this.pdf) {
      this.searching.set(false);
      return;
    }
    this.searching.set(true);
    const found: CbPdfMatch[] = [];
    // La primera coincidencia se busca desde la página actual.
    const start = this.page();
    for (let n = 1; n <= this.numPages(); n++) {
      const index = await this.textIndex(n).catch(() => null);
      if (token !== this.searchToken) return;
      if (!index) continue;
      const pageMatches = findMatches(index, query, n);
      if (!pageMatches.length) continue;
      found.push(...pageMatches);
      this.matches.set([...found]);
      const current = this.matchIndex();
      const first = found.findIndex((m) => m.page >= start);
      if (current === -1 && first !== -1) this.selectMatch(first);
    }
    if (token !== this.searchToken) return;
    this.searching.set(false);
    if (this.matchIndex() === -1 && found.length) this.selectMatch(0);
  }

  findNext(): void {
    const total = this.matches().length;
    if (total) this.selectMatch((this.matchIndex() + 1) % total);
  }

  findPrevious(): void {
    const total = this.matches().length;
    if (total) this.selectMatch((this.matchIndex() - 1 + total) % total);
  }

  /** Descarga el documento original. */
  async download(): Promise<void> {
    if (!this.pdf) return;
    const src = this.src();
    const blob = src instanceof Blob ? src : new Blob([(await this.pdf.getData()) as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = this.document.createElement('a');
    a.href = url;
    a.download = this.downloadName();
    a.style.display = 'none';
    this.document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  /** Imprime el documento (no la página de la aplicación). */
  async print(): Promise<void> {
    if (!this.pdf || this.printProgress()) return;
    this.printProgress.set({ done: 0, total: this.numPages() });
    try {
      await printPdfDocument(this.pdf, this.document, (done, total) => this.printProgress.set({ done, total }), this.rotation());
    } finally {
      this.printProgress.set(null);
    }
  }

  // --- Carga -----------------------------------------------------------------

  private async open(src: CbPdfSource | null | undefined, password: string | undefined): Promise<void> {
    const token = ++this.loadToken;
    this.close();
    if (!src || !this.isBrowser) {
      this.state.set('idle');
      return;
    }
    this.state.set('loading');
    this.progress.set(null);
    this.passwordIncorrect.set(false);
    try {
      const pdfjs = await this.engine.load();
      const data = await toData(src);
      if (token !== this.loadToken) return;
      this.pdfjs = pdfjs;
      const task = pdfjs.getDocument({
        ...this.engine.resources(),
        ...(data ? { data } : { url: String(src) }),
        password,
        withCredentials: this.withCredentials(),
        httpHeaders: this.httpHeaders(),
      });
      this.loadingTask = task;
      task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
        if (token === this.loadToken) this.progress.set(total ? Math.min(100, Math.round((loaded / total) * 100)) : null);
      };
      task.onPassword = (update: (password: string) => void, reason: number) => {
        if (token !== this.loadToken) return;
        this.passwordCallback = update;
        this.passwordIncorrect.set(reason === (pdfjs.PasswordResponses?.INCORRECT_PASSWORD ?? 2));
        this.state.set('password');
        afterNextRender(() => this.passwordInput()?.nativeElement.focus(), { injector: this.injector });
      };
      const pdf = await task.promise;
      if (token !== this.loadToken) {
        void task.destroy().catch(() => undefined);
        return;
      }
      this.pdf = pdf;
      // Mide el área antes del primer render para que "ajustar al ancho" no renderice dos veces.
      this.observeResize();
      const first = sizeOf(await this.getPage(1));
      if (token !== this.loadToken) return;
      this.sizes.set(Array.from({ length: pdf.numPages }, () => first));
      this.numPages.set(pdf.numPages);
      const page = clamp(this.page(), 1, pdf.numPages);
      this.visiblePage = 1;
      this.page.set(page);
      this.state.set('ready');
      this.loaded.emit({ numPages: pdf.numPages });
      afterNextRender(
        () => {
          if (page > 1) this.scrollToPage(page);
          this.renderVisible();
        },
        { injector: this.injector },
      );
      void this.measurePages(token);
    } catch (error) {
      if (token !== this.loadToken) return;
      this.state.set('error');
      if (isDevMode()) console.error('[cb-pdf-viewer]', error);
      this.loadError.emit(error);
    }
  }

  protected submitPassword(event: Event, value: string): void {
    event.preventDefault();
    if (!this.passwordCallback) return;
    this.state.set('loading');
    this.passwordCallback(value);
  }

  /** Lee el tamaño real de todas las páginas (pueden ser distintas de la primera). */
  private async measurePages(token: number): Promise<void> {
    const sizes = [...this.sizes()];
    let changed = false;
    for (let n = 2; n <= sizes.length; n++) {
      const page = await this.getPage(n).catch(() => null);
      if (token !== this.loadToken) return;
      if (!page) continue;
      const size = sizeOf(page);
      const prev = sizes[n - 1];
      if (size.width !== prev.width || size.height !== prev.height || size.rotate !== prev.rotate || size.userUnit !== prev.userUnit) {
        sizes[n - 1] = size;
        changed = true;
      }
    }
    if (changed) this.sizes.set(sizes);
  }

  private close(): void {
    for (const page of [...this.rendered.keys()]) this.unrender(page);
    this.pageObserver?.disconnect();
    this.thumbObserver?.disconnect();
    this.pageObserver = this.thumbObserver = undefined;
    void this.loadingTask?.destroy().catch(() => undefined);
    this.loadingTask = undefined;
    this.pdf = undefined;
    this.passwordCallback = undefined;
    this.pages.clear();
    this.texts.clear();
    this.indexes.clear();
    this.thumbs.clear();
    this.visible.clear();
    this.visibleThumbs.clear();
    this.searchToken++;
    this.matches.set([]);
    this.matchIndex.set(-1);
    this.searching.set(false);
    this.numPages.set(0);
    this.sizes.set([]);
  }

  private getPage(n: number): Promise<CbPdfPage> {
    let page = this.pages.get(n);
    if (!page) {
      page = this.pdf!.getPage(n);
      this.pages.set(n, page);
    }
    return page;
  }

  private textContent(n: number): Promise<TextContent> {
    let text = this.texts.get(n);
    if (!text) {
      text = this.getPage(n).then((page) => page.getTextContent());
      this.texts.set(n, text);
    }
    return text;
  }

  private textIndex(n: number): Promise<CbPdfTextIndex> {
    let index = this.indexes.get(n);
    if (!index) {
      index = this.textContent(n).then((text) => buildTextIndex(text.items as { str?: string; hasEOL?: boolean }[]));
      this.indexes.set(n, index);
    }
    return index;
  }

  // --- Renderizado ------------------------------------------------------------

  /** Observa qué páginas están cerca de la vista para renderizar solo esas. */
  private observePages(): void {
    const root = this.viewport()?.nativeElement;
    if (!root) return;
    this.pageObserver?.disconnect();
    if (typeof IntersectionObserver === 'undefined') {
      this.visible.clear();
      for (let n = 1; n <= this.numPages(); n++) this.visible.add(n);
      this.renderVisible();
      return;
    }
    this.pageObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const n = Number((entry.target as HTMLElement).dataset['page']);
          if (entry.isIntersecting) this.visible.add(n);
          else {
            this.visible.delete(n);
            this.unrender(n);
          }
        }
        this.renderVisible();
      },
      { root, rootMargin: '50% 0px' },
    );
    for (const el of this.pageEls()) this.pageObserver.observe(el.nativeElement);
  }

  private renderVisible(): void {
    const current = this.page();
    const pages = [...this.visible].sort((a, b) => Math.abs(a - current) - Math.abs(b - current));
    for (const n of pages) void this.renderPage(n);
  }

  private async renderPage(n: number): Promise<void> {
    const scale = this.scale() * CSS_UNITS;
    const rotation = this.rotation();
    const key = `${scale}:${rotation}`;
    if (this.rendered.get(n)?.key === key || !this.pdf) return;
    this.unrender(n);
    let cancelled = false;
    let renderTask: { cancel(): void } | undefined;
    const entry: RenderedPage = {
      key,
      cancel: () => {
        cancelled = true;
        renderTask?.cancel();
        entry.textLayer?.cancel();
      },
    };
    this.rendered.set(n, entry);
    try {
      const page = await this.getPage(n);
      const el = this.pageEl(n);
      if (cancelled || !el) return;
      const viewport = page.getViewport({ scale, rotation: (page.rotate + rotation) % 360 });
      const canvas = this.document.createElement('canvas');
      const ratio = outputScale(viewport.width, viewport.height);
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.setAttribute('aria-hidden', 'true');
      const task = page.render({ canvas, viewport, transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0] });
      renderTask = task;
      await task.promise;
      if (cancelled) return;
      el.querySelector('.cb-pdf__canvas')?.replaceChildren(canvas);

      const textEl = el.querySelector<HTMLElement>('.cb-pdf__text');
      if (!textEl || !this.pdfjs?.TextLayer) return;
      const textContentSource = await this.textContent(n);
      if (cancelled) return;
      textEl.replaceChildren();
      const textLayer = new this.pdfjs.TextLayer({ textContentSource, container: textEl, viewport }) as unknown as TextLayerLike;
      entry.textLayer = textLayer;
      await textLayer.render();
      if (cancelled) return;
      this.highlightPage(n, entry);
    } catch {
      // Render cancelado o página dañada: se deja en blanco.
      if (this.rendered.get(n) === entry && !cancelled) entry.key = '';
    }
  }

  private unrender(n: number): void {
    const entry = this.rendered.get(n);
    if (!entry) return;
    entry.cancel();
    this.rendered.delete(n);
    const el = this.pageEl(n);
    el?.querySelector('.cb-pdf__canvas')?.replaceChildren();
    el?.querySelector('.cb-pdf__text')?.replaceChildren();
  }

  private observeThumbs(): void {
    const root = this.document.getElementById(`${this.uid}-thumbs`);
    if (!root) return;
    this.thumbObserver?.disconnect();
    if (typeof IntersectionObserver === 'undefined') {
      for (let n = 1; n <= this.numPages(); n++) this.visibleThumbs.add(n);
      this.renderThumbs();
      return;
    }
    this.thumbObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const n = Number((entry.target as HTMLElement).dataset['page']);
          if (entry.isIntersecting) this.visibleThumbs.add(n);
          else this.visibleThumbs.delete(n);
        }
        this.renderThumbs();
      },
      { root, rootMargin: '100% 0px' },
    );
    for (const el of this.thumbEls()) this.thumbObserver.observe(el.nativeElement);
  }

  private renderThumbs(): void {
    if (!this.sidebar()) return;
    for (const n of this.visibleThumbs) void this.renderThumb(n);
  }

  private async renderThumb(n: number): Promise<void> {
    const key = String(this.rotation());
    if (this.thumbs.get(n) === key || !this.pdf) return;
    this.thumbs.set(n, key);
    try {
      const page = await this.getPage(n);
      const rotation = (page.rotate + this.rotation()) % 360;
      const base = page.getViewport({ scale: 1, rotation });
      const ratio = Math.min(2, globalThis.devicePixelRatio || 1);
      const viewport = page.getViewport({ scale: (THUMB_WIDTH / base.width) * ratio, rotation });
      const canvas = this.document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.setAttribute('aria-hidden', 'true');
      await page.render({ canvas, viewport }).promise;
      if (this.thumbs.get(n) !== key) return;
      this.thumbEls()
        .find((el) => el.nativeElement.dataset['page'] === String(n))
        ?.nativeElement.querySelector('.cb-pdf__thumb-canvas')
        ?.replaceChildren(canvas);
    } catch {
      this.thumbs.delete(n);
    }
  }

  // --- Búsqueda ---------------------------------------------------------------

  private selectMatch(index: number): void {
    this.matchIndex.set(index);
    const match = this.matches()[index];
    if (!match) return;
    this.scrollToMatch = true;
    if (this.rendered.get(match.page)?.textLayer) this.refreshHighlights();
    else this.goToPage(match.page);
  }

  private refreshHighlights(): void {
    for (const [n, entry] of this.rendered) this.highlightPage(n, entry);
  }

  private highlightPage(n: number, entry: RenderedPage): void {
    const layer = entry.textLayer;
    if (!layer) return;
    const matches = this.matches();
    const selected = matches[this.matchIndex()] ?? null;
    const el = highlightMatches(
      layer.textDivs,
      layer.textContentItemsStr,
      matches.filter((m) => m.page === n),
      selected?.page === n ? selected : null,
    );
    if (el && this.scrollToMatch) {
      this.scrollToMatch = false;
      el.scrollIntoView?.({ block: 'center', inline: 'nearest' });
    }
  }

  protected onSearchInput(value: string): void {
    this.query.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => void this.search(value), 250);
  }

  protected onSearchKeydown(event: KeyboardEvent, value: string): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (value !== this.query() || (!this.matches().length && !this.searching())) void this.search(value);
      else if (event.shiftKey) this.findPrevious();
      else this.findNext();
    } else if (event.key === 'Escape' && value) {
      event.preventDefault();
      event.stopPropagation();
      (event.target as HTMLInputElement).value = '';
      void this.search('');
    }
  }

  // --- Desplazamiento y tamaño ---------------------------------------------------

  protected onScroll(): void {
    cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = requestAnimationFrame(() => {
      const page = this.mostVisiblePage();
      if (page && page !== this.visiblePage) {
        this.visiblePage = page;
        this.page.set(page);
      }
    });
  }

  private mostVisiblePage(): number | null {
    const root = this.viewport()?.nativeElement;
    if (!root) return null;
    const top = root.scrollTop;
    const bottom = top + root.clientHeight;
    let best: number | null = null;
    let bestArea = 0;
    for (const { nativeElement: el } of this.pageEls()) {
      const visible = Math.min(bottom, el.offsetTop + el.offsetHeight) - Math.max(top, el.offsetTop);
      if (visible > bestArea) {
        bestArea = visible;
        best = Number(el.dataset['page']);
      }
    }
    return best;
  }

  private scrollToPage(n: number): void {
    const root = this.viewport()?.nativeElement;
    const el = this.pageEl(n);
    if (!root || !el) return;
    this.visiblePage = n;
    root.scrollTop = el.offsetTop - PAGE_GAP;
  }

  private readAnchor(): { page: number; ratio: number } | null {
    const root = this.viewport()?.nativeElement;
    const el = this.pageEl(this.visiblePage);
    if (!root || !el || !el.offsetHeight) return null;
    return { page: this.visiblePage, ratio: (root.scrollTop - el.offsetTop) / el.offsetHeight };
  }

  private restoreAnchor(anchor: { page: number; ratio: number }): void {
    const root = this.viewport()?.nativeElement;
    const el = this.pageEl(anchor.page);
    if (root && el) root.scrollTop = el.offsetTop + anchor.ratio * el.offsetHeight;
  }

  private observeResize(): void {
    const root = this.viewport()?.nativeElement;
    if (!root) return;
    const measure = () => this.box.set({ width: root.clientWidth, height: root.clientHeight });
    measure();
    if (typeof ResizeObserver === 'undefined' || this.resizeObserver) return;
    this.resizeObserver = new ResizeObserver(measure);
    this.resizeObserver.observe(root);
  }

  private pageEl(n: number): HTMLElement | undefined {
    return this.pageEls()[n - 1]?.nativeElement;
  }

  // --- Barra y teclado -------------------------------------------------------------

  protected onPageInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number.parseInt(input.value, 10);
    if (Number.isFinite(value)) this.goToPage(value);
    input.value = String(this.page());
  }

  protected onZoomSelect(value: string): void {
    this.zoom.set(value === 'page-width' || value === 'page-fit' ? value : Number(value));
  }

  protected onThumbKeydown(event: KeyboardEvent, n: number): void {
    const next = event.key === 'ArrowDown' ? n + 1 : event.key === 'ArrowUp' ? n - 1 : event.key === 'Home' ? 1 : event.key === 'End' ? this.numPages() : 0;
    if (!next || next < 1 || next > this.numPages()) return;
    event.preventDefault();
    this.thumbEls()[next - 1]?.nativeElement.focus();
  }

  protected onHostKeydown(event: KeyboardEvent): void {
    if (this.state() !== 'ready' || !(event.ctrlKey || event.metaKey) || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === '+' || key === '=') this.zoomIn();
    else if (key === '-') this.zoomOut();
    else if (key === '0') this.zoom.set('page-width');
    else if (key === 'f' && this.showToolbar() && this.showSearch()) {
      const input = this.searchInput()?.nativeElement;
      input?.focus();
      input?.select();
    } else if (key === 'p' && this.printable()) void this.print();
    else return;
    event.preventDefault();
  }

  protected onWheel(event: WheelEvent): void {
    if (!(event.ctrlKey || event.metaKey) || this.state() !== 'ready') return;
    event.preventDefault();
    if (event.deltaY < 0) this.zoomIn();
    else this.zoomOut();
  }

  protected percent(zoom: number): string {
    return `${Math.round(zoom * 100)} %`;
  }

  private downloadName(): string {
    const name = this.fileName();
    if (name) return name;
    const src = this.src();
    if (typeof File !== 'undefined' && src instanceof File && src.name) return src.name;
    if (typeof src === 'string' || src instanceof URL) {
      const last = decodeURIComponent(String(src).split(/[?#]/)[0].split('/').pop() ?? '');
      if (last) return /\.pdf$/i.test(last) ? last : `${last}.pdf`;
    }
    return 'document.pdf';
  }

  private rotatedPoints(size: PageSize): [number, number] {
    return (size.rotate + this.rotation()) % 180 === 0 ? [size.width, size.height] : [size.height, size.width];
  }
}

function sizeOf(page: CbPdfPage): PageSize {
  const viewport = page.getViewport({ scale: 1, rotation: 0 });
  const userUnit = page.userUnit || 1;
  return { width: viewport.width, height: viewport.height, rotate: page.rotate || 0, userUnit };
}

/** Bytes del documento si no es una URL (copiados: pdf.js transfiere el buffer al worker). */
async function toData(src: CbPdfSource): Promise<Uint8Array | null> {
  if (src instanceof Uint8Array) return src.slice();
  if (src instanceof ArrayBuffer) return new Uint8Array(src.slice(0));
  if (typeof Blob !== 'undefined' && src instanceof Blob) return new Uint8Array(await readBlob(src));
  return null;
}

function readBlob(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/** Densidad del canvas: la de la pantalla, limitada para no pasar de {@link MAX_CANVAS_PIXELS}. */
function outputScale(width: number, height: number): number {
  const ratio = globalThis.devicePixelRatio || 1;
  const max = Math.sqrt(MAX_CANVAS_PIXELS / Math.max(1, width * height));
  return Math.max(0.5, Math.min(ratio, max));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
