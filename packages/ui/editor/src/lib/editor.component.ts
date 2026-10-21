import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CbIcon, CbIconRegistry } from '@caribeng/ui/icon';
import {
  alignCenterHorizontal,
  alignEndVertical,
  alignStartVertical,
  betweenHorizontalEnd,
  betweenHorizontalStart,
  betweenVerticalEnd,
  betweenVerticalStart,
  bold,
  captions,
  code,
  codeXml,
  columns3,
  crop,
  image,
  italic,
  link,
  list,
  listOrdered,
  minus,
  panelTop,
  ratio,
  redo,
  rows3,
  removeFormatting,
  squareCode,
  strikethrough,
  table,
  textAlignCenter,
  textAlignEnd,
  textAlignStart,
  textQuote,
  trash,
  type,
  underline,
  undo,
  unlink,
} from '@caribeng/ui/icons';
import { cbFieldState, cbFormat, injectCbTranslation, type CbTranslation } from '@caribeng/ui';
import {
  cbHtmlToText,
  cbSanitizeHtml,
  imageStyle,
  isSafeUrl,
  readCellBorders,
  readImageStyle,
  withCellBorders,
  type CbImageAlign,
  type CbTableBorders,
} from './html-sanitizer';
import { clampRect, cropImage, fitRatio, initialRect, resizeRect, type CbCropRect } from './image-crop';

/** Herramientas de la barra; `'|'` es un separador. */
export type CbEditorTool =
  | 'heading'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'bulletList'
  | 'orderedList'
  | 'quote'
  | 'codeBlock'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'link'
  | 'image'
  | 'table'
  | 'horizontalRule'
  | 'clear'
  | 'undo'
  | 'redo'
  | 'source'
  | '|';

/** Barra por defecto: todas las herramientas. */
export const CB_EDITOR_DEFAULT_TOOLBAR: readonly CbEditorTool[] = [
  'heading', '|',
  'bold', 'italic', 'underline', 'strike', 'code', '|',
  'bulletList', 'orderedList', 'quote', 'codeBlock', '|',
  'alignLeft', 'alignCenter', 'alignRight', '|',
  'link', 'image', 'table', 'horizontalRule', 'clear', '|',
  'undo', 'redo', '|',
  'source',
];

/** Sube una imagen y devuelve su URL pública (p. ej. a tu servidor o a un bucket). */
export type CbEditorImageUpload = (file: File) => Promise<string>;

/** Motivo por el que no se insertó una imagen. */
export interface CbEditorImageError {
  file: File;
  reason: 'type' | 'size' | 'upload';
  error?: unknown;
}

interface ToolDef {
  icon: string;
  label: (t: CbTranslation) => string;
  /** Estado que la marca como activa (`aria-pressed`). */
  state?: keyof EditorState;
}

interface EditorState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  code: boolean;
  bulletList: boolean;
  orderedList: boolean;
  quote: boolean;
  codeBlock: boolean;
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
  link: boolean;
  block: string;
}

const EMPTY_STATE: EditorState = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  code: false,
  bulletList: false,
  orderedList: false,
  quote: false,
  codeBlock: false,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
  link: false,
  block: 'P',
};

const TOOLS: Record<Exclude<CbEditorTool, 'heading' | '|'>, ToolDef> = {
  bold: { icon: 'bold', label: (t) => t.bold, state: 'bold' },
  italic: { icon: 'italic', label: (t) => t.italic, state: 'italic' },
  underline: { icon: 'underline', label: (t) => t.underline, state: 'underline' },
  strike: { icon: 'strikethrough', label: (t) => t.strikethrough, state: 'strike' },
  code: { icon: 'code', label: (t) => t.inlineCode, state: 'code' },
  bulletList: { icon: 'list', label: (t) => t.bulletList, state: 'bulletList' },
  orderedList: { icon: 'list-ordered', label: (t) => t.numberedList, state: 'orderedList' },
  quote: { icon: 'text-quote', label: (t) => t.quote, state: 'quote' },
  codeBlock: { icon: 'code-xml', label: (t) => t.codeBlock, state: 'codeBlock' },
  alignLeft: { icon: 'text-align-start', label: (t) => t.alignLeft, state: 'alignLeft' },
  alignCenter: { icon: 'text-align-center', label: (t) => t.alignCenter, state: 'alignCenter' },
  alignRight: { icon: 'text-align-end', label: (t) => t.alignRight, state: 'alignRight' },
  link: { icon: 'link', label: (t) => t.insertLink, state: 'link' },
  image: { icon: 'image', label: (t) => t.insertImage },
  table: { icon: 'table', label: (t) => t.insertTable },
  horizontalRule: { icon: 'minus', label: (t) => t.horizontalLine },
  clear: { icon: 'remove-formatting', label: (t) => t.clearFormat },
  undo: { icon: 'undo', label: (t) => t.undo },
  redo: { icon: 'redo', label: (t) => t.redo },
  source: { icon: 'square-code', label: (t) => t.sourceCode },
};

const EDITOR_ICONS: Record<string, string> = {
  bold,
  italic,
  underline,
  strikethrough,
  code,
  list,
  'list-ordered': listOrdered,
  'text-quote': textQuote,
  'text-align-start': textAlignStart,
  'text-align-center': textAlignCenter,
  'text-align-end': textAlignEnd,
  link,
  unlink,
  image,
  minus,
  'remove-formatting': removeFormatting,
  undo,
  redo,
  'square-code': squareCode,
  'code-xml': codeXml,
  table,
  'between-horizontal-start': betweenHorizontalStart,
  'between-horizontal-end': betweenHorizontalEnd,
  'between-vertical-start': betweenVerticalStart,
  'between-vertical-end': betweenVerticalEnd,
  'rows-3': rows3,
  'columns-3': columns3,
  crop,
  'panel-top': panelTop,
  trash,
  type,
  'align-start-vertical': alignStartVertical,
  'align-center-horizontal': alignCenterHorizontal,
  'align-end-vertical': alignEndVertical,
  ratio,
  captions,
};

/** Borde por defecto de las tablas nuevas (gris claro, legible en temas claro y oscuro). */
const DEFAULT_BORDER = '#d0d5dd';

/** Anchos rápidos de una imagen (porcentaje del área de texto). */
const IMAGE_WIDTHS = ['25%', '50%', '75%', '100%'];

let nextId = 0;

/**
 * Editor de CaribeNG: editor de texto enriquecido sin dependencias de terceros.
 *
 * - **Valor**: HTML saneado y normalizado (lista blanca de etiquetas, sin scripts,
 *   eventos ni URLs peligrosas; igual en todos los navegadores; `''` si está vacío).
 *   El mismo saneado se aplica al cargar un valor y al pegar.
 * - Barra configurable (`toolbar`) con estado activo, panel de enlaces con
 *   validación, imágenes con `imageUpload` (o data URL con límite de tamaño),
 *   pegado limpio desde Word y Google Docs, atajos de escritura (`# `, `* `,
 *   `1. `, `> `), contador con `maxLength`, vista de HTML y modo `readonly`.
 * - Integración con Angular Forms (`ControlValueAccessor`).
 *
 * @example
 * ```html
 * <cb-editor formControlName="descripcion" [maxLength]="2000" [imageUpload]="subirImagen" />
 * <cb-editor [value]="html" readonly />
 * ```
 */
@Component({
  selector: 'cb-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbEditor),
      multi: true,
    },
  ],
  host: {
    class: 'cb-editor',
    '[class.cb-is-invalid]': 'invalidState()',
    '[class.cb-is-disabled]': 'isDisabled()',
    '[class.cb-is-readonly]': 'readonly()',
  },
  template: `
    @if (!readonly()) {
      <div
        #toolbar
        class="cb-editor__toolbar"
        role="toolbar"
        [attr.aria-label]="t().textFormatting"
        [attr.aria-controls]="surfaceId"
        (keydown)="onToolbarKeydown($event)"
        (focusin)="setActiveTool($any($event.target))"
      >
        @for (tool of toolbarItems(); track $index) {
          @if (tool === '|') {
            <span class="cb-editor__sep" aria-hidden="true"></span>
          } @else if (tool === 'heading') {
            <select
              class="cb-editor__select"
              [disabled]="isDisabled() || sourceMode()"
              [attr.aria-label]="t().paragraphStyle"
              (change)="format($any($event.target).value)"
            >
              <option value="P" [selected]="state().block === 'P'">{{ t().normal }}</option>
              <option value="H1" [selected]="state().block === 'H1'">{{ t().heading1 }}</option>
              <option value="H2" [selected]="state().block === 'H2'">{{ t().heading2 }}</option>
              <option value="H3" [selected]="state().block === 'H3'">{{ t().heading3 }}</option>
            </select>
          } @else {
            <button
              type="button"
              class="cb-editor__tool"
              [class.cb-is-active]="isActive(tool)"
              [disabled]="isDisabled() || (sourceMode() && tool !== 'source')"
              [attr.aria-label]="toolLabel(tool)"
              [attr.title]="toolLabel(tool)"
              [attr.aria-pressed]="pressable(tool) ? isActive(tool) : null"
              (mousedown)="hold($event)"
              (click)="run(tool)"
            >
              <cb-icon [name]="toolIcon(tool)" [size]="16" aria-hidden="true" />
            </button>
          }
        }
      </div>
    }

    @if (tableCell() && !readonly() && !sourceMode()) {
      <div class="cb-editor__context cb-editor__context--table" role="toolbar" [attr.aria-label]="t().tableTools" (keydown)="onContextKeydown($event)">
        <div class="cb-editor__group" role="group" [attr.aria-label]="t().tableRow">
          <span class="cb-editor__group-label" aria-hidden="true">{{ t().tableRow }}</span>
          <button type="button" class="cb-editor__tool cb-editor__tool--labeled" tabindex="0" [attr.aria-label]="t().insertRowAbove" (mousedown)="hold($event)" (click)="tableAction('rowAbove')">
            <cb-icon name="between-horizontal-start" [size]="15" aria-hidden="true" />{{ t().above }}
          </button>
          <button type="button" class="cb-editor__tool cb-editor__tool--labeled" tabindex="-1" [attr.aria-label]="t().insertRowBelow" (mousedown)="hold($event)" (click)="tableAction('rowBelow')">
            <cb-icon name="between-horizontal-end" [size]="15" aria-hidden="true" />{{ t().below }}
          </button>
          <button type="button" class="cb-editor__tool cb-editor__tool--labeled cb-editor__tool--danger" tabindex="-1" [attr.aria-label]="t().deleteRow" (mousedown)="hold($event)" (click)="tableAction('deleteRow')">
            <cb-icon name="trash" [size]="15" aria-hidden="true" />{{ t().tableDelete }}
          </button>
        </div>
        <span class="cb-editor__sep" aria-hidden="true"></span>
        <div class="cb-editor__group" role="group" [attr.aria-label]="t().tableColumn">
          <span class="cb-editor__group-label" aria-hidden="true">{{ t().tableColumn }}</span>
          <button type="button" class="cb-editor__tool cb-editor__tool--labeled" tabindex="-1" [attr.aria-label]="t().insertColumnLeft" (mousedown)="hold($event)" (click)="tableAction('colLeft')">
            <cb-icon name="between-vertical-start" [size]="15" aria-hidden="true" />{{ t().toLeft }}
          </button>
          <button type="button" class="cb-editor__tool cb-editor__tool--labeled" tabindex="-1" [attr.aria-label]="t().insertColumnRight" (mousedown)="hold($event)" (click)="tableAction('colRight')">
            <cb-icon name="between-vertical-end" [size]="15" aria-hidden="true" />{{ t().toRight }}
          </button>
          <button type="button" class="cb-editor__tool cb-editor__tool--labeled cb-editor__tool--danger" tabindex="-1" [attr.aria-label]="t().deleteColumn" (mousedown)="hold($event)" (click)="tableAction('deleteCol')">
            <cb-icon name="trash" [size]="15" aria-hidden="true" />{{ t().tableDelete }}
          </button>
        </div>
        <span class="cb-editor__sep" aria-hidden="true"></span>
        <button
          type="button"
          class="cb-editor__tool cb-editor__tool--labeled"
          tabindex="-1"
          [class.cb-is-active]="tableHasHeader()"
          [attr.aria-pressed]="tableHasHeader()"
          [attr.aria-label]="t().tableHeaderRow"
          (mousedown)="hold($event)"
          (click)="tableAction('header')"
        >
          <cb-icon name="panel-top" [size]="15" aria-hidden="true" />{{ t().tableHeaderRow }}
        </button>
        <span class="cb-editor__sep" aria-hidden="true"></span>
        <select class="cb-editor__select" tabindex="-1" [attr.aria-label]="t().tableBorders" (change)="setTableBorders($any($event.target).value, null)">
          <option value="all" [selected]="tableBorders().borders === 'all'">{{ t().bordersAll }}</option>
          <option value="horizontal" [selected]="tableBorders().borders === 'horizontal'">{{ t().bordersHorizontal }}</option>
          <option value="none" [selected]="tableBorders().borders === 'none'">{{ t().bordersNone }}</option>
        </select>
        <select
          class="cb-editor__select"
          tabindex="-1"
          [attr.aria-label]="t().borderColor"
          [disabled]="tableBorders().borders === 'none'"
          (change)="setTableBorders(null, $any($event.target).value)"
        >
          @for (color of borderColors; track color.value) {
            <option [value]="color.value" [selected]="tableBorders().color === color.value">{{ color.label(t()) }}</option>
          }
        </select>
        <span class="cb-editor__sep" aria-hidden="true"></span>
        <button type="button" class="cb-editor__tool cb-editor__tool--labeled cb-editor__tool--danger" tabindex="-1" [attr.aria-label]="t().deleteTable" (mousedown)="hold($event)" (click)="tableAction('deleteTable')">
          <cb-icon name="trash" [size]="15" aria-hidden="true" />{{ t().deleteTable }}
        </button>
      </div>
    }

    @if (selectedImage() && !readonly() && !sourceMode()) {
      <div class="cb-editor__context" role="toolbar" [attr.aria-label]="t().imageTools" (keydown)="onContextKeydown($event)">
        @for (option of imageAligns; track option.icon; let first = $first) {
          <button
            type="button"
            class="cb-editor__tool"
            [class.cb-is-active]="imageState().align === option.align"
            [attr.aria-pressed]="imageState().align === option.align"
            [attr.aria-label]="option.label(t())"
            [attr.title]="option.label(t())"
            [tabindex]="first ? 0 : -1"
            (mousedown)="hold($event)"
            (click)="setImageAlign(option.align)"
          >
            <cb-icon [name]="option.icon" [size]="16" aria-hidden="true" />
          </button>
        }
        <span class="cb-editor__sep" aria-hidden="true"></span>
        @for (width of imageWidths; track width) {
          <button
            type="button"
            class="cb-editor__tool cb-editor__tool--text"
            [class.cb-is-active]="imageState().width === width"
            [attr.aria-pressed]="imageState().width === width"
            [attr.aria-label]="imageWidthLabel(width)"
            [tabindex]="-1"
            (mousedown)="hold($event)"
            (click)="setImageWidth(width)"
          >{{ width }}</button>
        }
        <button
          type="button"
          class="cb-editor__tool"
          [class.cb-is-active]="!imageState().width"
          [attr.aria-pressed]="!imageState().width"
          [attr.aria-label]="t().imageOriginalSize"
          [attr.title]="t().imageOriginalSize"
          [tabindex]="-1"
          (mousedown)="hold($event)"
          (click)="setImageWidth(null)"
        >
          <cb-icon name="ratio" [size]="16" aria-hidden="true" />
        </button>
        <span class="cb-editor__sep" aria-hidden="true"></span>
        <button type="button" class="cb-editor__tool cb-editor__tool--labeled" [attr.aria-label]="t().cropImage" [tabindex]="-1" (click)="openCrop()">
          <cb-icon name="crop" [size]="15" aria-hidden="true" />{{ t().cropImage }}
        </button>
        <button type="button" class="cb-editor__tool" [attr.aria-label]="t().altText" [attr.title]="t().altText" [tabindex]="-1" (click)="openAlt()">
          <cb-icon name="captions" [size]="16" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="cb-editor__tool cb-editor__tool--danger"
          [attr.aria-label]="t().deleteImage"
          [attr.title]="t().deleteImage"
          [tabindex]="-1"
          (mousedown)="hold($event)"
          (click)="deleteImage()"
        >
          <cb-icon name="trash" [size]="16" aria-hidden="true" />
        </button>
      </div>
    }

    @if (tablePanel()) {
      <div class="cb-editor__link cb-editor__picker-panel" role="group" [attr.aria-label]="t().insertTable" (keydown.escape)="closeTablePanel()">
        <div class="cb-editor__picker" (mouseleave)="pickerHover.set(null)">
          @for (r of pickerRows; track r) {
            <div class="cb-editor__picker-row">
              @for (c of pickerCols; track c) {
                <button
                  type="button"
                  class="cb-editor__picker-cell"
                  [class.cb-is-on]="pickerOn(r, c)"
                  [attr.aria-label]="tableSizeLabel(r, c)"
                  [tabindex]="r === pickerFocus().r && c === pickerFocus().c ? 0 : -1"
                  (mouseenter)="pickerHover.set({ r, c })"
                  (focus)="pickerHover.set({ r, c }); pickerFocus.set({ r, c })"
                  (keydown)="onPickerKeydown($event, r, c)"
                  (click)="insertTable(r, c)"
                ></button>
              }
            </div>
          }
        </div>
        <div class="cb-editor__picker-side">
          <span class="cb-editor__picker-size" aria-live="polite">{{ pickerHover() ? tableSizeLabel(pickerHover()!.r, pickerHover()!.c) : t().insertTable }}</span>
          <label class="cb-editor__link-check">
            <input type="checkbox" [checked]="tableHeader()" (change)="tableHeader.set($any($event.target).checked)" />
            {{ t().tableHeaderRow }}
          </label>
          <button type="button" class="cb-editor__btn" (click)="closeTablePanel()">{{ t().cancel }}</button>
        </div>
      </div>
    }

    @if (crop(); as c) {
      <div class="cb-editor__crop" role="group" [attr.aria-label]="t().cropImage" (keydown.escape)="closeCrop()">
        <div class="cb-editor__crop-stage" #cropStage>
          <img class="cb-editor__crop-img" [src]="c.src" alt="" draggable="false" />
          <div
            class="cb-editor__crop-box"
            role="slider"
            tabindex="0"
            [attr.aria-label]="t().cropArea"
            [attr.aria-valuetext]="cropValueText()"
            [attr.aria-describedby]="cropHelpId"
            [style.left.%]="c.rect.x * 100"
            [style.top.%]="c.rect.y * 100"
            [style.width.%]="c.rect.w * 100"
            [style.height.%]="c.rect.h * 100"
            (pointerdown)="startCropDrag($event, null)"
            (keydown)="onCropKeydown($event)"
          >
            @for (corner of cropCorners; track corner) {
              <span class="cb-editor__crop-handle" [class]="'cb-editor__crop-handle cb-editor__crop-handle--' + corner" (pointerdown)="startCropDrag($event, corner)"></span>
            }
          </div>
        </div>
        <p class="cb-editor__crop-help" [id]="cropHelpId">{{ t().cropInstructions }}</p>
        <div class="cb-editor__link-actions">
          @for (ratio of cropRatios; track ratio.label) {
            <button
              type="button"
              class="cb-editor__btn"
              [class.cb-is-active]="c.ratio === ratio.value"
              [attr.aria-pressed]="c.ratio === ratio.value"
              (click)="setCropRatio(ratio.value)"
            >{{ ratio.value === null ? t().cropFree : ratio.label }}</button>
          }
          <span class="cb-editor__crop-spacer"></span>
          <button type="button" class="cb-editor__btn cb-editor__btn--primary" [disabled]="c.busy" (click)="applyCrop()">{{ t().cropImage }}</button>
          <button type="button" class="cb-editor__btn" (click)="closeCrop()">{{ t().cancel }}</button>
        </div>
        @if (c.error) {
          <p class="cb-editor__error" role="alert">{{ t().cropError }}</p>
        }
      </div>
    }

    @if (altPanel()) {
      <form class="cb-editor__link" role="group" [attr.aria-label]="t().altText" (submit)="applyAlt($event)" (keydown.escape)="closeAlt()">
        <label class="cb-editor__link-field">
          <span class="cb-editor__link-label">{{ t().altText }}</span>
          <input #altInput class="cb-editor__link-input" type="text" [value]="selectedImage()?.getAttribute('alt') ?? ''" />
        </label>
        <div class="cb-editor__link-actions">
          <button type="submit" class="cb-editor__btn cb-editor__btn--primary">{{ t().accept }}</button>
          <button type="button" class="cb-editor__btn" (click)="closeAlt()">{{ t().cancel }}</button>
        </div>
      </form>
    }

    @if (linkPanel(); as panel) {
      <form class="cb-editor__link" role="group" [attr.aria-label]="t().insertLink" (submit)="applyLink($event)" (keydown.escape)="closeLink()">
        <label class="cb-editor__link-field">
          <span class="cb-editor__link-label">{{ t().linkUrl }}</span>
          <input
            #linkInput
            class="cb-editor__link-input"
            type="text"
            inputmode="url"
            autocomplete="off"
            [value]="panel.url"
            [attr.aria-invalid]="linkError() ? 'true' : null"
            [attr.aria-describedby]="linkError() ? linkErrorId : null"
            (input)="linkUrl.set($any($event.target).value)"
          />
        </label>
        <label class="cb-editor__link-check">
          <input type="checkbox" [checked]="panel.newTab" (change)="linkNewTab.set($any($event.target).checked)" />
          {{ t().openInNewTab }}
        </label>
        <div class="cb-editor__link-actions">
          <button type="submit" class="cb-editor__btn cb-editor__btn--primary">{{ t().accept }}</button>
          @if (panel.editing) {
            <button type="button" class="cb-editor__btn" (click)="removeLink()">
              <cb-icon name="unlink" [size]="14" aria-hidden="true" />
              {{ t().removeLink }}
            </button>
          }
          <button type="button" class="cb-editor__btn" (click)="closeLink()">{{ t().cancel }}</button>
        </div>
        @if (linkError()) {
          <p class="cb-editor__error" [id]="linkErrorId" role="alert">{{ t().invalidUrl }}</p>
        }
      </form>
    }

    <div #body class="cb-editor__body">
    <div
      #surface
      class="cb-editor__surface"
      [id]="surfaceId"
      role="textbox"
      [hidden]="sourceMode()"
      [class.cb-is-empty]="isEmpty()"
      [attr.aria-label]="ariaLabel() ?? t().textEditor"
      [attr.aria-disabled]="isDisabled() || null"
      [attr.aria-readonly]="readonly() || null"
      [attr.aria-invalid]="invalidState() ? 'true' : null"
      [attr.aria-required]="fieldState.required() || null"
      [attr.aria-describedby]="describedBy()"
      aria-multiline="true"
      [attr.contenteditable]="!isDisabled() && !readonly()"
      [attr.data-placeholder]="readonly() ? '' : (placeholder() ?? t().editorPlaceholder)"
      [style.minHeight]="readonly() ? null : height()"
      (input)="onSurfaceInput($event)"
      (beforeinput)="onBeforeInput($event)"
      (keydown)="onSurfaceKeydown($event)"
      (paste)="onPaste($event)"
      (drop)="onDrop($event)"
      (click)="onSurfaceClick($event)"
      (scroll)="refreshFrame()"
      (blur)="onBlur()"
    ></div>
    @if (imageFrame(); as frame) {
      <div
        class="cb-editor__img-frame"
        aria-hidden="true"
        [style.left.px]="frame.left"
        [style.top.px]="frame.top"
        [style.width.px]="frame.width"
        [style.height.px]="frame.height"
      >
        <span class="cb-editor__img-handle" [attr.title]="t().imageResize" (pointerdown)="startResize($event)"></span>
      </div>
    }
    </div>

    @if (sourceMode()) {
      <textarea
        class="cb-editor__source"
        spellcheck="false"
        [attr.aria-label]="t().sourceCode"
        [style.minHeight]="height()"
        [value]="sourceText()"
        (input)="sourceText.set($any($event.target).value)"
        (blur)="onBlur()"
      ></textarea>
    }

    @if (message() || maxLength()) {
      <div class="cb-editor__footer">
        @if (message()) {
          <p class="cb-editor__error" role="alert">{{ message() }}</p>
        }
        @if (maxLength()) {
          <span class="cb-editor__count" [id]="countId" [class.cb-is-over]="length() > maxLength()!">
            {{ countText() }}
          </span>
        }
      </div>
    }

    <input #imageInput type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden (change)="onImageFile($event)" />
  `,
  styleUrl: './editor.component.css',
})
export class CbEditor implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  readonly placeholder = input<string | undefined>(undefined);
  /** Nombre accesible del área de texto. Por defecto, "Editor de texto" del idioma activo. */
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly height = input<string>('180px');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Muestra el contenido (saneado) sin barra ni edición. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Marca visual y ARIA de estado inválido (también se activa con Angular Forms). */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** Herramientas de la barra y su orden (`'|'` separa grupos). */
  readonly toolbar = input<readonly CbEditorTool[]>(CB_EDITOR_DEFAULT_TOOLBAR);
  /** Máximo de caracteres de texto (sin contar las etiquetas). Muestra un contador. */
  readonly maxLength = input<number | undefined, unknown>(undefined, {
    transform: (v: unknown) => (v === undefined || v === null || v === '' ? undefined : numberAttribute(v)),
  });
  /** Permite imágenes (botón, pegar y soltar). */
  readonly images = input(true, { transform: booleanAttribute });
  /**
   * Sube la imagen y devuelve su URL; así el HTML guarda una URL y no la imagen.
   * Sin él, la imagen se inserta como data URL si no supera `maxImageSize`.
   */
  readonly imageUpload = input<CbEditorImageUpload | undefined>(undefined);
  /** Tamaño máximo (bytes) de una imagen insertada como data URL. Por defecto 1 MB. */
  readonly maxImageSize = input(1_048_576, { transform: numberAttribute });
  /** Pega siempre como texto plano (sin formato). */
  readonly pastePlainText = input(false, { transform: booleanAttribute });

  /** HTML del contenido (saneado y normalizado; `''` si está vacío). */
  readonly value = model<string>('');
  /** Una imagen no se pudo insertar (tipo, tamaño o error de subida). */
  readonly imageError = output<CbEditorImageError>();

  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid(), required: () => this.required() });

  protected readonly surfaceId = `cb-editor-${++nextId}`;
  protected readonly countId = `${this.surfaceId}-count`;
  protected readonly linkErrorId = `${this.surfaceId}-link-error`;

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly state = signal<EditorState>(EMPTY_STATE);
  protected readonly sourceMode = signal(false);
  protected readonly sourceText = signal('');
  protected readonly message = signal('');
  protected readonly length = signal(0);
  protected readonly linkPanel = signal<{ url: string; newTab: boolean; editing: boolean } | null>(null);
  protected readonly linkUrl = signal('');
  protected readonly linkNewTab = signal(false);
  protected readonly linkError = signal(false);

  protected readonly isEmpty = computed(() => !this.value());
  protected readonly invalidState = computed(() => this.fieldState.invalid() || (!!this.maxLength() && this.length() > this.maxLength()!));
  protected readonly countText = computed(() => cbFormat(this.t().characterCount, this.length(), this.maxLength() ?? 0));
  protected readonly describedBy = computed(() => (this.maxLength() ? this.countId : null));
  protected readonly toolbarItems = computed(() =>
    this.toolbar().filter((tool) => tool !== 'image' || this.images()),
  );

  private readonly surfaceRef = viewChild<ElementRef<HTMLElement>>('surface');
  private readonly imageInputRef = viewChild<ElementRef<HTMLInputElement>>('imageInput');
  private readonly toolbarRef = viewChild<ElementRef<HTMLElement>>('toolbar');
  private readonly linkInputRef = viewChild<ElementRef<HTMLInputElement>>('linkInput');
  private readonly bodyRef = viewChild<ElementRef<HTMLElement>>('body');
  private readonly tableRowsRef = viewChild<ElementRef<HTMLInputElement>>('tableRows');
  private readonly tableColsRef = viewChild<ElementRef<HTMLInputElement>>('tableCols');
  private readonly tableHeaderRef = viewChild<ElementRef<HTMLInputElement>>('tableHeader');
  private readonly altInputRef = viewChild<ElementRef<HTMLInputElement>>('altInput');
  private savedRange: Range | null = null;
  private editingLink: HTMLAnchorElement | null = null;

  /** Celda de tabla donde está el cursor (muestra la barra de tabla). */
  protected readonly tableCell = signal<HTMLTableCellElement | null>(null);
  protected readonly tableHasHeader = computed(() => !!this.tableCell()?.closest('table')?.tHead?.rows.length);
  protected readonly tablePanel = signal(false);
  protected readonly tableHeader = signal(true);
  protected readonly pickerRows = [1, 2, 3, 4, 5, 6, 7, 8];
  protected readonly pickerCols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  protected readonly pickerHover = signal<{ r: number; c: number } | null>(null);
  protected readonly pickerFocus = signal({ r: 1, c: 1 });
  /** Se incrementa al cambiar los bordes (viven en el DOM de las celdas). */
  private readonly tableTick = signal(0);
  protected readonly tableBorders = computed(() => {
    this.tableTick();
    return readCellBorders(this.tableCell()?.getAttribute('style') ?? '');
  });
  protected readonly borderColors: { value: string; label: (t: CbTranslation) => string }[] = [
    { value: '#d0d5dd', label: (t) => t.colorGray },
    { value: '#344054', label: (t) => t.colorDark },
    { value: '#10b981', label: (t) => t.colorGreen },
    { value: '#2563eb', label: (t) => t.colorBlue },
  ];

  protected readonly crop = signal<{ src: string; rect: CbCropRect; ratio: number | null; natural: { w: number; h: number }; busy: boolean; error: boolean } | null>(null);
  protected readonly cropRatios: { label: string; value: number | null }[] = [
    { label: 'free', value: null },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
  ];
  protected readonly cropCorners = ['nw', 'ne', 'sw', 'se'] as const;
  protected readonly cropHelpId = `${this.surfaceId}-crop-help`;
  private readonly cropStageRef = viewChild<ElementRef<HTMLElement>>('cropStage');
  protected readonly cropValueText = computed(() => {
    const c = this.crop();
    if (!c) return '';
    const pct = (n: number) => `${Math.round(n * 100)} %`;
    return `${pct(c.rect.w)} × ${pct(c.rect.h)}`;
  });
  /** Imagen seleccionada con un clic (muestra su barra y el tirador de tamaño). */
  protected readonly selectedImage = signal<HTMLImageElement | null>(null);
  /** Se incrementa al cambiar la imagen seleccionada (su estilo vive en el DOM, no en una señal). */
  private readonly imageTick = signal(0);
  protected readonly imageState = computed(() => {
    this.imageTick();
    return readImageStyle(this.selectedImage()?.getAttribute('style') ?? '');
  });
  protected readonly imageFrame = signal<{ left: number; top: number; width: number; height: number } | null>(null);
  protected readonly altPanel = signal(false);
  private resizing: { x: number; width: number; max: number; align: CbImageAlign | null } | null = null;

  protected readonly imageWidths = IMAGE_WIDTHS;
  protected readonly imageAligns: { align: CbImageAlign | null; icon: string; label: (t: CbTranslation) => string }[] = [
    { align: null, icon: 'type', label: (t) => t.imageInline },
    { align: 'left', icon: 'align-start-vertical', label: (t) => t.imageAlignLeft },
    { align: 'center', icon: 'align-center-horizontal', label: (t) => t.imageAlignCenter },
    { align: 'right', icon: 'align-end-vertical', label: (t) => t.imageAlignRight },
  ];
  /** Último HTML emitido o cargado: evita reescribir el DOM (y mover el cursor) con su propio valor. */
  private lastHtml: string | null = null;

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    const registry = inject(CbIconRegistry);
    for (const [name, body] of Object.entries(EDITOR_ICONS)) {
      if (!registry.has(name)) registry.register({ [name]: body });
    }
    // Barra de herramientas con un solo tabindex activo (patrón WAI-ARIA *toolbar*).
    afterNextRender(() => this.setActiveTool(this.tools()[0]));
    // Valor que llega de fuera: se sanea antes de pintarlo.
    effect(() => {
      const val = this.value() ?? '';
      const el = this.surfaceRef()?.nativeElement;
      if (!el || val === this.lastHtml) return;
      const clean = cbSanitizeHtml(val, { images: untracked(this.images) });
      el.innerHTML = clean;
      this.lastHtml = val;
      untracked(() => this.length.set(this.textLength(el)));
    });
    // El estado de la barra sigue a la selección.
    const onSelection = () => this.updateState();
    // El marco de la imagen seleccionada sigue a la imagen si cambia el tamaño de la ventana.
    const onResize = () => this.refreshFrame();
    this.document.addEventListener('selectionchange', onSelection);
    this.document.defaultView?.addEventListener('resize', onResize);
    inject(DestroyRef).onDestroy(() => {
      this.document.removeEventListener('selectionchange', onSelection);
      this.document.defaultView?.removeEventListener('resize', onResize);
    });
  }

  writeValue(val: string | null | undefined): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // --- Barra -------------------------------------------------------------------------
  private tools(): HTMLElement[] {
    const bar = this.toolbarRef()?.nativeElement;
    return bar ? Array.from(bar.querySelectorAll<HTMLElement>('select, button')) : [];
  }

  /** Deja solo `active` en el orden de tabulación de la barra. */
  protected setActiveTool(active: HTMLElement | undefined): void {
    if (!active) return;
    for (const tool of this.tools()) tool.tabIndex = tool === active ? 0 : -1;
  }

  /** Flechas, Inicio y Fin mueven el foco entre las herramientas (de forma circular). */
  protected onToolbarKeydown(event: KeyboardEvent): void {
    const tools = this.tools();
    const cur = tools.indexOf(event.target as HTMLElement);
    if (cur < 0) return;
    const last = tools.length - 1;
    const target =
      event.key === 'ArrowRight' ? (cur < last ? cur + 1 : 0)
      : event.key === 'ArrowLeft' ? (cur > 0 ? cur - 1 : last)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : -1;
    if (target < 0) return;
    event.preventDefault();
    tools[target].focus();
  }

  protected toolIcon(tool: CbEditorTool): string {
    return TOOLS[tool as keyof typeof TOOLS].icon;
  }

  protected toolLabel(tool: CbEditorTool): string {
    return TOOLS[tool as keyof typeof TOOLS].label(this.t());
  }

  protected pressable(tool: CbEditorTool): boolean {
    return !!TOOLS[tool as keyof typeof TOOLS]?.state || tool === 'source';
  }

  protected isActive(tool: CbEditorTool): boolean {
    if (tool === 'source') return this.sourceMode();
    const key = TOOLS[tool as keyof typeof TOOLS]?.state;
    return key ? !!this.state()[key] : false;
  }

  /** Evita que el botón robe la selección del área editable. */
  protected hold(event: MouseEvent): void {
    event.preventDefault();
  }

  protected run(tool: CbEditorTool): void {
    switch (tool) {
      case 'bold': return this.exec('bold');
      case 'italic': return this.exec('italic');
      case 'underline': return this.exec('underline');
      case 'strike': return this.exec('strikeThrough');
      case 'code': return this.toggleCode();
      case 'bulletList': return this.exec('insertUnorderedList');
      case 'orderedList': return this.exec('insertOrderedList');
      case 'quote': return this.format(this.state().quote ? 'P' : 'BLOCKQUOTE');
      case 'codeBlock': return this.format(this.state().codeBlock ? 'P' : 'PRE');
      case 'table': return this.openTablePanel();
      case 'alignLeft': return this.exec('justifyLeft');
      case 'alignCenter': return this.exec('justifyCenter');
      case 'alignRight': return this.exec('justifyRight');
      case 'link': return this.openLink();
      case 'image': return this.pickImage();
      case 'horizontalRule': return this.exec('insertHorizontalRule');
      case 'clear': return this.clearFormat();
      case 'undo': return this.exec('undo');
      case 'redo': return this.exec('redo');
      case 'source': return this.toggleSource();
    }
  }

  // --- Comandos ----------------------------------------------------------------------
  exec(command: string, value?: string): void {
    if (this.isDisabled() || this.readonly()) return;
    const el = this.surfaceRef()?.nativeElement;
    // Solo si no lo tiene: enfocar de nuevo puede mover el cursor al principio.
    if (el && this.document.activeElement !== el) el.focus();
    // execCommand sigue siendo la vía con deshacer nativo en contenteditable; el
    // resultado se normaliza al emitir, así el HTML no depende del navegador.
    if (typeof this.document.execCommand === 'function') {
      this.document.execCommand('styleWithCSS', false, 'false');
      this.document.execCommand(command, false, value);
    }
    this.emit();
    this.updateState();
  }

  /** Aplica un bloque (encabezado, párrafo o cita). */
  protected format(tag: string): void {
    this.exec('formatBlock', `<${tag.toLowerCase()}>`);
  }

  /** Quita el formato en línea y vuelve el bloque a párrafo. */
  protected clearFormat(): void {
    this.exec('removeFormat');
    this.exec('unlink');
    if (this.state().block !== 'P') this.format('P');
  }

  /** Envuelve la selección en `<code>` o la saca de él. */
  private toggleCode(): void {
    const el = this.surfaceRef()?.nativeElement;
    const sel = this.document.getSelection();
    if (!el || !sel?.rangeCount) return;
    const current = this.closest(sel.anchorNode, 'CODE');
    if (current) {
      current.replaceWith(...Array.from(current.childNodes));
      this.emit();
      this.updateState();
      return;
    }
    const range = sel.getRangeAt(0);
    if (range.collapsed || !el.contains(range.commonAncestorContainer)) return;
    this.exec('insertHTML', `<code>${escapeHtml(range.toString())}</code>`);
  }

  // --- Enlaces -----------------------------------------------------------------------
  /** Abre el panel de enlace (Ctrl + K); si el cursor está en un enlace, lo edita. */
  protected openLink(): void {
    if (this.isDisabled() || this.readonly()) return;
    this.saveSelection();
    const sel = this.document.getSelection();
    this.editingLink = (this.closest(sel?.anchorNode ?? null, 'A') as HTMLAnchorElement | null) ?? null;
    const url = this.editingLink?.getAttribute('href') ?? '';
    const newTab = this.editingLink?.getAttribute('target') === '_blank';
    this.linkUrl.set(url);
    this.linkNewTab.set(newTab);
    this.linkError.set(false);
    this.linkPanel.set({ url, newTab, editing: !!this.editingLink });
    afterNextRender(() => this.linkInputRef()?.nativeElement.focus(), { injector: this.injector });
  }

  protected closeLink(): void {
    this.linkPanel.set(null);
    this.editingLink = null;
    this.restoreSelection();
  }

  protected applyLink(event: Event): void {
    event.preventDefault();
    let url = this.linkUrl().trim();
    // "www.banco.com" o "banco.com" se completan con https://.
    if (url && !/^[a-z][a-z0-9+.-]*:/i.test(url) && !/^[#/.]/.test(url)) url = /@/.test(url) && !/\//.test(url) ? `mailto:${url}` : `https://${url}`;
    if (!isSafeUrl(url)) {
      this.linkError.set(true);
      this.linkInputRef()?.nativeElement.focus();
      return;
    }
    const newTab = this.linkNewTab();
    const anchor = this.editingLink;
    this.linkPanel.set(null);
    this.editingLink = null;
    this.restoreSelection();
    if (anchor) {
      setLinkAttrs(anchor, url, newTab);
      this.emit();
      return;
    }
    const sel = this.document.getSelection();
    const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
    const target = newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    if (!range || range.collapsed) {
      this.exec('insertHTML', `<a href="${escapeAttr(url)}"${target}>${escapeHtml(url)}</a>`);
    } else {
      this.exec('insertHTML', `<a href="${escapeAttr(url)}"${target}>${escapeHtml(range.toString())}</a>`);
    }
  }

  protected removeLink(): void {
    const anchor = this.editingLink;
    this.linkPanel.set(null);
    this.editingLink = null;
    if (anchor) anchor.replaceWith(...Array.from(anchor.childNodes));
    this.restoreSelection();
    this.emit();
    this.updateState();
  }

  // --- Imágenes ----------------------------------------------------------------------
  /** Abre el selector de archivos guardando la posición del cursor. */
  protected pickImage(): void {
    if (this.isDisabled() || this.readonly() || !this.images()) return;
    this.saveSelection();
    this.imageInputRef()?.nativeElement.click();
  }

  protected onImageFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) void this.insertImage(file);
  }

  /** Sube (o lee) la imagen y la inserta donde estaba el cursor. */
  async insertImage(file: File): Promise<void> {
    this.message.set('');
    if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.type)) {
      this.imageError.emit({ file, reason: 'type' });
      return;
    }
    const upload = this.imageUpload();
    let src: string;
    try {
      if (upload) {
        src = await upload(file);
      } else {
        if (file.size > this.maxImageSize()) {
          this.message.set(cbFormat(this.t().imageTooLarge, formatBytes(this.maxImageSize())));
          this.imageError.emit({ file, reason: 'size' });
          return;
        }
        src = await readAsDataUrl(file);
      }
    } catch (error) {
      this.message.set(this.t().imageUploadError);
      this.imageError.emit({ file, reason: 'upload', error });
      return;
    }
    this.surfaceRef()?.nativeElement.focus();
    this.restoreSelection();
    const alt = escapeAttr(file.name.replace(/\.[^.]+$/, ''));
    this.exec('insertHTML', `<img src="${escapeAttr(src)}" alt="${alt}">`);
  }

  // --- Pegar y soltar ----------------------------------------------------------------
  protected onPaste(event: ClipboardEvent): void {
    const data = event.clipboardData;
    if (!data || this.isDisabled() || this.readonly()) return;
    event.preventDefault();
    const file = this.images() ? Array.from(data.files ?? []).find((f) => f.type.startsWith('image/')) : undefined;
    if (file) {
      void this.insertImage(file);
      return;
    }
    // Dentro de un bloque de código se pega como texto (sin romper el bloque).
    const sel = this.document.getSelection();
    if (sel?.anchorNode && this.closest(sel.anchorNode, 'PRE')) {
      this.insertClipboard('', data.getData('text/plain'));
      return;
    }
    let language: string | undefined;
    try {
      language = JSON.parse(data.getData('vscode-editor-data') || '{}')?.mode;
    } catch {
      language = undefined;
    }
    this.insertClipboard(data.getData('text/html'), data.getData('text/plain'), language);
  }

  protected onDrop(event: DragEvent): void {
    const data = event.dataTransfer;
    if (!data || this.isDisabled() || this.readonly()) return;
    const file = Array.from(data.files ?? []).find((f) => f.type.startsWith('image/'));
    if (file && this.images()) {
      event.preventDefault();
      void this.insertImage(file);
      return;
    }
    const html = data.getData('text/html');
    if (html) {
      event.preventDefault();
      this.insertClipboard(html, data.getData('text/plain'));
    }
  }

  /** Inserta lo pegado: HTML saneado o texto plano, recortado si supera `maxLength`. */
  private insertClipboard(html: string, text: string, language?: string): void {
    const remaining = this.remaining();
    const plain = this.pastePlainText() || !html;
    let clean = plain ? '' : cbSanitizeHtml(html, { images: this.images() });
    // Código de VS Code: se anota el lenguaje en el bloque.
    if (clean && language && /^[\w+#.-]{1,30}$/.test(language)) clean = clean.replace(/^<pre(?![^>]*data-language)/, `<pre data-language="${language}"`);
    const cleanText = plain ? text : cbHtmlToText(clean);
    if (remaining !== null && cleanText.length > remaining) {
      // Si no cabe, se pega como texto hasta el límite.
      this.exec('insertText', cleanText.slice(0, Math.max(0, remaining)));
      return;
    }
    if (plain) this.exec('insertText', text);
    else if (clean) this.exec('insertHTML', clean);
  }

  // --- Escritura ---------------------------------------------------------------------
  /** Impide escribir más allá de `maxLength`. */
  protected onBeforeInput(event: InputEvent): void {
    const remaining = this.remaining();
    if (remaining === null || !event.inputType.startsWith('insert') || event.inputType === 'insertFromPaste') return;
    const sel = this.document.getSelection();
    const replacing = !!sel && !sel.isCollapsed;
    const adds = event.inputType === 'insertParagraph' || event.inputType === 'insertLineBreak' ? 0 : (event.data?.length ?? 1);
    if (!replacing && adds > remaining) event.preventDefault();
  }

  protected onSurfaceInput(event?: Event): void {
    if (event instanceof InputEvent && event.inputType === 'insertText' && event.data === ' ') this.autoformat();
    this.emit();
  }

  /** Atajos de teclado: Ctrl + K enlace; Ctrl + Mayús + 7 / 8 listas; Ctrl + Alt + 0–3 bloques. */
  protected onSurfaceKeydown(event: KeyboardEvent): void {
    if (this.selectedImage() && !['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) this.deselectImage();
    if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const sel = this.document.getSelection();
      const cell = sel?.anchorNode ? ((this.closest(sel.anchorNode, 'TD') ?? this.closest(sel.anchorNode, 'TH')) as HTMLTableCellElement | null) : null;
      if (cell) {
        event.preventDefault();
        this.moveCell(cell, event.shiftKey ? -1 : 1);
        return;
      }
      if (sel?.anchorNode && this.closest(sel.anchorNode, 'PRE') && !event.shiftKey) {
        event.preventDefault();
        this.exec('insertText', '  ');
        return;
      }
    }
    const mod = event.ctrlKey || event.metaKey;
    if (!mod) return;
    const key = event.key.toLowerCase();
    let handled = true;
    if (key === 'k' && !event.shiftKey && !event.altKey) this.openLink();
    else if (event.shiftKey && (event.code === 'Digit7' || key === '7' || key === '/')) this.exec('insertOrderedList');
    else if (event.shiftKey && (event.code === 'Digit8' || key === '8' || key === '(')) this.exec('insertUnorderedList');
    else if (event.altKey && /^Digit[0-3]$/.test(event.code)) this.format(event.code === 'Digit0' ? 'P' : `H${event.code.slice(5)}`);
    else handled = false;
    if (handled) event.preventDefault();
  }

  /**
   * Formato al escribir (como Markdown): al pulsar espacio tras `#`, `##`, `###`,
   * `*`, `-`, `1.` o `>` al inicio de un párrafo, se convierte el bloque.
   */
  private autoformat(): void {
    const el = this.surfaceRef()?.nativeElement;
    const sel = this.document.getSelection();
    if (!el || !sel?.rangeCount || !sel.isCollapsed) return;
    const block = this.closestBlock(sel.anchorNode);
    if (!block || (block.tagName !== 'P' && block.tagName !== 'DIV' && block !== el)) return;
    const range = sel.getRangeAt(0);
    const before = this.document.createRange();
    before.setStart(block, 0);
    before.setEnd(range.endContainer, range.endOffset);
    const prefix = before.toString().replace(/ /g, ' ');
    const commands: Record<string, () => void> = {
      '# ': () => this.format('H1'),
      '## ': () => this.format('H2'),
      '### ': () => this.format('H3'),
      '* ': () => this.exec('insertUnorderedList'),
      '- ': () => this.exec('insertUnorderedList'),
      '1. ': () => this.exec('insertOrderedList'),
      '> ': () => this.format('BLOCKQUOTE'),
    };
    const run = commands[prefix];
    if (!run) return;
    before.deleteContents();
    run();
  }

  // --- Tablas ------------------------------------------------------------------------
  protected openTablePanel(): void {
    if (this.isDisabled() || this.readonly()) return;
    this.saveSelection();
    this.pickerHover.set(null);
    this.pickerFocus.set({ r: 3, c: 3 });
    this.tablePanel.set(true);
    afterNextRender(
      () => this.document.querySelector<HTMLButtonElement>(`#${this.surfaceId}`)?.closest('.cb-editor')?.querySelector<HTMLButtonElement>('.cb-editor__picker-cell[tabindex="0"]')?.focus(),
      { injector: this.injector },
    );
  }

  protected closeTablePanel(): void {
    this.tablePanel.set(false);
    this.restoreSelection();
  }

  protected pickerOn(r: number, c: number): boolean {
    const hover = this.pickerHover();
    return !!hover && r <= hover.r && c <= hover.c;
  }

  protected tableSizeLabel(r: number, c: number): string {
    return cbFormat(this.t().tableSize, r, c);
  }

  /** Flechas en la cuadrícula de tamaño; Enter inserta. */
  protected onPickerKeydown(event: KeyboardEvent, r: number, c: number): void {
    const moves: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const next = { r: Math.min(this.pickerRows.length, Math.max(1, r + move[0])), c: Math.min(this.pickerCols.length, Math.max(1, c + move[1])) };
    this.pickerFocus.set(next);
    this.pickerHover.set(next);
    const panel = (event.target as HTMLElement).closest('.cb-editor__picker');
    afterNextRender(() => panel?.querySelector<HTMLButtonElement>('.cb-editor__picker-cell[tabindex="0"]')?.focus(), { injector: this.injector });
  }

  /** Inserta una tabla de filas × columnas con bordes grises (se ven igual fuera del editor). */
  insertTable(rows: number, cols: number): void {
    const header = this.tableHeader();
    this.tablePanel.set(false);
    this.restoreSelection();
    const cell = (tag: string) => `<${tag}${tag === 'th' ? ' scope="col"' : ''} style="border: 1px solid ${DEFAULT_BORDER}"><br></${tag}>`;
    const row = (tag: string) => `<tr>${cell(tag).repeat(cols)}</tr>`;
    const head = header ? `<thead>${row('th')}</thead>` : '';
    const body = `<tbody>${row('td').repeat(header ? Math.max(1, rows - 1) : rows)}</tbody>`;
    this.exec('insertHTML', `<table style="border-collapse: collapse; width: 100%">${head}${body}</table><p><br></p>`);
  }

  /** Bordes de toda la tabla: todos, solo horizontales o ninguno; y su color. */
  setTableBorders(borders: CbTableBorders | null, color: string | null): void {
    const table = this.tableCell()?.closest('table');
    if (!table) return;
    const current = this.tableBorders();
    const mode = borders ?? current.borders;
    const tone = color ?? current.color ?? DEFAULT_BORDER;
    if (!table.style.borderCollapse) table.setAttribute('style', 'border-collapse: collapse; width: 100%');
    for (const cell of Array.from(table.querySelectorAll<HTMLTableCellElement>('th, td'))) {
      const css = withCellBorders(cell.getAttribute('style') ?? '', mode, tone);
      if (css) cell.setAttribute('style', css);
      else cell.removeAttribute('style');
    }
    this.tableTick.update((n) => n + 1);
    this.emit();
  }

  /** Acciones de la barra de tabla sobre la celda actual. */
  protected tableAction(id: string): void {
    const cell = this.tableCell();
    const table = cell?.closest('table');
    if (!cell || !table) return;
    const row = cell.parentElement as HTMLTableRowElement;
    const index = cell.cellIndex;
    const newCell = (tag: string, like: Element | null = cell) => {
      const c = this.document.createElement(tag);
      if (tag === 'th') c.setAttribute('scope', 'col');
      const style = like?.getAttribute('style');
      // Misma apariencia (bordes, fondo) que su vecina; sin su alineación.
      if (style) c.setAttribute('style', withCellBorders(style, readCellBorders(style).borders, readCellBorders(style).color ?? DEFAULT_BORDER));
      c.innerHTML = '<br>';
      return c;
    };
    let focus: HTMLTableCellElement | null = cell;
    switch (id) {
      case 'rowAbove':
      case 'rowBelow': {
        const tr = this.document.createElement('tr');
        for (let i = 0; i < row.cells.length; i++) tr.append(newCell('td', row.cells[i]));
        if (row.parentElement?.tagName === 'THEAD') {
          // Las filas nuevas van al cuerpo: el encabezado tiene una sola fila.
          const body = table.tBodies[0] ?? table.createTBody();
          body.insertBefore(tr, body.firstChild);
        } else if (id === 'rowAbove') row.before(tr);
        else row.after(tr);
        focus = tr.cells[Math.min(index, tr.cells.length - 1)];
        break;
      }
      case 'colLeft':
      case 'colRight':
        for (const r of Array.from(table.rows)) {
          const ref = r.cells[Math.min(index, r.cells.length - 1)];
          const c = newCell(r.parentElement?.tagName === 'THEAD' ? 'th' : 'td', ref ?? null);
          if (!ref) r.append(c);
          else if (id === 'colLeft') ref.before(c);
          else ref.after(c);
          if (r === row) focus = c as HTMLTableCellElement;
        }
        break;
      case 'header': {
        const head = table.tHead;
        if (head?.rows.length) {
          // Quitar encabezado: su fila pasa al cuerpo con celdas normales.
          const body = table.tBodies[0] ?? table.createTBody();
          for (const r of Array.from(head.rows).reverse()) {
            for (const th of Array.from(r.cells)) th.replaceWith(retag(th, 'td', this.document));
            body.insertBefore(r, body.firstChild);
          }
          head.remove();
        } else {
          const first = table.tBodies[0]?.rows[0];
          if (!first) break;
          const thead = table.createTHead();
          for (const td of Array.from(first.cells)) {
            const th = retag(td, 'th', this.document);
            th.setAttribute('scope', 'col');
            td.replaceWith(th);
          }
          thead.append(first);
        }
        focus = table.rows[row.rowIndex >= 0 ? row.rowIndex : 0]?.cells[index] ?? null;
        break;
      }
      case 'deleteRow': {
        const next = (row.nextElementSibling ?? row.previousElementSibling) as HTMLTableRowElement | null;
        row.remove();
        if (!table.rows.length) return this.deleteTable(table);
        focus = next?.cells[Math.min(index, next.cells.length - 1)] ?? table.rows[0].cells[0];
        break;
      }
      case 'deleteCol':
        for (const r of Array.from(table.rows)) {
          r.cells[Math.min(index, r.cells.length - 1)]?.remove();
          if (!r.cells.length) r.remove();
        }
        if (!table.rows.length || !table.rows[0].cells.length) return this.deleteTable(table);
        focus = row.cells[Math.min(index, row.cells.length - 1)] ?? null;
        break;
      case 'deleteTable':
        return this.deleteTable(table);
    }
    this.tableTick.update((n) => n + 1);
    this.emit();
    if (focus) this.placeCaret(focus);
    this.updateState();
  }

  private deleteTable(table: HTMLTableElement): void {
    const after = table.nextElementSibling as HTMLElement | null;
    table.remove();
    this.tableCell.set(null);
    this.emit();
    if (after) this.placeCaret(after);
  }

  /** Tab / Mayús + Tab: celda siguiente o anterior; en la última, añade una fila. */
  private moveCell(cell: HTMLTableCellElement, step: number): void {
    const table = cell.closest('table')!;
    const cells = Array.from(table.querySelectorAll<HTMLTableCellElement>('th, td'));
    const next = cells[cells.indexOf(cell) + step];
    if (next) {
      this.placeCaret(next);
      return;
    }
    if (step > 0) {
      this.tableCell.set(cell);
      this.tableAction('rowBelow');
    }
  }

  /** Pone el cursor al inicio de un elemento. */
  private placeCaret(el: HTMLElement): void {
    const surface = this.surfaceRef()?.nativeElement;
    surface?.focus();
    const range = this.document.createRange();
    range.selectNodeContents(el);
    range.collapse(true);
    const sel = this.document.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  // --- Imagen seleccionada ----------------------------------------------------------------
  protected onSurfaceClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG' && !this.readonly() && !this.isDisabled()) {
      this.selectedImage.set(target as HTMLImageElement);
      this.imageTick.update((n) => n + 1);
      this.refreshFrame();
    } else if (this.selectedImage()) {
      this.deselectImage();
    }
  }

  private deselectImage(): void {
    this.selectedImage.set(null);
    this.imageFrame.set(null);
    this.altPanel.set(false);
    this.crop.set(null);
  }

  /** Coloca el marco y el tirador sobre la imagen seleccionada. */
  protected refreshFrame(): void {
    const img = this.selectedImage();
    const body = this.bodyRef()?.nativeElement;
    if (!img || !body || !img.isConnected) {
      this.imageFrame.set(null);
      return;
    }
    const a = img.getBoundingClientRect();
    const b = body.getBoundingClientRect();
    this.imageFrame.set({ left: a.left - b.left, top: a.top - b.top, width: a.width, height: a.height });
  }

  protected imageWidthLabel(width: string): string {
    return cbFormat(this.t().imageWidth, width);
  }

  private applyImageStyle(width: string | null, align: CbImageAlign | null): void {
    const img = this.selectedImage();
    if (!img) return;
    const css = imageStyle(width, align);
    if (css) img.setAttribute('style', css);
    else img.removeAttribute('style');
    if (width) {
      img.removeAttribute('width');
      img.removeAttribute('height');
    }
    this.imageTick.update((n) => n + 1);
    this.emit();
    afterNextRender(() => this.refreshFrame(), { injector: this.injector });
  }

  /** Alineación: en línea (`null`), izquierda o derecha (el texto la rodea) o centrada. */
  setImageAlign(align: CbImageAlign | null): void {
    this.applyImageStyle(this.imageState().width, align);
  }

  /** Ancho en % o px; `null` vuelve al tamaño original. */
  setImageWidth(width: string | null): void {
    this.applyImageStyle(width, this.imageState().align);
  }

  protected deleteImage(): void {
    const img = this.selectedImage();
    if (!img) return;
    const after = img.parentElement;
    img.remove();
    this.deselectImage();
    this.emit();
    if (after) this.placeCaret(after);
  }

  protected openAlt(): void {
    this.altPanel.set(true);
    afterNextRender(() => this.altInputRef()?.nativeElement.focus(), { injector: this.injector });
  }

  protected closeAlt(): void {
    this.altPanel.set(false);
  }

  protected applyAlt(event: Event): void {
    event.preventDefault();
    const img = this.selectedImage();
    if (img) {
      img.setAttribute('alt', this.altInputRef()?.nativeElement.value.trim() ?? '');
      this.emit();
    }
    this.altPanel.set(false);
  }

  // --- Recorte ------------------------------------------------------------------------
  protected openCrop(): void {
    const img = this.selectedImage();
    if (!img) return;
    const natural = { w: img.naturalWidth || img.width || 1, h: img.naturalHeight || img.height || 1 };
    this.altPanel.set(false);
    this.crop.set({ src: img.getAttribute('src') ?? '', rect: initialRect(null, natural.w, natural.h), ratio: null, natural, busy: false, error: false });
    afterNextRender(() => this.cropStageRef()?.nativeElement.querySelector<HTMLElement>('.cb-editor__crop-box')?.focus(), { injector: this.injector });
  }

  protected closeCrop(): void {
    this.crop.set(null);
  }

  /** Proporción fija (ancho / alto) o libre (`null`). */
  setCropRatio(ratio: number | null): void {
    this.crop.update((c) => (c ? { ...c, ratio, rect: fitRatio(c.rect, ratio, c.natural.w, c.natural.h) } : c));
  }

  /** Mueve (`corner` null) o redimensiona el recuadro arrastrando. */
  protected startCropDrag(event: PointerEvent, corner: 'nw' | 'ne' | 'sw' | 'se' | null): void {
    const stage = this.cropStageRef()?.nativeElement;
    const start = this.crop();
    if (!stage || !start) return;
    event.preventDefault();
    event.stopPropagation();
    const box = stage.getBoundingClientRect();
    const from = { x: event.clientX, y: event.clientY, rect: start.rect };
    const move = (e: PointerEvent) => {
      const dx = (e.clientX - from.x) / (box.width || 1);
      const dy = (e.clientY - from.y) / (box.height || 1);
      this.crop.update((c) => {
        if (!c) return c;
        const rect = corner
          ? resizeRect(from.rect, corner, dx, dy, c.ratio, c.natural.w, c.natural.h)
          : clampRect({ ...from.rect, x: from.rect.x + dx, y: from.rect.y + dy });
        return { ...c, rect };
      });
    };
    const up = () => {
      this.document.removeEventListener('pointermove', move);
      this.document.removeEventListener('pointerup', up);
    };
    this.document.addEventListener('pointermove', move);
    this.document.addEventListener('pointerup', up);
  }

  /** Flechas: mover un 2 %; Mayús + flechas: cambiar el tamaño desde la esquina inferior derecha; Enter: aplicar. */
  protected onCropKeydown(event: KeyboardEvent): void {
    const step = 0.02;
    const deltas: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (event.key === 'Enter') {
      event.preventDefault();
      void this.applyCrop();
      return;
    }
    const d = deltas[event.key];
    if (!d) return;
    event.preventDefault();
    this.crop.update((c) => {
      if (!c) return c;
      const rect = event.shiftKey
        ? resizeRect(c.rect, 'se', d[0], d[1], c.ratio, c.natural.w, c.natural.h)
        : clampRect({ ...c.rect, x: c.rect.x + d[0], y: c.rect.y + d[1] });
      return { ...c, rect };
    });
  }

  /** Recorta los píxeles y sustituye la imagen (subiéndola con `imageUpload` si lo hay). */
  async applyCrop(): Promise<void> {
    const c = this.crop();
    const img = this.selectedImage();
    if (!c || !img) return;
    this.crop.set({ ...c, busy: true, error: false });
    try {
      const blob = await cropImage(c.src, c.rect, this.document);
      const ext = blob.type === 'image/jpeg' ? 'jpg' : 'png';
      const file = new File([blob], `${(img.getAttribute('alt') || 'imagen').replace(/[^\w-]+/g, '-')}-recorte.${ext}`, { type: blob.type });
      const upload = this.imageUpload();
      const src = upload ? await upload(file) : await readAsDataUrl(file);
      img.setAttribute('src', src);
      this.crop.set(null);
      this.emit();
      afterNextRender(() => this.refreshFrame(), { injector: this.injector });
    } catch (error) {
      this.crop.set({ ...c, busy: false, error: true });
      this.imageError.emit({ file: new File([], 'crop'), reason: 'upload', error });
    }
  }

  /** Arrastrar el tirador cambia el ancho (en % del área, para que se adapte a la pantalla). */
  protected startResize(event: PointerEvent): void {
    const img = this.selectedImage();
    const surface = this.surfaceRef()?.nativeElement;
    if (!img || !surface) return;
    event.preventDefault();
    this.resizing = { x: event.clientX, width: img.getBoundingClientRect().width, max: surface.clientWidth || 1, align: this.imageState().align };
    const move = (e: PointerEvent) => {
      const r = this.resizing;
      if (!r) return;
      const px = Math.min(r.max, Math.max(40, r.width + (e.clientX - r.x)));
      const css = imageStyle(`${Math.round((px / r.max) * 100)}%`, r.align);
      img.setAttribute('style', css);
      this.refreshFrame();
    };
    const up = () => {
      this.document.removeEventListener('pointermove', move);
      this.document.removeEventListener('pointerup', up);
      this.resizing = null;
      img.removeAttribute('width');
      img.removeAttribute('height');
      this.imageTick.update((n) => n + 1);
      this.emit();
    };
    this.document.addEventListener('pointermove', move);
    this.document.addEventListener('pointerup', up);
  }

  /** Flechas, Inicio y Fin en las barras de tabla e imagen (patrón *toolbar*). */
  protected onContextKeydown(event: KeyboardEvent): void {
    const bar = event.currentTarget as HTMLElement;
    // En un select, las flechas cambian la opción.
    if ((event.target as HTMLElement).tagName === 'SELECT' && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) return;
    const buttons = Array.from(bar.querySelectorAll<HTMLElement>('button, select'));
    const cur = buttons.indexOf(event.target as HTMLElement);
    if (cur < 0) return;
    const last = buttons.length - 1;
    const next =
      event.key === 'ArrowRight' ? (cur < last ? cur + 1 : 0)
      : event.key === 'ArrowLeft' ? (cur > 0 ? cur - 1 : last)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : -1;
    if (next < 0) return;
    event.preventDefault();
    buttons.forEach((b, i) => (b.tabIndex = i === next ? 0 : -1));
    buttons[next].focus();
  }

  // --- Vista de HTML -----------------------------------------------------------------
  private toggleSource(): void {
    const el = this.surfaceRef()?.nativeElement;
    if (!this.sourceMode()) {
      this.sourceText.set(formatSource(this.value()));
      this.sourceMode.set(true);
      return;
    }
    // Al volver, el HTML escrito a mano se sanea.
    const clean = cbSanitizeHtml(this.sourceText(), { images: this.images() });
    if (el) el.innerHTML = clean;
    this.sourceMode.set(false);
    this.emit();
  }

  // --- Valor ---------------------------------------------------------------------------
  /** Emite el HTML saneado sin tocar el DOM (no se pierde la posición del cursor). */
  private emit(): void {
    const el = this.surfaceRef()?.nativeElement;
    if (!el) return;
    const html = cbSanitizeHtml(el.innerHTML, { images: this.images() });
    this.length.set(this.textLength(el));
    if (html === this.value()) return;
    this.lastHtml = html;
    this.value.set(html);
    this.onChange(html);
  }

  protected onBlur(): void {
    if (this.sourceMode()) {
      // Escribir en la vista de HTML también actualiza el valor (saneado).
      const html = cbSanitizeHtml(this.sourceText(), { images: this.images() });
      if (html !== this.value()) {
        this.lastHtml = null;
        this.value.set(html);
        this.onChange(html);
      }
    }
    this.onTouched();
  }

  private textLength(el: HTMLElement): number {
    return (el.textContent ?? '').replace(/​/g, '').length;
  }

  private remaining(): number | null {
    const max = this.maxLength();
    return max ? max - this.length() : null;
  }

  // --- Selección y estado ------------------------------------------------------------
  private saveSelection(): void {
    const el = this.surfaceRef()?.nativeElement;
    const sel = this.document.getSelection();
    const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
    this.savedRange = el && range && el.contains(range.commonAncestorContainer) ? range.cloneRange() : null;
  }

  private restoreSelection(): void {
    const el = this.surfaceRef()?.nativeElement;
    el?.focus();
    if (!this.savedRange) return;
    const sel = this.document.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(this.savedRange);
    this.savedRange = null;
  }

  private closest(node: Node | null, tag: string): HTMLElement | null {
    const root = this.surfaceRef()?.nativeElement;
    let cur: Node | null = node;
    while (cur && cur !== root) {
      if (cur.nodeType === Node.ELEMENT_NODE && (cur as HTMLElement).tagName === tag) return cur as HTMLElement;
      cur = cur.parentNode;
    }
    return null;
  }

  private closestBlock(node: Node | null): HTMLElement | null {
    const root = this.surfaceRef()?.nativeElement ?? null;
    let cur: Node | null = node;
    while (cur && cur !== root) {
      if (cur.nodeType === Node.ELEMENT_NODE && /^(P|DIV|H1|H2|H3|BLOCKQUOTE|PRE|LI)$/.test((cur as HTMLElement).tagName)) return cur as HTMLElement;
      cur = cur.parentNode;
    }
    return root;
  }

  /** Lee el formato de la selección para marcar las herramientas activas. */
  private updateState(): void {
    const el = this.surfaceRef()?.nativeElement;
    const sel = this.document.getSelection();
    if (!el || !sel?.rangeCount || !el.contains(sel.anchorNode)) return;
    const query = (cmd: string) => {
      try {
        return typeof this.document.queryCommandState === 'function' && this.document.queryCommandState(cmd);
      } catch {
        return false;
      }
    };
    const block = this.closestBlock(sel.anchorNode);
    const blockTag = block && block !== el ? block.tagName : 'P';
    const align = block && block !== el ? (block.style.textAlign || '') : '';
    this.state.set({
      bold: query('bold'),
      italic: query('italic'),
      underline: query('underline'),
      strike: query('strikeThrough'),
      code: !!this.closest(sel.anchorNode, 'CODE'),
      bulletList: !!this.closest(sel.anchorNode, 'UL'),
      orderedList: !!this.closest(sel.anchorNode, 'OL'),
      quote: !!this.closest(sel.anchorNode, 'BLOCKQUOTE'),
      codeBlock: !!this.closest(sel.anchorNode, 'PRE'),
      alignLeft: query('justifyLeft'),
      alignCenter: query('justifyCenter') || align === 'center',
      alignRight: query('justifyRight') || align === 'right',
      link: !!this.closest(sel.anchorNode, 'A'),
      block: /^H[1-3]$/.test(blockTag) ? blockTag : 'P',
    });
    const cell = (this.closest(sel.anchorNode, 'TD') ?? this.closest(sel.anchorNode, 'TH')) as HTMLTableCellElement | null;
    this.tableCell.set(cell);
  }
}

function clampInt(raw: string | undefined, min: number, max: number, fallback: number): number {
  const n = Number.parseInt(raw ?? '', 10);
  return Number.isNaN(n) ? fallback : Math.min(max, Math.max(min, n));
}

/** Copia una celda con otra etiqueta (td ↔ th), conservando contenido y atributos útiles. */
function retag(cell: HTMLTableCellElement, tag: 'td' | 'th', doc: Document): HTMLTableCellElement {
  const next = doc.createElement(tag);
  for (const name of ['colspan', 'rowspan', 'style']) {
    const value = cell.getAttribute(name);
    if (value !== null) next.setAttribute(name, value);
  }
  next.append(...Array.from(cell.childNodes));
  return next;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/"/g, '&quot;');
}

function setLinkAttrs(anchor: HTMLAnchorElement, url: string, newTab: boolean): void {
  anchor.setAttribute('href', url);
  if (newTab) {
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
  } else {
    anchor.removeAttribute('target');
    anchor.removeAttribute('rel');
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes: number): string {
  return bytes >= 1_048_576 ? `${Math.round((bytes / 1_048_576) * 10) / 10} MB` : `${Math.round(bytes / 1024)} KB`;
}

/** HTML con un bloque por línea, para leerlo en la vista de código. */
function formatSource(html: string): string {
  return html.replace(/(<\/(p|h[1-3]|blockquote|pre|ul|ol|li)>|<hr>)/g, '$1\n').replace(/(<(ul|ol)[^>]*>)/g, '$1\n').trim();
}
