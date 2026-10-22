import { FOCUS_EVENTS, SIZE_VALUES, adaptEvent, event, styleClass, unsupported, values } from './rules';
import type { AttrRule, ComponentMapping } from './types';

/**
 * `<p-toggleswitch [(ngModel)]="activo" inputId="activo" (onChange)="guardar($event.checked)" />`
 * → `<cb-toggle [(ngModel)]="activo" inputId="activo" (changed)="guardar($event)" />`
 */
const rules: Record<string, AttrRule> = {
  size: values('size', SIZE_VALUES),
  styleClass: styleClass(),
  readonly: unsupported('usa disabled o deshabilita el control de formulario.'),
  trueValue: unsupported('cb-toggle usa true/false; convierte el valor en el modelo.'),
  falseValue: unsupported('cb-toggle usa true/false; convierte el valor en el modelo.'),
  tabindex: unsupported('el tabindex no se reenvía al control interno.'),
  autofocus: unsupported('usa la directiva cbAutoFocus de @caribeng/ui/autofocus.'),
  ariaLabelledBy: unsupported('usa ariaLabel o el input label de cb-toggle.'),
  '(onChange)': event('changed', adaptEvent('checked')),
  ...FOCUS_EVENTS,
};

export const toggleswitch: ComponentMapping = {
  name: 'toggleswitch',
  entry: '@caribeng/ui/toggle',
  symbol: 'CbToggle',
  modules: {
    'primeng/toggleswitch': { ToggleSwitchModule: 'CbToggle', ToggleSwitch: 'CbToggle' },
    // Nombre anterior a PrimeNG 18.
    'primeng/inputswitch': { InputSwitchModule: 'CbToggle', InputSwitch: 'CbToggle' },
  },
  elements: ['p-toggleswitch', 'p-toggleSwitch', 'p-toggle-switch', 'p-inputSwitch', 'p-inputswitch'].map((tag) => ({
    tag,
    to: 'cb-toggle',
    rules,
    child: (child) => (child.name === 'ng-template' ? { todo: 'cb-toggle no admite plantilla para el tirador.' } : null),
    same: ['inputId', 'ariaLabel', 'disabled', 'invalid', 'label'],
  })),
};
