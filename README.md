# CaribeNG — Design System & Librería de Componentes Angular 22+

[![Angular 22](https://img.shields.io/badge/Angular-22-dd0031.svg)](#)
[![Entry Points](https://img.shields.io/badge/Entry%20Points-93-10b981.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#)

Monorepo oficial de **CaribeNG** (`@caribeng/ui`), una librería greenfield de componentes y directivas para Angular 22+ construida con **Signals**, `ChangeDetectionStrategy.OnPush`, soporte **Zoneless**, tokens CSS (`--cb-*`) y accesibilidad **WCAG 2.2 AA**.

---

## Estructura del Monorepo (Nx 23 + pnpm 11)

- [`packages/ui`](./packages/ui): Paquete publicable `@caribeng/ui` con entry point primario y **93 secondary entry points** (`@caribeng/ui/button`, `@caribeng/ui/table`, `@caribeng/ui/chart`, etc.).
- [`packages/tokens`](./packages/tokens): Sistema de tokens CSS/SCSS (`--cb-*`), utilidades y soporte nativo de modo oscuro (`[data-theme="dark"]`).
- [`apps/showcase`](./apps/showcase): Aplicación interactiva de documentación con ejemplos en vivo y tablas de API para los 93 componentes y directivas.

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

---

## Uso del paquete `@caribeng/ui`

Consulta la guía completa de consumo en [`packages/ui/README.md`](./packages/ui/README.md) y el estado detallado del proyecto en [`PROGRESO.md`](./PROGRESO.md).
