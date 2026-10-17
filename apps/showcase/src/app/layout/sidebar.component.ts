import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CbIconComponent } from '@caribeng/ui/icon';
import { NAV, type NavGroup } from '../data/nav';

@Component({
  selector: 'doc-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, CbIconComponent],
  template: `
    <div class="sidebar">
      <div class="sidebar__search">
        <cb-icon class="sidebar__search-icon" name="search" [size]="16" aria-hidden="true" />
        <input
          type="search"
          class="sidebar__search-input"
          placeholder="Buscar…"
          aria-label="Buscar componentes"
          [value]="query()"
          (input)="onSearch($event)"
        />
      </div>

      <nav class="sidebar__nav">
        @for (group of filtered(); track group.label) {
          <div class="sidebar__group">
            <p class="sidebar__group-label">{{ group.label }}</p>
            <ul class="sidebar__list">
              @for (item of group.items; track item.label) {
                <li>
                  @if (item.route) {
                    <a
                      class="sidebar__link"
                      [routerLink]="item.route"
                      routerLinkActive="sidebar__link--active"
                    >
                      {{ item.label }}
                    </a>
                  } @else {
                    <span class="sidebar__link sidebar__link--disabled">
                      {{ item.label }}
                      @if (item.badge) {
                        <span class="sidebar__badge">{{ item.badge }}</span>
                      }
                    </span>
                  }
                </li>
              }
            </ul>
          </div>
        }
        @if (filtered().length === 0) {
          <p class="sidebar__empty">Sin resultados.</p>
        }
      </nav>
    </div>
  `,
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  protected readonly query = signal('');

  protected readonly filtered = computed<NavGroup[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return NAV;
    return NAV.map((group) => ({
      ...group,
      items: group.items.filter((i) => i.label.toLowerCase().includes(q)),
    })).filter((group) => group.items.length > 0);
  });

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
