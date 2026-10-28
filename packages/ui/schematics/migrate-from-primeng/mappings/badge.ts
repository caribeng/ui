import { SEVERITY_VALUES, drop, numeric, renderAttr, styleClass, unsupported, values } from './rules';
import type { AttrRule, ComponentMapping } from './types';

/**
 * `<p-badge value="5" severity="danger" size="large" />`
 * → `<cb-badge [value]="5" severity="danger" size="lg" />`
 *
 * Nota: `pBadge` (directiva sobre otros elementos) no tiene equivalente directo;
 * reemplázala con un `<cb-badge>` junto al elemento y posiciónalo con CSS.
 */

const SIZE_BADGE: Readonly<Record<string, string>> = {
  normal: '',
  large: 'lg',
  xlarge: 'lg',
};

/** Emite `value="Nuevo"` para texto o `[value]="5"` para números. */
const badgeValue: AttrRule = (binding, el) => {
  if (binding.kind === 'static') {
    const num = Number(binding.value);
    if (!isNaN(num) && binding.value.trim() !== '') {
      el.attrs.push(renderAttr('property', 'value', binding.value.trim()));
    } else {
      el.attrs.push(renderAttr('static', 'value', binding.value));
    }
    return;
  }
  el.attrs.push(renderAttr(binding.kind, 'value', binding.value));
};

const sizeRule: AttrRule = (binding, el) => {
  if (binding.kind === 'static') {
    const mapped = SIZE_BADGE[binding.value];
    if (mapped === '') return; // 'normal' → default, no attr needed
    if (mapped) {
      el.attrs.push(renderAttr('static', 'size', mapped));
      return;
    }
  }
  el.attrs.push(renderAttr(binding.kind, 'size', binding.value));
};

const rules: Record<string, AttrRule> = {
  value: badgeValue,
  severity: values('severity', SEVERITY_VALUES),
  size: sizeRule,
  badgeSize: drop(),
  styleClass: styleClass(),
  style: unsupported('usa variables CSS de cb-badge para personalizar el estilo.'),
};

export const badge: ComponentMapping = {
  name: 'badge',
  entry: '@caribeng/ui/badge',
  symbol: 'CbBadge',
  modules: {
    'primeng/badge': { BadgeModule: 'CbBadge', Badge: 'CbBadge' },
  },
  elements: [
    {
      tag: 'p-badge',
      to: 'cb-badge',
      selfClosing: true,
      rules,
      same: ['dot', 'ariaLabel'],
    },
  ],
};
