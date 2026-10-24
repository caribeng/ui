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
import { NgTemplateOutlet } from '@angular/common';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbDialog } from '@caribeng/ui/dialog';
import { CbIcon, CbIconRegistry } from '@caribeng/ui/icon';
import { highlighter, panelLeft, penLine, printer, signature, stickyNote, zoomIn, zoomOut } from '@caribeng/ui/icons';
import { CbSignaturePad } from '@caribeng/ui/signature-pad';
import { CbSpinner } from '@caribeng/ui/spinner';
import {
  CB_PDF_COLORS,
  PDFJS_EDITOR_PREFIX,
  imageToBitmap,
  mergeLineRects,
  moveRect,
  pdfToView,
  rectToView,
  scaleRect,
  simplifyPath,
  toPdfJsAnnotation,
  trimSignature,
  viewToPdf,
  viewToRect,
  type CbPdfAnnotation,
  type CbPdfAnnotationColor,
  type CbPdfPageGeometry,
  type CbPdfTool,
  type CbPdfViewTransform,
} from './pdf-annotations';
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
  /** Esquina inferior izquierda de la caja de la página (`view`), en puntos. */
  x0: number;
  y0: number;
  /** Ancho y alto en puntos (con `userUnit`), sin girar. */
  width: number;
  height: number;
  rotate: number;
  userUnit: number;
}

type SidebarView = 'thumbnails' | 'outline' | 'annotations';

/** Una anotación ya colocada en su página dibujada (píxeles CSS). */
interface Mark {
  readonly a: CbPdfAnnotation;
  readonly box: { left: number; top: number; width: number; height: number };
  /** Resaltado: un rectángulo por línea, relativo a `box`. */
  readonly rects?: readonly { left: number; top: number; width: number; height: number }[];
  /** Dibujo: trazado SVG relativo a `box`. */
  readonly d?: string;
  readonly strokePx?: number;
  /** Nota: tamaño de letra en píxeles. */
  readonly fontPx?: number;
  readonly light: string;
  readonly dark: string;
  readonly label: string;
}

let nextAnnotationId = 0;

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

/** Entrada del índice (marcadores) del documento. */
export interface CbPdfOutlineItem {
  readonly title: string;
  /** Destino interno (nombre o destino explícito de pdf.js). */
  readonly dest: string | unknown[] | null;
  /** Enlace externo. */
  readonly url: string | null;
  readonly bold: boolean;
  readonly italic: boolean;
  readonly items: readonly CbPdfOutlineItem[];
}

/** Valor de un campo de formulario: texto, casilla marcada u opciones elegidas. */
export type CbPdfFormValue = string | boolean | string[] | null;

/** Esquemas que se abren desde los enlaces del documento. */
const SAFE_URL = /^(https?:|mailto:|tel:)/i;

const PDF_ICONS: Record<string, string> = {
  'zoom-in': zoomIn,
  'zoom-out': zoomOut,
  printer,
  'panel-left': panelLeft,
  highlighter,
  'sticky-note': stickyNote,
  'pen-line': penLine,
  signature,
};

/**
 * Visor de PDF sobre [pdf.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`,
 * dependencia opcional que se carga al abrir el primer documento).
 *
 * Renderiza las páginas a medida que se ven, con texto seleccionable y
 * legible por lectores de pantalla, búsqueda (ignora tildes y mayúsculas),
 * miniaturas, índice (marcadores), enlaces internos y externos, formularios
 * rellenables (se descargan e imprimen con lo escrito), zoom, giro, descarga,
 * impresión y documentos con contraseña.
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
  imports: [CbDialog, CbIcon, CbSignaturePad, CbSpinner, NgTemplateOutlet],
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

        @if (annotatable()) {
          <div class="cb-pdf__group" role="group" [attr.aria-label]="t().pdfAnnotate">
            <!-- mousedown sin default: pulsar la herramienta no quita la selección de texto. -->
            <button
              type="button"
              class="cb-pdf__tool"
              [attr.aria-label]="t().pdfHighlight"
              [attr.aria-pressed]="tool() === 'highlight'"
              [attr.title]="t().pdfHighlight"
              [disabled]="state() !== 'ready'"
              (mousedown)="$event.preventDefault()"
              (click)="onHighlightTool()"
            >
              <cb-icon name="highlighter" [size]="18" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="cb-pdf__tool"
              [attr.aria-label]="t().pdfNote"
              [attr.aria-pressed]="tool() === 'note'"
              [attr.title]="t().pdfNote"
              [disabled]="state() !== 'ready'"
              (click)="onNoteTool($event)"
            >
              <cb-icon name="sticky-note" [size]="18" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="cb-pdf__tool"
              [attr.aria-label]="t().pdfDraw"
              [attr.aria-pressed]="tool() === 'ink'"
              [attr.title]="t().pdfDraw"
              [disabled]="state() !== 'ready'"
              (click)="toggleTool('ink')"
            >
              <cb-icon name="pen-line" [size]="18" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="cb-pdf__tool"
              aria-haspopup="dialog"
              [attr.aria-label]="t().pdfSign"
              [attr.title]="t().pdfSign"
              [disabled]="state() !== 'ready'"
              (click)="openSignature()"
            >
              <cb-icon name="signature" [size]="18" aria-hidden="true" />
            </button>
            <span class="cb-pdf__color">
              <span class="cb-pdf__swatch" aria-hidden="true" [style.background]="colors[annotationColor()].light" [style.border-color]="colors[annotationColor()].dark"></span>
              <select
                class="cb-pdf__field cb-pdf__color-select"
                [attr.aria-label]="t().pdfColor"
                [disabled]="state() !== 'ready'"
                (change)="annotationColor.set($any($event.target).value)"
              >
                @for (c of colorNames; track c) {
                  <option [value]="c" [selected]="annotationColor() === c">{{ colorLabel(c) }}</option>
                }
              </select>
            </span>
          </div>
        }

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
              <button
                type="button"
                class="cb-pdf__tool"
                [attr.aria-label]="annotations().length ? t().pdfDownloadAnnotated : formModified() ? t().pdfDownloadFilled : t().download"
                [attr.title]="annotations().length ? t().pdfDownloadAnnotated : formModified() ? t().pdfDownloadFilled : null"
                [disabled]="state() !== 'ready'"
                (click)="download()"
              >
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
        <div
          class="cb-pdf__sidebar"
          [class.cb-pdf__sidebar--tabs]="sidebarTabs().length > 1"
          [class.cb-pdf__sidebar--outline]="activeView() !== 'thumbnails' || sidebarTabs().length > 2"
          [id]="uid + '-thumbs'"
        >
          @if (sidebarTabs().length > 1) {
            <div class="cb-pdf__views" role="group" [attr.aria-label]="t().pdfSidebarView">
              @for (view of sidebarTabs(); track view) {
                <button type="button" class="cb-pdf__view" [attr.aria-pressed]="activeView() === view" (click)="sidebarView.set(view)">
                  {{ view === 'outline' ? t().pdfOutline : view === 'annotations' ? t().pdfAnnotations : t().thumbnails }}
                </button>
              }
            </div>
          }
          @if (activeView() === 'outline') {
            <nav class="cb-pdf__outline" [attr.aria-label]="t().pdfOutline">
              <ng-container *ngTemplateOutlet="outlineList; context: { $implicit: outline(), path: '' }" />
            </nav>
          } @else if (activeView() === 'annotations') {
            <section class="cb-pdf__notes-panel" [attr.aria-label]="t().pdfAnnotations">
              @if (!sortedAnnotations().length) {
                <p class="cb-pdf__notes-empty">{{ t().pdfNoAnnotations }}</p>
              } @else {
                <ul class="cb-pdf__notes-list">
                  @for (a of sortedAnnotations(); track a.id) {
                    <li class="cb-pdf__notes-item">
                      <button type="button" class="cb-pdf__notes-link" (click)="revealAnnotation(a)">
                        <span class="cb-pdf__notes-swatch" aria-hidden="true" [style.background]="swatchOf(a)"></span>
                        <span class="cb-pdf__notes-text">
                          <!-- La coma oculta separa la página del texto en el nombre del botón. -->
                          <span class="cb-pdf__notes-page">{{ format(t().pageOf, a.page, numPages()) }}<span class="cb-pdf__sr">, </span></span>
                          <span class="cb-pdf__notes-label">{{ labelOf(a) }}</span>
                        </span>
                      </button>
                      <button type="button" class="cb-pdf__notes-remove" [attr.aria-label]="t().pdfDeleteAnnotation + ': ' + labelOf(a)" (click)="removeAnnotation(a)">
                        <cb-icon name="trash" [size]="14" aria-hidden="true" />
                      </button>
                    </li>
                  }
                </ul>
              }
            </section>
          } @else {
          <nav class="cb-pdf__thumbs" [attr.aria-label]="t().thumbnails">
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
        </div>
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
            @if (toolHint(); as hint) {
              <div class="cb-pdf__hint">{{ hint }}</div>
            }
            <div class="cb-pdf__pages" (pointerup)="onPagesPointerUp()">
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
                  <div class="cb-pdf__annotations" (input)="onFormInput()" (change)="onFormInput()"></div>
                  @if (annotatable() || marks()[i]?.length) {
                    <div
                      class="cb-pdf__marks"
                      [class.cb-pdf__marks--capture]="annotatable() && (tool() === 'ink' || tool() === 'note')"
                      [class.cb-pdf__marks--ink]="tool() === 'ink'"
                      [class.cb-pdf__marks--pass]="tool() === 'highlight'"
                      (pointerdown)="onMarksPointerDown($event, i + 1)"
                    >
                      @for (m of marks()[i]; track m.a.id) {
                        <div
                          class="cb-pdf__mark"
                          [class]="'cb-pdf__mark cb-pdf__mark--' + m.a.type"
                          [class.cb-is-selected]="selectedId() === m.a.id"
                          [attr.data-id]="m.a.id"
                          [attr.tabindex]="annotatable() ? 0 : null"
                          [attr.role]="annotatable() ? 'button' : 'img'"
                          [attr.aria-label]="m.label"
                          [attr.aria-describedby]="annotatable() ? uid + '-mark-hint' : null"
                          [attr.aria-expanded]="annotatable() && (m.a.type === 'note' || m.a.type === 'highlight') ? editingId() === m.a.id : null"
                          [style.left.px]="m.box.left"
                          [style.top.px]="m.box.top"
                          [style.width.px]="m.a.type === 'note' ? null : m.box.width"
                          [style.height.px]="m.a.type === 'note' ? null : m.box.height"
                          [style.--cb-pdf-mark-light]="m.light"
                          [style.--cb-pdf-mark-dark]="m.dark"
                          (pointerdown)="onMarkPointerDown($event, m.a)"
                          (keydown)="onMarkKeydown($event, m.a)"
                          (focus)="select(m.a.id)"
                        >
                          @switch (m.a.type) {
                            @case ('highlight') {
                              @for (r of m.rects; track $index) {
                                <span class="cb-pdf__hl-rect" [style.left.px]="r.left" [style.top.px]="r.top" [style.width.px]="r.width" [style.height.px]="r.height"></span>
                              }
                              @if (m.a.comment) {
                                <span class="cb-pdf__hl-badge" aria-hidden="true"></span>
                              }
                            }
                            @case ('note') {
                              <span class="cb-pdf__note-text" [style.font-size.px]="m.fontPx" [style.min-width.px]="m.box.width">{{ m.a.text || ' ' }}</span>
                            }
                            @case ('ink') {
                              <svg class="cb-pdf__ink" [attr.viewBox]="'0 0 ' + m.box.width + ' ' + m.box.height" aria-hidden="true">
                                <path [attr.d]="m.d" [attr.stroke-width]="m.strokePx" />
                              </svg>
                            }
                            @case ('signature') {
                              <img class="cb-pdf__sig" [src]="m.a.image" alt="" draggable="false" />
                              @if (annotatable() && selectedId() === m.a.id) {
                                <span class="cb-pdf__resize" aria-hidden="true" (pointerdown)="onResizePointerDown($event, m.a)"></span>
                              }
                            }
                          }
                        </div>
                      }
                      @if (stroke(); as s) {
                        @if (s.page === i + 1) {
                          <svg class="cb-pdf__stroke" aria-hidden="true" [style.--cb-pdf-mark-dark]="colors[annotationColor()].dark">
                            <polyline [attr.points]="s.points.join(' ')" [attr.stroke-width]="2 * box.scaleFactor" />
                          </svg>
                        }
                      }
                      @if (editingMark(); as e) {
                        @if (e.a.page === i + 1) {
                          <div
                            class="cb-pdf__card"
                            role="group"
                            [attr.aria-label]="e.label"
                            [style.left.px]="cardLeft(e, box.width)"
                            [style.top.px]="e.box.top + (e.a.type === 'note' ? noteHeight(e) : e.box.height) + 6"
                            (pointerdown)="$event.stopPropagation()"
                            (keydown)="onCardKeydown($event)"
                          >
                            <label class="cb-pdf__card-label" [for]="uid + '-card'">{{ e.a.type === 'note' ? t().pdfNoteText : t().pdfComment }}</label>
                            <textarea
                              #cardText
                              class="cb-pdf__field cb-pdf__card-text"
                              rows="3"
                              [id]="uid + '-card'"
                              (input)="onCardInput($any($event.target).value)"
                            ></textarea>
                            <div class="cb-pdf__card-actions">
                              <button type="button" class="cb-pdf__card-btn" (click)="removeAnnotation(e.a)">{{ t().pdfDeleteAnnotation }}</button>
                              <button type="button" class="cb-pdf__card-btn cb-pdf__card-btn--primary" (click)="closeEditor(true)">{{ t().pdfDone }}</button>
                            </div>
                          </div>
                        }
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        }
      </div>
    </div>

    @if (annotatable()) {
      <span class="cb-pdf__sr" [id]="uid + '-mark-hint'">{{ t().pdfAnnotationHint }}</span>
      <span class="cb-pdf__sr" aria-live="polite">{{ announcement() }}</span>
      <cb-dialog [(visible)]="signing" [header]="t().pdfSignTitle" width="34rem" (onHide)="onSignatureHide()">
        <cb-signature-pad [(value)]="signatureValue" background="transparent" [ariaLabel]="t().pdfSignTitle" />
        <div cb-dialog-footer class="cb-pdf__sign-actions">
          <button type="button" class="cb-pdf__card-btn" (click)="signing.set(false)">{{ t().pdfCancel }}</button>
          <button type="button" class="cb-pdf__card-btn cb-pdf__card-btn--primary" [disabled]="!signatureValue()" (click)="insertSignature()">
            {{ t().pdfInsertSignature }}
          </button>
        </div>
      </cb-dialog>
    }

    <ng-template #outlineList let-items let-path="path">
      <ul class="cb-pdf__outline-list" [attr.role]="path ? 'group' : null">
        @for (item of items; track $index; let i = $index) {
          <li class="cb-pdf__outline-item">
            @if (item.items.length) {
              <button
                type="button"
                class="cb-pdf__outline-toggle"
                [attr.aria-expanded]="!isCollapsed(path + i)"
                [attr.aria-label]="format(isCollapsed(path + i) ? t().pdfExpandItem : t().pdfCollapseItem, item.title)"
                (click)="toggleOutline(path + i)"
              >
                <cb-icon [name]="isCollapsed(path + i) ? 'chevron-right' : 'chevron-down'" [size]="14" aria-hidden="true" />
              </button>
            }
            <button
              type="button"
              class="cb-pdf__outline-link"
              [class.cb-pdf__outline-link--bold]="item.bold"
              [class.cb-pdf__outline-link--italic]="item.italic"
              (click)="openOutlineItem(item)"
            >
              {{ item.title }}
            </button>
            @if (item.items.length && !isCollapsed(path + i)) {
              <ng-container *ngTemplateOutlet="outlineList; context: { $implicit: item.items, path: path + i + '.' }" />
            }
          </li>
        }
      </ul>
    </ng-template>

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
  /** Pestaña Índice en el panel lateral (si el documento tiene marcadores). */
  readonly showOutline = input(true, { transform: booleanAttribute });
  /** Campos de formulario rellenables (si no, se pintan como imagen). */
  readonly forms = input(true, { transform: booleanAttribute });
  /** Enlaces externos del documento: se abren en otra pestaña. `false` los desactiva. */
  readonly externalLinks = input(true, { transform: booleanAttribute });
  /** Vista del panel lateral. */
  readonly sidebarView = model<SidebarView>('thumbnails');
  /** Nombre accesible del visor (por defecto, "Visor de PDF"). */
  readonly ariaLabel = input<string>('');

  /** Herramientas para resaltar, poner notas, dibujar y firmar (y la pestaña Anotaciones). */
  readonly annotatable = input(false, { transform: booleanAttribute });
  /**
   * Anotaciones del usuario, en puntos PDF. Se ven siempre; con `annotatable` se crean, mueven y
   * borran. Al descargar o imprimir se escriben en el PDF como anotaciones estándar.
   */
  readonly annotations = model<readonly CbPdfAnnotation[]>([]);
  /** Herramienta activa (`none`, `highlight`, `note`, `ink`). Escape vuelve a `none`. */
  readonly tool = model<CbPdfTool>('none');
  /** Color de las anotaciones nuevas. */
  readonly annotationColor = model<CbPdfAnnotationColor>('yellow');
  /** Autor de las anotaciones nuevas (se guarda en el PDF). */
  readonly author = input<string>('');

  /** Documento abierto. */
  readonly loaded = output<{ numPages: number }>();
  /** No se pudo abrir el documento. */
  readonly loadError = output<unknown>();
  /** El usuario cambió un campo del formulario (los valores, con `getFormData()`). */
  readonly formChange = output<void>();
  /** El usuario creó una anotación. */
  readonly annotationAdd = output<CbPdfAnnotation>();
  /** El usuario borró una anotación. */
  readonly annotationRemove = output<CbPdfAnnotation>();

  private readonly engine = inject(CbPdfEngine);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
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
  /** Índice del documento (vacío si no tiene). */
  readonly outline = signal<readonly CbPdfOutlineItem[]>([]);
  /** Algún campo del formulario cambió desde que se abrió. */
  readonly formModified = signal(false);
  private readonly collapsed = signal<ReadonlySet<string>>(new Set());
  /** Enlaces del documento (lo que la capa de anotaciones de pdf.js necesita). */
  private readonly linkService = {
    externalLinkEnabled: true,
    eventBus: null,
    addLinkAttributes: (link: HTMLAnchorElement, url: string, newWindow?: boolean) => {
      if (!this.externalLinks() || !SAFE_URL.test(url)) {
        link.removeAttribute('href');
        return;
      }
      link.href = url;
      link.title = url;
      link.rel = 'noopener noreferrer nofollow';
      if (newWindow !== false) link.target = '_blank';
    },
    getDestinationHash: () => '#',
    getAnchorUrl: (hash: string) => `#${hash}`,
    goToDestination: (dest: string | unknown[]) => void this.goToDestination(dest),
    executeNamedAction: (action: string) => this.namedAction(action),
    executeSetOCGState: () => undefined,
  };

  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');
  private readonly pageEls = viewChildren<ElementRef<HTMLElement>>('pageEl');
  private readonly thumbEls = viewChildren<ElementRef<HTMLElement>>('thumbEl');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly passwordInput = viewChild<ElementRef<HTMLInputElement>>('passwordInput');
  private readonly cardText = viewChild<ElementRef<HTMLTextAreaElement>>('cardText');

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

  // --- Anotaciones -------------------------------------------------------------

  protected readonly colors = CB_PDF_COLORS;
  protected readonly colorNames = Object.keys(CB_PDF_COLORS) as CbPdfAnnotationColor[];
  protected readonly selectedId = signal<string | null>(null);
  /** Anotación con el editor (texto de la nota o comentario del resaltado) abierto. */
  protected readonly editingId = signal<string | null>(null);
  /** Anotación mientras se arrastra o cambia de tamaño (se confirma al soltar). */
  private readonly dragPreview = signal<CbPdfAnnotation | null>(null);
  /** Trazo que se está dibujando, en píxeles de la página. */
  protected readonly stroke = signal<{ page: number; points: number[] } | null>(null);
  protected readonly announcement = signal('');
  private announceFlip = false;
  protected readonly signing = signal(false);
  protected readonly signatureValue = signal('');
  private pendingFocus: string | null = null;

  private readonly shownAnnotations = computed(() => {
    const preview = this.dragPreview();
    const list = this.annotations();
    return preview ? list.map((a) => (a.id === preview.id ? preview : a)) : list;
  });

  /** Anotaciones de cada página, ya colocadas con el zoom y el giro actuales. */
  protected readonly marks = computed<Mark[][]>(() => {
    const sizes = this.sizes();
    const pages: Mark[][] = sizes.map(() => []);
    for (const a of this.shownAnnotations()) {
      const size = sizes[a.page - 1];
      if (!size) continue;
      pages[a.page - 1].push(this.toMark(a, size));
    }
    return pages;
  });

  protected readonly editingMark = computed(() => {
    const id = this.editingId();
    if (!id) return null;
    for (const page of this.marks()) for (const m of page) if (m.a.id === id) return m;
    return null;
  });

  protected readonly sortedAnnotations = computed(() =>
    [...this.annotations()].sort((a, b) => a.page - b.page || this.topOf(b) - this.topOf(a)),
  );

  protected readonly sidebarTabs = computed(() => {
    const tabs: SidebarView[] = ['thumbnails'];
    if (this.outline().length && this.showOutline()) tabs.push('outline');
    if (this.annotatable()) tabs.push('annotations');
    return tabs;
  });

  protected readonly activeView = computed<SidebarView>(() => (this.sidebarTabs().includes(this.sidebarView()) ? this.sidebarView() : 'thumbnails'));

  protected readonly toolHint = computed(() => {
    if (!this.annotatable()) return '';
    const tool = this.tool();
    const t = this.t();
    return tool === 'highlight' ? t.pdfHighlightHint : tool === 'note' ? t.pdfNoteHint : tool === 'ink' ? t.pdfDrawHint : '';
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

  /** Lleva a un destino del documento (nombre o destino explícito), con su posición en la página. */
  async goToDestination(dest: string | unknown[] | null): Promise<void> {
    const pdf = this.pdf;
    if (!pdf || !dest) return;
    const explicit = typeof dest === 'string' ? await pdf.getDestination(dest).catch(() => null) : dest;
    if (!Array.isArray(explicit) || pdf !== this.pdf) return;
    const ref = explicit[0];
    let page: number;
    try {
      page = typeof ref === 'object' && ref ? (await pdf.getPageIndex(ref as never)) + 1 : Number.isInteger(ref) ? (ref as number) + 1 : NaN;
    } catch {
      return;
    }
    if (!Number.isFinite(page) || page < 1 || page > this.numPages()) return;
    // XYZ y FitH/FitBH dan la altura (en puntos, desde abajo) a la que se ve el destino.
    const kind = (explicit[1] as { name?: string } | undefined)?.name;
    const top = kind === 'XYZ' ? explicit[3] : kind === 'FitH' || kind === 'FitBH' ? explicit[2] : null;
    this.goToPage(page);
    if (typeof top === 'number') afterNextRender(() => this.scrollToPoint(page, top), { injector: this.injector });
  }

  /** Valores actuales del formulario, por nombre de campo. */
  async getFormData(): Promise<Record<string, CbPdfFormValue>> {
    const pdf = this.pdf;
    if (!pdf) return {};
    const fields = (await Promise.resolve(pdf.getFieldObjects?.()).catch(() => null)) as Map<string, { id: string; value?: unknown; type?: string; exportValues?: string }[]> | null;
    const storage = pdf.annotationStorage;
    const data: Record<string, CbPdfFormValue> = {};
    if (!fields || !storage) return data;
    for (const [name, widgets] of fields) {
      for (const widget of widgets) {
        if (!widget.id) continue;
        const stored = (storage.getValue(widget.id, { value: widget.value }) as { value?: unknown }).value;
        if (widget.type === 'checkbox' || widget.type === 'radiobutton') {
          const checked = stored === true || (typeof stored === 'string' && stored !== 'Off' && stored !== '');
          if (widget.type === 'checkbox') data[name] = checked;
          else if (checked) data[name] = widget.exportValues ?? String(stored);
          else data[name] ??= null;
        } else {
          data[name] = Array.isArray(stored) ? stored.map(String) : stored == null ? null : String(stored);
        }
      }
    }
    return data;
  }

  /** El PDF con lo escrito en el formulario y las anotaciones (o el original si no hay cambios). */
  async save(): Promise<Blob | null> {
    const pdf = this.pdf;
    if (!pdf) return null;
    const changed = this.formModified() || this.annotations().length > 0;
    const bytes = changed ? await this.withAnnotations(() => pdf.saveDocument()) : await pdf.getData();
    return new Blob([bytes as BlobPart], { type: 'application/pdf' });
  }

  /** Descarga el documento (con los datos del formulario y las anotaciones, si los hay). */
  async download(): Promise<void> {
    if (!this.pdf) return;
    const src = this.src();
    const blob = src instanceof Blob && !this.formModified() && !this.annotations().length ? src : await this.save();
    if (!blob) return;
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
      const pdf = this.pdf;
      // La copia para imprimir se toma con las anotaciones escritas; después se quitan.
      const storage = await this.withAnnotations(async () => pdf.annotationStorage.print);
      await printPdfDocument(pdf, this.document, (done, total) => this.printProgress.set({ done, total }), this.rotation(), storage);
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
        ...(data ? { data } : { url: this.engine.resolve(src as string | URL) }),
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
      this.formModified.set(false);
      // pdf.js tipa estos ganchos como `null`, pero los llama si se les asigna una función.
      const storage = pdf.annotationStorage as unknown as { onSetModified: () => void; onResetModified: () => void } | undefined;
      if (storage) {
        storage.onSetModified = () => this.formModified.set(true);
        storage.onResetModified = () => this.formModified.set(false);
      }
      void this.loadOutline(pdf, token);
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

  private async loadOutline(pdf: CbPdfDocument, token: number): Promise<void> {
    const raw = await Promise.resolve(pdf.getOutline?.()).catch(() => null);
    if (token !== this.loadToken) return;
    type Raw = { title: string; dest: string | unknown[] | null; url: string | null; bold: boolean; italic: boolean; items: Raw[] };
    const map = (items: Raw[] | null | undefined): CbPdfOutlineItem[] =>
      (items ?? []).map((i) => ({ title: i.title, dest: i.dest, url: i.url, bold: !!i.bold, italic: !!i.italic, items: map(i.items) }));
    this.outline.set(map(raw as Raw[] | null));
    this.collapsed.set(new Set());
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
    this.outline.set([]);
    this.formModified.set(false);
    this.selectedId.set(null);
    this.editingId.set(null);
    this.stroke.set(null);
    this.dragPreview.set(null);
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
      // Con formularios HTML, el canvas no dibuja los campos (AnnotationMode.ENABLE_FORMS).
      const annotationMode = this.forms() ? (this.pdfjs?.AnnotationMode?.ENABLE_FORMS ?? 2) : (this.pdfjs?.AnnotationMode?.ENABLE ?? 1);
      const task = page.render({ canvas, viewport, annotationMode, transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0] });
      renderTask = task;
      await task.promise;
      if (cancelled) return;
      el.querySelector('.cb-pdf__canvas')?.replaceChildren(canvas);
      void this.renderAnnotations(page, viewport, el, () => cancelled);

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
    el?.querySelector('.cb-pdf__annotations')?.replaceChildren();
  }

  /** Enlaces y campos de formulario de la página (capa de anotaciones de pdf.js). */
  private async renderAnnotations(page: CbPdfPage, viewport: ReturnType<CbPdfPage['getViewport']>, el: HTMLElement, cancelled: () => boolean): Promise<void> {
    const div = el.querySelector<HTMLDivElement>('.cb-pdf__annotations');
    const Layer = this.pdfjs?.AnnotationLayer;
    const pdf = this.pdf;
    if (!div || !Layer || !pdf) return;
    try {
      const annotations = await page.getAnnotations({ intent: 'display' });
      if (cancelled() || !annotations.length) return;
      const fieldObjects = this.forms() ? await pdf.getFieldObjects().catch(() => null) : null;
      if (cancelled()) return;
      div.replaceChildren();
      const layerViewport = viewport.clone({ dontFlip: true });
      const layer = new Layer({
        div,
        page,
        viewport: layerViewport,
        linkService: this.linkService,
        annotationStorage: pdf.annotationStorage,
        accessibilityManager: null,
        annotationCanvasMap: null,
        annotationEditorUIManager: null,
        structTreeLayer: null,
        commentManager: null,
      });
      await layer.render({
        viewport: layerViewport,
        div,
        annotations,
        page,
        linkService: this.linkService as never,
        annotationStorage: pdf.annotationStorage,
        renderForms: this.forms(),
        enableScripting: false,
        hasJSActions: false,
        fieldObjects,
      });
      if (cancelled()) div.replaceChildren();
    } catch {
      // Anotaciones dañadas: la página se ve igual, sin enlaces ni campos.
    }
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

  /** Desplaza hasta la altura `top` (puntos PDF, desde abajo) de la página `n`. */
  private scrollToPoint(n: number, top: number): void {
    const root = this.viewport()?.nativeElement;
    const el = this.pageEl(n);
    const size = this.sizes()[n - 1];
    if (!root || !el || !size || (size.rotate + this.rotation()) % 360 !== 0) return;
    const factor = this.scale() * CSS_UNITS;
    root.scrollTop = el.offsetTop + Math.max(0, (size.height - top) * factor) - PAGE_GAP;
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

  // --- Anotaciones -------------------------------------------------------------

  protected toggleTool(tool: CbPdfTool): void {
    this.tool.set(this.tool() === tool ? 'none' : tool);
  }

  /** Con texto seleccionado lo resalta al momento; si no, activa la herramienta. */
  protected onHighlightTool(): void {
    if (this.tool() !== 'highlight' && this.highlightSelection()) return;
    this.toggleTool('highlight');
  }

  /** Con el teclado (sin puntero) la nota se pone directamente en la página que se ve. */
  protected onNoteTool(event: MouseEvent): void {
    if (event.detail === 0 && this.tool() !== 'note') {
      const page = this.page();
      const spot = this.visibleSpot(page);
      if (spot) this.addNote(page, spot.x - 80, spot.y - 20);
      return;
    }
    this.toggleTool('note');
  }

  protected openSignature(): void {
    this.tool.set('none');
    this.signatureValue.set('');
    this.signing.set(true);
  }

  protected async insertSignature(): Promise<void> {
    const value = this.signatureValue();
    if (!value) return;
    const page = this.page();
    const size = this.sizes()[page - 1];
    const spot = this.visibleSpot(page);
    this.signing.set(false);
    if (!size || !spot) return;
    const { url, width, height } = await trimSignature(value, this.document);
    const view = this.viewOf(size);
    const pageWidth = this.pageBoxes()[page - 1]?.width ?? 400;
    // 180 pt de ancho como máximo (algo menos que media página A4), con la proporción de la firma.
    const w = Math.min(pageWidth * 0.45, 180 * view.factor);
    const h = (w * height) / Math.max(1, width);
    const rect = viewToRect(this.geomOf(size), view, spot.x - w / 2, spot.y - h / 2, w, h);
    const id = this.addAnnotation({ ...this.newBase(page), type: 'signature', rect, image: url });
    this.pendingFocus = id;
  }

  /** El foco vuelve tras cerrar el diálogo: entonces se lleva a la firma recién puesta. */
  protected onSignatureHide(): void {
    const id = this.pendingFocus;
    this.pendingFocus = null;
    if (id) setTimeout(() => this.focusMark(id));
  }

  /** Resalta el texto seleccionado en el documento (una anotación por página). */
  protected highlightSelection(): boolean {
    const selection = this.document.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return false;
    let created = 0;
    for (const [index, ref] of this.pageEls().entries()) {
      const pageEl = ref.nativeElement;
      const textEl = pageEl.querySelector<HTMLElement>('.cb-pdf__text');
      const size = this.sizes()[index];
      if (!textEl || !size) continue;
      const boxes: { left: number; top: number; width: number; height: number }[] = [];
      let text = '';
      for (let k = 0; k < selection.rangeCount; k++) {
        const range = selection.getRangeAt(k);
        if (!range.intersectsNode(textEl)) continue;
        const part = range.cloneRange();
        if (!textEl.contains(part.startContainer)) part.setStart(textEl, 0);
        if (!textEl.contains(part.endContainer)) part.setEnd(textEl, textEl.childNodes.length);
        const origin = pageEl.getBoundingClientRect();
        for (const r of Array.from(part.getClientRects())) {
          boxes.push({ left: r.left - origin.left, top: r.top - origin.top, width: r.width, height: r.height });
        }
        text += part.toString();
      }
      const lines = mergeLineRects(withoutTallRects(boxes));
      if (!lines.length) continue;
      const geom = this.geomOf(size);
      const view = this.viewOf(size);
      const rects = lines.map((l) => viewToRect(geom, view, l.left, l.top, l.width, l.height));
      this.addAnnotation({ ...this.newBase(index + 1), type: 'highlight', rects, color: this.annotationColor(), text: text.replace(/\s+/g, ' ').trim() });
      created++;
    }
    if (created) selection.removeAllRanges();
    return created > 0;
  }

  protected onPagesPointerUp(): void {
    // La selección termina de fijarse después del pointerup.
    if (this.annotatable() && this.tool() === 'highlight') setTimeout(() => this.highlightSelection());
  }

  protected onMarksPointerDown(event: PointerEvent, page: number): void {
    if (!this.annotatable() || event.button !== 0) return;
    const layer = event.currentTarget as HTMLElement;
    const origin = layer.getBoundingClientRect();
    const tool = this.tool();
    if (tool === 'note') {
      event.preventDefault();
      this.addNote(page, event.clientX - origin.left, event.clientY - origin.top);
    } else if (tool === 'ink') {
      event.preventDefault();
      layer.setPointerCapture?.(event.pointerId);
      this.stroke.set({ page, points: [event.clientX - origin.left, event.clientY - origin.top] });
      const move = (e: PointerEvent) => {
        const s = this.stroke();
        if (s) this.stroke.set({ page, points: [...s.points, e.clientX - origin.left, e.clientY - origin.top] });
      };
      const end = () => {
        layer.removeEventListener('pointermove', move);
        layer.removeEventListener('pointerup', end);
        layer.removeEventListener('pointercancel', end);
        this.finishStroke();
      };
      layer.addEventListener('pointermove', move);
      layer.addEventListener('pointerup', end);
      layer.addEventListener('pointercancel', end);
    } else if (tool === 'none') {
      this.closeEditor(false);
      this.selectedId.set(null);
    }
  }

  private finishStroke(): void {
    const s = this.stroke();
    this.stroke.set(null);
    const size = s && this.sizes()[s.page - 1];
    if (!s || !size) return;
    const points = s.points.length === 2 ? [...s.points, s.points[0] + 0.5, s.points[1] + 0.5] : s.points;
    const geom = this.geomOf(size);
    const view = this.viewOf(size);
    const pdf: number[] = [];
    for (let i = 0; i + 1 < points.length; i += 2) pdf.push(...viewToPdf(geom, view, points[i], points[i + 1]));
    const path = simplifyPath(pdf, 0.4).map((v) => Math.round(v * 100) / 100);
    this.addAnnotation({ ...this.newBase(s.page), type: 'ink', paths: [path], color: this.annotationColor(), thickness: 2 }, false);
  }

  private addNote(page: number, x: number, y: number): void {
    const size = this.sizes()[page - 1];
    if (!size) return;
    const view = this.viewOf(size);
    const box = this.pageBoxes()[page - 1];
    const w = 160 * view.factor;
    const h = 12 * 1.5 * view.factor;
    const left = clamp(x, 0, Math.max(0, (box?.width ?? w) - w));
    const top = clamp(y, 0, Math.max(0, (box?.height ?? h) - h));
    const rect = viewToRect(this.geomOf(size), view, left, top, w, h);
    const id = this.addAnnotation({ ...this.newBase(page), type: 'note', rect, text: '', color: this.annotationColor() }, false);
    this.tool.set('none');
    this.openEditor(id);
  }

  /** Añade una anotación, la anuncia y la selecciona. Devuelve su `id`. */
  private addAnnotation(annotation: CbPdfAnnotation, focus = true): string {
    this.annotations.update((list) => [...list, annotation]);
    this.annotationAdd.emit(annotation);
    this.announce(cbFormat(this.t().pdfAnnotationAdded, this.nounOf(annotation), annotation.page));
    this.selectedId.set(annotation.id);
    if (focus) afterNextRender(() => this.focusMark(annotation.id), { injector: this.injector });
    return annotation.id;
  }

  /** Borra una anotación y deja el foco en la siguiente de la página (o en el documento). */
  removeAnnotation(annotation: CbPdfAnnotation): void {
    const list = this.annotations();
    const index = list.findIndex((a) => a.id === annotation.id);
    if (index === -1) return;
    const samePage = list.filter((a) => a.page === annotation.page && a.id !== annotation.id);
    const hadFocus = this.host.nativeElement.contains(this.document.activeElement);
    this.annotations.set(list.filter((a) => a.id !== annotation.id));
    if (this.editingId() === annotation.id) this.editingId.set(null);
    if (this.selectedId() === annotation.id) this.selectedId.set(null);
    this.annotationRemove.emit(annotation);
    this.announce(this.t().pdfAnnotationRemoved);
    if (!hadFocus || this.activeView() === 'annotations' && this.sidebar()) return;
    const next = samePage[0]?.id;
    afterNextRender(() => (next ? this.focusMark(next) : this.viewport()?.nativeElement.focus()), { injector: this.injector });
  }

  private replaceAnnotation(annotation: CbPdfAnnotation): void {
    this.annotations.update((list) => list.map((a) => (a.id === annotation.id ? annotation : a)));
  }

  protected select(id: string): void {
    if (this.editingId() && this.editingId() !== id) this.closeEditor(false);
    this.selectedId.set(id);
  }

  /** Lleva a la anotación (desde la lista del panel) y le da el foco. */
  protected revealAnnotation(annotation: CbPdfAnnotation): void {
    this.goToPage(annotation.page);
    this.selectedId.set(annotation.id);
    afterNextRender(() => this.focusMark(annotation.id, true), { injector: this.injector });
  }

  private focusMark(id: string, scroll = false): void {
    const el = this.host.nativeElement.querySelector<HTMLElement>(`.cb-pdf__mark[data-id="${id}"]`);
    if (!el) return;
    el.focus({ preventScroll: !scroll });
    if (scroll) el.scrollIntoView?.({ block: 'center', inline: 'nearest' });
  }

  protected openEditor(id: string): void {
    const annotation = this.annotations().find((a) => a.id === id);
    if (!annotation || (annotation.type !== 'note' && annotation.type !== 'highlight')) return;
    this.selectedId.set(id);
    this.editingId.set(id);
    afterNextRender(
      () => {
        const textarea = this.cardText()?.nativeElement;
        if (!textarea) return;
        textarea.value = annotation.type === 'note' ? annotation.text : (annotation.comment ?? '');
        textarea.focus();
      },
      { injector: this.injector },
    );
  }

  protected onCardInput(value: string): void {
    const annotation = this.annotations().find((a) => a.id === this.editingId());
    if (annotation?.type === 'note') this.replaceAnnotation({ ...annotation, text: value });
    else if (annotation?.type === 'highlight') this.replaceAnnotation({ ...annotation, comment: value || undefined });
  }

  protected onCardKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.key === 'Escape' || (event.key === 'Enter' && (event.ctrlKey || event.metaKey))) {
      event.preventDefault();
      this.closeEditor(true);
    }
  }

  /** Cierra el editor: una nota vacía se borra y una con texto ajusta su caja a lo escrito. */
  closeEditor(refocus: boolean): void {
    const id = this.editingId();
    if (!id) return;
    this.editingId.set(null);
    const annotation = this.annotations().find((a) => a.id === id);
    if (annotation?.type === 'note') {
      if (!annotation.text.trim()) {
        this.annotations.update((list) => list.filter((a) => a.id !== id));
        this.selectedId.set(null);
        if (refocus) this.viewport()?.nativeElement.focus();
        return;
      }
      this.measureNote(annotation);
    }
    if (refocus) afterNextRender(() => this.focusMark(id), { injector: this.injector });
  }

  /** La caja de la nota en el PDF es la que ocupa su texto en pantalla. */
  private measureNote(note: Extract<CbPdfAnnotation, { type: 'note' }>): void {
    const el = this.host.nativeElement.querySelector<HTMLElement>(`.cb-pdf__mark[data-id="${note.id}"]`);
    const size = this.sizes()[note.page - 1];
    if (!el || !size || !el.offsetWidth) return;
    const rect = viewToRect(this.geomOf(size), this.viewOf(size), el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight);
    if (rect.some((v, i) => Math.abs(v - note.rect[i]) > 0.5)) this.replaceAnnotation({ ...note, rect });
  }

  protected onMarkPointerDown(event: PointerEvent, annotation: CbPdfAnnotation): void {
    event.stopPropagation();
    const el = event.currentTarget as HTMLElement;
    if (!this.annotatable() || event.button !== 0) return;
    if (annotation.type === 'highlight') {
      this.select(annotation.id);
      return;
    }
    // Sin el default no empieza una selección de texto al arrastrar; el foco se da a mano.
    event.preventDefault();
    el.focus({ preventScroll: true });
    this.trackPointer(event, el, (dx, dy) => this.translated(annotation, dx, dy), () => {
      if (annotation.type === 'note' && this.editingId() !== annotation.id) this.openEditor(annotation.id);
    });
  }

  protected onResizePointerDown(event: PointerEvent, annotation: CbPdfAnnotation): void {
    event.stopPropagation();
    event.preventDefault();
    if (annotation.type !== 'signature') return;
    const size = this.sizes()[annotation.page - 1];
    if (!size) return;
    const width = rectToView(this.geomOf(size), this.viewOf(size), annotation.rect).width;
    this.trackPointer(event, event.currentTarget as HTMLElement, (dx) => ({ ...annotation, rect: scaleRect(annotation.rect, (width + dx) / Math.max(1, width)) }));
  }

  /** Arrastre con vista previa: se confirma al soltar; sin moverse es un clic (`onClick`). */
  private trackPointer(event: PointerEvent, el: HTMLElement, update: (dx: number, dy: number) => CbPdfAnnotation, onClick?: () => void): void {
    el.setPointerCapture?.(event.pointerId);
    const [x, y] = [event.clientX, event.clientY];
    let moved = false;
    const move = (e: PointerEvent) => {
      const [dx, dy] = [e.clientX - x, e.clientY - y];
      if (!moved && Math.hypot(dx, dy) < 3) return;
      moved = true;
      this.dragPreview.set(update(dx, dy));
    };
    const end = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', end);
      el.removeEventListener('pointercancel', end);
      const preview = this.dragPreview();
      this.dragPreview.set(null);
      if (moved && preview) this.replaceAnnotation(preview);
      else onClick?.();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  protected onMarkKeydown(event: KeyboardEvent, rendered: CbPdfAnnotation): void {
    if (!this.annotatable() || event.ctrlKey || event.metaKey || event.altKey) return;
    // La de la plantilla puede ser de antes del último repintado (tecla mantenida): se usa la actual.
    const annotation = this.annotations().find((a) => a.id === rendered.id) ?? rendered;
    const step = event.shiftKey ? 20 : 4;
    const arrows: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (event.key === 'Delete' || event.key === 'Backspace') {
      this.removeAnnotation(annotation);
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (annotation.type !== 'note' && annotation.type !== 'highlight') return;
      this.openEditor(annotation.id);
    } else if (arrows[event.key] && annotation.type !== 'highlight') {
      const moved = this.translated(annotation, ...arrows[event.key]);
      this.replaceAnnotation(moved);
      this.announcePosition(moved);
    } else if ((event.key === '+' || event.key === '=' || event.key === '-') && (annotation.type === 'signature' || annotation.type === 'note')) {
      const grow = event.key !== '-';
      if (annotation.type === 'signature') {
        const rect = scaleRect(annotation.rect, grow ? 1.1 : 1 / 1.1);
        const pageWidth = (this.sizes()[annotation.page - 1]?.width ?? 1) / (this.sizes()[annotation.page - 1]?.userUnit ?? 1);
        this.replaceAnnotation({ ...annotation, rect });
        this.announce(cbFormat(this.t().pdfSignatureResized, Math.round(((rect[2] - rect[0]) / pageWidth) * 100)));
      } else {
        const fontSize = clamp((annotation.fontSize ?? 12) + (grow ? 1 : -1), 6, 48);
        this.replaceAnnotation({ ...annotation, fontSize });
        this.announce(cbFormat(this.t().pdfNoteResized, fontSize));
        afterNextRender(() => this.measureNote({ ...annotation, fontSize }), { injector: this.injector });
      }
    } else {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  /** Desplaza `dx`, `dy` píxeles de pantalla (con el giro, en el sentido en que se ven). */
  private translated(annotation: CbPdfAnnotation, dx: number, dy: number): CbPdfAnnotation {
    const size = this.sizes()[annotation.page - 1];
    if (!size || annotation.type === 'highlight') return annotation;
    const geom = this.geomOf(size);
    const view = this.viewOf(size);
    const [ax, ay] = viewToPdf(geom, view, 0, 0);
    const [bx, by] = viewToPdf(geom, view, dx, dy);
    const [px, py] = [bx - ax, by - ay];
    if (annotation.type === 'ink') {
      return { ...annotation, paths: annotation.paths.map((p) => p.map((v, i) => Math.round((v + (i % 2 ? py : px)) * 100) / 100)) };
    }
    return { ...annotation, rect: moveRect(geom, annotation.rect, px, py) };
  }

  private announcePosition(annotation: CbPdfAnnotation): void {
    const box = this.marks()[annotation.page - 1]?.find((m) => m.a.id === annotation.id)?.box;
    const page = this.pageBoxes()[annotation.page - 1];
    if (!box || !page) return;
    this.announce(cbFormat(this.t().pdfAnnotationMoved, Math.round((box.left / page.width) * 100), Math.round((box.top / page.height) * 100)));
  }

  private announce(text: string): void {
    // Un espacio duro alterno hace que se repita aunque el texto sea el mismo.
    this.announceFlip = !this.announceFlip;
    this.announcement.set(this.announceFlip ? text : `${text} `);
  }

  /** Centro de la parte visible de la página `n`, en píxeles de la página. */
  private visibleSpot(n: number): { x: number; y: number } | null {
    const root = this.viewport()?.nativeElement;
    const el = this.pageEl(n);
    if (!root || !el) return null;
    const top = Math.max(0, root.scrollTop - el.offsetTop);
    const bottom = Math.min(el.offsetHeight, root.scrollTop + root.clientHeight - el.offsetTop);
    const y = bottom > top ? (top + bottom) / 2 : el.offsetHeight / 3;
    return { x: (el.offsetWidth || this.pageBoxes()[n - 1]?.width || 0) / 2, y };
  }

  private toMark(a: CbPdfAnnotation, size: PageSize): Mark {
    const geom = this.geomOf(size);
    const view = this.viewOf(size);
    const color = CB_PDF_COLORS[a.type === 'signature' ? 'blue' : a.color];
    const base = { a, light: color.light, dark: color.dark, label: this.labelOf(a) };
    switch (a.type) {
      case 'highlight': {
        const boxes = a.rects.map((r) => rectToView(geom, view, r));
        const box = unionBox(boxes);
        return { ...base, box, rects: boxes.map((b) => ({ ...b, left: b.left - box.left, top: b.top - box.top })) };
      }
      case 'note':
        return { ...base, box: rectToView(geom, view, a.rect), fontPx: (a.fontSize ?? 12) * view.factor * geom.userUnit };
      case 'ink': {
        const pad = (a.thickness / 2 + 1) * view.factor;
        const points = a.paths.map((p) => {
          const out: [number, number][] = [];
          for (let i = 0; i + 1 < p.length; i += 2) out.push(pdfToView(geom, view, p[i], p[i + 1]));
          return out;
        });
        const flat = points.flat();
        const left = Math.min(...flat.map((p) => p[0])) - pad;
        const top = Math.min(...flat.map((p) => p[1])) - pad;
        const width = Math.max(...flat.map((p) => p[0])) + pad - left;
        const height = Math.max(...flat.map((p) => p[1])) + pad - top;
        const d = points.map((p) => p.map(([x, y], i) => `${i ? 'L' : 'M'}${round2(x - left)} ${round2(y - top)}`).join(' ')).join(' ');
        return { ...base, box: { left, top, width, height }, d, strokePx: a.thickness * view.factor };
      }
      case 'signature':
        return { ...base, box: rectToView(geom, view, a.rect) };
    }
  }

  protected labelOf(a: CbPdfAnnotation): string {
    const t = this.t();
    switch (a.type) {
      case 'highlight': {
        const label = cbFormat(t.pdfHighlightOf, truncate(a.text, 80));
        return a.comment ? `${label}. ${t.pdfComment}: ${truncate(a.comment, 120)}` : label;
      }
      case 'note':
        return cbFormat(t.pdfNoteOf, a.text.trim() ? truncate(a.text, 120) : t.pdfEmptyNote);
      case 'ink':
        return t.pdfInkOf;
      case 'signature':
        return t.pdfSignatureOf;
    }
  }

  private nounOf(a: CbPdfAnnotation): string {
    const t = this.t();
    return a.type === 'highlight' ? t.pdfHighlightNoun : a.type === 'note' ? t.pdfNote : a.type === 'ink' ? t.pdfInkOf : t.pdfSignatureOf;
  }

  protected swatchOf(a: CbPdfAnnotation): string {
    if (a.type === 'signature') return CB_PDF_COLORS.blue.dark;
    return a.type === 'highlight' ? CB_PDF_COLORS[a.color].light : CB_PDF_COLORS[a.color].dark;
  }

  protected colorLabel(color: CbPdfAnnotationColor): string {
    const t = this.t();
    return { yellow: t.pdfColorYellow, green: t.pdfColorGreen, blue: t.pdfColorBlue, red: t.pdfColorRed }[color];
  }

  /** Posición del editor: bajo la anotación, sin salirse de la página. */
  protected cardLeft(m: Mark, pageWidth: number): number {
    return clamp(m.box.left, 0, Math.max(0, pageWidth - 260));
  }

  protected noteHeight(m: Mark): number {
    if (m.a.type !== 'note') return m.box.height;
    const lines = Math.max(1, m.a.text.split('\n').length);
    return Math.max(m.box.height, lines * (m.fontPx ?? 16) * 1.25 + 8);
  }

  private newBase(page: number): { id: string; page: number; author?: string; date: string } {
    const author = this.author();
    return { id: `cb-annot-${Date.now().toString(36)}-${++nextAnnotationId}`, page, ...(author ? { author } : {}), date: new Date().toISOString() };
  }

  private geomOf(size: PageSize): CbPdfPageGeometry {
    return { x0: size.x0, y0: size.y0, width: size.width, height: size.height, userUnit: size.userUnit };
  }

  private viewOf(size: PageSize): CbPdfViewTransform {
    return { factor: this.scale() * CSS_UNITS, rotation: (size.rotate + this.rotation()) % 360 };
  }

  /** Altura (para ordenar de arriba abajo en el panel). */
  private topOf(a: CbPdfAnnotation): number {
    if (a.type === 'highlight') return Math.max(...a.rects.map((r) => r[3]));
    if (a.type === 'ink') return Math.max(...a.paths.flatMap((p) => p.filter((_, i) => i % 2)));
    return a.rect[3];
  }

  /**
   * Escribe las anotaciones en el `annotationStorage` de pdf.js mientras dura `run` (guardar o
   * tomar la copia para imprimir) y las quita después, sin marcar el formulario como cambiado.
   */
  private async withAnnotations<T>(run: () => Promise<T>): Promise<T> {
    const pdf = this.pdf;
    const list = this.annotations();
    if (!pdf || !list.length) return run();
    const storage = pdf.annotationStorage as unknown as {
      setValue(key: string, value: unknown): void;
      remove(key: string): void;
      onSetModified: (() => void) | null;
    };
    const hook = storage.onSetModified;
    storage.onSetModified = null;
    const keys: string[] = [];
    try {
      for (const a of list) {
        const size = this.sizes()[a.page - 1];
        if (!size) continue;
        const bitmap = a.type === 'signature' ? await imageToBitmap(a.image) : undefined;
        const value = toPdfJsAnnotation(a, size.rotate, bitmap);
        if (!value) continue;
        const key = `${PDFJS_EDITOR_PREFIX}${a.id}`;
        storage.setValue(key, value);
        keys.push(key);
      }
      return await run();
    } finally {
      for (const key of keys) storage.remove(key);
      storage.onSetModified = hook;
    }
  }

  // --- Barra y teclado -------------------------------------------------------------

  protected isCollapsed(path: string): boolean {
    return this.collapsed().has(path);
  }

  protected toggleOutline(path: string): void {
    this.collapsed.update((set) => {
      const next = new Set(set);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  protected openOutlineItem(item: CbPdfOutlineItem): void {
    if (item.dest) void this.goToDestination(item.dest);
    else if (item.url && this.externalLinks() && SAFE_URL.test(item.url)) globalThis.open?.(item.url, '_blank', 'noopener,noreferrer');
  }

  /** Acciones con nombre de los enlaces (NextPage, PrevPage, FirstPage, LastPage). */
  private namedAction(action: string): void {
    if (action === 'NextPage') this.nextPage();
    else if (action === 'PrevPage') this.previousPage();
    else if (action === 'FirstPage') this.goToPage(1);
    else if (action === 'LastPage') this.goToPage(this.numPages());
  }

  protected onFormInput(): void {
    this.formChange.emit();
  }

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
    if (event.key === 'Escape' && this.tool() !== 'none') {
      this.tool.set('none');
      event.preventDefault();
      return;
    }
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
  const [x0 = 0, y0 = 0] = (page.view as number[] | undefined) ?? [];
  return { x0, y0, width: viewport.width, height: viewport.height, rotate: page.rotate || 0, userUnit };
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

/** Quita de una selección las cajas mucho más altas que una línea (contenedores, fin de contenido). */
function withoutTallRects<T extends { height: number }>(rects: T[]): T[] {
  if (rects.length < 2) return rects;
  const heights = rects.map((r) => r.height).sort((a, b) => a - b);
  const median = heights[Math.floor(heights.length / 2)];
  return rects.filter((r) => r.height <= median * 2.5);
}

function unionBox(boxes: readonly { left: number; top: number; width: number; height: number }[]): { left: number; top: number; width: number; height: number } {
  const left = Math.min(...boxes.map((b) => b.left));
  const top = Math.min(...boxes.map((b) => b.top));
  return { left, top, width: Math.max(...boxes.map((b) => b.left + b.width)) - left, height: Math.max(...boxes.map((b) => b.top + b.height)) - top };
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}
