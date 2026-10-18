import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/**
 * Card-primary de Caribe Design: tarjeta destacada para mostrar un valor
 * principal (p. ej. un saldo) con título y subtítulo.
 *
 * @example
 * ```html
 * <cb-card-primary title="Cuenta de ahorros" subtitle="**** 1234" value="$ 1.250.000" />
 * ```
 */
@Component({
  selector: 'cb-card-primary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <article class="cb-card-primary">
      <header class="cb-card-primary__head">
        <span class="cb-card-primary__badge" aria-hidden="true">★</span>
        <strong class="cb-card-primary__title">{{ title() }}</strong>
      </header>
      @if (subtitle()) {
        <span class="cb-card-primary__subtitle">{{ subtitle() }}</span>
      }
      @if (value()) {
        <strong class="cb-card-primary__value">{{ value() }}</strong>
      }
      <ng-content />
    </article>
  `,
  styleUrl: './card-primary.component.css',
})
export class CbCardPrimary {
  readonly title = input('');
  readonly subtitle = input('');
  readonly value = input('');
}
