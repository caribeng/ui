import { SEVERITY_VALUES, iconName, styleClass, values } from './rules';
import type { ComponentMapping } from './types';

/**
 * `<p-tag value="Nuevo" severity="warn" icon="pi pi-star" [rounded]="true" />`
 * → `<cb-tag value="Nuevo" severity="warning" icon="star" [rounded]="true" />`
 */
export const tag: ComponentMapping = {
  name: 'tag',
  entry: '@caribeng/ui/tag',
  symbol: 'CbTag',
  modules: {
    'primeng/tag': { TagModule: 'CbTag', Tag: 'CbTag' },
  },
  elements: [
    {
      tag: 'p-tag',
      to: 'cb-tag',
      rules: {
        severity: values('severity', SEVERITY_VALUES),
        icon: iconName(),
        styleClass: styleClass(),
      },
      child: (child) => (child.name === 'ng-template' ? { todo: 'cb-tag no admite plantilla de icono; usa el input icon.' } : null),
      same: ['value', 'rounded'],
    },
  ],
};
