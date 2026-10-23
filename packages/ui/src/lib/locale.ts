/**
 * Textos de interfaz de CaribeNG (etiquetas accesibles, botones, placeholders y
 * mensajes por defecto). Claves planas al estilo de PrimeNG; las partes
 * variables se escriben como `{0}`, `{1}`… y se rellenan con `cbFormat()`.
 *
 * Para traducir o personalizar: `provideCaribeNG({ locale: 'en', translation: { … } })`
 * o, en caliente, `inject(CbLocaleService).use('en')`.
 */
export interface CbTranslation {
  /** Idioma BCP 47 para `Intl` (nombres de países, fechas…): `es`, `en`. */
  intlLocale: string;
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
  copy: string;
  copied: string;
  copyFailed: string;
  qrCode: string;
  commandPalette: string;
  commandPlaceholder: string;
  /** `{0}`: cantidad. */
  commandResults: string;
  commandNavigate: string;
  commandSelect: string;
  expandSidebar: string;
  collapseSidebar: string;
  openMenu: string;
  chatConversation: string;
  chatYou: string;
  chatAssistant: string;
  chatPlaceholder: string;
  chatMessage: string;
  chatSend: string;
  chatStop: string;
  chatAttach: string;
  chatSending: string;
  chatError: string;
  chatRetry: string;
  chatTyping: string;
  chatGenerating: string;
  chatResponseReady: string;
  chatJumpToLatest: string;
  phoneCountry: string;
  searchCountry: string;
  phoneInvalid: string;
  chatThinking: string;
  /** `{0}`: segundos. */
  chatThoughtFor: string;
  chatReasoning: string;
  /** `{0}`: nombre de la herramienta. */
  chatToolRunning: string;
  /** `{0}`: nombre de la herramienta. */
  chatToolDone: string;
  /** `{0}`: nombre de la herramienta. */
  chatToolError: string;
  chatToolInput: string;
  chatToolOutput: string;
  chatHelpful: string;
  chatNotHelpful: string;
  chatRegenerate: string;
  chatAttachments: string;
  kanbanCard: string;
  kanbanInstructions: string;
  /** `{0}`: tarjeta, `{1}`: columna, `{2}`: posición, `{3}`: total. */
  kanbanGrabbed: string;
  /** `{0}`: tarjeta, `{1}`: columna, `{2}`: posición, `{3}`: total. */
  kanbanMoved: string;
  /** `{0}`: tarjeta, `{1}`: columna, `{2}`: posición. */
  kanbanDropped: string;
  /** `{0}`: tarjeta, `{1}`: columna. */
  kanbanCancelled: string;
  /** `{0}`: columna. */
  kanbanFull: string;
  /** `{0}`: cantidad, `{1}`: límite. */
  kanbanCount: string;
  kanbanAdd: string;
  kanbanEdit: string;
  kanbanDelete: string;
  /** `{0}`: columna. */
  kanbanMoveTo: string;
  /** `{0}`: tarjeta. */
  kanbanCardActions: string;
  kanbanCardTitle: string;
  /** `{0}`: tarjeta. */
  kanbanConfirmDelete: string;
  /** `{0}`: tarjeta. */
  kanbanDeleted: string;
  /** `{0}`: tarjeta, `{1}`: columna. */
  kanbanAdded: string;
  /** `{0}`: título anterior, `{1}`: nuevo. */
  kanbanRenamed: string;
  kanbanAddColumn: string;
  kanbanColumnName: string;
  kanbanNewColumn: string;
  /** `{0}`: columna. */
  kanbanColumnActions: string;
  kanbanRename: string;
  /** `{0}`: columna. */
  kanbanCollapse: string;
  /** `{0}`: columna. */
  kanbanExpand: string;
  /** `{0}`: columna, `{1}`: cantidad de tarjetas. */
  kanbanConfirmDeleteColumn: string;
  kanbanDetails: string;
  kanbanOpenDetails: string;
  kanbanStatus: string;
  kanbanAssignees: string;
  kanbanNoAssignees: string;
  /** `{0}`: persona. */
  kanbanUnassign: string;
  /** `{0}`: nombres. */
  kanbanAssignedTo: string;
  kanbanPriority: string;
  kanbanNoPriority: string;
  kanbanPriorityLow: string;
  kanbanPriorityMedium: string;
  kanbanPriorityHigh: string;
  kanbanStartDate: string;
  kanbanEndDate: string;
  kanbanDates: string;
  kanbanOverdue: string;
  kanbanDescription: string;
  kanbanDescriptionPlaceholder: string;
  kanbanAttachments: string;
  kanbanAttach: string;
  kanbanDropFiles: string;
  /** `{0}`: archivo. */
  kanbanRemoveAttachment: string;
  /** `{0}`: cantidad. */
  kanbanAttachmentCount: string;
  /** `{0}`: tarjeta. */
  kanbanUpdated: string;
  kanbanTaskName: string;
  kanbanAddTask: string;
  kanbanAddSection: string;
  kanbanCompleted: string;
  /** `{0}`: tarea. */
  kanbanMarkComplete: string;
  /** `{0}`: tarea. */
  kanbanMarkIncomplete: string;
  /** `{0}`: sección, `{1}`: cantidad. */
  kanbanSectionCount: string;
  kanbanListInstructions: string;
  /** `{0}`: cantidad. */
  kanbanNoDate: string;
  /** `{0}`: día. */
  kanbanAddTaskOn: string;
  /** `{0}`: primer día, `{1}`: último. */
  kanbanWeekOf: string;
  kanbanCalendarInstructions: string;
  /** `{0}`: tarea, `{1}`: fechas. */
  kanbanRescheduled: string;
  kanbanPreviousWeek: string;
  kanbanNextWeek: string;
  kanbanDays: string;
  kanbanZoomIn: string;
  kanbanZoomOut: string;
  /** `{0}`: sección. */
  kanbanAddTaskIn: string;
  kanbanTimelineInstructions: string;
  kanbanDashboard: string;
  kanbanTotalCompleted: string;
  kanbanTotalIncomplete: string;
  kanbanTotalOverdue: string;
  kanbanTotalTasks: string;
  /** `{0}`: porcentaje. */
  kanbanOfTotal: string;
  kanbanIncompleteBySection: string;
  kanbanByCompletion: string;
  kanbanIncompleteByAssignee: string;
  kanbanByWeek: string;
  kanbanCompletedPlural: string;
  kanbanPendingPlural: string;
  kanbanOverduePlural: string;
  kanbanIncompletePlural: string;
  kanbanViews: string;
  kanbanViewBoard: string;
  kanbanViewList: string;
  kanbanViewTimeline: string;
  kanbanViewDashboard: string;
  kanbanViewCalendar: string;
  /** `{0}`: vista. */
  kanbanHideView: string;
  kanbanSideBySide: string;
  kanbanViewsHint: string;
  save: string;
  /** `{0}`: cantidad. */
  mentionsCount: string;
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
  /** Se añade al nombre de un paso terminado ("…, completado"). */
  stepCompleted: string;
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
  /** Área de saturación y brillo del selector de color. */
  colorArea: string;
  /** Valor del área: {0} saturación, {1} brillo (en %). */
  colorAreaValue: string;
  hue: string;
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
  previousYear: string;
  nextYear: string;
  previousDecade: string;
  nextDecade: string;
  /** Botón del título del calendario que abre la vista de meses / de años. */
  chooseMonth: string;
  chooseYear: string;
  /** Horas del rango (inicio y fin). */
  startTime: string;
  endTime: string;
  /** Campo escrito con una fecha que no se reconoce. `{0}`: formato esperado. */
  invalidDate: string;
  /** Atajos de fecha del DatePicker (`presets`). */
  datePresets: string;
  presetYesterday: string;
  presetLast7Days: string;
  presetLast30Days: string;
  presetThisMonth: string;
  presetLastMonth: string;
  presetThisYear: string;
  presetLastYear: string;
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
  /** Total acumulado (cascada). */
  chartTotal: string;
  /** Variación de un paso (cascada). */
  chartChange: string;
  /** Precio de apertura, máximo, mínimo y cierre (velas). */
  chartOpen: string;
  chartHigh: string;
  chartLow: string;
  chartClose: string;
  /** Botón que vuelve a mostrar todos los datos tras hacer zoom. */
  chartResetZoom: string;
  /** Cómo hacer zoom con el teclado y el ratón. */
  chartZoomInstructions: string;

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
  pdfOutline: string;
  pdfSidebarView: string;
  /** `{0}`: título de la entrada del índice. */
  pdfExpandItem: string;
  /** `{0}`: título de la entrada del índice. */
  pdfCollapseItem: string;
  pdfDownloadFilled: string;
  editorCodeTools: string;
  editorCodeLanguage: string;
  editorPlainText: string;
  editorCopyCode: string;
  editorCodeCopied: string;
  editorImageCaption: string;
  editorTableCells: string;
  editorMergeRight: string;
  editorMergeDown: string;
  editorSplitCell: string;
  editorCollapsible: string;
  editorCollapsibleTitle: string;
  editorToc: string;
  editorTocTitle: string;
  editorMentions: string;
  /** `{0}`: fecha y hora. */
  editorDraftFound: string;
  editorRestoreDraft: string;
  editorDiscardDraft: string;
  /** `{0}`: hora. */
  editorDraftSaved: string;
  ganttChart: string;
  ganttScale: string;
  ganttDay: string;
  ganttWeek: string;
  ganttMonth: string;
  /** `{0}`: número de semana. */
  ganttWeekShort: string;
  ganttTask: string;
  ganttStart: string;
  ganttEnd: string;
  ganttDuration: string;
  ganttProgress: string;
  ganttAssignee: string;
  /** `{0}`: días. */
  ganttDays: string;
  /** `{0}`: grupo. */
  ganttExpand: string;
  /** `{0}`: grupo. */
  ganttCollapse: string;
  /** `{0}`: tarea, `{1}`: fechas, `{2}`: avance. */
  ganttBarLabel: string;
  /** `{0}`: grupo, `{1}`: fechas, `{2}`: avance. */
  ganttGroupLabel: string;
  /** `{0}`: hito, `{1}`: fecha. */
  ganttMilestoneLabel: string;
  /** `{0}`: tareas. */
  ganttDependsOn: string;
  /** `{0}` → `{1}`. */
  ganttRemoveLink: string;
  /** `{0}` → `{1}`. */
  ganttLinkAdded: string;
  ganttLinkRemoved: string;
  /** `{0}`: tarea, `{1}`: fechas. */
  ganttMoved: string;
  /** `{0}`: tarea, `{1}`: avance. */
  ganttProgressChanged: string;
  ganttInstructions: string;

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
  billingCycle: string;
  notIncluded: string;
  payAnnually: string;
  payMonthly: string;
  /** `{0}`: importe anual. */
  billedAnnually: string;
  /** `{0}`: importe ahorrado. */
  youSave: string;
  recommended: string;

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
  inlineCode: string;
  horizontalLine: string;
  /** Botón que alterna entre el editor y el código HTML. */
  sourceCode: string;
  removeLink: string;
  openInNewTab: string;
  /** Enlace con un protocolo no permitido (solo http, https, mailto y tel). */
  invalidUrl: string;
  /** `{0}`: caracteres usados; `{1}`: máximo. */
  characterCount: string;
  /** `{0}`: tamaño máximo (p. ej. "1 MB"). */
  imageTooLarge: string;
  imageUploadError: string;
  codeBlock: string;
  insertTable: string;
  tableRows: string;
  tableColumns: string;
  tableHeaderRow: string;
  insert: string;
  tableTools: string;
  insertRowAbove: string;
  insertRowBelow: string;
  insertColumnLeft: string;
  insertColumnRight: string;
  deleteRow: string;
  deleteColumn: string;
  deleteTable: string;
  imageTools: string;
  imageInline: string;
  imageAlignLeft: string;
  imageAlignCenter: string;
  imageAlignRight: string;
  imageWidth: string;
  imageOriginalSize: string;
  imageResize: string;
  altText: string;
  deleteImage: string;
  tableSize: string;
  tableRow: string;
  tableColumn: string;
  above: string;
  below: string;
  toLeft: string;
  toRight: string;
  tableDelete: string;
  tableBorders: string;
  bordersAll: string;
  bordersHorizontal: string;
  bordersNone: string;
  borderColor: string;
  colorGray: string;
  colorDark: string;
  colorGreen: string;
  colorBlue: string;
  cropImage: string;
  cropArea: string;
  cropFree: string;
  cropInstructions: string;
  cropError: string;
  exitFullscreen: string;
  heading4: string;
  fontSize: string;
  fontNormal: string;
  textColor: string;
  highlight: string;
  automaticColor: string;
  noHighlight: string;
  colorBlack: string;
  colorRed: string;
  colorOrange: string;
  colorYellow: string;
  colorTeal: string;
  colorPurple: string;
  colorPink: string;
  subscript: string;
  superscript: string;
  taskList: string;
  indent: string;
  outdent: string;
  alignJustify: string;
  alignment: string;
  wordCount: string;
  /** Singular de `wordCount`. */
  wordCountOne: string;
  charCount: string;
  fontFamily: string;
  fontDefault: string;
  fontGroupRecommended: string;
  fontGroupOffice: string;
  fontGroupSans: string;
  fontGroupSerif: string;
  fontGroupMono: string;
  fontGroupAccessible: string;
  fontGroupFun: string;
  specialCharacters: string;
  charsCurrency: string;
  charsMath: string;
  charsPunctuation: string;
  charsArrows: string;
  charsEmoji: string;
  findReplace: string;
  findText: string;
  replaceWith: string;
  matchCase: string;
  wholeWords: string;
  findPrevious: string;
  findNext: string;
  replaceOne: string;
  replaceAll: string;
  findCount: string;
  replacedCount: string;
  quickFormat: string;
  insertBlock: string;
  paragraph: string;
  // --- Comments ---
  commentsFeed: string;
  commentsShow: string;
  commentsAll: string;
  commentsOnly: string;
  commentsActivity: string;
  commentsEmpty: string;
  commentsWrite: string;
  commentsWriteReply: string;
  commentsNew: string;
  commentsEditing: string;
  /** `{0}`: autor del comentario. */
  commentsReplyTo: string;
  /** `{0}`: autor del comentario. */
  commentsRepliesTo: string;
  commentsSend: string;
  commentsReply: string;
  commentsEdit: string;
  commentsDelete: string;
  commentsDeleteConfirm: string;
  commentsEdited: string;
  commentsDeleted: string;
  commentsAddReaction: string;
  commentsReactions: string;
  /** `{0}`: emoji; `{1}`: cantidad; `{2}`: quiénes. */
  commentsReactionLabel: string;
  commentsYou: string;
  commentsJustNow: string;
  commentsPosted: string;
  commentsSaved: string;
  commentsShortcut: string;
  // --- Notification center ---
  notificationsTitle: string;
  /** `{0}`: avisos sin leer. */
  notificationsBellUnread: string;
  notificationsMarkAllRead: string;
  notificationsShow: string;
  notificationsAll: string;
  notificationsUnread: string;
  notificationsUnreadItem: string;
  /** `{0}`: título del aviso. */
  notificationsMarkRead: string;
  /** `{0}`: título del aviso. */
  notificationsMarkUnread: string;
  notificationsMarkReadShort: string;
  notificationsMarkUnreadShort: string;
  notificationsEmpty: string;
  notificationsAllRead: string;
  notificationsViewAll: string;
  notificationsToday: string;
  notificationsYesterday: string;
  notificationsEarlier: string;
  notificationsJustNow: string;
  /** `{0}`: título del aviso. */
  notificationsNew: string;
  /** `{0}`: cantidad. */
  notificationsNewMany: string;
  notificationsMarkedRead: string;
  notificationsMarkedUnread: string;
  notificationsMarkedAllRead: string;
  notificationsRemoved: string;
  // --- Signature pad ---
  signaturePad: string;
  signatureEmptyState: string;
  signatureSignedState: string;
  signaturePlaceholder: string;
  signatureModes: string;
  signatureDraw: string;
  signatureType: string;
  signatureTypeLabel: string;
  signatureHint: string;
  signatureHintDraw: string;
  signatureUndo: string;
  signatureClear: string;
  signatureCleared: string;
  signatureUndone: string;
}

/** Español (idioma por defecto). */
export const CB_LOCALE_ES: CbTranslation = {
  intlLocale: 'es',
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
  copy: 'Copiar',
  copied: 'Copiado',
  copyFailed: 'No se pudo copiar',
  qrCode: 'Código QR',
  commandPalette: 'Paleta de comandos',
  commandPlaceholder: 'Busca una página o acción…',
  commandResults: '{0} resultados',
  commandNavigate: 'navegar',
  commandSelect: 'elegir',
  expandSidebar: 'Expandir menú lateral',
  collapseSidebar: 'Contraer menú lateral',
  openMenu: 'Abrir menú',
  chatConversation: 'Conversación',
  chatYou: 'Tú',
  chatAssistant: 'Asistente',
  chatPlaceholder: 'Escribe un mensaje…',
  chatMessage: 'Mensaje',
  chatSend: 'Enviar',
  chatStop: 'Detener',
  chatAttach: 'Adjuntar archivos',
  chatSending: 'Enviando…',
  chatError: 'No se pudo enviar',
  chatRetry: 'Reintentar',
  chatTyping: 'Escribiendo…',
  chatGenerating: 'Generando respuesta…',
  chatResponseReady: 'Respuesta lista',
  chatJumpToLatest: 'Ir al último mensaje',
  phoneCountry: 'País',
  searchCountry: 'Buscar país',
  phoneInvalid: 'Número de teléfono incompleto o no válido',
  chatThinking: 'Pensando…',
  chatThoughtFor: 'Razonó durante {0} s',
  chatReasoning: 'Razonamiento',
  chatToolRunning: 'Usando {0}…',
  chatToolDone: 'Usó {0}',
  chatToolError: 'Falló {0}',
  chatToolInput: 'Entrada',
  chatToolOutput: 'Resultado',
  chatHelpful: 'Respuesta útil',
  chatNotHelpful: 'Respuesta no útil',
  chatRegenerate: 'Regenerar respuesta',
  chatAttachments: 'Adjuntos',
  kanbanCard: 'tarjeta',
  kanbanInstructions: 'Para mover la tarjeta, pulsa Espacio, usa las flechas y vuelve a pulsar Espacio para soltarla. Escape cancela.',
  kanbanGrabbed: '{0} tomada. Columna {1}, posición {2} de {3}.',
  kanbanMoved: '{0}: columna {1}, posición {2} de {3}.',
  kanbanDropped: '{0} soltada en {1}, posición {2}.',
  kanbanCancelled: 'Movimiento cancelado. {0} vuelve a {1}.',
  kanbanFull: '{0} está llena.',
  kanbanCount: '{0} de {1}',
  kanbanAdd: 'Añadir tarjeta',
  kanbanEdit: 'Editar',
  kanbanDelete: 'Eliminar',
  kanbanMoveTo: 'Mover a {0}',
  kanbanCardActions: 'Acciones de {0}',
  kanbanCardTitle: 'Título de la tarjeta',
  kanbanConfirmDelete: '¿Eliminar «{0}»?',
  kanbanDeleted: '{0} eliminada.',
  kanbanAdded: '{0} añadida a {1}.',
  kanbanRenamed: '«{0}» ahora es «{1}».',
  kanbanAddColumn: 'Añadir columna',
  kanbanColumnName: 'Nombre de la columna',
  kanbanNewColumn: 'Nueva columna',
  kanbanColumnActions: 'Acciones de la columna {0}',
  kanbanRename: 'Renombrar',
  kanbanCollapse: 'Contraer {0}',
  kanbanExpand: 'Expandir {0}',
  kanbanConfirmDeleteColumn: '¿Eliminar la columna «{0}» y sus {1} tarjetas?',
  kanbanDetails: 'Detalles de la tarea',
  kanbanOpenDetails: 'Abrir detalles',
  kanbanStatus: 'Columna',
  kanbanAssignees: 'Responsables',
  kanbanNoAssignees: 'Sin responsable',
  kanbanUnassign: 'Quitar a {0}',
  kanbanAssignedTo: 'Responsables: {0}',
  kanbanPriority: 'Prioridad',
  kanbanNoPriority: 'Sin prioridad',
  kanbanPriorityLow: 'Baja',
  kanbanPriorityMedium: 'Media',
  kanbanPriorityHigh: 'Alta',
  kanbanStartDate: 'Fecha de inicio',
  kanbanEndDate: 'Fecha de fin',
  kanbanDates: 'Fechas',
  kanbanOverdue: 'vencida',
  kanbanDescription: 'Descripción',
  kanbanDescriptionPlaceholder: '¿De qué trata esta tarea?',
  kanbanAttachments: 'Adjuntos',
  kanbanAttach: 'Adjuntar archivos',
  kanbanDropFiles: 'o arrástralos aquí',
  kanbanRemoveAttachment: 'Quitar {0}',
  kanbanAttachmentCount: '{0} adjuntos',
  kanbanUpdated: '{0} actualizada.',
  kanbanTaskName: 'Nombre',
  kanbanAddTask: 'Añadir tarea',
  kanbanAddSection: 'Añadir sección',
  kanbanCompleted: 'Finalizada',
  kanbanMarkComplete: 'Marcar «{0}» como finalizada',
  kanbanMarkIncomplete: 'Marcar «{0}» como pendiente',
  kanbanSectionCount: '{0}, {1} tareas',
  kanbanListInstructions: 'Con Alt + flecha arriba o abajo, la tarea se mueve en la lista.',
  kanbanNoDate: 'Sin fecha ({0})',
  kanbanAddTaskOn: 'Añadir tarea el {0}',
  kanbanWeekOf: 'Semana del {0} al {1}',
  kanbanCalendarInstructions: 'Arrastra la tarea a otro día, o usa Alt + flechas: izquierda y derecha cambian el día; arriba y abajo, la semana.',
  kanbanRescheduled: '{0}: {1}.',
  kanbanPreviousWeek: 'Semana anterior',
  kanbanNextWeek: 'Semana siguiente',
  kanbanDays: 'Días',
  kanbanZoomIn: 'Acercar',
  kanbanZoomOut: 'Alejar',
  kanbanAddTaskIn: 'Añadir tarea en {0}',
  kanbanTimelineInstructions: 'Arrastra la tarea para cambiar sus fechas, o sus bordes para cambiar la duración. Con el teclado: Alt + izquierda o derecha la mueve un día, Alt + Mayús + izquierda o derecha cambia la fecha de fin, y Alt + arriba o abajo la pasa a otra sección.',
  kanbanDashboard: 'Panel del proyecto',
  kanbanTotalCompleted: 'Tareas finalizadas',
  kanbanTotalIncomplete: 'Tareas sin finalizar',
  kanbanTotalOverdue: 'Tareas con retraso',
  kanbanTotalTasks: 'Tareas en total',
  kanbanOfTotal: '{0} del total',
  kanbanIncompleteBySection: 'Tareas sin finalizar por sección',
  kanbanByCompletion: 'Tareas por estado de finalización',
  kanbanIncompleteByAssignee: 'Tareas sin finalizar por responsable',
  kanbanByWeek: 'Entregas por semana',
  kanbanCompletedPlural: 'Finalizadas',
  kanbanPendingPlural: 'A tiempo',
  kanbanOverduePlural: 'Con retraso',
  kanbanIncompletePlural: 'Sin finalizar',
  kanbanViews: 'Vistas',
  kanbanViewBoard: 'Tablero',
  kanbanViewList: 'Lista',
  kanbanViewTimeline: 'Cronograma',
  kanbanViewDashboard: 'Panel',
  kanbanViewCalendar: 'Calendario',
  kanbanHideView: 'Ocultar {0}',
  kanbanSideBySide: 'Lado a lado',
  kanbanViewsHint: 'Activa varias vistas para verlas a la vez.',
  save: 'Guardar',
  mentionsCount: '{0} sugerencias',
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
  stepCompleted: 'completado',
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
  colorArea: 'Saturación y brillo',
  colorAreaValue: 'Saturación {0} %, brillo {1} %',
  hue: 'Tono',
  switch: 'Interruptor',
  ratingOf: '{0} de {1}',

  openCalendar: 'Abrir calendario',
  hours: 'Horas',
  minutes: 'Minutos',
  period: 'AM / PM',
  chooseEndDate: 'Elige la fecha final',
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  previousYear: 'Año anterior',
  nextYear: 'Año siguiente',
  previousDecade: 'Década anterior',
  nextDecade: 'Década siguiente',
  chooseMonth: 'Elegir mes',
  chooseYear: 'Elegir año',
  startTime: 'Hora de inicio',
  endTime: 'Hora de fin',
  invalidDate: 'Fecha no válida. Usa el formato {0}.',
  datePresets: 'Atajos',
  presetYesterday: 'Ayer',
  presetLast7Days: 'Últimos 7 días',
  presetLast30Days: 'Últimos 30 días',
  presetThisMonth: 'Este mes',
  presetLastMonth: 'Mes anterior',
  presetThisYear: 'Este año',
  presetLastYear: 'Año anterior',
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
  chartTotal: 'Total',
  chartChange: 'Variación',
  chartOpen: 'Apertura',
  chartHigh: 'Máximo',
  chartLow: 'Mínimo',
  chartClose: 'Cierre',
  chartResetZoom: 'Restablecer zoom',
  chartZoomInstructions: 'Pulsa + o − para acercar o alejar y 0 para ver todo; con el ratón, usa la rueda, arrastra para desplazarte y haz doble clic para restablecer.',

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
  pdfOutline: 'Índice',
  pdfSidebarView: 'Vista del panel',
  pdfExpandItem: 'Expandir {0}',
  pdfCollapseItem: 'Contraer {0}',
  pdfDownloadFilled: 'Descargar con los datos del formulario',
  editorCodeTools: 'Herramientas del bloque de código',
  editorCodeLanguage: 'Lenguaje del código',
  editorPlainText: 'Texto sin colores',
  editorCopyCode: 'Copiar código',
  editorCodeCopied: 'Copiado',
  editorImageCaption: 'Pie de imagen',
  editorTableCells: 'Celdas',
  editorMergeRight: 'Combinar con la celda de la derecha',
  editorMergeDown: 'Combinar con la celda de abajo',
  editorSplitCell: 'Separar',
  editorCollapsible: 'Desplegable',
  editorCollapsibleTitle: 'Título del desplegable',
  editorToc: 'Índice',
  editorTocTitle: 'Contenido',
  editorMentions: 'Personas que puedes mencionar',
  editorDraftFound: 'Hay un borrador sin guardar del {0}.',
  editorRestoreDraft: 'Restaurar',
  editorDiscardDraft: 'Descartar',
  editorDraftSaved: 'Borrador guardado a las {0}',
  ganttChart: 'Diagrama de Gantt',
  ganttScale: 'Escala de tiempo',
  ganttDay: 'Día',
  ganttWeek: 'Semana',
  ganttMonth: 'Mes',
  ganttWeekShort: 'S{0}',
  ganttTask: 'Tarea',
  ganttStart: 'Inicio',
  ganttEnd: 'Fin',
  ganttDuration: 'Duración',
  ganttProgress: 'Avance',
  ganttAssignee: 'Responsable',
  ganttDays: '{0} d',
  ganttExpand: 'Expandir {0}',
  ganttCollapse: 'Contraer {0}',
  ganttBarLabel: '{0}: {1}, {2} % completado',
  ganttGroupLabel: 'Grupo {0}: {1}, {2} % completado',
  ganttMilestoneLabel: 'Hito {0}: {1}',
  ganttDependsOn: 'Depende de {0}',
  ganttRemoveLink: 'Quitar la dependencia {0} → {1}',
  ganttLinkAdded: 'Dependencia creada: {0} → {1}.',
  ganttLinkRemoved: 'Dependencia quitada.',
  ganttMoved: '{0}: {1}.',
  ganttProgressChanged: '{0}: {1} % completado.',
  ganttInstructions: 'Flechas: mover un día. Mayús + flechas: cambiar el fin. Alt + flechas: cambiar el inicio. + y −: avance. Supr: quitar sus dependencias. Enter: abrir la tarea.',

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
  billingCycle: 'Ciclo de facturación',
  notIncluded: 'no incluido',
  payAnnually: 'Paga anualmente',
  payMonthly: 'Paga mensualmente',
  billedAnnually: 'Facturado {0} anualmente',
  youSave: 'Ahorras {0}',
  recommended: 'Recomendado',

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
  inlineCode: 'Código',
  horizontalLine: 'Línea horizontal',
  sourceCode: 'Ver HTML',
  removeLink: 'Quitar enlace',
  openInNewTab: 'Abrir en una pestaña nueva',
  invalidUrl: 'El enlace debe empezar por http://, https://, mailto: o tel:.',
  characterCount: '{0} de {1} caracteres',
  imageTooLarge: 'La imagen supera el tamaño máximo ({0}).',
  imageUploadError: 'No se pudo subir la imagen.',
  codeBlock: 'Bloque de código',
  insertTable: 'Insertar tabla',
  tableRows: 'Filas',
  tableColumns: 'Columnas',
  tableHeaderRow: 'Fila de encabezado',
  insert: 'Insertar',
  tableTools: 'Tabla',
  insertRowAbove: 'Insertar fila arriba',
  insertRowBelow: 'Insertar fila abajo',
  insertColumnLeft: 'Insertar columna a la izquierda',
  insertColumnRight: 'Insertar columna a la derecha',
  deleteRow: 'Eliminar fila',
  deleteColumn: 'Eliminar columna',
  deleteTable: 'Eliminar tabla',
  imageTools: 'Imagen',
  imageInline: 'En línea con el texto',
  imageAlignLeft: 'Alinear a la izquierda',
  imageAlignCenter: 'Centrar',
  imageAlignRight: 'Alinear a la derecha',
  imageWidth: 'Ancho {0}',
  imageOriginalSize: 'Tamaño original',
  imageResize: 'Redimensionar imagen',
  altText: 'Texto alternativo',
  deleteImage: 'Eliminar imagen',
  tableSize: '{0} filas × {1} columnas',
  tableRow: 'Fila',
  tableColumn: 'Columna',
  above: 'Arriba',
  below: 'Abajo',
  toLeft: 'Izquierda',
  toRight: 'Derecha',
  tableDelete: 'Eliminar',
  tableBorders: 'Bordes',
  bordersAll: 'Todos los bordes',
  bordersHorizontal: 'Solo líneas horizontales',
  bordersNone: 'Sin bordes',
  borderColor: 'Color del borde',
  colorGray: 'Gris',
  colorDark: 'Oscuro',
  colorGreen: 'Verde',
  colorBlue: 'Azul',
  cropImage: 'Recortar',
  cropArea: 'Área de recorte',
  cropFree: 'Libre',
  cropInstructions: 'Arrastra el recuadro o sus esquinas. Con el teclado: flechas para mover, Mayús + flechas para cambiar el tamaño.',
  cropError: 'No se pudo recortar la imagen. Si viene de otro dominio, su servidor debe permitir CORS.',
  exitFullscreen: 'Salir de pantalla completa',
  heading4: 'Título 4',
  fontSize: 'Tamaño de letra',
  fontNormal: 'Normal',
  textColor: 'Color del texto',
  highlight: 'Resaltado',
  automaticColor: 'Automático',
  noHighlight: 'Sin resaltado',
  colorBlack: 'Negro',
  colorRed: 'Rojo',
  colorOrange: 'Naranja',
  colorYellow: 'Amarillo',
  colorTeal: 'Turquesa',
  colorPurple: 'Morado',
  colorPink: 'Rosa',
  subscript: 'Subíndice',
  superscript: 'Superíndice',
  taskList: 'Lista de tareas',
  indent: 'Aumentar sangría',
  outdent: 'Reducir sangría',
  alignJustify: 'Justificar',
  alignment: 'Alineación',
  wordCount: '{0} palabras',
  wordCountOne: '{0} palabra',
  charCount: '{0} caracteres',
  fontFamily: 'Fuente',
  fontDefault: 'Predeterminada',
  fontGroupRecommended: 'Recomendadas',
  fontGroupOffice: 'Clásicas de Office',
  fontGroupSans: 'Sans serif modernas',
  fontGroupSerif: 'Serif',
  fontGroupMono: 'Monoespaciadas para código',
  fontGroupAccessible: 'Accesibilidad',
  fontGroupFun: 'Divertidas',
  specialCharacters: 'Caracteres especiales',
  charsCurrency: 'Monedas',
  charsMath: 'Matemáticas',
  charsPunctuation: 'Puntuación y signos',
  charsArrows: 'Flechas',
  charsEmoji: 'Emoji',
  findReplace: 'Buscar y reemplazar',
  findText: 'Buscar',
  replaceWith: 'Reemplazar con',
  matchCase: 'Mayúsculas y minúsculas',
  wholeWords: 'Palabras completas',
  findPrevious: 'Resultado anterior',
  findNext: 'Resultado siguiente',
  replaceOne: 'Reemplazar',
  replaceAll: 'Reemplazar todo',
  findCount: '{0} de {1}',
  replacedCount: 'Reemplazos hechos: {0}',
  quickFormat: 'Formato rápido',
  insertBlock: 'Insertar bloque',
  paragraph: 'Párrafo',
  // --- Comments ---
  commentsFeed: 'Comentarios y actividad',
  commentsShow: 'Mostrar',
  commentsAll: 'Todo',
  commentsOnly: 'Comentarios',
  commentsActivity: 'Actividad',
  commentsEmpty: 'Todavía no hay comentarios.',
  commentsWrite: 'Escribe un comentario… (@ para mencionar)',
  commentsWriteReply: 'Escribe una respuesta…',
  commentsNew: 'Nuevo comentario',
  commentsEditing: 'Editar comentario',
  commentsReplyTo: 'Responder a {0}',
  commentsRepliesTo: 'Respuestas a {0}',
  commentsSend: 'Comentar',
  commentsReply: 'Responder',
  commentsEdit: 'Editar',
  commentsDelete: 'Eliminar',
  commentsDeleteConfirm: '¿Eliminar este comentario?',
  commentsEdited: 'editado',
  commentsDeleted: 'Comentario eliminado',
  commentsAddReaction: 'Añadir reacción',
  commentsReactions: 'Reacciones',
  commentsReactionLabel: '{0}, {1}: {2}',
  commentsYou: 'tú',
  commentsJustNow: 'ahora mismo',
  commentsPosted: 'Comentario publicado',
  commentsSaved: 'Comentario guardado',
  commentsShortcut: 'Ctrl + Enter para enviar',
  // --- Notification center ---
  notificationsTitle: 'Notificaciones',
  notificationsBellUnread: 'Notificaciones, {0} sin leer',
  notificationsMarkAllRead: 'Marcar todas como leídas',
  notificationsShow: 'Mostrar',
  notificationsAll: 'Todas',
  notificationsUnread: 'No leídas',
  notificationsUnreadItem: 'No leída',
  notificationsMarkRead: 'Marcar como leída: {0}',
  notificationsMarkUnread: 'Marcar como no leída: {0}',
  notificationsMarkReadShort: 'Marcar como leída',
  notificationsMarkUnreadShort: 'Marcar como no leída',
  notificationsEmpty: 'No tienes notificaciones.',
  notificationsAllRead: 'Estás al día: no hay avisos sin leer.',
  notificationsViewAll: 'Ver todas',
  notificationsToday: 'Hoy',
  notificationsYesterday: 'Ayer',
  notificationsEarlier: 'Anteriores',
  notificationsJustNow: 'ahora mismo',
  notificationsNew: 'Nueva notificación: {0}',
  notificationsNewMany: '{0} notificaciones nuevas',
  notificationsMarkedRead: 'Marcada como leída',
  notificationsMarkedUnread: 'Marcada como no leída',
  notificationsMarkedAllRead: 'Todas marcadas como leídas',
  notificationsRemoved: 'Notificación eliminada',
  // --- Signature pad ---
  signaturePad: 'Área de firma',
  signatureEmptyState: 'vacía',
  signatureSignedState: 'firmada',
  signaturePlaceholder: 'Firma aquí',
  signatureModes: 'Forma de firmar',
  signatureDraw: 'Dibujar',
  signatureType: 'Escribir',
  signatureTypeLabel: 'Escribe tu nombre',
  signatureHint: 'Dibuja tu firma con el ratón, el dedo o un lápiz, o elige «Escribir» para teclear tu nombre.',
  signatureHintDraw: 'Dibuja tu firma con el ratón, el dedo o un lápiz.',
  signatureUndo: 'Deshacer trazo',
  signatureClear: 'Borrar firma',
  signatureCleared: 'Firma borrada',
  signatureUndone: 'Trazo deshecho',
};

/** Inglés. */
export const CB_LOCALE_EN: CbTranslation = {
  intlLocale: 'en',
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
  copy: 'Copy',
  copied: 'Copied',
  copyFailed: 'Could not copy',
  qrCode: 'QR code',
  commandPalette: 'Command palette',
  commandPlaceholder: 'Search for a page or action…',
  commandResults: '{0} results',
  commandNavigate: 'navigate',
  commandSelect: 'select',
  expandSidebar: 'Expand sidebar',
  collapseSidebar: 'Collapse sidebar',
  openMenu: 'Open menu',
  chatConversation: 'Conversation',
  chatYou: 'You',
  chatAssistant: 'Assistant',
  chatPlaceholder: 'Write a message…',
  chatMessage: 'Message',
  chatSend: 'Send',
  chatStop: 'Stop',
  chatAttach: 'Attach files',
  chatSending: 'Sending…',
  chatError: 'Could not send',
  chatRetry: 'Retry',
  chatTyping: 'Typing…',
  chatGenerating: 'Generating response…',
  chatResponseReady: 'Response ready',
  chatJumpToLatest: 'Jump to latest message',
  phoneCountry: 'Country',
  searchCountry: 'Search country',
  phoneInvalid: 'Incomplete or invalid phone number',
  chatThinking: 'Thinking…',
  chatThoughtFor: 'Thought for {0} s',
  chatReasoning: 'Reasoning',
  chatToolRunning: 'Using {0}…',
  chatToolDone: 'Used {0}',
  chatToolError: '{0} failed',
  chatToolInput: 'Input',
  chatToolOutput: 'Result',
  chatHelpful: 'Helpful response',
  chatNotHelpful: 'Not helpful response',
  chatRegenerate: 'Regenerate response',
  chatAttachments: 'Attachments',
  kanbanCard: 'card',
  kanbanInstructions: 'To move the card, press Space, use the arrow keys and press Space again to drop it. Escape cancels.',
  kanbanGrabbed: '{0} picked up. Column {1}, position {2} of {3}.',
  kanbanMoved: '{0}: column {1}, position {2} of {3}.',
  kanbanDropped: '{0} dropped in {1}, position {2}.',
  kanbanCancelled: 'Move cancelled. {0} returns to {1}.',
  kanbanFull: '{0} is full.',
  kanbanCount: '{0} of {1}',
  kanbanAdd: 'Add card',
  kanbanEdit: 'Edit',
  kanbanDelete: 'Delete',
  kanbanMoveTo: 'Move to {0}',
  kanbanCardActions: 'Actions for {0}',
  kanbanCardTitle: 'Card title',
  kanbanConfirmDelete: 'Delete “{0}”?',
  kanbanDeleted: '{0} deleted.',
  kanbanAdded: '{0} added to {1}.',
  kanbanRenamed: '“{0}” is now “{1}”.',
  kanbanAddColumn: 'Add column',
  kanbanColumnName: 'Column name',
  kanbanNewColumn: 'New column',
  kanbanColumnActions: 'Actions for column {0}',
  kanbanRename: 'Rename',
  kanbanCollapse: 'Collapse {0}',
  kanbanExpand: 'Expand {0}',
  kanbanConfirmDeleteColumn: 'Delete column “{0}” and its {1} cards?',
  kanbanDetails: 'Task details',
  kanbanOpenDetails: 'Open details',
  kanbanStatus: 'Column',
  kanbanAssignees: 'Assignees',
  kanbanNoAssignees: 'Unassigned',
  kanbanUnassign: 'Remove {0}',
  kanbanAssignedTo: 'Assignees: {0}',
  kanbanPriority: 'Priority',
  kanbanNoPriority: 'No priority',
  kanbanPriorityLow: 'Low',
  kanbanPriorityMedium: 'Medium',
  kanbanPriorityHigh: 'High',
  kanbanStartDate: 'Start date',
  kanbanEndDate: 'Due date',
  kanbanDates: 'Dates',
  kanbanOverdue: 'overdue',
  kanbanDescription: 'Description',
  kanbanDescriptionPlaceholder: 'What is this task about?',
  kanbanAttachments: 'Attachments',
  kanbanAttach: 'Attach files',
  kanbanDropFiles: 'or drop them here',
  kanbanRemoveAttachment: 'Remove {0}',
  kanbanAttachmentCount: '{0} attachments',
  kanbanUpdated: '{0} updated.',
  kanbanTaskName: 'Name',
  kanbanAddTask: 'Add task',
  kanbanAddSection: 'Add section',
  kanbanCompleted: 'Completed',
  kanbanMarkComplete: 'Mark “{0}” complete',
  kanbanMarkIncomplete: 'Mark “{0}” incomplete',
  kanbanSectionCount: '{0}, {1} tasks',
  kanbanListInstructions: 'Press Alt + Up or Down arrow to move the task in the list.',
  kanbanNoDate: 'No date ({0})',
  kanbanAddTaskOn: 'Add task on {0}',
  kanbanWeekOf: 'Week of {0} to {1}',
  kanbanCalendarInstructions: 'Drag the task to another day, or use Alt + arrows: left and right change the day; up and down, the week.',
  kanbanRescheduled: '{0}: {1}.',
  kanbanPreviousWeek: 'Previous week',
  kanbanNextWeek: 'Next week',
  kanbanDays: 'Days',
  kanbanZoomIn: 'Zoom in',
  kanbanZoomOut: 'Zoom out',
  kanbanAddTaskIn: 'Add task to {0}',
  kanbanTimelineInstructions: 'Drag the task to change its dates, or its edges to change how long it lasts. With the keyboard: Alt + left or right moves it one day, Alt + Shift + left or right changes the end date, and Alt + up or down moves it to another section.',
  kanbanDashboard: 'Project dashboard',
  kanbanTotalCompleted: 'Completed tasks',
  kanbanTotalIncomplete: 'Incomplete tasks',
  kanbanTotalOverdue: 'Overdue tasks',
  kanbanTotalTasks: 'Total tasks',
  kanbanOfTotal: '{0} of total',
  kanbanIncompleteBySection: 'Incomplete tasks by section',
  kanbanByCompletion: 'Tasks by completion status',
  kanbanIncompleteByAssignee: 'Incomplete tasks by assignee',
  kanbanByWeek: 'Due dates by week',
  kanbanCompletedPlural: 'Completed',
  kanbanPendingPlural: 'On time',
  kanbanOverduePlural: 'Overdue',
  kanbanIncompletePlural: 'Incomplete',
  kanbanViews: 'Views',
  kanbanViewBoard: 'Board',
  kanbanViewList: 'List',
  kanbanViewTimeline: 'Timeline',
  kanbanViewDashboard: 'Dashboard',
  kanbanViewCalendar: 'Calendar',
  kanbanHideView: 'Hide {0}',
  kanbanSideBySide: 'Side by side',
  kanbanViewsHint: 'Turn on several views to see them at once.',
  save: 'Save',
  mentionsCount: '{0} suggestions',
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
  stepCompleted: 'completed',
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
  colorArea: 'Saturation and brightness',
  colorAreaValue: 'Saturation {0}%, brightness {1}%',
  hue: 'Hue',
  switch: 'Switch',
  ratingOf: '{0} of {1}',

  openCalendar: 'Open calendar',
  hours: 'Hours',
  minutes: 'Minutes',
  period: 'AM / PM',
  chooseEndDate: 'Choose the end date',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  previousDecade: 'Previous decade',
  nextDecade: 'Next decade',
  chooseMonth: 'Choose month',
  chooseYear: 'Choose year',
  startTime: 'Start time',
  endTime: 'End time',
  invalidDate: 'Invalid date. Use the format {0}.',
  datePresets: 'Shortcuts',
  presetYesterday: 'Yesterday',
  presetLast7Days: 'Last 7 days',
  presetLast30Days: 'Last 30 days',
  presetThisMonth: 'This month',
  presetLastMonth: 'Last month',
  presetThisYear: 'This year',
  presetLastYear: 'Last year',
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
  chartTotal: 'Total',
  chartChange: 'Change',
  chartOpen: 'Open',
  chartHigh: 'High',
  chartLow: 'Low',
  chartClose: 'Close',
  chartResetZoom: 'Reset zoom',
  chartZoomInstructions: 'Press + or − to zoom in or out and 0 to see everything; with the mouse, use the wheel, drag to pan and double-click to reset.',

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
  pdfOutline: 'Outline',
  pdfSidebarView: 'Panel view',
  pdfExpandItem: 'Expand {0}',
  pdfCollapseItem: 'Collapse {0}',
  pdfDownloadFilled: 'Download with the form data',
  editorCodeTools: 'Code block tools',
  editorCodeLanguage: 'Code language',
  editorPlainText: 'Plain text',
  editorCopyCode: 'Copy code',
  editorCodeCopied: 'Copied',
  editorImageCaption: 'Caption',
  editorTableCells: 'Cells',
  editorMergeRight: 'Merge with the cell on the right',
  editorMergeDown: 'Merge with the cell below',
  editorSplitCell: 'Split',
  editorCollapsible: 'Collapsible section',
  editorCollapsibleTitle: 'Collapsible title',
  editorToc: 'Table of contents',
  editorTocTitle: 'Contents',
  editorMentions: 'People you can mention',
  editorDraftFound: 'There is an unsaved draft from {0}.',
  editorRestoreDraft: 'Restore',
  editorDiscardDraft: 'Discard',
  editorDraftSaved: 'Draft saved at {0}',
  ganttChart: 'Gantt chart',
  ganttScale: 'Time scale',
  ganttDay: 'Day',
  ganttWeek: 'Week',
  ganttMonth: 'Month',
  ganttWeekShort: 'W{0}',
  ganttTask: 'Task',
  ganttStart: 'Start',
  ganttEnd: 'End',
  ganttDuration: 'Duration',
  ganttProgress: 'Progress',
  ganttAssignee: 'Assignee',
  ganttDays: '{0} d',
  ganttExpand: 'Expand {0}',
  ganttCollapse: 'Collapse {0}',
  ganttBarLabel: '{0}: {1}, {2}% complete',
  ganttGroupLabel: 'Group {0}: {1}, {2}% complete',
  ganttMilestoneLabel: 'Milestone {0}: {1}',
  ganttDependsOn: 'Depends on {0}',
  ganttRemoveLink: 'Remove the dependency {0} → {1}',
  ganttLinkAdded: 'Dependency created: {0} → {1}.',
  ganttLinkRemoved: 'Dependency removed.',
  ganttMoved: '{0}: {1}.',
  ganttProgressChanged: '{0}: {1}% complete.',
  ganttInstructions: 'Arrows: move one day. Shift + arrows: change the end. Alt + arrows: change the start. + and −: progress. Delete: remove its dependencies. Enter: open the task.',

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
  billingCycle: 'Billing cycle',
  notIncluded: 'not included',
  payAnnually: 'Pay annually',
  payMonthly: 'Pay monthly',
  billedAnnually: 'Billed {0} annually',
  youSave: 'You save {0}',
  recommended: 'Recommended',

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
  inlineCode: 'Code',
  horizontalLine: 'Horizontal line',
  sourceCode: 'View HTML',
  removeLink: 'Remove link',
  openInNewTab: 'Open in a new tab',
  invalidUrl: 'The link must start with http://, https://, mailto: or tel:.',
  characterCount: '{0} of {1} characters',
  imageTooLarge: 'The image exceeds the maximum size ({0}).',
  imageUploadError: 'The image could not be uploaded.',
  codeBlock: 'Code block',
  insertTable: 'Insert table',
  tableRows: 'Rows',
  tableColumns: 'Columns',
  tableHeaderRow: 'Header row',
  insert: 'Insert',
  tableTools: 'Table',
  insertRowAbove: 'Insert row above',
  insertRowBelow: 'Insert row below',
  insertColumnLeft: 'Insert column left',
  insertColumnRight: 'Insert column right',
  deleteRow: 'Delete row',
  deleteColumn: 'Delete column',
  deleteTable: 'Delete table',
  imageTools: 'Image',
  imageInline: 'In line with text',
  imageAlignLeft: 'Align left',
  imageAlignCenter: 'Center',
  imageAlignRight: 'Align right',
  imageWidth: 'Width {0}',
  imageOriginalSize: 'Original size',
  imageResize: 'Resize image',
  altText: 'Alternative text',
  deleteImage: 'Delete image',
  tableSize: '{0} rows × {1} columns',
  tableRow: 'Row',
  tableColumn: 'Column',
  above: 'Above',
  below: 'Below',
  toLeft: 'Left',
  toRight: 'Right',
  tableDelete: 'Delete',
  tableBorders: 'Borders',
  bordersAll: 'All borders',
  bordersHorizontal: 'Horizontal lines only',
  bordersNone: 'No borders',
  borderColor: 'Border color',
  colorGray: 'Gray',
  colorDark: 'Dark',
  colorGreen: 'Green',
  colorBlue: 'Blue',
  cropImage: 'Crop',
  cropArea: 'Crop area',
  cropFree: 'Free',
  cropInstructions: 'Drag the box or its corners. With the keyboard: arrows to move, Shift + arrows to resize.',
  cropError: 'The image could not be cropped. If it comes from another domain, its server must allow CORS.',
  exitFullscreen: 'Exit full screen',
  heading4: 'Heading 4',
  fontSize: 'Font size',
  fontNormal: 'Normal',
  textColor: 'Text color',
  highlight: 'Highlight',
  automaticColor: 'Automatic',
  noHighlight: 'No highlight',
  colorBlack: 'Black',
  colorRed: 'Red',
  colorOrange: 'Orange',
  colorYellow: 'Yellow',
  colorTeal: 'Teal',
  colorPurple: 'Purple',
  colorPink: 'Pink',
  subscript: 'Subscript',
  superscript: 'Superscript',
  taskList: 'Task list',
  indent: 'Increase indent',
  outdent: 'Decrease indent',
  alignJustify: 'Justify',
  alignment: 'Alignment',
  wordCount: '{0} words',
  wordCountOne: '{0} word',
  charCount: '{0} characters',
  fontFamily: 'Font',
  fontDefault: 'Default',
  fontGroupRecommended: 'Recommended',
  fontGroupOffice: 'Office classics',
  fontGroupSans: 'Modern sans serif',
  fontGroupSerif: 'Serif',
  fontGroupMono: 'Monospaced for code',
  fontGroupAccessible: 'Accessibility',
  fontGroupFun: 'Fun',
  specialCharacters: 'Special characters',
  charsCurrency: 'Currency',
  charsMath: 'Math',
  charsPunctuation: 'Punctuation and signs',
  charsArrows: 'Arrows',
  charsEmoji: 'Emoji',
  findReplace: 'Find and replace',
  findText: 'Find',
  replaceWith: 'Replace with',
  matchCase: 'Match case',
  wholeWords: 'Whole words',
  findPrevious: 'Previous result',
  findNext: 'Next result',
  replaceOne: 'Replace',
  replaceAll: 'Replace all',
  findCount: '{0} of {1}',
  replacedCount: 'Replacements made: {0}',
  quickFormat: 'Quick formatting',
  insertBlock: 'Insert block',
  paragraph: 'Paragraph',
  // --- Comments ---
  commentsFeed: 'Comments and activity',
  commentsShow: 'Show',
  commentsAll: 'All',
  commentsOnly: 'Comments',
  commentsActivity: 'Activity',
  commentsEmpty: 'No comments yet.',
  commentsWrite: 'Write a comment… (@ to mention)',
  commentsWriteReply: 'Write a reply…',
  commentsNew: 'New comment',
  commentsEditing: 'Edit comment',
  commentsReplyTo: 'Reply to {0}',
  commentsRepliesTo: 'Replies to {0}',
  commentsSend: 'Comment',
  commentsReply: 'Reply',
  commentsEdit: 'Edit',
  commentsDelete: 'Delete',
  commentsDeleteConfirm: 'Delete this comment?',
  commentsEdited: 'edited',
  commentsDeleted: 'Comment deleted',
  commentsAddReaction: 'Add reaction',
  commentsReactions: 'Reactions',
  commentsReactionLabel: '{0}, {1}: {2}',
  commentsYou: 'you',
  commentsJustNow: 'just now',
  commentsPosted: 'Comment posted',
  commentsSaved: 'Comment saved',
  commentsShortcut: 'Ctrl + Enter to send',
  // --- Notification center ---
  notificationsTitle: 'Notifications',
  notificationsBellUnread: 'Notifications, {0} unread',
  notificationsMarkAllRead: 'Mark all as read',
  notificationsShow: 'Show',
  notificationsAll: 'All',
  notificationsUnread: 'Unread',
  notificationsUnreadItem: 'Unread',
  notificationsMarkRead: 'Mark as read: {0}',
  notificationsMarkUnread: 'Mark as unread: {0}',
  notificationsMarkReadShort: 'Mark as read',
  notificationsMarkUnreadShort: 'Mark as unread',
  notificationsEmpty: 'You have no notifications.',
  notificationsAllRead: 'You are all caught up: no unread notifications.',
  notificationsViewAll: 'View all',
  notificationsToday: 'Today',
  notificationsYesterday: 'Yesterday',
  notificationsEarlier: 'Earlier',
  notificationsJustNow: 'just now',
  notificationsNew: 'New notification: {0}',
  notificationsNewMany: '{0} new notifications',
  notificationsMarkedRead: 'Marked as read',
  notificationsMarkedUnread: 'Marked as unread',
  notificationsMarkedAllRead: 'All marked as read',
  notificationsRemoved: 'Notification removed',
  // --- Signature pad ---
  signaturePad: 'Signature area',
  signatureEmptyState: 'empty',
  signatureSignedState: 'signed',
  signaturePlaceholder: 'Sign here',
  signatureModes: 'How to sign',
  signatureDraw: 'Draw',
  signatureType: 'Type',
  signatureTypeLabel: 'Type your name',
  signatureHint: 'Draw your signature with the mouse, a finger or a pen, or choose "Type" to type your name.',
  signatureHintDraw: 'Draw your signature with the mouse, a finger or a pen.',
  signatureUndo: 'Undo stroke',
  signatureClear: 'Clear signature',
  signatureCleared: 'Signature cleared',
  signatureUndone: 'Stroke undone',
};

/** Idiomas incluidos. */
export const CB_LOCALES = { es: CB_LOCALE_ES, en: CB_LOCALE_EN } as const;
export type CbLocaleCode = keyof typeof CB_LOCALES;

/** Rellena `{0}`, `{1}`… con los argumentos. */
export function cbFormat(template: string, ...args: unknown[]): string {
  return template.replace(/\{(\d+)\}/g, (m, i: string) => (args[+i] === undefined ? m : String(args[+i])));
}
