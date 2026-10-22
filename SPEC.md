# CaribeNG — Design System Specification

**Archivo:** `SPEC.md`
**Proyecto:** CaribeNG
**Versión del spec:** 1.1
**Prefijo oficial:** `cb-`
**npm scope:** `@caribeng`
**Framework objetivo:** Angular 22+
**Estado:** Borrador de especificación técnica v1.1

> Nota de implementación: el toolchain se alinea con el core de Angular. La
> fundación v0.1 se construyó sobre **Angular 22.0.x** (ng-packagr 22, Nx 23,
> pnpm). El spec original mencionaba Angular 21+ como mínimo; se adopta 22 para
> ir a la par del framework.

---

## 1. Identidad del proyecto

| Campo | Valor |
|---|---|
| Nombre | CaribeNG |
| npm scope | `@caribeng` |
| Prefijo de selectores | `cb-` |
| Prefijo de clases CSS | `.cb-` |
| Prefijo de variables CSS | `--cb-` |
| Prefijo de directivas | `cb` (camelCase) |
| Prefijo de servicios | `Cb` (PascalCase) |
| Repositorio | monorepo (Nx + pnpm) |
| Licencia | MIT |

---

## 2. Objetivo

CaribeNG es un sistema de diseño y una librería de componentes reutilizables para Angular. Su propósito es ofrecer componentes accesibles, personalizables, responsive y compatibles con los mecanismos nativos del framework.

La librería es **independiente de PrimeNG** y de cualquier otra librería de componentes de terceros. Su única dependencia de comportamiento es `@angular/cdk`, mantenida por el equipo oficial de Angular.

La librería debe poder instalarse en múltiples proyectos sin exigir una tecnología específica de estilos ni imponer la configuración global de Angular.

---

## 3. Principios fundamentales

1. Compatibilidad con Angular Forms.
2. Compatibilidad con Angular zoneless y Zone.js.
3. Independencia de CSS, SCSS y Tailwind CSS.
4. Diseño responsive y accesible.
5. Compatibilidad con navegadores definidos en la matriz de soporte.
6. API pública consistente y documentada.
7. Personalización mediante design tokens.
8. Utilidades CSS propias con prefijo `cb-`.
9. Distribución mediante npm.
10. Pruebas automatizadas y política de versionado.
11. Cero dependencia de librerías de componentes de terceros (PrimeNG, Material, NG-Zorro, etc.).
12. Signals como mecanismo principal de reactividad interna.
13. Componentes standalone por defecto — sin NgModules internos.
14. Cada categoría de componentes publicada como entry point independiente para tree-shaking óptimo.

---

## 4. Dependencias externas permitidas

| Paquete | Motivo | Tipo |
|---|---|---|
| `@angular/cdk` | Overlays, focus trap, virtual scroll, a11y, drag & drop | `peerDependency` |
| `@angular/core` | Framework base | `peerDependency` |
| `@angular/forms` | Integración con formularios | `peerDependency` |
| `@angular/common` | Pipes y directivas comunes | `peerDependency` |
| `rxjs` | Streams en servicios internos | `peerDependency` |

No se admitirán dependencias de librerías de componentes de terceros (PrimeNG, Angular Material, NG-Zorro, Ant Design, etc.) en ningún paquete publicado de `@caribeng`.

---

## 5. Arquitectura del monorepo

### Stack

- **Monorepo:** Nx
- **Package manager:** pnpm
- **Workspaces:** pnpm workspaces
- **Build:** `@nx/angular:package` + `ng-packagr`
- **Compilación:** Partial-Ivy (Angular Package Format)

### Estructura de directorios (objetivo v1)

Un paquete por componente bajo `packages/`, más `tokens`, `core` y la app
`showcase`. Ver la sección 8 para el catálogo completo de 75 componentes.

---

## 6. Compatibilidad del framework

- Angular 22 como versión del toolchain inicial (mínimo soportado declarado 22).
- Soporte de versiones posteriores sujeto a pruebas de compatibilidad.
- Compatibilidad con aplicaciones **standalone** (predeterminado).
- Soporte de NgModules cuando sea necesario para los proyectos consumidores.
- Compatibilidad con Reactive Forms y Template-driven Forms.
- Compatibilidad con **zoneless** y **Zone.js** sin exigir una configuración global particular.
- Compatibilidad con SSR e hidratación cuando forme parte de la matriz de soporte.

La librería no debe configurar ni reemplazar la estrategia de detección de cambios de la aplicación consumidora.

---

## 7. Detección de cambios y reactividad

### Reglas obligatorias para todos los componentes

- `ChangeDetectionStrategy.OnPush` en todos los componentes sin excepción.
- `input()` signal en lugar de `@Input()`.
- `output()` signal en lugar de `@Output() EventEmitter`.
- `model()` signal para two-way binding.
- `viewChild()` / `contentChild()` en lugar de `@ViewChild` / `@ContentChild`.
- `computed()` para valores derivados del estado.
- `effect()` para side effects reactivos.
- `afterNextRender()` para operaciones que requieran acceso al DOM.
- No inyectar `NgZone` directamente en ningún componente.
- No usar `ChangeDetectorRef.detectChanges()` — usar `markForCheck()` solo si es estrictamente necesario.
- No depender de `NgZone.onStable` para la funcionalidad de los componentes.

### Compatibilidad de instalación

```typescript
// Aplicación con Zone.js
providers: [
  provideZoneChangeDetection({ eventCoalescing: true }),
  provideCaribeNG({ theme: 'light' })
]

// Aplicación zoneless
providers: [
  provideZonelessChangeDetection(),
  provideCaribeNG({ theme: 'light' })
]
```

---

## 8. Catálogo de componentes v1 (75 total)

- **Form (17):** Button, Input, Textarea, Select, MultiSelect, Checkbox, Radio, Toggle, DatePicker, InputNumber, InputMask, InputGroup, Slider, Rating, ColorPicker, FileUpload, Autocomplete.
- **Data (9):** Table, DataView, VirtualScroller, Paginator, Timeline, Tree, TreeTable, OrderList, PickList.
- **Overlay (7):** Dialog, Drawer, Tooltip, Popover, ConfirmDialog, ConfirmPopup, DynamicDialog.
- **Notification (5):** Toast, Message, Badge, Tag, Chip.
- **Navigation (11):** Menu, MenuBar, ContextMenu, Breadcrumb, Steps, TabMenu, Tabs, PanelMenu, TieredMenu, MegaMenu, Dock.
- **Panel/Layout (9):** Card, Panel, Accordion, Fieldset, Divider, Splitter, Toolbar, ScrollPanel, Stepper.
- **Media (8):** Image, Carousel, Galleria, Avatar, AvatarGroup, Skeleton, ProgressBar, ProgressSpinner.
- **Misc (9):** Icon, BlockUI, Inplace, Ripple (dir), FocusTrap (dir), AnimateOnScroll (dir), StyleClass (dir), AutoFocus (dir), Chart.

Todos los selectores usan prefijo `cb-` (componentes) o `cb` camelCase (directivas).

---

## 9. Componentes de formulario — requisitos

Los controles deben integrarse con Angular Forms mediante `ControlValueAccessor`:
`writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState`;
soporte de `formControlName`, `[formControl]` y `ngModel`; respeto de estados
`valid/invalid/touched/dirty/pending/disabled`; asociación accesible con
`aria-describedby`; pruebas con Reactive y Template-driven Forms.

---

## 10. Arquitectura de estilos

- **CSS** estándar + variables `--cb-*`; nomenclatura BEM con prefijo `cb-`.
- **SCSS** opcional (mixins/funciones); el consumidor no lo necesita si usa el CSS compilado.
- **Tailwind** no es dependencia obligatoria; integración documentada.

---

## 11. Convenciones de nombres

| Tipo | Convención | Ejemplo |
|---|---|---|
| Selector de componente | `cb-` + kebab-case | `cb-button` |
| Selector de directiva | `cb` + camelCase | `cbTooltip` |
| Clase de componente | `Cb` + PascalCase + `Component` | `CbButtonComponent` |
| Clase de servicio | `Cb` + PascalCase + `Service` | `CbThemeService` |
| Clase CSS bloque | `.cb-` + kebab-case | `.cb-button` |
| Clase CSS modificador | `.cb-` + bloque + `--` + mod | `.cb-button--primary` |
| Clase CSS estado | `.cb-is-` + estado | `.cb-is-disabled` |
| Variable CSS | `--cb-` + token | `--cb-color-primary` |
| Entry point npm | `@caribeng/` + kebab-case | `@caribeng/button` |

---

## 12. Design tokens y temas

Variables CSS `--cb-*`: escalas de color primary/secondary (50–950), semánticos
(success/warning/danger/info), superficie y texto, tipografía, espaciado (4px),
radios, sombras, movimiento, z-index y breakpoints de referencia.

Dark mode con `[data-theme="dark"]`. `CbThemeService` gestionado con signals
(`toggle()`, `setTheme()`, `isDark()`). Personalización sobrescribiendo variables.

---

## 13. Sistema responsive (mobile-first)

| Nombre | Ancho mínimo |
|---|---:|
| `xs` | 0 px |
| `sm` | 576 px |
| `md` | 768 px |
| `lg` | 992 px |
| `xl` | 1200 px |
| `2xl` | 1400 px |

---

## 14. Utilidades CSS (prefijo `cb-`)

Layout (`cb-flex`, `cb-grid`, `cb-hidden`…), flex (`cb-grow`, `cb-shrink-0`,
`cb-self-*`…), grid (`cb-grid-cols-1…12`, `cb-col-span-*`), alineación
(`cb-items-center`, `cb-justify-between`…), espaciado (`cb-gap-*`,
`cb-gap-x/y-*`, `cb-p-*`, `cb-px/py/pt/pr/pb/pl-*`, igual para `m`, escala
0–8 y `cb-mx-auto`), tamaño (`cb-w-full`…), posición y desbordamiento
(`cb-relative`, `cb-sticky`, `cb-overflow-*`…), tipografía (`cb-text-xs…2xl`,
`cb-font-*`, `cb-truncate`…), color de texto (`cb-text-muted`,
`cb-text-{severidad}`), fondos (`cb-bg-surface`, `cb-bg-{severidad}`,
`cb-bg-{severidad}-subtle`), bordes, radio (`cb-rounded-*`) y sombras
(`cb-shadow-*`). Todas leen los tokens `--cb-*` y siguen el tema.
Independientes de Tailwind.

---

## 15. Accesibilidad — WCAG 2.2 AA

Teclado completo, foco visible, nombres accesibles, ARIA donde el HTML nativo no
baste, gestión de foco en overlays (CDK FocusTrap), contraste suficiente,
`prefers-reduced-motion`, pruebas con `axe-core` y revisión con lectores.

---

## 16. Compatibilidad de navegadores

Chrome / Edge / Firefox / Safari (últimas 2 versiones, desktop), Safari iOS y
Chrome Android (últimas 2 versiones).

---

## 17. Distribución

npm bajo `@caribeng`, Angular Package Format (Partial-Ivy), peerDependencies de
Angular, entry points explícitos, tree-shaking (un paquete por componente),
estilos CSS compilados y SCSS cuando corresponda.

---

## 18. Pruebas y calidad

Por componente: render, inputs/outputs, estados, a11y (axe-core), teclado,
responsive, formularios, zoneless y Zone.js, regresión visual representativa.
CI: build de paquetes, unit tests, ESLint, validación APF, a11y.

---

## 19. Versionado

SemVer, changelog, API documentada por release, política de deprecación de al
menos un ciclo mayor, guías de migración, matriz de compatibilidad Angular ↔ CaribeNG.

---

## 20. Roadmap

- **v0.1 Fundación:** monorepo, `tokens`, `core` (`provideCaribeNG`, `CbThemeService`), `button`, `input`, `select`, `dialog`, `toast`, showcase, pruebas zoneless/Zone.js.
- **v0.2 Formularios:** textarea, checkbox, radio, toggle, datepicker, autocomplete, input-number.
- **v0.3 Data y overlays:** table, paginator, drawer, tooltip, popover.
- **v0.4 Navigation y layout:** tabs, accordion, breadcrumb, steps, card, stepper.
- **v1.0:** los 75 componentes, docs completas, regresión visual, publicación npm.

---

## 21. Criterios de aceptación v1.0

Instalable en Angular 22 (`npm install @caribeng/core @caribeng/button`);
controles con `formControlName`; funciona en zoneless y Zone.js; CSS y SCSS
resueltos tras instalar; integración Tailwind documentada; responsive; a11y y
formularios automatizados donde sea posible; paquete publicado correcto; docs
de instalación/personalización/compatibilidad; **cero dependencias de PrimeNG,
Angular Material u otra librería de componentes de terceros**.

**Regla general:** toda compatibilidad declarada debe estar respaldada por una
prueba, una configuración reproducible o una limitación documentada.
