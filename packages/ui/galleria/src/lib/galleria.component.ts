import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';

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
        @if (value().length > 1) {
          <button
            type="button"
            class="cb-galleria__nav cb-galleria__nav--prev"
            [attr.aria-label]="t().previousImage"
            [disabled]="!circular() && activeIndex() === 0"
            (click)="prev()"
          >
            <cb-icon name="chevron-left" [size]="18" aria-hidden="true" />
          </button>
        }
        <img
          class="cb-galleria__main-img"
          [src]="current.itemImageSrc"
          [alt]="current.alt || current.title || ''"
        />
        @if (value().length > 1) {
          <button
            type="button"
            class="cb-galleria__nav cb-galleria__nav--next"
            [attr.aria-label]="t().nextImage"
            [disabled]="!circular() && activeIndex() === value().length - 1"
            (click)="next()"
          >
            <cb-icon name="chevron-right" [size]="18" aria-hidden="true" />
          </button>
        }
        @if (current.title) {
          <div class="cb-galleria__caption">{{ current.title }}</div>
        }
      </div>
    }
    @if (showThumbnails() && value().length > 1) {
      <div class="cb-galleria__thumbs" role="tablist">
        @for (item of value(); track $index; let idx = $index) {
          <button
            type="button"
            class="cb-galleria__thumb"
            role="tab"
            [class.cb-is-active]="activeIndex() === idx"
            [attr.aria-selected]="activeIndex() === idx"
            [attr.tabindex]="activeIndex() === idx ? 0 : -1"
            [attr.aria-label]="item.title || item.alt || fmt(t().thumbnail, idx + 1)"
            (click)="activeIndex.set(idx)"
            (keydown)="onThumbKeydown($event)"
          >
            <img [src]="item.thumbnailImageSrc || item.itemImageSrc" alt="" />
          </button>
        }
      </div>
    }
  `,
  styleUrl: './galleria.component.css',
})
export class CbGalleria {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  readonly value = input<CbGalleriaItem[]>([]);
  readonly showThumbnails = input<boolean>(true);
  readonly circular = input<boolean>(true);

  readonly activeIndex = model<number>(0);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

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

  /** Miniaturas (patrón *tabs*): flechas, Inicio y Fin cambian de imagen y mueven el foco. */
  protected onThumbKeydown(event: KeyboardEvent): void {
    const last = this.value().length - 1;
    const cur = this.activeIndex();
    const target =
      event.key === 'ArrowRight' ? (cur < last ? cur + 1 : 0)
      : event.key === 'ArrowLeft' ? (cur > 0 ? cur - 1 : last)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : null;
    if (target === null) return;
    event.preventDefault();
    this.activeIndex.set(target);
    this.host.nativeElement.querySelectorAll<HTMLElement>('.cb-galleria__thumb')[target]?.focus();
  }
}
