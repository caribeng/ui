<h1 align="center">CaribeNG</h1>

<p align="center">
  <strong>Sistema de diseño y librería de componentes para Angular.</strong><br />
  Standalone, Signals, OnPush, tokens CSS y accesibilidad WCAG 2.2 AA.
</p>

<p align="center">
  <img alt="Angular 22" src="https://img.shields.io/badge/Angular-22-dd0031.svg?style=flat-square" />
  <img alt="Entry points" src="https://img.shields.io/badge/entry%20points-173-10b981.svg?style=flat-square" />
  <img alt="Licencia MIT" src="https://img.shields.io/badge/licencia-MIT-blue.svg?style=flat-square" />
</p>

---

## ✨ Características

- **225 componentes y directivas** standalone (186 componentes + 39 directivas), empaquetados en **173 entry points** (`@caribeng/ui/button`, `@caribeng/ui/table`…): solo empaquetas lo que importas.
- **Angular moderno:** `input()` / `model()` / `output()` con Signals, `ChangeDetectionStrategy.OnPush` y compatible con apps zoneless.
- **Formularios sin fricción:** `ControlValueAccessor` en todos los controles; el error y el indicador de obligatorio se sincronizan solos con Angular Forms.
- **Accesibles:** roles y atributos ARIA, soporte de teclado y gestión de foco (WCAG 2.2 AA).
- **Tematizables:** tokens CSS `--cb-*`, modo claro/oscuro y presets de color que se cambian en caliente.
- **Iconos incluidos:** 363 iconos núcleo listos para usar y un catálogo opcional de 1891 iconos.
- **Migración desde PrimeNG:** un schematic traduce imports, plantillas e iconos y deja un informe con lo pendiente ([ver más](#migrar-desde-primeng)).

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

### Migrar desde PrimeNG

En un proyecto con PrimeNG 18 o superior, instala CaribeNG y ejecuta el migrador:

```bash
npm install @caribeng/ui@22
ng generate @caribeng/ui:migrate-from-primeng
```

> Haz commit (o una copia) antes de ejecutarlo para poder revisar los cambios con `git diff`. Con `--dry-run` ves qué archivos cambiaría sin escribir nada. Si ejecutas `ng add @caribeng/ui` en un proyecto con PrimeNG, te recordará este comando.

```html
<!-- Antes -->
<p-button label="Guardar" icon="pi pi-check" [outlined]="true" (onClick)="guardar()" />
<input pInputText id="email" [(ngModel)]="email" />
<p-dialog header="Editar" [(visible)]="abierto" [modal]="true" [style]="{ width: '25rem' }">…</p-dialog>

<!-- Después -->
<cb-button variant="outlined" (click)="guardar()"><cb-icon name="check" />Guardar</cb-button>
<cb-input inputId="email" [(ngModel)]="email" />
<cb-dialog header="Editar" [(visible)]="abierto" width="25rem">…</cb-dialog>
```

Qué hace:

- cambia los imports de PrimeNG por los de CaribeNG (`ButtonModule` → `CbButton`, `providePrimeNG()` → `provideCaribeNG()`) y añade a cada componente los que usa su plantilla,
- traduce las plantillas con sus inputs y eventos (`[outlined]` → `variant`, `size="small"` → `size="sm"`, `(onClick)` → `(click)`, `subheader` → `subtitle`…), incluido el pie de Dialog y Card (`#footer` → `<div cb-dialog-footer>` / `<div cb-card-footer>`),
- cambia `MessageService` por `CbToastService`: traduce los mensajes (`severity: 'error'` → `'danger'`, `'warn'` → `'warning'`, `sticky: true` → `life: 0`) y lo quita de los `providers`, porque `CbToastService` es único para toda la app,
- convierte los iconos `pi pi-*` en `<cb-icon>` y registra con `provideCbIcons` los que no están en el set núcleo,
- quita PrimeIcons de `angular.json` y de las hojas de estilo, y añade `@caribeng/ui/styles.css`,
- quita `primeng`, `primeicons` y `@primeuix/*` de `package.json` **solo cuando ya no queda ninguna referencia**; mientras tanto las dos librerías conviven.

Lo que no puede traducir con seguridad (un input sin equivalente, una plantilla `#header` personalizada, un `pButton` sobre un enlace…) lo marca con un comentario junto al código, conservando el atributo original:

```html
<!-- TODO(caribeng): [rounded]="true" — cb-button no tiene variante redondeada; usa una clase propia o <cb-icon-button>. -->
<cb-button severity="danger">Borrar</cb-button>
```

Todos los avisos, las referencias a PrimeNG que aún quedan (por ejemplo componentes que el migrador no traduce todavía) y los imports que haya que añadir a mano se resumen en `caribeng-migration-report.md`, con archivo y línea.

**Componentes que traduce hoy:**

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
| `MenuItem[]` (`icon`, `command`, `routerLink`…) | el tipo de item del menú que lo recibe (`CbMenubarItem[]`…) |
| `<p-splitbutton>` | `<cb-split-button>` |
| `<p-table>` (columnas escritas en `#header`/`#body` o dinámicas con `@for`) | `<cb-table [columns]>` + un `cbTableCell` por celda personalizada |
| `<p-tabs>` (y `<p-tabView>`) | `<cb-tabs>` + `<cb-tab label="…">` |
| `<p-accordion>` (y `<p-accordionTab>`) | `<cb-accordion>` + `<cb-accordion-panel header="…">` |
| `<p-tag>` | `<cb-tag>` |
| `<p-toast>` + `MessageService` | `<cb-toast>` + `CbToastService` |
| `<p-card>` | `<cb-card>` |
| `pTooltip` (en cualquier elemento) | `cbTooltip` |
| `<p-checkbox>` | `<cb-checkbox>` |
| `<i class="pi pi-*">` | `<cb-icon>` |

En los menús, los arrays de `MenuItem` cambian de tipo según el menú que los recibe en la plantilla; `icon: 'pi pi-plus'` pasa a `'plus'`, `command` y `visible` se conservan, y `routerLink: '/x'` pasa a `url` (los `routerLink` con parámetros quedan con aviso). En las tablas, cada `<th>`/`<td>` pasa a una columna de `[columns]` (`pSortableColumn` → `sortable`, `<p-columnFilter>` → `filter`, `pFrozenColumn` → `frozen`); las celdas que no son solo `{{ fila.campo }}` pasan a un `<ng-template cbTableCell>` con su contenido migrado, y las columnas de checkbox y de expandir desaparecen porque `cb-table` las pone sola. Con columnas dinámicas (`[columns]="cols"` + `@for`), `cols` pasa directamente a `[columns]`: el migrador le añade `sortable: true` / `filter: true` si la cabecera los aplicaba a todas, y las ramas `@if (col.field === '…')` o `@switch (col.field)` del cuerpo pasan a un `cbTableCell` por campo. Las tablas con celdas de lógica genérica, varias filas por registro o plantillas sin equivalente se dejan con aviso y conservan `TableModule`, para que sigan compilando. Las pestañas y los acordeones de PrimeNG 18+ se reestructuran (la cabecera pasa a `label`/`header`); si se generan con `@for` o la cabecera lleva iconos, quedan con aviso.

Los radios (`<p-radiobutton>`) y los menús contextuales (`<p-contextmenu>`) se marcan con un aviso pero no se convierten, porque cambia la estructura de la página: en CaribeNG el modelo de los radios va en un `<cb-radio-group>` que envuelve las opciones, y `<cb-contextmenu>` envuelve el área sobre la que se abre en vez de apuntar a ella con `[target]`. El resto de componentes aparece en el informe para migrarlo a mano; se irán añadiendo en próximas versiones.

| Opción | Uso |
|---|---|
| `--path=src/app/ventas` | Migrar solo una carpeta (migración por partes). |
| `--remove-primeng=false` | No tocar las dependencias de `package.json`. |
| `--report=false` | No escribir el informe. |
| `--skip-install` | No instalar dependencias al terminar. |
| `--force` | Migrar aunque falte `@caribeng/ui` o la versión de PrimeNG sea anterior a la 18. |

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

Los textos de interfaz de los componentes (etiquetas accesibles, botones, placeholders y mensajes) vienen en **inglés** (por defecto) y **español**:

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

Los 363 iconos núcleo se registran solos:

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

- **Form:** `autocomplete`, `button`, `button-group`, `cascadeselect`, `checkbox`, `chips`, `colorpicker`, `datepicker`, `editor`, `fab-menu`, `fileupload`, `floatlabel`, `icon-button`, `iconfield`, `input`, `input-number`, `input-search`, `input-token`, `inputgroup`, `inputmask`, `inputotp`, `keyfilter`, `knob`, `listbox`, `mentions`, `multiselect`, `password`, `phone-input`, `radio`, `rating`, `repeater`, `select`, `selectbutton`, `slider`, `tag-button`, `textarea`, `toggle`, `togglebutton`, `treeselect`.
- **Data:** `dataview`, `descriptions`, `kanban`, `orderlist`, `organizationchart`, `paginator`, `picklist`, `statistic`, `table`, `timeline`, `tracker`, `tree`, `treetable`, `virtualscroller`.
- **Overlay:** `coachmark`, `command-palette`, `confirmdialog`, `confirmpopup`, `dialog`, `drawer`, `dynamicdialog`, `off-canvas`, `onboarding`, `popover`, `tooltip`.
- **Messages:** `alert`, `badge`, `chat`, `chip`, `empty`, `inlinemessage`, `message`, `result`, `tag`, `toast`.
- **Menu:** `anchor`, `breadcrumb`, `contextmenu`, `dock`, `float-menu`, `megamenu`, `menu`, `menubar`, `panelmenu`, `sidebar`, `speeddial`, `splitbutton`, `steps`, `tabmenu`, `tieredmenu`.
- **Panel:** `accordion`, `card`, `card-content`, `card-move`, `card-primary`, `card-select`, `divider`, `expansion-panel`, `fieldset`, `footer`, `header`, `panel`, `scrollpanel`, `scrolltop`, `splitter`, `stepper`, `tabs`, `toolbar`.
- **Media:** `animation-lottie`, `avatar`, `avatargroup`, `carousel`, `galleria`, `illustration`, `image`, `logo`, `pdfviewer`, `qrcode`.
- **Archivos y precios:** `file-card`, `file-download`, `folder-card`, `pricing`.
- **Misc y directivas:** `animateonscroll`, `autofocus`, `blockui`, `chart`, `code-block`, `copy-button`, `dots-indicator`, `focustrap`, `icon`, `icons`, `inplace`, `kbd`, `link`, `metergroup`, `progressbar`, `ripple`, `shortcut`, `skeleton`, `spinner`, `status`, `step-indicator`, `styleclass`, `terminal`, `themetoggle`.

## 🧭 Próximos pasos

- Explora cada componente, con ejemplos en HTML y TypeScript, en el sitio de documentación (showcase).
- Personaliza colores y tokens en la guía de Theming.
- Consulta las novedades de cada versión en la página Changelog del sitio de documentación.

## ☀️ Licencia

MIT © CaribeNG Contributors. Iconos derivados de Lucide (ISC); ver `THIRD-PARTY-NOTICES.md`.
