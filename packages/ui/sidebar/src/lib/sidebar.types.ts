import { InjectionToken, type Signal } from '@angular/core';

/** Enlace o acción del menú lateral. */
export interface CbSidebarItem {
  /** Identificador para `active`. Por defecto, la `url` o el `label`. */
  id?: string;
  label: string;
  icon?: string;
  url?: string;
  target?: string;
  /** Contador o etiqueta a la derecha ("3", "Nuevo"). */
  badge?: string | number;
  disabled?: boolean;
  /** Subelementos (un nivel): el item se convierte en un grupo desplegable. */
  children?: readonly CbSidebarItem[];
  /** Acción al elegirlo (además del evento `itemSelect`). */
  command?: (event: CbSidebarSelectEvent) => void;
}

/** Sección del menú lateral con título opcional. */
export interface CbSidebarGroup {
  label?: string;
  items: readonly CbSidebarItem[];
}

export interface CbSidebarSelectEvent {
  readonly item: CbSidebarItem;
  readonly originalEvent: Event;
}

/** Clave de un item para `active`. */
export function cbSidebarKey(item: CbSidebarItem): string {
  return item.id ?? item.url ?? item.label;
}

/** Estado del `cb-app-shell` compartido con el sidebar y los botones `cbSidebarToggle`. */
export interface CbAppShellState {
  /** Ancho por debajo del punto de corte: el sidebar es un panel deslizante. */
  readonly mobile: Signal<boolean>;
  /** Panel abierto (solo en móvil). */
  readonly sidebarOpen: Signal<boolean>;
  /** Sidebar contraído a iconos (solo en escritorio). */
  readonly collapsed: Signal<boolean>;
  readonly sidebarId: string;
  /** En móvil abre o cierra el panel; en escritorio contrae o expande. */
  toggle(): void;
  setCollapsed(collapsed: boolean): void;
  /** Cierra el panel móvil (p. ej. al navegar). */
  closeSidebar(): void;
}

export const CB_APP_SHELL = new InjectionToken<CbAppShellState>('CB_APP_SHELL');
