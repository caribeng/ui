import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
  signal,
} from '@angular/core';
import { CbIconComponent } from '@caribeng/ui/icon';

/**
 * Chip de CaribeNG: píldora compacta para representar entidades, filtros o etiquetas
 * individuales con imagen, icono y botón de cierre opcional.
 */
@Component({
  selector: 'cb-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
  host: {
    class: 'cb-chip',
    '[style.display]': 'visible() ? "inline-flex" : "none"',
  },
  template: `
    @if (image()) {
      <img class="cb-chip__img" [src]="image()" [alt]="label()" />
    } @else if (icon()) {
      <cb-icon class="cb-chip__icon" [name]="icon()" [size]="14" aria-hidden="true" />
    }
    <span class="cb-chip__label">{{ label() }}<ng-content /></span>
    @if (removable()) {
      <button
        type="button"
        class="cb-chip__remove"
        [attr.aria-label]="'Quitar ' + label()"
        (click)="onRemove($event)"
      >
        <cb-icon name="x" [size]="13" aria-hidden="true" />
      </button>
    }
  `,
  styleUrl: './chip.component.css',
})
export class CbChipComponent {
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
