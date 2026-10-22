<div align="center">

# CaribeNG

**Sistema de diseño y librería de componentes accesibles para Angular 22+.**

[![npm](https://img.shields.io/npm/v/@caribeng/ui.svg?style=flat-square&color=10b981)](https://www.npmjs.com/package/@caribeng/ui)
[![Angular](https://img.shields.io/badge/angular-%5E22.0.0-dd0031.svg?style=flat-square)](https://angular.dev)
[![Entry points](https://img.shields.io/badge/entry%20points-152-10b981.svg?style=flat-square)](packages/ui/README.md#-catálogo)
[![Licencia MIT](https://img.shields.io/badge/licencia-MIT-blue.svg?style=flat-square)](#️-licencia)

[Primeros pasos](packages/ui/README.md#-instalación) · [Catálogo](packages/ui/README.md#-catálogo) · [Migrar desde PrimeNG](packages/ui/README.md#migrar-desde-primeng) · [Changelog](CHANGELOG.md)

</div>

---

## ✨ Características

- **152 componentes y directivas** standalone, cada uno en su propio entry point: solo empaquetas lo que importas.
- **Angular moderno:** Signals (`input()`, `model()`, `output()`), `OnPush` y compatible con apps zoneless.
- **Formularios sin fricción:** `ControlValueAccessor` en todos los controles, compatibles con Reactive Forms y formularios por plantilla.
- **Accesibles:** ARIA, teclado y gestión de foco según WCAG 2.2 AA.
- **Tematizables:** tokens CSS `--cb-*`, modo claro/oscuro y presets de color que se cambian en caliente.
- **Español e inglés** en los textos de interfaz, con cambio de idioma sin recargar.
- **Caribe Design:** 45 componentes del sistema Caribe (`@caribeng/ui/caribe/*`).
- **Sin dependencias de otras librerías de componentes:** solo `@angular/cdk`.

## 🖥 Compatibilidad

El major de CaribeNG coincide con el de Angular.

| CaribeNG | Angular | Estado |
| --- | --- | --- |
| `22.x` | `^22.0.0` | Activa: nuevas funciones y correcciones |
| `21.x` | `^21.0.0` | Mantenimiento: solo correcciones |

Navegadores: los mismos que [soporta Angular](https://angular.dev/reference/versions#browser-support).

## 📦 Instalación

```bash
ng add @caribeng/ui
```

Pregunta el idioma, el tema y el color primario, registra `provideCaribeNG()` y añade la hoja de estilos a `angular.json`.

También puedes instalarla con npm, yarn o pnpm y configurarla a mano siguiendo la [guía de instalación](packages/ui/README.md#instalación-manual):

```bash
npm install @caribeng/ui
```

## 🔨 Uso

Importa en tu componente lo que vayas a usar, desde su entry point:

```ts
import { Component } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';

@Component({
  selector: 'app-root',
  imports: [CbButton],
  template: `<cb-button (click)="guardar()">Guardar</cb-button>`,
})
export class App {
  guardar(): void {}
}
```

Proveedor, tema, idioma, formularios e iconos en detalle: [`packages/ui/README.md`](packages/ui/README.md).

## 🔁 Migrar desde PrimeNG

Instala CaribeNG en el proyecto y ejecuta el migrador:

```bash
npm install @caribeng/ui@22
ng generate @caribeng/ui:migrate-from-primeng
```

Cambia los imports, traduce las plantillas y los iconos `pi pi-*`, y sustituye `providePrimeNG()` por `provideCaribeNG()`:

```html
<!-- Antes -->
<p-button label="Guardar" icon="pi pi-check" [outlined]="true" (onClick)="guardar()" />

<!-- Después -->
<cb-button variant="outlined" (click)="guardar()"><cb-icon name="check" />Guardar</cb-button>
```

Lo que no puede traducir con seguridad lo marca con `TODO(caribeng)` y lo resume, con archivo y línea, en `caribeng-migration-report.md`. PrimeNG se queda instalado mientras quede alguna referencia, así que puedes migrar por partes. Hoy traduce los controles de formulario más usados (InputText, Textarea, InputNumber, Select, MultiSelect, Checkbox, ToggleSwitch y DatePicker), los menús (Menu, Menubar, TieredMenu, PanelMenu, Breadcrumb, TabMenu y SplitButton, con sus `MenuItem`), Tabs y Accordion, además de Button, Dialog, ConfirmDialog y ConfirmPopup (con `ConfirmationService`), Tag, Toast (con `MessageService`), Card y Tooltip; consulta la [guía de migración](packages/ui/README.md#migrar-desde-primeng) para las opciones y los casos manuales. Requiere PrimeNG 18 o superior.

## 📁 Paquetes

| Paquete | Qué es |
| --- | --- |
| [`@caribeng/ui`](packages/ui) | Componentes, directivas, servicios, iconos y schematics (`ng add` y `migrate-from-primeng`). Es el único paquete que instalan las aplicaciones. |
| [`packages/tokens`](packages/tokens) | Tokens de diseño `--cb-*` (color, espaciado, tipografía, modo oscuro). Se publican dentro de `@caribeng/ui/styles.css`. |
| [`apps/showcase`](apps/showcase) | Sitio de documentación con ejemplos en vivo, accesibilidad y API de cada componente. |

## ☀️ Licencia

[MIT](packages/ui/README.md#️-licencia) © CaribeNG Contributors. Iconos derivados de [Lucide](https://lucide.dev) (ISC); ver [`THIRD-PARTY-NOTICES.md`](packages/ui/THIRD-PARTY-NOTICES.md).
