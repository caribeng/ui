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
      { label: 'Localization', route: '/i18n' },
      { label: 'Migrate from PrimeNG', route: '/migration' },
      { label: 'Changelog', route: '/changelog' },
    ],
  },
  {
    label: 'Theming',
    icon: 'palette',
    children: [
      { label: 'Colors', route: '/foundations/colors' },
      { label: 'Theming & Presets', route: '/foundations/theming' },
      { label: 'Utilities', route: '/foundations/utilities' },
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
          { label: 'Dynamic Form', route: '/components/dynamic-form', badge: 'NEW' },
          { label: 'Editor', route: '/components/editor' },
          { label: 'FloatLabel', route: '/components/floatlabel' },
          { label: 'IconField', route: '/components/iconfield' },
          { label: 'Input', route: '/components/input' },
          { label: 'InputGroup', route: '/components/inputgroup' },
          { label: 'InputMask', route: '/components/inputmask' },
          { label: 'InputNumber', route: '/components/input-number' },
          { label: 'InputOTP', route: '/components/inputotp' },
          { label: 'InputSearch', route: '/components/input-search' },
          { label: 'InputToken', route: '/components/input-token' },
          { label: 'KeyFilter', route: '/components/keyfilter', badge: 'NEW' },
          { label: 'Knob', route: '/components/knob' },
          { label: 'ListBox', route: '/components/listbox' },
          { label: 'Mentions', route: '/components/mentions', badge: 'NEW' },
          { label: 'MultiSelect', route: '/components/multiselect' },
          { label: 'Password', route: '/components/password' },
          { label: 'PhoneInput', route: '/components/phone-input', badge: 'NEW' },
          { label: 'Radio', route: '/components/radio' },
          { label: 'Rating', route: '/components/rating' },
          { label: 'Repeater', route: '/components/repeater', badge: 'NEW' },
          { label: 'Select', route: '/components/select' },
          { label: 'SelectButton', route: '/components/selectbutton' },
          { label: 'SignaturePad', route: '/components/signature-pad', badge: 'NEW' },
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
          { label: 'ButtonGroup', route: '/components/button-group' },
          { label: 'CopyButton', route: '/components/copy-button', badge: 'NEW' },
          { label: 'FabMenu', route: '/components/fab-menu' },
          { label: 'IconButton', route: '/components/icon-button' },
          { label: 'SpeedDial', route: '/components/speeddial' },
          { label: 'SplitButton', route: '/components/splitbutton', badge: 'NEW' },
          { label: 'TagButton', route: '/components/tag-button' },
        ],
      },
      {
        label: 'Data',
        children: [
          { label: 'Data Grid', route: '/components/datagrid', badge: 'NEW' },
          { label: 'DataView', route: '/components/dataview' },
          { label: 'Descriptions', route: '/components/descriptions', badge: 'NEW' },
          { label: 'FlowEditor', route: '/components/flow', badge: 'NEW' },
          { label: 'Gantt', route: '/components/gantt', badge: 'NEW' },
          { label: 'InfiniteScroll', route: '/components/infinite-scroll', badge: 'NEW' },
          { label: 'Kanban', route: '/components/kanban', badge: 'NEW' },
          { label: 'OrderList', route: '/components/orderlist' },
          { label: 'OrganizationChart', route: '/components/organizationchart' },
          { label: 'Paginator', route: '/components/paginator' },
          { label: 'PickList', route: '/components/picklist' },
          { label: 'Pricing', route: '/components/pricing', badge: 'NEW' },
          { label: 'Scheduler', route: '/components/scheduler', badge: 'NEW' },
          { label: 'Statistic', route: '/components/statistic', badge: 'NEW' },
          { label: 'Table', route: '/components/table' },
          { label: 'Timeline', route: '/components/timeline' },
          { label: 'Tracker', route: '/components/tracker' },
          { label: 'Tree', route: '/components/tree' },
          { label: 'TreeTable', route: '/components/treetable' },
          { label: 'VirtualScroller', route: '/components/virtualscroller' },
        ],
      },
      {
        label: 'Contabilidad',
        children: [
          { label: 'Account Picker', route: '/components/account-picker', badge: 'NEW' },
          { label: 'Aging', route: '/components/aging', badge: 'NEW' },
          { label: 'Amount', route: '/components/amount', badge: 'NEW' },
          { label: 'Audit Log', route: '/components/audit-log', badge: 'NEW' },
          { label: 'Document', route: '/components/document', badge: 'NEW' },
          { label: 'Financial Report', route: '/components/financial-report', badge: 'NEW' },
          { label: 'Import Wizard', route: '/components/import-wizard', badge: 'NEW' },
          { label: 'Journal Entry', route: '/components/journal-entry', badge: 'NEW' },
          { label: 'KPI', route: '/components/kpi', badge: 'NEW' },
          { label: 'Period Picker', route: '/components/period-picker', badge: 'NEW' },
          { label: 'Pivot', route: '/components/pivot', badge: 'NEW' },
          { label: 'Reconciliation', route: '/components/reconciliation', badge: 'NEW' },
          { label: 'Transaction Status', route: '/components/transaction-status' },
          { label: 'Voucher', route: '/components/voucher' },
        ],
      },
      {
        label: 'Panel',
        children: [
          { label: 'Accordion', route: '/components/accordion' },
          { label: 'Card', route: '/components/card' },
          { label: 'Card Content', route: '/components/card-content' },
          { label: 'Card Move', route: '/components/card-move' },
          { label: 'Card Primary', route: '/components/card-primary' },
          { label: 'Card Select', route: '/components/card-select' },
          { label: 'Divider', route: '/components/divider' },
          { label: 'ExpansionPanel', route: '/components/expansion-panel' },
          { label: 'Fieldset', route: '/components/fieldset' },
          { label: 'Footer', route: '/components/footer' },
          { label: 'Header', route: '/components/header' },
          { label: 'Masonry', route: '/components/masonry', badge: 'NEW' },
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
          { label: 'Coachmark', route: '/components/coachmark' },
          { label: 'CommandPalette', route: '/components/command-palette', badge: 'NEW' },
          { label: 'ConfirmDialog', route: '/components/confirmdialog' },
          { label: 'ConfirmPopup', route: '/components/confirmpopup' },
          { label: 'Dialog', route: '/components/dialog' },
          { label: 'Drawer', route: '/components/drawer' },
          { label: 'DynamicDialog', route: '/components/dynamicdialog' },
          { label: 'OffCanvas', route: '/components/off-canvas' },
          { label: 'Onboarding', route: '/components/onboarding' },
          { label: 'Popover', route: '/components/popover' },
          { label: 'Tooltip', route: '/components/tooltip' },
        ],
      },
      {
        label: 'File',
        children: [
          { label: 'FileCard', route: '/components/file-card', badge: 'NEW' },
          { label: 'FileDownload', route: '/components/file-download' },
          { label: 'FileUpload', route: '/components/fileupload' },
          { label: 'FolderCard', route: '/components/folder-card', badge: 'NEW' },
          { label: 'ImageCropper', route: '/components/image-cropper', badge: 'NEW' },
        ],
      },
      {
        label: 'Menu',
        children: [
          { label: 'Anchor', route: '/components/anchor', badge: 'NEW' },
          { label: 'Breadcrumb', route: '/components/breadcrumb' },
          { label: 'ContextMenu', route: '/components/contextmenu' },
          { label: 'Dock', route: '/components/dock' },
          { label: 'FloatMenu', route: '/components/float-menu' },
          { label: 'MegaMenu', route: '/components/megamenu' },
          { label: 'Menu', route: '/components/menu' },
          { label: 'Menubar', route: '/components/menubar' },
          { label: 'PanelMenu', route: '/components/panelmenu' },
          { label: 'Sidebar / AppShell', route: '/components/sidebar', badge: 'NEW' },
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
          { label: 'Alert', route: '/components/alert' },
          { label: 'Chat (IA)', route: '/components/chat', badge: 'NEW' },
          { label: 'Comments', route: '/components/comments', badge: 'NEW' },
          { label: 'Empty', route: '/components/empty', badge: 'NEW' },
          { label: 'InlineMessage', route: '/components/inlinemessage' },
          { label: 'Message', route: '/components/message' },
          { label: 'NotificationCenter', route: '/components/notification-center', badge: 'NEW' },
          { label: 'Result', route: '/components/result', badge: 'NEW' },
          { label: 'Toast', route: '/components/toast' },
        ],
      },
      {
        label: 'Media',
        children: [
          { label: 'AnimationLottie', route: '/components/animation-lottie' },
          { label: 'Avatar', route: '/components/avatar' },
          { label: 'AvatarGroup', route: '/components/avatargroup' },
          { label: 'Carousel', route: '/components/carousel' },
          { label: 'Galleria', route: '/components/galleria' },
          { label: 'Illustration', route: '/components/illustration' },
          { label: 'Image', route: '/components/image' },
          { label: 'Logo', route: '/components/logo' },
          { label: 'MediaPlayer', route: '/components/media-player', badge: 'NEW' },
          { label: 'PDF Viewer', route: '/components/pdfviewer', badge: 'NEW' },
          { label: 'QRCode', route: '/components/qrcode', badge: 'NEW' },
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
          { label: 'CodeBlock', route: '/components/code-block', badge: 'NEW' },
          { label: 'DotsIndicator', route: '/components/dots-indicator' },
          { label: 'FocusTrap', route: '/components/focustrap' },
          { label: 'Inplace', route: '/components/inplace' },
          { label: 'Kbd', route: '/components/kbd', badge: 'NEW' },
          { label: 'Link', route: '/components/link' },
          { label: 'MeterGroup', route: '/components/metergroup' },
          { label: 'ProgressBar', route: '/components/progressbar' },
          { label: 'Ripple', route: '/components/ripple' },
          { label: 'Shortcut', route: '/components/shortcut' },
          { label: 'Skeleton', route: '/components/skeleton' },
          { label: 'Spinner', route: '/components/spinner' },
          { label: 'Status', route: '/components/status' },
          { label: 'StepIndicator', route: '/components/step-indicator' },
          { label: 'StyleClass', route: '/components/styleclass' },
          { label: 'Tag', route: '/components/tag' },
          { label: 'Terminal', route: '/components/terminal' },
          { label: 'ThemeToggle', route: '/components/themetoggle', badge: 'NEW' },
        ],
      },
    ],
  },
  {
    label: 'Templates',
    icon: 'sparkles',
    badge: 'NEW',
    children: [
      { label: 'Login', route: '/templates/login' },
      { label: 'Register', route: '/templates/register' },
      { label: 'Forgot Password', route: '/templates/forgot-password' },
      { label: 'Reset Password', route: '/templates/reset-password' },
      { label: 'Verification', route: '/templates/verification' },
      { label: 'Two-Factor', route: '/templates/two-factor' },
      { label: 'Lock Screen', route: '/templates/lock-screen' },
      { label: 'Error Pages', route: '/templates/error' },
      { label: 'Invoice', route: '/templates/invoice' },
      { label: 'Dashboard', route: '/templates/dashboard' },
      { label: 'Tablero contable', route: '/templates/accounting', badge: 'NEW' },
      { label: 'Navbar', route: '/templates/navbar' },
      { label: 'File Manager', route: '/templates/file-manager' },
      { label: 'Pricing', route: '/templates/pricing' },
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
