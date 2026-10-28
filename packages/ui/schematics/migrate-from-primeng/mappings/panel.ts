import type { ComponentMapping } from './types';
import { drop, slotChild, styleClass, templateName } from './rules';

export const panel: ComponentMapping = {
  name: 'panel',
  entry: '@caribeng/ui/panel',
  symbol: 'CbPanel',
  modules: {
    'primeng/panel': { Panel: 'CbPanel', PanelModule: 'CbPanel' },
  },
  elements: [{
    tag: 'p-panel',
    to: 'cb-panel',
    rules: {
      styleClass: styleClass(),
      iconPos: drop(),
      expandIcon: drop(),
      collapseIcon: drop(),
      transitionOptions: drop(),
      '(onBeforeToggle)': drop(),
      '(onAfterToggle)': drop(),
    },
    same: ['header', 'toggleable', 'collapsed'],
    child: slotChild('cb-panel', 'cb-panel-footer', {
      icons: 'usa el slot [cb-panel-icons] directamente dentro de cb-panel.',
      toggler: 'cb-panel incluye su propio botón de colapso.',
      header: 'pon el contenido de la cabecera en el atributo header= de cb-panel.',
    }),
  }],
};

export const fieldset: ComponentMapping = {
  name: 'fieldset',
  entry: '@caribeng/ui/fieldset',
  symbol: 'CbFieldset',
  modules: {
    'primeng/fieldset': { Fieldset: 'CbFieldset', FieldsetModule: 'CbFieldset' },
  },
  elements: [{
    tag: 'p-fieldset',
    to: 'cb-fieldset',
    rules: {
      styleClass: styleClass(),
      expandIcon: drop(),
      collapseIcon: drop(),
      transitionOptions: drop(),
    },
    same: ['legend', 'toggleable', 'collapsed'],
    child: (child) => {
      const name = templateName(child);
      if (!name) return null;
      if (name === 'content') return { tag: 'ng-container', attrs: [] };
      if (name === 'legend') return { todo: 'cb-fieldset no tiene plantilla "legend"; usa el atributo legend= del componente.' };
      return { todo: `cb-fieldset no tiene la plantilla "${name}".` };
    },
  }],
};

export const toolbar: ComponentMapping = {
  name: 'toolbar',
  entry: '@caribeng/ui/toolbar',
  symbol: 'CbToolbar',
  modules: {
    'primeng/toolbar': { Toolbar: 'CbToolbar', ToolbarModule: 'CbToolbar' },
  },
  elements: [{
    tag: 'p-toolbar',
    to: 'cb-toolbar',
    rules: {
      styleClass: styleClass(),
    },
    same: ['ariaLabel'],
    child: (child) => {
      const name = templateName(child);
      if (!name) return null;
      if (name === 'start') return { tag: 'div', attrs: ['cb-toolbar-start'] };
      if (name === 'center') return { tag: 'div', attrs: ['cb-toolbar-center'] };
      if (name === 'end') return { tag: 'div', attrs: ['cb-toolbar-end'] };
      return { todo: `cb-toolbar no tiene la plantilla "${name}"; usa [cb-toolbar-start], [cb-toolbar-center] o [cb-toolbar-end].` };
    },
  }],
};
