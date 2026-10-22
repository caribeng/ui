import { FOCUS_EVENTS, SIZE_VALUES, drop, event, numeric, staticBoolean, styleClass, unsupported, values } from './rules';
import type { AttrRule, ComponentMapping, ElementRewrite } from './types';

const BEHAVIOUR = 'cb-datepicker gestiona este comportamiento por su cuenta.';
const NO_STYLE = 'personaliza cb-datepicker con los tokens CSS de CaribeNG.';

/**
 * `<p-datepicker [(ngModel)]="fecha" dateFormat="dd/mm/yy" [showIcon]="true" />`
 * → `<cb-datepicker [(ngModel)]="fecha" dateFormat="dd/mm/yy" editable />`
 *
 * `dateFormat` usa la misma sintaxis en las dos librerías. Con Angular Forms el
 * valor es igual: una fecha, o `[inicio, fin]` con `selectionMode="range"`.
 */
const rules: Record<string, AttrRule> = {
  selectionMode: (binding, el) => {
    if (binding.kind === 'static' && binding.value === 'multiple') {
      el.todos.push(`${binding.source} — cb-datepicker no admite varias fechas sueltas; usa un rango o varios campos.`);
      return;
    }
    el.attrs.push(binding.source);
  },
  numberOfMonths: numeric(),
  firstDayOfWeek: numeric(),
  stepMinute: numeric(),
  size: values('size', SIZE_VALUES),
  styleClass: styleClass(),
  // PrimeNG deja escribir la fecha salvo con readonlyInput; cb-datepicker solo con editable (ver finalize).
  readonlyInput: drop(),
  // cb-datepicker siempre muestra su icono y abre el calendario como overlay del CDK.
  showIcon: drop(),
  iconDisplay: drop(),
  icon: drop(),
  appendTo: drop(),
  autoZIndex: drop(),
  baseZIndex: drop(),
  showOnFocus: drop(),
  showOtherMonths: drop(),
  selectOtherMonths: drop(),
  hideOnDateTimeSelect: drop(),
  keepInvalid: drop(),
  touchUI: drop(),
  focusTrap: drop(),
  showTransitionOptions: drop(),
  hideTransitionOptions: drop(),
  motionOptions: drop(),
  inline: unsupported('cb-datepicker siempre se abre como desplegable.'),
  timeOnly: unsupported('cb-datepicker no tiene modo solo hora.'),
  showSeconds: unsupported('cb-datepicker muestra horas y minutos.'),
  stepHour: unsupported('cb-datepicker avanza las horas de una en una.'),
  stepSecond: unsupported('cb-datepicker muestra horas y minutos.'),
  showButtonBar: unsupported('usa presets (p. ej. [presets]="[\'today\']") para atajos de fecha.'),
  showClear: unsupported('borra la fecha desde el formulario.'),
  showWeek: unsupported('cb-datepicker no muestra el número de semana.'),
  startWeekFromFirstDayOfYear: unsupported('cb-datepicker no muestra el número de semana.'),
  disabledDates: unsupported('usa minDate/maxDate o valida la fecha en el formulario.'),
  disabledDays: unsupported('usa minDate/maxDate o valida la fecha en el formulario.'),
  dataType: unsupported('cb-datepicker siempre entrega objetos Date.'),
  defaultDate: unsupported('cb-datepicker abre en el mes de la fecha elegida o en el actual.'),
  maxDateCount: unsupported('cb-datepicker no admite varias fechas sueltas.'),
  multipleSeparator: unsupported('cb-datepicker no admite varias fechas sueltas.'),
  rangeSeparator: unsupported(BEHAVIOUR),
  shortYearCutoff: unsupported(BEHAVIOUR),
  timeSeparator: unsupported(BEHAVIOUR),
  responsiveOptions: unsupported(BEHAVIOUR),
  panelStyle: unsupported(NO_STYLE),
  panelStyleClass: unsupported(NO_STYLE),
  inputStyle: unsupported(NO_STYLE),
  inputStyleClass: unsupported(NO_STYLE),
  todayButtonStyleClass: unsupported(NO_STYLE),
  clearButtonStyleClass: unsupported(NO_STYLE),
  ariaLabel: unsupported('usa el input label de cb-datepicker.'),
  ariaLabelledBy: unsupported('usa el input label de cb-datepicker.'),
  iconAriaLabel: unsupported('el botón del calendario usa el texto de provideCaribeNG().'),
  tabindex: unsupported('el tabindex no se reenvía al campo interno.'),
  autofocus: unsupported('usa la directiva cbAutoFocus de @caribeng/ui/autofocus.'),
  variant: unsupported('cb-datepicker no tiene variante "filled".'),
  fluid: unsupported('cb-datepicker ya ocupa todo el ancho de su contenedor.'),
  // PrimeNG emite la fecha elegida, igual que el valueChange de cb-datepicker.
  '(onSelect)': event('valueChange'),
  '(onClose)': unsupported('cb-datepicker no emite el cierre del calendario.'),
  '(onClear)': unsupported('escucha (valueChange) y comprueba el valor null.'),
  '(onInput)': unsupported('escucha (valueChange) o los cambios del control de formulario.'),
  '(onTodayClick)': unsupported('cb-datepicker no tiene barra de botones.'),
  '(onClearClick)': unsupported('cb-datepicker no tiene barra de botones.'),
  '(onMonthChange)': unsupported('cb-datepicker no emite el cambio de mes.'),
  '(onYearChange)': unsupported('cb-datepicker no emite el cambio de año.'),
  '(onClickOutside)': unsupported('cb-datepicker no emite el clic fuera.'),
  '(onShow)': unsupported('cb-datepicker no emite la apertura del calendario.'),
  ...FOCUS_EVENTS,
};

/** En PrimeNG el campo admite escribir la fecha salvo con `readonlyInput`; en cb-datepicker hay que pedirlo con `editable`. */
function finalize(el: ElementRewrite): void {
  const readonly = el.find('readonlyInput');
  if (!readonly) {
    el.attrs.push('editable');
  } else if (staticBoolean(readonly) === null) {
    el.attrs.push(`[editable]="!(${readonly.value})"`);
  } else if (staticBoolean(readonly) === false) {
    el.attrs.push('editable');
  }
}

export const datepicker: ComponentMapping = {
  name: 'datepicker',
  entry: '@caribeng/ui/datepicker',
  symbol: 'CbDatepicker',
  modules: {
    'primeng/datepicker': { DatePickerModule: 'CbDatepicker', DatePicker: 'CbDatepicker' },
    // Nombre anterior a PrimeNG 18.
    'primeng/calendar': { CalendarModule: 'CbDatepicker', Calendar: 'CbDatepicker' },
  },
  elements: ['p-datepicker', 'p-datePicker', 'p-date-picker', 'p-calendar'].map((tag) => ({
    tag,
    to: 'cb-datepicker',
    rules,
    finalize,
    child: (child) => (child.name === 'ng-template' ? { todo: 'cb-datepicker no admite plantillas personalizadas; el contenido no se mostrará.' } : null),
    same: ['dateFormat', 'hourFormat', 'showTime', 'minDate', 'maxDate', 'view', 'placeholder', 'inputId', 'disabled', 'required', 'invalid'],
  })),
};
