# Changelog

Todos los cambios notables en `@caribeng/ui` se documentan en este archivo siguiendo [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.1.0] - 2026-10-17

### Added
- **Catálogo Caribe Design integrado en `@caribeng/ui` (+45 nuevos secondary entry points, total 138):**
  - **Cards, Transacciones y Alertas (15 — Lote Codex):** `alert`, `inline-alert`, `card-content`, `card-move`, `card-primary`, `card-select`, `coachmark`, `onboarding`, `status`, `tracker`, `transaction-status`, `voucher`, `data-table`, `modal`, `pop-over`.
  - **Navegación, Botones y Paneles (15 — Lote Claude):** `button-group`, `icon-button`, `tag-button`, `fab-menu`, `float-menu`, `header`, `footer`, `link`, `shortcut`, `expansion-panel`, `off-canvas`, `dots-indicator`, `step-indicator`, `switch`, `progress-bar`.
  - **Identidad, Loaders, Archivos y Formularios (15 — Lote Gemini):** `animation-lottie`, `circle-loading`, `loader`, `preloader`, `logo`, `illustration`, `pictogram`, `stroke`, `file-download`, `file-select`, `input-search`, `input-token`, `input-date`, `input-select`, `calendar`.
- **Calidad y Showcase:**
  - **140 suites de prueba** (**280 tests unitarios** en verde con Vitest).
  - **138 páginas de documentación** interactiva en `apps/showcase`.

---

## [1.0.0] - 2026-10-17

### Added
- **Catálogo completo v1.0 (93 secondary entry points):**
  - **Form (29):** `Button`, `Input`, `Textarea`, `Select`, `MultiSelect`, `Checkbox`, `Radio`, `Toggle`, `DatePicker`, `InputNumber`, `InputMask`, `InputOTP`, `InputGroup`, `FloatLabel`, `IconField`, `Slider`, `Rating`, `ColorPicker`, `FileUpload`, `Autocomplete`, `Password`, `Knob`, `ListBox`, `SelectButton`, `ToggleButton`, `TreeSelect`, `CascadeSelect`, `Chips`, `Editor`.
  - **Data (10):** `Table` (con ordenación, paginación, selección y plantillas de celda personalizadas `cbTableCell`), `Paginator`, `DataView`, `Tree`, `TreeTable`, `Timeline`, `VirtualScroller`, `OrderList`, `PickList`, `OrganizationChart`.
  - **Overlay (7):** `Dialog`, `Drawer`, `Tooltip` (`[cbTooltip]`), `Popover`, `ConfirmDialog`, `ConfirmPopup`, `DynamicDialog`.
  - **Messages & Notification (6):** `Toast` (`CbToastService`), `Message`, `InlineMessage`, `Badge`, `Tag`, `Chip`.
  - **Navigation / Menu (11):** `Menu`, `Menubar`, `ContextMenu`, `Breadcrumb`, `Steps`, `TabMenu`, `PanelMenu`, `TieredMenu`, `MegaMenu`, `Dock`, `SpeedDial`.
  - **Panel / Layout (11):** `Card`, `Panel`, `Accordion`, `Fieldset`, `Divider`, `Splitter`, `Toolbar`, `ScrollPanel`, `ScrollTop`, `Tabs`, `Stepper`.
  - **Media (5):** `Avatar`, `AvatarGroup`, `Image` (con lightbox y zoom), `Carousel`, `Galleria`.
  - **Misc & Directivas (14):** `Icon` (`<cb-icon>` + 361 iconos núcleo), `Icons` (1891 iconos Lucide tree-shakeables), `ProgressBar`, `Spinner`, `Skeleton`, `MeterGroup`, `Inplace`, `BlockUI`, `Terminal`, `Chart` (`bar`, `line`, `doughnut`, `pie`), `Ripple` (`[cbRipple]`), `FocusTrap` (`[cbFocusTrap]`), `AnimateOnScroll` (`[cbAnimateOnScroll]`), `StyleClass` (`[cbStyleClass]`), `AutoFocus` (`[cbAutoFocus]`).
- **Theming avanzado en `CbThemeService`:**
  - Soporte de presets de paleta primaria en caliente (`emerald`, `ocean`, `coral`, `amber`, `violet`, `rose`) mediante `setPreset()` y escalas personalizadas con `setCustomPrimaryScale()`.
- **Calidad y Distribución:**
  - Suite de **94 archivos de prueba** con Vitest + jsdom.
  - Empaquetado Angular Package Format (APF) en `@caribeng/ui` con `exports` autogenerados y hojas de estilo compiladas (`@caribeng/ui/styles.css`).
  - Pipeline de integración continua en GitHub Actions (`.github/workflows/ci.yml`).
