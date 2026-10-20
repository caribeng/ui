/**
 * Diccionario de traducción ES → EN para el contenido de las páginas doc del
 * showcase (subtítulos, categorías, títulos/descripciones de ejemplos y
 * descripciones de API). Lo consume `I18nService.auto()`, de modo que las
 * páginas no necesitan editarse una por una: el texto en español es la clave.
 *
 * Si una cadena no está aquí, `auto()` la devuelve tal cual (seguro para
 * nombres propios, código y páginas aún sin traducir).
 */
export const ES_EN: Record<string, string> = {
  // --- Categorías (eyebrow) ---
  'Caribe Design · Acciones': 'Caribe Design · Actions',
  'Caribe Design · Archivos': 'Caribe Design · Files',
  'Caribe Design · Formularios': 'Caribe Design · Forms',
  'Caribe Design · Identidad': 'Caribe Design · Identity',
  'Caribe Design · Indicadores': 'Caribe Design · Indicators',
  'Caribe Design · Loaders': 'Caribe Design · Loaders',
  'Caribe Design · Navegación': 'Caribe Design · Navigation',
  'Caribe Design · Paneles': 'Caribe Design · Panels',

  // --- Subtítulos de página ---
  'Agrupador accesible de botones con orientación horizontal o vertical.':
    'Accessible button grouper with horizontal or vertical orientation.',
  'Barra de navegación flotante tipo píldora para vistas móviles y web.':
    'Floating pill-style navigation bar for mobile and web views.',
  'Barra de progreso lineal con etiqueta y porcentaje integrado.':
    'Linear progress bar with built-in label and percentage.',
  'Botón compacto circular de icono con etiqueta accesible obligatoria.':
    'Compact circular icon button with a required accessible label.',
  'Botón de acceso directo con icono y etiqueta para acciones frecuentes.':
    'Shortcut button with icon and label for frequent actions.',
  'Botón de acción flotante (FAB) con menú desplegable de atajos.':
    'Floating action button (FAB) with a dropdown menu of shortcuts.',
  'Campo de búsqueda con botón de limpieza rápida e integración CVA.':
    'Search field with a quick-clear button and CVA integration.',
  'Campo de captura de fecha con límites min/max e integración CVA.':
    'Date-entry field with min/max bounds and CVA integration.',
  'Campo de contraseña con alternancia de visibilidad, medidor de fortaleza e integración CVA.':
    'Password field with visibility toggle, strength meter and CVA integration.',
  'Campo desplegable de selección rápida con soporte CVA.':
    'Quick-select dropdown field with CVA support.',
  'Captura segura de clave dinámica / OTP tokenizado con enmascaramiento opcional.':
    'Secure one-time-password (OTP) entry with optional masking.',
  'Contenedor accesible de animaciones vectoriales tipo Lottie con control de reproducción.':
    'Accessible container for Lottie-style vector animations with playback control.',
  'Directiva declarativa para alternar clases CSS sobre elementos relativos (@next, @prev, @parent) o selectores.':
    'Declarative directive to toggle CSS classes on relative elements (@next, @prev, @parent) or selectors.',
  'Directiva que confina el ciclo de navegación por teclado (Tab y Shift+Tab) dentro del contenedor anfitrión.':
    'Directive that traps the keyboard focus cycle (Tab and Shift+Tab) within the host container.',
  'Directiva que enfoca automáticamente el elemento anfitrión al montarse en la vista.':
    'Directive that automatically focuses the host element when mounted.',
  'Directiva que observa la intersección con el viewport y aplica clases CSS de entrada/salida.':
    'Directive that observes viewport intersection and applies enter/leave CSS classes.',
  'Encabezado de aplicación o flujo con botón de retorno y proyección de acciones.':
    'Application or flow header with a back button and projected actions.',
  'Gráficos vectoriales SVG accesibles sin dependencias externas (bar, line, doughnut, pie).':
    'Accessible SVG vector charts with no external dependencies (bar, line, doughnut, pie).',
  'Hipervínculo accesible con soporte para enlaces externos seguros.':
    'Accessible hyperlink with support for safe external links.',
  'Ilustraciones vectoriales expresivas para estados vacíos, confirmaciones y onboarding.':
    'Expressive vector illustrations for empty states, confirmations and onboarding.',
  'Indicador circular de carga determinada o indeterminada.':
    'Circular loading indicator, determinate or indeterminate.',
  'Indicador compacto de espera con anuncio accesible en vivo.':
    'Compact waiting indicator with an accessible live announcement.',
  'Indicador compacto del progreso por pasos en flujos asistidos.':
    'Compact step-progress indicator for guided flows.',
  'Indicador de paginación por puntos para carruseles y flujos de onboarding.':
    'Dot pagination indicator for carousels and onboarding flows.',
  'Interruptor binario con rol ARIA switch e integración CVA.':
    'Binary switch with the ARIA switch role and CVA integration.',
  'Logotipo vectorial escalable con soporte de versión positiva/negativa y tamaño personalizable.':
    'Scalable vector logo with positive/negative variants and custom sizing.',
  'Panel desplegable para mostrar u ocultar detalles adicionales.':
    'Collapsible panel to show or hide extra details.',
  'Panel lateral deslizable para filtros, menús contextuales y formularios secundarios.':
    'Sliding side panel for filters, context menus and secondary forms.',
  'Pantalla o bloque de precarga inicial para flujos transaccionales.':
    'Initial preloading screen or block for transactional flows.',
  'Paso 1 de 3': 'Step 1 of 3',
  'Pictogramas gráficos de síntesis visual para categorías financieras y servicios.':
    'Graphic pictograms of visual synthesis for financial categories and services.',
  'Pie de página institucional con texto legal y ranura para enlaces.':
    'Institutional footer with legal text and a slot for links.',
  'Píldora interactiva seleccionable para filtros rápidos y categorías.':
    'Interactive selectable pill for quick filters and categories.',
  'Selector de archivos con filtro de extensiones y modelo reactivo.':
    'File picker with extension filtering and a reactive model.',
  'Tarjeta de descarga de documentos, extractos y comprobantes.':
    'Download card for documents, statements and receipts.',
  'Trazos decorativos SVG escalables del sistema de diseño Caribe.':
    'Scalable decorative SVG strokes from the Caribe design system.',
  'Vista de calendario mensual inline para selección directa de día.':
    'Inline monthly calendar view for direct day selection.',

  // --- Títulos de ejemplo ---
  'Animación en bucle': 'Looping animation',
  'Atajos transaccionales': 'Transactional shortcuts',
  'Barra flotante': 'Floating bar',
  'Botones de acción rápida': 'Quick-action buttons',
  'Búsqueda reactiva': 'Reactive search',
  'Calendario mensual': 'Monthly calendar',
  'Clave dinámica de 6 dígitos': '6-digit one-time code',
  'Descarga de certificado': 'Certificate download',
  'Encabezado de flujo': 'Flow header',
  'Enlace estándar': 'Standard link',
  'FAB interactivo': 'Interactive FAB',
  'Filtros seleccionables': 'Selectable filters',
  'Grupo horizontal': 'Horizontal group',
  'Ilustración escalable': 'Scalable illustration',
  'Interruptor con etiqueta': 'Switch with label',
  'Loader con mensaje': 'Loader with message',
  'Meta de ahorro': 'Savings goal',
  'Panel desplegable': 'Collapsible panel',
  'Panel lateral': 'Side panel',
  'Paso actual': 'Current step',
  Pictograma: 'Pictogram',
  'Pie institucional': 'Institutional footer',
  'Preloader activo': 'Active preloader',
  'Progreso circular': 'Circular progress',
  'Puntos interactivos': 'Interactive dots',
  'Selección de soporte PDF': 'PDF attachment selection',
  'Selector de fecha': 'Date picker',
  'Tamaños y variantes': 'Sizes and variants',
  'Tipo de cuenta': 'Account type',
  'Trazo decorativo': 'Decorative stroke',

  // --- Descripciones de API ---
  'Abre en nueva pestaña con rel seguro.': 'Opens in a new tab with a safe rel.',
  'Acciones del menú.': 'Menu actions.',
  'Activa la variante clara para fondos oscuros.':
    'Enables the light variant for dark backgrounds.',
  'Activa o desactiva el enfoque automático al montar.':
    'Enables or disables auto-focus on mount.',
  'Alto del lienzo SVG en píxeles.': 'SVG canvas height in pixels.',
  'Ancho CSS de la ilustración.': 'CSS width of the illustration.',
  'Ancho CSS del logotipo (px, rem, em, %).': 'CSS width of the logo (px, rem, em, %).',
  'Ancho del trazo en unidades CSS.': 'Stroke width in CSS units.',
  'Clase(s) a alternar en cada clic.': 'Class(es) to toggle on each click.',
  'Clase(s) a aplicar al desactivar.': 'Class(es) to apply when deactivating.',
  'Clase(s) a añadir al activar.': 'Class(es) to add when activating.',
  'Clase(s) aplicadas al entrar en el viewport.':
    'Class(es) applied when entering the viewport.',
  'Clase(s) aplicadas al salir del viewport.':
    'Class(es) applied when leaving the viewport.',
  'Controla si el preloader es visible.': 'Controls whether the preloader is visible.',
  'Controla su visibilidad.': 'Controls its visibility.',
  'Código del trazo del catálogo (01–19).': 'Catalog stroke code (01–19).',
  'Desactiva temporalmente la captura de foco.': 'Temporarily disables focus trapping.',
  'Descripción accesible.': 'Accessible description.',
  'Deshabilita la interacción.': 'Disables interaction.',
  'Dimensiones del lienzo.': 'Canvas dimensions.',
  'Dirección del grupo de botones.': 'Direction of the button group.',
  'Diámetro en píxeles.': 'Diameter in pixels.',
  'Día seleccionado del mes.': 'Selected day of the month.',
  'Encabezado del panel.': 'Panel header.',
  'Encabezado principal.': 'Main heading.',
  'Estado activo/presionado.': 'Active/pressed state.',
  'Estado de apertura.': 'Open state.',
  'Estado desplegado.': 'Expanded state.',
  'Estado encendido/apagado.': 'On/off state.',
  'Etiqueta accesible del botón.': 'Accessible label for the button.',
  'Etiqueta accesible.': 'Accessible label.',
  'Etiqueta del campo.': 'Field label.',
  'Etiqueta del interruptor.': 'Switch label.',
  'Etiqueta descriptiva.': 'Descriptive label.',
  'Etiqueta principal del selector.': 'Main label of the selector.',
  'Etiqueta superior del campo.': 'Top label of the field.',
  'Etiquetas y series numéricas.': 'Labels and numeric series.',
  'Evento al activar el atajo.': 'Event when the shortcut is activated.',
  'Evento emitido al solicitar la descarga.': 'Event emitted when a download is requested.',
  'Fecha en formato ISO YYYY-MM-DD.': 'Date in ISO format YYYY-MM-DD.',
  'Fecha máxima permitida.': 'Maximum allowed date.',
  'Fecha mínima permitida.': 'Minimum allowed date.',
  'Icono superior.': 'Top icon.',
  'Identificador del logotipo.': 'Logo identifier.',
  'Identificador del pictograma.': 'Pictogram identifier.',
  'Identificador del ítem activo.': 'Identifier of the active item.',
  'Inicia automáticamente al montar.': 'Starts automatically on mount.',
  'Mensaje mostrado junto al indicador.': 'Message shown next to the indicator.',
  'Modo indeterminado continuo.': 'Continuous indeterminate mode.',
  'Muestra botón de regreso.': 'Shows a back button.',
  'Muestra botón para limpiar el texto.': 'Shows a button to clear the text.',
  'Muestra el botón para alternar visibilidad.': 'Shows the button to toggle visibility.',
  'Muestra el porcentaje numérico.': 'Shows the numeric percentage.',
  'Muestra la barra e indicador de fortaleza.': 'Shows the strength bar and indicator.',
  'Muestra la leyenda inferior.': 'Shows the bottom caption.',
  'Nombre accesible del grupo.': 'Accessible name of the group.',
  'Nombre de la ilustración del catálogo.': 'Name of the catalog illustration.',
  'Nombre del icono del catálogo.': 'Name of the catalog icon.',
  'Nombre visible del archivo.': 'Visible file name.',
  'Número de dígitos del código token (3 a 8).': 'Number of token-code digits (3 to 8).',
  'Número del paso actual.': 'Current step number.',
  'Número total de pasos o vistas.': 'Total number of steps or views.',
  'Oculta el elemento puramente decorativo del árbol ARIA.':
    'Hides the purely decorative element from the ARIA tree.',
  'Opciones de navegación.': 'Navigation options.',
  'Opciones disponibles.': 'Available options.',
  'Permite seleccionar varios archivos.': 'Allows selecting multiple files.',
  'Porcentaje completado (0–100).': 'Completed percentage (0–100).',
  'Porcentaje entre 0 y 100.': 'Percentage between 0 and 100.',
  'Repite la animación en ciclo continuo.': 'Repeats the animation in a continuous loop.',
  'Ruta o JSON de la animación.': 'Animation path or JSON.',
  'Selector del elemento objetivo.': 'Selector of the target element.',
  'Si es true, desconecta el observador tras la primera entrada.':
    'If true, disconnects the observer after the first entry.',
  'Si es true, muestra los dígitos en lugar de ocultarlos.':
    'If true, shows the digits instead of hiding them.',
  'Subtítulo informativo.': 'Informative subtitle.',
  'Subtítulo opcional.': 'Optional subtitle.',
  'Tamaño del control.': 'Control size.',
  'Tamaño del pictograma.': 'Pictogram size.',
  'Tamaño formateado del archivo.': 'Formatted file size.',
  'Tamaño visual del loader.': 'Visual size of the loader.',
  'Texto actual de búsqueda.': 'Current search text.',
  'Texto alternativo para lectores de pantalla.': 'Alternative text for screen readers.',
  'Texto de ayuda inferior.': 'Bottom help text.',
  'Texto de derechos de autor.': 'Copyright text.',
  'Texto del atajo.': 'Shortcut text.',
  'Texto del enlace.': 'Link text.',
  'Texto descriptivo y aria-label.': 'Descriptive text and aria-label.',
  'Texto guía.': 'Placeholder text.',
  'Texto visible del tag.': 'Visible text of the tag.',
  'Tipo de visualización SVG.': 'SVG visualization type.',
  'Tipos MIME o extensiones permitidas.': 'Allowed MIME types or extensions.',
  'Total de pasos del flujo.': 'Total steps of the flow.',
  'Título del encabezado.': 'Header title.',
  'Título del mes visible.': 'Title of the visible month.',
  'Título descriptivo del paso.': 'Descriptive title of the step.',
  'Título principal.': 'Main title.',
  'URL de destino.': 'Target URL.',
  'Ubicación del panel.': 'Panel location.',
  'Umbral de intersección entre 0 y 1.': 'Intersection threshold between 0 and 1.',
  'Valor actual del campo de contraseña.': 'Current value of the password field.',
  'Valor seleccionado.': 'Selected value.',
  'Índice activo (base 0).': 'Active index (0-based).',

  // --- Foundations: Introduction / Colors / Theming / Icons ---
  'Sistema de diseño y librería de componentes para Angular 22+, independiente de terceros. Signals, OnPush, standalone y tree-shaking por componente.':
    'Design system and component library for Angular 22+, independent of third parties. Signals, OnPush, standalone and per-component tree-shaking.',
  'Paleta de design tokens (--cb-color-*). Cámbiala en vivo con el configurador de la barra superior.':
    'Design-token palette (--cb-color-*). Change it live with the configurator in the top bar.',
  'El tema se controla con variables CSS --cb-*, presets de paleta en vivo y el atributo data-theme. Personaliza sin tocar la librería.':
    'The theme is driven by --cb-* CSS variables, live palette presets and the data-theme attribute. Customize without touching the library.',
  'Personalizar tokens': 'Customize tokens',
  'Presets de paleta en vivo': 'Live palette presets',
  'Iconos de CaribeNG (derivados de Lucide, ISC) en SVG inline. Heredan el color del texto (currentColor) y escalan con el tamaño. Sin dependencia en runtime.':
    'CaribeNG icons (derived from Lucide, ISC) as inline SVG. They inherit the text color (currentColor) and scale with size. No runtime dependency.',
  'El registro es extensible: registra tus SVG con provideCbIcons.':
    'The registry is extensible: register your SVGs with provideCbIcons.',
  'Usa name con cualquier icono del set núcleo. Toma el color del texto.':
    'Use name with any icon from the core set. It takes the text color.',
  'currentColor hace que el icono tome el color del contenedor.':
    'currentColor makes the icon take the container color.',
  'size = sm (16) · md (20) · lg (24) · xl (32) o un número en px.':
    'size = sm (16) · md (20) · lg (24) · xl (32) or a number in px.',
  "spin gira el icono; ideal para 'loader'.":
    "spin rotates the icon; ideal for a 'loader'.",
  '¿Falta uno? Importa cualquiera de los 1891 iconos desde @caribeng/ui/icons (tree-shakeable: solo entra al bundle lo que importas) y regístralo.':
    'Missing one? Import any of the 1891 icons from @caribeng/ui/icons (tree-shakeable: only what you import enters the bundle) and register it.',
  'Añadir iconos propios': 'Add your own icons',
  'Catálogo completo (1891)': 'Full catalog (1891)',
  'Color por severidad': 'Color by severity',
  'Set núcleo': 'Core set',
  Tamaños: 'Sizes',
  'Animación (spin)': 'Animation (spin)',

  // --- Introduction: tarjetas de características ---
  Independiente: 'Independent',
  Accesible: 'Accessible',
  'Reactividad moderna con input(), model() y computed() en todos los componentes.':
    'Modern reactivity with input(), model() and computed() across all components.',
  'Cero dependencias de PrimeNG o Material. Solo @angular/cdk.':
    'Zero dependencies on PrimeNG or Material. Only @angular/cdk.',
  'Personaliza con variables CSS --cb-*. Tema claro y oscuro integrados.':
    'Customize with --cb-* CSS variables. Light and dark themes built in.',
  'Un solo paquete @caribeng/ui con entry points por componente: incluye solo lo que usas.':
    'A single @caribeng/ui package with per-component entry points: ship only what you use.',
  'Objetivo WCAG 2.2 AA: teclado, foco visible y ARIA correcto.':
    'WCAG 2.2 AA target: keyboard, visible focus and correct ARIA.',
  'Compatible con zoneless y Zone.js sin configuración global.':
    'Works with zoneless and Zone.js without global configuration.',

  // --- Componentes PrimeNG: subtítulos de página ---
  'Campo de texto integrado con Angular Forms mediante ControlValueAccessor.':
    'Text field integrated with Angular Forms via ControlValueAccessor.',
  'Botón accesible con severidades, variantes, tamaños y estado de carga.':
    'Accessible button with severities, variants, sizes and loading state.',
  'Dropdown accesible (listbox) sobre CDK Overlay, con teclado, filtro y ControlValueAccessor.':
    'Accessible dropdown (listbox) on CDK Overlay, with keyboard, filter and ControlValueAccessor.',
  'Área de texto multilínea con ControlValueAccessor, auto-resize y conteo de caracteres.':
    'Multiline text area with ControlValueAccessor, auto-resize and character count.',
  'Casilla con ControlValueAccessor en modo binario o de lista de valores.':
    'Checkbox with ControlValueAccessor in binary or value-list mode.',
  'Selección única con un grupo (CbRadioGroup) que actúa como ControlValueAccessor.':
    'Single selection with a group (CbRadioGroup) acting as ControlValueAccessor.',
  'Switch booleano con ControlValueAccessor y role="switch" para accesibilidad.':
    'Boolean switch with ControlValueAccessor and role="switch" for accessibility.',
  'Campo numérico con botones de paso, formato por locale/moneda y ControlValueAccessor.':
    'Numeric field with step buttons, locale/currency formatting and ControlValueAccessor.',
  'Campo de texto con sugerencias en overlay. El filtrado lo resuelve tu app vía (complete).':
    'Text field with overlay suggestions. Your app resolves filtering via (complete).',
  'Selector de fecha con calendario en overlay, navegación por teclado y ControlValueAccessor.':
    'Date picker with overlay calendar, keyboard navigation and ControlValueAccessor.',
  'Modal sobre CDK Overlay con trampa de foco, bloqueo de scroll, cierre con Escape/backdrop y restauración de foco.':
    'Modal on CDK Overlay with focus trap, scroll lock, Escape/backdrop close and focus restoration.',
  'Notificaciones no intrusivas con auto-cierre, gestionadas por CbToastService (signals).':
    'Non-intrusive auto-dismiss notifications, managed by CbToastService (signals).',
  'Agrupa un control con addons (texto o icono) y botones, uniéndolos visualmente.':
    'Groups a control with addons (text or icon) and buttons, joining them visually.',
  'Valoración con estrellas. ControlValueAccessor, teclado (flechas, Home/End) y vista previa al pasar el cursor.':
    'Star rating. ControlValueAccessor, keyboard (arrows, Home/End) and hover preview.',
  'Control deslizante con arrastre de puntero y teclado (flechas, PageUp/Down, Home/End). ControlValueAccessor.':
    'Slider with pointer drag and keyboard (arrows, PageUp/Down, Home/End). ControlValueAccessor.',
  'Entrada de etiquetas: Enter o coma añade; Backspace borra la última. ControlValueAccessor (string[]).':
    'Tag input: Enter or comma adds; Backspace removes the last. ControlValueAccessor (string[]).',
  'Selección múltiple en overlay con casillas, filtro y seleccionar-todo. ControlValueAccessor (array).':
    'Overlay multi-selection with checkboxes, filter and select-all. ControlValueAccessor (array).',
  'Selector de color en overlay: área saturación/valor, barra de matiz, hex y presets. ControlValueAccessor (hex).':
    'Overlay color picker: saturation/value area, hue bar, hex and presets. ControlValueAccessor (hex).',
  'Indicador compacto de conteo o estado.': 'Compact count or status indicator.',
  'Etiqueta para categorizar o marcar estado, con icono opcional.':
    'Label to categorize or mark status, with an optional icon.',
  'Mensaje inline con severidad, icono y cierre opcional.':
    'Inline message with severity, icon and optional dismiss.',
  'Contenedor con encabezado opcional, cuerpo y pie.':
    'Container with optional header, body and footer.',
  'Separador horizontal o vertical, con etiqueta opcional.':
    'Horizontal or vertical divider, with an optional label.',
  'Texto flotante al pasar el cursor o enfocar. Directiva [cbTooltip] sobre cualquier elemento.':
    'Floating text on hover or focus. [cbTooltip] directive on any element.',
  'Panel flotante con contenido libre, anclado a un disparador. Se cierra al hacer clic fuera o con Escape.':
    'Floating panel with free content, anchored to a trigger. Closes on outside click or Escape.',
  'Panel lateral que se desliza desde un borde. Trampa de foco, bloqueo de scroll y cierre con Escape/backdrop.':
    'Side panel that slides from an edge. Focus trap, scroll lock and Escape/backdrop close.',
  'Paneles colapsables. Por defecto solo uno abierto; multiple permite varios.':
    'Collapsible panels. By default only one open; multiple allows several.',
  'Interfaz por pestañas con navegación por teclado (flechas, Home/End).':
    'Tabbed interface with keyboard navigation (arrows, Home/End).',
  'Asistente por pasos con indicadores, pasos completados y navegación integrada.':
    'Step wizard with indicators, completed steps and built-in navigation.',
  'Imagen, iniciales o icono en círculo o cuadrado.':
    'Image, initials or icon in a circle or square.',
  'Agrupa múltiples avatares superpuestos.': 'Groups multiple overlapping avatars.',
  'Grupo de botones segmentados para elegir una o varias opciones.':
    'Segmented button group to choose one or more options.',
  'Botón de dos estados (on/off) con etiqueta e icono por estado.':
    'Two-state button (on/off) with a label and icon per state.',
  'Lista de opciones siempre visible. Simple o múltiple, con filtro.':
    'Always-visible option list. Single or multiple, with filter.',
  'Dial circular para elegir un número. Arrastre con el puntero o teclado.':
    'Circular dial to pick a number. Drag with pointer or keyboard.',
  'Tabla de datos con columnas declarativas, ordenación, paginación y selección.':
    'Data table with declarative columns, sorting, pagination and selection.',
  'Control de paginación reutilizable. first y rows son two-way.':
    'Reusable pagination control. first and rows are two-way.',
  'Barra horizontal accesible (role=\'toolbar\') para organizar acciones en inicio, centro y fin.':
    'Accessible horizontal bar (role=\'toolbar\') to organize actions at start, center and end.',
  'Rastro de navegación jerárquica. El último elemento es la página actual.':
    'Hierarchical navigation trail. The last item is the current page.',
  'Barra horizontal de navegación con submenús y soporte de teclado.':
    'Horizontal navigation bar with submenus and keyboard support.',
  'Navegación vertical con grupos que se pueden expandir.':
    'Vertical navigation with expandable groups.',
  'Menú emergente de acciones con iconos, separadores y atajos de teclado.':
    'Pop-up action menu with icons, separators and keyboard shortcuts.',
  'Menú emergente con submenús en cascada.': 'Pop-up menu with cascading submenus.',
  'Menú de acciones situado en el punto donde se hace clic derecho.':
    'Action menu placed where the right-click occurs.',
  'Navegación por categorías con enlaces organizados en columnas.':
    'Category navigation with links organized in columns.',
  'Navegación entre secciones con el elemento actual resaltado.':
    'Section navigation with the current item highlighted.',
  'Barra de progreso determinada o indeterminada.':
    'Determinate or indeterminate progress bar.',
  'Indicador de carga circular.': 'Circular loading indicator.',
  'Marcador de posición animado mientras cargan los datos.':
    'Animated placeholder while data loads.',
  'Barra de métricas proporcional multisegmento con leyenda.':
    'Proportional multi-segment metrics bar with legend.',
  'Bloquea temporalmente un contenedor con una máscara accesible.':
    'Temporarily blocks a container with an accessible mask.',
  'Muestra un spinner y bloquea la interacción (aria-busy).':
    'Shows a spinner and blocks interaction (aria-busy).',
  'Botón flotante que aparece al superar un umbral de desplazamiento para volver rápidamente al inicio.':
    'Floating button that appears past a scroll threshold to quickly return to the top.',
  'Contenedor de desplazamiento accesible con barras estilizadas mediante tokens CSS.':
    'Accessible scroll container with bars styled via CSS tokens.',
  'Divide un contenedor en múltiples paneles redimensionables mediante arrastre o teclado.':
    'Splits a container into multiple resizable panels via drag or keyboard.',
  'Edición in-situ que alterna entre vista de lectura y control interactivo.':
    'In-place editing that toggles between a read view and an interactive control.',
  'Agrupador semántico basado en <fieldset> y <legend> con modo colapsable opcional.':
    'Semantic grouper based on <fieldset> and <legend> with an optional collapsible mode.',
  'Contenedor de agrupación con encabezado, cuerpo colapsable opcional y pie proyectado.':
    'Grouping container with header, optional collapsible body and projected footer.',
  'Carrusel accesible de contenido con navegación e indicadores.':
    'Accessible content carousel with navigation and indicators.',
  'Galería fotográfica con visor principal y tira de miniaturas.':
    'Photo gallery with main viewer and thumbnail strip.',
  'Componente de imagen con visor lightbox y zoom integrado.':
    'Image component with lightbox viewer and built-in zoom.',
  'Píldora compacta para etiquetas individuales con icono o botón de cierre.':
    'Compact pill for individual labels with an icon or close button.',
  'Editor de texto enriquecido ligero con barra de formato e integración CVA.':
    'Lightweight rich-text editor with a formatting bar and CVA integration.',
  'Emulador de consola interactivo con historial de comandos.':
    'Interactive console emulator with command history.',
  'Directiva [cbRipple] para efecto visual de onda al hacer clic.':
    '[cbRipple] directive for a ripple visual effect on click.',
  'Etiqueta flotante reactiva al foco y al contenido del control.':
    'Floating label reactive to focus and control content.',
  'Integra iconos informativos a la izquierda o derecha de un campo de entrada.':
    'Adds informative icons to the left or right of an input field.',
  'Combina input y botón en un mismo grupo.':
    'Combines input and button in a single group.',
  'Campo de texto con máscara de formato (9 numérico, a alfabético, * alfanumérico).':
    'Text field with a format mask (9 numeric, a alphabetic, * alphanumeric).',
  'Entrada de código de verificación en casillas individuales con avance automático.':
    'Verification-code entry in individual boxes with auto-advance.',
  'Selector desplegable con estructura jerárquica de árbol.':
    'Dropdown selector with a hierarchical tree structure.',
  'Selector multinivel en cascada para estructuras anidadas.':
    'Multi-level cascading selector for nested structures.',
  'Selector de archivos con soporte de arrastrar y soltar y lista de adjuntos.':
    'File picker with drag-and-drop support and an attachment list.',
  'Agrupa un control con addons (texto o icono) y botones.':
    'Groups a control with addons (text or icon) and buttons.',
  'Organigrama jerárquico con expansión de ramas y selección de nodos.':
    'Hierarchical org chart with branch expansion and node selection.',
  'Mensaje compacto en línea para retroalimentación inmediata de formularios.':
    'Compact inline message for immediate form feedback.',
  'Ocho severidades semánticas alineadas con la paleta del tema.':
    'Eight semantic severities aligned with the theme palette.',

  // --- PrimeNG: patrón "X para interfaces accesibles…" y "Componente X de CaribeNG." ---
  'Alert para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Alert for accessible interfaces, styled with CaribeNG tokens.',
  'Card Content para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Card Content for accessible interfaces, styled with CaribeNG tokens.',
  'Card Move para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Card Move for accessible interfaces, styled with CaribeNG tokens.',
  'Card Primary para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Card Primary for accessible interfaces, styled with CaribeNG tokens.',
  'Card Select para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Card Select for accessible interfaces, styled with CaribeNG tokens.',
  'Coachmark para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Coachmark for accessible interfaces, styled with CaribeNG tokens.',
  'Data Table para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Data Table for accessible interfaces, styled with CaribeNG tokens.',
  'Inline Alert para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Inline Alert for accessible interfaces, styled with CaribeNG tokens.',
  'Modal para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Modal for accessible interfaces, styled with CaribeNG tokens.',
  'Onboarding para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Onboarding for accessible interfaces, styled with CaribeNG tokens.',
  'Pop Over para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Pop Over for accessible interfaces, styled with CaribeNG tokens.',
  'Status para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Status for accessible interfaces, styled with CaribeNG tokens.',
  'Tracker para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Tracker for accessible interfaces, styled with CaribeNG tokens.',
  'Transaction Status para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Transaction Status for accessible interfaces, styled with CaribeNG tokens.',
  'Voucher para interfaces accesibles, con estilos basados en tokens CaribeNG.':
    'Voucher for accessible interfaces, styled with CaribeNG tokens.',
  'Componente Confirmdialog de CaribeNG.': 'CaribeNG Confirmdialog component.',
  'Componente Confirmpopup de CaribeNG.': 'CaribeNG Confirmpopup component.',
  'Componente Dataview de CaribeNG.': 'CaribeNG Dataview component.',
  'Componente Dynamicdialog de CaribeNG.': 'CaribeNG Dynamicdialog component.',
  'Componente Orderlist de CaribeNG.': 'CaribeNG Orderlist component.',
  'Componente Picklist de CaribeNG.': 'CaribeNG Picklist component.',
  'Componente Timeline de CaribeNG.': 'CaribeNG Timeline component.',
  'Componente Tree de CaribeNG.': 'CaribeNG Tree component.',
  'Componente Treetable de CaribeNG.': 'CaribeNG Treetable component.',
  'Componente Virtualscroller de CaribeNG.': 'CaribeNG Virtualscroller component.',

  // --- PrimeNG: títulos de sección cortos ---
  Básico: 'Basic',
  'Uso basico': 'Basic usage',
  Cerrable: 'Dismissible',
  Colapsable: 'Collapsible',
  'Colapsable y Pie': 'Collapsible and footer',
  Compacto: 'Compact',
  'Composición (perfil)': 'Composition (profile)',
  'Comprobante de pago': 'Payment receipt',
  'Con Preview': 'With preview',
  'Con botón': 'With button',
  'Con botón desplegable': 'With dropdown button',
  'Con etiqueta': 'With label',
  'Con filtro': 'With filter',
  'Con footer': 'With footer',
  'Con icono': 'With icon',
  'Con iconos': 'With icons',
  'Con objetos': 'With objects',
  'Con paginación': 'With pagination',
  'Con pie (footer)': 'With footer',
  'Contenido enriquecido': 'Rich content',
  'Cuenta de ahorros': 'Savings account',
  'Decimales y sufijo': 'Decimals and suffix',
  Deshabilitado: 'Disabled',
  'Deshabilitado · Reactive Forms': 'Disabled · Reactive Forms',
  'Estilos de línea': 'Line styles',
  'Facturación mensual': 'Monthly billing',
  Filtro: 'Filter',
  Formas: 'Shapes',
  'Grupo (lista de valores)': 'Group (value list)',
  Indeterminada: 'Indeterminate',
  Indeterminado: 'Indeterminate',
  Interactivo: 'Interactive',
  'Inválido y deshabilitado': 'Invalid and disabled',
  'Label y Hint': 'Label and hint',
  'Locale y primer día': 'Locale and first day',
  Moneda: 'Currency',
  'Máximo y sin duplicados': 'Max and no duplicates',
  Múltiple: 'Multiple',
  'Múltiple con filtro': 'Multiple with filter',
  'Número de estrellas': 'Number of stars',
  'Permanente y limpiar': 'Persistent and clear',
  'Pestaña deshabilitada': 'Disabled tab',
  'Plantillas de celda': 'Cell templates',
  Posiciones: 'Positions',
  'Presets personalizados': 'Custom presets',
  Producto: 'Product',
  'Punto (dot)': 'Dot',
  'Rango min/max': 'Min/max range',
  'Rango y paso': 'Range and step',
  'Redondeado (pill)': 'Rounded (pill)',
  'Registros por página': 'Rows per page',
  Severidades: 'Severities',
  'Severidades y tamaños': 'Severities and sizes',
  'Selección múltiple': 'Multiple selection',
  'Selección simple': 'Single selection',
  'Selección única': 'Single selection',
  'Sin cierre por fuera': 'No outside close',
  'Sin encabezado': 'No header',
  'Sin navegación integrada': 'No built-in navigation',
  'Solo lectura / Deshabilitado': 'Read-only / Disabled',
  'Sobre contenedor padre': 'Over parent container',
  Tipos: 'Types',
  'Validación · Reactive Forms': 'Validation · Reactive Forms',
  Variantes: 'Variants',
  'Confirmar operacion': 'Confirm operation',
  'Operacion exitosa': 'Successful operation',
  Informacion: 'Information',
  Addon: 'Addon',
  'Addons a ambos lados': 'Addons on both sides',
  'Auto-resize y contador': 'Auto-resize and counter',
  'Botones y rango': 'Buttons and range',
  'min / max / step': 'min / max / step',

  // --- PrimeNG: descripciones de sección (uso) ---
  'Abre el menú y pasa sobre una categoría para ver las opciones anidadas.':
    'Open the menu and hover a category to see nested options.',
  'Acciones rápidas que se despliegan desde un botón flotante.':
    'Quick actions that expand from a floating button.',
  'Acota el rango y el incremento.': 'Constrains the range and the increment.',
  'Activa [filter] para buscar dentro del panel.':
    'Enable [filter] to search within the panel.',
  'Activa toggleable para permitir contraer/expandir el contenido y proyecta acciones con [cb-panel-footer].':
    'Enable toggleable to allow collapsing/expanding the content and project actions with [cb-panel-footer].',
  'Addon de texto o icono antes del control.':
    'Text or icon addon before the control.',
  'Arrastra el separador central o enfócalo con Tab y usa las flechas izquierda/derecha.':
    'Drag the central divider or focus it with Tab and use the left/right arrows.',
  'Arrastra el thumb o usa las flechas.': 'Drag the thumb or use the arrows.',
  'Arrastra sobre el dial o usa las flechas.': 'Drag over the dial or use the arrows.',
  'Atajos success/info/warn/error. Coloca un <cb-toast /> una vez en la app.':
    'success/info/warn/error shortcuts. Place a <cb-toast /> once in the app.',
  'Añade cbTooltip a cualquier elemento interactivo.':
    'Add cbTooltip to any interactive element.',
  'Coloca varios cb-radio dentro de un cb-radio-group. Navega con las flechas.':
    'Place several cb-radio inside a cb-radio-group. Navigate with the arrows.',
  'Columnas con field/header; striped y ordenación por columna.':
    'Columns with field/header; striped and per-column sorting.',
  'Combina formas para prefigurar el contenido.':
    'Combine shapes to prefigure the content.',
  'Con toggleable la leyenda se convierte en un botón accesible con indicador visual.':
    'With toggleable the legend becomes an accessible button with a visual indicator.',
  'Controla la visibilidad con [(visible)].': 'Control visibility with [(visible)].',
  'Controla la visibilidad con [(visible)]. Prueba Escape o clic en el fondo.':
    'Control visibility with [(visible)]. Try Escape or a backdrop click.',
  'Controla los decimales y añade prefijo/sufijo visual.':
    'Control decimals and add a visual prefix/suffix.',
  'Desactiva el cierre por backdrop y Escape para forzar una decisión.':
    'Disable backdrop and Escape closing to force a decision.',
  'Deshabilita el control o una opción individual.':
    'Disable the control or an individual option.',
  'Deshabilita las fechas fuera de [minDate, maxDate].':
    'Disable dates outside [minDate, maxDate].',
  'Deshabilita todo el grupo o un item concreto.':
    'Disable the whole group or a specific item.',
  'Desplaza hacia abajo el contenedor para que aparezca el botón flotante en la esquina inferior derecha.':
    'Scroll the container down so the floating button appears in the bottom-right corner.',
  'El botón deshabilitado no es interactivo.':
    'The disabled button is not interactive.',
  'El contenido se proyecta dentro del botón. El evento click nativo funciona con (click).':
    'Content is projected inside the button. The native click event works with (click).',
  'El modelo es Date | null. Abre con clic o teclado (↓/Enter) y navega con las flechas.':
    'The model is Date | null. Open with click or keyboard (↓/Enter) and navigate with the arrows.',
  'El modelo es number | null. Usa las flechas del teclado para subir/bajar.':
    'The model is number | null. Use the keyboard arrows to go up/down.',
  'El modelo es un color hex. Arrastra en el área y el matiz, o escribe el hex.':
    'The model is a hex color. Drag in the area and the hue, or type the hex.',
  'El tamaño se define en el grupo y lo heredan los items.':
    'The size is set on the group and inherited by the items.',
  'El índice activo se puede enlazar con [(activeIndex)].':
    'The active index can be bound with [(activeIndex)].',
  'Enlázalo con Angular Forms o two-way binding.':
    'Bind it with Angular Forms or two-way binding.',
  'Enlázalo con two-way binding o con Angular Forms.':
    'Bind it with two-way binding or Angular Forms.',
  "Escribe 'help', 'date' o 'clear' y pulsa Enter.":
    "Type 'help', 'date' or 'clear' and press Enter.",
  'Escribe para disparar (complete); actualiza suggestions con el resultado filtrado.':
    'Type to trigger (complete); update suggestions with the filtered result.',
  'Escribe y pulsa Enter (o coma) para crear una etiqueta.':
    'Type and press Enter (or comma) to create a tag.',
  'Estado visual intermedio (aria-checked="mixed") para selecciones parciales.':
    'Intermediate visual state (aria-checked="mixed") for partial selections.',
  'Estados, errores y aria se sincronizan con el FormControl.':
    'States, errors and aria stay in sync with the FormControl.',
  'Etiqueta asociada y texto de ayuda accesible (aria-describedby).':
    'Associated label and accessible help text (aria-describedby).',
  'Expande los nodos para recorrer la estructura y selecciona una tarjeta.':
    'Expand the nodes to traverse the structure and select a card.',
  'Haz clic derecho dentro de la superficie; Escape o un clic fuera cierra el menú.':
    'Right-click inside the surface; Escape or an outside click closes the menu.',
  'Haz clic en una estrella; vuelve a hacer clic en la misma para limpiar.':
    'Click a star; click the same one again to clear.',
  'Implementa ControlValueAccessor: estados, errores y aria se sincronizan con el FormControl.':
    'Implements ControlValueAccessor: states, errors and aria stay in sync with the FormControl.',
  'Integra ControlValueAccessor: estados y errores sincronizados.':
    'Integrates ControlValueAccessor: states and errors in sync.',
  'La orientación también puede ser top, left o right.':
    'The orientation can also be top, left or right.',
  'Lanzador compacto de acciones con orientación configurable.':
    'Compact action launcher with configurable orientation.',
  'Lista simple de strings. Usa teclado: ↑ ↓ Enter Esc.':
    'Simple string list. Use the keyboard: ↑ ↓ Enter Esc.',
  'Llama a toggle($event) desde el disparador.':
    'Call toggle($event) from the trigger.',
  'Modo binario: el modelo es un boolean.':
    'Binary mode: the model is a boolean.',
  'Proyecta acciones con el atributo cb-card-footer.':
    'Project actions with the cb-card-footer attribute.',
  'Proyecta acciones con el atributo cb-dialog-footer.':
    'Project actions with the cb-dialog-footer attribute.',
  'Pulsa el botón para abrir el menú; Escape o un clic fuera lo cierra.':
    'Press the button to open the menu; Escape or an outside click closes it.',
  'Pulsa el botón para desplegar acciones; elegir una acción cierra el menú.':
    'Press the button to expand actions; choosing an action closes the menu.',
  'Pulsa una categoría para abrir o cerrar sus grupos.':
    'Press a category to open or close its groups.',
  'Respeta setDisabledState de Angular Forms.':
    'Respects setDisabledState from Angular Forms.',
  'Selecciona un paso para actualizar el índice actual.':
    'Select a step to update the current index.',
  'Si el modelo enlazado es un array, cada checkbox añade o quita su value.':
    'If the bound model is an array, each checkbox adds or removes its value.',
  'Usa cbTableCell con el nombre del field. La plantilla recibe la fila, su valor y la columna.':
    'Use cbTableCell with the field name. The template receives the row, its value and the column.',
  'Usa las flechas para recorrer la barra y abrir un submenú.':
    'Use the arrows to move along the bar and open a submenu.',
  'Usa los botones Atrás/Siguiente o haz clic en un indicador.':
    'Use the Back/Next buttons or click an indicator.',
  'Tres tamaños: sm, md (por defecto) y lg.':
    'Three sizes: sm, md (default) and lg.',
  'autoResize crece con el contenido; maxlength muestra un contador.':
    'autoResize grows with the content; maxlength shows a counter.',
  'closable muestra un botón para descartar; emite (closed).':
    'closable shows a dismiss button; it emits (closed).',
  'dropdown muestra un botón que despliega todas las sugerencias actuales.':
    'dropdown shows a button that reveals all current suggestions.',
  'filter añade un buscador en el panel.': 'filter adds a search box in the panel.',
  'forceSelection (por defecto) revierte el texto si no coincide con una opción.':
    'forceSelection (default) reverts the text if it does not match an option.',
  'life=0 no se auto-cierra. clear() cierra todos.':
    'life=0 does not auto-dismiss. clear() closes all.',
  'locale cambia nombres/formato; firstDayOfWeek=1 inicia la semana en lunes.':
    'locale changes names/format; firstDayOfWeek=1 starts the week on Monday.',
  'max limita la cantidad; por defecto no se permiten repetidos.':
    'max limits the amount; by default duplicates are not allowed.',
  'min/max/step a medida.': 'custom min/max/step.',
  'mode="currency" con el código ISO y el locale deseados.':
    'mode="currency" with the desired ISO code and locale.',
  'multiple deja abiertos varios paneles a la vez.':
    'multiple keeps several panels open at once.',
  'multiple permite mantener abiertos varios grupos.':
    'multiple allows keeping several groups open.',
  'optionLabel y optionValue para listas de objetos.':
    'optionLabel and optionValue for object lists.',
  'optionLabel/optionValue para objetos.': 'optionLabel/optionValue for objects.',
  'orientation="horizontal" dispone los items en fila.':
    'orientation="horizontal" lays out the items in a row.',
  'presets define los colores rápidos; [] los oculta.':
    'presets defines the quick colors; [] hides them.',
  'rowsPerPageOptions añade el selector.': 'rowsPerPageOptions adds the selector.',
  'showButtons añade el spinner; min/max/step acotan el valor.':
    'showButtons adds the spinner; min/max/step bound the value.',
  'showNav=false para controlar los pasos desde tu propia UI.':
    'showNav=false to drive the steps from your own UI.',
  'showValue oculta el texto del hex en el trigger.':
    'showValue hides the hex text in the trigger.',
  'sm, md (por defecto) y lg.': 'sm, md (default) and lg.',
  'solid (por defecto), outlined y text.': 'solid (default), outlined and text.',
  'value=null anima sin un valor fijo.': 'value=null animates without a fixed value.',
  'Esta acción no se puede deshacer': 'This action cannot be undone',
  'Indicador interactivo del avance en un flujo de varios pasos.':
    'Interactive indicator of progress through a multi-step flow.',
  'Iniciales, icono o imagen.': 'Initials, icon or image.',
  'Sin texto, útil como indicador de estado.':
    'No text, useful as a status indicator.',
  'selectionMode + [(selection)]; usa dataKey para identidad.':
    'selectionMode + [(selection)]; use dataKey for identity.',

  // --- Playground (pilotos button / switch) ---
  'Ajusta las propiedades y observa el componente en vivo.':
    'Adjust the properties and watch the component live.',
  'Color e intención semántica del botón.':
    'Color and semantic intent of the button.',
  'Estilo visual del botón.': 'Visual style of the button.',
  'Tamaño del botón.': 'Button size.',
  'Atributo type nativo del botón.': 'Native type attribute of the button.',
  'Deshabilita el botón.': 'Disables the button.',
  'Muestra un spinner y bloquea la interacción.':
    'Shows a spinner and blocks interaction.',
  'Ocupa todo el ancho disponible.': 'Takes the full available width.',
  'Coloca la etiqueta a la izquierda.': 'Places the label on the left.',
  'Marca el control como requerido (aria-required).':
    'Marks the control as required (aria-required).',
  'Id del input; se genera uno estable si no se provee.':
    'Input id; a stable one is generated if not provided.',
  'Emite el nuevo estado al cambiar.': 'Emits the new state on change.',

  // --- Títulos de sección, categorías, ejemplos y API del playground ---
  'Paneles': 'Panels',
  'Importación': 'Import',
  'Usa IntersectionObserver con degradación elegante en entornos sin soporte.':
    'Uses IntersectionObserver with graceful degradation where it is not supported.',
  'Animación en entrada al viewport': 'Animate on entering the viewport',
  'Varios': 'Misc',
  'Formulario': 'Form',
  'Puedes pasar un booleano a [cbAutoFocus] para controlar si el enfoque automático está activo.':
    'You can pass a boolean to [cbAutoFocus] to control whether autofocus is active.',
  'Campo con enfoque inicial': 'Field with initial focus',
  'Multimedia': 'Media',
  'Mensajes': 'Messages',
  'Menús': 'Menus',
  'Severidad': 'Severity',
  'Cargando': 'Loading',
  'Barra de herramientas': 'Toolbar',
  'Con pie de página': 'With footer',
  'Componentes standalone con ChangeDetectionStrategy.OnPush.':
    'Standalone components with ChangeDetectionStrategy.OnPush.',
  'Paleta esmeralda adaptable sin dependencias externas.':
    'Adaptive emerald palette with no external dependencies.',
  'Navegación por teclado y roles ARIA en todo el catálogo.':
    'Keyboard navigation and ARIA roles across the whole catalog.',
  'Alterna entre barras, líneas y anillo usando el mismo dataset reactivo.':
    'Switches between bars, lines and doughnut using the same reactive dataset.',
  'Gráfico interactivo multimodo': 'Interactive multi-mode chart',
  'Datos y multimedia': 'Data & Media',
  'Fundamentos': 'Foundations',
  'Plantillas': 'Templates',
  'Shell de panel de administración: navbar superior, sidebar de navegación, tarjetas de métricas y tabla de actividad. Composición completa con componentes CaribeNG.':
    'Admin dashboard shell: top navbar, navigation sidebar, metric cards and activity table. A complete composition built with CaribeNG components.',
  'Vista previa': 'Preview',
  'Vista adaptable': 'Adaptive view',
  'Datos': 'Data',
  'Permite varios paneles abiertos a la vez.': 'Allows several panels to be open at the same time.',
  'Valor seleccionado (two-way opcional fuera de Angular Forms).':
    'Selected value (optional two-way binding outside Angular Forms).',
  'Sugerencias a mostrar (las provee y filtra el consumidor).':
    'Suggestions to show (provided and filtered by the consumer).',
  'Caracteres mínimos para disparar `complete`.': 'Minimum characters to trigger `complete`.',
  'Debounce (ms) antes de emitir `complete`.': 'Debounce (ms) before emitting `complete`.',
  'Exige elegir una opción de la lista (si no, al salir se limpia).':
    'Requires picking an option from the list (otherwise it is cleared on blur).',
  'Muestra un botón para desplegar todas las sugerencias.':
    'Shows a button to expand all suggestions.',
  'Emite el texto de búsqueda para que el consumidor filtre.':
    'Emits the search text so the consumer can filter.',
  'Emite la opción elegida.': 'Emits the chosen option.',
  'URL de la imagen.': 'Image URL.',
  'Iniciales o texto corto (si no hay imagen ni icono).':
    'Initials or short text (when there is no image or icon).',
  'Icono (nombre del set de iconos).': 'Icon (name from the icon set).',
  'Tamaño: `sm` (28) · `md` (40) · `lg` (56) · `xl` (80) o un número en px.':
    'Size: `sm` (28) · `md` (40) · `lg` (56) · `xl` (80) or a number in px.',
  'Forma.': 'Shape.',
  'Color de fondo cuando se muestran iniciales/icono.':
    'Background color when initials/icon are shown.',
  'Nombre accesible.': 'Accessible name.',
  'Contenido (conteo o texto breve).': 'Content (count or short text).',
  'Severidad semántica (color).': 'Semantic severity (color).',
  'Tamaño.': 'Size.',
  'Muestra solo un punto (sin texto).': 'Shows only a dot (no text).',
  'Icono separador entre elementos.': 'Separator icon between items.',
  'Se emite al hacer clic en un elemento con enlace.':
    'Emitted when an item with a link is clicked.',
  'Variante visual.': 'Visual variant.',
  'Tipo nativo del botón.': 'Native button type.',
  'Dirección del grupo.': 'Group direction.',
  'Etiqueta accesible del grupo.': 'Accessible label of the group.',
  'Subtítulo bajo el título.': 'Subtitle below the title.',
  'Etiqueta mostrada junto al control.': 'Label shown next to the control.',
  '`aria-label` cuando no hay `label` visible.': '`aria-label` when there is no visible `label`.',
  'Valor que aporta a la lista cuando el modelo enlazado es un array.':
    'Value added to the list when the bound model is an array.',
  'Estado indeterminado (visual + `aria-checked="mixed"`).':
    'Indeterminate state (visual + `aria-checked="mixed"`).',
  'Marca visual y ARIA de estado inválido.': 'Visual and ARIA invalid state.',
  'Requerido.': 'Required.',
  'Deshabilitado de forma declarativa (se combina con Angular Forms).':
    'Declarative disabled state (combined with Angular Forms).',
  'Máximo de chips (0 = sin límite).': 'Maximum number of chips (0 = unlimited).',
  'Permite valores repetidos.': 'Allows duplicate values.',
  'Color seleccionado (hex `#rrggbb`). Two-way opcional fuera de Forms.':
    'Selected color (hex `#rrggbb`). Optional two-way binding outside Forms.',
  'Muestra el texto del hex junto al swatch del trigger.':
    'Shows the hex text next to the trigger swatch.',
  'Colores predefinidos; `[]` los oculta.': 'Preset colors; `[]` hides them.',
  'Fecha seleccionada (two-way opcional fuera de Angular Forms).':
    'Selected date (optional two-way binding outside Angular Forms).',
  'Locale BCP 47 para nombres y formato (por defecto el del navegador).':
    'BCP 47 locale for names and format (defaults to the browser locale).',
  'Primer día de la semana: 0 = domingo (por defecto), 1 = lunes.':
    'First day of the week: 0 = Sunday (default), 1 = Monday.',
  'Fecha mínima seleccionable.': 'Minimum selectable date.',
  'Fecha máxima seleccionable.': 'Maximum selectable date.',
  'Visibilidad del diálogo (two-way).': 'Dialog visibility (two-way).',
  'Título del encabezado. Si se omite, usa `ariaLabel`.':
    'Header title. If omitted, `ariaLabel` is used.',
  'Muestra el botón de cerrar (✕).': 'Shows the close button (✕).',
  'Cierra al hacer clic en el backdrop.': 'Closes when the backdrop is clicked.',
  'Cierra con la tecla Escape.': 'Closes with the Escape key.',
  'Ancho del panel.': 'Panel width.',
  'Nombre accesible cuando no hay `header`.': 'Accessible name when there is no `header`.',
  'Se emite cuando el diálogo se cierra.': 'Emitted when the dialog closes.',
  'Se emite cuando el diálogo se abre.': 'Emitted when the dialog opens.',
  'Posición de la etiqueta (solo horizontal).': 'Label position (horizontal only).',
  'Estilo de la línea.': 'Line style.',
  'Número de puntos.': 'Number of dots.',
  'Índice activo (two-way).': 'Active index (two-way).',
  'Título de la cabecera.': 'Header title.',
  'Estado abierto/cerrado (two-way).': 'Open/closed state (two-way).',
  'Etiqueta accesible del botón flotante.': 'Accessible label of the floating button.',
  'Estado desplegado (two-way).': 'Expanded state (two-way).',
  'Emite la acción seleccionada.': 'Emits the selected action.',
  'Texto de la leyenda del fieldset.': 'Fieldset legend text.',
  'Si es true, la leyenda funciona como botón para colapsar/expandir.':
    'When true, the legend works as a button to collapse/expand.',
  'Estado colapsado (`[(collapsed)]`).': 'Collapsed state (`[(collapsed)]`).',
  'Opciones del menú.': 'Menu options.',
  'Id de la opción activa.': 'Id of the active option.',
  'Emite la opción seleccionada.': 'Emits the selected option.',
  'Texto de copyright.': 'Copyright text.',
  'Muestra el botón de retroceso.': 'Shows the back button.',
  'Emite al pulsar retroceso.': 'Emits when back is pressed.',
  'Nombre del icono en el registro (p. ej. `chevron-down`).':
    'Icon name in the registry (e.g. `chevron-down`).',
  'Tamaño: `sm` (16) · `md` (20) · `lg` (24) · `xl` (32) o un número en px.':
    'Size: `sm` (16) · `md` (20) · `lg` (24) · `xl` (32) or a number in px.',
  'Anima el icono girando (útil con `loader`).': 'Spins the icon (useful with `loader`).',
  'Nombre accesible. Si se omite, el icono es decorativo (`aria-hidden`).':
    'Accessible name. If omitted, the icon is decorative (`aria-hidden`).',
  'Nombre del icono del set núcleo.': 'Icon name from the core set.',
  'Deshabilita la acción.': 'Disables the action.',
  'Emite el evento de click.': 'Emits the click event.',
  'Valor del control (two-way opcional fuera de Angular Forms).':
    'Control value (optional two-way binding outside Angular Forms).',
  'Etiqueta accesible. Si se omite, usa un `aria-label` externo.':
    'Accessible label. If omitted, an external `aria-label` is used.',
  'Texto de ayuda bajo el campo.': 'Help text below the field.',
  'Mensaje de error (se muestra cuando `invalid` es true).':
    'Error message (shown when `invalid` is true).',
  'Tipo nativo del input.': 'Native input type.',
  'Solo lectura.': 'Read-only.',
  'Marca el campo como requerido (atributo + indicador visual).':
    'Marks the field as required (attribute + visual indicator).',
  '`inputmode` para teclados móviles.': '`inputmode` for mobile keyboards.',
  'Estilo de addon "botón" (sin fondo de relleno).': '"Button" addon style (no fill background).',
  'Patrón de máscara: `9` para números, `a` para letras, `*` alfanumérico.':
    'Mask pattern: `9` for digits, `a` for letters, `*` for alphanumeric.',
  'Si es true, el valor del modelo excluye los literales de la máscara.':
    'When true, the model value excludes the mask literals.',
  'Valor numérico (two-way opcional fuera de Angular Forms).':
    'Numeric value (optional two-way binding outside Angular Forms).',
  'Valor mínimo permitido.': 'Minimum allowed value.',
  'Valor máximo permitido.': 'Maximum allowed value.',
  'Incremento de los botones y de las flechas.': 'Step for the buttons and arrow keys.',
  'Muestra los botones de incremento/decremento.': 'Shows the increment/decrement buttons.',
  '\'decimal\' (por defecto) o \'currency\'.': '\'decimal\' (default) or \'currency\'.',
  'Código ISO de moneda cuando mode=\'currency\' (p. ej. \'USD\', \'COP\', \'EUR\').':
    'ISO currency code when mode=\'currency\' (e.g. \'USD\', \'COP\', \'EUR\').',
  'Locale BCP 47 para el formato (por defecto el del navegador).':
    'BCP 47 locale for formatting (defaults to the browser locale).',
  'Agrupación de miles.': 'Thousands grouping.',
  'Mínimo de decimales.': 'Minimum fraction digits.',
  'Máximo de decimales.': 'Maximum fraction digits.',
  'Texto antepuesto (solo visual, cuando no está enfocado).':
    'Prefix text (visual only, when not focused).',
  'Texto pospuesto (solo visual, cuando no está enfocado).':
    'Suffix text (visual only, when not focused).',
  'Sufijo del texto central (p. ej. `%`).': 'Suffix of the center text (e.g. `%`).',
  'Destino del enlace.': 'Link target.',
  'Texto del enlace (alternativa a proyectar contenido).':
    'Link text (alternative to projected content).',
  'Abre en una pestaña nueva y añade indicador visual.':
    'Opens in a new tab and adds a visual indicator.',
  'Deshabilita la navegación y atenúa el enlace.': 'Disables navigation and dims the link.',
  'Muestra el botón de cerrar.': 'Shows the close button.',
  'Icono (sobrescribe el de la severidad); `\'\'` para ocultarlo.':
    'Icon (overrides the severity icon); `\'\'` hides it.',
  'Visibilidad (two-way).': 'Visibility (two-way).',
  'Se emite al cerrar.': 'Emitted on close.',
  'Nº máx. de etiquetas antes de mostrar "N seleccionados".':
    'Max number of labels before showing "N selected".',
  'Título del panel.': 'Panel title.',
  'Lado de aparición.': 'Side it slides in from.',
  'Máximo de enlaces de página numerados visibles.':
    'Maximum number of visible numbered page links.',
  'Título mostrado en la cabecera del panel.': 'Title shown in the panel header.',
  'Permite contraer/expandir el contenido desde la cabecera.':
    'Allows collapsing/expanding the content from the header.',
  'Estado colapsado (soporta two-way binding `[(collapsed)]`).':
    'Collapsed state (supports two-way binding `[(collapsed)]`).',
  'Emitido después de alternar el estado colapsado.': 'Emitted after toggling the collapsed state.',
  'Cierra al hacer clic fuera.': 'Closes on outside click.',
  'Nombre accesible del panel.': 'Accessible name of the panel.',
  'Valor actual (0–100).': 'Current value (0–100).',
  'Etiqueta mostrada sobre la barra.': 'Label shown above the bar.',
  'Valor 0–100. `null` activa el modo indeterminado.':
    'Value 0–100. `null` enables indeterminate mode.',
  'Muestra el porcentaje a la derecha.': 'Shows the percentage on the right.',
  'Valor que representa este radio.': 'Value this radio represents.',
  'Deshabilita solo este radio (además del grupo).':
    'Disables only this radio (in addition to the group).',
  '`aria-label` del grupo (recomendado para accesibilidad).':
    'Group `aria-label` (recommended for accessibility).',
  'Nombre compartido por los radios nativos; se genera uno si se omite.':
    'Name shared by the native radios; one is generated if omitted.',
  'Tamaño aplicado a los radios hijos.': 'Size applied to the child radios.',
  'Disposición de los items.': 'Layout of the items.',
  'Deshabilita todo el grupo.': 'Disables the whole group.',
  'Emite el nuevo valor seleccionado.': 'Emits the new selected value.',
  'Número de estrellas.': 'Number of stars.',
  'Solo lectura (no editable, pero muestra el valor).':
    'Read-only (not editable, but shows the value).',
  'Deshabilitado declarativo (se combina con Angular Forms).':
    'Declarative disabled state (combined with Angular Forms).',
  'Etiqueta accesible del control.': 'Accessible label of the control.',
  'Id (reservado para uso futuro / asociación de label externa).':
    'Id (reserved for future use / external label association).',
  'Emite el nuevo valor al cambiar.': 'Emits the new value on change.',
  'Ancho CSS del contenedor (ej. `\'100%\'`, `\'320px\'`).':
    'Container CSS width (e.g. `\'100%\'`, `\'320px\'`).',
  'Alto CSS del contenedor (ej. `\'200px\'`).': 'Container CSS height (e.g. `\'200px\'`).',
  'Etiqueta accesible para la región con scroll.': 'Accessible label for the scrollable region.',
  'Elemento cuyo desplazamiento se escucha: `\'window\'` o `\'parent\'`.':
    'Element whose scroll is listened to: `\'window\'` or `\'parent\'`.',
  'Píxeles desplazados a partir de los cuales se muestra el botón.':
    'Scrolled pixels after which the button is shown.',
  'Comportamiento del scroll al volver arriba.': 'Scroll behavior when going back to top.',
  'Nombre del icono de `<cb-icon>`.': '`<cb-icon>` icon name.',
  'Etiqueta accesible para el botón.': 'Accessible label for the button.',
  'Texto del acceso directo.': 'Shortcut text.',
  'Icono del set núcleo.': 'Icon from the core set.',
  'Deshabilita el acceso.': 'Disables the shortcut.',
  'Emite al activar el acceso.': 'Emits when the shortcut is activated.',
  'Ancho CSS (p. ej. `100%`, `12rem`).': 'CSS width (e.g. `100%`, `12rem`).',
  'Alto CSS. En `circle` se iguala al ancho.': 'CSS height. In `circle` it matches the width.',
  'Tamaño en píxeles.': 'Size in pixels.',
  'Grosor del trazo.': 'Stroke width.',
  'Orientación de la división: `\'horizontal\'` (lado a lado) o `\'vertical\'` (apilados).':
    'Split orientation: `\'horizontal\'` (side by side) or `\'vertical\'` (stacked).',
  'Grosor del separador en píxeles.': 'Gutter thickness in pixels.',
  'Paso porcentual al redimensionar con teclado.':
    'Percentage step when resizing with the keyboard.',
  'Tamaño inicial del panel en porcentaje (0–100).': 'Initial panel size as a percentage (0–100).',
  'Tamaño mínimo permitido en porcentaje (0–100).': 'Minimum allowed size as a percentage (0–100).',
  'Emitido al finalizar un ajuste de tamaño.': 'Emitted when a resize ends.',
  'Paso actual (1-based).': 'Current step (1-based).',
  'Número total de pasos.': 'Total number of steps.',
  'Leyenda del paso actual.': 'Caption of the current step.',
  'Muestra los botones Atrás/Siguiente integrados.': 'Shows the built-in Back/Next buttons.',
  'Etiqueta visible junto al control.': 'Visible label next to the control.',
  'Coloca la etiqueta a la izquierda del control.': 'Places the label on the left of the control.',
  'Marca el control como requerido (`aria-required`).':
    'Marks the control as required (`aria-required`).',
  'Estado del switch (two-way: `[(checked)]`).': 'Switch state (two-way: `[(checked)]`).',
  'Esquinas totalmente redondeadas (pill).': 'Fully rounded corners (pill).',
  'Texto del tag.': 'Tag text.',
  'Estado seleccionado (two-way: `[(selected)]`).': 'Selected state (two-way: `[(selected)]`).',
  'Emite el nuevo estado al pulsar.': 'Emits the new state when pressed.',
  'Número de filas inicial.': 'Initial number of rows.',
  'Crece automáticamente con el contenido (ignora el scroll vertical).':
    'Grows automatically with the content (ignores vertical scroll).',
  'Límite de caracteres; muestra un contador cuando se define.':
    'Character limit; shows a counter when set.',
  'Id del textarea; se genera uno estable si no se provee.':
    'Textarea id; a stable one is generated if not provided.',
  'Etiqueta accesible para el contenedor `role="toolbar"`.':
    'Accessible label for the `role="toolbar"` container.',
  'Pantallas de estado estilo Atlantis: Access Denied y Error, con mensaje grande centrado sobre fondo oscuro y botón de regreso.':
    'Atlantis-style status screens: Access Denied and Error, with a large centered message on a dark background and a back button.',
  'Acceso denegado': 'Access denied',
  '404 · No encontrada': '404 · Not found',
  'Mantenimiento': 'Maintenance',
  'Preguntas frecuentes': 'Frequently asked questions',
  'Acciones rápidas sobre una tarjeta': 'Quick actions on a card',
  'Archivos': 'Files',
  'Tarjeta de categoría/almacenamiento genérica: icono con tinte, título y subtítulo, más dos valores a la derecha. Pieza base de un gestor de archivos tipo Drive.':
    'Generic category/storage card: tinted icon, title and subtitle, plus two values on the right. The building block of a Drive-like file manager.',
  'Icono con color, título + subtítulo a la izquierda y dos valores a la derecha.':
    'Colored icon, title + subtitle on the left and two values on the right.',
  'Varias file-card forman la sección \'All Media\' de un gestor de archivos.':
    'Several file-cards make up the \'All Media\' section of a file manager.',
  'Rejilla de categorías': 'Category grid',
  'Gestor de archivos tipo Drive compuesto con cb-file-card y cb-folder-card, más un donut de almacenamiento y una tabla de archivos recientes.':
    'Drive-like file manager composed with cb-file-card and cb-folder-card, plus a storage donut and a recent files table.',
  'Navegación con vistas': 'Navigation with views',
  'Pulsa Tab dentro del recuadro para comprobar cómo el foco cicla entre sus elementos.':
    'Press Tab inside the box to see how focus cycles through its elements.',
  'Contenedor con foco confinado': 'Container with trapped focus',
  'Tarjeta de carpeta genérica: icono de carpeta, nombre y una fila con número de archivos y tamaño. Proyecta un menú de acciones por [cb-folder-actions].':
    'Generic folder card: folder icon, name and a row with file count and size. Projects an actions menu through [cb-folder-actions].',
  'Nombre, número de archivos y tamaño. Un botón de acciones proyectado en la esquina.':
    'Name, file count and size. An actions button projected in the corner.',
  'Varias folder-card forman la sección \'All Folders\' de un gestor de archivos.':
    'Several folder-cards make up the \'All Folders\' section of a file manager.',
  'Rejilla de carpetas': 'Folder grid',
  'Recuperar contraseña con layout dividido estilo Atlantis: ingresa el correo para recibir el enlace de restablecimiento.':
    'Atlantis-style split-layout password recovery: enter your email to receive the reset link.',
  'App header con acciones': 'App header with actions',
  'Camiseta verde': 'Green t-shirt',
  'Control de juego': 'Game controller',
  'Mini altavoces': 'Mini speakers',
  'Factura / recibo imprimible: encabezado con empresa y datos, destinatario, tabla de conceptos y totales. Composición con componentes CaribeNG.':
    'Printable invoice/receipt: header with company details, recipient, line items table and totals. Composed with CaribeNG components.',
  'Bloqueo de pantalla con layout dividido estilo Atlantis: avatar del usuario y contraseña para desbloquear.':
    'Atlantis-style split-layout lock screen: user avatar and password to unlock.',
  'Inicio de sesión con layout dividido (imagen + panel oscuro), estilo Atlantis. Hecho con componentes CaribeNG y Reactive Forms.':
    'Split-layout sign-in (image + dark panel), Atlantis style. Built with CaribeNG components and Reactive Forms.',
  'Soporta versión horizontal completa, isotipo (escudo Angular-Caribe para favicons y barras compactas), vertical apilada y monocromática.':
    'Supports the full horizontal version, the isotype (Angular-Caribe shield for favicons and compact bars), stacked vertical and monochrome.',
  'Formatos del Logo Corporativo': 'Corporate logo formats',
  'Versión Negativa (Fondos Oscuros)': 'Negative version (dark backgrounds)',
  'Identidad corporativa vectorial de CaribeNG en múltiples formatos (Horizontal, Isotipo/Escudo, Vertical, Monocromático y Negativo), inspirada en PrimeNG y NG-ZORRO.':
    'CaribeNG vector corporate identity in multiple formats (Horizontal, Isotype/Shield, Vertical, Monochrome and Negative), inspired by PrimeNG and NG-ZORRO.',
  'Barra de navegación de aplicación: marca, menú principal con submenú desplegable (cb-menubar), búsqueda, notificaciones, CTA y avatar. Responsive.':
    'Application navigation bar: brand, main menu with dropdown submenu (cb-menubar), search, notifications, CTA and avatar. Responsive.',
  'Panel de filtros': 'Filters panel',
  'Escribe para evaluar la complejidad de la contraseña en tiempo real.':
    'Type to evaluate the password strength in real time.',
  'Con medidor de fortaleza y máscara': 'With strength meter and mask',
  'Para diseñadores y freelancers.': 'For designers and freelancers.',
  'Para proyectos comerciales.': 'For commercial projects.',
  'Para equipos de más de 5 personas.': 'For teams of more than 5 people.',
  'Tabla de precios genérica y data-driven: selector Mensual/Anual opcional, planes con características, plan destacado y evento al elegir.':
    'Generic, data-driven pricing table: optional Monthly/Yearly switch, plans with features, highlighted plan and an event when choosing.',
  'Pasa los planes y enlaza billing con two-way binding para el selector Mensual/Anual.':
    'Pass the plans and bind billing with two-way binding for the Monthly/Yearly switch.',
  'layout="horizontal" dispone cada plan como una fila: cabecera y precio a la izquierda, características en el centro y CTA a la derecha.':
    'layout="horizontal" lays out each plan as a row: header and price on the left, features in the middle and CTA on the right.',
  'Con showToggle=false se ocultan Mensual/Anual y se muestran los precios mensuales.':
    'With showToggle=false the Monthly/Yearly switch is hidden and monthly prices are shown.',
  'Sin selector': 'Without switch',
  'Página de precios lista para copiar, construida con el componente genérico cb-pricing: toggle Mensual/Anual, planes y plan destacado.':
    'Copy-ready pricing page built with the generic cb-pricing component: Monthly/Yearly toggle, plans and highlighted plan.',
  'Registro con layout dividido estilo Atlantis: usuario, correo, contraseña y aceptación de términos. Con componentes CaribeNG y Reactive Forms.':
    'Atlantis-style split-layout sign-up: username, email, password and terms acceptance. With CaribeNG components and Reactive Forms.',
  'Establecer una nueva contraseña (tras el enlace de recuperación), con layout dividido estilo Atlantis y validación de confirmación.':
    'Set a new password (after the recovery link), with an Atlantis-style split layout and confirmation validation.',
  'Panel de accesos rápidos': 'Quick access panel',
  'Flujo de transferencia': 'Transfer flow',
  'Haz clic en el botón para alternar la clase sobre el elemento @next.':
    'Click the button to toggle the class on the @next element.',
  'Alternar visibilidad sin código TypeScript': 'Toggle visibility without TypeScript code',
  'Tabla de datos con columnas declarativas, ordenación, paginación, selección y celdas personalizadas (avatares, estados y acciones).':
    'Data table with declarative columns, sorting, pagination, selection and custom cells (avatars, statuses and actions).',
  'Celda de usuario con cb-avatar (imagen/iniciales) + nombre y correo, y estado con cb-tag coloreado por severidad.':
    'User cell with cb-avatar (image/initials) + name and email, and a status with cb-tag colored by severity.',
  'Columna de acciones con cb-icon-button (ver / editar / eliminar) usando plantilla de celda.':
    'Actions column with cb-icon-button (view / edit / delete) using a cell template.',
  'Tabla con cabecera (título, contador, búsqueda y acción), avatares, estados, acciones y paginación. Composición lista para producción.':
    'Table with a header (title, counter, search and action), avatars, statuses, actions and pagination. A production-ready composition.',
  'Con avatares y estados': 'With avatars and statuses',
  'Con acciones (botones de icono)': 'With actions (icon buttons)',
  'Completo (PRO) · con header/toolbar': 'Full (PRO) · with header/toolbar',
  'Modo oscuro': 'Dark mode',
  'Verificación en dos pasos con layout dividido estilo Atlantis: código de 6 dígitos de la app de autenticación.':
    'Atlantis-style split-layout two-step verification: 6-digit code from the authenticator app.',
  'Verificación por código de un solo uso con layout dividido estilo Atlantis: 4 dígitos, verificar o cancelar, reenviar.':
    'Atlantis-style split-layout one-time code verification: 4 digits, verify or cancel, resend.',
};
