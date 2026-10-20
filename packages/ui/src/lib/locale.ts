/**
 * Textos de interfaz de CaribeNG (etiquetas accesibles, botones, placeholders y
 * mensajes por defecto). Claves planas al estilo de PrimeNG; las partes
 * variables se escriben como `{0}`, `{1}`… y se rellenan con `cbFormat()`.
 *
 * Para traducir o personalizar: `provideCaribeNG({ locale: 'en', translation: { … } })`
 * o, en caliente, `inject(CbLocaleService).use('en')`.
 */
export interface CbTranslation {
  // --- Genéricos ---
  close: string;
  clear: string;
  remove: string;
  /** `{0}`: elemento. */
  removeItem: string;
  search: string;
  filterOptions: string;
  noResults: string;
  noData: string;
  select: string;
  /** `{0}`: elemento. */
  selectItem: string;
  /** `{0}`: cantidad. */
  selectedCount: string;
  selectAll: string;
  options: string;
  loading: string;
  loadingMessage: string;
  previous: string;
  next: string;
  back: string;
  finish: string;
  skip: string;
  start: string;
  continue: string;
  /** `{0}`: paso actual, `{1}`: total. */
  stepOf: string;
  expand: string;
  collapse: string;
  /** `{0}`: elemento. */
  expandItem: string;
  /** `{0}`: elemento. */
  collapseItem: string;
  togglePanel: string;
  progress: string;
  stepsProgress: string;
  /** `{0}`: número de página. */
  page: string;
  pageIndicator: string;
  download: string;
  details: string;
  viewDetails: string;
  share: string;
  receipt: string;
  action: string;
  actionGroup: string;

  // --- Confirmación ---
  accept: string;
  cancel: string;
  confirm: string;
  confirmMessage: string;
  yes: string;
  no: string;

  // --- Overlays ---
  dialog: string;
  panel: string;
  sidePanel: string;
  showInfo: string;
  closeEditing: string;

  // --- Menús y navegación ---
  menu: string;
  mainNavigation: string;
  contextMenu: string;
  categories: string;
  appDock: string;
  panelMenu: string;
  steps: string;
  sectionNavigation: string;
  breadcrumb: string;
  toolbar: string;
  quickActions: string;
  floatingMenu: string;
  openActions: string;
  closeActions: string;

  // --- Formularios ---
  required: string;
  optional: string;
  showSuggestions: string;
  clearSearch: string;
  showPassword: string;
  hidePassword: string;
  passwordWeak: string;
  passwordMedium: string;
  passwordStrong: string;
  increment: string;
  decrement: string;
  verificationCode: string;
  /** `{0}`: posición. */
  digit: string;
  color: string;
  colorPicker: string;
  hexColor: string;
  switch: string;
  /** `{0}`: valor, `{1}`: máximo. */
  ratingOf: string;

  // --- Fechas ---
  openCalendar: string;
  previousMonth: string;
  nextMonth: string;
  today: string;

  // --- Archivos ---
  chooseFile: string;
  upload: string;
  /** `{0}`: texto del botón de elegir. */
  dropFiles: string;
  selectDocument: string;
  /** `{0}`: tipos aceptados. */
  formats: string;
  /** `{0}`: cantidad. */
  filesSelected: string;
  files: string;

  // --- Datos ---
  pagination: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
  rowsPerPage: string;
  noRecords: string;
  moveUp: string;
  moveDown: string;
  moveToTarget: string;
  moveToSource: string;
  available: string;
  selected: string;
  sortableList: string;
  orgChart: string;
  changeLayout: string;
  listView: string;
  gridView: string;
  timeline: string;
  chart: string;
  chartLegend: string;
  /** `{0}`: posición. */
  chartItem: string;

  // --- Multimedia ---
  carousel: string;
  /** `{0}`: posición. */
  slide: string;
  previousImage: string;
  nextImage: string;
  /** `{0}`: posición. */
  thumbnail: string;
  /** `{0}`: descripción de la imagen. */
  enlargeImage: string;
  image: string;
  imagePreview: string;
  rotateLeft: string;
  rotateRight: string;
  flipHorizontal: string;
  flipVertical: string;
  zoomIn: string;
  zoomOut: string;
  reset: string;
  fullscreen: string;

  // --- Varios ---
  scrollableArea: string;
  scrollTop: string;
  resizePanels: string;
  command: string;
  guidedHelp: string;
  onboarding: string;
  animation: string;
  illustration: string;
  pictogram: string;
  decorativeStroke: string;
  preparingSession: string;

  // --- Precios ---
  monthly: string;
  yearly: string;
  choose: string;
  /** `{0}`: nombre del plan. */
  chooseItem: string;
  perMonth: string;
  perYear: string;

  // --- Editor ---
  textFormatting: string;
  paragraphStyle: string;
  normal: string;
  heading1: string;
  heading2: string;
  heading3: string;
  bold: string;
  italic: string;
  underline: string;
  strikethrough: string;
  bulletList: string;
  numberedList: string;
  quote: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  insertLink: string;
  insertImage: string;
  clearFormat: string;
  undo: string;
  redo: string;
  editorPlaceholder: string;
  linkUrl: string;
}

/** Español (idioma por defecto). */
export const CB_LOCALE_ES: CbTranslation = {
  close: 'Cerrar',
  clear: 'Limpiar',
  remove: 'Quitar',
  removeItem: 'Quitar {0}',
  search: 'Buscar…',
  filterOptions: 'Filtrar opciones',
  noResults: 'Sin resultados',
  noData: 'Sin datos',
  select: 'Seleccionar',
  selectItem: 'Seleccionar {0}',
  selectedCount: '{0} seleccionados',
  selectAll: 'Todos',
  options: 'Opciones',
  loading: 'Cargando',
  loadingMessage: 'Cargando información…',
  previous: 'Anterior',
  next: 'Siguiente',
  back: 'Atrás',
  finish: 'Finalizar',
  skip: 'Omitir',
  start: 'Comenzar',
  continue: 'Continuar',
  stepOf: 'Paso {0} de {1}',
  expand: 'Expandir',
  collapse: 'Contraer',
  expandItem: 'Expandir {0}',
  collapseItem: 'Contraer {0}',
  togglePanel: 'Alternar panel',
  progress: 'Progreso',
  stepsProgress: 'Progreso de pasos',
  page: 'Página {0}',
  pageIndicator: 'Indicador de páginas',
  download: 'Descargar',
  details: 'Detalles',
  viewDetails: 'Ver detalle',
  share: 'Compartir',
  receipt: 'Comprobante',
  action: 'Acción',
  actionGroup: 'Grupo de acciones',

  accept: 'Aceptar',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  confirmMessage: '¿Deseas continuar?',
  yes: 'Sí',
  no: 'No',

  dialog: 'Diálogo',
  panel: 'Panel',
  sidePanel: 'Panel lateral',
  showInfo: 'Mostrar información',
  closeEditing: 'Cerrar edición',

  menu: 'Menú',
  mainNavigation: 'Navegación principal',
  contextMenu: 'Menú contextual',
  categories: 'Categorías',
  appDock: 'Dock de la aplicación',
  panelMenu: 'Menú de paneles',
  steps: 'Pasos',
  sectionNavigation: 'Navegación de secciones',
  breadcrumb: 'Ruta de navegación',
  toolbar: 'Barra de herramientas',
  quickActions: 'Menú de acciones rápidas',
  floatingMenu: 'Menú flotante',
  openActions: 'Abrir acciones',
  closeActions: 'Cerrar acciones',

  required: 'requerido',
  optional: 'opcional',
  showSuggestions: 'Mostrar sugerencias',
  clearSearch: 'Limpiar búsqueda',
  showPassword: 'Mostrar contraseña',
  hidePassword: 'Ocultar contraseña',
  passwordWeak: 'Fortaleza: Débil',
  passwordMedium: 'Fortaleza: Media',
  passwordStrong: 'Fortaleza: Fuerte',
  increment: 'Incrementar',
  decrement: 'Decrementar',
  verificationCode: 'Código de verificación',
  digit: 'Dígito {0}',
  color: 'Color',
  colorPicker: 'Selector de color',
  hexColor: 'Color hexadecimal',
  switch: 'Interruptor',
  ratingOf: '{0} de {1}',

  openCalendar: 'Abrir calendario',
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  today: 'Hoy',

  chooseFile: 'Elegir archivo',
  upload: 'Subir',
  dropFiles: 'Arrastra archivos aquí o pulsa "{0}".',
  selectDocument: 'Seleccionar documento',
  formats: 'Formatos: {0}',
  filesSelected: '{0} archivo(s) seleccionado(s)',
  files: 'archivos',

  pagination: 'Paginación',
  firstPage: 'Primera página',
  previousPage: 'Página anterior',
  nextPage: 'Página siguiente',
  lastPage: 'Última página',
  rowsPerPage: 'Registros por página',
  noRecords: '0 registros',
  moveUp: 'Subir',
  moveDown: 'Bajar',
  moveToTarget: 'Mover a seleccionados',
  moveToSource: 'Devolver a disponibles',
  available: 'Disponibles',
  selected: 'Seleccionados',
  sortableList: 'Lista ordenable',
  orgChart: 'Organigrama',
  changeLayout: 'Cambiar vista',
  listView: 'Vista de lista',
  gridView: 'Vista de cuadrícula',
  timeline: 'Cronología',
  chart: 'Gráfico de datos',
  chartLegend: 'Leyenda del gráfico',
  chartItem: 'Elemento {0}',

  carousel: 'Carrusel',
  slide: 'Diapositiva {0}',
  previousImage: 'Imagen anterior',
  nextImage: 'Imagen siguiente',
  thumbnail: 'Miniatura {0}',
  enlargeImage: 'Ampliar {0}',
  image: 'imagen',
  imagePreview: 'Previsualización de imagen',
  rotateLeft: 'Rotar a la izquierda',
  rotateRight: 'Rotar a la derecha',
  flipHorizontal: 'Voltear horizontal',
  flipVertical: 'Voltear vertical',
  zoomIn: 'Acercar',
  zoomOut: 'Alejar',
  reset: 'Restablecer',
  fullscreen: 'Pantalla completa',

  scrollableArea: 'Área desplazable',
  scrollTop: 'Volver arriba',
  resizePanels: 'Redimensionar paneles',
  command: 'Comando',
  guidedHelp: 'Ayuda guiada',
  onboarding: 'Introducción',
  animation: 'Animación interactiva',
  illustration: 'Ilustración',
  pictogram: 'Pictograma',
  decorativeStroke: 'Trazo decorativo',
  preparingSession: 'Preparando tu sesión segura…',

  monthly: 'Mensual',
  yearly: 'Anual',
  choose: 'Elegir',
  chooseItem: 'Elegir {0}',
  perMonth: '/mes',
  perYear: '/año',

  textFormatting: 'Formato de texto',
  paragraphStyle: 'Estilo de párrafo',
  normal: 'Normal',
  heading1: 'Título 1',
  heading2: 'Título 2',
  heading3: 'Título 3',
  bold: 'Negrita',
  italic: 'Cursiva',
  underline: 'Subrayado',
  strikethrough: 'Tachado',
  bulletList: 'Lista con viñetas',
  numberedList: 'Lista numerada',
  quote: 'Cita',
  alignLeft: 'Alinear a la izquierda',
  alignCenter: 'Centrar',
  alignRight: 'Alinear a la derecha',
  insertLink: 'Insertar enlace',
  insertImage: 'Insertar imagen',
  clearFormat: 'Limpiar formato',
  undo: 'Deshacer',
  redo: 'Rehacer',
  editorPlaceholder: 'Escribe aquí…',
  linkUrl: 'URL del enlace:',
};

/** Inglés. */
export const CB_LOCALE_EN: CbTranslation = {
  close: 'Close',
  clear: 'Clear',
  remove: 'Remove',
  removeItem: 'Remove {0}',
  search: 'Search…',
  filterOptions: 'Filter options',
  noResults: 'No results found',
  noData: 'No data',
  select: 'Select',
  selectItem: 'Select {0}',
  selectedCount: '{0} selected',
  selectAll: 'All',
  options: 'Options',
  loading: 'Loading',
  loadingMessage: 'Loading…',
  previous: 'Previous',
  next: 'Next',
  back: 'Back',
  finish: 'Finish',
  skip: 'Skip',
  start: 'Get started',
  continue: 'Continue',
  stepOf: 'Step {0} of {1}',
  expand: 'Expand',
  collapse: 'Collapse',
  expandItem: 'Expand {0}',
  collapseItem: 'Collapse {0}',
  togglePanel: 'Toggle panel',
  progress: 'Progress',
  stepsProgress: 'Steps progress',
  page: 'Page {0}',
  pageIndicator: 'Page indicator',
  download: 'Download',
  details: 'Details',
  viewDetails: 'View details',
  share: 'Share',
  receipt: 'Receipt',
  action: 'Action',
  actionGroup: 'Action group',

  accept: 'Accept',
  cancel: 'Cancel',
  confirm: 'Confirm',
  confirmMessage: 'Do you want to continue?',
  yes: 'Yes',
  no: 'No',

  dialog: 'Dialog',
  panel: 'Panel',
  sidePanel: 'Side panel',
  showInfo: 'Show information',
  closeEditing: 'Close editing',

  menu: 'Menu',
  mainNavigation: 'Main navigation',
  contextMenu: 'Context menu',
  categories: 'Categories',
  appDock: 'Application dock',
  panelMenu: 'Panel menu',
  steps: 'Steps',
  sectionNavigation: 'Section navigation',
  breadcrumb: 'Breadcrumb',
  toolbar: 'Toolbar',
  quickActions: 'Quick actions menu',
  floatingMenu: 'Floating menu',
  openActions: 'Open actions',
  closeActions: 'Close actions',

  required: 'required',
  optional: 'optional',
  showSuggestions: 'Show suggestions',
  clearSearch: 'Clear search',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  passwordWeak: 'Strength: Weak',
  passwordMedium: 'Strength: Medium',
  passwordStrong: 'Strength: Strong',
  increment: 'Increment',
  decrement: 'Decrement',
  verificationCode: 'Verification code',
  digit: 'Digit {0}',
  color: 'Color',
  colorPicker: 'Color picker',
  hexColor: 'Hex color',
  switch: 'Switch',
  ratingOf: '{0} of {1}',

  openCalendar: 'Open calendar',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  today: 'Today',

  chooseFile: 'Choose file',
  upload: 'Upload',
  dropFiles: 'Drag files here or click "{0}".',
  selectDocument: 'Select document',
  formats: 'Formats: {0}',
  filesSelected: '{0} file(s) selected',
  files: 'files',

  pagination: 'Pagination',
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
  rowsPerPage: 'Rows per page',
  noRecords: '0 records',
  moveUp: 'Move up',
  moveDown: 'Move down',
  moveToTarget: 'Move to selected',
  moveToSource: 'Move back to available',
  available: 'Available',
  selected: 'Selected',
  sortableList: 'Sortable list',
  orgChart: 'Organization chart',
  changeLayout: 'Change layout',
  listView: 'List view',
  gridView: 'Grid view',
  timeline: 'Timeline',
  chart: 'Data chart',
  chartLegend: 'Chart legend',
  chartItem: 'Item {0}',

  carousel: 'Carousel',
  slide: 'Slide {0}',
  previousImage: 'Previous image',
  nextImage: 'Next image',
  thumbnail: 'Thumbnail {0}',
  enlargeImage: 'Enlarge {0}',
  image: 'image',
  imagePreview: 'Image preview',
  rotateLeft: 'Rotate left',
  rotateRight: 'Rotate right',
  flipHorizontal: 'Flip horizontal',
  flipVertical: 'Flip vertical',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  reset: 'Reset',
  fullscreen: 'Full screen',

  scrollableArea: 'Scrollable area',
  scrollTop: 'Back to top',
  resizePanels: 'Resize panels',
  command: 'Command',
  guidedHelp: 'Guided help',
  onboarding: 'Onboarding',
  animation: 'Interactive animation',
  illustration: 'Illustration',
  pictogram: 'Pictogram',
  decorativeStroke: 'Decorative stroke',
  preparingSession: 'Preparing your secure session…',

  monthly: 'Monthly',
  yearly: 'Yearly',
  choose: 'Choose',
  chooseItem: 'Choose {0}',
  perMonth: '/mo',
  perYear: '/yr',

  textFormatting: 'Text formatting',
  paragraphStyle: 'Paragraph style',
  normal: 'Normal',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
  bulletList: 'Bulleted list',
  numberedList: 'Numbered list',
  quote: 'Quote',
  alignLeft: 'Align left',
  alignCenter: 'Center',
  alignRight: 'Align right',
  insertLink: 'Insert link',
  insertImage: 'Insert image',
  clearFormat: 'Clear formatting',
  undo: 'Undo',
  redo: 'Redo',
  editorPlaceholder: 'Write here…',
  linkUrl: 'Link URL:',
};

/** Idiomas incluidos. */
export const CB_LOCALES = { es: CB_LOCALE_ES, en: CB_LOCALE_EN } as const;
export type CbLocaleCode = keyof typeof CB_LOCALES;

/** Rellena `{0}`, `{1}`… con los argumentos. */
export function cbFormat(template: string, ...args: unknown[]): string {
  return template.replace(/\{(\d+)\}/g, (m, i: string) => (args[+i] === undefined ? m : String(args[+i])));
}
