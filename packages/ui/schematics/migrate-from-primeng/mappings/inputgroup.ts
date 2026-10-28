import { drop, styleClass, unsupported } from './rules';
import type { ComponentMapping } from './types';

// =============================================================================
// InputGroup / InputGroupAddon
// `<p-inputgroup><p-inputgroup-addon>…</p-inputgroup-addon><input … /></p-inputgroup>`
// → `<cb-input-group><cb-input-group-addon>…</cb-input-group-addon><input … /></cb-input-group>`
// =============================================================================

export const inputgroup: ComponentMapping = {
  name: 'inputgroup',
  entry: '@caribeng/ui/inputgroup',
  symbol: 'CbInputGroup',
  tags: { 'cb-input-group-addon': 'CbInputGroupAddon' },
  modules: {
    'primeng/inputgroup': {
      InputGroup: 'CbInputGroup',
      InputGroupModule: 'CbInputGroup',
      InputGroupAddon: 'CbInputGroupAddon',
      InputGroupAddonModule: 'CbInputGroupAddon',
    },
    'primeng/inputgroupaddon': {
      InputGroupAddon: 'CbInputGroupAddon',
      InputGroupAddonModule: 'CbInputGroupAddon',
    },
  },
  elements: [
    {
      tag: 'p-inputgroup',
      to: 'cb-input-group',
      rules: {
        styleClass: styleClass(),
        style: drop(),
      },
    },
    {
      tag: 'p-inputgroup-addon',
      to: 'cb-input-group-addon',
      symbol: 'CbInputGroupAddon',
      rules: {
        styleClass: styleClass(),
        style: drop(),
      },
    },
  ],
};

// =============================================================================
// IconField / InputIcon
// `<p-iconfield iconPosition="left"><p-inputicon styleClass="pi pi-search" /><input pInputText /></p-iconfield>`
// → `<cb-icon-field><cb-input-icon>…</cb-input-icon><input cbInput /></cb-icon-field>`
//
// cb-input-icon envoltura para el icono; usa <cb-icon name="…" /> como hijo.
// =============================================================================

export const iconfield: ComponentMapping = {
  name: 'iconfield',
  entry: '@caribeng/ui/iconfield',
  symbol: 'CbIconField',
  tags: { 'cb-input-icon': 'CbInputIcon' },
  modules: {
    'primeng/iconfield': {
      IconField: 'CbIconField',
      IconFieldModule: 'CbIconField',
      InputIcon: 'CbInputIcon',
      InputIconModule: 'CbInputIcon',
    },
    'primeng/inputicon': {
      InputIcon: 'CbInputIcon',
      InputIconModule: 'CbInputIcon',
    },
  },
  elements: [
    {
      tag: 'p-iconfield',
      to: 'cb-icon-field',
      rules: {
        styleClass: styleClass(),
        style: drop(),
        iconPosition: (binding, el) => {
          const v = binding.kind === 'static' ? `iconPosition="${binding.value}"` : `[iconPosition]="${binding.value}"`;
          el.attrs.push(v);
        },
      },
    },
    {
      tag: 'p-inputicon',
      to: 'cb-input-icon',
      symbol: 'CbInputIcon',
      rules: {
        styleClass: unsupported('cb-input-icon no expone styleClass; pon <cb-icon name="…" /> como hijo.'),
        style: drop(),
      },
    },
  ],
};
