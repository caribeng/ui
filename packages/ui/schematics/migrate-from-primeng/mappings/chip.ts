import { drop, event, iconName, styleClass, unsupported } from './rules';
import type { AttrRule, ComponentMapping } from './types';

/**
 * `<p-chip label="Angular" icon="pi pi-star" [removable]="true" (onRemove)="fn($event)" />`
 * → `<cb-chip label="Angular" icon="star" [removable]="true" (removed)="fn($event)" />`
 */
const rules: Record<string, AttrRule> = {
  icon: iconName(),
  removeIcon: drop(),
  styleClass: styleClass(),
  '(onRemove)': event('removed'),
  '(onImageError)': drop(),
};

export const chip: ComponentMapping = {
  name: 'chip',
  entry: '@caribeng/ui/chip',
  symbol: 'CbChip',
  modules: {
    'primeng/chip': { ChipModule: 'CbChip', Chip: 'CbChip' },
  },
  elements: [
    {
      tag: 'p-chip',
      to: 'cb-chip',
      rules,
      same: ['label', 'image', 'removable'],
    },
  ],
};
