import { parsePrimeIcon } from '../icons';
import type { AttrRule, Binding, ChildElement, ChildRewrite } from './types';

/** Escribe un atributo de plantilla con la sintaxis de su tipo. */
export function renderAttr(kind: Binding['kind'], name: string, value: string, bare = false): string {
  const key = kind === 'property' ? `[${name}]` : kind === 'twoWay' ? `[(${name})]` : kind === 'event' ? `(${name})` : name;
  if (kind === 'static' && bare) return key;
  const quote = value.includes('"') ? "'" : '"';
  return `${key}=${quote}${value}${quote}`;
}

/** Valor booleano de un atributo estático (`outlined`, `outlined="true"` → true). `null` si es una expresión. */
export function staticBoolean(binding: Binding): boolean | null {
  if (binding.kind === 'static') return binding.value !== 'false';
  const value = binding.value.trim();
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

/** Texto plano listo para usarse como contenido de una plantilla Angular. */
export function escapeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/@/g, '&#64;');
}

/** El input/output existe con otro nombre. */
export const rename =
  (to: string): AttrRule =>
  (binding, el) =>
    el.attrs.push(renderAttr(binding.kind, to, binding.value, binding.bare));

/** Se elimina sin aviso: no tiene efecto en CaribeNG (p. ej. `appendTo`, que resuelve el overlay del CDK). */
export const drop = (): AttrRule => () => undefined;

/** Sin equivalente: se elimina y se deja un aviso con el atributo original para no perder información. */
export const unsupported =
  (why: string): AttrRule =>
  (binding, el) =>
    el.todos.push(`${binding.source} — ${why}`);

/**
 * El input existe pero sus valores cambian (`small` → `sm`). Los valores
 * estáticos se traducen; las expresiones se conservan con un aviso.
 */
export const values =
  (to: string, map: Readonly<Record<string, string>>): AttrRule =>
  (binding, el) => {
    if (binding.kind === 'static') {
      const mapped = map[binding.value];
      if (mapped !== undefined) {
        el.attrs.push(renderAttr('static', to, mapped));
      } else {
        el.attrs.push(renderAttr('static', to, binding.value, binding.bare));
        el.todos.push(`${binding.source} — valor sin equivalente conocido en ${el.tag}.`);
      }
      return;
    }
    el.attrs.push(renderAttr(binding.kind, to, binding.value));
    const table = Object.entries(map)
      .filter(([from, mapped]) => from !== mapped)
      .map(([from, mapped]) => `'${from}' → '${mapped}'`)
      .join(', ');
    if (table) el.todos.push(`${binding.source} — revisa los valores de la expresión: ${table}.`);
  };

/**
 * Un booleano de PrimeNG (`outlined`, `text`) se convierte en un valor de un
 * input de CaribeNG (`variant="outlined"`). Con una expresión se escribe un
 * ternario con el valor por defecto.
 */
export const flagToValue =
  (to: string, value: string, otherwise: string): AttrRule =>
  (binding, el) => {
    if (el.attrs.some((attr) => attr.startsWith(`${to}=`) || attr.startsWith(`[${to}]=`))) {
      el.todos.push(`${binding.source} — ya hay otro ${to}; revisa cuál aplica.`);
      return;
    }
    const flag = staticBoolean(binding);
    if (flag === true) el.attrs.push(renderAttr('static', to, value));
    else if (flag === null) el.attrs.push(renderAttr('property', to, `(${binding.value}) ? '${value}' : '${otherwise}'`));
  };

/**
 * Un output con otro nombre. `adapt` traduce la expresión cuando cambia el
 * payload; si devuelve `null` se conserva el output con un aviso.
 */
export const event =
  (to: string, adapt?: (expression: string) => string | null): AttrRule =>
  (binding, el) => {
    if (!adapt) {
      el.attrs.push(renderAttr('event', to, binding.value));
      return;
    }
    const adapted = adapt(binding.value);
    if (adapted !== null) {
      el.attrs.push(renderAttr('event', to, adapted));
    } else {
      el.attrs.push(renderAttr('event', to, binding.value));
      el.todos.push(`${binding.source} — el evento ahora es (${to}) y su $event es distinto; revisa el manejador.`);
    }
  };

/** `styleClass` → `class` en el host (CaribeNG aplica las clases del host). */
export const styleClass = (): AttrRule => rename('class');

/** Tamaños de PrimeNG (`small`/`large`) a los de CaribeNG (`sm`/`lg`). */
export const SIZE_VALUES: Readonly<Record<string, string>> = { small: 'sm', large: 'lg' };

/** Severidades de PrimeNG a las de CaribeNG (solo cambia `warn`). */
export const SEVERITY_VALUES: Readonly<Record<string, string>> = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  info: 'info',
  warn: 'warning',
  danger: 'danger',
  help: 'help',
  contrast: 'contrast',
};

/**
 * `icon="pi pi-check"` → `icon="check"` en componentes CaribeNG cuyo input
 * `icon` recibe el nombre del icono (Tag…).
 */
export const iconName =
  (to = 'icon'): AttrRule =>
  (binding, el) => {
    const parsed = binding.kind === 'static' ? parsePrimeIcon(binding.value) : null;
    if (parsed?.name) {
      el.attrs.push(renderAttr('static', to, parsed.name));
      el.icons.add(parsed.name);
    } else if (binding.kind === 'static') {
      el.todos.push(`${binding.source} — ${parsed ? `pi-${parsed.prime} no tiene equivalente conocido` : 'icono que no es de PrimeIcons'}; usa un nombre de @caribeng/ui/icon.`);
    } else {
      el.attrs.push(renderAttr(binding.kind, to, binding.value));
      el.todos.push(`${binding.source} — ${to} recibe el nombre de un icono de CaribeNG ("check"), no clases "pi pi-check".`);
    }
  };

/** Nombre de la plantilla PrimeNG de un hijo (`#footer` o `pTemplate="footer"`). */
export function templateName(child: ChildElement): string | undefined {
  if (child.name !== 'ng-template') return undefined;
  return child.references[0] ?? child.bindings.find((b) => b.kind === 'static' && b.name === 'pTemplate')?.value;
}

/**
 * Hijos de los componentes con pie y contenido proyectado (Dialog, Card):
 * `#footer`/`<p-footer>` pasan al slot `[footerAttr]`, `#content` se desenvuelve
 * y el resto de plantillas se marca con un aviso.
 */
export function slotChild(tag: string, footerAttr: string, others: Readonly<Record<string, string>>): (child: ChildElement) => ChildRewrite | null {
  return (child) => {
    if (child.name === 'p-footer') return { tag: 'div', attrs: [footerAttr] };
    if (child.name === 'p-header') return { todo: others['header'] ?? `${tag} no tiene cabecera personalizada.` };
    const name = templateName(child);
    if (!name) return null;
    if (name === 'footer') return { tag: 'div', attrs: [footerAttr] };
    if (name === 'content') return { tag: 'ng-container', attrs: [] };
    return { todo: others[name] ?? `${tag} no tiene la plantilla "${name}"; pon el contenido directamente dentro de ${tag}.` };
  };
}

/** Outputs de foco: los de PrimeNG pasan a los eventos nativos que burbujean hasta el host. */
export const FOCUS_EVENTS: Readonly<Record<string, AttrRule>> = {
  '(onFocus)': event('focusin'),
  '(onBlur)': event('focusout'),
};
