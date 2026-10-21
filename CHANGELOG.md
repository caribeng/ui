# Changelog

Todos los cambios notables en `@caribeng/ui` se documentan en este archivo siguiendo [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [Semantic Versioning](https://semver.org/lang/es/).

Desde la 22.0.0 el major de la librería coincide con el de Angular (22.x = Angular 22), como Angular Material, PrimeNG y NG-ZORRO.

**Formato de cada entrada** (lo lee la página Changelog del showcase): `- **Componente:** descripción`. Secciones admitidas: `Breaking`, `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

---

## [Unreleased]

### Breaking
- **Caribe Design:** los textos de contenido de ejemplo ya no se muestran por defecto: `title` de Header y Preloader, `label` de Shortcut, StepIndicator, TagButton y TransactionStatus, `monthLabel` de Calendar, `fileName` / `fileSize` de FileDownload y `copyright` de Footer pasan a ser `''`. Pasa el texto que necesites.
- **OrderList:** la selección pasa a ser por posición y se añaden los botones de mover al inicio y al final.
- **DynamicDialog:** `cb-dynamic-dialog` ahora se apoya en `cb-dialog` (trampa de foco, Escape y devolución del foco).

### Added
- **PDF Viewer (`@caribeng/ui/pdfviewer`):** `cb-pdf-viewer` sobre pdf.js (`pdfjs-dist`, peer dependency opcional que se carga bajo demanda). Renderiza solo las páginas visibles, con texto seleccionable y accesible, búsqueda que ignora tildes y mayúsculas, miniaturas, zoom (ajustar al ancho, página completa o porcentaje), giro, descarga, impresión del documento y documentos con contraseña. `[(page)]`, `[(zoom)]`, `[(rotation)]` y `[(sidebar)]` bidireccionales, API pública (`goToPage`, `search`, `print`…) y `provideCbPdfViewer` para servir el worker y los recursos desde tu propio dominio.
- **Slider:** modo rango con dos tiradores (`range` + `[(rangeValue)]`, que no se cruzan), `showValue`, `valueFormat` / `locale` con `aria-valuetext`, y evento `rangeChanged`. Con Angular Forms, el control recibe el par `[mínimo, máximo]`.
- **ThemeToggle:** `cb-theme-toggle`, botón listo para alternar entre tema claro y oscuro.
- **Componentes nuevos:** `SplitButton` (acción principal + menú), `Empty` (estado vacío), `Descriptions` (pares etiqueta / valor), `Result` (pantallas de éxito, error y 404/403/500), `Statistic` y `Countdown` (cifras con formato y tendencia, cuenta regresiva), `KeyFilter` (directiva que limita los caracteres de un campo), `Anchor` (índice "En esta página" con sección activa) y `Repeater` (lista repetible de campos sobre un `FormArray`). 150 entry points.
- **Button:** `ariaLabel`, `ariaHaspopup`, `ariaExpanded` y `ariaControls` para botones de solo icono o que abren algo.
- **Menu:** evento `hidden` al cerrarse.
- **Table:** datos desde el servidor (`lazy`, `totalRecords`, `loading` y evento `lazyLoad` con página, orden y filtros); cabecera fija con `scrollHeight`; columnas fijas (`frozen`); agrupación de filas (`groupRowsBy` y plantilla `cbTableGroupHeader`); exportación con `exportCSV()` / `toCSV()` (BOM para Excel, `exportable: false` y `selectionOnly`).
- **Chart:** tipos `area`, `horizontalBar` y `radialBar`; `stacked`; gráfico combinado (serie con `type: 'line'` dentro de `bar`); `sparkline`; eje de valores con escala legible y valores negativos; `valueFormat` (opciones de `Intl.NumberFormat` o función) y `locale`; tooltip con ratón y teclado; leyenda que oculta y muestra series; evento `itemSelect`; animación de entrada y colores por elemento (`colors`) en torta y dona.
- **Chart:** accesibilidad: grupo enfocable con instrucciones, recorrido con flechas anunciado en una región viva y tabla de datos equivalente para lectores de pantalla.
- **Chart:** seis tipos nuevos: `waterfall` (cascada con subtotales en `sums`), `gauge` (medidor con `min`, `max` y franjas `bands`), `radar`, `polarArea`, `heatmap` (flechas arriba / abajo cambian de fila) y `treemap`. Internamente cada tipo lo dibuja un renderer independiente sobre un motor común; la API `type` + `data` no cambia.
- **Instalación:** `ng add @caribeng/ui` instala la librería, pregunta idioma, tema y color primario, registra `provideCaribeNG()` (app standalone o `AppModule`) y añade `@caribeng/ui/styles.css` a `angular.json`. Es idempotente: ejecutarlo de nuevo no duplica nada.
- **Tokens:** `--cb-color-surface-hover` y `--cb-color-surface-subtle`, tokens semánticos para hover y fondos suaves que cambian con el tema (en claro equivalen a `surface-100` y `surface-50`).
- **Table:** filtro global (`[(globalFilter)]`, `globalFilterFields`, `filterGlobal()`) y por columna (`filter`, `filterMatchMode`: contains / startsWith / equals), sin distinguir mayúsculas ni tildes, con evento `filterChange`, `clearFilters()` y anuncio de la cantidad de resultados.
- **Table:** columnas redimensionables (`resizableColumns`) con ratón y teclado, y evento `columnResize`.
- **Table:** filas expandibles con la plantilla `cbTableRowExpansion`, `[(expandedRowKeys)]` y eventos `rowExpand` / `rowCollapse`.
- **DatePicker:** selección de rangos (`selectionMode="range"` con `[(range)]`, previsualización bajo el puntero y aviso "Elige la fecha final"); con Angular Forms el control recibe `[inicio, fin]`.
- **DatePicker:** hora (`showTime`, `hourFormat` 24 / 12 con AM/PM, `stepMinute`).
- **DatePicker:** Mayús + Re Pág / Av Pág cambian de año; cada día se nombra con su fecha completa.
- **Select / MultiSelect:** opciones agrupadas (`group`, `optionGroupLabel`, `optionGroupChildren`) con `role="group"` nombrado por su título.
- **Select / MultiSelect:** scroll virtual (`virtualScroll`, `virtualScrollItemSize`, `scrollHeight`) para listas de miles de opciones, con `aria-setsize` / `aria-posinset`.
- **Select / MultiSelect:** búsqueda al teclear (escribir salta a la opción que empieza por lo escrito; repetir la letra recorre las coincidencias) y la opción activa se desplaza a la vista al usar las flechas.
- **Select:** `showClear`, botón para vaciar la selección.
- **Table:** selección simple con radio por fila, checkbox de cabecera con estado parcial (`mixed`) y `ariaLabel` para nombrar la tabla.
- **DynamicDialog:** `CbDialogService.open(Componente, { header, data, width })` abre cualquier componente en un diálogo; el componente recibe `CB_DYNAMIC_DIALOG_DATA` y se cierra con `CbDynamicDialogRef.close(resultado)`, que llega por `onClose`.
- **Tree:** niveles ilimitados, plantilla `cbTreeNode`, navegación con teclado (patrón WAI-ARIA *tree*), nodos deshabilitados, `expandAll()` / `collapseAll()` y eventos `nodeExpand`, `nodeCollapse` y `nodeSelect`.
- **TreeTable:** niveles ilimitados, `role="treegrid"` con navegación con teclado y plantilla de celda `cbTreeTableCell`.
- **VirtualScroller:** plantilla `cbVirtualItem`, `buffer`, `scrollToIndex()` y `aria-setsize` / `aria-posinset` en cada elemento.
- **DataView:** plantilla `cbDataViewItem`, cabecera `cbDataViewHeader`, cambio de vista lista/cuadrícula (`showLayoutToggle`) y paginación con `rows`.
- **Timeline:** `align` (`left`, `right`, `alternate`), plantillas `cbTimelineContent`, `cbTimelineOpposite` y `cbTimelineMarker`, e `icon` / `color` por evento.
- **OrderList:** plantilla `cbOrderListItem`, cabecera `header`, reordenado con Alt + flechas y evento `reorder`.
- **PickList:** selección múltiple, mover todos, doble clic, teclado, plantilla `cbPickListItem`, `sourceHeader` / `targetHeader` y evento `moved`.
- **ConfirmPopup:** `confirm($event)` la abre anclada al botón que la dispara; Escape o un clic fuera la cancelan y el foco vuelve al disparador. `acceptSeverity` para acciones destructivas.
- **ConfirmDialog:** `acceptSeverity` para marcar el botón de aceptar como peligroso.
- **MegaMenu:** navegación con teclado (flechas, Inicio/Fin, Escape) según el patrón *disclosure navigation*.
- **FileUpload:** evento `rejectFiles` y aviso visible (`role="alert"`) con los archivos descartados por tamaño o tipo.
- **Carousel / Galleria:** navegación con flechas, Inicio y Fin en los indicadores y miniaturas (patrón *tabs* con un solo tabindex activo); cada diapositiva se nombra por su posición ("1 de 3").
- **CascadeSelect / TreeSelect / Image / Inplace:** Escape cierra el panel o la previsualización y devuelve el foco.
- **Editor:** barra de herramientas con un solo tabindex activo y navegación con flechas, Inicio y Fin (patrón *toolbar*); `ariaLabel` para el área editable.
- **Terminal:** flecha arriba / abajo recorren los comandos anteriores; el historial es un `role="log"` que anuncia las respuestas.
- **BlockUI:** `message`, texto que anuncia el lector de pantalla al bloquear (por defecto, "Cargando").
- **AvatarGroup / MeterGroup:** `ariaLabel` para nombrar el grupo o el medidor.
- **Core:** `cbOverlayFocus()`, utilidad para overlays: al abrir mueve el foco al elemento inicial y al cerrar lo devuelve a quien lo tenía.
- **InputToken (Caribe):** avance automático al escribir, solo dígitos, flechas, Backspace (borra la casilla actual o la anterior) y pegar un código completo, como la referencia de Caribe.
- **FabMenu (Caribe):** patrón WAI-ARIA *menu*: el foco entra al abrir, flechas, Inicio, Fin y Escape; `aria-haspopup` y `aria-controls`.
- **Modal / OffCanvas / PopOver (Caribe):** trampa de foco (Modal, OffCanvas), Escape cierra y el foco entra al abrir y vuelve al disparador al cerrar.
- **Coachmark / Onboarding (Caribe):** el cambio de paso se anuncia ("Paso 2 de 3") y Escape cierra.
- **ExpansionPanel (Caribe):** la cabecera controla una región nombrada (`aria-controls`, `role="region"`).
- **CardSelect / DotsIndicator (Caribe):** un solo tabindex activo y navegación con flechas, Inicio y Fin (patrones *listbox* y *tabs*).
- **CardMove (Caribe):** cada botón de mover se describe con su elemento y el foco sigue al elemento movido.
- **FileDownload (Caribe):** con `href` se renderiza un enlace de descarga nativo (antes `href` no se usaba); el botón se describe con el nombre del archivo.
- **Link (Caribe):** los enlaces externos avisan al lector de pantalla de que se abren en una pestaña nueva.
- **DataTable / Shortcut (Caribe):** `ariaLabel` para nombrar la tabla o un atajo sin texto visible; las cabeceras de DataTable tienen `scope="col"`.
- **StepIndicator (Caribe):** `aria-valuetext` ("Paso 2 de 4").
- **Tests:** base de tests de comportamiento, teclado, accesibilidad y formularios en los 23 componentes del núcleo que tenían uno solo y en los de Caribe Design: CascadeSelect, TreeSelect, InputMask, InputOtp, FileUpload, Image, Carousel, Galleria, Inplace, Chip, Editor, Terminal, BlockUI, ScrollTop, FloatLabel, MeterGroup, FileCard, FolderCard, AvatarGroup, IconField, InlineMessage, ScrollPanel y Toolbar.
- **Showcase:** páginas de Tree, TreeTable, VirtualScroller, DataView, Timeline, OrderList, PickList, ConfirmDialog, ConfirmPopup, DynamicDialog y MegaMenu reescritas con ejemplos por funcionalidad y sección de accesibilidad.
- **Idioma (i18n):** sistema de traducción de los textos de interfaz (etiquetas accesibles, botones, placeholders y mensajes) en español e inglés, con `provideCaribeNG({ locale, translation })`, cambio en caliente con `CbLocaleService.use()` y `setTranslation()`, y `cbFormat()` para textos con valores. Aplica a 79 componentes.
- **Showcase:** página Idioma (i18n) con todas las claves; el selector ES/EN del sitio cambia también el idioma de los componentes.

### Changed
- **Menús y navegación:** las etiquetas accesibles de Breadcrumb, Menu, Menubar, ContextMenu, MegaMenu, Dock, PanelMenu, TieredMenu, Steps y TabMenu estaban en inglés; ahora siguen el idioma activo (español por defecto).
- **ConfirmPopup:** el mensaje por defecto se unifica con el de ConfirmDialog ("¿Deseas continuar?").
- **CascadeSelect / TreeSelect / InputSelect:** el placeholder por defecto se unifica en "Seleccionar".
- **Formularios:** `requiredText` y `optionalText` de `provideCaribeNG()` pasan a ser opcionales; si se omiten, se usan los del idioma activo.
- **Chip / Galleria:** las imágenes de los chips y de las miniaturas son decorativas (`alt=""`) para que el lector de pantalla no repita el nombre.
- **ConfirmDialog / ConfirmPopup / OrderList / PickList:** los botones usan `cb-button` y el código de los 11 componentes reescritos es legible (antes estaba minificado).

### Fixed
- **VirtualScroller:** ocupa todo el ancho disponible; dentro de un contenedor flex se quedaba sin ancho.
- **Slider:** la pista usaba tonos claros también en tema oscuro.
- **Chart:** la tarjeta era blanca en tema oscuro (usaba tokens inexistentes), los valores negativos se mostraban como 0 y la torta ignoraba los colores del dataset.
- **Tema oscuro:** el hover y la opción activa de Select, MultiSelect, Autocomplete, Listbox, DatePicker, Tree, Paginator, SelectButton, ToggleButton, InputNumber, Table, Accordion y los botones de cerrar de Dialog, Drawer y Toast usaban `surface-100` / `surface-50`, que en oscuro siguen siendo casi blancos: el texto blanco desaparecía. Ahora usan los tokens semánticos nuevos.
- **Table:** ordenar y seleccionar filas solo era posible con ratón: el encabezado ordenable no era enfocable y los checkboxes de fila estaban ocultos al lector de pantalla. Ahora hay un botón "Ordenar por …" y un checkbox o radio enfocable por fila.
- **DatePicker:** Re Pág / Av Pág saltaban al día 1 del mes en lugar de al mismo día; al llegar con las flechas a un día fuera de `minDate` / `maxDate` se perdía el foco (ahora usan `aria-disabled`); `aria-selected` estaba en el botón en vez de en la celda.
- **DatePicker / Menubar / OrderList:** en apps zoneless, el foco se movía antes de que se pintara el día, el submenú o la lista reordenada, y quedaba en el elemento equivocado o se perdía. Ahora se mueve tras el render (`afterNextRender`).
- **MultiSelect:** al navegar con flechas el lector de pantalla no anunciaba la opción activa (faltaba `aria-activedescendant`), y en el filtro la barra espaciadora marcaba una opción en lugar de escribir un espacio.
- **Select / MultiSelect:** con `filter`, el foco está en el campo de búsqueda pero la opción activa se anunciaba desde el disparador; ahora el campo es el combobox que la anuncia.
- **InputMask:** los literales de la máscara (`-`, `(`…) se añadían antes de tiempo: Backspace no podía borrarlos y un literal inicial como `(` nunca aparecía.
- **FileUpload:** los archivos arrastrados no se filtraban por `accept`, los que superaban `maxFileSize` se descartaban sin aviso, un mismo archivo podía añadirse dos veces y los tamaños grandes no se mostraban en MB.
- **InputOtp:** al pegar un código, el foco pasa a la última casilla rellenada.
- **Image:** la previsualización se declaraba modal pero no atrapaba el foco ni devolvía el foco al cerrarse.
- **Inplace:** el foco se perdía al abrir o cerrar; ahora pasa al contenido y vuelve a la vista previa.
- **Galleria:** las flechas se mostraban con una sola imagen y no se deshabilitaban en los extremos sin `circular`.
- **FloatLabel:** la etiqueta no subía cuando el valor se asignaba por código (`patchValue`, `setValue`).
- **MeterGroup:** `role="meter"` sin `aria-valuenow` (ARIA inválido); ahora expone el total y un desglose en `aria-valuetext`. La leyenda mostraba el valor bruto como porcentaje aunque `max` no fuera 100.
- **FileCard:** el fondo tintado solo funcionaba con colores hex de 6 dígitos; ahora acepta cualquier color CSS.
- **FolderCard:** sin número de archivos mostraba la etiqueta "archivos" suelta.
- **BlockUI:** la máscara `role="status"` no tenía texto, así que no anunciaba nada.
- **Terminal:** tras pulsar Enter, el campo podía seguir mostrando el comando enviado.
- **Editor:** el área editable no tenía nombre accesible ni `aria-disabled`.
- **InputSelect (Caribe):** el valor inicial no quedaba seleccionado (el `<select>` recibía el valor antes de crear las opciones).
- **InputSearch (Caribe):** al limpiar, el foco se perdía; ahora vuelve al campo.
- **FileSelect (Caribe):** no había indicador de foco visible al navegar con teclado; la cantidad de archivos elegidos se anuncia.
- **Calendar (Caribe):** las iniciales de los días estaban fijas en español; ahora siguen el idioma activo (`weekdaysMin`). Además usaba `role="grid"` sin filas ni celdas (ARIA inválido); ahora es un grupo nombrado por el mes.
- **Preloader (Caribe):** `aria-busy="true"` fijo impedía que el lector de pantalla anunciara el aviso de carga.
- **Voucher (Caribe):** dos filas con la misma etiqueta rompían la lista.

---

## [22.1.1] - 2026-10-20

### Changed
- **Dependencias:** `@angular/cdk` pasa de `peerDependencies` a `dependencies`, como en NG-ZORRO: ahora basta con `npm install @caribeng/ui`.
- **npm:** keywords, autor, repositorio, página y enlace de incidencias en la ficha del paquete.

---

## [22.1.0] - 2026-10-20

### Breaking
- **Formularios:** el `*` de `[required]` ya no se muestra por defecto en Input, Textarea, Autocomplete, DatePicker e InputNumber (`requiredIndicator` es `'none'` por defecto). Para recuperarlo: `provideCaribeNG({ requiredIndicator: 'asterisk' })`.

### Added
- **Formularios:** estado de validación automático con Angular Forms (`cbFieldState`): el campo se marca inválido cuando su `FormControl` es inválido y fue tocado, sin `[invalid]` manual. El mensaje sigue siendo opcional (`error`).
- **Formularios:** indicador de obligatoriedad configurable `requiredIndicator` (`'asterisk'`, `'text'`, `'optional'`, `'none'`), global con `provideCaribeNG()` y por campo, con textos `requiredText` / `optionalText`.
- **Formularios:** input `invalid` con estilo y `aria-invalid` en InputMask, InputOtp, Radio, Toggle, Slider, Rating, Listbox, SelectButton, ToggleButton, CascadeSelect, TreeSelect, Editor, Knob, Switch, InputSearch, InputDate, InputSelect e InputToken.
- **Select / MultiSelect:** inputs `ariaLabel` y `ariaLabelledBy` para nombrar el combobox.
- **Editor:** encabezados, formato, alineación, enlaces e inserción de imágenes.
- **Pricing / FileCard / FolderCard:** nuevos componentes genéricos.
- **Image:** barra de herramientas completa en el visor (lightbox) con volteo horizontal y vertical.
- **Icon:** iconos `flip-horizontal` y `flip-vertical`.
- **Showcase:** pestaña TypeScript con el componente standalone completo de cada ejemplo, generado del código de la página.
- **Showcase:** sección Accesibilidad (lector de pantalla y teclado) en 24 componentes.
- **Showcase:** sección Templates: autenticación (login, registro, recuperar y restablecer contraseña, 2FA, verificación, bloqueo), dashboard, navbar, file manager, pricing, factura y páginas de error.
- **Showcase:** botón de pantalla completa en los ejemplos.
- **Showcase:** página Changelog.

### Changed
- **Showcase:** estructura única de páginas (Importación → Básico → ejemplos → Accesibilidad → Playground → API) con títulos y descripciones traducibles ES/EN.
- **Checkbox:** muestra el indicador de obligatoriedad configurado.
- **Distribución:** el paquete se publica sin source maps (solo el JavaScript compilado), como PrimeNG.

### Fixed
- **ConfirmDialog:** atrapa el foco, Escape cancela y cierra, y el foco vuelve al elemento que lo abrió.
- **Tabs:** relación `aria-controls` / `aria-labelledby` entre pestaña y panel; el foco acompaña a la pestaña al usar las flechas.
- **Tooltip:** el disparador lo referencia con `aria-describedby` y Escape lo oculta.
- **Autocomplete:** el panel ocupa el ancho del input.
- **Paginator:** el selector de filas muestra solo el número.
- **Button:** `fullWidth` ocupa todo el ancho disponible.
- **Select:** ancho correcto de los desplegables.
- **Showcase:** ejemplos HTML que usaban variables inexistentes (Rating, Slider, Knob, Steps, TabMenu, SelectButton, MegaMenu, Voucher).

---

## [22.0.0] - 2026-10-18

### Breaking
- **Angular:** requiere Angular 22 (`peerDependencies` `^22.0.0`).

### Changed
- **Versionado:** el major de la librería se alinea con el de Angular; la 22.0.0 incluye todo lo de la 1.1.0.
- **Mantenimiento:** la línea v21 (Angular 21) continúa en la rama `release/21.x` y solo recibe correcciones.
- **Showcase:** selector de versión con v22 como actual y v21 en mantenimiento.

---

## [1.1.0] - 2026-10-17

### Added
- **Caribe Design · Cards, transacciones y alertas:** `alert`, `inline-alert`, `card-content`, `card-move`, `card-primary`, `card-select`, `coachmark`, `onboarding`, `status`, `tracker`, `transaction-status`, `voucher`, `data-table`, `modal`, `pop-over`.
- **Caribe Design · Navegación, botones y paneles:** `button-group`, `icon-button`, `tag-button`, `fab-menu`, `float-menu`, `header`, `footer`, `link`, `shortcut`, `expansion-panel`, `off-canvas`, `dots-indicator`, `step-indicator`, `switch`, `progress-bar`.
- **Caribe Design · Identidad, loaders, archivos y formularios:** `animation-lottie`, `circle-loading`, `loader`, `preloader`, `logo`, `illustration`, `pictogram`, `stroke`, `file-download`, `file-select`, `input-search`, `input-token`, `input-date`, `input-select`, `calendar`.
- **Calidad:** 140 suites de prueba (280 tests unitarios con Vitest).
- **Showcase:** 138 páginas de documentación interactiva.

---

## [1.0.0] - 2026-10-17

### Added
- **Form:** `Button`, `Input`, `Textarea`, `Select`, `MultiSelect`, `Checkbox`, `Radio`, `Toggle`, `DatePicker`, `InputNumber`, `InputMask`, `InputOTP`, `InputGroup`, `FloatLabel`, `IconField`, `Slider`, `Rating`, `ColorPicker`, `FileUpload`, `Autocomplete`, `Password`, `Knob`, `ListBox`, `SelectButton`, `ToggleButton`, `TreeSelect`, `CascadeSelect`, `Chips`, `Editor`.
- **Data:** `Table` (ordenación, paginación, selección y plantillas de celda `cbTableCell`), `Paginator`, `DataView`, `Tree`, `TreeTable`, `Timeline`, `VirtualScroller`, `OrderList`, `PickList`, `OrganizationChart`.
- **Overlay:** `Dialog`, `Drawer`, `Tooltip` (`[cbTooltip]`), `Popover`, `ConfirmDialog`, `ConfirmPopup`, `DynamicDialog`.
- **Messages:** `Toast` (`CbToastService`), `Message`, `InlineMessage`, `Badge`, `Tag`, `Chip`.
- **Menu:** `Menu`, `Menubar`, `ContextMenu`, `Breadcrumb`, `Steps`, `TabMenu`, `PanelMenu`, `TieredMenu`, `MegaMenu`, `Dock`, `SpeedDial`.
- **Panel:** `Card`, `Panel`, `Accordion`, `Fieldset`, `Divider`, `Splitter`, `Toolbar`, `ScrollPanel`, `ScrollTop`, `Tabs`, `Stepper`.
- **Media:** `Avatar`, `AvatarGroup`, `Image` (lightbox y zoom), `Carousel`, `Galleria`.
- **Misc:** `Icon` (`<cb-icon>` con 361 iconos núcleo), `Icons` (1891 iconos Lucide), `ProgressBar`, `Spinner`, `Skeleton`, `MeterGroup`, `Inplace`, `BlockUI`, `Terminal`, `Chart`, `Ripple`, `FocusTrap`, `AnimateOnScroll`, `StyleClass`, `AutoFocus`.
- **Theming:** presets de paleta primaria en caliente (`emerald`, `ocean`, `coral`, `amber`, `violet`, `rose`) con `setPreset()` y escalas personalizadas con `setCustomPrimaryScale()`.
- **Distribución:** Angular Package Format con `exports` autogenerados y hoja de estilos `@caribeng/ui/styles.css`.
- **Calidad:** 94 archivos de prueba con Vitest + jsdom y CI en GitHub Actions.
