import { drop, event, iconName, numeric, styleClass, unsupported } from './rules';
import type { ComponentMapping } from './types';

// =============================================================================
// AutoComplete
// `<p-autocomplete [(ngModel)]="val" [suggestions]="items" (completeMethod)="search($event)" />`
// → `<cb-autocomplete [(value)]="val" [suggestions]="items" (complete)="search($event.query)" />`
// =============================================================================

export const autocomplete: ComponentMapping = {
  name: 'autocomplete',
  entry: '@caribeng/ui/autocomplete',
  symbol: 'CbAutocomplete',
  modules: {
    'primeng/autocomplete': { AutoComplete: 'CbAutocomplete', AutoCompleteModule: 'CbAutocomplete' },
  },
  elements: [{
    tag: 'p-autocomplete',
    to: 'cb-autocomplete',
    rules: {
      styleClass: styleClass(),
      inputStyleClass: drop(),
      inputStyle: drop(),
      panelStyleClass: drop(),
      panelStyle: drop(),
      appendTo: drop(),
      baseZIndex: drop(),
      autoZIndex: drop(),
      multiple: unsupported('cb-autocomplete no soporta múltiple selección; usa cb-multiselect como alternativa.'),
      dropdown: drop(),
      completeOnFocus: drop(),
      dropdownIcon: drop(),
      dropdownMode: drop(),
      showEmptyMessage: drop(),
      field: (binding, el) => {
        // PrimeNG 'field' → CaribeNG 'optionLabel'
        const v = binding.kind === 'static' ? `optionLabel="${binding.value}"` : `[optionLabel]="${binding.value}"`;
        el.attrs.push(v);
      },
      '(completeMethod)': (binding, el) => {
        // PrimeNG emite { query: string }; CaribeNG emite string directamente
        el.attrs.push(`(complete)="${binding.value.replace(/\$event\.originalEvent/, '$event').replace(/\$event\.query\b/g, '$event')}"`);
      },
      '(onSelect)': event('optionSelected'),
      '(onUnselect)': drop(),
      '(onFocus)': drop(),
      '(onBlur)': drop(),
      '(onClear)': drop(),
      '(onKeyUp)': drop(),
      '(onShow)': drop(),
      '(onHide)': drop(),
    },
    same: ['value', 'suggestions', 'placeholder', 'minLength', 'delay', 'forceSelection', 'size', 'disabled', 'inputId'],
  }],
};

// =============================================================================
// SpeedDial
// `<p-speeddial [model]="items" direction="right" />`
// → `<cb-speed-dial [items]="items" direction="right" />`
// =============================================================================

export const speeddial: ComponentMapping = {
  name: 'speeddial',
  entry: '@caribeng/ui/speeddial',
  symbol: 'CbSpeedDial',
  modules: {
    'primeng/speeddial': { SpeedDial: 'CbSpeedDial', SpeedDialModule: 'CbSpeedDial' },
  },
  elements: [{
    tag: 'p-speeddial',
    to: 'cb-speed-dial',
    selfClosing: true,
    rules: {
      styleClass: styleClass(),
      style: drop(),
      buttonClassName: drop(),
      buttonStyle: drop(),
      buttonTemplate: drop(),
      mask: drop(),
      maskStyle: drop(),
      maskClassName: drop(),
      showIcon: iconName('icon'),
      hideIcon: iconName('closeIcon'),
      rotateAnimation: drop(),
      '(onVisibleChange)': (binding, el) => {
        el.attrs.push(`[(open)]="${binding.value.replace('$event', '$event')}"`);
        el.todos.push(`${binding.source} — cb-speed-dial usa [(open)] en lugar de (onVisibleChange).`);
      },
      '(onClick)': event('itemSelect'),
      model: (binding, el) => {
        // PrimeNG usa MenuItem[]; CbSpeedDialItem no admite separadores ni submenús.
        const v = binding.kind === 'static' ? `items="${binding.value}"` : `[items]="$any(${binding.value})"`;
        el.attrs.push(v);
      },
    },
    same: ['direction', 'open'],
  }],
};

// =============================================================================
// ColorPicker
// `<p-colorpicker [(ngModel)]="color" [inline]="false" />`
// → `<cb-colorpicker [(value)]="color" />`
// =============================================================================

export const colorpicker: ComponentMapping = {
  name: 'colorpicker',
  entry: '@caribeng/ui/colorpicker',
  symbol: 'CbColorPicker',
  modules: {
    'primeng/colorpicker': { ColorPicker: 'CbColorPicker', ColorPickerModule: 'CbColorPicker' },
  },
  elements: [{
    tag: 'p-colorpicker',
    to: 'cb-colorpicker',
    selfClosing: true,
    rules: {
      styleClass: styleClass(),
      style: drop(),
      panelStyle: drop(),
      panelStyleClass: drop(),
      appendTo: drop(),
      baseZIndex: drop(),
      autoZIndex: drop(),
      inline: drop(),
      format: unsupported('cb-colorpicker trabaja siempre en formato hex; convierte el valor antes de pasarlo.'),
      '(onChange)': event('valueChange'),
      '(onShow)': drop(),
      '(onHide)': drop(),
    },
    same: ['value', 'disabled', 'inputId', 'ariaLabel', 'size'],
  }],
};

// =============================================================================
// InputMask
// `<p-inputMask [(ngModel)]="val" mask="(999) 999-9999" />`
// → `<cb-input-mask [(value)]="val" mask="(999) 999-9999" />`
// =============================================================================

const INPUTMASK_RULES = {
  styleClass: styleClass(),
  style: drop(),
  slotChar: unsupported('cb-input-mask usa "_" como carácter de relleno; no es configurable.'),
  autoClear: drop(),
  characterPattern: unsupported('cb-input-mask usa un conjunto fijo de patrones; revisa la documentación.'),
  '(onComplete)': drop(),
  '(onFocus)': drop(),
  '(onBlur)': drop(),
  '(onInput)': drop(),
  '(onKeydown)': drop(),
} as const;

const INPUTMASK_SAME = ['value', 'mask', 'placeholder', 'disabled', 'inputId', 'ariaLabel'] as const;

export const inputmask: ComponentMapping = {
  name: 'inputmask',
  entry: '@caribeng/ui/inputmask',
  symbol: 'CbInputMask',
  modules: {
    'primeng/inputmask': { InputMask: 'CbInputMask', InputMaskModule: 'CbInputMask' },
  },
  // Angular's template AST preserves custom element tag case — include both variants.
  elements: ['p-inputmask', 'p-inputMask'].map((tag) => ({
    tag,
    to: 'cb-input-mask',
    selfClosing: true,
    rules: INPUTMASK_RULES,
    same: INPUTMASK_SAME,
  })),
};

// =============================================================================
// Carousel
// `<p-carousel [value]="products" [numVisible]="3" [circular]="true" />`
// → `<cb-carousel [items]="products" [circular]="true" />`
//
// cb-carousel usa CbCarouselItem[], no el array genérico de PrimeNG.
// =============================================================================

export const carousel: ComponentMapping = {
  name: 'carousel',
  entry: '@caribeng/ui/carousel',
  symbol: 'CbCarousel',
  modules: {
    'primeng/carousel': { Carousel: 'CbCarousel', CarouselModule: 'CbCarousel' },
  },
  elements: [{
    tag: 'p-carousel',
    to: 'cb-carousel',
    rules: {
      styleClass: styleClass(),
      style: drop(),
      numVisible: unsupported('cb-carousel muestra un item a la vez; usa CSS para tamaño de la tarjeta.'),
      numScroll: drop(),
      responsiveOptions: drop(),
      orientation: unsupported('cb-carousel solo admite orientación horizontal.'),
      verticalViewPortHeight: drop(),
      contentClass: drop(),
      indicatorsContentClass: drop(),
      indicatorsContentStyle: drop(),
      indicatorStyleClass: drop(),
      indicatorStyle: drop(),
      showNavigators: (binding, el) => {
        const v = binding.kind === 'static' ? `showNavigators="${binding.value}"` : `[showNavigators]="${binding.value}"`;
        el.attrs.push(v);
      },
      showIndicators: (binding, el) => {
        const v = binding.kind === 'static' ? `showIndicators="${binding.value}"` : `[showIndicators]="${binding.value}"`;
        el.attrs.push(v);
      },
      '(onPage)': event('pageChange'),
      value: (binding, el) => {
        // CbCarouselItem[] no coincide con el tipo del array de origen: cast para que compile; el TODO marca la adaptación de datos.
        const v = binding.kind === 'static' ? `items="${binding.value}"` : `[items]="$any(${binding.value})"`;
        el.attrs.push(v);
        el.todos.push(`${binding.source} → [items]: cb-carousel requiere CbCarouselItem[]; adapta el array { image, title, description }.`);
      },
    },
    same: ['circular', 'page', 'ariaLabel'],
  }],
};
