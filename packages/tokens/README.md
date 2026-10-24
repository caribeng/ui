# @caribeng/tokens

Design tokens de CaribeNG como variables CSS (`--cb-*`), más utilidades y mixins SCSS opcionales.

## Instalación

```bash
npm install @caribeng/tokens
```

## Uso

### CSS (sin SCSS)

```css
@import "@caribeng/tokens/css/caribeng.css";
```

Incluye las variables `--cb-*`, el tema oscuro (`[data-theme="dark"]`) y las utilidades `.cb-*`.

### Utilidades responsive

Las utilidades de layout, espaciado, tamaño, posición y tipografía tienen variantes `sm:`, `md:`, `lg:`, `xl:` y `2xl:` (mobile-first):

```html
<div class="cb-grid cb-grid-cols-1 md:cb-grid-cols-2 lg:cb-grid-cols-4 cb-gap-4">…</div>
<aside class="cb-hidden lg:cb-block">…</aside>
```

### SCSS

```scss
@use "@caribeng/tokens/scss" as cb;

.mi-caja {
  padding: var(--cb-space-4);
  border-radius: var(--cb-radius-md);

  @include cb.cb-media("md") {
    padding: var(--cb-space-6);
  }
}
```

## Personalización

Sobrescribe variables sin tocar la librería:

```css
:root {
  --cb-color-primary-500: #ff6a00;
  --cb-radius-md: 4px;
}
```
