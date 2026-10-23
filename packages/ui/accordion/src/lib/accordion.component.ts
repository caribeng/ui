import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';

let nextUid = 0;

/**
 * Accordion de CaribeNG: conjunto de paneles colapsables. Coloca varios
 * `<cb-accordion-panel>` dentro de `<cb-accordion>`.
 *
 * @example
 * ```html
 * <cb-accordion>
 *   <cb-accordion-panel header="Sección 1">Contenido…</cb-accordion-panel>
 *   <cb-accordion-panel header="Sección 2">Contenido…</cb-accordion-panel>
 * </cb-accordion>
 * ```
 */
@Component({
  selector: 'cb-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-accordion' },
  template: `<ng-content />`,
  styleUrl: './accordion.component.css',
})
export class CbAccordion {
  /** Permite varios paneles abiertos a la vez. */
  readonly multiple = input<boolean, unknown>(false, { transform: toBoolean });

  private readonly openIds = signal<ReadonlySet<number>>(new Set());

  isOpen(id: number): boolean {
    return this.openIds().has(id);
  }

  toggle(id: number): void {
    const current = this.openIds();
    const next = new Set(this.multiple() ? current : []);
    if (current.has(id)) next.delete(id);
    else next.add(id);
    this.openIds.set(next);
  }
}

/** Panel colapsable de un `<cb-accordion>`. */
@Component({
  selector: 'cb-accordion-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-accordion-panel',
    '[class.cb-is-open]': 'open()',
  },
  template: `
    <h3 class="cb-accordion__heading">
      <button
        type="button"
        class="cb-accordion__header"
        [id]="headerId"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="open() ? regionId : null"
        [disabled]="disabled()"
        (click)="toggle()"
      >
        <span class="cb-accordion__title">{{ header() }}</span>
        <cb-icon
          class="cb-accordion__chevron"
          [class.cb-is-open]="open()"
          name="chevron-down"
          [size]="18"
          aria-hidden="true"
        />
      </button>
    </h3>
    @if (open()) {
      <div class="cb-accordion__content" role="region" [id]="regionId" [attr.aria-labelledby]="headerId">
        <div class="cb-accordion__inner"><ng-content /></div>
      </div>
    }
  `,
  styleUrl: './accordion-panel.component.css',
})
export class CbAccordionPanel {
  private readonly accordion = inject(CbAccordion);
  private readonly id = ++nextUid;

  readonly header = input<string>('');
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });

  protected readonly headerId = `cb-accordion-h-${this.id}`;
  protected readonly regionId = `cb-accordion-r-${this.id}`;

  protected readonly open = computed(() => this.accordion.isOpen(this.id));

  protected toggle(): void {
    if (!this.disabled()) this.accordion.toggle(this.id);
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
