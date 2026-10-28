import { drop, styleClass, values } from './rules';
import type { AttrRule, ComponentMapping } from './types';

/**
 * `<p-divider align="left" layout="horizontal" type="dashed"><span>o</span></p-divider>`
 * → `<cb-divider align="start" orientation="horizontal" type="dashed"><span>o</span></cb-divider>`
 */

const ALIGN_VALUES: Readonly<Record<string, string>> = {
  left: 'start',
  center: 'center',
  right: 'end',
  top: 'start',
  bottom: 'end',
};

const rules: Record<string, AttrRule> = {
  layout: (binding, el) => {
    // PrimeNG 'layout' → CaribeNG 'orientation'
    const map: Record<string, string> = { horizontal: 'horizontal', vertical: 'vertical' };
    const v = binding.kind === 'static' ? (map[binding.value] ?? binding.value) : binding.value;
    el.attrs.push(
      binding.kind === 'static'
        ? `orientation="${v}"`
        : `[orientation]="${binding.value}"`,
    );
  },
  align: values('align', ALIGN_VALUES),
  type: values('type', { solid: 'solid', dashed: 'dashed', dotted: 'dotted' }),
  styleClass: styleClass(),
};

export const divider: ComponentMapping = {
  name: 'divider',
  entry: '@caribeng/ui/divider',
  symbol: 'CbDivider',
  modules: {
    'primeng/divider': { DividerModule: 'CbDivider', Divider: 'CbDivider' },
  },
  elements: [
    {
      tag: 'p-divider',
      to: 'cb-divider',
      rules,
    },
  ],
};
