/** Argumento de `command` en los items de los menús. */
export interface CbMenuCommandEvent<T = unknown> {
  /** Item elegido. */
  readonly item: T;
  /** Evento que lo eligió (clic o teclado), si lo hay. */
  readonly originalEvent?: Event;
}

/** Item con acción y visibilidad, como los de los menús de CaribeNG. */
interface CommandItem {
  command?: (event: CbMenuCommandEvent<never>) => void;
  visible?: boolean;
}

/**
 * Ejecuta el `command` del item (si tiene). Los menús lo llaman al elegir un
 * item, además de emitir su evento de selección.
 */
export function cbRunCommand<T extends object>(item: T, originalEvent?: Event): void {
  (item as CommandItem).command?.({ item: item as never, originalEvent });
}

/**
 * Quita los items con `visible: false`, también dentro de `items` (submenús)
 * y de `groups[].items` (MegaMenu). Devuelve los mismos objetos si no cambia
 * nada, para que la selección emita el objeto original.
 */
export function cbVisibleItems<T extends object>(items: readonly T[]): T[] {
  const result: T[] = [];
  for (const item of items) {
    if ((item as CommandItem).visible === false) continue;
    let copy: Record<string, unknown> | null = null;
    const nested = (item as { items?: unknown }).items;
    if (Array.isArray(nested)) {
      const filtered = cbVisibleItems(nested as object[]);
      if (filtered.length !== nested.length || filtered.some((child, i) => child !== nested[i])) copy = { ...item, items: filtered };
    }
    const groups = (item as { groups?: unknown }).groups;
    if (Array.isArray(groups)) {
      let groupsChanged = false;
      const filteredGroups = (groups as { items?: unknown; visible?: boolean }[])
        .filter((group) => group.visible !== false || !(groupsChanged = true))
        .map((group) => {
          if (!Array.isArray(group.items)) return group;
          const links = cbVisibleItems(group.items as object[]);
          if (links.length === group.items.length && links.every((link, i) => link === (group.items as object[])[i])) return group;
          groupsChanged = true;
          return { ...group, items: links };
        });
      if (groupsChanged) copy = { ...(copy ?? item), groups: filteredGroups };
    }
    result.push((copy as T | null) ?? item);
  }
  return result;
}
