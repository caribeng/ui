import { drop, rename, unsupported, values } from './rules';
import type { ComponentMapping } from './types';

const NO_TIMING = 'cbTooltip usa sus propios tiempos de aparición.';

/**
 * `<span pTooltip="Ayuda" tooltipPosition="bottom">` → `<span cbTooltip="Ayuda" cbTooltipPosition="bottom">`.
 * Funciona en cualquier elemento, también sobre componentes que se migran a la vez (`<p-button pTooltip>`).
 */
export const tooltip: ComponentMapping = {
  name: 'tooltip',
  entry: '@caribeng/ui/tooltip',
  symbol: 'CbTooltipDirective',
  modules: {
    'primeng/tooltip': { TooltipModule: 'CbTooltipDirective', Tooltip: 'CbTooltipDirective' },
  },
  elements: [],
  directives: [
    {
      attr: 'pTooltip',
      to: 'cbTooltip',
      rules: {
        tooltipPosition: values('cbTooltipPosition', { top: 'top', bottom: 'bottom', left: 'left', right: 'right' }),
        tooltipDisabled: rename('cbTooltipDisabled'),
        appendTo: drop(),
        tooltipZIndex: drop(),
        tooltipEvent: unsupported('cbTooltip se muestra con hover y con foco.'),
        positionStyle: unsupported('cbTooltip se posiciona con el overlay del CDK.'),
        positionTop: unsupported('cbTooltip se posiciona con el overlay del CDK.'),
        positionLeft: unsupported('cbTooltip se posiciona con el overlay del CDK.'),
        tooltipStyleClass: unsupported('personaliza el tooltip con los tokens CSS de CaribeNG.'),
        escape: unsupported('cbTooltip muestra solo texto (siempre escapado).'),
        showDelay: unsupported(NO_TIMING),
        hideDelay: unsupported(NO_TIMING),
        life: unsupported(NO_TIMING),
        autoHide: unsupported(NO_TIMING),
        fitContent: unsupported('cbTooltip ajusta su ancho al texto.'),
        hideOnEscape: drop(),
        showOnEllipsis: unsupported('cbTooltip se muestra siempre que tenga texto.'),
        tooltipOptions: unsupported('pasa cada opción como input de cbTooltip.'),
      },
    },
  ],
};
