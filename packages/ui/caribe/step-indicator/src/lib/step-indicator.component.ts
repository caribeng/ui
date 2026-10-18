import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

@Component({
  selector: 'cb-step-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-step-indicator' },
  template: `
    <div class="cb-caribe-surface" role="status" style="gap: 0.75rem">
      <strong style="font-size: 0.85rem; color: var(--cb-color-primary-600, #059669)">
        Paso {{ currentStep() }} de {{ totalSteps() }}
      </strong>
      @if (label()) {
        <span style="font-size: 0.85rem">{{ label() }}</span>
      }
      <span style="font-size: 0.75rem; color: var(--cb-color-text-muted, #64748b)">({{ percentage() }}%)</span>
    </div>
  `,
  styleUrl: './step-indicator.component.css',
})
export class CbStepIndicator {
  readonly currentStep = input<number>(1);
  readonly totalSteps = input<number>(4);
  readonly label = input<string>('Datos de destino');

  protected readonly percentage = computed(() =>
    Math.round((Math.max(1, this.currentStep()) / Math.max(1, this.totalSteps())) * 100)
  );
}
