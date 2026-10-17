# CaribeNG — Estado del proyecto

> Última actualización: 2026-10-17
> Librería de componentes Angular (greenfield), independiente de PrimeNG y de
> terceros (solo `@angular/cdk` y `@angular/platform-browser`).

---

## 1. Resumen rápido

| Métrica | Valor |
|---|---|
| Componentes de UI | **~50** (objetivo SPEC: **75**) |
| Tests unitarios | **180** en verde |
| Entry points publicables | `@caribeng/ui` + 1 por componente + `@caribeng/ui/icons` |
| Build | Limpio (ng-packagr / APF) |
| Iconos | **361** núcleo + **1891** catálogo (Lucide, ISC) |
| App de docs | `showcase` (sitio enrutado estilo PrimeNG) |

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

### Overlay
| Componente | Entry point |
|---|---|
| Dialog | `@caribeng/ui/dialog` |
| Drawer | `@caribeng/ui/drawer` |
| Tooltip (directiva `[cbTooltip]`) | `@caribeng/ui/tooltip` |
| Popover | `@caribeng/ui/popover` |

### Messages
| Componente | Entry point |
|---|---|
| Toast | `@caribeng/ui/toast` |
| Message | `@caribeng/ui/message` |
| Badge | `@caribeng/ui/badge` |
| Tag | `@caribeng/ui/tag` |

### Panel
| Componente | Entry point |
|---|---|
| Card | `@caribeng/ui/card` |
| Divider | `@caribeng/ui/divider` |
| Accordion | `@caribeng/ui/accordion` |
| Tabs | `@caribeng/ui/tabs` |
| Stepper | `@caribeng/ui/stepper` |

### Data
| Componente | Entry point |
|---|---|
| Table | `@caribeng/ui/table` |
| Paginator | `@caribeng/ui/paginator` |

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

### Media · Misc · Menu
| Componente | Entry point | Grupo |
|---|---|---|
| Avatar | `@caribeng/ui/avatar` | Media |
| ProgressBar | `@caribeng/ui/progressbar` | Misc |
| Spinner | `@caribeng/ui/spinner` | Misc |
| Skeleton | `@caribeng/ui/skeleton` | Misc |
| Breadcrumb | `@caribeng/ui/breadcrumb` | Menu |

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

### Convenciones de commit

- Mensajes `feat(<grupo>): …`, `refactor: …`, `chore: …`.
- Atribución al final del mensaje:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

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

## 9. Lo que falta por hacer

### Componentes (hacia los 75)

Faltan ~**25**. Próximos lotes sugeridos (en orden de valor):

1. **Datos** — ✅ `Table` (ordenación/selección/paginación), ✅ `Paginator`.
   Pendiente: plantillas de celda personalizadas (Table v2), `DataView`,
   `Tree`/`TreeTable`, `Timeline`, `VirtualScroller`.
2. **Menu** — ✅ `Menu`, ✅ `Menubar`, ✅ `TabMenu`, ✅ `ContextMenu`, ✅ `PanelMenu`,
   ✅ `TieredMenu`, ✅ `MegaMenu`, ✅ `Dock`, ✅ `Steps`.
3. **Form extra** — `TreeSelect`, `CascadeSelect`, `InputMask`, `InputOTP`,
   `FloatLabel`/`IftaLabel`/`IconField`, `Editor`, `FileUpload`.
4. **Panel / Layout** — `Panel` (colapsable), `Fieldset`, `Toolbar`,
   `Splitter`, `ScrollPanel`, `ScrollTop`.
5. **Overlay extra** — `ConfirmDialog`, `ConfirmPopup`, `DynamicDialog`.
6. **Media** — `Carousel`, `Image`, `Galleria`, `AvatarGroup`.
7. **Misc** — `Chip` (individual), `MeterGroup`, `Inplace`, `BlockUI`,
   `InlineMessage`, `Terminal`, `Ripple`.

### Infraestructura / calidad

- [ ] **Publicación a npm** (`@caribeng/ui`): `npm pack` de prueba, versión,
      `provenance`, verificar `exports` y `peerDependencies`.
- [ ] **CI** (GitHub Actions u otro): build + test + lint en cada PR.
- [ ] **README de consumo** (instalación, `provideCaribeNG`, estilos, tema).
- [ ] **Cobertura** con umbrales y reporte.
- [ ] **Tests e2e / de interacción** (drag del slider/knob, overlays) — hoy
      cubiertos sobre todo por verificación manual en el navegador.
- [ ] **Accesibilidad**: auditoría formal (axe) por componente.
- [ ] **Changelog / versionado** (semver, Conventional Commits).
- [ ] **Theming avanzado**: más presets de paleta, documentación de tokens.

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
- **v0.14 Menu extra** — TabMenu, ContextMenu, PanelMenu, TieredMenu, MegaMenu, Dock y Steps.
