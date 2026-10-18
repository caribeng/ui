import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'cb-tracker', standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <ol class="cb-row" aria-label="Progreso">
      @for (step of steps(); track $index) {
        <li class="cb-column" [attr.aria-current]="ariaCurrent($index)">
          <span class="cb-surface" [class.cb-primary]="isComplete($index)">{{ marker($index) }}</span>
          <span>{{ step }}</span>
        </li>
      }
    </ol>
  `,
  styleUrl: './tracker.component.css',
})
export class CbTrackerComponent {
  readonly steps = input<readonly string[]>([]);
  readonly currentIndex = input(0);
  protected isComplete(index: number): boolean { return index <= this.currentIndex(); }
  protected ariaCurrent(index: number): 'step' | null { return index === this.currentIndex() ? 'step' : null; }
  protected marker(index: number): string | number { return index < this.currentIndex() ? '✓' : index + 1; }
}
