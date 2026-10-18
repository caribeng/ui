import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from '@angular/core';

export interface CbFloatMenuItem {
  id: string;
  label: string;
}

@Component({
  selector: 'cb-float-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-float-menu' },
  template: `
    <nav class="cb-caribe-surface" [attr.aria-label]="ariaLabel()" style="border-radius: 999px; padding: 0.35rem 0.65rem; gap: 0.35rem">
      @for (item of items(); track item.id) {
        <button
          type="button"
          (click)="select.emit(item)"
          [style.background]="activeId() === item.id ? 'var(--cb-color-primary-500, #10b981)' : 'transparent'"
          [style.color]="activeId() === item.id ? '#ffffff' : 'inherit'"
          style="border: none; border-radius: 999px; padding: 0.35rem 0.75rem; font-size: 0.8rem; cursor: pointer"
        >
          {{ item.label }}
        </button>
      }
    </nav>
  `,
  styleUrl: './float-menu.component.css',
})
export class CbFloatMenuComponent {
  readonly items = input<readonly CbFloatMenuItem[]>([]);
  readonly activeId = input<string>('');
  readonly ariaLabel = input<string>('Menú flotante');
  readonly select = output<CbFloatMenuItem>();
}
