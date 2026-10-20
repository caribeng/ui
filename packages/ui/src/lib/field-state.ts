import {
  DestroyRef,
  Injector,
  computed,
  inject,
  signal,
  untracked,
  type Signal,
} from '@angular/core';
import { FormControl, NgControl, type AbstractControl } from '@angular/forms';
import type { Subscription } from 'rxjs';
import { CB_CONFIG, type CbRequiredIndicator } from './caribeng.config';
import { injectCbTranslation } from './locale.service';

/** Control vacío con el que se evalúa si los validadores incluyen `required`. */
const EMPTY = new FormControl(null);

/** Estado de validación de un control de formulario de CaribeNG. */
export interface CbFieldState {
  /** Inválido: `[invalid]` manual, o el control es inválido y ya fue tocado o modificado. */
  readonly invalid: Signal<boolean>;
  /** Requerido: `[required]` manual, o el control tiene un validador `required`. */
  readonly required: Signal<boolean>;
  /**
   * Indicador a mostrar junto a la etiqueta según `requiredIndicator` (global o
   * del campo), o `null` si no corresponde mostrar nada.
   */
  readonly indicator: Signal<CbFieldIndicator | null>;
}

/** Indicador visual de obligatoriedad ya resuelto. */
export interface CbFieldIndicator {
  /** `asterisk` (`*`), `required` ("(requerido)") u `optional` ("(opcional)"). */
  readonly kind: 'asterisk' | 'required' | 'optional';
  /** Texto a pintar. */
  readonly text: string;
}

/**
 * Conecta un control de CaribeNG con el estado de Angular Forms, de modo que el
 * error y el indicador de obligatorio se muestran sin código extra:
 *
 * ```html
 * <cb-input label="Correo" formControlName="email" error="Correo no válido" />
 * ```
 *
 * Los inputs manuales (`[invalid]`, `[required]`) siguen funcionando y se suman
 * al estado automático. Debe llamarse en el contexto de inyección del componente.
 *
 * El `NgControl` se resuelve de forma perezosa (la primera vez que se leen los
 * signals): inyectarlo en el constructor crearía una dependencia circular con
 * `NG_VALUE_ACCESSOR`.
 */
export function cbFieldState(manual: {
  invalid?: () => boolean;
  required?: () => boolean;
  /** Modo por campo; `undefined` usa el global de `provideCaribeNG()`. */
  requiredIndicator?: () => CbRequiredIndicator | undefined;
}): CbFieldState {
  const injector = inject(Injector);
  const config = inject(CB_CONFIG);
  const t = injectCbTranslation();
  // Se incrementa con cada evento del control para recalcular los signals.
  const version = signal(0);
  let current: AbstractControl | null = null;
  let subscription: Subscription | null = null;

  inject(DestroyRef).onDestroy(() => subscription?.unsubscribe());

  const control = (): AbstractControl | null => {
    version();
    const next = untracked(
      () => injector.get(NgControl, null, { self: true, optional: true })?.control ?? null,
    );
    if (next !== current) {
      subscription?.unsubscribe();
      current = next;
      subscription = next ? next.events.subscribe(() => version.update((v) => v + 1)) : null;
    }
    return current;
  };

  const required = computed(() => {
    if (manual.required?.()) return true;
    const c = control();
    return !!c?.validator && !!c.validator(EMPTY)?.['required'];
  });

  return {
    required,
    indicator: computed<CbFieldIndicator | null>(() => {
      const mode = manual.requiredIndicator?.() ?? config.requiredIndicator;
      const isRequired = required();
      if (mode === 'asterisk' && isRequired) return { kind: 'asterisk', text: '*' };
      if (mode === 'text' && isRequired) return { kind: 'required', text: `(${config.requiredText ?? t().required})` };
      if (mode === 'optional' && !isRequired) return { kind: 'optional', text: `(${config.optionalText ?? t().optional})` };
      return null;
    }),
    invalid: computed(() => {
      if (manual.invalid?.()) return true;
      const c = control();
      return !!c && c.invalid && (c.touched || c.dirty);
    }),
  };
}
