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
  moreActions: string;
  add: string;
  onThisPage: string;
  trendUp: string;
  trendDown: string;
  /** `{0}`: nombre del elemento (p. ej. "Beneficiario 2"). */
  itemAdded: string;
  /** `{0}`: nombre del elemento. */
  itemRemoved: string;
  minimum: string;
  maximum: string;
  switchToDark: string;
  switchToLight: string;
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
  /** Aviso para enlaces que se abren en otra pestaña. */
  opensInNewTab: string;
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
  hours: string;
  minutes: string;
  /** AM / PM en formato de 12 horas. */
  period: string;
  /** Aviso tras elegir la fecha inicial de un rango. */
  chooseEndDate: string;
  previousMonth: string;
  nextMonth: string;
  today: string;
  /** Iniciales de los días de la semana, de lunes a domingo, separadas por comas. */
  weekdaysMin: string;

  // --- Archivos ---
  chooseFile: string;
  upload: string;
  /** `{0}`: texto del botón de elegir. */
  dropFiles: string;
  /** `{0}`: nombre del archivo; `{1}`: tamaño máximo. */
  fileTooLarge: string;
  /** `{0}`: nombre del archivo. */
  fileTypeNotAllowed: string;
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
  /** `{0}`: número de fila. */
  selectRow: string;
  selectAllRows: string;
  /** `{0}`: encabezado de la columna. */
  sortBy: string;
  /** `{0}`: encabezado de la columna. */
  filterBy: string;
  /** `{0}`: encabezado de la columna. */
  resizeColumn: string;
  /** `{0}`: número de fila. */
  expandRow: string;
  /** `{0}`: cantidad de filas tras filtrar. */
  resultsCount: string;
  noRecords: string;
  moveUp: string;
  moveDown: string;
  moveTop: string;
  moveBottom: string;
  moveToTarget: string;
  moveAllToTarget: string;
  moveToSource: string;
  moveAllToSource: string;
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
  /** Cómo recorrer un gráfico con el teclado. */
  chartInstructions: string;

  // --- Multimedia ---
  carousel: string;
  /** `{0}`: posición. */
  slide: string;
  /** `{0}`: posición; `{1}`: total. Nombre de cada diapositiva. */
  slideOf: string;
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

  // Visor de PDF
  pdfViewer: string;
  pdfDocument: string;
  pageOf: string;
  pageNumber: string;
  ofTotal: string;
  zoomLevel: string;
  fitWidth: string;
  fitPage: string;
  print: string;
  preparingPrint: string;
  thumbnails: string;
  searchInDocument: string;
  previousMatch: string;
  nextMatch: string;
  matchOf: string;
  searching: string;
  loadingDocument: string;
  documentError: string;
  protectedDocument: string;
  incorrectPassword: string;
  password: string;
  open: string;

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
  textEditor: string;
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
  moreActions: 'Más acciones',
  add: 'Agregar',
  onThisPage: 'En esta página',
  trendUp: 'aumenta',
  trendDown: 'disminuye',
  itemAdded: '{0} agregado',
  itemRemoved: '{0} eliminado',
  minimum: 'Mínimo',
  maximum: 'Máximo',
  switchToDark: 'Cambiar a tema oscuro',
  switchToLight: 'Cambiar a tema claro',
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
  opensInNewTab: '(se abre en una pestaña nueva)',
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
  hours: 'Horas',
  minutes: 'Minutos',
  period: 'AM / PM',
  chooseEndDate: 'Elige la fecha final',
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  today: 'Hoy',
  weekdaysMin: 'L,M,X,J,V,S,D',

  chooseFile: 'Elegir archivo',
  upload: 'Subir',
  dropFiles: 'Arrastra archivos aquí o pulsa "{0}".',
  fileTooLarge: '{0}: supera el tamaño máximo de {1}.',
  fileTypeNotAllowed: '{0}: tipo de archivo no permitido.',
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
  selectRow: 'Seleccionar fila {0}',
  selectAllRows: 'Seleccionar todas las filas',
  sortBy: 'Ordenar por {0}',
  filterBy: 'Filtrar por {0}',
  resizeColumn: 'Redimensionar columna {0}',
  expandRow: 'Detalle de la fila {0}',
  resultsCount: '{0} resultados',
  noRecords: '0 registros',
  moveUp: 'Subir',
  moveDown: 'Bajar',
  moveTop: 'Mover al inicio',
  moveBottom: 'Mover al final',
  moveToTarget: 'Mover a seleccionados',
  moveAllToTarget: 'Mover todos a seleccionados',
  moveToSource: 'Devolver a disponibles',
  moveAllToSource: 'Devolver todos a disponibles',
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
  chartInstructions: 'Usa las flechas para recorrer los datos.',

  carousel: 'Carrusel',
  slide: 'Diapositiva {0}',
  slideOf: '{0} de {1}',
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

  // Visor de PDF
  pdfViewer: 'Visor de PDF',
  pdfDocument: 'Documento PDF',
  pageOf: 'Página {0} de {1}',
  pageNumber: 'Número de página',
  ofTotal: 'de {0}',
  zoomLevel: 'Nivel de zoom',
  fitWidth: 'Ajustar al ancho',
  fitPage: 'Página completa',
  print: 'Imprimir',
  preparingPrint: 'Preparando impresión… {0} de {1}',
  thumbnails: 'Miniaturas',
  searchInDocument: 'Buscar en el documento',
  previousMatch: 'Coincidencia anterior',
  nextMatch: 'Coincidencia siguiente',
  matchOf: '{0} de {1}',
  searching: 'Buscando…',
  loadingDocument: 'Cargando documento…',
  documentError: 'No se pudo abrir el documento.',
  protectedDocument: 'Este documento está protegido. Escribe la contraseña para abrirlo.',
  incorrectPassword: 'Contraseña incorrecta. Inténtalo de nuevo.',
  password: 'Contraseña',
  open: 'Abrir',

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
  textEditor: 'Editor de texto',
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
  moreActions: 'More actions',
  add: 'Add',
  onThisPage: 'On this page',
  trendUp: 'up',
  trendDown: 'down',
  itemAdded: '{0} added',
  itemRemoved: '{0} removed',
  minimum: 'Minimum',
  maximum: 'Maximum',
  switchToDark: 'Switch to dark theme',
  switchToLight: 'Switch to light theme',
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
  opensInNewTab: '(opens in a new tab)',
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
  hours: 'Hours',
  minutes: 'Minutes',
  period: 'AM / PM',
  chooseEndDate: 'Choose the end date',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  today: 'Today',
  weekdaysMin: 'M,T,W,T,F,S,S',

  chooseFile: 'Choose file',
  upload: 'Upload',
  dropFiles: 'Drag files here or click "{0}".',
  fileTooLarge: '{0}: exceeds the maximum size of {1}.',
  fileTypeNotAllowed: '{0}: file type not allowed.',
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
  selectRow: 'Select row {0}',
  selectAllRows: 'Select all rows',
  sortBy: 'Sort by {0}',
  filterBy: 'Filter by {0}',
  resizeColumn: 'Resize column {0}',
  expandRow: 'Row {0} details',
  resultsCount: '{0} results',
  noRecords: '0 records',
  moveUp: 'Move up',
  moveDown: 'Move down',
  moveTop: 'Move to top',
  moveBottom: 'Move to bottom',
  moveToTarget: 'Move to selected',
  moveAllToTarget: 'Move all to selected',
  moveToSource: 'Move back to available',
  moveAllToSource: 'Move all back to available',
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
  chartInstructions: 'Use the arrow keys to explore the data.',

  carousel: 'Carousel',
  slide: 'Slide {0}',
  slideOf: '{0} of {1}',
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

  // Visor de PDF
  pdfViewer: 'PDF viewer',
  pdfDocument: 'PDF document',
  pageOf: 'Page {0} of {1}',
  pageNumber: 'Page number',
  ofTotal: 'of {0}',
  zoomLevel: 'Zoom level',
  fitWidth: 'Fit to width',
  fitPage: 'Fit page',
  print: 'Print',
  preparingPrint: 'Preparing to print… {0} of {1}',
  thumbnails: 'Thumbnails',
  searchInDocument: 'Search in document',
  previousMatch: 'Previous match',
  nextMatch: 'Next match',
  matchOf: '{0} of {1}',
  searching: 'Searching…',
  loadingDocument: 'Loading document…',
  documentError: 'The document could not be opened.',
  protectedDocument: 'This document is protected. Enter the password to open it.',
  incorrectPassword: 'Incorrect password. Try again.',
  password: 'Password',
  open: 'Open',

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
  textEditor: 'Text editor',
  linkUrl: 'Link URL:',
};

/** Idiomas incluidos. */
export const CB_LOCALES = { es: CB_LOCALE_ES, en: CB_LOCALE_EN } as const;
export type CbLocaleCode = keyof typeof CB_LOCALES;

/** Rellena `{0}`, `{1}`… con los argumentos. */
export function cbFormat(template: string, ...args: unknown[]): string {
  return template.replace(/\{(\d+)\}/g, (m, i: string) => (args[+i] === undefined ? m : String(args[+i])));
}
