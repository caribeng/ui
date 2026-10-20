import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  signal,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';

export interface CbOrganizationChartNode {
  key: string;
  label: string;
  title?: string;
  subtitle?: string;
  icon?: string;
  children?: readonly CbOrganizationChartNode[];
}

@Component({
  selector: 'cb-organization-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, CbIcon],
  template: `
    <div class="cb-organization-chart" role="tree" [attr.aria-label]="(ariaLabel() ?? t().orgChart)">
      <ng-container
        [ngTemplateOutlet]="nodesTemplate"
        [ngTemplateOutletContext]="{ $implicit: value() }"
      />
    </div>

    <ng-template #nodesTemplate let-nodes>
      <ul class="cb-organization-chart__nodes">
        @for (node of nodes; track node.key) {
          <li class="cb-organization-chart__branch" role="none">
            <div
              class="cb-organization-chart__card"
              role="treeitem"
              [class.cb-organization-chart__card--selected]="selection()?.key === node.key"
              [attr.aria-selected]="selection()?.key === node.key"
              [attr.aria-expanded]="node.children?.length ? expanded().has(node.key) : null"
            >
              <button
                class="cb-organization-chart__select"
                type="button"
                (click)="selection.set(node)"
                [attr.aria-label]="fmt(t().selectItem, node.label)"
              >
                @if (node.icon) {
                  <cb-icon class="cb-organization-chart__icon" [name]="node.icon" [size]="18" aria-hidden="true" />
                }
                @if (node.title) { <small>{{ node.title }}</small> }
                <strong>{{ node.label }}</strong>
                @if (node.subtitle) { <span>{{ node.subtitle }}</span> }
              </button>
              @if (node.children?.length) {
                <button
                  class="cb-organization-chart__toggle"
                  type="button"
                  (click)="toggle(node.key)"
                  [attr.aria-label]="fmt(expanded().has(node.key) ? t().collapseItem : t().expandItem, node.label)"
                  [attr.aria-expanded]="expanded().has(node.key)"
                >{{ expanded().has(node.key) ? '−' : '+' }}</button>
              }
            </div>
            @if (node.children?.length && expanded().has(node.key)) {
              <ng-container
                [ngTemplateOutlet]="nodesTemplate"
                [ngTemplateOutletContext]="{ $implicit: node.children }"
              />
            }
          </li>
        }
      </ul>
    </ng-template>
  `,
  styles: [
    `
      :host { display: block; overflow-x: auto; color: var(--cb-color-text); }
      .cb-organization-chart { min-width: max-content; padding: 1rem; }
      .cb-organization-chart__nodes {
        display: flex; justify-content: center; gap: 1.5rem; list-style: none;
        margin: 0; padding: 0;
      }
      .cb-organization-chart__branch {
        display: flex; flex-direction: column; align-items: center; position: relative;
        padding-top: 1.5rem;
      }
      .cb-organization-chart__branch::before {
        position: absolute; top: 0; left: 50%; height: 1.5rem; content: '';
        border-left: 1px solid var(--cb-color-border);
      }
      .cb-organization-chart > .cb-organization-chart__nodes > .cb-organization-chart__branch { padding-top: 0; }
      .cb-organization-chart > .cb-organization-chart__nodes > .cb-organization-chart__branch::before { display: none; }
      .cb-organization-chart__card {
        display: grid; justify-items: center; position: relative; min-width: 9rem;
        border: 1px solid var(--cb-color-border); border-radius: var(--cb-radius-md);
        background: var(--cb-color-surface-raised); box-shadow: var(--cb-shadow-sm);
      }
      .cb-organization-chart__select {
        display: grid; justify-items: center; gap: .2rem; width: 100%; padding: .75rem;
        border: 0; border-radius: inherit; background: transparent; color: inherit;
        font: inherit; cursor: pointer;
      }
      .cb-organization-chart__select small, .cb-organization-chart__select span:not(.cb-organization-chart__icon) {
        color: var(--cb-color-text-muted); font-size: .8rem;
      }
      .cb-organization-chart__icon { color: var(--cb-color-primary); }
      .cb-organization-chart__card--selected { outline: 2px solid var(--cb-color-primary); outline-offset: 2px; }
      .cb-organization-chart__select:focus-visible, .cb-organization-chart__toggle:focus-visible {
        outline: 2px solid var(--cb-color-primary); outline-offset: 2px;
      }
      .cb-organization-chart__toggle {
        position: absolute; z-index: 1; bottom: -.75rem; left: calc(50% - .75rem);
        width: 1.5rem; height: 1.5rem; border: 1px solid var(--cb-color-border);
        border-radius: 50%; background: var(--cb-color-surface); color: inherit; cursor: pointer;
      }
    `,
  ],
})
export class CbOrganizationChart {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  readonly value = input<readonly CbOrganizationChartNode[]>([]);
  readonly selection = model<CbOrganizationChartNode | null>(null);
  readonly ariaLabel = input<string | undefined>(undefined);
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());

  protected toggle(key: string): void {
    const next = new Set(this.expanded());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.expanded.set(next);
  }
}
