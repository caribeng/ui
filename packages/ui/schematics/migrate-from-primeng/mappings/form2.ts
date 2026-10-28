import type { ComponentMapping } from './types';
import { adaptEvent, drop, event, FOCUS_EVENTS, iconName, styleClass, unsupported } from './rules';

export const slider: ComponentMapping = {
  name: 'slider',
  entry: '@caribeng/ui/slider',
  symbol: 'CbSlider',
  modules: {
    'primeng/slider': { Slider: 'CbSlider', SliderModule: 'CbSlider' },
  },
  elements: [{
    tag: 'p-slider',
    to: 'cb-slider',
    rules: {
      styleClass: styleClass(),
      orientation: unsupported('cb-slider solo admite orientación horizontal.'),
      animate: drop(),
      '(onChange)': event('changed', adaptEvent('value')),
      '(onSlideEnd)': event('changed', adaptEvent('value')),
    },
    same: ['min', 'max', 'step', 'range', 'disabled', 'value', 'rangeValue'],
  }],
};

export const togglebutton: ComponentMapping = {
  name: 'togglebutton',
  entry: '@caribeng/ui/togglebutton',
  symbol: 'CbToggleButton',
  modules: {
    'primeng/togglebutton': { ToggleButton: 'CbToggleButton', ToggleButtonModule: 'CbToggleButton' },
  },
  elements: [{
    tag: 'p-togglebutton',
    to: 'cb-togglebutton',
    rules: {
      styleClass: styleClass(),
      onIcon: iconName('onIcon'),
      offIcon: iconName('offIcon'),
      severity: unsupported('cb-togglebutton no tiene severity; aplica estilos con la clase del host.'),
      iconPos: drop(),
      '(onChange)': event('changed', adaptEvent('checked')),
      ...FOCUS_EVENTS,
    },
    same: ['onLabel', 'offLabel', 'disabled', 'ariaLabel', 'inputId', 'size'],
  }],
};

export const rating: ComponentMapping = {
  name: 'rating',
  entry: '@caribeng/ui/rating',
  symbol: 'CbRating',
  modules: {
    'primeng/rating': { Rating: 'CbRating', RatingModule: 'CbRating' },
  },
  elements: [{
    tag: 'p-rating',
    to: 'cb-rating',
    rules: {
      styleClass: styleClass(),
      iconOnClass: unsupported('cb-rating usa iconos internos fijos.'),
      iconOffClass: unsupported('cb-rating usa iconos internos fijos.'),
      iconCancelClass: unsupported('cb-rating usa iconos internos fijos.'),
      iconOnStyle: drop(),
      iconOffStyle: drop(),
      cancelIcon: drop(),
      cancel: drop(),
      '(onRate)': event('changed', adaptEvent('value')),
      '(onCancel)': drop(),
      ...FOCUS_EVENTS,
    },
    same: ['stars', 'readonly', 'disabled', 'ariaLabel'],
  }],
};

export const floatlabel: ComponentMapping = {
  name: 'floatlabel',
  entry: '@caribeng/ui/floatlabel',
  symbol: 'CbFloatLabel',
  modules: {
    'primeng/floatlabel': { FloatLabel: 'CbFloatLabel', FloatLabelModule: 'CbFloatLabel' },
  },
  elements: [{
    tag: 'p-floatlabel',
    to: 'cb-float-label',
    rules: {
      styleClass: styleClass(),
    },
    same: ['variant'],
  }],
};

export const password: ComponentMapping = {
  name: 'password',
  entry: '@caribeng/ui/password',
  symbol: 'CbPassword',
  modules: {
    'primeng/password': { Password: 'CbPassword', PasswordModule: 'CbPassword' },
  },
  elements: [{
    tag: 'p-password',
    to: 'cb-password',
    rules: {
      styleClass: styleClass(),
      panelClass: drop(),
      panelStyle: drop(),
      promptLabel: drop(),
      weakLabel: drop(),
      mediumLabel: drop(),
      strongLabel: drop(),
      appendTo: drop(),
      autoFocus: drop(),
      '(onInput)': unsupported('cb-password no expone (onInput); escucha el evento nativo (input) del host.'),
      ...FOCUS_EVENTS,
    },
    same: ['placeholder', 'disabled', 'toggleMask', 'feedback', 'size', 'inputId'],
  }],
};
