# CaribeNG (`@caribeng/ui`)

**Sistema de diseño y librería de componentes para Angular 22+** — standalone, reactiva con Signals, `ChangeDetectionStrategy.OnPush`, zoneless-ready, con **93 entry points** tree-shakeables, tokens CSS (`--cb-*`) y accesibilidad WCAG 2.2 AA.

---

## Instalación

```bash
npm install @caribeng/ui
# o con pnpm
pnpm add @caribeng/ui
```

---

## Configuración rápida

### 1. Proveedor global (`app.config.ts`)

```ts
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideCaribeNG } from '@caribeng/ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideCaribeNG({
      theme: 'system',     // 'light' | 'dark' | 'system'
      preset: 'emerald',   // 'emerald' | 'ocean' | 'coral' | 'amber' | 'violet' | 'rose'
      persistTheme: true,
    }),
  ],
};
```

### 2. Estilos y tokens CSS (`styles.css` o `angular.json`)

```css
@import '@caribeng/ui/styles.css';
```

### 3. Importación granular por componente (tree-shakeable)

```ts
import { Component, signal } from '@angular/core';
import { CbButtonComponent } from '@caribeng/ui/button';
import { CbInputComponent } from '@caribeng/ui/input';
import { CbPasswordComponent } from '@caribeng/ui/password';
import { CbChartComponent } from '@caribeng/ui/chart';

@Component({
  selector: 'app-demo',
  imports: [CbButtonComponent, CbInputComponent, CbPasswordComponent, CbChartComponent],
  template: `
    <cb-input [(value)]="email" placeholder="correo@dominio.com" />
    <cb-password [(value)]="secret" placeholder="Contraseña" />
    <cb-button variant="primary">Continuar</cb-button>
  `,
})
export class DemoComponent {
  readonly email = signal('');
  readonly secret = signal('');
}
```

---

## Tema claro/oscuro y Presets de color en vivo

```ts
import { Component, inject } from '@angular/core';
import { CbThemeService } from '@caribeng/ui';

export class HeaderComponent {
  readonly theme = inject(CbThemeService);

  alternarTema(): void {
    this.theme.toggle(); // 'light' <-> 'dark'
  }

  usarPresetOceano(): void {
    this.theme.setPreset('ocean'); // 'emerald' | 'ocean' | 'coral' | 'amber' | 'violet' | 'rose'
  }
}
```

---

## Sistema de Iconos (`@caribeng/ui/icon` y `@caribeng/ui/icons`)

Incluye **361 iconos núcleo** auto-registrados y un catálogo completo de **1891 iconos** derivados de Lucide (licencia ISC) bajo demanda:

```ts
import { provideCbIcons } from '@caribeng/ui/icon';
import { heartPulse, rocket } from '@caribeng/ui/icons';

// En providers:
provideCbIcons({ 'heart-pulse': heartPulse, rocket });
```

```html
<cb-icon name="heart-pulse" [size]="20" />
```

---

## Catálogo completo (93 Secondary Entry Points)

- **Form (29):** `autocomplete`, `button`, `cascadeselect`, `checkbox`, `chips`, `colorpicker`, `datepicker`, `editor`, `fileupload`, `floatlabel`, `iconfield`, `input`, `input-number`, `inputgroup`, `inputmask`, `inputotp`, `knob`, `listbox`, `multiselect`, `password`, `radio`, `rating`, `select`, `selectbutton`, `slider`, `textarea`, `toggle`, `togglebutton`, `treeselect`.
- **Data (10):** `dataview`, `orderlist`, `organizationchart`, `paginator`, `picklist`, `table`, `timeline`, `tree`, `treetable`, `virtualscroller`.
- **Overlay (7):** `confirmdialog`, `confirmpopup`, `dialog`, `drawer`, `dynamicdialog`, `popover`, `tooltip`.
- **Messages & Notification (6):** `badge`, `chip`, `inlinemessage`, `message`, `tag`, `toast`.
- **Navigation / Menu (11):** `breadcrumb`, `contextmenu`, `dock`, `megamenu`, `menu`, `menubar`, `panelmenu`, `speeddial`, `steps`, `tabmenu`, `tieredmenu`.
- **Panel / Layout (11):** `accordion`, `card`, `divider`, `fieldset`, `panel`, `scrollpanel`, `scrolltop`, `splitter`, `stepper`, `tabs`, `toolbar`.
- **Media (5):** `avatar`, `avatargroup`, `carousel`, `galleria`, `image`.
- **Misc & Directivas (14):** `animateonscroll`, `autofocus`, `blockui`, `chart`, `focustrap`, `icon`, `icons`, `inplace`, `metergroup`, `progressbar`, `ripple`, `skeleton`, `spinner`, `styleclass`, `terminal`.

---

## Licencia

MIT © CaribeNG Contributors. Iconos derivados de Lucide (ISC) — ver `THIRD-PARTY-NOTICES.md`.
