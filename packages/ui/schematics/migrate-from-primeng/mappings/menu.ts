import * as ts from 'typescript';
import { parsePrimeIcon } from '../icons';
import { TODO_MARK } from '../todo';
import { SEVERITY_VALUES, SIZE_VALUES, adaptEvent, drop, event, flagToValue, iconName, renderAttr, styleClass, unsupported, values } from './rules';
import { propertyName } from './service-calls';
import type { AttrRule, ComponentMapping, ElementRewrite, SourceEdit, SourceRewriter } from './types';

type ItemType = { readonly name: string; readonly entry: string };

/** Tipo de item de cada menú CaribeNG, según el tag PrimeNG que recibe el array en `[model]`. */
const ITEM_TYPES = new Map<string, ItemType>();
const itemType = (tags: readonly string[], name: string, entry: string) => tags.forEach((tag) => ITEM_TYPES.set(tag, { name, entry }));
itemType(['p-menu', 'p-splitbutton', 'p-splitButton', 'p-split-button'], 'CbMenuItem', '@caribeng/ui/menu');
itemType(['p-menubar'], 'CbMenubarItem', '@caribeng/ui/menubar');
itemType(['p-tieredmenu', 'p-tieredMenu', 'p-tiered-menu'], 'CbTieredMenuItem', '@caribeng/ui/tieredmenu');
itemType(['p-panelmenu', 'p-panelMenu', 'p-panel-menu'], 'CbPanelMenuItem', '@caribeng/ui/panelmenu');
itemType(['p-breadcrumb'], 'CbBreadcrumbItem', '@caribeng/ui/breadcrumb');
itemType(['p-tabmenu', 'p-tabMenu'], 'CbTabMenuItem', '@caribeng/ui/tabmenu');
itemType(['p-steps'], 'CbStepItem', '@caribeng/ui/steps');

/** Tipos de item que admiten `separator` (y en los que `label` es obligatorio también en los separadores). */
const WITH_SEPARATORS = new Set(['CbMenuItem', 'CbTieredMenuItem', 'CbContextMenuItem']);

/** Para un `MenuItem` cuyo menú no se conoce (p. ej. lo devuelve un servicio): el tipo más completo. */
const FALLBACK: ItemType = { name: 'CbMenubarItem', entry: '@caribeng/ui/menubar' };


/** Campos de `MenuItem` sin equivalente en los items de CaribeNG. */
const DROPPED_FIELDS = new Set([
  'expanded',
  'styleClass',
  'style',
  'badge',
  'badgeStyleClass',
  'tooltip',
  'tooltipPosition',
  'tooltipOptions',
  'id',
  'title',
  'automationId',
  'tabindex',
  'iconClass',
  'iconStyle',
  'escape',
  'data',
  'shortcut',
  'queryParams',
  'fragment',
  'state',
  'queryParamsHandling',
  'preserveFragment',
  'skipLocationChange',
  'replaceUrl',
  'routerLinkActiveOptions',
]);

/** `[model]="items"` / `[home]="inicio"` en las plantillas → nombre de la propiedad → tipo de item. */
function propertyTypes(templates: readonly string[]): Map<string, ItemType> {
  const types = new Map<string, ItemType>();
  for (const template of templates) {
    for (const [, tag, attrs] of template.matchAll(/<(p-[A-Za-z-]+)\b([^>]*)>/g)) {
      const type = ITEM_TYPES.get(tag);
      if (!type) continue;
      for (const [, input, name] of attrs.matchAll(/\[(model|home)\]\s*=\s*"\s*(?:this\.)?([A-Za-z_$][\w$]*)(?:\(\))?\s*"/g)) {
        types.set(name, input === 'home' ? ITEM_TYPES.get('p-breadcrumb')! : type);
      }
    }
  }
  return types;
}

/** Nombre de la declaración (propiedad, variable, parámetro, método) que contiene `node`. */
function declarationName(node: ts.Node): string | undefined {
  for (let current: ts.Node | undefined = node; current; current = current.parent) {
    if (
      (ts.isPropertyDeclaration(current) || ts.isVariableDeclaration(current) || ts.isParameter(current) || ts.isGetAccessorDeclaration(current)) &&
      ts.isIdentifier(current.name)
    ) {
      return current.name.text;
    }
  }
  return undefined;
}

/** Rango para quitar las propiedades `removed` de un objeto literal sin dejar comas sueltas. */
function removalEdits(sf: ts.SourceFile, object: ts.ObjectLiteralExpression, removed: ReadonlySet<number>): SourceEdit[] {
  const props = object.properties;
  const lastKept = [...props.keys()].filter((i) => !removed.has(i)).pop() ?? -1;
  const edits: SourceEdit[] = [];
  for (const i of removed) {
    if (i < lastKept) edits.push({ start: props[i].getStart(sf), end: props[i + 1].getStart(sf), text: '' });
  }
  // Las del final (detrás de la última que se queda) se quitan junto con la coma que las precede.
  const tail = [...removed].filter((i) => i > lastKept);
  if (tail.length) {
    const start = lastKept >= 0 ? props[lastKept].getEnd() : props[Math.min(...tail)].getStart(sf);
    edits.push({ start, end: props[Math.max(...tail)].getEnd(), text: '' });
  }
  return edits;
}

/**
 * `{ label: 'Nuevo', icon: 'pi pi-plus', routerLink: '/nuevo', badge: '2', command: () => … }`
 * → `{ label: 'Nuevo', icon: 'plus', url: '/nuevo', command: () => … }` (+ aviso por `badge`).
 */
function rewriteItem(sf: ts.SourceFile, item: ts.ObjectLiteralExpression, type: ItemType, icons: Set<string>, edits: SourceEdit[]): void {
  const todos: string[] = [];
  const removed = new Set<number>();
  const hasUrl = item.properties.some((p) => propertyName(p) === 'url');
  const separator = item.properties.some(
    (p) => propertyName(p) === 'separator' && ts.isPropertyAssignment(p) && p.initializer.kind === ts.SyntaxKind.TrueKeyword,
  );
  if (separator && !WITH_SEPARATORS.has(type.name)) {
    todos.push(`${type.name} no admite separadores; quita este item.`);
  } else if (separator && !item.properties.some((p) => propertyName(p) === 'label')) {
    // En CaribeNG label es obligatorio también en los separadores.
    const first = item.properties[0];
    edits.push({ start: first.getStart(sf), end: first.getStart(sf), text: "label: '', " });
  }
  item.properties.forEach((property, i) => {
    const name = propertyName(property);
    if (!name || !ts.isPropertyAssignment(property)) return;
    const value = property.initializer;
    if (name === 'icon') {
      const parsed = ts.isStringLiteralLike(value) ? parsePrimeIcon(value.text) : null;
      if (parsed?.name) {
        edits.push({ start: value.getStart(sf), end: value.getEnd(), text: `'${parsed.name}'` });
        icons.add(parsed.name);
      } else if (ts.isStringLiteralLike(value) && parsed) {
        todos.push(`icon: pi-${parsed.prime} no tiene equivalente conocido; usa un nombre de @caribeng/ui/icon.`);
      } else if (!ts.isStringLiteralLike(value)) {
        todos.push('icon recibe el nombre de un icono de CaribeNG ("plus"), no clases "pi pi-plus".');
      }
    } else if (name === 'routerLink') {
      const single = ts.isArrayLiteralExpression(value) && value.elements.length === 1 ? value.elements[0] : value;
      if (!hasUrl && ts.isStringLiteralLike(single)) {
        edits.push({ start: property.getStart(sf), end: property.getEnd(), text: `url: '${single.text}'` });
      } else {
        removed.add(i);
        todos.push(`${property.getText(sf)} — los menús de CaribeNG navegan con url (recarga la página); para el router usa command: () => this.router.navigate(…).`);
      }
    } else if (DROPPED_FIELDS.has(name)) {
      removed.add(i);
      todos.push(`${property.getText(sf)} — los items de menú de CaribeNG no tienen este campo.`);
    }
  });
  edits.push(...removalEdits(sf, item, removed));
  if (todos.length) {
    const start = item.getStart(sf);
    edits.push({ start, end: start, text: todos.map((t) => `/* ${TODO_MARK}: ${t} */ `).join('') });
  }
}

/** Items de menú: objetos literales que son elementos de un array dentro de `node`. */
function rewriteItems(sf: ts.SourceFile, node: ts.Node, type: ItemType, icons: Set<string>, edits: SourceEdit[]): void {
  const visit = (current: ts.Node): void => {
    if (ts.isArrayLiteralExpression(current)) {
      for (const element of current.elements) if (ts.isObjectLiteralExpression(element)) rewriteItem(sf, element, type, icons, edits);
    }
    ts.forEachChild(current, visit);
  };
  visit(node);
}

/**
 * `MenuItem` (primeng/api) → el tipo de item del menú CaribeNG que lo recibe,
 * deducido de la plantilla (`<p-menubar [model]="items">` → `CbMenubarItem`),
 * y traducción de los arrays de items (`icon`, `routerLink`, campos sin equivalente).
 */
const rewriteMenuItems: SourceRewriter = (sf, context, edits) => {
  const local = context.locals.get('MenuItem');
  if (!local) return;
  context.consume('MenuItem');
  const types = propertyTypes(context.templates);
  // Propiedad con MenuItem → tipo de item que se le asignó.
  const menuProperties = new Map<string, ItemType>();
  let fallbackNoted = false;

  const visitTypes = (node: ts.Node): void => {
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName) && node.typeName.text === local) {
      const owner = declarationName(node);
      const type = (owner && types.get(owner)) || FALLBACK;
      if (owner) menuProperties.set(owner, type);
      context.addImport(type.name, type.entry);
      const note =
        type === FALLBACK && !fallbackNoted
          ? `/* ${TODO_MARK}: no se encontró en la plantilla qué menú recibe este MenuItem; ${FALLBACK.name} sirve para menubar, pero usa el tipo del menú que lo reciba (CbMenuItem, CbTieredMenuItem…). */ `
          : '';
      if (note) fallbackNoted = true;
      edits.push({ start: node.typeName.getStart(sf), end: node.typeName.getEnd(), text: note + type.name });
    }
    ts.forEachChild(node, visitTypes);
  };
  visitTypes(sf);

  // Arrays de items: el inicializador de las propiedades tipadas con MenuItem y las asignaciones `this.items = [...]`.
  const visitValues = (node: ts.Node): void => {
    if ((ts.isPropertyDeclaration(node) || ts.isVariableDeclaration(node)) && ts.isIdentifier(node.name) && menuProperties.has(node.name.text) && node.initializer) {
      rewriteItems(sf, node.initializer, menuProperties.get(node.name.text)!, context.icons, edits);
      return;
    }
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isPropertyAccessExpression(node.left) &&
      node.left.expression.kind === ts.SyntaxKind.ThisKeyword &&
      menuProperties.has(node.left.name.text)
    ) {
      rewriteItems(sf, node.right, menuProperties.get(node.left.name.text)!, context.icons, edits);
      return;
    }
    ts.forEachChild(node, visitValues);
  };
  visitValues(sf);
};

/** `[model]` → `[items]`. */
const model: AttrRule = (binding, el) => el.attrs.push(renderAttr(binding.kind, 'items', binding.value));

const OVERLAY: Record<string, AttrRule> = {
  appendTo: drop(),
  autoZIndex: drop(),
  baseZIndex: drop(),
  showTransitionOptions: drop(),
  hideTransitionOptions: drop(),
  motionOptions: drop(),
  transitionOptions: drop(),
};

const NO_TEMPLATES = (tag: string) => (child: { name: string }) => (child.name === 'ng-template' ? { todo: `${tag} no admite plantillas personalizadas; el contenido no se mostrará.` } : null);

const COMMON: Record<string, AttrRule> = {
  model,
  styleClass: styleClass(),
  style: unsupported('personaliza el menú con los tokens CSS de CaribeNG.'),
  ariaLabelledBy: unsupported('usa ariaLabel.'),
  tabindex: unsupported('el menú gestiona su propio orden de foco.'),
  ...OVERLAY,
};

/** `<p-menu [model]="items" [popup]="true" #menu />` → `<cb-menu [items]="items" #menu />`. */
export const menu: ComponentMapping = {
  name: 'menu',
  entry: '@caribeng/ui/menu',
  symbol: 'CbMenu',
  modules: {
    'primeng/menu': { MenuModule: 'CbMenu', Menu: 'CbMenu' },
    'primeng/api': { MenuItemCommandEvent: { name: 'CbMenuCommandEvent', entry: '@caribeng/ui' } },
  },
  rewriteSource: rewriteMenuItems,
  elements: [
    {
      tag: 'p-menu',
      to: 'cb-menu',
      rules: {
        ...COMMON,
        popup: (binding, el) => {
          if (binding.kind === 'static' ? binding.value === 'false' : binding.value.trim() !== 'true') {
            el.todos.push(`${binding.source} — cb-menu siempre es emergente: ábrelo con (click)="menu.toggle($event)".`);
          }
        },
        '(onHide)': event('hidden'),
        '(onShow)': unsupported('cb-menu no emite la apertura.'),
        '(onFocus)': unsupported('cb-menu no emite el foco.'),
        '(onBlur)': unsupported('cb-menu no emite el foco.'),
      },
      finalize: (el: ElementRewrite) => {
        if (!el.find('popup')) el.todos.push('p-menu sin [popup]="true" era un menú fijo; cb-menu es emergente (ábrelo con (click)="menu.toggle($event)") o usa cb-panelmenu.');
      },
      child: NO_TEMPLATES('cb-menu'),
      same: ['ariaLabel'],
    },
  ],
};

export const menubar: ComponentMapping = {
  name: 'menubar',
  entry: '@caribeng/ui/menubar',
  symbol: 'CbMenubar',
  modules: { 'primeng/menubar': { MenubarModule: 'CbMenubar', Menubar: 'CbMenubar' } },
  elements: [
    {
      tag: 'p-menubar',
      to: 'cb-menubar',
      rules: {
        ...COMMON,
        autoDisplay: drop(),
        autoHide: drop(),
        autoHideDelay: drop(),
        breakpoint: unsupported('cb-menubar se adapta solo a pantallas pequeñas.'),
        '(onFocus)': unsupported('cb-menubar no emite el foco.'),
        '(onBlur)': unsupported('cb-menubar no emite el foco.'),
      },
      child: (child) =>
        child.name === 'ng-template' ? { todo: 'cb-menubar no tiene zonas #start/#end ni plantillas de item; pon el logo y las acciones fuera, junto al menú.' } : null,
      same: ['ariaLabel'],
    },
  ],
};

export const tieredmenu: ComponentMapping = {
  name: 'tieredmenu',
  entry: '@caribeng/ui/tieredmenu',
  symbol: 'CbTieredMenu',
  modules: { 'primeng/tieredmenu': { TieredMenuModule: 'CbTieredMenu', TieredMenu: 'CbTieredMenu' } },
  elements: ['p-tieredmenu', 'p-tieredMenu', 'p-tiered-menu'].map((tag) => ({
    tag,
    to: 'cb-tieredmenu',
    rules: {
      ...COMMON,
      popup: drop(),
      autoDisplay: drop(),
      breakpoint: unsupported('cb-tieredmenu se adapta solo a pantallas pequeñas.'),
      disabled: unsupported('deshabilita los items con disabled.'),
      '(onShow)': unsupported('cb-tieredmenu no emite la apertura.'),
      '(onHide)': unsupported('cb-tieredmenu no emite el cierre.'),
    },
    finalize: (el: ElementRewrite) => {
      el.todos.push('cb-tieredmenu muestra su propio botón de apertura (texto en triggerLabel); si lo abrías con otro botón, quítalo.');
    },
    child: NO_TEMPLATES('cb-tieredmenu'),
    same: ['ariaLabel'],
  })),
};

export const panelmenu: ComponentMapping = {
  name: 'panelmenu',
  entry: '@caribeng/ui/panelmenu',
  symbol: 'CbPanelMenu',
  modules: { 'primeng/panelmenu': { PanelMenuModule: 'CbPanelMenu', PanelMenu: 'CbPanelMenu' } },
  elements: ['p-panelmenu', 'p-panelMenu', 'p-panel-menu'].map((tag) => ({
    tag,
    to: 'cb-panelmenu',
    rules: COMMON,
    child: NO_TEMPLATES('cb-panelmenu'),
    same: ['multiple'],
  })),
};

/** `[home]` + `[model]` de PrimeNG → un solo `[items]` con el inicio delante. */
function breadcrumbItems(el: ElementRewrite): void {
  const home = el.find('home');
  const items = el.find('model');
  if (!home) {
    if (items) el.attrs.unshift(renderAttr(items.kind, 'items', items.value));
    return;
  }
  const list = items ? `[${home.value}, ...${items.value}]` : `[${home.value}]`;
  el.attrs.unshift(renderAttr('property', 'items', list));
}

export const breadcrumb: ComponentMapping = {
  name: 'breadcrumb',
  entry: '@caribeng/ui/breadcrumb',
  symbol: 'CbBreadcrumb',
  modules: { 'primeng/breadcrumb': { BreadcrumbModule: 'CbBreadcrumb', Breadcrumb: 'CbBreadcrumb' } },
  elements: [
    {
      tag: 'p-breadcrumb',
      to: 'cb-breadcrumb',
      rules: {
        ...COMMON,
        // Se combinan en finalize.
        model: drop(),
        home: drop(),
        homeAriaLabel: unsupported('el inicio usa su label como nombre accesible.'),
        '(onItemClick)': event('itemClick', adaptEvent('item')),
      },
      finalize: breadcrumbItems,
      child: (child) => (child.name === 'ng-template' ? { todo: 'cb-breadcrumb no admite plantillas; el separador se cambia con el input separator (nombre de icono).' } : null),
    },
  ],
};

export const tabmenu: ComponentMapping = {
  name: 'tabmenu',
  entry: '@caribeng/ui/tabmenu',
  symbol: 'CbTabMenu',
  modules: { 'primeng/tabmenu': { TabMenuModule: 'CbTabMenu', TabMenu: 'CbTabMenu' } },
  elements: ['p-tabmenu', 'p-tabMenu'].map((tag) => ({
    tag,
    to: 'cb-tabmenu',
    rules: {
      ...COMMON,
      activeItem: unsupported('cb-tabmenu marca la pestaña activa con [(activeIndex)] (posición).'),
      '(activeItemChange)': unsupported('usa (activeIndexChange) o (itemSelect).'),
      scrollable: drop(),
    },
    child: NO_TEMPLATES('cb-tabmenu'),
    same: ['activeIndex', 'ariaLabel'],
  })),
};

/** `<p-splitbutton label="Guardar" icon="pi pi-check" [model]="mas" (onClick)="guardar()" />`. */
export const splitbutton: ComponentMapping = {
  name: 'splitbutton',
  entry: '@caribeng/ui/splitbutton',
  symbol: 'CbSplitButton',
  modules: { 'primeng/splitbutton': { SplitButtonModule: 'CbSplitButton', SplitButton: 'CbSplitButton' } },
  elements: ['p-splitbutton', 'p-splitButton', 'p-split-button'].map((tag) => ({
    tag,
    to: 'cb-split-button',
    rules: {
      model,
      icon: iconName(),
      severity: values('severity', SEVERITY_VALUES),
      size: values('size', SIZE_VALUES),
      outlined: flagToValue('variant', 'outlined', 'solid'),
      text: flagToValue('variant', 'text', 'solid'),
      expandAriaLabel: (binding, el) => el.attrs.push(renderAttr(binding.kind, 'menuAriaLabel', binding.value)),
      styleClass: styleClass(),
      raised: unsupported('cb-split-button no tiene variante elevada.'),
      rounded: unsupported('cb-split-button no tiene variante redondeada.'),
      plain: unsupported('usa severity="secondary".'),
      iconPos: unsupported('cb-split-button muestra el icono delante del texto.'),
      tooltip: unsupported('usa la directiva cbTooltip de @caribeng/ui/tooltip.'),
      tooltipOptions: unsupported('usa la directiva cbTooltip de @caribeng/ui/tooltip.'),
      menuStyle: unsupported('personaliza el menú con los tokens CSS de CaribeNG.'),
      menuStyleClass: unsupported('personaliza el menú con los tokens CSS de CaribeNG.'),
      dropdownIcon: unsupported('cb-split-button usa su propio icono.'),
      buttonProps: unsupported('pasa cada propiedad como input de cb-split-button.'),
      menuButtonProps: unsupported('pasa cada propiedad como input de cb-split-button.'),
      buttonDisabled: unsupported('usa disabled (deshabilita los dos botones).'),
      menuButtonDisabled: unsupported('usa disabled o deshabilita los items.'),
      autofocus: unsupported('usa la directiva cbAutoFocus de @caribeng/ui/autofocus.'),
      tabindex: unsupported('el tabindex no se reenvía a los botones internos.'),
      dir: drop(),
      ...OVERLAY,
      '(onClick)': event('primaryClick'),
      '(onDropdownClick)': unsupported('cb-split-button no emite la apertura del menú.'),
      '(onMenuShow)': unsupported('cb-split-button no emite la apertura del menú.'),
      '(onMenuHide)': unsupported('cb-split-button no emite el cierre del menú.'),
    },
    child: NO_TEMPLATES('cb-split-button'),
    same: ['label', 'disabled', 'loading'],
  })),
};

/**
 * PrimeNG ancla el menú contextual a otro elemento (`[target]`) o a toda la
 * página (`[global]`); cb-contextmenu envuelve el área sobre la que se abre.
 */
export const contextmenu: ComponentMapping = {
  name: 'contextmenu',
  entry: '@caribeng/ui/contextmenu',
  symbol: 'CbContextMenu',
  modules: {},
  elements: ['p-contextmenu', 'p-contextMenu', 'p-context-menu'].map((tag) => ({
    tag,
    to: 'cb-contextmenu',
    manual:
      'envuelve el área con <cb-contextmenu [items]="…" (itemSelect)="…"> … </cb-contextmenu> (se abre con clic derecho sobre su contenido); importa CbContextMenu de @caribeng/ui/contextmenu.',
    rules: {},
  })),
};
