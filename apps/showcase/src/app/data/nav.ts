export interface NavItem {
  label: string;
  route?: string;
  /** Marca "NEW" o "soon"; si no hay route se muestra deshabilitado. */
  badge?: string;
  icon?: string;
  children?: NavItem[];
}

export interface NavGroup {
  label: string;
  icon?: string;
  badge?: string;
  items: NavItem[];
}

/**
 * Menú jerárquico tipo acordeón (estilo PrimeNG `<ol class="layout-menu">`),
 * con secciones raíz colapsables, iconos en `.menu-icon`, subcategorías
 * `.menu-child-category` y soporte completo para los 138 entry points.
 */
export const NAV_MENU: NavItem[] = [
  {
    label: 'Getting Started',
    icon: 'house',
    children: [
      { label: 'Introduction', route: '/introduction' },
    ],
  },
  {
    label: 'Theming',
    icon: 'palette',
    children: [
      { label: 'Colors', route: '/foundations/colors' },
      { label: 'Theming & Presets', route: '/foundations/theming' },
    ],
  },
  {
    label: 'Components',
    icon: 'compass',
    children: [
      {
        label: 'Form',
        children: [
          { label: 'Autocomplete', route: '/components/autocomplete' },
          { label: 'CascadeSelect', route: '/components/cascadeselect' },
          { label: 'Checkbox', route: '/components/checkbox' },
          { label: 'Chips', route: '/components/chips' },
          { label: 'ColorPicker', route: '/components/colorpicker' },
          { label: 'DatePicker', route: '/components/datepicker' },
          { label: 'Editor', route: '/components/editor' },
          { label: 'FloatLabel', route: '/components/floatlabel' },
          { label: 'IconField', route: '/components/iconfield' },
          { label: 'Input', route: '/components/input' },
          { label: 'InputGroup', route: '/components/inputgroup' },
          { label: 'InputMask', route: '/components/inputmask' },
          { label: 'InputNumber', route: '/components/input-number' },
          { label: 'InputOTP', route: '/components/inputotp' },
          { label: 'Knob', route: '/components/knob' },
          { label: 'ListBox', route: '/components/listbox' },
          { label: 'MultiSelect', route: '/components/multiselect' },
          { label: 'Password', route: '/components/password' },
          { label: 'Radio', route: '/components/radio' },
          { label: 'Rating', route: '/components/rating' },
          { label: 'Select', route: '/components/select' },
          { label: 'SelectButton', route: '/components/selectbutton' },
          { label: 'Slider', route: '/components/slider' },
          { label: 'Textarea', route: '/components/textarea' },
          { label: 'Toggle', route: '/components/toggle' },
          { label: 'ToggleButton', route: '/components/togglebutton' },
          { label: 'TreeSelect', route: '/components/treeselect' },
        ],
      },
      {
        label: 'Button',
        children: [
          { label: 'Button', route: '/components/button' },
          { label: 'SpeedDial', route: '/components/speeddial' },
        ],
      },
      {
        label: 'Data',
        children: [
          { label: 'DataView', route: '/components/dataview' },
          { label: 'OrderList', route: '/components/orderlist' },
          { label: 'OrganizationChart', route: '/components/organizationchart' },
          { label: 'Paginator', route: '/components/paginator' },
          { label: 'PickList', route: '/components/picklist' },
          { label: 'Table', route: '/components/table' },
          { label: 'Timeline', route: '/components/timeline' },
          { label: 'Tree', route: '/components/tree' },
          { label: 'TreeTable', route: '/components/treetable' },
          { label: 'VirtualScroller', route: '/components/virtualscroller' },
        ],
      },
      {
        label: 'Panel',
        children: [
          { label: 'Accordion', route: '/components/accordion' },
          { label: 'Card', route: '/components/card' },
          { label: 'Divider', route: '/components/divider' },
          { label: 'Fieldset', route: '/components/fieldset' },
          { label: 'Panel', route: '/components/panel' },
          { label: 'ScrollPanel', route: '/components/scrollpanel' },
          { label: 'ScrollTop', route: '/components/scrolltop' },
          { label: 'Splitter', route: '/components/splitter' },
          { label: 'Stepper', route: '/components/stepper' },
          { label: 'Tabs', route: '/components/tabs' },
          { label: 'Toolbar', route: '/components/toolbar' },
        ],
      },
      {
        label: 'Overlay',
        children: [
          { label: 'ConfirmDialog', route: '/components/confirmdialog' },
          { label: 'ConfirmPopup', route: '/components/confirmpopup' },
          { label: 'Dialog', route: '/components/dialog' },
          { label: 'Drawer', route: '/components/drawer' },
          { label: 'DynamicDialog', route: '/components/dynamicdialog' },
          { label: 'Popover', route: '/components/popover' },
          { label: 'Tooltip', route: '/components/tooltip' },
        ],
      },
      {
        label: 'File',
        children: [
          { label: 'FileUpload', route: '/components/fileupload' },
        ],
      },
      {
        label: 'Menu',
        children: [
          { label: 'Breadcrumb', route: '/components/breadcrumb' },
          { label: 'ContextMenu', route: '/components/contextmenu' },
          { label: 'Dock', route: '/components/dock' },
          { label: 'MegaMenu', route: '/components/megamenu' },
          { label: 'Menu', route: '/components/menu' },
          { label: 'Menubar', route: '/components/menubar' },
          { label: 'PanelMenu', route: '/components/panelmenu' },
          { label: 'Steps', route: '/components/steps' },
          { label: 'TabMenu', route: '/components/tabmenu' },
          { label: 'TieredMenu', route: '/components/tieredmenu' },
        ],
      },
      {
        label: 'Chart',
        children: [
          { label: 'Chart', route: '/components/chart' },
        ],
      },
      {
        label: 'Messages',
        children: [
          { label: 'InlineMessage', route: '/components/inlinemessage' },
          { label: 'Message', route: '/components/message' },
          { label: 'Toast', route: '/components/toast' },
        ],
      },
      {
        label: 'Media',
        children: [
          { label: 'Avatar', route: '/components/avatar' },
          { label: 'AvatarGroup', route: '/components/avatargroup' },
          { label: 'Carousel', route: '/components/carousel' },
          { label: 'Galleria', route: '/components/galleria' },
          { label: 'Image', route: '/components/image' },
        ],
      },
      {
        label: 'Misc',
        children: [
          { label: 'AnimateOnScroll', route: '/components/animateonscroll' },
          { label: 'AutoFocus', route: '/components/autofocus' },
          { label: 'Badge', route: '/components/badge' },
          { label: 'BlockUI', route: '/components/blockui' },
          { label: 'Chip', route: '/components/chip' },
          { label: 'FocusTrap', route: '/components/focustrap' },
          { label: 'Inplace', route: '/components/inplace' },
          { label: 'MeterGroup', route: '/components/metergroup' },
          { label: 'ProgressBar', route: '/components/progressbar' },
          { label: 'Ripple', route: '/components/ripple' },
          { label: 'Skeleton', route: '/components/skeleton' },
          { label: 'Spinner', route: '/components/spinner' },
          { label: 'StyleClass', route: '/components/styleclass' },
          { label: 'Tag', route: '/components/tag' },
          { label: 'Terminal', route: '/components/terminal' },
        ],
      },
    ],
  },
  {
    label: 'Caribe Design',
    icon: 'library-big',
    badge: 'NEW',
    children: [
      {
        label: 'Cards & Transactions',
        children: [
          { label: 'Card Content', route: '/components/card-content' },
          { label: 'Card Move', route: '/components/card-move' },
          { label: 'Card Primary', route: '/components/card-primary' },
          { label: 'Card Select', route: '/components/card-select' },
          { label: 'Data Table', route: '/components/data-table' },
          { label: 'Status', route: '/components/status' },
          { label: 'Tracker', route: '/components/tracker' },
          { label: 'Transaction Status', route: '/components/transaction-status' },
          { label: 'Voucher', route: '/components/voucher' },
        ],
      },
      {
        label: 'Alerts & Overlays',
        children: [
          { label: 'Alert', route: '/components/alert' },
          { label: 'Coachmark', route: '/components/coachmark' },
          { label: 'Inline Alert', route: '/components/inline-alert' },
          { label: 'Modal', route: '/components/modal' },
          { label: 'Onboarding', route: '/components/onboarding' },
          { label: 'Pop Over', route: '/components/pop-over' },
        ],
      },
      {
        label: 'Navigation & Actions',
        children: [
          { label: 'ButtonGroup', route: '/components/button-group' },
          { label: 'DotsIndicator', route: '/components/dots-indicator' },
          { label: 'ExpansionPanel', route: '/components/expansion-panel' },
          { label: 'FabMenu', route: '/components/fab-menu' },
          { label: 'FloatMenu', route: '/components/float-menu' },
          { label: 'Footer', route: '/components/footer' },
          { label: 'Header', route: '/components/header' },
          { label: 'IconButton', route: '/components/icon-button' },
          { label: 'Link', route: '/components/link' },
          { label: 'OffCanvas', route: '/components/off-canvas' },
          { label: 'ProgressBar (Caribe)', route: '/components/progress-bar' },
          { label: 'Shortcut', route: '/components/shortcut' },
          { label: 'StepIndicator', route: '/components/step-indicator' },
          { label: 'Switch', route: '/components/switch' },
          { label: 'TagButton', route: '/components/tag-button' },
        ],
      },
      {
        label: 'Identity, Loaders & Forms',
        children: [
          { label: 'AnimationLottie', route: '/components/animation-lottie' },
          { label: 'Calendar', route: '/components/calendar' },
          { label: 'CircleLoading', route: '/components/circle-loading' },
          { label: 'FileDownload', route: '/components/file-download' },
          { label: 'FileSelect', route: '/components/file-select' },
          { label: 'Illustration', route: '/components/illustration' },
          { label: 'InputDate', route: '/components/input-date' },
          { label: 'InputSearch', route: '/components/input-search' },
          { label: 'InputSelect', route: '/components/input-select' },
          { label: 'InputToken', route: '/components/input-token' },
          { label: 'Loader', route: '/components/loader' },
          { label: 'Logo', route: '/components/logo' },
          { label: 'Pictogram', route: '/components/pictogram' },
          { label: 'Preloader', route: '/components/preloader' },
          { label: 'Stroke', route: '/components/stroke' },
        ],
      },
    ],
  },
  {
    label: 'Icons',
    icon: 'eye',
    children: [
      { label: 'Catalog (Lucide)', route: '/foundations/icons' },
    ],
  },
];

/** Compatibilidad plana `NAV: NavGroup[]` */
export const NAV: NavGroup[] = NAV_MENU.flatMap((section) =>
  section.children?.some((c) => c.children)
    ? section.children.map((sub) => ({
        label: sub.label,
        items: sub.children ?? [],
      }))
    : [
        {
          label: section.label,
          icon: section.icon,
          badge: section.badge,
          items: section.children ?? [],
        },
      ],
);
