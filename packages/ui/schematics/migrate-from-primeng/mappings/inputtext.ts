import { SIZE_VALUES, event, rename, unsupported, values } from './rules';
import type { AttrRule, ComponentMapping } from './types';

/** Tipos que admite `cb-input` (`CbInputType`). */
const INPUT_TYPES = new Set(['text', 'email', 'password', 'search', 'tel', 'url', 'number']);

const NOT_FORWARDED = 'el atributo nativo no se reenvía al <input> interno de cb-input.';

/**
 * `<input pInputText id="email" type="email" [(ngModel)]="email" />`
 * → `<cb-input inputId="email" type="email" [(ngModel)]="email" />`
 */
const rules: Record<string, AttrRule> = {
  pSize: values('size', SIZE_VALUES),
  // En un <input> nativo `size` es el ancho en caracteres; en cb-input es sm|md|lg.
  size: unsupported('en cb-input `size` es sm|md|lg; el ancho en caracteres no se reenvía.'),
  // El id debe llegar al <input> interno para que <label for> siga funcionando.
  id: rename('inputId'),
  type: (binding, el) => {
    if (binding.kind === 'static' && !INPUT_TYPES.has(binding.value)) {
      el.todos.push(`${binding.source} — cb-input no admite este tipo; usa el componente específico (cb-datepicker, cb-colorpicker…).`);
      return;
    }
    rename('type')(binding, el);
  },
  variant: unsupported('cb-input no tiene variante "filled".'),
  fluid: unsupported('cb-input ya ocupa todo el ancho de su contenedor.'),
  'aria-label': unsupported('usa el input label de cb-input; el aria-label del host no llega al <input> interno.'),
  'aria-describedby': unsupported('usa los inputs hint/error de cb-input.'),
  maxlength: unsupported(NOT_FORWARDED),
  minlength: unsupported(NOT_FORWARDED),
  pattern: unsupported(NOT_FORWARDED),
  autocomplete: unsupported(NOT_FORWARDED),
  min: unsupported(NOT_FORWARDED),
  max: unsupported(NOT_FORWARDED),
  step: unsupported(NOT_FORWARDED),
  autofocus: unsupported('usa la directiva cbAutoFocus de @caribeng/ui/autofocus.'),
  spellcheck: unsupported(NOT_FORWARDED),
  // focus/blur no burbujean desde el <input> interno; focusin/focusout sí.
  '(focus)': event('focusin'),
  '(blur)': event('focusout'),
};

export const inputtext: ComponentMapping = {
  name: 'inputtext',
  entry: '@caribeng/ui/input',
  modules: {
    'primeng/inputtext': { InputTextModule: 'CbInput', InputText: 'CbInput' },
  },
  elements: [
    {
      attr: 'pInputText',
      on: ['input'],
      otherTags: 'para <textarea> usa <cb-textarea>.',
      to: 'cb-input',
      selfClosing: true,
      rules,
      same: ['value', 'placeholder', 'invalid', 'disabled', 'readonly', 'required', 'inputmode'],
    },
  ],
};
