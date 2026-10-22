import { numeric, rename, unsupported } from './rules';
import { selectChild, selectRules, selectSame } from './select';
import type { AttrRule, ComponentMapping } from './types';

/**
 * Mismas reglas que Select (opciones, filtro, overlay…) más las propias de la
 * selección múltiple.
 *
 * `<p-multiselect [options]="ciudades" optionLabel="nombre" [(ngModel)]="elegidas" filterPlaceHolder="Buscar" />`
 * → `<cb-multiselect [options]="ciudades" optionLabel="nombre" [(ngModel)]="elegidas" filterPlaceholder="Buscar" />`
 */
const rules: Record<string, AttrRule> = {
  ...selectRules,
  // En PrimeNG la H va en mayúscula.
  filterPlaceHolder: rename('filterPlaceholder'),
  maxSelectedLabels: numeric(),
  showClear: unsupported('cb-multiselect no tiene botón para limpiar; usa "seleccionar todo" o vacía el valor.'),
  display: unsupported('cb-multiselect muestra las opciones elegidas como texto.'),
  selectionLimit: unsupported('cb-multiselect no limita la cantidad de opciones; valídalo en el formulario.'),
  selectedItemsLabel: unsupported('cb-multiselect usa el texto de provideCaribeNG() al superar maxSelectedLabels.'),
  showHeader: unsupported('cb-multiselect muestra la cabecera con "seleccionar todo" y el filtro.'),
  chipIcon: unsupported('cb-multiselect no muestra chips.'),
  displaySelectedLabel: unsupported('cb-multiselect siempre muestra la selección.'),
  selectAll: unsupported('usa showToggleAll; el estado de "todo" se deduce del valor.'),
  overlayVisible: unsupported('cb-multiselect no admite abrir el panel desde un input.'),
  filterValue: unsupported('cb-multiselect no admite fijar el texto del filtro.'),
  highlightOnSelect: unsupported('cb-multiselect marca las opciones elegidas con su casilla.'),
  autocomplete: unsupported('cb-multiselect no reenvía autocomplete.'),
  '(onPanelShow)': unsupported('cb-multiselect no emite la apertura del panel.'),
  '(onPanelHide)': unsupported('cb-multiselect no emite el cierre del panel.'),
  '(onRemove)': unsupported('escucha (valueChange).'),
  '(onSelectAllChange)': unsupported('escucha (valueChange).'),
};

export const multiselect: ComponentMapping = {
  name: 'multiselect',
  entry: '@caribeng/ui/multiselect',
  symbol: 'CbMultiSelect',
  modules: {
    'primeng/multiselect': { MultiSelectModule: 'CbMultiSelect', MultiSelect: 'CbMultiSelect' },
  },
  elements: ['p-multiselect', 'p-multiSelect', 'p-multi-select'].map((tag) => ({
    tag,
    to: 'cb-multiselect',
    rules,
    child: selectChild,
    same: [...selectSame.filter((name) => name !== 'showClear'), 'showToggleAll'],
  })),
};
