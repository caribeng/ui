// GENERADO por apps/showcase/scripts/gen-changelog.mjs a partir de CHANGELOG.md.
// No editar a mano: modifica CHANGELOG.md y ejecuta `pnpm docs:changelog` (o el build).
import type { CbChangelogRelease } from './changelog.model';

export const CHANGELOG: readonly CbChangelogRelease[] = [
  {
    "version": null,
    "date": null,
    "sections": []
  },
  {
    "version": "22.1.0",
    "date": "2026-10-20",
    "sections": [
      {
        "type": "breaking",
        "items": [
          {
            "component": "Formularios",
            "text": "el `*` de `[required]` ya no se muestra por defecto en Input, Textarea, Autocomplete, DatePicker e InputNumber (`requiredIndicator` es `'none'` por defecto). Para recuperarlo: `provideCaribeNG({ requiredIndicator: 'asterisk' })`."
          }
        ]
      },
      {
        "type": "added",
        "items": [
          {
            "component": "Formularios",
            "text": "estado de validación automático con Angular Forms (`cbFieldState`): el campo se marca inválido cuando su `FormControl` es inválido y fue tocado, sin `[invalid]` manual. El mensaje sigue siendo opcional (`error`)."
          },
          {
            "component": "Formularios",
            "text": "indicador de obligatoriedad configurable `requiredIndicator` (`'asterisk'`, `'text'`, `'optional'`, `'none'`), global con `provideCaribeNG()` y por campo, con textos `requiredText` / `optionalText`."
          },
          {
            "component": "Formularios",
            "text": "input `invalid` con estilo y `aria-invalid` en InputMask, InputOtp, Radio, Toggle, Slider, Rating, Listbox, SelectButton, ToggleButton, CascadeSelect, TreeSelect, Editor, Knob, Switch, InputSearch, InputDate, InputSelect e InputToken."
          },
          {
            "component": "Select / MultiSelect",
            "text": "inputs `ariaLabel` y `ariaLabelledBy` para nombrar el combobox."
          },
          {
            "component": "Editor",
            "text": "encabezados, formato, alineación, enlaces e inserción de imágenes."
          },
          {
            "component": "Pricing / FileCard / FolderCard",
            "text": "nuevos componentes genéricos."
          },
          {
            "component": "Image",
            "text": "barra de herramientas completa en el visor (lightbox) con volteo horizontal y vertical."
          },
          {
            "component": "Icon",
            "text": "iconos `flip-horizontal` y `flip-vertical`."
          },
          {
            "component": "Showcase",
            "text": "pestaña TypeScript con el componente standalone completo de cada ejemplo, generado del código de la página."
          },
          {
            "component": "Showcase",
            "text": "sección Accesibilidad (lector de pantalla y teclado) en 24 componentes."
          },
          {
            "component": "Showcase",
            "text": "sección Templates: autenticación (login, registro, recuperar y restablecer contraseña, 2FA, verificación, bloqueo), dashboard, navbar, file manager, pricing, factura y páginas de error."
          },
          {
            "component": "Showcase",
            "text": "botón de pantalla completa en los ejemplos."
          },
          {
            "component": "Showcase",
            "text": "página Changelog."
          }
        ]
      },
      {
        "type": "changed",
        "items": [
          {
            "component": "Showcase",
            "text": "estructura única de páginas (Importación → Básico → ejemplos → Accesibilidad → Playground → API) con títulos y descripciones traducibles ES/EN."
          },
          {
            "component": "Checkbox",
            "text": "muestra el indicador de obligatoriedad configurado."
          },
          {
            "component": "Distribución",
            "text": "el paquete se publica sin source maps (solo el JavaScript compilado), como PrimeNG."
          }
        ]
      },
      {
        "type": "fixed",
        "items": [
          {
            "component": "ConfirmDialog",
            "text": "atrapa el foco, Escape cancela y cierra, y el foco vuelve al elemento que lo abrió."
          },
          {
            "component": "Tabs",
            "text": "relación `aria-controls` / `aria-labelledby` entre pestaña y panel; el foco acompaña a la pestaña al usar las flechas."
          },
          {
            "component": "Tooltip",
            "text": "el disparador lo referencia con `aria-describedby` y Escape lo oculta."
          },
          {
            "component": "Autocomplete",
            "text": "el panel ocupa el ancho del input."
          },
          {
            "component": "Paginator",
            "text": "el selector de filas muestra solo el número."
          },
          {
            "component": "Button",
            "text": "`fullWidth` ocupa todo el ancho disponible."
          },
          {
            "component": "Select",
            "text": "ancho correcto de los desplegables."
          },
          {
            "component": "Showcase",
            "text": "ejemplos HTML que usaban variables inexistentes (Rating, Slider, Knob, Steps, TabMenu, SelectButton, MegaMenu, Voucher)."
          }
        ]
      }
    ]
  },
  {
    "version": "22.0.0",
    "date": "2026-10-18",
    "sections": [
      {
        "type": "breaking",
        "items": [
          {
            "component": "Angular",
            "text": "requiere Angular 22 (`peerDependencies` `^22.0.0`)."
          }
        ]
      },
      {
        "type": "changed",
        "items": [
          {
            "component": "Versionado",
            "text": "el major de la librería se alinea con el de Angular; la 22.0.0 incluye todo lo de la 1.1.0."
          },
          {
            "component": "Mantenimiento",
            "text": "la línea v21 (Angular 21) continúa en la rama `release/21.x` y solo recibe correcciones."
          },
          {
            "component": "Showcase",
            "text": "selector de versión con v22 como actual y v21 en mantenimiento."
          }
        ]
      }
    ]
  },
  {
    "version": "1.1.0",
    "date": "2026-10-17",
    "sections": [
      {
        "type": "added",
        "items": [
          {
            "component": "Caribe Design · Cards, transacciones y alertas",
            "text": "`alert`, `inline-alert`, `card-content`, `card-move`, `card-primary`, `card-select`, `coachmark`, `onboarding`, `status`, `tracker`, `transaction-status`, `voucher`, `data-table`, `modal`, `pop-over`."
          },
          {
            "component": "Caribe Design · Navegación, botones y paneles",
            "text": "`button-group`, `icon-button`, `tag-button`, `fab-menu`, `float-menu`, `header`, `footer`, `link`, `shortcut`, `expansion-panel`, `off-canvas`, `dots-indicator`, `step-indicator`, `switch`, `progress-bar`."
          },
          {
            "component": "Caribe Design · Identidad, loaders, archivos y formularios",
            "text": "`animation-lottie`, `circle-loading`, `loader`, `preloader`, `logo`, `illustration`, `pictogram`, `stroke`, `file-download`, `file-select`, `input-search`, `input-token`, `input-date`, `input-select`, `calendar`."
          },
          {
            "component": "Calidad",
            "text": "140 suites de prueba (280 tests unitarios con Vitest)."
          },
          {
            "component": "Showcase",
            "text": "138 páginas de documentación interactiva."
          }
        ]
      }
    ]
  },
  {
    "version": "1.0.0",
    "date": "2026-10-17",
    "sections": [
      {
        "type": "added",
        "items": [
          {
            "component": "Form",
            "text": "`Button`, `Input`, `Textarea`, `Select`, `MultiSelect`, `Checkbox`, `Radio`, `Toggle`, `DatePicker`, `InputNumber`, `InputMask`, `InputOTP`, `InputGroup`, `FloatLabel`, `IconField`, `Slider`, `Rating`, `ColorPicker`, `FileUpload`, `Autocomplete`, `Password`, `Knob`, `ListBox`, `SelectButton`, `ToggleButton`, `TreeSelect`, `CascadeSelect`, `Chips`, `Editor`."
          },
          {
            "component": "Data",
            "text": "`Table` (ordenación, paginación, selección y plantillas de celda `cbTableCell`), `Paginator`, `DataView`, `Tree`, `TreeTable`, `Timeline`, `VirtualScroller`, `OrderList`, `PickList`, `OrganizationChart`."
          },
          {
            "component": "Overlay",
            "text": "`Dialog`, `Drawer`, `Tooltip` (`[cbTooltip]`), `Popover`, `ConfirmDialog`, `ConfirmPopup`, `DynamicDialog`."
          },
          {
            "component": "Messages",
            "text": "`Toast` (`CbToastService`), `Message`, `InlineMessage`, `Badge`, `Tag`, `Chip`."
          },
          {
            "component": "Menu",
            "text": "`Menu`, `Menubar`, `ContextMenu`, `Breadcrumb`, `Steps`, `TabMenu`, `PanelMenu`, `TieredMenu`, `MegaMenu`, `Dock`, `SpeedDial`."
          },
          {
            "component": "Panel",
            "text": "`Card`, `Panel`, `Accordion`, `Fieldset`, `Divider`, `Splitter`, `Toolbar`, `ScrollPanel`, `ScrollTop`, `Tabs`, `Stepper`."
          },
          {
            "component": "Media",
            "text": "`Avatar`, `AvatarGroup`, `Image` (lightbox y zoom), `Carousel`, `Galleria`."
          },
          {
            "component": "Misc",
            "text": "`Icon` (`<cb-icon>` con 361 iconos núcleo), `Icons` (1891 iconos Lucide), `ProgressBar`, `Spinner`, `Skeleton`, `MeterGroup`, `Inplace`, `BlockUI`, `Terminal`, `Chart`, `Ripple`, `FocusTrap`, `AnimateOnScroll`, `StyleClass`, `AutoFocus`."
          },
          {
            "component": "Theming",
            "text": "presets de paleta primaria en caliente (`emerald`, `ocean`, `coral`, `amber`, `violet`, `rose`) con `setPreset()` y escalas personalizadas con `setCustomPrimaryScale()`."
          },
          {
            "component": "Distribución",
            "text": "Angular Package Format con `exports` autogenerados y hoja de estilos `@caribeng/ui/styles.css`."
          },
          {
            "component": "Calidad",
            "text": "94 archivos de prueba con Vitest + jsdom y CI en GitHub Actions."
          }
        ]
      }
    ]
  }
];
