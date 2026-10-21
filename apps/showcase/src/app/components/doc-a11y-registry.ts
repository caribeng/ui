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
    ],
    keyboard: [
      { keys: 'Enter / Espacio / Flecha abajo', action: 'En el campo, abre el calendario.' },
      { keys: 'Flecha izquierda / Flecha derecha', action: 'Día anterior o siguiente.' },
      { keys: 'Flecha arriba / Flecha abajo', action: 'Mismo día de la semana anterior o siguiente.' },
      { keys: 'Inicio / Fin', action: 'Primer o último día de la semana.' },
      { keys: 'Re Pág / Av Pág', action: 'Mismo día del mes anterior o siguiente.' },
      { keys: 'Mayús + Re Pág / Av Pág', action: 'Mismo día del año anterior o siguiente.' },
      { keys: 'Enter / Espacio', action: 'Selecciona el día activo (en modo rango, el inicio y luego el fin).' },
      { keys: 'Escape', action: 'Cierra el calendario.' },
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
      'La barra es un `role="toolbar"` con nombre; cada herramienta tiene su etiqueta y solo una entra en el orden de tabulación.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Pasa de la barra de herramientas al área editable.' },
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
      'Al moverse con las flechas, una región viva anuncia la categoría y sus valores (en torta y dona, el valor y el porcentaje). La leyenda son botones con `aria-pressed`.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Enfoca el gráfico y muestra el primer dato.' },
      { keys: 'Flechas', action: 'Pasan a la categoría o segmento siguiente o anterior (de forma circular).' },
      { keys: 'Inicio / Fin', action: 'Van al primer o al último dato.' },
      { keys: 'Enter', action: 'Selecciona el dato activo (emite itemSelect).' },
      { keys: 'Escape', action: 'Oculta el tooltip.' },
    ],
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
};
