import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, model, output } from '@angular/core';

export interface CbFabMenuItem {
  id: string;
  label: string;
}

@Component({
  selector: 'cb-fab-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-fab-menu' },
  template: `
    <div style="display: inline-flex; flex-direction: column; align-items: flex-end; gap: 0.5rem">
      @if (open()) {
        <div role="menu" style="display: flex; flex-direction: column; gap: 0.35rem">
          @for (item of items(); track item.id) {
            <button
              type="button"
              role="menuitem"
              (click)="selectItem(item)"
              class="cb-caribe-surface"
              style="cursor: pointer; font-size: 0.8rem"
            >
              {{ item.label }}
            </button>
          }
        </div>
      }
      <button
        type="button"
        [attr.aria-expanded]="open()"
        [attr.aria-label]="triggerLabel()"
        (click)="open.set(!open())"
        style="width: 3rem; height: 3rem; border-radius: 999px; border: none; background: var(--cb-color-primary-500, #10b981); color: #fff; font-size: 1.25rem; cursor: pointer"
      >
        {{ open() ? '×' : '+' }}
      </button>
    </div>
  `,
  styleUrl: './fab-menu.component.css',
})
export class CbFabMenuComponent {
  readonly triggerLabel = input<string>('Menú de acciones rápidas');
  readonly items = input<readonly CbFabMenuItem[]>([]);
  readonly open = model<boolean>(false);
  readonly itemSelected = output<CbFabMenuItem>();

  selectItem(item: CbFabMenuItem): void {
    this.itemSelected.emit(item);
    this.open.set(false);
  }
}
