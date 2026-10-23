// Metadatos de API para el playground del showcase (se mantiene a mano).
// `default` es el valor real del input; `example`, el dato con el que arranca la demo.
import type { DocApi } from './doc-api.model';
import {
  DocPgAccordion,
  DocPgIconField,
  DocPgMenu,
  DocPgPopover,
  DocPgRadio,
  DocPgRadioGroup,
  DocPgScrollTop,
  DocPgSplitter,
  DocPgStepper,
  DocPgTabs,
  DocPgToast,
} from './playground-demos';
import { CbAccordion } from '@caribeng/ui/accordion';
import { CbAlert } from '@caribeng/ui/caribe/alert';
import { CbAnimationLottie } from '@caribeng/ui/caribe/animation-lottie';
import { CbAutocomplete } from '@caribeng/ui/autocomplete';
import { CbAvatar } from '@caribeng/ui/avatar';
import { CbAvatarGroup } from '@caribeng/ui/avatargroup';
import { CbBadge } from '@caribeng/ui/badge';
import { CbBlockUi } from '@caribeng/ui/blockui';
import { CbBreadcrumb } from '@caribeng/ui/breadcrumb';
import { CbButton } from '@caribeng/ui/button';
import { CbButtonGroup } from '@caribeng/ui/caribe/button-group';
import { CbCalendar } from '@caribeng/ui/caribe/calendar';
import { CbCard } from '@caribeng/ui/card';
import { CbCardContent } from '@caribeng/ui/caribe/card-content';
import { CbCardMove } from '@caribeng/ui/caribe/card-move';
import { CbCardPrimary } from '@caribeng/ui/caribe/card-primary';
import { CbCardSelect } from '@caribeng/ui/caribe/card-select';
import { CbCarousel } from '@caribeng/ui/carousel';
import { CbCascadeSelect } from '@caribeng/ui/cascadeselect';
import { CbChart } from '@caribeng/ui/chart';
import { CbCheckbox } from '@caribeng/ui/checkbox';
import { CbChip } from '@caribeng/ui/chip';
import { CbChips } from '@caribeng/ui/chips';
import { CbCircleLoading } from '@caribeng/ui/caribe/circle-loading';
import { CbCoachmark } from '@caribeng/ui/caribe/coachmark';
import { CbColorPicker } from '@caribeng/ui/colorpicker';
import { CbConfirmDialog } from '@caribeng/ui/confirmdialog';
import { CbConfirmPopup } from '@caribeng/ui/confirmpopup';
import { CbContextMenu } from '@caribeng/ui/contextmenu';
import { CbDataTable } from '@caribeng/ui/caribe/data-table';
import { CbDataView } from '@caribeng/ui/dataview';
import { CbDatepicker } from '@caribeng/ui/datepicker';
import { CbDialog } from '@caribeng/ui/dialog';
import { CbDivider } from '@caribeng/ui/divider';
import { CbDock } from '@caribeng/ui/dock';
import { CbDotsIndicator } from '@caribeng/ui/caribe/dots-indicator';
import { CbDrawer } from '@caribeng/ui/drawer';
import { CbDynamicDialog } from '@caribeng/ui/dynamicdialog';
import { CbEditor } from '@caribeng/ui/editor';
import { CbExpansionPanel } from '@caribeng/ui/caribe/expansion-panel';
import { CbFabMenu } from '@caribeng/ui/caribe/fab-menu';
import { CbFieldset } from '@caribeng/ui/fieldset';
import { CbFileDownload } from '@caribeng/ui/caribe/file-download';
import { CbFileSelect } from '@caribeng/ui/caribe/file-select';
import { CbFileUpload } from '@caribeng/ui/fileupload';
import { CbFloatLabel } from '@caribeng/ui/floatlabel';
import { CbFloatMenu } from '@caribeng/ui/caribe/float-menu';
import { CbFooter } from '@caribeng/ui/caribe/footer';
import { CbGalleria } from '@caribeng/ui/galleria';
import { CbHeader } from '@caribeng/ui/caribe/header';
import { CbIcon } from '@caribeng/ui/icon';
import { CbIconButton } from '@caribeng/ui/caribe/icon-button';
import { CbIconField } from '@caribeng/ui/iconfield';
import { CbIllustration } from '@caribeng/ui/caribe/illustration';
import { CbImage } from '@caribeng/ui/image';
import { CbPdfViewer } from '@caribeng/ui/pdfviewer';
import { CbInlineAlert } from '@caribeng/ui/caribe/inline-alert';
import { CbInlineMessage } from '@caribeng/ui/inlinemessage';
import { CbInplace } from '@caribeng/ui/inplace';
import { CbInput } from '@caribeng/ui/input';
import { CbInputDate } from '@caribeng/ui/caribe/input-date';
import { CbInputGroup, CbInputGroupAddon } from '@caribeng/ui/inputgroup';
import { CbInputMask } from '@caribeng/ui/inputmask';
import { CbInputNumber } from '@caribeng/ui/input-number';
import { CbInputOtp } from '@caribeng/ui/inputotp';
import { CbInputSearch } from '@caribeng/ui/caribe/input-search';
import { CbInputSelect } from '@caribeng/ui/caribe/input-select';
import { CbInputToken } from '@caribeng/ui/caribe/input-token';
import { CbKnob } from '@caribeng/ui/knob';
import { CbLink } from '@caribeng/ui/caribe/link';
import { CbListBox } from '@caribeng/ui/listbox';
import { CbLoader } from '@caribeng/ui/caribe/loader';
import { CbLogo } from '@caribeng/ui/caribe/logo';
import { CbMegaMenu } from '@caribeng/ui/megamenu';
import { CbMenu } from '@caribeng/ui/menu';
import { CbMenubar } from '@caribeng/ui/menubar';
import { CbMessage } from '@caribeng/ui/message';
import { CbMeterGroup } from '@caribeng/ui/metergroup';
import { CbModal } from '@caribeng/ui/caribe/modal';
import { CbMultiSelect } from '@caribeng/ui/multiselect';
import { CbOffCanvas } from '@caribeng/ui/caribe/off-canvas';
import { CbOnboarding } from '@caribeng/ui/caribe/onboarding';
import { CbOrderList } from '@caribeng/ui/orderlist';
import { CbOrganizationChart } from '@caribeng/ui/organizationchart';
import { CbPaginator } from '@caribeng/ui/paginator';
import { CbPanel } from '@caribeng/ui/panel';
import { CbPanelMenu } from '@caribeng/ui/panelmenu';
import { CbPassword } from '@caribeng/ui/password';
import { CbPickList } from '@caribeng/ui/picklist';
import { CbPictogram } from '@caribeng/ui/caribe/pictogram';
import { CbPopOver } from '@caribeng/ui/caribe/pop-over';
import { CbPopover } from '@caribeng/ui/popover';
import { CbPreloader } from '@caribeng/ui/caribe/preloader';
import { CbProgressBar as CbProgressBar___caribeng_ui_progressbar } from '@caribeng/ui/progressbar';
import { CbProgressBar } from '@caribeng/ui/caribe/progress-bar';
import { CbRadio } from '@caribeng/ui/radio';
import { CbRadioGroup } from '@caribeng/ui/radio';
import { CbRating } from '@caribeng/ui/rating';
import { CbScrollPanel } from '@caribeng/ui/scrollpanel';
import { CbScrollTop } from '@caribeng/ui/scrolltop';
import { CbSelect } from '@caribeng/ui/select';
import { CbSelectButton } from '@caribeng/ui/selectbutton';
import { CbShortcut } from '@caribeng/ui/caribe/shortcut';
import { CbSkeleton } from '@caribeng/ui/skeleton';
import { CbSlider } from '@caribeng/ui/slider';
import { CbSpeedDial } from '@caribeng/ui/speeddial';
import { CbSplitButton } from '@caribeng/ui/splitbutton';
import { CbThemeToggle } from '@caribeng/ui/themetoggle';
import { CbStatistic } from '@caribeng/ui/statistic';
import { CbEmpty } from '@caribeng/ui/empty';
import { CbCopyButton } from '@caribeng/ui/copy-button';
import { CbChatMessage } from '@caribeng/ui/chat';
import { CbCodeBlock } from '@caribeng/ui/code-block';
import { CbPhoneInput } from '@caribeng/ui/phone-input';
import { CbKanban } from '@caribeng/ui/kanban';
import { CbGantt } from '@caribeng/ui/gantt';
import { CbMasonry } from '@caribeng/ui/masonry';
import { CbInfiniteScroll } from '@caribeng/ui/infinite-scroll';
import { CbImageCropper } from '@caribeng/ui/image-cropper';
import { CbSignaturePad } from '@caribeng/ui/signature-pad';
import { CbComments } from '@caribeng/ui/comments';
import { CbNotificationCenter } from '@caribeng/ui/notification-center';
import { CbMentions } from '@caribeng/ui/mentions';
import { CbCommandPalette } from '@caribeng/ui/command-palette';
import { CbSidebar } from '@caribeng/ui/sidebar';
import { CbKbd } from '@caribeng/ui/kbd';
import { CbQrcode } from '@caribeng/ui/qrcode';
import { CbDescriptions } from '@caribeng/ui/descriptions';
import { CbResult } from '@caribeng/ui/result';
import { CbAnchor } from '@caribeng/ui/anchor';
import { CbSpinner } from '@caribeng/ui/spinner';
import { CbSplitter } from '@caribeng/ui/splitter';
import { CbStatus } from '@caribeng/ui/caribe/status';
import { CbStepIndicator } from '@caribeng/ui/caribe/step-indicator';
import { CbStepper } from '@caribeng/ui/stepper';
import { CbSteps } from '@caribeng/ui/steps';
import { CbStroke } from '@caribeng/ui/caribe/stroke';
import { CbSwitch } from '@caribeng/ui/caribe/switch';
import { CbTable } from '@caribeng/ui/table';
import { CbTabMenu } from '@caribeng/ui/tabmenu';
import { CbTabs } from '@caribeng/ui/tabs';
import { CbTag } from '@caribeng/ui/tag';
import { CbTagButton } from '@caribeng/ui/caribe/tag-button';
import { CbTerminal } from '@caribeng/ui/terminal';
import { CbTextarea } from '@caribeng/ui/textarea';
import { CbTieredMenu } from '@caribeng/ui/tieredmenu';
import { CbTimeline } from '@caribeng/ui/timeline';
import { CbToast } from '@caribeng/ui/toast';
import { CbToggle } from '@caribeng/ui/toggle';
import { CbToggleButton } from '@caribeng/ui/togglebutton';
import { CbToolbar } from '@caribeng/ui/toolbar';
import { CbTooltipContent } from '@caribeng/ui/tooltip';
import { CbTracker } from '@caribeng/ui/caribe/tracker';
import { CbTransactionStatus } from '@caribeng/ui/caribe/transaction-status';
import { CbTree } from '@caribeng/ui/tree';
import { CbTreeSelect } from '@caribeng/ui/treeselect';
import { CbTreeTable } from '@caribeng/ui/treetable';
import { CbVirtualScroller } from '@caribeng/ui/virtualscroller';
import { CbVoucher } from '@caribeng/ui/caribe/voucher';

export const DOC_API: Record<string, DocApi> = {
  "cb-accordion": {
    component: CbAccordion,
    demo: DocPgAccordion,
    selector: "cb-accordion",
    codeContent: "<cb-accordion-panel header=\"What is CaribeNG?\">Accessible Angular components built on signals.</cb-accordion-panel>\n<cb-accordion-panel header=\"Does it support dark mode?\">Yes, every component uses CSS tokens for both themes.</cb-accordion-panel>\n<cb-accordion-panel header=\"Is it accessible?\">It follows WCAG 2.2 AA with full keyboard support.</cb-accordion-panel>",
    props: [
      { name: "multiple", kind: "boolean", type: "boolean", default: false, description: "Permite varios paneles abiertos a la vez." }
    ]
  },
  "cb-alert": {
    component: CbAlert,
    selector: "cb-alert",
    content: { default: "Content" },
    props: [
      { name: "title", kind: "string", type: "string", default: "", example: "Payment scheduled", description: "" },
      { name: "severity", kind: "enum", type: "'success' | 'warning' | 'error' | 'info'", options: ["success", "warning", "error", "info"], default: "info", description: "" },
      { name: "closable", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "visible", kind: "boolean", type: "boolean (model)", default: true, description: "" }
    ],
    events: [
      { name: "closed", type: "void", description: "" }
    ]
  },
  "cb-animation-lottie": {
    component: CbAnimationLottie,
    selector: "cb-animation-lottie",
    props: [
      { name: "src", kind: "string", type: "string", default: "", description: "" },
      { name: "autoplay", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "loop", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "size", kind: "string", type: "string", default: "96px", description: "" },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "animation", description: "" }
    ]
  },
  "cb-autocomplete": {
    component: CbAutocomplete,
    selector: "cb-autocomplete",
    props: [
      { name: "value", kind: "string", type: "unknown (model)", default: null, description: "Valor seleccionado (two-way opcional fuera de Angular Forms).", control: false },
      { name: "suggestions", kind: "string", type: "readonly unknown[]", default: [], example: ['Angular', 'React', 'Vue', 'Svelte', 'Solid'], description: "Sugerencias a mostrar (las provee y filtra el consumidor).", control: false },
      { name: "optionLabel", kind: "string", type: "string", default: "label", description: "" },
      { name: "optionValue", kind: "string", type: "string | null", default: null, description: "" },
      { name: "placeholder", kind: "string", type: "string", default: "", description: "" },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "" },
      { name: "minLength", kind: "number", type: "number", default: 1, description: "Caracteres mínimos para disparar `complete`." },
      { name: "delay", kind: "number", type: "number", default: 300, description: "Debounce (ms) antes de emitir `complete`." },
      { name: "forceSelection", kind: "boolean", type: "boolean", default: true, description: "Exige elegir una opción de la lista (si no, al salir se limpia)." },
      { name: "dropdown", kind: "boolean", type: "boolean", default: false, description: "Muestra un botón para desplegar todas las sugerencias." },
      { name: "emptyMessage", kind: "string", type: "string", default: undefined, localeKey: "noResults", description: "" },
      { name: "label", kind: "string", type: "string", default: "", example: "Framework", description: "" },
      { name: "hint", kind: "string", type: "string", default: "", description: "" },
      { name: "error", kind: "string", type: "string", default: "", description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "required", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "requiredIndicator", kind: "enum", type: "'asterisk' | 'text' | 'optional' | 'none'", options: ["none", "asterisk", "text", "optional"], default: undefined, description: "Indicador de obligatoriedad en la etiqueta; si se omite usa el global de provideCaribeNG()." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "", control: false }
    ],
    events: [
      { name: "complete", type: "string", description: "Emite el texto de búsqueda para que el consumidor filtre." },
      { name: "optionSelected", type: "unknown", description: "Emite la opción elegida." }
    ]
  },
  "cb-avatar": {
    component: CbAvatar,
    selector: "cb-avatar",
    props: [
      { name: "image", kind: "string", type: "string", default: "", description: "URL de la imagen." },
      { name: "label", kind: "string", type: "string", default: "", example: "OZ", description: "Iniciales o texto corto (si no hay imagen ni icono)." },
      { name: "icon", kind: "string", type: "string", default: "", description: "Icono (nombre del set de iconos)." },
      { name: "size", kind: "enum", type: "'sm' | 'md' | 'lg' | 'xl' | number", options: ["sm", "md", "lg", "xl"], default: "md", description: "Tamaño: `sm` (28) · `md` (40) · `lg` (56) · `xl` (80) o un número en px." },
      { name: "shape", kind: "enum", type: "'circle' | 'square'", options: ["circle", "square"], default: "circle", description: "Forma." },
      { name: "severity", kind: "enum", type: "CbSeverity", options: ["primary", "secondary", "success", "warning", "danger", "info", "help", "contrast"], default: "secondary", description: "Color de fondo cuando se muestran iniciales/icono." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "Nombre accesible." }
    ]
  },
  "cb-avatar-group": {
    component: CbAvatarGroup,
    selector: "cb-avatar-group",
    content: {
      default: "",
      children: [
        { component: CbAvatar, selector: "cb-avatar", inputs: { label: "OZ", severity: "primary" } },
        { component: CbAvatar, selector: "cb-avatar", inputs: { label: "CL", severity: "info" } },
        { component: CbAvatar, selector: "cb-avatar", inputs: { label: "CX", severity: "success" } },
        { component: CbAvatar, selector: "cb-avatar", inputs: { label: "+3", severity: "secondary" } }
      ]
    },
    props: [
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, description: "Nombre accesible del grupo (p. ej. \"Participantes\")." }
    ]
  },
  "cb-badge": {
    component: CbBadge,
    selector: "cb-badge",
    props: [
      { name: "value", kind: "string", type: "string | number", default: "", example: "4", description: "Contenido (conteo o texto breve)." },
      { name: "severity", kind: "enum", type: "CbSeverity", options: ["primary", "secondary", "success", "warning", "danger", "info", "help", "contrast"], default: "primary", description: "Severidad semántica (color)." },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "Tamaño." },
      { name: "dot", kind: "boolean", type: "boolean", default: false, description: "Muestra solo un punto (sin texto)." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "Nombre accesible con contexto (p. ej. \"3 mensajes sin leer\"). Sin él, un dot es decorativo." }
    ]
  },
  "cb-block-ui": {
    component: CbBlockUi,
    selector: "cb-block-ui",
    content: { default: "Content" },
    props: [
      { name: "blocked", kind: "boolean", type: "boolean", default: false, description: "Bloquea el contenido: lo hace inerte y muestra la máscara." },
      { name: "message", kind: "string", type: "string", default: undefined, localeKey: "loading", description: "Texto que anuncia el lector de pantalla al bloquear." }
    ]
  },
  "cb-breadcrumb": {
    component: CbBreadcrumb,
    selector: "cb-breadcrumb",
    props: [
      { name: "items", kind: "string", type: "readonly CbBreadcrumbItem[]", default: [], example: [{ label: 'Home' }, { label: 'Components' }, { label: 'Breadcrumb' }], description: "", control: false },
      { name: "separator", kind: "string", type: "string", default: "chevron-right", description: "Icono separador entre elementos." }
    ],
    events: [
      { name: "itemClick", type: "CbBreadcrumbItem", description: "Se emite al hacer clic en un elemento con enlace." }
    ]
  },
  "cb-button": {
    component: CbButton,
    selector: "cb-button",
    content: { default: "Content" },
    props: [
      { name: "severity", kind: "enum", type: "CbSeverity", options: ["primary", "secondary", "success", "warning", "danger", "info", "help", "contrast"], default: "primary", description: "Severidad semántica (color)." },
      { name: "variant", kind: "enum", type: "CbButtonVariant", options: ["solid", "outlined", "text"], default: "solid", description: "Variante visual." },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "Tamaño del botón." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilita el botón." },
      { name: "loading", kind: "boolean", type: "boolean", default: false, description: "Muestra un spinner y bloquea la interacción." },
      { name: "fullWidth", kind: "boolean", type: "boolean", default: false, description: "Ocupa todo el ancho disponible." },
      { name: "type", kind: "enum", type: "CbButtonType", options: ["button", "submit", "reset"], default: "button", description: "Tipo nativo del botón." }
    ]
  },
  "cb-button-group": {
    component: CbButtonGroup,
    selector: "cb-button-group",
    content: {
      default: "",
      children: [
        { component: CbButton, selector: "cb-button", inputs: { size: "sm" }, text: "Day" },
        { component: CbButton, selector: "cb-button", inputs: { size: "sm", variant: "outlined" }, text: "Month" },
        { component: CbButton, selector: "cb-button", inputs: { size: "sm", variant: "outlined" }, text: "Year" }
      ]
    },
    props: [
      { name: "orientation", kind: "enum", type: "'horizontal' | 'vertical'", options: ["horizontal", "vertical"], default: "horizontal", description: "Dirección del grupo." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "actionGroup", description: "Etiqueta accesible del grupo." }
    ]
  },
  "cb-calendar": {
    component: CbCalendar,
    selector: "cb-calendar",
    props: [
      { name: "monthLabel", kind: "string", type: "string", default: "", example: "Octubre 2026", description: "" },
      { name: "totalDays", kind: "number", type: "number", default: 31, description: "" },
      { name: "selectedDay", kind: "number", type: "number (model)", default: 17, description: "" }
    ]
  },
  "cb-card": {
    component: CbCard,
    selector: "cb-card",
    content: { default: "Content" },
    props: [
      { name: "header", kind: "string", type: "string", default: "", example: "Savings account", description: "Título del encabezado." },
      { name: "subtitle", kind: "string", type: "string", default: "", example: "**** 1234", description: "Subtítulo bajo el título." }
    ]
  },
  "cb-card-content": {
    component: CbCardContent,
    selector: "cb-card-content",
    content: { default: "Content" },
    props: [
      { name: "title", kind: "string", type: "string", default: "", example: "Monthly summary", description: "" },
      { name: "subtitle", kind: "string", type: "string", default: "", example: "October 2026", description: "" },
      { name: "actionLabel", kind: "string", type: "string", default: undefined, localeKey: "viewDetails", description: "" }
    ],
    events: [
      { name: "action", type: "void", description: "" }
    ]
  },
  "cb-card-move": {
    component: CbCardMove,
    selector: "cb-card-move",
    props: [
      { name: "items", kind: "string", type: "readonly string[] (model)", default: [], example: ['First card', 'Second card', 'Third card'], description: "", control: false }
    ]
  },
  "cb-card-primary": {
    component: CbCardPrimary,
    selector: "cb-card-primary",
    content: { default: "Content" },
    props: [
      { name: "title", kind: "string", type: "string", default: "", example: "Available balance", description: "" },
      { name: "subtitle", kind: "string", type: "string", default: "", example: "Savings", description: "" },
      { name: "value", kind: "string", type: "string", default: "", example: "$ 2,450.00", description: "" }
    ]
  },
  "cb-card-select": {
    component: CbCardSelect,
    selector: "cb-card-select",
    props: [
      { name: "items", kind: "string", type: "readonly string[]", default: [], example: ['Checking account', 'Savings account', 'Credit card'], description: "", control: false },
      { name: "label", kind: "string", type: "string", default: undefined, localeKey: "options", description: "" },
      { name: "selected", kind: "string", type: "string | null (model)", default: null, description: "" },
      { name: "query", kind: "string", type: "string (model)", default: "", description: "" }
    ],
    events: [
      { name: "selectionChange", type: "string", description: "" }
    ]
  },
  "cb-carousel": {
    component: CbCarousel,
    selector: "cb-carousel",
    props: [
      { name: "items", kind: "string", type: "CbCarouselItem[]", default: [], example: [{ title: 'Slide One', description: 'First slide.' }, { title: 'Slide Two', description: 'Second slide.' }, { title: 'Slide Three', description: 'Third slide.' }], description: "", control: false },
      { name: "circular", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "showNavigators", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "showIndicators", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "carousel", description: "" },
      { name: "page", kind: "number", type: "number (model)", default: 0, description: "" }
    ]
  },
  "cb-cascade-select": {
    component: CbCascadeSelect,
    selector: "cb-cascade-select",
    props: [
      { name: "options", kind: "string", type: "CbCascadeOption[]", default: [], example: [{ label: 'Americas', children: [{ label: 'Colombia', value: 'co' }, { label: 'United States', value: 'us' }] }, { label: 'Europe', children: [{ label: 'Spain', value: 'es' }] }], description: "", control: false },
      { name: "placeholder", kind: "string", type: "string", default: undefined, localeKey: "select", description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "value", kind: "string", type: "string | null (model)", default: null, description: "" }
    ]
  },
  "cb-chart": {
    component: CbChart,
    selector: "cb-chart",
    props: [
      { name: "type", kind: "enum", type: "CbChartType", options: ["bar", "horizontalBar", "line", "area", "waterfall", "pie", "doughnut", "radialBar", "gauge", "radar", "polarArea", "heatmap", "treemap"], default: "bar", description: "Tipo de gráfico." },
      { name: "data", kind: "string", type: "CbChartData | CbChartRecord[]", default: { labels: [], datasets: [] }, example: { labels: ['Jan', 'Feb', 'Mar', 'Apr'], datasets: [{ label: 'Sales', data: [12, 19, 8, 15] }, { label: 'Costs', data: [7, 11, 10, 9] }] }, description: "Etiquetas y series (label, data, color, colors, type).", control: false },
      { name: "stacked", kind: "boolean", type: "boolean", default: false, description: "Apila las series de barras o áreas." },
      { name: "sparkline", kind: "boolean", type: "boolean", default: false, description: "Minigráfico sin ejes, rejilla, leyenda ni tarjeta." },
      { name: "height", kind: "number", type: "number", default: 220, description: "Alto en píxeles; el ancho se adapta al contenedor." },
      { name: "showLegend", kind: "boolean", type: "boolean", default: true, description: "Muestra la leyenda (botones que ocultan y muestran series)." },
      { name: "valueFormat", kind: "string", type: "Intl.NumberFormatOptions | ((v: number) => string)", default: undefined, description: "Formato de los valores en ejes, tooltip y tabla.", control: false },
      { name: "locale", kind: "enum", type: "string", options: ["es-CO", "es-ES", "en-US", "pt-BR"], default: undefined, description: "Locale BCP 47 del formato (por defecto, el del idioma activo de CaribeNG)." },
      { name: "min", kind: "number", type: "number", default: 0, description: "Valor mínimo del medidor (gauge)." },
      { name: "max", kind: "number", type: "number", default: 100, description: "Valor que representa el 100 % en radialBar y el máximo del medidor (gauge)." },
      { name: "bands", kind: "string", type: "CbChartBand[]", default: [], description: "Franjas de color del medidor: { from, to, color }.", control: false },
      { name: "animate", kind: "boolean", type: "boolean", default: true, description: "Animación de entrada (respeta prefers-reduced-motion)." },
      { name: "zoom", kind: "boolean", type: "boolean", default: false, description: "Modo composable: zoom y desplazamiento en el eje X (rueda, arrastre, + / − / 0).", control: false },
      { name: "xWindow", kind: "number", type: "number", default: undefined, description: "Modo composable: muestra los últimos xWindow del eje X (ms en un eje de tiempo); la vista avanza con los datos nuevos.", control: false },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "chart", description: "Nombre accesible del gráfico y título de su tabla de datos." }
    ],
    events: [
      { name: "itemSelect", type: "CbChartItemEvent", description: "Clic o Enter sobre una categoría, un segmento o una celda: { index, label }." }
    ]
  },
  "cb-checkbox": {
    component: CbCheckbox,
    selector: "cb-checkbox",
    props: [
      { name: "label", kind: "string", type: "string", default: "", example: "Accept terms and conditions", description: "Etiqueta mostrada junto al control." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "`aria-label` cuando no hay `label` visible." },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "Tamaño." },
      { name: "value", kind: "string", type: "boolean", default: true, description: "Valor que aporta a la lista cuando el modelo enlazado es un array.", control: false },
      { name: "indeterminate", kind: "boolean", type: "boolean", default: false, description: "Estado indeterminado (visual + `aria-checked=\"mixed\"`)." },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido." },
      { name: "required", kind: "boolean", type: "boolean", default: false, description: "Requerido." },
      { name: "requiredIndicator", kind: "enum", type: "'asterisk' | 'text' | 'optional' | 'none'", options: ["none", "asterisk", "text", "optional"], default: undefined, description: "Indicador de obligatoriedad en la etiqueta; si se omite usa el global de provideCaribeNG()." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilitado de forma declarativa (se combina con Angular Forms)." },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "Id del input; se genera uno estable si no se provee.", control: false }
    ],
    events: [
      { name: "changed", type: "boolean | unknown[]", description: "Emite el nuevo estado al cambiar." }
    ]
  },
  "cb-chip": {
    component: CbChip,
    selector: "cb-chip",
    content: { default: "Content" },
    props: [
      { name: "label", kind: "string", type: "string", default: "", example: "Angular", description: "" },
      { name: "icon", kind: "string", type: "string", default: "", description: "" },
      { name: "image", kind: "string", type: "string", default: "", description: "" },
      { name: "removable", kind: "boolean", type: "boolean", default: false, description: "" }
    ],
    events: [
      { name: "removed", type: "MouseEvent", description: "" }
    ]
  },
  "cb-chips": {
    component: CbChips,
    selector: "cb-chips",
    props: [
      { name: "value", kind: "string", type: "string[] (model)", default: [], example: ['angular', 'design', 'caribe'], description: "", control: false },
      { name: "placeholder", kind: "string", type: "string", default: "", description: "" },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "readonly", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "max", kind: "number", type: "number", default: 0, description: "Máximo de chips (0 = sin límite)." },
      { name: "allowDuplicate", kind: "boolean", type: "boolean", default: false, description: "Permite valores repetidos." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "" },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "", control: false }
    ],
    events: [
      { name: "added", type: "string", description: "" },
      { name: "removed", type: "string", description: "" }
    ]
  },
  "cb-circle-loading": {
    component: CbCircleLoading,
    selector: "cb-circle-loading",
    props: [
      { name: "progress", kind: "number", type: "number", default: 65, description: "" },
      { name: "size", kind: "number", type: "number", default: 48, description: "" },
      { name: "indeterminate", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "label", kind: "string", type: "string", default: undefined, localeKey: "loading", description: "" }
    ]
  },
  "cb-coachmark": {
    component: CbCoachmark,
    selector: "cb-coachmark",
    props: [
      { name: "steps", kind: "string", type: "readonly string[]", default: [], example: ['Welcome aboard', 'Set up your account', 'You are all set'], description: "", control: false },
      { name: "visible", kind: "boolean", type: "boolean (model)", default: true, description: "" },
      { name: "index", kind: "number", type: "number (model)", default: 0, description: "" }
    ],
    events: [
      { name: "stepChange", type: "number", description: "" }
    ]
  },
  "cb-colorpicker": {
    component: CbColorPicker,
    selector: "cb-colorpicker",
    props: [
      { name: "value", kind: "string", type: "string (model)", default: "#10b981", description: "Color seleccionado (hex `#rrggbb`). Two-way opcional fuera de Forms." },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "" },
      { name: "showValue", kind: "boolean", type: "boolean", default: true, description: "Muestra el texto del hex junto al swatch del trigger." },
      { name: "presets", kind: "string", type: "readonly string[]", default: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'], description: "Colores predefinidos; `[]` los oculta.", control: false },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "" },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "", control: false }
    ]
  },
  "cb-confirm-dialog": {
    component: CbConfirmDialog,
    selector: "cb-confirm-dialog",
    props: [
      { name: "visible", kind: "boolean", type: "boolean (model)", default: false, description: "" },
      { name: "header", kind: "string", type: "string", default: undefined, localeKey: "confirm", description: "" },
      { name: "message", kind: "string", type: "string", default: undefined, localeKey: "confirmMessage", description: "" },
      { name: "acceptLabel", kind: "string", type: "string", default: undefined, localeKey: "accept", description: "" },
      { name: "rejectLabel", kind: "string", type: "string", default: undefined, localeKey: "cancel", description: "" },
      { name: "acceptSeverity", kind: "enum", type: "'primary' | 'danger' | 'success' | 'warning'", options: ["primary", "danger", "success", "warning"], default: "primary", description: "Color del botón de aceptar." },
      { name: "service", kind: "boolean", type: "boolean", default: false, description: "Muestra las confirmaciones pedidas con CbConfirmationService.", control: false },
      { name: "key", kind: "string", type: "string", default: undefined, description: "Con service: atiende solo las confirmaciones con este key.", control: false }
    ],
    events: [
      { name: "accepted", type: "void", description: "" },
      { name: "rejected", type: "void", description: "" }
    ]
  },
  "cb-confirm-popup": {
    component: CbConfirmPopup,
    selector: "cb-confirm-popup",
    props: [
      { name: "visible", kind: "boolean", type: "boolean (model)", default: false, description: "" },
      { name: "message", kind: "string", type: "string", default: undefined, localeKey: "confirmMessage", description: "" },
      { name: "acceptLabel", kind: "string", type: "string", default: undefined, localeKey: "accept", description: "" },
      { name: "rejectLabel", kind: "string", type: "string", default: undefined, localeKey: "cancel", description: "" },
      { name: "acceptSeverity", kind: "enum", type: "'primary' | 'danger' | 'success' | 'warning'", options: ["primary", "danger", "success", "warning"], default: "primary", description: "Color del botón de aceptar." },
      { name: "service", kind: "boolean", type: "boolean", default: false, description: "Muestra las confirmaciones pedidas con CbConfirmationService.", control: false },
      { name: "key", kind: "string", type: "string", default: undefined, description: "Con service: atiende solo las confirmaciones con este key.", control: false }
    ],
    events: [
      { name: "accepted", type: "void", description: "" },
      { name: "rejected", type: "void", description: "" }
    ]
  },
  "cb-contextmenu": {
    component: CbContextMenu,
    selector: "cb-contextmenu",
    content: { default: "Right-click this text to open the menu." },
    props: [
      { name: "items", kind: "string", type: "readonly CbContextMenuItem[]", default: [], example: [{ label: 'New' }, { label: 'Open' }, { label: 'Save' }, { separator: true }, { label: 'Export' }], description: "", control: false },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "contextMenu", description: "" }
    ],
    events: [
      { name: "itemSelect", type: "CbContextMenuItem", description: "" }
    ]
  },
  "cb-data-table": {
    component: CbDataTable,
    selector: "cb-data-table",
    props: [
      { name: "columns", kind: "string", type: "readonly string[]", default: [], example: ['name', 'email', 'role'], description: "", control: false },
      { name: "rows", kind: "string", type: "readonly Record<string, unknown>[]", default: [], example: [{ name: 'Laura Gómez', email: 'laura@caribe.dev', role: 'Admin' }, { name: 'Andrés Ruiz', email: 'andres@caribe.dev', role: 'Editor' }, { name: 'Sofía Mena', email: 'sofia@caribe.dev', role: 'Viewer' }], description: "Filas: objetos con una propiedad por columna.", control: false },
      { name: "emptyMessage", kind: "string", type: "string", default: undefined, localeKey: "noData", description: "" },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, description: "Nombre accesible de la tabla.", control: false }
    ]
  },
  "cb-dataview": {
    component: CbDataView,
    selector: "cb-dataview",
    props: [
      { name: "value", kind: "string", type: "readonly CbDataViewItem[]", default: [], example: [{ id: 1, title: 'Wireless Mouse', category: 'Accessories', description: 'Ergonomic, 2.4GHz.' }, { id: 2, title: 'Mechanical Keyboard', category: 'Accessories', description: 'RGB backlight.' }], description: "", control: false },
      { name: "layout", kind: "enum", type: "'grid'|'list' (model)", options: ["grid", "list"], default: "grid", description: "" },
      { name: "showLayoutToggle", kind: "boolean", type: "boolean", default: false, description: "Muestra el selector de vista lista / cuadrícula." },
      { name: "rows", kind: "number", type: "number", default: 0, description: "Elementos por página (0 = sin paginar)." },
      { name: "dataKey", kind: "string", type: "string", default: "id", description: "Propiedad que identifica cada elemento.", control: false },
      { name: "selection", kind: "string", type: "CbDataViewItem|null (model)", default: null, description: "", control: false },
      { name: "emptyMessage", kind: "string", type: "string", default: undefined, localeKey: "noResults", description: "" }
    ]
  },
  "cb-datepicker": {
    component: CbDatepicker,
    selector: "cb-datepicker",
    props: [
      { name: "value", kind: "string", type: "Date | null (model)", default: null, description: "Fecha seleccionada (two-way opcional fuera de Angular Forms).", control: false },
      { name: "label", kind: "string", type: "string", default: "", example: "Payment date", description: "" },
      { name: "hint", kind: "string", type: "string", default: "", description: "" },
      { name: "error", kind: "string", type: "string", default: "", description: "" },
      { name: "placeholder", kind: "string", type: "string", default: "", description: "" },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "required", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "requiredIndicator", kind: "enum", type: "'asterisk' | 'text' | 'optional' | 'none'", options: ["none", "asterisk", "text", "optional"], default: undefined, description: "Indicador de obligatoriedad en la etiqueta; si se omite usa el global de provideCaribeNG()." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "", control: false },
      { name: "locale", kind: "enum", type: "string | undefined", options: ["es-CO", "es-ES", "en-US", "pt-BR"], default: undefined, description: "Locale BCP 47 para nombres y formato (por defecto el del navegador)." },
      { name: "firstDayOfWeek", kind: "number", type: "number", default: 0, description: "Primer día de la semana: 0 = domingo (por defecto), 1 = lunes." },
      { name: "minDate", kind: "string", type: "Date | null", default: null, description: "Fecha mínima seleccionable.", control: false },
      { name: "maxDate", kind: "string", type: "Date | null", default: null, description: "Fecha máxima seleccionable.", control: false },
      { name: "selectionMode", kind: "enum", type: "'single' | 'range'", options: ["single", "range"], default: "single", description: "Una fecha o un rango [inicio, fin]." },
      { name: "view", kind: "enum", type: "'date' | 'month' | 'year'", options: ["date", "month", "year"], default: "date", description: "Qué se elige: un día, un mes (día 1) o un año (1 de enero)." },
      { name: "numberOfMonths", kind: "number", type: "number", default: undefined, description: "Meses visibles a la vez; por defecto 2 en rangos y 1 en fecha simple." },
      { name: "dateFormat", kind: "string", type: "string", default: undefined, example: "dd/mm/yy", description: "Formato con la sintaxis de PrimeNG (d, dd, D, DD, m, mm, M, MM, y, yy, o, oo, @, !, 'texto')." },
      { name: "editable", kind: "boolean", type: "boolean", default: false, description: "Permite escribir la fecha con dateFormat (se aplica con Enter o al salir)." },
      { name: "presets", kind: "string", type: "(CbDatePresetKey | CbDatePreset)[]", default: [], description: "Atajos junto al calendario: claves (today, last7Days, thisMonth…) u objetos { label, value }.", control: false },
      { name: "range", kind: "string", type: "CbDateRange | null (model)", default: null, description: "Rango elegido en modo range: [inicio, fin].", control: false },
      { name: "showTime", kind: "boolean", type: "boolean", default: false, description: "Añade horas y minutos (en rangos, del inicio y del fin)." },
      { name: "hourFormat", kind: "enum", type: "'24' | '12'", options: ["24", "12"], default: "24", description: "Formato de la hora: 24 h o 12 h con AM/PM." },
      { name: "stepMinute", kind: "number", type: "number", default: 1, description: "Paso de los minutos." }
    ]
  },
  "cb-dialog": {
    component: CbDialog,
    selector: "cb-dialog",
    content: { default: "Content" },
    props: [
      { name: "visible", kind: "boolean", type: "boolean (model)", default: false, description: "Visibilidad del diálogo (two-way)." },
      { name: "header", kind: "string", type: "string", default: "", example: "Confirm transfer", description: "Título del encabezado. Si se omite, usa `ariaLabel`." },
      { name: "closable", kind: "boolean", type: "boolean", default: true, description: "Muestra el botón de cerrar (✕)." },
      { name: "dismissableMask", kind: "boolean", type: "boolean", default: true, description: "Cierra al hacer clic en el backdrop." },
      { name: "closeOnEscape", kind: "boolean", type: "boolean", default: true, description: "Cierra con la tecla Escape." },
      { name: "width", kind: "string", type: "string", default: "32rem", description: "Ancho del panel." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "dialog", description: "Nombre accesible cuando no hay `header`." }
    ],
    events: [
      { name: "onHide", type: "void", description: "Se emite cuando el diálogo se cierra." },
      { name: "onShow", type: "void", description: "Se emite cuando el diálogo se abre." }
    ]
  },
  "cb-divider": {
    component: CbDivider,
    selector: "cb-divider",
    content: { default: "Content" },
    props: [
      { name: "orientation", kind: "enum", type: "'horizontal' | 'vertical'", options: ["horizontal", "vertical"], default: "horizontal", description: "" },
      { name: "align", kind: "enum", type: "'start' | 'center' | 'end'", options: ["start", "center", "end"], default: "center", description: "Posición de la etiqueta (solo horizontal)." },
      { name: "type", kind: "enum", type: "'solid' | 'dashed' | 'dotted'", options: ["solid", "dashed", "dotted"], default: "solid", description: "Estilo de la línea." }
    ]
  },
  "cb-dock": {
    component: CbDock,
    selector: "cb-dock",
    props: [
      { name: "items", kind: "string", type: "readonly CbDockItem[]", default: [], example: [{ label: 'Home', icon: 'house' }, { label: 'Search', icon: 'search' }, { label: 'Profile', icon: 'user' }, { label: 'Settings', icon: 'settings' }], description: "", control: false },
      { name: "position", kind: "enum", type: "CbDockPosition", options: ["top", "right", "bottom", "left"], default: "bottom", description: "" },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "appDock", description: "" }
    ],
    events: [
      { name: "itemSelect", type: "CbDockItem", description: "" }
    ]
  },
  "cb-dots-indicator": {
    component: CbDotsIndicator,
    selector: "cb-dots-indicator",
    props: [
      { name: "count", kind: "number", type: "number", default: 4, description: "Número de puntos." },
      { name: "activeIndex", kind: "number", type: "number (model)", default: 0, description: "Índice activo (two-way)." }
    ]
  },
  "cb-drawer": {
    component: CbDrawer,
    selector: "cb-drawer",
    content: { default: "Content" },
    props: [
      { name: "visible", kind: "boolean", type: "boolean (model)", default: false, description: "" },
      { name: "header", kind: "string", type: "string", default: "", example: "Filters", description: "" },
      { name: "position", kind: "enum", type: "CbDrawerPosition", options: ["left", "right", "top", "bottom"], default: "right", description: "" },
      { name: "closable", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "dismissableMask", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "closeOnEscape", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "panel", description: "" }
    ],
    events: [
      { name: "onShow", type: "void", description: "" },
      { name: "onHide", type: "void", description: "" }
    ]
  },
  "cb-dynamic-dialog": {
    component: CbDynamicDialog,
    selector: "cb-dynamic-dialog",
    content: { default: "" },
    props: [
      { name: "visible", kind: "boolean", type: "boolean (model)", default: false, description: "" },
      { name: "header", kind: "string", type: "string", default: undefined, localeKey: "dialog", description: "" },
      { name: "content", kind: "string", type: "string", default: "", example: "Your transfer was scheduled for tomorrow.", description: "" }
    ],
    events: [
      { name: "closed", type: "void", description: "" }
    ]
  },
  "cb-editor": {
    component: CbEditor,
    selector: "cb-editor",
    props: [
      { name: "placeholder", kind: "string", type: "string", default: undefined, localeKey: "editorPlaceholder", description: "" },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "textEditor", description: "Nombre accesible del área editable." },
      { name: "height", kind: "string", type: "string", default: "320px", description: "Alto mínimo del área de texto (se puede estirar desde la esquina)." },
      { name: "maxHeight", kind: "string", type: "string", default: undefined, description: "Alto máximo: a partir de él, el área hace scroll." },
      { name: "wordCount", kind: "boolean", type: "boolean", default: true, description: "Muestra palabras y caracteres al pie." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "required", kind: "boolean", type: "boolean", default: false, description: "Obligatorio (aria-required); con Angular Forms lo toma de Validators.required." },
      { name: "readonly", kind: "boolean", type: "boolean", default: false, description: "Muestra el contenido saneado sin barra ni edición." },
      { name: "maxLength", kind: "number", type: "number", default: undefined, description: "Máximo de caracteres de texto; muestra un contador." },
      { name: "toolbar", kind: "string", type: "CbEditorTool[]", default: undefined, description: "Herramientas de la barra y su orden ('|' separa grupos y '-' empieza otra fila). Por defecto, todas en dos filas.", control: false },
      { name: "images", kind: "boolean", type: "boolean", default: true, description: "Permite imágenes (botón, pegar y soltar)." },
      { name: "imageUpload", kind: "string", type: "(file: File) => Promise<string>", default: undefined, description: "Sube la imagen y devuelve su URL (el HTML guarda la URL, no la imagen).", control: false },
      { name: "maxImageSize", kind: "number", type: "number", default: 1048576, description: "Bytes máximos de una imagen insertada como data URL (sin imageUpload)." },
      { name: "pastePlainText", kind: "boolean", type: "boolean", default: false, description: "Pega siempre como texto plano." },
      { name: "fonts", kind: "string", type: "CbEditorFontGroup[]", default: undefined, description: "Tipografías del selector, por grupos (por defecto, CB_EDITOR_FONTS).", control: false },
      { name: "fontsHref", kind: "string", type: "string", default: undefined, description: "Hoja que carga las tipografías (por defecto, Google Fonts); vacía si las sirves tú.", control: false },
      { name: "bubbleMenu", kind: "boolean", type: "boolean", default: true, description: "Menú flotante de formato al seleccionar texto." },
      { name: "slashCommands", kind: "boolean", type: "boolean", default: true, description: "Escribir / abre un menú para insertar bloques." },
      { name: "autolink", kind: "boolean", type: "boolean", default: true, description: "Convierte las URL en enlaces al escribirlas o pegarlas." },
      { name: "typography", kind: "boolean", type: "boolean", default: true, description: "Corrección tipográfica al escribir: (c) → ©, ... → …, -> → →." },
      { name: "mentions", kind: "string", type: "CbEditorMention[] | (query) => CbEditorMention[] | Promise<CbEditorMention[]>", default: null, description: "Menciones con @ (lista fija o búsqueda, también asíncrona).", control: false },
      { name: "autosaveKey", kind: "string", type: "string", default: "", description: "Guarda un borrador en este navegador con esta clave y ofrece restaurarlo." },
      { name: "autosaveDelay", kind: "number", type: "number", default: 1000, description: "Espera (ms) tras la última tecla antes de guardar el borrador." },
      { name: "value", kind: "string", type: "string (model)", default: "", example: "<p>Hola <strong>CaribeNG</strong></p>", description: "HTML saneado y normalizado; '' si está vacío.", control: false }
    ],
    events: [
      { name: "imageError", type: "CbEditorImageError", description: "Una imagen no se insertó: { file, reason: 'type' | 'size' | 'upload' }." },
      { name: "mentionAdd", type: "CbEditorMention", description: "Se insertó una mención (los ids, con getMentions())." }
    ]
  },
  "cb-expansion-panel": {
    component: CbExpansionPanel,
    selector: "cb-expansion-panel",
    content: { default: "Content" },
    props: [
      { name: "title", kind: "string", type: "string", default: undefined, localeKey: "details", description: "Título de la cabecera." },
      { name: "expanded", kind: "boolean", type: "boolean (model)", default: false, description: "Estado abierto/cerrado (two-way)." }
    ]
  },
  "cb-fab-menu": {
    component: CbFabMenu,
    selector: "cb-fab-menu",
    props: [
      { name: "triggerLabel", kind: "string", type: "string", default: undefined, localeKey: "quickActions", description: "Etiqueta accesible del botón flotante." },
      { name: "items", kind: "string", type: "readonly CbFabMenuItem[]", default: [], example: [{ id: 'share', label: 'Share' }, { id: 'edit', label: 'Edit' }, { id: 'delete', label: 'Delete' }], description: "Acciones del menú.", control: false },
      { name: "open", kind: "boolean", type: "boolean (model)", default: false, description: "Estado desplegado (two-way)." }
    ],
    events: [
      { name: "itemSelected", type: "CbFabMenuItem", description: "Emite la acción seleccionada." }
    ]
  },
  "cb-fieldset": {
    component: CbFieldset,
    selector: "cb-fieldset",
    content: { default: "Content" },
    props: [
      { name: "legend", kind: "string", type: "string", default: "", example: "Personal data", description: "Texto de la leyenda del fieldset." },
      { name: "toggleable", kind: "boolean", type: "boolean", default: false, description: "Si es true, la leyenda funciona como botón para colapsar/expandir." },
      { name: "collapsed", kind: "boolean", type: "boolean (model)", default: false, description: "Estado colapsado (`[(collapsed)]`)." }
    ]
  },
  "cb-file-download": {
    component: CbFileDownload,
    selector: "cb-file-download",
    props: [
      { name: "fileName", kind: "string", type: "string", default: "", example: "Certificado_Bancario.pdf", description: "" },
      { name: "fileSize", kind: "string", type: "string", default: "", example: "420 KB", description: "" },
      { name: "href", kind: "string", type: "string", default: "", example: "pdf/extracto-demo.pdf", description: "" },
      { name: "buttonLabel", kind: "string", type: "string", default: undefined, localeKey: "download", description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" }
    ],
    events: [
      { name: "download", type: "string", description: "" }
    ]
  },
  "cb-file-select": {
    component: CbFileSelect,
    selector: "cb-file-select",
    props: [
      { name: "label", kind: "string", type: "string", default: undefined, localeKey: "selectDocument", description: "" },
      { name: "accept", kind: "string", type: "string", default: ".pdf,.png,.jpg", description: "" },
      { name: "multiple", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "files", kind: "string", type: "File[] (model)", default: [], description: "", control: false }
    ],
    events: [
      { name: "filesSelected", type: "File[]", description: "" }
    ]
  },
  "cb-file-upload": {
    component: CbFileUpload,
    selector: "cb-file-upload",
    props: [
      { name: "accept", kind: "string", type: "string", default: "", description: "" },
      { name: "multiple", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "maxFileSize", kind: "number", type: "number | null", default: null, description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "chooseLabel", kind: "string", type: "string", default: undefined, localeKey: "chooseFile", description: "" },
      { name: "uploadLabel", kind: "string", type: "string", default: undefined, localeKey: "upload", description: "" }
    ],
    events: [
      { name: "selectFiles", type: "CbFileUploadEvent", description: "" },
      { name: "uploadHandler", type: "CbFileUploadEvent", description: "" },
      { name: "rejectFiles", type: "CbFileRejectEvent", description: "Archivos descartados por tamaño (maxFileSize) o tipo (accept), con el motivo." }
    ]
  },
  "cb-float-label": {
    component: CbFloatLabel,
    selector: "cb-float-label",
    content: {
      default: "",
      children: [
        { component: CbInput, selector: "cb-input", inputs: { inputId: "pg-float-label" } },
        { selector: "label", attrs: { for: "pg-float-label" }, text: "Username" }
      ]
    },
    props: [
      { name: "variant", kind: "enum", type: "CbFloatLabelVariant", options: ["over", "in", "on"], default: "on", description: "" }
    ]
  },
  "cb-float-menu": {
    component: CbFloatMenu,
    selector: "cb-float-menu",
    props: [
      { name: "items", kind: "string", type: "readonly CbFloatMenuItem[]", default: [], example: [{ id: 'home', label: 'Home' }, { id: 'cards', label: 'Cards' }, { id: 'more', label: 'More' }], description: "Opciones del menú.", control: false },
      { name: "activeId", kind: "string", type: "string", default: "", description: "Id de la opción activa.", control: false },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "floatingMenu", description: "Etiqueta accesible." }
    ],
    events: [
      { name: "select", type: "CbFloatMenuItem", description: "Emite la opción seleccionada." }
    ]
  },
  "cb-footer": {
    component: CbFooter,
    selector: "cb-footer",
    content: { default: "Content" },
    props: [
      { name: "copyright", kind: "string", type: "string", default: "", example: "© 2026 CaribeNG Design System. Todos los derechos reservados.", description: "Texto de copyright." }
    ]
  },
  "cb-galleria": {
    component: CbGalleria,
    selector: "cb-galleria",
    props: [
      { name: "value", kind: "string", type: "CbGalleriaItem[]", default: [], example: [{ itemImageSrc: 'https://picsum.photos/id/10/800/500', thumbnailImageSrc: 'https://picsum.photos/id/10/120/80', alt: 'Forest', title: 'Forest' }, { itemImageSrc: 'https://picsum.photos/id/20/800/500', thumbnailImageSrc: 'https://picsum.photos/id/20/120/80', alt: 'Workspace', title: 'Workspace' }], description: "", control: false },
      { name: "showThumbnails", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "circular", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "activeIndex", kind: "number", type: "number (model)", default: 0, description: "" }
    ]
  },
  "cb-header": {
    component: CbHeader,
    selector: "cb-header",
    content: { default: "Content" },
    props: [
      { name: "title", kind: "string", type: "string", default: "", example: "CaribeNG", description: "Título principal." },
      { name: "subtitle", kind: "string", type: "string", default: "", example: "Welcome back", description: "Subtítulo opcional." },
      { name: "showBack", kind: "boolean", type: "boolean", default: false, description: "Muestra el botón de retroceso." }
    ],
    events: [
      { name: "backClick", type: "void", description: "Emite al pulsar retroceso." }
    ]
  },
  "cb-icon": {
    component: CbIcon,
    selector: "cb-icon",
    props: [
      { name: "name", kind: "string", type: "string", default: undefined, example: "house", description: "Nombre del icono en el registro (p. ej. `chevron-down`)." },
      { name: "size", kind: "enum", type: "CbIconSize", options: ["sm", "md", "lg", "xl"], default: "md", description: "Tamaño: `sm` (16) · `md` (20) · `lg` (24) · `xl` (32) o un número en px." },
      { name: "spin", kind: "boolean", type: "boolean", default: false, description: "Anima el icono girando (útil con `loader`)." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "Nombre accesible. Si se omite, el icono es decorativo (`aria-hidden`)." }
    ]
  },
  "cb-icon-button": {
    component: CbIconButton,
    selector: "cb-icon-button",
    props: [
      { name: "icon", kind: "string", type: "string", default: "plus", description: "Nombre del icono del set núcleo." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "action", description: "Etiqueta accesible del botón." },
      { name: "variant", kind: "enum", type: "'solid' | 'ghost'", options: ["solid", "ghost"], default: "solid", description: "Variante visual." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilita la acción." }
    ],
    events: [
      { name: "pressed", type: "MouseEvent", description: "Emite el evento de click." }
    ]
  },
  "cb-icon-field": {
    component: CbIconField,
    demo: DocPgIconField,
    selector: "cb-icon-field",
    codeContent: "<cb-input-icon><cb-icon name=\"search\" [size]=\"15\" /></cb-input-icon>\n<cb-input placeholder=\"Search…\" />",
    props: [
      { name: "iconPosition", kind: "enum", type: "CbIconFieldPosition", options: ["left", "right"], default: "left", description: "Lado del icono." }
    ]
  },
  "cb-illustration": {
    component: CbIllustration,
    selector: "cb-illustration",
    props: [
      { name: "name", kind: "string", type: "string", default: "transfer-success", description: "" },
      { name: "size", kind: "string", type: "string", default: "160px", description: "" },
      { name: "alt", kind: "string", type: "string", default: undefined, localeKey: "illustration", description: "" }
    ]
  },
  "cb-pdf-viewer": {
    component: CbPdfViewer,
    selector: "cb-pdf-viewer",
    props: [
      { name: "src", kind: "string", type: "string | URL | ArrayBuffer | Uint8Array | Blob", default: undefined, example: "pdf/extracto-demo.pdf", description: "Documento: URL, bytes o un Blob / File." },
      { name: "page", kind: "number", type: "number (model)", default: 1, description: "Página actual (desde 1)." },
      { name: "zoom", kind: "enum", type: "'page-width' | 'page-fit' | number (model)", options: ["page-width", "page-fit"], default: "page-width", description: "Ajustar al ancho, página completa o un factor (1 = 100 %)." },
      { name: "rotation", kind: "number", type: "0 | 90 | 180 | 270 (model)", default: 0, description: "Giro del documento.", control: false },
      { name: "sidebar", kind: "boolean", type: "boolean (model)", default: false, description: "Panel lateral (miniaturas o índice) abierto." },
      { name: "sidebarView", kind: "enum", type: "'thumbnails' | 'outline' (model)", default: "thumbnails", options: ["thumbnails", "outline"], description: "Vista del panel lateral (outline solo si el documento tiene índice)." },
      { name: "fileName", kind: "string", type: "string", default: undefined, description: "Nombre del archivo al descargar." },
      { name: "password", kind: "string", type: "string", default: undefined, description: "Contraseña para abrir el documento sin pedirla.", control: false },
      { name: "withCredentials", kind: "boolean", type: "boolean", default: false, description: "Envía cookies en peticiones a otro origen.", control: false },
      { name: "httpHeaders", kind: "string", type: "Record<string, string>", default: undefined, description: "Cabeceras HTTP para descargar el documento.", control: false },
      { name: "showToolbar", kind: "boolean", type: "boolean", default: true, description: "Muestra la barra de herramientas." },
      { name: "showSearch", kind: "boolean", type: "boolean", default: true, description: "Búsqueda en la barra." },
      { name: "showThumbnails", kind: "boolean", type: "boolean", default: true, description: "Botón y panel de miniaturas." },
      { name: "showRotate", kind: "boolean", type: "boolean", default: true, description: "Botón de girar." },
      { name: "downloadable", kind: "boolean", type: "boolean", default: true, description: "Botón de descargar." },
      { name: "printable", kind: "boolean", type: "boolean", default: true, description: "Botón de imprimir (y Ctrl+P)." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "pdfViewer", description: "Nombre accesible del visor." },
      { name: "showOutline", kind: "boolean", type: "boolean", default: true, description: "Pestaña Índice en el panel lateral (si el documento tiene marcadores)." },
      { name: "forms", kind: "boolean", type: "boolean", default: true, description: "Campos de formulario rellenables (si no, se pintan como imagen)." },
      { name: "externalLinks", kind: "boolean", type: "boolean", default: true, description: "Los enlaces externos del documento se abren en otra pestaña." }
    ],
    events: [
      { name: "loaded", type: "{ numPages: number }", description: "Documento abierto." },
      { name: "loadError", type: "unknown", description: "No se pudo abrir el documento." },
      { name: "formChange", type: "void", description: "Cambió un campo del formulario (valores con getFormData())." }
    ]
  },
  "cb-image": {
    component: CbImage,
    selector: "cb-image",
    props: [
      { name: "src", kind: "string", type: "string", default: "", example: "https://picsum.photos/id/1015/480/300", description: "" },
      { name: "alt", kind: "string", type: "string", default: "", example: "River between mountains", description: "" },
      { name: "width", kind: "string", type: "string", default: "", example: "320px", description: "" },
      { name: "height", kind: "string", type: "string", default: "", description: "" },
      { name: "preview", kind: "boolean", type: "boolean", default: false, description: "" }
    ]
  },
  "cb-inline-alert": {
    component: CbInlineAlert,
    selector: "cb-inline-alert",
    content: { default: "Content" },
    props: [
      { name: "title", kind: "string", type: "string", default: "", example: "Heads up", description: "" },
      { name: "status", kind: "enum", type: "'success' | 'warning' | 'error' | 'info'", options: ["success", "warning", "error", "info"], default: "info", description: "" },
      { name: "closable", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "visible", kind: "boolean", type: "boolean (model)", default: true, description: "" }
    ],
    events: [
      { name: "closed", type: "void", description: "" }
    ]
  },
  "cb-inline-message": {
    component: CbInlineMessage,
    selector: "cb-inline-message",
    content: { default: "Content" },
    props: [
      { name: "severity", kind: "enum", type: "CbInlineMessageSeverity", options: ["info", "success", "warn", "danger"], default: "info", description: "" },
      { name: "text", kind: "string", type: "string", default: "", example: "Changes saved successfully.", description: "" }
    ]
  },
  "cb-inplace": {
    component: CbInplace,
    selector: "cb-inplace",
    content: {
      default: "",
      children: [
        { selector: "span", slot: "cb-inplace-display", text: "Click to edit the alias" },
        { component: CbInput, selector: "cb-input", slot: "cb-inplace-content", inputs: { value: "Savings 2026", label: "Alias" } }
      ]
    },
    props: [
      { name: "closable", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "active", kind: "boolean", type: "boolean (model)", default: false, description: "" }
    ]
  },
  "cb-input": {
    component: CbInput,
    selector: "cb-input",
    props: [
      { name: "value", kind: "string", type: "string (model)", default: "", description: "Valor del control (two-way opcional fuera de Angular Forms)." },
      { name: "label", kind: "string", type: "string", default: "", example: "Email", description: "Etiqueta accesible. Si se omite, usa un `aria-label` externo." },
      { name: "hint", kind: "string", type: "string", default: "", example: "We will never share it.", description: "Texto de ayuda bajo el campo." },
      { name: "error", kind: "string", type: "string", default: "", description: "Mensaje de error (se muestra cuando `invalid` es true)." },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido." },
      { name: "type", kind: "enum", type: "CbInputType", options: ["text", "email", "password", "search", "tel", "url", "number"], default: "text", description: "Tipo nativo del input." },
      { name: "placeholder", kind: "string", type: "string", default: "", description: "Placeholder." },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "Tamaño." },
      { name: "readonly", kind: "boolean", type: "boolean", default: false, description: "Solo lectura." },
      { name: "required", kind: "boolean", type: "boolean", default: false, description: "Marca el campo como requerido (atributo + indicador visual)." },
      { name: "requiredIndicator", kind: "enum", type: "'asterisk' | 'text' | 'optional' | 'none'", options: ["none", "asterisk", "text", "optional"], default: undefined, description: "Indicador de obligatoriedad en la etiqueta; si se omite usa el global de provideCaribeNG()." },
      { name: "inputmode", kind: "string", type: "string | null", default: null, description: "`inputmode` para teclados móviles." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilitado de forma declarativa (se combina con Angular Forms)." },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "Id del input; se genera uno estable si no se provee.", control: false }
    ]
  },
  "cb-input-date": {
    component: CbInputDate,
    selector: "cb-input-date",
    props: [
      { name: "label", kind: "string", type: "string", default: "", example: "Birth date", description: "" },
      { name: "min", kind: "string", type: "string", default: "", description: "" },
      { name: "max", kind: "string", type: "string", default: "", description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "requiredIndicator", kind: "enum", type: "'asterisk' | 'text' | 'optional' | 'none'", options: ["none", "asterisk", "text", "optional"], default: undefined, description: "Indicador de obligatoriedad en la etiqueta; si se omite usa el global de provideCaribeNG()." },
      { name: "value", kind: "string", type: "string (model)", default: "", description: "" }
    ]
  },
  "cb-input-group": {
    component: CbInputGroup,
    selector: "cb-input-group",
    content: {
      default: "",
      children: [
        { component: CbInputGroupAddon, selector: "cb-input-group-addon", text: "$" },
        { component: CbInput, selector: "cb-input", inputs: { placeholder: "Amount" } },
        { component: CbButton, selector: "cb-button", text: "Transfer" }
      ]
    },
    props: []
  },
  "cb-input-mask": {
    component: CbInputMask,
    selector: "cb-input-mask",
    props: [
      { name: "mask", kind: "string", type: "string", default: "999-999", description: "Patrón de máscara: `9` para números, `a` para letras, `*` alfanumérico." },
      { name: "unmask", kind: "boolean", type: "boolean", default: false, description: "Si es true, el valor del modelo excluye los literales de la máscara." },
      { name: "placeholder", kind: "string", type: "string", default: "", description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "" },
      { name: "value", kind: "string", type: "string (model)", default: "", description: "" }
    ]
  },
  "cb-input-number": {
    component: CbInputNumber,
    selector: "cb-input-number",
    props: [
      { name: "value", kind: "number", type: "number | null (model)", default: null, example: 250000, description: "Valor numérico (two-way opcional fuera de Angular Forms)." },
      { name: "label", kind: "string", type: "string", default: "", example: "Amount", description: "" },
      { name: "hint", kind: "string", type: "string", default: "", description: "" },
      { name: "error", kind: "string", type: "string", default: "", description: "" },
      { name: "placeholder", kind: "string", type: "string", default: "", description: "" },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "required", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "requiredIndicator", kind: "enum", type: "'asterisk' | 'text' | 'optional' | 'none'", options: ["none", "asterisk", "text", "optional"], default: undefined, description: "Indicador de obligatoriedad en la etiqueta; si se omite usa el global de provideCaribeNG()." },
      { name: "readonly", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "", control: false },
      { name: "min", kind: "number", type: "number | null", default: null, description: "Valor mínimo permitido." },
      { name: "max", kind: "number", type: "number | null", default: null, description: "Valor máximo permitido." },
      { name: "step", kind: "number", type: "number", default: 1, description: "Incremento de los botones y de las flechas." },
      { name: "showButtons", kind: "boolean", type: "boolean", default: false, description: "Muestra los botones de incremento/decremento." },
      { name: "mode", kind: "enum", type: "'decimal' | 'currency'", options: ["decimal", "currency"], default: "decimal", description: "'decimal' (por defecto) o 'currency'." },
      { name: "currency", kind: "string", type: "string", default: "USD", description: "Código ISO de moneda cuando mode='currency' (p. ej. 'USD', 'COP', 'EUR')." },
      { name: "locale", kind: "enum", type: "string | undefined", options: ["es-CO", "es-ES", "en-US", "pt-BR"], default: undefined, description: "Locale BCP 47 para el formato (por defecto el del navegador)." },
      { name: "useGrouping", kind: "boolean", type: "boolean", default: true, description: "Agrupación de miles." },
      { name: "minFractionDigits", kind: "number", type: "number | null", default: null, description: "Mínimo de decimales." },
      { name: "maxFractionDigits", kind: "number", type: "number | null", default: null, description: "Máximo de decimales." },
      { name: "prefix", kind: "string", type: "string", default: "", example: "$ ", description: "Texto antepuesto (solo visual, cuando no está enfocado)." },
      { name: "suffix", kind: "string", type: "string", default: "", description: "Texto pospuesto (solo visual, cuando no está enfocado)." }
    ]
  },
  "cb-input-otp": {
    component: CbInputOtp,
    selector: "cb-input-otp",
    props: [
      { name: "length", kind: "number", type: "number", default: 6, description: "" },
      { name: "integerOnly", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "mask", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "verificationCode", description: "" },
      { name: "value", kind: "string", type: "string (model)", default: "", description: "" }
    ]
  },
  "cb-input-search": {
    component: CbInputSearch,
    selector: "cb-input-search",
    props: [
      { name: "placeholder", kind: "string", type: "string", default: undefined, localeKey: "search", description: "" },
      { name: "clearable", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "value", kind: "string", type: "string (model)", default: "", description: "" }
    ],
    events: [
      { name: "search", type: "string", description: "" }
    ]
  },
  "cb-input-select": {
    component: CbInputSelect,
    selector: "cb-input-select",
    props: [
      { name: "label", kind: "string", type: "string", default: "", example: "Color", description: "" },
      { name: "placeholder", kind: "string", type: "string", default: undefined, localeKey: "select", description: "" },
      { name: "options", kind: "string", type: "readonly CbInputSelectOption[]", default: [], example: [{ label: 'Red', value: 'red' }, { label: 'Green', value: 'green' }, { label: 'Blue', value: 'blue' }, { label: 'Amber', value: 'amber' }], description: "", control: false },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "requiredIndicator", kind: "enum", type: "'asterisk' | 'text' | 'optional' | 'none'", options: ["none", "asterisk", "text", "optional"], default: undefined, description: "Indicador de obligatoriedad en la etiqueta; si se omite usa el global de provideCaribeNG()." },
      { name: "value", kind: "string", type: "string (model)", default: "", description: "" }
    ]
  },
  "cb-input-token": {
    component: CbInputToken,
    selector: "cb-input-token",
    props: [
      { name: "numInputs", kind: "number", type: "number", default: 6, description: "" },
      { name: "unmasked", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "helpText", kind: "string", type: "string", default: "", description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "value", kind: "string", type: "string (model)", default: "", description: "" }
    ]
  },
  "cb-knob": {
    component: CbKnob,
    selector: "cb-knob",
    props: [
      { name: "min", kind: "number", type: "number", default: 0, description: "" },
      { name: "max", kind: "number", type: "number", default: 100, description: "" },
      { name: "step", kind: "number", type: "number", default: 1, description: "" },
      { name: "size", kind: "number", type: "number", default: 100, description: "" },
      { name: "strokeWidth", kind: "number", type: "number", default: 12, description: "" },
      { name: "severity", kind: "enum", type: "CbSeverity", options: ["primary", "secondary", "success", "warning", "danger", "info", "help", "contrast"], default: "primary", description: "" },
      { name: "showValue", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "suffix", kind: "string", type: "string", default: "", example: "%", description: "Sufijo del texto central (p. ej. `%`)." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "" },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "", control: false },
      { name: "value", kind: "number", type: "number (model)", default: 0, description: "" }
    ],
    events: [
      { name: "changed", type: "number", description: "" }
    ]
  },
  "cb-link": {
    component: CbLink,
    selector: "cb-link",
    content: { default: "Content" },
    props: [
      { name: "href", kind: "string", type: "string", default: "#", description: "Destino del enlace." },
      { name: "label", kind: "string", type: "string", default: "", example: "View details", description: "Texto del enlace (alternativa a proyectar contenido)." },
      { name: "external", kind: "boolean", type: "boolean", default: false, description: "Abre en una pestaña nueva y añade indicador visual." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilita la navegación y atenúa el enlace." }
    ]
  },
  "cb-listbox": {
    component: CbListBox,
    selector: "cb-listbox",
    props: [
      { name: "options", kind: "string", type: "readonly unknown[]", default: [], example: [{ label: 'Red', value: 'red' }, { label: 'Green', value: 'green' }, { label: 'Blue', value: 'blue' }, { label: 'Amber', value: 'amber' }], description: "", control: false },
      { name: "optionLabel", kind: "string", type: "string", default: "label", description: "" },
      { name: "optionValue", kind: "string", type: "string | null", default: null, example: "value", description: "" },
      { name: "optionDisabled", kind: "string", type: "string", default: "disabled", description: "" },
      { name: "multiple", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "filter", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "filterPlaceholder", kind: "string", type: "string", default: undefined, localeKey: "search", description: "" },
      { name: "emptyMessage", kind: "string", type: "string", default: undefined, localeKey: "noResults", description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "" },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "", control: false },
      { name: "value", kind: "string", type: "unknown (model)", default: null, example: "green", description: "", control: false }
    ]
  },
  "cb-loader": {
    component: CbLoader,
    selector: "cb-loader",
    props: [
      { name: "text", kind: "string", type: "string", default: undefined, localeKey: "loadingMessage", description: "" },
      { name: "size", kind: "enum", type: "'sm' | 'md' | 'lg'", options: ["sm", "md", "lg"], default: "md", description: "" }
    ]
  },
  "cb-logo": {
    component: CbLogo,
    selector: "cb-logo",
    props: [
      { name: "name", kind: "string", type: "string", default: "caribe-horizontal", description: "" },
      { name: "label", kind: "string", type: "string", default: "Caribe", description: "" },
      { name: "size", kind: "string", type: "string", default: "160px", description: "" },
      { name: "negative", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "alt", kind: "string", type: "string", default: "Logo CaribeNG", description: "" }
    ]
  },
  "cb-megamenu": {
    component: CbMegaMenu,
    selector: "cb-megamenu",
    props: [
      { name: "items", kind: "string", type: "readonly CbMegaMenuItem[]", default: [], example: [{ label: 'Products', icon: 'house', groups: [{ label: 'Banking', items: [{ label: 'Accounts', url: '#' }, { label: 'Cards', url: '#' }] }, { label: 'Loans', items: [{ label: 'Mortgage', url: '#' }] }] }, { label: 'Support', groups: [{ label: 'Help', items: [{ label: 'Contact', url: '#' }] }] }], description: "", control: false },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "categories", description: "" }
    ],
    events: [
      { name: "itemSelect", type: "CbMegaMenuLink", description: "" }
    ]
  },
  "cb-menu": {
    component: CbMenu,
    demo: DocPgMenu,
    selector: "cb-menu",
    props: [
      { name: "items", kind: "string", type: "readonly CbMenuItem[]", default: [], example: [{ label: 'New' }, { label: 'Open' }, { label: 'Save' }, { separator: true }, { label: 'Export' }], description: "", control: false },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "menu", description: "" }
    ],
    events: [
      { name: "itemSelect", type: "CbMenuItem", description: "" }
    ]
  },
  "cb-menubar": {
    component: CbMenubar,
    selector: "cb-menubar",
    props: [
      { name: "items", kind: "string", type: "readonly CbMenubarItem[]", default: [], example: [{ label: 'New' }, { label: 'Open' }, { label: 'Save' }, { separator: true }, { label: 'Export' }], description: "", control: false },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "mainNavigation", description: "" }
    ],
    events: [
      { name: "itemSelect", type: "CbMenubarItem", description: "" }
    ]
  },
  "cb-message": {
    component: CbMessage,
    selector: "cb-message",
    content: { default: "Content" },
    props: [
      { name: "severity", kind: "enum", type: "CbSeverity", options: ["primary", "secondary", "success", "warning", "danger", "info", "help", "contrast"], default: "info", description: "" },
      { name: "closable", kind: "boolean", type: "boolean", default: false, description: "Muestra el botón de cerrar." },
      { name: "icon", kind: "string", type: "string | null", default: null, description: "Icono (sobrescribe el de la severidad); `''` para ocultarlo." },
      { name: "visible", kind: "boolean", type: "boolean (model)", default: true, description: "Visibilidad (two-way)." }
    ],
    events: [
      { name: "closed", type: "void", description: "Se emite al cerrar." }
    ]
  },
  "cb-meter-group": {
    component: CbMeterGroup,
    selector: "cb-meter-group",
    props: [
      { name: "values", kind: "string", type: "CbMeterItem[]", default: [], example: [{ label: 'Used', value: 60 }, { label: 'Reserved', value: 25 }, { label: 'Free', value: 15 }], description: "", control: false },
      { name: "max", kind: "number", type: "number", default: 100, description: "" },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, description: "Nombre accesible del medidor (p. ej. \"Almacenamiento\")." }
    ]
  },
  "cb-modal": {
    component: CbModal,
    selector: "cb-modal",
    content: { default: "Content" },
    props: [
      { name: "title", kind: "string", type: "string", default: "", example: "Session expiring", description: "" },
      { name: "confirmLabel", kind: "string", type: "string", default: undefined, localeKey: "accept", description: "" },
      { name: "visible", kind: "boolean", type: "boolean (model)", default: false, description: "" }
    ],
    events: [
      { name: "confirm", type: "void", description: "" },
      { name: "closed", type: "void", description: "" }
    ]
  },
  "cb-multiselect": {
    component: CbMultiSelect,
    selector: "cb-multiselect",
    props: [
      { name: "options", kind: "string", type: "readonly unknown[]", default: [], example: [{ label: 'Red', value: 'red' }, { label: 'Green', value: 'green' }, { label: 'Blue', value: 'blue' }, { label: 'Amber', value: 'amber' }], description: "", control: false },
      { name: "optionLabel", kind: "string", type: "string", default: "label", description: "" },
      { name: "optionValue", kind: "string", type: "string | null", default: null, example: "value", description: "" },
      { name: "optionDisabled", kind: "string", type: "string", default: "disabled", description: "" },
      { name: "placeholder", kind: "string", type: "string", default: undefined, localeKey: "select", description: "" },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "" },
      { name: "filter", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "filterPlaceholder", kind: "string", type: "string", default: undefined, localeKey: "search", description: "" },
      { name: "emptyMessage", kind: "string", type: "string", default: undefined, localeKey: "noResults", description: "" },
      { name: "showToggleAll", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "group", kind: "boolean", type: "boolean", default: false, description: "Las opciones son grupos ({ label, items }) y se muestran con su título." },
      { name: "optionGroupLabel", kind: "string", type: "string", default: "label", description: "Propiedad con el título de cada grupo." },
      { name: "optionGroupChildren", kind: "string", type: "string", default: "items", description: "Propiedad con las opciones de cada grupo." },
      { name: "virtualScroll", kind: "boolean", type: "boolean", default: false, description: "Pinta solo las opciones visibles, para listas de miles de elementos." },
      { name: "virtualScrollItemSize", kind: "number", type: "number", default: 36, description: "Alto fijo de cada fila en modo virtual (px)." },
      { name: "scrollHeight", kind: "string", type: "string", default: "15rem", description: "Alto máximo de la lista (CSS); en modo virtual, su alto fijo." },
      { name: "maxSelectedLabels", kind: "number", type: "number", default: 3, description: "Nº máx. de etiquetas antes de mostrar \"N seleccionados\"." },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "", control: false },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "Nombre accesible del disparador cuando no hay etiqueta visible.", control: false },
      { name: "ariaLabelledBy", kind: "string", type: "string", default: "", description: "Id del elemento que etiqueta al disparador (p. ej. un label visible).", control: false },
      { name: "value", kind: "string", type: "unknown[] (model)", default: [], example: ['green', 'blue'], description: "", control: false }
    ]
  },
  "cb-off-canvas": {
    component: CbOffCanvas,
    selector: "cb-off-canvas",
    content: { default: "Content" },
    props: [
      { name: "title", kind: "string", type: "string", default: undefined, localeKey: "sidePanel", description: "Título del panel." },
      { name: "position", kind: "enum", type: "'left' | 'right' | 'bottom'", options: ["left", "right", "bottom"], default: "right", description: "Lado de aparición." },
      { name: "open", kind: "boolean", type: "boolean (model)", default: false, description: "Estado abierto/cerrado (two-way)." }
    ]
  },
  "cb-onboarding": {
    component: CbOnboarding,
    selector: "cb-onboarding",
    content: { default: "Content" },
    props: [
      { name: "steps", kind: "string", type: "readonly string[]", default: [], example: ['Welcome aboard', 'Secure your account', 'Start banking'], description: "", control: false },
      { name: "visible", kind: "boolean", type: "boolean (model)", default: true, description: "" },
      { name: "index", kind: "number", type: "number (model)", default: 0, description: "" }
    ],
    events: [
      { name: "currentStepIndex", type: "number", description: "" }
    ]
  },
  "cb-orderlist": {
    component: CbOrderList,
    selector: "cb-orderlist",
    props: [
      { name: "value", kind: "string", type: "readonly unknown[] (model)", default: [], example: ['First item', 'Second item', 'Third item'], description: "", control: false },
      { name: "header", kind: "string", type: "string", default: "", example: "Priorities", description: "Título de la lista." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "sortableList", description: "" }
    ]
  },
  "cb-organization-chart": {
    component: CbOrganizationChart,
    selector: "cb-organization-chart",
    props: [
      { name: "value", kind: "string", type: "readonly CbOrganizationChartNode[]", default: [], example: [{ key: 'ceo', label: 'CEO', title: 'Jane Doe', subtitle: 'Chief Executive', children: [{ key: 'cto', label: 'CTO', title: 'John Roe' }, { key: 'cfo', label: 'CFO', title: 'Mary Lee' }] }], description: "", control: false },
      { name: "selection", kind: "string", type: "CbOrganizationChartNode | null (model)", default: null, description: "", control: false },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "orgChart", description: "" }
    ]
  },
  "cb-paginator": {
    component: CbPaginator,
    selector: "cb-paginator",
    props: [
      { name: "totalRecords", kind: "number", type: "number", default: 0, example: 120, description: "" },
      { name: "rows", kind: "number", type: "number (model)", default: 10, description: "" },
      { name: "first", kind: "number", type: "number (model)", default: 0, description: "" },
      { name: "rowsPerPageOptions", kind: "string", type: "readonly number[]", default: [], example: [10, 20, 50], description: "", control: false },
      { name: "showReport", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "maxPageLinks", kind: "number", type: "number", default: 5, description: "Máximo de enlaces de página numerados visibles." }
    ],
    events: [
      { name: "pageChange", type: "CbPaginatorState", description: "" }
    ]
  },
  "cb-panel": {
    component: CbPanel,
    selector: "cb-panel",
    content: { default: "Content" },
    props: [
      { name: "header", kind: "string", type: "string", default: "", example: "Account details", description: "Título mostrado en la cabecera del panel." },
      { name: "toggleable", kind: "boolean", type: "boolean", default: false, description: "Permite contraer/expandir el contenido desde la cabecera." },
      { name: "collapsed", kind: "boolean", type: "boolean (model)", default: false, description: "Estado colapsado (soporta two-way binding `[(collapsed)]`)." }
    ],
    events: [
      { name: "collapsedChange2", type: "boolean", description: "Emitido después de alternar el estado colapsado." }
    ]
  },
  "cb-panelmenu": {
    component: CbPanelMenu,
    selector: "cb-panelmenu",
    props: [
      { name: "items", kind: "string", type: "readonly CbPanelMenuItem[]", default: [], example: [{ label: 'New' }, { label: 'Open' }, { label: 'Save' }, { separator: true }, { label: 'Export' }], description: "", control: false },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "panelMenu", description: "" },
      { name: "multiple", kind: "boolean", type: "boolean", default: false, description: "" }
    ],
    events: [
      { name: "itemSelect", type: "CbPanelMenuItem", description: "" }
    ]
  },
  "cb-password": {
    component: CbPassword,
    selector: "cb-password",
    props: [
      { name: "placeholder", kind: "string", type: "string", default: "", description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "toggleMask", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "feedback", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "size", kind: "enum", type: "CbPasswordSize", options: ["sm", "md", "lg"], default: "md", description: "" },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "", control: false },
      { name: "autocomplete", kind: "string", type: "string", default: "current-password", description: "" },
      { name: "value", kind: "string", type: "string (model)", default: "", description: "" }
    ]
  },
  "cb-picklist": {
    component: CbPickList,
    selector: "cb-picklist",
    props: [
      { name: "source", kind: "string", type: "readonly string[] (model)", default: [], example: ['Apple', 'Banana', 'Cherry'], description: "", control: false },
      { name: "target", kind: "string", type: "readonly string[] (model)", default: [], example: ['Date', 'Elderberry'], description: "", control: false },
      { name: "sourceHeader", kind: "string", type: "string", default: undefined, example: "Available", description: "Título de la lista de origen." },
      { name: "targetHeader", kind: "string", type: "string", default: undefined, example: "Selected", description: "Título de la lista de destino." }
    ]
  },
  "cb-pictogram": {
    component: CbPictogram,
    selector: "cb-pictogram",
    props: [
      { name: "name", kind: "string", type: "string", default: "security-shield", description: "" },
      { name: "size", kind: "string", type: "string", default: "56px", description: "" },
      { name: "alt", kind: "string", type: "string", default: undefined, localeKey: "pictogram", description: "" }
    ]
  },
  "cb-pop-over": {
    component: CbPopOver,
    selector: "cb-pop-over",
    content: { default: "Content" },
    props: [
      { name: "triggerLabel", kind: "string", type: "string", default: undefined, localeKey: "showInfo", description: "" },
      { name: "visible", kind: "boolean", type: "boolean (model)", default: false, description: "" }
    ]
  },
  "cb-popover": {
    component: CbPopover,
    demo: DocPgPopover,
    selector: "cb-popover",
    content: { default: "Quick actions: transfer, pay a bill or download your statement." },
    props: [
      { name: "dismissable", kind: "boolean", type: "boolean", default: true, description: "Cierra al hacer clic fuera." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "Nombre accesible del panel." }
    ],
    events: [
      { name: "onShow", type: "void", description: "" },
      { name: "onHide", type: "void", description: "" }
    ]
  },
  "cb-preloader": {
    component: CbPreloader,
    selector: "cb-preloader",
    props: [
      { name: "active", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "title", kind: "string", type: "string", default: "", example: "CaribeNG", description: "" },
      { name: "label", kind: "string", type: "string", default: undefined, localeKey: "preparingSession", description: "" }
    ]
  },
  "cb-progress-bar": {
    component: CbProgressBar,
    selector: "cb-progress-bar",
    props: [
      { name: "value", kind: "number", type: "number", default: 60, description: "Valor actual (0–100)." },
      { name: "label", kind: "string", type: "string", default: "", example: "Uploading documents", description: "Etiqueta mostrada sobre la barra." },
      { name: "showValue", kind: "boolean", type: "boolean", default: true, description: "Muestra el porcentaje numérico." }
    ]
  },
  "cb-progressbar": {
    component: CbProgressBar___caribeng_ui_progressbar,
    selector: "cb-progressbar",
    props: [
      { name: "value", kind: "number", type: "number | null", default: 0, description: "Valor 0–100. `null` activa el modo indeterminado." },
      { name: "showValue", kind: "boolean", type: "boolean", default: false, description: "Muestra el porcentaje a la derecha." },
      { name: "severity", kind: "enum", type: "CbSeverity", options: ["primary", "secondary", "success", "warning", "danger", "info", "help", "contrast"], default: "primary", description: "" },
      { name: "size", kind: "enum", type: "'sm' | 'md' | 'lg'", options: ["sm", "md", "lg"], default: "md", description: "" },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "" }
    ]
  },
  "cb-radio": {
    component: CbRadio,
    demo: DocPgRadio,
    selector: "cb-radio",
    props: [
      { name: "value", kind: "string", type: "unknown", default: undefined, example: "pro", description: "Valor que representa este radio (obligatorio).", control: false },
      { name: "label", kind: "string", type: "string", default: "", example: "Pro plan", description: "Etiqueta mostrada junto al control." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "`aria-label` cuando no hay `label` visible." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilita solo este radio (además del grupo)." },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "Id del input; se genera uno estable si no se provee.", control: false }
    ]
  },
  "cb-radio-group": {
    component: CbRadioGroup,
    demo: DocPgRadioGroup,
    selector: "cb-radio-group",
    codeContent: "<cb-radio value=\"free\" label=\"Free\" />\n<cb-radio value=\"pro\" label=\"Pro\" />\n<cb-radio value=\"team\" label=\"Team\" />",
    props: [
      { name: "ariaLabel", kind: "string", type: "string", default: "", example: "Plan", description: "`aria-label` del grupo (recomendado para accesibilidad)." },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "Tamaño aplicado a los radios hijos." },
      { name: "orientation", kind: "enum", type: "'vertical' | 'horizontal'", options: ["vertical", "horizontal"], default: "vertical", description: "Disposición de los items." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilita todo el grupo." },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "name", kind: "string", type: "string", default: undefined, description: "Nombre compartido por los radios nativos; se genera uno si se omite.", control: false }
    ],
    events: [
      { name: "changed", type: "unknown", description: "Emite el nuevo valor seleccionado." }
    ]
  },
  "cb-rating": {
    component: CbRating,
    selector: "cb-rating",
    props: [
      { name: "value", kind: "number", type: "number (model)", default: 0, description: "Valor seleccionado (two-way opcional fuera de Angular Forms)." },
      { name: "stars", kind: "number", type: "number", default: 5, description: "Número de estrellas." },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "Tamaño." },
      { name: "readonly", kind: "boolean", type: "boolean", default: false, description: "Solo lectura (no editable, pero muestra el valor)." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilitado declarativo (se combina con Angular Forms)." },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "Etiqueta accesible del control." },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "Id (reservado para uso futuro / asociación de label externa).", control: false }
    ],
    events: [
      { name: "changed", type: "number", description: "Emite el nuevo valor al cambiar." }
    ]
  },
  "cb-scroll-panel": {
    component: CbScrollPanel,
    selector: "cb-scroll-panel",
    content: { default: "CaribeNG is a set of accessible Angular components built on signals, OnPush change detection and CSS design tokens. Every component supports light and dark themes, keyboard navigation and screen readers. The scroll panel keeps long content inside a fixed area with a styled scrollbar, so the rest of the page stays in place. Keep scrolling to see how the custom scrollbar follows the content. Use the width and height controls to change the size of the area. The content can be any HTML: text, lists, tables or other components. This paragraph is intentionally long so that the panel needs to scroll in the playground." },
    props: [
      { name: "width", kind: "string", type: "string", default: "100%", description: "Ancho CSS del contenedor (ej. `'100%'`, `'320px'`)." },
      { name: "height", kind: "string", type: "string", default: "200px", description: "Alto CSS del contenedor (ej. `'200px'`)." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "scrollableArea", description: "Etiqueta accesible para la región con scroll." }
    ]
  },
  "cb-scroll-top": {
    component: CbScrollTop,
    demo: DocPgScrollTop,
    selector: "cb-scroll-top",
    props: [
      { name: "target", kind: "enum", type: "CbScrollTopTarget", options: ["window", "parent"], default: "window", example: "parent", description: "Elemento cuyo desplazamiento se escucha: `'window'` o `'parent'`." },
      { name: "threshold", kind: "number", type: "number", default: 200, example: 60, description: "Píxeles desplazados a partir de los cuales se muestra el botón." },
      { name: "behavior", kind: "string", type: "ScrollBehavior", default: "smooth", description: "Comportamiento del scroll al volver arriba." },
      { name: "icon", kind: "string", type: "string", default: "chevron-up", description: "Nombre del icono de `<cb-icon>`." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "scrollTop", description: "Etiqueta accesible para el botón." }
    ]
  },
  "cb-select": {
    component: CbSelect,
    selector: "cb-select",
    props: [
      { name: "options", kind: "string", type: "readonly unknown[]", default: [], example: [{ label: 'Red', value: 'red' }, { label: 'Green', value: 'green' }, { label: 'Blue', value: 'blue' }, { label: 'Amber', value: 'amber' }], description: "", control: false },
      { name: "optionLabel", kind: "string", type: "string", default: "label", description: "" },
      { name: "optionValue", kind: "string", type: "string | null", default: null, example: "value", description: "" },
      { name: "optionDisabled", kind: "string", type: "string", default: "disabled", description: "" },
      { name: "placeholder", kind: "string", type: "string", default: undefined, localeKey: "select", description: "" },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "" },
      { name: "filter", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "filterPlaceholder", kind: "string", type: "string", default: undefined, localeKey: "search", description: "" },
      { name: "emptyMessage", kind: "string", type: "string", default: undefined, localeKey: "noResults", description: "" },
      { name: "showClear", kind: "boolean", type: "boolean", default: false, description: "Muestra un botón para vaciar la selección." },
      { name: "group", kind: "boolean", type: "boolean", default: false, description: "Las opciones son grupos ({ label, items }) y se muestran con su título." },
      { name: "optionGroupLabel", kind: "string", type: "string", default: "label", description: "Propiedad con el título de cada grupo." },
      { name: "optionGroupChildren", kind: "string", type: "string", default: "items", description: "Propiedad con las opciones de cada grupo." },
      { name: "virtualScroll", kind: "boolean", type: "boolean", default: false, description: "Pinta solo las opciones visibles, para listas de miles de elementos." },
      { name: "virtualScrollItemSize", kind: "number", type: "number", default: 36, description: "Alto fijo de cada fila en modo virtual (px)." },
      { name: "scrollHeight", kind: "string", type: "string", default: "16rem", description: "Alto máximo de la lista (CSS); en modo virtual, su alto fijo." },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "", control: false },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "Nombre accesible del disparador cuando no hay etiqueta visible.", control: false },
      { name: "ariaLabelledBy", kind: "string", type: "string", default: "", description: "Id del elemento que etiqueta al disparador (p. ej. un label visible).", control: false },
      { name: "value", kind: "string", type: "unknown (model)", default: null, example: "green", description: "Valor seleccionado (two-way opcional fuera de Angular Forms).", control: false }
    ]
  },
  "cb-selectbutton": {
    component: CbSelectButton,
    selector: "cb-selectbutton",
    props: [
      { name: "options", kind: "string", type: "readonly unknown[]", default: [], example: [{ label: 'Red', value: 'red' }, { label: 'Green', value: 'green' }, { label: 'Blue', value: 'blue' }, { label: 'Amber', value: 'amber' }], description: "", control: false },
      { name: "optionLabel", kind: "string", type: "string", default: "label", description: "" },
      { name: "optionValue", kind: "string", type: "string | null", default: null, example: "value", description: "" },
      { name: "optionDisabled", kind: "string", type: "string", default: "disabled", description: "" },
      { name: "multiple", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "" },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "", control: false },
      { name: "value", kind: "string", type: "unknown (model)", default: null, example: "green", description: "", control: false }
    ],
    events: [
      { name: "changed", type: "unknown", description: "" }
    ]
  },
  "cb-shortcut": {
    component: CbShortcut,
    selector: "cb-shortcut",
    props: [
      { name: "label", kind: "string", type: "string", default: "", example: "Transferir", description: "Texto del acceso directo." },
      { name: "icon", kind: "string", type: "string", default: "arrow-right", description: "Icono del set núcleo." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilita el acceso." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, description: "Nombre accesible (si difiere de label).", control: false }
    ],
    events: [
      { name: "action", type: "void", description: "Emite al activar el acceso." }
    ]
  },
  "cb-skeleton": {
    component: CbSkeleton,
    selector: "cb-skeleton",
    props: [
      { name: "width", kind: "string", type: "string", default: "100%", description: "Ancho CSS (p. ej. `100%`, `12rem`)." },
      { name: "height", kind: "string", type: "string", default: "", description: "Alto CSS. En `circle` se iguala al ancho." },
      { name: "shape", kind: "enum", type: "'text' | 'rect' | 'circle'", options: ["text", "rect", "circle"], default: "text", description: "" },
      { name: "animation", kind: "enum", type: "'pulse' | 'wave' | 'none'", options: ["pulse", "wave", "none"], default: "wave", description: "" }
    ]
  },
  "cb-slider": {
    component: CbSlider,
    selector: "cb-slider",
    props: [
      { name: "value", kind: "number", type: "number (model)", default: 0, description: "" },
      { name: "min", kind: "number", type: "number", default: 0, description: "" },
      { name: "max", kind: "number", type: "number", default: 100, description: "" },
      { name: "step", kind: "number", type: "number", default: 1, description: "" },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "range", kind: "boolean", type: "boolean", default: false, description: "Dos tiradores para elegir un rango ([(rangeValue)])." },
      { name: "rangeValue", kind: "string", type: "readonly [number, number] (model)", default: [0, 100], example: [20, 80], description: "Valor en modo range: [mínimo, máximo].", control: false },
      { name: "showValue", kind: "boolean", type: "boolean", default: false, description: "Muestra el valor encima de cada tirador." },
      { name: "valueFormat", kind: "string", type: "Intl.NumberFormatOptions | ((v: number) => string)", default: undefined, description: "Formato del valor visible y de aria-valuetext.", control: false },
      { name: "locale", kind: "enum", type: "string", options: ["es-CO", "es-ES", "en-US", "pt-BR"], default: undefined, description: "Locale BCP 47 del formato." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "Nombre accesible; en rango se completa con mínimo / máximo." },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "", control: false }
    ],
    events: [
      { name: "changed", type: "number", description: "" },
      { name: "rangeChanged", type: "readonly [number, number]", description: "Nuevo rango (modo range)." }
    ]
  },
  "cb-empty": {
    component: CbEmpty,
    selector: "cb-empty",
    content: { default: "" },
    props: [
      { name: "title", kind: "string", type: "string", default: undefined, localeKey: "noData", description: "Mensaje principal." },
      { name: "description", kind: "string", type: "string", default: "", description: "Texto de apoyo." },
      { name: "icon", kind: "string", type: "string", default: "folder", description: "Icono (se ignora si hay image)." },
      { name: "image", kind: "string", type: "string", default: "", description: "Ilustración decorativa opcional." },
      { name: "size", kind: "enum", type: "'sm' | 'md'", options: ["sm", "md"], default: "md", description: "sm para tablas y paneles." }
    ]
  },
  "cb-kbd": {
    component: CbKbd,
    selector: "cb-kbd",
    props: [
      { name: "keys", kind: "string", type: "readonly string[]", default: [], example: ["mod", "K"], description: "Teclas de la combinación: nombres (mod, shift, alt, enter, up…) o texto libre.", control: false },
      { name: "platform", kind: "enum", type: "'auto' | 'mac' | 'other'", options: ["auto", "mac", "other"], default: "auto", description: "Plataforma a mostrar; auto la detecta (⌘ en Mac)." },
      { name: "size", kind: "enum", type: "'sm' | 'md'", options: ["sm", "md"], default: "md", description: "Tamaño." }
    ]
  },
  "cb-copy-button": {
    component: CbCopyButton,
    selector: "cb-copy-button",
    props: [
      { name: "value", kind: "string", type: "string | number", default: "", example: "0012 3456 7890", description: "Texto que se copia." },
      { name: "showLabel", kind: "boolean", type: "boolean", default: false, description: "Muestra el texto junto al icono." },
      { name: "label", kind: "string", type: "string", default: undefined, localeKey: "copy", description: "Texto del botón y nombre accesible." },
      { name: "copiedLabel", kind: "string", type: "string", default: undefined, localeKey: "copied", description: "Texto tras copiar." },
      { name: "timeout", kind: "number", type: "number", default: 2000, description: "Milisegundos que dura la confirmación." },
      { name: "variant", kind: "enum", type: "CbButtonVariant", options: ["text", "outlined", "solid"], default: "text", description: "Variante del botón." },
      { name: "severity", kind: "enum", type: "CbSeverity", options: ["secondary", "primary", "contrast"], default: "secondary", description: "Color del botón." },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "sm", description: "Tamaño." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilita el botón." }
    ],
    events: [
      { name: "copied", type: "string", description: "Texto copiado." },
      { name: "copyError", type: "string", description: "El navegador no permitió copiar." }
    ]
  },
  "cb-qrcode": {
    component: CbQrcode,
    selector: "cb-qrcode",
    props: [
      { name: "value", kind: "string", type: "string", default: "", example: "https://caribeng.dev", description: "Texto o URL a codificar." },
      { name: "size", kind: "number", type: "number", default: 160, description: "Lado en píxeles." },
      { name: "errorCorrection", kind: "enum", type: "'L' | 'M' | 'Q' | 'H'", options: ["L", "M", "Q", "H"], default: "M", description: "Corrección de errores (usa H con logo)." },
      { name: "color", kind: "string", type: "string", default: "#000000", description: "Color de los módulos." },
      { name: "background", kind: "string", type: "string", default: "#ffffff", description: "Color de fondo." },
      { name: "margin", kind: "number", type: "number", default: 4, description: "Margen claro en módulos (el estándar pide 4)." },
      { name: "image", kind: "string", type: "string", default: "", description: "Logo centrado (URL)." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "qrCode", description: "Nombre accesible." }
    ]
  },
  "cb-command-palette": {
    component: CbCommandPalette,
    selector: "cb-command-palette",
    props: [
      { name: "items", kind: "string", type: "readonly CbCommandItem[]", default: [], example: [{ label: 'Home', icon: 'house', group: 'Pages' }, { label: 'Settings', icon: 'settings', group: 'Pages', keywords: ['preferences'] }, { label: 'New transfer', icon: 'arrow-right-left', group: 'Actions', shortcut: ['mod', 'T'] }, { label: 'Download statement', icon: 'download', group: 'Actions' }], description: "Páginas y acciones (label, group, icon, description, keywords, shortcut, disabled, command).", control: false },
      { name: "visible", kind: "boolean", type: "boolean (model)", default: false, description: "Abierta o cerrada (two-way)." },
      { name: "query", kind: "string", type: "string (model)", default: "", description: "Texto buscado (two-way)." },
      { name: "shortcut", kind: "string", type: "string", default: "mod+k", example: "", description: "Atajo global que la abre; '' lo desactiva." },
      { name: "placeholder", kind: "string", type: "string", default: undefined, localeKey: "commandPlaceholder", description: "Texto del campo de búsqueda." },
      { name: "emptyMessage", kind: "string", type: "string", default: undefined, localeKey: "noResults", description: "Mensaje sin resultados." },
      { name: "filter", kind: "boolean", type: "boolean", default: true, description: "Filtra items con la búsqueda (desactívalo con resultados del servidor)." },
      { name: "loading", kind: "boolean", type: "boolean", default: false, description: "Muestra Cargando mientras no hay resultados." },
      { name: "closeOnSelect", kind: "boolean", type: "boolean", default: true, description: "Cierra al elegir un item." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "commandPalette", description: "Nombre del diálogo." }
    ],
    events: [
      { name: "itemSelect", type: "CbCommandSelectEvent", description: "Item elegido ({ item, query, originalEvent })." }
    ]
  },
  "cb-sidebar": {
    component: CbSidebar,
    selector: "cb-sidebar",
    props: [
      { name: "groups", kind: "string", type: "readonly CbSidebarGroup[]", default: [], example: [{ label: 'General', items: [{ id: 'home', label: 'Home', icon: 'house' }, { id: 'clients', label: 'Clients', icon: 'user', badge: 3 }, { id: 'settings', label: 'Settings', icon: 'settings', children: [{ id: 'profile', label: 'Profile' }, { id: 'security', label: 'Security' }] }] }], description: "Secciones con items (label, icon, url, badge, children, disabled, command).", control: false },
      { name: "active", kind: "string", type: "string | null (model)", default: null, example: "home", description: "Clave del item activo (id, url o label)." },
      { name: "collapsed", kind: "boolean", type: "boolean (model)", default: false, description: "Contraído a iconos (en cb-app-shell lo controla el shell)." },
      { name: "collapsible", kind: "boolean", type: "boolean", default: true, description: "Botón de contraer en el pie." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "mainNavigation", description: "Nombre de la navegación." },
      { name: "navigate", kind: "string", type: "((url: string) => unknown) | null", default: null, description: "Navegación SPA para los enlaces internos.", control: false }
    ],
    events: [
      { name: "itemSelect", type: "CbSidebarSelectEvent", description: "Item elegido ({ item, originalEvent })." }
    ]
  },
  "cb-chat-message": {
    component: CbChatMessage,
    selector: "cb-chat-message",
    props: [
      { name: "role", kind: "enum", type: "'user' | 'assistant' | 'system'", options: ["assistant", "user", "system"], default: "assistant", description: "Quién escribe el mensaje." },
      { name: "text", kind: "string", type: "string", default: "", example: "Your balance is **$ 4,250**. See [statement](/statements).", description: "Contenido (markdown seguro)." },
      { name: "markdown", kind: "boolean", type: "boolean", default: true, description: "Interpreta text como markdown." },
      { name: "author", kind: "string", type: "string", default: undefined, localeKey: "chatAssistant", description: "Nombre del autor." },
      { name: "time", kind: "string", type: "string", default: "", example: "10:30", description: "Hora ya formateada." },
      { name: "avatar", kind: "string", type: "string", default: "", description: "Imagen del avatar." },
      { name: "showAvatar", kind: "boolean", type: "boolean", default: true, description: "Muestra el avatar." },
      { name: "showAuthor", kind: "boolean", type: "boolean", default: false, description: "Muestra el nombre del autor." },
      { name: "status", kind: "enum", type: "'sending' | 'sent' | 'error'", options: ["sent", "sending", "error"], default: undefined, description: "Estado de envío; error muestra Reintentar." },
      { name: "streaming", kind: "boolean", type: "boolean", default: false, description: "La respuesta sigue llegando (cursor y aria-busy)." },
      { name: "copyable", kind: "boolean", type: "boolean", default: false, description: "Botón para copiar el texto." },
      { name: "attachments", kind: "string", type: "readonly CbChatAttachment[]", default: [], description: "Adjuntos (name, type, size, url); las imágenes, en miniatura.", control: false },
      { name: "showFeedback", kind: "boolean", type: "boolean", default: false, example: true, description: "Botones de valoración." },
      { name: "feedback", kind: "enum", type: "'up' | 'down' | null (model)", options: ["up", "down"], default: null, description: "Valoración elegida." },
      { name: "regenerable", kind: "boolean", type: "boolean", default: false, description: "Botón Regenerar respuesta." }
    ],
    events: [
      { name: "retry", type: "void", description: "Se pulsó Reintentar." },
      { name: "regenerate", type: "void", description: "Se pulsó Regenerar respuesta." },
      { name: "feedbackChange", type: "CbChatFeedback", description: "Cambió la valoración." }
    ]
  },
  "cb-code-block": {
    component: CbCodeBlock,
    selector: "cb-code-block",
    props: [
      { name: "code", kind: "string", type: "string", default: "", example: "const saldo = 4250000; // COP\nconsole.log(saldo);", description: "Código a mostrar." },
      { name: "language", kind: "enum", type: "string", options: ["ts", "js", "html", "css", "scss", "json", "bash", "python", "sql", ""], default: "", example: "ts", description: "Lenguaje del resaltado." },
      { name: "filename", kind: "string", type: "string", default: "", description: "Nombre de archivo en la cabecera." },
      { name: "lineNumbers", kind: "boolean", type: "boolean", default: false, description: "Números de línea." },
      { name: "startLine", kind: "number", type: "number", default: 1, description: "Número de la primera línea." },
      { name: "highlightLines", kind: "string", type: "string | number[]", default: "", description: "Líneas destacadas (\"2,5-7\")." },
      { name: "wrap", kind: "boolean", type: "boolean", default: false, description: "Parte las líneas largas." },
      { name: "copyable", kind: "boolean", type: "boolean", default: true, description: "Botón de copiar." },
      { name: "header", kind: "boolean", type: "boolean", default: true, description: "Cabecera con lenguaje o archivo." },
      { name: "maxHeight", kind: "string", type: "string", default: "", description: "Alto máximo con scroll." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, description: "Nombre del bloque." }
    ]
  },
  "cb-phone-input": {
    component: CbPhoneInput,
    selector: "cb-phone-input",
    props: [
      { name: "value", kind: "string", type: "string (model)", default: "", description: "Número en E.164 (+573001234567)." },
      { name: "country", kind: "string", type: "string (model)", default: "CO", description: "País seleccionado (ISO)." },
      { name: "label", kind: "string", type: "string", default: "", example: "Mobile", description: "Etiqueta." },
      { name: "hint", kind: "string", type: "string", default: "", description: "Texto de ayuda." },
      { name: "error", kind: "string", type: "string", default: undefined, localeKey: "phoneInvalid", description: "Mensaje de error." },
      { name: "placeholder", kind: "string", type: "string", default: undefined, description: "Placeholder (por defecto, un ejemplo del país)." },
      { name: "countries", kind: "string", type: "readonly (CbPhoneCountry | string)[]", default: undefined, description: "Países disponibles (ISO o datos propios). Por defecto, CB_PHONE_COUNTRIES.", control: false },
      { name: "preferredCountries", kind: "string", type: "readonly string[]", default: [], description: "Países que aparecen primero.", control: false },
      { name: "countryLocked", kind: "boolean", type: "boolean", default: false, description: "Bloquea el país." },
      { name: "showFlag", kind: "boolean", type: "boolean", default: true, description: "Muestra la bandera." },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "Tamaño." },
      { name: "required", kind: "boolean", type: "boolean", default: false, description: "Obligatorio." },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca el error manualmente." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilitado." }
    ],
    events: [
      { name: "phoneChange", type: "CbPhoneChange", description: "Cambio con { e164, national, country, valid }." }
    ]
  },
  "cb-comments": {
    component: CbComments,
    selector: "cb-comments",
    props: [
      { name: "comments", kind: "string", type: "readonly CbComment[] (model)", default: [], description: "Comentarios en una lista plana (id, author, html, date, edited, parentId, reactions, deleted). Se actualiza al publicar, editar, borrar o reaccionar.", control: false },
      { name: "activity", kind: "string", type: "readonly CbActivity[]", default: [], description: "Historial de cambios (id, text, author, date, icon), intercalado por fecha.", control: false },
      { name: "currentUser", kind: "string", type: "CbCommentPerson | null", default: null, description: "Quién escribe. Sin él, el hilo es de solo lectura.", control: false },
      { name: "people", kind: "string", type: "readonly CbCommentPerson[]", default: [], description: "Personas que se pueden mencionar con @ y cuyos nombres salen en las reacciones.", control: false },
      { name: "mentions", kind: "string", type: "CbEditorMentionSource | null", default: null, description: "Fuente propia de menciones (lista o función, también asíncrona); sustituye a people para @.", control: false },
      { name: "filter", kind: "enum", type: "'all' | 'comments' | 'activity' (model)", options: ["all","comments","activity"], default: "all", description: "Qué se muestra. El filtro aparece cuando hay actividad." },
      { name: "order", kind: "enum", type: "'oldest' | 'newest'", options: ["oldest","newest"], default: "oldest", description: "Orden del hilo; con newest la caja para comentar va arriba." },
      { name: "reactions", kind: "string", type: "readonly string[]", default: undefined, description: "Emojis para reaccionar (vacío para quitar las reacciones). Por defecto, 👍 ❤️ 🎉 😄 👀 🙏.", control: false },
      { name: "replies", kind: "boolean", type: "boolean", default: true, description: "Permite responder (un nivel)." },
      { name: "editable", kind: "boolean", type: "boolean", default: true, description: "Permite editar y eliminar los comentarios propios." },
      { name: "composer", kind: "boolean", type: "boolean", default: true, description: "Muestra la caja para comentar." },
      { name: "readonly", kind: "boolean", type: "boolean", default: false, description: "Solo lectura: sin caja ni acciones." },
      { name: "toolbar", kind: "string", type: "readonly CbEditorTool[]", default: undefined, description: "Herramientas del editor. Por defecto (CB_COMMENTS_TOOLBAR): negrita, cursiva, tachado, listas, enlace y código.", control: false },
      { name: "editorHeight", kind: "string", type: "string", default: "4.5rem", description: "Alto del área de escritura (crece hasta 16rem)." },
      { name: "placeholder", kind: "string", type: "string", default: undefined, localeKey: "commentsWrite", description: "Texto de la caja vacía." },
      { name: "emptyMessage", kind: "string", type: "string", default: undefined, localeKey: "commentsEmpty", description: "Texto sin comentarios." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "Nombre del hilo (por defecto, \"Comentarios y actividad\")." }
    ],
    events: [
      { name: "commentAdd", type: "CbCommentEvent", description: "Comentario publicado o respuesta ({ comment, mentions }: ids mencionados)." },
      { name: "commentEdit", type: "CbCommentEvent", description: "Comentario editado ({ comment, mentions })." },
      { name: "commentDelete", type: "CbComment", description: "Comentario eliminado (el original)." },
      { name: "reactionToggle", type: "CbCommentReactionEvent", description: "Reacción puesta o quitada ({ comment, emoji, added })." }
    ]
  },
  "cb-notification-center": {
    component: CbNotificationCenter,
    selector: "cb-notification-center",
    props: [
      { name: "notifications", kind: "string", type: "readonly CbNotification[] (model)", default: [], example: [{"id":"1","title":"Transferencia recibida","text":"$ 250.000","date":"2026-10-23T09:00:00","severity":"success"},{"id":"2","title":"Extracto disponible","date":"2026-10-20T09:00:00","read":true}], description: "Avisos (id, title, text, date, read, person, icon, severity, actions). Se actualiza al leer o eliminar.", control: false },
      { name: "filter", kind: "enum", type: "'all' | 'unread' (model)", options: ["all","unread"], default: "all", description: "Todas o solo las no leídas." },
      { name: "open", kind: "boolean", type: "boolean (model)", default: false, description: "Panel abierto (sin inline)." },
      { name: "inline", kind: "boolean", type: "boolean", default: false, description: "Pinta el panel en la página, sin campana." },
      { name: "groupByDate", kind: "boolean", type: "boolean", default: true, description: "Agrupa en Hoy, Ayer y Anteriores." },
      { name: "removable", kind: "boolean", type: "boolean", default: true, description: "Botón de eliminar en cada aviso." },
      { name: "closeOnSelect", kind: "boolean", type: "boolean", default: true, description: "Cierra el panel al elegir un aviso." },
      { name: "announceNew", kind: "boolean", type: "boolean", default: true, description: "Anuncia los avisos nuevos sin leer (desactívalo si la misma lista se muestra en dos centros)." },
      { name: "showViewAll", kind: "boolean", type: "boolean", default: false, description: "Pie con «Ver todas» (viewAll)." },
      { name: "max", kind: "number", type: "number", default: 99, description: "A partir de este número la campana muestra «99+»." },
      { name: "title", kind: "string", type: "string", default: undefined, localeKey: "notificationsTitle", description: "Título del panel." },
      { name: "headingLevel", kind: "number", type: "number", default: 2, description: "Nivel del título (los grupos usan el siguiente)." },
      { name: "emptyMessage", kind: "string", type: "string", default: undefined, localeKey: "notificationsEmpty", description: "Texto sin avisos." },
      { name: "panelWidth", kind: "string", type: "string", default: "24rem", description: "Ancho del panel flotante." },
      { name: "maxHeight", kind: "string", type: "string", default: "26rem", description: "Alto máximo de la lista (con scroll)." }
    ],
    events: [
      { name: "itemClick", type: "CbNotification", description: "Aviso elegido (ya marcado como leído)." },
      { name: "actionClick", type: "CbNotificationActionEvent", description: "Acción propia pulsada ({ notification, action })." },
      { name: "readChange", type: "CbNotification", description: "Un aviso pasó a leído o a no leído." },
      { name: "markAll", type: "void", description: "Se marcaron todas como leídas." },
      { name: "itemRemove", type: "CbNotification", description: "Aviso eliminado." },
      { name: "viewAll", type: "void", description: "Se pulsó «Ver todas»." }
    ]
  },
  "cb-signature-pad": {
    component: CbSignaturePad,
    selector: "cb-signature-pad",
    props: [
      { name: "value", kind: "string", type: "string (model)", default: "", description: "Firma como data URL en format ('' si está vacía). Una firma que llega de fuera se muestra de fondo.", control: false },
      { name: "format", kind: "enum", type: "'png' | 'jpeg' | 'svg'", options: ["png","jpeg","svg"], default: "png", description: "Formato de value: PNG, JPEG (fondo blanco) o SVG vectorial." },
      { name: "mode", kind: "enum", type: "'draw' | 'type' (model)", options: ["draw","type"], default: "draw", description: "Dibujar a mano o escribir el nombre." },
      { name: "typing", kind: "boolean", type: "boolean", default: true, description: "Ofrece el modo escrito, la alternativa para quien no puede dibujar." },
      { name: "penColor", kind: "string", type: "string", default: "#1e293b", description: "Color de la tinta." },
      { name: "background", kind: "string", type: "string", default: "#ffffff", description: "Fondo del área y de la imagen (transparent para PNG o SVG sin fondo)." },
      { name: "minWidth", kind: "number", type: "number", default: 1, description: "Grosor mínimo del trazo (trazo rápido)." },
      { name: "maxWidth", kind: "number", type: "number", default: 3.2, description: "Grosor máximo del trazo (trazo lento o con presión)." },
      { name: "height", kind: "string", type: "string", default: "11rem", description: "Alto del área de firma." },
      { name: "font", kind: "string", type: "string", default: undefined, description: "Tipografía del nombre escrito. Por defecto (CB_SIGNATURE_FONT), manuscritas del sistema.", control: false },
      { name: "placeholder", kind: "string", type: "string", default: undefined, localeKey: "signaturePlaceholder", description: "Texto del área vacía." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Desactiva el área (también con Angular Forms)." },
      { name: "readonly", kind: "boolean", type: "boolean", default: false, description: "Muestra la firma sin permitir cambiarla." },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca de error (también con Angular Forms)." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "Nombre del área (por defecto, \"Área de firma\")." }
    ],
    events: [
      { name: "signStart", type: "void", description: "Empieza un trazo." },
      { name: "signEnd", type: "CbSignatureData", description: "Termina un trazo o cambia el nombre escrito (con la firma completa: trazos o texto)." },
      { name: "cleared", type: "void", description: "Se borró la firma." }
    ]
  },
  "cb-image-cropper": {
    component: CbImageCropper,
    selector: "cb-image-cropper",
    props: [
      { name: "src", kind: "string", type: "string", default: "", example: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", description: "Imagen a recortar (URL o data URL); las de otro dominio necesitan CORS." },
      { name: "rect", kind: "string", type: "CbCropRect | null (model)", default: null, description: "Recuadro en fracciones de la imagen (x, y, w, h entre 0 y 1). Se inicia al cargar la imagen.", control: false },
      { name: "ratio", kind: "string", type: "number | null (model)", default: null, description: "Proporción ancho / alto (null = libre).", control: false },
      { name: "ratios", kind: "string", type: "readonly CbCropRatio[]", default: undefined, description: "Proporciones de la barra (vacío para ocultarla). Por defecto, Libre, 1:1, 4:3 y 16:9.", control: false },
      { name: "shape", kind: "enum", type: "'rect' | 'circle'", options: ["rect","circle"], default: "rect", description: "Recorte rectangular o circular (PNG transparente, 1:1)." },
      { name: "output", kind: "string", type: "CbCropOutput", default: {}, description: "Formato (type), calidad (quality) y tamaño máximo (maxWidth, maxHeight) del recorte.", control: false },
      { name: "rotatable", kind: "boolean", type: "boolean", default: true, description: "Botones de girar 90°." },
      { name: "preview", kind: "boolean", type: "boolean", default: false, description: "Vista previa del recorte." },
      { name: "chooser", kind: "boolean", type: "boolean", default: true, description: "Botón para elegir otra imagen y soltar archivos en el área vacía." },
      { name: "showApply", kind: "boolean", type: "boolean", default: true, description: "Botón Recortar (sin él, recorta llamando a crop())." },
      { name: "accept", kind: "string", type: "string", default: "image/*", description: "Tipos de archivo del selector." },
      { name: "maxHeight", kind: "string", type: "string", default: "24rem", description: "Alto máximo de la imagen en pantalla." },
      { name: "emptyMessage", kind: "string", type: "string", default: undefined, localeKey: "cropperEmpty", description: "Texto del área sin imagen." }
    ],
    events: [
      { name: "cropped", type: "CbCropResult", description: "Recorte hecho con Recortar o Enter ({ blob, dataUrl, rect, width, height })." },
      { name: "fileSelect", type: "File", description: "Imagen elegida o soltada por el usuario." },
      { name: "cropError", type: "unknown", description: "No se pudo cargar o recortar la imagen (p. ej. sin CORS)." }
    ]
  },
  "cb-infinite-scroll": {
    component: CbInfiniteScroll,
    selector: "cb-infinite-scroll",
    props: [
      { name: "loading", kind: "boolean", type: "boolean", default: false, description: "Hay una carga en curso: muestra el indicador y evita pedir otra." },
      { name: "hasMore", kind: "boolean", type: "boolean", default: true, description: "Quedan elementos por cargar." },
      { name: "error", kind: "boolean", type: "boolean", default: false, description: "La última carga falló: muestra el aviso y Reintentar." },
      { name: "count", kind: "number", type: "number", default: undefined, description: "Elementos ya cargados, para anunciar cuántos llegaron y enfocar el primero nuevo." },
      { name: "mode", kind: "enum", type: "'auto' | 'button'", options: ["auto","button"], default: "auto", description: "Carga al llegar al final o solo con el botón." },
      { name: "autoLimit", kind: "number", type: "number", default: 3, description: "Cargas automáticas seguidas antes de pasar al botón (0 = sin límite)." },
      { name: "threshold", kind: "string", type: "string", default: "200px", description: "Distancia al final a la que empieza a cargar." },
      { name: "scrollable", kind: "boolean", type: "boolean", default: false, description: "El propio componente hace scroll (si no, la página)." },
      { name: "height", kind: "string", type: "string", default: "24rem", description: "Alto máximo con scrollable." },
      { name: "itemSelector", kind: "string", type: "string", default: "li, [role=listitem], article", description: "Elementos de la lista, para enfocar el primero nuevo tras Cargar más." },
      { name: "showEnd", kind: "boolean", type: "boolean", default: true, description: "Mensaje al llegar al final." },
      { name: "endMessage", kind: "string", type: "string", default: undefined, localeKey: "infiniteEnd", description: "Texto del final." },
      { name: "errorMessage", kind: "string", type: "string", default: undefined, localeKey: "infiniteError", description: "Texto del error." },
      { name: "loadMoreLabel", kind: "string", type: "string", default: undefined, localeKey: "infiniteLoadMore", description: "Texto del botón." }
    ],
    events: [
      { name: "loadMore", type: "CbLoadMoreSource", description: "Pide la siguiente página: 'scroll', 'button' o 'retry'." }
    ]
  },
  "cb-masonry": {
    component: CbMasonry,
    selector: "cb-masonry",
    props: [
      { name: "columns", kind: "number", type: "number", default: 0, description: "Número fijo de columnas (0 = las que quepan con minColumnWidth)." },
      { name: "minColumnWidth", kind: "string", type: "string", default: "16rem", description: "Ancho mínimo de columna cuando columns es 0." },
      { name: "gap", kind: "string", type: "string", default: "16px", description: "Separación entre elementos (cualquier longitud CSS)." }
    ],
    events: [

    ]
  },
  "cb-gantt": {
    component: CbGantt,
    selector: "cb-gantt",
    props: [
      { name: "tasks", kind: "string", type: "readonly CbGanttTask[] (model)", default: [], example: [{ id: 'a', name: 'Análisis', start: '2026-10-20', end: '2026-10-24', progress: 100 }, { id: 'b', name: 'Desarrollo', start: '2026-10-27', end: '2026-11-07', progress: 40, dependencies: ['a'] }, { id: 'c', name: 'Entrega', type: 'milestone', start: '2026-11-10', end: '2026-11-10', dependencies: ['b'] }], description: "Tareas (id, name, start, end, progress, parent, dependencies, type, color, assignee).", control: false },
      { name: "scale", kind: "enum", type: "'day' | 'week' | 'month' (model)", options: ["day", "week", "month"], default: "day", description: "Un día, una semana o un mes por columna." },
      { name: "columns", kind: "string", type: "CbGanttColumn[]", default: undefined, description: "Columnas de la tabla: name, start, end, duration, progress, assignee.", control: false },
      { name: "gridWidth", kind: "string", type: "string", default: "30rem", description: "Ancho de la tabla de la izquierda." },
      { name: "height", kind: "string", type: "string", default: "28rem", description: "Alto del componente (con scroll)." },
      { name: "autoSchedule", kind: "boolean", type: "boolean", default: true, description: "Al retrasar una tarea, desplaza las que dependen de ella." },
      { name: "readonly", kind: "boolean", type: "boolean", default: false, description: "Sin edición (ni arrastre ni dependencias)." },
      { name: "showToolbar", kind: "boolean", type: "boolean", default: true, description: "Barra con la escala y el botón Hoy." },
      { name: "emptyMessage", kind: "string", type: "string", default: undefined, localeKey: "noData", description: "Texto sin tareas." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "Nombre del diagrama." }
    ],
    events: [
      { name: "taskChange", type: "CbGanttChange", description: "Una tarea cambió ({ task, previous, reason: 'move' | 'resize' | 'progress' | 'schedule' })." },
      { name: "taskOpen", type: "CbGanttTask", description: "Doble clic o Enter sobre una tarea." },
      { name: "linkAdd", type: "CbGanttLink", description: "Dependencia creada ({ from, to }: to depende de from)." },
      { name: "linkRemove", type: "CbGanttLink", description: "Dependencia quitada." }
    ]
  },
  "cb-kanban": {
    component: CbKanban,
    selector: "cb-kanban",
    props: [
      { name: "columns", kind: "string", type: "readonly CbKanbanColumn[] (model)", default: [], example: [{ id: 'todo', title: 'To do', items: [{ id: 1, title: 'Design', description: 'Transfers screen' }, { id: 2, title: 'API' }] }, { id: 'doing', title: 'In progress', limit: 2, items: [{ id: 3, title: 'Login' }] }, { id: 'done', title: 'Done', items: [] }], description: "Columnas (id, title, items, limit, color).", control: false },
      { name: "itemKey", kind: "string", type: "string", default: "id", description: "Propiedad que identifica cada tarjeta." },
      { name: "itemLabel", kind: "string", type: "string", default: "title", description: "Propiedad con el nombre de la tarjeta." },
      { name: "enforceLimit", kind: "boolean", type: "boolean", default: false, description: "No deja superar el límite de una columna." },
      { name: "editable", kind: "boolean", type: "boolean", default: false, example: true, description: "Menú en cada tarjeta (editar, mover a, eliminar) y atajos F2 / Supr." },
      { name: "addable", kind: "boolean", type: "boolean", default: false, example: true, description: "Campo Añadir tarjeta al pie de cada columna." },
      { name: "columnsEditable", kind: "boolean", type: "boolean", default: false, description: "Renombrar, eliminar y añadir columnas." },
      { name: "collapsible", kind: "boolean", type: "boolean", default: false, description: "Las columnas se pueden contraer." },
      { name: "confirmDelete", kind: "boolean", type: "boolean", default: true, description: "Pide confirmación antes de eliminar." },
      { name: "createCard", kind: "string", type: "(title: string, columnId: string) => T", default: null, description: "Crea la tarjeta nueva a partir del título.", control: false },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilita mover tarjetas." },
      { name: "emptyMessage", kind: "string", type: "string", default: undefined, localeKey: "noData", description: "Texto de una columna vacía." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "Nombre del tablero." },
      { name: "details", kind: "boolean", type: "boolean", default: false, example: true, description: "Al abrir una tarjeta muestra el panel de detalle (responsables, prioridad, fechas, descripción y adjuntos)." },
      { name: "people", kind: "string", type: "readonly CbKanbanPerson[]", default: [], example: [{ id: 'ana', name: 'Ana Ruiz' }, { id: 'leo', name: 'Leo Mora' }], description: "Personas que se pueden asignar (id, name, image).", control: false },
      { name: "priorities", kind: "string", type: "readonly CbKanbanPriority[] | null", default: null, description: "Niveles de prioridad (id, label, severity). Por defecto: baja, media y alta.", control: false },
      { name: "accept", kind: "string", type: "string", default: "", description: "Tipos de archivo admitidos en los adjuntos (p. ej. image/*,.pdf)." }
    ],
    events: [
      { name: "cardMove", type: "CbKanbanMove", description: "Tarjeta movida ({ item, from, to, fromIndex, toIndex })." },
      { name: "cardOpen", type: "T", description: "Se pulsó una tarjeta (o Enter)." },
      { name: "cardAdd", type: "CbKanbanCardEvent", description: "Tarjeta creada ({ item, column, index })." },
      { name: "cardEdit", type: "CbKanbanCardEvent", description: "Tarjeta editada: título o campos del panel ({ item, previous, column, index })." },
      { name: "cardDelete", type: "CbKanbanCardEvent", description: "Tarjeta eliminada ({ item, column, index })." },
      { name: "columnAdd", type: "CbKanbanColumnEvent", description: "Columna añadida." },
      { name: "columnRename", type: "CbKanbanColumnEvent", description: "Columna renombrada ({ column, previousTitle })." },
      { name: "columnDelete", type: "CbKanbanColumnEvent", description: "Columna eliminada con sus tarjetas." }
    ]
  },
  "cb-mentions": {
    component: CbMentions,
    selector: "cb-mentions",
    props: [
      { name: "value", kind: "string", type: "string (model)", default: "", description: "Texto del campo." },
      { name: "suggestions", kind: "string", type: "readonly CbMentionItem[]", default: [], example: [{ id: 'u1', label: 'Laura Gómez', description: 'Product' }, { id: 'u2', label: 'Andrés Pérez', description: 'Engineering' }, { id: 'u3', label: 'Ángela Ruiz', description: 'Design' }], description: "Elementos mencionables (id, label, description, avatar, trigger).", control: false },
      { name: "triggers", kind: "string", type: "readonly string[]", default: ["@"], description: "Caracteres que abren las sugerencias.", control: false },
      { name: "label", kind: "string", type: "string", default: "", example: "Comment", description: "Etiqueta." },
      { name: "placeholder", kind: "string", type: "string", default: "", example: "Type @ to mention", description: "Placeholder." },
      { name: "hint", kind: "string", type: "string", default: "", description: "Texto de ayuda." },
      { name: "rows", kind: "number", type: "number", default: 3, description: "Filas visibles." },
      { name: "filter", kind: "boolean", type: "boolean", default: true, description: "Filtra las sugerencias con lo escrito." },
      { name: "maxResults", kind: "number", type: "number", default: 8, description: "Máximo de sugerencias visibles." },
      { name: "loading", kind: "boolean", type: "boolean", default: false, description: "Muestra Cargando sin sugerencias." },
      { name: "required", kind: "boolean", type: "boolean", default: false, description: "Obligatorio." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilitado." }
    ],
    events: [
      { name: "search", type: "CbMentionSearch", description: "Lo escrito tras el disparador ({ trigger, query })." },
      { name: "mentionsChange", type: "CbMention[]", description: "Menciones presentes en el texto." }
    ]
  },
  "cb-descriptions": {
    component: CbDescriptions,
    selector: "cb-descriptions",
    props: [
      { name: "items", kind: "string", type: "readonly CbDescriptionItem[]", default: [], example: [{ label: 'Name', value: 'Laura Gómez' }, { label: 'Account', value: '**** 1234' }, { label: 'Balance', value: '$ 1,250' }, { label: 'Status', value: 'Active' }], description: "Pares etiqueta / valor (label, value, key, span).", control: false },
      { name: "title", kind: "string", type: "string", default: "", example: "Customer", description: "Título (encabezado) del bloque." },
      { name: "headingLevel", kind: "number", type: "number", default: 3, description: "Nivel del encabezado del título." },
      { name: "columns", kind: "number", type: "number", default: 2, description: "Columnas en pantallas anchas." },
      { name: "layout", kind: "enum", type: "'horizontal' | 'vertical'", options: ["vertical", "horizontal"], default: "vertical", description: "Etiqueta encima o al lado del valor." },
      { name: "bordered", kind: "boolean", type: "boolean", default: false, description: "Bordes entre elementos." }
    ]
  },
  "cb-result": {
    component: CbResult,
    selector: "cb-result",
    content: { default: "" },
    props: [
      { name: "status", kind: "enum", type: "CbResultStatus", options: ["success", "error", "warning", "info", "404", "403", "500"], default: "info", example: "success", description: "Tipo de resultado (icono y color)." },
      { name: "title", kind: "string", type: "string", default: "", example: "Transfer sent", description: "Título (encabezado)." },
      { name: "subtitle", kind: "string", type: "string", default: "", example: "Receipt #48213", description: "Texto de apoyo." },
      { name: "icon", kind: "string", type: "string", default: undefined, description: "Icono propio en lugar del del estado." },
      { name: "headingLevel", kind: "number", type: "number", default: 2, description: "Nivel del encabezado del título." }
    ]
  },
  "cb-anchor": {
    component: CbAnchor,
    selector: "cb-anchor",
    props: [
      { name: "links", kind: "string", type: "readonly CbAnchorLink[]", default: [], example: [{ label: 'Import', href: '#import' }, { label: 'Basic', href: '#basic' }, { label: 'Playground', href: '#playground' }, { label: 'API', href: '#api' }], description: "Enlaces a los id de las secciones (label, href, children).", control: false },
      { name: "offset", kind: "number", type: "number", default: 0, description: "Alto (px) de la cabecera fija." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "onThisPage", description: "Nombre de la navegación." }
    ],
    events: [
      { name: "activeChange", type: "string | null", description: "Sección visible (su href)." }
    ]
  },
  "cb-speed-dial": {
    component: CbSpeedDial,
    selector: "cb-speed-dial",
    props: [
      { name: "items", kind: "string", type: "readonly CbSpeedDialItem[]", default: [], example: [{ label: 'Add', icon: 'plus' }, { label: 'Search', icon: 'search' }, { label: 'Settings', icon: 'settings' }], description: "", control: false },
      { name: "direction", kind: "enum", type: "CbSpeedDialDirection", options: ["up", "down", "left", "right"], default: "up", description: "" },
      { name: "icon", kind: "string", type: "string", default: "plus", description: "" },
      { name: "closeIcon", kind: "string", type: "string", default: "x", description: "" },
      { name: "openLabel", kind: "string", type: "string", default: undefined, localeKey: "openActions", description: "" },
      { name: "closeLabel", kind: "string", type: "string", default: undefined, localeKey: "closeActions", description: "" },
      { name: "open", kind: "boolean", type: "boolean (model)", default: false, description: "" }
    ],
    events: [
      { name: "itemSelect", type: "CbSpeedDialItem", description: "" }
    ]
  },
  "cb-spinner": {
    component: CbSpinner,
    selector: "cb-spinner",
    props: [
      { name: "size", kind: "number", type: "number", default: 32, description: "Tamaño en píxeles." },
      { name: "strokeWidth", kind: "number", type: "number", default: 4, description: "Grosor del trazo." },
      { name: "severity", kind: "enum", type: "CbSeverity", options: ["primary", "secondary", "success", "warning", "danger", "info", "help", "contrast"], default: "primary", description: "" },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "" }
    ]
  },
  "cb-split-button": {
    component: CbSplitButton,
    selector: "cb-split-button",
    props: [
      { name: "label", kind: "string", type: "string", default: "", example: "Save", description: "Texto de la acción principal (también nombra el grupo)." },
      { name: "icon", kind: "string", type: "string", default: undefined, example: "check", description: "Icono de la acción principal." },
      { name: "items", kind: "string", type: "readonly CbMenuItem[]", default: [], example: [{ label: 'Save draft' }, { label: 'Save and send' }], description: "Acciones secundarias del menú.", control: false },
      { name: "severity", kind: "enum", type: "CbSeverity", options: ["primary", "secondary", "success", "warning", "danger", "info", "help", "contrast"], default: "primary", description: "Severidad semántica (color)." },
      { name: "variant", kind: "enum", type: "CbButtonVariant", options: ["solid", "outlined", "text"], default: "solid", description: "Variante visual." },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "Tamaño." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilita los dos botones." },
      { name: "loading", kind: "boolean", type: "boolean", default: false, description: "Spinner en la acción principal." },
      { name: "menuAriaLabel", kind: "string", type: "string", default: undefined, localeKey: "moreActions", description: "Nombre del botón de la flecha y del menú." }
    ],
    events: [
      { name: "primaryClick", type: "MouseEvent", description: "Clic en la acción principal." },
      { name: "itemSelect", type: "CbMenuItem", description: "Acción secundaria elegida." }
    ]
  },
  "cb-statistic": {
    component: CbStatistic,
    selector: "cb-statistic",
    props: [
      { name: "title", kind: "string", type: "string", default: "", example: "Balance", description: "Título de la cifra." },
      { name: "value", kind: "number", type: "number | string | null", default: null, example: 12450, description: "Valor (número formateado o texto tal cual)." },
      { name: "prefix", kind: "string", type: "string", default: "", description: "Texto antes del valor." },
      { name: "suffix", kind: "string", type: "string", default: "", description: "Texto después del valor." },
      { name: "format", kind: "string", type: "Intl.NumberFormatOptions", default: undefined, description: "Opciones de Intl.NumberFormat.", control: false },
      { name: "locale", kind: "enum", type: "string", options: ["es-CO", "es-ES", "en-US", "pt-BR"], default: undefined, description: "Locale BCP 47 del formato." },
      { name: "trend", kind: "enum", type: "'up' | 'down' | null", options: ["up", "down"], default: null, description: "Tendencia: flecha, color y texto para lectores de pantalla." },
      { name: "trendLabel", kind: "string", type: "string", default: "", example: "vs last month", description: "Texto junto a la tendencia." }
    ]
  },
  "cb-theme-toggle": {
    component: CbThemeToggle,
    selector: "cb-theme-toggle",
    props: [
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "Tamaño del botón." },
      { name: "showLabel", kind: "boolean", type: "boolean", default: false, description: "Muestra el texto además del icono." }
    ]
  },
  "cb-splitter": {
    component: CbSplitter,
    demo: DocPgSplitter,
    selector: "cb-splitter",
    codeContent: "<cb-splitter-panel [size]=\"35\" [minSize]=\"15\">Left panel</cb-splitter-panel>\n<cb-splitter-panel [size]=\"65\" [minSize]=\"20\">Right panel</cb-splitter-panel>",
    props: [
      { name: "layout", kind: "enum", type: "CbSplitterLayout", options: ["horizontal", "vertical"], default: "horizontal", description: "Orientación de la división: `'horizontal'` (lado a lado) o `'vertical'` (apilados)." },
      { name: "gutterSize", kind: "number", type: "number", default: 8, description: "Grosor del separador en píxeles." },
      { name: "step", kind: "number", type: "number", default: 5, description: "Paso porcentual al redimensionar con teclado." }
    ],
    events: [
      { name: "resizeEnd", type: "CbSplitterResizeEndEvent", description: "Emitido al finalizar un ajuste de tamaño." }
    ]
  },
  "cb-status": {
    component: CbStatus,
    selector: "cb-status",
    content: { default: "Content" },
    props: [
      { name: "text", kind: "string", type: "string", default: "", example: "Active", description: "" },
      { name: "status", kind: "enum", type: "'success' | 'warning' | 'error' | 'info'", options: ["success", "warning", "error", "info"], default: "info", description: "" }
    ]
  },
  "cb-step-indicator": {
    component: CbStepIndicator,
    selector: "cb-step-indicator",
    props: [
      { name: "currentStep", kind: "number", type: "number", default: 1, description: "Paso actual (1-based)." },
      { name: "totalSteps", kind: "number", type: "number", default: 4, description: "Número total de pasos." },
      { name: "label", kind: "string", type: "string", default: "", example: "Datos de destino", description: "Leyenda del paso actual." }
    ]
  },
  "cb-stepper": {
    component: CbStepper,
    demo: DocPgStepper,
    selector: "cb-stepper",
    codeContent: "<cb-step label=\"Account\"><p>Choose the source account.</p></cb-step>\n<cb-step label=\"Amount\"><p>Enter the amount to transfer.</p></cb-step>\n<cb-step label=\"Confirm\"><p>Review and confirm the transfer.</p></cb-step>",
    props: [
      { name: "showNav", kind: "boolean", type: "boolean", default: true, description: "Muestra los botones Atrás/Siguiente integrados." }
    ]
  },
  "cb-steps": {
    component: CbSteps,
    selector: "cb-steps",
    props: [
      { name: "steps", kind: "string", type: "readonly CbStepItem[]", default: [], example: [{ label: 'Account' }, { label: 'Payment' }, { label: 'Confirm' }], description: "", control: false },
      { name: "activeIndex", kind: "number", type: "number (model)", default: 0, description: "" },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "steps", description: "" }
    ],
    events: [
      { name: "activeChange", type: "number", description: "" }
    ]
  },
  "cb-stroke": {
    component: CbStroke,
    selector: "cb-stroke",
    props: [
      { name: "name", kind: "string", type: "string", default: "01", description: "" },
      { name: "size", kind: "string", type: "string", default: "220px", description: "" },
      { name: "color", kind: "string", type: "string", default: "var(--cb-color-primary-500, #10b981)", description: "" },
      { name: "ariaHidden", kind: "boolean", type: "boolean", default: true, description: "" },
      { name: "alt", kind: "string", type: "string", default: undefined, localeKey: "decorativeStroke", description: "" }
    ]
  },
  "cb-switch": {
    component: CbSwitch,
    selector: "cb-switch",
    props: [
      { name: "label", kind: "string", type: "string", default: "", example: "Notifications", description: "Etiqueta visible junto al control." },
      { name: "leftLabel", kind: "boolean", type: "boolean", default: false, description: "Coloca la etiqueta a la izquierda del control." },
      { name: "required", kind: "boolean", type: "boolean", default: false, description: "Marca el control como requerido (`aria-required`)." },
      { name: "requiredIndicator", kind: "enum", type: "'asterisk' | 'text' | 'optional' | 'none'", options: ["none", "asterisk", "text", "optional"], default: undefined, description: "Indicador de obligatoriedad en la etiqueta; si se omite usa el global de provideCaribeNG()." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilitado declarativo (se combina con Angular Forms)." },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "Id del input; se genera uno estable si no se provee.", control: false },
      { name: "checked", kind: "boolean", type: "boolean (model)", default: false, description: "Estado del switch (two-way: `[(checked)]`)." }
    ],
    events: [
      { name: "changed", type: "boolean", description: "Emite el nuevo estado al cambiar." }
    ]
  },
  "cb-table": {
    component: CbTable,
    selector: "cb-table",
    props: [
      { name: "value", kind: "string", type: "readonly unknown[]", default: [], example: [{ id: 1, name: 'Keyboard', price: 120 }, { id: 2, name: 'Mouse', price: 60 }, { id: 3, name: 'Monitor', price: 300 }], description: "Filas de la tabla.", control: false },
      { name: "columns", kind: "string", type: "readonly CbTableColumn[]", default: [], example: [{ field: 'name', header: 'Name', sortable: true, filter: true }, { field: 'price', header: 'Price', sortable: true, align: 'right' }], description: "Columnas: field, header, sortable, filter, filterMatchMode, align y width.", control: false },
      { name: "globalFilter", kind: "string", type: "string (model)", default: "", description: "Texto del filtro global; busca sin distinguir mayúsculas ni tildes." },
      { name: "globalFilterFields", kind: "string", type: "readonly string[] | null", default: null, description: "Campos en los que busca el filtro global. Por defecto, los de todas las columnas.", control: false },
      { name: "paginator", kind: "boolean", type: "boolean", default: false, description: "Muestra el paginador." },
      { name: "rows", kind: "number", type: "number (model)", default: 10, description: "Filas por página." },
      { name: "rowsPerPageOptions", kind: "string", type: "readonly number[]", default: [], description: "Opciones de filas por página.", control: false },
      { name: "selectionMode", kind: "enum", type: "'single' | 'multiple' | null", options: ["single", "multiple"], default: null, description: "Selección de filas (radio o checkbox por fila)." },
      { name: "selection", kind: "string", type: "unknown (model)", default: null, description: "Fila o filas seleccionadas.", control: false },
      { name: "dataKey", kind: "string", type: "string | null", default: null, example: "id", description: "Propiedad que identifica cada fila (selección y filas expandidas)." },
      { name: "expandedRowKeys", kind: "string", type: "readonly unknown[] (model)", default: [], description: "Claves de las filas expandidas; requiere la plantilla cbTableRowExpansion.", control: false },
      { name: "resizableColumns", kind: "boolean", type: "boolean", default: false, description: "Permite cambiar el ancho de las columnas con el ratón o el teclado." },
      { name: "striped", kind: "boolean", type: "boolean", default: false, description: "Filas alternas sombreadas." },
      { name: "rowHover", kind: "boolean", type: "boolean", default: true, description: "Resalta la fila bajo el puntero." },
      { name: "size", kind: "enum", type: "'sm' | 'md' | 'lg'", options: ["sm", "md", "lg"], default: "md", description: "Densidad de las celdas." },
      { name: "emptyMessage", kind: "string", type: "string", default: undefined, localeKey: "noData", description: "Mensaje cuando no hay filas." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, description: "Nombre accesible de la tabla." },
      { name: "lazy", kind: "boolean", type: "boolean", default: false, description: "Datos desde el servidor: la tabla emite lazyLoad y muestra value tal cual." },
      { name: "totalRecords", kind: "number", type: "number | null", default: null, description: "Total de filas en el servidor (modo lazy), para el paginador.", control: false },
      { name: "loading", kind: "boolean", type: "boolean", default: false, description: "Capa de carga y aria-busy." },
      { name: "scrollHeight", kind: "string", type: "string | null", default: null, description: "Alto máximo (CSS): la tabla hace scroll con la cabecera fija." },
      { name: "groupRowsBy", kind: "string", type: "string | null", default: null, description: "Agrupa las filas por este campo, con una cabecera por grupo." }
    ],
    events: [
      { name: "lazyLoad", type: "CbTableLazyLoadEvent", description: "Modo lazy: { first, rows, sortField, sortOrder, globalFilter, filters } a pedir al servidor." },
      { name: "sortChange", type: "{ field: string | null; order: 1 | -1 }", description: "Se emite al cambiar la ordenación." },
      { name: "filterChange", type: "CbTableFilterState", description: "Se emite al cambiar un filtro (global o de columna)." },
      { name: "columnResize", type: "{ field: string; width: number }", description: "Se emite al terminar de cambiar el ancho de una columna." },
      { name: "rowExpand", type: "unknown", description: "Se emite al expandir una fila." },
      { name: "rowCollapse", type: "unknown", description: "Se emite al contraer una fila." }
    ]
  },
  "cb-tabmenu": {
    component: CbTabMenu,
    selector: "cb-tabmenu",
    props: [
      { name: "items", kind: "string", type: "readonly CbTabMenuItem[]", default: [], example: [{ label: 'Overview' }, { label: 'Activity' }, { label: 'Settings' }], description: "", control: false },
      { name: "activeIndex", kind: "number", type: "number (model)", default: 0, description: "" },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "sectionNavigation", description: "" }
    ],
    events: [
      { name: "itemSelect", type: "CbTabMenuItem", description: "" }
    ]
  },
  "cb-tabs": {
    component: CbTabs,
    demo: DocPgTabs,
    selector: "cb-tabs",
    codeContent: "<cb-tab label=\"Overview\"><p>Balance and recent activity.</p></cb-tab>\n<cb-tab label=\"Activity\"><p>Transfers and payments of the month.</p></cb-tab>\n<cb-tab label=\"Settings\"><p>Alerts and limits.</p></cb-tab>",
    props: []
  },
  "cb-tag": {
    component: CbTag,
    selector: "cb-tag",
    content: { default: "Content" },
    props: [
      { name: "value", kind: "string", type: "string", default: "", example: "New", description: "" },
      { name: "severity", kind: "enum", type: "CbSeverity", options: ["primary", "secondary", "success", "warning", "danger", "info", "help", "contrast"], default: "primary", description: "" },
      { name: "icon", kind: "string", type: "string", default: "", description: "Icono (nombre del set de iconos)." },
      { name: "rounded", kind: "boolean", type: "boolean", default: false, description: "Esquinas totalmente redondeadas (pill)." }
    ]
  },
  "cb-tag-button": {
    component: CbTagButton,
    selector: "cb-tag-button",
    props: [
      { name: "label", kind: "string", type: "string", default: "", example: "Filtro", description: "Texto del tag." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilita la interacción." },
      { name: "selected", kind: "boolean", type: "boolean (model)", default: false, description: "Estado seleccionado (two-way: `[(selected)]`)." }
    ],
    events: [
      { name: "changed", type: "boolean", description: "Emite el nuevo estado al pulsar." }
    ]
  },
  "cb-terminal": {
    component: CbTerminal,
    selector: "cb-terminal",
    props: [
      { name: "welcomeMessage", kind: "string", type: "string", default: "", example: "Welcome to the CaribeNG terminal. Type a command.", description: "" },
      { name: "prompt", kind: "string", type: "string", default: "caribeng $", description: "" }
    ],
    events: [
      { name: "commandEntered", type: "string", description: "" }
    ]
  },
  "cb-textarea": {
    component: CbTextarea,
    selector: "cb-textarea",
    props: [
      { name: "value", kind: "string", type: "string (model)", default: "", description: "Valor del control (two-way opcional fuera de Angular Forms)." },
      { name: "label", kind: "string", type: "string", default: "", example: "Comments", description: "Etiqueta accesible. Si se omite, usa un `aria-label` externo." },
      { name: "hint", kind: "string", type: "string", default: "", description: "Texto de ayuda bajo el campo." },
      { name: "error", kind: "string", type: "string", default: "", description: "Mensaje de error (se muestra cuando `invalid` es true)." },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido." },
      { name: "placeholder", kind: "string", type: "string", default: "", description: "Placeholder." },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "Tamaño." },
      { name: "rows", kind: "number", type: "number", default: 3, description: "Número de filas inicial." },
      { name: "autoResize", kind: "boolean", type: "boolean", default: false, description: "Crece automáticamente con el contenido (ignora el scroll vertical)." },
      { name: "maxlength", kind: "number", type: "number | null", default: null, description: "Límite de caracteres; muestra un contador cuando se define." },
      { name: "readonly", kind: "boolean", type: "boolean", default: false, description: "Solo lectura." },
      { name: "required", kind: "boolean", type: "boolean", default: false, description: "Marca el campo como requerido (atributo + indicador visual)." },
      { name: "requiredIndicator", kind: "enum", type: "'asterisk' | 'text' | 'optional' | 'none'", options: ["none", "asterisk", "text", "optional"], default: undefined, description: "Indicador de obligatoriedad en la etiqueta; si se omite usa el global de provideCaribeNG()." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilitado de forma declarativa (se combina con Angular Forms)." },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "Id del textarea; se genera uno estable si no se provee.", control: false }
    ]
  },
  "cb-tieredmenu": {
    component: CbTieredMenu,
    selector: "cb-tieredmenu",
    props: [
      { name: "items", kind: "string", type: "readonly CbTieredMenuItem[]", default: [], example: [{ label: 'New' }, { label: 'Open' }, { label: 'Save' }, { separator: true }, { label: 'Export' }], description: "", control: false },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "menu", description: "" },
      { name: "triggerLabel", kind: "string", type: "string", default: undefined, localeKey: "menu", description: "" }
    ],
    events: [
      { name: "itemSelect", type: "CbTieredMenuItem", description: "" }
    ]
  },
  "cb-timeline": {
    component: CbTimeline,
    selector: "cb-timeline",
    props: [
      { name: "value", kind: "string", type: "readonly CbTimelineEvent[]", default: [], example: [{ date: 'Oct 18, 2026', title: 'Payment sent', description: 'Transfer to savings account.' }, { date: 'Oct 17, 2026', title: 'Card reloaded', description: 'Top-up of $ 50,000.' }, { date: 'Oct 15, 2026', title: 'Account opened' }], description: "", control: false },
      { name: "orientation", kind: "enum", type: "'vertical'|'horizontal'", options: ["vertical", "horizontal"], default: "vertical", description: "" },
      { name: "align", kind: "enum", type: "CbTimelineAlign", options: ["left", "right", "alternate"], default: "left", description: "Lado del contenido respecto a la línea." },
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "timeline", description: "" }
    ]
  },
  "cb-toast": {
    component: CbToast,
    demo: DocPgToast,
    selector: "cb-toast",
    props: [
      { name: "position", kind: "enum", type: "CbToastPosition", options: ["top-right", "top-left", "top-center", "bottom-right", "bottom-left", "bottom-center"], default: "top-right", description: "" }
    ]
  },
  "cb-toggle": {
    component: CbToggle,
    selector: "cb-toggle",
    props: [
      { name: "label", kind: "string", type: "string", default: "", example: "Dark mode", description: "Etiqueta mostrada junto al control." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "`aria-label` cuando no hay `label` visible." },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "Tamaño." },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "Deshabilitado de forma declarativa (se combina con Angular Forms)." },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "requiredIndicator", kind: "enum", type: "'asterisk' | 'text' | 'optional' | 'none'", options: ["none", "asterisk", "text", "optional"], default: undefined, description: "Indicador de obligatoriedad en la etiqueta; si se omite usa el global de provideCaribeNG()." },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "Id del input; se genera uno estable si no se provee.", control: false }
    ],
    events: [
      { name: "changed", type: "boolean", description: "Emite el nuevo estado al cambiar." }
    ]
  },
  "cb-togglebutton": {
    component: CbToggleButton,
    selector: "cb-togglebutton",
    props: [
      { name: "onLabel", kind: "string", type: "string", default: undefined, localeKey: "yes", description: "" },
      { name: "offLabel", kind: "string", type: "string", default: undefined, localeKey: "no", description: "" },
      { name: "onIcon", kind: "string", type: "string", default: "", description: "" },
      { name: "offIcon", kind: "string", type: "string", default: "", description: "" },
      { name: "size", kind: "enum", type: "CbSize", options: ["sm", "md", "lg"], default: "md", description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "ariaLabel", kind: "string", type: "string", default: "", description: "" },
      { name: "inputId", kind: "string", type: "string", default: undefined, description: "", control: false },
      { name: "value", kind: "boolean", type: "boolean (model)", default: false, description: "" }
    ],
    events: [
      { name: "changed", type: "boolean", description: "" }
    ]
  },
  "cb-toolbar": {
    component: CbToolbar,
    selector: "cb-toolbar",
    content: {
      default: "",
      children: [
        { component: CbButton, selector: "cb-button", slot: "cb-toolbar-start", inputs: { size: "sm" }, text: "New" },
        { component: CbButton, selector: "cb-button", slot: "cb-toolbar-start", inputs: { size: "sm", variant: "outlined" }, text: "Import" },
        { component: CbButton, selector: "cb-button", slot: "cb-toolbar-end", inputs: { size: "sm", variant: "text" }, text: "Export" }
      ]
    },
    props: [
      { name: "ariaLabel", kind: "string", type: "string", default: undefined, localeKey: "toolbar", description: "Etiqueta accesible para el contenedor `role=\"toolbar\"`." }
    ]
  },
  "cb-tooltip-content": {
    component: CbTooltipContent,
    selector: "cb-tooltip-content",
    props: [
      { name: "text", kind: "string", type: "string", default: "", example: "Helpful hint", description: "" },
      { name: "position", kind: "enum", type: "'top' | 'bottom' | 'left' | 'right'", options: ["top", "bottom", "left", "right"], default: "top", description: "" }
    ]
  },
  "cb-tracker": {
    component: CbTracker,
    selector: "cb-tracker",
    props: [
      { name: "steps", kind: "string", type: "readonly string[]", default: [], example: ['Origin', 'Amount', 'Confirm'], description: "", control: false },
      { name: "currentIndex", kind: "number", type: "number", default: 0, description: "" }
    ]
  },
  "cb-transaction-status": {
    component: CbTransactionStatus,
    selector: "cb-transaction-status",
    props: [
      { name: "status", kind: "enum", type: "'success' | 'warning' | 'error' | 'info'", options: ["success", "warning", "error", "info"], default: "success", description: "" },
      { name: "label", kind: "string", type: "string", default: "", example: "Transacción completada", description: "" }
    ]
  },
  "cb-tree": {
    component: CbTree,
    selector: "cb-tree",
    props: [
      { name: "value", kind: "string", type: "readonly CbTreeNode[]", default: [], example: [{ key: '1', label: 'Documents', children: [{ key: '1-1', label: 'Work' }, { key: '1-2', label: 'Home' }] }, { key: '2', label: 'Pictures' }, { key: '3', label: 'Movies' }], description: "", control: false },
      { name: "selection", kind: "string", type: "CbTreeNode|null (model)", default: null, description: "", control: false }
    ]
  },
  "cb-tree-select": {
    component: CbTreeSelect,
    selector: "cb-tree-select",
    props: [
      { name: "nodes", kind: "string", type: "CbTreeSelectNode[]", default: [], example: [{ key: '1', label: 'Documents', icon: 'folder', children: [{ key: '1-1', label: 'Invoices' }, { key: '1-2', label: 'Reports' }] }, { key: '2', label: 'Pictures' }, { key: '3', label: 'Movies' }], description: "", control: false },
      { name: "placeholder", kind: "string", type: "string", default: undefined, localeKey: "select", description: "" },
      { name: "disabled", kind: "boolean", type: "boolean", default: false, description: "" },
      { name: "invalid", kind: "boolean", type: "boolean", default: false, description: "Marca visual y ARIA de estado inválido (también se activa con Angular Forms)." },
      { name: "value", kind: "string", type: "string | null (model)", default: null, description: "" }
    ]
  },
  "cb-treetable": {
    component: CbTreeTable,
    selector: "cb-treetable",
    props: [
      { name: "value", kind: "string", type: "readonly CbTreeTableNode[]", default: [], example: [{ key: '1', data: { name: 'Savings', balance: '$ 2,500' }, children: [{ key: '1-1', data: { name: 'Emergency fund', balance: '$ 1,200' } }] }, { key: '2', data: { name: 'Checking', balance: '$ 840' } }], description: "", control: false },
      { name: "columns", kind: "string", type: "readonly CbTreeTableColumn[]", default: [], example: [{ field: 'name', header: 'Account' }, { field: 'balance', header: 'Balance' }], description: "", control: false }
    ]
  },
  "cb-virtualscroller": {
    component: CbVirtualScroller,
    selector: "cb-virtualscroller",
    props: [
      { name: "items", kind: "string", type: "readonly unknown[]", default: [], example: Array.from({ length: 1000 }, (_, i) => 'Item ' + (i + 1)), description: "", control: false },
      { name: "itemSize", kind: "number", type: "number", default: 40, description: "" },
      { name: "viewportHeight", kind: "number", type: "number", default: 240, description: "" },
      { name: "buffer", kind: "number", type: "number", default: 4, description: "Filas extra que se pintan fuera de la vista." }
    ]
  },
  "cb-voucher": {
    component: CbVoucher,
    selector: "cb-voucher",
    content: { default: "Content" },
    props: [
      { name: "title", kind: "string", type: "string", default: undefined, localeKey: "receipt", description: "" },
      { name: "rows", kind: "string", type: "readonly { label: string; value: string }[]", default: [{ label: 'Amount', value: '$ 150,000' }, { label: 'Date', value: 'Oct 18, 2026' }, { label: 'Reference', value: 'TRX-00921' }], description: "", control: false },
      { name: "actionLabel", kind: "string", type: "string", default: undefined, localeKey: "share", description: "" }
    ],
    events: [
      { name: "copy", type: "void", description: "" }
    ]
  }
};
