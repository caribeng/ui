import { FOCUS_EVENTS, SIZE_VALUES, drop, event, numeric, styleClass, unsupported, values } from './rules';
import type { AttrRule, ComponentMapping } from './types';

const NOT_FORWARDED = 'cb-input-number no reenvía este atributo al <input> interno.';

/**
 * `<p-inputnumber [(ngModel)]="precio" mode="currency" currency="EUR" min="0" [showButtons]="true" />`
 * → `<cb-input-number [(ngModel)]="precio" mode="currency" currency="EUR" [min]="0" [showButtons]="true" />`
 */
const rules: Record<string, AttrRule> = {
  min: numeric(),
  max: numeric(),
  step: numeric(),
  minFractionDigits: numeric(),
  maxFractionDigits: numeric(),
  size: values('size', SIZE_VALUES),
  styleClass: styleClass(),
  buttonLayout: (binding, el) => {
    if (!(binding.kind === 'static' && binding.value === 'stacked')) el.todos.push(`${binding.source} — cb-input-number solo tiene un diseño de botones.`);
  },
  localeMatcher: drop(),
  format: unsupported('cb-input-number siempre formatea el número.'),
  currencyDisplay: unsupported('cb-input-number muestra el símbolo de la moneda.'),
  allowEmpty: unsupported('cb-input-number admite vacío (null) por defecto.'),
  showClear: unsupported('cb-input-number no tiene botón para limpiar.'),
  ariaLabel: unsupported('usa el input label de cb-input-number.'),
  ariaLabelledBy: unsupported('usa el input label de cb-input-number.'),
  ariaDescribedBy: unsupported('usa los inputs hint/error de cb-input-number.'),
  ariaRequired: unsupported('usa required.'),
  title: unsupported(NOT_FORWARDED),
  autocomplete: unsupported(NOT_FORWARDED),
  tabindex: unsupported(NOT_FORWARDED),
  autofocus: unsupported('usa la directiva cbAutoFocus de @caribeng/ui/autofocus.'),
  inputStyle: unsupported('personaliza el campo con los tokens CSS de CaribeNG.'),
  inputStyleClass: unsupported('personaliza el campo con los tokens CSS de CaribeNG.'),
  incrementButtonClass: unsupported('cb-input-number usa sus propios botones.'),
  decrementButtonClass: unsupported('cb-input-number usa sus propios botones.'),
  incrementButtonIcon: unsupported('cb-input-number usa sus propios botones.'),
  decrementButtonIcon: unsupported('cb-input-number usa sus propios botones.'),
  variant: unsupported('cb-input-number no tiene variante "filled".'),
  fluid: unsupported('cb-input-number ya ocupa todo el ancho de su contenedor.'),
  '(onInput)': unsupported('escucha (valueChange) o los cambios del control de formulario.'),
  '(onClear)': unsupported('cb-input-number no tiene botón para limpiar.'),
  '(onKeyDown)': event('keydown'),
  ...FOCUS_EVENTS,
};

export const inputnumber: ComponentMapping = {
  name: 'inputnumber',
  entry: '@caribeng/ui/input-number',
  symbol: 'CbInputNumber',
  modules: {
    'primeng/inputnumber': { InputNumberModule: 'CbInputNumber', InputNumber: 'CbInputNumber' },
  },
  elements: ['p-inputnumber', 'p-inputNumber', 'p-input-number'].map((tag) => ({
    tag,
    to: 'cb-input-number',
    rules,
    child: (child) => (child.name === 'ng-template' ? { todo: 'cb-input-number usa sus propios iconos; la plantilla no se mostrará.' } : null),
    same: ['placeholder', 'inputId', 'readonly', 'disabled', 'required', 'invalid', 'showButtons', 'mode', 'currency', 'locale', 'useGrouping', 'prefix', 'suffix'],
  })),
};
