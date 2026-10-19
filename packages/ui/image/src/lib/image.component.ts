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
          [attr.aria-label]="'Ampliar ' + (alt() || 'imagen')"
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
        [attr.aria-label]="alt() || 'Previsualización de imagen'"
        (click)="closePreview()"
      >
        <div class="cb-image__toolbar" (click)="$event.stopPropagation()">
          <button type="button" class="cb-image__tool" (click)="rotateLeft()" aria-label="Rotar a la izquierda">
            <cb-icon name="rotate-ccw" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="rotateRight()" aria-label="Rotar a la derecha">
            <cb-icon name="rotate-cw" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="zoomIn()" aria-label="Acercar">
            <cb-icon name="plus" [size]="18" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="cb-image__tool"
            (click)="zoomOut()"
            [disabled]="scale() <= 0.5"
            aria-label="Alejar"
          >
            <cb-icon name="minus" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="reset()" aria-label="Restablecer">
            <cb-icon name="refresh-cw" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="download()" aria-label="Descargar">
            <cb-icon name="download" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="toggleFullscreen()" aria-label="Pantalla completa">
            <cb-icon name="expand" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="closePreview()" aria-label="Cerrar">
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
  readonly src = input<string>('');
  readonly alt = input<string>('');
  readonly width = input<string>('');
  readonly height = input<string>('');
  readonly preview = input<boolean>(false);

  private readonly lightboxEl = viewChild<ElementRef<HTMLElement>>('lightbox');

  readonly lightboxOpen = signal(false);
  readonly scale = signal(1);
  readonly rotation = signal(0);

  /** Transform combinado (rotación + escala) de la imagen en el lightbox. */
  readonly transform = computed(
    () => `rotate(${this.rotation()}deg) scale(${this.scale()})`,
  );

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

  reset(): void {
    this.scale.set(1);
    this.rotation.set(0);
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
