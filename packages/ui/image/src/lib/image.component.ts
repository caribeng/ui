import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  signal,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';

/**
 * Image de CaribeNG: imagen con previsualización lightbox accesible y controles
 * de zoom/rotación.
 */
@Component({
  selector: 'cb-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-image',
    '[class.cb-image--preview]': 'preview()',
  },
  template: `
    <div class="cb-image__wrapper">
      <img
        class="cb-image__img"
        [src]="src()"
        [alt]="alt()"
        [style.width]="width() || null"
        [style.height]="height() || null"
      />
      @if (preview()) {
        <button
          type="button"
          class="cb-image__overlay"
          [attr.aria-label]="fmt(t().enlargeImage, alt() || t().image)"
          (click)="openPreview()"
        >
          <cb-icon name="search" [size]="20" aria-hidden="true" />
        </button>
      }
    </div>

    @if (lightboxOpen()) {
      <div
        #lightbox
        class="cb-image__lightbox"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="alt() || t().imagePreview"
        (click)="closePreview()"
      >
        <div class="cb-image__toolbar" (click)="$event.stopPropagation()">
          <button type="button" class="cb-image__tool" (click)="rotateLeft()" [attr.aria-label]="t().rotateLeft">
            <cb-icon name="rotate-ccw" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="rotateRight()" [attr.aria-label]="t().rotateRight">
            <cb-icon name="rotate-cw" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="flipHorizontal()" [attr.aria-label]="t().flipHorizontal">
            <cb-icon name="flip-horizontal" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="flipVertical()" [attr.aria-label]="t().flipVertical">
            <cb-icon name="flip-vertical" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="zoomIn()" [attr.aria-label]="t().zoomIn">
            <cb-icon name="plus" [size]="18" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="cb-image__tool"
            (click)="zoomOut()"
            [disabled]="scale() <= 0.5"
            [attr.aria-label]="t().zoomOut"
          >
            <cb-icon name="minus" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="reset()" [attr.aria-label]="t().reset">
            <cb-icon name="refresh-cw" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="download()" [attr.aria-label]="t().download">
            <cb-icon name="download" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="toggleFullscreen()" [attr.aria-label]="t().fullscreen">
            <cb-icon name="expand" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="closePreview()" [attr.aria-label]="t().close">
            <cb-icon name="x" [size]="18" aria-hidden="true" />
          </button>
        </div>
        <img
          class="cb-image__lightbox-img"
          [src]="src()"
          [alt]="alt()"
          [style.transform]="transform()"
          (click)="$event.stopPropagation()"
        />
      </div>
    }
  `,
  styleUrl: './image.component.css',
})
export class CbImage {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  readonly src = input<string>('');
  readonly alt = input<string>('');
  readonly width = input<string>('');
  readonly height = input<string>('');
  readonly preview = input<boolean>(false);

  private readonly lightboxEl = viewChild<ElementRef<HTMLElement>>('lightbox');

  readonly lightboxOpen = signal(false);
  readonly scale = signal(1);
  readonly rotation = signal(0);
  readonly flipX = signal(false);
  readonly flipY = signal(false);

  /** Transform combinado (rotación + escala + volteo) de la imagen. */
  readonly transform = computed(() => {
    const sx = this.flipX() ? -this.scale() : this.scale();
    const sy = this.flipY() ? -this.scale() : this.scale();
    return `rotate(${this.rotation()}deg) scale(${sx}, ${sy})`;
  });

  openPreview(): void {
    if (!this.preview()) return;
    this.reset();
    this.lightboxOpen.set(true);
  }

  closePreview(): void {
    this.lightboxOpen.set(false);
  }

  zoomIn(): void {
    this.scale.set(Math.min(3, Number((this.scale() + 0.25).toFixed(2))));
  }

  zoomOut(): void {
    this.scale.set(Math.max(0.5, Number((this.scale() - 0.25).toFixed(2))));
  }

  rotateLeft(): void {
    this.rotation.update((r) => r - 90);
  }

  rotateRight(): void {
    this.rotation.update((r) => r + 90);
  }

  flipHorizontal(): void {
    this.flipX.update((v) => !v);
  }

  flipVertical(): void {
    this.flipY.update((v) => !v);
  }

  reset(): void {
    this.scale.set(1);
    this.rotation.set(0);
    this.flipX.set(false);
    this.flipY.set(false);
  }

  download(): void {
    const link = document.createElement('a');
    link.href = this.src();
    link.download = this.alt() || 'image';
    link.rel = 'noopener';
    link.click();
  }

  toggleFullscreen(): void {
    const el = this.lightboxEl()?.nativeElement;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen?.();
    }
  }
}
