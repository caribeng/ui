import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  output,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CbIcon } from '@caribeng/ui/icon';
import { NAV_MENU, type NavItem } from '../data/nav';
import { I18nService } from '../services/i18n.service';

/** Traducción ES de las etiquetas de sección/grupo del nav (la fuente está en EN). */
const NAV_LABEL_ES: Record<string, string> = {
  'Getting Started': 'Primeros pasos',
  Introduction: 'Introducción',
  Localization: 'Idioma (i18n)',
  Theming: 'Temas',
  Colors: 'Colores',
  'Theming & Presets': 'Temas y presets',
  Components: 'Componentes',
  Templates: 'Plantillas',
  Form: 'Formulario',
  Button: 'Botones',
  Data: 'Datos',
  Panel: 'Paneles',
  Overlay: 'Overlays',
  File: 'Archivos',
  Menu: 'Menús',
  Chart: 'Gráficas',
  Messages: 'Mensajes',
  Media: 'Multimedia',
  Misc: 'Varios',
  'Cards & Transactions': 'Tarjetas y transacciones',
  'Alerts & Overlays': 'Alertas y overlays',
  'Navigation & Actions': 'Navegación y acciones',
  'Identity, Loaders & Forms': 'Identidad, loaders y formularios',
  Icons: 'Iconos',
  'Catalog (Lucide)': 'Catálogo (Lucide)',
  Utilities: 'Utilidades',
};

@Component({
  selector: 'doc-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, CbIcon],
  template: `
    <div class="sidebar">
      <div class="sidebar__search">
        <cb-icon class="sidebar__search-icon" name="search" [size]="16" aria-hidden="true" />
        <input
          type="search"
          class="sidebar__search-input"
          [placeholder]="i18n.t('Buscar componente…', 'Search component…')"
          [attr.aria-label]="i18n.t('Buscar componentes', 'Search components')"
          [value]="query()"
          (input)="onSearch($event)"
        />
      </div>

      <nav [attr.aria-label]="i18n.t('Navegación principal', 'Main navigation')">
        <ol class="layout-menu">
          @for (rootItem of filteredMenu(); track rootItem.label) {
            <li app-menuitem>
              <button
                type="button"
                class="px-link"
                [class.px-link--active]="hasActiveChild(rootItem)"
                [attr.aria-expanded]="isRootOpen(rootItem)"
                (click)="toggleRoot(rootItem.label)"
              >
                <div class="menu-icon">
                  <cb-icon [name]="rootItem.icon ?? 'folder'" [size]="16" aria-hidden="true" />
                </div>
                <span>{{ label(rootItem.label) }}</span>
                <span class="menu-toggle">
                  @if (rootItem.badge) {
                    <span class="p-tag">
                      <span class="p-tag-label">{{ rootItem.badge }}</span>
                    </span>
                  }
                  <cb-icon
                    class="menu-toggle-icon"
                    [class.menu-toggle-icon--open]="isRootOpen(rootItem)"
                    name="chevron-down"
                    [size]="16"
                    aria-hidden="true"
                  />
                </span>
              </button>

              <div class="menu-panel" [class.hidden]="!isRootOpen(rootItem)">
                <ol>
                  @for (child of rootItem.children ?? []; track child.label) {
                    @if (child.children?.length) {
                      <li app-menuitem>
                        <span class="menu-child-category">{{ label(child.label) }}</span>
                        <div class="menu-subpanel">
                          <ol>
                            @for (leaf of child.children; track leaf.label) {
                              <li app-menuitem>
                                <a
                                  [routerLink]="leaf.route"
                                  routerLinkActive="router-link-active"
                                  [routerLinkActiveOptions]="{ exact: true }"
                                  (click)="navigate.emit()"
                                >
                                  <span>{{ label(leaf.label) }}</span>
                                  @if (leaf.badge) {
                                    <span class="p-tag">
                                      <span class="p-tag-label">{{ leaf.badge }}</span>
                                    </span>
                                  }
                                </a>
                              </li>
                            }
                          </ol>
                        </div>
                      </li>
                    } @else if (child.route) {
                      <li app-menuitem>
                        <a
                          [routerLink]="child.route"
                          routerLinkActive="router-link-active"
                          [routerLinkActiveOptions]="{ exact: true }"
                          (click)="navigate.emit()"
                        >
                          <span>{{ label(child.label) }}</span>
                          @if (child.badge) {
                            <span class="p-tag">
                              <span class="p-tag-label">{{ child.badge }}</span>
                            </span>
                          }
                        </a>
                      </li>
                    }
                  }
                </ol>
              </div>
            </li>
          }
        </ol>

        @if (filteredMenu().length === 0) {
          <p class="sidebar__empty">
            {{ i18n.t('Sin resultados para', 'No results for') }} "{{ query() }}".
          </p>
        }
      </nav>
    </div>
  `,
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly router = inject(Router);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);

  readonly navigate = output<void>();

  /** Traduce etiquetas de sección/grupo del nav; nombres de componente pasan igual. */
  protected label(raw: string): string {
    return this.i18n.t(NAV_LABEL_ES[raw] ?? raw, raw);
  }

  protected readonly query = signal('');
  protected readonly currentUrl = signal(this.cleanUrl(this.router.url));
  protected readonly openMap = signal<Record<string, boolean>>({});

  protected readonly filteredMenu = computed<NavItem[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return NAV_MENU;

    const result: NavItem[] = [];
    for (const root of NAV_MENU) {
      const matchedChildren: NavItem[] = [];
      for (const child of root.children ?? []) {
        if (child.children?.length) {
          const leaves = child.children.filter((l) => l.label.toLowerCase().includes(q));
          if (leaves.length > 0 || child.label.toLowerCase().includes(q)) {
            matchedChildren.push({
              ...child,
              children: leaves.length > 0 ? leaves : child.children,
            });
          }
        } else if (child.label.toLowerCase().includes(q)) {
          matchedChildren.push(child);
        }
      }
      if (matchedChildren.length > 0 || root.label.toLowerCase().includes(q)) {
        result.push({
          ...root,
          children: matchedChildren.length > 0 ? matchedChildren : root.children,
        });
      }
    }
    return result;
  });

  constructor() {
    this.syncActiveRoot(this.currentUrl());

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => {
        const url = this.cleanUrl(e.urlAfterRedirects || e.url);
        this.currentUrl.set(url);
        this.syncActiveRoot(url);
      });

    afterNextRender(() => {
      setTimeout(() => this.scrollToActiveItem(), 50);
    });
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected toggleRoot(label: string): void {
    const current = this.openMap();
    const isCurrentlyOpen = this.isLabelOpen(label);
    this.openMap.set({
      ...current,
      [label]: !isCurrentlyOpen,
    });
  }

  protected isRootOpen(item: NavItem): boolean {
    if (this.query().trim().length > 0) {
      return true;
    }
    return this.isLabelOpen(item.label);
  }

  protected hasActiveChild(item: NavItem): boolean {
    const url = this.currentUrl();
    return (item.children ?? []).some(
      (c) => c.route === url || (c.children ?? []).some((leaf) => leaf.route === url),
    );
  }

  private isLabelOpen(label: string): boolean {
    const explicit = this.openMap()[label];
    if (explicit !== undefined) {
      return explicit;
    }
    const rootItem = NAV_MENU.find((r) => r.label === label);
    return rootItem ? this.hasActiveChild(rootItem) : false;
  }

  private syncActiveRoot(url: string): void {
    for (const root of NAV_MENU) {
      const matches = (root.children ?? []).some(
        (c) => c.route === url || (c.children ?? []).some((leaf) => leaf.route === url),
      );
      if (matches) {
        this.openMap.update((prev) => ({ ...prev, [root.label]: true }));
      }
    }
  }

  private cleanUrl(raw: string): string {
    return (raw || '/introduction').split('?')[0].split('#')[0] || '/introduction';
  }

  private scrollToActiveItem(): void {
    const active = this.el.nativeElement.querySelector('.router-link-active');
    if (active && typeof active.scrollIntoView === 'function') {
      active.scrollIntoView({ block: 'nearest' });
    }
  }
}
