/** Movimiento del extracto o de los libros (positivo: entra; negativo: sale). */
export interface CbReconItem {
  readonly id: string | number;
  /** `Date` o `AAAA-MM-DD`. */
  readonly date: Date | string;
  readonly description: string;
  readonly amount: number;
  /** Referencia (cheque, transferencia, factura): si coincide, ayuda a emparejar. */
  readonly reference?: string;
}

/** Emparejamiento: uno o varios movimientos del extracto con uno o varios de los libros. */
export interface CbReconMatch {
  readonly statement: readonly (string | number)[];
  readonly ledger: readonly (string | number)[];
}

const cents = (n: number) => Math.round(n * 100);

export function dayOf(value: Date | string): number {
  const d = value instanceof Date ? value : new Date(+value.slice(0, 4), +value.slice(5, 7) - 1, +value.slice(8, 10));
  return Math.round(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000);
}

export function sumAmounts(items: readonly CbReconItem[]): number {
  return cents(items.reduce((t, i) => t + i.amount, 0)) / 100;
}

/** Ids ya emparejados de cada lado. */
export function matchedIds(matches: readonly CbReconMatch[]): { statement: Set<string | number>; ledger: Set<string | number> } {
  return { statement: new Set(matches.flatMap((m) => m.statement)), ledger: new Set(matches.flatMap((m) => m.ledger)) };
}

/**
 * Empareja solo, uno a uno, los movimientos pendientes con el mismo valor y una
 * fecha cercana (`toleranceDays`): primero los de igual referencia, después los
 * de fecha más próxima.
 */
export function autoMatch(statement: readonly CbReconItem[], ledger: readonly CbReconItem[], existing: readonly CbReconMatch[], toleranceDays = 3): CbReconMatch[] {
  const used = matchedIds(existing);
  const free = ledger.filter((l) => !used.ledger.has(l.id));
  const out: CbReconMatch[] = [];
  const pending = statement.filter((s) => !used.statement.has(s.id)).sort((a, b) => dayOf(a.date) - dayOf(b.date));
  for (const s of pending) {
    const candidates = free.filter((l) => cents(l.amount) === cents(s.amount) && Math.abs(dayOf(l.date) - dayOf(s.date)) <= toleranceDays);
    if (!candidates.length) continue;
    const ref = (x: CbReconItem) => (x.reference ?? '').trim().toLowerCase();
    candidates.sort((a, b) => {
      const ra = ref(s) && ref(a) === ref(s) ? 0 : 1;
      const rb = ref(s) && ref(b) === ref(s) ? 0 : 1;
      return ra - rb || Math.abs(dayOf(a.date) - dayOf(s.date)) - Math.abs(dayOf(b.date) - dayOf(s.date));
    });
    const best = candidates[0];
    free.splice(free.indexOf(best), 1);
    out.push({ statement: [s.id], ledger: [best.id] });
  }
  return out;
}
