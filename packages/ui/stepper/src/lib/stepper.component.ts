import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  contentChildren,
  inject,
  input,
  signal,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbButton } from '@caribeng/ui/button';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';

let nextUid = 0;

/**
 * Stepper de CaribeNG: asistente por pasos. Coloca varios `<cb-step>` dentro de
 * `<cb-stepper>`.
 *
 * @example
 * ```html
 * <cb-stepper>
 *   <cb-step label="Cuenta">…</cb-step>
 *   <cb-step label="Perfil">…</cb-step>
 *   <cb-step label="Confirmar">…</cb-step>
 * </cb-stepper>
 * ```
 */
@Component({
  selector: 'cb-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon, CbButton],
  host: { class: 'cb-stepper' },
  template: `
    <ol class="cb-stepper__header">
      @for (step of steps(); track step.stepId; let i = $index; let last = $last) {
        <li
          class="cb-stepper__item"
          [class.cb-is-active]="isActive(step)"
          [class.cb-is-complete]="isComplete(step)"
        >
          <button
            type="button"
            class="cb-stepper__indicator"
            [attr.aria-current]="isActive(step) ? 'step' : null"
            [attr.aria-label]="stepName(step, i)"
            [disabled]="step.disabled()"
            (click)="goTo(i)"
          >
            @if (isComplete(step)) {
              <cb-icon name="check" [size]="16" aria-hidden="true" />
            } @else {
              {{ i + 1 }}
            }
          </button>
          <span class="cb-stepper__label" aria-hidden="true">{{ step.label() }}</span>
          @if (!last) {
            <span class="cb-stepper__connector" aria-hidden="true"></span>
          }
        </li>
      }
    </ol>

    <div class="cb-stepper__content">
      <ng-content />
    </div>

    @if (showNav()) {
      <div class="cb-stepper__nav">
        <cb-button variant="text" severity="secondary" [disabled]="activeIndex() === 0" (click)="prev()">
          {{ t().back }}
        </cb-button>
        <cb-button [disabled]="activeIndex() >= steps().length - 1" (click)="next()">
          {{ t().next }}
        </cb-button>
      </div>
    }
  `,
  styleUrl: './stepper.component.css',
})
export class CbStepper {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly steps = contentChildren(CbStep);
  /** Muestra los botones Atrás/Siguiente integrados. */
  readonly showNav = input<boolean, unknown>(true, { transform: toBoolean });

  readonly activeIndex = signal(0);

  isActive(step: CbStep): boolean {
    return this.steps()[this.activeIndex()] === step;
  }
  isComplete(step: CbStep): boolean {
    return this.steps().indexOf(step) < this.activeIndex();
  }
  /** Nombre del botón del paso: "Paso 2 de 3: Envío" (y ", completado" si ya pasó). */
  protected stepName(step: CbStep, index: number): string {
    const name = cbFormat(this.t().stepOf, index + 1, this.steps().length) + (step.label() ? `: ${step.label()}` : '');
    return this.isComplete(step) ? `${name}, ${this.t().stepCompleted}` : name;
  }

  goTo(index: number): void {
    const max = this.steps().length - 1;
    this.activeIndex.set(Math.min(max, Math.max(0, index)));
  }
  next(): void {
    this.goTo(this.activeIndex() + 1);
  }
  prev(): void {
    this.goTo(this.activeIndex() - 1);
  }
}

/** Paso individual de un `<cb-stepper>`. */
@Component({
  selector: 'cb-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-step' },
  template: `
    @if (active()) {
      <div class="cb-step__panel"><ng-content /></div>
    }
  `,
})
export class CbStep {
  private readonly stepper = inject(CbStepper);

  readonly stepId = ++nextUid;
  readonly label = input<string>('');
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });

  protected readonly active = computed(() => this.stepper.isActive(this));
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
