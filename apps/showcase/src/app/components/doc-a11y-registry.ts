/**
 * Documentación de accesibilidad por componente (sección "Accesibilidad" de cada
 * página, al estilo de PrimeNG): roles/atributos ARIA y soporte de teclado.
 *
 * Los textos están en español y se traducen con `I18nService.auto()` (ver
 * `i18n-dict.ts`). Lo que va entre comillas invertidas se muestra como código.
 * Cada entrada describe el comportamiento real del componente: al cambiar su
 * ARIA o su manejo de teclado, actualiza también esta ficha.
 */
export interface DocA11yKey {
  /** Tecla o combinación (ej. "Flecha abajo", "Enter / Espacio"). */
  keys: string;
  /** Qué hace. */
  action: string;
}

export interface DocA11y {
  /** Párrafos sobre lector de pantalla (roles, atributos, etiquetado). */
  screenReader: readonly string[];
  /** Tabla de soporte de teclado. */
  keyboard?: readonly DocA11yKey[];
}

const TAB_FOCUS = (what: string): DocA11yKey => ({ keys: 'Tab', action: `Mueve el foco ${what}.` });

const FIELD_SR = [
  'Usa el elemento nativo, por lo que se anuncia como campo de texto. Con `label` se muestra una etiqueta asociada al campo; si no hay etiqueta visible, añade `aria-label`.',
  'Cuando el campo es inválido (por `invalid` o porque su FormControl es inválido y ya fue tocado) se aplica `aria-invalid="true"`, y `aria-describedby` enlaza el texto de ayuda o el mensaje de error, que se anuncia con `role="alert"`.',
];

export const DOC_A11Y: Record<string, DocA11y> = {
  'cb-input': {
    screenReader: FIELD_SR,
    keyboard: [TAB_FOCUS('al campo')],
  },
  'cb-textarea': {
    screenReader: FIELD_SR,
    keyboard: [TAB_FOCUS('al campo')],
  },
  'cb-select': {
    screenReader: [
      'El disparador tiene `role="combobox"` con `aria-haspopup="listbox"` y `aria-expanded`, y se relaciona con el panel mediante `aria-controls`. Nómbralo con `ariaLabelledBy` (id de una etiqueta visible) o con `ariaLabel`.',
      'El panel usa `role="listbox"`; cada opción tiene `role="option"` con `aria-selected` y `aria-disabled`. `aria-activedescendant` indica la opción activa mientras se navega con el teclado.',
      'Con `filter`, el campo de búsqueda es el combobox que recibe el foco y anuncia la opción activa. Los grupos son `role="group"` nombrados por su título y, con `virtualScroll`, cada opción expone `aria-setsize` y `aria-posinset`.',
    ],
    keyboard: [
      TAB_FOCUS('al select'),
      { keys: 'Enter / Espacio / Flecha abajo / Flecha arriba', action: 'Con el panel cerrado, lo abre.' },
      { keys: 'Flecha abajo / Flecha arriba', action: 'Mueve la opción activa a la siguiente o a la anterior.' },
      { keys: 'Inicio / Fin', action: 'Va a la primera o a la última opción habilitada.' },
      { keys: 'Letras', action: 'Saltan a la opción que empieza por lo escrito; repetir la misma letra recorre las coincidencias.' },
      { keys: 'Enter', action: 'Selecciona la opción activa y cierra el panel.' },
      { keys: 'Escape', action: 'Cierra el panel.' },
      { keys: 'Tab', action: 'Con el panel abierto, lo cierra y pasa al siguiente elemento.' },
    ],
  },
  'cb-multiselect': {
    screenReader: [
      'El disparador tiene `role="combobox"` con `aria-haspopup="listbox"` y `aria-expanded`, y se relaciona con el panel mediante `aria-controls`. Nómbralo con `ariaLabelledBy` (id de una etiqueta visible) o con `ariaLabel`.',
      'El panel usa `role="listbox"` con `aria-multiselectable="true"`; cada opción tiene `role="option"` con `aria-selected` y `aria-disabled`. `aria-activedescendant` indica la opción activa mientras se navega con el teclado.',
      'Con `filter`, el campo de búsqueda es el combobox que recibe el foco y anuncia la opción activa. Los grupos son `role="group"` nombrados por su título y, con `virtualScroll`, cada opción expone `aria-setsize` y `aria-posinset`.',
    ],
    keyboard: [
      TAB_FOCUS('al multiselect'),
      { keys: 'Enter / Espacio / Flecha abajo / Flecha arriba', action: 'Con el panel cerrado, lo abre.' },
      { keys: 'Flecha abajo / Flecha arriba', action: 'Mueve la opción activa a la siguiente o a la anterior.' },
      { keys: 'Inicio / Fin', action: 'Va a la primera o a la última opción habilitada.' },
      { keys: 'Letras', action: 'Saltan a la opción que empieza por lo escrito; repetir la misma letra recorre las coincidencias.' },
      { keys: 'Enter / Espacio', action: 'Marca o desmarca la opción activa; el panel sigue abierto (en el filtro, Espacio escribe).' },
      { keys: 'Escape', action: 'Cierra el panel.' },
      { keys: 'Tab', action: 'Con el panel abierto, lo cierra y pasa al siguiente elemento.' },
    ],
  },
  'cb-listbox': {
    screenReader: [
      'La lista usa `role="listbox"` (con `aria-multiselectable` en modo `multiple`) y su nombre accesible se define con `ariaLabel`.',
      'Cada opción tiene `role="option"` con `aria-selected` y `aria-disabled`; `aria-activedescendant` indica la opción activa.',
    ],
    keyboard: [
      TAB_FOCUS('a la lista'),
      { keys: 'Flecha abajo / Flecha arriba', action: 'Mueve la opción activa a la siguiente o a la anterior.' },
      { keys: 'Inicio / Fin', action: 'Va a la primera o a la última opción.' },
      { keys: 'Enter / Espacio', action: 'Selecciona la opción activa (en modo multiple, la marca o desmarca).' },
    ],
  },
  'cb-autocomplete': {
    screenReader: [
      'El campo tiene `role="combobox"` con `aria-autocomplete`, `aria-expanded` y `aria-controls`; `aria-activedescendant` indica la sugerencia activa.',
      'Las sugerencias usan `role="listbox"` y `role="option"`. Con `invalid` se aplica `aria-invalid` y `aria-describedby` enlaza la ayuda o el error, que se anuncia con `role="alert"`.',
    ],
    keyboard: [
      TAB_FOCUS('al campo'),
      { keys: 'Flecha abajo', action: 'Abre las sugerencias (si hay) y mueve a la siguiente.' },
      { keys: 'Flecha arriba', action: 'Mueve a la sugerencia anterior.' },
      { keys: 'Enter', action: 'Elige la sugerencia activa.' },
      { keys: 'Escape', action: 'Cierra las sugerencias.' },
      { keys: 'Tab', action: 'Cierra las sugerencias y pasa al siguiente elemento.' },
    ],
  },
  'cb-datepicker': {
    screenReader: [
      'El campo indica con `aria-haspopup="dialog"` y `aria-expanded` que abre un calendario. Con `invalid` se aplica `aria-invalid` y el error se anuncia con `role="alert"`.',
      'El calendario es un `role="dialog"` no modal; los días forman un `role="grid"`: cada día se nombra con su fecha completa, la celda elegida (o dentro del rango) tiene `aria-selected` y el día de hoy `aria-current="date"`. El mes visible se anuncia con `aria-live`.',
      'Los días fuera de `minDate` / `maxDate` usan `aria-disabled`: se puede pasar por ellos con las flechas, pero no elegirlos. En modo rango, tras elegir el inicio se anuncia "Elige la fecha final"; con `showTime`, horas y minutos son campos numéricos etiquetados.',
      'Con varios meses, cada mes es su propia cuadrícula nombrada con el mes y el año. El título del mes es un botón ("Octubre de 2026. Elegir mes") que lleva a las vistas de meses y años, también cuadrículas con `aria-selected` y `aria-current`.',
      'Los atajos (`presets`) son botones dentro de un `role="group"` llamado "Atajos"; el aplicado tiene `aria-pressed="true"` y los que caen fuera de `minDate` / `maxDate` están deshabilitados.',
      'Con `editable` el campo admite escribir la fecha; si el texto no es una fecha válida se marca `aria-invalid` y un `role="alert"` indica el formato esperado. En rangos con hora, cada fila de hora es un grupo nombrado ("Hora de inicio", "Hora de fin").',
    ],
    keyboard: [
      { keys: 'Enter / Espacio / Flecha abajo', action: 'En el campo, abre el calendario (con editable: Enter aplica lo escrito y Flecha abajo abre).' },
      { keys: 'Flecha izquierda / Flecha derecha', action: 'Día anterior o siguiente.' },
      { keys: 'Flecha arriba / Flecha abajo', action: 'Mismo día de la semana anterior o siguiente.' },
      { keys: 'Inicio / Fin', action: 'Primer o último día de la semana.' },
      { keys: 'Re Pág / Av Pág', action: 'Mismo día del mes anterior o siguiente.' },
      { keys: 'Mayús + Re Pág / Av Pág', action: 'Mismo día del año anterior o siguiente.' },
      { keys: 'Enter / Espacio', action: 'Selecciona el día activo (en modo rango, el inicio y luego el fin).' },
      { keys: 'Flechas / Re Pág / Av Pág (meses y años)', action: 'Mes o año anterior o siguiente, una fila arriba o abajo, y año o década anterior o siguiente.' },
      { keys: 'Escape', action: 'Cierra el calendario; en las vistas de meses o años abiertas desde el título, vuelve a la vista anterior.' },
    ],
  },
  'cb-input-number': {
    screenReader: [
      'El campo tiene `role="spinbutton"` con `aria-valuenow`, `aria-valuemin` y `aria-valuemax`. Con `invalid` se aplica `aria-invalid` y `aria-describedby` enlaza la ayuda o el error.',
    ],
    keyboard: [
      TAB_FOCUS('al campo'),
      { keys: 'Flecha arriba', action: 'Incrementa el valor en `step`.' },
      { keys: 'Flecha abajo', action: 'Decrementa el valor en `step`.' },
    ],
  },
  'cb-slider': {
    screenReader: [
      'El control tiene `role="slider"` con `aria-valuemin`, `aria-valuemax` y `aria-valuenow`, y `aria-disabled` cuando está deshabilitado. Define su nombre con `ariaLabel`.',
      'Con `range` hay dos sliders ("Precio mínimo" / "Precio máximo") cuyos límites dependen del otro, así no se cruzan. Con `valueFormat`, `aria-valuetext` anuncia el valor con formato (p. ej. "$ 300.000").',
    ],
    keyboard: [
      TAB_FOCUS('al control'),
      { keys: 'Flecha derecha / Flecha arriba', action: 'Aumenta el valor en `step`.' },
      { keys: 'Flecha izquierda / Flecha abajo', action: 'Disminuye el valor en `step`.' },
      { keys: 'Re Pág / Av Pág', action: 'Aumenta o disminuye 10 pasos.' },
      { keys: 'Inicio / Fin', action: 'Va al valor mínimo o al máximo.' },
    ],
  },
  'cb-rating': {
    screenReader: [
      'El control tiene `role="slider"`: `aria-valuenow` es la puntuación, `aria-valuemin` es 0 y `aria-valuemax` el número de estrellas. Las estrellas son decorativas (`aria-hidden`). Define su nombre con `ariaLabel`.',
    ],
    keyboard: [
      TAB_FOCUS('al control'),
      { keys: 'Flecha derecha / Flecha arriba', action: 'Suma una estrella.' },
      { keys: 'Flecha izquierda / Flecha abajo', action: 'Resta una estrella.' },
      { keys: 'Inicio / Fin', action: 'Puntuación 0 o máxima.' },
    ],
  },
  'cb-input-otp': {
    screenReader: [
      'Las casillas se agrupan en un `role="group"` cuyo nombre se define con `ariaLabel`; cada casilla es un input nativo.',
    ],
    keyboard: [
      TAB_FOCUS('a la casilla'),
      { keys: 'Flecha izquierda / Flecha derecha', action: 'Pasa a la casilla anterior o siguiente.' },
      { keys: 'Retroceso', action: 'En una casilla vacía, vuelve a la anterior.' },
    ],
  },
  'cb-checkbox': {
    screenReader: [
      'Usa un `input type="checkbox"` nativo, asociado a su `label`; sin etiqueta visible, define `ariaLabel`. El estado indeterminado se anuncia con `aria-checked="mixed"` y el inválido con `aria-invalid`.',
    ],
    keyboard: [TAB_FOCUS('a la casilla'), { keys: 'Espacio', action: 'Marca o desmarca la casilla.' }],
  },
  'cb-radio-group': {
    screenReader: [
      'El grupo tiene `role="radiogroup"` y su nombre se define con `ariaLabel`. Cada opción es un `input type="radio"` nativo que comparte `name` con las demás.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Entra al grupo en la opción seleccionada (o en la primera).' },
      { keys: 'Flechas', action: 'Mueve a la opción anterior o siguiente y la selecciona.' },
      { keys: 'Espacio', action: 'Selecciona la opción enfocada.' },
    ],
  },
  'cb-toggle': {
    screenReader: [
      'Usa un `input type="checkbox"` nativo con `role="switch"`, de modo que se anuncia como interruptor encendido o apagado. Sin etiqueta visible, define `ariaLabel`.',
    ],
    keyboard: [TAB_FOCUS('al interruptor'), { keys: 'Espacio', action: 'Cambia el estado.' }],
  },
  'cb-selectbutton': {
    screenReader: [
      'Las opciones se agrupan en un `role="group"` cuyo nombre se define con `ariaLabel`. Cada opción es un botón con `aria-pressed` que indica si está activa.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Mueve el foco entre las opciones.' },
      { keys: 'Enter / Espacio', action: 'Activa o desactiva la opción enfocada.' },
    ],
  },
  'cb-dialog': {
    screenReader: [
      'El panel tiene `role="dialog"` con `aria-modal="true"` y se nombra con el título (`aria-labelledby` hacia `header`) o, si no hay título, con `ariaLabel`.',
      'Al abrirse, el foco queda atrapado dentro del diálogo; al cerrarse vuelve al elemento que lo abrió.',
    ],
    keyboard: [
      { keys: 'Tab / Mayús + Tab', action: 'Mueve el foco entre los elementos del diálogo sin salir de él.' },
      { keys: 'Escape', action: 'Cierra el diálogo (si `closeOnEscape` es true).' },
    ],
  },
  'cb-drawer': {
    screenReader: [
      'El panel tiene `role="dialog"` con `aria-modal="true"` y se nombra con el título (`aria-labelledby` hacia `header`) o, si no hay título, con `ariaLabel`.',
      'Al abrirse, el foco queda atrapado dentro del panel; al cerrarse vuelve al elemento que lo abrió.',
    ],
    keyboard: [
      { keys: 'Tab / Mayús + Tab', action: 'Mueve el foco entre los elementos del panel sin salir de él.' },
      { keys: 'Escape', action: 'Cierra el panel (si `closeOnEscape` es true).' },
    ],
  },
  'cb-popover': {
    screenReader: [
      'El contenido flotante tiene `role="dialog"` y su nombre se define con `ariaLabel`. Se abre junto al elemento que lo dispara.',
    ],
    keyboard: [{ keys: 'Escape', action: 'Cierra el popover.' }],
  },
  'cb-tooltip': {
    screenReader: [
      'El texto flotante tiene `role="tooltip"` y aparece al pasar el puntero y al enfocar el elemento. Mientras está visible, el elemento lo referencia con `aria-describedby` (conservando los ids que ya tuviera), así que el lector de pantalla lo anuncia como descripción.',
      'El tooltip describe, no nombra: en botones solo con icono define también un `aria-label`.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Al enfocar el elemento se muestra el tooltip; al salir del foco se oculta.' },
      { keys: 'Escape', action: 'Oculta el tooltip sin mover el foco.' },
    ],
  },
  'cb-menu': {
    screenReader: [
      'El panel tiene `role="menu"` y su nombre se define con `ariaLabel`. Cada acción es un `role="menuitem"` (con `aria-disabled` si está deshabilitada) y los separadores usan `role="separator"`.',
    ],
    keyboard: [
      { keys: 'Flecha abajo / Flecha arriba', action: 'Mueve el foco a la acción siguiente o anterior (de forma circular).' },
      { keys: 'Inicio / Fin', action: 'Va a la primera o a la última acción.' },
      { keys: 'Enter', action: 'Ejecuta la acción enfocada o abre su enlace (`url`).' },
      { keys: 'Espacio', action: 'Ejecuta la acción enfocada (en las que no son enlaces).' },
      { keys: 'Escape', action: 'Cierra el menú.' },
    ],
  },
  'cb-contextmenu': {
    screenReader: [
      'Se abre con clic derecho en la posición del puntero. El panel tiene `role="menu"` y cada acción `role="menuitem"`; al abrirse, el foco pasa a la primera acción habilitada.',
    ],
    keyboard: [
      { keys: 'Flecha abajo / Flecha arriba', action: 'Mueve el foco a la acción siguiente o anterior (de forma circular).' },
      { keys: 'Enter / Espacio', action: 'Ejecuta la acción enfocada.' },
      { keys: 'Escape', action: 'Cierra el menú.' },
    ],
  },
  'cb-toast': {
    screenReader: [
      'El contenedor es una región `role="log"` con `aria-live="polite"`: cada mensaje nuevo se anuncia sin mover el foco. Cada mensaje tiene `role="alert"` y su botón de cierre `aria-label="Cerrar"`.',
    ],
    keyboard: [
      TAB_FOCUS('al botón de cerrar de cada mensaje'),
      { keys: 'Enter / Espacio', action: 'Cierra el mensaje.' },
    ],
  },
  'cb-confirm-dialog': {
    screenReader: [
      'El panel tiene `role="alertdialog"` con `aria-modal="true"`; `aria-labelledby` apunta al título (`header`) y `aria-describedby` al mensaje.',
      'Al abrirse, el foco pasa al primer botón (cancelar) y queda atrapado dentro del diálogo; al cerrarse vuelve al elemento que lo abrió.',
    ],
    keyboard: [
      { keys: 'Tab / Mayús + Tab', action: 'Mueve el foco entre los botones sin salir del diálogo.' },
      { keys: 'Enter / Espacio', action: 'Activa el botón enfocado.' },
      { keys: 'Escape', action: 'Cancela y cierra el diálogo (emite `rejected`).' },
    ],
  },
  'cb-tabs': {
    screenReader: [
      'Las pestañas usan `role="tablist"`, `role="tab"` (con `aria-selected`) y `role="tabpanel"`. La pestaña activa apunta a su panel con `aria-controls` y el panel se nombra con `aria-labelledby`.',
      'Solo la pestaña activa entra en el orden de tabulación; al cambiar con las flechas, el foco se mueve con ella.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Mueve el foco a la pestaña activa y luego al panel.' },
      { keys: 'Flecha derecha / Flecha izquierda', action: 'Activa y enfoca la pestaña siguiente o anterior (de forma circular), omitiendo las deshabilitadas.' },
      { keys: 'Inicio / Fin', action: 'Activa y enfoca la primera o la última pestaña.' },
    ],
  },
  'cb-tree': {
    screenReader: [
      'El árbol tiene `role="tree"` y su nombre se define con `ariaLabel`. Cada nodo es un `role="treeitem"` con `aria-level`, `aria-setsize` y `aria-posinset`; los que tienen hijos exponen `aria-expanded` y el elegido `aria-selected`.',
      'Solo un nodo entra en el orden de tabulación (el activo, el seleccionado o el primero); los botones de expandir no reciben foco con Tab.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Mueve el foco al árbol.' },
      { keys: 'Flecha abajo / Flecha arriba', action: 'Mueve el foco al nodo visible siguiente o anterior.' },
      { keys: 'Flecha derecha', action: 'Expande el nodo; si ya está expandido, pasa a su primer hijo.' },
      { keys: 'Flecha izquierda', action: 'Contrae el nodo; si ya está contraído, sube a su padre.' },
      { keys: 'Inicio / Fin', action: 'Va al primer o al último nodo visible.' },
      { keys: 'Enter / Espacio', action: 'Selecciona el nodo enfocado.' },
    ],
  },
  'cb-treetable': {
    screenReader: [
      'La tabla tiene `role="treegrid"` y su nombre se define con `ariaLabel`. Cada fila expone `aria-level`, `aria-setsize`, `aria-posinset` y, si tiene hijos, `aria-expanded`.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Mueve el foco a la tabla.' },
      { keys: 'Flecha abajo / Flecha arriba', action: 'Mueve el foco a la fila visible siguiente o anterior.' },
      { keys: 'Flecha derecha', action: 'Expande la fila; si ya está expandida, pasa a su primera fila hija.' },
      { keys: 'Flecha izquierda', action: 'Contrae la fila; si ya está contraída, sube a la fila padre.' },
      { keys: 'Inicio / Fin', action: 'Va a la primera o a la última fila visible.' },
      { keys: 'Enter / Espacio', action: 'Expande o contrae la fila enfocada.' },
    ],
  },
  'cb-orderlist': {
    screenReader: [
      'La lista tiene `role="listbox"` y se nombra con `header` (mediante `aria-labelledby`) o, si no hay, con `ariaLabel`. El elemento elegido tiene `aria-selected`.',
      'Los botones de mover tienen etiquetas accesibles y se deshabilitan cuando el movimiento no es posible.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Mueve el foco a la lista.' },
      { keys: 'Flecha abajo / Flecha arriba', action: 'Mueve el foco al elemento siguiente o anterior.' },
      { keys: 'Inicio / Fin', action: 'Va al primer o al último elemento.' },
      { keys: 'Enter / Espacio', action: 'Selecciona el elemento enfocado.' },
      { keys: 'Alt + Flecha arriba / Alt + Flecha abajo', action: 'Sube o baja el elemento seleccionado.' },
    ],
  },
  'cb-picklist': {
    screenReader: [
      'Cada lista tiene `role="listbox"` con `aria-multiselectable="true"` y se nombra con su cabecera; los elementos marcados tienen `aria-selected`.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Pasa entre la lista de origen, los botones y la lista de destino.' },
      { keys: 'Flecha abajo / Flecha arriba', action: 'Mueve el foco dentro de la lista.' },
      { keys: 'Espacio', action: 'Marca o desmarca el elemento enfocado.' },
      { keys: 'Enter', action: 'Transfiere los elementos marcados (o el enfocado) a la otra lista.' },
    ],
  },
  'cb-megamenu': {
    screenReader: [
      'Sigue el patrón *disclosure navigation*: una `nav` nombrada con `ariaLabel` y botones de categoría con `aria-expanded` que apuntan a su panel con `aria-controls`.',
    ],
    keyboard: [
      { keys: 'Flecha derecha / Flecha izquierda', action: 'Mueve el foco a la categoría siguiente o anterior (de forma circular).' },
      { keys: 'Inicio / Fin', action: 'Va a la primera o a la última categoría.' },
      { keys: 'Enter / Espacio', action: 'Abre o cierra el panel de la categoría.' },
      { keys: 'Flecha abajo', action: 'Abre el panel y mueve el foco a su primer enlace; dentro del panel, al siguiente enlace.' },
      { keys: 'Flecha arriba', action: 'Dentro del panel, va al enlace anterior (desde el primero, vuelve a la categoría).' },
      { keys: 'Escape', action: 'Cierra el panel y devuelve el foco a su categoría.' },
    ],
  },
  'cb-confirm-popup': {
    screenReader: [
      'El panel tiene `role="alertdialog"` y `aria-describedby` apunta al mensaje. Abierto con `confirm($event)`, el foco pasa al botón de cancelar y vuelve al disparador al cerrarse.',
    ],
    keyboard: [
      { keys: 'Tab / Mayús + Tab', action: 'Mueve el foco entre los botones.' },
      { keys: 'Enter / Espacio', action: 'Activa el botón enfocado.' },
      { keys: 'Escape', action: 'Cancela y cierra la confirmación (emite `rejected`).' },
    ],
  },
  'cb-carousel': {
    screenReader: [
      'El carrusel es una región (`role="region"` con `aria-roledescription="carousel"`) nombrada con `ariaLabel`. Cada diapositiva es un `role="group"` con `aria-roledescription="slide"` y un nombre de posición ("1 de 3").',
      'Los indicadores siguen el patrón *tabs*: `role="tab"` con `aria-selected`, y solo el activo entra en el orden de tabulación.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Pasa por las flechas de navegación y el indicador activo.' },
      { keys: 'Flecha derecha / Flecha izquierda', action: 'En los indicadores, va a la diapositiva siguiente o anterior (de forma circular).' },
      { keys: 'Inicio / Fin', action: 'En los indicadores, va a la primera o a la última diapositiva.' },
    ],
  },
  'cb-galleria': {
    screenReader: [
      'La imagen principal usa `alt` (o `title`) del elemento. Las miniaturas son `role="tab"` con `aria-selected` y se nombran con `title`, `alt` o su posición; su imagen es decorativa para no repetir el nombre.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Pasa por las flechas de navegación y la miniatura activa.' },
      { keys: 'Flecha derecha / Flecha izquierda', action: 'En las miniaturas, va a la imagen siguiente o anterior (de forma circular).' },
      { keys: 'Inicio / Fin', action: 'En las miniaturas, va a la primera o a la última imagen.' },
    ],
  },
  'cb-pdf-viewer': {
    screenReader: [
      'El visor es una región con nombre ("Visor de PDF") y cada página es un grupo con nombre ("Página 2 de 3"). El canvas es decorativo: el texto del PDF está en una capa transparente encima, así que el lector de pantalla lo lee y se puede seleccionar y copiar. Un PDF escaneado sin texto no tiene contenido legible.',
      'Todos los botones de la barra tienen nombre; el de miniaturas indica con `aria-expanded` si el panel está abierto, y la miniatura de la página actual tiene `aria-current="page"`.',
      'El resultado de la búsqueda ("3 de 12", "Sin resultados") se anuncia en una región `aria-live`. El campo de página se describe con el total ("de 3").',
      'Si el documento tiene contraseña, el formulario la pide con una etiqueta visible y anuncia con `role="alert"` si es incorrecta. Los errores de carga también usan `role="alert"`.',
      'El índice es una lista anidada de botones dentro de un `nav` con nombre ("Índice"); las entradas con subniveles tienen un botón con `aria-expanded` ("Contraer 2. Condiciones"). Las pestañas Miniaturas / Índice indican la elegida con `aria-pressed`.',
      'Los enlaces del documento son enlaces de verdad sobre el texto; los externos se abren en otra pestaña con `rel="noopener"` y solo si son http(s), mailto o tel.',
      'Los campos de formulario son controles nativos (`input`, `textarea`, `select`, casillas) con el nombre que les da el PDF (`TU`); se recorren con Tab. Descargar cambia su nombre a "Descargar con los datos del formulario" cuando hay cambios.',
      'Con annotatable, la barra tiene un grupo "Anotar": Resaltar, Nota y Dibujar son conmutadores con `aria-pressed` y Firmar abre un diálogo (`aria-haspopup="dialog"`) con el panel de firma, que también permite escribir el nombre. El color es un `select` nativo. La herramienta activa se explica en un aviso sobre el documento ("Selecciona texto del documento para resaltarlo.").',
      'Cada anotación es un botón con nombre ("Resaltado: Supermercado La Ceiba. Comentario: No reconozco este cargo", "Nota: Revisar", "Firma") descrito con sus atajos. Crearla, moverla, cambiar su tamaño o borrarla se anuncia ("Añadido en la página 1: Nota", "Movido a 40 %, 25 %"). El editor de la nota o del comentario es un `textarea` con etiqueta visible, y al cerrarlo el foco vuelve a la anotación.',
      'La pestaña Anotaciones lista todas por página con un botón que lleva a cada una y otro para borrarla ("Eliminar anotación: Nota: Revisar"). Descargar se llama "Descargar con las anotaciones" cuando las hay. Resaltar funciona con cualquier selección de texto, también la hecha con el teclado; dibujar requiere puntero.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Recorre la barra, el panel de miniaturas y el documento (que se desplaza con las flechas, Re Pág / Av Pág e Inicio / Fin).' },
      { keys: 'Enter / Mayús + Enter', action: 'En la búsqueda: coincidencia siguiente / anterior.' },
      { keys: 'Escape', action: 'En la búsqueda: la vacía y quita los resaltados.' },
      { keys: 'Flecha arriba / abajo', action: 'En las miniaturas: mueve el foco a la página anterior / siguiente.' },
      { keys: 'Enter / Espacio', action: 'En el índice: va a la sección; en el botón de flecha, la contrae o expande.' },
      { keys: 'Ctrl + F', action: 'Lleva el foco a la búsqueda del documento.' },
      { keys: 'Ctrl + + / Ctrl + - / Ctrl + 0', action: 'Acerca, aleja o ajusta al ancho.' },
      { keys: 'Ctrl + P', action: 'Imprime el documento (no la página).' },
      { keys: 'Flechas / Mayús + flechas', action: 'En una nota, dibujo o firma: la mueve (Mayús, más rápido).' },
      { keys: '+ / −', action: 'En una firma: cambia su tamaño; en una nota, el de la letra.' },
      { keys: 'Intro / Supr', action: 'En una anotación: edita la nota o el comentario / la borra. En el editor, Escape o Ctrl + Intro lo cierran.' },
      { keys: 'Escape', action: 'Con una herramienta activa: vuelve a la selección normal.' },
    ],
  },
  'cb-image': {
    screenReader: [
      'El botón de ampliar se nombra con el `alt` de la imagen. La previsualización es un `role="dialog"` con `aria-modal="true"` y cada herramienta (rotar, voltear, zoom, descargar) tiene su etiqueta.',
      'Al abrirse, el foco pasa al botón de cerrar y queda atrapado en la previsualización; al cerrarse vuelve al botón de ampliar.',
    ],
    keyboard: [
      { keys: 'Enter / Espacio', action: 'Abre la previsualización o activa la herramienta enfocada.' },
      { keys: 'Tab / Mayús + Tab', action: 'Mueve el foco entre las herramientas sin salir de la previsualización.' },
      { keys: 'Escape', action: 'Cierra la previsualización.' },
    ],
  },
  'cb-inplace': {
    screenReader: [
      'La vista previa es un botón nativo. Al abrirse, el foco pasa al primer elemento enfocable del contenido; al cerrarse, vuelve a la vista previa.',
    ],
    keyboard: [
      { keys: 'Enter / Espacio', action: 'Muestra el contenido.' },
      { keys: 'Escape', action: 'Vuelve a la vista previa (si `closable` es true).' },
    ],
  },
  'cb-cascade-select': {
    screenReader: [
      'El disparador es un `role="combobox"` con `aria-expanded`; refleja `aria-invalid` y `aria-required` del estado del formulario.',
    ],
    keyboard: [
      { keys: 'Enter / Espacio', action: 'Abre o cierra el panel, o elige la opción enfocada.' },
      { keys: 'Tab', action: 'Mueve el foco entre las opciones del panel.' },
      { keys: 'Escape', action: 'Cierra el panel y devuelve el foco al disparador.' },
    ],
  },
  'cb-tree-select': {
    screenReader: [
      'El disparador es un `role="combobox"` con `aria-haspopup="tree"`. El panel es un `role="tree"`: cada nodo es un `role="treeitem"` con `aria-selected` y, si tiene hijos, `aria-expanded`; el botón de expandir se nombra con el nodo.',
    ],
    keyboard: [
      { keys: 'Enter / Espacio', action: 'Abre o cierra el panel, expande un nodo o elige el nodo enfocado.' },
      { keys: 'Tab', action: 'Mueve el foco entre los nodos y sus botones de expandir.' },
      { keys: 'Escape', action: 'Cierra el panel y devuelve el foco al disparador.' },
    ],
  },
  'cb-editor': {
    screenReader: [
      'El área editable es un `role="textbox"` con `aria-multiline="true"`, nombrado con `ariaLabel` (por defecto, "Editor de texto"). Refleja `aria-invalid`, `aria-required` y `aria-disabled`.',
      'La barra es un `role="toolbar"` con nombre que controla el área editable (`aria-controls`); cada herramienta tiene su etiqueta (también como `title`), las de formato indican con `aria-pressed` si están activas y solo una entra en el orden de tabulación.',
      'Color de texto, resaltado y alineación son botones con `aria-haspopup="menu"` y `aria-expanded` que abren un `role="menu"`: Flecha abajo, Enter o Espacio lo abren y enfocan la primera opción; las flechas recorren la paleta (en cuadrícula) o las opciones (`menuitemradio` con `aria-checked`), y Escape lo cierra y devuelve el foco al botón. Cada herramienta con atajo lo indica en su tooltip y en `aria-keyshortcuts`.',
      'En una lista de tareas, cada tarea guarda `data-checked`; se marca con un clic en la casilla o con Ctrl + Enter, y la marcada se tacha. El pie anuncia palabras y caracteres y describe el área de texto.',
      'El enlace se edita en un formulario propio (no en `window.prompt`): su campo tiene etiqueta visible y, si la URL no es segura, `aria-invalid` y un `role="alert"`. El contador de `maxLength` describe el área editable (`aria-describedby`) y los errores de imagen se anuncian con `role="alert"`.',
      'Con el cursor en una tabla aparece una segunda barra (`role="toolbar"`, "Tabla") y, al seleccionar una imagen, otra ("Imagen"); se recorren con las flechas, y alineación, ancho y fila de encabezado indican con `aria-pressed` la opción activa. Las tablas guardan `<th scope="col">` en la fila de encabezado y las imágenes su texto alternativo.',
      'La barra de tabla agrupa sus botones ("Fila", "Columna") con `role="group"` y texto visible; los bordes y su color son `<select>` con nombre. El tamaño de una tabla nueva se elige en una cuadrícula de botones con nombre ("3 filas × 4 columnas") y el tamaño elegido se anuncia. El recuadro de recorte es un `role="slider"` con su tamaño en `aria-valuetext` e instrucciones enlazadas.',
      'El menú `/` es un `role="listbox"` ("Insertar bloque"): el foco se queda en el texto y la opción activa se indica con `aria-activedescendant` y `aria-selected`. El menú flotante de formato rápido es un `role="toolbar"` que no roba el foco; repite herramientas de la barra principal.',
      'Con el cursor en un bloque de código aparece su barra ("Herramientas del bloque de código") con el lenguaje en un `<select>` con nombre y el botón Copiar código, que cambia a "Copiado". La barra de tabla añade el grupo "Celdas" (combinar a la derecha, abajo y separar), deshabilitados cuando no se puede, y la de imagen el botón "Pie de imagen" con `aria-pressed`.',
      'La lista de menciones es un `role="listbox"` como el menú `/`: el foco se queda en el texto y la persona activa se indica con `aria-activedescendant`. La mención es un único elemento no editable que se borra de una vez.',
      'El índice es un `nav` de enlaces a los títulos; en el editor, un enlace lleva el cursor a su título. El desplegable es un `details` / `summary` nativo, que los lectores anuncian como plegable.',
      'El aviso de borrador usa `role="status"` y tiene botones con texto ("Restaurar", "Descartar"); la hora del último guardado se lee en el pie.',
      'Buscar y reemplazar es un `role="search"` con campos etiquetados; el número de coincidencias ("2 de 5", "Sin resultados") se anuncia con `role="status"`, y "Mayúsculas y minúsculas" y "Palabras completas" indican su estado con `aria-pressed`. Las coincidencias se resaltan sin modificar el contenido. Los caracteres especiales son un `role="menu"` con un `role="group"` por categoría.',
      'Con `readonly` el área tiene `aria-readonly="true"` y no hay barra. El contenido siempre se sanea: un lector de pantalla nunca recibe scripts ni enlaces `javascript:`.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Pasa de la barra de herramientas al área editable.' },
      { keys: 'Alt + F10', action: 'Desde el texto, lleva el foco a la barra de herramientas.' },
      { keys: 'Ctrl + F', action: 'Abre buscar y reemplazar: Enter y Mayús + Enter recorren las coincidencias; Escape cierra.' },
      { keys: '/', action: 'Al inicio de una línea, abre el menú de bloques: flechas para elegir, Enter o Tab para insertar, Escape para cerrar.' },
      { keys: 'Ctrl + B / I / U', action: 'Negrita, cursiva y subrayado.' },
      { keys: 'Ctrl + K', action: 'Abre el formulario de enlace (Escape lo cierra y vuelve al texto).' },
      { keys: 'Ctrl + Mayús + 7 / 8', action: 'Lista numerada / con viñetas.' },
      { keys: 'Ctrl + Alt + 1–3 / 0', action: 'Título 1–3 / párrafo.' },
      { keys: '# , * , 1. , > + Espacio', action: 'Al inicio de un párrafo, lo convierten en título, lista o cita.' },
      { keys: 'Tab / Mayús + Tab (en una tabla)', action: 'Celda siguiente o anterior; en la última, añade una fila.' },
      { keys: 'Tab (en un bloque de código)', action: 'Inserta dos espacios.' },
      { keys: '@', action: 'Con mentions, abre la lista de personas: flechas para elegir, Enter o Tab para insertar, Escape para cerrar.' },
      { keys: 'Enter (en un pie de imagen o en el título de un desplegable)', action: 'Sigue en el párrafo siguiente o en el contenido del desplegable.' },
      { keys: 'Flechas / Enter (tamaño de la tabla)', action: 'Eligen filas y columnas en la cuadrícula e insertan la tabla.' },
      { keys: 'Flechas / Mayús + flechas / Enter (recorte)', action: 'Mueven o redimensionan el recuadro de recorte y lo aplican.' },
      { keys: 'Flecha derecha / Flecha izquierda', action: 'En la barra, va a la herramienta siguiente o anterior (de forma circular).' },
      { keys: 'Inicio / Fin', action: 'En la barra, va a la primera o a la última herramienta.' },
    ],
  },
  'cb-terminal': {
    screenReader: [
      'El historial es un `role="log"` con `aria-live="polite"`: los comandos y respuestas nuevos se anuncian. La entrada se nombra con el prompt.',
    ],
    keyboard: [
      { keys: 'Enter', action: 'Ejecuta el comando (`clear` vacía el historial).' },
      { keys: 'Flecha arriba / Flecha abajo', action: 'Recorre los comandos anteriores.' },
    ],
  },
  'cb-meter-group': {
    screenReader: [
      'El medidor es un `role="meter"` nombrado con `ariaLabel`, con `aria-valuenow` (la suma de los valores), `aria-valuemax` y un desglose en `aria-valuetext` ("Apps 25%, Datos 40%"). La leyenda visual se oculta al lector para no repetirlo.',
    ],
  },
  'cb-block-ui': {
    screenReader: [
      'Mientras está bloqueado, el contenido es `inert` (no recibe foco ni clics), el contenedor expone `aria-busy="true"` y la máscara es un `role="status"` que anuncia `message` (por defecto, "Cargando").',
    ],
  },
  'cb-table': {
    screenReader: [
      'Es una tabla nativa (`table`, `th scope="col"`) nombrada con `ariaLabel`. Las columnas ordenables tienen un botón "Ordenar por …" y exponen `aria-sort` (ascending / descending / none).',
      'Con selección, cada fila tiene un checkbox (múltiple) o un radio (simple) con nombre "Seleccionar fila N"; el de la cabecera usa `aria-checked="mixed"` si hay una selección parcial.',
      'Los filtros de columna se nombran "Filtrar por …" y, mientras hay filtros, una región viva anuncia la cantidad de resultados.',
      'Las filas expandibles tienen un botón con `aria-expanded` que apunta a la fila de detalle con `aria-controls`. Los separadores de columna son `role="separator"` con su ancho en `aria-valuenow`.',
      'Las cabeceras de grupo son celdas `th scope="rowgroup"`. Mientras `loading` está activo la tabla expone `aria-busy="true"` y la capa de carga es un `role="status"`.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Recorre los botones de ordenar, separadores, filtros, checkboxes y botones de detalle.' },
      { keys: 'Enter / Espacio', action: 'Ordena por la columna, expande la fila o marca el checkbox / radio enfocado.' },
      { keys: 'Flecha izquierda / Flecha derecha', action: 'En un separador, estrecha o ensancha la columna (10 px; 50 px con Mayús).' },
    ],
  },
  'cb-chart': {
    screenReader: [
      'El gráfico es un grupo enfocable nombrado con `ariaLabel`, con instrucciones de uso; el dibujo SVG es decorativo (`aria-hidden`).',
      'Incluye los mismos datos como una tabla oculta visualmente (título, series y valores formateados), que los lectores de pantalla pueden recorrer.',
      'Al moverse con las flechas, una región viva anuncia la categoría y sus valores (en torta, dona, medidor y treemap, el valor y el porcentaje; en la cascada, la variación y el total acumulado; en el mapa de calor, la fila, la columna y el valor). La leyenda son botones con `aria-pressed`.',
      'En el modo composable la tabla oculta tiene una columna por serie y una fila por valor de X (fechas completas en el eje de tiempo); las velas muestran apertura, máximo, mínimo y cierre. Las instrucciones explican el zoom cuando está activo, y el botón "Restablecer zoom" es un botón nativo.',
      'En `cb-chart-group` (un `role="group"` con nombre) el cursor se comparte entre las gráficas, pero solo anuncia la que tiene el foco. Las anotaciones se incluyen en el anuncio y el tooltip de su punto.',
      'En el mapa de calor la tabla oculta tiene una columna por cada etiqueta y una fila por dataset; el color nunca es la única pista: cada celda tiene su valor en el tooltip y en la tabla.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Enfoca el gráfico y muestra el primer dato.' },
      { keys: 'Flechas', action: 'Pasan a la categoría, segmento o celda siguiente o anterior (de forma circular).' },
      { keys: 'Flecha arriba / abajo (mapa de calor)', action: 'Cambian de fila manteniendo la columna.' },
      { keys: 'Inicio / Fin', action: 'Van al primer o al último dato.' },
      { keys: 'Enter', action: 'Selecciona el dato activo (emite itemSelect).' },
      { keys: 'Escape', action: 'Oculta el tooltip.' },
      { keys: '+ / − / 0 (con zoom)', action: 'Acercan y alejan alrededor del dato activo, o vuelven a mostrar todo.' },
    ],
  },
  'cb-split-button': {
    screenReader: [
      'El control es un `role="group"` nombrado con `label`. La flecha es un botón con nombre ("Más acciones"), `aria-haspopup="menu"` y `aria-expanded`; el menú sigue el patrón *menu*.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Pasa de la acción principal a la flecha.' },
      { keys: 'Enter / Espacio', action: 'Ejecuta la acción principal o abre el menú.' },
      { keys: 'Flecha abajo', action: 'Sobre la flecha, abre el menú.' },
      { keys: 'Escape', action: 'Cierra el menú y devuelve el foco a la flecha.' },
    ],
  },
  'cb-empty': {
    screenReader: [
      'El icono o la ilustración son decorativos; el título y la descripción son texto normal y las acciones, botones o enlaces proyectados.',
    ],
  },
  'cb-kbd': {
    screenReader: [
      'Usa el elemento nativo `kbd`; una combinación es un `kbd` que contiene un `kbd` por tecla, como recomienda HTML.',
      'Los símbolos de Mac (⌘ ⌥ ⇧ ↵) se ocultan al lector y se lee su nombre (Command, Option, Shift, Enter).',
    ],
  },
  'cb-copy-button': {
    screenReader: [
      'Sin `showLabel` es un botón de solo icono con nombre accesible ("Copiar" del idioma activo, o `label`).',
      'El resultado ("Copiado" o "No se pudo copiar") se anuncia en una región `role="status"` sin mover el foco.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Lleva el foco al botón.' },
      { keys: 'Enter / Espacio', action: 'Copia el valor.' },
    ],
  },
  'cb-qrcode': {
    screenReader: [
      'Es una imagen (`role="img"`) con nombre "Código QR" o `ariaLabel`. El lector no puede leer el contenido: si importa, muéstralo también como texto o enlace junto al QR.',
    ],
  },
  'cb-command-palette': {
    screenReader: [
      'Es un diálogo modal (`role="dialog"`, `aria-modal`) con un campo `role="combobox"` que controla la lista (`role="listbox"`); la opción activa se indica con `aria-activedescendant`, así el foco no sale del campo.',
      'Los grupos son `role="group"` con su título; los items deshabilitados llevan `aria-disabled`. El número de resultados se anuncia en una región `role="status"`.',
      'Al cerrar, el foco vuelve al elemento que lo tenía antes de abrir.',
    ],
    keyboard: [
      { keys: 'Ctrl + K / ⌘ K', action: 'Abre o cierra la paleta (configurable con shortcut).' },
      { keys: 'Flecha abajo / arriba', action: 'Mueve la opción activa (salta las deshabilitadas y da la vuelta).' },
      { keys: 'Ctrl + Inicio / Fin', action: 'Primera o última opción.' },
      { keys: 'Enter', action: 'Elige la opción activa.' },
      { keys: 'Escape', action: 'Cierra la paleta.' },
    ],
  },
  'cb-sidebar': {
    screenReader: [
      'Es un `nav` con nombre ("Navegación principal"); cada sección es una lista nombrada por su título. El item activo lleva `aria-current="page"`.',
      'Los grupos con hijos son botones con `aria-expanded` y `aria-controls`. Contraído, el texto se oculta a la vista pero sigue siendo el nombre accesible, y aparece como tooltip.',
      'En `cb-app-shell` móvil el panel está `inert` mientras está cerrado; abierto, atrapa el foco, se cierra con Escape o con el fondo y devuelve el foco al botón `cbSidebarToggle` (que gestiona `aria-expanded` y `aria-controls`).',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Recorre los enlaces y botones del menú.' },
      { keys: 'Enter / Espacio', action: 'Abre el enlace o despliega el grupo.' },
      { keys: 'Escape', action: 'En móvil, cierra el panel.' },
    ],
  },
  'cb-chat': {
    screenReader: [
      'La conversación es un `role="log"` con nombre ("Conversación"): los lectores anuncian los mensajes nuevos sin mover el foco.',
      'Mientras se genera una respuesta (`busy`, y `streaming` en el mensaje) se marca `aria-busy` para que no se lea cada fragmento; al terminar se anuncia "Respuesta lista" una sola vez.',
      'Cada mensaje es un `article` nombrado por su autor y hora. El markdown se pinta con etiquetas semánticas (listas, tablas, código) y los enlaces externos se abren en otra pestaña con `rel="noopener"`.',
      'El campo de prompt tiene nombre ("Mensaje"); Enviar, Detener, Adjuntar y Quitar archivo son botones con nombre accesible. Los estados de envío y error se muestran como texto, no solo con color.',
      'El razonamiento y las herramientas son botones desplegables con `aria-expanded` y `aria-controls`; el cambio de estado de una herramienta ("Usó…", "Falló…") se anuncia en una región `role="status"`.',
      'Los botones de valoración llevan `aria-pressed` y nombre ("Respuesta útil", "Respuesta no útil"); las miniaturas de imagen usan el nombre del archivo como texto alternativo.',
    ],
    keyboard: [
      { keys: 'Enter', action: 'Envía el mensaje (Shift + Enter, salto de línea; no envía durante la composición IME).' },
      { keys: 'Tab', action: 'Recorre sugerencias, adjuntar, el campo y Enviar o Detener.' },
      { keys: 'Tab (en la lista)', action: 'La conversación es enfocable y se desplaza con las flechas.' },
    ],
  },
  'cb-code-block': {
    screenReader: [
      'El código se pinta como texto dentro de `pre` y `code`; los colores son decorativos. Los números de línea se ocultan al lector (`aria-hidden`) y no se copian al seleccionar.',
      'El área con scroll es enfocable (`tabindex="0"`) y se nombra con el archivo o el lenguaje, para recorrerla con el teclado.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Enfoca el código (para desplazarlo con las flechas) y el botón de copiar.' },
    ],
  },
  'cb-phone-input': {
    screenReader: [
      'El botón del país se nombra con el país y su prefijo ("País: Colombia (+57)") y anuncia `aria-haspopup="listbox"` y `aria-expanded`. La bandera es decorativa.',
      'El número es un `input type="tel"` con su etiqueta, `inputmode="tel"` (teclado numérico) y `autocomplete="tel-national"`. Con error, `aria-invalid` y el mensaje con `role="alert"`.',
      'En la lista, el buscador es un combobox que controla la lista de países con `aria-activedescendant`; el país elegido lleva `aria-selected`.',
    ],
    keyboard: [
      { keys: 'Enter / Espacio / Flecha abajo', action: 'Sobre el país, abre la lista con el buscador enfocado.' },
      { keys: 'Flecha arriba / abajo', action: 'Mueve el país activo de la lista.' },
      { keys: 'Enter', action: 'Elige el país y vuelve al número.' },
      { keys: 'Escape', action: 'Cierra la lista y devuelve el foco al botón del país.' },
    ],
  },
  'cb-comments': {
    screenReader: [
      'El hilo es una región con nombre ("Comentarios y actividad", o `ariaLabel`) y una lista ordenada. Cada comentario es un `article` nombrado por su autor y su fecha; la fecha relativa ("hace 2 horas") va en un `time` con la fecha completa en `datetime` y en el `title`.',
      'Las respuestas forman una lista anidada con nombre ("Respuestas a Luis Pérez"). El filtro Todo / Comentarios / Actividad es un grupo de botones con `aria-pressed`.',
      'Cada reacción es un conmutador (`aria-pressed`) que dice el emoji, cuántas personas y quiénes ("👍, 2: Luis Pérez y tú"). "Añadir reacción" indica `aria-expanded` y abre un grupo de emojis.',
      'Publicar, guardar y eliminar se anuncian en una región `aria-live`. Tras responder o editar, el foco va al comentario; tras eliminar, al siguiente. Eliminar pide confirmación en línea, sin diálogo.',
      'La caja para escribir es un `cb-editor` con nombre ("Nuevo comentario", "Responder a …", "Editar comentario"); las @menciones usan su lista con `aria-activedescendant`. El HTML de los comentarios se sanea con la lista blanca del editor antes de pintarlo.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Recorre el filtro, las reacciones y las acciones de cada comentario, y la caja para escribir.' },
      { keys: '@', action: 'En el editor, abre la lista de personas para mencionar (flechas y Enter para elegir).' },
      { keys: 'Ctrl + Enter', action: 'Publica el comentario, la respuesta o la edición.' },
      { keys: 'Escape', action: 'Cancela la respuesta o la edición, cierra el selector de emojis o la confirmación de borrado.' },
      { keys: 'Alt + F10', action: 'Desde el editor, va a su barra de herramientas.' },
    ],
  },
  'cb-notification-center': {
    screenReader: [
      'La campana es un botón con nombre que incluye cuántos avisos hay sin leer ("Notificaciones, 2 sin leer"), con `aria-haspopup="dialog"` y `aria-expanded`; el contador visual es decorativo.',
      'El panel es un `role="dialog"` (o una región con `inline`) nombrado por su título, que recibe el foco al abrir. Los grupos Hoy, Ayer y Anteriores son encabezados y cada uno nombra su lista.',
      'Cada aviso es un botón con su título y detalle; los no leídos empiezan con "No leída" (no solo el punto de color) y la fecha relativa se asocia con `aria-describedby`. Marcar como leída / no leída y eliminar llevan el título del aviso en su nombre.',
      'Los avisos nuevos sin leer se anuncian en una región `aria-live` ("Nueva notificación: Pago recibido"), igual que marcar todas, marcar una o eliminar. Al eliminar, el foco pasa al aviso siguiente.',
    ],
    keyboard: [
      { keys: 'Enter / Espacio', action: 'En la campana, abre o cierra el panel; en un aviso, lo abre (itemClick) y lo marca como leído.' },
      { keys: 'Tab', action: 'Recorre el título, «Marcar todas», el filtro y cada aviso con sus acciones y herramientas; al salir del panel, lo cierra.' },
      { keys: 'Escape', action: 'Cierra el panel y devuelve el foco a la campana.' },
    ],
  },
  'cb-signature-pad': {
    screenReader: [
      'El área es un `role="img"` cuyo nombre dice si está vacía o firmada ("Área de firma: firmada"), con una descripción de cómo firmar. Borrar, deshacer y la primera firma se anuncian en una región `aria-live`.',
      'Una firma a mano depende del trazo, así que no se puede hacer con teclado (WCAG 2.1.1 lo exceptúa). Por eso existe el modo «Escribir»: un campo con etiqueta ("Escribe tu nombre") cuyo texto se pinta en letra manuscrita. Con `typing="false"` desaparece: hazlo solo si ofreces otra alternativa.',
      'Los modos Dibujar / Escribir son un grupo de botones con `aria-pressed`; Deshacer trazo y Borrar firma tienen nombre. Con Angular Forms, el campo del modo escrito expone `aria-invalid` y `aria-required`.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Recorre los modos, Deshacer, Borrar y, en el modo escrito, el campo del nombre.' },
      { keys: 'Enter / Espacio', action: 'Cambia de modo o pulsa Deshacer / Borrar.' },
    ],
  },
  'cb-image-cropper': {
    screenReader: [
      'El recuadro es un `role="slider"` enfocable con nombre ("Área de recorte") y su tamaño en `aria-valuetext`, en porcentaje y en los píxeles que tendrá el resultado ("50 % × 100 % de la imagen (256 × 256 píxeles)"). Las instrucciones de teclado se asocian con `aria-describedby`.',
      'Las proporciones son un grupo de botones con `aria-pressed`; girar tiene nombre. Girar y recortar se anuncian en una región `aria-live` y los errores (archivo que no es imagen, imagen sin CORS) en un `role="alert"`.',
      'Arrastrar no es la única forma de recortar (WCAG 2.5.7): todo se puede hacer con el teclado. Tras elegir un archivo o girar, el foco va al recuadro.',
    ],
    keyboard: [
      { keys: 'Flechas', action: 'Mueven el recuadro un 2 % (Ctrl + flechas, un 10 %).' },
      { keys: 'Mayús + flechas', action: 'Cambian el tamaño desde la esquina inferior derecha, respetando la proporción.' },
      { keys: 'Enter', action: 'Recorta (cropped).' },
      { keys: 'Tab', action: 'Recorre el recuadro, las proporciones, girar, Cambiar imagen y Recortar.' },
    ],
  },
  'cb-infinite-scroll': {
    screenReader: [
      'Mientras carga, el contenedor expone `aria-busy="true"`. Una región `aria-live` anuncia "Cargando más resultados…", cuántos llegaron ("12 resultados más, 36 en total", con `count`), el final y los errores.',
      'Una página que crece sin fin impide llegar al pie (WCAG 2.1.1 y 2.4.1 en la práctica): tras `autoLimit` cargas automáticas aparece "Cargar más", y `mode="button"` solo carga con él. Sin IntersectionObserver, el botón es la forma de cargar.',
      'Al cargar con el botón, el foco va al primer elemento nuevo (con `tabindex="-1"` si no es enfocable) para seguir leyendo desde ahí, en lugar de quedarse al final.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Llega a Cargar más o Reintentar al final de la lista.' },
      { keys: 'Enter / Espacio', action: 'Carga la siguiente página y lleva el foco al primer elemento nuevo.' },
    ],
  },
  'cb-masonry': {
    screenReader: [
      'No reordena nada: los elementos se quedan en el orden del DOM, que es el visual por filas, así que el teclado y el lector de pantalla los recorren como se ven (las columnas de CSS, en cambio, leen de arriba abajo cada columna). No usa `grid-auto-flow: dense`, que movería elementos.',
      'No añade roles: si es una lista, pon `role="list"` (con nombre) en `cb-masonry` y `role="listitem"` en cada elemento, o usa una lista semántica dentro de cada tarjeta.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Recorre los elementos enfocables de cada tarjeta en el orden del DOM (por filas).' },
    ],
  },
  'cb-media-player': {
    screenReader: [
      'El reproductor es un grupo con nombre ("Reproductor de vídeo: Flor al amanecer") cuya descripción enumera los atajos de teclado, y los controles, otro grupo ("Controles"). Los controles no se ocultan solos, para que se puedan encontrar sin mover el ratón.',
      'Reproducir / Pausar cambia de nombre según el estado; Silenciar, Subtítulos e Imagen en imagen son conmutadores con `aria-pressed`. Progreso y Volumen son sliders nativos que dicen su valor con palabras ("1 min 5 s de 4 min", "70 %"); Velocidad e idioma de los subtítulos son `select` nativos.',
      'Los subtítulos son pistas WebVTT del propio `<video>`; el cambio de subtítulos, velocidad y volumen con el teclado se anuncia. Para audio, la transcripción (`cbMediaTranscript`) va en un `details` bajo los controles (WCAG 1.2.1).',
    ],
    keyboard: [
      { keys: 'Espacio / K', action: 'Reproduce o pausa (en un botón, Espacio lo pulsa).' },
      { keys: 'Flecha izquierda / derecha', action: 'Retrocede o avanza 5 s; J / L, 10 s. En la barra de progreso, Re Pág / Av Pág saltan 10 s.' },
      { keys: 'Flecha arriba / abajo', action: 'Sube o baja el volumen (fuera de los sliders).' },
      { keys: '0–9 / Inicio / Fin', action: 'Saltan al 0–90 %, al principio o al final.' },
      { keys: 'M / F / C', action: 'Silencio, pantalla completa y subtítulos.' },
    ],
  },
  'cb-flow-editor': {
    screenReader: [
      'El editor es un grupo con nombre ("Editor de flujo"). Cada nodo es un botón cuyo nombre dice su tipo, su nombre, sus salidas y sus problemas ("Decisión: ¿Monto alto?. Salidas: Comité (Sí), Analista (No)"), descrito con los atajos; cada conexión es otro botón ("Conexión de Revisar a ¿Monto alto?"). El lienzo y las flechas son decorativos.',
      'Añadir, conectar, renombrar y eliminar se anuncian en una región aria-live ("Añadido: Tarea: Tarea 2", "Conectado: Revisar → Comité"). Al empezar una conexión con C se explica cómo terminarla, y si no se puede (hacia un inicio, desde un fin, repetida) se dice.',
      'La vista Lista es una alternativa sin lienzo: una lista ordenada en orden de lectura con el nombre de cada nodo en un campo con etiqueta, sus salidas con su etiqueta editable y un select para añadir conexiones. Los problemas del flujo se listan con un botón que lleva a cada nodo.',
    ],
    keyboard: [
      { keys: 'Tab / Mayús + Tab', action: 'Recorre la barra, los nodos y las conexiones.' },
      { keys: 'Flechas / Mayús + flechas', action: 'En un nodo: lo mueve un paso de la rejilla (Mayús, cuatro).' },
      { keys: 'Intro / F2', action: 'Renombra el nodo o edita la etiqueta de la conexión; en solo lectura, Intro abre el nodo. En el campo, Intro guarda y Escape cancela.' },
      { keys: 'C, luego Intro', action: 'Conecta el nodo enfocado con el que tenga el foco al pulsar Intro. Escape cancela.' },
      { keys: 'Supr', action: 'Elimina el nodo (con sus conexiones) o la conexión.' },
      { keys: '+ / − / 0', action: 'Acerca, aleja o ajusta el flujo a la vista.' },
    ],
  },
  'cb-gantt': {
    screenReader: [
      'La tabla de tareas es un `role="treegrid"` con nombre: cada fila indica su nivel (`aria-level`) y los grupos si están desplegados (`aria-expanded`); el botón de flecha tiene nombre ("Contraer Diseño").',
      'Cada barra es un botón con nombre completo: tarea, fechas, avance y de qué depende ("API de pagos: 27 oct – 7 nov, 40 % completado. Depende de Wireframes"). Los hitos y los grupos lo dicen.',
      'Arrastrar no es la única forma de editar (WCAG 2.5.7): con el teclado se mueve, se cambia el inicio, el fin y el avance, y se quitan dependencias; cada cambio se anuncia en una región `role="status"`.',
      'La escala es un grupo de botones con `aria-pressed`. Las flechas de dependencia son decorativas: la dependencia se lee en el nombre de la barra.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Recorre la barra de herramientas, la tabla y las barras del diagrama.' },
      { keys: 'Flecha izquierda / derecha', action: 'Mueve la tarea (o el grupo con sus tareas) un día.' },
      { keys: 'Mayús + flechas', action: 'Cambia la fecha de fin.' },
      { keys: 'Alt + flechas', action: 'Cambia la fecha de inicio.' },
      { keys: '+ / − (o Re Pág / Av Pág)', action: 'Sube o baja el avance un 10 %.' },
      { keys: 'Supr', action: 'Quita las dependencias de la tarea.' },
      { keys: 'Enter', action: 'Abre la tarea (taskOpen).' },
    ],
  },
  'cb-dynamic-form': {
    screenReader: [
      'Cada campo tiene su etiqueta visible enlazada: `<label for>` en los campos de texto y `aria-labelledby` o `aria-label` en listas, opciones, deslizadores y valoraciones. Los obligatorios llevan el validador `required` y el asterisco es decorativo.',
      'En los campos de texto, número, fecha y área de texto, la ayuda y el error se asocian con `aria-describedby` y el control queda `aria-invalid`; en el resto, el error se anuncia con `role="alert"`. El error aparece al salir del campo, al cambiarlo o al intentar enviar.',
      'Al enviar con errores aparece arriba un resumen con `role="alert"` que recibe el foco y lista cada campo con su error; cada elemento es un enlace que lleva el foco a ese campo.',
      'Cada sección es un `fieldset` con su título como `legend`. Los campos ocultos por una condición se quitan del DOM (no se leen ni se validan) y los deshabilitados se anuncian como tales.',
      'Las columnas y la disposición horizontal no cambian el orden de lectura ni de tabulación: siguen el orden del esquema, y en contenedores estrechos todo pasa a una columna con la etiqueta encima.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Recorre los campos en el orden del esquema y después los botones.' },
      { keys: 'Enter', action: 'En un campo de texto, envía el formulario.' },
      { keys: 'Enter (resumen)', action: 'En un enlace del resumen de errores, lleva el foco a ese campo.' },
    ],
  },
  'cb-data-grid': {
    screenReader: [
      'Es una tabla con `role="grid"`, cabeceras de columna (`th scope="col"`) y de fila (el número de fila); `aria-rowcount` y `aria-colcount` dicen su tamaño y cada celda su posición.',
      'Hay un único punto de tabulación: la celda activa (`tabindex="0"`); las flechas mueven el foco entre celdas. Las celdas seleccionadas llevan `aria-selected` y las de solo lectura, `aria-readonly`.',
      'Las celdas con error llevan `aria-invalid` y el mensaje en texto oculto ("Obligatorio."); el editor muestra el error con `role="alert"`. La barra dice cuántos errores hay y su botón lleva al primero.',
      'Las casillas se leen como "Sí" o "No". Cada edición, pegado, borrado, alta o baja y cada deshacer se anuncia en una región `role="status"`.',
      'Las instrucciones de teclado están en el grid con `aria-describedby`. Las cabeceras ordenables son botones con `aria-sort`.',
    ],
    keyboard: [
      { keys: 'Flechas', action: 'Mueve la celda activa (Ctrl + flecha, al extremo).' },
      { keys: 'Mayús + flechas', action: 'Amplía la selección.' },
      { keys: 'Inicio / Fin', action: 'Primera o última columna (con Ctrl, primera o última celda).' },
      { keys: 'Enter / F2', action: 'Edita la celda (en una casilla, la marca o desmarca).' },
      { keys: 'Escribir', action: 'Empieza a editar reemplazando el valor.' },
      { keys: 'Enter / Tab', action: 'Al editar, confirma y pasa a la celda de abajo o de la derecha.' },
      { keys: 'Escape', action: 'Cancela la edición.' },
      { keys: 'Supr', action: 'Borra la selección.' },
      { keys: 'Ctrl + C / X / V', action: 'Copia, corta y pega (en formato de Excel y Google Sheets).' },
      { keys: 'Ctrl + Z / Y', action: 'Deshace y rehace.' },
      { keys: 'Ctrl + D', action: 'Rellena hacia abajo con la primera fila de la selección.' },
      { keys: 'Mayús + Espacio', action: 'Selecciona la fila.' },
      { keys: 'Ctrl + A', action: 'Selecciona todo.' },
    ],
  },
  'cb-scheduler': {
    screenReader: [
      'El título del periodo ("20 – 26 oct 2026") se anuncia al cambiar con `aria-live="polite"`. Anterior y Siguiente son botones con nombre y las vistas, botones con `aria-pressed`.',
      'Cada evento es un botón con su nombre completo: título, día, hora y lugar ("Comité de crédito, jueves 23 de octubre, 09:00 – 10:30, Sala 3"); los de día completo lo dicen.',
      'El mes es un `role="grid"` con cabeceras de día; cada número de día es un botón que abre ese día y "+2 más" dice cuántos eventos y de qué día son.',
      'Crear y mover no dependen del ratón (WCAG 2.5.7): cada día tiene un botón "Nuevo evento el…" y los eventos se mueven y cambian de duración con el teclado; cada cambio se anuncia en una región `role="status"`.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Recorre la barra, los días y los eventos.' },
      { keys: 'Enter', action: 'En un evento, lo abre (eventOpen); en un día, abre su vista.' },
      { keys: 'Flecha izquierda / derecha', action: 'Mueve el evento un día.' },
      { keys: 'Flecha arriba / abajo', action: 'Mueve el evento una franja (en el mes y en la franja de día completo, una semana).' },
      { keys: 'Mayús + flecha arriba / abajo', action: 'Acorta o alarga el evento una franja.' },
    ],
  },
  'cb-kanban': {
    screenReader: [
      'Cada columna es una región nombrada por su título, con una lista de tarjetas. Cada tarjeta es enfocable, se describe como "tarjeta" y lleva las instrucciones de teclado (`aria-describedby`).',
      'Arrastrar no es la única forma de mover: con el teclado se toma, se mueve y se suelta (WCAG 2.5.7), y cada paso se anuncia en una región `role="status"` (columna y posición).',
      'Si la plantilla de tarjeta lleva botones o enlaces, usa `cardOpen` para abrir un detalle en lugar de anidar controles dentro de la tarjeta.',
      'El menú de cada tarjeta y el de cada columna son botones con nombre ("Acciones de Diseño") que abren un `menu`; el botón es hermano de la tarjeta, no está dentro de ella. "Mover a" permite mover sin arrastrar.',
      'Editar, añadir, renombrar y confirmar eliminación usan campos y botones con etiqueta; el foco va al campo al abrirlos y vuelve a la tarjeta (o al botón de origen) al cerrar. Cada cambio se anuncia en la región `role="status"`.',
      'Con `details`, la tarjeta indica que abre un diálogo (`aria-haspopup="dialog"`). El panel es un `dialog` modal con el foco atrapado; cada campo tiene etiqueta y, al cerrarlo, el foco vuelve a la tarjeta aunque haya cambiado de columna.',
      'En la tarjeta, la prioridad, las fechas (y si está vencida), los adjuntos y los responsables se leen con texto: los avatares son decorativos y llevan los nombres en texto oculto.',
      'Los adjuntos se añaden con un botón (el arrastre de archivos es opcional) y cada uno tiene su botón "Quitar" con nombre.',
      'La lista (cb-kanban-list) es una tabla con cabeceras de columna; cada sección es un grupo de filas (`th scope="rowgroup"`) con un botón que la contrae (`aria-expanded`) y dice cuántas tareas tiene.',
      'En la lista, el círculo es un botón conmutador (`aria-pressed`) con nombre ("Marcar «Diseño» como finalizada") y el nombre de la tarea es el botón que abre el detalle. Una tarea sin responsable lo dice con texto.',
      'En el calendario (cb-kanban-calendar) cada semana es un grupo con nombre ("Semana del 9 al 15 mar") y cada tarea un botón que dice su nombre, fechas, prioridad, responsables y columna. Arrastrar no es la única forma de cambiar las fechas: Alt + flechas lo hace con el teclado y el cambio se anuncia.',
      'Cada día tiene un botón "Añadir tarea el miércoles, 20 de marzo de 2030" y el mes visible se anuncia al cambiarlo con ‹ ›.',
      'En el cronograma (cb-kanban-timeline) cada sección es un grupo con nombre ("En curso, 2 tareas") y un botón que la contrae; cada tarea es un botón con su nombre, fechas, prioridad, responsables y sección. La cabecera de días es decorativa: el rango visible se dice con texto y se anuncia al cambiarlo.',
      'Arrastrar la barra o sus bordes no es la única forma de cambiar fechas o sección: Alt + flechas lo hace con el teclado y cada cambio se anuncia. Los botones del zoom tienen nombre ("Acercar", "Alejar") y se desactivan en los extremos.',
      'El panel (cb-kanban-dashboard) es una región con nombre ("Panel del proyecto"). Cada bloque es una sección nombrada por su título, que es un encabezado (`headingLevel`, 3 por defecto); los indicadores se leen como texto y el color de "con retraso" no es la única señal.',
      'Cada gráfico lleva su título como nombre y, como todos los `cb-chart`, una tabla oculta con los datos; sus barras y sectores se recorren con el teclado.',
      'En el espacio de trabajo (cb-kanban-workspace) las vistas son botones conmutadores (`aria-pressed`) en un grupo con nombre ("Vistas"), porque varias pueden estar encendidas a la vez; un texto oculto lo explica. Con `multiple = false` también son conmutadores, con una sola encendida.',
      'Con varias vistas, cada una es una sección con un encabezado ("Lista", `headingLevel`) y un botón "Ocultar Lista"; al ocultarla, el foco vuelve a su botón. "Lado a lado" es otro conmutador y en pantallas estrechas las vistas vuelven a apilarse.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Recorre las tarjetas y los botones Añadir tarjeta.' },
      { keys: 'Espacio', action: 'Toma la tarjeta; con ella tomada, la suelta.' },
      { keys: 'Flechas arriba / abajo', action: 'Mueve la tarjeta tomada dentro de la columna.' },
      { keys: 'Flechas izquierda / derecha', action: 'Lleva la tarjeta tomada a la columna anterior o siguiente.' },
      { keys: 'Escape', action: 'Cancela el movimiento y la devuelve a su sitio.' },
      { keys: 'Enter', action: 'Abre la tarjeta (cardOpen) y, con details, su panel de detalle.' },
      { keys: 'Escape (en el panel)', action: 'Cierra el panel de detalle y devuelve el foco a la tarjeta.' },
      { keys: 'F2', action: 'Edita el título de la tarjeta (editable). Enter guarda, Escape cancela.' },
      { keys: 'Supr', action: 'Pide confirmar la eliminación de la tarjeta (editable).' },
      { keys: 'Alt + flecha arriba / abajo (lista)', action: 'Mueve la tarea en la lista; en el borde pasa a la sección vecina.' },
      { keys: 'Alt + flechas (calendario)', action: 'Izquierda / derecha mueven la tarea un día; arriba / abajo, una semana. El calendario sigue a la tarea si cambia de mes.' },
      { keys: 'Alt + izquierda / derecha (cronograma)', action: 'Mueve la tarea un día (mantiene la duración). El cronograma sigue a la tarea si sale del rango.' },
      { keys: 'Alt + Mayús + izquierda / derecha (cronograma)', action: 'Adelanta o atrasa la fecha de fin (nunca antes del inicio).' },
      { keys: 'Alt + flecha arriba / abajo (cronograma)', action: 'Pasa la tarea a la sección anterior o siguiente.' },
    ],
  },
  'cb-mentions': {
    screenReader: [
      'El campo es un textarea con etiqueta y `aria-autocomplete="list"`; mientras hay sugerencias controla la lista (`aria-controls`) y marca la activa con `aria-activedescendant`, así el foco no sale del texto.',
      'El número de sugerencias se anuncia en una región `role="status"`. Los avatares son decorativos.',
    ],
    keyboard: [
      { keys: '@ (o el disparador)', action: 'Abre las sugerencias junto al cursor.' },
      { keys: 'Flecha arriba / abajo', action: 'Mueve la sugerencia activa.' },
      { keys: 'Enter / Tab', action: 'Inserta la mención elegida.' },
      { keys: 'Escape', action: 'Cierra las sugerencias.' },
    ],
  },
  'cb-descriptions': {
    screenReader: [
      'Usa una lista de descripción nativa (`dl`, `dt`, `dd`), así cada valor se lee junto a su etiqueta. El título es un encabezado (`headingLevel`) que nombra la lista.',
    ],
  },
  'cb-result': {
    screenReader: [
      'El título es un encabezado (`headingLevel`, 2 por defecto) y el icono o el código HTTP son decorativos. Si el resultado aparece sin cambiar de página, mueve el foco al título o anúncialo con un Toast.',
    ],
  },
  'cb-statistic': {
    screenReader: [
      'La tendencia no depende solo del color: incluye el texto "aumenta" / "disminuye" para lectores de pantalla. `cb-countdown` es un `role="timer"`: no anuncia cada segundo, pero el valor se puede consultar.',
    ],
  },
  'cbKeyFilter': {
    screenReader: [
      'Solo restringe lo que se escribe; no sustituye a la validación. Indica el formato esperado en la etiqueta o en un texto de ayuda y usa el `inputmode` adecuado (numeric, decimal, email) para mostrar el teclado correcto en móviles.',
    ],
  },
  'cb-anchor': {
    screenReader: [
      'Es una `nav` nombrada ("En esta página") con listas de enlaces; la sección visible se marca con `aria-current="location"`.',
      'Al elegir un enlace, el foco pasa a la sección de destino (con `tabindex="-1"`), así el lector continúa leyendo desde ahí.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Recorre los enlaces del índice.' },
      { keys: 'Enter', action: 'Va a la sección y le pasa el foco.' },
    ],
  },
  'cb-repeater': {
    screenReader: [
      'Cada elemento es un `role="group"` nombrado ("Beneficiario 2") con su botón "Quitar Beneficiario 2". Al agregar o quitar, una región viva lo anuncia.',
      'Al agregar, el foco pasa al primer campo del elemento nuevo; al quitar, al elemento anterior (o al botón de agregar si no queda ninguno).',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Recorre los campos, los botones de quitar y el de agregar.' },
      { keys: 'Enter / Espacio', action: 'Agrega o quita un elemento.' },
    ],
  },
  'cb-theme-toggle': {
    screenReader: [
      'Es un botón cuyo nombre describe la acción ("Cambiar a tema oscuro" / "Cambiar a tema claro") y cambia tras pulsarlo; el icono es decorativo.',
    ],
    keyboard: [{ keys: 'Enter / Espacio', action: 'Cambia de tema.' }],
  },
  'cb-dynamic-dialog': {
    screenReader: [
      'El panel tiene `role="dialog"` con `aria-modal="true"` y se nombra con `header` (`aria-labelledby`) o, si no hay título, con `ariaLabel` de la configuración.',
      'Al abrirse, el foco queda atrapado dentro del diálogo; al cerrarse vuelve al elemento que lo abrió.',
    ],
    keyboard: [
      { keys: 'Tab / Mayús + Tab', action: 'Mueve el foco entre los elementos del diálogo sin salir de él.' },
      { keys: 'Escape', action: 'Cierra el diálogo (si `closeOnEscape` no es false).' },
    ],
  },
  'cb-virtualscroller': {
    screenReader: [
      'La lista tiene `role="list"` y su nombre se define con `ariaLabel`. Aunque solo se pintan los elementos visibles, cada uno expone `aria-setsize` (el total) y `aria-posinset` (su posición real).',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Mueve el foco a la lista.' },
      { keys: 'Flecha abajo / Flecha arriba / Re Pág / Av Pág', action: 'Desplaza la lista.' },
    ],
  },
  // --- Tanda 1 (22.4): formularios y menús ---
  'cb-button': {
    screenReader: [
      'Renderiza un `button` nativo, que se anuncia como botón con su texto. Un botón de solo icono necesita `ariaLabel`, porque el icono es decorativo (`aria-hidden`).',
      'Con `loading` el botón se deshabilita y expone `aria-busy="true"`. Si abre algo (un menú, un diálogo), `ariaHaspopup`, `ariaExpanded` y `ariaControls` lo indican al lector de pantalla.',
    ],
    keyboard: [TAB_FOCUS('al botón'), { keys: 'Enter / Espacio', action: 'Activa el botón.' }],
  },
  'cb-chips': {
    screenReader: [
      'Los valores se escriben en un campo de texto nativo; sin etiqueta visible, define `ariaLabel`. Con Angular Forms, `aria-invalid` y `aria-required` siguen al estado del control.',
      'Cada valor tiene un botón para quitarlo con nombre propio ("Quitar React"); el icono es decorativo.',
    ],
    keyboard: [
      TAB_FOCUS('al campo y a los botones de quitar'),
      { keys: 'Enter / ,', action: 'Añade lo escrito como un valor nuevo.' },
      { keys: 'Retroceso', action: 'Con el campo vacío, quita el último valor.' },
    ],
  },
  'cb-colorpicker': {
    screenReader: [
      'El disparador es un botón con `aria-haspopup="dialog"` y `aria-expanded`; su nombre incluye el color actual ("Color: #10b981") y se cambia con `ariaLabel`.',
      'El panel es un `role="dialog"` nombrado. El área de saturación y brillo y la barra de tono son `role="slider"`: el área anuncia su valor como texto ("Saturación 84 %, brillo 71 %") y el tono en grados. El campo hexadecimal y los colores predefinidos tienen nombre.',
    ],
    keyboard: [
      { keys: 'Enter / Espacio', action: 'Abre el panel; el foco pasa al área de color.' },
      { keys: 'Flecha izquierda / Flecha derecha', action: 'En el área, cambia la saturación; en la barra de tono, el tono.' },
      { keys: 'Flecha arriba / Flecha abajo', action: 'En el área, cambia el brillo; en la barra de tono, el tono.' },
      { keys: 'Mayús + flechas', action: 'Cambia el valor de 10 en 10.' },
      { keys: 'Inicio / Fin', action: 'En la barra de tono, va al primer o al último tono.' },
      { keys: 'Tab / Mayús + Tab', action: 'Recorre el panel; al salir de él se cierra y el foco vuelve al botón.' },
      { keys: 'Escape', action: 'Cierra el panel y devuelve el foco al botón.' },
    ],
  },
  'cb-file-upload': {
    screenReader: [
      'Los botones Elegir archivo, Subir y Limpiar son botones nativos con texto. El selector de archivos es el nativo del sistema, que se abre desde el botón.',
      'Los archivos descartados por tamaño o tipo se anuncian en una lista `role="alert"`, y cada archivo de la lista tiene un botón con nombre para quitarlo ("Quitar informe.pdf"). Arrastrar archivos es opcional: todo se puede hacer con los botones.',
    ],
    keyboard: [TAB_FOCUS('a los botones y a los de quitar archivo'), { keys: 'Enter / Espacio', action: 'Abre el selector de archivos, sube o limpia la lista.' }],
  },
  'cb-float-label': {
    screenReader: [
      'La etiqueta flotante es un `label` normal: asócialo al campo con `for` e `id` (`inputId` en los componentes de CaribeNG) para que el lector de pantalla la anuncie. Subirla o bajarla es solo visual.',
      'No uses el placeholder como única etiqueta: desaparece al escribir y no todos los lectores lo anuncian.',
    ],
  },
  'cb-icon-field': {
    screenReader: [
      'El icono (`cb-input-icon`) es decorativo (`aria-hidden="true"`): el campo necesita su propia etiqueta o `aria-label`. Si el icono hace algo (buscar, limpiar), usa un botón con nombre en lugar de un icono.',
    ],
    keyboard: [TAB_FOCUS('al campo')],
  },
  'cb-input-group': {
    screenReader: [
      'Solo agrupa visualmente: cada control proyectado (campo, botón) conserva su propio rol y nombre. Los addons de texto ("€", "https://") no forman parte de la etiqueta; si el campo los necesita para entenderse, inclúyelos en su `aria-label` o en el texto de ayuda.',
    ],
    keyboard: [TAB_FOCUS('a cada control del grupo, en orden')],
  },
  'cb-input-mask': {
    screenReader: [
      'Es un campo de texto nativo: asócialo a su etiqueta con `inputId` (`<label for>`) o, sin etiqueta visible, define `ariaLabel`. Con Angular Forms, `aria-invalid` y `aria-required` siguen al estado del control.',
      'La máscara se muestra como placeholder ("(999) 999-9999") y los literales se insertan al escribir. Explica el formato esperado en un texto de ayuda: el placeholder desaparece al escribir.',
    ],
    keyboard: [TAB_FOCUS('al campo'), { keys: 'Retroceso', action: 'Borra el último carácter, también los literales de la máscara.' }],
  },
  'cb-knob': {
    screenReader: [
      'El control tiene `role="slider"` con `aria-valuemin`, `aria-valuemax` y `aria-valuenow`, y su nombre se define con `ariaLabel`. Deshabilitado, sale del orden de tabulación y expone `aria-disabled`.',
    ],
    keyboard: [
      TAB_FOCUS('al control'),
      { keys: 'Flecha derecha / Flecha arriba', action: 'Aumenta el valor un paso (`step`).' },
      { keys: 'Flecha izquierda / Flecha abajo', action: 'Disminuye el valor un paso.' },
      { keys: 'Inicio / Fin', action: 'Va al valor mínimo o al máximo.' },
    ],
  },
  'cb-password': {
    screenReader: [
      'Es un campo `type="password"` nativo; asócialo a su etiqueta con `inputId`. El botón de mostrar es un conmutador (`aria-pressed`) con nombre: "Mostrar contraseña" u "Ocultar contraseña".',
      'Con `feedback`, la fortaleza ("Fortaleza: Media") se anuncia en una región `role="status"` mientras se escribe; las barras de color son decorativas.',
    ],
    keyboard: [TAB_FOCUS('al campo y al botón de mostrar'), { keys: 'Enter / Espacio', action: 'En el botón, muestra u oculta la contraseña.' }],
  },
  'cb-togglebutton': {
    screenReader: [
      'Es un botón conmutador: `aria-pressed` indica si está activo. El texto del botón es su nombre; con solo icono, define `ariaLabel`.',
    ],
    keyboard: [TAB_FOCUS('al botón'), { keys: 'Enter / Espacio', action: 'Cambia el estado.' }],
  },
  'cb-breadcrumb': {
    screenReader: [
      'Es un `nav` nombrado ("Ruta de navegación") con una lista ordenada. Cada nivel es un enlace, salvo el último, que es texto con `aria-current="page"`. Los separadores y los iconos son decorativos.',
    ],
    keyboard: [TAB_FOCUS('a cada enlace'), { keys: 'Enter', action: 'Sigue el enlace.' }],
  },
  'cb-dock': {
    screenReader: [
      'Es un `nav` nombrado ("Dock de la aplicación", o `ariaLabel`) que contiene una barra `role="toolbar"` con `aria-orientation` según la posición. Cada acción es un enlace o un botón con nombre (`label`), porque solo muestra el icono.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Entra en la barra por la última acción enfocada; un solo Tab la atraviesa.' },
      { keys: 'Flecha derecha / Flecha izquierda', action: 'Pasa a la acción siguiente o anterior (de forma circular) en un dock horizontal.' },
      { keys: 'Flecha abajo / Flecha arriba', action: 'Igual, en un dock vertical (posición `left` o `right`).' },
      { keys: 'Inicio / Fin', action: 'Va a la primera o a la última acción.' },
      { keys: 'Enter', action: 'Activa la acción enfocada.' },
    ],
  },
  'cb-menubar': {
    screenReader: [
      'Es un `nav` nombrado ("Navegación principal", o `ariaLabel`) con una barra `role="menubar"`. Cada entrada es un `role="menuitem"`; las que tienen submenú indican `aria-haspopup="menu"` y `aria-expanded`, y el submenú es un `role="menu"` nombrado por su entrada.',
    ],
    keyboard: [
      { keys: 'Flecha derecha / Flecha izquierda', action: 'En la barra, pasa a la entrada siguiente o anterior (de forma circular) y cierra el submenú abierto.' },
      { keys: 'Inicio / Fin', action: 'Va a la primera o a la última entrada de la barra.' },
      { keys: 'Flecha abajo', action: 'En una entrada con submenú, lo abre y enfoca su primera opción.' },
      { keys: 'Flecha abajo / Flecha arriba', action: 'Dentro del submenú, recorre las opciones (de forma circular).' },
      { keys: 'Enter / Espacio', action: 'Abre el submenú o activa la opción.' },
      { keys: 'Escape', action: 'Cierra el submenú y devuelve el foco a su entrada.' },
    ],
  },
  'cb-panelmenu': {
    screenReader: [
      'Es un `nav` nombrado ("Menú de paneles", o `ariaLabel`). Cada grupo se abre con un botón que indica `aria-expanded` y apunta a su lista con `aria-controls`; las opciones son enlaces o botones normales.',
    ],
    keyboard: [
      TAB_FOCUS('a cada grupo y a las opciones de los grupos abiertos'),
      { keys: 'Enter / Espacio', action: 'Abre o cierra el grupo, o activa la opción.' },
    ],
  },
  'cb-speed-dial': {
    screenReader: [
      'El botón principal tiene nombre ("Abrir acciones" / "Cerrar acciones", o `openLabel` y `closeLabel`) y `aria-expanded`. Las acciones solo existen mientras está abierto; cada una es un botón con nombre (`label`), porque solo muestra el icono.',
    ],
    keyboard: [
      TAB_FOCUS('al botón principal y, abierto, a cada acción'),
      { keys: 'Enter / Espacio', action: 'Abre o cierra las acciones, o activa la acción enfocada.' },
    ],
  },
  'cb-steps': {
    screenReader: [
      'Es un `nav` nombrado ("Pasos", o `ariaLabel`) con una lista ordenada. Cada paso es un botón con su nombre; el paso actual expone `aria-current="step"` y los deshabilitados no se pueden activar. Los conectores son decorativos.',
    ],
    keyboard: [TAB_FOCUS('a cada paso'), { keys: 'Enter / Espacio', action: 'Va al paso enfocado.' }],
  },
  'cb-tabmenu': {
    screenReader: [
      'Es un `nav` nombrado ("Navegación de secciones", o `ariaLabel`): navega entre páginas, así que usa enlaces o botones y no el patrón de pestañas. La opción actual expone `aria-current="page"`; las deshabilitadas salen del orden de tabulación.',
    ],
    keyboard: [TAB_FOCUS('a cada opción'), { keys: 'Enter', action: 'Abre la sección.' }],
  },
  'cb-tieredmenu': {
    screenReader: [
      'El botón que lo abre indica `aria-haspopup="menu"` y `aria-expanded`. El panel es un `role="menu"` nombrado (`ariaLabel`) con `role="menuitem"` en cada opción; las que abren otro nivel indican `aria-haspopup="menu"` y `aria-expanded`, y cada submenú se nombra por su opción.',
    ],
    keyboard: [
      { keys: 'Enter / Espacio / Flecha abajo', action: 'En el botón, abre el menú y enfoca la primera opción.' },
      { keys: 'Flecha abajo / Flecha arriba', action: 'Recorre las opciones del nivel (de forma circular, sin pasar por las deshabilitadas).' },
      { keys: 'Inicio / Fin', action: 'Va a la primera o a la última opción del nivel.' },
      { keys: 'Flecha derecha / Enter / Espacio', action: 'En una opción con submenú, lo abre y enfoca su primera opción.' },
      { keys: 'Flecha izquierda', action: 'Cierra el submenú y vuelve a la opción que lo abrió.' },
      { keys: 'Enter / Espacio', action: 'Activa la opción y cierra el menú.' },
      { keys: 'Escape / Tab', action: 'Cierra el menú y devuelve el foco al botón.' },
    ],
  },
  // --- Tanda 2 (22.4): panel, layout y datos ---
  'cb-accordion': {
    screenReader: [
      'Cada panel tiene un encabezado `h3` con un botón que indica `aria-expanded`. Abierto, el contenido es un `role="region"` nombrado por su encabezado y el botón apunta a él con `aria-controls`. Los paneles deshabilitados no se pueden abrir.',
      'Con `multiple` se pueden abrir varios a la vez; si no, abrir uno cierra el anterior.',
    ],
    keyboard: [TAB_FOCUS('al encabezado de cada panel'), { keys: 'Enter / Espacio', action: 'Abre o cierra el panel.' }],
  },
  'cb-card': {
    screenReader: [
      'Es un contenedor sin rol propio. El título (`header`) es un encabezado `h3` y el subtítulo un párrafo, así que la tarjeta aparece en la lista de encabezados del lector de pantalla.',
      'Si toda la tarjeta lleva a un sitio, pon un enlace en el título en lugar de hacer pulsable el contenedor, para que tenga un nombre corto.',
    ],
  },
  'cb-divider': {
    screenReader: [
      'Tiene `role="separator"` con `aria-orientation`. El texto dentro del separador es decorativo para muchos lectores de pantalla: si la etiqueta importa, ponla también fuera (por ejemplo, como encabezado de la sección).',
    ],
  },
  'cb-fieldset': {
    screenReader: [
      'Usa `fieldset` y `legend` nativos, de modo que la leyenda nombra el grupo de campos y se anuncia al entrar en él.',
      'Con `toggleable`, la leyenda contiene un botón con `aria-expanded`; abierto, el contenido es un `role="region"` nombrado por la leyenda y el botón apunta a él con `aria-controls`.',
    ],
    keyboard: [TAB_FOCUS('al botón de la leyenda (con toggleable) y a los campos'), { keys: 'Enter / Espacio', action: 'Abre o cierra el contenido.' }],
  },
  'cb-panel': {
    screenReader: [
      'El contenido es un `role="region"` nombrado por el título (`header`). Con `toggleable`, el botón de plegar indica `aria-expanded`, se nombra con el título y apunta al contenido con `aria-controls` mientras está abierto.',
      'El título no es un encabezado: si el panel abre una sección de la página, pon un encabezado dentro o antes de él.',
    ],
    keyboard: [TAB_FOCUS('a las acciones de la cabecera y al botón de plegar'), { keys: 'Enter / Espacio', action: 'Pliega o despliega el contenido.' }],
  },
  'cb-scroll-panel': {
    screenReader: [
      'El área es un `role="region"` enfocable (`tabindex="0"`) con nombre ("Área desplazable", o `ariaLabel`), para que quien usa teclado pueda desplazar su contenido.',
    ],
    keyboard: [
      TAB_FOCUS('al área'),
      { keys: 'Flecha abajo / Flecha arriba / Re Pág / Av Pág', action: 'Desplaza el contenido.' },
      { keys: 'Inicio / Fin', action: 'Va al principio o al final del contenido.' },
    ],
  },
  'cb-scroll-top': {
    screenReader: [
      'Es un botón con nombre ("Volver arriba", o `ariaLabel`); el icono es decorativo. Solo existe a partir del umbral (`threshold`), así que no aparece en el orden de tabulación arriba de la página.',
      'Con "reducir movimiento" activado en el sistema, el desplazamiento es instantáneo aunque `behavior` sea `smooth`.',
    ],
    keyboard: [TAB_FOCUS('al botón'), { keys: 'Enter / Espacio', action: 'Vuelve al principio.' }],
  },
  'cb-splitter': {
    screenReader: [
      'Cada barra entre paneles es un `role="separator"` enfocable con nombre ("Redimensionar paneles"), `aria-orientation` y el tamaño del panel anterior en `aria-valuenow` (en %), entre `aria-valuemin` y `aria-valuemax`.',
    ],
    keyboard: [
      TAB_FOCUS('a cada barra'),
      { keys: 'Flecha izquierda / Flecha derecha', action: 'En un splitter horizontal, cambia el tamaño un paso (`step`, 5 % por defecto).' },
      { keys: 'Flecha arriba / Flecha abajo', action: 'Igual, en un splitter vertical.' },
      { keys: 'Inicio / Fin', action: 'Lleva el panel a su tamaño mínimo o al máximo.' },
    ],
  },
  'cb-stepper': {
    screenReader: [
      'Los pasos forman una lista ordenada de botones. Cada uno se nombra con su posición y su etiqueta ("Paso 2 de 3: Perfil"), añade "completado" a los que ya pasaron, y el actual expone `aria-current="step"`.',
      'Solo se muestra el contenido del paso actual. Los botones Atrás y Siguiente se desactivan en el primer y en el último paso.',
    ],
    keyboard: [
      TAB_FOCUS('a cada paso, al contenido y a Atrás / Siguiente'),
      { keys: 'Enter / Espacio', action: 'Va al paso enfocado o pulsa Atrás / Siguiente.' },
    ],
  },
  'cb-toolbar': {
    screenReader: [
      'El contenedor tiene `role="toolbar"` con nombre ("Barra de herramientas", o `ariaLabel`); si hay varias en la página, dale a cada una un nombre distinto. Los controles proyectados conservan su rol y su nombre.',
    ],
    keyboard: [TAB_FOCUS('a cada control de la barra, en orden')],
  },
  'cb-dataview': {
    screenReader: [
      'Los elementos forman un `role="list"` en las dos vistas. Con `showLayoutToggle`, el cambio de vista es un grupo nombrado ("Cambiar vista") de dos conmutadores (`aria-pressed`): "Vista de lista" y "Vista de cuadrícula".',
      'En la plantilla por defecto, el botón de cada elemento se nombra con él ("Seleccionar Producto 1") e indica con `aria-pressed` si está elegido. Con `rows`, la paginación es un `cb-paginator`.',
    ],
    keyboard: [TAB_FOCUS('al cambio de vista, a los botones de cada elemento y a la paginación'), { keys: 'Enter / Espacio', action: 'Cambia la vista o elige el elemento.' }],
  },
  'cb-organization-chart': {
    screenReader: [
      'El organigrama es un grupo nombrado ("Organigrama", o `ariaLabel`) de listas anidadas: cada nivel es una lista dentro del nodo del que depende, así que el lector de pantalla anuncia cuántos nodos tiene y en qué nivel está.',
      'Cada nodo es un botón con nombre ("Seleccionar Ingeniería") que indica con `aria-pressed` si está elegido. Los que tienen hijos tienen además un botón "Expandir …" / "Contraer …" con `aria-expanded`.',
    ],
    keyboard: [
      TAB_FOCUS('a cada nodo y a su botón de expandir'),
      { keys: 'Enter / Espacio', action: 'Elige el nodo, o expande o contrae sus hijos.' },
    ],
  },
  'cb-paginator': {
    screenReader: [
      'Es una región `role="navigation"` nombrada ("Paginación"). Los botones de primera, anterior, siguiente y última página tienen nombre, y se desactivan cuando no hay adónde ir; la página actual expone `aria-current="page"`.',
      'El selector de filas por página es un `select` nativo con nombre ("Registros por página").',
    ],
    keyboard: [
      TAB_FOCUS('a cada botón y al selector de filas'),
      { keys: 'Enter / Espacio', action: 'Va a la página.' },
      { keys: 'Flecha abajo / Flecha arriba', action: 'En el selector, cambia las filas por página.' },
    ],
  },
  'cb-timeline': {
    screenReader: [
      'Es una lista ordenada con nombre ("Cronología", o `ariaLabel`): cada evento es un elemento de la lista, en orden. Los marcadores y los conectores son decorativos, así que el color o el icono de un evento no debe ser la única forma de transmitir su estado.',
    ],
  },
  // --- Tanda 3 (22.4): mensajes, varios y directivas ---
  '[cbAnimateOnScroll]': {
    screenReader: [
      'Solo cambia clases CSS: no añade roles ni oculta nada a los lectores de pantalla, que leen el contenido aunque todavía no haya entrado en pantalla.',
      'Envuelve la animación de tus clases en `@media (prefers-reduced-motion: no-preference)` para respetar a quien pide reducir movimiento.',
    ],
  },
  '[cbAutoFocus]': {
    screenReader: [
      'Enfoca el elemento al montarse, y el lector de pantalla lo anuncia. Úsalo cuando el foco tenga un destino claro (el primer campo de un diálogo o de un formulario recién abierto), no al cargar la página: saltarse el contenido anterior desorienta.',
      'El elemento tiene que poder recibir el foco: un control nativo o un elemento con `tabindex="-1"`.',
    ],
  },
  'cb-avatar': {
    screenReader: [
      'Con `ariaLabel`, el avatar es un `role="img"` con ese nombre (la imagen interna lleva `alt=""` para no repetirlo). Sin él, las iniciales (`label`) se leen tal cual, y el icono o la imagen se ignoran.',
      'Si el nombre de la persona ya aparece al lado, no pongas `ariaLabel`: se leería dos veces.',
    ],
  },
  'cb-avatar-group': {
    screenReader: [
      'Es un `role="group"`: nómbralo con `ariaLabel` ("Participantes"). Si incluyes un avatar de recuento ("+3"), dale un `ariaLabel` como "3 más".',
    ],
  },
  'cb-badge': {
    screenReader: [
      'Sin `ariaLabel` se lee el valor tal cual ("8"), que fuera de contexto dice poco: dale un `ariaLabel` como "8 mensajes sin leer", o incluye el contexto en el nombre del control al que acompaña.',
      'Con `dot` y sin `ariaLabel` es decorativo (`aria-hidden`). El color nunca debe ser la única forma de transmitir el estado.',
    ],
  },
  'cb-chip': {
    screenReader: [
      'La etiqueta se lee como texto; el icono es decorativo y la imagen lleva `alt=""`. Con `removable`, el botón de quitar se nombra con la etiqueta ("Quitar Angular").',
      'Al quitar el chip, su botón desaparece: en `(removed)`, mueve el foco a un elemento cercano para que no se pierda.',
    ],
    keyboard: [
      TAB_FOCUS('al botón de quitar'),
      { keys: 'Enter / Espacio', action: 'Quita el chip.' },
    ],
  },
  'cb-file-card': {
    screenReader: [
      'El título es texto; con `clickable` es un botón que emite `open`. El icono es decorativo.',
      'Con `actions`, el botón de acciones se nombra con el título ("Más acciones: informe.pdf"), indica `aria-haspopup="menu"` y `aria-expanded`, y abre un `cb-menu`; al cerrarlo, el foco vuelve al botón.',
    ],
    keyboard: [
      TAB_FOCUS('al título (con clickable) y al botón de acciones'),
      { keys: 'Enter / Espacio', action: 'Abre el archivo o el menú de acciones.' },
      { keys: 'Flecha abajo', action: 'En el botón de acciones, abre el menú y enfoca la primera opción.' },
      { keys: 'Escape', action: 'Cierra el menú.' },
    ],
  },
  '[cbFocusTrap]': {
    screenReader: [
      'Mantiene Tab y Mayús + Tab dentro del contenedor. No mueve el foco al activarse ni lo devuelve al desactivarse: hazlo tú (por ejemplo, con `cbAutoFocus` al abrir y enfocando el disparador al cerrar).',
      'Úsalo solo en capas modales y ofrece siempre una salida con teclado (un botón de cerrar o Escape). `cbFocusTrapDisabled` lo desactiva.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Pasa al siguiente elemento; desde el último, vuelve al primero.' },
      { keys: 'Mayús + Tab', action: 'Pasa al anterior; desde el primero, va al último.' },
    ],
  },
  'cb-folder-card': {
    screenReader: [
      'El nombre es texto; con `clickable` es un botón que emite `open`. El icono de carpeta es decorativo, y el número de archivos y el tamaño se leen como texto.',
      'Con `actions`, el botón de acciones se nombra con la carpeta ("Más acciones: Facturas"), indica `aria-haspopup="menu"` y `aria-expanded`, y abre un `cb-menu`; al cerrarlo, el foco vuelve al botón.',
    ],
    keyboard: [
      TAB_FOCUS('al nombre (con clickable) y al botón de acciones'),
      { keys: 'Enter / Espacio', action: 'Abre la carpeta o el menú de acciones.' },
      { keys: 'Flecha abajo', action: 'En el botón de acciones, abre el menú y enfoca la primera opción.' },
      { keys: 'Escape', action: 'Cierra el menú.' },
    ],
  },
  'cb-inline-message': {
    screenReader: [
      'Con severidad `danger` o `warn` es un `role="alert"` y se anuncia al momento; con `info` o `success` es un `role="status"`, que se anuncia sin interrumpir. El icono es decorativo.',
      'Para asociarlo a un campo, dale un `id` y apúntalo desde el campo con `aria-describedby`.',
    ],
  },
  'cb-message': {
    screenReader: [
      'Con severidad `danger` o `warning` es un `role="alert"` y se anuncia al momento; con el resto es un `role="status"`, que se anuncia sin interrumpir. El icono es decorativo.',
      'Los lectores anuncian lo que aparece, no lo que ya estaba al cargar la página: muestra el mensaje (con `@if`) cuando ocurra lo que comunica. Con `closable`, el botón de cerrar tiene nombre ("Cerrar").',
    ],
    keyboard: [
      TAB_FOCUS('al botón de cerrar'),
      { keys: 'Enter / Espacio', action: 'Cierra el mensaje.' },
    ],
  },
  'cb-pricing': {
    screenReader: [
      'El título es un encabezado `h2`. Las características de cada plan forman una lista, y las no incluidas se anuncian con "(no incluido)", no solo con el color.',
      'El cambio mensual / anual es un grupo nombrado ("Ciclo de facturación"): en la vista de cuadrícula, dos botones con `aria-pressed`; en la horizontal, un `role="radiogroup"`. Cada plan termina en un botón con nombre propio ("Elegir Pro").',
    ],
    keyboard: [
      TAB_FOCUS('al cambio de ciclo y al botón de cada plan'),
      { keys: 'Enter / Espacio', action: 'Cambia el ciclo o elige el plan.' },
      { keys: 'Flechas / Inicio / Fin', action: 'En la vista horizontal, cambia de ciclo.' },
    ],
  },
  'cb-progressbar': {
    screenReader: [
      'Es un `role="progressbar"` con `aria-valuemin="0"`, `aria-valuemax="100"` y el valor en `aria-valuenow`; con `indeterminate` no lleva valor. Dale siempre un `ariaLabel` ("Subiendo archivo") para que se sepa qué progresa.',
      'Con "reducir movimiento" activado, la animación de `indeterminate` va más despacio.',
    ],
  },
  '[cbRipple]': {
    screenReader: [
      'Es solo visual: no cambia el rol, el nombre ni el foco del elemento. Aplícalo a controles que ya sean accesibles (un `button`, un enlace).',
      'Con "reducir movimiento" activado en el sistema, no se dibuja la onda.',
    ],
  },
  'cb-skeleton': {
    screenReader: [
      'Es decorativo (`aria-hidden="true"`). Mientras carga, marca el contenedor con `aria-busy="true"` y, si la espera es larga, anúnciala con un `cb-spinner` o con un texto en una región `role="status"`.',
      'Con "reducir movimiento" activado, la animación se detiene.',
    ],
  },
  'cb-spinner': {
    screenReader: [
      'Es un `role="status"` con nombre ("Cargando", o `ariaLabel`); el SVG es decorativo. Para que se anuncie, muéstralo (con `@if`) al empezar la carga en lugar de dejarlo siempre en la página y ocultarlo con CSS.',
      'Con "reducir movimiento" activado, gira más despacio y el arco deja de cambiar de tamaño.',
    ],
  },
  '[cbStyleClass]': {
    screenReader: [
      'Solo añade o quita clases en el objetivo. Si las usas para mostrar u ocultar contenido, ese estado no llega a los lectores de pantalla: actualiza tú `aria-expanded` en el elemento que lo dispara, o usa un componente con estado (Panel, Accordion).',
      'Ocultar con `display: none` saca el contenido también del lector de pantalla; ocultarlo solo con opacidad, no.',
    ],
  },
  'cb-tag': {
    screenReader: [
      'Es texto en línea sin rol propio: se lee su valor y el icono es decorativo. El color de la severidad no se anuncia, así que el texto debe bastar por sí solo ("Pendiente", no un tag rojo sin texto).',
    ],
  },
};
