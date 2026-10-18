import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

export type CbIconFieldPosition = 'left' | 'right';

/**
 * IconField de CaribeNG: contenedor que posiciona un `<cb-input-icon>` a la
 * izquierda o derecha de un `<cb-input>` o `<input>` nativo.
 */
@Component({
  selector: 'cb-icon-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'cb-icon-field',
    '[class.cb-icon-field--left]': 'iconPosition() === "left"',
    '[class.cb-icon-field--right]': 'iconPosition() === "right"',
  },
  template: `<ng-content />`,
  styleUrl: './iconfield.component.css',
})
export class CbIconField {
  readonly iconPosition = input<CbIconFieldPosition>('left');
}

@Component({
  selector: 'cb-input-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'cb-input-icon',
    'aria-hidden': 'true',
  },
  template: `<ng-content />`,
})
export class CbInputIcon {}
