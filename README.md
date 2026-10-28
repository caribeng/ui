<div align="center">

# CaribeNG

**Accessible design system and component library for Angular 22+.**

[![npm](https://img.shields.io/npm/v/@caribeng/ui.svg?style=flat-square&color=10b981)](https://www.npmjs.com/package/@caribeng/ui)
[![Angular](https://img.shields.io/badge/angular-%5E22.0.0-dd0031.svg?style=flat-square)](https://angular.dev)
[![Entry points](https://img.shields.io/badge/entry%20points-173-10b981.svg?style=flat-square)](packages/ui/README.md#-catalog)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](#-license)
[![Docs](https://img.shields.io/badge/docs-caribeng.devmike.site-10b981.svg?style=flat-square)](https://caribeng.devmike.site)

[Getting started](packages/ui/README.md#-installation) · [Catalog](packages/ui/README.md#-catalog) · [Migrate from PrimeNG](packages/ui/README.md#migrating-from-primeng) · [Changelog](CHANGELOG.md) · [Documentation](https://caribeng.devmike.site)

</div>

---

## ✨ Features

- **225 standalone components and directives** (186 components + 39 directives), packaged in **173 entry points**: ship only what you import.
- **Modern Angular:** Signals (`input()`, `model()`, `output()`), `OnPush` and zoneless-ready.
- **Frictionless forms:** `ControlValueAccessor` on every control, compatible with Reactive Forms and template-driven forms.
- **Accessible:** ARIA, keyboard and focus management per WCAG 2.2 AA.
- **Themable:** `--cb-*` CSS tokens, light/dark mode and color presets that switch live.
- **English and Spanish** UI texts, switchable without reloading.
- **Caribe Design:** 30 Caribe-system components integrated into the main catalog (`@caribeng/ui/*`).
- **No UI-library dependencies:** only `@angular/cdk`.

## 🖥 Compatibility

CaribeNG's major version matches Angular's.

| CaribeNG | Angular | Status |
| --- | --- | --- |
| `22.x` | `^22.0.0` | Active: new features and fixes |
| `21.x` | `^21.0.0` | Maintenance: fixes only |

Browsers: the same ones [Angular supports](https://angular.dev/reference/versions#browser-support).

## 📦 Installation

```bash
ng add @caribeng/ui
```

Asks for the language, theme and primary color, registers `provideCaribeNG()` and adds the stylesheet to `angular.json`.

You can also install it with npm, yarn or pnpm and configure it manually following the [installation guide](packages/ui/README.md#manual-installation):

```bash
npm install @caribeng/ui
```

## 🔨 Usage

Import what you use, from its entry point:

```ts
import { Component } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';

@Component({
  selector: 'app-root',
  imports: [CbButton],
  template: `<cb-button (click)="save()">Save</cb-button>`,
})
export class App {
  save(): void {}
}
```

Provider, theme, language, forms and icons in detail: [`packages/ui/README.md`](packages/ui/README.md).

## 🔁 Migrate from PrimeNG

Install CaribeNG in the project and run the migrator:

```bash
npm install @caribeng/ui@22
ng generate @caribeng/ui:migrate-from-primeng
```

It swaps the imports, translates templates and `pi pi-*` icons, and replaces `providePrimeNG()` with `provideCaribeNG()`:

```html
<!-- Before -->
<p-button label="Save" icon="pi pi-check" [outlined]="true" (onClick)="save()" />

<!-- After -->
<cb-button variant="outlined" (click)="save()"><cb-icon name="check" />Save</cb-button>
```

What it cannot translate safely it marks with `TODO(caribeng)` and summarizes, with file and line, in `caribeng-migration-report.md`. PrimeNG stays installed while any reference remains, so you can migrate in parts. Today it translates the most used form controls (InputText, Textarea, InputNumber, Select, MultiSelect, Checkbox, ToggleSwitch and DatePicker), the menus (Menu, Menubar, TieredMenu, PanelMenu, Breadcrumb, TabMenu and SplitButton, with their `MenuItem`), Table (static columns), Tabs and Accordion, plus Button, Dialog, ConfirmDialog and ConfirmPopup (with `ConfirmationService`), Tag, Toast (with `MessageService`), Card and Tooltip; see the [migration guide](packages/ui/README.md#migrating-from-primeng) for the options and manual cases. Requires PrimeNG 18 or higher.

## 📁 Packages

| Package | What it is |
| --- | --- |
| [`@caribeng/ui`](packages/ui) | Components, directives, services, icons and schematics (`ng add` and `migrate-from-primeng`). The only package apps install. |
| [`packages/tokens`](packages/tokens) | `--cb-*` design tokens (color, spacing, typography, dark mode). Published inside `@caribeng/ui/styles.css`. |
| [`apps/showcase`](apps/showcase) | Documentation site with live examples, accessibility and API of every component. |

## ☀️ License

[MIT](packages/ui/README.md#-license) © CaribeNG Contributors. Icons derived from [Lucide](https://lucide.dev) (ISC); see [`THIRD-PARTY-NOTICES.md`](packages/ui/THIRD-PARTY-NOTICES.md).
