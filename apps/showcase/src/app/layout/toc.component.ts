import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  effect,
  inject,
} from '@angular/core';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-toc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (toc.entries().length) {
      <nav class="toc" aria-label="En esta página">
        <p class="toc__title">En esta página</p>
        <ul class="toc__list">
          @for (entry of toc.entries(); track entry.id) {
            <li>
              <a
                class="toc__link"
                [class.toc__link--active]="toc.active() === entry.id"
                [href]="'#' + entry.id"
                (click)="scrollTo($event, entry.id)"
              >
                {{ entry.label }}
              </a>
            </li>
          }
        </ul>
      </nav>
    }
  `,
  styleUrl: './toc.component.css',
})
export class TocComponent {
  protected readonly toc = inject(TocService);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private observer?: IntersectionObserver;

  constructor() {
    effect(() => {
      const entries = this.toc.entries();
      if (!this.isBrowser || entries.length === 0) return;
      // Re-observa cuando cambian las secciones de la página.
      queueMicrotask(() => this.observe(entries.map((e) => e.id)));
    });
  }

  private observe(ids: string[]): void {
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) {
            this.toc.setActive((record.target as HTMLElement).id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );
    for (const id of ids) {
      const el = this.document.getElementById(id);
      if (el) this.observer.observe(el);
    }
  }

  protected scrollTo(event: Event, id: string): void {
    event.preventDefault();
    const el = this.document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.toc.setActive(id);
      history.replaceState(null, '', `#${id}`);
    }
  }
}
