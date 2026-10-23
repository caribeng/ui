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
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { cbFieldState, injectCbTranslation } from '@caribeng/ui';
import { CbIcon, CbIconRegistry } from '@caribeng/ui/icon';
import {
  CB_SIGNATURE_FONT,
  isSignatureEmpty,
  rasterize,
  signatureToSvg,
  strokeSegments,
  svgDataUrl,
  typedFontSize,
  type CbSignatureData,
  type CbSignatureFormat,
  type CbSignatureMode,
  type CbSignaturePoint,
  type CbSignatureStroke,
} from './signature-model';

let nextUid = 0;

/**
 * Firma digital de CaribeNG: área para firmar con ratón, dedo o lápiz (grosor según velocidad y
 * presión) o, como alternativa accesible, escribiendo el nombre en letra manuscrita. Devuelve la
 * firma como PNG, JPEG o SVG (`[(value)]`, también con Angular Forms) y permite deshacer y borrar.
 *
 * @example
 * ```html
 * <cb-signature-pad [(value)]="firma" format="png" />
 * ```
 */
@Component({
  selector: 'cb-signature-pad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CbSignaturePad), multi: true }],
  host: {
    class: 'cb-signature-pad',
    '[class.cb-is-disabled]': 'isDisabled()',
    '[class.cb-is-invalid]': 'fieldState.invalid()',
  },
  template: `
    <div class="cb-sig__bar">
      @if (typing()) {
        <div class="cb-sig__modes" role="group" [attr.aria-label]="t().signatureModes">
          <button type="button" class="cb-sig__mode" [attr.aria-pressed]="mode() === 'draw'" [disabled]="isDisabled() || readonly()" (click)="setMode('draw')">
            <cb-icon name="pencil" [size]="15" aria-hidden="true" />
            {{ t().signatureDraw }}
          </button>
          <button type="button" class="cb-sig__mode" [attr.aria-pressed]="mode() === 'type'" [disabled]="isDisabled() || readonly()" (click)="setMode('type')">
            <cb-icon name="cb-type" [size]="15" aria-hidden="true" />
            {{ t().signatureType }}
          </button>
        </div>
      }
      <span class="cb-sig__spacer"></span>
      @if (!readonly()) {
        @if (mode() === 'draw') {
          <button
            type="button"
            class="cb-sig__tool"
            [attr.aria-label]="t().signatureUndo"
            [attr.title]="t().signatureUndo"
            [disabled]="isDisabled() || !strokes().length"
            (click)="undo()"
          >
            <cb-icon name="cb-undo" [size]="16" aria-hidden="true" />
          </button>
        }
        <button type="button" class="cb-sig__tool" [attr.aria-label]="t().signatureClear" [attr.title]="t().signatureClear" [disabled]="isDisabled() || empty()" (click)="clear()">
          <cb-icon name="trash" [size]="16" aria-hidden="true" />
        </button>
      }
    </div>

    <div class="cb-sig__pad" [style.height]="height()" [style.background]="background() === 'transparent' ? null : background()">
      <svg
        #svg
        class="cb-sig__svg"
        [class.cb-sig__svg--draw]="canDraw()"
        [attr.viewBox]="'0 0 ' + box().w + ' ' + box().h"
        preserveAspectRatio="none"
        role="img"
        [attr.aria-label]="padLabel()"
        [attr.aria-describedby]="hintId"
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="onPointerUp($event)"
        (pointercancel)="onPointerUp($event)"
        (lostpointercapture)="onPointerUp($event)"
      >
        @if (image()) {
          <image [attr.href]="image()" [attr.width]="box().w" [attr.height]="box().h" preserveAspectRatio="xMidYMid meet" />
        }
        @if (mode() === 'type') {
          @if (text().trim()) {
            <text
              [attr.x]="box().w / 2"
              [attr.y]="box().h * 0.62"
              text-anchor="middle"
              [attr.font-family]="font()"
              [attr.font-size]="fontSize()"
              [attr.fill]="penColor()"
            >{{ text().trim() }}</text>
          }
        } @else {
          <g fill="none" [attr.stroke]="penColor()" stroke-linecap="round" stroke-linejoin="round">
            @for (seg of segments(); track $index) {
              <path [attr.d]="seg.d" [attr.stroke-width]="seg.width" />
            }
          </g>
        }
      </svg>
      <span class="cb-sig__line" aria-hidden="true"><span class="cb-sig__x">×</span></span>
      @if (empty() && mode() === 'draw') {
        <span class="cb-sig__placeholder" aria-hidden="true">{{ placeholder() ?? t().signaturePlaceholder }}</span>
      }
    </div>

    @if (mode() === 'type') {
      <label class="cb-sig__type">
        <span class="cb-sig__type-label">{{ t().signatureTypeLabel }}</span>
        <input
          #typeInput
          type="text"
          class="cb-sig__input"
          autocomplete="name"
          [value]="text()"
          [disabled]="isDisabled()"
          [readOnly]="readonly()"
          [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
          [attr.aria-required]="fieldState.required() || null"
          (input)="onType($event)"
          (blur)="onTouched()"
        />
      </label>
    }

    <span class="cb-sig__sr" [id]="hintId">{{ typing() ? t().signatureHint : t().signatureHintDraw }}</span>
    <span class="cb-sig__sr" aria-live="polite">{{ announcement() }}</span>
  `,
  styleUrl: './signature-pad.component.css',
})
export class CbSignaturePad implements ControlValueAccessor {
  protected readonly t = injectCbTranslation();
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly hintId = `cb-signature-${++nextUid}-hint`;

  /** Firma como data URL en `format` (`''` si está vacía). Una firma que llega de fuera se muestra de fondo. */
  readonly value = model<string>('');
  /** Formato de `value`: PNG (por defecto), JPEG (fondo blanco) o SVG. */
  readonly format = input<CbSignatureFormat>('png');
  /** Dibujar a mano o escribir el nombre. */
  readonly mode = model<CbSignatureMode>('draw');
  /** Ofrece el modo escrito, la alternativa para quien no puede dibujar (teclado, lector de pantalla). */
  readonly typing = input(true, { transform: booleanAttribute });
  readonly penColor = input<string>('#1e293b');
  /** Fondo del área y de la imagen exportada (`transparent` para PNG o SVG sin fondo). */
  readonly background = input<string>('#ffffff');
  /** Grosor mínimo y máximo del trazo (en píxeles del área). */
  readonly minWidth = input(1, { transform: numberAttribute });
  readonly maxWidth = input(3.2, { transform: numberAttribute });
  readonly height = input<string>('11rem');
  /** Tipografía del nombre escrito (por defecto, manuscritas del sistema). */
  readonly font = input<string>(CB_SIGNATURE_FONT);
  readonly placeholder = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Nombre del área (por defecto, "Área de firma"). */
  readonly ariaLabel = input<string>('');

  /** Empieza un trazo. */
  readonly signStart = output<void>();
  /** Termina un trazo o cambia el nombre escrito (con la firma completa). */
  readonly signEnd = output<CbSignatureData>();
  readonly cleared = output<void>();

  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });
  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected readonly strokes = signal<readonly CbSignatureStroke[]>([]);
  private readonly current = signal<readonly CbSignaturePoint[]>([]);
  protected readonly text = signal('');
  /** Firma previa (de `value`), pintada de fondo. */
  protected readonly image = signal('');
  /** Tamaño lógico del lienzo (el del área al montarse). */
  protected readonly box = signal({ w: 600, h: 200 });
  protected readonly announcement = signal('');

  protected readonly canDraw = computed(() => this.mode() === 'draw' && !this.isDisabled() && !this.readonly());
  protected readonly segments = computed(() => {
    const min = this.minWidth();
    const max = this.maxWidth();
    return [...this.strokes(), this.current()].flatMap((s) => strokeSegments(s, min, max));
  });
  /** Tamaño medido para que el nombre quepa (cada tipografía manuscrita tiene su ancho). */
  private readonly fittedSize = signal<number | null>(null);
  protected readonly fontSize = computed(() => this.fittedSize() ?? typedFontSize(this.text(), this.box().w, this.box().h));
  protected readonly empty = computed(() => isSignatureEmpty(this.data()) && !this.image());
  protected readonly padLabel = computed(() => {
    const t = this.t();
    return `${this.ariaLabel() || t.signaturePad}: ${this.empty() ? t.signatureEmptyState : t.signatureSignedState}`;
  });

  private readonly svg = viewChild<ElementRef<SVGSVGElement>>('svg');
  private pointerId: number | null = null;
  private lastEmitted = '';
  private emitToken = 0;
  private onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    const registry = inject(CbIconRegistry);
    for (const [name, body] of Object.entries(ICONS)) {
      if (!registry.has(name)) registry.register({ [name]: body });
    }
    // El lienzo toma el tamaño del área (mientras está vacío, también si cambia).
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    afterNextRender(() => {
      const measure = () => {
        const el = this.svg()?.nativeElement;
        if (!el || !untracked(this.empty)) return;
        const { width, height } = el.getBoundingClientRect();
        if (width > 0 && height > 0) this.box.set({ w: Math.round(width), h: Math.round(height) });
      };
      measure();
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(measure);
        ro.observe(host.nativeElement);
        this.destroyRef.onDestroy(() => ro.disconnect());
      }
    });
    // Valor que llega de fuera (no el que emitimos): se muestra como firma previa.
    effect(() => {
      const value = this.value() ?? '';
      untracked(() => {
        if (value === this.lastEmitted) return;
        this.lastEmitted = value;
        this.strokes.set([]);
        this.current.set([]);
        this.text.set('');
        this.image.set(value);
      });
    });
  }


  // --- API pública ---

  /** La firma actual (trazos o nombre escrito), para guardarla y restaurarla con `setData`. */
  data(): CbSignatureData {
    const { w, h } = this.box();
    return this.mode() === 'type'
      ? { width: w, height: h, strokes: [], text: this.text(), color: this.penColor() }
      : { width: w, height: h, strokes: this.strokes(), color: this.penColor() };
  }

  /** Restaura una firma guardada con `data()`. */
  setData(data: CbSignatureData): void {
    this.box.set({ w: data.width, h: data.height });
    this.image.set('');
    if (data.text !== undefined) {
      this.mode.set('type');
      this.text.set(data.text);
      this.strokes.set([]);
    } else {
      this.mode.set('draw');
      this.strokes.set(data.strokes);
      this.text.set('');
    }
    this.emit();
  }

  /** La firma como SVG independiente. */
  toSvg(): string {
    return signatureToSvg(this.data(), {
      minWidth: this.minWidth(),
      maxWidth: this.maxWidth(),
      background: this.background(),
      font: this.font(),
      fontSize: this.mode() === 'type' ? this.fontSize() : undefined,
      image: this.image() || undefined,
    });
  }

  /** La firma como data URL (PNG y JPEG se generan en un canvas, de forma asíncrona). */
  async toDataUrl(format: CbSignatureFormat = this.format()): Promise<string> {
    if (this.empty()) return '';
    const svg = this.toSvg();
    if (format === 'svg') return svgDataUrl(svg);
    const { w, h } = this.box();
    return rasterize(svg, w, h, format);
  }

  /** Borra la firma. */
  clear(): void {
    if (this.empty()) return;
    this.strokes.set([]);
    this.current.set([]);
    this.text.set('');
    this.image.set('');
    this.emit();
    this.cleared.emit();
    this.announce(this.t().signatureCleared);
  }

  /** Deshace el último trazo. */
  undo(): void {
    if (!this.strokes().length) return;
    this.strokes.update((s) => s.slice(0, -1));
    this.emit();
    this.announce(this.t().signatureUndone);
  }

  // --- ControlValueAccessor ---

  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }

  // --- Eventos ---

  protected setMode(mode: CbSignatureMode): void {
    if (mode === this.mode()) return;
    this.mode.set(mode);
    this.emit();
    if (mode === 'type') {
      afterNextRender(() => this.svg()?.nativeElement.closest('.cb-signature-pad')?.querySelector<HTMLInputElement>('.cb-sig__input')?.focus(), {
        injector: this.injector,
      });
    }
  }

  protected onType(event: Event): void {
    this.text.set((event.target as HTMLInputElement).value);
    this.image.set('');
    this.fittedSize.set(null);
    // Tras pintar, se mide el texto y se reduce si no cabe; después se emite con ese tamaño.
    afterNextRender(
      () => {
        this.fitText();
        this.emit();
        this.signEnd.emit(this.data());
      },
      { injector: this.injector },
    );
  }

  private fitText(): void {
    const text = this.svg()?.nativeElement.querySelector('text');
    const width = text && typeof text.getComputedTextLength === 'function' ? text.getComputedTextLength() : 0;
    const max = this.box().w * 0.9;
    if (width > max) this.fittedSize.set(Math.floor(this.fontSize() * (max / width)));
  }

  protected onPointerDown(event: PointerEvent): void {
    if (!this.canDraw() || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    this.pointerId = event.pointerId;
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    this.current.set([this.point(event)]);
    this.signStart.emit();
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) return;
    const events = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [];
    const list = events.length ? events : [event];
    const pts = [...this.current()];
    for (const e of list) {
      const p = this.point(e);
      const last = pts[pts.length - 1];
      // Puntos casi encima del anterior solo añaden ruido.
      if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 0.75) pts.push(p);
    }
    this.current.set(pts);
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) return;
    this.pointerId = null;
    const stroke = this.current();
    this.current.set([]);
    if (!stroke.length) return;
    const wasEmpty = this.empty();
    this.strokes.update((s) => [...s, stroke]);
    this.emit();
    this.onTouched();
    this.signEnd.emit(this.data());
    if (wasEmpty) this.announce(this.t().signatureSignedState);
  }

  // --- Internos ---

  private point(event: PointerEvent): CbSignaturePoint {
    const rect = (this.svg()?.nativeElement ?? (event.currentTarget as Element)).getBoundingClientRect();
    const { w, h } = this.box();
    // Sin tamaño (área oculta o sin maquetar) se usan las coordenadas tal cual.
    const x = rect.width ? ((event.clientX - rect.left) / rect.width) * w : event.clientX;
    const y = rect.height ? ((event.clientY - rect.top) / rect.height) * h : event.clientY;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, t: Math.round(event.timeStamp), p: event.pressure ?? 0.5 };
  }

  /** Recalcula `value` (PNG y JPEG llegan cuando termina el canvas; uno viejo se descarta). */
  private emit(): void {
    const token = ++this.emitToken;
    const publish = (url: string) => {
      if (token !== this.emitToken) return;
      this.lastEmitted = url;
      this.value.set(url);
      this.onChange(url);
    };
    if (this.empty()) {
      publish('');
      return;
    }
    if (this.format() === 'svg') {
      publish(svgDataUrl(this.toSvg()));
      return;
    }
    this.toDataUrl().then(publish, () => publish(svgDataUrl(this.toSvg())));
  }

  /** Un espacio duro alterno hace que el mismo texto cuente como cambio y se vuelva a anunciar. */
  private announce(text: string): void {
    this.announceFlip = !this.announceFlip;
    this.announcement.set(this.announceFlip ? text : `${text} `);
  }
  private announceFlip = false;
}

/** Iconos propios (Lucide `undo-2` y `type`). */
const ICONS: Record<string, string> = {
  'cb-undo': '<path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />',
  'cb-type': '<path d="M12 4v16" /><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" /><path d="M9 20h6" />',
};
