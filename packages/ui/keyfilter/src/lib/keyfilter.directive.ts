import { Directive, input } from '@angular/core';

/** Filtros predefinidos (como el KeyFilter de PrimeNG). */
export type CbKeyFilterPreset = 'int' | 'pint' | 'num' | 'pnum' | 'money' | 'alpha' | 'alphanum' | 'hex' | 'email';

/** Caracteres permitidos por cada filtro predefinido (se comprueba carácter a carácter). */
const PRESETS: Record<CbKeyFilterPreset, RegExp> = {
  int: /[\d-]/,
  pint: /\d/,
  num: /[\d\-.,]/,
  pnum: /[\d.,]/,
  money: /[\d.,]/,
  alpha: /[a-záéíóúüñ\s]/i,
  alphanum: /[a-z0-9áéíóúüñ\s]/i,
  hex: /[0-9a-f]/i,
  email: /[a-z0-9@._+-]/i,
};

/**
 * KeyFilter de CaribeNG: limita los caracteres que se pueden escribir en un
 * `input` o `textarea`. Usa el evento `beforeinput`, así filtra lo tecleado,
 * lo pegado y lo autocompletado (no solo las teclas).
 *
 * Solo restringe la entrada: valida el formato final con Validators en el formulario.
 *
 * @example
 * ```html
 * <input cbKeyFilter="pint" inputmode="numeric" aria-label="Número de cédula" />
 * <input [cbKeyFilter]="/[A-Z0-9]/" aria-label="Placa" />
 * ```
 */
@Directive({
  selector: 'input[cbKeyFilter], textarea[cbKeyFilter]',
  standalone: true,
  host: { '(beforeinput)': 'onBeforeInput($event)' },
})
export class CbKeyFilter {
  /** Filtro predefinido o expresión que debe cumplir cada carácter. */
  readonly cbKeyFilter = input.required<CbKeyFilterPreset | RegExp>();

  /** ¿Se acepta este texto? (cada carácter debe cumplir el filtro). */
  allows(text: string): boolean {
    const filter = this.cbKeyFilter();
    const pattern = filter instanceof RegExp ? new RegExp(filter.source, filter.flags.replace('g', '')) : PRESETS[filter];
    if (!pattern) return true;
    return [...text].every((ch) => pattern.test(ch));
  }

  protected onBeforeInput(e: Event): void {
    const event = e as InputEvent;
    // Borrar, deshacer o mover texto siempre se permite; solo se filtra lo que se inserta.
    if (!event.inputType?.startsWith('insert')) return;
    const text = event.data ?? event.dataTransfer?.getData('text/plain') ?? '';
    if (text && !this.allows(text)) event.preventDefault();
  }
}
