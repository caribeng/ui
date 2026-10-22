import { parsePrimeIcon } from '../icons';
import { FOCUS_EVENTS, SEVERITY_VALUES, SIZE_VALUES, drop, escapeText, event, flagToValue, rename, styleClass, unsupported, values } from './rules';
import type { AttrRule, ComponentMapping, ElementRewrite } from './types';

/**
 * `<p-button label="Guardar" icon="pi pi-check" [outlined]="true" />`
 * → `<cb-button variant="outlined"><cb-icon name="check" />Guardar</cb-button>`
 */
const rules: Record<string, AttrRule> = {
  // label, icon e iconPos se combinan en `finalize` (pasan a ser contenido).
  label: drop(),
  icon: drop(),
  iconPos: drop(),
  severity: values('severity', SEVERITY_VALUES),
  outlined: flagToValue('variant', 'outlined', 'solid'),
  text: flagToValue('variant', 'text', 'solid'),
  size: values('size', SIZE_VALUES),
  fluid: rename('fullWidth'),
  styleClass: styleClass(),
  raised: unsupported('cb-button no tiene variante elevada; usa una clase propia.'),
  rounded: unsupported('cb-button no tiene variante redondeada; usa una clase propia o <cb-icon-button>.'),
  plain: unsupported('sin equivalente; usa severity="secondary".'),
  link: unsupported('para enlaces usa <cb-link>.'),
  badge: unsupported('usa un <cb-badge> dentro del botón.'),
  badgeClass: unsupported('usa un <cb-badge> dentro del botón.'),
  badgeSeverity: unsupported('usa un <cb-badge> dentro del botón.'),
  loadingIcon: unsupported('cb-button usa su propio spinner.'),
  buttonProps: unsupported('pasa cada propiedad como input de cb-button.'),
  tabindex: unsupported('el tabindex no se reenvía al <button> interno.'),
  autofocus: unsupported('usa la directiva cbAutoFocus de @caribeng/ui/autofocus.'),
  '(onClick)': event('click'),
  ...FOCUS_EVENTS,
};

const same = ['variant', 'disabled', 'loading', 'type', 'ariaLabel'];

/** Convierte `label`, `icon` e `iconPos` en el contenido del botón. */
function finalize(el: ElementRewrite): void {
  const label = el.find('label');
  const icon = el.find('icon');
  const position = el.find('iconPos');

  let text = '';
  if (label?.kind === 'static') text = label.value.includes('{{') ? label.value : escapeText(label.value);
  else if (label?.kind === 'property') text = `{{ ${label.value} }}`;

  let iconTag = '';
  if (icon?.kind === 'static') {
    const parsed = parsePrimeIcon(icon.value);
    if (parsed?.name) {
      iconTag = `<cb-icon name="${parsed.name}"${parsed.spin ? ' spin' : ''} />`;
      el.icons.add(parsed.name);
    } else {
      el.todos.push(`${icon.source} — ${parsed ? `el icono pi-${parsed.prime} no tiene equivalente conocido` : 'icono que no es de PrimeIcons'}; añade un <cb-icon> dentro del botón.`);
    }
  } else if (icon) {
    el.todos.push(`${icon.source} — icono dinámico: usa <cb-icon [name]="…" /> dentro del botón.`);
  }

  let after = false;
  if (position?.kind === 'static' && position.value === 'right') after = true;
  else if (position && !(position.kind === 'static' && position.value === 'left')) {
    el.todos.push(`${position.source} — cb-button coloca el icono donde lo pongas en el contenido.`);
  }

  if (iconTag && after) {
    if (text) el.before.push(text);
    el.after.push(iconTag);
  } else {
    if (iconTag) el.before.push(iconTag);
    if (text) el.before.push(text);
  }

  const hasName = el.attrs.some((attr) => /^(\[?ariaLabel\]?|aria-label|\[attr\.aria-label\])=/.test(attr));
  if (icon && !label && !hasName) {
    el.todos.push('botón solo con icono: añade ariaLabel="…" para que tenga nombre accesible.');
  }
}

export const button: ComponentMapping = {
  name: 'button',
  entry: '@caribeng/ui/button',
  modules: {
    'primeng/button': { ButtonModule: 'CbButton', Button: 'CbButton', ButtonDirective: 'CbButton' },
  },
  elements: [
    { tag: 'p-button', to: 'cb-button', rules, finalize, same },
    { attr: 'pButton', on: ['button'], otherTags: 'para enlaces usa <cb-link>.', to: 'cb-button', rules, finalize, same },
  ],
};
