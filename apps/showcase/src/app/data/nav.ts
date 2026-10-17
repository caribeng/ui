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
      { label: 'InputGroup', route: '/components/inputgroup' },
      { label: 'Select', route: '/components/select' },
      { label: 'MultiSelect', route: '/components/multiselect' },
      { label: 'Autocomplete', route: '/components/autocomplete' },
      { label: 'Textarea', route: '/components/textarea' },
      { label: 'InputNumber', route: '/components/input-number' },
      { label: 'DatePicker', route: '/components/datepicker' },
      { label: 'Checkbox', route: '/components/checkbox' },
      { label: 'Radio', route: '/components/radio' },
      { label: 'Toggle', route: '/components/toggle' },
      { label: 'Slider', route: '/components/slider' },
      { label: 'Rating', route: '/components/rating' },
      { label: 'Chips', route: '/components/chips' },
      { label: 'ColorPicker', route: '/components/colorpicker' },
    ],
  },
  {
    label: 'Overlay',
    items: [
      { label: 'Dialog', route: '/components/dialog' },
      { label: 'Drawer', route: '/components/drawer' },
      { label: 'Tooltip', route: '/components/tooltip' },
      { label: 'Popover', route: '/components/popover' },
    ],
  },
  {
    label: 'Messages',
    items: [
      { label: 'Toast', route: '/components/toast' },
      { label: 'Message', route: '/components/message' },
      { label: 'Badge', route: '/components/badge' },
      { label: 'Tag', route: '/components/tag' },
    ],
  },
  {
    label: 'Panel',
    items: [
      { label: 'Card', route: '/components/card' },
      { label: 'Divider', route: '/components/divider' },
      { label: 'Accordion', route: '/components/accordion' },
      { label: 'Tabs', route: '/components/tabs' },
      { label: 'Stepper', route: '/components/stepper' },
    ],
  },
];
