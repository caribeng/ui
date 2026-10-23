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
  'Nombre accesible con contexto (p. ej. "3 mensajes sin leer"). Sin él, un dot es decorativo.':
    'Accessible name with context (e.g. "3 unread messages"). Without it, a dot is decorative.',
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
  'Navegación con vistas': 'Navigation with views',
  'Pulsa Tab dentro del recuadro para comprobar cómo el foco cicla entre sus elementos.':
    'Press Tab inside the box to see how focus cycles through its elements.',
  'Contenedor con foco confinado': 'Container with trapped focus',
  'Tarjeta de carpeta genérica: icono de carpeta, nombre y una fila con número de archivos y tamaño. Con actions muestra un menú ⋮ de acciones; con clickable, toda la tarjeta abre la carpeta.':
    'Generic folder card: folder icon, name and a row with file count and size. With actions it shows a ⋮ actions menu; with clickable, the whole card opens the folder.',
  'Menú de acciones': 'Actions menu',
  'actions recibe items de cb-menu (icono, disabled, separator…). El botón ⋮ abre el menú y actionSelect avisa de la acción elegida.':
    'actions takes cb-menu items (icon, disabled, separator…). The ⋮ button opens the menu and actionSelect reports the chosen action.',
  'Tarjeta pulsable': 'Clickable card',
  'Con clickable, el nombre es un botón que cubre toda la tarjeta y emite open (clic, Enter o Espacio). El botón ⋮ queda por encima y no abre la carpeta.':
    'With clickable, the name is a button that covers the whole card and emits open (click, Enter or Space). The ⋮ button sits on top and does not open the folder.',
  'Contenido propio en la esquina': 'Custom corner content',
  'Sin actions, [cb-folder-actions] proyecta cualquier contenido en la esquina (p. ej. un botón propio o un badge).':
    'Without actions, [cb-folder-actions] projects any content into the corner (e.g. your own button or a badge).',
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
  'layout="list" dispone cada plan como una fila: cabecera y precio a la izquierda, características en el centro y CTA a la derecha.':
    'layout="list" lays out each plan as a row: header and price on the left, features in the middle and CTA on the right.',
  'layout="horizontal" pone todas las tarjetas en una fila (con scroll si no caben) y el selector de facturación junto al título. En anual muestra el precio por mes con el total facturado y el ahorro (annualDisplay lo cambia). Cada característica puede llevar su icono.':
    'layout="horizontal" puts every card in one row (scrolling when they do not fit) and the billing selector next to the title. When annual it shows the price per month with the billed total and the savings (annualDisplay changes it). Each feature can have its own icon.',
  'Elige según los ingresos mensuales de tu negocio.': 'Choose based on your business monthly income.',
  'Contabilidad': 'Accounting',
  'Lista': 'List',
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

  // --- Descripciones de secciones de ejemplo ---
  'Cada cb-accordion-panel define una sección plegable; su texto de cabecera se indica con header.':
    'Each cb-accordion-panel defines a collapsible section; its header text is set with header.',
  'Mensaje destacado con título y contenido proyectado; severity define el color y el icono.':
    'Prominent message with a title and projected content; severity sets the color and icon.',
  'Con loop la animación se repite indefinidamente; size controla sus dimensiones.':
    'With loop the animation repeats indefinitely; size controls its dimensions.',
  'Cuatro tamaños con size: sm, md (por defecto), lg y xl.':
    'Four sizes with size: sm, md (default), lg and xl.',
  'severity aplica el color semántico de fondo cuando se muestran iniciales o icono.':
    'severity applies the semantic background color when initials or an icon are shown.',
  'Agrupa varios cb-avatar superpuestos, ideal para mostrar participantes.':
    'Groups several overlapping cb-avatar elements, ideal for showing participants.',
  'value acepta números o texto corto; severity define el color.':
    'value accepts numbers or short text; severity sets the color.',
  'Tres tamaños con size: sm, md (por defecto) y lg.':
    'Three sizes with size: sm, md (default) and lg.',
  'Mientras blocked es true, el contenido queda cubierto por una capa que impide interactuar con él.':
    'While blocked is true, the content is covered by a layer that prevents interaction.',
  'Se alimenta con un arreglo items; cada elemento puede tener label y url.':
    'Driven by an items array; each item can have a label and url.',
  'Añade icon a cualquier elemento para mostrar un icono junto a su texto.':
    'Add icon to any item to show an icon next to its text.',
  'Agrupa botones relacionados en una sola fila con bordes unidos.':
    'Groups related buttons in a single row with joined borders.',
  'Con ariaLabel el grupo se anuncia como barra de herramientas; aria-pressed marca la opción activa.':
    'With ariaLabel the group is announced as a toolbar; aria-pressed marks the active option.',
  'Muestra un mes completo; el día elegido se enlaza con [(selectedDay)] y monthLabel define el encabezado.':
    'Shows a full month; the chosen day is bound with [(selectedDay)] and monthLabel sets the header.',
  'Tarjeta de producto con title, subtitle y contenido proyectado.':
    'Product card with title, subtitle and projected content.',
  'header y subtitle forman la cabecera; el contenido se proyecta en el cuerpo.':
    'header and subtitle form the header; the content is projected into the body.',
  'Sin header, la tarjeta muestra solo el contenido proyectado.':
    'Without header, the card shows only the projected content.',
  'Lista de movimientos a partir del arreglo items.':
    'List of transactions built from the items array.',
  'Tarjeta principal de producto: title, subtitle y el valor destacado en value.':
    'Main product card: title, subtitle and the highlighted amount in value.',
  'Opciones seleccionables en forma de tarjeta a partir del arreglo items.':
    'Card-style selectable options built from the items array.',
  'Recorre el arreglo items con navegación por flechas e indicadores.':
    'Cycles through the items array with arrow navigation and indicators.',
  'options define una jerarquía con children; el valor final se enlaza con [(value)].':
    'options defines a hierarchy with children; the final value is bound with [(value)].',
  'invalid marca el error visual y ARIA; disabled impide la interacción.':
    'invalid sets the visual and ARIA error state; disabled prevents interaction.',
  'icon añade un icono al chip y removable muestra un botón para quitarlo.':
    'icon adds an icon to the chip and removable shows a button to remove it.',
  'Con formControl el estado de error se aplica automáticamente cuando el control es inválido y el usuario ya lo tocó.':
    'With formControl the error state is applied automatically once the control is invalid and the user has touched it.',
  'progress indica el porcentaje completado y label el texto accesible.':
    'progress sets the completed percentage and label the accessible text.',
  'Guía paso a paso que resalta elementos de la interfaz a partir del arreglo steps.':
    'Step-by-step guide that highlights interface elements from the steps array.',
  'Al deshabilitar el FormControl, el selector se bloquea automáticamente.':
    'When the FormControl is disabled, the picker is locked automatically.',
  'Diálogo de confirmación controlado con [(visible)]; header define el título.':
    'Confirmation dialog controlled with [(visible)]; header sets the title.',
  'Confirmación compacta junto al elemento que la abre, controlada con [(visible)].':
    'Compact confirmation next to the element that opens it, controlled with [(visible)].',
  'columns define las columnas y rows los datos de cada fila.':
    'columns defines the columns and rows the data of each row.',
  'Muestra el arreglo value en una vista de lista o cuadrícula.':
    'Shows the value array in a list or grid layout.',
  'Con formControl y Validators.required, el * y el mensaje de error aparecen solos; minDate limita las fechas anteriores.':
    'With formControl and Validators.required, the * and the error message appear automatically; minDate blocks earlier dates.',
  'disabled muestra el valor sin permitir cambiarlo.':
    'disabled shows the value without allowing changes.',
  'Separa contenido con una línea horizontal.': 'Separates content with a horizontal line.',
  'type cambia el estilo de la línea: solid (por defecto), dashed o dotted.':
    'type changes the line style: solid (default), dashed or dotted.',
  'Con orientation=vertical separa elementos dispuestos en fila.':
    'With orientation=vertical it separates items laid out in a row.',
  'count define el número de puntos y [(activeIndex)] el punto activo.':
    'count sets the number of dots and [(activeIndex)] the active dot.',
  'Diálogo cuyo contenido se pasa por la propiedad content; se controla con [(visible)].':
    'Dialog whose content is passed through the content property; controlled with [(visible)].',
  'Editor de texto enriquecido; el HTML resultante se enlaza con [(value)].':
    'Rich text editor; the resulting HTML is bound with [(value)].',
  'Pantalla para usuarios sin permisos, con acción para volver al inicio.':
    'Screen for users without permission, with an action to go back home.',
  'Pantalla genérica de error inesperado.': 'Generic screen for unexpected errors.',
  'Pantalla para rutas que no existen.': 'Screen for routes that do not exist.',
  'Pantalla de mantenimiento con icono animado (spin).':
    'Maintenance screen with an animated (spin) icon.',
  'title define la cabecera y expanded el estado inicial abierto.':
    'title sets the header and expanded the initial open state.',
  'Varios paneles apilados forman una sección de preguntas frecuentes.':
    'Several stacked panels make up an FAQ section.',
  'Botón flotante que despliega las acciones definidas en items.':
    'Floating button that expands the actions defined in items.',
  'Posicionado sobre una tarjeta, ofrece acciones rápidas sin ocupar espacio fijo.':
    'Placed over a card, it offers quick actions without taking up fixed space.',
  'Agrupa contenido relacionado bajo una leyenda definida con legend.':
    'Groups related content under a legend set with legend.',
  'fileName y fileSize describen el archivo que se descarga.':
    'fileName and fileSize describe the file to download.',
  'accept limita los tipos de archivo y label define el texto del botón.':
    'accept limits the file types and label sets the button text.',
  'Con multiple se pueden adjuntar varios archivos a la vez.':
    'With multiple several files can be attached at once.',
  'items define las opciones y activeId la opción resaltada.':
    'items defines the options and activeId the highlighted one.',
  'El evento select permite cambiar la vista mostrada según la opción elegida.':
    'The select event lets you switch the displayed view based on the chosen option.',
  'La etiqueta flota sobre el campo al enfocarlo o cuando tiene valor.':
    'The label floats above the field when focused or when it has a value.',
  'Pie de página institucional listo para usar.': 'Ready-to-use institutional footer.',
  'Galería de imágenes con miniaturas a partir del arreglo value.':
    'Image gallery with thumbnails from the value array.',
  'title y subtitle describen el paso; showBack muestra el botón de retroceso.':
    'title and subtitle describe the step; showBack shows the back button.',
  'Proyecta botones de icono para añadir acciones a la derecha del encabezado.':
    'Project icon buttons to add actions on the right side of the header.',
  'Botón circular solo con icono; ariaLabel es obligatorio para la accesibilidad.':
    'Icon-only circular button; ariaLabel is required for accessibility.',
  'Coloca un icono dentro del campo; iconPosition indica el lado.':
    'Places an icon inside the field; iconPosition sets the side.',
  'name selecciona la ilustración y size su tamaño.':
    'name selects the illustration and size its dimensions.',
  'Con preview, al hacer clic la imagen se abre ampliada.':
    'With preview, clicking the image opens it enlarged.',
  'Alerta dentro del flujo de contenido; status define el color y el icono.':
    'Alert inside the content flow; status sets the color and icon.',
  'Mensaje breve en línea; severity define el color.':
    'Short inline message; severity sets the color.',
  'Alterna entre un contenido de vista (cb-inplace-display) y uno editable (cb-inplace-content).':
    'Toggles between a display content (cb-inplace-display) and an editable one (cb-inplace-content).',
  'label define la etiqueta y la fecha se enlaza con [(value)].':
    'label sets the label and the date is bound with [(value)].',
  'min y max validan el rango; con formControl, el * y el mensaje de error aparecen solos.':
    'min and max validate the range; with formControl, the * and the error message appear automatically.',
  'disabled muestra el valor sin permitir editarlo, incluidos los botones.':
    'disabled shows the value without allowing edits, buttons included.',
  'El texto de búsqueda se enlaza con [(value)] para filtrar en tiempo real.':
    'The search text is bound with [(value)] to filter in real time.',
  'options define las opciones y el valor elegido se enlaza con [(value)].':
    'options defines the choices and the selected value is bound with [(value)].',
  'numInputs define el número de dígitos; unmasked muestra el valor en lugar de ocultarlo.':
    'numInputs sets the number of digits; unmasked shows the value instead of hiding it.',
  'Coloca cb-input-group-addon antes y después del campo.':
    'Place cb-input-group-addon before and after the field.',
  'mask define el patrón: 9 para dígitos, a para letras y * para alfanuméricos.':
    'mask defines the pattern: 9 for digits, a for letters and * for alphanumeric.',
  'length define el número de casillas e integerOnly admite solo números.':
    'length sets the number of boxes and integerOnly accepts digits only.',
  'severity cambia el color y size el diámetro en píxeles.':
    'severity changes the color and size the diameter in pixels.',
  'Enlace con estilo de la marca; href define el destino.':
    'Brand-styled link; href sets the target.',
  'Lista de opciones visible; el valor elegido se enlaza con [(value)].':
    'Visible list of options; the selected value is bound with [(value)].',
  'Con multiple se eligen varias opciones y filter añade un buscador.':
    'With multiple several options can be chosen and filter adds a search box.',
  'text muestra un mensaje mientras se completa la operación.':
    'text shows a message while the operation completes.',
  'Con negative el logo se adapta a fondos oscuros.':
    'With negative the logo adapts to dark backgrounds.',
  'severity define el color y el icono del mensaje.':
    'severity sets the color and icon of the message.',
  'values define los segmentos de la barra con su etiqueta, valor y color.':
    'values defines the bar segments with their label, value and color.',
  'title define el encabezado y visible controla si el modal se muestra.':
    'title sets the header and visible controls whether the modal is shown.',
  'Panel que se desliza desde un lateral, controlado con [(open)].':
    'Panel that slides in from the side, controlled with [(open)].',
  'Un botón abre el panel con controles de filtro.':
    'A button opens the panel with filter controls.',
  'Pantallas de bienvenida paso a paso a partir del arreglo steps.':
    'Step-by-step welcome screens from the steps array.',
  'Lista reordenable; el nuevo orden se enlaza con [(value)].':
    'Reorderable list; the new order is bound with [(value)].',
  'totalRecords define el total; [(first)] y [(rows)] enlazan la página actual y su tamaño.':
    'totalRecords sets the total; [(first)] and [(rows)] bind the current page and its size.',
  'Contenedor con cabecera definida por header.': 'Container with a header set by header.',
  'Mueve elementos entre dos listas enlazadas con [(source)] y [(target)].':
    'Moves items between two lists bound with [(source)] and [(target)].',
  'name selecciona el pictograma y size su tamaño.':
    'name selects the pictogram and size its dimensions.',
  'triggerLabel define el texto que abre el contenido flotante.':
    'triggerLabel sets the text that opens the floating content.',
  'Puede contener cualquier contenido; se abre con toggle desde una referencia de plantilla.':
    'It can hold any content; it opens with toggle from a template reference.',
  'Mientras active es true, cubre la pantalla con label como mensaje.':
    'While active is true, it covers the screen with label as the message.',
  'value indica el porcentaje y label el texto superior.':
    'value sets the percentage and label the text above.',
  'value define el porcentaje y showValue lo muestra dentro de la barra.':
    'value sets the percentage and showValue displays it inside the bar.',
  'severity cambia el color y size el grosor de la barra.':
    'severity changes the color and size the bar thickness.',
  'stars define cuántas estrellas se muestran.': 'stars sets how many stars are shown.',
  'readonly muestra el valor sin permitir cambios; disabled además atenúa el control.':
    'readonly shows the value without allowing changes; disabled also dims the control.',
  'La directiva cbRipple añade el efecto de onda al hacer clic.':
    'The cbRipple directive adds a ripple effect on click.',
  'Área con desplazamiento propio y barra estilizada; width y height fijan sus dimensiones.':
    'Area with its own scrolling and a styled scrollbar; width and height set its dimensions.',
  'Solo una opción activa a la vez; el valor se enlaza con [(value)].':
    'Only one option active at a time; the value is bound with [(value)].',
  'Con multiple el valor es un arreglo con todas las opciones activas.':
    'With multiple the value is an array with all active options.',
  'Acceso directo con icono y label para acciones frecuentes.':
    'Shortcut with icon and label for frequent actions.',
  'Varios accesos en cuadrícula forman un panel de acciones rápidas.':
    'Several shortcuts in a grid make up a quick actions panel.',
  'shape admite texto (por defecto), rect y circle; width y height ajustan las dimensiones.':
    'shape accepts text (default), rect and circle; width and height adjust the dimensions.',
  'Al deshabilitar el FormControl, el slider se bloquea automáticamente.':
    'When the FormControl is disabled, the slider is locked automatically.',
  'size define el diámetro en píxeles.': 'size sets the diameter in pixels.',
  'severity define el color del indicador.': 'severity sets the color of the indicator.',
  'Con layout=vertical los paneles se apilan; size fija el porcentaje inicial de cada uno.':
    'With layout=vertical the panels are stacked; size sets the initial percentage of each one.',
  'Indicador de estado; status define el color y text la etiqueta.':
    'Status indicator; status sets the color and text the label.',
  'currentStep y totalSteps indican el progreso; label describe el paso actual.':
    'currentStep and totalSteps show the progress; label describes the current step.',
  'El indicador avanza junto con el contenido de cada paso del flujo.':
    'The indicator advances along with the content of each step of the flow.',
  'name selecciona el trazo y size su tamaño.': 'name selects the stroke and size its dimensions.',
  'label define la etiqueta y el estado se enlaza con [(checked)].':
    'label sets the label and the state is bound with [(checked)].',
  'Cada cb-tab define una pestaña; su título se indica con label.':
    'Each cb-tab defines a tab; its title is set with label.',
  'Una pestaña con disabled no se puede seleccionar.': 'A tab with disabled cannot be selected.',
  'El estado activo se enlaza con [(selected)].': 'The active state is bound with [(selected)].',
  'severity define el color de la etiqueta.': 'severity sets the color of the tag.',
  'icon añade un icono antes del texto.': 'icon adds an icon before the text.',
  'Con rounded la etiqueta toma forma de píldora.': 'With rounded the tag takes a pill shape.',
  'Línea de tiempo vertical a partir del arreglo value.': 'Vertical timeline from the value array.',
  'onLabel y offLabel definen el texto de cada estado; el valor se enlaza con [(value)].':
    'onLabel and offLabel set the text of each state; the value is bound with [(value)].',
  'onIcon y offIcon muestran un icono distinto según el estado.':
    'onIcon and offIcon show a different icon depending on the state.',
  'Distribuye acciones en tres zonas: cb-toolbar-start, cb-toolbar-center y cb-toolbar-end.':
    'Spreads actions across three areas: cb-toolbar-start, cb-toolbar-center and cb-toolbar-end.',
  'steps define las etapas y currentIndex la etapa actual.':
    'steps defines the stages and currentIndex the current one.',
  'Resultado de una transacción; status define el estado y label el mensaje.':
    'Result of a transaction; status sets the state and label the message.',
  'Estructura jerárquica expandible a partir del arreglo value.':
    'Expandable hierarchical structure from the value array.',
  'Selector desplegable con árbol de nodos; el valor se enlaza con [(value)].':
    'Dropdown selector with a tree of nodes; the value is bound with [(value)].',
  'Tabla jerárquica: value define los nodos y columns las columnas.':
    'Hierarchical table: value defines the nodes and columns the columns.',
  'Renderiza solo los elementos visibles para listas muy largas.':
    'Renders only the visible items for very long lists.',
  'title define el encabezado y rows los datos del comprobante.':
    'title sets the header and rows the receipt data.',

  // --- Accesibilidad (doc-a11y-registry) ---
  'Cuando el campo es inválido (por `invalid` o porque su FormControl es inválido y ya fue tocado) se aplica `aria-invalid="true"`, y `aria-describedby` enlaza el texto de ayuda o el mensaje de error, que se anuncia con `role="alert"`.':
    'When the field is invalid (through `invalid`, or because its FormControl is invalid and has been touched), `aria-invalid="true"` is applied, and `aria-describedby` links the help text or the error message, which is announced with `role="alert"`.',
  'Accesibilidad': 'Accessibility',
  'Usa el elemento nativo, por lo que se anuncia como campo de texto. Con `label` se muestra una etiqueta asociada al campo; si no hay etiqueta visible, añade `aria-label`.':
    'Uses the native element, so it is announced as a text field. With `label` a label associated with the field is shown; if there is no visible label, add `aria-label`.',
  'Mueve el foco al campo.': 'Moves focus to the field.',
  'El panel usa `role="listbox"`; cada opción tiene `role="option"` con `aria-selected` y `aria-disabled`. `aria-activedescendant` indica la opción activa mientras se navega con el teclado.':
    'The panel uses `role="listbox"`; each option has `role="option"` with `aria-selected` and `aria-disabled`. `aria-activedescendant` points to the active option while navigating with the keyboard.',
  'Mueve el foco al select.': 'Moves focus to the select.',
  'Enter / Espacio / Flecha abajo / Flecha arriba': 'Enter / Space / Down arrow / Up arrow',
  'Con el panel cerrado, lo abre.': 'When the panel is closed, opens it.',
  'Flecha abajo / Flecha arriba': 'Down arrow / Up arrow',
  'Mueve la opción activa a la siguiente o a la anterior.':
    'Moves the active option to the next or previous one.',
  'Inicio / Fin': 'Home / End',
  'Va a la primera o a la última opción habilitada.': 'Goes to the first or last enabled option.',
  'Selecciona la opción activa y cierra el panel.':
    'Selects the active option and closes the panel.',
  'Cierra el panel.': 'Closes the panel.',
  'Con el panel abierto, lo cierra y pasa al siguiente elemento.':
    'When the panel is open, closes it and moves to the next element.',
  'Mueve el foco al multiselect.': 'Moves focus to the multiselect.',
  'Va a la primera o a la última opción.': 'Goes to the first or last option.',
  'Enter / Espacio': 'Enter / Space',
  'La lista usa `role="listbox"` (con `aria-multiselectable` en modo `multiple`) y su nombre accesible se define con `ariaLabel`.':
    'The list uses `role="listbox"` (with `aria-multiselectable` in `multiple` mode) and its accessible name is set with `ariaLabel`.',
  'Cada opción tiene `role="option"` con `aria-selected` y `aria-disabled`; `aria-activedescendant` indica la opción activa.':
    'Each option has `role="option"` with `aria-selected` and `aria-disabled`; `aria-activedescendant` points to the active option.',
  'Mueve el foco a la lista.': 'Moves focus to the list.',
  'Selecciona la opción activa (en modo multiple, la marca o desmarca).':
    'Selects the active option (in multiple mode, checks or unchecks it).',
  'El campo tiene `role="combobox"` con `aria-autocomplete`, `aria-expanded` y `aria-controls`; `aria-activedescendant` indica la sugerencia activa.':
    'The field has `role="combobox"` with `aria-autocomplete`, `aria-expanded` and `aria-controls`; `aria-activedescendant` points to the active suggestion.',
  'Las sugerencias usan `role="listbox"` y `role="option"`. Con `invalid` se aplica `aria-invalid` y `aria-describedby` enlaza la ayuda o el error, que se anuncia con `role="alert"`.':
    'Suggestions use `role="listbox"` and `role="option"`. With `invalid`, `aria-invalid` is applied and `aria-describedby` links the help text or the error, which is announced with `role="alert"`.',
  'Flecha abajo': 'Down arrow',
  'Abre las sugerencias (si hay) y mueve a la siguiente.':
    'Opens the suggestions (if any) and moves to the next one.',
  'Flecha arriba': 'Up arrow',
  'Mueve a la sugerencia anterior.': 'Moves to the previous suggestion.',
  'Elige la sugerencia activa.': 'Picks the active suggestion.',
  'Cierra las sugerencias.': 'Closes the suggestions.',
  'Cierra las sugerencias y pasa al siguiente elemento.':
    'Closes the suggestions and moves to the next element.',
  'El campo indica con `aria-haspopup="dialog"` y `aria-expanded` que abre un calendario. Con `invalid` se aplica `aria-invalid` y el error se anuncia con `role="alert"`.':
    'The field signals with `aria-haspopup="dialog"` and `aria-expanded` that it opens a calendar. With `invalid`, `aria-invalid` is applied and the error is announced with `role="alert"`.',
  'Enter / Espacio / Flecha abajo': 'Enter / Space / Down arrow',
  'Flecha izquierda / Flecha derecha': 'Left arrow / Right arrow',
  'Día anterior o siguiente.': 'Previous or next day.',
  'Flecha arriba / Flecha abajo': 'Up arrow / Down arrow',
  'Mismo día de la semana anterior o siguiente.': 'Same weekday of the previous or next week.',
  'Primer o último día de la semana.': 'First or last day of the week.',
  'Re Pág / Av Pág': 'Page Up / Page Down',
  'El campo tiene `role="spinbutton"` con `aria-valuenow`, `aria-valuemin` y `aria-valuemax`. Con `invalid` se aplica `aria-invalid` y `aria-describedby` enlaza la ayuda o el error.':
    'The field has `role="spinbutton"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`. With `invalid`, `aria-invalid` is applied and `aria-describedby` links the help text or the error.',
  'Incrementa el valor en `step`.': 'Increases the value by `step`.',
  'Decrementa el valor en `step`.': 'Decreases the value by `step`.',
  'El control tiene `role="slider"` con `aria-valuemin`, `aria-valuemax` y `aria-valuenow`, y `aria-disabled` cuando está deshabilitado. Define su nombre con `ariaLabel`.':
    'The control has `role="slider"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow`, and `aria-disabled` when disabled. Set its name with `ariaLabel`.',
  'Mueve el foco al control.': 'Moves focus to the control.',
  'Flecha derecha / Flecha arriba': 'Right arrow / Up arrow',
  'Aumenta el valor en `step`.': 'Increases the value by `step`.',
  'Flecha izquierda / Flecha abajo': 'Left arrow / Down arrow',
  'Disminuye el valor en `step`.': 'Decreases the value by `step`.',
  'Aumenta o disminuye 10 pasos.': 'Increases or decreases by 10 steps.',
  'Va al valor mínimo o al máximo.': 'Goes to the minimum or maximum value.',
  'El control tiene `role="slider"`: `aria-valuenow` es la puntuación, `aria-valuemin` es 0 y `aria-valuemax` el número de estrellas. Las estrellas son decorativas (`aria-hidden`). Define su nombre con `ariaLabel`.':
    'The control has `role="slider"`: `aria-valuenow` is the rating, `aria-valuemin` is 0 and `aria-valuemax` the number of stars. The stars are decorative (`aria-hidden`). Set its name with `ariaLabel`.',
  'Suma una estrella.': 'Adds one star.',
  'Resta una estrella.': 'Removes one star.',
  'Puntuación 0 o máxima.': 'Rating 0 or maximum.',
  'Las casillas se agrupan en un `role="group"` cuyo nombre se define con `ariaLabel`; cada casilla es un input nativo.':
    'The boxes are grouped in a `role="group"` whose name is set with `ariaLabel`; each box is a native input.',
  'Mueve el foco a la casilla.': 'Moves focus to the box.',
  'Pasa a la casilla anterior o siguiente.': 'Moves to the previous or next box.',
  'Retroceso': 'Backspace',
  'En una casilla vacía, vuelve a la anterior.': 'On an empty box, goes back to the previous one.',
  'Usa un `input type="checkbox"` nativo, asociado a su `label`; sin etiqueta visible, define `ariaLabel`. El estado indeterminado se anuncia con `aria-checked="mixed"` y el inválido con `aria-invalid`.':
    'Uses a native `input type="checkbox"` associated with its `label`; without a visible label, set `ariaLabel`. The indeterminate state is announced with `aria-checked="mixed"` and the invalid one with `aria-invalid`.',
  'Espacio': 'Space',
  'Marca o desmarca la casilla.': 'Checks or unchecks the box.',
  'El grupo tiene `role="radiogroup"` y su nombre se define con `ariaLabel`. Cada opción es un `input type="radio"` nativo que comparte `name` con las demás.':
    'The group has `role="radiogroup"` and its name is set with `ariaLabel`. Each option is a native `input type="radio"` that shares its `name` with the others.',
  'Entra al grupo en la opción seleccionada (o en la primera).':
    'Enters the group on the selected option (or the first one).',
  'Flechas': 'Arrow keys',
  'Mueve a la opción anterior o siguiente y la selecciona.':
    'Moves to the previous or next option and selects it.',
  'Selecciona la opción enfocada.': 'Selects the focused option.',
  'Usa un `input type="checkbox"` nativo con `role="switch"`, de modo que se anuncia como interruptor encendido o apagado. Sin etiqueta visible, define `ariaLabel`.':
    'Uses a native `input type="checkbox"` with `role="switch"`, so it is announced as a switch that is on or off. Without a visible label, set `ariaLabel`.',
  'Mueve el foco al interruptor.': 'Moves focus to the switch.',
  'Cambia el estado.': 'Toggles the state.',
  'Las opciones se agrupan en un `role="group"` cuyo nombre se define con `ariaLabel`. Cada opción es un botón con `aria-pressed` que indica si está activa.':
    'The options are grouped in a `role="group"` whose name is set with `ariaLabel`. Each option is a button with `aria-pressed` indicating whether it is active.',
  'Mueve el foco entre las opciones.': 'Moves focus between the options.',
  'Activa o desactiva la opción enfocada.': 'Turns the focused option on or off.',
  'El panel tiene `role="dialog"` con `aria-modal="true"` y se nombra con el título (`aria-labelledby` hacia `header`) o, si no hay título, con `ariaLabel`.':
    'The panel has `role="dialog"` with `aria-modal="true"` and is named by its title (`aria-labelledby` pointing to `header`) or, if there is no title, by `ariaLabel`.',
  'Al abrirse, el foco queda atrapado dentro del diálogo; al cerrarse vuelve al elemento que lo abrió.':
    'When opened, focus is trapped inside the dialog; when closed, it returns to the element that opened it.',
  'Tab / Mayús + Tab': 'Tab / Shift + Tab',
  'Mueve el foco entre los elementos del diálogo sin salir de él.':
    'Moves focus between the dialog elements without leaving it.',
  'Cierra el diálogo (si `closeOnEscape` es true).':
    'Closes the dialog (if `closeOnEscape` is true).',
  'Al abrirse, el foco queda atrapado dentro del panel; al cerrarse vuelve al elemento que lo abrió.':
    'When opened, focus is trapped inside the panel; when closed, it returns to the element that opened it.',
  'Mueve el foco entre los elementos del panel sin salir de él.':
    'Moves focus between the panel elements without leaving it.',
  'Cierra el panel (si `closeOnEscape` es true).': 'Closes the panel (if `closeOnEscape` is true).',
  'El contenido flotante tiene `role="dialog"` y su nombre se define con `ariaLabel`. Se abre junto al elemento que lo dispara.':
    'The floating content has `role="dialog"` and its name is set with `ariaLabel`. It opens next to the element that triggers it.',
  'Cierra el popover.': 'Closes the popover.',
  'Al enfocar el elemento se muestra el tooltip; al salir del foco se oculta.':
    'Focusing the element shows the tooltip; leaving focus hides it.',
  'El panel tiene `role="menu"` y su nombre se define con `ariaLabel`. Cada acción es un `role="menuitem"` (con `aria-disabled` si está deshabilitada) y los separadores usan `role="separator"`.':
    'The panel has `role="menu"` and its name is set with `ariaLabel`. Each action is a `role="menuitem"` (with `aria-disabled` when disabled) and separators use `role="separator"`.',
  'Mueve el foco a la acción siguiente o anterior (de forma circular).':
    'Moves focus to the next or previous action (wrapping around).',
  'Va a la primera o a la última acción.': 'Goes to the first or last action.',
  'Ejecuta la acción enfocada o abre su enlace (`url`).':
    'Runs the focused action or opens its link (`url`).',
  'Ejecuta la acción enfocada (en las que no son enlaces).':
    'Runs the focused action (for those that are not links).',
  'Cierra el menú.': 'Closes the menu.',
  'Se abre con clic derecho en la posición del puntero. El panel tiene `role="menu"` y cada acción `role="menuitem"`; al abrirse, el foco pasa a la primera acción habilitada.':
    'It opens with a right click at the pointer position. The panel has `role="menu"` and each action `role="menuitem"`; when opened, focus moves to the first enabled action.',
  'Ejecuta la acción enfocada.': 'Runs the focused action.',
  'El contenedor es una región `role="log"` con `aria-live="polite"`: cada mensaje nuevo se anuncia sin mover el foco. Cada mensaje tiene `role="alert"` y su botón de cierre `aria-label="Cerrar"`.':
    'The container is a `role="log"` region with `aria-live="polite"`: each new message is announced without moving focus. Each message has `role="alert"` and its close button `aria-label="Cerrar"`.',
  'Mueve el foco al botón de cerrar de cada mensaje.':
    'Moves focus to the close button of each message.',
  'Cierra el mensaje.': 'Closes the message.',
  'Activa el botón enfocado.': 'Activates the focused button.',
  'Flecha derecha / Flecha izquierda': 'Right arrow / Left arrow',
  'El disparador tiene `role="combobox"` con `aria-haspopup="listbox"` y `aria-expanded`, y se relaciona con el panel mediante `aria-controls`. Nómbralo con `ariaLabelledBy` (id de una etiqueta visible) o con `ariaLabel`.':
    'The trigger has `role="combobox"` with `aria-haspopup="listbox"` and `aria-expanded`, and is linked to the panel through `aria-controls`. Name it with `ariaLabelledBy` (id of a visible label) or with `ariaLabel`.',
  'El texto flotante tiene `role="tooltip"` y aparece al pasar el puntero y al enfocar el elemento. Mientras está visible, el elemento lo referencia con `aria-describedby` (conservando los ids que ya tuviera), así que el lector de pantalla lo anuncia como descripción.':
    'The floating text has `role="tooltip"` and appears on hover and when the element is focused. While visible, the element references it with `aria-describedby` (keeping any ids it already had), so the screen reader announces it as a description.',
  'El tooltip describe, no nombra: en botones solo con icono define también un `aria-label`.':
    'A tooltip describes, it does not name: on icon-only buttons also set an `aria-label`.',
  'Oculta el tooltip sin mover el foco.': 'Hides the tooltip without moving focus.',
  'El panel tiene `role="alertdialog"` con `aria-modal="true"`; `aria-labelledby` apunta al título (`header`) y `aria-describedby` al mensaje.':
    'The panel has `role="alertdialog"` with `aria-modal="true"`; `aria-labelledby` points to the title (`header`) and `aria-describedby` to the message.',
  'Al abrirse, el foco pasa al primer botón (cancelar) y queda atrapado dentro del diálogo; al cerrarse vuelve al elemento que lo abrió.':
    'When opened, focus moves to the first button (cancel) and is trapped inside the dialog; when closed, it returns to the element that opened it.',
  'Mueve el foco entre los botones sin salir del diálogo.':
    'Moves focus between the buttons without leaving the dialog.',
  'Cancela y cierra el diálogo (emite `rejected`).':
    'Cancels and closes the dialog (emits `rejected`).',
  'Las pestañas usan `role="tablist"`, `role="tab"` (con `aria-selected`) y `role="tabpanel"`. La pestaña activa apunta a su panel con `aria-controls` y el panel se nombra con `aria-labelledby`.':
    'Tabs use `role="tablist"`, `role="tab"` (with `aria-selected`) and `role="tabpanel"`. The active tab points to its panel with `aria-controls` and the panel is named with `aria-labelledby`.',
  'Solo la pestaña activa entra en el orden de tabulación; al cambiar con las flechas, el foco se mueve con ella.':
    'Only the active tab is part of the tab order; when switching with the arrow keys, focus moves with it.',
  'Mueve el foco a la pestaña activa y luego al panel.':
    'Moves focus to the active tab and then to the panel.',
  'Activa y enfoca la pestaña siguiente o anterior (de forma circular), omitiendo las deshabilitadas.':
    'Activates and focuses the next or previous tab (wrapping around), skipping disabled ones.',
  'Activa y enfoca la primera o la última pestaña.': 'Activates and focuses the first or last tab.',
  // --- API: estado de validación automático ---
  'Marca visual y ARIA de estado inválido (también se activa con Angular Forms).':
    'Visual and ARIA invalid state (also enabled automatically by Angular Forms).',

  // --- Idioma (i18n) ---
  Configuración: 'Configuration',
  'Idioma (i18n)': 'Localization (i18n)',
  'Los componentes traen sus textos de interfaz (etiquetas accesibles, botones, placeholders y mensajes) en español e inglés, y puedes traducirlos o personalizarlos.':
    'Components ship their interface texts (accessible labels, buttons, placeholders and messages) in Spanish and English, and you can translate or customize them.',
  'Elige el idioma una vez para toda la app con provideCaribeNG(). Por defecto es español (es).':
    'Choose the language once for the whole app with provideCaribeNG(). The default is Spanish (es).',
  'Cambio en caliente': 'Switch at runtime',
  'CbLocaleService.use() cambia el idioma sin recargar: los componentes leen sus textos como signal. Pruébalo: el selector, el paginador y sus etiquetas accesibles cambian de idioma.':
    'CbLocaleService.use() switches the language without reloading: components read their texts as a signal. Try it: the select, the paginator and their accessible labels change language.',
  'Personalizar textos': 'Customize texts',
  'translation sobrescribe solo las claves que indiques sobre el idioma elegido; en caliente, usa setTranslation().':
    'translation overrides only the keys you specify on top of the chosen language; at runtime, use setTranslation().',
  'Otro idioma': 'Another language',
  'Para un idioma que no viene incluido, pasa un objeto CbTranslation completo. TypeScript te avisa si falta alguna clave.':
    'For a language that is not included, pass a complete CbTranslation object. TypeScript warns you if a key is missing.',
  'Claves disponibles': 'Available keys',
  'Todos los textos que puedes traducir. Las partes {0}, {1}… se rellenan con valores como el número de página o el nombre de un elemento.':
    'Every text you can translate. The {0}, {1}… parts are filled with values such as the page number or an item name.',

  // --- Changelog ---
  Versiones: 'Releases',
  'Novedades, mejoras y correcciones de cada versión de CaribeNG. Busca por palabra clave o filtra por tipo de cambio.':
    'New features, enhancements and defect fixes in each CaribeNG release. Search by keyword or filter by change type.',
  'Próxima versión': 'Next release',

  // --- Indicador de obligatoriedad (requiredIndicator) ---
  'Indicador de obligatoriedad': 'Required indicator',
  'Indicador global': 'Global indicator',
  'requiredIndicator elige cómo se señala en la etiqueta: asterisk (*), text (requerido), optional (marca los opcionales) o none (nada visible). El campo siempre expone aria-required.':
    'requiredIndicator chooses how the label signals it: asterisk (*), text (required), optional (marks optional fields) or none (nothing visible). The field always exposes aria-required.',
  'Configúralo una vez para toda la app con provideCaribeNG(); por defecto es none. Cada campo puede sobrescribirlo con requiredIndicator.':
    'Configure it once for the whole app with provideCaribeNG(); the default is none. Each field can override it with requiredIndicator.',
  'Indicador de obligatoriedad en la etiqueta; si se omite usa el global de provideCaribeNG().':
    'Required indicator in the label; if omitted, the global one from provideCaribeNG() is used.',

  // --- Componentes reescritos (Tree, TreeTable, VirtualScroller, DataView, Timeline, OrderList, PickList, overlays) ---
  'Diálogo modal para confirmar una acción antes de ejecutarla; atrapa el foco y se cancela con Escape.':
    'Modal dialog to confirm an action before running it; it traps focus and is cancelled with Escape.',
  'Se abre con [(visible)]; accepted y rejected avisan de la decisión. Sin textos propios, usa los del idioma activo.':
    'Opens with [(visible)]; accepted and rejected report the decision. Without custom texts, it uses those of the active language.',
  'header, message y los textos de los botones se personalizan; acceptSeverity="danger" marca el botón de aceptar como peligroso.':
    'header, message and the button texts can be customized; acceptSeverity="danger" marks the accept button as dangerous.',
  'Acción destructiva': 'Destructive action',
  'Confirmación breve que aparece junto al botón que la dispara, sin bloquear el resto de la página.':
    'Short confirmation shown next to the button that triggers it, without blocking the rest of the page.',
  'confirm($event) la abre anclada al botón pulsado; accepted y rejected avisan de la decisión. Escape o un clic fuera la cancelan.':
    'confirm($event) opens it anchored to the clicked button; accepted and rejected report the decision. Escape or an outside click cancel it.',
  'Con [(visible)] se muestra dentro del flujo de la página, donde esté el componente.':
    'With [(visible)] it is shown inline in the page flow, wherever the component is placed.',
  'En línea': 'Inline',
  'Sin cuota de manejo y con retiros gratis.': 'No fees and free withdrawals.',
  'Compra en cuotas y acumula puntos.': 'Pay in installments and earn points.',
  'Rentabilidad fija a 90, 180 o 360 días.': 'Fixed return at 90, 180 or 360 days.',
  'Muestra una colección en lista o cuadrícula con la plantilla que definas, paginación y cambio de vista.':
    'Displays a collection as a list or grid with your own template, pagination and layout switching.',
  'Sin plantilla, cada elemento (con id, title, category y description) se muestra como tarjeta con un botón de selección.':
    'Without a template, each item (with id, title, category and description) is shown as a card with a select button.',
  'cbDataViewItem define cada elemento y recibe la vista activa; showLayoutToggle añade los botones lista/cuadrícula y rows activa el paginador.':
    'cbDataViewItem defines each item and receives the active layout; showLayoutToggle adds the list/grid buttons and rows enables the paginator.',
  'Plantilla, vistas y paginación': 'Template, layouts and pagination',
  'Abre cualquier componente dentro de un diálogo desde código, le pasa datos y recibe un resultado al cerrarse.':
    'Opens any component inside a dialog from code, passes it data and receives a result when it closes.',
  'open() recibe el componente y la configuración (header, data, width) y devuelve una referencia; onClose emite el resultado.':
    'open() takes the component and the configuration (header, data, width) and returns a reference; onClose emits the result.',
  'El componente abierto inyecta CB_DYNAMIC_DIALOG_DATA para leer los datos y CbDynamicDialogRef para cerrarse con close(resultado).':
    'The opened component injects CB_DYNAMIC_DIALOG_DATA to read the data and CbDynamicDialogRef to close itself with close(result).',
  'Para mensajes simples, cb-dynamic-dialog muestra header y content y se controla con [(visible)].':
    'For simple messages, cb-dynamic-dialog shows header and content and is controlled with [(visible)].',
  'Con CbDialogService': 'With CbDialogService',
  'Componente abierto': 'Opened component',
  'Declarativo': 'Declarative',
  'copyright define el texto legal; los enlaces se proyectan como contenido.':
    'copyright sets the legal text; links are projected as content.',
  'Cada categoría agrupa enlaces en columnas (groups). itemSelect emite el enlace elegido; ariaLabel nombra la navegación.':
    'Each category groups links in columns (groups). itemSelect emits the chosen link; ariaLabel names the navigation.',
  'Lista reordenable: selecciona un elemento y muévelo con los botones o con Alt + flechas.':
    'Reorderable list: select an item and move it with the buttons or with Alt + arrows.',
  'El orden se enlaza con [(value)]; header pone un título visible que también nombra la lista.':
    'The order is bound with [(value)]; header adds a visible title that also names the list.',
  'cbOrderListItem define cada elemento y reorder emite la posición de origen, la de destino y la lista nueva.':
    'cbOrderListItem defines each item and reorder emits the source position, the target position and the new list.',
  'Plantilla y evento reorder': 'Template and reorder event',
  'Transfiere elementos entre una lista de disponibles y otra de seleccionados con botones, doble clic o teclado.':
    'Transfers items between an available list and a selected list with buttons, double click or keyboard.',
  '[(source)] y [(target)] enlazan las dos listas. Marca elementos y transfiérelos con los botones, o haz doble clic en uno.':
    '[(source)] and [(target)] bind both lists. Mark items and transfer them with the buttons, or double-click one.',
  'cbPickListItem define cada elemento; sourceHeader y targetHeader cambian los títulos y moved emite los elementos transferidos.':
    'cbPickListItem defines each item; sourceHeader and targetHeader change the titles and moved emits the transferred items.',
  'Plantilla, cabeceras y evento moved': 'Template, headers and moved event',
  'Salió del centro de distribución.': 'Left the distribution center.',
  'Validamos tus datos.': 'We are validating your data.',
  'Un asesor revisa tu caso.': 'An advisor is reviewing your case.',
  'Sube tu certificado laboral.': 'Upload your employment certificate.',
  'Muestra una secuencia de eventos en el tiempo, en vertical u horizontal, con plantillas para el contenido.':
    'Displays a sequence of events over time, vertically or horizontally, with templates for the content.',
  'Cada evento tiene title y, opcionalmente, date, datetime (fecha legible por máquina) y description.':
    'Each event has a title and, optionally, date, datetime (machine-readable date) and description.',
  'icon muestra un icono dentro del marcador y color cambia su color.':
    'icon shows an icon inside the marker and color changes its color.',
  'align coloca el contenido a la izquierda (left), a la derecha (right) o alternado (alternate). La plantilla cbTimelineOpposite rellena el lado contrario.':
    'align places the content on the left, on the right or alternating (alternate). The cbTimelineOpposite template fills the opposite side.',
  'orientation="horizontal" dispone los eventos en fila, útil para seguimientos cortos.':
    'orientation="horizontal" lays the events out in a row, useful for short tracking flows.',
  'cbTimelineContent sustituye el contenido de cada evento por el tuyo, por ejemplo una tarjeta.':
    'cbTimelineContent replaces the content of each event with yours, for example a card.',
  'Iconos y colores': 'Icons and colors',
  'Alineación': 'Alignment',
  'Plantilla de contenido': 'Content template',
  'Estructura jerárquica con niveles ilimitados, selección y navegación completa con teclado.':
    'Hierarchical structure with unlimited levels, selection and full keyboard navigation.',
  'value recibe los nodos raíz; cada nodo puede tener children con más niveles. El nodo elegido se enlaza con [(selection)].':
    'value takes the root nodes; each node can have children with more levels. The chosen node is bound with [(selection)].',
  'icon muestra un icono junto al nodo y disabled impide seleccionarlo (sí se puede expandir).':
    'icon shows an icon next to the node and disabled prevents selecting it (it can still be expanded).',
  'expandAll() y collapseAll() se llaman a través de una referencia de plantilla.':
    'expandAll() and collapseAll() are called through a template reference.',
  'Con ng-template cbTreeNode personalizas el contenido de cada nodo; recibe el nodo, su nivel y si está expandido o seleccionado.':
    'With ng-template cbTreeNode you customize each node; it receives the node, its level and whether it is expanded or selected.',
  'Iconos y nodos deshabilitados': 'Icons and disabled nodes',
  'Expandir y contraer todo': 'Expand and collapse all',
  'Plantilla de nodo': 'Node template',
  'Tabla jerárquica: filas con hijos expandibles en niveles ilimitados, con sangría y navegación con teclado.':
    'Hierarchical table: rows with expandable children at unlimited levels, with indentation and keyboard navigation.',
  'columns define las columnas (la primera muestra la jerarquía) y value los nodos, cada uno con data y, opcionalmente, children.':
    'columns defines the columns (the first shows the hierarchy) and value the nodes, each with data and, optionally, children.',
  'ng-template cbTreeTableCell="campo" personaliza las celdas de una columna; recibe el valor, el nodo y su nivel.':
    'ng-template cbTreeTableCell="field" customizes the cells of a column; it receives the value, the node and its level.',
  'Plantilla de celda': 'Cell template',
  'Lista virtualizada: muestra miles de elementos pintando solo los visibles, para que el desplazamiento sea fluido.':
    'Virtualized list: shows thousands of items rendering only the visible ones, so scrolling stays smooth.',
  'items recibe la lista completa; itemSize es el alto fijo de cada fila y viewportHeight el alto visible, ambos en píxeles.':
    'items takes the full list; itemSize is the fixed height of each row and viewportHeight the visible height, both in pixels.',
  'ng-template cbVirtualItem define cómo se pinta cada elemento; recibe el elemento y su índice real. Aquí, 10 000 clientes.':
    'ng-template cbVirtualItem defines how each item is rendered; it receives the item and its real index. Here, 10,000 customers.',
  'scrollToIndex() desplaza la lista hasta el elemento indicado, a través de una referencia de plantilla.':
    'scrollToIndex() scrolls the list to the given item, through a template reference.',
  'Plantilla de elemento': 'Item template',
  'Ir a un elemento': 'Go to an item',

  // --- Accesibilidad de los componentes reescritos ---
  'El árbol tiene `role="tree"` y su nombre se define con `ariaLabel`. Cada nodo es un `role="treeitem"` con `aria-level`, `aria-setsize` y `aria-posinset`; los que tienen hijos exponen `aria-expanded` y el elegido `aria-selected`.':
    'The tree has `role="tree"` and its name is set with `ariaLabel`. Each node is a `role="treeitem"` with `aria-level`, `aria-setsize` and `aria-posinset`; nodes with children expose `aria-expanded` and the chosen one `aria-selected`.',
  'Solo un nodo entra en el orden de tabulación (el activo, el seleccionado o el primero); los botones de expandir no reciben foco con Tab.':
    'Only one node is in the tab order (the active, the selected or the first one); the expand buttons do not receive focus with Tab.',
  'Mueve el foco al árbol.': 'Moves focus to the tree.',
  'Mueve el foco al nodo visible siguiente o anterior.': 'Moves focus to the next or previous visible node.',
  'Flecha derecha': 'Right arrow',
  'Expande el nodo; si ya está expandido, pasa a su primer hijo.':
    'Expands the node; if it is already expanded, moves to its first child.',
  'Flecha izquierda': 'Left arrow',
  'Contrae el nodo; si ya está contraído, sube a su padre.':
    'Collapses the node; if it is already collapsed, moves up to its parent.',
  'Va al primer o al último nodo visible.': 'Goes to the first or last visible node.',
  'Selecciona el nodo enfocado.': 'Selects the focused node.',
  'La tabla tiene `role="treegrid"` y su nombre se define con `ariaLabel`. Cada fila expone `aria-level`, `aria-setsize`, `aria-posinset` y, si tiene hijos, `aria-expanded`.':
    'The table has `role="treegrid"` and its name is set with `ariaLabel`. Each row exposes `aria-level`, `aria-setsize`, `aria-posinset` and, if it has children, `aria-expanded`.',
  'Mueve el foco a la tabla.': 'Moves focus to the table.',
  'Mueve el foco a la fila visible siguiente o anterior.': 'Moves focus to the next or previous visible row.',
  'Expande la fila; si ya está expandida, pasa a su primera fila hija.':
    'Expands the row; if it is already expanded, moves to its first child row.',
  'Contrae la fila; si ya está contraída, sube a la fila padre.':
    'Collapses the row; if it is already collapsed, moves up to the parent row.',
  'Va a la primera o a la última fila visible.': 'Goes to the first or last visible row.',
  'Expande o contrae la fila enfocada.': 'Expands or collapses the focused row.',
  'La lista tiene `role="listbox"` y se nombra con `header` (mediante `aria-labelledby`) o, si no hay, con `ariaLabel`. El elemento elegido tiene `aria-selected`.':
    'The list has `role="listbox"` and is named by `header` (through `aria-labelledby`) or, if there is none, by `ariaLabel`. The chosen item has `aria-selected`.',
  'Los botones de mover tienen etiquetas accesibles y se deshabilitan cuando el movimiento no es posible.':
    'The move buttons have accessible labels and are disabled when the move is not possible.',
  'Mueve el foco al elemento siguiente o anterior.': 'Moves focus to the next or previous item.',
  'Va al primer o al último elemento.': 'Goes to the first or last item.',
  'Selecciona el elemento enfocado.': 'Selects the focused item.',
  'Alt + Flecha arriba / Alt + Flecha abajo': 'Alt + Up arrow / Alt + Down arrow',
  'Sube o baja el elemento seleccionado.': 'Moves the selected item up or down.',
  'Cada lista tiene `role="listbox"` con `aria-multiselectable="true"` y se nombra con su cabecera; los elementos marcados tienen `aria-selected`.':
    'Each list has `role="listbox"` with `aria-multiselectable="true"` and is named by its header; marked items have `aria-selected`.',
  'Pasa entre la lista de origen, los botones y la lista de destino.':
    'Moves between the source list, the buttons and the target list.',
  'Mueve el foco dentro de la lista.': 'Moves focus within the list.',
  'Marca o desmarca el elemento enfocado.': 'Marks or unmarks the focused item.',
  'Transfiere los elementos marcados (o el enfocado) a la otra lista.':
    'Transfers the marked items (or the focused one) to the other list.',
  'Sigue el patrón *disclosure navigation*: una `nav` nombrada con `ariaLabel` y botones de categoría con `aria-expanded` que apuntan a su panel con `aria-controls`.':
    'Follows the *disclosure navigation* pattern: a `nav` named with `ariaLabel` and category buttons with `aria-expanded` pointing to their panel with `aria-controls`.',
  'Mueve el foco a la categoría siguiente o anterior (de forma circular).':
    'Moves focus to the next or previous category (wrapping around).',
  'Va a la primera o a la última categoría.': 'Goes to the first or last category.',
  'Abre o cierra el panel de la categoría.': 'Opens or closes the category panel.',
  'Abre el panel y mueve el foco a su primer enlace; dentro del panel, al siguiente enlace.':
    'Opens the panel and moves focus to its first link; inside the panel, to the next link.',
  'Dentro del panel, va al enlace anterior (desde el primero, vuelve a la categoría).':
    'Inside the panel, goes to the previous link (from the first one, returns to the category).',
  'Cierra el panel y devuelve el foco a su categoría.': 'Closes the panel and returns focus to its category.',
  'El panel tiene `role="alertdialog"` y `aria-describedby` apunta al mensaje. Abierto con `confirm($event)`, el foco pasa al botón de cancelar y vuelve al disparador al cerrarse.':
    'The panel has `role="alertdialog"` and `aria-describedby` points to the message. When opened with `confirm($event)`, focus moves to the cancel button and returns to the trigger on close.',
  'Mueve el foco entre los botones.': 'Moves focus between the buttons.',
  'Cancela y cierra la confirmación (emite `rejected`).': 'Cancels and closes the confirmation (emits `rejected`).',
  'El panel tiene `role="dialog"` con `aria-modal="true"` y se nombra con `header` (`aria-labelledby`) o, si no hay título, con `ariaLabel` de la configuración.':
    'The panel has `role="dialog"` with `aria-modal="true"` and is named by `header` (`aria-labelledby`) or, without a title, by the configuration `ariaLabel`.',
  'Cierra el diálogo (si `closeOnEscape` no es false).': 'Closes the dialog (unless `closeOnEscape` is false).',
  'La lista tiene `role="list"` y su nombre se define con `ariaLabel`. Aunque solo se pintan los elementos visibles, cada uno expone `aria-setsize` (el total) y `aria-posinset` (su posición real).':
    'The list has `role="list"` and its name is set with `ariaLabel`. Although only visible items are rendered, each exposes `aria-setsize` (the total) and `aria-posinset` (its real position).',
  'Flecha abajo / Flecha arriba / Re Pág / Av Pág': 'Down arrow / Up arrow / Page Up / Page Down',
  'Desplaza la lista.': 'Scrolls the list.',

  // --- Accesibilidad: base de tests (Carousel, Galleria, Image, Inplace, CascadeSelect, TreeSelect) ---
  'El carrusel es una región (`role="region"` con `aria-roledescription="carousel"`) nombrada con `ariaLabel`. Cada diapositiva es un `role="group"` con `aria-roledescription="slide"` y un nombre de posición ("1 de 3").':
    'The carousel is a region (`role="region"` with `aria-roledescription="carousel"`) named with `ariaLabel`. Each slide is a `role="group"` with `aria-roledescription="slide"` and a position name ("1 of 3").',
  'Los indicadores siguen el patrón *tabs*: `role="tab"` con `aria-selected`, y solo el activo entra en el orden de tabulación.':
    'The indicators follow the *tabs* pattern: `role="tab"` with `aria-selected`, and only the active one is in the tab order.',
  'Pasa por las flechas de navegación y el indicador activo.': 'Moves through the navigation arrows and the active indicator.',
  'En los indicadores, va a la diapositiva siguiente o anterior (de forma circular).':
    'On the indicators, goes to the next or previous slide (wrapping around).',
  'En los indicadores, va a la primera o a la última diapositiva.': 'On the indicators, goes to the first or last slide.',
  'La imagen principal usa `alt` (o `title`) del elemento. Las miniaturas son `role="tab"` con `aria-selected` y se nombran con `title`, `alt` o su posición; su imagen es decorativa para no repetir el nombre.':
    'The main image uses the item `alt` (or `title`). Thumbnails are `role="tab"` with `aria-selected` and are named by `title`, `alt` or their position; their image is decorative so the name is not repeated.',
  'Pasa por las flechas de navegación y la miniatura activa.': 'Moves through the navigation arrows and the active thumbnail.',
  'En las miniaturas, va a la imagen siguiente o anterior (de forma circular).':
    'On the thumbnails, goes to the next or previous image (wrapping around).',
  'En las miniaturas, va a la primera o a la última imagen.': 'On the thumbnails, goes to the first or last image.',
  'El botón de ampliar se nombra con el `alt` de la imagen. La previsualización es un `role="dialog"` con `aria-modal="true"` y cada herramienta (rotar, voltear, zoom, descargar) tiene su etiqueta.':
    'The enlarge button is named with the image `alt`. The preview is a `role="dialog"` with `aria-modal="true"` and each tool (rotate, flip, zoom, download) has its own label.',
  'Al abrirse, el foco pasa al botón de cerrar y queda atrapado en la previsualización; al cerrarse vuelve al botón de ampliar.':
    'When it opens, focus moves to the close button and stays trapped in the preview; on close it returns to the enlarge button.',
  'Abre la previsualización o activa la herramienta enfocada.': 'Opens the preview or activates the focused tool.',
  'Mueve el foco entre las herramientas sin salir de la previsualización.': 'Moves focus between the tools without leaving the preview.',
  'Cierra la previsualización.': 'Closes the preview.',
  'La vista previa es un botón nativo. Al abrirse, el foco pasa al primer elemento enfocable del contenido; al cerrarse, vuelve a la vista previa.':
    'The display is a native button. When opened, focus moves to the first focusable element of the content; on close, it returns to the display.',
  'Muestra el contenido.': 'Shows the content.',
  'Vuelve a la vista previa (si `closable` es true).': 'Returns to the display (if `closable` is true).',
  'El disparador es un `role="combobox"` con `aria-expanded`; refleja `aria-invalid` y `aria-required` del estado del formulario.':
    'The trigger is a `role="combobox"` with `aria-expanded`; it reflects `aria-invalid` and `aria-required` from the form state.',
  'Abre o cierra el panel, o elige la opción enfocada.': 'Opens or closes the panel, or chooses the focused option.',
  'Mueve el foco entre las opciones del panel.': 'Moves focus between the panel options.',
  'Cierra el panel y devuelve el foco al disparador.': 'Closes the panel and returns focus to the trigger.',
  'El disparador es un `role="combobox"` con `aria-haspopup="tree"`. El panel es un `role="tree"`: cada nodo es un `role="treeitem"` con `aria-selected` y, si tiene hijos, `aria-expanded`; el botón de expandir se nombra con el nodo.':
    'The trigger is a `role="combobox"` with `aria-haspopup="tree"`. The panel is a `role="tree"`: each node is a `role="treeitem"` with `aria-selected` and, if it has children, `aria-expanded`; the expand button is named after the node.',
  'Abre o cierra el panel, expande un nodo o elige el nodo enfocado.': 'Opens or closes the panel, expands a node or chooses the focused node.',
  'Mueve el foco entre los nodos y sus botones de expandir.': 'Moves focus between the nodes and their expand buttons.',

  // --- API: base de tests ---
  'Nombre accesible del grupo (p. ej. "Participantes").': 'Accessible name of the group (e.g. "Participants").',
  'Bloquea el contenido: lo hace inerte y muestra la máscara.': 'Blocks the content: makes it inert and shows the mask.',
  'Texto que anuncia el lector de pantalla al bloquear.': 'Text announced by screen readers when blocking.',
  'Nombre accesible del área editable.': 'Accessible name of the editable area.',
  'Archivos descartados por tamaño (maxFileSize) o tipo (accept), con el motivo.':
    'Files discarded by size (maxFileSize) or type (accept), with the reason.',
  'Nombre accesible del medidor (p. ej. "Almacenamiento").': 'Accessible name of the meter (e.g. "Storage").',

  // --- Accesibilidad: base de tests (Editor, Terminal, MeterGroup, BlockUI) ---
  'El área editable es un `role="textbox"` con `aria-multiline="true"`, nombrado con `ariaLabel` (por defecto, "Editor de texto"). Refleja `aria-invalid`, `aria-required` y `aria-disabled`.':
    'The editable area is a `role="textbox"` with `aria-multiline="true"`, named with `ariaLabel` (by default, "Text editor"). It reflects `aria-invalid`, `aria-required` and `aria-disabled`.',
  'La barra es un `role="toolbar"` con nombre; cada herramienta tiene su etiqueta y solo una entra en el orden de tabulación.':
    'The bar is a named `role="toolbar"`; each tool has its own label and only one is in the tab order.',
  'Pasa de la barra de herramientas al área editable.': 'Moves from the toolbar to the editable area.',
  'En la barra, va a la herramienta siguiente o anterior (de forma circular).':
    'On the toolbar, goes to the next or previous tool (wrapping around).',
  'En la barra, va a la primera o a la última herramienta.': 'On the toolbar, goes to the first or last tool.',
  'El historial es un `role="log"` con `aria-live="polite"`: los comandos y respuestas nuevos se anuncian. La entrada se nombra con el prompt.':
    'The history is a `role="log"` with `aria-live="polite"`: new commands and responses are announced. The input is named after the prompt.',
  'Ejecuta el comando (`clear` vacía el historial).': 'Runs the command (`clear` empties the history).',
  'Recorre los comandos anteriores.': 'Goes through the previous commands.',
  'El medidor es un `role="meter"` nombrado con `ariaLabel`, con `aria-valuenow` (la suma de los valores), `aria-valuemax` y un desglose en `aria-valuetext` ("Apps 25%, Datos 40%"). La leyenda visual se oculta al lector para no repetirlo.':
    'The meter is a `role="meter"` named with `ariaLabel`, with `aria-valuenow` (the sum of the values), `aria-valuemax` and a breakdown in `aria-valuetext` ("Apps 25%, Data 40%"). The visual legend is hidden from screen readers to avoid repeating it.',
  'Mientras está bloqueado, el contenido es `inert` (no recibe foco ni clics), el contenedor expone `aria-busy="true"` y la máscara es un `role="status"` que anuncia `message` (por defecto, "Cargando").':
    'While blocked, the content is `inert` (it receives no focus or clicks), the container exposes `aria-busy="true"` and the mask is a `role="status"` that announces `message` (by default, "Loading").',

  // --- Table: filtros, columnas redimensionables y filas expandibles ---
  'Filas de la tabla.': 'Table rows.',
  'Columnas: field, header, sortable, filter, filterMatchMode, align y width.':
    'Columns: field, header, sortable, filter, filterMatchMode, align and width.',
  'Texto del filtro global; busca sin distinguir mayúsculas ni tildes.':
    'Global filter text; matches regardless of case and accents.',
  'Campos en los que busca el filtro global. Por defecto, los de todas las columnas.':
    'Fields searched by the global filter. Defaults to every column field.',
  'Muestra el paginador.': 'Shows the paginator.',
  'Filas por página.': 'Rows per page.',
  'Opciones de filas por página.': 'Rows-per-page options.',
  'Selección de filas (radio o checkbox por fila).': 'Row selection (a radio or checkbox per row).',
  'Fila o filas seleccionadas.': 'Selected row or rows.',
  'Propiedad que identifica cada fila (selección y filas expandidas).':
    'Property that identifies each row (selection and expanded rows).',
  'Claves de las filas expandidas; requiere la plantilla cbTableRowExpansion.':
    'Keys of the expanded rows; requires the cbTableRowExpansion template.',
  'Permite cambiar el ancho de las columnas con el ratón o el teclado.':
    'Lets users resize columns with the mouse or the keyboard.',
  'Filas alternas sombreadas.': 'Alternate rows shaded.',
  'Resalta la fila bajo el puntero.': 'Highlights the row under the pointer.',
  'Densidad de las celdas.': 'Cell density.',
  'Mensaje cuando no hay filas.': 'Message shown when there are no rows.',
  'Nombre accesible de la tabla.': 'Accessible name of the table.',
  'Se emite al cambiar la ordenación.': 'Emitted when the sort changes.',
  'Se emite al cambiar un filtro (global o de columna).':
    'Emitted when a filter (global or column) changes.',
  'Se emite al terminar de cambiar el ancho de una columna.': 'Emitted after a column is resized.',
  'Se emite al expandir una fila.': 'Emitted when a row is expanded.',
  'Se emite al contraer una fila.': 'Emitted when a row is collapsed.',
  'Tabla de datos con columnas declarativas, ordenación, filtros, paginación, selección, columnas redimensionables, filas expandibles y celdas personalizadas.':
    'Data table with declarative columns, sorting, filters, pagination, selection, resizable columns, expandable rows and custom cells.',
  'Con selectionMode="single" cada fila tiene un radio; elegir otra fila reemplaza la selección.':
    'With selectionMode="single" each row has a radio; choosing another row replaces the selection.',
  '[globalFilter] busca en todas las columnas (o en globalFilterFields) sin distinguir mayúsculas ni tildes. El campo de búsqueda es tuyo: colócalo donde quieras.':
    '[globalFilter] searches every column (or globalFilterFields) regardless of case and accents. The search field is yours: place it wherever you like.',
  'filter: true en la columna añade un campo bajo el encabezado; filterMatchMode elige entre contains, startsWith y equals.':
    'filter: true on a column adds a field below its header; filterMatchMode chooses between contains, startsWith and equals.',
  'resizableColumns añade un separador en cada encabezado: arrástralo o enfócalo y usa las flechas (Mayús para pasos grandes).':
    'resizableColumns adds a separator to each header: drag it, or focus it and use the arrow keys (Shift for larger steps).',
  'La plantilla cbTableRowExpansion añade un botón por fila que muestra su detalle; [(expandedRowKeys)] guarda las filas abiertas (por dataKey).':
    'The cbTableRowExpansion template adds a button per row that shows its details; [(expandedRowKeys)] keeps the open rows (by dataKey).',
  'Filtro global': 'Global filter',
  'Filtro por columna': 'Column filter',
  'Columnas redimensionables': 'Resizable columns',
  'Filas expandibles': 'Expandable rows',
  'Es una tabla nativa (`table`, `th scope="col"`) nombrada con `ariaLabel`. Las columnas ordenables tienen un botón "Ordenar por …" y exponen `aria-sort` (ascending / descending / none).':
    'It is a native table (`table`, `th scope="col"`) named with `ariaLabel`. Sortable columns have a "Sort by …" button and expose `aria-sort` (ascending / descending / none).',
  'Con selección, cada fila tiene un checkbox (múltiple) o un radio (simple) con nombre "Seleccionar fila N"; el de la cabecera usa `aria-checked="mixed"` si hay una selección parcial.':
    'With selection, each row has a checkbox (multiple) or a radio (single) named "Select row N"; the header one uses `aria-checked="mixed"` for a partial selection.',
  'Los filtros de columna se nombran "Filtrar por …" y, mientras hay filtros, una región viva anuncia la cantidad de resultados.':
    'Column filters are named "Filter by …" and, while filters are active, a live region announces the number of results.',
  'Las filas expandibles tienen un botón con `aria-expanded` que apunta a la fila de detalle con `aria-controls`. Los separadores de columna son `role="separator"` con su ancho en `aria-valuenow`.':
    'Expandable rows have a button with `aria-expanded` that points to the detail row with `aria-controls`. Column separators are `role="separator"` with their width in `aria-valuenow`.',
  'Recorre los botones de ordenar, separadores, filtros, checkboxes y botones de detalle.':
    'Moves through the sort buttons, separators, filters, checkboxes and detail buttons.',
  'Ordena por la columna, expande la fila o marca el checkbox / radio enfocado.':
    'Sorts by the column, expands the row or checks the focused checkbox / radio.',
  'En un separador, estrecha o ensancha la columna (10 px; 50 px con Mayús).':
    'On a separator, narrows or widens the column (10 px; 50 px with Shift).',

  // --- Select / MultiSelect: grupos, scroll virtual y limpiar ---
  'Las opciones son grupos ({ label, items }) y se muestran con su título.':
    'Options are groups ({ label, items }) shown with their title.',
  'Propiedad con el título de cada grupo.': 'Property holding each group title.',
  'Propiedad con las opciones de cada grupo.': 'Property holding each group options.',
  'Pinta solo las opciones visibles, para listas de miles de elementos.':
    'Renders only the visible options, for lists of thousands of items.',
  'Alto fijo de cada fila en modo virtual (px).': 'Fixed height of each row in virtual mode (px).',
  'Alto máximo de la lista (CSS); en modo virtual, su alto fijo.':
    'Maximum list height (CSS); in virtual mode, its fixed height.',
  'Muestra un botón para vaciar la selección.': 'Shows a button to clear the selection.',
  'Con group, cada opción de primer nivel es un grupo { label, items }. Seleccionar todo marca las opciones de todos los grupos.':
    'With group, each top-level option is a group { label, items }. Select all checks the options of every group.',
  'virtualScroll pinta solo las opciones visibles: aquí, 10 000 clientes con filtro.':
    'virtualScroll renders only the visible options: here, 10,000 customers with a filter.',
  'Agrupado': 'Grouped',
  'Scroll virtual': 'Virtual scroll',
  'Con group, cada opción de primer nivel es un grupo { label, items }; optionGroupLabel y optionGroupChildren cambian esas propiedades.':
    'With group, each top-level option is a group { label, items }; optionGroupLabel and optionGroupChildren change those properties.',
  'virtualScroll pinta solo las opciones visibles: aquí, 10 000 clientes. virtualScrollItemSize es el alto de cada fila y scrollHeight el de la lista.':
    'virtualScroll renders only the visible options: here, 10,000 customers. virtualScrollItemSize is the height of each row and scrollHeight that of the list.',
  'showClear muestra un botón para vaciar la selección cuando hay un valor.':
    'showClear shows a button to clear the selection when there is a value.',
  'Botón de limpiar': 'Clear button',
  'Con `filter`, el campo de búsqueda es el combobox que recibe el foco y anuncia la opción activa. Los grupos son `role="group"` nombrados por su título y, con `virtualScroll`, cada opción expone `aria-setsize` y `aria-posinset`.':
    'With `filter`, the search field is the combobox that receives focus and announces the active option. Groups are `role="group"` named by their title and, with `virtualScroll`, each option exposes `aria-setsize` and `aria-posinset`.',
  'Letras': 'Letters',
  'Saltan a la opción que empieza por lo escrito; repetir la misma letra recorre las coincidencias.':
    'Jump to the option that starts with what you type; repeating the same letter cycles through the matches.',
  'El panel usa `role="listbox"` con `aria-multiselectable="true"`; cada opción tiene `role="option"` con `aria-selected` y `aria-disabled`. `aria-activedescendant` indica la opción activa mientras se navega con el teclado.':
    'The panel uses `role="listbox"` with `aria-multiselectable="true"`; each option has `role="option"` with `aria-selected` and `aria-disabled`. `aria-activedescendant` points to the active option while navigating with the keyboard.',
  'Marca o desmarca la opción activa; el panel sigue abierto (en el filtro, Espacio escribe).':
    'Checks or unchecks the active option; the panel stays open (in the filter, Space types).',

  // --- DatePicker: rangos, hora y teclado ---
  'selectionMode="range": el primer clic marca el inicio y el segundo el fin (se ordenan solos). [(range)] es [inicio, fin].':
    'selectionMode="range": the first click sets the start and the second the end (they are ordered automatically). [(range)] is [start, end].',
  'showTime añade horas y minutos; hourFormat="12" usa AM/PM y stepMinute el paso de los minutos. Elegir un día no cierra el calendario.':
    'showTime adds hours and minutes; hourFormat="12" uses AM/PM and stepMinute sets the minute step. Choosing a day does not close the calendar.',
  'Rango de fechas': 'Date range',
  'Con hora': 'With time',
  'Una fecha o un rango [inicio, fin].': 'A single date or a range [start, end].',
  'Añade horas y minutos (solo en modo single).': 'Adds hours and minutes (single mode only).',
  'Formato de la hora: 24 h o 12 h con AM/PM.': 'Time format: 24 h or 12 h with AM/PM.',
  'Paso de los minutos.': 'Minute step.',
  'El calendario es un `role="dialog"` no modal; los días forman un `role="grid"`: cada día se nombra con su fecha completa, la celda elegida (o dentro del rango) tiene `aria-selected` y el día de hoy `aria-current="date"`. El mes visible se anuncia con `aria-live`.':
    'The calendar is a non-modal `role="dialog"`; days form a `role="grid"`: each day is named with its full date, the chosen cell (or those in the range) has `aria-selected` and today `aria-current="date"`. The visible month is announced with `aria-live`.',
  'Los días fuera de `minDate` / `maxDate` usan `aria-disabled`: se puede pasar por ellos con las flechas, pero no elegirlos. En modo rango, tras elegir el inicio se anuncia "Elige la fecha final"; con `showTime`, horas y minutos son campos numéricos etiquetados.':
    'Days outside `minDate` / `maxDate` use `aria-disabled`: the arrow keys can move through them, but they cannot be chosen. In range mode, "Choose the end date" is announced after picking the start; with `showTime`, hours and minutes are labelled number fields.',
  'Mismo día del mes anterior o siguiente.': 'Same day of the previous or next month.',
  'Mayús + Re Pág / Av Pág': 'Shift + Page Up / Page Down',
  'Mismo día del año anterior o siguiente.': 'Same day of the previous or next year.',
  'Selecciona el día activo (en modo rango, el inicio y luego el fin).':
    'Selects the active day (in range mode, the start and then the end).',

  'Rango elegido en modo range: [inicio, fin].': 'Range chosen in range mode: [start, end].',

  // --- Chart: tipos, formato, interacción y accesibilidad ---
  'Gráficos SVG accesibles y sin dependencias: barras, líneas, áreas, torta, dona y radial, con tooltip, leyenda interactiva y tabla de datos para lectores de pantalla.':
    'Accessible, dependency-free SVG charts: bars, lines, areas, pie, doughnut and radial, with tooltip, interactive legend and a data table for screen readers.',
  'El mismo data sirve para bar, horizontalBar, line y area. Pasa el ratón por el gráfico o enfócalo y usa las flechas.':
    'The same data works for bar, horizontalBar, line and area. Hover over the chart, or focus it and use the arrow keys.',
  'stacked apila las series de barras o de áreas; la escala se ajusta a la suma.':
    'stacked stacks bar or area series; the scale adjusts to the sum.',
  'En un gráfico bar, una serie con type: \'line\' se dibuja como línea. valueFormat acepta opciones de Intl.NumberFormat (moneda, porcentaje…) o una función; los negativos crecen hacia abajo desde el 0.':
    'In a bar chart, a series with type: \'line\' is drawn as a line. valueFormat accepts Intl.NumberFormat options (currency, percent…) or a function; negative values grow downwards from 0.',
  'pie y doughnut usan el primer dataset (colors fija un color por elemento); la dona muestra el total. radialBar dibuja un anillo por elemento respecto a max (100 por defecto).':
    'pie and doughnut use the first dataset (colors sets one color per item); the doughnut shows the total. radialBar draws one ring per item relative to max (100 by default).',
  'sparkline quita ejes, rejilla, leyenda y tarjeta: un minigráfico para tarjetas de resumen o celdas de tabla.':
    'sparkline removes axes, grid, legend and card: a mini chart for summary cards or table cells.',
  'itemSelect se emite al hacer clic en una categoría o un segmento, o al pulsar Enter mientras se recorre con el teclado.':
    'itemSelect is emitted when clicking a category or segment, or pressing Enter while exploring with the keyboard.',
  'Tipos cartesianos': 'Cartesian types',
  'Apilado': 'Stacked',
  'Combinado y moneda': 'Combo and currency',
  'Torta, dona y radial': 'Pie, doughnut and radial',
  'Selección': 'Selection',
  'Tipo de gráfico.': 'Chart type.',
  'Etiquetas y series (label, data, color, colors, type).':
    'Labels and series (label, data, color, colors, type).',
  'Apila las series de barras o áreas.': 'Stacks bar or area series.',
  'Minigráfico sin ejes, rejilla, leyenda ni tarjeta.':
    'Mini chart without axes, grid, legend or card.',
  'Alto del lienzo; el ancho se adapta al contenedor.':
    'Canvas height; the width adapts to the container.',
  'Muestra la leyenda (botones que ocultan y muestran series).':
    'Shows the legend (buttons that hide and show series).',
  'Formato de los valores en ejes, tooltip y tabla.': 'Value format for axes, tooltip and table.',
  'Locale BCP 47 del formato (por defecto, el del idioma activo de CaribeNG).':
    'BCP 47 locale for formatting (defaults to the active CaribeNG language).',
  'Valor que representa el 100 % en radialBar.': 'Value that represents 100 % in radialBar.',
  'Animación de entrada (respeta prefers-reduced-motion).':
    'Entry animation (respects prefers-reduced-motion).',
  'Nombre accesible del gráfico y título de su tabla de datos.':
    'Accessible name of the chart and caption of its data table.',
  'Clic o Enter sobre una categoría o un segmento: { index, label }.':
    'Click or Enter on a category or segment: { index, label }.',
  'El gráfico es un grupo enfocable nombrado con `ariaLabel`, con instrucciones de uso; el dibujo SVG es decorativo (`aria-hidden`).':
    'The chart is a focusable group named with `ariaLabel`, with usage instructions; the SVG drawing is decorative (`aria-hidden`).',
  'Incluye los mismos datos como una tabla oculta visualmente (título, series y valores formateados), que los lectores de pantalla pueden recorrer.':
    'It includes the same data as a visually hidden table (caption, series and formatted values) that screen readers can browse.',
  'Al moverse con las flechas, una región viva anuncia la categoría y sus valores (en torta y dona, el valor y el porcentaje). La leyenda son botones con `aria-pressed`.':
    'When moving with the arrow keys, a live region announces the category and its values (in pie and doughnut, the value and percentage). The legend items are buttons with `aria-pressed`.',
  'Enfoca el gráfico y muestra el primer dato.':
    'Focuses the chart and shows the first data point.',
  'Pasan a la categoría o segmento siguiente o anterior (de forma circular).':
    'Move to the next or previous category or segment (wrapping around).',
  'Van al primer o al último dato.': 'Go to the first or last data point.',
  'Selecciona el dato activo (emite itemSelect).':
    'Selects the active data point (emits itemSelect).',
  'Oculta el tooltip.': 'Hides the tooltip.',

  // --- Table nivel 2: lazy, columnas fijas, grupos y CSV ---
  'Datos desde el servidor: la tabla emite lazyLoad y muestra value tal cual.':
    'Server-side data: the table emits lazyLoad and shows value as is.',
  'Total de filas en el servidor (modo lazy), para el paginador.':
    'Total rows on the server (lazy mode), for the paginator.',
  'Capa de carga y aria-busy.': 'Loading overlay and aria-busy.',
  'Alto máximo (CSS): la tabla hace scroll con la cabecera fija.':
    'Maximum height (CSS): the table scrolls with a fixed header.',
  'Agrupa las filas por este campo, con una cabecera por grupo.':
    'Groups rows by this field, with a header per group.',
  'Modo lazy: { first, rows, sortField, sortOrder, globalFilter, filters } a pedir al servidor.':
    'Lazy mode: { first, rows, sortField, sortOrder, globalFilter, filters } to request from the server.',
  'Tabla de datos con columnas declarativas, ordenación, filtros, paginación, selección, columnas redimensionables y fijas, filas expandibles y agrupadas, exportación a CSV y carga desde el servidor.':
    'Data table with declarative columns, sorting, filters, pagination, selection, resizable and frozen columns, expandable and grouped rows, CSV export and server-side loading.',
  'Con lazy la tabla no filtra, ordena ni pagina: emite lazyLoad con la página, el orden y los filtros, y muestra en value la página que devuelva tu API. totalRecords alimenta el paginador y loading muestra la capa de carga. Aquí, un servidor simulado con 57 movimientos.':
    'With lazy the table does not filter, sort or paginate: it emits lazyLoad with the page, sort and filters, and shows in value the page your API returns. totalRecords feeds the paginator and loading shows the overlay. Here, a simulated server with 57 transactions.',
  'scrollHeight limita el alto y deja la cabecera fija; frozen: true ancla una columna a la izquierda al desplazarse en horizontal (las fijas se muestran primero).':
    'scrollHeight limits the height and keeps the header fixed; frozen: true pins a column to the left when scrolling horizontally (frozen columns are shown first).',
  'groupRowsBy agrupa las filas por un campo y añade una cabecera por grupo con su recuento; la plantilla cbTableGroupHeader la personaliza.':
    'groupRowsBy groups rows by a field and adds a header per group with its count; the cbTableGroupHeader template customizes it.',
  'exportCSV() descarga las filas filtradas y ordenadas (todas, no solo la página) con BOM para que Excel respete tildes; toCSV() devuelve el texto. exportable: false excluye una columna y selectionOnly exporta solo lo seleccionado.':
    'exportCSV() downloads the filtered and sorted rows (all of them, not just the page) with a BOM so Excel keeps accents; toCSV() returns the text. exportable: false excludes a column and selectionOnly exports only the selection.',
  'Datos desde el servidor (lazy)': 'Server-side data (lazy)',
  'Cabecera y columnas fijas': 'Fixed header and frozen columns',
  'Exportar a CSV': 'Export to CSV',
  'Agrupación': 'Grouping',
  'Las cabeceras de grupo son celdas `th scope="rowgroup"`. Mientras `loading` está activo la tabla expone `aria-busy="true"` y la capa de carga es un `role="status"`.':
    'Group headers are `th scope="rowgroup"` cells. While `loading` is on, the table exposes `aria-busy="true"` and the loading overlay is a `role="status"`.',

  // --- Componentes nuevos: SplitButton, Empty, Descriptions, Result, Statistic, KeyFilter, Anchor, Repeater ---
  'Índice de la página que resalta la sección visible y lleva a cada una, teniendo en cuenta la cabecera fija.':
    'Page index that highlights the visible section and takes you to each one, taking the fixed header into account.',
  'links apunta a los id de las secciones (admite un nivel de anidación). offset es el alto de la cabecera fija; activeChange avisa de la sección visible. Este índice recorre las secciones de esta misma página.':
    'links point to the section ids (one nesting level is supported). offset is the fixed header height; activeChange reports the visible section. This index walks through the sections of this very page.',
  'Lista de pares etiqueta / valor para mostrar el detalle de un registro: un cliente, una cuenta o una transacción.':
    'List of label / value pairs to show the details of a record: a customer, an account or a transaction.',
  'items define los pares; columns, las columnas en pantallas anchas (en móvil siempre una). span hace que un elemento ocupe varias.':
    'items defines the pairs; columns, the columns on wide screens (always one on mobile). span makes an item take several.',
  'bordered separa los elementos en celdas; layout="horizontal" pone la etiqueta junto al valor.':
    'bordered splits the items into cells; layout="horizontal" puts the label next to the value.',
  'Con bordes y en horizontal': 'Bordered and horizontal',
  'Mensaje principal.': 'Main message.',
  'Texto de apoyo.': 'Supporting text.',
  'Icono (se ignora si hay image).': 'Icon (ignored when image is set).',
  'Ilustración decorativa opcional.': 'Optional decorative illustration.',
  'sm para tablas y paneles.': 'sm for tables and panels.',
  'Pares etiqueta / valor (label, value, key, span).':
    'Label / value pairs (label, value, key, span).',
  'Título (encabezado) del bloque.': 'Block title (heading).',
  'Nivel del encabezado del título.': 'Heading level of the title.',
  'Columnas en pantallas anchas.': 'Columns on wide screens.',
  'Etiqueta encima o al lado del valor.': 'Label above or next to the value.',
  'Bordes entre elementos.': 'Borders between items.',
  'Tipo de resultado (icono y color).': 'Result type (icon and color).',
  'Icono propio en lugar del del estado.': 'Custom icon instead of the status one.',
  'Enlaces a los id de las secciones (label, href, children).':
    'Links to the section ids (label, href, children).',
  'Alto (px) de la cabecera fija.': 'Fixed header height (px).',
  'Nombre de la navegación.': 'Navigation name.',
  'Sección visible (su href).': 'Visible section (its href).',
  'Texto de la acción principal (también nombra el grupo).':
    'Main action text (also names the group).',
  'Icono de la acción principal.': 'Main action icon.',
  'Acciones secundarias del menú.': 'Secondary menu actions.',
  'Deshabilita los dos botones.': 'Disables both buttons.',
  'Spinner en la acción principal.': 'Spinner on the main action.',
  'Nombre del botón de la flecha y del menú.': 'Name of the arrow button and the menu.',
  'Clic en la acción principal.': 'Click on the main action.',
  'Acción secundaria elegida.': 'Chosen secondary action.',
  'Título de la cifra.': 'Figure title.',
  'Valor (número formateado o texto tal cual).': 'Value (formatted number or text as is).',
  'Texto antes del valor.': 'Text before the value.',
  'Texto después del valor.': 'Text after the value.',
  'Opciones de Intl.NumberFormat.': 'Intl.NumberFormat options.',
  'Locale BCP 47 del formato.': 'BCP 47 locale for formatting.',
  'Tendencia: flecha, color y texto para lectores de pantalla.':
    'Trend: arrow, color and text for screen readers.',
  'Texto junto a la tendencia.': 'Text next to the trend.',
  'Estado vacío: qué pasa cuando una lista, búsqueda o tabla no tiene datos, y qué puede hacer el usuario.':
    'Empty state: what happens when a list, search or table has no data, and what the user can do.',
  'title, description y las acciones proyectadas como contenido.':
    'title, description and the actions projected as content.',
  'size="sm" para tablas y paneles. Sin title usa "Sin datos" del idioma activo.':
    'size="sm" for tables and panels. Without title it uses "No data" from the active language.',
  'Dentro de una tabla': 'Inside a table',
  'Directiva que limita los caracteres que se pueden escribir o pegar en un campo.':
    'Directive that limits the characters that can be typed or pasted into a field.',
  'int, pint (enteros positivos), num, pnum, money, alpha, alphanum, hex y email. Filtra lo tecleado, lo pegado y lo autocompletado.':
    'int, pint (positive integers), num, pnum, money, alpha, alphanum, hex and email. It filters what is typed, pasted and autocompleted.',
  'Una RegExp que debe cumplir cada carácter; aquí, placas en mayúsculas y números.':
    'A RegExp each character must match; here, uppercase and numeric license plates.',
  'En los componentes de CaribeNG aplícala al input nativo que proyectan, o usa sus propios filtros (InputNumber, InputMask).':
    'With CaribeNG components, apply it to the native input they project, or use their own filters (InputNumber, InputMask).',
  'Filtros predefinidos': 'Built-in filters',
  'Expresión propia': 'Custom expression',
  'Con cb-input': 'With cb-input',
  'Lista repetible de campos sobre un FormArray: agregar y quitar beneficiarios, teléfonos o direcciones.':
    'Repeatable list of fields over a FormArray: add and remove beneficiaries, phone numbers or addresses.',
  'formArray y createItem (crea el control de un elemento nuevo). La plantilla cbRepeaterItem recibe el FormGroup de cada elemento; min y max limitan cuántos hay.':
    'formArray and createItem (creates the control of a new item). The cbRepeaterItem template receives each item FormGroup; min and max limit how many there are.',
  'Pantalla de resultado de una operación (éxito, error, aviso) o de error de navegación (404, 403, 500), con acciones.':
    'Result screen for an operation (success, error, warning) or a navigation error (404, 403, 500), with actions.',
  'status define el icono y el color; las acciones se proyectan como contenido.':
    'status sets the icon and color; actions are projected as content.',
  'success, error, warning, info y los errores HTTP 404, 403 y 500 (muestran el código en grande).':
    'success, error, warning, info and the HTTP errors 404, 403 and 500 (they show the code in large type).',
  'Estados': 'Statuses',
  'Una acción principal y un menú con acciones secundarias relacionadas, en un solo control.':
    'A main action and a menu of related secondary actions, in a single control.',
  'primaryClick se emite al pulsar la acción principal; la flecha abre el menú con items e itemSelect avisa de la opción elegida.':
    'primaryClick is emitted when pressing the main action; the arrow opens the menu with items and itemSelect reports the chosen option.',
  'Acepta las mismas severity, variant y size que Button.':
    'Accepts the same severity, variant and size as Button.',
  'Severidad, variante y tamaño': 'Severity, variant and size',
  'Cifras destacadas para dashboards, con formato, tendencia y cuenta regresiva.':
    'Highlighted figures for dashboards, with formatting, trend and countdown.',
  'format recibe opciones de Intl.NumberFormat (moneda, porcentaje, decimales) y locale el idioma del formato; prefix y suffix añaden texto alrededor.':
    'format takes Intl.NumberFormat options (currency, percent, decimals) and locale the formatting language; prefix and suffix add text around it.',
  'trend añade flecha, color y el texto "aumenta" / "disminuye" para el lector de pantalla; trendLabel, el detalle.':
    'trend adds an arrow, color and the text "up" / "down" for screen readers; trendLabel, the detail.',
  'cb-countdown cuenta hasta target (una fecha) y emite finished al llegar a cero. Es un role="timer": no anuncia cada segundo.':
    'cb-countdown counts down to target (a date) and emits finished at zero. It is a role="timer": it does not announce every second.',
  'Tendencia': 'Trend',
  'Cuenta regresiva': 'Countdown',
  'El control es un `role="group"` nombrado con `label`. La flecha es un botón con nombre ("Más acciones"), `aria-haspopup="menu"` y `aria-expanded`; el menú sigue el patrón *menu*.':
    'The control is a `role="group"` named with `label`. The arrow is a named button ("More actions") with `aria-haspopup="menu"` and `aria-expanded`; the menu follows the *menu* pattern.',
  'Pasa de la acción principal a la flecha.': 'Moves from the main action to the arrow.',
  'Ejecuta la acción principal o abre el menú.': 'Runs the main action or opens the menu.',
  'Sobre la flecha, abre el menú.': 'On the arrow, opens the menu.',
  'Cierra el menú y devuelve el foco a la flecha.':
    'Closes the menu and returns focus to the arrow.',
  'El icono o la ilustración son decorativos; el título y la descripción son texto normal y las acciones, botones o enlaces proyectados.':
    'The icon or illustration is decorative; the title and description are plain text and the actions are projected buttons or links.',
  'Usa una lista de descripción nativa (`dl`, `dt`, `dd`), así cada valor se lee junto a su etiqueta. El título es un encabezado (`headingLevel`) que nombra la lista.':
    'It uses a native description list (`dl`, `dt`, `dd`), so each value is read with its label. The title is a heading (`headingLevel`) that names the list.',
  'El título es un encabezado (`headingLevel`, 2 por defecto) y el icono o el código HTTP son decorativos. Si el resultado aparece sin cambiar de página, mueve el foco al título o anúncialo con un Toast.':
    'The title is a heading (`headingLevel`, 2 by default) and the icon or HTTP code is decorative. If the result appears without a page change, move focus to the title or announce it with a Toast.',
  'La tendencia no depende solo del color: incluye el texto "aumenta" / "disminuye" para lectores de pantalla. `cb-countdown` es un `role="timer"`: no anuncia cada segundo, pero el valor se puede consultar.':
    'The trend does not rely on color alone: it includes the text "up" / "down" for screen readers. `cb-countdown` is a `role="timer"`: it does not announce every second, but the value can be queried.',
  'Solo restringe lo que se escribe; no sustituye a la validación. Indica el formato esperado en la etiqueta o en un texto de ayuda y usa el `inputmode` adecuado (numeric, decimal, email) para mostrar el teclado correcto en móviles.':
    'It only restricts what is typed; it does not replace validation. State the expected format in the label or a hint and use the right `inputmode` (numeric, decimal, email) to show the correct keyboard on mobile.',
  'Es una `nav` nombrada ("En esta página") con listas de enlaces; la sección visible se marca con `aria-current="location"`.':
    'It is a named `nav` ("On this page") with lists of links; the visible section is marked with `aria-current="location"`.',
  'Al elegir un enlace, el foco pasa a la sección de destino (con `tabindex="-1"`), así el lector continúa leyendo desde ahí.':
    'When a link is chosen, focus moves to the target section (with `tabindex="-1"`), so the screen reader continues reading from there.',
  'Recorre los enlaces del índice.': 'Moves through the index links.',
  'Va a la sección y le pasa el foco.': 'Goes to the section and moves focus to it.',
  'Cada elemento es un `role="group"` nombrado ("Beneficiario 2") con su botón "Quitar Beneficiario 2". Al agregar o quitar, una región viva lo anuncia.':
    'Each item is a named `role="group"` ("Beneficiary 2") with its "Remove Beneficiary 2" button. A live region announces additions and removals.',
  'Al agregar, el foco pasa al primer campo del elemento nuevo; al quitar, al elemento anterior (o al botón de agregar si no queda ninguno).':
    'When adding, focus moves to the first field of the new item; when removing, to the previous item (or the add button if none is left).',
  'Recorre los campos, los botones de quitar y el de agregar.':
    'Moves through the fields, the remove buttons and the add button.',
  'Agrega o quita un elemento.': 'Adds or removes an item.',

  // --- Slider (rango) y ThemeToggle ---
  'Rango': 'Range',
  'range añade un segundo tirador y [(rangeValue)] enlaza el par [mínimo, máximo]; los tiradores no se cruzan. valueFormat da formato al valor visible (showValue) y al que anuncia el lector de pantalla.':
    'range adds a second thumb and [(rangeValue)] binds the [min, max] pair; the thumbs never cross. valueFormat formats both the visible value (showValue) and the one announced by screen readers.',
  'Dos tiradores para elegir un rango ([(rangeValue)]).': 'Two thumbs to pick a range ([(rangeValue)]).',
  'Valor en modo range: [mínimo, máximo].': 'Value in range mode: [min, max].',
  'Muestra el valor encima de cada tirador.': 'Shows the value above each thumb.',
  'Formato del valor visible y de aria-valuetext.': 'Format of the visible value and of aria-valuetext.',
  'Nombre accesible; en rango se completa con mínimo / máximo.': 'Accessible name; in range mode it is completed with minimum / maximum.',
  'Nuevo rango (modo range).': 'New range (range mode).',
  'Muestra el texto además del icono.': 'Shows the text next to the icon.',
  'Botón listo para usar que alterna entre tema claro y oscuro con CbThemeService.':
    'Ready-to-use button that switches between light and dark theme with CbThemeService.',
  'Cambia el tema de toda la aplicación (pruébalo: cambia también este sitio). Con provideCaribeNG({ persistTheme: true }) recuerda la elección.':
    'Changes the theme of the whole application (try it: it switches this site too). With provideCaribeNG({ persistTheme: true }) it remembers the choice.',
  'Con `range` hay dos sliders ("Precio mínimo" / "Precio máximo") cuyos límites dependen del otro, así no se cruzan. Con `valueFormat`, `aria-valuetext` anuncia el valor con formato (p. ej. "$ 300.000").':
    'With `range` there are two sliders ("Price minimum" / "Price maximum") whose limits depend on each other, so they never cross. With `valueFormat`, `aria-valuetext` announces the formatted value (e.g. "$300,000").',
  'Es un botón cuyo nombre describe la acción ("Cambiar a tema oscuro" / "Cambiar a tema claro") y cambia tras pulsarlo; el icono es decorativo.':
    'It is a button whose name describes the action ("Switch to dark theme" / "Switch to light theme") and changes after pressing it; the icon is decorative.',
  'Cambia de tema.': 'Switches the theme.',

  // --- PDF Viewer ---
  'Documento: URL, bytes o un Blob / File.': 'Document: URL, bytes or a Blob / File.',
  'Página actual (desde 1).': 'Current page (from 1).',
  'Ajustar al ancho, página completa o un factor (1 = 100 %).': 'Fit to width, fit page or a factor (1 = 100%).',
  'Giro del documento.': 'Document rotation.',
  'Nombre del archivo al descargar.': 'File name when downloading.',
  'Contraseña para abrir el documento sin pedirla.': 'Password to open the document without asking for it.',
  'Envía cookies en peticiones a otro origen.': 'Sends cookies on cross-origin requests.',
  'Cabeceras HTTP para descargar el documento.': 'HTTP headers used to download the document.',
  'Muestra la barra de herramientas.': 'Shows the toolbar.',
  'Búsqueda en la barra.': 'Search in the toolbar.',
  'Botón y panel de miniaturas.': 'Thumbnails button and panel.',
  'Botón de girar.': 'Rotate button.',
  'Botón de descargar.': 'Download button.',
  'Botón de imprimir (y Ctrl+P).': 'Print button (and Ctrl+P).',
  'Nombre accesible del visor.': 'Accessible name of the viewer.',
  'Documento abierto.': 'Document opened.',
  'No se pudo abrir el documento.': 'The document could not be opened.',
  'El visor usa pdf.js de Mozilla (licencia Apache-2.0), una dependencia opcional: solo la instalan las aplicaciones que usan el visor, y se descarga al abrir el primer documento. Copia su worker y sus recursos en los assets para servirlos desde tu propio dominio (sin CDN), lo que también cumple políticas CSP estrictas.':
    "The viewer uses Mozilla's pdf.js (Apache-2.0 license), an optional dependency: only apps that use the viewer install it, and it is downloaded when the first document opens. Copy its worker and resources into your assets to serve them from your own domain (no CDN), which also works with strict CSP policies.",
  'src acepta una URL, un ArrayBuffer, un Uint8Array o un Blob / File. Las páginas se renderizan a medida que se ven. Prueba a buscar "direccion": la búsqueda ignora tildes y mayúsculas.':
    'src accepts a URL, an ArrayBuffer, a Uint8Array or a Blob / File. Pages are rendered as they come into view. Try searching for "direccion": search ignores accents and case.',
  "[(page)], [(zoom)] y [(sidebar)] son bidireccionales. zoom acepta 'page-width', 'page-fit' o un factor (1 = 100 %, tamaño real).":
    "[(page)], [(zoom)] and [(sidebar)] are two-way. zoom accepts 'page-width', 'page-fit' or a factor (1 = 100%, actual size).",
  'Si el PDF está cifrado, el visor pide la contraseña y avisa si es incorrecta. También puedes pasarla con [password]. La contraseña de este ejemplo es caribe.':
    'If the PDF is encrypted, the viewer asks for the password and tells you when it is wrong. You can also pass it with [password]. The password for this example is caribe.',
  'Con un File de un input type=file el documento se abre sin subirlo a ningún servidor. fileName define el nombre al descargar.':
    'With a File from an input type=file, the document opens without being uploaded to any server. fileName sets the name used when downloading.',
  'Sin la barra (showToolbar en false), controla el visor con sus métodos: goToPage, zoomIn, zoomOut, rotate, search, findNext, findPrevious, download y print.':
    'Without the toolbar (showToolbar set to false), control the viewer with its methods: goToPage, zoomIn, zoomOut, rotate, search, findNext, findPrevious, download and print.',
  'Instalación': 'Installation',
  'Página, zoom y miniaturas': 'Page, zoom and thumbnails',
  'Documento con contraseña': 'Password-protected document',
  'Archivo local': 'Local file',
  'Barra propia': 'Custom toolbar',
  'El visor es una región con nombre ("Visor de PDF") y cada página es un grupo con nombre ("Página 2 de 3"). El canvas es decorativo: el texto del PDF está en una capa transparente encima, así que el lector de pantalla lo lee y se puede seleccionar y copiar. Un PDF escaneado sin texto no tiene contenido legible.':
    'The viewer is a named region ("PDF viewer") and each page is a named group ("Page 2 of 3"). The canvas is decorative: the PDF text sits in a transparent layer on top, so screen readers read it and it can be selected and copied. A scanned PDF without text has no readable content.',
  'Todos los botones de la barra tienen nombre; el de miniaturas indica con `aria-expanded` si el panel está abierto, y la miniatura de la página actual tiene `aria-current="page"`.':
    'Every toolbar button has a name; the thumbnails button reports with `aria-expanded` whether the panel is open, and the current page thumbnail has `aria-current="page"`.',
  'El resultado de la búsqueda ("3 de 12", "Sin resultados") se anuncia en una región `aria-live`. El campo de página se describe con el total ("de 3").':
    'The search result ("3 of 12", "No results found") is announced in an `aria-live` region. The page field is described by the total ("of 3").',
  'Si el documento tiene contraseña, el formulario la pide con una etiqueta visible y anuncia con `role="alert"` si es incorrecta. Los errores de carga también usan `role="alert"`.':
    'If the document has a password, the form asks for it with a visible label and announces with `role="alert"` when it is wrong. Loading errors also use `role="alert"`.',
  'Recorre la barra, el panel de miniaturas y el documento (que se desplaza con las flechas, Re Pág / Av Pág e Inicio / Fin).':
    'Moves through the toolbar, the thumbnails panel and the document (which scrolls with the arrows, Page Up / Page Down and Home / End).',
  'Enter / Mayús + Enter': 'Enter / Shift + Enter',
  'En la búsqueda: coincidencia siguiente / anterior.': 'In the search: next / previous match.',
  'En la búsqueda: la vacía y quita los resaltados.': 'In the search: clears it and removes the highlights.',
  'Flecha arriba / abajo': 'Up / Down arrow',
  'En las miniaturas: mueve el foco a la página anterior / siguiente.': 'In the thumbnails: moves focus to the previous / next page.',
  'Ctrl + F': 'Ctrl + F',
  'Lleva el foco a la búsqueda del documento.': 'Moves focus to the document search.',
  'Ctrl + + / Ctrl + - / Ctrl + 0': 'Ctrl + + / Ctrl + - / Ctrl + 0',
  'Acerca, aleja o ajusta al ancho.': 'Zooms in, zooms out or fits to width.',
  'Ctrl + P': 'Ctrl + P',
  'Imprime el documento (no la página).': 'Prints the document (not the page).',

  // --- Playground (props completadas) ---
  'Color del botón de aceptar.': 'Color of the accept button.',
  'Filas: objetos con una propiedad por columna.': 'Rows: objects with one property per column.',
  'Muestra el selector de vista lista / cuadrícula.': 'Shows the list / grid view switch.',
  'Elementos por página (0 = sin paginar).': 'Items per page (0 = no pagination).',
  'Propiedad que identifica cada elemento.': 'Property that identifies each item.',
  'Título de la lista.': 'List title.',
  'Título de la lista de origen.': 'Source list title.',
  'Título de la lista de destino.': 'Target list title.',
  'Nombre accesible (si difiere de label).': 'Accessible name (if it differs from label).',
  'Lado del contenido respecto a la línea.': 'Side of the content relative to the line.',
  'Filas extra que se pintan fuera de la vista.': 'Extra rows rendered outside the view.',
  // --- Chart: tipos nuevos ---
  'Gráficos SVG accesibles y sin dependencias: barras, líneas, áreas, cascada, torta, dona, radial, medidor, radar, área polar, mapa de calor y treemap, con tooltip, leyenda interactiva y tabla de datos para lectores de pantalla.': 'Accessible, dependency-free SVG charts: bar, line, area, waterfall, pie, doughnut, radial, gauge, radar, polar area, heatmap and treemap, with tooltip, interactive legend and a data table for screen readers.',
  'Cada barra sube o baja desde el acumulado anterior: verde si suma, rojo si resta. Las posiciones de sums son subtotales o totales y van desde 0 hasta el acumulado.': 'Each bar rises or falls from the previous running total: green when it adds, red when it subtracts. The positions in sums are subtotals or totals and go from 0 to the running total.',
  'Muestra un valor entre min y max (0 y 100 por defecto). bands dibuja franjas de umbral y, si la serie no tiene color, el arco toma el de la franja donde cae el valor.': 'Shows a value between min and max (0 and 100 by default). bands draws threshold ranges and, if the series has no color, the arc takes the color of the range the value falls in.',
  'radar dibuja un eje por categoría y un polígono por serie, para comparar perfiles. polarArea reparte el círculo en sectores iguales cuyo radio depende del valor.': 'radar draws one axis per category and one polygon per series, to compare profiles. polarArea splits the circle into equal sectors whose radius depends on the value.',
  'labels son las columnas y cada dataset es una fila; el color indica el valor, con la escala abajo. Las flechas izquierda y derecha recorren una fila y arriba y abajo cambian de fila.': 'labels are the columns and each dataset is a row; the color shows the value, with the scale below. Left and right arrows move along a row and up and down change rows.',
  'Rectángulos de área proporcional a cada valor del primer dataset; el teclado los recorre de mayor a menor y la leyenda oculta elementos.': 'Rectangles with an area proportional to each value of the first dataset; the keyboard goes through them from largest to smallest and the legend hides items.',
  'Cascada (waterfall)': 'Waterfall',
  'Medidor (gauge)': 'Gauge',
  'Radar y área polar': 'Radar and polar area',
  'Mapa de calor (heatmap)': 'Heatmap',
  'Valor mínimo del medidor (gauge).': 'Minimum value of the gauge.',
  'Valor que representa el 100 % en radialBar y el máximo del medidor (gauge).': 'Value that represents 100% in radialBar and the maximum of the gauge.',
  'Franjas de color del medidor: { from, to, color }.': 'Color ranges of the gauge: { from, to, color }.',
  'Clic o Enter sobre una categoría, un segmento o una celda: { index, label }.': 'Click or Enter on a category, a segment or a cell: { index, label }.',
  'Lado del icono.': 'Side of the icon.',
  'Valor que representa este radio (obligatorio).': 'Value this radio represents (required).',
  'Al moverse con las flechas, una región viva anuncia la categoría y sus valores (en torta, dona, medidor y treemap, el valor y el porcentaje; en la cascada, la variación y el total acumulado; en el mapa de calor, la fila, la columna y el valor). La leyenda son botones con `aria-pressed`.': 'When moving with the arrows, a live region announces the category and its values (in pie, doughnut, gauge and treemap, the value and the percentage; in the waterfall, the change and the running total; in the heatmap, the row, the column and the value). The legend items are buttons with `aria-pressed`.',
  'En el mapa de calor la tabla oculta tiene una columna por cada etiqueta y una fila por dataset; el color nunca es la única pista: cada celda tiene su valor en el tooltip y en la tabla.': 'In the heatmap the hidden table has one column per label and one row per dataset; color is never the only cue: each cell has its value in the tooltip and in the table.',
  'Pasan a la categoría, segmento o celda siguiente o anterior (de forma circular).': 'Move to the next or previous category, segment or cell (wrapping around).',
  'Flecha arriba / abajo (mapa de calor)': 'Up / Down arrow (heatmap)',
  'Cambian de fila manteniendo la columna.': 'Change rows keeping the column.',
  // --- Chart: modo composable ---
  'Con series hijas, data es un array de registros y cada serie elige sus campos (x, y…). Se combinan tipos, cada serie va al eje izquierdo o derecho y se añaden ejes y referencias con sus propias etiquetas.': 'With child series, data is an array of records and each series picks its fields (x, y…). Types can be combined, each series goes to the left or right axis, and axes and references are added with their own tags.',
  'cb-chart-candlestick lee apertura, máximo, mínimo y cierre; con fechas en x el eje es de tiempo. zoom permite acercar con la rueda o con + y −, desplazarse arrastrando y volver con doble clic, 0 o el botón.': 'cb-chart-candlestick reads open, high, low and close; with dates in x the axis is a time axis. zoom lets you zoom in with the wheel or with + and −, pan by dragging and go back with a double click, 0 or the button.',
  'cb-chart-range-area dibuja una banda entre low y high (un intervalo de confianza, un mínimo y máximo); dashed marca una proyección y points en false quita los puntos.': 'cb-chart-range-area draws a band between low and high (a confidence interval, a minimum and maximum); dashed marks a projection and points set to false removes the dots.',
  'Con números en x el eje es lineal. Cada punto es un elemento: el teclado los recorre de izquierda a derecha y anuncia sus dos valores.': 'With numbers in x the axis is linear. Each point is an item: the keyboard goes through them from left to right and announces both values.',
  'Todas las series aceptan name, x, color, axis (left o right) y data (sus propios registros). Se importan desde @caribeng/ui/chart junto a CbChart.': 'Every series accepts name, x, color, axis (left or right) and data (its own records). They are imported from @caribeng/ui/chart along with CbChart.',
  'Modo composable': 'Composable mode',
  'Velas, eje de tiempo y zoom': 'Candlesticks, time axis and zoom',
  'Rangos y proyecciones': 'Ranges and projections',
  'Dispersión': 'Scatter',
  'Piezas del modo composable': 'Composable mode parts',
  'Alto en píxeles; el ancho se adapta al contenedor.': 'Height in pixels; the width adapts to the container.',
  'Modo composable: zoom y desplazamiento en el eje X (rueda, arrastre, + / − / 0).': 'Composable mode: zoom and pan on the X axis (wheel, drag, + / − / 0).',
  'En el modo composable la tabla oculta tiene una columna por serie y una fila por valor de X (fechas completas en el eje de tiempo); las velas muestran apertura, máximo, mínimo y cierre. Las instrucciones explican el zoom cuando está activo, y el botón "Restablecer zoom" es un botón nativo.': 'In composable mode the hidden table has one column per series and one row per X value (full dates on the time axis); candlesticks show open, high, low and close. The instructions explain zoom when it is on, and the "Reset zoom" button is a native button.',
  '+ / − / 0 (con zoom)': '+ / − / 0 (with zoom)',
  'Acercan y alejan alrededor del dato activo, o vuelven a mostrar todo.': 'Zoom in and out around the active data point, or show everything again.',
  // --- Chart: grupos, tiempo real y exportar ---
  'cb-chart-group comparte el cursor y el zoom entre gráficas con el mismo eje X. xWindow muestra los últimos minutos y, al llegar datos, la vista avanza con ellos. cb-chart-annotation marca puntos concretos.': 'cb-chart-group shares the cursor and the zoom between charts with the same X axis. xWindow shows the last minutes and, as data arrives, the view moves along with it. cb-chart-annotation marks specific points.',
  'download(\'png\' | \'svg\', nombre) descarga el gráfico con los colores del tema y la leyenda; toSvg() y toPng() devuelven el SVG o la imagen para enviarlos o adjuntarlos.': 'download(\'png\' | \'svg\', name) downloads the chart with the theme colors and the legend; toSvg() and toPng() return the SVG or the image to send or attach it.',
  'Gráficas sincronizadas y en vivo': 'Synced and live charts',
  'Exportar': 'Export',
  'Modo composable: muestra los últimos xWindow del eje X (ms en un eje de tiempo); la vista avanza con los datos nuevos.': 'Composable mode: shows the last xWindow of the X axis (ms on a time axis); the view moves along with new data.',
  'En `cb-chart-group` (un `role="group"` con nombre) el cursor se comparte entre las gráficas, pero solo anuncia la que tiene el foco. Las anotaciones se incluyen en el anuncio y el tooltip de su punto.': 'In `cb-chart-group` (a named `role="group"`) the cursor is shared between the charts, but only the focused one announces it. Annotations are included in the announcement and the tooltip of their point.',
  // --- DatePicker: formato, meses, hora en rango y vistas ---
  'Selector de fecha, rango, mes o año con calendario en overlay, hora, formato configurable, escritura directa, navegación por teclado y ControlValueAccessor.': 'Date, range, month or year picker with an overlay calendar, time, configurable format, direct typing, keyboard navigation and ControlValueAccessor.',
  'selectionMode="range": el primer clic marca el inicio y el segundo el fin (se ordenan solos). [(range)] es [inicio, fin]. Muestra dos meses a la vez; numberOfMonths cambia cuántos.': 'selectionMode="range": the first click sets the start and the second the end (they are ordered automatically). [(range)] is [start, end]. It shows two months at once; numberOfMonths changes how many.',
  'Con showTime, un rango tiene hora de inicio y de fin; el calendario sigue abierto tras elegir el fin para ajustarlas.': 'With showTime, a range has a start and an end time; the calendar stays open after choosing the end so you can adjust them.',
  'view="month" elige un mes (el valor es el día 1) y view="year" un año (el 1 de enero). En la vista de días, el título del mes también lleva a los meses y los años para saltar rápido.': 'view="month" picks a month (the value is day 1) and view="year" a year (January 1). In the day view, the month title also opens the months and years to jump quickly.',
  'dateFormat define cómo se escribe la fecha, con la misma sintaxis que PrimeNG. Sin él, el campo usa el formato largo del locale.': 'dateFormat defines how the date is written, with the same syntax as PrimeNG. Without it, the field uses the long format of the locale.',
  'editable permite teclear la fecha con dateFormat (o el formato numérico del locale); se aplica con Enter o al salir del campo, y si no es válida avisa del formato esperado. El calendario se abre con el botón o con la flecha abajo.': 'editable lets you type the date with dateFormat (or the numeric format of the locale); it is applied with Enter or when leaving the field, and if it is not valid it shows the expected format. The calendar opens with the button or the down arrow.',
  'Rango con hora': 'Range with time',
  'Mes o año': 'Month or year',
  'Formato': 'Format',
  'Escribir la fecha': 'Typing the date',
  'Qué se elige: un día, un mes (día 1) o un año (1 de enero).': 'What is picked: a day, a month (day 1) or a year (January 1).',
  'Meses visibles a la vez; por defecto 2 en rangos y 1 en fecha simple.': 'Months visible at once; by default 2 in ranges and 1 for a single date.',
  'Formato con la sintaxis de PrimeNG (d, dd, D, DD, m, mm, M, MM, y, yy, o, oo, @, !, \'texto\').': 'Format with the PrimeNG syntax (d, dd, D, DD, m, mm, M, MM, y, yy, o, oo, @, !, \'text\').',
  'Permite escribir la fecha con dateFormat (se aplica con Enter o al salir).': 'Lets you type the date with dateFormat (applied with Enter or on leaving the field).',
  'Añade horas y minutos (en rangos, del inicio y del fin).': 'Adds hours and minutes (in ranges, for the start and the end).',
  'Día del mes (sin cero / dos dígitos)': 'Day of month (no leading zero / two digits)',
  'Día del año (sin ceros / tres dígitos)': 'Day of year (no leading zeros / three digits)',
  'Nombre del día (corto / largo)': 'Day name (short / long)',
  'Mes (sin cero / dos dígitos)': 'Month (no leading zero / two digits)',
  'Nombre del mes (corto / largo)': 'Month name (short / long)',
  'Año (dos / cuatro dígitos)': 'Year (two / four digits)',
  'Marca de tiempo Unix (ms desde 01/01/1970)': 'Unix timestamp (ms since 01/01/1970)',
  'Ticks de Windows (100 ns desde 01/01/0001)': 'Windows ticks (100 ns since 01/01/0001)',
  'Texto literal': 'Literal text',
  'Comilla simple': 'Single quote',
  'Con varios meses, cada mes es su propia cuadrícula nombrada con el mes y el año. El título del mes es un botón ("Octubre de 2026. Elegir mes") que lleva a las vistas de meses y años, también cuadrículas con `aria-selected` y `aria-current`.': 'With several months, each month is its own grid named with the month and year. The month title is a button ("October 2026. Choose month") that opens the month and year views, which are also grids with `aria-selected` and `aria-current`.',
  'Con `editable` el campo admite escribir la fecha; si el texto no es una fecha válida se marca `aria-invalid` y un `role="alert"` indica el formato esperado. En rangos con hora, cada fila de hora es un grupo nombrado ("Hora de inicio", "Hora de fin").': 'With `editable` the field accepts a typed date; if the text is not a valid date it gets `aria-invalid` and a `role="alert"` shows the expected format. In ranges with time, each time row is a named group ("Start time", "End time").',
  'En el campo, abre el calendario (con editable: Enter aplica lo escrito y Flecha abajo abre).': 'In the field, opens the calendar (with editable: Enter applies what was typed and Down arrow opens it).',
  'Flechas / Re Pág / Av Pág (meses y años)': 'Arrows / Page Up / Page Down (months and years)',
  'Mes o año anterior o siguiente, una fila arriba o abajo, y año o década anterior o siguiente.': 'Previous or next month or year, one row up or down, and previous or next year or decade.',
  'Cierra el calendario; en las vistas de meses o años abiertas desde el título, vuelve a la vista anterior.': 'Closes the calendar; in the month or year views opened from the title, goes back to the previous view.',
  'Símbolo': 'Token',
  'Significado': 'Meaning',
  // --- DatePicker: atajos ---
  'presets añade atajos junto al calendario: claves listas y traducidas (today, yesterday, last7Days, last30Days, thisMonth, lastMonth, thisYear, lastYear) u objetos { label, value } propios. El atajo aplicado queda marcado y los que caen fuera de minDate / maxDate se desactivan.': 'presets adds shortcuts next to the calendar: ready-made, translated keys (today, yesterday, last7Days, last30Days, thisMonth, lastMonth, thisYear, lastYear) or your own { label, value } objects. The applied shortcut is highlighted and those outside minDate / maxDate are disabled.',
  'Atajos': 'Shortcuts',
  'Atajos junto al calendario: claves (today, last7Days, thisMonth…) u objetos { label, value }.': 'Shortcuts next to the calendar: keys (today, last7Days, thisMonth…) or { label, value } objects.',
  'Los atajos (`presets`) son botones dentro de un `role="group"` llamado "Atajos"; el aplicado tiene `aria-pressed="true"` y los que caen fuera de `minDate` / `maxDate` están deshabilitados.': 'The shortcuts (`presets`) are buttons inside a `role="group"` named "Shortcuts"; the applied one has `aria-pressed="true"` and those outside `minDate` / `maxDate` are disabled.',
  'Último corte (día 15)': 'Last statement (day 15)',
  // --- Editor: HTML seguro y funciones nuevas ---
  'Obligatorio (aria-required); con Angular Forms lo toma de Validators.required.': 'Required (aria-required); with Angular Forms it comes from Validators.required.',
  'Muestra el contenido saneado sin barra ni edición.': 'Shows the sanitized content without toolbar or editing.',
  'Máximo de caracteres de texto; muestra un contador.': 'Maximum number of text characters; shows a counter.',
  'Herramientas de la barra y su orden (\'|\' separa grupos). Por defecto, todas.': 'Toolbar tools and their order (\'|\' separates groups). All by default.',
  'Permite imágenes (botón, pegar y soltar).': 'Allows images (button, paste and drop).',
  'Sube la imagen y devuelve su URL (el HTML guarda la URL, no la imagen).': 'Uploads the image and returns its URL (the HTML stores the URL, not the image).',
  'Bytes máximos de una imagen insertada como data URL (sin imageUpload).': 'Maximum bytes of an image inserted as a data URL (without imageUpload).',
  'Pega siempre como texto plano.': 'Always pastes as plain text.',
  'HTML saneado y normalizado; \'\' si está vacío.': 'Sanitized and normalized HTML; \'\' when empty.',
  'Una imagen no se insertó: { file, reason: \'type\' | \'size\' | \'upload\' }.': 'An image was not inserted: { file, reason: \'type\' | \'size\' | \'upload\' }.',
  'Editor de texto enriquecido sin dependencias. El valor es HTML saneado y normalizado: se puede guardar y volver a cargar sin riesgo de scripts, igual en todos los navegadores.': 'Dependency-free rich text editor. The value is sanitized, normalized HTML: it can be saved and loaded again with no risk of scripts, the same in every browser.',
  '[(value)] (o un FormControl) es el HTML del contenido. Al cargarlo se sanea con una lista blanca de etiquetas y atributos, y al editar se emite normalizado (<strong> en vez de <b>, <p> en vez de <div>, \'\' si está vacío). Debajo se ve lo que se guardaría.': '[(value)] (or a FormControl) is the HTML of the content. When loaded it is sanitized with an allowlist of tags and attributes, and while editing it is emitted normalized (<strong> instead of <b>, <p> instead of <div>, \'\' when empty). Below you can see what would be saved.',
  'Este valor trae un script, un evento onerror y un enlace javascript:. El editor los descarta al cargar: solo pinta lo seguro. Lo mismo pasa al pegar y en la vista de HTML.': 'This value contains a script, an onerror event and a javascript: link. The editor discards them on load: it only renders what is safe. The same happens when pasting and in the HTML view.',
  'Al pegar se quitan estilos, clases, comentarios de Office y etiquetas no permitidas; la negrita y la cursiva de Google Docs se convierten en <strong> y <em>. Con pastePlainText se pega siempre como texto.': 'When pasting, styles, classes, Office comments and disallowed tags are removed; bold and italic from Google Docs become <strong> and <em>. With pastePlainText it always pastes as text.',
  'Atajos al escribir como en Markdown: # , ## o ### para títulos, * o - para lista, 1. para lista numerada y > para cita, al inicio de un párrafo. Ctrl + K abre el enlace; Ctrl + Mayús + 7 / 8 crean listas; Ctrl + Alt + 1–3 títulos y Ctrl + Alt + 0 párrafo.': 'Markdown-like typing shortcuts: # , ## or ### for headings, * or - for a list, 1. for a numbered list and > for a quote, at the start of a paragraph. Ctrl + K opens the link; Ctrl + Shift + 7 / 8 create lists; Ctrl + Alt + 1–3 headings and Ctrl + Alt + 0 paragraph.',
  'Con imageUpload tu función sube el archivo y devuelve su URL: el HTML guarda la URL, no la imagen. Sin ella, la imagen se inserta como data URL si no supera maxImageSize (1 MB por defecto). También se pueden pegar o soltar.': 'With imageUpload your function uploads the file and returns its URL: the HTML stores the URL, not the image. Without it, the image is inserted as a data URL if it does not exceed maxImageSize (1 MB by default). Images can also be pasted or dropped.',
  'maxLength muestra un contador, impide escribir de más y recorta lo pegado. Con Validators.required, un editor vacío vale \'\' y el control es inválido.': 'maxLength shows a counter, prevents typing beyond it and trims pasted content. With Validators.required, an empty editor is \'\' and the control is invalid.',
  'toolbar elige las herramientas y su orden (\'|\' separa grupos). Las herramientas activas se marcan con aria-pressed.': 'toolbar chooses the tools and their order (\'|\' separates groups). Active tools are marked with aria-pressed.',
  'readonly muestra el HTML guardado, saneado, sin barra ni edición: útil para ver el contenido en otra pantalla.': 'readonly shows the saved HTML, sanitized, without toolbar or editing: useful to view the content on another screen.',
  'Guardar y volver a cargar': 'Saving and loading again',
  'Contenido no confiable': 'Untrusted content',
  'Pegar desde Word, Google Docs o la web': 'Pasting from Word, Google Docs or the web',
  'Escribir más rápido': 'Typing faster',
  'Imágenes': 'Images',
  'Límite de caracteres y validación': 'Character limit and validation',
  'Barra configurable': 'Configurable toolbar',
  'Solo lectura': 'Read only',
  'HTML guardado': 'Saved HTML',
  'La barra es un `role="toolbar"` con nombre que controla el área editable (`aria-controls`); cada herramienta tiene su etiqueta (también como `title`), las de formato indican con `aria-pressed` si están activas y solo una entra en el orden de tabulación.': 'The toolbar is a named `role="toolbar"` that controls the editable area (`aria-controls`); each tool has its label (also as `title`), formatting tools report with `aria-pressed` whether they are active and only one is in the tab order.',
  'El enlace se edita en un formulario propio (no en `window.prompt`): su campo tiene etiqueta visible y, si la URL no es segura, `aria-invalid` y un `role="alert"`. El contador de `maxLength` describe el área editable (`aria-describedby`) y los errores de imagen se anuncian con `role="alert"`.': 'Links are edited in their own form (not `window.prompt`): its field has a visible label and, if the URL is not safe, `aria-invalid` and a `role="alert"`. The `maxLength` counter describes the editable area (`aria-describedby`) and image errors are announced with `role="alert"`.',
  'Con `readonly` el área tiene `aria-readonly="true"` y no hay barra. El contenido siempre se sanea: un lector de pantalla nunca recibe scripts ni enlaces `javascript:`.': 'With `readonly` the area has `aria-readonly="true"` and there is no toolbar. The content is always sanitized: a screen reader never receives scripts or `javascript:` links.',
  'Ctrl + B / I / U': 'Ctrl + B / I / U',
  'Negrita, cursiva y subrayado.': 'Bold, italic and underline.',
  'Ctrl + K': 'Ctrl + K',
  'Abre el formulario de enlace (Escape lo cierra y vuelve al texto).': 'Opens the link form (Escape closes it and returns to the text).',
  'Ctrl + Mayús + 7 / 8': 'Ctrl + Shift + 7 / 8',
  'Lista numerada / con viñetas.': 'Numbered / bulleted list.',
  'Ctrl + Alt + 1–3 / 0': 'Ctrl + Alt + 1–3 / 0',
  'Título 1–3 / párrafo.': 'Heading 1–3 / paragraph.',
  '# , * , 1. , > + Espacio': '# , * , 1. , > + Space',
  'Al inicio de un párrafo, lo convierten en título, lista o cita.': 'At the start of a paragraph, turn it into a heading, list or quote.',
  // --- Editor: tablas, imágenes y código ---
  'El botón de tabla pide filas, columnas y si lleva fila de encabezado. Con el cursor en una celda aparece la barra de tabla: insertar filas y columnas, quitar o poner el encabezado y eliminar filas, columnas o la tabla. Tab y Mayús + Tab pasan de celda en celda; Tab en la última añade una fila.': 'The table button asks for rows, columns and whether there is a header row. With the cursor in a cell, the table toolbar appears: insert rows and columns, remove or add the header and delete rows, columns or the table. Tab and Shift + Tab move between cells; Tab in the last one adds a row.',
  'Tablas': 'Tables',
  'Tamaño y alineación de imágenes': 'Image size and alignment',
  'Código': 'Code',
  'Con el cursor en una tabla aparece una segunda barra (`role="toolbar"`, "Tabla") y, al seleccionar una imagen, otra ("Imagen"); se recorren con las flechas, y alineación, ancho y fila de encabezado indican con `aria-pressed` la opción activa. Las tablas guardan `<th scope="col">` en la fila de encabezado y las imágenes su texto alternativo.': 'With the cursor in a table a second toolbar appears (`role="toolbar"`, "Table") and, when an image is selected, another one ("Image"); they are navigated with the arrows, and alignment, width and header row report the active option with `aria-pressed`. Tables store `<th scope="col">` in the header row and images their alternative text.',
  'Tab / Mayús + Tab (en una tabla)': 'Tab / Shift + Tab (in a table)',
  'Celda siguiente o anterior; en la última, añade una fila.': 'Next or previous cell; in the last one, adds a row.',
  'Tab (en un bloque de código)': 'Tab (in a code block)',
  'Inserta dos espacios.': 'Inserts two spaces.',
  // --- Editor: tabla con cuadrícula y bordes, recorte ---
  'Tamaño, alineación y recorte de imágenes': 'Image size, alignment and cropping',
  'La barra de tabla agrupa sus botones ("Fila", "Columna") con `role="group"` y texto visible; los bordes y su color son `<select>` con nombre. El tamaño de una tabla nueva se elige en una cuadrícula de botones con nombre ("3 filas × 4 columnas") y el tamaño elegido se anuncia. El recuadro de recorte es un `role="slider"` con su tamaño en `aria-valuetext` e instrucciones enlazadas.': 'The table toolbar groups its buttons ("Row", "Column") with `role="group"` and visible text; borders and their color are named `<select>` elements. The size of a new table is chosen in a grid of named buttons ("3 rows × 4 columns") and the chosen size is announced. The crop box is a `role="slider"` with its size in `aria-valuetext` and linked instructions.',
  'Flechas / Enter (tamaño de la tabla)': 'Arrows / Enter (table size)',
  'Eligen filas y columnas en la cuadrícula e insertan la tabla.': 'Choose rows and columns in the grid and insert the table.',
  'Flechas / Mayús + flechas / Enter (recorte)': 'Arrows / Shift + arrows / Enter (crop)',
  'Mueven o redimensionan el recuadro de recorte y lo aplican.': 'Move or resize the crop box and apply it.',
  // --- Editor: barra completa ---
  'Alto mínimo del área de texto (se puede estirar desde la esquina).': 'Minimum height of the text area (it can be stretched from the corner).',
  'Alto máximo: a partir de él, el área hace scroll.': 'Maximum height: beyond it, the area scrolls.',
  'Muestra palabras y caracteres al pie.': 'Shows words and characters in the footer.',
  'La barra agrupa: deshacer y rehacer; párrafo o título 1–4 y tamaño de letra; negrita, cursiva, subrayado y tachado; color de texto y resaltado (menús con paleta); listas con viñetas, numeradas y de tareas, sangría y alineación (menú); enlace, imagen, tabla, bloque de código, cita y línea; subíndice, superíndice, código y limpiar formato; vista de HTML y pantalla completa. La barra queda fija arriba al hacer scroll y cada botón muestra su atajo. El área mide 320 px y se puede estirar desde la esquina; maxHeight la limita y hace scroll.': 'The toolbar groups: undo and redo; paragraph or heading 1–4 and font size; bold, italic, underline and strikethrough; text color and highlight (palette menus); bulleted, numbered and task lists, indentation and alignment (menu); link, image, table, code block, quote and line; subscript, superscript, code and clear formatting; HTML view and full screen. The toolbar stays at the top when scrolling and every button shows its shortcut. The area is 320 px tall and can be stretched from the corner; maxHeight limits it and makes it scroll.',
  'Formato completo y atajos': 'Full formatting and shortcuts',
  'Color de texto, resaltado y alineación son botones con `aria-haspopup="menu"` y `aria-expanded` que abren un `role="menu"`: Flecha abajo, Enter o Espacio lo abren y enfocan la primera opción; las flechas recorren la paleta (en cuadrícula) o las opciones (`menuitemradio` con `aria-checked`), y Escape lo cierra y devuelve el foco al botón. Cada herramienta con atajo lo indica en su tooltip y en `aria-keyshortcuts`.': 'Text color, highlight and alignment are buttons with `aria-haspopup="menu"` and `aria-expanded` that open a `role="menu"`: Down arrow, Enter or Space open it and focus the first option; the arrows move through the palette (as a grid) or the options (`menuitemradio` with `aria-checked`), and Escape closes it and returns focus to the button. Every tool with a shortcut shows it in its tooltip and in `aria-keyshortcuts`.',
  'En una lista de tareas, cada tarea guarda `data-checked`; se marca con un clic en la casilla o con Ctrl + Enter, y la marcada se tacha. El pie anuncia palabras y caracteres y describe el área de texto.': 'In a task list, each task stores `data-checked`; it is checked with a click on the box or with Ctrl + Enter, and a checked task is struck through. The footer reports words and characters and describes the text area.',
  'Atajo': 'Shortcut',
  'Acción': 'Action',
  'Negrita, cursiva, subrayado': 'Bold, italic, underline',
  'Tachado': 'Strikethrough',
  'Código en línea': 'Inline code',
  'Superíndice / subíndice': 'Superscript / subscript',
  'Párrafo / título 1–4': 'Paragraph / heading 1–4',
  'Lista numerada / con viñetas / de tareas': 'Numbered / bulleted / task list',
  'Marcar o desmarcar la tarea': 'Check or uncheck the task',
  'Aumentar / reducir sangría': 'Increase / decrease indent',
  'Alinear a la izquierda / centrar / a la derecha / justificar': 'Align left / center / right / justify',
  'Cita': 'Quote',
  'Bloque de código': 'Code block',
  'Enlace': 'Link',
  'Limpiar formato': 'Clear formatting',
  'Deshacer / rehacer': 'Undo / redo',
  'Título 1–4 al inicio de un párrafo': 'Heading 1–4 at the start of a paragraph',
  'Lista, lista numerada, tareas o cita': 'List, numbered list, tasks or quote',
  'Salir de pantalla completa': 'Exit full screen',
  // --- Editor: fuentes, escritura y búsqueda ---
  'Herramientas de la barra y su orden (\'|\' separa grupos y \'-\' empieza otra fila). Por defecto, todas en dos filas.': 'Toolbar tools and their order (\'|\' separates groups and \'-\' starts another row). By default, all of them in two rows.',
  'Tipografías del selector, por grupos (por defecto, CB_EDITOR_FONTS).': 'Fonts in the picker, by group (CB_EDITOR_FONTS by default).',
  'Hoja que carga las tipografías (por defecto, Google Fonts); vacía si las sirves tú.': 'Stylesheet that loads the fonts (Google Fonts by default); empty if you serve them yourself.',
  'Menú flotante de formato al seleccionar texto.': 'Floating formatting menu when text is selected.',
  'Escribir / abre un menú para insertar bloques.': 'Typing / opens a menu to insert blocks.',
  'Convierte las URL en enlaces al escribirlas o pegarlas.': 'Turns URLs into links when they are typed or pasted.',
  'Corrección tipográfica al escribir: (c) → ©, ... → …, -> → →.': 'Typographic fixes while typing: (c) → ©, ... → …, -> → →.',
  'La barra tiene dos filas. Arriba, el texto: deshacer y rehacer; párrafo o título 1–4, fuente y tamaño en px; negrita, cursiva, subrayado y tachado; color de texto y resaltado; subíndice, superíndice, código y limpiar formato. Abajo, la estructura: listas con viñetas, numeradas y de tareas, sangría y alineación; enlace, imagen, tabla, bloque de código, cita, línea y caracteres especiales; buscar y reemplazar; vista de HTML y pantalla completa. La barra queda fija arriba al hacer scroll y cada botón muestra su atajo. El área mide 320 px y se puede estirar desde la esquina; maxHeight la limita y hace scroll.': 'The toolbar has two rows. On top, the text: undo and redo; paragraph or heading 1–4, font and size in px; bold, italic, underline and strikethrough; text color and highlight; subscript, superscript, code and clear formatting. Below, the structure: bulleted, numbered and task lists, indentation and alignment; link, image, table, code block, quote, line and special characters; find and replace; HTML view and full screen. The toolbar stays at the top when scrolling and every button shows its shortcut. The area is 320 px tall and can be stretched from the corner; maxHeight limits it and makes it scroll.',
  'El selector de fuente agrupa tipografías libres: la predeterminada (Carlito, compatible con Calibri), recomendadas, clásicas de Office (compatibles con Arial, Times New Roman y Courier New), sans serif modernas, serif, monoespaciadas para código, una pensada para la accesibilidad (Atkinson Hyperlegible) y una divertida. Cada opción se muestra con su propia letra. El tamaño se elige en px, de 10 a 48. Las fuentes se cargan desde Google Fonts; si las sirves tú (o tu CSP no lo permite), deja fontsHref vacío, y con fonts cambias la lista. Al pegar solo se conservan las tipografías de la lista.': 'The font picker groups free typefaces: the default one (Carlito, compatible with Calibri), recommended, Office classics (compatible with Arial, Times New Roman and Courier New), modern sans serif, serif, monospaced for code, one designed for accessibility (Atkinson Hyperlegible) and a fun one. Each option is shown in its own typeface. The size is chosen in px, from 10 to 48. The fonts load from Google Fonts; if you serve them yourself (or your CSP does not allow it), leave fontsHref empty, and use fonts to change the list. When pasting, only the fonts in the list are kept.',
  'Ctrl + F (o el botón de la lupa) abre el panel: cuenta las coincidencias, las resalta en el texto y las recorre con Enter y Mayús + Enter; puede distinguir mayúsculas y buscar palabras completas, y reemplaza una o todas (cada reemplazo se puede deshacer). Escape cierra el panel y deja seleccionada la coincidencia. El botón Ω inserta monedas, símbolos matemáticos, puntuación, flechas y emoji.': 'Ctrl + F (or the magnifier button) opens the panel: it counts the matches, highlights them in the text and moves through them with Enter and Shift + Enter; it can match case and whole words, and replaces one or all of them (each replacement can be undone). Escape closes the panel and leaves the match selected. The Ω button inserts currencies, math symbols, punctuation, arrows and emoji.',
  'toolbar elige las herramientas y su orden: \'|\' separa grupos y \'-\' empieza una fila nueva. Las herramientas activas se marcan con aria-pressed.': 'toolbar picks the tools and their order: \'|\' separates groups and \'-\' starts a new row. Active tools are marked with aria-pressed.',
  'Fuentes y tamaño de letra': 'Fonts and font size',
  'Buscar y reemplazar, y caracteres especiales': 'Find and replace, and special characters',
  'Escribe / al inicio de una línea (o tras un espacio) para insertar un bloque: párrafo, títulos, listas, tareas, cita, código, tabla, imagen o línea; sigue escribiendo para filtrar y elige con las flechas y Enter. Al seleccionar texto aparece un menú flotante con negrita, cursiva, subrayado, tachado, código, enlace y limpiar formato. Las URL se convierten en enlace al escribir un espacio detrás (o al pegarlas sobre un texto seleccionado), y la tipografía se corrige sola: (c) → ©, ... → …, -> → →, -- → –, 1/2 → ½. También funcionan los atajos tipo Markdown: # , * , 1. , [ ] y > al inicio de un párrafo. Cada ayuda se puede desactivar.': 'Type / at the start of a line (or after a space) to insert a block: paragraph, headings, lists, tasks, quote, code, table, image or line; keep typing to filter and choose with the arrows and Enter. Selecting text shows a floating menu with bold, italic, underline, strikethrough, code, link and clear formatting. URLs become links when you type a space after them (or paste them over selected text), and typography is fixed automatically: (c) → ©, ... → …, -> → →, -- → –, 1/2 → ½. Markdown-style shortcuts also work: # , * , 1. , [ ] and > at the start of a paragraph. Each helper can be turned off.',
  'Escribe / para insertar un bloque, o una URL seguida de un espacio…': 'Type / to insert a block, or a URL followed by a space…',
  'Buscar y reemplazar': 'Find and replace',
  'Ir a la barra de herramientas': 'Go to the toolbar',
  'Menú para insertar un bloque': 'Menu to insert a block',
  'Cerrar un menú o salir de pantalla completa': 'Close a menu or exit full screen',
  'El menú `/` es un `role="listbox"` ("Insertar bloque"): el foco se queda en el texto y la opción activa se indica con `aria-activedescendant` y `aria-selected`. El menú flotante de formato rápido es un `role="toolbar"` que no roba el foco; repite herramientas de la barra principal.': 'The `/` menu is a `role="listbox"` ("Insert block"): focus stays in the text and the active option is indicated with `aria-activedescendant` and `aria-selected`. The quick formatting floating menu is a `role="toolbar"` that does not steal focus; it repeats tools from the main toolbar.',
  'Buscar y reemplazar es un `role="search"` con campos etiquetados; el número de coincidencias ("2 de 5", "Sin resultados") se anuncia con `role="status"`, y "Mayúsculas y minúsculas" y "Palabras completas" indican su estado con `aria-pressed`. Las coincidencias se resaltan sin modificar el contenido. Los caracteres especiales son un `role="menu"` con un `role="group"` por categoría.': 'Find and replace is a `role="search"` with labelled fields; the number of matches ("2 of 5", "No results found") is announced with `role="status"`, and "Match case" and "Whole words" show their state with `aria-pressed`. Matches are highlighted without changing the content. Special characters are a `role="menu"` with one `role="group"` per category.',
  'Alt + F10': 'Alt + F10',
  'Desde el texto, lleva el foco a la barra de herramientas.': 'From the text, moves focus to the toolbar.',
  'Abre buscar y reemplazar: Enter y Mayús + Enter recorren las coincidencias; Escape cierra.': 'Opens find and replace: Enter and Shift + Enter move through the matches; Escape closes.',
  '/': '/',
  'Al inicio de una línea, abre el menú de bloques: flechas para elegir, Enter o Tab para insertar, Escape para cerrar.': 'At the start of a line, opens the block menu: arrows to choose, Enter or Tab to insert, Escape to close.',
  // --- API de Select / MultiSelect (etiquetado accesible) ---
  'Nombre accesible del disparador cuando no hay etiqueta visible.':
    'Accessible name of the trigger when there is no visible label.',
  'Id del elemento que etiqueta al disparador (p. ej. un label visible).':
    'Id of the element that labels the trigger (e.g. a visible label).',
  // --- Componentes nuevos: Kbd, CopyButton, QRCode ---
  'Teclas y atajos de teclado. Con keys adapta la combinación a la plataforma: ⌘ K en Mac y Ctrl + K en Windows y Linux.':
    'Keys and keyboard shortcuts. With keys it adapts the combination to the platform: ⌘ K on Mac and Ctrl + K on Windows and Linux.',
  'Una tecla suelta como contenido.': 'A single key as content.',
  Combinaciones: 'Combinations',
  'keys acepta nombres (mod, shift, alt, ctrl, enter, backspace, esc, space, up, down, left, right) y texto libre. mod es ⌘ en Mac y Ctrl en el resto; con platform puedes forzar una.':
    'keys accepts names (mod, shift, alt, ctrl, enter, backspace, esc, space, up, down, left, right) and free text. mod is ⌘ on Mac and Ctrl elsewhere; platform forces one.',
  'Teclas de la combinación: nombres (mod, shift, alt, enter, up…) o texto libre.':
    'Keys of the combination: names (mod, shift, alt, enter, up…) or free text.',
  'Plataforma a mostrar; auto la detecta (⌘ en Mac).': 'Platform to display; auto detects it (⌘ on Mac).',
  'Usa el elemento nativo `kbd`; una combinación es un `kbd` que contiene un `kbd` por tecla, como recomienda HTML.':
    'Uses the native `kbd` element; a combination is a `kbd` containing one `kbd` per key, as HTML recommends.',
  'Los símbolos de Mac (⌘ ⌥ ⇧ ↵) se ocultan al lector y se lee su nombre (Command, Option, Shift, Enter).':
    'Mac symbols (⌘ ⌥ ⇧ ↵) are hidden from screen readers, which read their name instead (Command, Option, Shift, Enter).',
  'Copia un texto al portapapeles y confirma con un ✓. Incluye la directiva cbCopy para cualquier elemento y el servicio CbClipboard para copiar desde código.':
    'Copies text to the clipboard and confirms with a ✓. Includes the cbCopy directive for any element and the CbClipboard service to copy from code.',
  'Botón de solo icono junto al dato. Al copiar muestra ✓ durante timeout milisegundos y lo anuncia a los lectores de pantalla.':
    'Icon-only button next to the value. After copying it shows ✓ for timeout milliseconds and announces it to screen readers.',
  'Con texto': 'With text',
  'showLabel muestra "Copiar" / "Copiado"; label y copiedLabel cambian los textos.':
    'showLabel shows "Copy" / "Copied"; label and copiedLabel change the texts.',
  'Directiva cbCopy': 'cbCopy directive',
  'Copia al pulsar cualquier elemento propio; reacciona a copied o copyError.':
    'Copies when any custom element is clicked; react to copied or copyError.',
  'Texto que se copia.': 'Text to copy.',
  'Muestra el texto junto al icono.': 'Shows the text next to the icon.',
  'Texto del botón y nombre accesible.': 'Button text and accessible name.',
  'Texto tras copiar.': 'Text after copying.',
  'Milisegundos que dura la confirmación.': 'How long the confirmation lasts, in milliseconds.',
  'Variante del botón.': 'Button variant.',
  'Color del botón.': 'Button color.',
  'Texto copiado.': 'Copied text.',
  'El navegador no permitió copiar.': 'The browser did not allow copying.',
  'Sin `showLabel` es un botón de solo icono con nombre accesible ("Copiar" del idioma activo, o `label`).':
    'Without `showLabel` it is an icon-only button with an accessible name ("Copy" in the active language, or `label`).',
  'El resultado ("Copiado" o "No se pudo copiar") se anuncia en una región `role="status"` sin mover el foco.':
    'The result ("Copied" or "Could not copy") is announced in a `role="status"` region without moving focus.',
  'Lleva el foco al botón.': 'Moves focus to the button.',
  'Copia el valor.': 'Copies the value.',
  'Código QR en SVG con un codificador propio, sin dependencias: elige solo la versión y la máscara, y admite color, margen y logo.':
    'SVG QR code with a built-in encoder and no dependencies: it picks the version and mask by itself, and supports color, margin and a logo.',
  'value es el texto o la URL. Escribe para ver cómo cambia.': 'value is the text or URL. Type to see it change.',
  'Corrección de errores': 'Error correction',
  'L, M (por defecto), Q y H recuperan ~7, 15, 25 y 30 % del código si se daña o se tapa. Más corrección = más módulos. Usa M o más en impresos y pantallas.':
    'L, M (default), Q and H recover ~7, 15, 25 and 30% of the code if it is damaged or covered. More correction = more modules. Use M or higher for print and screens.',
  'Color y logo': 'Color and logo',
  'color y background aceptan cualquier color CSS (mantén buen contraste). image centra un logo; combínalo con errorCorrection="H".':
    'color and background accept any CSS color (keep good contrast). image centers a logo; combine it with errorCorrection="H".',
  'Texto o URL a codificar.': 'Text or URL to encode.',
  'Lado en píxeles.': 'Side length in pixels.',
  'Corrección de errores (usa H con logo).': 'Error correction (use H with a logo).',
  'Color de los módulos.': 'Module color.',
  'Color de fondo.': 'Background color.',
  'Margen claro en módulos (el estándar pide 4).': 'Light margin in modules (the standard asks for 4).',
  'Logo centrado (URL).': 'Centered logo (URL).',
  'Es una imagen (`role="img"`) con nombre "Código QR" o `ariaLabel`. El lector no puede leer el contenido: si importa, muéstralo también como texto o enlace junto al QR.':
    'It is an image (`role="img"`) named "QR code" or `ariaLabel`. Screen readers cannot read its content: if it matters, also show it as text or a link next to the QR.',
  // --- Componentes nuevos: CommandPalette, Sidebar y AppShell ---
  'Buscador global de páginas y acciones con teclado (Ctrl/⌘ + K). Filtra sin tildes ni mayúsculas, agrupa, resalta la coincidencia y muestra atajos.':
    'Global keyboard search for pages and actions (Ctrl/⌘ + K). Filters ignoring accents and case, groups, highlights the match and shows shortcuts.',
  'Pulsa Ctrl + K (⌘ K en Mac) en cualquier parte de esta página, o usa el botón. Cada item puede tener group, icon, description, keywords (sinónimos), shortcut y command.':
    'Press Ctrl + K (⌘ K on Mac) anywhere on this page, or use the button. Each item can have group, icon, description, keywords (synonyms), shortcut and command.',
  'Resultados del servidor': 'Server results',
  'Con [filter]="false" la paleta no filtra: escucha (queryChange) o [(query)], pide los resultados y actívalo con loading mientras llegan. shortcut cambia o desactiva ("") el atajo.':
    'With [filter]="false" the palette does not filter: listen to (queryChange) or [(query)], fetch the results and set loading while they arrive. shortcut changes or disables ("") the shortcut.',
  'Páginas y acciones (label, group, icon, description, keywords, shortcut, disabled, command).':
    'Pages and actions (label, group, icon, description, keywords, shortcut, disabled, command).',
  'Abierta o cerrada (two-way).': 'Open or closed (two-way).',
  'Texto buscado (two-way).': 'Search text (two-way).',
  "Atajo global que la abre; '' lo desactiva.": "Global shortcut that opens it; '' disables it.",
  'Texto del campo de búsqueda.': 'Search field text.',
  'Mensaje sin resultados.': 'Message when there are no results.',
  'Filtra items con la búsqueda (desactívalo con resultados del servidor).': 'Filters items with the search (disable it for server results).',
  'Muestra Cargando mientras no hay resultados.': 'Shows Loading while there are no results.',
  'Cierra al elegir un item.': 'Closes when an item is chosen.',
  'Nombre del diálogo.': 'Dialog name.',
  'Item elegido ({ item, query, originalEvent }).': 'Chosen item ({ item, query, originalEvent }).',
  'Es un diálogo modal (`role="dialog"`, `aria-modal`) con un campo `role="combobox"` que controla la lista (`role="listbox"`); la opción activa se indica con `aria-activedescendant`, así el foco no sale del campo.':
    'It is a modal dialog (`role="dialog"`, `aria-modal`) with a `role="combobox"` field that controls the list (`role="listbox"`); the active option is set with `aria-activedescendant`, so focus never leaves the field.',
  'Los grupos son `role="group"` con su título; los items deshabilitados llevan `aria-disabled`. El número de resultados se anuncia en una región `role="status"`.':
    'Groups are `role="group"` with their title; disabled items have `aria-disabled`. The number of results is announced in a `role="status"` region.',
  'Al cerrar, el foco vuelve al elemento que lo tenía antes de abrir.': 'On close, focus returns to the element that had it before opening.',
  'Abre o cierra la paleta (configurable con shortcut).': 'Opens or closes the palette (configurable with shortcut).',
  'Mueve la opción activa (salta las deshabilitadas y da la vuelta).': 'Moves the active option (skips disabled ones and wraps around).',
  'Primera o última opción.': 'First or last option.',
  'Elige la opción activa.': 'Chooses the active option.',
  'Cierra la paleta.': 'Closes the palette.',
  'Sidebar y AppShell': 'Sidebar and AppShell',
  'Menú lateral con secciones, badges y grupos desplegables, que se contrae a iconos. Con cb-app-shell forma el esqueleto de una aplicación y en móvil pasa a ser un panel deslizante.':
    'Side menu with sections, badges and collapsible groups that collapses to icons. With cb-app-shell it forms the skeleton of an application and becomes a sliding panel on mobile.',
  'App shell': 'App shell',
  'cb-app-shell coloca el sidebar, la cabecera [cb-app-shell-header] y el contenido. cbSidebarToggle convierte cualquier botón en el control del menú. Por debajo de breakpoint (medido en el propio shell) el menú se desliza sobre el contenido.':
    'cb-app-shell lays out the sidebar, the [cb-app-shell-header] header and the content. cbSidebarToggle turns any button into the menu control. Below breakpoint (measured on the shell itself) the menu slides over the content.',
  'Solo el sidebar': 'Sidebar only',
  'Fuera del shell, [(collapsed)] controla el modo contraído. Los enlaces usan href; pasa [navigate] para navegar con el router sin recargar.':
    'Outside the shell, [(collapsed)] controls the collapsed mode. Links use href; pass [navigate] to navigate with the router without reloading.',
  'Secciones con items (label, icon, url, badge, children, disabled, command).': 'Sections with items (label, icon, url, badge, children, disabled, command).',
  'Clave del item activo (id, url o label).': 'Key of the active item (id, url or label).',
  'Contraído a iconos (en cb-app-shell lo controla el shell).': 'Collapsed to icons (inside cb-app-shell the shell controls it).',
  'Botón de contraer en el pie.': 'Collapse button in the footer.',
  'Navegación SPA para los enlaces internos.': 'SPA navigation for internal links.',
  'Item elegido ({ item, originalEvent }).': 'Chosen item ({ item, originalEvent }).',
  'Es un `nav` con nombre ("Navegación principal"); cada sección es una lista nombrada por su título. El item activo lleva `aria-current="page"`.':
    'It is a named `nav` ("Main navigation"); each section is a list named by its title. The active item has `aria-current="page"`.',
  'Los grupos con hijos son botones con `aria-expanded` y `aria-controls`. Contraído, el texto se oculta a la vista pero sigue siendo el nombre accesible, y aparece como tooltip.':
    'Groups with children are buttons with `aria-expanded` and `aria-controls`. When collapsed, the text is visually hidden but remains the accessible name, and appears as a tooltip.',
  'En `cb-app-shell` móvil el panel está `inert` mientras está cerrado; abierto, atrapa el foco, se cierra con Escape o con el fondo y devuelve el foco al botón `cbSidebarToggle` (que gestiona `aria-expanded` y `aria-controls`).':
    'In a mobile `cb-app-shell` the panel is `inert` while closed; when open it traps focus, closes with Escape or the backdrop and returns focus to the `cbSidebarToggle` button (which manages `aria-expanded` and `aria-controls`).',
  'Recorre los enlaces y botones del menú.': 'Moves through the menu links and buttons.',
  'Abre el enlace o despliega el grupo.': 'Opens the link or expands the group.',
  'En móvil, cierra el panel.': 'On mobile, closes the panel.',
  // --- Kit de chat (IA) ---
  'Chat (IA)': 'Chat (AI)',
  'Asistente completo': 'Full assistant',
  'Markdown seguro': 'Safe markdown',
  'Quién escribe el mensaje.': 'Who writes the message.',
  'Contenido (markdown seguro).': 'Content (safe markdown).',
  'Interpreta text como markdown.': 'Interprets text as markdown.',
  'Nombre del autor.': 'Author name.',
  'Hora ya formateada.': 'Already formatted time.',
  'Imagen del avatar.': 'Avatar image.',
  'Muestra el avatar.': 'Shows the avatar.',
  'Muestra el nombre del autor.': 'Shows the author name.',
  'Estado de envío; error muestra Reintentar.': 'Sending status; error shows Retry.',
  'La respuesta sigue llegando (cursor y aria-busy).': 'The answer is still arriving (caret and aria-busy).',
  'Botón para copiar el texto.': 'Button to copy the text.',
  'Se pulsó Reintentar.': 'Retry was pressed.',
  'La conversación es un `role="log"` con nombre ("Conversación"): los lectores anuncian los mensajes nuevos sin mover el foco.':
    'The conversation is a named `role="log"` ("Conversation"): screen readers announce new messages without moving focus.',
  'Mientras se genera una respuesta (`busy`, y `streaming` en el mensaje) se marca `aria-busy` para que no se lea cada fragmento; al terminar se anuncia "Respuesta lista" una sola vez.':
    'While an answer is generated (`busy`, and `streaming` on the message) it is marked `aria-busy` so each chunk is not read; when done "Response ready" is announced once.',
  'Cada mensaje es un `article` nombrado por su autor y hora. El markdown se pinta con etiquetas semánticas (listas, tablas, código) y los enlaces externos se abren en otra pestaña con `rel="noopener"`.':
    'Each message is an `article` named by its author and time. Markdown is rendered with semantic tags (lists, tables, code) and external links open in a new tab with `rel="noopener"`.',
  'El campo de prompt tiene nombre ("Mensaje"); Enviar, Detener, Adjuntar y Quitar archivo son botones con nombre accesible. Los estados de envío y error se muestran como texto, no solo con color.':
    'The prompt field is named ("Message"); Send, Stop, Attach and Remove file are buttons with accessible names. Sending and error states are shown as text, not only with color.',
  'Envía el mensaje (Shift + Enter, salto de línea; no envía durante la composición IME).':
    'Sends the message (Shift + Enter, line break; does not send during IME composition).',
  'Recorre sugerencias, adjuntar, el campo y Enviar o Detener.': 'Moves through suggestions, attach, the field and Send or Stop.',
  'Tab (en la lista)': 'Tab (in the list)',
  'La conversación es enfocable y se desplaza con las flechas.': 'The conversation is focusable and scrolls with the arrow keys.',
  // --- Componentes nuevos: CodeBlock y PhoneInput ---
  'Bloque de código con resaltado de sintaxis propio y sin dependencias, botón de copiar, números de línea y líneas destacadas. Sigue el tema claro u oscuro.':
    'Code block with built-in, dependency-free syntax highlighting, copy button, line numbers and highlighted lines. Follows the light or dark theme.',
  'language elige el resaltado (ts, js, html, css, scss, json, bash, python, sql). La cabecera muestra el lenguaje y el botón de copiar.':
    'language picks the highlighting (ts, js, html, css, scss, json, bash, python, sql). The header shows the language and the copy button.',
  'Archivo, números y líneas destacadas': 'File, numbers and highlighted lines',
  'filename sustituye al lenguaje en la cabecera; lineNumbers numera desde startLine y highlightLines destaca líneas ("3,5-6" o [3, 5, 6]).':
    'filename replaces the language in the header; lineNumbers numbers from startLine and highlightLines highlights lines ("3,5-6" or [3, 5, 6]).',
  'Más lenguajes': 'More languages',
  'Un lenguaje no soportado se muestra como texto. wrap parte las líneas largas y maxHeight limita el alto con scroll.':
    'An unsupported language is shown as text. wrap breaks long lines and maxHeight limits the height with scrolling.',
  'Código a mostrar.': 'Code to display.',
  'Lenguaje del resaltado.': 'Highlighting language.',
  'Nombre de archivo en la cabecera.': 'File name in the header.',
  'Números de línea.': 'Line numbers.',
  'Número de la primera línea.': 'Number of the first line.',
  'Líneas destacadas ("2,5-7").': 'Highlighted lines ("2,5-7").',
  'Parte las líneas largas.': 'Breaks long lines.',
  'Botón de copiar.': 'Copy button.',
  'Cabecera con lenguaje o archivo.': 'Header with language or file.',
  'Alto máximo con scroll.': 'Maximum height with scrolling.',
  'Nombre del bloque.': 'Block name.',
  'El código se pinta como texto dentro de `pre` y `code`; los colores son decorativos. Los números de línea se ocultan al lector (`aria-hidden`) y no se copian al seleccionar.':
    'Code is rendered as text inside `pre` and `code`; colors are decorative. Line numbers are hidden from screen readers (`aria-hidden`) and not copied when selecting.',
  'El área con scroll es enfocable (`tabindex="0"`) y se nombra con el archivo o el lenguaje, para recorrerla con el teclado.':
    'The scrollable area is focusable (`tabindex="0"`) and named after the file or language, so it can be scrolled with the keyboard.',
  'Enfoca el código (para desplazarlo con las flechas) y el botón de copiar.': 'Focuses the code (to scroll it with the arrows) and the copy button.',
  'Teléfono internacional: selector de país con bandera, nombre y prefijo, y número que se formatea al escribir. Entrega el valor en E.164 (+573001234567), listo para guardar o enviar.':
    'International phone: country selector with flag, name and dial code, and a number formatted as you type. It delivers the value in E.164 (+573001234567), ready to store or send.',
  'Con Angular Forms': 'With Angular Forms',
  'Funciona con formControlName, [formControl] y ngModel. Añade el error { phone: true } si el número está incompleto o no es válido para el país. Prueba a pegar +52 55 1234 5678: cambia de país solo.':
    'Works with formControlName, [formControl] and ngModel. Adds the { phone: true } error if the number is incomplete or not valid for the country. Try pasting +52 55 1234 5678: it switches country by itself.',
  'Países y tamaños': 'Countries and sizes',
  'countries limita la lista (códigos ISO o tus propios datos CbPhoneCountry), countryLocked fija el país y showFlag oculta la bandera. Los tamaños son los de cb-input.':
    'countries limits the list (ISO codes or your own CbPhoneCountry data), countryLocked fixes the country and showFlag hides the flag. Sizes match cb-input.',
  'Número en E.164 (+573001234567).': 'Number in E.164 (+573001234567).',
  'País seleccionado (ISO).': 'Selected country (ISO).',
  'Etiqueta.': 'Label.',
  'Texto de ayuda.': 'Help text.',
  'Mensaje de error.': 'Error message.',
  'Placeholder (por defecto, un ejemplo del país).': 'Placeholder (by default, a sample number of the country).',
  'Países disponibles (ISO o datos propios). Por defecto, CB_PHONE_COUNTRIES.': 'Available countries (ISO or your own data). By default, CB_PHONE_COUNTRIES.',
  'Países que aparecen primero.': 'Countries listed first.',
  'Bloquea el país.': 'Locks the country.',
  'Muestra la bandera.': 'Shows the flag.',
  'Obligatorio.': 'Required.',
  'Marca el error manualmente.': 'Marks the error manually.',
  'Deshabilitado.': 'Disabled.',
  'Cambio con { e164, national, country, valid }.': 'Change with { e164, national, country, valid }.',
  'El botón del país se nombra con el país y su prefijo ("País: Colombia (+57)") y anuncia `aria-haspopup="listbox"` y `aria-expanded`. La bandera es decorativa.':
    'The country button is named after the country and its dial code ("Country: Colombia (+57)") and announces `aria-haspopup="listbox"` and `aria-expanded`. The flag is decorative.',
  'El número es un `input type="tel"` con su etiqueta, `inputmode="tel"` (teclado numérico) y `autocomplete="tel-national"`. Con error, `aria-invalid` y el mensaje con `role="alert"`.':
    'The number is an `input type="tel"` with its label, `inputmode="tel"` (numeric keyboard) and `autocomplete="tel-national"`. On error, `aria-invalid` and the message with `role="alert"`.',
  'En la lista, el buscador es un combobox que controla la lista de países con `aria-activedescendant`; el país elegido lleva `aria-selected`.':
    'In the list, the search is a combobox that controls the country list with `aria-activedescendant`; the chosen country has `aria-selected`.',
  'Sobre el país, abre la lista con el buscador enfocado.': 'On the country, opens the list with the search focused.',
  'Mueve el país activo de la lista.': 'Moves the active country in the list.',
  'Elige el país y vuelve al número.': 'Chooses the country and returns to the number.',
  'Cierra la lista y devuelve el foco al botón del país.': 'Closes the list and returns focus to the country button.',
  // --- Chat nivel 2 ---
  'Kit para interfaces de chat y asistentes de IA: mensajes con markdown seguro y streaming, razonamiento y llamadas a herramientas, adjuntos, valoración y un campo de prompt con sugerencias y Detener.':
    'Kit for chat interfaces and AI assistants: messages with safe markdown and streaming, reasoning and tool calls, attachments, feedback and a prompt field with suggestions and Stop.',
  'Pregunta por tu saldo: el asistente razona (cb-chat-reasoning), consulta una herramienta (cb-chat-tool) y responde palabra a palabra con una tabla. Pulsa Detener para cortar, adjunta una imagen para verla en miniatura, valora con 👍/👎 o regenera. Escribe error para ver un mensaje fallido.':
    'Ask for your balance: the assistant reasons (cb-chat-reasoning), calls a tool (cb-chat-tool) and answers word by word with a table. Press Stop to cut it, attach an image to see its thumbnail, rate with 👍/👎 or regenerate. Type error to see a failed message.',
  'text se interpreta como markdown: negrita, cursiva, código, enlaces, listas (también de tareas), citas y tablas; los bloques de código se pintan con cb-code-block (resaltado y copiar). Todo el HTML de entrada se escapa y solo se enlazan URLs http(s), mailto o relativas.':
    'text is interpreted as markdown: bold, italics, code, links, lists (including task lists), quotes and tables; code blocks are rendered with cb-code-block (highlighting and copy). All incoming HTML is escaped and only http(s), mailto or relative URLs become links.',
  'Razonamiento y herramientas': 'Reasoning and tools',
  'cb-chat-reasoning se abre mientras llega y se pliega al terminar con la duración. cb-chat-tool muestra el estado de una llamada (Usando…, Usó…, Falló…) y, al desplegar, su entrada y resultado como JSON.':
    'cb-chat-reasoning opens while it arrives and collapses when done, showing the duration. cb-chat-tool shows the status of a call (Using…, Used…, Failed…) and, when expanded, its input and result as JSON.',
  'Las otras piezas': 'The other pieces',
  'Entradas y eventos de cb-chat-input, cb-chat-messages, cb-chat-reasoning y cb-chat-tool. El playground de abajo es el de cb-chat-message.':
    'Inputs and events of cb-chat-input, cb-chat-messages, cb-chat-reasoning and cb-chat-tool. The playground below is for cb-chat-message.',
  'Adjuntos (name, type, size, url); las imágenes, en miniatura.': 'Attachments (name, type, size, url); images as thumbnails.',
  'Botones de valoración.': 'Feedback buttons.',
  'Valoración elegida.': 'Chosen rating.',
  'Botón Regenerar respuesta.': 'Regenerate response button.',
  'Se pulsó Regenerar respuesta.': 'Regenerate response was pressed.',
  'Cambió la valoración.': 'The rating changed.',
  'El razonamiento y las herramientas son botones desplegables con `aria-expanded` y `aria-controls`; el cambio de estado de una herramienta ("Usó…", "Falló…") se anuncia en una región `role="status"`.':
    'Reasoning and tools are disclosure buttons with `aria-expanded` and `aria-controls`; a tool status change ("Used…", "Failed…") is announced in a `role="status"` region.',
  'Los botones de valoración llevan `aria-pressed` y nombre ("Respuesta útil", "Respuesta no útil"); las miniaturas de imagen usan el nombre del archivo como texto alternativo.':
    'Feedback buttons have `aria-pressed` and a name ("Helpful response", "Not helpful response"); image thumbnails use the file name as alternative text.',
  // --- Componentes nuevos: Kanban y Mentions ---
  'Columnas (id, title, items, limit, color).': 'Columns (id, title, items, limit, color).',
  'Propiedad que identifica cada tarjeta.': 'Property that identifies each card.',
  'Propiedad con el nombre de la tarjeta.': 'Property with the card name.',
  'No deja superar el límite de una columna.': 'Prevents exceeding a column limit.',
  'Deshabilita mover tarjetas.': 'Disables moving cards.',
  'Texto de una columna vacía.': 'Text for an empty column.',
  'Nombre del tablero.': 'Board name.',
  'Tarjeta movida ({ item, from, to, fromIndex, toIndex }).': 'Card moved ({ item, from, to, fromIndex, toIndex }).',
  'Se pulsó una tarjeta (o Enter).': 'A card was pressed (or Enter).',
  'Cada columna es una región nombrada por su título, con una lista de tarjetas. Cada tarjeta es enfocable, se describe como "tarjeta" y lleva las instrucciones de teclado (`aria-describedby`).':
    'Each column is a region named by its title, with a list of cards. Each card is focusable, described as "card" and carries the keyboard instructions (`aria-describedby`).',
  'Arrastrar no es la única forma de mover: con el teclado se toma, se mueve y se suelta (WCAG 2.5.7), y cada paso se anuncia en una región `role="status"` (columna y posición).':
    'Dragging is not the only way to move: with the keyboard you pick up, move and drop (WCAG 2.5.7), and each step is announced in a `role="status"` region (column and position).',
  'Si la plantilla de tarjeta lleva botones o enlaces, usa `cardOpen` para abrir un detalle en lugar de anidar controles dentro de la tarjeta.':
    'If the card template has buttons or links, use `cardOpen` to open a detail view instead of nesting controls inside the card.',
  'Recorre las tarjetas y los botones Añadir tarjeta.': 'Moves through the cards and the Add card buttons.',
  'Toma la tarjeta; con ella tomada, la suelta.': 'Picks up the card; when picked up, drops it.',
  'Flechas arriba / abajo': 'Up / Down arrows',
  'Mueve la tarjeta tomada dentro de la columna.': 'Moves the picked-up card within the column.',
  'Flechas izquierda / derecha': 'Left / Right arrows',
  'Lleva la tarjeta tomada a la columna anterior o siguiente.': 'Moves the picked-up card to the previous or next column.',
  'Cancela el movimiento y la devuelve a su sitio.': 'Cancels the move and returns it to its place.',
  'Campo de texto con menciones: al escribir @ (u otro disparador como #) muestra sugerencias junto al cursor, que se filtran sin tildes y se eligen con el teclado o el ratón.':
    'Text field with mentions: typing @ (or another trigger such as #) shows suggestions next to the caret, filtered ignoring accents and chosen with the keyboard or mouse.',
  'Personas y etiquetas': 'People and tags',
  'Escribe @ para mencionar a alguien o # para una etiqueta. Flechas para moverte, Enter o Tab para elegir y Escape para cerrar. El valor es el texto; (mentionsChange) entrega las menciones presentes con su id.':
    'Type @ to mention someone or # for a tag. Arrows to move, Enter or Tab to choose and Escape to close. The value is the text; (mentionsChange) delivers the mentions present with their id.',
  'Sugerencias del servidor': 'Server suggestions',
  'Con [filter]="false" la lista no se filtra: escucha (search) con { trigger, query }, pide las sugerencias y activa loading mientras llegan.':
    'With [filter]="false" the list is not filtered: listen to (search) with { trigger, query }, fetch the suggestions and set loading while they arrive.',
  'Texto del campo.': 'Field text.',
  'Elementos mencionables (id, label, description, avatar, trigger).': 'Mentionable items (id, label, description, avatar, trigger).',
  'Caracteres que abren las sugerencias.': 'Characters that open the suggestions.',
  'Filas visibles.': 'Visible rows.',
  'Filtra las sugerencias con lo escrito.': 'Filters suggestions with what is typed.',
  'Máximo de sugerencias visibles.': 'Maximum visible suggestions.',
  'Muestra Cargando sin sugerencias.': 'Shows Loading when there are no suggestions.',
  'Lo escrito tras el disparador ({ trigger, query }).': 'What was typed after the trigger ({ trigger, query }).',
  'Menciones presentes en el texto.': 'Mentions present in the text.',
  'El campo es un textarea con etiqueta y `aria-autocomplete="list"`; mientras hay sugerencias controla la lista (`aria-controls`) y marca la activa con `aria-activedescendant`, así el foco no sale del texto.':
    'The field is a labelled textarea with `aria-autocomplete="list"`; while there are suggestions it controls the list (`aria-controls`) and marks the active one with `aria-activedescendant`, so focus stays in the text.',
  'El número de sugerencias se anuncia en una región `role="status"`. Los avatares son decorativos.': 'The number of suggestions is announced in a `role="status"` region. Avatars are decorative.',
  '@ (o el disparador)': '@ (or the trigger)',
  'Abre las sugerencias junto al cursor.': 'Opens the suggestions next to the caret.',
  'Mueve la sugerencia activa.': 'Moves the active suggestion.',
  'Inserta la mención elegida.': 'Inserts the chosen mention.',
  // --- Kanban completo ---
  'Tablero completo': 'Full board',
  'Menú en cada tarjeta (editar, mover a, eliminar) y atajos F2 / Supr.': 'Menu on each card (edit, move to, delete) and F2 / Delete shortcuts.',
  'Campo Añadir tarjeta al pie de cada columna.': 'Add card field at the bottom of each column.',
  'Renombrar, eliminar y añadir columnas.': 'Rename, delete and add columns.',
  'Las columnas se pueden contraer.': 'Columns can be collapsed.',
  'Pide confirmación antes de eliminar.': 'Asks for confirmation before deleting.',
  'Crea la tarjeta nueva a partir del título.': 'Creates the new card from its title.',
  'Tarjeta creada ({ item, column, index }).': 'Card created ({ item, column, index }).',
  'Tarjeta eliminada ({ item, column, index }).': 'Card deleted ({ item, column, index }).',
  'Columna añadida.': 'Column added.',
  'Columna renombrada ({ column, previousTitle }).': 'Column renamed ({ column, previousTitle }).',
  'Columna eliminada con sus tarjetas.': 'Column deleted with its cards.',
  'El menú de cada tarjeta y el de cada columna son botones con nombre ("Acciones de Diseño") que abren un `menu`; el botón es hermano de la tarjeta, no está dentro de ella. "Mover a" permite mover sin arrastrar.':
    'The menu of each card and each column are named buttons ("Actions for Design") that open a `menu`; the button is a sibling of the card, not inside it. "Move to" lets you move without dragging.',
  'Editar, añadir, renombrar y confirmar eliminación usan campos y botones con etiqueta; el foco va al campo al abrirlos y vuelve a la tarjeta (o al botón de origen) al cerrar. Cada cambio se anuncia en la región `role="status"`.':
    'Editing, adding, renaming and confirming deletion use labelled fields and buttons; focus goes to the field when they open and returns to the card (or the originating button) when they close. Each change is announced in the `role="status"` region.',
  'Edita el título de la tarjeta (editable). Enter guarda, Escape cancela.': 'Edits the card title (editable). Enter saves, Escape cancels.',
  'Pide confirmar la eliminación de la tarjeta (editable).': 'Asks to confirm deleting the card (editable).',
  // --- Kanban: detalle de la tarea ---
  // --- Kanban: vistas (lista, cronograma, calendario, panel y espacio de trabajo) ---
  'Tablero de columnas con tarjetas que se reordenan y se mueven entre columnas arrastrando (ratón o dedo) o con el teclado, y vistas de lista, cronograma, calendario y panel de resumen sobre los mismos datos, que se pueden ver a la vez en un espacio de trabajo. Cada tarea se abre en un panel con responsables, prioridad, fechas de inicio y fin, descripción y adjuntos; también se crean, editan y eliminan tarjetas y columnas.':
    'Board of columns with cards that are reordered and moved between columns by dragging (mouse or touch) or with the keyboard, plus list, timeline, calendar and dashboard views over the same data, which can be shown at once in a workspace. Each task opens in a panel with assignees, priority, start and due dates, description and attachments; cards and columns can also be created, edited and deleted.',
  'Espacio de trabajo': 'Workspace',
  'cb-kanban-workspace reúne las cinco vistas sobre el mismo [(columns)]: Lista, Tablero, Cronograma, Panel y Calendario. Cada botón enciende o apaga su vista, así que puedes ver varias a la vez ([(views)] es una lista), una debajo de otra o Lado a lado ([(sideBySide)]); la × de cada vista la oculta. Con multiple = false los botones son pestañas. Recibe las mismas opciones que las vistas (details, editable, addable, people…) y reemite sus eventos.':
    'cb-kanban-workspace brings the five views together over the same [(columns)]: List, Board, Timeline, Dashboard and Calendar. Each button turns its view on or off, so you can see several at once ([(views)] is a list), stacked or Side by side ([(sideBySide)]); the × on each view hides it. With multiple = false the buttons behave as tabs. It takes the same options as the views (details, editable, addable, people…) and re-emits their events.',
  'Vista de lista': 'List view',
  'cb-kanban-list muestra las mismas tareas como una tabla con una sección (contraíble) por columna, con responsables, fechas y prioridad. Usa el mismo [(columns)] que el tablero de arriba, así que las dos vistas se pueden mostrar a la vez y lo que cambies en una se ve en la otra. El círculo marca la tarea como finalizada (completed); las filas se arrastran entre secciones o se mueven con Alt + ↑/↓; Añadir tarea y Añadir sección crean tareas y secciones.':
    'cb-kanban-list shows the same tasks as a table with one (collapsible) section per column, with assignees, dates and priority. It uses the same [(columns)] as the board above, so both views can be shown at once and whatever you change in one shows up in the other. The circle marks the task as completed (completed); rows are dragged between sections or moved with Alt + ↑/↓; Add task and Add section create tasks and sections.',
  'Cronograma': 'Timeline',
  'cb-kanban-timeline es un diagrama de Gantt: una fila por sección y cada tarea como una barra de su inicio a su fin, con la línea de hoy. Arrastra la barra para cambiar sus fechas (o a otra sección), o sus bordes para cambiar la duración; con el teclado, Alt + ←→ la mueve un día, Alt + Mayús + ←→ cambia el fin y Alt + ↑↓ la pasa de sección. ‹ › avanzan una semana, − + cambian el ancho de los días ([(zoom)]) y Sin fecha lista las tareas sin fechas. Comparte [(columns)] con las vistas de arriba.':
    'cb-kanban-timeline is a Gantt chart: one row per section and each task as a bar from its start to its end, with a line for today. Drag the bar to change its dates (or to another section), or its edges to change its length; with the keyboard, Alt + ←→ moves it one day, Alt + Shift + ←→ changes the end and Alt + ↑↓ moves it to another section. ‹ › move one week, − + change the width of the days ([(zoom)]) and No date lists the tasks without dates. It shares [(columns)] with the views above.',
  'Vista de calendario': 'Calendar view',
  'cb-kanban-calendar pinta el mes con cada tarea como una barra desde su fecha de inicio hasta la de fin, del color de su columna. Arrastra una barra a otro día (o Alt + flechas: ←→ un día, ↑↓ una semana) para cambiar sus fechas; Añadir tarea en un día la crea con esa fecha. Sin fecha lista las tareas que aún no tienen. Comparte [(columns)] con el tablero y la lista de arriba.':
    'cb-kanban-calendar draws the month with each task as a bar from its start date to its end date, in its column color. Drag a bar to another day (or Alt + arrows: ←→ one day, ↑↓ one week) to change its dates; Add task on a day creates it with that date. No date lists the tasks that do not have one yet. It shares [(columns)] with the board and the list above.',
  'Panel de resumen': 'Dashboard',
  'cb-kanban-dashboard resume las mismas tareas: finalizadas (completed), sin finalizar, con retraso (fecha de fin pasada sin finalizar) y total, y gráficos de las tareas sin finalizar por sección y por responsable, por estado y de entregas por semana. Se recalcula al momento: marca una tarea como finalizada en la lista o muévela en el cronograma y el panel cambia. widgets elige qué bloques se ven y en qué orden.':
    'cb-kanban-dashboard summarizes the same tasks: completed (completed), incomplete, overdue (end date passed without finishing) and total, plus charts of incomplete tasks by section and by assignee, by status and of due dates by week. It updates instantly: mark a task as completed in the list or move it in the timeline and the dashboard changes. widgets picks which blocks are shown and in what order.',
  'La lista (cb-kanban-list) es una tabla con cabeceras de columna; cada sección es un grupo de filas (`th scope="rowgroup"`) con un botón que la contrae (`aria-expanded`) y dice cuántas tareas tiene.':
    'The list (cb-kanban-list) is a table with column headers; each section is a row group (`th scope="rowgroup"`) with a button that collapses it (`aria-expanded`) and says how many tasks it has.',
  'En la lista, el círculo es un botón conmutador (`aria-pressed`) con nombre ("Marcar «Diseño» como finalizada") y el nombre de la tarea es el botón que abre el detalle. Una tarea sin responsable lo dice con texto.':
    'In the list, the circle is a named toggle button (`aria-pressed`, "Mark “Design” as completed") and the task name is the button that opens the details. A task without an assignee says so in text.',
  'En el calendario (cb-kanban-calendar) cada semana es un grupo con nombre ("Semana del 9 al 15 mar") y cada tarea un botón que dice su nombre, fechas, prioridad, responsables y columna. Arrastrar no es la única forma de cambiar las fechas: Alt + flechas lo hace con el teclado y el cambio se anuncia.':
    'In the calendar (cb-kanban-calendar) each week is a named group ("Week of Mar 9 to 15") and each task a button that says its name, dates, priority, assignees and column. Dragging is not the only way to change dates: Alt + arrows does it with the keyboard and the change is announced.',
  'Cada día tiene un botón "Añadir tarea el miércoles, 20 de marzo de 2030" y el mes visible se anuncia al cambiarlo con ‹ ›.':
    'Each day has an "Add task on Wednesday, March 20, 2030" button and the visible month is announced when it changes with ‹ ›.',
  'En el cronograma (cb-kanban-timeline) cada sección es un grupo con nombre ("En curso, 2 tareas") y un botón que la contrae; cada tarea es un botón con su nombre, fechas, prioridad, responsables y sección. La cabecera de días es decorativa: el rango visible se dice con texto y se anuncia al cambiarlo.':
    'In the timeline (cb-kanban-timeline) each section is a named group ("In progress, 2 tasks") with a button that collapses it; each task is a button with its name, dates, priority, assignees and section. The day header is decorative: the visible range is given as text and announced when it changes.',
  'Arrastrar la barra o sus bordes no es la única forma de cambiar fechas o sección: Alt + flechas lo hace con el teclado y cada cambio se anuncia. Los botones del zoom tienen nombre ("Acercar", "Alejar") y se desactivan en los extremos.':
    'Dragging the bar or its edges is not the only way to change dates or section: Alt + arrows does it with the keyboard and every change is announced. The zoom buttons are named ("Zoom in", "Zoom out") and are disabled at the ends.',
  'El panel (cb-kanban-dashboard) es una región con nombre ("Panel del proyecto"). Cada bloque es una sección nombrada por su título, que es un encabezado (`headingLevel`, 3 por defecto); los indicadores se leen como texto y el color de "con retraso" no es la única señal.':
    'The dashboard (cb-kanban-dashboard) is a named region ("Project dashboard"). Each block is a section named by its title, which is a heading (`headingLevel`, 3 by default); the indicators are read as text and the color of "overdue" is not the only cue.',
  'Cada gráfico lleva su título como nombre y, como todos los `cb-chart`, una tabla oculta con los datos; sus barras y sectores se recorren con el teclado.':
    'Each chart is named by its title and, like every `cb-chart`, has a hidden table with the data; its bars and slices can be browsed with the keyboard.',
  'En el espacio de trabajo (cb-kanban-workspace) las vistas son botones conmutadores (`aria-pressed`) en un grupo con nombre ("Vistas"), porque varias pueden estar encendidas a la vez; un texto oculto lo explica. Con `multiple = false` también son conmutadores, con una sola encendida.':
    'In the workspace (cb-kanban-workspace) the views are toggle buttons (`aria-pressed`) in a named group ("Views"), because several can be on at once; hidden text explains it. With `multiple = false` they are toggles too, with only one on.',
  'Con varias vistas, cada una es una sección con un encabezado ("Lista", `headingLevel`) y un botón "Ocultar Lista"; al ocultarla, el foco vuelve a su botón. "Lado a lado" es otro conmutador y en pantallas estrechas las vistas vuelven a apilarse.':
    'With several views, each one is a section with a heading ("List", `headingLevel`) and a "Hide List" button; when it is hidden, focus returns to its button. "Side by side" is another toggle and on narrow screens the views stack again.',
  'Supr': 'Delete',
  'Alt + flecha arriba / abajo (lista)': 'Alt + up / down arrow (list)',
  'Mueve la tarea en la lista; en el borde pasa a la sección vecina.':
    'Moves the task in the list; at the edge it goes to the neighbouring section.',
  'Alt + flechas (calendario)': 'Alt + arrows (calendar)',
  'Izquierda / derecha mueven la tarea un día; arriba / abajo, una semana. El calendario sigue a la tarea si cambia de mes.':
    'Left / right move the task one day; up / down, one week. The calendar follows the task if it changes month.',
  'Alt + izquierda / derecha (cronograma)': 'Alt + left / right (timeline)',
  'Mueve la tarea un día (mantiene la duración). El cronograma sigue a la tarea si sale del rango.':
    'Moves the task one day (keeps its length). The timeline follows the task if it leaves the range.',
  'Alt + Mayús + izquierda / derecha (cronograma)': 'Alt + Shift + left / right (timeline)',
  'Adelanta o atrasa la fecha de fin (nunca antes del inicio).': 'Moves the end date earlier or later (never before the start).',
  'Alt + flecha arriba / abajo (cronograma)': 'Alt + up / down arrow (timeline)',
  'Pasa la tarea a la sección anterior o siguiente.': 'Moves the task to the previous or next section.',
  'Haz clic (o Enter) en una tarjeta para abrir su detalle: cambia la columna, asigna personas, elige la prioridad, pon fecha de inicio y de fin, escribe la descripción y adjunta archivos (botón o arrastrándolos). Cada cambio se aplica al momento, actualiza [(columns)] y emite cardEdit. Arrastra tarjetas a cualquier punto de otra columna; el menú ⋮ edita, mueve o elimina (F2 y Supr con el teclado); las columnas se renombran, se contraen, se eliminan y se añaden. En curso tiene límite de 3 (enforceLimit).':
    'Click (or press Enter on) a card to open its details: change the column, assign people, pick the priority, set start and due dates, write the description and attach files (button or drag and drop). Every change applies immediately, updates [(columns)] and emits cardEdit. Drag cards to any point of another column; the ⋮ menu edits, moves or deletes (F2 and Delete with the keyboard); columns can be renamed, collapsed, deleted and added. In progress has a limit of 3 (enforceLimit).',
  'Tarjeta personalizada': 'Custom card',
  'Con una plantilla cbKanbanCard pintas la tarjeta a tu manera; recibe la tarjeta, su columna y su posición.':
    'With a cbKanbanCard template you render the card your way; it receives the card, its column and its position.',
  'Al abrir una tarjeta muestra el panel de detalle (responsables, prioridad, fechas, descripción y adjuntos).':
    'Opening a card shows the details panel (assignees, priority, dates, description and attachments).',
  'Personas que se pueden asignar (id, name, image).': 'People that can be assigned (id, name, image).',
  'Niveles de prioridad (id, label, severity). Por defecto: baja, media y alta.': 'Priority levels (id, label, severity). Defaults: low, medium and high.',
  'Tipos de archivo admitidos en los adjuntos (p. ej. image/*,.pdf).': 'File types accepted as attachments (e.g. image/*,.pdf).',
  'Tarjeta editada: título o campos del panel ({ item, previous, column, index }).': 'Card edited: title or panel fields ({ item, previous, column, index }).',
  'Con `details`, la tarjeta indica que abre un diálogo (`aria-haspopup="dialog"`). El panel es un `dialog` modal con el foco atrapado; cada campo tiene etiqueta y, al cerrarlo, el foco vuelve a la tarjeta aunque haya cambiado de columna.':
    'With `details`, the card announces that it opens a dialog (`aria-haspopup="dialog"`). The panel is a modal `dialog` with trapped focus; every field is labelled and, when it closes, focus returns to the card even if it changed column.',
  'En la tarjeta, la prioridad, las fechas (y si está vencida), los adjuntos y los responsables se leen con texto: los avatares son decorativos y llevan los nombres en texto oculto.':
    'On the card, the priority, dates (and whether it is overdue), attachments and assignees are read as text: avatars are decorative and carry the names in hidden text.',
  'Los adjuntos se añaden con un botón (el arrastre de archivos es opcional) y cada uno tiene su botón "Quitar" con nombre.':
    'Attachments are added with a button (dropping files is optional) and each one has its own named "Remove" button.',
  'Abre la tarjeta (cardOpen) y, con details, su panel de detalle.': 'Opens the card (cardOpen) and, with details, its details panel.',
  'Escape (en el panel)': 'Escape (in the panel)',
  'Cierra el panel de detalle y devuelve el foco a la tarjeta.': 'Closes the details panel and returns focus to the card.',
  // --- Accesibilidad, tanda 1 (formularios y menús) ---
  'Renderiza un `button` nativo, que se anuncia como botón con su texto. Un botón de solo icono necesita `ariaLabel`, porque el icono es decorativo (`aria-hidden`).':
    'Renders a native `button`, announced as a button with its text. An icon-only button needs `ariaLabel`, because the icon is decorative (`aria-hidden`).',
  'Con `loading` el botón se deshabilita y expone `aria-busy="true"`. Si abre algo (un menú, un diálogo), `ariaHaspopup`, `ariaExpanded` y `ariaControls` lo indican al lector de pantalla.':
    'With `loading` the button is disabled and exposes `aria-busy="true"`. If it opens something (a menu, a dialog), `ariaHaspopup`, `ariaExpanded` and `ariaControls` tell the screen reader.',
  'Activa el botón.': 'Activates the button.',
  'Los valores se escriben en un campo de texto nativo; sin etiqueta visible, define `ariaLabel`. Con Angular Forms, `aria-invalid` y `aria-required` siguen al estado del control.':
    'Values are typed into a native text field; without a visible label, set `ariaLabel`. With Angular Forms, `aria-invalid` and `aria-required` follow the control state.',
  'Cada valor tiene un botón para quitarlo con nombre propio ("Quitar React"); el icono es decorativo.':
    'Each value has its own named remove button ("Remove React"); the icon is decorative.',
  'Enter / ,': 'Enter / ,',
  'Añade lo escrito como un valor nuevo.': 'Adds the typed text as a new value.',
  'Con el campo vacío, quita el último valor.': 'With an empty field, removes the last value.',
  'El disparador es un botón con `aria-haspopup="dialog"` y `aria-expanded`; su nombre incluye el color actual ("Color: #10b981") y se cambia con `ariaLabel`.':
    'The trigger is a button with `aria-haspopup="dialog"` and `aria-expanded`; its name includes the current color ("Color: #10b981") and is changed with `ariaLabel`.',
  'El panel es un `role="dialog"` nombrado. El área de saturación y brillo y la barra de tono son `role="slider"`: el área anuncia su valor como texto ("Saturación 84 %, brillo 71 %") y el tono en grados. El campo hexadecimal y los colores predefinidos tienen nombre.':
    'The panel is a named `role="dialog"`. The saturation and brightness area and the hue bar are `role="slider"`: the area announces its value as text ("Saturation 84%, brightness 71%") and the hue in degrees. The hex field and the preset colors are named.',
  'Abre el panel; el foco pasa al área de color.': 'Opens the panel; focus moves to the color area.',
  'En el área, cambia la saturación; en la barra de tono, el tono.': 'In the area, changes the saturation; in the hue bar, the hue.',
  'En el área, cambia el brillo; en la barra de tono, el tono.': 'In the area, changes the brightness; in the hue bar, the hue.',
  'Mayús + flechas': 'Shift + arrows',
  'Cambia el valor de 10 en 10.': 'Changes the value in steps of 10.',
  'En la barra de tono, va al primer o al último tono.': 'In the hue bar, goes to the first or last hue.',
  'Recorre el panel; al salir de él se cierra y el foco vuelve al botón.':
    'Moves through the panel; leaving it closes the panel and returns focus to the button.',
  'Cierra el panel y devuelve el foco al botón.': 'Closes the panel and returns focus to the button.',
  'Los botones Elegir archivo, Subir y Limpiar son botones nativos con texto. El selector de archivos es el nativo del sistema, que se abre desde el botón.':
    'The Choose file, Upload and Clear buttons are native buttons with text. The file picker is the native one of the system, opened from the button.',
  'Los archivos descartados por tamaño o tipo se anuncian en una lista `role="alert"`, y cada archivo de la lista tiene un botón con nombre para quitarlo ("Quitar informe.pdf"). Arrastrar archivos es opcional: todo se puede hacer con los botones.':
    'Files rejected for size or type are announced in a `role="alert"` list, and each file in the list has a named button to remove it ("Remove report.pdf"). Dragging files is optional: everything can be done with the buttons.',
  'Abre el selector de archivos, sube o limpia la lista.': 'Opens the file picker, uploads or clears the list.',
  'La etiqueta flotante es un `label` normal: asócialo al campo con `for` e `id` (`inputId` en los componentes de CaribeNG) para que el lector de pantalla la anuncie. Subirla o bajarla es solo visual.':
    'The floating label is a regular `label`: associate it with the field using `for` and `id` (`inputId` in CaribeNG components) so the screen reader announces it. Moving it up or down is only visual.',
  'No uses el placeholder como única etiqueta: desaparece al escribir y no todos los lectores lo anuncian.':
    'Do not use the placeholder as the only label: it disappears while typing and not every screen reader announces it.',
  'El icono (`cb-input-icon`) es decorativo (`aria-hidden="true"`): el campo necesita su propia etiqueta o `aria-label`. Si el icono hace algo (buscar, limpiar), usa un botón con nombre en lugar de un icono.':
    'The icon (`cb-input-icon`) is decorative (`aria-hidden="true"`): the field needs its own label or `aria-label`. If the icon does something (search, clear), use a named button instead of an icon.',
  'Solo agrupa visualmente: cada control proyectado (campo, botón) conserva su propio rol y nombre. Los addons de texto ("€", "https://") no forman parte de la etiqueta; si el campo los necesita para entenderse, inclúyelos en su `aria-label` o en el texto de ayuda.':
    'It only groups visually: each projected control (field, button) keeps its own role and name. Text addons ("€", "https://") are not part of the label; if the field needs them to make sense, include them in its `aria-label` or in the help text.',
  'Es un campo de texto nativo: asócialo a su etiqueta con `inputId` (`<label for>`) o, sin etiqueta visible, define `ariaLabel`. Con Angular Forms, `aria-invalid` y `aria-required` siguen al estado del control.':
    'It is a native text field: associate it with its label using `inputId` (`<label for>`) or, without a visible label, set `ariaLabel`. With Angular Forms, `aria-invalid` and `aria-required` follow the control state.',
  'La máscara se muestra como placeholder ("(999) 999-9999") y los literales se insertan al escribir. Explica el formato esperado en un texto de ayuda: el placeholder desaparece al escribir.':
    'The mask is shown as the placeholder ("(999) 999-9999") and the literals are inserted while typing. Explain the expected format in a help text: the placeholder disappears while typing.',
  'Borra el último carácter, también los literales de la máscara.': 'Deletes the last character, including the mask literals.',
  'El control tiene `role="slider"` con `aria-valuemin`, `aria-valuemax` y `aria-valuenow`, y su nombre se define con `ariaLabel`. Deshabilitado, sale del orden de tabulación y expone `aria-disabled`.':
    'The control has `role="slider"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow`, and its name is set with `ariaLabel`. When disabled, it leaves the tab order and exposes `aria-disabled`.',
  'Aumenta el valor un paso (`step`).': 'Increases the value by one step (`step`).',
  'Disminuye el valor un paso.': 'Decreases the value by one step.',
  'Es un campo `type="password"` nativo; asócialo a su etiqueta con `inputId`. El botón de mostrar es un conmutador (`aria-pressed`) con nombre: "Mostrar contraseña" u "Ocultar contraseña".':
    'It is a native `type="password"` field; associate it with its label using `inputId`. The show button is a named toggle (`aria-pressed`): "Show password" or "Hide password".',
  'Con `feedback`, la fortaleza ("Fortaleza: Media") se anuncia en una región `role="status"` mientras se escribe; las barras de color son decorativas.':
    'With `feedback`, the strength ("Strength: Medium") is announced in a `role="status"` region while typing; the colored bars are decorative.',
  'En el botón, muestra u oculta la contraseña.': 'On the button, shows or hides the password.',
  'Es un botón conmutador: `aria-pressed` indica si está activo. El texto del botón es su nombre; con solo icono, define `ariaLabel`.':
    'It is a toggle button: `aria-pressed` tells whether it is on. The button text is its name; with only an icon, set `ariaLabel`.',
  'Es un `nav` nombrado ("Ruta de navegación") con una lista ordenada. Cada nivel es un enlace, salvo el último, que es texto con `aria-current="page"`. Los separadores y los iconos son decorativos.':
    'It is a named `nav` ("Breadcrumb") with an ordered list. Each level is a link, except the last one, which is text with `aria-current="page"`. Separators and icons are decorative.',
  'Sigue el enlace.': 'Follows the link.',
  'Es un `nav` nombrado ("Dock de la aplicación", o `ariaLabel`) que contiene una barra `role="toolbar"` con `aria-orientation` según la posición. Cada acción es un enlace o un botón con nombre (`label`), porque solo muestra el icono.':
    'It is a named `nav` ("App dock", or `ariaLabel`) holding a `role="toolbar"` bar with `aria-orientation` set by the position. Each action is a link or a button named by `label`, because it only shows the icon.',
  'Entra en la barra por la última acción enfocada; un solo Tab la atraviesa.':
    'Enters the bar at the last focused action; a single Tab moves past it.',
  'Pasa a la acción siguiente o anterior (de forma circular) en un dock horizontal.':
    'Moves to the next or previous action (wrapping around) in a horizontal dock.',
  'Igual, en un dock vertical (posición `left` o `right`).': 'The same, in a vertical dock (`left` or `right` position).',
  'Activa la acción enfocada.': 'Activates the focused action.',
  'Es un `nav` nombrado ("Navegación principal", o `ariaLabel`) con una barra `role="menubar"`. Cada entrada es un `role="menuitem"`; las que tienen submenú indican `aria-haspopup="menu"` y `aria-expanded`, y el submenú es un `role="menu"` nombrado por su entrada.':
    'It is a named `nav` ("Main navigation", or `ariaLabel`) with a `role="menubar"` bar. Each entry is a `role="menuitem"`; those with a submenu expose `aria-haspopup="menu"` and `aria-expanded`, and the submenu is a `role="menu"` named by its entry.',
  'En la barra, pasa a la entrada siguiente o anterior (de forma circular) y cierra el submenú abierto.':
    'In the bar, moves to the next or previous entry (wrapping around) and closes the open submenu.',
  'Va a la primera o a la última entrada de la barra.': 'Goes to the first or last entry of the bar.',
  'En una entrada con submenú, lo abre y enfoca su primera opción.': 'On an entry with a submenu, opens it and focuses its first option.',
  'Dentro del submenú, recorre las opciones (de forma circular).': 'Inside the submenu, moves through the options (wrapping around).',
  'Abre el submenú o activa la opción.': 'Opens the submenu or activates the option.',
  'Cierra el submenú y devuelve el foco a su entrada.': 'Closes the submenu and returns focus to its entry.',
  'Es un `nav` nombrado ("Menú de paneles", o `ariaLabel`). Cada grupo se abre con un botón que indica `aria-expanded` y apunta a su lista con `aria-controls`; las opciones son enlaces o botones normales.':
    'It is a named `nav` ("Panel menu", or `ariaLabel`). Each group opens with a button that exposes `aria-expanded` and points to its list with `aria-controls`; the options are regular links or buttons.',
  'Abre o cierra el grupo, o activa la opción.': 'Opens or closes the group, or activates the option.',
  'El botón principal tiene nombre ("Abrir acciones" / "Cerrar acciones", o `openLabel` y `closeLabel`) y `aria-expanded`. Las acciones solo existen mientras está abierto; cada una es un botón con nombre (`label`), porque solo muestra el icono.':
    'The main button is named ("Open actions" / "Close actions", or `openLabel` and `closeLabel`) and has `aria-expanded`. The actions only exist while it is open; each one is a button named by `label`, because it only shows the icon.',
  'Abre o cierra las acciones, o activa la acción enfocada.': 'Opens or closes the actions, or activates the focused action.',
  'Es un `nav` nombrado ("Pasos", o `ariaLabel`) con una lista ordenada. Cada paso es un botón con su nombre; el paso actual expone `aria-current="step"` y los deshabilitados no se pueden activar. Los conectores son decorativos.':
    'It is a named `nav` ("Steps", or `ariaLabel`) with an ordered list. Each step is a button with its name; the current step exposes `aria-current="step"` and disabled steps cannot be activated. The connectors are decorative.',
  'Va al paso enfocado.': 'Goes to the focused step.',
  'Es un `nav` nombrado ("Navegación de secciones", o `ariaLabel`): navega entre páginas, así que usa enlaces o botones y no el patrón de pestañas. La opción actual expone `aria-current="page"`; las deshabilitadas salen del orden de tabulación.':
    'It is a named `nav` ("Section navigation", or `ariaLabel`): it navigates between pages, so it uses links or buttons rather than the tabs pattern. The current option exposes `aria-current="page"`; disabled ones leave the tab order.',
  'Abre la sección.': 'Opens the section.',
  'El botón que lo abre indica `aria-haspopup="menu"` y `aria-expanded`. El panel es un `role="menu"` nombrado (`ariaLabel`) con `role="menuitem"` en cada opción; las que abren otro nivel indican `aria-haspopup="menu"` y `aria-expanded`, y cada submenú se nombra por su opción.':
    'The button that opens it exposes `aria-haspopup="menu"` and `aria-expanded`. The panel is a named `role="menu"` (`ariaLabel`) with `role="menuitem"` on each option; those opening another level expose `aria-haspopup="menu"` and `aria-expanded`, and each submenu is named by its option.',
  'En el botón, abre el menú y enfoca la primera opción.': 'On the button, opens the menu and focuses the first option.',
  'Recorre las opciones del nivel (de forma circular, sin pasar por las deshabilitadas).':
    'Moves through the options of the level (wrapping around, skipping disabled ones).',
  'Va a la primera o a la última opción del nivel.': 'Goes to the first or last option of the level.',
  'Flecha derecha / Enter / Espacio': 'Right arrow / Enter / Space',
  'En una opción con submenú, lo abre y enfoca su primera opción.': 'On an option with a submenu, opens it and focuses its first option.',
  'Cierra el submenú y vuelve a la opción que lo abrió.': 'Closes the submenu and goes back to the option that opened it.',
  'Activa la opción y cierra el menú.': 'Activates the option and closes the menu.',
  'Cierra el menú y devuelve el foco al botón.': 'Closes the menu and returns focus to the button.',
  'Mueve el foco al botón.': 'Moves focus to the button.',
  'Mueve el foco al campo y a los botones de quitar.': 'Moves focus to the field and the remove buttons.',
  'Mueve el foco a los botones y a los de quitar archivo.': 'Moves focus to the buttons and the remove-file buttons.',
  'Mueve el foco a cada control del grupo, en orden.': 'Moves focus to each control of the group, in order.',
  'Mueve el foco al campo y al botón de mostrar.': 'Moves focus to the field and the show button.',
  'Mueve el foco a cada enlace.': 'Moves focus to each link.',
  'Mueve el foco a cada grupo y a las opciones de los grupos abiertos.': 'Moves focus to each group and to the options of the open groups.',
  'Mueve el foco al botón principal y, abierto, a cada acción.': 'Moves focus to the main button and, when open, to each action.',
  'Mueve el foco a cada paso.': 'Moves focus to each step.',
  'Mueve el foco a cada opción.': 'Moves focus to each option.',
  // --- Accesibilidad, tanda 2 (panel, layout y datos) ---
  'Cada panel tiene un encabezado `h3` con un botón que indica `aria-expanded`. Abierto, el contenido es un `role="region"` nombrado por su encabezado y el botón apunta a él con `aria-controls`. Los paneles deshabilitados no se pueden abrir.':
    'Each panel has an `h3` heading with a button that exposes `aria-expanded`. When open, the content is a `role="region"` named by its heading and the button points to it with `aria-controls`. Disabled panels cannot be opened.',
  'Con `multiple` se pueden abrir varios a la vez; si no, abrir uno cierra el anterior.':
    'With `multiple` several can be open at once; otherwise, opening one closes the previous one.',
  'Abre o cierra el panel.': 'Opens or closes the panel.',
  'Es un contenedor sin rol propio. El título (`header`) es un encabezado `h3` y el subtítulo un párrafo, así que la tarjeta aparece en la lista de encabezados del lector de pantalla.':
    'It is a container without its own role. The title (`header`) is an `h3` heading and the subtitle a paragraph, so the card shows up in the screen reader headings list.',
  'Si toda la tarjeta lleva a un sitio, pon un enlace en el título en lugar de hacer pulsable el contenedor, para que tenga un nombre corto.':
    'If the whole card leads somewhere, put a link on the title instead of making the container clickable, so it gets a short name.',
  'Tiene `role="separator"` con `aria-orientation`. El texto dentro del separador es decorativo para muchos lectores de pantalla: si la etiqueta importa, ponla también fuera (por ejemplo, como encabezado de la sección).':
    'It has `role="separator"` with `aria-orientation`. Text inside the separator is decorative for many screen readers: if the label matters, put it outside too (for example, as the section heading).',
  'Usa `fieldset` y `legend` nativos, de modo que la leyenda nombra el grupo de campos y se anuncia al entrar en él.':
    'It uses native `fieldset` and `legend`, so the legend names the group of fields and is announced when entering it.',
  'Con `toggleable`, la leyenda contiene un botón con `aria-expanded`; abierto, el contenido es un `role="region"` nombrado por la leyenda y el botón apunta a él con `aria-controls`.':
    'With `toggleable`, the legend holds a button with `aria-expanded`; when open, the content is a `role="region"` named by the legend and the button points to it with `aria-controls`.',
  'Abre o cierra el contenido.': 'Opens or closes the content.',
  'El contenido es un `role="region"` nombrado por el título (`header`). Con `toggleable`, el botón de plegar indica `aria-expanded`, se nombra con el título y apunta al contenido con `aria-controls` mientras está abierto.':
    'The content is a `role="region"` named by the title (`header`). With `toggleable`, the collapse button exposes `aria-expanded`, is named with the title and points to the content with `aria-controls` while it is open.',
  'El título no es un encabezado: si el panel abre una sección de la página, pon un encabezado dentro o antes de él.':
    'The title is not a heading: if the panel starts a section of the page, put a heading inside or before it.',
  'Pliega o despliega el contenido.': 'Collapses or expands the content.',
  'El área es un `role="region"` enfocable (`tabindex="0"`) con nombre ("Área desplazable", o `ariaLabel`), para que quien usa teclado pueda desplazar su contenido.':
    'The area is a focusable `role="region"` (`tabindex="0"`) with a name ("Scrollable area", or `ariaLabel`), so keyboard users can scroll its content.',
  'Desplaza el contenido.': 'Scrolls the content.',
  'Va al principio o al final del contenido.': 'Goes to the start or the end of the content.',
  'Es un botón con nombre ("Volver arriba", o `ariaLabel`); el icono es decorativo. Solo existe a partir del umbral (`threshold`), así que no aparece en el orden de tabulación arriba de la página.':
    'It is a named button ("Scroll to top", or `ariaLabel`); the icon is decorative. It only exists past the threshold (`threshold`), so it is not in the tab order at the top of the page.',
  'Con "reducir movimiento" activado en el sistema, el desplazamiento es instantáneo aunque `behavior` sea `smooth`.':
    'With "reduce motion" turned on in the system, scrolling is instant even if `behavior` is `smooth`.',
  'Vuelve al principio.': 'Goes back to the top.',
  'Cada barra entre paneles es un `role="separator"` enfocable con nombre ("Redimensionar paneles"), `aria-orientation` y el tamaño del panel anterior en `aria-valuenow` (en %), entre `aria-valuemin` y `aria-valuemax`.':
    'Each bar between panels is a focusable `role="separator"` with a name ("Resize panels"), `aria-orientation` and the size of the previous panel in `aria-valuenow` (in %), between `aria-valuemin` and `aria-valuemax`.',
  'En un splitter horizontal, cambia el tamaño un paso (`step`, 5 % por defecto).':
    'In a horizontal splitter, changes the size by one step (`step`, 5% by default).',
  'Igual, en un splitter vertical.': 'The same, in a vertical splitter.',
  'Lleva el panel a su tamaño mínimo o al máximo.': 'Takes the panel to its minimum or maximum size.',
  'Los pasos forman una lista ordenada de botones. Cada uno se nombra con su posición y su etiqueta ("Paso 2 de 3: Perfil"), añade "completado" a los que ya pasaron, y el actual expone `aria-current="step"`.':
    'The steps are an ordered list of buttons. Each one is named with its position and label ("Step 2 of 3: Profile"), adds "completed" to the ones already passed, and the current one exposes `aria-current="step"`.',
  'Solo se muestra el contenido del paso actual. Los botones Atrás y Siguiente se desactivan en el primer y en el último paso.':
    'Only the content of the current step is shown. The Back and Next buttons are disabled on the first and last step.',
  'Va al paso enfocado o pulsa Atrás / Siguiente.': 'Goes to the focused step or presses Back / Next.',
  'El contenedor tiene `role="toolbar"` con nombre ("Barra de herramientas", o `ariaLabel`); si hay varias en la página, dale a cada una un nombre distinto. Los controles proyectados conservan su rol y su nombre.':
    'The container has `role="toolbar"` with a name ("Toolbar", or `ariaLabel`); if the page has several, give each one a different name. Projected controls keep their role and name.',
  'Los elementos forman un `role="list"` en las dos vistas. Con `showLayoutToggle`, el cambio de vista es un grupo nombrado ("Cambiar vista") de dos conmutadores (`aria-pressed`): "Vista de lista" y "Vista de cuadrícula".':
    'The items form a `role="list"` in both views. With `showLayoutToggle`, the view switch is a named group ("Change layout") of two toggles (`aria-pressed`): "List view" and "Grid view".',
  'En la plantilla por defecto, el botón de cada elemento se nombra con él ("Seleccionar Producto 1") e indica con `aria-pressed` si está elegido. Con `rows`, la paginación es un `cb-paginator`.':
    'In the default template, each item button is named after the item ("Select Product 1") and tells with `aria-pressed` whether it is chosen. With `rows`, pagination is a `cb-paginator`.',
  'Cambia la vista o elige el elemento.': 'Changes the view or chooses the item.',
  'El organigrama es un grupo nombrado ("Organigrama", o `ariaLabel`) de listas anidadas: cada nivel es una lista dentro del nodo del que depende, así que el lector de pantalla anuncia cuántos nodos tiene y en qué nivel está.':
    'The chart is a named group ("Organization chart", or `ariaLabel`) of nested lists: each level is a list inside the node it depends on, so the screen reader announces how many nodes it has and which level it is on.',
  'Cada nodo es un botón con nombre ("Seleccionar Ingeniería") que indica con `aria-pressed` si está elegido. Los que tienen hijos tienen además un botón "Expandir …" / "Contraer …" con `aria-expanded`.':
    'Each node is a named button ("Select Engineering") that tells with `aria-pressed` whether it is chosen. Nodes with children also have an "Expand …" / "Collapse …" button with `aria-expanded`.',
  'Elige el nodo, o expande o contrae sus hijos.': 'Chooses the node, or expands or collapses its children.',
  'Es una región `role="navigation"` nombrada ("Paginación"). Los botones de primera, anterior, siguiente y última página tienen nombre, y se desactivan cuando no hay adónde ir; la página actual expone `aria-current="page"`.':
    'It is a named `role="navigation"` region ("Pagination"). The first, previous, next and last page buttons are named and disabled when there is nowhere to go; the current page exposes `aria-current="page"`.',
  'El selector de filas por página es un `select` nativo con nombre ("Registros por página").':
    'The rows per page selector is a named native `select` ("Rows per page").',
  'Va a la página.': 'Goes to the page.',
  'En el selector, cambia las filas por página.': 'In the selector, changes the rows per page.',
  'Es una lista ordenada con nombre ("Cronología", o `ariaLabel`): cada evento es un elemento de la lista, en orden. Los marcadores y los conectores son decorativos, así que el color o el icono de un evento no debe ser la única forma de transmitir su estado.':
    'It is a named ordered list ("Timeline", or `ariaLabel`): each event is a list item, in order. Markers and connectors are decorative, so the color or icon of an event must not be the only way to convey its status.',
  'Mueve el foco al encabezado de cada panel.': 'Moves focus to the heading of each panel.',
  'Mueve el foco al botón de la leyenda (con toggleable) y a los campos.':
    'Moves focus to the legend button (with toggleable) and to the fields.',
  'Mueve el foco a las acciones de la cabecera y al botón de plegar.': 'Moves focus to the header actions and the collapse button.',
  'Mueve el foco al área.': 'Moves focus to the area.',
  'Mueve el foco a cada barra.': 'Moves focus to each bar.',
  'Mueve el foco a cada paso, al contenido y a Atrás / Siguiente.': 'Moves focus to each step, to the content and to Back / Next.',
  'Mueve el foco a cada control de la barra, en orden.': 'Moves focus to each control of the bar, in order.',
  'Mueve el foco al cambio de vista, a los botones de cada elemento y a la paginación.':
    'Moves focus to the view switch, to each item button and to the pagination.',
  'Mueve el foco a cada nodo y a su botón de expandir.': 'Moves focus to each node and its expand button.',
  'Mueve el foco a cada botón y al selector de filas.': 'Moves focus to each button and the rows selector.',
  // --- Accesibilidad, tanda 3 (mensajes, varios y directivas) ---
  'Mayús + Tab': 'Shift + Tab',
  'Flechas / Inicio / Fin': 'Arrows / Home / End',
  'Solo cambia clases CSS: no añade roles ni oculta nada a los lectores de pantalla, que leen el contenido aunque todavía no haya entrado en pantalla.':
    'It only changes CSS classes: it adds no roles and hides nothing from screen readers, which read the content even before it has scrolled into view.',
  'Envuelve la animación de tus clases en `@media (prefers-reduced-motion: no-preference)` para respetar a quien pide reducir movimiento.':
    'Wrap the animation of your classes in `@media (prefers-reduced-motion: no-preference)` to respect people who ask for reduced motion.',
  'Enfoca el elemento al montarse, y el lector de pantalla lo anuncia. Úsalo cuando el foco tenga un destino claro (el primer campo de un diálogo o de un formulario recién abierto), no al cargar la página: saltarse el contenido anterior desorienta.':
    'It focuses the element when it is mounted, and the screen reader announces it. Use it when focus has a clear destination (the first field of a dialog or of a form that just opened), not on page load: skipping the content before it is disorienting.',
  'El elemento tiene que poder recibir el foco: un control nativo o un elemento con `tabindex="-1"`.':
    'The element must be able to receive focus: a native control or an element with `tabindex="-1"`.',
  'Con `ariaLabel`, el avatar es un `role="img"` con ese nombre (la imagen interna lleva `alt=""` para no repetirlo). Sin él, las iniciales (`label`) se leen tal cual, y el icono o la imagen se ignoran.':
    'With `ariaLabel`, the avatar is a `role="img"` with that name (the inner image has `alt=""` so it is not repeated). Without it, the initials (`label`) are read as they are, and the icon or image is ignored.',
  'Si el nombre de la persona ya aparece al lado, no pongas `ariaLabel`: se leería dos veces.':
    'If the person\'s name already appears next to it, do not set `ariaLabel`: it would be read twice.',
  'Es un `role="group"`: nómbralo con `ariaLabel` ("Participantes"). Si incluyes un avatar de recuento ("+3"), dale un `ariaLabel` como "3 más".':
    'It is a `role="group"`: name it with `ariaLabel` ("Participants"). If you include a count avatar ("+3"), give it an `ariaLabel` such as "3 more".',
  'Sin `ariaLabel` se lee el valor tal cual ("8"), que fuera de contexto dice poco: dale un `ariaLabel` como "8 mensajes sin leer", o incluye el contexto en el nombre del control al que acompaña.':
    'Without `ariaLabel` the value is read as it is ("8"), which says little out of context: give it an `ariaLabel` such as "8 unread messages", or include the context in the name of the control it goes with.',
  'Con `dot` y sin `ariaLabel` es decorativo (`aria-hidden`). El color nunca debe ser la única forma de transmitir el estado.':
    'With `dot` and no `ariaLabel` it is decorative (`aria-hidden`). Color must never be the only way to convey the status.',
  'La etiqueta se lee como texto; el icono es decorativo y la imagen lleva `alt=""`. Con `removable`, el botón de quitar se nombra con la etiqueta ("Quitar Angular").':
    'The label is read as text; the icon is decorative and the image has `alt=""`. With `removable`, the remove button is named with the label ("Remove Angular").',
  'Al quitar el chip, su botón desaparece: en `(removed)`, mueve el foco a un elemento cercano para que no se pierda.':
    'When the chip is removed its button disappears: in `(removed)`, move focus to a nearby element so it is not lost.',
  'Mueve el foco al botón de quitar.': 'Moves focus to the remove button.',
  'Quita el chip.': 'Removes the chip.',
  'El título es texto; con `clickable` es un botón que emite `open`. El icono es decorativo.':
    'The title is text; with `clickable` it is a button that emits `open`. The icon is decorative.',
  'Con `actions`, el botón de acciones se nombra con el título ("Más acciones: informe.pdf"), indica `aria-haspopup="menu"` y `aria-expanded`, y abre un `cb-menu`; al cerrarlo, el foco vuelve al botón.':
    'With `actions`, the actions button is named with the title ("More actions: report.pdf"), exposes `aria-haspopup="menu"` and `aria-expanded`, and opens a `cb-menu`; when it closes, focus returns to the button.',
  'Mueve el foco al título (con clickable) y al botón de acciones.': 'Moves focus to the title (with clickable) and the actions button.',
  'Abre el archivo o el menú de acciones.': 'Opens the file or the actions menu.',
  'En el botón de acciones, abre el menú y enfoca la primera opción.':
    'On the actions button, opens the menu and focuses the first option.',
  'Mantiene Tab y Mayús + Tab dentro del contenedor. No mueve el foco al activarse ni lo devuelve al desactivarse: hazlo tú (por ejemplo, con `cbAutoFocus` al abrir y enfocando el disparador al cerrar).':
    'It keeps Tab and Shift+Tab inside the container. It does not move focus when enabled nor return it when disabled: do that yourself (for example, with `cbAutoFocus` on open and by focusing the trigger on close).',
  'Úsalo solo en capas modales y ofrece siempre una salida con teclado (un botón de cerrar o Escape). `cbFocusTrapDisabled` lo desactiva.':
    'Use it only in modal layers and always offer a keyboard way out (a close button or Escape). `cbFocusTrapDisabled` turns it off.',
  'Pasa al siguiente elemento; desde el último, vuelve al primero.':
    'Moves to the next element; from the last one, goes back to the first.',
  'Pasa al anterior; desde el primero, va al último.': 'Moves to the previous one; from the first, goes to the last.',
  'El nombre es texto; con `clickable` es un botón que emite `open`. El icono de carpeta es decorativo, y el número de archivos y el tamaño se leen como texto.':
    'The name is text; with `clickable` it is a button that emits `open`. The folder icon is decorative, and the file count and size are read as text.',
  'Con `actions`, el botón de acciones se nombra con la carpeta ("Más acciones: Facturas"), indica `aria-haspopup="menu"` y `aria-expanded`, y abre un `cb-menu`; al cerrarlo, el foco vuelve al botón.':
    'With `actions`, the actions button is named with the folder ("More actions: Invoices"), exposes `aria-haspopup="menu"` and `aria-expanded`, and opens a `cb-menu`; when it closes, focus returns to the button.',
  'Mueve el foco al nombre (con clickable) y al botón de acciones.': 'Moves focus to the name (with clickable) and the actions button.',
  'Abre la carpeta o el menú de acciones.': 'Opens the folder or the actions menu.',
  'Con severidad `danger` o `warn` es un `role="alert"` y se anuncia al momento; con `info` o `success` es un `role="status"`, que se anuncia sin interrumpir. El icono es decorativo.':
    'With `danger` or `warn` severity it is a `role="alert"` and is announced at once; with `info` or `success` it is a `role="status"`, announced without interrupting. The icon is decorative.',
  'Para asociarlo a un campo, dale un `id` y apúntalo desde el campo con `aria-describedby`.':
    'To associate it with a field, give it an `id` and point to it from the field with `aria-describedby`.',
  'Con severidad `danger` o `warning` es un `role="alert"` y se anuncia al momento; con el resto es un `role="status"`, que se anuncia sin interrumpir. El icono es decorativo.':
    'With `danger` or `warning` severity it is a `role="alert"` and is announced at once; with the rest it is a `role="status"`, announced without interrupting. The icon is decorative.',
  'Los lectores anuncian lo que aparece, no lo que ya estaba al cargar la página: muestra el mensaje (con `@if`) cuando ocurra lo que comunica. Con `closable`, el botón de cerrar tiene nombre ("Cerrar").':
    'Screen readers announce what appears, not what was already there on page load: show the message (with `@if`) when what it reports happens. With `closable`, the close button is named ("Close").',
  'Mueve el foco al botón de cerrar.': 'Moves focus to the close button.',
  'El título es un encabezado `h2`. Las características de cada plan forman una lista, y las no incluidas se anuncian con "(no incluido)", no solo con el color.':
    'The title is an `h2` heading. Each plan\'s features form a list, and those not included are announced with "(not included)", not only with color.',
  'El cambio mensual / anual es un grupo nombrado ("Ciclo de facturación"): en la vista de cuadrícula, dos botones con `aria-pressed`; en la horizontal, un `role="radiogroup"`. Cada plan termina en un botón con nombre propio ("Elegir Pro").':
    'The monthly / annual switch is a named group ("Billing cycle"): in the grid view, two buttons with `aria-pressed`; in the horizontal view, a `role="radiogroup"`. Each plan ends with a button with its own name ("Choose Pro").',
  'Mueve el foco al cambio de ciclo y al botón de cada plan.': 'Moves focus to the cycle switch and to each plan button.',
  'Cambia el ciclo o elige el plan.': 'Changes the cycle or chooses the plan.',
  'En la vista horizontal, cambia de ciclo.': 'In the horizontal view, changes the cycle.',
  'Es un `role="progressbar"` con `aria-valuemin="0"`, `aria-valuemax="100"` y el valor en `aria-valuenow`; con `indeterminate` no lleva valor. Dale siempre un `ariaLabel` ("Subiendo archivo") para que se sepa qué progresa.':
    'It is a `role="progressbar"` with `aria-valuemin="0"`, `aria-valuemax="100"` and the value in `aria-valuenow`; with `indeterminate` it has no value. Always give it an `ariaLabel` ("Uploading file") so it is clear what is progressing.',
  'Con "reducir movimiento" activado, la animación de `indeterminate` va más despacio.':
    'With "reduce motion" turned on, the `indeterminate` animation runs slower.',
  'Es solo visual: no cambia el rol, el nombre ni el foco del elemento. Aplícalo a controles que ya sean accesibles (un `button`, un enlace).':
    'It is purely visual: it does not change the role, name or focus of the element. Apply it to controls that are already accessible (a `button`, a link).',
  'Con "reducir movimiento" activado en el sistema, no se dibuja la onda.':
    'With "reduce motion" turned on in the system, the ripple is not drawn.',
  'Es decorativo (`aria-hidden="true"`). Mientras carga, marca el contenedor con `aria-busy="true"` y, si la espera es larga, anúnciala con un `cb-spinner` o con un texto en una región `role="status"`.':
    'It is decorative (`aria-hidden="true"`). While loading, mark the container with `aria-busy="true"` and, if the wait is long, announce it with a `cb-spinner` or with text in a `role="status"` region.',
  'Con "reducir movimiento" activado, la animación se detiene.': 'With "reduce motion" turned on, the animation stops.',
  'Es un `role="status"` con nombre ("Cargando", o `ariaLabel`); el SVG es decorativo. Para que se anuncie, muéstralo (con `@if`) al empezar la carga en lugar de dejarlo siempre en la página y ocultarlo con CSS.':
    'It is a named `role="status"` ("Loading", or `ariaLabel`); the SVG is decorative. For it to be announced, show it (with `@if`) when loading starts instead of leaving it on the page and hiding it with CSS.',
  'Con "reducir movimiento" activado, gira más despacio y el arco deja de cambiar de tamaño.':
    'With "reduce motion" turned on, it spins slower and the arc stops changing size.',
  'Solo añade o quita clases en el objetivo. Si las usas para mostrar u ocultar contenido, ese estado no llega a los lectores de pantalla: actualiza tú `aria-expanded` en el elemento que lo dispara, o usa un componente con estado (Panel, Accordion).':
    'It only adds or removes classes on the target. If you use them to show or hide content, that state does not reach screen readers: update `aria-expanded` on the triggering element yourself, or use a stateful component (Panel, Accordion).',
  'Ocultar con `display: none` saca el contenido también del lector de pantalla; ocultarlo solo con opacidad, no.':
    'Hiding with `display: none` also removes the content from the screen reader; hiding it only with opacity does not.',
  'Es texto en línea sin rol propio: se lee su valor y el icono es decorativo. El color de la severidad no se anuncia, así que el texto debe bastar por sí solo ("Pendiente", no un tag rojo sin texto).':
    'It is inline text without its own role: its value is read and the icon is decorative. The severity color is not announced, so the text must be enough on its own ("Pending", not a red tag without text).',
  'Gestor de archivos tipo Drive con carpetas anidadas, ruta navegable, subida de archivos (botón o arrastrándolos), almacenamiento por categoría y acciones para renombrar, mover, descargar y eliminar.':
    'Drive-style file manager with nested folders, a navigable path, file uploads (button or drag and drop), storage by category and actions to rename, move, download and delete.',
  // --- PDF Viewer nivel 2 ---
  'Índice, enlaces y formularios': 'Outline, links and forms',
  'Si el documento tiene marcadores, el panel lateral muestra la pestaña Índice. Los enlaces internos llevan a su página y posición, y los externos se abren en otra pestaña. Los campos de formulario se rellenan en el visor; Descargar e Imprimir incluyen lo escrito, getFormData() devuelve los valores por nombre de campo y save() el PDF relleno como Blob.':
    'If the document has bookmarks, the side panel shows the Outline tab. Internal links go to their page and position, and external ones open in another tab. Form fields are filled in the viewer; Download and Print include what was typed, getFormData() returns the values by field name and save() the filled PDF as a Blob.',
  'Ver datos del formulario': 'Show form data',
  'Cambios: ': 'Changes: ',
  'Panel lateral (miniaturas o índice) abierto.': 'Side panel (thumbnails or outline) open.',
  'Vista del panel lateral (outline solo si el documento tiene índice).': 'Side panel view (outline only if the document has one).',
  'Pestaña Índice en el panel lateral (si el documento tiene marcadores).': 'Outline tab in the side panel (if the document has bookmarks).',
  'Campos de formulario rellenables (si no, se pintan como imagen).': 'Fillable form fields (otherwise they are drawn as an image).',
  'Los enlaces externos del documento se abren en otra pestaña.': 'External links in the document open in another tab.',
  'Cambió un campo del formulario (valores con getFormData()).': 'A form field changed (values with getFormData()).',
  'El índice es una lista anidada de botones dentro de un `nav` con nombre ("Índice"); las entradas con subniveles tienen un botón con `aria-expanded` ("Contraer 2. Condiciones"). Las pestañas Miniaturas / Índice indican la elegida con `aria-pressed`.':
    'The outline is a nested list of buttons inside a named `nav` ("Outline"); entries with sublevels have a button with `aria-expanded` ("Collapse 2. Conditions"). The Thumbnails / Outline tabs mark the chosen one with `aria-pressed`.',
  'Los enlaces del documento son enlaces de verdad sobre el texto; los externos se abren en otra pestaña con `rel="noopener"` y solo si son http(s), mailto o tel.':
    'Document links are real links over the text; external ones open in another tab with `rel="noopener"` and only if they are http(s), mailto or tel.',
  'Los campos de formulario son controles nativos (`input`, `textarea`, `select`, casillas) con el nombre que les da el PDF (`TU`); se recorren con Tab. Descargar cambia su nombre a "Descargar con los datos del formulario" cuando hay cambios.':
    'Form fields are native controls (`input`, `textarea`, `select`, checkboxes) with the name the PDF gives them (`TU`); Tab moves through them. Download is renamed "Download with the form data" when there are changes.',
  'En el índice: va a la sección; en el botón de flecha, la contrae o expande.': 'In the outline: goes to the section; on the arrow button, collapses or expands it.',
  // --- Ejemplos completos de PDF Viewer y Editor ---
  'Visor de documentos PDF con miniaturas, índice, enlaces, formularios rellenables, búsqueda, zoom, giro, descarga, impresión y documentos con contraseña. El texto se puede seleccionar y lo leen los lectores de pantalla.':
    'PDF document viewer with thumbnails, outline, links, fillable forms, search, zoom, rotation, download, printing and password-protected documents. The text can be selected and is read by screen readers.',
  'Búsqueda': 'Search',
  'Escribe en el campo de búsqueda (o pulsa Ctrl + F dentro del visor): resalta todas las coincidencias, ignora tildes y mayúsculas, y Enter / Mayús + Enter recorren la siguiente y la anterior; Escape la vacía. También se busca por código con search(); este ejemplo busca "Supermercado" al abrir el documento.':
    'Type in the search field (or press Ctrl + F inside the viewer): it highlights every match, ignores accents and case, and Enter / Shift + Enter go to the next and previous one; Escape clears it. You can also search from code with search(); this example searches "Supermercado" when the document opens.',
  'Giro': 'Rotation',
  '[(rotation)] gira todas las páginas 0, 90, 180 o 270 grados; el botón de la barra gira 90° a la derecha y rotate(-1) a la izquierda. Las miniaturas y la impresión respetan el giro.':
    '[(rotation)] rotates every page 0, 90, 180 or 270 degrees; the toolbar button rotates 90° clockwise and rotate(-1) counter-clockwise. Thumbnails and printing follow the rotation.',
  'Barra reducida': 'Reduced toolbar',
  'Cada parte de la barra se puede quitar: showSearch, showRotate, showThumbnails, downloadable y printable. Aquí solo quedan la paginación y el zoom.':
    'Each part of the toolbar can be removed: showSearch, showRotate, showThumbnails, downloadable and printable. Here only pagination and zoom remain.',
  'Descargar e imprimir': 'Download and print',
  'Descargar guarda el documento con el nombre de fileName (por defecto, el de la URL o del File). Imprimir abre el diálogo del navegador con las páginas del PDF, no con la página de la aplicación, y muestra el progreso mientras las prepara. Ambos se pueden llamar por código con download() y print().':
    'Download saves the document with the fileName name (by default, the one from the URL or the File). Print opens the browser dialog with the PDF pages, not the application page, and shows the progress while it prepares them. Both can be called from code with download() and print().',
  'Descargar «extracto-septiembre-2026.pdf»': 'Download “extracto-septiembre-2026.pdf”',
  'Imprimir': 'Print',
  'Eventos y errores': 'Events and errors',
  'loaded avisa al abrir el documento (con su número de páginas) y loadError si no se pudo abrir: el visor muestra el error con role=alert. Cambia de documento para ver los dos casos.':
    'loaded fires when the document opens (with its number of pages) and loadError if it could not be opened: the viewer shows the error with role=alert. Switch documents to see both cases.',
  'Documento válido': 'Valid document',
  'Archivo que no existe': 'File that does not exist',
  'Formulario como imagen y enlaces desactivados': 'Form as an image and links disabled',
  'Con [forms]="false" los campos se pintan como parte de la página y no se pueden editar; [externalLinks]="false" desactiva los enlaces a otras webs (los internos siguen funcionando) y [showOutline]="false" oculta la pestaña Índice.':
    'With [forms]="false" the fields are drawn as part of the page and cannot be edited; [externalLinks]="false" disables links to other websites (internal ones still work) and [showOutline]="false" hides the Outline tab.',
  'Obtener el PDF relleno (save)': 'Get the filled PDF (save)',
  'Todo en un editor': 'Everything in one editor',
  // --- Editor fase 3 ---
  'Un mismo documento con todo lo que admite el editor: índice automático, títulos, negrita, cursiva, subrayado, tachado, código en línea, subíndice y superíndice, color y resaltado, fuentes y tamaños, una mención, listas con viñetas, numeradas y de tareas, sangría, alineación, enlace, cita, línea horizontal, caracteres especiales, una tabla con encabezado y celdas combinadas, una imagen con pie y el texto alrededor, un desplegable y un bloque de código con su lenguaje. Haz clic en la tabla, la imagen o el código para ver sus barras, escribe / para insertar bloques, @ para mencionar y selecciona texto para el menú flotante.':
    'A single document with everything the editor supports: an automatic table of contents, headings, bold, italic, underline, strikethrough, inline code, subscript and superscript, color and highlight, fonts and sizes, a mention, bulleted, numbered and task lists, indentation, alignment, a link, a quote, a horizontal rule, special characters, a table with a header and merged cells, an image with a caption and text wrapping around it, a collapsible section and a code block with its language. Click the table, the image or the code to see their toolbars, type / to insert blocks, @ to mention and select text for the floating menu.',
  '1) Pulsa el botón de tabla y elige el tamaño en la cuadrícula (ratón o flechas). 2) Haz clic dentro de una celda: aparece la barra Tabla con Fila (arriba, abajo, eliminar), Columna (izquierda, derecha, eliminar), Celdas (combinar con la de la derecha o con la de abajo, y separar una celda combinada), Fila de encabezado, Bordes (todos, solo horizontales o ninguno) y su color, y Eliminar tabla. Los bordes se guardan en el HTML, así la tabla se ve igual fuera del editor; en el editor, las celdas sin borde se marcan con una guía punteada que no se guarda. Tab y Mayús + Tab pasan de celda en celda; Tab en la última añade una fila.':
    '1) Press the table button and pick the size in the grid (mouse or arrows). 2) Click inside a cell: the Table toolbar appears with Row (above, below, delete), Column (left, right, delete), Cells (merge with the cell on the right or below, and split a merged cell), Header row, Borders (all, horizontal only or none) and their color, and Delete table. Borders are saved in the HTML, so the table looks the same outside the editor; in the editor, cells without borders get a dotted guide that is not saved. Tab and Shift + Tab move from cell to cell; Tab in the last one adds a row.',
  'Haz clic en una imagen: su barra permite ponerla en línea con el texto, a la izquierda o a la derecha (el texto la rodea) o centrada, elegir un ancho (25 %, 50 %, 75 %, 100 % o el original), añadirle un pie de imagen (se guarda como <figure> y <figcaption>; Enter en el pie sigue en el párrafo siguiente), recortarla, escribir el texto alternativo o eliminarla. El tirador de la esquina cambia el ancho arrastrando. Recortar abre un recuadro libre o con proporción fija (1:1, 4:3, 16:9) que se mueve con el ratón o las flechas; al aplicarlo se recortan los píxeles y la imagen nueva se sube con imageUpload (o se guarda como data URL). Las imágenes de otro dominio necesitan que su servidor permita CORS para poder recortarlas.':
    'Click an image: its toolbar lets you place it inline with the text, on the left or right (text wraps around it) or centered, choose a width (25 %, 50 %, 75 %, 100 % or the original), add a caption (saved as <figure> and <figcaption>; Enter in the caption continues in the next paragraph), crop it, write the alternative text or delete it. The corner handle changes the width by dragging. Crop opens a free or fixed-ratio box (1:1, 4:3, 16:9) that moves with the mouse or the arrows; applying it crops the pixels and the new image is uploaded with imageUpload (or saved as a data URL). Images from another domain need their server to allow CORS to be cropped.',
  'El bloque de código conserva espacios y saltos; Tab inserta dos espacios. Al poner el cursor en un bloque aparece su barra: elige el lenguaje (TypeScript, JavaScript, HTML, CSS, SCSS, JSON, Bash, Python o SQL) y el bloque se colorea con colores que se guardan en el HTML (se ve igual fuera del editor); al seguir escribiendo, se vuelve a colorear al salir del bloque. Copiar código lleva el texto al portapapeles. Al pegar desde VS Code se mantienen sus colores y se anota el lenguaje.':
    'The code block keeps spaces and line breaks; Tab inserts two spaces. When the cursor is in a block its toolbar appears: pick the language (TypeScript, JavaScript, HTML, CSS, SCSS, JSON, Bash, Python or SQL) and the block is colored with colors saved in the HTML (it looks the same outside the editor); as you keep typing, it is recolored when you leave the block. Copy code puts the text on the clipboard. Pasting from VS Code keeps its colors and records the language.',
  'El botón Desplegable (o / desplegable) inserta un bloque con título que se pliega: el título se edita como texto y la flecha de la izquierda lo abre o cierra; Enter en el título pasa al contenido. El botón Índice (o / índice) inserta la lista de títulos del documento con enlaces: se actualiza sola al añadir, cambiar o borrar títulos, y cada título recibe un id para enlazarlo.':
    'The Collapsible button (or / collapsible) inserts a block with a title that folds: the title is edited as text and the arrow on the left opens or closes it; Enter in the title moves to the content. The Table of contents button (or / toc) inserts the list of the document headings with links: it updates itself when headings are added, changed or removed, and each heading gets an id to link to it.',
  'Desplegables e índice':
    'Collapsibles and table of contents',
  'Con [mentions] (una lista o una función que busca, también asíncrona), escribir @ abre la lista de personas; se filtra al seguir escribiendo y se elige con las flechas y Enter. La mención se guarda como un span con data-mention (el id) y el texto @Nombre, se borra de una vez, emite mentionAdd y getMentions() devuelve los ids mencionados.':
    'With [mentions] (a list or a search function, also asynchronous), typing @ opens the list of people; it filters as you keep typing and you pick with the arrows and Enter. The mention is saved as a span with data-mention (the id) and the text @Name, is deleted at once, emits mentionAdd and getMentions() returns the mentioned ids.',
  'Menciones':
    'Mentions',
  'Con autosaveKey el editor guarda un borrador en este navegador (localStorage) mientras escribes, tras autosaveDelay ms sin teclear, y muestra la hora al pie. Si recargas la página con cambios sin guardar, ofrece restaurarlo o descartarlo. Tras guardar en tu servidor, llama a clearDraft(). Pruébalo: escribe algo y recarga.':
    'With autosaveKey the editor saves a draft in this browser (localStorage) while you type, after autosaveDelay ms without typing, and shows the time in the footer. If you reload the page with unsaved changes, it offers to restore or discard it. After saving to your server, call clearDraft(). Try it: type something and reload.',
  'Autoguardado':
    'Autosave',
  'Guardar en el servidor':
    'Save to the server',
  'Menciones con @ (lista fija o búsqueda, también asíncrona).':
    'Mentions with @ (a fixed list or a search, also asynchronous).',
  'Guarda un borrador en este navegador con esta clave y ofrece restaurarlo.':
    'Saves a draft in this browser under this key and offers to restore it.',
  'Espera (ms) tras la última tecla antes de guardar el borrador.':
    'Wait (ms) after the last keystroke before saving the draft.',
  'Se insertó una mención (los ids, con getMentions()).':
    'A mention was inserted (the ids, with getMentions()).',
  'Con mentions, abre la lista de personas: flechas para elegir, Enter o Tab para insertar, Escape para cerrar.':
    'With mentions, opens the list of people: arrows to choose, Enter or Tab to insert, Escape to close.',
  'Enter (en un pie de imagen o en el título de un desplegable)':
    'Enter (in an image caption or a collapsible title)',
  'Sigue en el párrafo siguiente o en el contenido del desplegable.':
    'Continues in the next paragraph or in the collapsible content.',
  'Con el cursor en un bloque de código aparece su barra ("Herramientas del bloque de código") con el lenguaje en un `<select>` con nombre y el botón Copiar código, que cambia a "Copiado". La barra de tabla añade el grupo "Celdas" (combinar a la derecha, abajo y separar), deshabilitados cuando no se puede, y la de imagen el botón "Pie de imagen" con `aria-pressed`.':
    'With the cursor in a code block its toolbar appears ("Code block tools") with the language in a named `<select>` and the Copy code button, which changes to "Copied". The table toolbar adds the "Cells" group (merge right, merge down and split), disabled when not possible, and the image toolbar the "Caption" button with `aria-pressed`.',
  'La lista de menciones es un `role="listbox"` como el menú `/`: el foco se queda en el texto y la persona activa se indica con `aria-activedescendant`. La mención es un único elemento no editable que se borra de una vez.':
    'The mention list is a `role="listbox"` like the `/` menu: focus stays in the text and the active person is indicated with `aria-activedescendant`. The mention is a single non-editable element that is deleted at once.',
  'El índice es un `nav` de enlaces a los títulos; en el editor, un enlace lleva el cursor a su título. El desplegable es un `details` / `summary` nativo, que los lectores anuncian como plegable.':
    'The table of contents is a `nav` of links to the headings; in the editor, a link moves the cursor to its heading. The collapsible is a native `details` / `summary`, which screen readers announce as collapsible.',
  'El aviso de borrador usa `role="status"` y tiene botones con texto ("Restaurar", "Descartar"); la hora del último guardado se lee en el pie.':
    'The draft notice uses `role="status"` and has text buttons ("Restore", "Discard"); the time of the last save is read in the footer.',
  // --- Gantt ---
  'Diagrama de Gantt para planificar proyectos: tabla de tareas en árbol, barras en el tiempo con escalas de día, semana y mes, dependencias, avance, hitos y grupos. Se edita arrastrando o con el teclado, y con la planificación automática las tareas que dependen de otra se desplazan solas.':
    'Gantt chart to plan projects: a task table as a tree, bars over time with day, week and month scales, dependencies, progress, milestones and groups. It is edited by dragging or with the keyboard, and with automatic scheduling the tasks that depend on another one move by themselves.',
  'Proyecto completo':
    'Full project',
  'Arrastra una barra para moverla y sus bordes para cambiar el inicio o el fin; el tirador de abajo cambia el avance y el punto de la derecha, arrastrado hasta otra tarea, crea una dependencia (fin → inicio). Haz clic en una flecha para quitarla. Con autoSchedule (activo por defecto), retrasar «Wireframes» desplaza todo lo que depende de ello. Los grupos abarcan a sus tareas y promedian su avance; «Lanzamiento» es un hito. Doble clic (o Enter) abre la tarea.':
    'Drag a bar to move it and its edges to change the start or the end; the handle at the bottom changes the progress and the dot on the right, dragged to another task, creates a dependency (finish → start). Click an arrow to remove it. With autoSchedule (on by default), delaying «Wireframes» moves everything that depends on it. Groups span their tasks and average their progress; «Lanzamiento» is a milestone. Double-click (or Enter) opens the task.',
  'Escalas':
    'Scales',
  '[(scale)] elige un día, una semana o un mes por columna; la barra de herramientas lo cambia y Hoy lleva a la fecha actual. Con escala de mes se ven proyectos largos de un vistazo.':
    '[(scale)] chooses one day, one week or one month per column; the toolbar changes it and Today goes to the current date. With the month scale long projects are seen at a glance.',
  'Solo lectura y columnas':
    'Read-only and columns',
  'readonly muestra el plan sin edición (las barras siguen siendo enfocables y se leen con lector de pantalla). columns elige las columnas de la tabla y su orden, aquí con Responsable; gridWidth fija su ancho y showToolbar oculta la barra.':
    'readonly shows the plan without editing (bars are still focusable and read by screen readers). columns chooses the table columns and their order, here with Assignee; gridWidth sets its width and showToolbar hides the toolbar.',
  'Tareas (id, name, start, end, progress, parent, dependencies, type, color, assignee).':
    'Tasks (id, name, start, end, progress, parent, dependencies, type, color, assignee).',
  'Un día, una semana o un mes por columna.':
    'One day, one week or one month per column.',
  'Columnas de la tabla: name, start, end, duration, progress, assignee.':
    'Table columns: name, start, end, duration, progress, assignee.',
  'Ancho de la tabla de la izquierda.':
    'Width of the table on the left.',
  'Alto del componente (con scroll).':
    'Component height (with scroll).',
  'Al retrasar una tarea, desplaza las que dependen de ella.':
    'When a task is delayed, moves the ones that depend on it.',
  'Sin edición (ni arrastre ni dependencias).':
    'No editing (no dragging or dependencies).',
  'Barra con la escala y el botón Hoy.':
    'Toolbar with the scale and the Today button.',
  'Texto sin tareas.':
    'Text when there are no tasks.',
  'Nombre del diagrama.':
    'Name of the chart.',
  'Una tarea cambió ({ task, previous, reason: \'move\' | \'resize\' | \'progress\' | \'schedule\' }).':
    'A task changed ({ task, previous, reason: \'move\' | \'resize\' | \'progress\' | \'schedule\' }).',
  'Doble clic o Enter sobre una tarea.':
    'Double-click or Enter on a task.',
  'Dependencia creada ({ from, to }: to depende de from).':
    'Dependency created ({ from, to }: to depends on from).',
  'Dependencia quitada.':
    'Dependency removed.',
  'La tabla de tareas es un `role="treegrid"` con nombre: cada fila indica su nivel (`aria-level`) y los grupos si están desplegados (`aria-expanded`); el botón de flecha tiene nombre ("Contraer Diseño").':
    'The task table is a named `role="treegrid"`: each row states its level (`aria-level`) and groups whether they are expanded (`aria-expanded`); the arrow button has a name ("Collapse Design").',
  'Cada barra es un botón con nombre completo: tarea, fechas, avance y de qué depende ("API de pagos: 27 oct – 7 nov, 40 % completado. Depende de Wireframes"). Los hitos y los grupos lo dicen.':
    'Each bar is a button with a full name: task, dates, progress and what it depends on ("Payments API: 27 Oct – 7 Nov, 40% complete. Depends on Wireframes"). Milestones and groups say so.',
  'Arrastrar no es la única forma de editar (WCAG 2.5.7): con el teclado se mueve, se cambia el inicio, el fin y el avance, y se quitan dependencias; cada cambio se anuncia en una región `role="status"`.':
    'Dragging is not the only way to edit (WCAG 2.5.7): with the keyboard you move, change the start, the end and the progress, and remove dependencies; each change is announced in a `role="status"` region.',
  'La escala es un grupo de botones con `aria-pressed`. Las flechas de dependencia son decorativas: la dependencia se lee en el nombre de la barra.':
    'The scale is a group of buttons with `aria-pressed`. Dependency arrows are decorative: the dependency is read in the bar name.',
  'Recorre la barra de herramientas, la tabla y las barras del diagrama.':
    'Moves through the toolbar, the table and the chart bars.',
  'Mueve la tarea (o el grupo con sus tareas) un día.':
    'Moves the task (or the group with its tasks) one day.',
  'Cambia la fecha de fin.':
    'Changes the end date.',
  'Alt + flechas':
    'Alt + arrows',
  'Cambia la fecha de inicio.':
    'Changes the start date.',
  '+ / − (o Re Pág / Av Pág)':
    '+ / − (or Page Up / Page Down)',
  'Sube o baja el avance un 10 %.':
    'Raises or lowers the progress by 10%.',
  'Quita las dependencias de la tarea.':
    'Removes the task dependencies.',
  // --- Comments ---
  'Comentarios en una lista plana (id, author, html, date, edited, parentId, reactions, deleted). Se actualiza al publicar, editar, borrar o reaccionar.':
    'Comments in a flat list (id, author, html, date, edited, parentId, reactions, deleted). Updated when posting, editing, deleting or reacting.',
  'Historial de cambios (id, text, author, date, icon), intercalado por fecha.':
    'Change history (id, text, author, date, icon), interleaved by date.',
  'Quién escribe. Sin él, el hilo es de solo lectura.': 'Who is writing. Without it, the thread is read-only.',
  'Personas que se pueden mencionar con @ y cuyos nombres salen en las reacciones.':
    'People who can be @mentioned and whose names appear in reactions.',
  'Fuente propia de menciones (lista o función, también asíncrona); sustituye a people para @.':
    'Custom mention source (list or function, also async); replaces people for @.',
  'Qué se muestra. El filtro aparece cuando hay actividad.': 'What is shown. The filter appears when there is activity.',
  'Orden del hilo; con newest la caja para comentar va arriba.': 'Thread order; with newest the comment box goes on top.',
  'Emojis para reaccionar (vacío para quitar las reacciones). Por defecto, 👍 ❤️ 🎉 😄 👀 🙏.':
    'Emojis to react with (empty to remove reactions). By default, 👍 ❤️ 🎉 😄 👀 🙏.',
  'Permite responder (un nivel).': 'Allows replying (one level).',
  'Permite editar y eliminar los comentarios propios.': 'Allows editing and deleting your own comments.',
  'Muestra la caja para comentar.': 'Shows the comment box.',
  'Solo lectura: sin caja ni acciones.': 'Read-only: no box or actions.',
  'Herramientas del editor. Por defecto (CB_COMMENTS_TOOLBAR): negrita, cursiva, tachado, listas, enlace y código.':
    'Editor tools. By default (CB_COMMENTS_TOOLBAR): bold, italic, strikethrough, lists, link and code.',
  'Alto del área de escritura (crece hasta 16rem).': 'Height of the writing area (grows up to 16rem).',
  'Texto de la caja vacía.': 'Text of the empty box.',
  'Texto sin comentarios.': 'Text without comments.',
  'Nombre del hilo (por defecto, "Comentarios y actividad").': 'Name of the thread (by default, "Comments and activity").',
  'Comentario publicado o respuesta ({ comment, mentions }: ids mencionados).':
    'Comment or reply posted ({ comment, mentions }: mentioned ids).',
  'Comentario editado ({ comment, mentions }).': 'Comment edited ({ comment, mentions }).',
  'Comentario eliminado (el original).': 'Comment deleted (the original).',
  'Reacción puesta o quitada ({ comment, emoji, added }).': 'Reaction added or removed ({ comment, emoji, added }).',
  'El hilo es una región con nombre ("Comentarios y actividad", o `ariaLabel`) y una lista ordenada. Cada comentario es un `article` nombrado por su autor y su fecha; la fecha relativa ("hace 2 horas") va en un `time` con la fecha completa en `datetime` y en el `title`.':
    'The thread is a named region ("Comments and activity", or `ariaLabel`) and an ordered list. Each comment is an `article` named by its author and date; the relative date ("2 hours ago") is in a `time` with the full date in `datetime` and in the `title`.',
  'Las respuestas forman una lista anidada con nombre ("Respuestas a Luis Pérez"). El filtro Todo / Comentarios / Actividad es un grupo de botones con `aria-pressed`.':
    'Replies form a named nested list ("Replies to Luis Pérez"). The All / Comments / Activity filter is a group of buttons with `aria-pressed`.',
  'Cada reacción es un conmutador (`aria-pressed`) que dice el emoji, cuántas personas y quiénes ("👍, 2: Luis Pérez y tú"). "Añadir reacción" indica `aria-expanded` y abre un grupo de emojis.':
    'Each reaction is a toggle (`aria-pressed`) that says the emoji, how many people and who ("👍, 2: Luis Pérez and you"). "Add reaction" exposes `aria-expanded` and opens a group of emojis.',
  'Publicar, guardar y eliminar se anuncian en una región `aria-live`. Tras responder o editar, el foco va al comentario; tras eliminar, al siguiente. Eliminar pide confirmación en línea, sin diálogo.':
    'Posting, saving and deleting are announced in an `aria-live` region. After replying or editing, focus goes to the comment; after deleting, to the next one. Deleting asks for inline confirmation, without a dialog.',
  'La caja para escribir es un `cb-editor` con nombre ("Nuevo comentario", "Responder a …", "Editar comentario"); las @menciones usan su lista con `aria-activedescendant`. El HTML de los comentarios se sanea con la lista blanca del editor antes de pintarlo.':
    'The writing box is a named `cb-editor` ("New comment", "Reply to …", "Edit comment"); @mentions use its list with `aria-activedescendant`. Comment HTML is sanitized with the editor whitelist before rendering.',
  'Recorre el filtro, las reacciones y las acciones de cada comentario, y la caja para escribir.':
    'Moves through the filter, the reactions and actions of each comment, and the writing box.',
  'En el editor, abre la lista de personas para mencionar (flechas y Enter para elegir).':
    'In the editor, opens the list of people to mention (arrows and Enter to choose).',
  'Publica el comentario, la respuesta o la edición.': 'Posts the comment, the reply or the edit.',
  'Cancela la respuesta o la edición, cierra el selector de emojis o la confirmación de borrado.':
    'Cancels the reply or edit, closes the emoji picker or the delete confirmation.',
  'Desde el editor, va a su barra de herramientas.': 'From the editor, goes to its toolbar.',
  'Hilo de comentarios y actividad: comentarios con formato y @menciones sobre el editor, respuestas, reacciones con emoji, edición y borrado de los propios y, mezclado por fecha, el historial de cambios. Pensado para el detalle de una tarea, un documento o una solicitud.':
    'Comments and activity thread: formatted comments with @mentions on top of the editor, replies, emoji reactions, editing and deleting your own and, interleaved by date, the change history. Designed for the detail of a task, a document or a request.',
  'Hilo de una tarea': 'Task thread',
  'Escribe @ para mencionar a alguien (las menciones a ti se resaltan) y Ctrl + Enter para enviar. Responder abre la caja dentro del hilo; Editar y Eliminar solo aparecen en tus comentarios, y eliminar pide confirmación (si el comentario tiene respuestas, se queda como «Comentario eliminado»). Las reacciones dicen quién reaccionó. El filtro de arriba aparece cuando hay actividad.':
    'Type @ to mention someone (mentions of you are highlighted) and Ctrl + Enter to send. Reply opens the box inside the thread; Edit and Delete only appear on your comments, and deleting asks for confirmation (if the comment has replies, it stays as "Comment deleted"). Reactions tell who reacted. The filter on top appears when there is activity.',
  'Más recientes primero': 'Newest first',
  'order="newest" pone la caja arriba y los comentarios más nuevos debajo. reactions elige los emojis; replies="false" quita las respuestas y toolbar, las herramientas del editor.':
    'order="newest" puts the box on top and the newest comments below it. reactions chooses the emojis; replies="false" removes replies and toolbar sets the editor tools.',
  'Sin currentUser (o con readonly) el hilo solo se lee: no hay caja para comentar ni acciones, y las reacciones se muestran sin poder cambiarlas.':
    'Without currentUser (or with readonly) the thread is read-only: there is no comment box or actions, and reactions are shown without being able to change them.',
  // --- NotificationCenter ---
  'Anuncia los avisos nuevos sin leer (desactívalo si la misma lista se muestra en dos centros).':
    'Announces new unread notifications (turn it off if the same list is shown in two centers).',
  'Avisos (id, title, text, date, read, person, icon, severity, actions). Se actualiza al leer o eliminar.':
    'Notifications (id, title, text, date, read, person, icon, severity, actions). Updated when reading or removing.',
  'Todas o solo las no leídas.': 'All or only the unread ones.',
  'Panel abierto (sin inline).': 'Panel open (without inline).',
  'Pinta el panel en la página, sin campana.': 'Renders the panel in the page, without a bell.',
  'Agrupa en Hoy, Ayer y Anteriores.': 'Groups into Today, Yesterday and Earlier.',
  'Botón de eliminar en cada aviso.': 'Remove button on each notification.',
  'Cierra el panel al elegir un aviso.': 'Closes the panel when a notification is chosen.',
  'Pie con «Ver todas» (viewAll).': 'Footer with "View all" (viewAll).',
  'A partir de este número la campana muestra «99+».': 'From this number on the bell shows "99+".',
  'Nivel del título (los grupos usan el siguiente).': 'Title heading level (groups use the next one).',
  'Texto sin avisos.': 'Text without notifications.',
  'Ancho del panel flotante.': 'Width of the floating panel.',
  'Alto máximo de la lista (con scroll).': 'Maximum height of the list (scrollable).',
  'Aviso elegido (ya marcado como leído).': 'Notification chosen (already marked as read).',
  'Acción propia pulsada ({ notification, action }).': 'Custom action pressed ({ notification, action }).',
  'Un aviso pasó a leído o a no leído.': 'A notification became read or unread.',
  'Se marcaron todas como leídas.': 'All were marked as read.',
  'Aviso eliminado.': 'Notification removed.',
  'Se pulsó «Ver todas».': '"View all" was pressed.',
  'La campana es un botón con nombre que incluye cuántos avisos hay sin leer ("Notificaciones, 2 sin leer"), con `aria-haspopup="dialog"` y `aria-expanded`; el contador visual es decorativo.':
    'The bell is a button whose name includes how many notifications are unread ("Notifications, 2 unread"), with `aria-haspopup="dialog"` and `aria-expanded`; the visual counter is decorative.',
  'El panel es un `role="dialog"` (o una región con `inline`) nombrado por su título, que recibe el foco al abrir. Los grupos Hoy, Ayer y Anteriores son encabezados y cada uno nombra su lista.':
    'The panel is a `role="dialog"` (or a region with `inline`) named by its title, which receives focus on open. The Today, Yesterday and Earlier groups are headings and each one names its list.',
  'Cada aviso es un botón con su título y detalle; los no leídos empiezan con "No leída" (no solo el punto de color) y la fecha relativa se asocia con `aria-describedby`. Marcar como leída / no leída y eliminar llevan el título del aviso en su nombre.':
    'Each notification is a button with its title and detail; unread ones start with "Unread" (not only the colored dot) and the relative date is associated with `aria-describedby`. Mark as read / unread and remove include the notification title in their name.',
  'Los avisos nuevos sin leer se anuncian en una región `aria-live` ("Nueva notificación: Pago recibido"), igual que marcar todas, marcar una o eliminar. Al eliminar, el foco pasa al aviso siguiente.':
    'New unread notifications are announced in an `aria-live` region ("New notification: Payment received"), as are marking all, marking one or removing. When removing, focus moves to the next notification.',
  'En la campana, abre o cierra el panel; en un aviso, lo abre (itemClick) y lo marca como leído.':
    'On the bell, opens or closes the panel; on a notification, opens it (itemClick) and marks it as read.',
  'Recorre el título, «Marcar todas», el filtro y cada aviso con sus acciones y herramientas; al salir del panel, lo cierra.':
    'Moves through the title, "Mark all", the filter and each notification with its actions and tools; leaving the panel closes it.',
  'Cierra el panel y devuelve el foco a la campana.': 'Closes the panel and returns focus to the bell.',
  'Centro de notificaciones: campana con el número de avisos sin leer que abre un panel con la lista agrupada por fecha (Hoy, Ayer, Anteriores), filtro Todas / No leídas, marcar como leída una o todas, eliminar y acciones propias en cada aviso. También se puede pintar en la página con inline.':
    'Notification center: a bell with the number of unread notifications that opens a panel with the list grouped by date (Today, Yesterday, Earlier), All / Unread filter, mark one or all as read, remove and custom actions on each notification. It can also be rendered in the page with inline.',
  'Campana en la barra': 'Bell in the bar',
  'La campana dice cuántos avisos hay sin leer. Elegir un aviso lo marca como leído y cierra el panel; Escape, Tab fuera o un clic fuera también lo cierran y el foco vuelve a la campana. Pulsa «Simular aviso»: el contador sube y el lector de pantalla anuncia la notificación nueva.':
    'The bell tells how many notifications are unread. Choosing one marks it as read and closes the panel; Escape, tabbing out or clicking outside also close it and focus returns to the bell. Press "Simulate notification": the counter goes up and the screen reader announces the new notification.',
  'En la página': 'In the page',
  'inline pinta el panel como una región de la página, sin campana: útil para una pantalla de «Notificaciones» o un panel lateral. Aquí comparte la lista con la campana de arriba, así que announceNew="false" evita que los avisos nuevos se anuncien dos veces. Pasa el ratón (o llega con Tab) a un aviso para ver sus herramientas: marcar como leído o no leído y eliminar.':
    'inline renders the panel as a region of the page, without a bell: useful for a "Notifications" screen or a side panel. Here it shares the list with the bell above, so announceNew="false" keeps new notifications from being announced twice. Hover over (or Tab to) a notification to see its tools: mark as read or unread and remove.',
  'Acciones propias': 'Custom actions',
  'Cada aviso puede llevar acciones (actions); la de severity "primary" se destaca. Pulsar una emite actionClick y marca el aviso como leído. groupByDate="false" quita los grupos y removable="false", el botón de eliminar.':
    'Each notification can have actions (actions); the one with severity "primary" stands out. Pressing one emits actionClick and marks the notification as read. groupByDate="false" removes the groups and removable="false" the remove button.',
  // --- SignaturePad ---
  'Firma como data URL en format (\'\' si está vacía). Una firma que llega de fuera se muestra de fondo.':
    'Signature as a data URL in format (\'\' when empty). A signature coming from outside is shown in the background.',
  'Formato de value: PNG, JPEG (fondo blanco) o SVG vectorial.': 'Format of value: PNG, JPEG (white background) or vector SVG.',
  'Dibujar a mano o escribir el nombre.': 'Draw by hand or type the name.',
  'Ofrece el modo escrito, la alternativa para quien no puede dibujar.':
    'Offers the typed mode, the alternative for people who cannot draw.',
  'Color de la tinta.': 'Ink color.',
  'Fondo del área y de la imagen (transparent para PNG o SVG sin fondo).':
    'Background of the area and of the image (transparent for PNG or SVG without background).',
  'Grosor mínimo del trazo (trazo rápido).': 'Minimum stroke width (fast stroke).',
  'Grosor máximo del trazo (trazo lento o con presión).': 'Maximum stroke width (slow or pressured stroke).',
  'Alto del área de firma.': 'Height of the signature area.',
  'Tipografía del nombre escrito. Por defecto (CB_SIGNATURE_FONT), manuscritas del sistema.':
    'Font of the typed name. By default (CB_SIGNATURE_FONT), system handwriting fonts.',
  'Texto del área vacía.': 'Text of the empty area.',
  'Desactiva el área (también con Angular Forms).': 'Disables the area (also with Angular Forms).',
  'Muestra la firma sin permitir cambiarla.': 'Shows the signature without allowing changes.',
  'Marca de error (también con Angular Forms).': 'Error state (also with Angular Forms).',
  'Nombre del área (por defecto, "Área de firma").': 'Name of the area (by default, "Signature area").',
  'Empieza un trazo.': 'A stroke starts.',
  'Termina un trazo o cambia el nombre escrito (con la firma completa: trazos o texto).':
    'A stroke ends or the typed name changes (with the whole signature: strokes or text).',
  'Se borró la firma.': 'The signature was cleared.',
  'El área es un `role="img"` cuyo nombre dice si está vacía o firmada ("Área de firma: firmada"), con una descripción de cómo firmar. Borrar, deshacer y la primera firma se anuncian en una región `aria-live`.':
    'The area is a `role="img"` whose name tells whether it is empty or signed ("Signature area: signed"), with a description of how to sign. Clearing, undoing and the first signature are announced in an `aria-live` region.',
  'Una firma a mano depende del trazo, así que no se puede hacer con teclado (WCAG 2.1.1 lo exceptúa). Por eso existe el modo «Escribir»: un campo con etiqueta ("Escribe tu nombre") cuyo texto se pinta en letra manuscrita. Con `typing="false"` desaparece: hazlo solo si ofreces otra alternativa.':
    'A handwritten signature depends on the path, so it cannot be done with the keyboard (WCAG 2.1.1 makes an exception). That is why there is the "Type" mode: a labelled field ("Type your name") whose text is drawn in handwriting. With `typing="false"` it disappears: only do that if you offer another alternative.',
  'Los modos Dibujar / Escribir son un grupo de botones con `aria-pressed`; Deshacer trazo y Borrar firma tienen nombre. Con Angular Forms, el campo del modo escrito expone `aria-invalid` y `aria-required`.':
    'The Draw / Type modes are a group of buttons with `aria-pressed`; Undo stroke and Clear signature are named. With Angular Forms, the typed-mode field exposes `aria-invalid` and `aria-required`.',
  'Recorre los modos, Deshacer, Borrar y, en el modo escrito, el campo del nombre.':
    'Moves through the modes, Undo, Clear and, in typed mode, the name field.',
  'Cambia de modo o pulsa Deshacer / Borrar.': 'Changes mode or presses Undo / Clear.',
  'Firma digital para contratos, recibos o autorizaciones: se firma con el ratón, el dedo o un lápiz (el trazo se afina con la velocidad y engorda con la presión) o, como alternativa accesible, escribiendo el nombre en letra manuscrita. Devuelve la firma como PNG, JPEG o SVG y funciona con Angular Forms.':
    'Digital signature for contracts, receipts or authorizations: sign with the mouse, a finger or a pen (the stroke thins with speed and thickens with pressure) or, as an accessible alternative, by typing the name in handwriting. Returns the signature as PNG, JPEG or SVG and works with Angular Forms.',
  'Firmar un documento': 'Signing a document',
  '[(value)] recibe la firma como data URL (PNG por defecto) al terminar cada trazo, listo para enviarlo a tu API o incrustarlo en un PDF. Deshacer quita el último trazo y Borrar, toda la firma. «Escribir» cambia al nombre tecleado.':
    '[(value)] receives the signature as a data URL (PNG by default) after each stroke, ready to send to your API or embed in a PDF. Undo removes the last stroke and Clear the whole signature. "Type" switches to the typed name.',
  'SVG, sin fondo y otra tinta': 'SVG, no background and another ink',
  'format="svg" da un SVG vectorial, que se ve nítido a cualquier tamaño; background="transparent" lo deja sin fondo y penColor cambia la tinta. minWidth y maxWidth ajustan el grosor del trazo.':
    'format="svg" gives a vector SVG that looks sharp at any size; background="transparent" leaves it without background and penColor changes the ink. minWidth and maxWidth adjust the stroke width.',
  'Con formularios': 'With forms',
  'Con [formControl] (o ngModel) el valor es la firma en el formato elegido y Validators.required pide que no esté vacía; el área se marca en rojo cuando el control es inválido y se ha tocado. disable() la desactiva.':
    'With [formControl] (or ngModel) the value is the signature in the chosen format and Validators.required requires it not to be empty; the area turns red when the control is invalid and touched. disable() disables it.',
  'Firma en el área para ver aquí la imagen.': 'Sign in the area to see the image here.',
  'La firma es obligatoria.': 'The signature is required.',
  'Aceptar y firmar': 'Accept and sign',
  'Activar': 'Enable',
  'Desactivar': 'Disable',
  // --- ImageCropper ---
  'Imagen a recortar (URL o data URL); las de otro dominio necesitan CORS.':
    'Image to crop (URL or data URL); images from another domain need CORS.',
  'Recuadro en fracciones de la imagen (x, y, w, h entre 0 y 1). Se inicia al cargar la imagen.':
    'Box in fractions of the image (x, y, w, h between 0 and 1). Initialized when the image loads.',
  'Proporción ancho / alto (null = libre).': 'Width / height ratio (null = free).',
  'Proporciones de la barra (vacío para ocultarla). Por defecto, Libre, 1:1, 4:3 y 16:9.':
    'Ratios in the bar (empty to hide it). By default, Free, 1:1, 4:3 and 16:9.',
  'Recorte rectangular o circular (PNG transparente, 1:1).': 'Rectangular or circular crop (transparent PNG, 1:1).',
  'Formato (type), calidad (quality) y tamaño máximo (maxWidth, maxHeight) del recorte.':
    'Format (type), quality (quality) and maximum size (maxWidth, maxHeight) of the crop.',
  'Botones de girar 90°.': 'Rotate 90° buttons.',
  'Vista previa del recorte.': 'Crop preview.',
  'Botón para elegir otra imagen y soltar archivos en el área vacía.': 'Button to choose another image and drop files on the empty area.',
  'Botón Recortar (sin él, recorta llamando a crop()).': 'Crop button (without it, crop by calling crop()).',
  'Tipos de archivo del selector.': 'File types of the chooser.',
  'Alto máximo de la imagen en pantalla.': 'Maximum height of the image on screen.',
  'Texto del área sin imagen.': 'Text of the area without an image.',
  'Recorte hecho con Recortar o Enter ({ blob, dataUrl, rect, width, height }).':
    'Crop made with Crop or Enter ({ blob, dataUrl, rect, width, height }).',
  'Imagen elegida o soltada por el usuario.': 'Image chosen or dropped by the user.',
  'No se pudo cargar o recortar la imagen (p. ej. sin CORS).': 'The image could not be loaded or cropped (e.g. without CORS).',
  'El recuadro es un `role="slider"` enfocable con nombre ("Área de recorte") y su tamaño en `aria-valuetext`, en porcentaje y en los píxeles que tendrá el resultado ("50 % × 100 % de la imagen (256 × 256 píxeles)"). Las instrucciones de teclado se asocian con `aria-describedby`.':
    'The box is a focusable, named `role="slider"` ("Crop area") with its size in `aria-valuetext`, as a percentage and in the pixels of the result ("50 % × 100 % of the image (256 × 256 pixels)"). The keyboard instructions are associated with `aria-describedby`.',
  'Las proporciones son un grupo de botones con `aria-pressed`; girar tiene nombre. Girar y recortar se anuncian en una región `aria-live` y los errores (archivo que no es imagen, imagen sin CORS) en un `role="alert"`.':
    'The ratios are a group of buttons with `aria-pressed`; rotate is named. Rotating and cropping are announced in an `aria-live` region and errors (a file that is not an image, an image without CORS) in a `role="alert"`.',
  'Arrastrar no es la única forma de recortar (WCAG 2.5.7): todo se puede hacer con el teclado. Tras elegir un archivo o girar, el foco va al recuadro.':
    'Dragging is not the only way to crop (WCAG 2.5.7): everything can be done with the keyboard. After choosing a file or rotating, focus goes to the box.',
  'Mueven el recuadro un 2 % (Ctrl + flechas, un 10 %).': 'Move the box by 2% (Ctrl + arrows, by 10%).',
  'Cambian el tamaño desde la esquina inferior derecha, respetando la proporción.':
    'Resize from the bottom right corner, keeping the ratio.',
  'Recorta (cropped).': 'Crops (cropped).',
  'Recorre el recuadro, las proporciones, girar, Cambiar imagen y Recortar.':
    'Moves through the box, the ratios, rotate, Change image and Crop.',
  'Recortador de imagen para fotos de perfil y documentos: el recuadro se mueve y se redimensiona con ratón, dedo o teclado, con proporciones fijas o libre, forma circular, giro de 90°, vista previa y selección de archivo con botón o arrastrándolo. Devuelve el recorte como Blob y data URL, con el tamaño y el formato que elijas.':
    'Image cropper for profile photos and documents: the box is moved and resized with mouse, finger or keyboard, with fixed or free ratios, circular shape, 90° rotation, preview and file selection with a button or by dragging. Returns the crop as a Blob and data URL, with the size and format you choose.',
  'Foto de perfil': 'Profile photo',
  'shape="circle" fija la proporción 1:1 y devuelve un PNG redondo con fondo transparente; preview muestra cómo quedará. output limita el tamaño (aquí, 256 px). Pulsa Recortar (o Enter en el recuadro) y el resultado aparece en el avatar.':
    'shape="circle" fixes the 1:1 ratio and returns a round PNG with a transparent background; preview shows how it will look. output limits the size (here, 256 px). Press Crop (or Enter on the box) and the result appears in the avatar.',
  'Documento con proporciones': 'Document with ratios',
  'La barra ofrece Libre, 1:1, 4:3 y 16:9 (ratios los cambia) y los botones giran la imagen 90°. [(rect)] da el recuadro en fracciones de la imagen (0–1), para guardarlo o recortar en el servidor. output elige el formato: aquí JPEG al 85 %.':
    'The bar offers Free, 1:1, 4:3 and 16:9 (ratios changes them) and the buttons rotate the image 90°. [(rect)] gives the box in fractions of the image (0–1), to store it or crop on the server. output chooses the format: here JPEG at 85%.',
  'Desde un archivo': 'From a file',
  'Sin src, el área invita a elegir una imagen o a soltarla encima; fileSelect da el archivo original. Un archivo que no es imagen se rechaza con un aviso.':
    'Without src, the area invites you to choose an image or drop it on it; fileSelect gives the original file. A file that is not an image is rejected with a message.',
  'Sin recortar': 'Not cropped',
  'sin recortar': 'not cropped',
  // --- InfiniteScroll ---
  'Hay una carga en curso: muestra el indicador y evita pedir otra.':
    'A load is in progress: shows the indicator and avoids requesting another.',
  'Quedan elementos por cargar.': 'There are items left to load.',
  'La última carga falló: muestra el aviso y Reintentar.': 'The last load failed: shows the message and Retry.',
  'Elementos ya cargados, para anunciar cuántos llegaron y enfocar el primero nuevo.':
    'Items already loaded, to announce how many arrived and focus the first new one.',
  'Carga al llegar al final o solo con el botón.': 'Loads on reaching the end or only with the button.',
  'Cargas automáticas seguidas antes de pasar al botón (0 = sin límite).':
    'Automatic loads in a row before switching to the button (0 = no limit).',
  'Distancia al final a la que empieza a cargar.': 'Distance to the end at which loading starts.',
  'El propio componente hace scroll (si no, la página).': 'The component itself scrolls (otherwise, the page).',
  'Alto máximo con scrollable.': 'Maximum height with scrollable.',
  'Elementos de la lista, para enfocar el primero nuevo tras Cargar más.': 'List items, to focus the first new one after Load more.',
  'Mensaje al llegar al final.': 'Message on reaching the end.',
  'Texto del final.': 'End text.',
  'Texto del error.': 'Error text.',
  'Texto del botón.': 'Button text.',
  'Pide la siguiente página: \'scroll\', \'button\' o \'retry\'.': 'Requests the next page: \'scroll\', \'button\' or \'retry\'.',
  'Mientras carga, el contenedor expone `aria-busy="true"`. Una región `aria-live` anuncia "Cargando más resultados…", cuántos llegaron ("12 resultados más, 36 en total", con `count`), el final y los errores.':
    'While loading, the container exposes `aria-busy="true"`. An `aria-live` region announces "Loading more results…", how many arrived ("12 more results, 36 in total", with `count`), the end and errors.',
  'Una página que crece sin fin impide llegar al pie (WCAG 2.1.1 y 2.4.1 en la práctica): tras `autoLimit` cargas automáticas aparece "Cargar más", y `mode="button"` solo carga con él. Sin IntersectionObserver, el botón es la forma de cargar.':
    'A page that grows endlessly prevents reaching the footer: after `autoLimit` automatic loads "Load more" appears, and `mode="button"` only loads with it. Without IntersectionObserver, the button is the way to load.',
  'Al cargar con el botón, el foco va al primer elemento nuevo (con `tabindex="-1"` si no es enfocable) para seguir leyendo desde ahí, en lugar de quedarse al final.':
    'When loading with the button, focus goes to the first new item (with `tabindex="-1"` if it is not focusable) to keep reading from there, instead of staying at the end.',
  'Llega a Cargar más o Reintentar al final de la lista.': 'Reaches Load more or Retry at the end of the list.',
  'Carga la siguiente página y lleva el foco al primer elemento nuevo.': 'Loads the next page and moves focus to the first new item.',
  'Scroll infinito para listas largas: pide la siguiente página al acercarse al final, con un botón «Cargar más» como alternativa. Tras unas cuantas cargas automáticas pasa al botón para que el pie de la página siga siendo alcanzable, anuncia lo que llega y, al cargar con el botón, lleva el foco al primer elemento nuevo.':
    'Infinite scroll for long lists: requests the next page when approaching the end, with a "Load more" button as an alternative. After a few automatic loads it switches to the button so the page footer stays reachable, announces what arrives and, when loading with the button, moves focus to the first new item.',
  'Movimientos de la cuenta': 'Account transactions',
  'El propio componente hace scroll (scrollable) y pide más al acercarse al final (loadMore). Con autoLimit="2", tras dos cargas automáticas aparece «Cargar más»; al pulsarlo, vuelve a cargar solo. [count] le dice cuántos hay para anunciar cuántos llegaron.':
    'The component itself scrolls (scrollable) and requests more when approaching the end (loadMore). With autoLimit="2", after two automatic loads "Load more" appears; pressing it resumes automatic loading. [count] tells it how many there are to announce how many arrived.',
  'Solo con botón y con errores': 'Button only and errors',
  'mode="button" nunca carga solo: útil cuando hay contenido importante después de la lista. Si la carga falla ([error]), aparece el aviso y «Reintentar». Pulsa «Simular fallo» y después «Cargar más».':
    'mode="button" never loads by itself: useful when there is important content after the list. If loading fails ([error]), the message and "Retry" appear. Press "Simulate failure" and then "Load more".',
  'Simular fallo en la siguiente carga': 'Simulate a failure on the next load',
  // --- Masonry ---
  'Número fijo de columnas (0 = las que quepan con minColumnWidth).': 'Fixed number of columns (0 = as many as fit with minColumnWidth).',
  'Ancho mínimo de columna cuando columns es 0.': 'Minimum column width when columns is 0.',
  'Separación entre elementos (cualquier longitud CSS).': 'Spacing between items (any CSS length).',
  'No reordena nada: los elementos se quedan en el orden del DOM, que es el visual por filas, así que el teclado y el lector de pantalla los recorren como se ven (las columnas de CSS, en cambio, leen de arriba abajo cada columna). No usa `grid-auto-flow: dense`, que movería elementos.':
    'It reorders nothing: items stay in DOM order, which is the visual order by rows, so keyboard and screen readers go through them as they appear (CSS columns, instead, read each column top to bottom). It does not use `grid-auto-flow: dense`, which would move items.',
  'No añade roles: si es una lista, pon `role="list"` (con nombre) en `cb-masonry` y `role="listitem"` en cada elemento, o usa una lista semántica dentro de cada tarjeta.':
    'It adds no roles: if it is a list, put `role="list"` (with a name) on `cb-masonry` and `role="listitem"` on each item, or use a semantic list inside each card.',
  'Recorre los elementos enfocables de cada tarjeta en el orden del DOM (por filas).':
    'Moves through the focusable elements of each card in DOM order (by rows).',
  'Rejilla de columnas con elementos de alturas distintas y sin huecos, como un tablero de Pinterest. Usa CSS Grid y mide el alto de cada elemento (también cuando carga una imagen), así que el orden del DOM —el que siguen el teclado y los lectores de pantalla— coincide con el orden visual por filas.':
    'Column grid with items of different heights and no gaps, like a Pinterest board. It uses CSS Grid and measures the height of each item (also when an image loads), so the DOM order —the one keyboard and screen readers follow— matches the visual order by rows.',
  'Galería con scroll infinito': 'Gallery with infinite scroll',
  'Con minColumnWidth caben tantas columnas como permita el ancho (cambia el tamaño de la ventana). Cada foto ocupa las filas que pide su alto; las nuevas que llegan con cb-infinite-scroll se colocan solas. role="list" y role="listitem" le dan semántica de lista.':
    'With minColumnWidth as many columns fit as the width allows (resize the window). Each photo takes the rows its height needs; new ones arriving with cb-infinite-scroll place themselves. role="list" and role="listitem" give it list semantics.',
  'Columnas fijas y tarjetas de texto': 'Fixed columns and text cards',
  'columns fija el número de columnas aunque cambie el ancho; gap acepta cualquier longitud CSS. Sirve igual para tarjetas de texto de distinto largo: el orden de lectura es 1, 2, 3… por filas.':
    'columns fixes the number of columns even if the width changes; gap accepts any CSS length. It works the same for text cards of different lengths: the reading order is 1, 2, 3… by rows.',
  // --- MediaPlayer ---
  'Archivo a reproducir (o sources con varios formatos).': 'File to play (or sources with several formats).',
  'Varias fuentes ({ src, type }) para que el navegador elija.': 'Several sources ({ src, type }) for the browser to choose.',
  'Vídeo (con pantalla) o audio (con título).': 'Video (with screen) or audio (with title).',
  'Imagen antes de reproducir el vídeo.': 'Image before playing the video.',
  'Título: nombre del reproductor y, en audio, se muestra.': 'Title: name of the player and, in audio, it is shown.',
  'Texto secundario en audio.': 'Secondary text in audio.',
  'Subtítulos WebVTT ({ src, srclang, label, kind, default }).': 'WebVTT captions ({ src, srclang, label, kind, default }).',
  'Velocidades del selector. Por defecto, 0,5× a 2×.': 'Speeds of the selector. By default, 0.5× to 2×.',
  'Segundos de los botones de retroceder y avanzar (0 los oculta).': 'Seconds of the back and forward buttons (0 hides them).',
  'Repite al terminar.': 'Loops when it ends.',
  'Empieza silenciado.': 'Starts muted.',
  'Qué carga el navegador antes de reproducir.': 'What the browser loads before playing.',
  'CORS para medios o subtítulos de otro dominio.': 'CORS for media or captions from another domain.',
  'Texto si no carga.': 'Text if it does not load.',
  'Nombre del reproductor (por defecto, el tipo y el título).': 'Name of the player (by default, the type and the title).',
  'Empieza o sigue la reproducción.': 'Playback starts or resumes.',
  'Se pausa.': 'It is paused.',
  'Termina.': 'It ends.',
  'Segundo actual, mientras se reproduce.': 'Current second, while playing.',
  'No se pudo cargar o reproducir.': 'It could not be loaded or played.',
  'El reproductor es un grupo con nombre ("Reproductor de vídeo: Flor al amanecer") cuya descripción enumera los atajos de teclado, y los controles, otro grupo ("Controles"). Los controles no se ocultan solos, para que se puedan encontrar sin mover el ratón.':
    'The player is a named group ("Video player: Flower at dawn") whose description lists the keyboard shortcuts, and the controls are another group ("Controls"). The controls do not hide by themselves, so they can be found without moving the mouse.',
  'Reproducir / Pausar cambia de nombre según el estado; Silenciar, Subtítulos e Imagen en imagen son conmutadores con `aria-pressed`. Progreso y Volumen son sliders nativos que dicen su valor con palabras ("1 min 5 s de 4 min", "70 %"); Velocidad e idioma de los subtítulos son `select` nativos.':
    'Play / Pause changes its name with the state; Mute, Captions and Picture in picture are toggles with `aria-pressed`. Progress and Volume are native sliders that speak their value ("1 min 5 s of 4 min", "70%"); Speed and captions language are native `select`s.',
  'Los subtítulos son pistas WebVTT del propio `<video>`; el cambio de subtítulos, velocidad y volumen con el teclado se anuncia. Para audio, la transcripción (`cbMediaTranscript`) va en un `details` bajo los controles (WCAG 1.2.1).':
    'Captions are WebVTT tracks of the `<video>` itself; changes of captions, speed and volume with the keyboard are announced. For audio, the transcript (`cbMediaTranscript`) goes in a `details` below the controls (WCAG 1.2.1).',
  'Reproduce o pausa (en un botón, Espacio lo pulsa).': 'Plays or pauses (on a button, Space presses it).',
  'Retrocede o avanza 5 s; J / L, 10 s. En la barra de progreso, Re Pág / Av Pág saltan 10 s.':
    'Goes back or forward 5 s; J / L, 10 s. On the progress bar, Page Up / Page Down jump 10 s.',
  'Sube o baja el volumen (fuera de los sliders).': 'Raises or lowers the volume (outside the sliders).',
  'Saltan al 0–90 %, al principio o al final.': 'Jump to 0–90%, to the start or to the end.',
  'Silencio, pantalla completa y subtítulos.': 'Mute, full screen and captions.',
  'Reproductor de vídeo y audio con controles propios y accesibles: reproducir, avanzar y retroceder, barra de progreso y volumen que dicen su valor, silencio, velocidad, subtítulos en varios idiomas, imagen en imagen, pantalla completa, atajos de teclado como los de YouTube y transcripción. Los controles están siempre visibles.':
    'Video and audio player with its own accessible controls: play, forward and back, progress and volume bars that speak their value, mute, speed, captions in several languages, picture in picture, full screen, YouTube-like keyboard shortcuts and transcript. The controls are always visible.',
  'Vídeo con subtítulos': 'Video with captions',
  'tracks añade subtítulos WebVTT: el botón los activa con el idioma por defecto y el selector cambia de idioma. Con el foco dentro del reproductor, Espacio o K reproduce, las flechas avanzan o retroceden 5 s, 0–9 saltan a ese punto, M silencia, F pone pantalla completa y C los subtítulos. Clic en el vídeo reproduce o pausa y doble clic, pantalla completa.':
    'tracks adds WebVTT captions: the button turns them on with the default language and the selector changes the language. With focus inside the player, Space or K plays, the arrows go forward or back 5 s, 0–9 jump to that point, M mutes, F goes full screen and C toggles captions. Clicking the video plays or pauses and double-clicking goes full screen.',
  'Audio con transcripción': 'Audio with transcript',
  'kind="audio" muestra el título y el subtítulo encima de los controles, sin pantalla. Un contenido solo de audio necesita una transcripción (WCAG 1.2.1): proyéctala con cbMediaTranscript y aparece en un desplegable. skipSeconds cambia el salto de los botones.':
    'kind="audio" shows the title and subtitle above the controls, without a screen. Audio-only content needs a transcript (WCAG 1.2.1): project it with cbMediaTranscript and it appears in a disclosure. skipSeconds changes the jump of the buttons.',
};
