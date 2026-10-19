import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';

export interface CbPaginatorState {
  /** Índice del primer registro de la página. */
  first: number;
  /** Registros por página. */
  rows: number;
  /** Página actual (base 0). */
  page: number;
  /** Total de páginas. */
  pageCount: number;
}

/**
 * Paginator de CaribeNG: control de paginación reutilizable (standalone o junto
 * a `<cb-table>`). `first` y `rows` son two-way.
 *
 * @example
 * ```html
 * <cb-paginator [totalRecords]="120" [(first)]="first" [(rows)]="rows"
 *               [rowsPerPageOptions]="[10, 20, 50]" (pageChange)="load($event)" />
 * ```
 */
@Component({
  selector: 'cb-paginator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-paginator', role: 'navigation', 'aria-label': 'Paginación' },
  template: `
    @if (showReport()) {
      <span class="cb-paginator__report">{{ report() }}</span>
    }

    <button
      type="button"
      class="cb-paginator__btn"
      aria-label="Primera página"
      [disabled]="page() === 0"
      (click)="goToPage(0)"
    >
      <cb-icon name="chevrons-left" [size]="16" aria-hidden="true" />
    </button>
    <button
      type="button"
      class="cb-paginator__btn"
      aria-label="Página anterior"
      [disabled]="page() === 0"
      (click)="goToPage(page() - 1)"
    >
      <cb-icon name="chevron-left" [size]="16" aria-hidden="true" />
    </button>

    @for (p of pageLinks(); track p) {
      <button
        type="button"
        class="cb-paginator__page"
        [class.cb-is-active]="p === page()"
        [attr.aria-current]="p === page() ? 'page' : null"
        (click)="goToPage(p)"
      >
        {{ p + 1 }}
      </button>
    }

    <button
      type="button"
      class="cb-paginator__btn"
      aria-label="Página siguiente"
      [disabled]="page() >= pageCount() - 1"
      (click)="goToPage(page() + 1)"
    >
      <cb-icon name="chevron-right" [size]="16" aria-hidden="true" />
    </button>
    <button
      type="button"
      class="cb-paginator__btn"
      aria-label="Última página"
      [disabled]="page() >= pageCount() - 1"
      (click)="goToPage(pageCount() - 1)"
    >
      <cb-icon name="chevrons-right" [size]="16" aria-hidden="true" />
    </button>

    @if (rowsPerPageOptions().length) {
      <select
        class="cb-paginator__rows"
        aria-label="Registros por página"
        [value]="rows()"
        (change)="onRowsChange($event)"
      >
        @for (r of rowsPerPageOptions(); track r) {
          <option [value]="r">{{ r }}</option>
        }
      </select>
    }
  `,
  styleUrl: './paginator.component.css',
})
export class CbPaginator {
  readonly totalRecords = input<number>(0);
  readonly rows = model<number>(10);
  readonly first = model<number>(0);
  readonly rowsPerPageOptions = input<readonly number[]>([]);
  readonly showReport = input<boolean, unknown>(true, { transform: toBoolean });
  /** Máximo de enlaces de página numerados visibles. */
  readonly maxPageLinks = input<number>(5);

  readonly pageChange = output<CbPaginatorState>();

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.totalRecords() / Math.max(1, this.rows()))),
  );
  protected readonly page = computed(() =>
    Math.min(this.pageCount() - 1, Math.floor(this.first() / Math.max(1, this.rows()))),
  );

  protected readonly pageLinks = computed(() => {
    const count = this.pageCount();
    const current = this.page();
    const max = Math.min(this.maxPageLinks(), count);
    let start = Math.max(0, current - Math.floor(max / 2));
    start = Math.min(start, count - max);
    return Array.from({ length: max }, (_, i) => start + i);
  });

  protected readonly report = computed(() => {
    const total = this.totalRecords();
    if (total === 0) return '0 registros';
    const from = this.first() + 1;
    const to = Math.min(this.first() + this.rows(), total);
    return `${from}–${to} de ${total}`;
  });

  protected goToPage(p: number): void {
    const target = Math.min(this.pageCount() - 1, Math.max(0, p));
    const first = target * this.rows();
    if (first === this.first()) return;
    this.first.set(first);
    this.emit();
  }

  protected onRowsChange(event: Event): void {
    const rows = Number((event.target as HTMLSelectElement).value) || this.rows();
    this.rows.set(rows);
    this.first.set(0);
    this.emit();
  }

  private emit(): void {
    this.pageChange.emit({
      first: this.first(),
      rows: this.rows(),
      page: this.page(),
      pageCount: this.pageCount(),
    });
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
