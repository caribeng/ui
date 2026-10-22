import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';
import { cbQrEncode, type CbQrErrorCorrection, type CbQrMatrix } from './qr-encoder';

/**
 * Código QR de CaribeNG, generado en SVG con un codificador propio (sin
 * dependencias). Elige solo la versión y la máscara; admite color, fondo,
 * margen y un logo centrado.
 *
 * @example
 * ```html
 * <cb-qrcode value="https://caribeng.dev" [size]="180" />
 * <cb-qrcode [value]="pago" errorCorrection="H" image="assets/logo.svg" />
 * ```
 */
@Component({
  selector: 'cb-qrcode',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-qrcode',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
  template: `
    @if (matrix(); as m) {
      <svg
        class="cb-qrcode__svg"
        xmlns="http://www.w3.org/2000/svg"
        [attr.viewBox]="viewBox()"
        [attr.width]="size()"
        [attr.height]="size()"
        shape-rendering="crispEdges"
        role="img"
        [attr.aria-label]="label()"
      >
        <rect [attr.width]="extent()" [attr.height]="extent()" [attr.fill]="background()" />
        <path [attr.d]="path()" [attr.fill]="color()" />
        @if (logo(); as l) {
          <rect [attr.x]="l.pad" [attr.y]="l.pad" [attr.width]="l.box" [attr.height]="l.box" [attr.fill]="background()" rx="1" />
          <image [attr.href]="image()" [attr.x]="l.pad + l.inset" [attr.y]="l.pad + l.inset" [attr.width]="l.box - 2 * l.inset" [attr.height]="l.box - 2 * l.inset" preserveAspectRatio="xMidYMid meet" />
        }
      </svg>
    }
  `,
  styleUrl: './qrcode.component.css',
})
export class CbQrcode {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();

  /** Texto o URL a codificar. */
  readonly value = input<string>('');
  /** Lado en píxeles. */
  readonly size = input<number>(160);
  /** Corrección de errores. Usa `H` si pones un logo encima. */
  readonly errorCorrection = input<CbQrErrorCorrection>('M');
  /** Color de los módulos (cualquier color CSS). */
  readonly color = input<string>('#000000');
  /** Color de fondo. Mantén buen contraste con `color` para que se pueda leer. */
  readonly background = input<string>('#ffffff');
  /** Margen claro alrededor, en módulos (el estándar pide 4). */
  readonly margin = input<number>(4);
  /** Logo centrado (URL). Ocupa ~20 % del lado; combínalo con `errorCorrection="H"`. */
  readonly image = input<string>('');
  /** Nombre accesible. Por defecto, "Código QR" del idioma activo. */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Matriz codificada, o `null` si el valor está vacío o no cabe en un QR. */
  readonly matrix = computed<CbQrMatrix | null>(() => {
    const value = this.value();
    if (!value) return null;
    try {
      return cbQrEncode(value, { errorCorrection: this.errorCorrection() });
    } catch {
      return null;
    }
  });

  protected readonly extent = computed(() => (this.matrix()?.size ?? 0) + 2 * Math.max(0, this.margin()));
  protected readonly viewBox = computed(() => `0 0 ${this.extent()} ${this.extent()}`);
  protected readonly label = computed(() => this.ariaLabel() ?? this.t().qrCode);

  /** Módulos oscuros como un único path; une los consecutivos de cada fila. */
  protected readonly path = computed(() => {
    const m = this.matrix();
    if (!m) return '';
    const offset = Math.max(0, this.margin());
    const parts: string[] = [];
    m.modules.forEach((row, y) => {
      for (let x = 0; x < m.size; x++) {
        if (!row[x]) continue;
        const start = x;
        while (x + 1 < m.size && row[x + 1]) x++;
        parts.push(`M${start + offset} ${y + offset}h${x - start + 1}v1h${-(x - start + 1)}z`);
      }
    });
    return parts.join('');
  });

  /** Caja del logo (en módulos), centrada y alineada a la rejilla. */
  protected readonly logo = computed(() => {
    const m = this.matrix();
    if (!m || !this.image()) return null;
    let box = Math.round(m.size * 0.22);
    if ((m.size - box) % 2 !== 0) box++;
    return { box, pad: Math.max(0, this.margin()) + (m.size - box) / 2, inset: 0.5 };
  });

  /** Marcado SVG del QR, p. ej. para descargarlo (`new Blob([qr.toSvg()], { type: 'image/svg+xml' })`). */
  toSvg(): string {
    const size = this.extent();
    if (!this.matrix()) return '';
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const logo = this.logo();
    const logoMarkup = logo
      ? `<rect x="${logo.pad}" y="${logo.pad}" width="${logo.box}" height="${logo.box}" fill="${esc(this.background())}" rx="1"/>` +
        `<image href="${esc(this.image())}" x="${logo.pad + logo.inset}" y="${logo.pad + logo.inset}" width="${logo.box - 2 * logo.inset}" height="${logo.box - 2 * logo.inset}" preserveAspectRatio="xMidYMid meet"/>`
      : '';
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${this.size()}" height="${this.size()}" shape-rendering="crispEdges">` +
      `<rect width="${size}" height="${size}" fill="${esc(this.background())}"/>` +
      `<path d="${this.path()}" fill="${esc(this.color())}"/>` +
      logoMarkup +
      `</svg>`
    );
  }
}
