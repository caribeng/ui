import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';

export interface CbCarouselItem {
  title: string;
  description?: string;
  image?: string;
  badge?: string;
}

/**
 * Carousel de CaribeNG: carrusel accesible de tarjetas o diapositivas con
 * controles anterior/siguiente, indicadores y soporte circular.
 */
@Component({
  selector: 'cb-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-carousel',
    role: 'region',
    'aria-roledescription': 'carousel',
    '[attr.aria-label]': 'ariaLabel() || "Carrusel"',
  },
  template: `
    <div class="cb-carousel__Stage">
      @if (showNavigators()) {
        <button
          type="button"
          class="cb-carousel__nav cb-carousel__nav--prev"
          [disabled]="!canPrev()"
          aria-label="Anterior"
          (click)="prev()"
        >
          <cb-icon name="chevron-left" [size]="18" aria-hidden="true" />
        </button>
      }
      <div class="cb-carousel__viewport" aria-live="polite">
        @if (activeItem(); as item) {
          <div class="cb-carousel__slide" role="group" aria-roledescription="slide">
            @if (item.image) {
              <img class="cb-carousel__img" [src]="item.image" [alt]="item.title" />
            }
            <div class="cb-carousel__content">
              @if (item.badge) {
                <span class="cb-carousel__badge">{{ item.badge }}</span>
              }
              <h4 class="cb-carousel__title">{{ item.title }}</h4>
              @if (item.description) {
                <p class="cb-carousel__desc">{{ item.description }}</p>
              }
            </div>
          </div>
        }
      </div>
      @if (showNavigators()) {
        <button
          type="button"
          class="cb-carousel__nav cb-carousel__nav--next"
          [disabled]="!canNext()"
          aria-label="Siguiente"
          (click)="next()"
        >
          <cb-icon name="chevron-right" [size]="18" aria-hidden="true" />
        </button>
      }
    </div>
    @if (showIndicators() && items().length > 1) {
      <div class="cb-carousel__indicators" role="tablist">
        @for (item of items(); track item.title; let i = $index) {
          <button
            type="button"
            class="cb-carousel__dot"
            role="tab"
            [class.cb-is-active]="page() === i"
            [attr.aria-selected]="page() === i"
            [attr.aria-label]="'Diapositiva ' + (i + 1)"
            (click)="page.set(i)"
          ></button>
        }
      </div>
    }
  `,
  styleUrl: './carousel.component.css',
})
export class CbCarousel {
  readonly items = input<CbCarouselItem[]>([]);
  readonly circular = input<boolean>(true);
  readonly showNavigators = input<boolean>(true);
  readonly showIndicators = input<boolean>(true);
  readonly ariaLabel = input<string>('Carrusel');

  readonly page = model<number>(0);

  protected readonly activeItem = computed<CbCarouselItem | null>(
    () => this.items()[this.page()] ?? this.items()[0] ?? null,
  );

  protected readonly canPrev = computed(
    () => this.circular() || this.page() > 0,
  );

  protected readonly canNext = computed(
    () => this.circular() || this.page() < Math.max(0, this.items().length - 1),
  );

  prev(): void {
    const count = this.items().length;
    if (count <= 1) return;
    const cur = this.page();
    if (cur > 0) this.page.set(cur - 1);
    else if (this.circular()) this.page.set(count - 1);
  }

  next(): void {
    const count = this.items().length;
    if (count <= 1) return;
    const cur = this.page();
    if (cur < count - 1) this.page.set(cur + 1);
    else if (this.circular()) this.page.set(0);
  }
}
