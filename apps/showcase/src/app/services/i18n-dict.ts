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
};
