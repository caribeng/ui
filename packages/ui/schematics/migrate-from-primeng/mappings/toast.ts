import * as ts from 'typescript';
import { drop, styleClass, unsupported, values } from './rules';
import { forEachServiceCall, propertyName, rebuildObject, todoBefore } from './service-calls';
import type { ComponentMapping, SourceRewriter } from './types';

const POSITIONS = ['top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center'];

/** Severidades de los mensajes de PrimeNG → CbSeverity. */
const MESSAGE_SEVERITY: Readonly<Record<string, string>> = { warn: 'warning', error: 'danger' };

/** Propiedades de un mensaje de PrimeNG sin equivalente en CbToastOptions. */
const DROPPED_FIELDS = new Set(['key', 'icon', 'data', 'id', 'styleClass', 'contentStyleClass', 'closeIcon', 'text']);

/**
 * `{ severity: 'error', summary, sticky: true, key: 'x' }`
 * → `{ severity: 'danger', summary, life: 0 }`. Devuelve el texto nuevo (o
 * `null` si no cambia) y los avisos.
 */
function rewriteMessage(sf: ts.SourceFile, message: ts.ObjectLiteralExpression, todos: string[]): string | null {
  let changed = false;
  const hasLife = message.properties.some((p) => propertyName(p) === 'life');
  const dropped: string[] = [];
  const properties: string[] = [];
  for (const property of message.properties) {
    const name = propertyName(property);
    const text = property.getText(sf);
    if (name && DROPPED_FIELDS.has(name)) {
      dropped.push(text);
      changed = true;
      continue;
    }
    if (name === 'severity' && ts.isPropertyAssignment(property)) {
      const value = property.initializer;
      if (ts.isStringLiteralLike(value)) {
        const mapped = MESSAGE_SEVERITY[value.text];
        if (mapped) {
          const quote = sf.text[value.getStart(sf)];
          properties.push(`${property.name.getText(sf)}: ${quote}${mapped}${quote}`);
          changed = true;
          continue;
        }
      } else {
        todos.push(`severity con expresión: CaribeNG usa 'warning' y 'danger' en vez de 'warn' y 'error'.`);
      }
    }
    if (name === 'sticky' && ts.isPropertyAssignment(property)) {
      changed = true;
      const value = property.initializer;
      if (value.kind === ts.SyntaxKind.FalseKeyword) continue;
      if (hasLife) {
        todos.push(`${text} — en CaribeNG un mensaje fijo es life: 0; revisa el life de este mensaje.`);
        continue;
      }
      properties.push(value.kind === ts.SyntaxKind.TrueKeyword ? 'life: 0' : `life: (${value.getText(sf)}) ? 0 : 3000`);
      continue;
    }
    properties.push(text);
  }
  if (dropped.length) todos.push(`${dropped.join(', ')} — CbToastService no tiene estos campos.`);
  if (!changed) return null;

  return rebuildObject(sf, message, properties);
}

/**
 * Llamadas a `MessageService` → `CbToastService`: traduce las severidades
 * (`warn` → `warning`, `error` → `danger`), `sticky` → `life: 0`, y marca
 * `key`, `addAll()` y los observables, que no tienen equivalente.
 */
const rewriteMessageService: SourceRewriter = (sf, locals, edits) => {
  const local = locals.get('MessageService');
  if (!local) return;
  forEachServiceCall(sf, local, (method, access, call) => {
    const todos: string[] = [];
    if (method === 'add' && call) {
      const [message] = call.arguments;
      if (message && ts.isObjectLiteralExpression(message)) {
        const rewritten = rewriteMessage(sf, message, todos);
        if (rewritten !== null) edits.push({ start: message.getStart(sf), end: message.getEnd(), text: rewritten });
      } else if (message) {
        todos.push(`mensaje no literal: CaribeNG usa severity 'warning'/'danger' (no 'warn'/'error') y life: 0 en vez de sticky.`);
      }
    } else if (method === 'addAll') {
      todos.push('CbToastService no tiene addAll(); llama a add() por cada mensaje.');
    } else if (method === 'clear' && call?.arguments.length) {
      const args = call.arguments;
      edits.push({ start: args[0].getStart(sf), end: args[args.length - 1].getEnd(), text: '' });
      todos.push('cb-toast no tiene key: clear() cierra todos los mensajes.');
    } else if (method === 'messageObserver' || method === 'clearObserver') {
      todos.push(`CbToastService no expone ${method}; usa su señal toasts().`);
    }
    if (todos.length) edits.push(todoBefore(sf, call ?? access, todos));
  });
};

/**
 * `<p-toast position="bottom-center" />` → `<cb-toast position="bottom-center" />`
 * y `MessageService` (primeng/api) → `CbToastService`.
 */
export const toast: ComponentMapping = {
  name: 'toast',
  entry: '@caribeng/ui/toast',
  symbol: 'CbToast',
  modules: {
    'primeng/toast': { ToastModule: 'CbToast', Toast: 'CbToast' },
    'primeng/api': { MessageService: 'CbToastService' },
  },
  rootServices: ['CbToastService'],
  rewriteSource: rewriteMessageService,
  elements: [
    {
      tag: 'p-toast',
      to: 'cb-toast',
      rules: {
        position: values('position', Object.fromEntries(POSITIONS.map((p) => [p, p]))),
        key: unsupported('cb-toast muestra todos los mensajes de CbToastService; si tenías varios p-toast con key, deja uno.'),
        life: unsupported('indica life en cada mensaje (CbToastService.add).'),
        preventOpenDuplicates: unsupported('cb-toast no filtra mensajes duplicados.'),
        preventDuplicates: unsupported('cb-toast no filtra mensajes duplicados.'),
        styleClass: styleClass(),
        autoZIndex: drop(),
        baseZIndex: drop(),
        showTransformOptions: drop(),
        hideTransformOptions: drop(),
        showTransitionOptions: drop(),
        hideTransitionOptions: drop(),
        motionOptions: drop(),
        breakpoints: drop(),
        '(onClose)': unsupported('cb-toast no emite el cierre de los mensajes.'),
      },
      child: (child) => (child.name === 'ng-template' ? { todo: 'cb-toast no admite plantillas de mensaje; el contenido no se mostrará.' } : null),
    },
  ],
};
