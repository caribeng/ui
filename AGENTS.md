# AGENTS.md — Guía Maestra y Coordinación Multi-Agente (CaribeNG)

> **Lectura obligatoria** para **Codex**, **Claude Code** y **Gemini (Antigravity)** antes de iniciar cualquier tarea o hacer cualquier commit en `CaribeNG`.

---

## 1. Regla General Inquebrantable (Pre-Commit Gate)

**ANTES de hacer cualquier commit/merge, el agente DEBE verificar sin excepción:**

1. **Cero errores de TypeScript en IDE / Language Service (`tsc --noEmit`):**
   ```bash
   node ./node_modules/typescript/bin/tsc -p packages/ui/tsconfig.lib.json --noEmit
   node ./node_modules/typescript/bin/tsc -p packages/ui/tsconfig.spec.json --noEmit
   node ./node_modules/typescript/bin/tsc -p apps/showcase/tsconfig.app.json --noEmit
   ```
   *(Todo nuevo secondary entry point debe estar registrado en `tsconfig.base.json` bajo `paths` y tener su `packages/ui/<name>/ng-package.json` y `src/public-api.ts`).*
2. **Cero errores de compilación (Librería + Tokens + Showcase):**
   ```bash
   NODE_OPTIONS=--dns-result-order=ipv4first .\node_modules\.bin\nx.cmd run-many -t build
   ```
3. **100% de Tests Unitarios en verde:**
   ```bash
   NODE_OPTIONS=--dns-result-order=ipv4first .\node_modules\.bin\nx.cmd test ui
   ```
4. **Sin navegación automatizada en navegador:**
   - Ningún agente debe abrir Chrome/Playwright para pruebas visuales (ahorro de tokens).

---

## 2. Fase Actual — Migración de Componentes de Caribe Design (`C:\DEVELOPER\DATA_COPY`)

> ✅ **COMPLETADA y fusionada (2026-10-27):** el namespace `@caribeng/ui/caribe/*` se disolvió; los 30 componentes de Caribe Design viven ahora en `packages/ui/<name>/` y se importan como `@caribeng/ui/<name>` (mismo nivel que el resto del catálogo). Se eliminaron 15 duplicados de la base (ver `PROGRESO.md` §4).

En `C:\DEVELOPER\DATA_COPY\NU0065001_WebComponents_Lib\packages\caribe-design-system` y `C:\DEVELOPER\DATA_COPY\DOCUMENTACION CARIBE\COMPONENTS` se encuentra la librería de referencia **Caribe Design** (60 paquetes). Ya existen 15 nombres en `packages/ui/`; los **45 paquetes restantes** se dividen en 3 lotes exactos de **15 componentes por agente**:

| Agente | Workspace / Carpeta | Rama Asignada | Lote de 15 Componentes de Caribe Design (`@caribeng/ui/caribe/<name>`) |
|---|---|---|---|
| **Codex** | `C:\DEVELOPER\CaribeNG\caribeng` | `feat/v1.1-codex-caribe-cards-tx` | **Cards, Transacciones y Alertas (15):** `alert`, `inline-alert`, `card-content`, `card-move`, `card-primary`, `card-select`, `coachmark`, `onboarding`, `status`, `tracker`, `transaction-status`, `voucher`, `data-table`, `modal`, `pop-over` |
| **Claude Code** | `C:\DEVELOPER\CaribeNG\caribeng-claude` | `feat/v1.1-claude-caribe-nav-actions` | **Navegación, Botones y Paneles (15):** `button-group`, `icon-button`, `tag-button`, `fab-menu`, `float-menu`, `header`, `footer`, `link`, `shortcut`, `expansion-panel`, `off-canvas`, `dots-indicator`, `step-indicator`, `switch`, `progress-bar` |
| **Gemini (Antigravity)** | `C:\DEVELOPER\CaribeNG\caribeng-gemini` | `feat/v1.1-gemini-caribe-identity-forms` | **Identidad, Loaders y Formularios (15):** `animation-lottie`, `circle-loading`, `loader`, `preloader`, `logo`, `illustration`, `pictogram`, `stroke`, `file-download`, `file-select`, `input-search`, `input-token`, `input-date`, `input-select`, `calendar` |

### Fuentes de Referencia de Caribe Design (Solo lectura):
- Código fuente de referencia: `C:\DEVELOPER\DATA_COPY\NU0065001_WebComponents_Lib\packages\caribe-design-system\<name>`
- Documentación funcional y ejemplos: `C:\DEVELOPER\DATA_COPY\DOCUMENTACION CARIBE\COMPONENTS\componentes-<name>.md`

### Reglas de implementación para los 45 componentes de Caribe Design:
1. **Arquitectura nativa de CaribeNG (Angular 22):**
   - No copiar dependencias legacy de `caribe-design-system` (`@bancolombia/...` ni SCSS externo).
   - Implementar cada componente como standalone, `ChangeDetectionStrategy.OnPush`, `ViewEncapsulation.Emulated`, usando `input()`, `output()`, `model()`, `computed()` y variables CSS `--cb-*` con soporte dark mode (`:host-context([data-theme="dark"])`).
   - Mantener el selector `<cb-<name>>` y exportar la clase **sin sufijo `Component`** (`Cb<PascalName>`, ej. `CbAlert`, `CbButtonGroup`, `CbAnimationLottie`).
2. **Estructura por cada componente `<name>` (bajo namespace `@caribeng/ui/caribe/<name>`):**
   - `packages/ui/caribe/<name>/ng-package.json` (`{ "$schema": "../../../node_modules/ng-packagr/ng-package.schema.json", "lib": { "entryFile": "src/public-api.ts" } }`)
   - `packages/ui/caribe/<name>/src/public-api.ts`
   - `packages/ui/caribe/<name>/src/lib/<name>.component.ts` (+ `.css` opcional)
   - `packages/ui/caribe/<name>/src/lib/<name>.component.spec.ts` (mínimo 1–2 tests unitarios en Vitest)
   - Página de showcase en `apps/showcase/src/app/pages/<name>-doc.component.ts`
   - Registro en `tsconfig.base.json` (`@caribeng/ui/caribe/<name>`), `apps/showcase/src/app/app.routes.ts` y `apps/showcase/src/app/data/nav.ts`.
3. **Nunca tocar los componentes del lote de otro agente.**
