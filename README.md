# CaribeNG — Design System & Librería de Componentes Angular 22+

[![Angular 22](https://img.shields.io/badge/Angular-22-dd0031.svg)](#)
[![Entry Points](https://img.shields.io/badge/Entry%20Points-142-10b981.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#)

Monorepo oficial de **CaribeNG** (`@caribeng/ui`), una librería greenfield de componentes y directivas para Angular 22+ construida con **Signals**, `ChangeDetectionStrategy.OnPush`, soporte **Zoneless**, tokens CSS (`--cb-*`) y accesibilidad **WCAG 2.2 AA**.

---

## 📦 Instalación (para usar la librería en tu proyecto)

Requiere un proyecto **Angular 22**. El major de CaribeNG coincide con el de Angular (`22.x` → Angular 22; `21.x` → Angular 21, en mantenimiento).

```bash
npm install @caribeng/ui
```

1. Registra el proveedor en `app.config.ts`:

   ```ts
   import { ApplicationConfig } from '@angular/core';
   import { provideCaribeNG } from '@caribeng/ui';

   export const appConfig: ApplicationConfig = {
     providers: [provideCaribeNG()],
   };
   ```

2. Agrega los estilos en `angular.json` (`"styles"`):

   ```json
   "node_modules/@caribeng/ui/styles/caribeng.css"
   ```

3. Importa los componentes desde su entry point:

   ```ts
   import { Component } from '@angular/core';
   import { CbButton } from '@caribeng/ui/button';

   @Component({
     imports: [CbButton],
     template: `<cb-button>Continuar</cb-button>`,
   })
   export class App {}
   ```

Guía completa (opciones del proveedor, tema, formularios, iconos y catálogo) en [`packages/ui/README.md`](./packages/ui/README.md), que es también el README que muestra npm. Las novedades de cada versión están en [`CHANGELOG.md`](./CHANGELOG.md) y el estado del proyecto en [`PROGRESO.md`](./PROGRESO.md).

---

## Estructura del Monorepo (Nx 23 + pnpm 11)

- [`packages/ui`](./packages/ui): Paquete publicable `@caribeng/ui` con entry point primario y **142 secondary entry points** (`@caribeng/ui/button`, `@caribeng/ui/table`, `@caribeng/ui/caribe/alert`, etc.).
- [`packages/tokens`](./packages/tokens): Sistema de tokens CSS/SCSS (`--cb-*`), utilidades y soporte nativo de modo oscuro (`[data-theme="dark"]`).
- [`apps/showcase`](./apps/showcase): Aplicación interactiva de documentación con ejemplos en vivo (HTML y TypeScript), accesibilidad y tablas de API para los 142 componentes y directivas.

---

## Comandos de Desarrollo

> En entornos con resolución IPv6 inestable hacia el registro npm, antepón `NODE_OPTIONS=--dns-result-order=ipv4first`.

```bash
# Instalar dependencias
NODE_OPTIONS=--dns-result-order=ipv4first pnpm install

# Compilar todos los paquetes y aplicaciones (ui, tokens, showcase)
NODE_OPTIONS=--dns-result-order=ipv4first pnpm run build

# Ejecutar la suite completa de tests unitarios (Vitest + jsdom)
NODE_OPTIONS=--dns-result-order=ipv4first pnpm nx test ui

# Ejecutar tests con reporte de cobertura
NODE_OPTIONS=--dns-result-order=ipv4first pnpm run test:coverage

# Levantar el sitio de documentación interactivo (http://127.0.0.1:4200)
NODE_OPTIONS=--dns-result-order=ipv4first pnpm run showcase

# Verificar el empaquetado npm (Angular Package Format)
NODE_OPTIONS=--dns-result-order=ipv4first pnpm run pack:verify
```

