/** Naturaleza de una cuenta: aumenta por el débito (activo, gasto) o por el crédito (pasivo, patrimonio, ingreso). */
export type CbAccountNature = 'debit' | 'credit';

/** Cuenta del plan de cuentas (PUC). */
export interface CbAccount {
  /** Código: `1`, `11`, `1105`, `110505`… */
  readonly code: string;
  readonly name: string;
  /**
   * Código de la cuenta padre. Si se omite, se deduce del código: la cuenta
   * existente con el prefijo más largo (`110505` → `1105`).
   */
  readonly parent?: string | null;
  /** Admite movimientos. Por defecto, las cuentas sin hijas. */
  readonly postable?: boolean;
  readonly nature?: CbAccountNature;
  /** Inactiva: se ve pero no se puede elegir. */
  readonly disabled?: boolean;
}

/** Cuenta con su jerarquía resuelta. */
export interface CbResolvedAccount extends CbAccount {
  readonly level: number;
  /** Antepasados, de la raíz al padre. */
  readonly ancestors: readonly CbAccount[];
  readonly postable: boolean;
  readonly childCount: number;
}

/** Resuelve padre, nivel, antepasados y si admite movimientos, en el orden del código. */
export function resolveAccounts(accounts: readonly CbAccount[]): CbResolvedAccount[] {
  const byCode = new Map(accounts.map((a) => [a.code, a]));
  const parentOf = (a: CbAccount): CbAccount | null => {
    if (a.parent !== undefined) return a.parent ? (byCode.get(a.parent) ?? null) : null;
    for (let len = a.code.length - 1; len > 0; len--) {
      const p = byCode.get(a.code.slice(0, len));
      if (p) return p;
    }
    return null;
  };
  const children = new Map<string, number>();
  const parents = new Map<string, CbAccount | null>();
  for (const a of accounts) {
    const p = parentOf(a);
    parents.set(a.code, p);
    if (p) children.set(p.code, (children.get(p.code) ?? 0) + 1);
  }
  const ancestorsOf = (a: CbAccount): CbAccount[] => {
    const out: CbAccount[] = [];
    const seen = new Set<string>([a.code]);
    let p = parents.get(a.code) ?? null;
    while (p && !seen.has(p.code)) {
      out.unshift(p);
      seen.add(p.code);
      p = parents.get(p.code) ?? null;
    }
    return out;
  };
  return [...accounts]
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: false }))
    .map((a) => {
      const ancestors = ancestorsOf(a);
      const childCount = children.get(a.code) ?? 0;
      return { ...a, ancestors, level: ancestors.length + 1, childCount, postable: a.postable ?? childCount === 0 };
    });
}

/** `110505 Caja general`. */
export function accountLabel(account: CbAccount): string {
  return `${account.code} ${account.name}`;
}

/** Ruta de antepasados: `1 Activo › 11 Disponible › 1105 Caja`. */
export function accountPath(account: CbResolvedAccount, separator = ' › '): string {
  return account.ancestors.map(accountLabel).join(separator);
}

function fold(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/**
 * Cuentas que coinciden con lo escrito: las que empiezan por el código primero
 * (`1105` encuentra `1105` y `110505`), después las que contienen el texto en el
 * nombre o la ruta; sin distinguir mayúsculas ni tildes.
 */
export function searchAccounts(accounts: readonly CbResolvedAccount[], text: string, limit = 50): CbResolvedAccount[] {
  const q = fold(text);
  if (!q) return accounts.slice(0, limit);
  const byCode: CbResolvedAccount[] = [];
  const byName: CbResolvedAccount[] = [];
  const words = q.split(/\s+/);
  for (const a of accounts) {
    if (a.code.startsWith(q) || fold(accountLabel(a)).startsWith(q)) byCode.push(a);
    else {
      const haystack = fold(`${a.name} ${a.ancestors.map((x) => x.name).join(' ')}`);
      if (words.every((w) => haystack.includes(w))) byName.push(a);
    }
  }
  return [...byCode, ...byName].slice(0, limit);
}

/**
 * Opciones para una columna `autocomplete` del Data Grid (o un `select`):
 * etiqueta `código nombre`, la ruta como descripción y, por defecto, solo las
 * cuentas de movimiento.
 */
export function cbAccountOptions(
  accounts: readonly CbAccount[],
  options: { postableOnly?: boolean } = {},
): { label: string; value: string; description: string; disabled: boolean }[] {
  return resolveAccounts(accounts)
    .filter((a) => !(options.postableOnly ?? true) || a.postable)
    .map((a) => ({ label: accountLabel(a), value: a.code, description: accountPath(a), disabled: !!a.disabled || !a.postable }));
}
