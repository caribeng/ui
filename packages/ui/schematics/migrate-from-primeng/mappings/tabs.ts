import { drop, rename, renderAttr, styleClass, unsupported } from './rules';
import type { AttrRule, Binding, ComponentMapping, ElementRewrite, Restructure, TemplateNode } from './types';

/** Hijos que cuentan (sin el espacio en blanco entre etiquetas). */
function significant(node: TemplateNode): TemplateNode[] {
  return node.children.filter((child) => child.kind !== 'text' || child.inner.trim() !== '');
}

/** `value="0"` / `[value]="0"` → `0`. */
function valueOf(node: TemplateNode): string | undefined {
  return node.bindings.find((b) => b.name === 'value' && (b.kind === 'static' || b.kind === 'property'))?.value.trim();
}

/** Texto de una cabecera, o `null` si tiene marcado (iconos, badges, bloques). */
function headerText(node: TemplateNode): string | null {
  const text = node.inner.trim().replace(/\s+/g, ' ');
  return /[<@]/.test(text) ? null : text;
}

/** El primer elemento hijo con uno de estos tags. */
function childNamed(node: TemplateNode, names: readonly string[]): TemplateNode | undefined {
  return node.children.find((child) => child.kind === 'element' && names.includes(child.name));
}

const NO_ACTIVE = 'cb-tabs no expone la pestaña activa (empieza en la primera).';

/** Atributos de `p-tabs` / `p-tabView`. */
function tabsRules(firstValue?: string): Record<string, AttrRule> {
  return {
    value: (binding, el) => {
      if (!(binding.kind === 'static' && binding.value.trim() === firstValue)) el.todos.push(`${binding.source} — ${NO_ACTIVE}`);
    },
    activeIndex: (binding, el) => {
      if (!(binding.kind !== 'event' && binding.value.trim() === '0')) el.todos.push(`${binding.source} — ${NO_ACTIVE}`);
    },
    '(valueChange)': unsupported(NO_ACTIVE),
    '(activeIndexChange)': unsupported(NO_ACTIVE),
    '(onChange)': unsupported(NO_ACTIVE),
    '(onClose)': unsupported('las pestañas de cb-tabs no se cierran.'),
    styleClass: styleClass(),
    style: unsupported('personaliza las pestañas con los tokens CSS de CaribeNG.'),
    scrollable: drop(),
    lazy: drop(),
    selectOnFocus: drop(),
    showNavigators: drop(),
    tabindex: drop(),
  };
}

/** `[disabled]` de la pestaña (p-tab) pasa al cb-tab. */
function tabPanel(label: string, disabled: Binding | undefined) {
  return {
    to: 'cb-tab',
    rules: { value: drop() },
    finalize: (el: ElementRewrite) => {
      el.attrs.unshift(renderAttr('static', 'label', label));
      if (disabled) el.attrs.push(disabled.source);
    },
  };
}

/**
 * ```html
 * <p-tabs value="0">
 *   <p-tablist><p-tab value="0">Resumen</p-tab><p-tab value="1">Detalle</p-tab></p-tablist>
 *   <p-tabpanels><p-tabpanel value="0">A</p-tabpanel><p-tabpanel value="1">B</p-tabpanel></p-tabpanels>
 * </p-tabs>
 * ```
 * → `<cb-tabs><cb-tab label="Resumen">A</cb-tab><cb-tab label="Detalle">B</cb-tab></cb-tabs>`
 */
function restructureTabs(node: TemplateNode, r: Restructure): string | null {
  const parts = significant(node);
  const list = parts.find((p) => p.name === 'p-tablist');
  const panelsWrapper = parts.find((p) => p.name === 'p-tabpanels');
  if (!list || !panelsWrapper || parts.length !== 2) return 'p-tabs sin la estructura p-tablist + p-tabpanels; migra a <cb-tabs> con un <cb-tab label="…"> por panel.';
  const tabs = significant(list);
  const panels = significant(panelsWrapper);
  if ([...tabs, ...panels].some((n) => n.kind !== 'element' || !['p-tab', 'p-tabpanel'].includes(n.name))) {
    return 'las pestañas se generan con @for/@if o tienen elementos extra; migra a <cb-tabs> con un <cb-tab label="…"> por panel.';
  }
  const headers = new Map(tabs.map((tab) => [valueOf(tab), tab]));
  if (headers.has(undefined) || headers.size !== tabs.length || panels.length !== tabs.length) {
    return 'las pestañas y los paneles no se pueden emparejar por value; migra a <cb-tabs> con un <cb-tab label="…"> por panel.';
  }
  const pairs: [TemplateNode, string, Binding | undefined][] = [];
  for (const panel of panels) {
    const tab = headers.get(valueOf(panel));
    if (!tab) return `el p-tabpanel con value ${valueOf(panel)} no tiene p-tab; migra a <cb-tabs> a mano.`;
    const label = headerText(tab);
    if (label === null) return 'una cabecera tiene marcado (icono, badge…) y cb-tab solo admite texto en label; migra a <cb-tabs> a mano.';
    pairs.push([panel, label, tab.bindings.find((b) => b.name === 'disabled')]);
  }

  r.convert(node, { to: 'cb-tabs', rules: tabsRules(valueOf(tabs[0])) });
  r.remove(list);
  r.unwrap(panelsWrapper);
  for (const [panel, label, disabled] of pairs) r.convert(panel, tabPanel(label, disabled));
  return null;
}

const TAB_PANEL_V17: Record<string, AttrRule> = {
  header: rename('label'),
  closable: unsupported('las pestañas de cb-tabs no se cierran.'),
  leftIcon: unsupported('cb-tab solo admite texto en label.'),
  rightIcon: unsupported('cb-tab solo admite texto en label.'),
  tooltip: unsupported('usa la directiva cbTooltip de @caribeng/ui/tooltip.'),
  tooltipPosition: unsupported('usa la directiva cbTooltip de @caribeng/ui/tooltip.'),
  tooltipStyleClass: unsupported('usa la directiva cbTooltip de @caribeng/ui/tooltip.'),
  headerStyle: unsupported('personaliza las pestañas con los tokens CSS de CaribeNG.'),
  headerStyleClass: unsupported('personaliza las pestañas con los tokens CSS de CaribeNG.'),
  cache: drop(),
  selected: unsupported(NO_ACTIVE),
};

export const tabs: ComponentMapping = {
  name: 'tabs',
  entry: '@caribeng/ui/tabs',
  symbol: 'CbTabs',
  tags: { 'cb-tab': 'CbTab' },
  modules: {
    'primeng/tabs': { TabsModule: 'CbTabs', Tabs: 'CbTabs', TabList: 'CbTabs', TabPanels: 'CbTabs', Tab: 'CbTab', TabPanel: 'CbTab' },
    // PrimeNG < 18.
    'primeng/tabview': { TabViewModule: 'CbTabs', TabView: 'CbTabs', TabPanel: 'CbTab' },
  },
  elements: [
    { tag: 'p-tabs', to: 'cb-tabs', rules: {}, restructure: restructureTabs },
    ...['p-tabView', 'p-tabview'].map((tag) => ({ tag, to: 'cb-tabs', rules: tabsRules() })),
    {
      tag: 'p-tabPanel',
      to: 'cb-tab',
      symbol: 'CbTab',
      rules: TAB_PANEL_V17,
      child: (child) => (child.name === 'ng-template' ? { todo: 'cb-tab solo admite texto en label; la cabecera personalizada no se mostrará.' } : null),
      same: ['disabled'],
    },
  ],
};

const NO_OPEN = 'cb-accordion empieza con los paneles cerrados y no expone cuál está abierto.';

/**
 * ```html
 * <p-accordion-panel value="0">
 *   <p-accordion-header>Envío</p-accordion-header>
 *   <p-accordion-content>…</p-accordion-content>
 * </p-accordion-panel>
 * ```
 * → `<cb-accordion-panel header="Envío">…</cb-accordion-panel>`
 */
function restructurePanel(node: TemplateNode, r: Restructure): string | null {
  const headerChild = childNamed(node, ['p-accordion-header', 'p-accordionheader']);
  const content = childNamed(node, ['p-accordion-content', 'p-accordioncontent']);

  if (!headerChild) {
    // PrimeNG 19+ shorthand: header as attribute, content is direct children (no sub-elements)
    const hasHeaderAttr = node.bindings.some((b) => b.name === 'header' && b.kind === 'static');
    if (hasHeaderAttr) {
      r.convert(node, { to: 'cb-accordion-panel', rules: { value: drop() } });
      if (content) r.unwrap(content);
      return null;
    }
    return 'panel sin p-accordion-header y p-accordion-content; migra a <cb-accordion-panel header="…"> a mano.';
  }

  if (!content) return 'panel sin p-accordion-content; migra a <cb-accordion-panel header="…"> a mano.';
  const text = headerText(headerChild);
  if (text === null) return 'la cabecera tiene marcado (icono, badge…) y cb-accordion-panel solo admite texto en header; migra a mano.';
  r.convert(node, {
    to: 'cb-accordion-panel',
    rules: { value: drop() },
    finalize: (el) => el.attrs.unshift(renderAttr('static', 'header', text)),
  });
  r.remove(headerChild);
  r.unwrap(content);
  return null;
}

export const accordion: ComponentMapping = {
  name: 'accordion',
  entry: '@caribeng/ui/accordion',
  symbol: 'CbAccordion',
  modules: {
    'primeng/accordion': {
      AccordionModule: 'CbAccordion',
      Accordion: 'CbAccordion',
      AccordionPanel: 'CbAccordionPanel',
      AccordionHeader: 'CbAccordionPanel',
      AccordionContent: 'CbAccordionPanel',
      // PrimeNG < 18.
      AccordionTab: 'CbAccordionPanel',
    },
  },
  elements: [
    {
      tag: 'p-accordion',
      to: 'cb-accordion',
      rules: {
        value: unsupported(NO_OPEN),
        activeIndex: unsupported(NO_OPEN),
        '(valueChange)': unsupported(NO_OPEN),
        '(activeIndexChange)': unsupported(NO_OPEN),
        '(onOpen)': unsupported(NO_OPEN),
        '(onClose)': unsupported(NO_OPEN),
        expandIcon: unsupported('cb-accordion usa su propio icono.'),
        collapseIcon: unsupported('cb-accordion usa su propio icono.'),
        styleClass: styleClass(),
        style: unsupported('personaliza el acordeón con los tokens CSS de CaribeNG.'),
        selectOnFocus: drop(),
        transitionOptions: drop(),
        motionOptions: drop(),
      },
      same: ['multiple'],
    },
    ...['p-accordion-panel', 'p-accordionpanel'].map((tag) => ({
      tag,
      to: 'cb-accordion-panel',
      symbol: 'CbAccordionPanel',
      rules: {},
      restructure: restructurePanel,
    })),
    {
      tag: 'p-accordionTab',
      to: 'cb-accordion-panel',
      symbol: 'CbAccordionPanel',
      rules: {
        selected: unsupported(NO_OPEN),
        '(selectedChange)': unsupported(NO_OPEN),
        headerStyle: unsupported('personaliza el acordeón con los tokens CSS de CaribeNG.'),
        headerStyleClass: unsupported('personaliza el acordeón con los tokens CSS de CaribeNG.'),
        contentStyle: unsupported('personaliza el acordeón con los tokens CSS de CaribeNG.'),
        contentStyleClass: unsupported('personaliza el acordeón con los tokens CSS de CaribeNG.'),
        cache: drop(),
        transitionOptions: drop(),
        iconPos: unsupported('cb-accordion-panel coloca su icono a la derecha.'),
      },
      child: (child) => (child.name === 'ng-template' ? { todo: 'cb-accordion-panel solo admite texto en header; la cabecera personalizada no se mostrará.' } : null),
      same: ['header', 'disabled'],
    },
  ],
};
