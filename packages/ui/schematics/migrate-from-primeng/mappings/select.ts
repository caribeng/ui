import { FOCUS_EVENTS, SIZE_VALUES, drop, event, rename, styleClass, unsupported, values } from './rules';
import type { AttrRule, ChildElement, ChildRewrite, ComponentMapping } from './types';

const NO_TEMPLATES = 'cb-select no admite plantillas personalizadas; este contenido no se mostrará.';

/**
 * `(onChange)="cambiar($event.value)"` → `(valueChange)="cambiar($event)"`.
 * `null` si la expresión usa el `$event` de PrimeNG de otra forma.
 */
function adaptChange(expression: string): string | null {
  const adapted = expression.replace(/\$event\.value\b/g, '$event');
  return /\$event\b(?!\.value)/.test(expression) ? null : adapted;
}

/**
 * `<p-select [options]="ciudades" optionLabel="nombre" [(ngModel)]="ciudad" size="small" />`
 * → `<cb-select [options]="ciudades" optionLabel="nombre" [(ngModel)]="ciudad" size="sm" />`
 */
const rules: Record<string, AttrRule> = {
  size: values('size', SIZE_VALUES),
  styleClass: styleClass(),
  emptyFilterMessage: (binding, el) => {
    if (el.find('emptyMessage')) el.todos.push(`${binding.source} — cb-select usa un solo mensaje (emptyMessage).`);
    else rename('emptyMessage')(binding, el);
  },
  // cb-select abre su panel con el overlay del CDK: no hace falta.
  appendTo: drop(),
  autoZIndex: drop(),
  baseZIndex: drop(),
  panelStyle: unsupported('personaliza el panel con los tokens CSS de cb-select.'),
  panelStyleClass: unsupported('personaliza el panel con los tokens CSS de cb-select.'),
  editable: unsupported('cb-select no es editable; usa <cb-autocomplete>.'),
  filterBy: unsupported('cb-select filtra por optionLabel.'),
  filterFields: unsupported('cb-select filtra por optionLabel.'),
  filterMatchMode: unsupported('cb-select filtra por "contiene".'),
  filterLocale: unsupported('cb-select usa el idioma de provideCaribeNG().'),
  resetFilterOnHide: unsupported('cb-select limpia el filtro al cerrar.'),
  dataKey: unsupported('cb-select compara los valores con ===.'),
  lazy: unsupported('cb-select no tiene carga diferida; carga las opciones antes.'),
  loading: unsupported('cb-select no tiene estado de carga.'),
  loadingIcon: unsupported('cb-select no tiene estado de carga.'),
  dropdownIcon: unsupported('cb-select usa su propio icono.'),
  checkmark: unsupported('cb-select marca la opción elegida por defecto.'),
  tooltip: unsupported('usa la directiva cbTooltip de @caribeng/ui/tooltip.'),
  tooltipPosition: unsupported('usa la directiva cbTooltip de @caribeng/ui/tooltip.'),
  tooltipStyleClass: unsupported('usa la directiva cbTooltip de @caribeng/ui/tooltip.'),
  tooltipPositionStyle: unsupported('usa la directiva cbTooltip de @caribeng/ui/tooltip.'),
  overlayOptions: unsupported('cb-select gestiona su overlay.'),
  virtualScrollOptions: unsupported('usa virtualScroll y virtualScrollItemSize.'),
  autofocus: unsupported('usa la directiva cbAutoFocus de @caribeng/ui/autofocus.'),
  autofocusFilter: unsupported('el filtro recibe el foco al abrir.'),
  tabindex: unsupported('el tabindex no se reenvía al control interno.'),
  readonly: unsupported('usa disabled o deshabilita el control de formulario.'),
  focusOnHover: drop(),
  selectOnFocus: unsupported('cb-select solo selecciona al confirmar.'),
  autoOptionFocus: drop(),
  variant: unsupported('cb-select no tiene variante "filled".'),
  fluid: unsupported('cb-select ya ocupa todo el ancho de su contenedor.'),
  ariaFilterLabel: unsupported('el filtro usa filterPlaceholder como nombre accesible.'),
  '(onChange)': event('valueChange', adaptChange),
  ...FOCUS_EVENTS,
  '(onShow)': unsupported('cb-select no emite la apertura del panel.'),
  '(onHide)': unsupported('cb-select no emite el cierre del panel.'),
  '(onClear)': unsupported('escucha (valueChange) y comprueba el valor null.'),
  '(onFilter)': unsupported('cb-select no emite el texto del filtro.'),
  '(onClick)': unsupported('usa (click) en el host.'),
  '(onLazyLoad)': unsupported('cb-select no tiene carga diferida.'),
};

const same = [
  'options',
  'optionLabel',
  'optionValue',
  'optionDisabled',
  'group',
  'optionGroupLabel',
  'optionGroupChildren',
  'placeholder',
  'filter',
  'filterPlaceholder',
  'emptyMessage',
  'showClear',
  'scrollHeight',
  'virtualScroll',
  'virtualScrollItemSize',
  'invalid',
  'disabled',
  'inputId',
  'ariaLabel',
  'ariaLabelledBy',
];

/** Las plantillas de PrimeNG (`#item`, `#selectedItem`…) no tienen equivalente. */
const child = (element: ChildElement): ChildRewrite | null => (element.name === 'ng-template' ? { todo: NO_TEMPLATES } : null);

export const select: ComponentMapping = {
  name: 'select',
  entry: '@caribeng/ui/select',
  modules: {
    'primeng/select': { SelectModule: 'CbSelect', Select: 'CbSelect' },
    // Nombre anterior a PrimeNG 18.
    'primeng/dropdown': { DropdownModule: 'CbSelect', Dropdown: 'CbSelect' },
  },
  elements: ['p-select', 'p-dropdown'].map((tag) => ({ tag, to: 'cb-select', rules, child, same })),
};
