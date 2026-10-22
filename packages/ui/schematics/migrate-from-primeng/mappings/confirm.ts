import * as ts from 'typescript';
import { drop, staticBoolean, styleClass, unsupported } from './rules';
import { forEachServiceCall, propertyName, rebuildObject, todoBefore } from './service-calls';
import type { AttrRule, ComponentMapping, ElementRewrite, SourceRewriter } from './types';

/** Severidades que admite el botón de aceptar de CaribeNG (`CbConfirmSeverity`). */
const ACCEPT_SEVERITIES = new Set(['primary', 'danger', 'success', 'warning']);

/** `acceptButtonStyleClass: 'p-button-danger'` (PrimeNG ≤ 17) → severidad. */
const STYLE_CLASS_SEVERITY = /\bp-button-(danger|success|warning|warn)\b/;

/** Opciones de `Confirmation` que se copian tal cual a `CbConfirmation`. */
const SAME_FIELDS = new Set(['message', 'header', 'accept', 'reject', 'target', 'key', 'acceptLabel', 'rejectLabel']);

/** Severidad PrimeNG → CaribeNG (`warn` → `warning`); `null` si no tiene equivalente. */
function acceptSeverity(value: string): string | null {
  const mapped = value === 'warn' ? 'warning' : value;
  return ACCEPT_SEVERITIES.has(mapped) ? mapped : null;
}

/**
 * `{ message, acceptButtonProps: { severity: 'danger', label: 'Sí' }, icon: 'pi pi-x' }`
 * → `{ message, acceptSeverity: 'danger', acceptLabel: 'Sí' }`. Devuelve el
 * texto nuevo (o `null` si no cambia) y deja los avisos en `todos`.
 */
function rewriteConfirmation(sf: ts.SourceFile, confirmation: ts.ObjectLiteralExpression, todos: string[]): string | null {
  const properties: string[] = [];
  const dropped: string[] = [];
  let severity: string | undefined;
  const has = (name: string) => confirmation.properties.some((p) => propertyName(p) === name);
  let changed = false;

  for (const property of confirmation.properties) {
    const name = propertyName(property);
    const text = property.getText(sf);
    if (!name || SAME_FIELDS.has(name) || !ts.isPropertyAssignment(property)) {
      properties.push(text);
      continue;
    }
    changed = true;
    const value = property.initializer;

    if ((name === 'acceptButtonProps' || name === 'rejectButtonProps') && ts.isObjectLiteralExpression(value)) {
      const prefix = name === 'acceptButtonProps' ? 'accept' : 'reject';
      for (const prop of value.properties) {
        const propName = propertyName(prop);
        const init = ts.isPropertyAssignment(prop) ? prop.initializer : undefined;
        if (propName === 'label' && init && !has(`${prefix}Label`)) {
          properties.push(`${prefix}Label: ${init.getText(sf)}`);
        } else if (prefix === 'accept' && propName === 'severity' && init && ts.isStringLiteralLike(init) && acceptSeverity(init.text)) {
          severity = acceptSeverity(init.text)!;
        } else {
          dropped.push(`${name}.${prop.getText(sf)}`);
        }
      }
      continue;
    }
    if (name === 'acceptButtonStyleClass' && ts.isStringLiteralLike(value) && STYLE_CLASS_SEVERITY.test(value.text)) {
      severity = acceptSeverity(STYLE_CLASS_SEVERITY.exec(value.text)![1])!;
      continue;
    }
    dropped.push(text);
  }

  if (severity) properties.push(`acceptSeverity: '${severity}'`);
  if (dropped.length) todos.push(`${dropped.join(', ')} — CbConfirmationService no tiene estas opciones (iconos, visibilidad de botones, estilos…).`);
  return changed ? rebuildObject(sf, confirmation, properties) : null;
}

/**
 * `ConfirmationService.confirm({...})` → `CbConfirmationService.confirm({...})`:
 * mismas opciones salvo los botones (`acceptButtonProps.severity` →
 * `acceptSeverity`) y las de iconos/estilo, que se marcan.
 */
const rewriteConfirmationService: SourceRewriter = (sf, locals, edits) => {
  const local = locals.get('ConfirmationService');
  if (!local) return;
  forEachServiceCall(sf, local, (method, access, call) => {
    const todos: string[] = [];
    if (method === 'confirm' && call) {
      const [confirmation] = call.arguments;
      if (confirmation && ts.isObjectLiteralExpression(confirmation)) {
        const rewritten = rewriteConfirmation(sf, confirmation, todos);
        if (rewritten !== null) edits.push({ start: confirmation.getStart(sf), end: confirmation.getEnd(), text: rewritten });
      } else if (confirmation) {
        todos.push('confirmación no literal: CbConfirmationService usa acceptSeverity en vez de acceptButtonProps y no tiene iconos.');
      }
    } else if (method === 'requireConfirmation$' || method === 'accept' || method === 'onAccept') {
      todos.push(`CbConfirmationService no expone ${method}; pasa accept/reject en confirm() o lee su señal request().`);
    }
    if (todos.length) edits.push(todoBefore(sf, call ?? access, todos));
  });
};

/** El host de PrimeNG atiende siempre al servicio: en CaribeNG hay que pedirlo con `service`. */
function asServiceHost(el: ElementRewrite): void {
  if (!el.attrs.includes('service')) el.attrs.push('service');
}

/** Se elimina sin aviso salvo que se desactive (`[closeOnEscape]="false"`), que no tiene equivalente. */
const dropUnlessFalse =
  (why: string): AttrRule =>
  (binding, el) => {
    if (staticBoolean(binding) !== true) el.todos.push(`${binding.source} — ${why}`);
  };

const NO_ICONS = 'las confirmaciones de CaribeNG no tienen iconos.';
const NO_STYLE = 'personaliza la confirmación con los tokens CSS de CaribeNG.';
const NO_TEMPLATE = 'las confirmaciones de CaribeNG no admiten plantillas; el contenido no se mostrará.';

/**
 * `<p-confirmdialog />` + `ConfirmationService` → `<cb-confirm-dialog service />` + `CbConfirmationService`.
 */
export const confirmdialog: ComponentMapping = {
  name: 'confirmdialog',
  entry: '@caribeng/ui/confirmdialog',
  symbol: 'CbConfirmDialog',
  modules: {
    'primeng/confirmdialog': { ConfirmDialogModule: 'CbConfirmDialog', ConfirmDialog: 'CbConfirmDialog' },
    'primeng/api': { ConfirmationService: { name: 'CbConfirmationService', entry: '@caribeng/ui' } },
  },
  rootServices: ['CbConfirmationService'],
  rewriteSource: rewriteConfirmationService,
  elements: ['p-confirmdialog', 'p-confirmDialog', 'p-confirm-dialog'].map((tag) => ({
    tag,
    to: 'cb-confirm-dialog',
    finalize: asServiceHost,
    rules: {
      styleClass: styleClass(),
      closeOnEscape: dropUnlessFalse('cb-confirm-dialog siempre se cancela con Escape.'),
      // Comportamiento que cb-confirm-dialog resuelve solo (modal, foco atrapado en "cancelar", clic en la máscara cancela).
      dismissableMask: drop(),
      blockScroll: drop(),
      closable: drop(),
      modal: drop(),
      draggable: drop(),
      focusTrap: drop(),
      defaultFocus: drop(),
      appendTo: drop(),
      autoZIndex: drop(),
      baseZIndex: drop(),
      transitionOptions: drop(),
      icon: unsupported(NO_ICONS),
      acceptIcon: unsupported(NO_ICONS),
      rejectIcon: unsupported(NO_ICONS),
      acceptVisible: unsupported('cb-confirm-dialog muestra siempre los dos botones.'),
      rejectVisible: unsupported('cb-confirm-dialog muestra siempre los dos botones.'),
      acceptButtonStyleClass: unsupported('usa acceptSeverity.'),
      rejectButtonStyleClass: unsupported(NO_STYLE),
      closeAriaLabel: drop(),
      acceptAriaLabel: unsupported('el botón usa acceptLabel como nombre accesible.'),
      rejectAriaLabel: unsupported('el botón usa rejectLabel como nombre accesible.'),
      style: unsupported(NO_STYLE),
      maskStyleClass: unsupported(NO_STYLE),
      breakpoints: unsupported(NO_STYLE),
      position: unsupported('cb-confirm-dialog aparece centrado.'),
      rtl: unsupported('cb-confirm-dialog sigue la dirección del documento (dir="rtl").'),
      '(onHide)': unsupported('usa accept/reject en confirm() o los eventos (accepted)/(rejected).'),
    },
    child: (child) => (child.name === 'ng-template' ? { todo: NO_TEMPLATE } : null),
    same: ['header', 'message', 'acceptLabel', 'rejectLabel', 'key', 'visible'],
  })),
};

/** `<p-confirmpopup />` → `<cb-confirm-popup service />` (las confirmaciones con `target`). */
export const confirmpopup: ComponentMapping = {
  name: 'confirmpopup',
  entry: '@caribeng/ui/confirmpopup',
  symbol: 'CbConfirmPopup',
  modules: {
    'primeng/confirmpopup': { ConfirmPopupModule: 'CbConfirmPopup', ConfirmPopup: 'CbConfirmPopup' },
  },
  elements: ['p-confirmpopup', 'p-confirmPopup', 'p-confirm-popup'].map((tag) => ({
    tag,
    to: 'cb-confirm-popup',
    finalize: asServiceHost,
    rules: {
      styleClass: styleClass(),
      defaultFocus: drop(),
      appendTo: drop(),
      autoZIndex: drop(),
      baseZIndex: drop(),
      showTransitionOptions: drop(),
      hideTransitionOptions: drop(),
      motionOptions: drop(),
      style: unsupported(NO_STYLE),
    },
    child: (child) => (child.name === 'ng-template' ? { todo: NO_TEMPLATE } : null),
    same: ['key', 'visible'],
  })),
};
