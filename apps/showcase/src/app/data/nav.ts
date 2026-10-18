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
      { label: 'ToggleButton', route: '/components/togglebutton' },
      { label: 'SelectButton', route: '/components/selectbutton' },
      { label: 'ListBox', route: '/components/listbox' },
      { label: 'Slider', route: '/components/slider' },
      { label: 'Knob', route: '/components/knob' },
      { label: 'Rating', route: '/components/rating' },
      { label: 'Chips', route: '/components/chips' },
      { label: 'ColorPicker', route: '/components/colorpicker' },
      { label: 'InputMask', route: '/components/inputmask' },
      { label: 'InputOTP', route: '/components/inputotp' },
      { label: 'FloatLabel', route: '/components/floatlabel' },
      { label: 'IconField', route: '/components/iconfield' },
      { label: 'TreeSelect', route: '/components/treeselect' },
      { label: 'CascadeSelect', route: '/components/cascadeselect' },
      { label: 'FileUpload', route: '/components/fileupload' },
      { label: 'Editor', route: '/components/editor' },
      { label: 'Password', route: '/components/password' },
    ],
  },
  {
    label: 'Overlay',
    items: [
      { label: 'Dialog', route: '/components/dialog' },
      { label: 'Drawer', route: '/components/drawer' },
      { label: 'Tooltip', route: '/components/tooltip' },
      { label: 'Popover', route: '/components/popover' },
      { label: 'ConfirmDialog', route: '/components/confirmdialog' },
      { label: 'ConfirmPopup', route: '/components/confirmpopup' },
      { label: 'DynamicDialog', route: '/components/dynamicdialog' },
    ],
  },
  {
    label: 'Messages',
    items: [
      { label: 'Toast', route: '/components/toast' },
      { label: 'Message', route: '/components/message' },
      { label: 'InlineMessage', route: '/components/inlinemessage' },
      { label: 'Badge', route: '/components/badge' },
      { label: 'Tag', route: '/components/tag' },
    ],
  },
  {
    label: 'Panel',
    items: [
      { label: 'Card', route: '/components/card' },
      { label: 'Panel', route: '/components/panel' },
      { label: 'Fieldset', route: '/components/fieldset' },
      { label: 'Toolbar', route: '/components/toolbar' },
      { label: 'Splitter', route: '/components/splitter' },
      { label: 'ScrollPanel', route: '/components/scrollpanel' },
      { label: 'ScrollTop', route: '/components/scrolltop' },
      { label: 'Divider', route: '/components/divider' },
      { label: 'Accordion', route: '/components/accordion' },
      { label: 'Tabs', route: '/components/tabs' },
      { label: 'Stepper', route: '/components/stepper' },
    ],
  },
  {
    label: 'Data',
    items: [
      { label: 'Table', route: '/components/table' },
      { label: 'Paginator', route: '/components/paginator' },
      { label: 'DataView', route: '/components/dataview' },
      { label: 'Tree', route: '/components/tree' },
      { label: 'TreeTable', route: '/components/treetable' },
      { label: 'Timeline', route: '/components/timeline' },
      { label: 'VirtualScroller', route: '/components/virtualscroller' },
      { label: 'OrderList', route: '/components/orderlist' },
      { label: 'PickList', route: '/components/picklist' },
      { label: 'OrganizationChart', route: '/components/organizationchart' },
    ],
  },
  {
    label: 'Media',
    items: [
      { label: 'Avatar', route: '/components/avatar' },
      { label: 'AvatarGroup', route: '/components/avatargroup' },
      { label: 'Carousel', route: '/components/carousel' },
      { label: 'Image', route: '/components/image' },
      { label: 'Galleria', route: '/components/galleria' },
    ],
  },
  {
    label: 'Misc',
    items: [
      { label: 'ProgressBar', route: '/components/progressbar' },
      { label: 'Spinner', route: '/components/spinner' },
      { label: 'Skeleton', route: '/components/skeleton' },
      { label: 'Chip', route: '/components/chip' },
      { label: 'MeterGroup', route: '/components/metergroup' },
      { label: 'Inplace', route: '/components/inplace' },
      { label: 'BlockUI', route: '/components/blockui' },
      { label: 'Terminal', route: '/components/terminal' },
      { label: 'Ripple', route: '/components/ripple' },
      { label: 'Chart', route: '/components/chart' },
      { label: 'FocusTrap', route: '/components/focustrap' },
      { label: 'AnimateOnScroll', route: '/components/animateonscroll' },
      { label: 'StyleClass', route: '/components/styleclass' },
      { label: 'AutoFocus', route: '/components/autofocus' },
    ],
  },
  {
    label: 'Menu',
    items: [
      { label: 'Menu', route: '/components/menu' },
      { label: 'Menubar', route: '/components/menubar' },
      { label: 'TabMenu', route: '/components/tabmenu' },
      { label: 'ContextMenu', route: '/components/contextmenu' },
      { label: 'PanelMenu', route: '/components/panelmenu' },
      { label: 'TieredMenu', route: '/components/tieredmenu' },
      { label: 'MegaMenu', route: '/components/megamenu' },
      { label: 'Dock', route: '/components/dock' },
      { label: 'Steps', route: '/components/steps' },
      { label: 'SpeedDial', route: '/components/speeddial' },
      { label: 'Breadcrumb', route: '/components/breadcrumb' },
    ],
  },
  {
    label: 'Caribe Design (Identidad & Forms)',
    items: [
      { label: 'Logo', route: '/components/logo' },
      { label: 'Stroke', route: '/components/stroke' },
      { label: 'Illustration', route: '/components/illustration' },
      { label: 'Pictogram', route: '/components/pictogram' },
      { label: 'AnimationLottie', route: '/components/animation-lottie' },
      { label: 'CircleLoading', route: '/components/circle-loading' },
      { label: 'Loader', route: '/components/loader' },
      { label: 'Preloader', route: '/components/preloader' },
      { label: 'FileDownload', route: '/components/file-download' },
      { label: 'FileSelect', route: '/components/file-select' },
      { label: 'InputSearch', route: '/components/input-search' },
      { label: 'InputToken', route: '/components/input-token' },
      { label: 'InputDate', route: '/components/input-date' },
      { label: 'InputSelect', route: '/components/input-select' },
      { label: 'Calendar', route: '/components/calendar' },
    ],
  },
];
