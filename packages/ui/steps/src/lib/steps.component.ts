import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, model, output } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { injectCbTranslation } from '@caribeng/ui';

export interface CbStepItem { label: string; icon?: string; disabled?: boolean; }

/** Clickable progress navigation for a multi-step flow. */
@Component({
  selector: 'cb-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-steps' },
  template: `
    <nav [attr.aria-label]="(ariaLabel() ?? t().steps)">
      <ol class="cb-steps__list">
        @for (step of steps(); track $index; let i = $index; let last = $last) {
          <li class="cb-steps__entry" [class.cb-steps__entry--complete]="i < activeIndex()" [class.cb-steps__entry--current]="i === activeIndex()">
            <button class="cb-steps__button" type="button" [disabled]="step.disabled" [attr.aria-current]="i === activeIndex() ? 'step' : null" [attr.aria-label]="step.label" (click)="select(i)">
              <span class="cb-steps__marker">@if (step.icon) { <cb-icon [name]="step.icon" [size]="16" aria-hidden="true" /> } @else { {{ i + 1 }} }</span>
              <span class="cb-steps__label">{{ step.label }}</span>
            </button>
            @if (!last) { <span class="cb-steps__connector" aria-hidden="true"></span> }
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './steps.component.css',
})
export class CbSteps {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly steps = input<readonly CbStepItem[]>([]);
  readonly activeIndex = model(0);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly activeChange = output<number>();
  select(index: number): void {
    if (this.steps()[index]?.disabled) return;
    this.activeIndex.set(index);
    this.activeChange.emit(index);
  }
}
