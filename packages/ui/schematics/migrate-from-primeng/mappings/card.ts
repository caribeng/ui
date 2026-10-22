import { rename, slotChild, styleClass } from './rules';
import type { ComponentMapping } from './types';

const TEXT_ONLY = 'cb-card solo admite título y subtítulo de texto (inputs header y subtitle).';

/**
 * `<p-card header="Resumen" subheader="Octubre"><ng-template #footer>…</ng-template></p-card>`
 * → `<cb-card header="Resumen" subtitle="Octubre"><div cb-card-footer>…</div></cb-card>`
 */
export const card: ComponentMapping = {
  name: 'card',
  entry: '@caribeng/ui/card',
  symbol: 'CbCard',
  modules: {
    'primeng/card': { CardModule: 'CbCard', Card: 'CbCard' },
  },
  elements: [
    {
      tag: 'p-card',
      to: 'cb-card',
      rules: {
        subheader: rename('subtitle'),
        styleClass: styleClass(),
      },
      child: slotChild('cb-card', 'cb-card-footer', {
        header: 'cb-card no tiene zona de cabecera (p. ej. una imagen); ponla al principio del contenido.',
        title: TEXT_ONLY,
        subtitle: TEXT_ONLY,
      }),
      same: ['header'],
    },
  ],
};
