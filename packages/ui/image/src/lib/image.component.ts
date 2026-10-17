import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  signal,
} from '@angular/core';
import { CbIconComponent } from '@caribeng/ui/icon';

/**
 * Image de CaribeNG: imagen con previsualización lightbox accesible y controles
 * de zoom/rotación.
 */
@Component({
  selector: 'cb-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
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
        class="cb-image__lightbox"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="alt() || 'Previsualización de imagen'"
        (click)="closePreview()"
      >
        <div class="cb-image__toolbar" (click)="$event.stopPropagation()">
          <button type="button" class="cb-image__tool" (click)="zoomIn()" aria-label="Acercar">
            <cb-icon name="plus" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="zoomOut()" aria-label="Alejar">
            <cb-icon name="minus" [size]="18" aria-hidden="true" />
          </button>
          <button type="button" class="cb-image__tool" (click)="closePreview()" aria-label="Cerrar">
            <cb-icon name="x" [size]="18" aria-hidden="true" />
          </button>
        </div>
        <img
          class="cb-image__lightbox-img"
          [src]="src()"
          [alt]="alt()"
          [style.transform]="'scale(' + scale() + ')'"
          (click)="$event.stopPropagation()"
        />
      </div>
    }
  `,
  styleUrl: './image.component.css',
})
export class CbImageComponent {
  readonly src = input<string>('');
  readonly alt = input<string>('');
  readonly width = input<string>('');
  readonly height = input<string>('');
  readonly preview = input<boolean>(false);

  readonly lightboxOpen = signal(false);
  readonly scale = signal(1);

  openPreview(): void {
    if (!this.preview()) return;
    this.scale.set(1);
    this.lightboxOpen.set(true);
  }

  closePreview(): void {
    this.lightboxOpen.set(false);
  }

  zoomIn(): void {
    this.scale.set(Math.min(2.5, Number((this.scale() + 0.25).toFixed(2))));
  }

  zoomOut(): void {
    this.scale.set(Math.max(0.5, Number((this.scale() - 0.25).toFixed(2))));
  }
}
