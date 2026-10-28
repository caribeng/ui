import type { ComponentMapping } from './types';
import { drop, event, numeric, styleClass, unsupported } from './rules';

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

/** p-steps no tiene equivalente directo en CaribeNG; se deja como TODO. */
export const steps: ComponentMapping = {
  name: 'steps',
  entry: '@caribeng/ui/steps',
  symbol: 'CbSteps',
  modules: {},
  elements: [{
    tag: 'p-steps',
    to: 'p-steps',
    manual: 'no hay equivalente en CaribeNG para <p-steps>; migra a un componente de navegación paso a paso personalizado.',
    rules: {},
  }],
};

/** p-knob no tiene equivalente directo en CaribeNG; se deja como TODO. */
export const knob: ComponentMapping = {
  name: 'knob',
  entry: '@caribeng/ui/slider',
  symbol: 'CbSlider',
  modules: {},
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

/** p-stepper (PrimeNG v19) no tiene equivalente en CaribeNG; sus sub-elementos se marcan también como manuales. */
export const stepper: ComponentMapping = {
  name: 'stepper',
  entry: '@caribeng/ui/stepper',
  symbol: 'CbStepper',
  modules: {},
  elements: [
    {
      tag: 'p-stepper',
      to: 'p-stepper',
      manual: 'no hay equivalente en CaribeNG para <p-stepper>; migra a un stepper personalizado.',
      rules: {},
    },
    {
      tag: 'p-step-list',
      to: 'p-step-list',
      manual: 'no hay equivalente en CaribeNG para <p-step-list>.',
      rules: {},
    },
    {
      tag: 'p-step',
      to: 'p-step',
      manual: 'no hay equivalente en CaribeNG para <p-step>.',
      rules: {},
    },
    {
      tag: 'p-step-panels',
      to: 'p-step-panels',
      manual: 'no hay equivalente en CaribeNG para <p-step-panels>.',
      rules: {},
    },
    {
      tag: 'p-step-panel',
      to: 'p-step-panel',
      manual: 'no hay equivalente en CaribeNG para <p-step-panel>.',
      rules: {},
    },
  ],
};
