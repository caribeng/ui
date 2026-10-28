import type { AttrRule, Binding, ComponentMapping, ElementRewrite, Restructure, TemplateNode } from './types';
import { drop, event, numeric, rename, renderAttr, styleClass, unsupported } from './rules';

export const paginator: ComponentMapping = {
  name: 'paginator',
  entry: '@caribeng/ui/paginator',
  symbol: 'CbPaginator',
  modules: {
    'primeng/paginator': { Paginator: 'CbPaginator', PaginatorModule: 'CbPaginator' },
  },
  elements: [{
    tag: 'p-paginator',
    to: 'cb-paginator',
    rules: {
      styleClass: styleClass(),
      alwaysShow: drop(),
      showFirstLastIcon: drop(),
      dropdownScrollHeight: drop(),
      currentPageReportTemplate: unsupported('cb-paginator usa su propio texto de reporte; personalízalo con provideCaribeNG({ locale }).'),
      templateLeft: unsupported('cb-paginator no tiene slot de plantilla lateral.'),
      templateRight: unsupported('cb-paginator no tiene slot de plantilla lateral.'),
      showPageLinks: drop(),
      showJumpToPageDropdown: drop(),
      showJumpToPageInput: drop(),
      rows: numeric(),
      totalRecords: numeric(),
      '(onPageChange)': event('pageChange'),
    },
    same: ['first', 'rows', 'rowsPerPageOptions'],
  }],
};

/** `<p-steps [model]="items" [activeIndex]="n">` → `<cb-steps [steps]="items" [activeIndex]="n">`. */
export const steps: ComponentMapping = {
  name: 'steps',
  entry: '@caribeng/ui/steps',
  symbol: 'CbSteps',
  modules: {
    'primeng/steps': { Steps: 'CbSteps', StepsModule: 'CbSteps' },
  },
  elements: [{
    tag: 'p-steps',
    to: 'cb-steps',
    rules: {
      model: rename('steps'),
      styleClass: styleClass(),
      style: drop(),
      readonly: unsupported('cb-steps siempre permite hacer clic en los pasos habilitados.'),
      '(activeIndexChange)': event('activeChange'),
    },
    same: ['activeIndex'],
  }],
};

/** `<p-knob [(ngModel)]="n">` → `<cb-slider [(ngModel)]="n">` (mismo control de rango). */
export const knob: ComponentMapping = {
  name: 'knob',
  entry: '@caribeng/ui/slider',
  symbol: 'CbSlider',
  modules: {
    'primeng/knob': { Knob: 'CbSlider', KnobModule: 'CbSlider' },
  },
  elements: [{
    tag: 'p-knob',
    to: 'cb-slider',
    selfClosing: true,
    rules: {
      valueTemplate: drop(),
      size: drop(),
      strokeWidth: drop(),
    },
    same: ['min', 'max', 'step', 'disabled'],
  }],
};

export const image: ComponentMapping = {
  name: 'image',
  entry: '@caribeng/ui/image',
  symbol: 'CbImage',
  modules: {
    'primeng/image': { Image: 'CbImage', ImageModule: 'CbImage' },
  },
  elements: [{
    tag: 'p-image',
    to: 'cb-image',
    rules: {
      styleClass: styleClass(),
      imageClass: drop(),
      imageStyle: drop(),
      indicatorClass: drop(),
      zoomSrc: drop(),
      '(onShow)': drop(),
      '(onHide)': drop(),
      '(onError)': drop(),
    },
    same: ['src', 'alt', 'width', 'height', 'preview'],
  }],
};

/** Hijos que cuentan (sin el espacio en blanco entre etiquetas). */
function significant(node: TemplateNode): TemplateNode[] {
  return node.children.filter((child) => child.kind !== 'text' || child.inner.trim() !== '');
}

/** `value="1"` / `[value]="1"` → `1`. */
function valueOf(node: TemplateNode): string | undefined {
  return node.bindings.find((b) => b.name === 'value' && (b.kind === 'static' || b.kind === 'property'))?.value.trim();
}

/** Texto del encabezado de un paso, o `null` si tiene marcado (iconos, badges, bloques). */
function headerText(node: TemplateNode): string | null {
  const text = node.inner.trim().replace(/\s+/g, ' ');
  return /[<@]/.test(text) ? null : text;
}

/** Reglas del `<p-stepper>` → `<cb-stepper>`. */
function stepperRules(): Record<string, AttrRule> {
  return {
    value: unsupported('cb-stepper empieza en el primer paso; no expone un índice inicial.'),
    '(valueChange)': unsupported('cb-stepper no emite cambios de paso.'),
    linear: drop(),
    readonly: drop(),
    styleClass: styleClass(),
    style: drop(),
  };
}

/** `<p-step-panel value="1">…</p-step-panel>` → `<cb-step label="…">…</cb-step>`. */
function stepperStep(label: string, disabled: Binding | undefined) {
  return {
    to: 'cb-step',
    rules: { value: drop() },
    finalize: (el: ElementRewrite) => {
      el.attrs.unshift(renderAttr('static', 'label', label));
      if (disabled) el.attrs.push(disabled.source);
    },
  };
}

/**
 * ```html
 * <p-stepper [value]="1">
 *   <p-step-list><p-step value="1">Datos</p-step><p-step value="2">Envío</p-step></p-step-list>
 *   <p-step-panels><p-step-panel value="1">A</p-step-panel><p-step-panel value="2">B</p-step-panel></p-step-panels>
 * </p-stepper>
 * ```
 * → `<cb-stepper><cb-step label="Datos">A</cb-step><cb-step label="Envío">B</cb-step></cb-stepper>`
 */
function restructureStepper(node: TemplateNode, r: Restructure): string | null {
  const parts = significant(node);
  const list = parts.find((part) => part.name === 'p-step-list');
  const panelsWrapper = parts.find((part) => part.name === 'p-step-panels');
  if (!list || !panelsWrapper || parts.length !== 2) return 'p-stepper sin la estructura p-step-list + p-step-panels; migra a <cb-stepper> con un <cb-step label="…"> por paso.';
  const steps = significant(list);
  const panels = significant(panelsWrapper);
  if ([...steps, ...panels].some((n) => n.kind !== 'element' || !['p-step', 'p-step-panel'].includes(n.name))) {
    return 'los pasos se generan con @for/@if o tienen elementos extra; migra a <cb-stepper> con un <cb-step label="…"> por paso.';
  }
  const headers = new Map(steps.map((step) => [valueOf(step), step]));
  if (headers.has(undefined) || headers.size !== steps.length || panels.length !== steps.length) {
    return 'los pasos y los paneles no se pueden emparejar por value; migra a <cb-stepper> con un <cb-step label="…"> por paso.';
  }
  const pairs: [TemplateNode, string, Binding | undefined][] = [];
  for (const panel of panels) {
    const step = headers.get(valueOf(panel));
    if (!step) return `el p-step-panel con value ${valueOf(panel)} no tiene p-step; migra a <cb-stepper> a mano.`;
    const label = headerText(step);
    if (label === null) return 'un paso tiene marcado (icono, badge…) y cb-step solo admite texto en label; migra a <cb-stepper> a mano.';
    pairs.push([panel, label, step.bindings.find((b) => b.name === 'disabled')]);
  }

  r.convert(node, { to: 'cb-stepper', rules: stepperRules() });
  r.remove(list);
  r.unwrap(panelsWrapper);
  for (const [panel, label, disabled] of pairs) r.convert(panel, stepperStep(label, disabled));
  return null;
}

/** `<p-stepper [value]="1">…</p-stepper>` → `<cb-stepper>…</cb-stepper>` con un `<cb-step>` por paso. */
export const stepper: ComponentMapping = {
  name: 'stepper',
  entry: '@caribeng/ui/stepper',
  symbol: 'CbStepper',
  tags: { 'cb-step': 'CbStep' },
  modules: {
    'primeng/stepper': { Stepper: 'CbStepper', StepperModule: 'CbStepper', StepList: 'CbStepper', StepPanels: 'CbStepper', Step: 'CbStep', StepPanel: 'CbStep' },
  },
  // Los sub-elementos (p-step-list, p-step, p-step-panels, p-step-panel) no se
  // registran: solo existen dentro de <p-stepper> y la reestructuración los consume.
  elements: [{ tag: 'p-stepper', to: 'cb-stepper', rules: {}, restructure: restructureStepper }],
};
