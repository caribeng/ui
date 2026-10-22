import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { CB_APP_SHELL, type CbAppShellState } from './sidebar.types';

let nextUid = 0;

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Esqueleto de aplicación de CaribeNG: menú lateral, cabecera y contenido.
 * En escritorio el sidebar es una columna que se puede contraer; por debajo de
 * `breakpoint` (medido en el propio shell) pasa a ser un panel deslizante con
 * fondo, cierre con Escape y foco atrapado mientras está abierto.
 *
 * @example
 * ```html
 * <cb-app-shell style="height: 100vh">
 *   <cb-sidebar [groups]="menu" />
 *   <header cb-app-shell-header>
 *     <button type="button" cbSidebarToggle><cb-icon name="menu" /></button>
 *   </header>
 *   <router-outlet />
 * </cb-app-shell>
 * ```
 */
@Component({
  selector: 'cb-app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [A11yModule],
  providers: [{ provide: CB_APP_SHELL, useExisting: forwardRef(() => CbAppShell) }],
  host: {
    class: 'cb-app-shell',
    '[class.cb-app-shell--mobile]': 'mobile()',
    '[class.cb-app-shell--open]': 'mobile() && sidebarOpen()',
    '[class.cb-app-shell--collapsed]': '!mobile() && collapsed()',
  },
  template: `
    <div
      class="cb-app-shell__sidebar"
      [id]="sidebarId"
      [attr.inert]="mobile() && !sidebarOpen() ? '' : null"
      [cdkTrapFocus]="mobile() && sidebarOpen()"
      (keydown.escape)="onEscape($event)"
    >
      <ng-content select="cb-sidebar, [cb-app-shell-sidebar]" />
    </div>
    @if (mobile() && sidebarOpen()) {
      <div class="cb-app-shell__backdrop" aria-hidden="true" (click)="closeSidebar()"></div>
    }
    <div class="cb-app-shell__main">
      <ng-content select="[cb-app-shell-header]" />
      <div class="cb-app-shell__content"><ng-content /></div>
    </div>
  `,
  styleUrl: './app-shell.component.css',
})
export class CbAppShell implements CbAppShellState {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private previouslyFocused: HTMLElement | null = null;

  readonly sidebarId = `cb-app-shell-sidebar-${++nextUid}`;

  /** Ancho (px) del shell por debajo del cual el sidebar es un panel deslizante. */
  readonly breakpoint = input<number>(768);
  /** Panel abierto en móvil. */
  readonly sidebarOpen = model(false);
  /** Sidebar contraído a iconos en escritorio. */
  readonly collapsed = model(false);
  /** Fuerza el modo móvil (útil en pruebas o vistas embebidas). */
  readonly forceMobile = input(false, { transform: booleanAttribute });

  private readonly width = signal<number | null>(null);
  readonly mobile = computed(() => {
    if (this.forceMobile()) return true;
    const width = this.width();
    return width !== null && width < this.breakpoint();
  });

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;
      this.width.set(el.getBoundingClientRect().width);
      const view = this.document.defaultView as (Window & { ResizeObserver?: typeof ResizeObserver }) | null;
      if (!view?.ResizeObserver) return;
      const observer = new view.ResizeObserver((entries) => this.width.set(entries[0].contentRect.width));
      observer.observe(el);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });

    // Al abrir el panel móvil se enfoca su primer control; al cerrarlo, vuelve el foco.
    effect(() => {
      const open = this.mobile() && this.sidebarOpen();
      untracked(() => {
        if (open) {
          this.previouslyFocused = this.document.activeElement as HTMLElement | null;
          afterNextRender(
            () => this.host.nativeElement.querySelector<HTMLElement>(`#${this.sidebarId}`)?.querySelector<HTMLElement>(FOCUSABLE)?.focus(),
            { injector: this.injector },
          );
        } else if (this.previouslyFocused) {
          const target = this.previouslyFocused;
          this.previouslyFocused = null;
          if (target.isConnected) afterNextRender(() => target.focus(), { injector: this.injector });
        }
      });
    });

    // Al pasar a escritorio no queda un panel "abierto" colgado.
    effect(() => {
      if (!this.mobile()) untracked(() => this.sidebarOpen.set(false));
    });
  }


  toggle(): void {
    if (this.mobile()) this.sidebarOpen.update((open) => !open);
    else this.collapsed.update((collapsed) => !collapsed);
  }

  setCollapsed(collapsed: boolean): void {
    this.collapsed.set(collapsed);
  }

  closeSidebar(): void {
    if (this.mobile()) this.sidebarOpen.set(false);
  }

  protected onEscape(event: Event): void {
    if (!this.mobile() || !this.sidebarOpen()) return;
    event.preventDefault();
    this.closeSidebar();
  }
}
