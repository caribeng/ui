import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/** Contenido visual de un tooltip (se monta en un overlay). Uso interno. */
@Component({
  selector: 'cb-tooltip-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-tooltip',
    '[class]': "'cb-tooltip cb-tooltip--' + position()",
    role: 'tooltip',
  },
  template: `{{ text() }}`,
  styleUrl: './tooltip-content.component.css',
})
export class CbTooltipContent {
  readonly text = input<string>('');
  readonly position = input<'top' | 'bottom' | 'left' | 'right'>('top');
}
