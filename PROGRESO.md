# CaribeNG — Estado del proyecto

> Última actualización: 2026-10-22 (versión 22.3.0)
> Librería de componentes Angular (greenfield), independiente de PrimeNG y de
> terceros (solo `@angular/cdk` y `@angular/platform-browser`).

---

## 1. Resumen rápido

| Métrica | Valor |
|---|---|
| Versión | **22.3.0** (major alineado con Angular; línea v21 en `release/21.x`, solo correcciones) |
| Entry points publicables | `@caribeng/ui` + **117** de la librería (incluye `icon` e `icons`) + **45** de Caribe Design (`@caribeng/ui/caribe/<name>`) = **162** |
| Tests unitarios | **1010** en verde (**212** archivos de spec, 0 warnings en stderr) |
| Build | Limpio (ng-packagr / APF, sin source maps al publicar) |
| Iconos | **361** núcleo + **1891** catálogo (Lucide, ISC) |
| Idiomas | Español (por defecto) e inglés (`provideCaribeNG({ locale: 'en' })`) |
| App de docs | `showcase` (sitio enrutado estilo PrimeNG, ES/EN, con páginas por componente, plantillas y changelog) |
| Schematics | `ng add @caribeng/ui` y `ng generate @caribeng/ui:migrate-from-primeng` |

**Stack:** Angular 22 · Nx 23 · pnpm 11 · TypeScript 6 · ng-packagr 22 ·
vitest · zoneless · signals · OnPush · standalone · CSS custom properties.

---

## 2. Qué es CaribeNG

Un **design system + librería de componentes** para Angular 22+, construido
desde cero (no es un fork de PrimeNG). Principios:

- **Signals** como reactividad primaria (`input()`, `model()`, `output()`,
  `computed()`, `effect()`, `contentChildren()`, `viewChild()`).
- `ChangeDetectionStrategy.OnPush` y componentes **standalone**.
- **Tokens CSS** (`--cb-*`) con tema claro/oscuro (`[data-theme="dark"]`).
- **CVA** (`ControlValueAccessor`) en los controles de formulario.
- **Zoneless** + compatible con Zone.js.
- Accesibilidad objetivo **WCAG 2.2 AA** (teclado, foco, ARIA).
- Prefijo de selector `cb-`, scope npm `@caribeng`.

> PrimeNG (en `C:\DEVELOPER\DATA_COPY\primeng`) se usa **solo como referencia**
> de API/diseño/a11y. La paleta replica fielmente **PrimeNG Aura**
> (primary = emerald, 8 severidades).

---

## 3. Arquitectura y empaquetado

### Un solo paquete, estilo PrimeNG

Se instala **una vez** y se importa **granular** por componente (secondary
entry points de ng-packagr):

```bash
npm install @caribeng/ui
```
```ts
import { provideCaribeNG } from '@caribeng/ui';          // núcleo + tema
import { CbButtonComponent } from '@caribeng/ui/button'; // por componente
import '@caribeng/ui/styles.css';                        // o @use '@caribeng/ui/styles'
```

### Estructura del repo (monorepo Nx + pnpm)

```
caribeng/
├── apps/
│   └── showcase/            # sitio de documentación (Angular, zoneless)
├── packages/
│   ├── ui/                  # EL paquete publicable: @caribeng/ui
│   │   ├── src/             # entry point primario (núcleo: provide, tema, tipos)
│   │   ├── icon/            # @caribeng/ui/icon  (componente <cb-icon> + registro)
│   │   ├── icons/           # @caribeng/ui/icons (catálogo 1891, tree-shakeable)
│   │   ├── button/          # @caribeng/ui/button
│   │   ├── <component>/     # un directorio = un secondary entry point
│   │   ├── caribe/<name>/   # @caribeng/ui/caribe/<name> (45 de Caribe Design)
│   │   ├── schematics/      # ng add y migrate-from-primeng
│   │   └── ...
│   └── tokens/              # compila los SCSS de tokens a dist/packages/ui/styles
├── tsconfig.base.json       # paths @caribeng/ui + @caribeng/ui/<comp> (dev)
├── nx.json · package.json · pnpm-workspace.yaml
└── PROGRESO.md              # este archivo
```

- Cada subcarpeta de `packages/ui/` tiene su `ng-package.json`
  (`{ "lib": { "entryFile": "src/public-api.ts" } }`). ng-packagr los
  autodescubre y genera el `exports` del `package.json` publicado.
- Proyectos Nx: **`ui`**, **`tokens`** (estilos), **`showcase`**.

### Estilos / tokens

- Los SCSS de tokens viven en `packages/tokens/src/scss`.
- El build de `tokens` compila a `dist/packages/ui/styles/caribeng.css`
  (+ fuentes SCSS) y parchea el `exports` del paquete `@caribeng/ui`.
  Depende de `ui:build` (ng-packagr limpia `dist/packages/ui`).

---

## 4. Inventario de componentes (lo hecho)

> Todos con tests, página de documentación, ruta y entrada en el nav, y
> verificados en el navegador.

### Infraestructura
- `@caribeng/ui` — `provideCaribeNG`, `CbThemeService`, tipos `CbSize`/`CbSeverity`, config.
- `@caribeng/ui/icon` — `<cb-icon>`, `CbIconRegistry`, `provideCbIcons`, set núcleo (361).
- `@caribeng/ui/icons` — catálogo completo (1891) tree-shakeable.
- Tokens (`@caribeng/ui/styles`).

### Form
| Componente | Entry point | CVA |
|---|---|---|
| Button | `@caribeng/ui/button` | — |
| Input | `@caribeng/ui/input` | ✓ |
| InputGroup | `@caribeng/ui/inputgroup` | — |
| Select | `@caribeng/ui/select` | ✓ |
| MultiSelect | `@caribeng/ui/multiselect` | ✓ |
| Autocomplete | `@caribeng/ui/autocomplete` | ✓ |
| Textarea | `@caribeng/ui/textarea` | ✓ |
| InputNumber | `@caribeng/ui/input-number` | ✓ |
| DatePicker | `@caribeng/ui/datepicker` | ✓ |
| Checkbox | `@caribeng/ui/checkbox` | ✓ |
| Radio | `@caribeng/ui/radio` | ✓ |
| Toggle | `@caribeng/ui/toggle` | ✓ |
| ToggleButton | `@caribeng/ui/togglebutton` | ✓ |
| SelectButton | `@caribeng/ui/selectbutton` | ✓ |
| ListBox | `@caribeng/ui/listbox` | ✓ |
| Slider | `@caribeng/ui/slider` | ✓ |
| Knob | `@caribeng/ui/knob` | ✓ |
| Rating | `@caribeng/ui/rating` | ✓ |
| Chips | `@caribeng/ui/chips` | ✓ |
| ColorPicker | `@caribeng/ui/colorpicker` | ✓ |
| InputMask | `@caribeng/ui/inputmask` | ✓ |
| InputOTP | `@caribeng/ui/inputotp` | ✓ |
| FloatLabel | `@caribeng/ui/floatlabel` | — |
| IconField | `@caribeng/ui/iconfield` | — |
| TreeSelect | `@caribeng/ui/treeselect` | ✓ |
| CascadeSelect | `@caribeng/ui/cascadeselect` | ✓ |
| FileUpload | `@caribeng/ui/fileupload` | — |
| Editor | `@caribeng/ui/editor` | ✓ |
| Password | `@caribeng/ui/password` | ✓ |

### Overlay
| Componente | Entry point |
|---|---|
| Dialog | `@caribeng/ui/dialog` |
| Drawer | `@caribeng/ui/drawer` |
| Tooltip (directiva `[cbTooltip]`) | `@caribeng/ui/tooltip` |
| Popover | `@caribeng/ui/popover` |
| ConfirmDialog | `@caribeng/ui/confirmdialog` |
| ConfirmPopup | `@caribeng/ui/confirmpopup` |
| DynamicDialog | `@caribeng/ui/dynamicdialog` |

### Messages
| Componente | Entry point |
|---|---|
| Toast | `@caribeng/ui/toast` |
| Message | `@caribeng/ui/message` |
| InlineMessage | `@caribeng/ui/inlinemessage` |
| Badge | `@caribeng/ui/badge` |
| Tag | `@caribeng/ui/tag` |
| Chip | `@caribeng/ui/chip` |

### Panel
| Componente | Entry point |
|---|---|
| Card | `@caribeng/ui/card` |
| Panel | `@caribeng/ui/panel` |
| Fieldset | `@caribeng/ui/fieldset` |
| Toolbar | `@caribeng/ui/toolbar` |
| Splitter | `@caribeng/ui/splitter` |
| ScrollPanel | `@caribeng/ui/scrollpanel` |
| ScrollTop | `@caribeng/ui/scrolltop` |
| Divider | `@caribeng/ui/divider` |
| Accordion | `@caribeng/ui/accordion` |
| Tabs | `@caribeng/ui/tabs` |
| Stepper | `@caribeng/ui/stepper` |

### Data
| Componente | Entry point |
|---|---|
| Table | `@caribeng/ui/table` |
| Paginator | `@caribeng/ui/paginator` |
| DataView | `@caribeng/ui/dataview` |
| Tree | `@caribeng/ui/tree` |
| TreeTable | `@caribeng/ui/treetable` |
| Timeline | `@caribeng/ui/timeline` |
| VirtualScroller | `@caribeng/ui/virtualscroller` |
| OrderList | `@caribeng/ui/orderlist` |
| PickList | `@caribeng/ui/picklist` |
| OrganizationChart | `@caribeng/ui/organizationchart` |

### Menu
| Componente | Entry point |
|---|---|
| Menu | `@caribeng/ui/menu` |
| Menubar | `@caribeng/ui/menubar` |
| TabMenu | `@caribeng/ui/tabmenu` |
| ContextMenu | `@caribeng/ui/contextmenu` |
| PanelMenu | `@caribeng/ui/panelmenu` |
| TieredMenu | `@caribeng/ui/tieredmenu` |
| MegaMenu | `@caribeng/ui/megamenu` |
| Dock | `@caribeng/ui/dock` |
| Steps | `@caribeng/ui/steps` |
| Breadcrumb | `@caribeng/ui/breadcrumb` |
| SpeedDial | `@caribeng/ui/speeddial` |

### Media · Misc
| Componente / Directiva | Entry point | Grupo |
|---|---|---|
| Avatar | `@caribeng/ui/avatar` | Media |
| AvatarGroup | `@caribeng/ui/avatargroup` | Media |
| Carousel | `@caribeng/ui/carousel` | Media |
| Image | `@caribeng/ui/image` | Media |
| Galleria | `@caribeng/ui/galleria` | Media |
| ProgressBar | `@caribeng/ui/progressbar` | Misc |
| Spinner | `@caribeng/ui/spinner` | Misc |
| Skeleton | `@caribeng/ui/skeleton` | Misc |
| MeterGroup | `@caribeng/ui/metergroup` | Misc |
| Inplace | `@caribeng/ui/inplace` | Misc |
| BlockUI | `@caribeng/ui/blockui` | Misc |
| Terminal | `@caribeng/ui/terminal` | Misc |
| Chart | `@caribeng/ui/chart` | Misc |
| Ripple (`[cbRipple]`) | `@caribeng/ui/ripple` | Misc |
| FocusTrap (`[cbFocusTrap]`) | `@caribeng/ui/focustrap` | Misc |
| AnimateOnScroll (`[cbAnimateOnScroll]`) | `@caribeng/ui/animateonscroll` | Misc |
| StyleClass (`[cbStyleClass]`) | `@caribeng/ui/styleclass` | Misc |
| AutoFocus (`[cbAutoFocus]`) | `@caribeng/ui/autofocus` | Misc |

### Nuevos en 22.x
| Componente / Directiva | Entry point | Versión |
|---|---|---|
| Pricing (`grid`, `horizontal`, `list`) | `@caribeng/ui/pricing` | 22.1 (layouts en 22.3) |
| FileCard | `@caribeng/ui/file-card` | 22.1 |
| FolderCard | `@caribeng/ui/folder-card` | 22.1 |
| SplitButton | `@caribeng/ui/splitbutton` | 22.2 |
| Empty | `@caribeng/ui/empty` | 22.2 |
| Descriptions | `@caribeng/ui/descriptions` | 22.2 |
| Result | `@caribeng/ui/result` | 22.2 |
| Statistic / Countdown | `@caribeng/ui/statistic` | 22.2 |
| ThemeToggle | `@caribeng/ui/themetoggle` | 22.2 |
| PDF Viewer (pdf.js bajo demanda) | `@caribeng/ui/pdfviewer` | 22.2 |
| Anchor | `@caribeng/ui/anchor` | 22.2 |
| AppShell + `[cbSidebarToggle]` | `@caribeng/ui/sidebar` | 22.3 |
| CodeBlock | `@caribeng/ui/code-block` | 22.3 |
| KeyFilter (`[cbKeyFilter]`) | `@caribeng/ui/keyfilter` | 22.2 |
| Mentions (CVA) | `@caribeng/ui/mentions` | 22.3 |
| QRCode | `@caribeng/ui/qrcode` | 22.3 |
| Repeater | `@caribeng/ui/repeater` | 22.2 |
| Kanban: tablero, lista, calendario, cronograma, panel y espacio de trabajo | `@caribeng/ui/kanban` | 22.3 |
| Chat (IA): mensajes, razonamiento, herramientas… | `@caribeng/ui/chat` | 22.3 |
| PhoneInput (CVA) | `@caribeng/ui/phone-input` | 22.3 |
| CommandPalette (Ctrl/⌘ + K) | `@caribeng/ui/command-palette` | 22.3 |
| Kbd | `@caribeng/ui/kbd` | 22.3 |
| CopyButton + `CbClipboard` | `@caribeng/ui/copy-button` | 22.3 |

### Caribe Design (`@caribeng/ui/caribe/<name>`, desde 1.1.0)
45 componentes tomados de la referencia funcional de Caribe
(`C:\DEVELOPER\DATA_COPY\NU0065001_WebComponents_Lib\packages\caribe-design-system`):

- **Cards, transacciones y alertas:** `alert`, `inline-alert`, `card-content`, `card-move`, `card-primary`, `card-select`, `coachmark`, `onboarding`, `status`, `tracker`, `transaction-status`, `voucher`, `data-table`, `modal`, `pop-over`.
- **Navegación, botones y paneles:** `button-group`, `icon-button`, `tag-button`, `fab-menu`, `float-menu`, `header`, `footer`, `link`, `shortcut`, `expansion-panel`, `off-canvas`, `dots-indicator`, `step-indicator`, `switch`, `progress-bar`.
- **Identidad, loaders, archivos y formularios:** `animation-lottie`, `circle-loading`, `loader`, `preloader`, `logo`, `illustration`, `pictogram`, `stroke`, `file-download`, `file-select`, `input-search`, `input-token`, `input-date`, `input-select`, `calendar`.

---

## 5. Sistema de iconos

- **`<cb-icon name size spin ariaLabel>`** pinta SVG inline desde el registro;
  hereda `currentColor` y escala con el tamaño.
- **Set núcleo (361)** auto-registrado + **catálogo completo (1891)** opt-in y
  tree-shakeable en `@caribeng/ui/icons`:
  ```ts
  import { heartPulse } from '@caribeng/ui/icons';
  import { provideCbIcons } from '@caribeng/ui/icon';
  provideCbIcons({ 'heart-pulse': heartPulse });
  ```
- Derivados de **Lucide (ISC)**, con atribución en
  `packages/ui/THIRD-PARTY-NOTICES.md`.
- **Generados una vez** con `packages/ui/icon/scripts/generate-icons.mjs` desde
  un clon local de Lucide; el repo **no** depende del clon en cada build.

---

## 6. Testing

- Runner: **`@angular/build:unit-test`** (vitest + jsdom), sin `@analogjs`.
- Cada paquete (menos `tokens`) tiene target `test` + `build-test`
  (`@angular/build:ng-packagr`) + `tsconfig.spec.json`.
- Cobertura: CVA (writeValue/onChange/onTouched/disabled), ARIA, teclado,
  overlays CDK, proyección de contenido.

```bash
pnpm nx test ui            # todos los specs del paquete
```

---

## 7. Showcase (documentación)

Sitio enrutado (zoneless) en `apps/showcase`. Para añadir una página nueva:

1. Componente en `apps/showcase/src/app/pages/<x>-doc.component.ts`.
2. Ruta en `apps/showcase/src/app/app.routes.ts`.
3. Entrada en `apps/showcase/src/app/data/nav.ts`.

```bash
pnpm nx serve showcase     # http://127.0.0.1:4200
```

---

## 8. Forma de trabajar (workflow)

### Flujo por lotes

1. **Rama** nueva desde `main` por lote (p. ej. `feat/v0.9-formcontrols`).
2. Construir los componentes del lote (ver receta abajo).
3. **Build + test** del paquete (`nx build ui`, `nx test ui`) — lo hace el
   asistente de forma automatizada.
4. **Prueba manual del usuario** (ver más abajo): el asistente entrega la lista
   de qué probar; el usuario prueba y **confirma**.
5. **Commit** del lote con mensaje `feat(<grupo>): …` (tras la confirmación).
6. **Merge a `main`** con `git merge --no-ff` (merge commit de registro) y
   borrar la rama.

### ⭐ Verificación en el navegador: la hace el USUARIO (desde 2026-10-17)

> **Nueva forma de trabajar.** La verificación visual en el navegador con las
> herramientas de automatización **consume muchos tokens**, así que **el
> asistente ya no navega ni toma capturas**. En su lugar:
>
> 1. El asistente construye los componentes y corre **build + tests** (eso sí
>    lo hace él, es barato y determinista).
> 2. Deja el **dev server** corriendo (`nx serve showcase`,
>    http://127.0.0.1:4200) e indica las **rutas** de cada componente nuevo.
> 3. Entrega una **lista concreta de qué probar** por componente (qué abrir,
>    qué interacción, qué se espera ver).
> 4. **El usuario prueba** en su navegador y **confirma** (o reporta lo que
>    falle).
> 5. Solo tras la confirmación, el asistente **commitea** y luego fusiona.
>
> El asistente solo usaría el navegador si el usuario lo pide explícitamente
> (p. ej. para depurar algo puntual que no se reproduce de otra forma).

### Receta por componente nuevo

1. `mkdir -p packages/ui/<name>/src/lib` + `ng-package.json`.
2. `tsconfig.base.json` → path `@caribeng/ui/<name>`.
3. `component.ts` + `component.css` + `public-api.ts`.
4. `component.spec.ts` (TestBed + vitest).
5. Página de docs + ruta + nav en `showcase`.
6. Build + test + verificación visual.

### Comandos (⚠️ siempre con IPv4 forzado)

> La máquina falla con IPv6 en el registro npm; **todo** install/ejecución Nx
> debe ir con `NODE_OPTIONS=--dns-result-order=ipv4first`.

```bash
NODE_OPTIONS=--dns-result-order=ipv4first pnpm install
NODE_OPTIONS=--dns-result-order=ipv4first pnpm nx run-many -t build
NODE_OPTIONS=--dns-result-order=ipv4first pnpm nx test ui
NODE_OPTIONS=--dns-result-order=ipv4first pnpm nx serve showcase
# Regenerar iconos (una vez, con el clon de Lucide):
node packages/ui/icon/scripts/generate-icons.mjs [ruta-al-clon-de-lucide]
```

En Windows (PowerShell), si `pnpm nx` falla, se llama a los binarios directamente:

```powershell
$env:NODE_OPTIONS='--dns-result-order=ipv4first'; .\node_modules\.bin\nx.cmd test ui --skip-nx-cache
node ./node_modules/typescript/bin/tsc -p packages/ui/tsconfig.lib.json --noEmit
node ./node_modules/typescript/bin/tsc -p packages/ui/tsconfig.spec.json --noEmit
node ./node_modules/typescript/bin/tsc -p apps/showcase/tsconfig.app.json --noEmit
```

### Publicar una versión

1. Los cambios se acumulan en `## [Unreleased]` del `CHANGELOG.md` (secciones
   `Breaking`, `Added`, `Changed`, `Fixed`). Los cambios incompatibles van en
   `Breaking` aunque la versión sea minor (el major sigue al de Angular).
2. Cortar `[Unreleased]` → `## [X.Y.Z] - AAAA-MM-DD` y subir la versión en
   `packages/ui/package.json` y `CARIBENG_VERSION`
   (`apps/showcase/src/app/data/versions.ts`); regenerar
   `changelog.generated.ts` (`gen-changelog.mjs`).
3. Build completo + `nx run ui:prepare-publish` + `npm pack --dry-run ./dist/packages/ui`.
4. Commit `chore(release): X.Y.Z`, tag anotado `vX.Y.Z` («@caribeng/ui X.Y.Z») y push.
5. `npm publish ./dist/packages/ui --access public` lo ejecuta el usuario
   (con su cuenta y OTP); la CI no publica.

### Convenciones de commit

- Mensajes `feat(<grupo>): …`, `refactor: …`, `chore: …`.
- Atribución al final del mensaje:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

### Patrones y "gotchas" aprendidos (importante)

- **Dark mode en CSS de componente** (encapsulación emulada): usar
  `:host-context([data-theme="dark"])`, **nunca** `:root[data-theme="dark"]`.
- **Estilar el host**: usar `:host` (y `:host(.clase)`), **no** la clase
  directamente — con encapsulación emulada la clase no matchea el host.
- **CVA + two-way**: `value = model<...>` (no `signal`) para permitir
  `[(value)]` con señales, igual que select/datepicker.
- **Overlays CDK** renderizan en `document.body` (`.cdk-overlay-container`).
- **Padre descubre hijos proyectados** (tabs/stepper): usar
  `contentChildren(ChildCmp)` (signal query), no registro manual.
- **Overlay creado en un `effect`** (dialog/drawer): en tests usar
  `TestBed.tick()` para vaciar la cola de effects.
- **Inputs signal en tests**: mutar un campo plano del host + `detectChanges()`
  **no** propaga; usar `fixture.componentRef.setInput(...)` o un **signal** en
  el host con bind one-way. Tras un click, `detectChanges()` antes de asertar
  atributos del DOM.
- **Componentes de bloque** (tabs/stepper/slider/progressbar) se **encogen** en
  un contenedor flex; en las demos añadir `style="width: 100%"`.
- **ng-packagr** necesita `@nx/angular:package` con `tsConfig` explícito para
  resolver los `paths`; `tsconfig.base.json` **sin** `baseUrl`.

---

## 9. Estado del catálogo de componentes

### Componentes (100 % completado — 162 entry points)

Todos los lotes planificados en `SPEC.md` (75 componentes/directivas), los +18 adicionales, los 45 de Caribe Design (1.1.0) y los nuevos de 22.x (ver §4) están implementados, documentados en `showcase` y verificados con tests unitarios. Lotes originales:

1. ✅ **Datos** — `Table` (con ordenación, selección, paginación y plantillas de celda personalizadas `cbTableCell`), `Paginator`, `DataView`, `Tree`, `TreeTable`, `Timeline`, `VirtualScroller`, `OrderList`, `PickList`, `OrganizationChart`.
2. ✅ **Menu** — `Menu`, `Menubar`, `TabMenu`, `ContextMenu`, `PanelMenu`, `TieredMenu`, `MegaMenu`, `Dock`, `Steps`, `Breadcrumb`, `SpeedDial`.
3. ✅ **Form extra** — `TreeSelect`, `CascadeSelect`, `InputMask`, `InputOTP`, `FloatLabel`, `IconField`, `Editor`, `FileUpload`, `Password`.
4. ✅ **Panel / Layout** — `Card`, `Panel`, `Fieldset`, `Toolbar`, `Splitter`, `ScrollPanel`, `ScrollTop`, `Divider`, `Accordion`, `Tabs`, `Stepper`.
5. ✅ **Overlay extra** — `Dialog`, `Drawer`, `Tooltip`, `Popover`, `ConfirmDialog`, `ConfirmPopup`, `DynamicDialog`.
6. ✅ **Media** — `Avatar`, `AvatarGroup`, `Carousel`, `Image`, `Galleria`.
7. ✅ **Misc & Directivas** — `Chip`, `MeterGroup`, `Inplace`, `BlockUI`, `InlineMessage`, `Terminal`, `Chart`, `Ripple`, `FocusTrap`, `AnimateOnScroll`, `StyleClass`, `AutoFocus`.

### Infraestructura / calidad (Fase 2 — v1.0.0)

- [x] **Publicación a npm** (`@caribeng/ui` v1.0.0): verificado con `npm pack --dry-run ./dist/packages/ui` (389 archivos APF, `exports` y `peerDependencies` validados).
- [x] **CI** (GitHub Actions en `.github/workflows/ci.yml`): typecheck (`tsc --noEmit`) + build (`ui`, `tokens`, `showcase`) + `nx test ui` + validación `npm pack --dry-run`.
- [x] **README de consumo** (`README.md` y `packages/ui/README.md` empaquetado en `dist/packages/ui/README.md`): guía de instalación, `provideCaribeNG`, estilos, iconos, presets y catálogo de 93 entry points.
- [x] **Cobertura y scripts de verificación**: scripts `pnpm run test:coverage`, `pnpm run typecheck` y `pnpm run pack:verify` en `package.json`.
- [x] **Accesibilidad WCAG 2.2 AA**: suite transversal de contratos ARIA, nombres accesibles y regiones `aria-live` en `packages/ui/src/lib/a11y-contract.spec.ts`.
- [x] **Changelog / versionado**: `CHANGELOG.md` oficial para `v1.0.0` (SemVer + Keep a Changelog).
- [x] **Theming avanzado**: presets de paleta en vivo (`emerald`, `ocean`, `coral`, `amber`, `violet`, `rose`) y escalas personalizadas en `CbThemeService` + selector interactivo en `/foundations/theming`.

### Plan de mejora 22.x (acordado el 2026-10-20)

> Terminado y publicado en 22.2.0.

| # | Mejora | Por qué | Tamaño | Estado |
|---|---|---|---|---|
| 1 | **Sistema de idioma (i18n)**: `provideCaribeNG({ locale: 'en' })` con traducciones ES/EN de los textos de interfaz, sobrescribibles por cada app | Afecta a todos los que instalen el paquete; es lo más visible ahora que está en npm | Medio | ✅ Hecho |
| 2 | **Reescribir los 11 componentes minificados** (Tree, TreeTable, VirtualScroller, DataView, Timeline, OrderList, PickList, ConfirmPopup, DynamicDialog, ConfirmDialog, MegaMenu) con formato legible, accesibilidad, documentación y tests | Calidad y mantenibilidad; elimina deuda técnica | Grande, por tandas | ✅ Hecho |
| 3 | **Base de tests**: comportamiento, teclado y accesibilidad en los componentes con 1 test o menos (66 al empezar) | Red de seguridad para todo lo demás | Grande, por tandas | ✅ Hecho (375 → 560 tests; ningún componente con menos de 2) |
| 4 | **Paridad con PrimeNG** en componentes clave: Table (filtros, redimensionar, expandir), Select/MultiSelect (agrupación, scroll virtual), DatePicker (rangos, hora) | Lo que más usará el equipo en el día a día | Grande, por componente | ✅ Hecho (Table, Select/MultiSelect, DatePicker) |

### Pendiente / ideas

- **Publicación automática:** un workflow que ejecute `npm publish --provenance` al subir un tag `v*` (hoy se publica a mano).
- **Kanban:** una plantilla propia de tarjeta (`cbKanbanCard`) no se reenvía a través de `cb-kanban-workspace`.

---

## 10. Historial de hitos

- **v0.1 Fundación** — tokens, core, button, input, select, dialog, toast.
- **v0.2 Formularios** — textarea, checkbox, radio, toggle.
- **v0.3 Avanzados** — input-number, autocomplete, datepicker.
- **Reempaquetado** — paquete único `@caribeng/ui` (secondary entry points).
- **Iconos** — `<cb-icon>` + núcleo 361 + catálogo 1891 (Lucide, ISC);
  showcase sin emojis.
- **v0.4** — inputgroup, rating, slider, chips, multiselect.
- **Display** — badge, tag, message, card, divider.
- **Overlays** — tooltip, popover, drawer.
- **Panel** — accordion, tabs, stepper.
- **Feedback** — avatar, progressbar, spinner, skeleton, breadcrumb.
- **Form controls** — selectbutton, togglebutton, listbox, knob.
- **v0.11 Menu** — popup con acciones, enlaces, separadores y teclado.
- **v0.12 Menubar** — navegación horizontal, submenús y soporte de teclado.
- **v0.13 Panel / Layout** — Panel, Fieldset, Toolbar, Splitter, ScrollPanel y ScrollTop.
- **v0.14 Menu extra** — TabMenu, ContextMenu, PanelMenu, TieredMenu, MegaMenu, Dock y Steps.
- **v0.15 Data / Overlay extra** — DataView, Tree, TreeTable, Timeline, VirtualScroller, OrderList, PickList, ConfirmDialog, ConfirmPopup y DynamicDialog.
- **v0.16 Form / Media / Misc** — InputMask, InputOTP, FloatLabel, IconField, TreeSelect, CascadeSelect, FileUpload, Editor, Carousel, Image, Galleria, AvatarGroup, Chip, MeterGroup, Inplace, BlockUI, InlineMessage, Terminal y Ripple.
- **v0.18 Extra (Codex)** — OrganizationChart y SpeedDial.
- **v0.19 Chart, Password & Directivas Misc** — Password, Chart, FocusTrap, AnimateOnScroll, StyleClass y AutoFocus (93 entry points completados).
- **v1.0.0 Cierre General** — Plantillas de celda personalizadas en `Table` (`cbTableCell`), presets de paleta en vivo en `CbThemeService`, `README.md`, `CHANGELOG.md`, pipeline CI (`.github/workflows/ci.yml`), suite transversal a11y y verificación `npm pack`.
- **v1.1.0 Caribe Design** — 45 componentes en `@caribeng/ui/caribe/<name>` (cards, transacciones, alertas, navegación, botones, paneles, loaders, archivos y formularios).
- **v22.0.0** — requiere Angular 22; el major se alinea con Angular y la v21 queda en mantenimiento (`release/21.x`).
- **v22.1.0** — estado de validación automático en formularios (`cbFieldState`), indicador de obligatoriedad configurable, Pricing, FileCard, FolderCard, sección Accesibilidad y Templates en el showcase.
- **v22.2.0** — plan de mejora 22.x completo (i18n ES/EN, 11 componentes reescritos, base de tests, paridad con PrimeNG en Table, Select y DatePicker), `ng add`, Chart ampliado, PDF Viewer y componentes nuevos (SplitButton, Empty, Descriptions, Result, Statistic, ThemeToggle…).
- **v22.3.0** — Kanban con cinco vistas y espacio de trabajo, Chat (IA), PhoneInput, CommandPalette, Kbd, CopyButton, Pricing horizontal/list, utilidades CSS (277 clases) y migrador `migrate-from-primeng`.
