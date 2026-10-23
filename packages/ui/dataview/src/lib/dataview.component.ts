import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  inject,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbPaginator } from '@caribeng/ui/paginator';

/** Elemento con la forma de la presentación por defecto (título, categoría y descripción). */
export interface CbDataViewItem {
  id: string | number;
  title: string;
  description?: string;
  category?: string;
}

export type CbDataViewLayout = 'grid' | 'list';

/** Contexto de `<ng-template cbDataViewItem let-item let-layout="layout" let-index="index">`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- como PrimeNG: la plantilla recibe el elemento sin tipar.
export interface CbDataViewItemContext<T = any> {
  $implicit: T;
  layout: CbDataViewLayout;
  index: number;
}

/** Plantilla de cada elemento de un `<cb-dataview>`. */
@Directive({ selector: 'ng-template[cbDataViewItem]' })
export class CbDataViewItemTemplate {
  readonly template = inject<TemplateRef<CbDataViewItemContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbDataViewItemTemplate, ctx: unknown): ctx is CbDataViewItemContext {
    return true;
  }
}

/** Contenido de la cabecera de un `<cb-dataview>` (título, filtros, acciones…). */
@Directive({ selector: '[cbDataViewHeader]' })
export class CbDataViewHeader {}

/**
 * DataView de CaribeNG: muestra una colección en lista o cuadrícula con la
 * plantilla que definas, paginación opcional y botones para cambiar la vista.
 * Sin plantilla, usa una tarjeta con título, categoría, descripción y botón
 * de selección.
 *
 * @example
 * ```html
 * <cb-dataview [value]="productos" [(layout)]="vista" [rows]="6" showLayoutToggle>
 *   <h3 cbDataViewHeader>Productos</h3>
 *   <ng-template cbDataViewItem let-producto let-layout="layout">
 *     <app-producto [producto]="producto" [compacto]="layout === 'list'" />
 *   </ng-template>
 * </cb-dataview>
 * ```
 */
@Component({
  selector: 'cb-dataview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet, CbPaginator],
  host: { class: 'cb-dataview-host' },
  template: `
    @if (showLayoutToggle() || header()) {
      <div class="cb-dataview__header">
        <div class="cb-dataview__title"><ng-content select="[cbDataViewHeader]" /></div>
        @if (showLayoutToggle()) {
          <div class="cb-dataview__layouts" role="group" [attr.aria-label]="t().changeLayout">
            <button
              type="button"
              class="cb-dataview__layout-btn"
              [attr.aria-pressed]="layout() === 'list'"
              [attr.aria-label]="t().listView"
              (click)="layout.set('list')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            </button>
            <button
              type="button"
              class="cb-dataview__layout-btn"
              [attr.aria-pressed]="layout() === 'grid'"
              [attr.aria-label]="t().gridView"
              (click)="layout.set('grid')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
            </button>
          </div>
        }
      </div>
    }

    <div class="cb-dataview" [attr.data-layout]="layout()" role="list">
      @for (item of page(); track trackKey(item, $index); let i = $index) {
        <div class="cb-dataview__cell" role="listitem">
          @if (itemTemplate(); as tpl) {
            <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: item, layout: layout(), index: first() + i }" />
          } @else {
            <article class="cb-dataview__item">
              <strong class="cb-dataview__item-title">{{ asItem(item).title }}</strong>
              @if (asItem(item).category) {
                <small>{{ asItem(item).category }}</small>
              }
              @if (asItem(item).description) {
                <p>{{ asItem(item).description }}</p>
              }
              <button
                type="button"
                class="cb-dataview__select"
                [attr.aria-pressed]="isSelected(item)"
                [attr.aria-label]="fmt(t().selectItem, asItem(item).title)"
                (click)="selection.set(asItem(item))"
              >
                {{ t().select }}
              </button>
            </article>
          }
        </div>
      } @empty {
        <p class="cb-dataview__empty">{{ emptyMessage() ?? t().noResults }}</p>
      }
    </div>

    @if (rows() > 0 && value().length > rows()) {
      <cb-paginator class="cb-dataview__paginator" [totalRecords]="value().length" [rows]="rows()" [(first)]="first" />
    }
  `,
  styleUrl: './dataview.component.css',
})
export class CbDataView {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;

  /** Colección a mostrar. */
  readonly value = input<readonly unknown[]>([]);
  /** Vista: cuadrícula o lista (two-way). */
  readonly layout = model<CbDataViewLayout>('grid');
  /** Muestra los botones para cambiar entre lista y cuadrícula. */
  readonly showLayoutToggle = input<boolean, unknown>(false, { transform: toBoolean });
  /** Elementos por página; 0 (por defecto) muestra todos sin paginador. */
  readonly rows = input<number>(0);
  /** Propiedad que identifica cada elemento (para el seguimiento y la selección). */
  readonly dataKey = input<string>('id');
  /** Elemento seleccionado con la presentación por defecto (two-way). */
  readonly selection = model<CbDataViewItem | null>(null);
  /** Mensaje cuando no hay elementos. Por defecto, el del idioma activo. */
  readonly emptyMessage = input<string | undefined>(undefined);

  protected readonly itemTemplate = contentChild(CbDataViewItemTemplate);
  protected readonly header = contentChild(CbDataViewHeader);
  /** Índice del primer elemento de la página actual; vuelve a 0 si cambia la colección. */
  protected readonly first = linkedSignal<readonly unknown[], number>({ source: this.value, computation: () => 0 });

  protected readonly page = computed(() => {
    const rows = this.rows();
    return rows > 0 ? this.value().slice(this.first(), this.first() + rows) : this.value();
  });

  protected trackKey(item: unknown, index: number): unknown {
    const key = (item as Record<string, unknown> | null)?.[this.dataKey()];
    return key ?? index;
  }

  protected isSelected(item: unknown): boolean {
    const sel = this.selection();
    return !!sel && this.trackKey(sel, -1) === this.trackKey(item, -2);
  }

  protected asItem(item: unknown): CbDataViewItem {
    return item as CbDataViewItem;
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
