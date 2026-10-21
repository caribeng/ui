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
  bold,
  code,
  image,
  italic,
  link,
  list,
  listOrdered,
  minus,
  redo,
  removeFormatting,
  squareCode,
  strikethrough,
  textAlignCenter,
  textAlignEnd,
  textAlignStart,
  textQuote,
  underline,
  undo,
  unlink,
} from '@caribeng/ui/icons';
import { cbFieldState, cbFormat, injectCbTranslation, type CbTranslation } from '@caribeng/ui';
import { cbHtmlToText, cbSanitizeHtml, isSafeUrl } from './html-sanitizer';

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
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'link'
  | 'image'
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
  'bulletList', 'orderedList', 'quote', '|',
  'alignLeft', 'alignCenter', 'alignRight', '|',
  'link', 'image', 'horizontalRule', 'clear', '|',
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
  alignLeft: { icon: 'text-align-start', label: (t) => t.alignLeft, state: 'alignLeft' },
  alignCenter: { icon: 'text-align-center', label: (t) => t.alignCenter, state: 'alignCenter' },
  alignRight: { icon: 'text-align-end', label: (t) => t.alignRight, state: 'alignRight' },
  link: { icon: 'link', label: (t) => t.insertLink, state: 'link' },
  image: { icon: 'image', label: (t) => t.insertImage },
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
};

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
      (blur)="onBlur()"
    ></div>

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
  private savedRange: Range | null = null;
  private editingLink: HTMLAnchorElement | null = null;
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
    this.document.addEventListener('selectionchange', onSelection);
    inject(DestroyRef).onDestroy(() => this.document.removeEventListener('selectionchange', onSelection));
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
    el?.focus();
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
    this.insertClipboard(data.getData('text/html'), data.getData('text/plain'));
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
  private insertClipboard(html: string, text: string): void {
    const remaining = this.remaining();
    const plain = this.pastePlainText() || !html;
    const clean = plain ? '' : cbSanitizeHtml(html, { images: this.images() });
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
      alignLeft: query('justifyLeft'),
      alignCenter: query('justifyCenter') || align === 'center',
      alignRight: query('justifyRight') || align === 'right',
      link: !!this.closest(sel.anchorNode, 'A'),
      block: /^H[1-3]$/.test(blockTag) ? blockTag : 'P',
    });
  }
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
