import { FOCUS_EVENTS, SIZE_VALUES, drop, event, styleClass, unsupported, values } from './rules';
import type { AttrRule, ComponentMapping } from './types';

/**
 * `(onChange)="marcar($event.checked)"` → `(changed)="marcar($event)"`: PrimeNG
 * emite `{ checked, originalEvent }` y cb-checkbox emite directamente el valor
 * nuevo (booleano o array), que es lo que PrimeNG pone en `checked`.
 */
function adaptChange(expression: string): string | null {
  const adapted = expression.replace(/\$event\.checked\b/g, '$event');
  return /\$event\b(?!\.checked)/.test(expression) ? null : adapted;
}

/**
 * `<p-checkbox [(ngModel)]="acepto" [binary]="true" inputId="acepto" />`
 * → `<cb-checkbox [(ngModel)]="acepto" inputId="acepto" />`
 *
 * cb-checkbox decide el modo por el valor del modelo: booleano si no es un
 * array, lista si lo es (como `binary` / `value` en PrimeNG).
 */
const rules: Record<string, AttrRule> = {
  binary: drop(),
  size: values('size', SIZE_VALUES),
  styleClass: styleClass(),
  ariaLabelledBy: unsupported('usa ariaLabel o el input label de cb-checkbox.'),
  readonly: unsupported('usa disabled o deshabilita el control de formulario.'),
  tabindex: unsupported('el tabindex no se reenvía al control interno.'),
  autofocus: unsupported('usa la directiva cbAutoFocus de @caribeng/ui/autofocus.'),
  trueValue: unsupported('cb-checkbox usa true/false en modo binario; convierte el valor en el modelo.'),
  falseValue: unsupported('cb-checkbox usa true/false en modo binario; convierte el valor en el modelo.'),
  checkboxIcon: unsupported('cb-checkbox usa su propio icono.'),
  inputStyle: unsupported('personaliza el control con los tokens CSS de cb-checkbox.'),
  inputClass: unsupported('personaliza el control con los tokens CSS de cb-checkbox.'),
  variant: unsupported('cb-checkbox no tiene variante "filled".'),
  '(onChange)': event('changed', adaptChange),
  ...FOCUS_EVENTS,
};

export const checkbox: ComponentMapping = {
  name: 'checkbox',
  entry: '@caribeng/ui/checkbox',
  symbol: 'CbCheckbox',
  modules: {
    'primeng/checkbox': { CheckboxModule: 'CbCheckbox', Checkbox: 'CbCheckbox' },
  },
  // Selectores alternativos que acepta PrimeNG.
  elements: ['p-checkbox', 'p-checkBox', 'p-check-box'].map((tag) => ({
    tag,
    to: 'cb-checkbox',
    rules,
    child: (child) => (child.name === 'ng-template' ? { todo: 'cb-checkbox usa su propio icono; la plantilla no se mostrará.' } : null),
    same: ['value', 'inputId', 'ariaLabel', 'indeterminate', 'disabled', 'required', 'invalid', 'label'],
  })),
};
