# Changelog

Todos los cambios notables en `@caribeng/ui` se documentan en este archivo siguiendo [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [Semantic Versioning](https://semver.org/lang/es/).

Desde la 22.0.0 el major de la librería coincide con el de Angular (22.x = Angular 22), como Angular Material, PrimeNG y NG-ZORRO.

**Formato de cada entrada** (lo lee la página Changelog del showcase): `- **Componente:** descripción`. Secciones admitidas: `Breaking`, `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

---

## [Unreleased]

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
