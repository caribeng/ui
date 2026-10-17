# CaribeNG

Sistema de diseño y librería de componentes para **Angular 22+**, independiente de PrimeNG y de cualquier otra librería de componentes de terceros. Su única dependencia de comportamiento es `@angular/cdk`.

- **Scope npm:** `@caribeng`
- **Prefijo:** `cb-` (selectores, clases, variables CSS)
- **Monorepo:** Nx + pnpm
- **Reactividad:** Signals · `OnPush` en todos los componentes · standalone

> Estado: **v0.1 — Fundación** (en desarrollo). Ver `SPEC.md` para la especificación completa.

## Paquetes de esta fase

| Paquete | Descripción |
|---|---|
| `@caribeng/tokens` | Design tokens (`--cb-*`), utilidades y mixins SCSS. |
| `@caribeng/core` | `provideCaribeNG()`, `CbThemeService`, tipos compartidos. |
| `@caribeng/button` | Componente Button (variantes, severidades, loading). |
| `@caribeng/input` | Componente Input con `ControlValueAccessor`. |
| `apps/showcase` | App de demostración (arranca en modo **zoneless**). |

## Requisitos

- Node.js >= 20.19
- pnpm (vía corepack: `corepack enable pnpm`)

## Desarrollo

```bash
pnpm install

# Compilar todas las librerías publicables
pnpm build:libs

# Levantar la app showcase
pnpm showcase        # http://localhost:4200

# Compilar un paquete puntual
pnpm nx build button
```

## Estructura

```
caribeng/
├── packages/
│   ├── tokens/   → @caribeng/tokens
│   ├── core/     → @caribeng/core
│   ├── button/   → @caribeng/button
│   └── input/    → @caribeng/input
├── apps/
│   └── showcase/ → demo
├── nx.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Uso (consumidor)

```ts
import { provideCaribeNG } from '@caribeng/core';
import { CbButtonComponent } from '@caribeng/button';
import { CbInputComponent } from '@caribeng/input';

bootstrapApplication(AppComponent, {
  providers: [provideCaribeNG({ theme: 'light' })],
});
```

```css
/* estilos globales */
@import '@caribeng/tokens/css/caribeng.css';
```

## Licencia

MIT
