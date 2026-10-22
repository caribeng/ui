import { drop, renderAttr, slotChild, staticBoolean, styleClass, unsupported } from './rules';
import type { AttrRule, ComponentMapping } from './types';

/** `{ width: '25rem' }` · `{ 'width': "50vw" }`. */
const WIDTH_OBJECT = /^\s*\{\s*(['"]?)width\1\s*:\s*(['"])([^'"]+)\2\s*,?\s*\}\s*$/;
/** `width: 25rem` · `width: 25rem;`. */
const WIDTH_STYLE = /^\s*width\s*:\s*([^;]+?)\s*;?\s*$/;

/** `[style]="{ width: '25rem' }"` → `width="25rem"` (cb-dialog no aplica el style del host al panel). */
const style: AttrRule = (binding, el) => {
  const width = binding.kind === 'property' ? WIDTH_OBJECT.exec(binding.value)?.[3] : binding.kind === 'static' ? WIDTH_STYLE.exec(binding.value)?.[1] : undefined;
  if (width) el.attrs.push(renderAttr('static', 'width', width));
  else el.todos.push(`${binding.source} — cb-dialog solo admite el ancho (input width).`);
};

/**
 * `<p-dialog header="Editar" [(visible)]="abierto" [modal]="true" [style]="{ width: '25rem' }">`
 * → `<cb-dialog header="Editar" [(visible)]="abierto" width="25rem">`
 */
const rules: Record<string, AttrRule> = {
  modal: (binding, el) => {
    if (staticBoolean(binding) !== true) el.todos.push(`${binding.source} — cb-dialog siempre es modal; sin máscara usa <cb-drawer> o <cb-popover>.`);
  },
  style,
  styleClass: styleClass(),
  // Comportamiento que cb-dialog resuelve solo (overlay del CDK, foco atrapado, scroll bloqueado).
  appendTo: drop(),
  autoZIndex: drop(),
  baseZIndex: drop(),
  blockScroll: drop(),
  focusOnShow: drop(),
  focusTrap: drop(),
  keepInViewport: drop(),
  minX: drop(),
  minY: drop(),
  transitionOptions: drop(),
  motionOptions: drop(),
  maskMotionOptions: drop(),
  draggable: drop(),
  resizable: unsupported('cb-dialog no se puede redimensionar.'),
  maximizable: unsupported('cb-dialog no se puede maximizar.'),
  position: unsupported('cb-dialog siempre aparece centrado; para un panel lateral usa <cb-drawer>.'),
  breakpoints: unsupported('ajusta el ancho con width (admite min(), clamp(), %).'),
  contentStyle: unsupported('aplica estilos al contenido proyectado.'),
  contentStyleClass: unsupported('aplica clases al contenido proyectado.'),
  maskStyle: unsupported('personaliza la máscara con los tokens CSS de cb-dialog.'),
  maskStyleClass: unsupported('personaliza la máscara con los tokens CSS de cb-dialog.'),
  showHeader: unsupported('cb-dialog muestra la cabecera si hay header o closable.'),
  closeIcon: unsupported('cb-dialog usa su propio icono de cierre.'),
  closeAriaLabel: unsupported('el botón de cierre usa el texto de provideCaribeNG().'),
  closeTabindex: unsupported('el botón de cierre ya es accesible por teclado.'),
  closeButtonProps: unsupported('cb-dialog usa su propio botón de cierre.'),
  maximizeButtonProps: unsupported('cb-dialog no se puede maximizar.'),
  minimizeIcon: unsupported('cb-dialog no se puede maximizar.'),
  maximizeIcon: unsupported('cb-dialog no se puede maximizar.'),
  rtl: unsupported('cb-dialog sigue la dirección del documento (dir="rtl").'),
  role: unsupported('cb-dialog usa role="dialog".'),
  '(onResizeInit)': unsupported('cb-dialog no se puede redimensionar.'),
  '(onResizeEnd)': unsupported('cb-dialog no se puede redimensionar.'),
  '(onDragEnd)': unsupported('cb-dialog no se puede arrastrar.'),
  '(onMaximize)': unsupported('cb-dialog no se puede maximizar.'),
};

const HEADER = 'cb-dialog solo admite una cabecera de texto (input header).';

/** El pie pasa a un `<div cb-dialog-footer>` y `#content` se desenvuelve; el resto de plantillas no tiene equivalente. */
const child = slotChild('cb-dialog', 'cb-dialog-footer', { header: HEADER });

export const dialog: ComponentMapping = {
  name: 'dialog',
  entry: '@caribeng/ui/dialog',
  symbol: 'CbDialog',
  modules: {
    'primeng/dialog': { DialogModule: 'CbDialog', Dialog: 'CbDialog' },
  },
  elements: [
    {
      tag: 'p-dialog',
      to: 'cb-dialog',
      rules,
      child,
      same: ['visible', 'header', 'closable', 'dismissableMask', 'closeOnEscape', 'ariaLabel', 'onShow', 'onHide', 'visibleChange'],
    },
  ],
};
