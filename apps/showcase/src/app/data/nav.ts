export interface NavItem {
  label: string;
  route?: string;
  /** Marca "soon" u otra etiqueta; si no hay route se muestra deshabilitado. */
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Estructura del sidebar, agrupada por categoría (estilo PrimeNG). */
export const NAV: NavGroup[] = [
  {
    label: 'Foundations',
    items: [
      { label: 'Get Started', route: '/introduction' },
      { label: 'Colors', route: '/foundations/colors' },
      { label: 'Theming', route: '/foundations/theming' },
      { label: 'Icons', route: '/foundations/icons' },
    ],
  },
  {
    label: 'Form',
    items: [
      { label: 'Button', route: '/components/button' },
      { label: 'Input', route: '/components/input' },
      { label: 'Select', route: '/components/select' },
      { label: 'Autocomplete', route: '/components/autocomplete' },
      { label: 'Textarea', route: '/components/textarea' },
      { label: 'InputNumber', route: '/components/input-number' },
      { label: 'DatePicker', route: '/components/datepicker' },
      { label: 'Checkbox', route: '/components/checkbox' },
      { label: 'Radio', route: '/components/radio' },
      { label: 'Toggle', route: '/components/toggle' },
    ],
  },
  {
    label: 'Overlay',
    items: [
      { label: 'Dialog', route: '/components/dialog' },
      { label: 'Drawer', badge: 'soon' },
      { label: 'Tooltip', badge: 'soon' },
      { label: 'Popover', badge: 'soon' },
    ],
  },
  {
    label: 'Messages',
    items: [
      { label: 'Toast', route: '/components/toast' },
      { label: 'Message', badge: 'soon' },
      { label: 'Badge', badge: 'soon' },
      { label: 'Tag', badge: 'soon' },
    ],
  },
  {
    label: 'Panel',
    items: [
      { label: 'Card', badge: 'soon' },
      { label: 'Accordion', badge: 'soon' },
      { label: 'Tabs', badge: 'soon' },
    ],
  },
];
