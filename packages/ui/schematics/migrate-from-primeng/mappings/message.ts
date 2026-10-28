import { SEVERITY_VALUES, drop, escapeText, styleClass, unsupported, values } from './rules';
import type { AttrRule, ComponentMapping, ElementRewrite } from './types';

/**
 * `<p-message severity="success" text="Operación completada" />`
 * → `<cb-message severity="success">Operación completada</cb-message>`
 *
 * El input `text` de PrimeNG pasa a ser contenido proyectado en CaribeNG.
 */
const rules: Record<string, AttrRule> = {
  severity: values('severity', SEVERITY_VALUES),
  text: drop(),
  icon: drop(),
  escape: drop(),
  styleClass: styleClass(),
  style: unsupported('aplica estilos al host de cb-message directamente.'),
  life: unsupported('cb-message no se cierra automáticamente; usa [(visible)] para controlarlo.'),
};

function finalize(el: ElementRewrite): void {
  const textBinding = el.find('text');
  if (!textBinding) return;
  if (textBinding.kind === 'static') {
    el.before.push(escapeText(textBinding.value));
  } else {
    el.before.push(`{{ ${textBinding.value} }}`);
  }
}

export const message: ComponentMapping = {
  name: 'message',
  entry: '@caribeng/ui/message',
  symbol: 'CbMessage',
  modules: {
    'primeng/message': {
      MessageModule: 'CbMessage',
      Message: 'CbMessage',
    },
    'primeng/messages': {
      MessagesModule: 'CbMessage',
      Messages: 'CbMessage',
    },
  },
  elements: [
    {
      tag: 'p-message',
      to: 'cb-message',
      rules,
      finalize,
      same: ['closable', 'visible'],
    },
  ],
};
