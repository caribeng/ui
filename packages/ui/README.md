<h1 align="center">CaribeNG</h1>

<p align="center">
  <strong>Sistema de diseño y librería de componentes para Angular.</strong><br />
  Standalone, Signals, OnPush, tokens CSS y accesibilidad WCAG 2.2 AA.
</p>

<p align="center">
  <img alt="Angular 22" src="https://img.shields.io/badge/Angular-22-dd0031.svg?style=flat-square" />
  <img alt="Entry points" src="https://img.shields.io/badge/entry%20points-142-10b981.svg?style=flat-square" />
  <img alt="Licencia MIT" src="https://img.shields.io/badge/licencia-MIT-blue.svg?style=flat-square" />
</p>

---

## ✨ Características

- **151 componentes y directivas** standalone, cada uno en su propio entry point (`@caribeng/ui/button`, `@caribeng/ui/table`…): solo empaquetas lo que importas.
- **Angular moderno:** `input()` / `model()` / `output()` con Signals, `ChangeDetectionStrategy.OnPush` y compatible con apps zoneless.
- **Formularios sin fricción:** `ControlValueAccessor` en todos los controles; el error y el indicador de obligatorio se sincronizan solos con Angular Forms.
- **Accesibles:** roles y atributos ARIA, soporte de teclado y gestión de foco (WCAG 2.2 AA).
- **Tematizables:** tokens CSS `--cb-*`, modo claro/oscuro y presets de color que se cambian en caliente.
- **Caribe Design:** 45 componentes adicionales del sistema Caribe (`@caribeng/ui/caribe/*`).
- **Iconos incluidos:** 361 iconos núcleo listos para usar y un catálogo opcional de 1891 iconos.

## 🖥 Compatibilidad

El major de CaribeNG coincide con el de Angular, igual que Angular Material, PrimeNG y NG-ZORRO. Instala la versión que corresponde a tu proyecto:

| CaribeNG | Angular | Estado |
| --- | --- | --- |
| `22.x` | `^22.0.0` | Activa: nuevas funciones y correcciones |
| `21.x` | `^21.0.0` | Mantenimiento: solo correcciones |

Navegadores: los mismos que [soporta Angular](https://angular.dev/reference/versions#browser-support).

## 📦 Instalación

### Requisitos

- Un proyecto **Angular 22** con `@angular/forms` (lo incluye cualquier proyecto creado con `ng new`).
- `@angular/cdk` se instala automáticamente como dependencia (overlays y accesibilidad).
- npm, yarn o pnpm.

### Instalación rápida (recomendada)

```bash
ng add @caribeng/ui
```

Pregunta el idioma, el tema y el color primario, y deja el proyecto listo:

- instala `@caribeng/ui` (y `@angular/cdk`),
- registra `provideCaribeNG({ locale, theme, preset })` en `app.config.ts` (o en `AppModule`),
- añade `@caribeng/ui/styles.css` a los estilos de `angular.json`.

Se puede ejecutar sin preguntas: `ng add @caribeng/ui --locale=en --theme=system --preset=ocean --skip-confirmation`. Volver a ejecutarlo no duplica nada.

Después, salta al paso [3. Verifica la instalación](#3-verifica-la-instalación).

### Instalación manual

```bash
# npm
npm install @caribeng/ui

# yarn
yarn add @caribeng/ui

# pnpm
pnpm add @caribeng/ui
```

## 🔨 Uso

> Con `ng add @caribeng/ui` los pasos 1 y 2 ya están hechos.

### 1. Proveedor

Añade `provideCaribeNG()` a los providers de tu `app.config.ts`. Todas las opciones son opcionales:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideCaribeNG } from '@caribeng/ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCaribeNG({
      theme: 'system',            // 'light' (por defecto) | 'dark' | 'system'
      preset: 'emerald',          // 'emerald' | 'ocean' | 'coral' | 'amber' | 'violet' | 'rose'
      persistTheme: true,         // recuerda la elección del usuario
      requiredIndicator: 'none',  // 'asterisk' | 'text' | 'optional' | 'none'
    }),
  ],
};
```

### 2. Estilos

Agrega la hoja de estilos (tokens `--cb-*`, tema y utilidades) en `angular.json`:

```diff
  "styles": [
+   "node_modules/@caribeng/ui/styles/caribeng.css",
    "src/styles.css"
  ]
```

o impórtala desde tu hoja global:

```css
/* src/styles.css */
@import '@caribeng/ui/styles.css';
```

### 3. Verifica la instalación

Importa los componentes que vayas a usar desde su entry point. La ruta de importación de cada uno aparece en su página de documentación.

```ts
import { Component, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbInput } from '@caribeng/ui/input';

@Component({
  selector: 'app-root',
  imports: [CbButton, CbInput],
  template: `
    <cb-input label="Correo" type="email" [(value)]="email" />
    <cb-button (click)="enviar()">Continuar</cb-button>
  `,
})
export class App {
  readonly email = signal('');

  enviar(): void {
    console.log(this.email());
  }
}
```

Si ves el campo y el botón con estilo, CaribeNG está listo.

### Formularios

Todos los controles funcionan con Reactive Forms y con formularios por plantilla. El error se muestra solo cuando el control es inválido y el usuario lo tocó; el mensaje es opcional:

```html
<cb-input label="Correo" formControlName="email" error="Ingresa un correo válido" />
```

## 🌐 Idioma (i18n)

Los textos de interfaz de los componentes (etiquetas accesibles, botones, placeholders y mensajes) vienen en **español** (por defecto) e **inglés**:

```ts
provideCaribeNG({
  locale: 'en',                                   // 'es' | 'en' | objeto CbTranslation propio
  translation: { noResults: 'Nothing here yet' }, // sobrescribe textos sueltos
});
```

Cambio en caliente, sin recargar:

```ts
import { inject } from '@angular/core';
import { CbLocaleService } from '@caribeng/ui';

inject(CbLocaleService).use('en');
```

Un texto pasado por input (por ejemplo `placeholder` o `emptyMessage`) siempre tiene prioridad sobre el idioma.

## 🎨 Tema claro/oscuro y presets

```ts
import { inject } from '@angular/core';
import { CbThemeService } from '@caribeng/ui';

export class Header {
  private readonly theme = inject(CbThemeService);

  alternarTema(): void {
    this.theme.toggle(); // 'light' <-> 'dark'
  }

  usarOceano(): void {
    this.theme.setPreset('ocean');
  }
}
```

## 🔣 Iconos

Los 361 iconos núcleo se registran solos:

```html
<cb-icon name="house" [size]="20" />
```

Para usar otros del catálogo completo (1891 iconos derivados de Lucide), regístralos en los providers; solo se empaquetan los que importas:

```ts
import { provideCbIcons } from '@caribeng/ui/icon';
import { heartPulse, rocket } from '@caribeng/ui/icons';

providers: [provideCbIcons({ 'heart-pulse': heartPulse, rocket })];
```

## 📚 Catálogo

- **Form:** `autocomplete`, `button`, `cascadeselect`, `checkbox`, `chips`, `colorpicker`, `datepicker`, `editor`, `fileupload`, `floatlabel`, `iconfield`, `input`, `input-number`, `inputgroup`, `inputmask`, `inputotp`, `keyfilter`, `knob`, `listbox`, `multiselect`, `password`, `radio`, `rating`, `repeater`, `select`, `selectbutton`, `slider`, `textarea`, `toggle`, `togglebutton`, `treeselect`.
- **Data:** `dataview`, `descriptions`, `orderlist`, `organizationchart`, `paginator`, `picklist`, `statistic`, `table`, `timeline`, `tree`, `treetable`, `virtualscroller`.
- **Overlay:** `confirmdialog`, `confirmpopup`, `dialog`, `drawer`, `dynamicdialog`, `popover`, `tooltip`.
- **Messages:** `badge`, `chip`, `empty`, `inlinemessage`, `message`, `result`, `tag`, `toast`.
- **Menu:** `anchor`, `breadcrumb`, `contextmenu`, `dock`, `megamenu`, `menu`, `menubar`, `panelmenu`, `speeddial`, `splitbutton`, `steps`, `tabmenu`, `tieredmenu`.
- **Panel:** `accordion`, `card`, `divider`, `fieldset`, `panel`, `scrollpanel`, `scrolltop`, `splitter`, `stepper`, `tabs`, `toolbar`.
- **Media:** `avatar`, `avatargroup`, `carousel`, `galleria`, `image`.
- **Archivos y precios:** `file-card`, `folder-card`, `pricing`.
- **Misc y directivas:** `animateonscroll`, `autofocus`, `blockui`, `chart`, `focustrap`, `icon`, `icons`, `inplace`, `metergroup`, `progressbar`, `ripple`, `skeleton`, `spinner`, `styleclass`, `terminal`, `themetoggle`.
- **Caribe Design (`@caribeng/ui/caribe/*`):** `alert`, `animation-lottie`, `button-group`, `calendar`, `card-content`, `card-move`, `card-primary`, `card-select`, `circle-loading`, `coachmark`, `data-table`, `dots-indicator`, `expansion-panel`, `fab-menu`, `file-download`, `file-select`, `float-menu`, `footer`, `header`, `icon-button`, `illustration`, `inline-alert`, `input-date`, `input-search`, `input-select`, `input-token`, `link`, `loader`, `logo`, `modal`, `off-canvas`, `onboarding`, `pictogram`, `pop-over`, `preloader`, `progress-bar`, `shortcut`, `status`, `step-indicator`, `stroke`, `switch`, `tag-button`, `tracker`, `transaction-status`, `voucher`.

## 🧭 Próximos pasos

- Explora cada componente, con ejemplos en HTML y TypeScript, en el sitio de documentación (showcase).
- Personaliza colores y tokens en la guía de Theming.
- Consulta las novedades de cada versión en la página Changelog del sitio de documentación.

## ☀️ Licencia

MIT © CaribeNG Contributors. Iconos derivados de Lucide (ISC); ver `THIRD-PARTY-NOTICES.md`.
