# AGENTS.md — Guía Maestra y Coordinación Multi-Agente (CaribeNG)

> **Lectura obligatoria** para **Codex**, **Claude Code** y **Gemini (Antigravity)** antes de iniciar cualquier tarea o hacer cualquier commit en `CaribeNG`.

---

## 1. Regla General Inquebrantable (Pre-Commit Gate)

**ANTES de pedir confirmación o hacer cualquier commit/merge, el agente DEBE verificar sin excepción:**

1. **Cero errores de compilación (Librería + Tokens + Showcase):**
   ```bash
   NODE_OPTIONS=--dns-result-order=ipv4first pnpm nx run-many -t build
   ```
2. **Cero errores de TypeScript en IDE / Language Service (`tsc --noEmit`):**
   ```bash
   NODE_OPTIONS=--dns-result-order=ipv4first pnpm exec tsc -p packages/ui/tsconfig.lib.json --noEmit
   NODE_OPTIONS=--dns-result-order=ipv4first pnpm exec tsc -p packages/ui/tsconfig.spec.json --noEmit
   NODE_OPTIONS=--dns-result-order=ipv4first pnpm exec tsc -p apps/showcase/tsconfig.app.json --noEmit
   ```
   *(Asegúrate de que todo nuevo secondary entry point esté registrado en `tsconfig.base.json` bajo `paths` y tenga su `packages/ui/<name>/ng-package.json` y `src/public-api.ts` antes de importarlo en otros componentes o en `showcase`).*
3. **100% de Tests Unitarios en verde:**
   ```bash
   NODE_OPTIONS=--dns-result-order=ipv4first pnpm nx test ui
   ```
4. **Verificación visual por el Usuario (Ahorro de tokens):**
   - El agente **NO** abre navegadores automatizados ni toma capturas salvo petición explícita del usuario.
   - El agente entrega la checklist de pruebas manuales (ruta en `http://127.0.0.1:4200` + interacciones + resultado esperado) y espera confirmación del usuario antes de commitear y fusionar a `main`.

---

## 2. División de Trabajo y Coordinación entre Agentes

Para evitar conflictos de archivos (`tsconfig.base.json`, `app.routes.ts`, `nav.ts`, `PROGRESO.md`) cuando trabajamos en paralelo:

| Agente | Workspace / Carpeta | Estado de Componentes (Fase 1: 93/93 ✅) | Asignación Fase 2 (Calidad, A11y y Distribución) |
|---|---|---|---|
| **Codex** | `C:\DEVELOPER\CaribeNG\caribeng` | ✅ Completados: `Menubar`, `TabMenu`, `ContextMenu`, `PanelMenu`, `TieredMenu`, `MegaMenu`, `Dock`, `Steps`, `DataView`, `Tree`, `TreeTable`, `Timeline`, `VirtualScroller`, `OrderList`, `PickList`, `ConfirmDialog`, `ConfirmPopup`, `DynamicDialog`, `OrganizationChart`, `SpeedDial` | Plantillas avanzadas en `Table`/`DataView` y pruebas de regresión de teclado |
| **Gemini (Antigravity)** | `C:\DEVELOPER\CaribeNG\caribeng` | ✅ Completados: `Panel`, `Fieldset`, `Toolbar`, `Splitter`, `ScrollPanel`, `ScrollTop`, `InputMask`, `InputOTP`, `FloatLabel`, `IconField`, `TreeSelect`, `CascadeSelect`, `FileUpload`, `Editor`, `Carousel`, `Image`, `Galleria`, `AvatarGroup`, `Chip`, `MeterGroup`, `Inplace`, `BlockUI`, `InlineMessage`, `Terminal`, `Ripple`, `Password`, `Chart`, `FocusTrap`, `AnimateOnScroll`, `StyleClass`, `AutoFocus` | Coordinación general, integración de ramas en `main`, Pre-Commit Gate y validación APF |
| **Claude Code** | `C:\DEVELOPER\CaribeNG\caribeng` | ✅ Base fundacional (v0.1–v0.11: 37 componentes + sistema de tokens e iconos) | Auditoría formal `axe-core` WCAG 2.2 AA, preparación de publicación npm (`npm pack`, `README.md`, `CHANGELOG.md`) y CI |

### Reglas de sincronización Git entre agentes:
1. **Un lote = Una rama `feat/...`** nacida desde `main`.
2. **Nunca tocar los componentes del lote de otro agente.**
3. Al fusionar a `main` (`git merge --no-ff`), actualizar `PROGRESO.md` y resolver limpiamente cualquier unión en:
   - `tsconfig.base.json` (`paths` ordenados alfabéticamente o al final)
   - `apps/showcase/src/app/app.routes.ts`
   - `apps/showcase/src/app/data/nav.ts`
   - `PROGRESO.md`

---

## 3. Reglas Técnicas y "Gotchas" Críticos del Proyecto

1. **Empaquetado único (`@caribeng/ui`):**
   - No crear paquetes nuevos fuera de `packages/ui/`.
   - Cada componente nuevo vive en `packages/ui/<name>/` con su propio `ng-package.json`:
     ```json
     {
       "lib": {
         "entryFile": "src/public-api.ts"
       }
     }
     ```
   - Registrar siempre `@caribeng/ui/<name>` en `tsconfig.base.json` (`./packages/ui/<name>/src/public-api.ts`).
2. **Reactividad y Angular 22:**
   - Todos los componentes son `standalone: true` y `ChangeDetectionStrategy.OnPush`.
   - Usar exclusivamente `input()`, `output()`, `model()`, `computed()`, `effect()`, `viewChild()`, `contentChildren()`.
   - Para controles de formulario (`ControlValueAccessor`), usar `value = model<...>()` para soportar tanto `[(value)]` con signals como `formControlName`/`ngModel`.
   - En demos con Reactive Forms, **nunca** combinar `[disabled]="true"` en template con `[formControl]`; inicializar el control con `new FormControl({ value, disabled: true })`.
3. **Estilos y Dark Mode:**
   - Variables CSS con prefijo `--cb-*` (paleta PrimeNG Aura).
   - En CSS de componente (encapsulación emulada), usar **`:host-context([data-theme="dark"])`**, **NUNCA** `:root[data-theme="dark"]`.
   - Estilar el elemento raíz del componente con **`:host`** (y `:host(.clase)`), no con `.clase` suelta.
   - En demos del showcase para componentes de bloque (`tabs`, `stepper`, `slider`, `progressbar`, `panel`, `fieldset`, `toolbar`, `splitter`), añadir `style="width: 100%"` en el contenedor de demo flex.
4. **Iconos (`<cb-icon>`):**
   - Prohibido usar emojis o glifos CSS ad-hoc.
   - Usar siempre `<cb-icon name="..." />` importando `CbIconComponent` desde `@caribeng/ui/icon`.
5. **Testing (`vitest` + `jsdom`):**
   - Para actualizar signal inputs en tests: usar `fixture.componentRef.setInput('prop', val)` o un `signal()` en el componente host de prueba.
   - Para overlays creados dentro de `effect()` (como `dialog`/`drawer`): llamar a `TestBed.tick()` además de `fixture.detectChanges()`.
   - Los overlays de CDK se montan en `document.body` (`.cdk-overlay-container`), consultarlos con `document.querySelector(...)`.
6. **Red / npm / Nx en esta máquina:**
   - Siempre anteponer `NODE_OPTIONS=--dns-result-order=ipv4first` al ejecutar `pnpm` o `nx`.
