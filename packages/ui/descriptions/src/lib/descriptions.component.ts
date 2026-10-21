import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  contentChildren,
  inject,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/** Un par etiqueta / valor. */
export interface CbDescriptionItem {
  label: string;
  value?: string | number | null;
  /** Identificador para una plantilla `cbDescriptionsValue="key"`. */
  key?: string;
  /** Columnas que ocupa (1 por defecto). */
  span?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- el valor llega sin tipar.
export interface CbDescriptionsValueContext<T = any> {
  /** Valor del elemento. */
  $implicit: T;
  item: CbDescriptionItem;
}

/** Plantilla del valor de un elemento: `<ng-template cbDescriptionsValue="estado" let-valor>`. */
@Directive({
  selector: 'ng-template[cbDescriptionsValue]',
  standalone: true,
})
export class CbDescriptionsValue {
  readonly cbDescriptionsValue = input.required<string>();
  readonly template = inject<TemplateRef<CbDescriptionsValueContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbDescriptionsValue, ctx: unknown): ctx is CbDescriptionsValueContext {
    return true;
  }
}

let nextId = 0;

/**
 * Descriptions de CaribeNG: lista de pares etiqueta / valor (detalle de un
 * cliente, de una transacción…) en una o varias columnas, sobre una lista de
 * descripción (`<dl>`) nativa.
 *
 * @example
 * ```html
 * <cb-descriptions title="Detalle de la transferencia" [columns]="2" [items]="[
 *   { label: 'Origen', value: 'Ahorros **** 1234' },
 *   { label: 'Valor', value: '$ 250.000' },
 *   { label: 'Estado', key: 'estado', value: 'Aprobada' },
 * ]">
 *   <ng-template cbDescriptionsValue="estado" let-estado><cb-tag [value]="estado" severity="success" /></ng-template>
 * </cb-descriptions>
 * ```
 */
@Component({
  selector: 'cb-descriptions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet],
  host: {
    class: 'cb-descriptions',
    '[class.cb-descriptions--bordered]': 'bordered()',
    '[class.cb-descriptions--vertical]': "layout() === 'vertical'",
    '[style.--cb-descriptions-columns]': 'columns()',
  },
  template: `
    @if (title()) {
      <div class="cb-descriptions__title" role="heading" [attr.aria-level]="headingLevel()" [id]="titleId">{{ title() }}</div>
    }
    <dl class="cb-descriptions__list" [attr.aria-labelledby]="title() ? titleId : null">
      @for (item of items(); track $index) {
        <div class="cb-descriptions__item" [style.grid-column]="item.span && item.span > 1 ? 'span ' + item.span : null">
          <dt class="cb-descriptions__label">{{ item.label }}</dt>
          <dd class="cb-descriptions__value">
            @if (valueTemplate(item); as tpl) {
              <ng-container [ngTemplateOutlet]="tpl.template" [ngTemplateOutletContext]="{ $implicit: item.value, item }" />
            } @else {
              {{ item.value ?? '—' }}
            }
          </dd>
        </div>
      }
    </dl>
  `,
  styleUrl: './descriptions.component.css',
})
export class CbDescriptions {
  private readonly valueTemplates = contentChildren(CbDescriptionsValue);
  protected readonly titleId = `cb-descriptions-${++nextId}-title`;

  readonly items = input<readonly CbDescriptionItem[]>([]);
  /** Título del bloque (se anuncia como encabezado). */
  readonly title = input<string>('');
  /** Nivel del encabezado del título (por defecto 3). */
  readonly headingLevel = input<number>(3);
  /** Columnas en pantallas anchas (en móvil siempre 1). */
  readonly columns = input<number>(2);
  /** Etiqueta encima del valor (`vertical`) o a su lado (`horizontal`). */
  readonly layout = input<'horizontal' | 'vertical'>('vertical');
  /** Bordes entre elementos. */
  readonly bordered = input(false, { transform: booleanAttribute });

  protected valueTemplate(item: CbDescriptionItem): CbDescriptionsValue | undefined {
    return item.key ? this.valueTemplates().find((t) => t.cbDescriptionsValue() === item.key) : undefined;
  }
}
