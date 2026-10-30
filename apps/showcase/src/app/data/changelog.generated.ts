// GENERADO por apps/showcase/scripts/gen-changelog.mjs a partir de CHANGELOG.md.
// No editar a mano: modifica CHANGELOG.md y ejecuta `pnpm docs:changelog` (o el build).
import type { CbChangelogRelease } from './changelog.model';

export const CHANGELOG: readonly CbChangelogRelease[] = [
  {
    "version": null,
    "date": null,
    "sections": []
  },
  {
    "version": "22.7.1",
    "date": "2026-10-30",
    "sections": [
      {
        "type": "fixed",
        "items": [
          {
            "component": "Iconos (licencia)",
            "text": "el paquete npm ahora incluye `THIRD-PARTY-NOTICES.md` con las licencias de Lucide (ISC) y Feather (MIT), como exige la ISC; antes no se publicaba. El aviso cubre también el catálogo completo (`@caribeng/ui/icons`) y los bundles de `icon` e `icons` conservan el comentario `@license`."
          }
        ]
      },
      {
        "type": "security",
        "items": [
          {
            "component": "Dependencias de desarrollo",
            "text": "Angular 22.2.3, NX 23.3.1, prismjs 1.30.0 y `overrides` en el tooling de build. Corrige las alertas de `pnpm audit` (0 vulnerabilidades); no cambia las dependencias del paquete publicado."
          }
        ]
      },
      {
        "type": "changed",
        "items": [
          {
            "component": "Showcase",
            "text": "sección «Créditos y licencia» en la página de iconos, con enlace a lucide.dev."
          }
        ]
      }
    ]
  },
  {
    "version": "22.7.0",
    "date": "2026-10-28",
    "sections": [
      {
        "type": "added",
        "items": [
          {
            "component": "Migración PrimeNG → CaribeNG",
            "text": "el schematic `migrate-from-primeng` migra sin pasos manuales los casos comunes: avatar, badge, chip, dataview, divider, inputgroup, message, overlays, panel, `p-stepper` → `cb-stepper` y `p-steps` → `cb-steps`. Convierte las variables del tema Aura (`--p-*`) en tokens `--cb-*` y los iconos `pi pi-*` (también en literales `.ts`), registrándolos en `provideCbIcons`."
          },
          {
            "component": "Showcase",
            "text": "submenú de migración PrimeNG → CaribeNG en Getting Started."
          }
        ]
      },
      {
        "type": "changed",
        "items": [
          {
            "component": "Migración PrimeNG → CaribeNG",
            "text": "la opción `--force` pasa a llamarse `--skip-checks`."
          },
          {
            "component": "Paquete",
            "text": "descripción en inglés y `homepage` → https://caribeng.devmike.site/."
          }
        ]
      },
      {
        "type": "fixed",
        "items": [
          {
            "component": "Migración PrimeNG → CaribeNG",
            "text": "18 errores de reglas (enlaces con corchetes, `focus`/`blur`, `ariaLabel`, `export *`…), nombres de clase (`CbColorPicker`, `CbDataView`, `CbProgressBar`, `CbAvatarGroup`), tags de PrimeNG 17 con mayúsculas (`p-tabPanel`, `p-accordionTab`) y `RadioButton` ya no se cambia por `CbRadioGroup` sin uso (NG8113)."
          }
        ]
      }
    ]
  },
  {
    "version": "22.6.0",
    "date": "2026-10-28",
    "sections": [
      {
        "type": "changed",
        "items": [
          {
            "component": "Idioma por defecto",
            "text": "los textos de interfaz de los componentes vienen en **inglés** por defecto (antes español). Para español: `provideCaribeNG({ locale: 'es' })`."
          }
        ]
      }
    ]
  },
  {
    "version": "22.5.0",
    "date": "2026-10-27",
    "sections": [
      {
        "type": "breaking",
        "items": [
          {
            "component": "Namespace Caribe Design disuelto",
            "text": "los 30 componentes de Caribe Design pasan de `@caribeng/ui/caribe/<name>` a `@caribeng/ui/<name>` (catálogo unificado). Actualiza los imports y las entradas del showcase."
          }
        ]
      },
      {
        "type": "removed",
        "items": [
          {
            "component": "15 componentes duplicados de la base",
            "text": "`switch` (→ `toggle`), `progress-bar` (→ `progressbar`), `modal` (→ `dialog`), `pop-over` (→ `popover`), `data-table` (→ `table`), `calendar` e `input-date` (→ `datepicker`), `input-select` (→ `select`), `file-select` (→ `fileupload`), `inline-alert` (→ `inlinemessage`), `loader`, `circle-loading` y `preloader` (→ `spinner`/`skeleton`), y los decorativos `stroke` y `pictogram`."
          }
        ]
      },
      {
        "type": "added",
        "items": [
          {
            "component": "",
            "text": "**`DynamicForm`, más parametrización:** - **Etiquetas:** `labelPosition` (`top`, `left`, `right`, `floating`, `hidden`) en el formulario, en cada sección o en cada campo, `labelAlign` y `labelWidth`. Los textos aceptan un objeto por idioma (`{ es, en }`) o pasan por la función `translate`. - **Diseño:** `columns` y `colSpan` por tamaño del formulario (`{ base, sm, md, lg }`, con container queries), `newRow`, `order`, `size`, y los elementos `heading`, `paragraph` y `divider`. - **Dependencias:** `optionsFrom` (opciones según otro campo) y `optionsLoader` con `loaders` y `dependsOn` (opciones remotas con Promise); el valor se limpia si ya no está entre las opciones. - **Grupos y pasos:** `type: 'group'` (objeto anidado) y `repeatable` (lista con añadir y quitar, `minItems`, `maxItems`, `itemLabel`), campos calculados con `formula` (expresiones seguras con `sum`, `round`, `min`, `max`…, exportada como `evaluateFormula`) o `compute`, y `steps` con validación por paso y el evento `stepChange`. - **Validaciones y campos propios:** `rules` entre campos (`equalsField`, `gteField`, `lteField`…), `prefix`, `suffix`, `icon`, `type: 'mask'` y tipos propios pintados con `<ng-template cbFormField=\"nombre\">`."
          },
          {
            "component": "Showcase",
            "text": "nueva plantilla «Tablero contable» (`/templates/accounting`). Combina selector de periodo, indicadores, estado de resultados comparativo, cartera por edades, conciliación bancaria y los últimos comprobantes; cada comprobante se abre en un panel lateral y los nuevos se crean con el editor de comprobante."
          },
          {
            "component": "Componente nuevo: `Amount`",
            "text": "(`@caribeng/ui/amount`): importe con su moneda, negativos en rojo (con signo o entre paréntesis), código ISO, tamaños, equivalente en otra moneda con la tasa (`convert`, p. ej. la TRM) e importe en letras (`words`). Incluye `cbAmountInWords()` en español e inglés para pesos, dólares, euros y otras monedas, en estilo cheque («UN MILLÓN DE PESOS CON 50/100 M/CTE») o texto. 184 entry points."
          },
          {
            "component": "Componente nuevo: `Kpi`",
            "text": "(`@caribeng/ui/kpi`): indicador para tableros con valor, variación frente al periodo anterior (calculada sola y dicha con texto), color según si subir es bueno o malo (`better`), minigráfica de tendencia (`series`), avance hacia una meta (`target`) y formatos de moneda, número, entero o porcentaje. 185 entry points."
          },
          {
            "component": "Componente nuevo: `AuditLog`",
            "text": "(`@caribeng/ui/audit-log`): visor de auditoría agrupado por día, con quién, cuándo, la acción (crear, modificar, eliminar o propias con `actionLabels`) y sobre qué registro. Cada registro abre la diferencia Campo · Antes · Después (`<del>` / `<ins>`); tiene búsqueda, filtros por usuario y acción, `format` para los valores y Excel. 186 entry points."
          },
          {
            "component": "Componente nuevo: `Document`",
            "text": "(`@caribeng/ui/document`): documento imprimible (factura, cotización, comprobante, recibo) con empresa y logo, tercero, datos de cabecera, líneas con descuento e impuesto, impuestos agrupados por tarifa, retenciones (`adjustments`), total en letras, observaciones, firmas y pie. `print()` imprime solo el documento o lo guarda en PDF. Incluye `documentTotals()` y `cbPrintElement()` para imprimir cualquier elemento con sus estilos. 187 entry points."
          },
          {
            "component": "Componente nuevo: `Aging`",
            "text": "(`@caribeng/ui/aging`): antigüedad de cartera (cuentas por cobrar o por pagar) por tercero en tramos de vencimiento: por vencer, 1–30, 31–60, 61–90 y más de 90 días, o tramos propios con `buckets`. Barra de composición con importes y %, filas que se abren para ver los documentos con los días vencidos, orden por cualquier columna, totales y Excel con resumen y detalle. Funciones `ageDocuments`, `agingTotals` y `daysOverdue`. 180 entry points."
          },
          {
            "component": "Componente nuevo: `ImportWizard`",
            "text": "(`@caribeng/ui/import-wizard`): asistente de importación en tres pasos (archivo, columnas, revisión). Lee Excel (.xlsx, varias hojas), CSV con `,` o `;` y datos pegados de una hoja de cálculo. Asigna solas las columnas por nombre o `aliases`, interpreta importes (`$ 1.234,56`, `(1.234)`), fechas (`DD/MM/AAAA`, serie de Excel) y Sí / No, valida fila a fila (obligatorios, tipos, `validate`) y deja importar solo las filas válidas. 181 entry points."
          },
          {
            "component": "`xlsx`",
            "text": "lector de Excel en el navegador sin dependencias (`cbReadXlsx`, con `DecompressionStream`), con hojas, cadenas compartidas, números, booleanos y `excelSerialToDate`."
          },
          {
            "component": "Componente nuevo: `Reconciliation`",
            "text": "(`@caribeng/ui/reconciliation`): conciliación bancaria del extracto frente a los libros. Conciliación automática por valor y fecha cercana (`toleranceDays`, prefiere la misma referencia) y emparejamiento manual 1:1, 1:N o N:1 cuando las sumas coinciden, con la diferencia en vivo. Muestra los pendientes de cada lado y el % conciliado, permite deshacer emparejamientos, filtrar solo pendientes y emitir `createEntry` para registrar comisiones o intereses. 182 entry points."
          },
          {
            "component": "Componente nuevo: `Pivot`",
            "text": "(`@caribeng/ui/pivot`): tabla dinámica que cruza registros por dimensiones de filas (anidadas, con subtotales y contraíbles) y columnas, con una o varias medidas (suma, cuenta, promedio, mínimo, máximo). Totales por fila, columna y general, encabezado, primera columna y pie fijos, selectores en la propia tabla (`configurable`) y Excel con niveles. 183 entry points."
          },
          {
            "component": "Exportación a Excel",
            "text": "(`@caribeng/ui/xlsx`): generador de .xlsx sin dependencias (`cbXlsx`, `cbXlsxBytes`, `cbDownloadXlsx`). Admite varias hojas, títulos, encabezado fijo, filtros, anchos automáticos, formatos de importe con moneda y negativos en rojo o entre paréntesis, porcentajes, fechas como fecha de Excel, filas en negrita, sangría y niveles de agrupación plegables. `Table`, `TreeTable` y `Data Grid` ganan `exportExcel()` y `toExcelSheet()`, con los importes como números, subtotales, totales y, en el árbol, los niveles plegables. 177 entry points."
          },
          {
            "component": "Componente nuevo: `PeriodPicker`",
            "text": "(`@caribeng/ui/period-picker`): selector de periodo contable con vistas de mes, trimestre y año, y atajos («Este mes», «Mes anterior», «Trimestre anterior», «Año a la fecha»…). `fiscalYearStart` cambia el inicio del año fiscal y `closed` marca los meses cerrados con un candado (`disableClosed` impide elegirlos). Teclado completo en la cuadrícula; es un control de Angular Forms y el valor es un `CbPeriod` (`kind`, `from`, `to`, `key`), con utilidades como `presetPeriod`, `quarterPeriod`, `fiscalYear` y `periodFromKey`. 178 entry points."
          },
          {
            "component": "Componente nuevo: `FinancialReport`",
            "text": "(`@caribeng/ui/financial-report`): informe financiero jerárquico (estado de resultados, balance general, balance de prueba) a partir del plan de cuentas y los saldos de las cuentas de movimiento. Las cuentas mayores suman a sus auxiliares; admite varios periodos, comparativo con variación y %, saldos crédito en positivo (`signByNature`) y filas de total calculadas con cualquier cuenta (`totals`). Incluye niveles 1…N, «Ocultar cuentas en cero», exportación a Excel con niveles e impresión limpia; `accountOpen` sirve para ver los movimientos de una cuenta. 179 entry points."
          },
          {
            "component": "`TreeTable`",
            "text": "`expandToLevel(n)`, `showFooter`, `rowClass` y `activateLeaves` con el evento `nodeActivate`."
          },
          {
            "component": "Componente nuevo: `AccountPicker`",
            "text": "(`@caribeng/ui/account-picker`): selector de cuenta contable que busca en el plan de cuentas (PUC) por prefijo de código o por palabras del nombre y de la ruta, sin tildes. La jerarquía se deduce del código (o de `parent`) y la ruta se muestra bajo el campo y en los resultados. Solo deja elegir cuentas de movimiento (`allowParents` para las mayores) y nunca las inactivas; escribir el código completo y salir lo elige. Es un control de Angular Forms y se puede usar con `[(value)]`. Incluye las utilidades `resolveAccounts`, `searchAccounts`, `accountPath` y `cbAccountOptions` (opciones para el Data Grid). 175 entry points."
          },
          {
            "component": "Componente nuevo: `JournalEntry`",
            "text": "(`@caribeng/ui/journal-entry`): editor de comprobante contable. Cabecera con fecha, tipo, número y descripción; líneas en un Data Grid con cuenta, tercero y centro de costo (con búsqueda), detalle, débito y crédito excluyentes. Totales y diferencia en vivo con el estado Cuadrado o Descuadrado, botón «Cuadrar», cuentas que exigen tercero (`thirdPartyRequired`) y validación al guardar (fecha, dos líneas con valor, cuentas, que cuadre). Guarda con Ctrl + Enter y emite `save` sin líneas vacías y con los detalles heredados; incluye `cbEmptyJournalEntry()` y modo `readonly`. 176 entry points."
          },
          {
            "component": "`Data Grid`",
            "text": "columnas `autocomplete` (lista de búsqueda dentro de la celda, opciones con descripción y deshabilitadas; pegar un código encuentra la opción) y `onEdit` para cambiar otros campos de la fila en el mismo paso de deshacer. La validación propia (`validate`) también se aplica a las celdas vacías."
          },
          {
            "component": "Núcleo",
            "text": "los importes en moneda usan 2 decimales en todos los navegadores (0 en monedas sin centavos, como JPY o CLP)."
          },
          {
            "component": "",
            "text": "**Importes y totales para contabilidad:** - **Núcleo:** `cbFormatAmount()` (moneda, decimales y negativos con signo o entre paréntesis), `cbSummarize()` (suma sin errores de coma flotante, promedio, cuenta, mínimo y máximo), `cbToNumber()` e `injectCbAmount()`. Nuevas opciones de `provideCaribeNG`: `currency`, `negativeStyle` y `numberLocale` (p. ej. `es-CO` para escribir `$ 1.234,50`). - **`Table`:** columnas con `type` (`number`, `currency`, `percent`), `currency`, `decimals`, `negative` y `format`, alineadas a la derecha y con los negativos en rojo. `summary` (`sum`, `avg`, `count`, `min`, `max` o una función) suma en un pie sobre todas las filas filtradas, y con `groupSubtotals` cada grupo cierra con su subtotal. Nuevos inputs `currency` y `negativeStyle`. - **`TreeTable`:** las mismas columnas de importe y un pie con totales. Con `rollup`, cada fila padre muestra el total de sus descendientes (el saldo de una cuenta mayor a partir de sus auxiliares). - **`Data Grid`:** columnas con `currency`, `negative`, `summary` y `footer`. El pie queda fijo y se recalcula con cada edición o pegado, y hay un `totals()` público."
          },
          {
            "component": "Componente nuevo: `FlowEditor`",
            "text": "(`@caribeng/ui/flow`): editor de flujos de aprobación y procesos sobre `[(flow)]` (`CbFlow`: `nodes` de tipo `start`, `task`, `decision` y `end`, y `edges` con etiqueta). Los nodos se arrastran (ajustados a `gridSize`) y se conectan arrastrando su tirador; doble clic renombra un nodo o la etiqueta de una conexión. Las conexiones bajan de un nodo al siguiente, van de lado entre nodos a la misma altura y rodean por la derecha cuando vuelven atrás. Lienzo con desplazamiento (arrastre o rueda) y `[(zoom)]` (Ctrl + rueda, + / −, Ajustar). Añadir pone el nodo nuevo debajo del seleccionado y ya conectado. Teclado completo: Tab por nodos y conexiones, flechas para mover, Intro / F2 para renombrar, C para conectar y Supr para borrar, con anuncios. `[(view)]=\"list\"` es una alternativa sin lienzo para editar el flujo con lector de pantalla. Validación (`issues`, `cbValidateFlow`: inicio o fin que faltan, nodos sin salida o inalcanzables, decisiones con una sola salida o sin etiquetas) y orden por niveles (`layout()`, `cbLayoutFlow`). `readonly` con `nodeOpen`, `[(selected)]`, `showValidation`, `fitOnLoad`. Textos nuevos: `flow*`. 174 entry points."
          },
          {
            "component": "PDF Viewer, anotaciones y firma",
            "text": "con `annotatable`, la barra añade Resaltar (texto seleccionado, también con el teclado), Nota (texto sobre la página), Dibujar (a mano alzada) y Firmar (diálogo con `cb-signature-pad`; la firma se recorta, se coloca en la página visible, se arrastra y cambia de tamaño), con cuatro colores (`annotationColor`) y `author`. `[(annotations)]` (`CbPdfAnnotation`: `highlight`, `note`, `ink`, `signature`) usa puntos PDF, así que no depende del zoom ni del giro. Descargar, Imprimir y `save()` las escriben en el PDF como anotaciones estándar (Highlight con comentario, FreeText, Ink y Stamp) que se ven en cualquier lector. Cada anotación es un botón con nombre: flechas para mover, + / − para el tamaño, Intro para editar la nota o el comentario y Supr para borrar, con anuncios; pestaña Anotaciones en el panel lateral; `[(tool)]` y Escape para soltarla; eventos `annotationAdd` y `annotationRemove`. La impresión toma una sola copia de los campos para todas las páginas (antes una por página). Textos nuevos: `pdfAnnotate`, `pdfHighlight`… `pdfDownloadAnnotated`."
          },
          {
            "component": "Utilidades responsive",
            "text": "las utilidades de layout, flex, grid, alineación, espaciado, tamaño, posición y tipografía tienen variantes `sm:`, `md:`, `lg:`, `xl:` y `2xl:` (mobile-first, desde 576, 768, 992, 1200 y 1400 px): `cb-grid-cols-1 md:cb-grid-cols-3`, `cb-hidden lg:cb-block`, `cb-p-3 lg:cb-p-6`. Van al final del CSS, así que ganan a la clase sin prefijo. Núcleo: `CbBreakpoints` da el breakpoint como signals (`current()`, `up()`, `down()`, `between()` y `matches()` para cualquier media query), sin listeners repetidos y seguro en SSR; `CB_BREAKPOINTS` con los anchos."
          },
          {
            "component": "Componente nuevo: `NotificationCenter`",
            "text": "(`@caribeng/ui/notification-center`): campana con el número de avisos sin leer (en su nombre accesible y en un contador \"99+\") que abre un panel (`role=\"dialog\"`, CDK Overlay) con la lista agrupada por fecha (Hoy, Ayer, Anteriores; `groupByDate`), filtro Todas / No leídas (`[(filter)]`), marcar como leída o no leída una o todas, eliminar (`removable`) y acciones propias por aviso (`actions`, `actionClick`). Cada aviso muestra la foto o las iniciales de una persona (`person`) o un icono por `severity`, y fecha relativa. Los avisos nuevos se anuncian (`aria-live`); Escape, Tab fuera o un clic fuera cierran y el foco vuelve a la campana. `heading` cambia el título e `inline` lo pinta en la página. `[(notifications)]`, `[(open)]` y eventos `itemClick`, `readChange`, `markAll`, `itemRemove` y `viewAll`. Textos nuevos: `notifications*`. 167 entry points."
          },
          {
            "component": "Componente nuevo: `SignaturePad`",
            "text": "(`@caribeng/ui/signature-pad`): firma con ratón, dedo o lápiz sobre SVG (trazo suavizado con curvas, más fino cuanto más rápido y más grueso con presión; un toque es un punto) o, como alternativa accesible, escribiendo el nombre en letra manuscrita (`mode`, `typing`). `[(value)]` es la firma como data URL en `format` (PNG por defecto, JPEG o SVG vectorial), también con Angular Forms (`required`, `disable()`). Deshacer trazo, borrar, `penColor`, `background` (`transparent`), `minWidth` / `maxWidth`, línea de firma con ×, `readonly`; una firma que llega en `value` se muestra de fondo. Métodos `data()` / `setData()` para guardar los trazos, `toSvg()` y `toDataUrl()`. Textos nuevos: `signature*`. 168 entry points."
          },
          {
            "component": "Componente nuevo: `ImageCropper`",
            "text": "(`@caribeng/ui/image-cropper`): recortador de imagen independiente (el cálculo del recorte del Editor pasa aquí y el Editor lo reutiliza). Recuadro que se mueve y redimensiona con ratón, dedo o teclado (`role=\"slider\"` con el tamaño en % y en píxeles; flechas, Ctrl + flechas, Mayús + flechas, Enter), proporciones (`[(ratio)]`, `ratios`), `shape=\"circle\"` para fotos de perfil (PNG transparente), giro de 90° (`rotatable`), vista previa (`preview`) y selección de archivo con botón o arrastrándolo (`chooser`, `fileSelect`). `output` fija formato, calidad y tamaño máximo; `cropped` da `{ blob, dataUrl, rect, width, height }` y `crop()` lo devuelve sin botón. `[(rect)]` en fracciones de la imagen. Funciones exportadas: `cropImage`, `rotateImage`, `outputSize`, `previewStyle`… Textos nuevos: `cropper*`. 169 entry points."
          },
          {
            "component": "Componente nuevo: `InfiniteScroll`",
            "text": "(`@caribeng/ui/infinite-scroll`): pide la siguiente página (`loadMore`, con su origen `scroll`, `button` o `retry`) al acercarse al final (IntersectionObserver, `threshold`), en la página o en el propio componente (`scrollable`, `height`). Tras `autoLimit` cargas automáticas pasa a \"Cargar más\" para que el pie siga siendo alcanzable, y `mode=\"button\"` solo carga con el botón (también sin IntersectionObserver). `[loading]`, `[hasMore]`, `[error]` (con Reintentar) y `[count]`: anuncia cuántos llegaron, marca `aria-busy` y, tras Cargar más, enfoca el primer elemento nuevo (`itemSelector`). Detecta también las cargas síncronas. Textos nuevos: `infinite*`. 170 entry points."
          },
          {
            "component": "Componente nuevo: `Masonry`",
            "text": "(`@caribeng/ui/masonry`): rejilla de columnas con elementos de alturas distintas y sin huecos sobre CSS Grid (filas de 4 px; cada elemento ocupa las que pide su alto, medido con ResizeObserver, también al cargar imágenes o al llegar elementos nuevos). A diferencia de las columnas de CSS, conserva el orden del DOM, que es el visual por filas (accesible para teclado y lectores de pantalla). `columns` fijo o `minColumnWidth` adaptable, y `gap`. 171 entry points."
          },
          {
            "component": "Componente nuevo: `MediaPlayer`",
            "text": "(`@caribeng/ui/media-player`): reproductor de vídeo y audio (`kind`) con controles propios siempre visibles: reproducir / pausar, retroceder y avanzar (`skipSeconds`), barra de progreso y volumen (sliders nativos con el valor hablado: \"1 min 5 s de 4 min\"), silencio, velocidad (`rates`), subtítulos WebVTT con selector de idioma (`tracks`), imagen en imagen y pantalla completa. Atajos como los de YouTube (Espacio / K, flechas, J / L, 0–9, M, F, C) que respetan el control enfocado, y anuncios de los cambios. En audio, título (`heading`, `subtitle`) y transcripción proyectada (`cbMediaTranscript`, en un `details`). `src` o `sources`, `poster`, `loop`, `muted`, `preload`, `crossorigin`; métodos `play()`, `pause()`, `toggle()`, `seekTo()`; eventos `played`, `paused`, `ended`, `timeUpdate` y `mediaError`. Textos nuevos: `media*`. 172 entry points."
          },
          {
            "component": "Núcleo",
            "text": "`cbRelativeTime(date, now, locale, justNow)` da la fecha relativa (\"hace 5 minutos\", \"ayer\") en el idioma indicado y, a partir de una semana, la fecha corta. La usan Comments y NotificationCenter."
          },
          {
            "component": "Componente nuevo: `Comments`",
            "text": "(`@caribeng/ui/comments`): hilo de comentarios y actividad. Comentarios con formato y @menciones sobre `cb-editor` (barra mínima, `mentions` o `people`), respuestas de un nivel, reacciones con emoji (`reactions`, dicen quién reaccionó), edición y borrado de los propios con confirmación en línea (un comentario con respuestas queda como \"Comentario eliminado\"), Ctrl + Enter para enviar y, mezclado por fecha, el historial de cambios (`activity`) con filtro Todo / Comentarios / Actividad. `[(comments)]` es una lista plana con `parentId`; el HTML se sanea al guardarlo y al pintarlo. Eventos `commentAdd` / `commentEdit` (con los ids mencionados), `commentDelete` y `reactionToggle`. Textos nuevos: `comments*`. 166 entry points."
          },
          {
            "component": "Componente nuevo: `Dynamic Form`",
            "text": "(`@caribeng/ui/dynamic-form`): formulario que se arma a partir de un esquema JSON. 18 tipos de campo (texto, correo, contraseña, teléfono, URL, número, área de texto, lista, multiselección, opciones, botones, casilla, interruptor, fecha, deslizador, valoración, chips y color) con los controles de CaribeNG conectados a Angular Forms; validación (`required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, validadores propios) con mensajes traducidos o personalizados. Disposición `vertical` u `horizontal` (`labelWidth`), rejilla de `columns` columnas con `colSpan` por campo, secciones con título y columnas propias, y paso automático a una columna en contenedores estrechos. Condiciones en JSON (`visibleWhen`, `requiredWhen`, `disabledWhen`), `[(value)]`, resumen de errores enlazado al enviar y eventos `formSubmit`, `formInvalid` y `formReset`. 173 entry points."
          },
          {
            "component": "Componente nuevo: `Data Grid`",
            "text": "(`@caribeng/ui/datagrid`): tabla editable como una hoja de cálculo. Celdas con tipo (`text`, `number`, `select`, `date`, `checkbox`) que se editan con Enter, F2, doble clic o escribiendo encima; números con coma o punto decimal, validación por columna (`required`, `min`, `max`, `validate`) con las celdas con error marcadas y contadas en la barra, y `format` para columnas calculadas. Selección de rangos con Mayús + flechas o arrastrando, copiar, cortar y pegar en TSV (Excel y Google Sheets; un valor rellena todo el rango y pegar de más añade filas), Supr para borrar, Ctrl + D para rellenar hacia abajo, deshacer y rehacer, ordenar por columna, añadir y eliminar filas, marca de celdas cambiadas, `getChanges()`, `markClean()`, `isValid()` y eventos `cellChange`, `rowAdd` y `rowsDelete`. Grid accesible con una sola parada de tabulación y cada cambio anunciado. 165 entry points."
          },
          {
            "component": "Componente nuevo: `Scheduler`",
            "text": "(`@caribeng/ui/scheduler`): calendario de eventos con vistas de mes, semana, día y agenda (`[(view)]`, `[(date)]`, navegación y Hoy). En semana y día, franjas horarias con los eventos solapados uno al lado del otro, franja de día completo y línea de la hora actual; se arrastra para mover (también entre días) y para cambiar la duración, y arrastrando o haciendo clic en una franja vacía se elige un hueco (`slotSelect`). En el mes, punto y hora por evento, barras para los de día completo, «+N más» y arrastre entre días. Teclado completo (flechas, Mayús + flechas, Enter, botón «Nuevo evento el…» en cada día) con cada cambio anunciado, `editable`, `firstDayOfWeek`, `slotMinutes`, `scrollHour`, `agendaDays` y eventos `eventChange`, `eventOpen` y `slotSelect`. 164 entry points."
          },
          {
            "component": "Componente nuevo: `Gantt`",
            "text": "(`@caribeng/ui/gantt`): tabla de tareas en árbol (`role=\"treegrid\"`, grupos plegables, columnas configurables) y barras en el tiempo con escalas de día, semana y mes (`[(scale)]`), línea de hoy y botón Hoy. Se arrastra para mover, cambiar inicio o fin y avance; el conector crea dependencias fin → inicio (sin ciclos) y un clic en la flecha la quita; con `autoSchedule` (por defecto) las tareas dependientes se desplazan solas. Grupos calculados con sus tareas, hitos en rombo, teclado completo (flechas, Mayús/Alt + flechas, + / −, Supr, Enter) con cada cambio anunciado, `readonly`, y eventos `taskChange`, `taskOpen`, `linkAdd` y `linkRemove`. 163 entry points."
          },
          {
            "component": "Editor, fase 3",
            "text": "**lenguaje del bloque de código** en su propia barra (TypeScript, JavaScript, HTML, CSS, SCSS, JSON, Bash, Python, SQL) con coloreado que se guarda en el HTML y se rehace al salir del bloque, y botón Copiar código; **pie de imagen** (`<figure>` + `<figcaption>`, que se lleva el ancho y la alineación); **combinar y separar celdas** (a la derecha, abajo; el saneador ya respeta `rowspan`); **desplegables** (`<details>` / `<summary>`, herramienta `details`); **índice** automático de los títulos (`<nav data-type=\"toc\">`, herramienta `toc`, ids en los títulos); **menciones** con `@` (`mentions`: lista o búsqueda asíncrona; `mentionAdd`, `getMentions()`; tipos `CbEditorMention` y `CbEditorMentionSource`); y **autoguardado** del borrador en el navegador (`autosaveKey`, `autosaveDelay`, aviso para restaurar o descartar, `clearDraft()`)."
          },
          {
            "component": "PDF Viewer, nivel 2",
            "text": "pestaña **Índice** en el panel lateral con los marcadores del documento (subniveles plegables, negrita y cursiva) y `sidebarView` (`'thumbnails' | 'outline'`); **enlaces** internos (llevan a la página y a la posición del destino) y externos (otra pestaña, solo http(s), mailto y tel; `externalLinks` los desactiva); **formularios** rellenables (texto, área de texto, desplegables, casillas y opciones; `forms` en `false` los pinta como imagen). Descargar e Imprimir incluyen lo escrito; nuevos `getFormData()` (valores por nombre de campo), `save()` (el PDF relleno como `Blob`), `goToDestination()`, `formModified` y el evento `formChange`. Tipos `CbPdfOutlineItem` y `CbPdfFormValue`. El showcase añade un PDF de solicitud con índice, enlaces y formulario."
          },
          {
            "component": "Breadcrumb",
            "text": "un elemento con `command` y sin `url` se pinta como botón y se puede pulsar (antes era texto); también emite `itemClick`."
          },
          {
            "component": "Showcase, File Manager",
            "text": "carpetas anidadas con ruta navegable (`cb-breadcrumb`), subida de archivos con botón o arrastrándolos, nueva carpeta, mover a otra carpeta, descarga de los archivos subidos, eliminación en cascada con confirmación, y almacenamiento y categorías calculados a partir de los archivos. Las acciones de los menús usan `command`."
          },
          {
            "component": "Showcase",
            "text": "el Editor abre con «Todo en un editor», un documento con todas sus funciones (tabla, imagen, código, tareas, cita, fuentes, alineación…), y el PDF Viewer tiene un ejemplo por funcionalidad (búsqueda, giro, barra reducida, descargar e imprimir, eventos y errores, formulario como imagen, `save()`)."
          }
        ]
      },
      {
        "type": "fixed",
        "items": [
          {
            "component": "Componentes contables en móvil",
            "text": "en contenedores estrechos `Aging`, `Pivot` y `TreeTable` (también `FinancialReport`) dejan fija la primera columna y la parten en varias líneas, así se ven los importes; `Document` se reacomoda y cada línea pasa a ser una ficha con sus datos (antes había que desplazarlo de lado); `AccountPicker` ya no se sale de su contenedor con rutas largas y las casillas de `Reconciliation` son más grandes."
          },
          {
            "component": "`AuditLog`",
            "text": "dice «1 cambio» en singular."
          },
          {
            "component": "`Gantt` en móvil",
            "text": "en contenedores estrechos la tabla solo muestra la tarea (antes las columnas de fechas se montaban sobre el diagrama)."
          },
          {
            "component": "`Scheduler` en móvil",
            "text": "en la vista de semana los días conservan un ancho legible y se desplazan de lado con la columna de horas fija, y la vista se abre en el día de hoy."
          },
          {
            "component": "`TreeTable`",
            "text": "en contenedores estrechos el nombre se parte con sangría y no baja por debajo de la flecha."
          },
          {
            "component": "`CascadeSelect` y `TreeSelect`",
            "text": "el panel se abre en un overlay del CDK, así que ya no lo recorta un contenedor con `overflow` (tarjetas, diálogos, tablas), se recoloca si no cabe y se cierra al hacer clic fuera. En `CascadeSelect` las listas se estrechan en móvil."
          },
          {
            "component": "`InputOtp` y `PhoneInput` en móvil",
            "text": "las casillas del código se estrechan para caber y el teléfono ya no se sale de su contenedor."
          },
          {
            "component": "`TieredMenu`",
            "text": "tocar una opción con submenú ya lo abre en pantallas táctiles (antes el `mouseenter` emulado lo abría y el `click` lo volvía a cerrar), y en pantallas estrechas los submenús se anidan debajo de su opción en lugar de salirse por la derecha."
          },
          {
            "component": "`TabMenu` en móvil",
            "text": "si las pestañas no caben, la lista se desplaza de lado (antes la última quedaba cortada e inalcanzable)."
          },
          {
            "component": "`InputNumber`",
            "text": "en modo de solo lectura conserva el formato al recibir el foco."
          },
          {
            "component": "`InputNumber`",
            "text": "al entrar en el campo (con Tab o clic), el valor queda seleccionado, así que lo que se escribe lo reemplaza; antes se añadía al final y las primeras teclas actuaban sobre el texto con formato. En modo moneda usa 2 decimales en todos los navegadores (0 en monedas sin centavos): antes Chrome redondeaba los pesos a enteros."
          },
          {
            "component": "Contraste y modo oscuro de los componentes contables (WCAG AA)",
            "text": "nuevos tokens `--cb-color-primary-text`, `--cb-color-success-text`, `--cb-color-warning-text` y `--cb-color-danger-text`, oscuros en el tema claro y claros en el oscuro. Los usan los importes negativos, errores, variaciones, estados y enlaces de Table, TreeTable, Data Grid, Amount, Kpi, JournalEntry, Reconciliation, Aging, AuditLog, ImportWizard, Pivot, PeriodPicker y Dynamic Form."
          },
          {
            "component": "Accesibilidad",
            "text": "la tabla dinámica ya no pone `aria-level` en filas de una tabla normal; el área con scroll de `Table` (`scrollHeight`) es una región enfocable con nombre."
          },
          {
            "component": "Móvil",
            "text": "la conciliación pasa la descripción bajo la fecha y el importe en contenedores estrechos, y el documento imprimible se desplaza dentro de su recuadro."
          },
          {
            "component": "Avatar",
            "text": "en modo oscuro, `severity=\"secondary\"` (la de por defecto) pintaba las iniciales blancas sobre un fondo claro, ilegibles: la regla oscura (`:host-context(...):host(...)`) nunca se aplicaba. Ahora usa el token `--cb-color-border`, que cambia con el tema."
          },
          {
            "component": "Editor",
            "text": "los estilos del contenido (títulos, listas, tareas con casilla, citas, código en línea y en bloque, tablas, imágenes y líneas) no se aplicaban: el HTML entra sin los atributos de la encapsulación emulada. Ahora esas reglas se limitan al editor con `:host ::ng-deep`."
          },
          {
            "component": "FileCard",
            "text": "un título largo se recorta con puntos suspensivos en lugar de montarse sobre los valores de la derecha."
          }
        ]
      }
    ]
  },
  {
    "version": "22.4.0",
    "date": "2026-10-23",
    "sections": [
      {
        "type": "added",
        "items": [
          {
            "component": "ColorPicker",
            "text": "accesible con teclado: al abrir, el foco entra en el panel; el área de saturación y brillo y la barra de tono son `role=\"slider\"` (flechas, Mayús + flechas de 10 en 10, Inicio / Fin en el tono) y anuncian su valor; Tab al salir del panel lo cierra y devuelve el foco al botón. Claves de idioma nuevas: `colorArea`, `colorAreaValue` y `hue`."
          },
          {
            "component": "TieredMenu",
            "text": "patrón WAI-ARIA *menu*: flecha abajo en el botón abre el menú y el foco entra en la primera opción; flechas, Inicio y Fin recorren cada nivel; flecha derecha, Enter o Espacio abren el submenú y flecha izquierda vuelve al nivel anterior; Escape, Tab o elegir una opción cierran y devuelven el foco al botón."
          },
          {
            "component": "Dock",
            "text": "patrón WAI-ARIA *toolbar*: un solo elemento en el orden de tabulación y flechas (según la orientación), Inicio y Fin para recorrer las acciones."
          },
          {
            "component": "Stepper",
            "text": "cada paso se nombra con su posición y su etiqueta (\"Paso 2 de 3: Perfil\") y añade \"completado\" a los que ya pasaron; antes el botón solo decía el número, o nada si el paso estaba completado. Clave de idioma nueva: `stepCompleted`."
          },
          {
            "component": "InputMask",
            "text": "`inputId` para asociar el campo a un `<label for>`."
          },
          {
            "component": "DataView",
            "text": "el botón de seleccionar de la plantilla por defecto se nombra con su elemento (\"Seleccionar Producto 1\")."
          },
          {
            "component": "ScrollTop",
            "text": "con \"reducir movimiento\" en el sistema, el desplazamiento es instantáneo aunque `behavior` sea `smooth`."
          },
          {
            "component": "Ripple",
            "text": "con \"reducir movimiento\" en el sistema, no dibuja la onda."
          },
          {
            "component": "Badge",
            "text": "`ariaLabel` para darle un nombre con contexto (\"3 mensajes sin leer\"); un `dot` sin nombre queda oculto a los lectores de pantalla."
          },
          {
            "component": "Pricing",
            "text": "las características no incluidas se anuncian con \"(no incluido)\", no solo con el color, y el conmutador mensual / anual de la vista de cuadrícula es un grupo nombrado con `aria-pressed`. Clave de idioma nueva: `notIncluded`."
          },
          {
            "component": "Showcase",
            "text": "sección Accesibilidad en 51 páginas más: Button, Chips, ColorPicker, FileUpload, FloatLabel, IconField, InputGroup, InputMask, Knob, Password, ToggleButton, Breadcrumb, Dock, Menubar, PanelMenu, SpeedDial, Steps, TabMenu, TieredMenu, Accordion, Card, Divider, Fieldset, Panel, ScrollPanel, ScrollTop, Splitter, Stepper, Toolbar, DataView, OrganizationChart, Paginator, Timeline, AnimateOnScroll, AutoFocus, Avatar, AvatarGroup, Badge, Chip, FileCard, FocusTrap, FolderCard, InlineMessage, Message, Pricing, ProgressBar, Ripple, Skeleton, Spinner, StyleClass y Tag."
          },
          {
            "component": "Kanban, espacio de trabajo",
            "text": "una `<ng-template cbKanbanCard>` dentro de `cb-kanban-workspace` se usa como plantilla de las tarjetas del tablero (antes no llegaba). `cb-kanban` acepta también la plantilla como input (`cardTemplate`); la proyectada tiene prioridad."
          }
        ]
      },
      {
        "type": "changed",
        "items": [
          {
            "component": "Chart",
            "text": "sin `locale`, los números y las fechas se formatean con el idioma activo de CaribeNG (`intlLocale`, español por defecto) en lugar del idioma del navegador o del sistema, igual que el resto de componentes. Para el comportamiento anterior, pasa `[locale]=\"navigator.language\"`."
          }
        ]
      },
      {
        "type": "fixed",
        "items": [
          {
            "component": "Accordion / Fieldset / Panel",
            "text": "`aria-controls` apuntaba al contenido también cerrado, cuando ese elemento no existe; ahora solo mientras está abierto. En Panel, la región se nombraba con toda la cabecera (el título se leía dos veces) y ahora solo con el título."
          },
          {
            "component": "OrganizationChart",
            "text": "usaba `role=\"tree\"` / `treeitem` sin la navegación con flechas del patrón y con botones dentro (ARIA inválido); ahora es un grupo nombrado de listas anidadas y el nodo elegido expone `aria-pressed`."
          },
          {
            "component": "Message / InlineMessage",
            "text": "todas las severidades usaban `role=\"alert\"`, que interrumpe al lector de pantalla; ahora solo `danger` y `warning` (`warn` en InlineMessage), y el resto usa `role=\"status\"`."
          },
          {
            "component": "Avatar",
            "text": "con imagen y `ariaLabel`, el nombre se leía dos veces (en el host y en el `alt` de la imagen); la imagen ahora tiene `alt=\"\"`."
          },
          {
            "component": "Distribución",
            "text": "la 22.3.0 no llegó a publicarse en npm porque `pnpm-lock.yaml` no recogía el peer opcional `pdfjs-dist`; sus cambios (abajo) se publican con esta versión."
          }
        ]
      }
    ]
  },
  {
    "version": "22.3.0",
    "date": "2026-10-22",
    "sections": [
      {
        "type": "breaking",
        "items": [
          {
            "component": "Pricing",
            "text": "`layout=\"horizontal\"` pone ahora todas las tarjetas en una sola fila (con scroll si no caben), el título a la izquierda y el selector de facturación a la derecha; el plan destacado lleva un degradado del color primario. Para seguir mostrando cada plan como una fila usa `layout=\"list\"`."
          }
        ]
      },
      {
        "type": "added",
        "items": [
          {
            "component": "Componentes nuevos",
            "text": "`Kanban` (tablero con columnas y tarjetas que se reordenan y se mueven arrastrando con `@angular/cdk/drag-drop` o con el teclado —Espacio toma y suelta, flechas mueven, Escape cancela— con cada paso anunciado; límite por columna con `enforceLimit`, plantilla `cbKanbanCard`, `[(columns)]`, `cardMove` y `cardOpen`; toda la columna es zona de soltar —también sobre otras tarjetas o la cabecera— y el tablero se desplaza solo hacia las columnas ocultas; con `editable`, menú en cada tarjeta para editar el título, moverla a otra columna o eliminarla (F2 y Supr con el teclado, confirmación con `confirmDelete`); con `addable`, campo para añadir tarjetas (`createCard`); con `columnsEditable`, renombrar, eliminar y añadir columnas; con `collapsible`, contraerlas; eventos `cardAdd`, `cardEdit`, `cardDelete`, `columnAdd`, `columnRename` y `columnDelete`; con `details`, panel lateral de la tarea (`CbKanbanTask`) para cambiar la columna, asignar responsables (`people`), elegir la prioridad (`priorities`), poner fechas de inicio y fin, escribir la descripción con el editor enriquecido (`cb-editor`, se guarda como HTML y la tarjeta la muestra como texto) y adjuntar archivos, con cada cambio aplicado al momento; la tarjeta por defecto muestra prioridad, fechas —en rojo si está vencida—, adjuntos y avatares) y `Mentions` (textarea con `@`/`#` y sugerencias junto al cursor, filtro sin tildes, teclado con `aria-activedescendant`, modo servidor con `search` + `loading`, `ControlValueAccessor` y `mentionsChange` con las menciones presentes; `cbCaretCoordinates()` exportado). 162 entry points. `Drawer` admite `size` (ancho o alto del panel)."
          },
          {
            "component": "Kanban, vista de lista",
            "text": "`cb-kanban-list` muestra las tareas como una tabla con una sección contraíble por columna (responsables, fechas —\"Hoy\" y vencidas— y prioridad), filas que se arrastran entre secciones o se mueven con Alt + ↑/↓, círculo para marcar la tarea como finalizada (`completed`, también visible en la tarjeta del tablero), \"Añadir tarea\" por sección y en la barra, y secciones que se renombran y se añaden. Comparte `[(columns)]`, eventos y panel de detalle con `cb-kanban` (base común `CbKanbanView`), así que varias vistas se pueden mostrar a la vez sobre los mismos datos. Textos nuevos en el idioma: `kanbanTaskName`, `kanbanAddTask`, `kanbanAddSection`, `kanbanCompleted`, `kanbanMarkComplete`, `kanbanMarkIncomplete`, `kanbanSectionCount` y `kanbanListInstructions`."
          },
          {
            "component": "Kanban, vista de calendario",
            "text": "`cb-kanban-calendar` pinta el mes (`[(viewDate)]`, `firstDayOfWeek`, lunes por defecto) con cada tarea como una barra de su fecha de inicio a la de fin, del color de su columna y repartida en carriles; las que cruzan semanas siguen en la siguiente. Con `editable`, la barra se arrastra a otro día (o Alt + flechas: ←→ un día, ↑↓ una semana) manteniendo la duración, y el calendario sigue a la tarea si cambia de mes; con `addable`, \"Añadir tarea\" en cada día la crea con esa fecha en `newTaskColumn`. \"Sin fecha (n)\" lista las tareas sin fechas. Comparte `[(columns)]` y el panel de detalle con las demás vistas. `addCard()` admite campos extra. Textos nuevos: `kanbanNoDate`, `kanbanAddTaskOn`, `kanbanWeekOf`, `kanbanCalendarInstructions` y `kanbanRescheduled`."
          },
          {
            "component": "Kanban, cronograma",
            "text": "`cb-kanban-timeline` es un diagrama de Gantt sobre el mismo `[(columns)]`: una fila por sección (contraíble, con contador) y cada tarea como una barra de `startDate` a `endDate` en carriles, con la línea de hoy, meses y fines de semana. Con `editable`, la barra se arrastra para cambiar las fechas o pasarla a otra sección, y sus bordes cambian el inicio o el fin; con el teclado, Alt + ←→ (un día), Alt + Mayús + ←→ (fecha de fin) y Alt + ↑↓ (sección), y el rango sigue a la tarea. `[(viewDate)]` (primer día), `span` (días visibles), ‹ › por semanas, \"Hoy\", `[(zoom)]` con − +, \"Sin fecha (n)\", \"Añadir tarea\" por sección (empieza hoy) y \"Añadir sección\" con `columnsEditable`."
          },
          {
            "component": "Kanban, panel de resumen",
            "text": "`cb-kanban-dashboard` calcula desde el mismo `[(columns)]` los indicadores de tareas finalizadas (`completed`), sin finalizar, con retraso (fin pasado sin finalizar, en rojo) y total, con su porcentaje, y los gráficos (`cb-chart`) de tareas sin finalizar por sección y por responsable, por estado (dona: finalizadas, a tiempo, con retraso) y de entregas por semana (apiladas). `widgets` elige los bloques y su orden; `headingLevel`, `chartHeight` y `animate`. Los datos de cada gráfico se exponen como señales (`bySection`, `byStatus`, `byAssignee`, `byWeek`)."
          },
          {
            "component": "Kanban, espacio de trabajo",
            "text": "`cb-kanban-workspace` reúne Lista, Tablero, Cronograma, Panel y Calendario sobre un mismo `[(columns)]`. Los botones de arriba encienden y apagan cada vista, así que se ven varias a la vez (`[(views)]` es una lista), una debajo de otra o lado a lado (`[(sideBySide)]`, que se apila en pantallas estrechas); cada vista tiene su título y un botón para ocultarla. `available` elige y ordena las vistas, `multiple = false` las convierte en pestañas y `headingLevel` fija el nivel de los títulos. Pasa a cada vista las mismas opciones (`details`, `editable`, `addable`, `people`…) y reemite sus eventos."
          },
          {
            "component": "Pricing",
            "text": "`layout=\"list\"` (cada plan en una fila, la vista que antes era `horizontal`). En `horizontal`: `subtitle` con icono de ayuda, selector de facturación como grupo de opciones (Paga anualmente / Paga mensualmente, flechas, Inicio y Fin) con `annualBadge` (\"25% OFF\"), y `annualDisplay` (`monthly` por defecto en `horizontal`: precio anual expresado por mes con \"Facturado $X anualmente\" y \"Ahorras $Y\"). Los planes admiten `badge` (el destacado muestra \"Recomendado\") y cada característica su `icon`. Los importes se formatean con el idioma activo (`122.925`)."
          },
          {
            "component": "Chat (IA), nivel 2",
            "text": "`cb-chat-reasoning` (razonamiento plegable: \"Pensando…\" con brillo mientras llega y \"Razonó durante N s\" al terminar), `cb-chat-tool` (llamada a herramienta con estado Usando/Usó/Falló, anunciado, y entrada y resultado como JSON resaltado), adjuntos en `cb-chat-message` (miniaturas de imagen y tarjetas de archivo) y en `cb-chat-input` (miniaturas antes de enviar, con las URL temporales liberadas), valoración 👍/👎 (`showFeedback`, `[(feedback)]`, `aria-pressed`) y \"Regenerar respuesta\". Los bloques de código del mensaje se pintan con `cb-code-block` (`cbMarkdownToBlocks()`)."
          },
          {
            "component": "Componentes nuevos",
            "text": "`PhoneInput` (teléfono internacional con selector de país —bandera, nombre localizado con `Intl`, prefijo y buscador con teclado—, formato al escribir sin mover el cursor, detección del país al pegar `+`/`00`, 0 nacional, valor E.164 con `ControlValueAccessor` y validador `{ phone: true }`; ~50 países en `CB_PHONE_COUNTRIES`, ampliables) y `CodeBlock` (resaltado propio sin dependencias para TS/JS, HTML/Angular, CSS/SCSS, JSON, Bash, Python y SQL, pintado como texto, con copiar, números de línea, líneas destacadas, `wrap` y tema claro/oscuro; `cbHighlight()` exportado). 160 entry points. Locale: `intlLocale`, `phoneCountry`, `searchCountry` y `phoneInvalid`."
          },
          {
            "component": "Chat (IA)",
            "text": "`@caribeng/ui/chat` con `cb-chat-message` (burbuja de usuario, asistente o sistema con autor, hora, avatar, estado de envío con Reintentar, botón de copiar y cursor de streaming), `cb-chat-messages` (`role=\"log\"` que sigue la conversación sin forzar el scroll si el usuario subió, botón \"Ir al último mensaje\", indicador de escritura y `aria-busy` mientras se genera, con un único aviso \"Respuesta lista\") y `cb-chat-input` (prompt que crece con el texto, Enter envía respetando IME, adjuntos con botón, pegar o arrastrar y filtro `accept`, sugerencias, contador y Detener). `cbMarkdownToHtml()` propio y seguro: escapa todo el HTML de entrada, solo enlaza http(s)/mailto/relativas y tolera markdown incompleto en streaming (listas, tareas, tablas, citas y código con lenguaje). 158 entry points."
          },
          {
            "component": "Componentes nuevos",
            "text": "`CommandPalette` (Ctrl/⌘ + K: buscador global de páginas y acciones con grupos, sinónimos, atajos con `cb-kbd`, resaltado, filtro sin tildes, items deshabilitados y modo servidor con `[filter]=\"false\"` + `loading`; combobox con `aria-activedescendant` y foco devuelto al cerrar), `Sidebar` (secciones, badges, grupos desplegables, modo contraído con tooltip, `aria-current` y navegación SPA con `[navigate]`) y `AppShell` (esqueleto sidebar + cabecera + contenido que, por debajo de `breakpoint` medido en el propio shell, convierte el menú en panel deslizante con fondo, `inert`, foco atrapado y Escape; directiva `cbSidebarToggle`). 157 entry points. Textos nuevos en el idioma: `commandPalette`, `commandPlaceholder`, `commandResults`, `commandNavigate`, `commandSelect`, `expandSidebar`, `collapseSidebar` y `openMenu`."
          },
          {
            "component": "Componentes nuevos",
            "text": "`Kbd` (teclas y atajos; `[keys]=\"['mod', 'K']\"` muestra ⌘ K en Mac y Ctrl + K en el resto, con el nombre de los símbolos para lectores de pantalla), `CopyButton` (copia al portapapeles con confirmación ✓ anunciada en `role=\"status\"`; incluye la directiva `cbCopy` y el servicio `CbClipboard` con alternativa para navegadores sin API de portapapeles) y `QRCode` (QR en SVG con codificador propio sin dependencias: modos numérico, alfanumérico y UTF-8, versiones 1–40, niveles L/M/Q/H, máscara automática, color, margen, logo centrado y `toSvg()`; `cbQrEncode()` exportado para otros usos). 155 entry points. Textos nuevos en el idioma: `copy`, `copied`, `copyFailed` y `qrCode`."
          },
          {
            "component": "FolderCard / FileCard",
            "text": "`actions` muestra un botón ⋮ accesible con un menú (`actionSelect`), y `clickable` hace pulsable toda la tarjeta (`open`) sin interferir con el menú. La plantilla File Manager del showcase pasa a ser funcional (filtro por categoría, `cb-table` con menú por fila, renombrar y eliminar)."
          },
          {
            "component": "Utilidades CSS",
            "text": "de 44 a 277 clases: espaciado por eje y lado (`cb-px-*`, `cb-mt-*`, escala 0–8, `cb-mx-auto`), gap por eje, grid de 1–12 columnas y `cb-col-span-*`, flex (`cb-grow`, `cb-shrink-0`, `cb-self-*`), posición y desbordamiento, tipografía (`cb-text-xs…2xl`, `cb-font-*`, `cb-truncate`), color de texto y fondos por severidad (`cb-text-success`, `cb-bg-danger-subtle`…), bordes, radios y sombras. Todas siguen el tema claro/oscuro."
          },
          {
            "component": "Migración",
            "text": "`ng generate @caribeng/ui:migrate-from-primeng` migra un proyecto PrimeNG 18+ a CaribeNG: imports y `imports` de los componentes, plantillas de Button, InputText, Textarea, InputNumber, Select/Dropdown, MultiSelect, Checkbox, ToggleSwitch/InputSwitch, DatePicker/Calendar, Dialog, Tag, Toast, Card y Tooltip (`pTooltip` en cualquier elemento) con sus inputs y eventos (los inputs numéricos pasan a binding para compilar con strictTemplates; los radios se marcan para agruparlos en `cb-radio-group`), `MessageService` → `CbToastService` (severidades, `sticky` → `life: 0`, se quita de `providers`), iconos `pi pi-*` a `<cb-icon>` (registra con `provideCbIcons` los que no son del set núcleo), `providePrimeNG()` → `provideCaribeNG()`, estilos de `angular.json` y PrimeIcons. Lo que no traduce lo marca con `TODO(caribeng)` y lo resume en `caribeng-migration-report.md`; quita PrimeNG de `package.json` solo cuando no quedan referencias. Opciones `--path`, `--remove-primeng`, `--report`, `--skip-install` y `--force`."
          },
          {
            "component": "Instalación",
            "text": "`ng add @caribeng/ui` avisa del migrador si el proyecto usa PrimeNG."
          },
          {
            "component": "ConfirmDialog / ConfirmPopup",
            "text": "`CbConfirmationService` (en `@caribeng/ui`) pide confirmaciones desde código con `confirm({ message, header, acceptLabel, rejectLabel, acceptSeverity, accept, reject, target, key })`, como `ConfirmationService` de PrimeNG. Las muestra el `<cb-confirm-dialog service />` o `<cb-confirm-popup service />` de la vista (el popup, las que traen `target`); `key` permite tener varios. Los componentes sin `service` siguen funcionando solo con `[(visible)]`."
          },
          {
            "component": "Menús",
            "text": "los items de Menu, Menubar, TieredMenu, ContextMenu, PanelMenu, TabMenu, Breadcrumb y MegaMenu (y SplitButton, que usa los de Menu) aceptan `command` (se ejecuta al elegirlos, con `{ item, originalEvent }`, además del evento de selección) y `visible: false` para ocultarlos. `cbRunCommand`, `cbVisibleItems` y `CbMenuCommandEvent` exportados en `@caribeng/ui`."
          },
          {
            "component": "Table",
            "text": "`field` admite rutas (`cliente.nombre`) para mostrar, ordenar, filtrar, agrupar y exportar valores anidados, como en PrimeNG. Una clave que contenga el punto tiene prioridad."
          },
          {
            "component": "Migración",
            "text": "`p-table` con columnas escritas en `#header`/`#body` se convierte a `cb-table` con `[columns]` (`pSortableColumn`, `p-columnFilter`, `pFrozenColumn` y el ancho de la cabecera) y un `cbTableCell` por cada celda personalizada, con su contenido migrado; selección con checkbox o radio, `#rowexpansion`, `#emptymessage`, `#caption` y `#summary` incluidos. Las columnas dinámicas (`[columns]=\"cols\"` + `@for`/`*ngFor`) pasan a `[columns]=\"cols\"`: se añade `sortable`/`filter` a los objetos de `cols` (tipado como `CbTableColumn[]`) y las ramas `@if`/`@switch` por campo pasan a `cbTableCell`. Las tablas con celdas de lógica genérica o plantillas sin equivalente quedan con aviso y conservan `TableModule`."
          },
          {
            "component": "Migración",
            "text": "menús (`p-menu`, `p-menubar`, `p-tieredmenu`, `p-panelmenu`, `p-breadcrumb` con `home`, `p-tabmenu`, `p-splitbutton`) con sus arrays de `MenuItem` (tipo según el menú que los recibe, iconos, `routerLink` → `url`); `p-tabs` y `p-accordion` de PrimeNG 18+ se reestructuran (cabecera → `label`/`header`) y los de PrimeNG 17 (`p-tabView`, `p-accordionTab`) se traducen directamente. `p-contextmenu` y `p-megamenu` quedan con aviso."
          },
          {
            "component": "Migración",
            "text": "`p-confirmdialog`, `p-confirmpopup` y `ConfirmationService` se traducen a `cb-confirm-dialog service`, `cb-confirm-popup service` y `CbConfirmationService` (`acceptButtonProps.severity` → `acceptSeverity`, `acceptButtonProps.label` → `acceptLabel`)."
          }
        ]
      },
      {
        "type": "fixed",
        "items": [
          {
            "component": "Editor",
            "text": "al enlazar una palabra seleccionada con doble clic (que en Windows incluye el espacio siguiente) el espacio se perdía y la palabra quedaba pegada a la siguiente; ahora queda fuera del enlace."
          }
        ]
      }
    ]
  },
  {
    "version": "22.2.0",
    "date": "2026-10-21",
    "sections": [
      {
        "type": "breaking",
        "items": [
          {
            "component": "Caribe Design",
            "text": "los textos de contenido de ejemplo ya no se muestran por defecto: `title` de Header y Preloader, `label` de Shortcut, StepIndicator, TagButton y TransactionStatus, `monthLabel` de Calendar, `fileName` / `fileSize` de FileDownload y `copyright` de Footer pasan a ser `''`. Pasa el texto que necesites."
          },
          {
            "component": "OrderList",
            "text": "la selección pasa a ser por posición y se añaden los botones de mover al inicio y al final."
          },
          {
            "component": "DynamicDialog",
            "text": "`cb-dynamic-dialog` ahora se apoya en `cb-dialog` (trampa de foco, Escape y devolución del foco)."
          }
        ]
      },
      {
        "type": "added",
        "items": [
          {
            "component": "Editor",
            "text": "el valor es HTML saneado (lista blanca de etiquetas y atributos; sin scripts, eventos ni URLs `javascript:`) y normalizado (igual en todos los navegadores, `''` si está vacío), también al cargar, al pegar y en la vista de HTML; `cbSanitizeHtml` y `cbHtmlToText` exportados. Pegado limpio desde Word y Google Docs (`pastePlainText` opcional), panel de enlaces propio con validación y \"abrir en pestaña nueva\", `imageUpload` (el HTML guarda la URL) y `maxImageSize`, barra configurable (`toolbar`) con iconos y estado activo, atajos de escritura (`# `, `* `, `1. `, `> `) y de teclado, `maxLength` con contador, vista de HTML, `readonly` y `required`. Tablas (insertar con filas, columnas y encabezado; barra contextual para filas, columnas, encabezado y eliminar; Tab entre celdas), imágenes con barra de alineación (en línea, izquierda, centro, derecha), anchos y tirador para redimensionar, texto alternativo, y bloques de código que conservan los colores al pegar desde VS Code. La tabla se inserta eligiendo el tamaño en una cuadrícula, su barra tiene grupos con texto (Fila, Columna) y bordes (todos, horizontales o ninguno, con color) que se guardan en el HTML de cada celda; las imágenes se pueden recortar (libre o 1:1, 4:3, 16:9). Barra completa con menús: color de texto y resaltado (paletas), alineación (incluye justificar), tamaño de letra, Título 4, subíndice y superíndice, lista de tareas, sangría, pantalla completa; barra fija al hacer scroll, atajos en los tooltips (`aria-keyshortcuts`), contador de palabras y caracteres (`wordCount`), alto de 320 px por defecto, `maxHeight` y área redimensionable. Barra en dos filas (`'-'` en `toolbar` empieza una fila nueva); selector de fuente con tipografías libres agrupadas (`fonts`, cargadas desde Google Fonts con `fontsHref`; al pegar solo se conservan las de la lista, también en `cbSanitizeHtml({ fonts })`) y tamaño de letra en px; menú `/` para insertar bloques (`slashCommands`), menú flotante al seleccionar texto (`bubbleMenu`), enlaces automáticos al escribir o pegar una URL (`autolink`), corrección tipográfica (`typography`), caracteres especiales y emoji, buscar y reemplazar (Ctrl + F) y Alt + F10 para ir a la barra."
          },
          {
            "component": "DatePicker",
            "text": "`dateFormat` con la sintaxis de PrimeNG (`dd/mm/yy`, `DD d 'de' MM`, `@`, `!`…) y `editable` para escribir la fecha (se valida y avisa del formato esperado); los rangos muestran dos meses (`numberOfMonths`) y admiten hora de inicio y de fin; `view=\"month\"` y `view=\"year\"` para elegir un mes o un año (también en rango); el título del calendario lleva a las vistas de meses y años para saltar rápido. Atajos con `presets`: claves traducidas (`today`, `yesterday`, `last7Days`, `last30Days`, `thisMonth`, `lastMonth`, `thisYear`, `lastYear`) u objetos `{ label, value }` propios."
          },
          {
            "component": "PDF Viewer (`@caribeng/ui/pdfviewer`)",
            "text": "`cb-pdf-viewer` sobre pdf.js (`pdfjs-dist`, peer dependency opcional que se carga bajo demanda). Renderiza solo las páginas visibles, con texto seleccionable y accesible, búsqueda que ignora tildes y mayúsculas, miniaturas, zoom (ajustar al ancho, página completa o porcentaje), giro, descarga, impresión del documento y documentos con contraseña. `[(page)]`, `[(zoom)]`, `[(rotation)]` y `[(sidebar)]` bidireccionales, API pública (`goToPage`, `search`, `print`…) y `provideCbPdfViewer` para servir el worker y los recursos desde tu propio dominio."
          },
          {
            "component": "Slider",
            "text": "modo rango con dos tiradores (`range` + `[(rangeValue)]`, que no se cruzan), `showValue`, `valueFormat` / `locale` con `aria-valuetext`, y evento `rangeChanged`. Con Angular Forms, el control recibe el par `[mínimo, máximo]`."
          },
          {
            "component": "ThemeToggle",
            "text": "`cb-theme-toggle`, botón listo para alternar entre tema claro y oscuro."
          },
          {
            "component": "Componentes nuevos",
            "text": "`SplitButton` (acción principal + menú), `Empty` (estado vacío), `Descriptions` (pares etiqueta / valor), `Result` (pantallas de éxito, error y 404/403/500), `Statistic` y `Countdown` (cifras con formato y tendencia, cuenta regresiva), `KeyFilter` (directiva que limita los caracteres de un campo), `Anchor` (índice \"En esta página\" con sección activa) y `Repeater` (lista repetible de campos sobre un `FormArray`). 150 entry points."
          },
          {
            "component": "Button",
            "text": "`ariaLabel`, `ariaHaspopup`, `ariaExpanded` y `ariaControls` para botones de solo icono o que abren algo."
          },
          {
            "component": "Menu",
            "text": "evento `hidden` al cerrarse."
          },
          {
            "component": "Table",
            "text": "datos desde el servidor (`lazy`, `totalRecords`, `loading` y evento `lazyLoad` con página, orden y filtros); cabecera fija con `scrollHeight`; columnas fijas (`frozen`); agrupación de filas (`groupRowsBy` y plantilla `cbTableGroupHeader`); exportación con `exportCSV()` / `toCSV()` (BOM para Excel, `exportable: false` y `selectionOnly`)."
          },
          {
            "component": "Chart",
            "text": "tipos `area`, `horizontalBar` y `radialBar`; `stacked`; gráfico combinado (serie con `type: 'line'` dentro de `bar`); `sparkline`; eje de valores con escala legible y valores negativos; `valueFormat` (opciones de `Intl.NumberFormat` o función) y `locale`; tooltip con ratón y teclado; leyenda que oculta y muestra series; evento `itemSelect`; animación de entrada y colores por elemento (`colors`) en torta y dona."
          },
          {
            "component": "Chart",
            "text": "accesibilidad: grupo enfocable con instrucciones, recorrido con flechas anunciado en una región viva y tabla de datos equivalente para lectores de pantalla."
          },
          {
            "component": "Chart",
            "text": "seis tipos nuevos: `waterfall` (cascada con subtotales en `sums`), `gauge` (medidor con `min`, `max` y franjas `bands`), `radar`, `polarArea`, `heatmap` (flechas arriba / abajo cambian de fila) y `treemap`. Internamente cada tipo lo dibuja un renderer independiente sobre un motor común; la API `type` + `data` no cambia."
          },
          {
            "component": "Chart",
            "text": "modo composable en el mismo `<cb-chart>`: series hijas (`cb-chart-bar`, `cb-chart-line`, `cb-chart-area`, `cb-chart-scatter`, `cb-chart-range-area` y `cb-chart-candlestick`) que leen sus campos de un array de registros en `data`; `cb-chart-axis` (eje X de categorías, lineal o de tiempo, ejes Y izquierdo y derecho con título, rango y formato propios); `cb-chart-reference-line` y `cb-chart-reference-band`; apilado por `stack`, curvas `smooth` y `step`, líneas discontinuas, y `zoom` en el eje X con rueda, arrastre, teclado (`+`, `-`, `0`) y botón para restablecer."
          },
          {
            "component": "Chart",
            "text": "`cb-chart-group` sincroniza el cursor, el tooltip y el zoom entre gráficas; `xWindow` muestra los últimos minutos y la vista avanza sola con datos en tiempo real (también con el zoom pegado al final); `cb-chart-annotation` marca puntos con una etiqueta; `toSvg()`, `toPng()` y `download('png' | 'svg')` exportan el gráfico con los colores del tema y la leyenda."
          },
          {
            "component": "Instalación",
            "text": "`ng add @caribeng/ui` instala la librería, pregunta idioma, tema y color primario, registra `provideCaribeNG()` (app standalone o `AppModule`) y añade `@caribeng/ui/styles.css` a `angular.json`. Es idempotente: ejecutarlo de nuevo no duplica nada."
          },
          {
            "component": "Tokens",
            "text": "`--cb-color-surface-hover` y `--cb-color-surface-subtle`, tokens semánticos para hover y fondos suaves que cambian con el tema (en claro equivalen a `surface-100` y `surface-50`)."
          },
          {
            "component": "Table",
            "text": "filtro global (`[(globalFilter)]`, `globalFilterFields`, `filterGlobal()`) y por columna (`filter`, `filterMatchMode`: contains / startsWith / equals), sin distinguir mayúsculas ni tildes, con evento `filterChange`, `clearFilters()` y anuncio de la cantidad de resultados."
          },
          {
            "component": "Table",
            "text": "columnas redimensionables (`resizableColumns`) con ratón y teclado, y evento `columnResize`."
          },
          {
            "component": "Table",
            "text": "filas expandibles con la plantilla `cbTableRowExpansion`, `[(expandedRowKeys)]` y eventos `rowExpand` / `rowCollapse`."
          },
          {
            "component": "DatePicker",
            "text": "selección de rangos (`selectionMode=\"range\"` con `[(range)]`, previsualización bajo el puntero y aviso \"Elige la fecha final\"); con Angular Forms el control recibe `[inicio, fin]`."
          },
          {
            "component": "DatePicker",
            "text": "hora (`showTime`, `hourFormat` 24 / 12 con AM/PM, `stepMinute`)."
          },
          {
            "component": "DatePicker",
            "text": "Mayús + Re Pág / Av Pág cambian de año; cada día se nombra con su fecha completa."
          },
          {
            "component": "Select / MultiSelect",
            "text": "opciones agrupadas (`group`, `optionGroupLabel`, `optionGroupChildren`) con `role=\"group\"` nombrado por su título."
          },
          {
            "component": "Select / MultiSelect",
            "text": "scroll virtual (`virtualScroll`, `virtualScrollItemSize`, `scrollHeight`) para listas de miles de opciones, con `aria-setsize` / `aria-posinset`."
          },
          {
            "component": "Select / MultiSelect",
            "text": "búsqueda al teclear (escribir salta a la opción que empieza por lo escrito; repetir la letra recorre las coincidencias) y la opción activa se desplaza a la vista al usar las flechas."
          },
          {
            "component": "Select",
            "text": "`showClear`, botón para vaciar la selección."
          },
          {
            "component": "Table",
            "text": "selección simple con radio por fila, checkbox de cabecera con estado parcial (`mixed`) y `ariaLabel` para nombrar la tabla."
          },
          {
            "component": "DynamicDialog",
            "text": "`CbDialogService.open(Componente, { header, data, width })` abre cualquier componente en un diálogo; el componente recibe `CB_DYNAMIC_DIALOG_DATA` y se cierra con `CbDynamicDialogRef.close(resultado)`, que llega por `onClose`."
          },
          {
            "component": "Tree",
            "text": "niveles ilimitados, plantilla `cbTreeNode`, navegación con teclado (patrón WAI-ARIA *tree*), nodos deshabilitados, `expandAll()` / `collapseAll()` y eventos `nodeExpand`, `nodeCollapse` y `nodeSelect`."
          },
          {
            "component": "TreeTable",
            "text": "niveles ilimitados, `role=\"treegrid\"` con navegación con teclado y plantilla de celda `cbTreeTableCell`."
          },
          {
            "component": "VirtualScroller",
            "text": "plantilla `cbVirtualItem`, `buffer`, `scrollToIndex()` y `aria-setsize` / `aria-posinset` en cada elemento."
          },
          {
            "component": "DataView",
            "text": "plantilla `cbDataViewItem`, cabecera `cbDataViewHeader`, cambio de vista lista/cuadrícula (`showLayoutToggle`) y paginación con `rows`."
          },
          {
            "component": "Timeline",
            "text": "`align` (`left`, `right`, `alternate`), plantillas `cbTimelineContent`, `cbTimelineOpposite` y `cbTimelineMarker`, e `icon` / `color` por evento."
          },
          {
            "component": "OrderList",
            "text": "plantilla `cbOrderListItem`, cabecera `header`, reordenado con Alt + flechas y evento `reorder`."
          },
          {
            "component": "PickList",
            "text": "selección múltiple, mover todos, doble clic, teclado, plantilla `cbPickListItem`, `sourceHeader` / `targetHeader` y evento `moved`."
          },
          {
            "component": "ConfirmPopup",
            "text": "`confirm($event)` la abre anclada al botón que la dispara; Escape o un clic fuera la cancelan y el foco vuelve al disparador. `acceptSeverity` para acciones destructivas."
          },
          {
            "component": "ConfirmDialog",
            "text": "`acceptSeverity` para marcar el botón de aceptar como peligroso."
          },
          {
            "component": "MegaMenu",
            "text": "navegación con teclado (flechas, Inicio/Fin, Escape) según el patrón *disclosure navigation*."
          },
          {
            "component": "FileUpload",
            "text": "evento `rejectFiles` y aviso visible (`role=\"alert\"`) con los archivos descartados por tamaño o tipo."
          },
          {
            "component": "Carousel / Galleria",
            "text": "navegación con flechas, Inicio y Fin en los indicadores y miniaturas (patrón *tabs* con un solo tabindex activo); cada diapositiva se nombra por su posición (\"1 de 3\")."
          },
          {
            "component": "CascadeSelect / TreeSelect / Image / Inplace",
            "text": "Escape cierra el panel o la previsualización y devuelve el foco."
          },
          {
            "component": "Editor",
            "text": "barra de herramientas con un solo tabindex activo y navegación con flechas, Inicio y Fin (patrón *toolbar*); `ariaLabel` para el área editable."
          },
          {
            "component": "Terminal",
            "text": "flecha arriba / abajo recorren los comandos anteriores; el historial es un `role=\"log\"` que anuncia las respuestas."
          },
          {
            "component": "BlockUI",
            "text": "`message`, texto que anuncia el lector de pantalla al bloquear (por defecto, \"Cargando\")."
          },
          {
            "component": "AvatarGroup / MeterGroup",
            "text": "`ariaLabel` para nombrar el grupo o el medidor."
          },
          {
            "component": "Core",
            "text": "`cbOverlayFocus()`, utilidad para overlays: al abrir mueve el foco al elemento inicial y al cerrar lo devuelve a quien lo tenía."
          },
          {
            "component": "InputToken (Caribe)",
            "text": "avance automático al escribir, solo dígitos, flechas, Backspace (borra la casilla actual o la anterior) y pegar un código completo, como la referencia de Caribe."
          },
          {
            "component": "FabMenu (Caribe)",
            "text": "patrón WAI-ARIA *menu*: el foco entra al abrir, flechas, Inicio, Fin y Escape; `aria-haspopup` y `aria-controls`."
          },
          {
            "component": "Modal / OffCanvas / PopOver (Caribe)",
            "text": "trampa de foco (Modal, OffCanvas), Escape cierra y el foco entra al abrir y vuelve al disparador al cerrar."
          },
          {
            "component": "Coachmark / Onboarding (Caribe)",
            "text": "el cambio de paso se anuncia (\"Paso 2 de 3\") y Escape cierra."
          },
          {
            "component": "ExpansionPanel (Caribe)",
            "text": "la cabecera controla una región nombrada (`aria-controls`, `role=\"region\"`)."
          },
          {
            "component": "CardSelect / DotsIndicator (Caribe)",
            "text": "un solo tabindex activo y navegación con flechas, Inicio y Fin (patrones *listbox* y *tabs*)."
          },
          {
            "component": "CardMove (Caribe)",
            "text": "cada botón de mover se describe con su elemento y el foco sigue al elemento movido."
          },
          {
            "component": "FileDownload (Caribe)",
            "text": "con `href` se renderiza un enlace de descarga nativo (antes `href` no se usaba); el botón se describe con el nombre del archivo."
          },
          {
            "component": "Link (Caribe)",
            "text": "los enlaces externos avisan al lector de pantalla de que se abren en una pestaña nueva."
          },
          {
            "component": "DataTable / Shortcut (Caribe)",
            "text": "`ariaLabel` para nombrar la tabla o un atajo sin texto visible; las cabeceras de DataTable tienen `scope=\"col\"`."
          },
          {
            "component": "StepIndicator (Caribe)",
            "text": "`aria-valuetext` (\"Paso 2 de 4\")."
          },
          {
            "component": "Tests",
            "text": "base de tests de comportamiento, teclado, accesibilidad y formularios en los 23 componentes del núcleo que tenían uno solo y en los de Caribe Design: CascadeSelect, TreeSelect, InputMask, InputOtp, FileUpload, Image, Carousel, Galleria, Inplace, Chip, Editor, Terminal, BlockUI, ScrollTop, FloatLabel, MeterGroup, FileCard, FolderCard, AvatarGroup, IconField, InlineMessage, ScrollPanel y Toolbar."
          },
          {
            "component": "Showcase",
            "text": "páginas de Tree, TreeTable, VirtualScroller, DataView, Timeline, OrderList, PickList, ConfirmDialog, ConfirmPopup, DynamicDialog y MegaMenu reescritas con ejemplos por funcionalidad y sección de accesibilidad."
          },
          {
            "component": "Idioma (i18n)",
            "text": "sistema de traducción de los textos de interfaz (etiquetas accesibles, botones, placeholders y mensajes) en español e inglés, con `provideCaribeNG({ locale, translation })`, cambio en caliente con `CbLocaleService.use()` y `setTranslation()`, y `cbFormat()` para textos con valores. Aplica a 79 componentes."
          },
          {
            "component": "Showcase",
            "text": "página Idioma (i18n) con todas las claves; el selector ES/EN del sitio cambia también el idioma de los componentes."
          }
        ]
      },
      {
        "type": "changed",
        "items": [
          {
            "component": "Chart",
            "text": "el gráfico se dibuja al ancho real de su contenedor (antes, un lienzo de 520 unidades que se escalaba): los textos mantienen su tamaño y `height` pasa a ser el alto en píxeles."
          },
          {
            "component": "Menús y navegación",
            "text": "las etiquetas accesibles de Breadcrumb, Menu, Menubar, ContextMenu, MegaMenu, Dock, PanelMenu, TieredMenu, Steps y TabMenu estaban en inglés; ahora siguen el idioma activo (español por defecto)."
          },
          {
            "component": "ConfirmPopup",
            "text": "el mensaje por defecto se unifica con el de ConfirmDialog (\"¿Deseas continuar?\")."
          },
          {
            "component": "CascadeSelect / TreeSelect / InputSelect",
            "text": "el placeholder por defecto se unifica en \"Seleccionar\"."
          },
          {
            "component": "Formularios",
            "text": "`requiredText` y `optionalText` de `provideCaribeNG()` pasan a ser opcionales; si se omiten, se usan los del idioma activo."
          },
          {
            "component": "Chip / Galleria",
            "text": "las imágenes de los chips y de las miniaturas son decorativas (`alt=\"\"`) para que el lector de pantalla no repita el nombre."
          },
          {
            "component": "ConfirmDialog / ConfirmPopup / OrderList / PickList",
            "text": "los botones usan `cb-button` y el código de los 11 componentes reescritos es legible (antes estaba minificado)."
          }
        ]
      },
      {
        "type": "fixed",
        "items": [
          {
            "component": "VirtualScroller",
            "text": "ocupa todo el ancho disponible; dentro de un contenedor flex se quedaba sin ancho."
          },
          {
            "component": "Slider",
            "text": "la pista usaba tonos claros también en tema oscuro."
          },
          {
            "component": "Chart",
            "text": "la tarjeta era blanca en tema oscuro (usaba tokens inexistentes), los valores negativos se mostraban como 0 y la torta ignoraba los colores del dataset."
          },
          {
            "component": "Tema oscuro",
            "text": "el hover y la opción activa de Select, MultiSelect, Autocomplete, Listbox, DatePicker, Tree, Paginator, SelectButton, ToggleButton, InputNumber, Table, Accordion y los botones de cerrar de Dialog, Drawer y Toast usaban `surface-100` / `surface-50`, que en oscuro siguen siendo casi blancos: el texto blanco desaparecía. Ahora usan los tokens semánticos nuevos."
          },
          {
            "component": "Table",
            "text": "ordenar y seleccionar filas solo era posible con ratón: el encabezado ordenable no era enfocable y los checkboxes de fila estaban ocultos al lector de pantalla. Ahora hay un botón \"Ordenar por …\" y un checkbox o radio enfocable por fila."
          },
          {
            "component": "DatePicker",
            "text": "Re Pág / Av Pág saltaban al día 1 del mes en lugar de al mismo día; al llegar con las flechas a un día fuera de `minDate` / `maxDate` se perdía el foco (ahora usan `aria-disabled`); `aria-selected` estaba en el botón en vez de en la celda."
          },
          {
            "component": "DatePicker / Menubar / OrderList",
            "text": "en apps zoneless, el foco se movía antes de que se pintara el día, el submenú o la lista reordenada, y quedaba en el elemento equivocado o se perdía. Ahora se mueve tras el render (`afterNextRender`)."
          },
          {
            "component": "MultiSelect",
            "text": "al navegar con flechas el lector de pantalla no anunciaba la opción activa (faltaba `aria-activedescendant`), y en el filtro la barra espaciadora marcaba una opción en lugar de escribir un espacio."
          },
          {
            "component": "Select / MultiSelect",
            "text": "con `filter`, el foco está en el campo de búsqueda pero la opción activa se anunciaba desde el disparador; ahora el campo es el combobox que la anuncia."
          },
          {
            "component": "InputMask",
            "text": "los literales de la máscara (`-`, `(`…) se añadían antes de tiempo: Backspace no podía borrarlos y un literal inicial como `(` nunca aparecía."
          },
          {
            "component": "FileUpload",
            "text": "los archivos arrastrados no se filtraban por `accept`, los que superaban `maxFileSize` se descartaban sin aviso, un mismo archivo podía añadirse dos veces y los tamaños grandes no se mostraban en MB."
          },
          {
            "component": "InputOtp",
            "text": "al pegar un código, el foco pasa a la última casilla rellenada."
          },
          {
            "component": "Image",
            "text": "la previsualización se declaraba modal pero no atrapaba el foco ni devolvía el foco al cerrarse."
          },
          {
            "component": "Inplace",
            "text": "el foco se perdía al abrir o cerrar; ahora pasa al contenido y vuelve a la vista previa."
          },
          {
            "component": "Galleria",
            "text": "las flechas se mostraban con una sola imagen y no se deshabilitaban en los extremos sin `circular`."
          },
          {
            "component": "FloatLabel",
            "text": "la etiqueta no subía cuando el valor se asignaba por código (`patchValue`, `setValue`)."
          },
          {
            "component": "MeterGroup",
            "text": "`role=\"meter\"` sin `aria-valuenow` (ARIA inválido); ahora expone el total y un desglose en `aria-valuetext`. La leyenda mostraba el valor bruto como porcentaje aunque `max` no fuera 100."
          },
          {
            "component": "FileCard",
            "text": "el fondo tintado solo funcionaba con colores hex de 6 dígitos; ahora acepta cualquier color CSS."
          },
          {
            "component": "FolderCard",
            "text": "sin número de archivos mostraba la etiqueta \"archivos\" suelta."
          },
          {
            "component": "BlockUI",
            "text": "la máscara `role=\"status\"` no tenía texto, así que no anunciaba nada."
          },
          {
            "component": "Terminal",
            "text": "tras pulsar Enter, el campo podía seguir mostrando el comando enviado."
          },
          {
            "component": "Editor",
            "text": "el área editable no tenía nombre accesible ni `aria-disabled`."
          },
          {
            "component": "InputSelect (Caribe)",
            "text": "el valor inicial no quedaba seleccionado (el `<select>` recibía el valor antes de crear las opciones)."
          },
          {
            "component": "InputSearch (Caribe)",
            "text": "al limpiar, el foco se perdía; ahora vuelve al campo."
          },
          {
            "component": "FileSelect (Caribe)",
            "text": "no había indicador de foco visible al navegar con teclado; la cantidad de archivos elegidos se anuncia."
          },
          {
            "component": "Calendar (Caribe)",
            "text": "las iniciales de los días estaban fijas en español; ahora siguen el idioma activo (`weekdaysMin`). Además usaba `role=\"grid\"` sin filas ni celdas (ARIA inválido); ahora es un grupo nombrado por el mes."
          },
          {
            "component": "Preloader (Caribe)",
            "text": "`aria-busy=\"true\"` fijo impedía que el lector de pantalla anunciara el aviso de carga."
          },
          {
            "component": "Voucher (Caribe)",
            "text": "dos filas con la misma etiqueta rompían la lista."
          }
        ]
      }
    ]
  },
  {
    "version": "22.1.1",
    "date": "2026-10-20",
    "sections": [
      {
        "type": "changed",
        "items": [
          {
            "component": "Dependencias",
            "text": "`@angular/cdk` pasa de `peerDependencies` a `dependencies`, como en NG-ZORRO: ahora basta con `npm install @caribeng/ui`."
          },
          {
            "component": "npm",
            "text": "keywords, autor, repositorio, página y enlace de incidencias en la ficha del paquete."
          }
        ]
      }
    ]
  },
  {
    "version": "22.1.0",
    "date": "2026-10-20",
    "sections": [
      {
        "type": "breaking",
        "items": [
          {
            "component": "Formularios",
            "text": "el `*` de `[required]` ya no se muestra por defecto en Input, Textarea, Autocomplete, DatePicker e InputNumber (`requiredIndicator` es `'none'` por defecto). Para recuperarlo: `provideCaribeNG({ requiredIndicator: 'asterisk' })`."
          }
        ]
      },
      {
        "type": "added",
        "items": [
          {
            "component": "Formularios",
            "text": "estado de validación automático con Angular Forms (`cbFieldState`): el campo se marca inválido cuando su `FormControl` es inválido y fue tocado, sin `[invalid]` manual. El mensaje sigue siendo opcional (`error`)."
          },
          {
            "component": "Formularios",
            "text": "indicador de obligatoriedad configurable `requiredIndicator` (`'asterisk'`, `'text'`, `'optional'`, `'none'`), global con `provideCaribeNG()` y por campo, con textos `requiredText` / `optionalText`."
          },
          {
            "component": "Formularios",
            "text": "input `invalid` con estilo y `aria-invalid` en InputMask, InputOtp, Radio, Toggle, Slider, Rating, Listbox, SelectButton, ToggleButton, CascadeSelect, TreeSelect, Editor, Knob, Switch, InputSearch, InputDate, InputSelect e InputToken."
          },
          {
            "component": "Select / MultiSelect",
            "text": "inputs `ariaLabel` y `ariaLabelledBy` para nombrar el combobox."
          },
          {
            "component": "Editor",
            "text": "encabezados, formato, alineación, enlaces e inserción de imágenes."
          },
          {
            "component": "Pricing / FileCard / FolderCard",
            "text": "nuevos componentes genéricos."
          },
          {
            "component": "Image",
            "text": "barra de herramientas completa en el visor (lightbox) con volteo horizontal y vertical."
          },
          {
            "component": "Icon",
            "text": "iconos `flip-horizontal` y `flip-vertical`."
          },
          {
            "component": "Showcase",
            "text": "pestaña TypeScript con el componente standalone completo de cada ejemplo, generado del código de la página."
          },
          {
            "component": "Showcase",
            "text": "sección Accesibilidad (lector de pantalla y teclado) en 24 componentes."
          },
          {
            "component": "Showcase",
            "text": "sección Templates: autenticación (login, registro, recuperar y restablecer contraseña, 2FA, verificación, bloqueo), dashboard, navbar, file manager, pricing, factura y páginas de error."
          },
          {
            "component": "Showcase",
            "text": "botón de pantalla completa en los ejemplos."
          },
          {
            "component": "Showcase",
            "text": "página Changelog."
          }
        ]
      },
      {
        "type": "changed",
        "items": [
          {
            "component": "Showcase",
            "text": "estructura única de páginas (Importación → Básico → ejemplos → Accesibilidad → Playground → API) con títulos y descripciones traducibles ES/EN."
          },
          {
            "component": "Checkbox",
            "text": "muestra el indicador de obligatoriedad configurado."
          },
          {
            "component": "Distribución",
            "text": "el paquete se publica sin source maps (solo el JavaScript compilado), como PrimeNG."
          }
        ]
      },
      {
        "type": "fixed",
        "items": [
          {
            "component": "ConfirmDialog",
            "text": "atrapa el foco, Escape cancela y cierra, y el foco vuelve al elemento que lo abrió."
          },
          {
            "component": "Tabs",
            "text": "relación `aria-controls` / `aria-labelledby` entre pestaña y panel; el foco acompaña a la pestaña al usar las flechas."
          },
          {
            "component": "Tooltip",
            "text": "el disparador lo referencia con `aria-describedby` y Escape lo oculta."
          },
          {
            "component": "Autocomplete",
            "text": "el panel ocupa el ancho del input."
          },
          {
            "component": "Paginator",
            "text": "el selector de filas muestra solo el número."
          },
          {
            "component": "Button",
            "text": "`fullWidth` ocupa todo el ancho disponible."
          },
          {
            "component": "Select",
            "text": "ancho correcto de los desplegables."
          },
          {
            "component": "Showcase",
            "text": "ejemplos HTML que usaban variables inexistentes (Rating, Slider, Knob, Steps, TabMenu, SelectButton, MegaMenu, Voucher)."
          }
        ]
      }
    ]
  },
  {
    "version": "22.0.0",
    "date": "2026-10-18",
    "sections": [
      {
        "type": "breaking",
        "items": [
          {
            "component": "Angular",
            "text": "requiere Angular 22 (`peerDependencies` `^22.0.0`)."
          }
        ]
      },
      {
        "type": "changed",
        "items": [
          {
            "component": "Versionado",
            "text": "el major de la librería se alinea con el de Angular; la 22.0.0 incluye todo lo de la 1.1.0."
          },
          {
            "component": "Mantenimiento",
            "text": "la línea v21 (Angular 21) continúa en la rama `release/21.x` y solo recibe correcciones."
          },
          {
            "component": "Showcase",
            "text": "selector de versión con v22 como actual y v21 en mantenimiento."
          }
        ]
      }
    ]
  },
  {
    "version": "1.1.0",
    "date": "2026-10-17",
    "sections": [
      {
        "type": "added",
        "items": [
          {
            "component": "Caribe Design · Cards, transacciones y alertas",
            "text": "`alert`, `inline-alert`, `card-content`, `card-move`, `card-primary`, `card-select`, `coachmark`, `onboarding`, `status`, `tracker`, `transaction-status`, `voucher`, `data-table`, `modal`, `pop-over`."
          },
          {
            "component": "Caribe Design · Navegación, botones y paneles",
            "text": "`button-group`, `icon-button`, `tag-button`, `fab-menu`, `float-menu`, `header`, `footer`, `link`, `shortcut`, `expansion-panel`, `off-canvas`, `dots-indicator`, `step-indicator`, `switch`, `progress-bar`."
          },
          {
            "component": "Caribe Design · Identidad, loaders, archivos y formularios",
            "text": "`animation-lottie`, `circle-loading`, `loader`, `preloader`, `logo`, `illustration`, `pictogram`, `stroke`, `file-download`, `file-select`, `input-search`, `input-token`, `input-date`, `input-select`, `calendar`."
          },
          {
            "component": "Calidad",
            "text": "140 suites de prueba (280 tests unitarios con Vitest)."
          },
          {
            "component": "Showcase",
            "text": "138 páginas de documentación interactiva."
          }
        ]
      }
    ]
  },
  {
    "version": "1.0.0",
    "date": "2026-10-17",
    "sections": [
      {
        "type": "added",
        "items": [
          {
            "component": "Form",
            "text": "`Button`, `Input`, `Textarea`, `Select`, `MultiSelect`, `Checkbox`, `Radio`, `Toggle`, `DatePicker`, `InputNumber`, `InputMask`, `InputOTP`, `InputGroup`, `FloatLabel`, `IconField`, `Slider`, `Rating`, `ColorPicker`, `FileUpload`, `Autocomplete`, `Password`, `Knob`, `ListBox`, `SelectButton`, `ToggleButton`, `TreeSelect`, `CascadeSelect`, `Chips`, `Editor`."
          },
          {
            "component": "Data",
            "text": "`Table` (ordenación, paginación, selección y plantillas de celda `cbTableCell`), `Paginator`, `DataView`, `Tree`, `TreeTable`, `Timeline`, `VirtualScroller`, `OrderList`, `PickList`, `OrganizationChart`."
          },
          {
            "component": "Overlay",
            "text": "`Dialog`, `Drawer`, `Tooltip` (`[cbTooltip]`), `Popover`, `ConfirmDialog`, `ConfirmPopup`, `DynamicDialog`."
          },
          {
            "component": "Messages",
            "text": "`Toast` (`CbToastService`), `Message`, `InlineMessage`, `Badge`, `Tag`, `Chip`."
          },
          {
            "component": "Menu",
            "text": "`Menu`, `Menubar`, `ContextMenu`, `Breadcrumb`, `Steps`, `TabMenu`, `PanelMenu`, `TieredMenu`, `MegaMenu`, `Dock`, `SpeedDial`."
          },
          {
            "component": "Panel",
            "text": "`Card`, `Panel`, `Accordion`, `Fieldset`, `Divider`, `Splitter`, `Toolbar`, `ScrollPanel`, `ScrollTop`, `Tabs`, `Stepper`."
          },
          {
            "component": "Media",
            "text": "`Avatar`, `AvatarGroup`, `Image` (lightbox y zoom), `Carousel`, `Galleria`."
          },
          {
            "component": "Misc",
            "text": "`Icon` (`<cb-icon>` con 361 iconos núcleo), `Icons` (1891 iconos Lucide), `ProgressBar`, `Spinner`, `Skeleton`, `MeterGroup`, `Inplace`, `BlockUI`, `Terminal`, `Chart`, `Ripple`, `FocusTrap`, `AnimateOnScroll`, `StyleClass`, `AutoFocus`."
          },
          {
            "component": "Theming",
            "text": "presets de paleta primaria en caliente (`emerald`, `ocean`, `coral`, `amber`, `violet`, `rose`) con `setPreset()` y escalas personalizadas con `setCustomPrimaryScale()`."
          },
          {
            "component": "Distribución",
            "text": "Angular Package Format con `exports` autogenerados y hoja de estilos `@caribeng/ui/styles.css`."
          },
          {
            "component": "Calidad",
            "text": "94 archivos de prueba con Vitest + jsdom y CI en GitHub Actions."
          }
        ]
      }
    ]
  }
];
