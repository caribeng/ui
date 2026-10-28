import type { ComponentMapping } from './types';
import { drop, event, rename, slotChild, styleClass } from './rules';

export const drawer: ComponentMapping = {
  name: 'drawer',
  entry: '@caribeng/ui/drawer',
  symbol: 'CbDrawer',
  modules: {
    'primeng/drawer': { Drawer: 'CbDrawer', DrawerModule: 'CbDrawer' },
    'primeng/sidebar': { Sidebar: 'CbDrawer', SidebarModule: 'CbDrawer' },
  },
  elements: [
    {
      tag: 'p-drawer',
      to: 'cb-drawer',
      rules: {
        styleClass: styleClass(),
        style: drop(),
        appendTo: drop(),
        modal: drop(),
        blockScroll: drop(),
        autoZIndex: drop(),
        baseZIndex: drop(),
        transitionOptions: drop(),
        motionOptions: drop(),
        showCloseIcon: rename('closable'),
        dismissible: rename('dismissableMask'),
        fullScreen: drop(),
        '(onShow)': event('onShow'),
        '(onHide)': event('onHide'),
      },
      same: ['visible', 'header', 'position', 'size', 'closable', 'dismissableMask', 'closeOnEscape', 'ariaLabel'],
      child: slotChild('cb-drawer', 'cb-drawer-footer', {
        header: 'usa el atributo header= de cb-drawer en lugar de la plantilla.',
        closeicon: 'cb-drawer usa su propio icono de cierre.',
      }),
    },
    {
      tag: 'p-sidebar',
      to: 'cb-drawer',
      rules: {
        styleClass: styleClass(),
        style: drop(),
        appendTo: drop(),
        modal: drop(),
        blockScroll: drop(),
        autoZIndex: drop(),
        baseZIndex: drop(),
        transitionOptions: drop(),
        showCloseIcon: rename('closable'),
        dismissible: rename('dismissableMask'),
        '(onShow)': event('onShow'),
        '(onHide)': event('onHide'),
      },
      same: ['visible', 'header', 'position', 'closable', 'dismissableMask', 'closeOnEscape', 'ariaLabel'],
    },
  ],
};

export const popover: ComponentMapping = {
  name: 'popover',
  entry: '@caribeng/ui/popover',
  symbol: 'CbPopover',
  modules: {
    'primeng/popover': { Popover: 'CbPopover', PopoverModule: 'CbPopover' },
    'primeng/overlaypanel': { OverlayPanel: 'CbPopover', OverlayPanelModule: 'CbPopover' },
  },
  elements: [
    {
      tag: 'p-popover',
      to: 'cb-popover',
      rules: {
        styleClass: styleClass(),
        style: drop(),
        appendTo: drop(),
        autoZIndex: drop(),
        baseZIndex: drop(),
        transitionOptions: drop(),
        motionOptions: drop(),
        showCloseIcon: drop(),
        '(onShow)': event('onShow'),
        '(onHide)': event('onHide'),
      },
      same: ['dismissable', 'ariaLabel'],
    },
    {
      tag: 'p-overlaypanel',
      to: 'cb-popover',
      rules: {
        styleClass: styleClass(),
        style: drop(),
        appendTo: drop(),
        autoZIndex: drop(),
        baseZIndex: drop(),
        transitionOptions: drop(),
        showCloseIcon: drop(),
        dismissable: rename('dismissable'),
        '(onShow)': event('onShow'),
        '(onHide)': event('onHide'),
      },
      same: ['ariaLabel'],
    },
  ],
};
