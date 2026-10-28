import type { ComponentMapping } from './types';

/**
 * PrimeNG enlaza el modelo en cada radio (`<p-radiobutton name="t" value="a" [(ngModel)]="talla">`);
 * CaribeNG lo enlaza una vez en el grupo que los envuelve (`<cb-radio-group [(ngModel)]="talla">`).
 * Los radios suelen ir cada uno en su propio contenedor con su <label>, así que
 * agruparlos cambia el layout: se deja un aviso con la forma de hacerlo y
 * RadioButtonModule sigue importado para que la plantilla compile.
 */
export const radiobutton: ComponentMapping = {
  name: 'radiobutton',
  entry: '@caribeng/ui/radio',
  symbol: 'CbRadioGroup',
  modules: {
    'primeng/radiobutton': { RadioButton: 'CbRadioGroup', RadioButtonModule: 'CbRadioGroup' },
  },
  elements: ['p-radiobutton', 'p-radioButton', 'p-radio-button'].map((tag) => ({
    tag,
    to: 'cb-radio-group',
    manual:
      'agrupa los radios en <cb-radio-group [(ngModel)]="…"> (el modelo va en el grupo) con un <cb-radio value="…" label="…" /> por opción; importa CbRadioGroup y CbRadio de @caribeng/ui/radio.',
    rules: {},
  })),
};
