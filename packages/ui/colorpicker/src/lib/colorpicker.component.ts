import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { OverlayModule, type ConnectedPosition } from '@angular/cdk/overlay';
import { cbFieldState, type CbSize, injectCbTranslation } from '@caribeng/ui';

let nextUid = 0;

const DEFAULT_PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b',
  '#000000', '#ffffff',
];

/**
 * Selector de color de CaribeNG. Área saturación/valor + barra de matiz + hex,
 * sobre CDK Overlay. Integrado con Angular Forms vía `ControlValueAccessor`;
 * el modelo es un color hex (`#rrggbb`).
 *
 * @example
 * ```html
 * <cb-colorpicker formControlName="color" />
 * ```
 */
@Component({
  selector: 'cb-colorpicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [OverlayModule],
  host: { class: 'cb-colorpicker-host' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbColorPicker),
      multi: true,
    },
  ],
  template: `
    <button
      #trigger
      type="button"
      class="cb-colorpicker__trigger"
      [class]="'cb-colorpicker__trigger--' + size()"
      [class.cb-is-open]="open()"
      [class.cb-is-invalid]="fieldState.invalid()"
      [class.cb-is-disabled]="isDisabled()"
      [disabled]="isDisabled()"
      [attr.aria-haspopup]="'dialog'"
      [attr.aria-expanded]="open()"
      [attr.aria-label]="(ariaLabel() || t().color) + ': ' + value()"
      (click)="toggle()"
    >
      <span class="cb-colorpicker__swatch" [style.background-color]="value()"></span>
      @if (showValue()) {
        <span class="cb-colorpicker__value">{{ value() }}</span>
      }
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayHasBackdrop]="false"
      (overlayOutsideClick)="close()"
      (overlayKeydown)="onOverlayKeydown($event)"
      (detach)="close()"
    >
      <div class="cb-colorpicker__panel" role="dialog" [attr.aria-label]="ariaLabel() || t().colorPicker">
        <div
          #sv
          class="cb-colorpicker__sv"
          [style.background-color]="hueColor()"
          (pointerdown)="onSvPointerDown($event)"
        >
          <div class="cb-colorpicker__sv-white"></div>
          <div class="cb-colorpicker__sv-black"></div>
          <div
            class="cb-colorpicker__sv-pointer"
            [style.left.%]="s()"
            [style.top.%]="100 - v()"
            [style.background-color]="value()"
          ></div>
        </div>

        <div class="cb-colorpicker__controls">
          <div
            #hue
            class="cb-colorpicker__hue"
            (pointerdown)="onHuePointerDown($event)"
          >
            <div class="cb-colorpicker__hue-pointer" [style.left.%]="(h() / 360) * 100"></div>
          </div>
          <span class="cb-colorpicker__preview" [style.background-color]="value()"></span>
        </div>

        <div class="cb-colorpicker__fields">
          <input
            class="cb-colorpicker__hex"
            type="text"
            spellcheck="false"
            autocomplete="off"
            [attr.aria-label]="t().hexColor"
            [value]="value()"
            (change)="onHexInput($event)"
          />
        </div>

        @if (presets().length) {
          <div class="cb-colorpicker__presets">
            @for (p of presets(); track p) {
              <button
                type="button"
                class="cb-colorpicker__preset"
                [class.cb-is-active]="sameColor(p)"
                [style.background-color]="p"
                [attr.aria-label]="p"
                (click)="pickPreset(p)"
              ></button>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
  styleUrl: './colorpicker.component.css',
})
export class CbColorPicker implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Color seleccionado (hex `#rrggbb`). Two-way opcional fuera de Forms. */
  readonly value = model<string>('#10b981');

  readonly size = input<CbSize>('md');
  /** Muestra el texto del hex junto al swatch del trigger. */
  readonly showValue = input<boolean, unknown>(true, { transform: toBoolean });
  /** Colores predefinidos; `[]` los oculta. */
  readonly presets = input<readonly string[]>(DEFAULT_PRESETS);
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  readonly ariaLabel = input<string>('');
  readonly inputId = input<string>(`cb-colorpicker-${++nextUid}`);

  protected readonly open = signal(false);
  protected readonly h = signal(160);
  protected readonly s = signal(84);
  protected readonly v = signal(71);

  private readonly svRef = viewChild<ElementRef<HTMLElement>>('sv');
  private readonly hueRef = viewChild<ElementRef<HTMLElement>>('hue');
  private readonly triggerRef = viewChild.required<ElementRef<HTMLElement>>('trigger');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  protected readonly hueColor = computed(() => hsvToHex(this.h(), 100, 100));

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
  ];

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: string | null): void {
    // Preserva el hex EXACTO recibido; solo deriva H/S/V para posicionar la UI.
    this.setColor(value ?? '', false);
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // --- Apertura --------------------------------------------------------------
  protected toggle(): void {
    if (this.isDisabled()) return;
    this.open() ? this.close() : this.open.set(true);
  }
  protected close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.onTouched();
    queueMicrotask(() => this.triggerRef().nativeElement.focus());
  }
  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  // --- Área saturación/valor -------------------------------------------------
  protected onSvPointerDown(event: PointerEvent): void {
    this.drag(event, this.svRef(), (ratioX, ratioY) => {
      this.s.set(Math.round(ratioX * 100));
      this.v.set(Math.round((1 - ratioY) * 100));
      this.commitFromHsv();
    });
  }

  // --- Barra de matiz --------------------------------------------------------
  protected onHuePointerDown(event: PointerEvent): void {
    this.drag(event, this.hueRef(), (ratioX) => {
      this.h.set(Math.round(ratioX * 360));
      this.commitFromHsv();
    });
  }

  private drag(
    event: PointerEvent,
    ref: ElementRef<HTMLElement> | undefined,
    apply: (ratioX: number, ratioY: number) => void,
  ): void {
    if (!ref) return;
    event.preventDefault();
    const el = ref.nativeElement;
    const update = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      apply(
        Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
        Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
      );
    };
    update(event.clientX, event.clientY);
    const move = (e: PointerEvent) => update(e.clientX, e.clientY);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  // --- Hex / presets ---------------------------------------------------------
  protected onHexInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!this.setColor(input.value, true)) {
      input.value = this.value(); // revierte si no es un hex válido
    }
  }

  protected pickPreset(hex: string): void {
    this.setColor(hex, true);
  }

  protected sameColor(hex: string): boolean {
    return normalizeHex(hex) === this.value().toLowerCase();
  }

  /**
   * Fija el color desde un hex EXACTO (hex input, preset, writeValue): deriva
   * H/S/V para la UI y conserva el hex tal cual. Devuelve si era válido.
   */
  private setColor(hex: string, emit: boolean): boolean {
    const rgb = hexToRgb(hex);
    if (!rgb) return false;
    const { h, s, v } = rgbToHsv(rgb.r, rgb.g, rgb.b);
    this.h.set(h);
    this.s.set(s);
    this.v.set(v);
    const normalized = normalizeHex(hex);
    this.value.set(normalized);
    if (emit) this.onChange(normalized);
    return true;
  }

  /** Commit desde el área/matiz: el hex es derivado de H/S/V (no hay exacto). */
  private commitFromHsv(): void {
    const hex = hsvToHex(this.h(), this.s(), this.v());
    this.value.set(hex);
    this.onChange(hex);
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}

// --- Conversión de color (puras) ---------------------------------------------
function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function normalizeHex(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  return m ? `#${m[1].toLowerCase()}` : hex;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = (((g - b) / d) % 6 + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(max ? (d / max) * 100 : 0), v: Math.round(max * 100) };
}
