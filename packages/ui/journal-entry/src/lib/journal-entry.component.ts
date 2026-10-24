import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { cbFormat, cbSummarize, injectCbAmount, injectCbTranslation } from '@caribeng/ui';
import { cbAccountOptions, type CbAccount } from '@caribeng/ui/account-picker';
import { CbButton } from '@caribeng/ui/button';
import { CbDataGrid, type CbDataGridColumn } from '@caribeng/ui/datagrid';
import { CbDatepicker } from '@caribeng/ui/datepicker';
import { CbIcon } from '@caribeng/ui/icon';
import { CbInput } from '@caribeng/ui/input';
import { CbSelect } from '@caribeng/ui/select';

/** Línea (movimiento) de un comprobante. */
export interface CbJournalLine {
  readonly id: string | number;
  /** Código de la cuenta. */
  readonly account: string | null;
  readonly thirdParty?: unknown;
  readonly costCenter?: unknown;
  /** Detalle de la línea (si queda vacío, al guardar toma la descripción del comprobante). */
  readonly description?: string | null;
  readonly debit: number | null;
  readonly credit: number | null;
}

/** Comprobante contable (asiento). */
export interface CbJournalEntryData {
  readonly date: Date | null;
  /** Tipo de comprobante (`CE` egreso, `RC` recibo de caja…). */
  readonly type?: unknown;
  readonly number?: string | null;
  readonly description?: string | null;
  readonly lines: readonly CbJournalLine[];
}

/** Opción de tercero, centro de costo o tipo de comprobante. */
export interface CbJournalOption {
  readonly label: string;
  readonly value: unknown;
  readonly description?: string;
}

let nextUid = 0;
let nextLine = 0;

/** Comprobante vacío con dos líneas. */
export function cbEmptyJournalEntry(date: Date | null = new Date()): CbJournalEntryData {
  const line = (): CbJournalLine => ({ id: `l${Date.now().toString(36)}${++nextLine}`, account: null, thirdParty: null, costCenter: null, description: null, debit: null, credit: null });
  return { date, type: null, number: null, description: null, lines: [line(), line()] };
}

/**
 * Editor de comprobante contable de CaribeNG: cabecera (fecha, tipo, número y
 * descripción) y líneas con cuenta, tercero, centro de costo, detalle, débito y
 * crédito, editables como una hoja de cálculo.
 *
 * - La cuenta se busca por código o nombre en el plan de cuentas y solo admite
 *   cuentas de movimiento; escribir el débito borra el crédito de la línea y al revés.
 * - Totales de débitos y créditos con la diferencia en vivo; «Cuadrar» pone la
 *   diferencia en la última línea vacía (o en una nueva).
 * - Guardar (o Ctrl + Enter) valida fecha, líneas, cuentas y que cuadre, y emite `save`.
 *
 * @example
 * ```html
 * <cb-journal-entry [(entry)]="comprobante" [accounts]="puc" [thirdParties]="terceros" (save)="guardar($event)" />
 * ```
 */
@Component({
  selector: 'cb-journal-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbDataGrid, CbDatepicker, CbInput, CbSelect, CbButton, CbIcon],
  host: { class: 'cb-journal-entry', '(keydown)': 'onKeydown($event)' },
  template: `
    <div class="cb-je__header" role="group" [attr.aria-label]="ariaLabel() || t().journalHeader">
      <cb-datepicker class="cb-je__date" [label]="t().journalDate" [value]="entry().date" (valueChange)="patch({ date: $event })" [disabled]="readonly()" [invalid]="tried() && !entry().date" />
      @if (types().length) {
        <div class="cb-je__type">
          <span class="cb-je__label" [id]="uid + '-type'">{{ t().journalType }}</span>
          <cb-select [ariaLabelledBy]="uid + '-type'" [options]="types()" optionValue="value" [value]="entry().type" (valueChange)="patch({ type: $event })" [disabled]="readonly()" [placeholder]="t().select" />
        </div>
      }
      <cb-input class="cb-je__number" [label]="t().journalNumber" [value]="entry().number ?? ''" (valueChange)="patch({ number: $event })" [readonly]="readonly()" />
      <cb-input class="cb-je__desc" [label]="t().journalDescription" [value]="entry().description ?? ''" (valueChange)="patch({ description: $event })" [readonly]="readonly()" />
    </div>

    <cb-data-grid
      #grid
      [rows]="entry().lines"
      (rowsChange)="patch({ lines: $event })"
      [columns]="columns()"
      [newRow]="newLine"
      [editable]="!readonly()"
      [currency]="currency()"
      [scrollHeight]="scrollHeight()"
      [ariaLabel]="t().journalLines"
    />

    <div class="cb-je__footer">
      <dl class="cb-je__totals" aria-live="polite">
        <div>
          <dt>{{ t().journalDebit }}</dt>
          <dd>{{ money(totals().debit) }}</dd>
        </div>
        <div>
          <dt>{{ t().journalCredit }}</dt>
          <dd>{{ money(totals().credit) }}</dd>
        </div>
        <div [class.cb-je__diff--off]="totals().difference !== 0">
          <dt>{{ t().journalDifference }}</dt>
          <dd>{{ money(totals().difference) }}</dd>
        </div>
      </dl>
      <span class="cb-je__status" [class.cb-je__status--ok]="balanced()">
        <cb-icon [name]="balanced() ? 'check' : 'circle-alert'" [size]="15" aria-hidden="true" />
        {{ balanced() ? t().journalBalanced : t().journalUnbalanced }}
      </span>
      @if (!readonly()) {
        <span class="cb-je__spacer"></span>
        <cb-button variant="outlined" [disabled]="totals().difference === 0" (click)="balance()">{{ t().journalBalance }}</cb-button>
        <cb-button [loading]="saving()" (click)="submit()">{{ saveLabel() || t().journalSave }}</cb-button>
      }
    </div>

    @if (tried() && problems().length) {
      <div class="cb-je__errors" role="alert">
        <p>{{ t().journalCannotSave }}</p>
        <ul>
          @for (p of problems(); track $index) {
            <li>{{ p }}</li>
          }
        </ul>
      </div>
    }
  `,
  styleUrl: './journal-entry.component.css',
})
export class CbJournalEntry {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly amount = injectCbAmount();
  protected readonly uid = `cb-journal-entry-${++nextUid}`;
  private readonly grid = viewChild.required(CbDataGrid);

  /** Comprobante (bidireccional). */
  readonly entry = model<CbJournalEntryData>(cbEmptyJournalEntry());
  /** Plan de cuentas: solo se eligen cuentas de movimiento. */
  readonly accounts = input<readonly CbAccount[]>([]);
  /** Terceros (sin ellos no se muestra la columna). */
  readonly thirdParties = input<readonly CbJournalOption[]>([]);
  /** Centros de costo (sin ellos no se muestra la columna). */
  readonly costCenters = input<readonly CbJournalOption[]>([]);
  /** Tipos de comprobante (sin ellos no se muestra el campo). */
  readonly types = input<readonly CbJournalOption[]>([]);
  /** Cuentas que exigen tercero (por prefijo de código, p. ej. `['13', '22']`). */
  readonly thirdPartyRequired = input<readonly string[]>([]);
  /** Moneda de los importes (si no, la de `provideCaribeNG({ currency })`). */
  readonly currency = input<string | undefined>(undefined);
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  /** Muestra el botón de guardar cargando. */
  readonly saving = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly saveLabel = input<string | undefined>(undefined);
  readonly scrollHeight = input<string | null>('22rem');
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Comprobante válido y cuadrado al guardar (líneas sin importe quitadas, detalles heredados). */
  readonly save = output<CbJournalEntryData>();
  /** Se intentó guardar con problemas: cuáles. */
  readonly invalid = output<string[]>();

  /** Se intentó guardar (desde entonces se muestran los problemas). */
  protected readonly tried = signal(false);

  private readonly accountOptions = computed(() => cbAccountOptions(this.accounts()));

  protected readonly columns = computed<CbDataGridColumn<CbJournalLine>[]>(() => {
    const t = this.t();
    const needsThird = this.thirdPartyRequired();
    const cols: CbDataGridColumn<CbJournalLine>[] = [
      {
        field: 'account',
        header: t.journalAccount,
        type: 'autocomplete',
        options: this.accountOptions(),
        width: '15rem',
        sortable: false,
        // Solo se exige en las líneas que ya tienen algo (las vacías se quitan al guardar).
        validate: (v, row) => (!v && (row.debit || row.credit || row.description) ? t.journalAccountRequired : null),
      },
    ];
    if (this.thirdParties().length) {
      cols.push({
        field: 'thirdParty',
        header: t.journalThirdParty,
        type: 'autocomplete',
        options: this.thirdParties(),
        width: '12rem',
        sortable: false,
        validate: (v, row) => (!v && row.account && needsThird.some((p) => String(row.account).startsWith(p)) ? t.journalThirdPartyRequired : null),
      });
    }
    if (this.costCenters().length) cols.push({ field: 'costCenter', header: t.journalCostCenter, type: 'autocomplete', options: this.costCenters(), width: '10rem', sortable: false });
    cols.push(
      { field: 'description', header: t.journalLineDescription, width: '12rem', sortable: false },
      {
        field: 'debit',
        header: t.journalDebit,
        type: 'number',
        currency: true,
        min: 0,
        width: '9.5rem',
        sortable: false,
        summary: 'sum',
        onEdit: (v) => (v ? { credit: null } : null),
        validate: (v, row) => (!v && !row.credit && row.account ? t.journalAmountRequired : null),
      },
      { field: 'credit', header: t.journalCredit, type: 'number', currency: true, min: 0, width: '9.5rem', sortable: false, summary: 'sum', onEdit: (v) => (v ? { debit: null } : null) },
    );
    return cols;
  });

  /** Totales de débitos y créditos y su diferencia. */
  readonly totals = computed(() => {
    const lines = this.entry().lines;
    const debit = cbSummarize(lines.map((l) => l.debit), 'sum') ?? 0;
    const credit = cbSummarize(lines.map((l) => l.credit), 'sum') ?? 0;
    return { debit, credit, difference: Math.round((debit - credit) * 100) / 100 };
  });

  /** Débitos y créditos iguales y mayores que cero. */
  readonly balanced = computed(() => this.totals().difference === 0 && this.totals().debit > 0);

  /** Problemas que impiden guardar. */
  readonly problems = computed<string[]>(() => {
    const t = this.t();
    const e = this.entry();
    const out: string[] = [];
    if (!e.date) out.push(t.journalErrDate);
    const withAmount = e.lines.filter((l) => l.debit || l.credit);
    if (withAmount.length < 2) out.push(t.journalErrLines);
    if (this.totals().difference !== 0) out.push(cbFormat(t.journalErrUnbalanced, this.money(this.totals().difference)));
    const errors = this.grid().errors().filter((err) => {
      const line = e.lines.find((l) => l.id === err.key);
      // Las líneas totalmente vacías se ignoran (se quitan al guardar).
      return line && (line.account || line.debit || line.credit || line.description);
    });
    if (errors.length) out.push(cbFormat(t.journalErrCells, errors.length));
    return out;
  });

  protected readonly newLine = (): CbJournalLine => ({ id: `l${Date.now().toString(36)}${++nextLine}`, account: null, thirdParty: null, costCenter: null, description: null, debit: null, credit: null });

  protected money(value: number): string {
    return this.amount(value, this.currency() ? { currency: this.currency() } : {});
  }

  protected patch(change: Partial<CbJournalEntryData>): void {
    this.entry.update((e) => ({ ...e, ...change }));
  }

  /** Pone la diferencia en la última línea sin importe (o en una nueva) para que cuadre. */
  balance(): void {
    const diff = this.totals().difference;
    if (diff === 0 || this.readonly()) return;
    const amount = { debit: diff < 0 ? -diff : null, credit: diff > 0 ? diff : null };
    const lines = [...this.entry().lines];
    const i = lines.map((l) => !l.debit && !l.credit).lastIndexOf(true);
    if (i >= 0) lines[i] = { ...lines[i], ...amount };
    else lines.push({ ...this.newLine(), ...amount });
    this.patch({ lines });
  }

  /** Valida y, si está todo bien, emite `save`. */
  submit(): void {
    if (this.readonly()) return;
    this.tried.set(true);
    const problems = this.problems();
    if (problems.length) {
      this.invalid.emit(problems);
      return;
    }
    const e = this.entry();
    const description = e.description?.trim() || null;
    this.save.emit({
      ...e,
      lines: e.lines.filter((l) => l.debit || l.credit).map((l) => ({ ...l, description: l.description?.trim() || description })),
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.submit();
    }
  }
}
