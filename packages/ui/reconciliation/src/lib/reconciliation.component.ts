import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, model, output, signal } from '@angular/core';
import { cbFormat, injectCbAmount, injectCbTranslation } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { autoMatch, dayOf, matchedIds, sumAmounts, type CbReconItem, type CbReconMatch } from './reconciliation-model';

type Side = 'statement' | 'ledger';

let nextUid = 0;

/**
 * Conciliación bancaria de CaribeNG: el extracto del banco frente a los
 * movimientos en libros, para emparejarlos y ver qué queda pendiente.
 *
 * - «Conciliar automáticamente» empareja los de igual valor y fecha cercana
 *   (`toleranceDays`), dando prioridad a la misma referencia.
 * - Se marcan movimientos de cada lado y «Emparejar» los une cuando sus sumas
 *   coinciden (uno con uno, uno con varios o varios con uno).
 * - Resumen con los pendientes de cada lado y la diferencia; `createEntry` sirve
 *   para registrar en libros un movimiento del extracto (comisiones, intereses).
 *
 * @example
 * ```html
 * <cb-reconciliation [statement]="extracto" [ledger]="libros" [(matches)]="conciliados" />
 * ```
 */
@Component({
  selector: 'cb-reconciliation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbButton, CbIcon],
  host: { class: 'cb-reconciliation' },
  template: `
    <div class="cb-rc__summary">
      <div class="cb-rc__stat">
        <span class="cb-rc__stat-label">{{ t().reconStatementPending }}</span>
        <span class="cb-rc__stat-value">{{ money(pendingSum('statement')) }}</span>
        <span class="cb-rc__stat-sub">{{ fmt(t().reconItems, pending('statement').length) }}</span>
      </div>
      <div class="cb-rc__stat">
        <span class="cb-rc__stat-label">{{ t().reconLedgerPending }}</span>
        <span class="cb-rc__stat-value">{{ money(pendingSum('ledger')) }}</span>
        <span class="cb-rc__stat-sub">{{ fmt(t().reconItems, pending('ledger').length) }}</span>
      </div>
      <div class="cb-rc__stat">
        <span class="cb-rc__stat-label">{{ t().reconProgress }}</span>
        <span class="cb-rc__stat-value">{{ pct(progress()) }}</span>
        <span class="cb-rc__progress" aria-hidden="true"><span [style.width.%]="progress() * 100"></span></span>
      </div>
    </div>

    <div class="cb-rc__toolbar" role="toolbar" [attr.aria-label]="t().reconToolbar">
      @if (!readonly()) {
        <cb-button size="sm" variant="outlined" (click)="runAuto()">
          <cb-icon name="sparkles" [size]="15" aria-hidden="true" />
          {{ t().reconAuto }}
        </cb-button>
        <cb-button size="sm" [disabled]="!canMatch()" (click)="matchSelection()">
          <cb-icon name="merge" [size]="15" aria-hidden="true" />
          {{ t().reconMatch }}
        </cb-button>
        <cb-button size="sm" variant="text" severity="secondary" [disabled]="!selectedMatched()" (click)="unmatchSelection()">{{ t().reconUnmatch }}</cb-button>
      }
      <span class="cb-rc__spacer"></span>
      @if (hasSelection()) {
        <span class="cb-rc__selection" [class.cb-rc__selection--ok]="selectionDiff() === 0" aria-live="polite">
          {{ fmt(t().reconSelection, money(selectedSum('statement')), money(selectedSum('ledger'))) }}
          @if (selectionDiff() !== 0) {
            · {{ fmt(t().reconDiff, money(selectionDiff())) }}
          }
        </span>
      }
      <label class="cb-rc__filter">
        <input type="checkbox" [checked]="onlyPending()" (change)="onlyPending.set($any($event.target).checked)" />
        {{ t().reconOnlyPending }}
      </label>
    </div>

    <div class="cb-rc__sides">
      @for (side of sides; track side) {
        <section class="cb-rc__side" [attr.aria-labelledby]="uid + '-' + side">
          <header class="cb-rc__side-head">
            <h3 [id]="uid + '-' + side">{{ side === 'statement' ? statementLabel() || t().reconStatement : ledgerLabel() || t().reconLedger }}</h3>
            <span>{{ money(total(side)) }}</span>
          </header>
          <ul class="cb-rc__list">
            @for (item of visible(side); track item.id) {
              <li class="cb-rc__item" [class.cb-rc__item--matched]="isMatched(side, item)" [class.cb-rc__item--selected]="isSelected(side, item)">
                <label class="cb-rc__label">
                  <input type="checkbox" [checked]="isSelected(side, item)" [disabled]="readonly()" (change)="toggle(side, item)" />
                  <span class="cb-rc__date">{{ shortDate(item.date) }}</span>
                  <span class="cb-rc__desc">
                    {{ item.description }}
                    @if (item.reference) {
                      <span class="cb-rc__ref">{{ item.reference }}</span>
                    }
                  </span>
                  <span class="cb-rc__amount" [class.cb-rc__amount--out]="item.amount < 0">{{ money(item.amount) }}</span>
                  @if (isMatched(side, item)) {
                    <cb-icon class="cb-rc__linked" name="check" [size]="14" aria-hidden="true" />
                    <span class="cb-rc__sr">{{ t().reconMatched }}</span>
                  }
                </label>
                @if (side === 'statement' && allowCreate() && !isMatched(side, item) && !readonly()) {
                  <button type="button" class="cb-rc__create" [attr.aria-label]="fmt(t().reconCreateFor, item.description)" [title]="t().reconCreate" (click)="createEntry.emit(item)">
                    <cb-icon name="plus" [size]="14" aria-hidden="true" />
                  </button>
                }
              </li>
            } @empty {
              <li class="cb-rc__empty">{{ onlyPending() ? t().reconNothingPending : t().noData }}</li>
            }
          </ul>
        </section>
      }
    </div>
    <div class="cb-rc__sr" role="status">{{ announcement() }}</div>
  `,
  styleUrl: './reconciliation.component.css',
})
export class CbReconciliation {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly amount = injectCbAmount();
  protected readonly uid = `cb-reconciliation-${++nextUid}`;
  protected readonly sides: Side[] = ['statement', 'ledger'];

  /** Movimientos del extracto bancario. */
  readonly statement = input<readonly CbReconItem[]>([]);
  /** Movimientos en libros (cuenta de bancos). */
  readonly ledger = input<readonly CbReconItem[]>([]);
  /** Emparejamientos (bidireccional). */
  readonly matches = model<readonly CbReconMatch[]>([]);
  /** Días de diferencia admitidos al conciliar automáticamente. */
  readonly toleranceDays = input<number>(3);
  readonly statementLabel = input<string>('');
  readonly ledgerLabel = input<string>('');
  /** Botón «Crear asiento» en los movimientos del extracto sin pareja. */
  readonly allowCreate = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly currency = input<string | undefined>(undefined);

  /** Registrar en libros un movimiento del extracto. */
  readonly createEntry = output<CbReconItem>();

  protected readonly onlyPending = signal(false);
  private readonly selection = signal<{ statement: ReadonlySet<string | number>; ledger: ReadonlySet<string | number> }>({ statement: new Set(), ledger: new Set() });
  protected readonly announcement = signal('');

  private readonly matched = computed(() => matchedIds(this.matches()));

  protected items(side: Side): readonly CbReconItem[] {
    return side === 'statement' ? this.statement() : this.ledger();
  }

  protected visible(side: Side): CbReconItem[] {
    const list = [...this.items(side)].sort((a, b) => dayOf(a.date) - dayOf(b.date));
    return this.onlyPending() ? list.filter((i) => !this.isMatched(side, i)) : list;
  }

  protected pending(side: Side): CbReconItem[] {
    return this.items(side).filter((i) => !this.isMatched(side, i));
  }

  protected pendingSum(side: Side): number {
    return sumAmounts(this.pending(side));
  }

  protected total(side: Side): number {
    return sumAmounts(this.items(side));
  }

  protected readonly progress = computed(() => {
    const all = this.statement().length + this.ledger().length;
    return all ? (this.matched().statement.size + this.matched().ledger.size) / all : 0;
  });

  protected isMatched(side: Side, item: CbReconItem): boolean {
    return this.matched()[side].has(item.id);
  }

  protected isSelected(side: Side, item: CbReconItem): boolean {
    return this.selection()[side].has(item.id);
  }

  protected selectedItems(side: Side): CbReconItem[] {
    return this.items(side).filter((i) => this.selection()[side].has(i.id));
  }

  protected selectedSum(side: Side): number {
    return sumAmounts(this.selectedItems(side));
  }

  protected readonly hasSelection = computed(() => this.selection().statement.size + this.selection().ledger.size > 0);
  protected readonly selectionDiff = computed(() => Math.round((this.selectedSum('statement') - this.selectedSum('ledger')) * 100) / 100);
  /** Se puede emparejar: hay de los dos lados, nada ya emparejado y las sumas coinciden. */
  protected readonly canMatch = computed(() => {
    const s = this.selectedItems('statement');
    const l = this.selectedItems('ledger');
    return s.length > 0 && l.length > 0 && this.selectionDiff() === 0 && !s.some((i) => this.isMatched('statement', i)) && !l.some((i) => this.isMatched('ledger', i));
  });
  protected readonly selectedMatched = computed(() => this.sides.some((side) => this.selectedItems(side).some((i) => this.isMatched(side, i))));

  protected money(value: number): string {
    return this.amount(value, this.currency() ? { currency: this.currency() } : {});
  }

  protected pct(value: number): string {
    return new Intl.NumberFormat(this.t().intlLocale, { style: 'percent', maximumFractionDigits: 0 }).format(value);
  }

  protected shortDate(value: Date | string): string {
    const d = value instanceof Date ? value : new Date(+value.slice(0, 4), +value.slice(5, 7) - 1, +value.slice(8, 10));
    return new Intl.DateTimeFormat(this.t().intlLocale, { day: '2-digit', month: 'short' }).format(d).replace(/\./g, '');
  }

  protected toggle(side: Side, item: CbReconItem): void {
    this.selection.update((sel) => {
      const next = new Set(sel[side]);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return { ...sel, [side]: next };
    });
  }

  /** Empareja los movimientos pendientes de igual valor y fecha cercana. */
  runAuto(): void {
    const found = autoMatch(this.statement(), this.ledger(), this.matches(), this.toleranceDays());
    if (found.length) this.matches.update((m) => [...m, ...found]);
    this.say(cbFormat(this.t().reconAutoDone, found.length));
  }

  /** Une lo seleccionado de los dos lados (si sus sumas coinciden). */
  matchSelection(): void {
    if (!this.canMatch()) return;
    const match: CbReconMatch = { statement: this.selectedItems('statement').map((i) => i.id), ledger: this.selectedItems('ledger').map((i) => i.id) };
    this.matches.update((m) => [...m, match]);
    this.clearSelection();
    this.say(this.t().reconMatchedDone);
  }

  /** Deshace los emparejamientos que tocan lo seleccionado. */
  unmatchSelection(): void {
    const sel = this.selection();
    const keep = this.matches().filter((m) => !m.statement.some((id) => sel.statement.has(id)) && !m.ledger.some((id) => sel.ledger.has(id)));
    const removed = this.matches().length - keep.length;
    this.matches.set(keep);
    this.clearSelection();
    this.say(cbFormat(this.t().reconUnmatchedDone, removed));
  }

  private clearSelection(): void {
    this.selection.set({ statement: new Set(), ledger: new Set() });
  }

  private say(message: string): void {
    this.announcement.set('');
    queueMicrotask(() => this.announcement.set(message));
  }
}
