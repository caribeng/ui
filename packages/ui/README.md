<h1 align="center">CaribeNG</h1>

<p align="center">
  <strong>Design system and component library for Angular.</strong><br />
  Standalone, Signals, OnPush, CSS tokens and WCAG 2.2 AA accessibility.
</p>

<p align="center">
  <img alt="Angular 22" src="https://img.shields.io/badge/Angular-22-dd0031.svg?style=flat-square" />
  <img alt="Entry points" src="https://img.shields.io/badge/entry%20points-173-10b981.svg?style=flat-square" />
  <img alt="MIT license" src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" />
</p>

<p align="center">📖 Documentation: <a href="https://caribeng.devmike.site">caribeng.devmike.site</a></p>

---

## ✨ Features

- **225 standalone components and directives** (186 components + 39 directives), packaged in **173 entry points** (`@caribeng/ui/button`, `@caribeng/ui/table`…): ship only what you import.
- **Modern Angular:** `input()` / `model()` / `output()` with Signals, `ChangeDetectionStrategy.OnPush` and zoneless-ready.
- **Frictionless forms:** `ControlValueAccessor` on every control; the error and required indicator sync automatically with Angular Forms.
- **Accessible:** ARIA roles and attributes, keyboard support and focus management (WCAG 2.2 AA).
- **Themable:** `--cb-*` CSS tokens, light/dark mode and color presets that switch live.
- **Icons included:** 363 core icons ready to use and an optional catalog of 1891 icons.
- **PrimeNG migration:** a schematic translates imports, templates and icons and leaves a report of what remains ([see more](#migrating-from-primeng)).

## 🖥 Compatibility

CaribeNG's major version matches Angular's, just like Angular Material, PrimeNG and NG-ZORRO. Install the version that corresponds to your project:

| CaribeNG | Angular | Status |
| --- | --- | --- |
| `22.x` | `^22.0.0` | Active: new features and fixes |
| `21.x` | `^21.0.0` | Maintenance: fixes only |

Browsers: the same ones [Angular supports](https://angular.dev/reference/versions#browser-support).

## 📦 Installation

### Requirements

- An **Angular 22** project with `@angular/forms` (any project created with `ng new` includes it).
- `@angular/cdk` is installed automatically as a dependency (overlays and accessibility).
- npm, yarn or pnpm.

### Quick install (recommended)

```bash
ng add @caribeng/ui
```

It asks for the language, theme and primary color, and leaves the project ready:

- installs `@caribeng/ui` (and `@angular/cdk`),
- registers `provideCaribeNG({ locale, theme, preset })` in `app.config.ts` (or in `AppModule`),
- adds `@caribeng/ui/styles.css` to the `angular.json` styles.

You can run it without prompts: `ng add @caribeng/ui --locale=en --theme=system --preset=ocean --skip-confirmation`. Re-running it duplicates nothing.

Then jump to [3. Verify the installation](#3-verify-the-installation).

### Manual installation

```bash
# npm
npm install @caribeng/ui

# yarn
yarn add @caribeng/ui

# pnpm
pnpm add @caribeng/ui
```

### Migrating from PrimeNG

In a project with PrimeNG 18 or higher, install CaribeNG and run the migrator:

```bash
npm install @caribeng/ui@22
ng generate @caribeng/ui:migrate-from-primeng
```

> Commit (or copy) before running it so you can review the changes with `git diff`. With `--dry-run` you can see which files it would change without writing anything. Running `ng add @caribeng/ui` in a project that has PrimeNG reminds you of this command.

```html
<!-- Before -->
<p-button label="Save" icon="pi pi-check" [outlined]="true" (onClick)="save()" />
<input pInputText id="email" [(ngModel)]="email" />
<p-dialog header="Edit" [(visible)]="open" [modal]="true" [style]="{ width: '25rem' }">…</p-dialog>

<!-- After -->
<cb-button variant="outlined" (click)="save()"><cb-icon name="check" />Save</cb-button>
<cb-input inputId="email" [(ngModel)]="email" />
<cb-dialog header="Edit" [(visible)]="open" width="25rem">…</cb-dialog>
```

What it does:

- swaps PrimeNG imports for CaribeNG ones (`ButtonModule` → `CbButton`, `providePrimeNG()` → `provideCaribeNG()`) and adds to each component the ones its template uses,
- translates templates with their inputs and events (`[outlined]` → `variant`, `size="small"` → `size="sm"`, `(onClick)` → `(click)`, `subheader` → `subtitle`…), including the Dialog and Card footer (`#footer` → `<div cb-dialog-footer>` / `<div cb-card-footer>`),
- replaces `MessageService` with `CbToastService`: translates messages (`severity: 'error'` → `'danger'`, `'warn'` → `'warning'`, `sticky: true` → `life: 0`) and removes it from `providers`, because `CbToastService` is a singleton for the whole app,
- converts `pi pi-*` icons into `<cb-icon>` and registers with `provideCbIcons` the ones that are not in the core set,
- removes PrimeIcons from `angular.json` and stylesheets, and adds `@caribeng/ui/styles.css`,
- removes `primeng`, `primeicons` and `@primeuix/*` from `package.json` **only when no reference remains**; until then both libraries coexist.

What it cannot translate safely (an input without an equivalent, a custom `#header` template, a `pButton` on a link…) is marked with a comment next to the code, keeping the original attribute:

```html
<!-- TODO(caribeng): [rounded]="true" — cb-button has no rounded variant; use your own class or <cb-icon-button>. -->
<cb-button severity="danger">Delete</cb-button>
```

All warnings, remaining PrimeNG references (for example components the migrator does not translate yet) and imports that must be added by hand are summarized in `caribeng-migration-report.md`, with file and line.

**Components it translates today:**

| PrimeNG | CaribeNG |
|---|---|
| `<p-button>`, `<button pButton>` | `<cb-button>` |
| `<input pInputText>` | `<cb-input>` |
| `<textarea pTextarea>`, `<textarea pInputTextarea>` | `<cb-textarea>` |
| `<p-inputnumber>` | `<cb-input-number>` |
| `<p-select>`, `<p-dropdown>` | `<cb-select>` |
| `<p-multiselect>` | `<cb-multiselect>` |
| `<p-toggleswitch>`, `<p-inputSwitch>` | `<cb-toggle>` |
| `<p-datepicker>`, `<p-calendar>` | `<cb-datepicker>` |
| `<p-dialog>` | `<cb-dialog>` |
| `<p-confirmdialog>` + `ConfirmationService` | `<cb-confirm-dialog service>` + `CbConfirmationService` |
| `<p-confirmpopup>` | `<cb-confirm-popup service>` |
| `<p-menu>`, `<p-menubar>`, `<p-tieredmenu>`, `<p-panelmenu>`, `<p-breadcrumb>`, `<p-tabmenu>` | `<cb-menu>`, `<cb-menubar>`, `<cb-tieredmenu>`, `<cb-panelmenu>`, `<cb-breadcrumb>`, `<cb-tabmenu>` |
| `MenuItem[]` (`icon`, `command`, `routerLink`…) | the item type of the menu that receives it (`CbMenubarItem[]`…) |
| `<p-splitbutton>` | `<cb-split-button>` |
| `<p-table>` (columns written in `#header`/`#body` or dynamic with `@for`) | `<cb-table [columns]>` + a `cbTableCell` per custom cell |
| `<p-tabs>` (and `<p-tabView>`) | `<cb-tabs>` + `<cb-tab label="…">` |
| `<p-accordion>` (and `<p-accordionTab>`) | `<cb-accordion>` + `<cb-accordion-panel header="…">` |
| `<p-tag>` | `<cb-tag>` |
| `<p-toast>` + `MessageService` | `<cb-toast>` + `CbToastService` |
| `<p-card>` | `<cb-card>` |
| `pTooltip` (on any element) | `cbTooltip` |
| `<p-checkbox>` | `<cb-checkbox>` |
| `<i class="pi pi-*">` | `<cb-icon>` |

In menus, `MenuItem` arrays change type according to the menu that receives them in the template; `icon: 'pi pi-plus'` becomes `'plus'`, `command` and `visible` are kept, and `routerLink: '/x'` becomes `url` (`routerLink` with parameters is flagged). In tables, each `<th>`/`<td>` becomes a column of `[columns]` (`pSortableColumn` → `sortable`, `<p-columnFilter>` → `filter`, `pFrozenColumn` → `frozen`); cells that are not just `{{ row.field }}` become a `<ng-template cbTableCell>` with their migrated content, and checkbox and expand columns disappear because `cb-table` adds them itself. With dynamic columns (`[columns]="cols"` + `@for`), `cols` is passed directly to `[columns]`: the migrator adds `sortable: true` / `filter: true` if the header applied them to all, and the `@if (col.field === '…')` or `@switch (col.field)` branches of the body become a `cbTableCell` per field. Tables with generic-logic cells, several rows per record or templates without an equivalent are flagged and keep `TableModule`, so they keep compiling. PrimeNG 18+ tabs and accordions are restructured (the header becomes `label`/`header`); if they are generated with `@for` or the header has icons, they are flagged.

Radios (`<p-radiobutton>`) and context menus (`<p-contextmenu>`) are flagged but not converted, because the page structure changes: in CaribeNG the radio model lives in a `<cb-radio-group>` that wraps the options, and `<cb-contextmenu>` wraps the area it opens on instead of pointing to it with `[target]`. The remaining components appear in the report to migrate by hand; they will be added in future versions.

| Option | Use |
|---|---|
| `--path=src/app/sales` | Migrate only one folder (partial migration). |
| `--remove-primeng=false` | Do not touch `package.json` dependencies. |
| `--report=false` | Do not write the report. |
| `--skip-install` | Do not install dependencies when finished. |
| `--force` | Migrate even if `@caribeng/ui` is missing or the PrimeNG version is older than 18. |

## 🔨 Usage

> With `ng add @caribeng/ui`, steps 1 and 2 are already done.

### 1. Provider

Add `provideCaribeNG()` to your `app.config.ts` providers. All options are optional:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideCaribeNG } from '@caribeng/ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCaribeNG({
      theme: 'system',            // 'light' (default) | 'dark' | 'system'
      preset: 'emerald',          // 'emerald' | 'ocean' | 'coral' | 'amber' | 'violet' | 'rose'
      persistTheme: true,         // remembers the user's choice
      requiredIndicator: 'none',  // 'asterisk' | 'text' | 'optional' | 'none'
    }),
  ],
};
```

### 2. Styles

Add the stylesheet (`--cb-*` tokens, theme and utilities) in `angular.json`:

```diff
  "styles": [
+   "node_modules/@caribeng/ui/styles/caribeng.css",
    "src/styles.css"
  ]
```

or import it from your global stylesheet:

```css
/* src/styles.css */
@import '@caribeng/ui/styles.css';
```

### 3. Verify the installation

Import the components you use from their entry point. Each component's import path appears on its documentation page.

```ts
import { Component, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbInput } from '@caribeng/ui/input';

@Component({
  selector: 'app-root',
  imports: [CbButton, CbInput],
  template: `
    <cb-input label="Email" type="email" [(value)]="email" />
    <cb-button (click)="send()">Continue</cb-button>
  `,
})
export class App {
  readonly email = signal('');

  send(): void {
    console.log(this.email());
  }
}
```

If you see the field and the button styled, CaribeNG is ready.

### Forms

Every control works with Reactive Forms and template-driven forms. The error shows only when the control is invalid and the user touched it; the message is optional:

```html
<cb-input label="Email" formControlName="email" error="Enter a valid email" />
```

## 🌐 Language (i18n)

The components' UI texts (accessible labels, buttons, placeholders and messages) come in **English** (default) and **Spanish**:

```ts
provideCaribeNG({
  locale: 'en',                                   // 'es' | 'en' | your own CbTranslation object
  translation: { noResults: 'Nothing here yet' }, // overrides individual texts
});
```

Switch at runtime, without reloading:

```ts
import { inject } from '@angular/core';
import { CbLocaleService } from '@caribeng/ui';

inject(CbLocaleService).use('en');
```

A text passed as an input (for example `placeholder` or `emptyMessage`) always takes priority over the language.

## 🎨 Light/dark theme and presets

```ts
import { inject } from '@angular/core';
import { CbThemeService } from '@caribeng/ui';

export class Header {
  private readonly theme = inject(CbThemeService);

  toggleTheme(): void {
    this.theme.toggle(); // 'light' <-> 'dark'
  }

  useOcean(): void {
    this.theme.setPreset('ocean');
  }
}
```

## 🔣 Icons

The 363 core icons register themselves:

```html
<cb-icon name="house" [size]="20" />
```

To use others from the full catalog (1891 icons derived from Lucide), register them in the providers; only the ones you import are bundled:

```ts
import { provideCbIcons } from '@caribeng/ui/icon';
import { heartPulse, rocket } from '@caribeng/ui/icons';

providers: [provideCbIcons({ 'heart-pulse': heartPulse, rocket })];
```

## 📚 Catalog

- **Form:** `autocomplete`, `button`, `button-group`, `cascadeselect`, `checkbox`, `chips`, `colorpicker`, `datepicker`, `editor`, `fab-menu`, `fileupload`, `floatlabel`, `icon-button`, `iconfield`, `input`, `input-number`, `input-search`, `input-token`, `inputgroup`, `inputmask`, `inputotp`, `keyfilter`, `knob`, `listbox`, `mentions`, `multiselect`, `password`, `phone-input`, `radio`, `rating`, `repeater`, `select`, `selectbutton`, `slider`, `tag-button`, `textarea`, `toggle`, `togglebutton`, `treeselect`.
- **Data:** `dataview`, `descriptions`, `kanban`, `orderlist`, `organizationchart`, `paginator`, `picklist`, `statistic`, `table`, `timeline`, `tracker`, `tree`, `treetable`, `virtualscroller`.
- **Overlay:** `coachmark`, `command-palette`, `confirmdialog`, `confirmpopup`, `dialog`, `drawer`, `dynamicdialog`, `off-canvas`, `onboarding`, `popover`, `tooltip`.
- **Messages:** `alert`, `badge`, `chat`, `chip`, `empty`, `inlinemessage`, `message`, `result`, `tag`, `toast`.
- **Menu:** `anchor`, `breadcrumb`, `contextmenu`, `dock`, `float-menu`, `megamenu`, `menu`, `menubar`, `panelmenu`, `sidebar`, `speeddial`, `splitbutton`, `steps`, `tabmenu`, `tieredmenu`.
- **Panel:** `accordion`, `card`, `card-content`, `card-move`, `card-primary`, `card-select`, `divider`, `expansion-panel`, `fieldset`, `footer`, `header`, `panel`, `scrollpanel`, `scrolltop`, `splitter`, `stepper`, `tabs`, `toolbar`.
- **Media:** `animation-lottie`, `avatar`, `avatargroup`, `carousel`, `galleria`, `illustration`, `image`, `logo`, `pdfviewer`, `qrcode`.
- **Files and pricing:** `file-card`, `file-download`, `folder-card`, `pricing`.
- **Misc and directives:** `animateonscroll`, `autofocus`, `blockui`, `chart`, `code-block`, `copy-button`, `dots-indicator`, `focustrap`, `icon`, `icons`, `inplace`, `kbd`, `link`, `metergroup`, `progressbar`, `ripple`, `shortcut`, `skeleton`, `spinner`, `status`, `step-indicator`, `styleclass`, `terminal`, `themetoggle`.

## 🧭 Next steps

- Explore every component, with HTML and TypeScript examples, on the documentation site (showcase).
- Customize colors and tokens in the Theming guide.
- Check each version's news on the Changelog page of the documentation site.

## ☀️ License

MIT © CaribeNG Contributors. Icons derived from Lucide (ISC); see `THIRD-PARTY-NOTICES.md`.
