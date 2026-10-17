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

let nextUid = 0;

/**
 * Tabs de CaribeNG: interfaz por pestañas. Coloca varios `<cb-tab>` dentro de
 * `<cb-tabs>`.
 *
 * @example
 * ```html
 * <cb-tabs>
 *   <cb-tab label="Resumen">…</cb-tab>
 *   <cb-tab label="Detalles">…</cb-tab>
 * </cb-tabs>
 * ```
 */
@Component({
  selector: 'cb-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-tabs' },
  template: `
    <div class="cb-tabs__list" role="tablist">
      @for (tab of tabs(); track tab.tabId) {
        <button
          type="button"
          class="cb-tabs__tab"
          role="tab"
          [class.cb-is-active]="isActive(tab.tabId)"
          [attr.aria-selected]="isActive(tab.tabId)"
          [attr.tabindex]="isActive(tab.tabId) ? 0 : -1"
          [disabled]="tab.disabled()"
          (click)="select(tab.tabId)"
          (keydown)="onKeydown($event)"
        >
          {{ tab.label() }}
        </button>
      }
    </div>
    <div class="cb-tabs__panels">
      <ng-content />
    </div>
  `,
  styleUrl: './tabs.component.css',
})
export class CbTabsComponent {
  readonly tabs = contentChildren(CbTabComponent);

  private readonly activeId = signal<number | null>(null);
  private readonly effectiveActive = computed(
    () => this.activeId() ?? this.tabs()[0]?.tabId ?? null,
  );

  isActive(id: number): boolean {
    return this.effectiveActive() === id;
  }

  select(id: number): void {
    this.activeId.set(id);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const tabs = this.tabs().filter((t) => !t.disabled());
    if (!tabs.length) return;
    const idx = tabs.findIndex((t) => t.tabId === this.effectiveActive());
    let next = idx;
    switch (event.key) {
      case 'ArrowRight': next = (idx + 1) % tabs.length; break;
      case 'ArrowLeft': next = (idx - 1 + tabs.length) % tabs.length; break;
      case 'Home': next = 0; break;
      case 'End': next = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    this.select(tabs[next].tabId);
  }
}

/** Pestaña individual de un `<cb-tabs>`. */
@Component({
  selector: 'cb-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-tab' },
  template: `
    @if (active()) {
      <div class="cb-tab__panel" role="tabpanel"><ng-content /></div>
    }
  `,
})
export class CbTabComponent {
  private readonly parent = inject(CbTabsComponent);

  readonly tabId = ++nextUid;
  readonly label = input<string>('');
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });

  protected readonly active = computed(() => this.parent.isActive(this.tabId));
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
