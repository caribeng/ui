import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
  signal,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';

/**
 * Chip de CaribeNG: píldora compacta para representar entidades, filtros o etiquetas
 * individuales con imagen, icono y botón de cierre opcional.
 */
@Component({
  selector: 'cb-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-chip',
    '[style.display]': 'visible() ? "inline-flex" : "none"',
  },
  template: `
    @if (image()) {
      <img class="cb-chip__img" [src]="image()" alt="" />
    } @else if (icon()) {
      <cb-icon class="cb-chip__icon" [name]="icon()" [size]="14" aria-hidden="true" />
    }
    <span class="cb-chip__label">{{ label() }}<ng-content /></span>
    @if (removable()) {
      <button
        type="button"
        class="cb-chip__remove"
        [attr.aria-label]="fmt(t().removeItem, label())"
        (click)="onRemove($event)"
      >
        <cb-icon name="x" [size]="13" aria-hidden="true" />
      </button>
    }
  `,
  styleUrl: './chip.component.css',
})
export class CbChip {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  readonly label = input<string>('');
  readonly icon = input<string>('');
  readonly image = input<string>('');
  readonly removable = input<boolean>(false);

  readonly removed = output<MouseEvent>();

  readonly visible = signal(true);

  protected onRemove(event: MouseEvent): void {
    this.visible.set(false);
    this.removed.emit(event);
  }
}
