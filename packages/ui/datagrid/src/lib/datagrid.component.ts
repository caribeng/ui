import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
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
import { CB_CONFIG, cbFormat, cbSummarize, injectCbTranslation, type CbNegativeStyle } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import {
  cellText,
  compareCells,
  copyText,
  fromTsv,
  inRange,
  isEmpty,
  parseCell,
  rangeOf,
  toTsv,
  validateCell,
  type CbDataGridCellChange,
  type CbDataGridColumn,
  type CbDataGridError,
  type CbDataGridRow,
  type CellPos,
  type ValidationTexts,
} from './datagrid-model';

/** Pasos de RePág / AvPág. */
const PAGE = 10;
/** Cambios que se pueden deshacer. */
const HISTORY = 100;

interface Editing {
  readonly r: number;
  readonly c: number;
  readonly text: string;
  /** `native`: editor propio del tipo (fecha, lista); `text`: se empezó escribiendo. */
  readonly mode: 'native' | 'text';
  readonly error: string | null;
}

interface Patch<T> {
  readonly row: T;
  readonly field: string;
  readonly value: unknown;
}

let nextUid = 0;
let nextKey = 0;

/**
 * Data Grid editable de CaribeNG: una tabla que se edita como una hoja de cálculo.
 *
 * - Celdas con tipo (texto, número, lista, fecha, casilla), validación por columna
 *   (`required`, `min`, `max`, `validate`) y marca de las celdas cambiadas.
 * - Teclado de hoja de cálculo: flechas, Mayús + flechas para seleccionar, Enter o
 *   F2 para editar, escribir para reemplazar, Supr para borrar, Ctrl + Z / Y,
 *   Ctrl + D para rellenar hacia abajo.
 * - Copiar, cortar y pegar rangos en el formato de Excel y Google Sheets (TSV).
 * - Añadir y eliminar filas, ordenar por columna y deshacer cualquier cambio.
 *
 * @example
 * ```html
 * <cb-data-grid [(rows)]="filas" [columns]="columnas" dataKey="id" (cellChange)="guardar($event)" />
 * ```
 */
@Component({
  selector: 'cb-data-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-data-grid',
    '[class.cb-data-grid--readonly]': '!editable()',
    '(document:pointerup)': 'dragging = false',
  },
  template: `
    @if (toolbar()) {
      <div class="cb-dg__toolbar" role="toolbar" [attr.aria-label]="ariaLabel() || t().dataGridToolbar" [attr.aria-controls]="uid">
        @if (editable()) {
          <button type="button" class="cb-dg__btn" (click)="addRow()">
            <cb-icon name="plus" [size]="16" aria-hidden="true" />
            {{ t().dataGridAddRow }}
          </button>
          <button type="button" class="cb-dg__btn" [disabled]="!view().length" (click)="deleteRows()">
            <cb-icon name="trash" [size]="16" aria-hidden="true" />
            {{ selectedRowCount() > 1 ? fmt(t().dataGridDeleteRows, selectedRowCount()) : t().dataGridDeleteRow }}
          </button>
          <span class="cb-dg__sep" aria-hidden="true"></span>
          <button type="button" class="cb-dg__icon-btn" [attr.aria-label]="t().undo" [disabled]="!canUndo()" (click)="undo()">
            <cb-icon name="undo" [size]="16" aria-hidden="true" />
          </button>
          <button type="button" class="cb-dg__icon-btn" [attr.aria-label]="t().redo" [disabled]="!canRedo()" (click)="redo()">
            <cb-icon name="redo" [size]="16" aria-hidden="true" />
          </button>
        }
        <span class="cb-dg__spacer"></span>
        @if (errors().length) {
          <button type="button" class="cb-dg__errors" (click)="goToFirstError()">
            <cb-icon name="circle-alert" [size]="16" aria-hidden="true" />
            {{ errors().length === 1 ? t().dataGridOneError : fmt(t().dataGridErrors, errors().length) }}
          </button>
        }
        @if (dirtyCount()) {
          <span class="cb-dg__dirty">{{ fmt(t().dataGridChanged, dirtyCount()) }}</span>
        }
      </div>
    }

    <div class="cb-dg__scroll" [style.max-height]="scrollHeight()">
      <table
        class="cb-dg__table"
        role="grid"
        [id]="uid"
        [style.width]="tableWidth()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-rowcount]="view().length + 1"
        [attr.aria-colcount]="columns().length + (rowNumbers() ? 1 : 0)"
        [attr.aria-multiselectable]="true"
        [attr.aria-readonly]="!editable() || null"
        [attr.aria-describedby]="uid + '-help'"
        (keydown)="onKeydown($event)"
        (copy)="onCopy($event, false)"
        (cut)="onCopy($event, true)"
        (paste)="onPaste($event)"
      >
        <colgroup>
          @if (rowNumbers()) {
            <col style="width: 3rem" />
          }
          @for (col of columns(); track col.field) {
            <col [style.width]="widthOf(col)" />
          }
        </colgroup>
        <thead>
          <tr role="row" aria-rowindex="1">
            @if (rowNumbers()) {
              <th class="cb-dg__corner" scope="col">
                <button type="button" class="cb-dg__corner-btn" tabindex="-1" [attr.aria-label]="t().selectAll" (click)="selectAll()"></button>
              </th>
            }
            @for (col of columns(); track col.field; let c = $index) {
              <th
                class="cb-dg__head"
                scope="col"
                [class.cb-dg__head--active]="range().c1 <= c && c <= range().c2"
                [class]="'cb-dg__align--' + alignOf(col)"
                [attr.aria-sort]="sort()?.field === col.field ? (sort()!.order === 1 ? 'ascending' : 'descending') : null"
              >
                @if (col.sortable !== false) {
                  <button type="button" class="cb-dg__sort" (click)="toggleSort(col)">
                    <span class="cb-dg__head-text">{{ col.header }}@if (col.required) {<span class="cb-dg__req" aria-hidden="true"> *</span>}</span>
                    <cb-icon
                      class="cb-dg__sort-icon"
                      [class.cb-dg__sort-icon--on]="sort()?.field === col.field"
                      [name]="sort()?.field === col.field && sort()!.order === -1 ? 'arrow-down' : 'arrow-up'"
                      [size]="14"
                      aria-hidden="true"
                    />
                  </button>
                } @else {
                  <span class="cb-dg__head-text">{{ col.header }}@if (col.required) {<span class="cb-dg__req" aria-hidden="true"> *</span>}</span>
                }
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of view(); track keyOf(row); let r = $index) {
            <tr role="row" [attr.aria-rowindex]="r + 2" [class.cb-dg__row--active]="active().r === r">
              @if (rowNumbers()) {
                <th
                  class="cb-dg__num"
                  scope="row"
                  [class.cb-dg__num--active]="range().r1 <= r && r <= range().r2"
                  [class.cb-dg__num--new]="isNew(row)"
                  (pointerdown)="selectRow(r, $event)"
                >
                  {{ r + 1 }}
                </th>
              }
              @for (col of columns(); track col.field; let c = $index) {
                <td
                  role="gridcell"
                  class="cb-dg__cell"
                  [id]="cellId(r, c)"
                  [class]="'cb-dg__align--' + alignOf(col)"
                  [class.cb-dg__cell--active]="active().r === r && active().c === c"
                  [class.cb-dg__cell--selected]="isSelected(r, c)"
                  [class.cb-dg__cell--readonly]="!canEdit(col)"
                  [class.cb-dg__cell--dirty]="isDirty(row, col)"
                  [class.cb-dg__cell--invalid]="!!errorOf(row, col)"
                  [class.cb-dg__cell--editing]="editing()?.r === r && editing()?.c === c"
                  [class.cb-dg__cell--negative]="isNegative(get(row, col.field), col)"
                  [attr.tabindex]="active().r === r && active().c === c ? 0 : -1"
                  [attr.aria-selected]="isSelected(r, c)"
                  [attr.aria-readonly]="!canEdit(col) || null"
                  [attr.aria-invalid]="errorOf(row, col) ? true : null"
                  [attr.aria-colindex]="c + (rowNumbers() ? 2 : 1)"
                  [attr.title]="errorOf(row, col)"
                  (pointerdown)="onCellPointerDown($event, r, c)"
                  (pointerenter)="onCellPointerEnter(r, c)"
                  (dblclick)="startEdit(r, c)"
                >
                  @if (editing()?.r === r && editing()?.c === c) {
                    @switch (editorKind(col)) {
                      @case ('select') {
                        <select class="cb-dg__editor" [attr.aria-label]="col.header" (change)="editText($event)" (keydown)="onEditorKeydown($event)" (blur)="commit(null)">
                          <option value="" [selected]="editing()!.text === ''"></option>
                          @for (o of col.options ?? []; track $index) {
                            <option [value]="o.label" [selected]="o.label === editing()!.text">{{ o.label }}</option>
                          }
                        </select>
                      }
                      @default {
                        <input
                          class="cb-dg__editor"
                          [type]="editorKind(col) === 'date' ? 'date' : 'text'"
                          [attr.inputmode]="col.type === 'number' ? 'decimal' : null"
                          [attr.aria-label]="col.header"
                          [attr.aria-invalid]="editing()!.error ? true : null"
                          [attr.aria-describedby]="editing()!.error ? uid + '-editor-error' : null"
                          [value]="editing()!.text"
                          (input)="editText($event)"
                          (keydown)="onEditorKeydown($event)"
                          (blur)="commit(null)"
                        />
                      }
                    }
                    @if (editing()!.error) {
                      <span class="cb-dg__editor-error" [id]="uid + '-editor-error'" role="alert">{{ editing()!.error }}</span>
                    }
                  } @else if (col.type === 'checkbox') {
                    <span class="cb-dg__check" [class.cb-dg__check--on]="!!get(row, col.field)" aria-hidden="true" (click)="toggleCheck(r, c)">
                      @if (get(row, col.field)) {
                        <cb-icon name="check" [size]="12" />
                      }
                    </span>
                    <span class="cb-dg__sr">{{ text(row, col) }}</span>
                  } @else {
                    <span class="cb-dg__text">{{ text(row, col) }}</span>
                    @if (col.type === 'select' && canEdit(col)) {
                      <cb-icon class="cb-dg__caret" name="chevron-down" [size]="14" aria-hidden="true" />
                    }
                  }
                  @if (errorOf(row, col); as err) {
                    @if (!(editing()?.r === r && editing()?.c === c)) {
                      <span class="cb-dg__sr">. {{ err }}</span>
                    }
                  }
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td class="cb-dg__empty" [attr.colspan]="columns().length + (rowNumbers() ? 1 : 0)">{{ emptyMessage() || t().noData }}</td>
            </tr>
          }
        </tbody>
        @if (hasFooter() && view().length) {
          <tfoot>
            <tr class="cb-dg__foot">
              @if (rowNumbers()) {
                <td class="cb-dg__num cb-dg__num--foot"></td>
              }
              @for (col of columns(); track col.field; let c = $index) {
                @if (col.footer || (c === labelColumn() && !hasFooterText())) {
                  <th scope="row" class="cb-dg__total" [class]="'cb-dg__align--' + alignOf(col)">{{ col.footer || t().tableTotal }}</th>
                } @else {
                  <td class="cb-dg__total" [class]="'cb-dg__align--' + alignOf(col)" [class.cb-dg__cell--negative]="isNegative(totals()[col.field], col)">{{ totalText(col) }}</td>
                }
              }
            </tr>
          </tfoot>
        }
      </table>
    </div>
    <p class="cb-dg__sr" [id]="uid + '-help'">{{ editable() ? t().dataGridInstructions : t().dataGridReadonlyInstructions }}</p>
    <div class="cb-dg__sr" role="status">{{ announcement() }}</div>
  `,
  styleUrl: './datagrid.component.css',
})
export class CbDataGrid<T extends object = CbDataGridRow> {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly uid = `cb-data-grid-${++nextUid}`;

  /** Filas (bidireccional: se actualiza con cada edición, pegado, alta o baja). */
  readonly rows = model<readonly T[]>([]);
  readonly columns = input<readonly CbDataGridColumn<T>[]>([]);
  /** Campo que identifica cada fila. */
  readonly dataKey = input<string>('id');
  /** `false` deja todo el grid de solo lectura (se sigue navegando, seleccionando y copiando). */
  readonly editable = input<boolean, unknown>(true, { transform: booleanAttribute });
  /** Columna con el número de fila (y para seleccionar filas enteras). */
  readonly rowNumbers = input<boolean, unknown>(true, { transform: booleanAttribute });
  /** Barra con Añadir fila, Eliminar, Deshacer, Rehacer y el resumen de errores. */
  readonly toolbar = input<boolean, unknown>(true, { transform: booleanAttribute });
  /** Alto máximo del área con scroll (la cabecera y los números de fila quedan fijos). */
  readonly scrollHeight = input<string | null>('28rem');
  /** Crea la fila nueva al añadir o al pegar más filas de las que hay. */
  readonly newRow = input<(() => T) | null>(null);
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  /** Moneda de las columnas con `currency: true` (si no, la de `provideCaribeNG({ currency })`). */
  readonly currency = input<string | undefined>(undefined);
  /** Negativos con signo o entre paréntesis (si no, el de `provideCaribeNG({ negativeStyle })`). */
  readonly negativeStyle = input<CbNegativeStyle | undefined>(undefined);

  /** Una celda cambió de valor (al editar, pegar, borrar o rellenar; una vez por celda). */
  readonly cellChange = output<CbDataGridCellChange<T>>();
  readonly rowAdd = output<T>();
  readonly rowsDelete = output<T[]>();

  protected readonly sort = signal<{ field: string; order: 1 | -1 } | null>(null);
  protected readonly active = signal<CellPos>({ r: 0, c: 0 });
  private readonly anchor = signal<CellPos>({ r: 0, c: 0 });
  protected readonly editing = signal<Editing | null>(null);
  protected readonly announcement = signal('');
  protected dragging = false;

  private readonly undoStack = signal<readonly (readonly T[])[]>([]);
  private readonly redoStack = signal<readonly (readonly T[])[]>([]);
  protected readonly canUndo = computed(() => this.undoStack().length > 0);
  protected readonly canRedo = computed(() => this.redoStack().length > 0);

  /** Filas tal como estaban al cargar o en el último `markClean()`. */
  private readonly baseline = signal<Map<unknown, T> | null>(null);

  protected readonly range = computed(() => rangeOf(this.anchor(), this.active()));
  protected readonly selectedRowCount = computed(() => {
    const r = this.range();
    return this.view().length ? r.r2 - r.r1 + 1 : 0;
  });

  /** Filas en el orden en que se ven. */
  protected readonly view = computed<readonly T[]>(() => {
    const rows = this.rows();
    const s = this.sort();
    const col = s && this.columns().find((c) => c.field === s.field);
    if (!s || !col) return rows;
    const locale = this.t().intlLocale;
    return [...rows].sort((a, b) => compareCells(col as CbDataGridColumn<object>, this.get(a, s.field), this.get(b, s.field), locale) * s.order);
  });

  private readonly texts = computed<ValidationTexts>(() => {
    const t = this.t();
    return { required: t.dataGridRequired, min: t.dataGridMin, max: t.dataGridMax, number: t.dataGridInvalidNumber, date: t.dataGridInvalidDate, option: t.dataGridInvalidOption };
  });

  /** Errores de validación de todas las celdas, en el orden de la vista. */
  readonly errors = computed<CbDataGridError[]>(() => {
    const texts = this.texts();
    const out: CbDataGridError[] = [];
    for (const row of this.view()) {
      for (const col of this.columns()) {
        const message = validateCell(col as CbDataGridColumn<object>, this.get(row, col.field), row, texts);
        if (message) out.push({ key: this.keyOf(row), field: col.field, message });
      }
    }
    return out;
  });

  private readonly errorIndex = computed(() => {
    const map = new Map<unknown, Map<string, string>>();
    for (const e of this.errors()) {
      if (!map.has(e.key)) map.set(e.key, new Map());
      map.get(e.key)!.set(e.field, e.message);
    }
    return map;
  });

  /** Celdas cambiadas desde la carga (o el último `markClean()`), contando las filas nuevas. */
  protected readonly dirtyCount = computed(() => {
    const base = this.baseline();
    if (!base) return 0;
    let n = 0;
    for (const row of this.rows()) for (const col of this.columns()) if (this.isDirty(row, col)) n++;
    return n;
  });

  private readonly config = inject(CB_CONFIG);
  private readonly amount = computed(() => ({ currency: this.currency() ?? this.config.currency ?? null, negative: this.negativeStyle() ?? this.config.negativeStyle ?? 'minus', locale: this.config.numberLocale }) as const);
  protected readonly hasFooterText = computed(() => this.columns().some((c) => c.footer));
  protected readonly hasFooter = computed(() => this.hasFooterText() || this.columns().some((c) => c.summary));
  /** Columna de la etiqueta "Total": la primera sin total. */
  protected readonly labelColumn = computed(() => Math.max(0, this.columns().findIndex((c) => !c.summary)));
  /** Totales del pie (columnas con `summary`), sobre todas las filas. */
  readonly totals = computed<Record<string, unknown>>(() => {
    const rows = this.rows();
    const out: Record<string, unknown> = {};
    for (const col of this.columns()) {
      if (!col.summary) continue;
      out[col.field] = typeof col.summary === 'function' ? col.summary(rows) : cbSummarize(rows.map((r) => this.get(r, col.field)), col.summary);
    }
    return out;
  });

  protected readonly tableWidth = computed(() => `calc(${[this.rowNumbers() ? '3rem' : '0rem', ...this.columns().map((c) => this.widthOf(c))].join(' + ')})`);

  constructor() {
    // La primera vez que llegan filas se guardan como estado original.
    effect(() => {
      const rows = this.rows();
      if (rows.length && untracked(this.baseline) === null) untracked(() => this.markClean());
    });
    // Si cambian las filas o columnas desde fuera, la celda activa sigue dentro.
    effect(() => {
      const rows = this.view().length;
      const cols = this.columns().length;
      untracked(() => {
        const clamp = (p: CellPos) => ({ r: Math.max(0, Math.min(p.r, rows - 1)), c: Math.max(0, Math.min(p.c, cols - 1)) });
        const a = this.active();
        const b = clamp(a);
        if (a.r !== b.r || a.c !== b.c) this.active.set(b);
        const n = this.anchor();
        const m = clamp(n);
        if (n.r !== m.r || n.c !== m.c) this.anchor.set(m);
      });
    });
  }

  // --- API pública -------------------------------------------------------------------------

  /** Toma las filas actuales como estado original: borra las marcas de cambio. */
  markClean(): void {
    this.baseline.set(new Map(this.rows().map((row) => [this.keyOf(row), row])));
  }

  /** Filas añadidas, modificadas y eliminadas desde la carga o el último `markClean()`. */
  getChanges(): { added: T[]; updated: T[]; removed: T[] } {
    const base = this.baseline() ?? new Map<unknown, T>();
    const keys = new Set<unknown>();
    const added: T[] = [];
    const updated: T[] = [];
    for (const row of this.rows()) {
      const key = this.keyOf(row);
      keys.add(key);
      const before = base.get(key);
      if (!before) added.push(row);
      else if (before !== row && this.columns().some((c) => this.get(before, c.field) !== this.get(row, c.field))) updated.push(row);
    }
    const removed = [...base.entries()].filter(([key]) => !keys.has(key)).map(([, row]) => row);
    return { added, updated, removed };
  }

  /** `true` si ninguna celda tiene errores de validación. */
  isValid(): boolean {
    return this.errors().length === 0;
  }

  undo(): void {
    const stack = this.undoStack();
    if (!stack.length) return;
    this.cancelEdit();
    this.redoStack.update((s) => [...s, this.rows()]);
    this.undoStack.set(stack.slice(0, -1));
    this.rows.set(stack[stack.length - 1]);
    this.say(this.t().dataGridUndone);
  }

  redo(): void {
    const stack = this.redoStack();
    if (!stack.length) return;
    this.cancelEdit();
    this.undoStack.update((s) => [...s, this.rows()]);
    this.redoStack.set(stack.slice(0, -1));
    this.rows.set(stack[stack.length - 1]);
    this.say(this.t().dataGridRedone);
  }

  /** Añade una fila al final y lleva el foco a su primera celda. */
  addRow(): void {
    if (!this.editable()) return;
    this.commit(null);
    const row = this.createRow();
    this.pushHistory();
    this.sort.set(null);
    this.rows.update((rows) => [...rows, row]);
    this.rowAdd.emit(row);
    this.select({ r: this.rows().length - 1, c: 0 });
    this.say(this.t().dataGridRowAdded);
  }

  /** Elimina las filas de la selección. */
  deleteRows(): void {
    if (!this.editable() || !this.view().length) return;
    this.commit(null);
    const { r1, r2 } = this.range();
    const gone = this.view().slice(r1, r2 + 1);
    const drop = new Set(gone);
    this.pushHistory();
    this.rows.update((rows) => rows.filter((row) => !drop.has(row)));
    this.rowsDelete.emit(gone);
    this.select({ r: Math.min(r1, this.view().length - 1), c: this.active().c });
    this.say(this.fmt(this.t().dataGridRowsDeleted, gone.length));
  }

  // --- Plantilla ---------------------------------------------------------------------------

  protected keyOf(row: T): unknown {
    return this.get(row, this.dataKey());
  }

  protected get(row: T, field: string): unknown {
    return (row as Record<string, unknown>)[field];
  }

  protected cellId(r: number, c: number): string {
    return `${this.uid}-${r}-${c}`;
  }

  protected widthOf(col: CbDataGridColumn<T>): string {
    return col.width ?? (col.type === 'checkbox' ? '5rem' : col.type === 'number' ? '8rem' : col.type === 'date' ? '10rem' : '10rem');
  }

  protected alignOf(col: CbDataGridColumn<T>): string {
    return col.align ?? (col.type === 'number' ? 'end' : col.type === 'checkbox' ? 'center' : 'start');
  }

  protected canEdit(col: CbDataGridColumn<T>): boolean {
    return this.editable() && col.editable !== false;
  }

  protected isSelected(r: number, c: number): boolean {
    return inRange(this.range(), r, c);
  }

  protected text(row: T, col: CbDataGridColumn<T>): string {
    const t = this.t();
    return cellText(col as CbDataGridColumn<object>, this.get(row, col.field), row, t.intlLocale, [t.yes, t.no], this.amount());
  }

  protected isNegative(value: unknown, col: CbDataGridColumn<T>): boolean {
    return col.type === 'number' && typeof value === 'number' && value < 0;
  }

  protected totalText(col: CbDataGridColumn<T>): string {
    const value = this.totals()[col.field];
    if (value === undefined || value === null) return '';
    if (col.summary === 'count' || typeof value !== 'number') return typeof value === 'number' ? new Intl.NumberFormat(this.config.numberLocale ?? this.t().intlLocale).format(value) : String(value);
    const t = this.t();
    return cellText({ ...(col as CbDataGridColumn<object>), type: 'number', format: undefined }, value, {}, t.intlLocale, [t.yes, t.no], this.amount());
  }

  protected errorOf(row: T, col: CbDataGridColumn<T>): string | null {
    return this.errorIndex().get(this.keyOf(row))?.get(col.field) ?? null;
  }

  protected isNew(row: T): boolean {
    const base = this.baseline();
    return !!base && !base.has(this.keyOf(row));
  }

  protected isDirty(row: T, col: CbDataGridColumn<T>): boolean {
    const base = this.baseline();
    if (!base) return false;
    const before = base.get(this.keyOf(row));
    if (!before) return true;
    return before !== row && this.get(before, col.field) !== this.get(row, col.field);
  }

  protected editorKind(col: CbDataGridColumn<T>): 'select' | 'date' | 'text' {
    const mode = this.editing()?.mode;
    if (col.type === 'select' && mode === 'native') return 'select';
    if (col.type === 'date' && mode === 'native') return 'date';
    return 'text';
  }

  protected toggleSort(col: CbDataGridColumn<T>): void {
    this.commit(null);
    const s = this.sort();
    this.sort.set(s?.field !== col.field ? { field: col.field, order: 1 } : s.order === 1 ? { field: col.field, order: -1 } : null);
  }

  protected selectAll(): void {
    this.anchor.set({ r: 0, c: 0 });
    this.active.set({ r: Math.max(0, this.view().length - 1), c: Math.max(0, this.columns().length - 1) });
    this.focusActive();
  }

  protected selectRow(r: number, event: PointerEvent): void {
    event.preventDefault();
    this.commit(null);
    const last = this.columns().length - 1;
    if (event.shiftKey) this.anchor.set({ r: this.anchor().r, c: 0 });
    else this.anchor.set({ r, c: 0 });
    this.active.set({ r, c: last });
    this.focusActive();
  }

  protected goToFirstError(): void {
    const e = this.errors()[0];
    if (!e) return;
    const r = this.view().findIndex((row) => this.keyOf(row) === e.key);
    const c = this.columns().findIndex((col) => col.field === e.field);
    if (r >= 0 && c >= 0) this.select({ r, c });
  }

  // --- Ratón -------------------------------------------------------------------------------

  protected onCellPointerDown(event: PointerEvent, r: number, c: number): void {
    if (event.button !== 0 || (event.target as HTMLElement).closest('.cb-dg__editor')) return;
    const e = this.editing();
    if (e && (e.r !== r || e.c !== c)) this.commit(null);
    if (event.shiftKey) this.active.set({ r, c });
    else this.select({ r, c }, false);
    this.dragging = true;
    this.focusActive();
  }

  protected onCellPointerEnter(r: number, c: number): void {
    if (!this.dragging || this.editing()) return;
    this.active.set({ r, c });
  }

  protected toggleCheck(r: number, c: number): void {
    const col = this.columns()[c];
    const row = this.view()[r];
    if (!col || !row || !this.canEdit(col)) return;
    this.apply([{ row, field: col.field, value: !this.get(row, col.field) }]);
  }

  // --- Teclado -----------------------------------------------------------------------------

  protected onKeydown(event: KeyboardEvent): void {
    if ((event.target as HTMLElement).closest('thead, .cb-dg__editor')) return;
    if (this.editing()) {
      // Teclas que llegan a la celda antes de que el editor tenga el foco (al escribir rápido).
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        this.editing.update((e) => (e && e.mode === 'text' ? { ...e, text: e.text + event.key } : e));
      } else if (['Enter', 'Tab', 'Escape'].includes(event.key)) this.onEditorKeydown(event);
      return;
    }
    const rows = this.view().length;
    const cols = this.columns().length;
    if (!rows || !cols) return;
    const { r, c } = this.active();
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key;
    let to: CellPos | null = null;
    switch (key) {
      case 'ArrowUp':
        to = { r: mod ? 0 : r - 1, c };
        break;
      case 'ArrowDown':
        to = { r: mod ? rows - 1 : r + 1, c };
        break;
      case 'ArrowLeft':
        to = { r, c: mod ? 0 : c - 1 };
        break;
      case 'ArrowRight':
        to = { r, c: mod ? cols - 1 : c + 1 };
        break;
      case 'Home':
        to = { r: mod ? 0 : r, c: 0 };
        break;
      case 'End':
        to = { r: mod ? rows - 1 : r, c: cols - 1 };
        break;
      case 'PageUp':
        to = { r: r - PAGE, c };
        break;
      case 'PageDown':
        to = { r: r + PAGE, c };
        break;
      case 'Tab': {
        const i = r * cols + c + (event.shiftKey ? -1 : 1);
        if (i < 0 || i >= rows * cols) return; // En los extremos el Tab sale del grid.
        event.preventDefault();
        this.select({ r: Math.floor(i / cols), c: i % cols });
        return;
      }
      case 'Enter':
      case 'F2':
        event.preventDefault();
        if (this.columns()[c].type === 'checkbox') this.toggleCheck(r, c);
        else this.startEdit(r, c);
        return;
      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        this.clearRange();
        return;
      case 'Escape':
        if (this.range().r1 !== this.range().r2 || this.range().c1 !== this.range().c2) {
          event.preventDefault();
          this.select({ r, c });
        }
        return;
    }
    if (to) {
      event.preventDefault();
      const next = { r: Math.max(0, Math.min(rows - 1, to.r)), c: Math.max(0, Math.min(cols - 1, to.c)) };
      if (event.shiftKey) {
        this.active.set(next);
        this.focusActive();
      } else this.select(next);
      return;
    }
    if (key === ' ' && event.shiftKey) {
      event.preventDefault();
      this.anchor.set({ r: this.anchor().r, c: 0 });
      this.active.set({ r, c: cols - 1 });
      return;
    }
    if (key === ' ' && mod) {
      event.preventDefault();
      this.anchor.set({ r: 0, c: this.anchor().c });
      this.active.set({ r: rows - 1, c });
      return;
    }
    if (mod && !event.altKey) {
      const k = key.toLowerCase();
      if (k === 'z' && !event.shiftKey) {
        event.preventDefault();
        this.undo();
      } else if (k === 'y' || (k === 'z' && event.shiftKey)) {
        event.preventDefault();
        this.redo();
      } else if (k === 'd') {
        event.preventDefault();
        this.fillDown();
      } else if (k === 'a') {
        event.preventDefault();
        this.selectAll();
      }
      return;
    }
    if (key === ' ' && this.columns()[c].type === 'checkbox') {
      event.preventDefault();
      this.toggleCheck(r, c);
      return;
    }
    // Escribir un carácter empieza a editar y reemplaza el valor.
    if (key.length === 1 && !event.altKey) {
      const col = this.columns()[c];
      if (!this.canEdit(col) || col.type === 'checkbox') return;
      event.preventDefault();
      if (col.type === 'select') {
        const low = key.toLowerCase();
        const opt = (col.options ?? []).find((o) => o.label.toLowerCase().startsWith(low));
        this.startEdit(r, c, opt?.label ?? '', 'native');
      } else this.startEdit(r, c, key, 'text');
    }
  }

  protected onEditorKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
    const e = this.editing();
    if (!e) return;
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.commit(event.shiftKey ? 'up' : 'down');
        break;
      case 'Tab':
        event.preventDefault();
        this.commit(event.shiftKey ? 'left' : 'right');
        break;
      case 'Escape':
        event.preventDefault();
        this.cancelEdit();
        this.focusActive();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        // Si se empezó escribiendo, las flechas confirman y se mueven (como en Excel).
        if (e.mode === 'text') {
          event.preventDefault();
          this.commit(event.key === 'ArrowUp' ? 'up' : 'down');
        }
        break;
    }
  }

  protected editText(event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    this.editing.update((e) => (e ? { ...e, text: value, error: null } : e));
  }

  // --- Edición -----------------------------------------------------------------------------

  /** Abre el editor de una celda (con `initial`, reemplaza el valor por ese texto). */
  protected startEdit(r: number, c: number, initial?: string, mode?: 'native' | 'text'): void {
    const col = this.columns()[c];
    const row = this.view()[r];
    if (!col || !row || !this.canEdit(col) || col.type === 'checkbox') return;
    const value = this.get(row, col.field);
    let text = initial;
    if (text === undefined) {
      const t = this.t();
      text = col.type === 'date' ? (isEmpty(value) ? '' : String(value)) : copyText(col as CbDataGridColumn<object>, value, row, t.intlLocale, [t.yes, t.no]);
      if (col.type === 'number' && typeof value === 'number') text = this.localNumber(value);
    }
    this.select({ r, c }, false);
    this.editing.set({ r, c, text, mode: mode ?? (initial === undefined ? 'native' : 'text'), error: null });
    afterNextRender(
      () => {
        const input = this.host.nativeElement.querySelector<HTMLInputElement | HTMLSelectElement>(`#${this.cellId(r, c)} .cb-dg__editor`);
        input?.focus();
        if (input instanceof HTMLInputElement && input.type === 'text') input.setSelectionRange(input.value.length, input.value.length);
      },
      { injector: this.injector },
    );
  }

  /** Confirma la edición en curso y, si se indica, se mueve a la celda vecina. */
  protected commit(move: 'up' | 'down' | 'left' | 'right' | null): void {
    const e = this.editing();
    if (!e) return;
    const col = this.columns()[e.c];
    const row = this.view()[e.r];
    if (!col || !row) {
      this.editing.set(null);
      return;
    }
    const parsed = parseCell(col as CbDataGridColumn<object>, e.text, this.texts());
    if (parsed.error) {
      // Al salir con un valor que no se entiende, se descarta; con Enter o Tab se avisa.
      if (move === null) this.editing.set(null);
      else this.editing.set({ ...e, error: parsed.error });
      return;
    }
    this.editing.set(null);
    if (parsed.value !== this.get(row, col.field)) this.apply([{ row, field: col.field, value: parsed.value }]);
    if (move) {
      const rows = this.view().length;
      const cols = this.columns().length;
      const { r, c } = e;
      const to =
        move === 'down' ? { r: Math.min(rows - 1, r + 1), c }
        : move === 'up' ? { r: Math.max(0, r - 1), c }
        : move === 'right' ? (c + 1 < cols ? { r, c: c + 1 } : { r: Math.min(rows - 1, r + 1), c: 0 })
        : c > 0 ? { r, c: c - 1 } : { r: Math.max(0, r - 1), c: cols - 1 };
      this.select(to);
    } else if (this.host.nativeElement.contains(document.activeElement) || document.activeElement === document.body) {
      this.focusActive();
    }
  }

  private cancelEdit(): void {
    this.editing.set(null);
  }

  /** Borra los valores del rango seleccionado. */
  private clearRange(): void {
    const patches: Patch<T>[] = [];
    this.forRange((row, col) => {
      if (!this.canEdit(col)) return;
      const value = col.type === 'checkbox' ? false : null;
      if (this.get(row, col.field) !== value && !(isEmpty(value) && isEmpty(this.get(row, col.field)))) patches.push({ row, field: col.field, value });
    });
    if (!patches.length) return;
    this.apply(patches);
    this.say(this.fmt(this.t().dataGridCleared, patches.length));
  }

  /** Ctrl + D: copia la primera fila del rango en las demás (o la de arriba si es una sola fila). */
  private fillDown(): void {
    const { r1, r2, c1, c2 } = this.range();
    const view = this.view();
    const from = r1 === r2 ? r1 - 1 : r1;
    if (from < 0) return;
    const source = view[from];
    const patches: Patch<T>[] = [];
    for (let r = r1 === r2 ? r1 : r1 + 1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        const col = this.columns()[c];
        if (!this.canEdit(col)) continue;
        const value = this.get(source, col.field);
        if (this.get(view[r], col.field) !== value) patches.push({ row: view[r], field: col.field, value });
      }
    }
    if (patches.length) this.apply(patches);
  }

  // --- Portapapeles ------------------------------------------------------------------------

  protected onCopy(event: ClipboardEvent, cut: boolean): void {
    if (this.editing() || !event.clipboardData || !this.view().length) return;
    const { r1, r2, c1, c2 } = this.range();
    const t = this.t();
    const matrix: string[][] = [];
    for (let r = r1; r <= r2; r++) {
      const row = this.view()[r];
      const line: string[] = [];
      for (let c = c1; c <= c2; c++) {
        const col = this.columns()[c] as CbDataGridColumn<object>;
        line.push(copyText(col, this.get(row, col.field), row, t.intlLocale, [t.yes, t.no]));
      }
      matrix.push(line);
    }
    event.clipboardData.setData('text/plain', toTsv(matrix));
    event.preventDefault();
    const cells = (r2 - r1 + 1) * (c2 - c1 + 1);
    if (cut && this.editable()) this.clearRange();
    else this.say(this.fmt(t.dataGridCopied, cells));
  }

  protected onPaste(event: ClipboardEvent): void {
    if (this.editing() || !this.editable() || !event.clipboardData) return;
    const text = event.clipboardData.getData('text/plain');
    if (!text) return;
    event.preventDefault();
    this.paste(fromTsv(text));
  }

  /** Pega una matriz de textos desde la esquina del rango (un único valor rellena todo el rango). */
  private paste(matrix: string[][]): void {
    if (!matrix.length) return;
    const range = this.range();
    const single = matrix.length === 1 && matrix[0].length === 1;
    const height = single ? range.r2 - range.r1 + 1 : matrix.length;
    const width = single ? range.c2 - range.c1 + 1 : Math.max(...matrix.map((m) => m.length));
    const cols = this.columns();
    // Si se pegan más filas de las que hay, se añaden (sin orden, para que queden al final).
    const missing = range.r1 + height - this.view().length;
    const added: T[] = [];
    if (missing > 0) {
      for (let i = 0; i < missing; i++) added.push(this.createRow());
      this.pushHistory();
      this.sort.set(null);
      this.rows.update((rows) => [...rows, ...added]);
    }
    const view = this.view();
    const patches: Patch<T>[] = [];
    for (let i = 0; i < height; i++) {
      const row = view[range.r1 + i];
      if (!row) break;
      for (let j = 0; j < width; j++) {
        const col = cols[range.c1 + j];
        if (!col || !this.canEdit(col)) continue;
        const raw = single ? matrix[0][0] : (matrix[i][j] ?? '');
        const parsed = parseCell(col as CbDataGridColumn<object>, raw, this.texts());
        // Lo que no se entiende se pega tal cual y queda marcado como error.
        if (parsed.value !== this.get(row, col.field)) patches.push({ row, field: col.field, value: parsed.value });
      }
    }
    if (patches.length) this.apply(patches, added.length === 0);
    for (const row of added) this.rowAdd.emit(row);
    this.anchor.set({ r: range.r1, c: range.c1 });
    this.active.set({ r: Math.min(view.length - 1, range.r1 + height - 1), c: Math.min(cols.length - 1, range.c1 + width - 1) });
    this.focusActive();
    this.say(this.fmt(this.t().dataGridPasted, height * width));
  }

  // --- Internos ----------------------------------------------------------------------------

  private forRange(fn: (row: T, col: CbDataGridColumn<T>) => void): void {
    const { r1, r2, c1, c2 } = this.range();
    const view = this.view();
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) if (view[r] && this.columns()[c]) fn(view[r], this.columns()[c]);
  }

  /** Aplica cambios de celdas como un único paso de deshacer. */
  private apply(patches: readonly Patch<T>[], history = true): void {
    if (history) this.pushHistory();
    const byRow = new Map<T, Record<string, unknown>>();
    for (const p of patches) {
      const copy = byRow.get(p.row) ?? { ...(p.row as Record<string, unknown>) };
      copy[p.field] = p.value;
      byRow.set(p.row, copy);
    }
    const next = this.rows().map((row) => (byRow.get(row) as T | undefined) ?? row);
    this.rows.set(next);
    for (const p of patches) {
      this.cellChange.emit({ row: byRow.get(p.row) as T, field: p.field, value: p.value, previous: this.get(p.row, p.field) });
    }
  }

  private pushHistory(): void {
    this.undoStack.update((s) => [...s.slice(-(HISTORY - 1)), this.rows()]);
    this.redoStack.set([]);
  }

  private createRow(): T {
    const factory = this.newRow();
    if (factory) return factory();
    const row: Record<string, unknown> = { [this.dataKey()]: `${Date.now().toString(36)}-${++nextKey}` };
    for (const col of this.columns()) if (!(col.field in row)) row[col.field] = col.type === 'checkbox' ? false : null;
    return row as T;
  }

  /** Mueve la celda activa (y la selección a esa sola celda). */
  private select(pos: CellPos, focus = true): void {
    this.anchor.set(pos);
    this.active.set(pos);
    if (focus) this.focusActive();
  }

  private focusActive(): void {
    afterNextRender(
      () => {
        const { r, c } = this.active();
        const cell = this.host.nativeElement.querySelector<HTMLElement>(`#${this.cellId(r, c)}`);
        if (!cell || cell.contains(document.activeElement)) return;
        cell.focus({ preventScroll: true });
        cell.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
      },
      { injector: this.injector },
    );
  }

  private localNumber(value: number): string {
    // El separador decimal del idioma, sin separador de miles: se edita como se escribe.
    const sep = new Intl.NumberFormat(this.t().intlLocale).formatToParts(1.5).find((p) => p.type === 'decimal')?.value ?? '.';
    return String(value).replace('.', sep);
  }

  private say(message: string): void {
    this.announcement.set('');
    queueMicrotask(() => this.announcement.set(message));
  }
}
