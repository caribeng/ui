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
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbIcon, CbIconRegistry } from '@caribeng/ui/icon';
import {
  clampRect,
  cropImage,
  fitRatio,
  initialRect,
  outputSize,
  previewStyle,
  readFileAsDataUrl,
  resizeRect,
  rotateImage,
  type CbCropOutput,
  type CbCropRect,
} from './crop-geometry';

/** Proporción que se ofrece en la barra (`value` null = libre). */
export interface CbCropRatio {
  readonly label: string;
  readonly value: number | null;
}

/** Resultado del recorte. */
export interface CbCropResult {
  readonly blob: Blob;
  readonly dataUrl: string;
  readonly rect: CbCropRect;
  readonly width: number;
  readonly height: number;
}

type Corner = 'nw' | 'ne' | 'sw' | 'se';

let nextUid = 0;

/**
 * Recortador de imagen de CaribeNG: recuadro que se mueve y redimensiona con ratón, dedo o
 * teclado, proporciones fijas o libre, forma circular para fotos de perfil, giro, vista previa
 * y selección de archivo (botón o arrastrar). Devuelve el recorte como `Blob` y data URL.
 *
 * @example
 * ```html
 * <cb-image-cropper [src]="foto" shape="circle" preview (cropped)="guardar($event.blob)" />
 * ```
 */
@Component({
  selector: 'cb-image-cropper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-image-cropper' },
  template: `
    @if (displaySrc()) {
      <div class="cb-cropper__main">
        <div class="cb-cropper__stage" #stage>
          <img
            class="cb-cropper__img"
            [src]="displaySrc()"
            alt=""
            draggable="false"
            [style.max-height]="maxHeight()"
            (load)="onLoad($event)"
            (error)="onImageError()"
          />
          @if (natural()) {
            <div
              #box
              class="cb-cropper__box"
              [class.cb-cropper__box--circle]="shape() === 'circle'"
              role="slider"
              tabindex="0"
              [attr.aria-label]="t().cropArea"
              [attr.aria-valuetext]="valueText()"
              [attr.aria-describedby]="helpId"
              [style.left.%]="current().x * 100"
              [style.top.%]="current().y * 100"
              [style.width.%]="current().w * 100"
              [style.height.%]="current().h * 100"
              (pointerdown)="startDrag($event, null)"
              (keydown)="onKeydown($event)"
            >
              <span class="cb-cropper__grid" aria-hidden="true"></span>
              @for (corner of corners; track corner) {
                <span [class]="'cb-cropper__handle cb-cropper__handle--' + corner" aria-hidden="true" (pointerdown)="startDrag($event, corner)"></span>
              }
            </div>
          }
        </div>

        @if (preview() && natural()) {
          <div class="cb-cropper__preview-wrap">
            <span class="cb-cropper__preview-label">{{ t().cropperPreview }}</span>
            <div
              class="cb-cropper__preview"
              [class.cb-cropper__preview--circle]="shape() === 'circle'"
              role="img"
              [attr.aria-label]="t().cropperPreview"
              [style]="previewCss()"
            ></div>
          </div>
        }
      </div>

      <p class="cb-cropper__help" [id]="helpId">{{ t().cropInstructions }}</p>

      <div class="cb-cropper__bar">
        @if (ratios().length && shape() !== 'circle') {
          <div class="cb-cropper__ratios" role="group" [attr.aria-label]="t().cropperRatio">
            @for (r of ratios(); track r.label) {
              <button type="button" class="cb-cropper__btn" [attr.aria-pressed]="ratio() === r.value" (click)="setRatio(r.value)">
                {{ r.value === null ? t().cropFree : r.label }}
              </button>
            }
          </div>
        }
        @if (rotatable()) {
          <button type="button" class="cb-cropper__icon-btn" [attr.aria-label]="t().cropperRotateLeft" [attr.title]="t().cropperRotateLeft" [disabled]="busy()" (click)="rotate(-1)">
            <cb-icon name="rotate-ccw" [size]="16" aria-hidden="true" />
          </button>
          <button type="button" class="cb-cropper__icon-btn" [attr.aria-label]="t().cropperRotateRight" [attr.title]="t().cropperRotateRight" [disabled]="busy()" (click)="rotate(1)">
            <cb-icon name="rotate-cw" [size]="16" aria-hidden="true" />
          </button>
        }
        <span class="cb-cropper__spacer"></span>
        @if (chooser()) {
          <button type="button" class="cb-cropper__btn" (click)="choose()">{{ t().cropperChange }}</button>
        }
        @if (showApply()) {
          <button type="button" class="cb-cropper__btn cb-cropper__btn--primary" [disabled]="busy() || !natural()" (click)="apply()">{{ t().cropImage }}</button>
        }
      </div>
    } @else {
      <div
        class="cb-cropper__empty"
        [class.cb-cropper__empty--over]="dragOver()"
        (dragover)="onDragOver($event)"
        (dragleave)="dragOver.set(false)"
        (drop)="onDrop($event)"
      >
        <cb-icon name="cb-image" [size]="32" aria-hidden="true" />
        <p>{{ emptyMessage() ?? t().cropperEmpty }}</p>
        @if (chooser()) {
          <button type="button" class="cb-cropper__btn cb-cropper__btn--primary" (click)="choose()">{{ t().cropperChoose }}</button>
        }
      </div>
    }

    @if (error(); as e) {
      <p class="cb-cropper__error" role="alert">{{ e }}</p>
    }
    <span class="cb-cropper__sr" aria-live="polite">{{ announcement() }}</span>
    <input #file type="file" class="cb-cropper__file" [accept]="accept()" tabindex="-1" aria-hidden="true" (change)="onFile($event)" />
  `,
  styleUrl: './image-cropper.component.css',
})
export class CbImageCropper {
  protected readonly t = injectCbTranslation();
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly helpId = `cb-cropper-${++nextUid}-help`;

  /** Imagen a recortar (URL o data URL). Las de otro dominio necesitan CORS para poder recortarse. */
  readonly src = input<string>('');
  /** Recuadro en fracciones de la imagen (0–1). Se inicia al cargar la imagen si no se indica. */
  readonly rect = model<CbCropRect | null>(null);
  /** Proporción ancho / alto (`null` = libre). Con `shape="circle"` siempre es 1. */
  readonly ratio = model<number | null>(null);
  /** Proporciones de la barra (vacío para ocultarla). */
  readonly ratios = input<readonly CbCropRatio[]>([
    { label: 'free', value: null },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
  ]);
  /** Recorte rectangular o circular (PNG con fondo transparente, para fotos de perfil). */
  readonly shape = input<'rect' | 'circle'>('rect');
  /** Formato, calidad y tamaño máximo del recorte. */
  readonly output = input<CbCropOutput>({});
  /** Botones de girar 90°. */
  readonly rotatable = input(true, { transform: booleanAttribute });
  /** Vista previa del recorte. */
  readonly preview = input(false, { transform: booleanAttribute });
  /** Botón para elegir otra imagen (y arrastrar archivos al área vacía). */
  readonly chooser = input(true, { transform: booleanAttribute });
  /** Botón Recortar (sin él, recorta llamando a `crop()`). */
  readonly showApply = input(true, { transform: booleanAttribute });
  readonly accept = input<string>('image/*');
  /** Alto máximo de la imagen en pantalla. */
  readonly maxHeight = input<string>('24rem');
  readonly emptyMessage = input<string | undefined>(undefined);

  /** Recorte hecho con el botón Recortar o Enter. */
  readonly cropped = output<CbCropResult>();
  /** Imagen elegida por el usuario (archivo). */
  readonly fileSelect = output<File>();
  /** No se pudo cargar o recortar la imagen. */
  readonly cropError = output<unknown>();

  protected readonly corners: readonly Corner[] = ['nw', 'ne', 'sw', 'se'];
  /** Imagen en pantalla: `src`, el archivo elegido o la imagen girada. */
  protected readonly displaySrc = signal('');
  protected readonly natural = signal<{ w: number; h: number } | null>(null);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly dragOver = signal(false);
  protected readonly announcement = signal('');

  private readonly effRatio = computed(() => (this.shape() === 'circle' ? 1 : this.ratio()));
  /** El recuadro vigente (`rect` es null hasta que carga la imagen). */
  protected readonly current = computed(() => this.rect() ?? { x: 0, y: 0, w: 1, h: 1 });
  protected readonly valueText = computed(() => {
    const r = this.current();
    const n = this.natural();
    const pct = (v: number) => `${Math.round(v * 100)} %`;
    const px = n ? outputSize(r, n.w, n.h, this.output()) : { w: 0, h: 0 };
    return cbFormat(this.t().cropperValue, pct(r.w), pct(r.h), px.w, px.h);
  });
  protected readonly previewCss = computed(() => {
    const r = this.current();
    const n = this.natural();
    const aspect = n ? (r.w * n.w) / (r.h * n.h) : 1;
    return { ...previewStyle(this.displaySrc(), r), 'aspect-ratio': String(aspect) };
  });

  private readonly stage = viewChild<ElementRef<HTMLElement>>('stage');
  private readonly box = viewChild<ElementRef<HTMLElement>>('box');
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('file');

  constructor() {
    const registry = inject(CbIconRegistry);
    for (const [name, body] of Object.entries(ICONS)) {
      if (!registry.has(name)) registry.register({ [name]: body });
    }
    effect(() => {
      const src = this.src();
      untracked(() => this.load(src, false));
    });
  }

  // --- API pública ---

  /** Recorta y devuelve el resultado (sin emitir `cropped`). */
  async crop(): Promise<CbCropResult> {
    const n = this.natural();
    const src = this.displaySrc();
    if (!n || !src) throw new Error('Sin imagen');
    const rect = this.current();
    const out = { ...this.output(), circle: this.shape() === 'circle' || this.output().circle };
    const blob = await cropImage(src, rect, this.document, out);
    const size = outputSize(rect, n.w, n.h, out);
    return { blob, dataUrl: await readFileAsDataUrl(blob), rect, width: size.w, height: size.h };
  }

  /** Abre el selector de archivos. */
  choose(): void {
    this.fileInput().nativeElement.click();
  }

  /** Proporción fija (ancho / alto) o libre (`null`). */
  setRatio(ratio: number | null): void {
    this.ratio.set(ratio);
    const n = this.natural();
    if (n) this.rect.set(fitRatio(this.current(), this.effRatio(), n.w, n.h));
  }

  // --- Eventos ---

  protected onLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    const n = { w: img.naturalWidth || img.width || 1, h: img.naturalHeight || img.height || 1 };
    this.natural.set(n);
    this.error.set('');
    const given = this.rect();
    this.rect.set(given ? fitRatio(clampRect(given), this.effRatio(), n.w, n.h) : initialRect(this.effRatio(), n.w, n.h));
  }

  protected onImageError(): void {
    this.natural.set(null);
    this.error.set(this.t().cropperLoadError);
    this.cropError.emit(new Error('No se pudo cargar la imagen'));
  }

  protected async apply(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      const result = await this.crop();
      this.cropped.emit(result);
      this.announce(this.t().cropperDone);
    } catch (e) {
      this.error.set(this.t().cropError);
      this.cropError.emit(e);
    } finally {
      this.busy.set(false);
    }
  }

  protected async rotate(turns: 1 | -1): Promise<void> {
    const src = this.displaySrc();
    if (!src || this.busy()) return;
    this.busy.set(true);
    try {
      const rotated = await rotateImage(src, turns, this.document);
      this.rect.set(null);
      this.load(rotated, true);
      this.announce(turns === 1 ? this.t().cropperRotatedRight : this.t().cropperRotatedLeft);
    } catch (e) {
      this.error.set(this.t().cropError);
      this.cropError.emit(e);
    } finally {
      this.busy.set(false);
    }
  }

  protected async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) await this.useFile(file);
  }

  protected onDragOver(event: DragEvent): void {
    if (!this.chooser()) return;
    event.preventDefault();
    this.dragOver.set(true);
  }

  protected async onDrop(event: DragEvent): Promise<void> {
    if (!this.chooser()) return;
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) await this.useFile(file);
  }

  /** Mueve (`corner` null) o redimensiona el recuadro arrastrando. */
  protected startDrag(event: PointerEvent, corner: Corner | null): void {
    const stage = this.stage()?.nativeElement;
    const n = this.natural();
    if (!stage || !n || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    event.stopPropagation();
    this.box()?.nativeElement.focus({ preventScroll: true });
    const bounds = stage.getBoundingClientRect();
    const from = { x: event.clientX, y: event.clientY, rect: this.current() };
    const move = (e: PointerEvent) => {
      const dx = (e.clientX - from.x) / (bounds.width || 1);
      const dy = (e.clientY - from.y) / (bounds.height || 1);
      this.rect.set(
        corner
          ? resizeRect(from.rect, corner, dx, dy, this.effRatio(), n.w, n.h)
          : clampRect({ ...from.rect, x: from.rect.x + dx, y: from.rect.y + dy }),
      );
    };
    const up = () => {
      this.document.removeEventListener('pointermove', move);
      this.document.removeEventListener('pointerup', up);
      this.document.removeEventListener('pointercancel', up);
    };
    this.document.addEventListener('pointermove', move);
    this.document.addEventListener('pointerup', up);
    this.document.addEventListener('pointercancel', up);
  }

  /** Flechas: mover (2 %, 10 % con Ctrl); Mayús + flechas: tamaño desde la esquina inferior derecha; Enter: recortar. */
  protected onKeydown(event: KeyboardEvent): void {
    const n = this.natural();
    if (!n) return;
    if (event.key === 'Enter' && this.showApply()) {
      event.preventDefault();
      void this.apply();
      return;
    }
    const step = event.ctrlKey || event.metaKey ? 0.1 : 0.02;
    const deltas: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const d = deltas[event.key];
    if (!d) return;
    event.preventDefault();
    const r = this.current();
    this.rect.set(
      event.shiftKey ? resizeRect(r, 'se', d[0], d[1], this.effRatio(), n.w, n.h) : clampRect({ ...r, x: r.x + d[0], y: r.y + d[1] }),
    );
  }

  // --- Internos ---

  private load(src: string, keepFocus: boolean): void {
    this.natural.set(null);
    this.error.set('');
    this.displaySrc.set(src);
    if (keepFocus) this.focusWhenReady();
  }

  private async useFile(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      this.error.set(this.t().cropperInvalidFile);
      return;
    }
    this.fileSelect.emit(file);
    this.rect.set(null);
    this.load(await readFileAsDataUrl(file), true);
  }

  /** El recuadro aparece cuando carga la imagen: entonces recibe el foco. */
  private focusWhenReady(): void {
    const stop = effect(
      () => {
        if (this.natural()) {
          untracked(() => afterNextRender(() => this.box()?.nativeElement.focus(), { injector: this.injector }));
          stop.destroy();
        }
      },
      { injector: this.injector },
    );
  }

  /** Un espacio duro alterno hace que el mismo texto cuente como cambio y se vuelva a anunciar. */
  private announce(text: string): void {
    this.announceFlip = !this.announceFlip;
    this.announcement.set(this.announceFlip ? text : `${text} `);
  }
  private announceFlip = false;
}

/** Iconos propios (Lucide `image`). `rotate-ccw` y `rotate-cw` están en el set núcleo. */
const ICONS: Record<string, string> = {
  'cb-image': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />',
};
