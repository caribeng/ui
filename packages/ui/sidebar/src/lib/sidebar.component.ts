import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import { CbTooltipDirective } from '@caribeng/ui/tooltip';
import { CB_APP_SHELL, type CbSidebarGroup, type CbSidebarItem, type CbSidebarSelectEvent, cbSidebarKey } from './sidebar.types';

let nextUid = 0;

/**
 * Menú lateral de CaribeNG: secciones con título, enlaces con icono y badge,
 * grupos desplegables de un nivel y modo contraído a iconos (con tooltip).
 * Dentro de `cb-app-shell` se convierte en panel deslizante en móvil.
 *
 * @example
 * ```html
 * <cb-sidebar [groups]="menu" [(active)]="seccion" [navigate]="navigate">
 *   <img cb-sidebar-header src="logo.svg" alt="Mi banco" />
 * </cb-sidebar>
 * ```
 */
@Component({
  selector: 'cb-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet, CbIcon, CbTooltipDirective],
  host: {
    class: 'cb-sidebar',
    '[class.cb-sidebar--collapsed]': 'isCollapsed()',
  },
  template: `
    <nav class="cb-sidebar__nav" [attr.aria-label]="ariaLabel() ?? t().mainNavigation">
      <div class="cb-sidebar__header"><ng-content select="[cb-sidebar-header]" /></div>

      <div class="cb-sidebar__body">
        @for (group of groups(); track $index; let g = $index) {
          <div class="cb-sidebar__group">
            @if (group.label) {
              <div class="cb-sidebar__group-label" [id]="uid + '-g' + g">{{ group.label }}</div>
            }
            <ul class="cb-sidebar__list" role="list" [attr.aria-labelledby]="group.label ? uid + '-g' + g : null">
              @for (item of group.items; track key(item)) {
                <li>
                  @if (item.children?.length) {
                    <button
                      type="button"
                      class="cb-sidebar__item"
                      [class.cb-sidebar__item--has-active]="hasActiveChild(item)"
                      [disabled]="item.disabled"
                      [attr.aria-expanded]="isCollapsed() ? null : isExpanded(item)"
                      [attr.aria-controls]="isCollapsed() ? null : uid + '-' + key(item)"
                      [cbTooltip]="item.label"
                      cbTooltipPosition="right"
                      [cbTooltipDisabled]="!isCollapsed()"
                      (click)="toggleGroup(item)"
                    >
                      <ng-container *ngTemplateOutlet="content; context: { $implicit: item }" />
                      <cb-icon class="cb-sidebar__chevron" name="chevron-down" [size]="16" aria-hidden="true" />
                    </button>
                    @if (isExpanded(item) && !isCollapsed()) {
                      <ul class="cb-sidebar__sublist" role="list" [id]="uid + '-' + key(item)">
                        @for (child of item.children; track key(child)) {
                          <li>
                            <ng-container *ngTemplateOutlet="leaf; context: { $implicit: child }" />
                          </li>
                        }
                      </ul>
                    }
                  } @else {
                    <ng-container *ngTemplateOutlet="leaf; context: { $implicit: item }" />
                  }
                </li>
              }
            </ul>
          </div>
        }
      </div>

      <div class="cb-sidebar__footer">
        <ng-content select="[cb-sidebar-footer]" />
        @if (collapsible() && !shell?.mobile()) {
          <button
            type="button"
            class="cb-sidebar__collapse"
            [attr.aria-label]="isCollapsed() ? t().expandSidebar : t().collapseSidebar"
            [attr.aria-expanded]="!isCollapsed()"
            [cbTooltip]="t().expandSidebar"
            cbTooltipPosition="right"
            [cbTooltipDisabled]="!isCollapsed()"
            (click)="toggleCollapsed()"
          >
            <cb-icon [name]="isCollapsed() ? 'chevron-right' : 'chevron-left'" [size]="18" aria-hidden="true" />
          </button>
        }
      </div>
    </nav>

    <ng-template #leaf let-item>
      @if (item.url && !item.disabled) {
        <a
          class="cb-sidebar__item"
          [class.cb-sidebar__item--active]="isActive(item)"
          [href]="item.url"
          [attr.target]="item.target || null"
          [attr.aria-current]="isActive(item) ? 'page' : null"
          [cbTooltip]="item.label"
          cbTooltipPosition="right"
          [cbTooltipDisabled]="!isCollapsed()"
          (click)="select(item, $event)"
        >
          <ng-container *ngTemplateOutlet="content; context: { $implicit: item }" />
        </a>
      } @else {
        <button
          type="button"
          class="cb-sidebar__item"
          [class.cb-sidebar__item--active]="isActive(item)"
          [disabled]="item.disabled"
          [attr.aria-current]="isActive(item) ? 'page' : null"
          [cbTooltip]="item.label"
          cbTooltipPosition="right"
          [cbTooltipDisabled]="!isCollapsed()"
          (click)="select(item, $event)"
        >
          <ng-container *ngTemplateOutlet="content; context: { $implicit: item }" />
        </button>
      }
    </ng-template>

    <ng-template #content let-item>
      @if (item.icon) {
        <cb-icon class="cb-sidebar__icon" [name]="item.icon" [size]="20" aria-hidden="true" />
      } @else {
        <span class="cb-sidebar__icon cb-sidebar__initial" aria-hidden="true">{{ item.label.charAt(0) }}</span>
      }
      <span class="cb-sidebar__label">{{ item.label }}</span>
      @if (item.badge !== undefined && item.badge !== '') {
        <span class="cb-sidebar__badge">{{ item.badge }}</span>
      }
    </ng-template>
  `,
  styleUrl: './sidebar.component.css',
})
export class CbSidebar {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** `cb-app-shell` que lo contiene, si hay. */
  protected readonly shell = inject(CB_APP_SHELL, { optional: true });
  protected readonly uid = `cb-sidebar-${++nextUid}`;

  readonly groups = input<readonly CbSidebarGroup[]>([]);
  /** Clave del item activo (`id`, `url` o `label`); se marca con `aria-current="page"`. */
  readonly active = model<string | null>(null);
  /** Contraído a iconos. Dentro de `cb-app-shell` lo controla el shell. */
  readonly collapsed = model(false);
  /** Muestra el botón de contraer/expandir en el pie. */
  readonly collapsible = input(true, { transform: booleanAttribute });
  /** Nombre de la navegación. Por defecto, "Navegación principal". */
  readonly ariaLabel = input<string | undefined>(undefined);
  /**
   * Navegación SPA: si se indica, los enlaces internos (sin `target` ni teclas
   * modificadoras) la llaman en lugar de recargar la página.
   * Ej.: `navigate = (url: string) => this.router.navigateByUrl(url)`.
   */
  readonly navigate = input<((url: string) => unknown) | null>(null);

  /** Item elegido. */
  readonly itemSelect = output<CbSidebarSelectEvent>();

  private readonly expanded = signal<ReadonlySet<string>>(new Set());

  protected readonly isCollapsed = computed(() => {
    const shell = this.shell;
    if (!shell) return this.collapsed();
    return !shell.mobile() && shell.collapsed();
  });

  constructor() {
    // Abre el grupo que contiene el item activo.
    effect(() => {
      const active = this.active();
      const groups = this.groups();
      untracked(() => {
        for (const group of groups) {
          for (const item of group.items) {
            if (item.children?.some((c) => cbSidebarKey(c) === active) && !this.expanded().has(cbSidebarKey(item))) {
              this.expanded.update((set) => new Set(set).add(cbSidebarKey(item)));
            }
          }
        }
      });
    });
  }

  protected key(item: CbSidebarItem): string {
    return cbSidebarKey(item);
  }

  protected isActive(item: CbSidebarItem): boolean {
    return this.active() === cbSidebarKey(item);
  }

  protected hasActiveChild(item: CbSidebarItem): boolean {
    return !!item.children?.some((c) => this.isActive(c));
  }

  protected isExpanded(item: CbSidebarItem): boolean {
    return this.expanded().has(cbSidebarKey(item));
  }

  protected toggleGroup(item: CbSidebarItem): void {
    const key = cbSidebarKey(item);
    if (this.isCollapsed()) {
      // Contraído no caben los hijos: se expande el sidebar y se abre el grupo.
      this.setCollapsed(false);
      this.expanded.update((set) => new Set(set).add(key));
      return;
    }
    this.expanded.update((set) => {
      const next = new Set(set);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  protected toggleCollapsed(): void {
    this.setCollapsed(!this.isCollapsed());
  }

  private setCollapsed(collapsed: boolean): void {
    if (this.shell) this.shell.setCollapsed(collapsed);
    else this.collapsed.set(collapsed);
  }

  /** Marca el item como activo, ejecuta su `command`, emite `itemSelect` y navega. */
  select(item: CbSidebarItem, event: Event): void {
    if (item.disabled) return;
    this.active.set(cbSidebarKey(item));
    item.command?.({ item, originalEvent: event });
    this.itemSelect.emit({ item, originalEvent: event });
    const navigate = this.navigate();
    const mouse = event as MouseEvent;
    const modified = mouse.ctrlKey || mouse.metaKey || mouse.shiftKey || mouse.altKey || mouse.button > 0;
    if (navigate && item.url && !item.target && !modified && !event.defaultPrevented && !/^[a-z][a-z\d+.-]*:/i.test(item.url)) {
      event.preventDefault();
      navigate(item.url);
    }
    this.shell?.closeSidebar();
  }
}
