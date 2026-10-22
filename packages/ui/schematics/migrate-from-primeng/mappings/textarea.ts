import { SIZE_VALUES, event, numeric, rename, unsupported, values } from './rules';
import type { ComponentMapping } from './types';

const NOT_FORWARDED = 'el atributo nativo no se reenvía al <textarea> interno de cb-textarea.';

/**
 * `<textarea pTextarea id="nota" rows="5" [autoResize]="true" [(ngModel)]="nota"></textarea>`
 * → `<cb-textarea inputId="nota" [rows]="5" [autoResize]="true" [(ngModel)]="nota" />`
 */
export const textarea: ComponentMapping = {
  name: 'textarea',
  entry: '@caribeng/ui/textarea',
  symbol: 'CbTextarea',
  modules: {
    'primeng/textarea': { TextareaModule: 'CbTextarea', Textarea: 'CbTextarea' },
    // Nombre anterior a PrimeNG 18.
    'primeng/inputtextarea': { InputTextareaModule: 'CbTextarea', InputTextarea: 'CbTextarea' },
  },
  elements: ['pTextarea', 'pInputTextarea'].map((attr) => ({
    attr,
    on: ['textarea'],
    to: 'cb-textarea',
    selfClosing: true,
    rules: {
      // El id debe llegar al <textarea> interno para que <label for> siga funcionando.
      id: rename('inputId'),
      pSize: values('size', SIZE_VALUES),
      rows: numeric(),
      maxlength: numeric(),
      variant: unsupported('cb-textarea no tiene variante "filled".'),
      fluid: unsupported('cb-textarea ya ocupa todo el ancho de su contenedor.'),
      cols: unsupported('cb-textarea ocupa el ancho de su contenedor; ajusta el ancho con CSS.'),
      minlength: unsupported(NOT_FORWARDED),
      autocomplete: unsupported(NOT_FORWARDED),
      spellcheck: unsupported(NOT_FORWARDED),
      autofocus: unsupported('usa la directiva cbAutoFocus de @caribeng/ui/autofocus.'),
      'aria-label': unsupported('usa el input label de cb-textarea; el aria-label del host no llega al <textarea> interno.'),
      '(onResize)': unsupported('cb-textarea no emite el cambio de tamaño.'),
      '(focus)': event('focusin'),
      '(blur)': event('focusout'),
    },
    same: ['autoResize', 'placeholder', 'readonly', 'required', 'disabled', 'invalid', 'value'],
  })),
};
