import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

/** Enlace del índice: `href` apunta al id de la sección (`#seccion`). */
export interface CbAnchorLink {
  label: string;
  href: string;
  children?: CbAnchorLink[];
}

/**
 * Anchor de CaribeNG: índice de la página ("En esta página") que resalta la
 * sección visible (`aria-current="location"`) y, al hacer clic, desplaza hasta
 * ella teniendo en cuenta una cabecera fija (`offset`) y le pasa el foco.
 *
 * @example
 * ```html
 * <cb-anchor [offset]="64" [links]="[
 *   { label: 'Resumen', href: '#resumen' },
 *   { label: 'Movimientos', href: '#movimientos', children: [{ label: 'Pendientes', href: '#pendientes' }] },
 * ]" />
 * ```
 */
@Component({
  selector: 'cb-anchor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet],
  host: { class: 'cb-anchor' },
  template: `
    <nav class="cb-anchor__nav" [attr.aria-label]="ariaLabel() ?? t().onThisPage">
      <ng-template #list let-links let-level="level">
        <ul class="cb-anchor__list" [class.cb-anchor__list--nested]="level > 0">
          @for (link of links; track link.href) {
            <li>
              <a
                class="cb-anchor__link"
                [class.cb-is-active]="active() === link.href"
                [href]="link.href"
                [attr.aria-current]="active() === link.href ? 'location' : null"
                (click)="go($event, link)"
              >
                {{ link.label }}
              </a>
              @if (link.children?.length) {
                <ng-container *ngTemplateOutlet="list; context: { $implicit: link.children, level: level + 1 }" />
              }
            </li>
          }
        </ul>
      </ng-template>
      <ng-container *ngTemplateOutlet="list; context: { $implicit: links(), level: 0 }" />
    </nav>
  `,
  styleUrl: './anchor.component.css',
})
export class CbAnchor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly document = inject(DOCUMENT);

  readonly links = input<readonly CbAnchorLink[]>([]);
  /** Alto (px) de la cabecera fija que tapa la parte superior de la página. */
  readonly offset = input<number>(0);
  /** Nombre de la navegación. Por defecto, "En esta página" del idioma activo. */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Se emite al cambiar la sección visible (su `href`). */
  readonly activeChange = output<string | null>();

  protected readonly active = signal<string | null>(null);
  private frame = 0;

  constructor() {
    const win = this.document.defaultView;
    afterNextRender(() => {
      this.update();
      win?.addEventListener('scroll', this.onScroll, { passive: true });
      win?.addEventListener('resize', this.onScroll, { passive: true });
    });
    inject(DestroyRef).onDestroy(() => {
      win?.removeEventListener('scroll', this.onScroll);
      win?.removeEventListener('resize', this.onScroll);
      if (this.frame) win?.cancelAnimationFrame(this.frame);
    });
  }

  private readonly onScroll = () => {
    const win = this.document.defaultView;
    if (!win || this.frame) return;
    this.frame = win.requestAnimationFrame(() => {
      this.frame = 0;
      this.update();
    });
  };

  /** Sección activa: la última cuyo inicio ya pasó la línea de la cabecera fija. */
  update(): void {
    const line = this.offset() + 8;
    let current: string | null = null;
    for (const href of this.flatHrefs()) {
      const target = this.target(href);
      if (target && target.getBoundingClientRect().top <= line) current = href;
    }
    current ??= this.flatHrefs()[0] ?? null;
    if (current !== this.active()) {
      this.active.set(current);
      this.activeChange.emit(current);
    }
  }

  /** Desplaza hasta la sección, deja el foco en ella y actualiza la URL. */
  protected go(event: MouseEvent, link: CbAnchorLink): void {
    const target = this.target(link.href);
    const win = this.document.defaultView;
    if (!target || !win) return;
    event.preventDefault();
    const reduce = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const top = target.getBoundingClientRect().top + win.scrollY - this.offset();
    win.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    win.history?.replaceState?.(null, '', link.href);
    this.active.set(link.href);
    this.activeChange.emit(link.href);
  }

  private flatHrefs(): string[] {
    const out: string[] = [];
    const walk = (links: readonly CbAnchorLink[]) =>
      links.forEach((l) => {
        out.push(l.href);
        if (l.children) walk(l.children);
      });
    walk(this.links());
    return out;
  }

  private target(href: string): HTMLElement | null {
    const id = href.startsWith('#') ? decodeURIComponent(href.slice(1)) : '';
    return id ? this.document.getElementById(id) : null;
  }
}
