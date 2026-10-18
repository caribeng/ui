import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';

export interface CbGalleriaItem {
  itemImageSrc: string;
  thumbnailImageSrc?: string;
  alt?: string;
  title?: string;
}

/**
 * Galleria de CaribeNG: galería de imágenes con visor principal, leyenda y
 * barra de miniaturas seleccionables.
 */
@Component({
  selector: 'cb-galleria',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-galleria' },
  template: `
    @if (activeItem(); as current) {
      <div class="cb-galleria__stage">
        <button
          type="button"
          class="cb-galleria__nav cb-galleria__nav--prev"
          aria-label="Imagen anterior"
          (click)="prev()"
        >
          <cb-icon name="chevron-left" [size]="18" aria-hidden="true" />
        </button>
        <img
          class="cb-galleria__main-img"
          [src]="current.itemImageSrc"
          [alt]="current.alt || current.title || ''"
        />
        <button
          type="button"
          class="cb-galleria__nav cb-galleria__nav--next"
          aria-label="Imagen siguiente"
          (click)="next()"
        >
          <cb-icon name="chevron-right" [size]="18" aria-hidden="true" />
        </button>
        @if (current.title) {
          <div class="cb-galleria__caption">{{ current.title }}</div>
        }
      </div>
    }
    @if (showThumbnails() && value().length > 1) {
      <div class="cb-galleria__thumbs" role="tablist">
        @for (item of value(); track item.itemImageSrc; let idx = $index) {
          <button
            type="button"
            class="cb-galleria__thumb"
            role="tab"
            [class.cb-is-active]="activeIndex() === idx"
            [attr.aria-selected]="activeIndex() === idx"
            [attr.aria-label]="item.title || ('Miniatura ' + (idx + 1))"
            (click)="activeIndex.set(idx)"
          >
            <img
              [src]="item.thumbnailImageSrc || item.itemImageSrc"
              [alt]="item.alt || item.title || ''"
            />
          </button>
        }
      </div>
    }
  `,
  styleUrl: './galleria.component.css',
})
export class CbGalleria {
  readonly value = input<CbGalleriaItem[]>([]);
  readonly showThumbnails = input<boolean>(true);
  readonly circular = input<boolean>(true);

  readonly activeIndex = model<number>(0);

  protected readonly activeItem = computed<CbGalleriaItem | null>(
    () => this.value()[this.activeIndex()] ?? this.value()[0] ?? null,
  );

  prev(): void {
    const count = this.value().length;
    if (count <= 1) return;
    const cur = this.activeIndex();
    if (cur > 0) this.activeIndex.set(cur - 1);
    else if (this.circular()) this.activeIndex.set(count - 1);
  }

  next(): void {
    const count = this.value().length;
    if (count <= 1) return;
    const cur = this.activeIndex();
    if (cur < count - 1) this.activeIndex.set(cur + 1);
    else if (this.circular()) this.activeIndex.set(0);
  }
}
