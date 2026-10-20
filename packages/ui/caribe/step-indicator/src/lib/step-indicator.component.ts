import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';

/**
 * Step-indicator de Caribe Design: progreso por segmentos para flujos de varios
 * pasos (transferencias, onboarding). Muestra segmentos completados, activo y
 * pendientes, con una leyenda opcional.
 *
 * @example
 * ```html
 * <cb-step-indicator [currentStep]="2" [totalSteps]="4" label="Datos" />
 * ```
 */
@Component({
  selector: 'cb-step-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-step-indicator-host' },
  template: `
    <div
      class="cb-step-indicator"
      role="progressbar"
      [attr.aria-valuenow]="current()"
      aria-valuemin="1"
      [attr.aria-valuemax]="total()"
      [attr.aria-label]="label() || t().stepsProgress"
    >
      <div class="cb-step-indicator__track" aria-hidden="true">
        @for (step of steps(); track step) {
          <span
            class="cb-step-indicator__segment"
            [class.cb-step-indicator__segment--done]="step < current()"
            [class.cb-step-indicator__segment--active]="step === current()"
          ></span>
        }
      </div>
      <div class="cb-step-indicator__caption">
        <strong class="cb-step-indicator__count">{{ fmt(t().stepOf, current(), total()) }}</strong>
        @if (label()) {
          <span class="cb-step-indicator__label">· {{ label() }}</span>
        }
      </div>
    </div>
  `,
  styleUrl: './step-indicator.component.css',
})
export class CbStepIndicator {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  /** Paso actual (1-based). */
  readonly currentStep = input<number>(1);
  /** Número total de pasos. */
  readonly totalSteps = input<number>(4);
  /** Leyenda del paso actual. */
  readonly label = input<string>('');

  protected readonly total = computed(() => Math.max(1, this.totalSteps()));
  protected readonly current = computed(() =>
    Math.max(1, Math.min(this.total(), this.currentStep())),
  );
  protected readonly steps = computed(() =>
    Array.from({ length: this.total() }, (_, i) => i + 1),
  );
}
