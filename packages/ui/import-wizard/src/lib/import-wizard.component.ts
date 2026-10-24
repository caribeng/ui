import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';
import { CbCheckbox } from '@caribeng/ui/checkbox';
import { CbDataGrid, type CbDataGridColumn } from '@caribeng/ui/datagrid';
import { CbIcon } from '@caribeng/ui/icon';
import { CbSelect } from '@caribeng/ui/select';
import { cbReadXlsx, type CbXlsxReadSheet } from '@caribeng/ui/xlsx';
import { autoMap, convertRows, parseDate, parseDelimited, type CbImportCell, type CbImportError, type CbImportField, type CbImportResult, type ImportTexts } from './import-model';

type Step = 'file' | 'map' | 'review';

let nextUid = 0;

/**
 * Asistente de importación de CaribeNG: archivo (CSV, TSV, Excel o datos pegados),
 * asignación de columnas y revisión con validación fila a fila antes de importar.
 *
 * - Lee .xlsx en el navegador (varias hojas), CSV con `,` o `;` y lo copiado de una hoja de cálculo.
 * - Asigna sola cada columna cuyo encabezado coincide con el campo (o sus `aliases`).
 * - Interpreta importes (`$ 1.234,56`, `(1.234)`), fechas (`DD/MM/AAAA`, serie de Excel)
 *   y casillas (Sí / No); marca cada celda con error y deja importar solo las filas válidas.
 *
 * @example
 * ```html
 * <cb-import-wizard [fields]="campos" (import)="guardar($event.rows)" />
 * ```
 */
@Component({
  selector: 'cb-import-wizard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [FormsModule, CbButton, CbCheckbox, CbDataGrid, CbIcon, CbSelect],
  host: { class: 'cb-import-wizard' },
  template: `
    <ol class="cb-iw__steps">
      @for (s of steps; track s; let i = $index) {
        <li class="cb-iw__step" [class.cb-is-done]="stepIndex() > i" [attr.aria-current]="step() === s ? 'step' : null">
          <span class="cb-iw__step-num" aria-hidden="true">
            @if (stepIndex() > i) {
              <cb-icon name="check" [size]="13" />
            } @else {
              {{ i + 1 }}
            }
          </span>
          {{ stepLabel(s) }}
        </li>
      }
    </ol>

    <section class="cb-iw__panel" [attr.aria-labelledby]="uid + '-heading'">
      <h3 class="cb-iw__heading" [id]="uid + '-heading'" tabindex="-1">{{ stepLabel(step()) }}</h3>

      @switch (step()) {
        @case ('file') {
          <div
            class="cb-iw__drop"
            [class.cb-is-over]="dragging()"
            (dragover)="$event.preventDefault(); dragging.set(true)"
            (dragleave)="dragging.set(false)"
            (drop)="onDrop($event)"
          >
            <cb-icon name="upload" [size]="28" aria-hidden="true" />
            <p>{{ t().importDrop }}</p>
            <label class="cb-iw__file">
              <input type="file" [attr.accept]="accept" (change)="onFile($event)" />
              <span>{{ t().importChoose }}</span>
            </label>
            @if (fileName()) {
              <p class="cb-iw__file-name">{{ fileName() }}</p>
            }
          </div>
          <details class="cb-iw__paste" [open]="pasteOpen()">
            <summary (click)="$event.preventDefault(); pasteOpen.set(!pasteOpen())">{{ t().importPaste }}</summary>
            <textarea class="cb-iw__textarea" rows="5" [attr.aria-label]="t().importPaste" [placeholder]="t().importPasteHint" (input)="onPaste($event)"></textarea>
          </details>
          @if (sheets().length > 1) {
            <div class="cb-iw__row">
              <span class="cb-iw__label" [id]="uid + '-sheet'">{{ t().importSheet }}</span>
              <cb-select [ariaLabelledBy]="uid + '-sheet'" [options]="sheetOptions()" optionValue="value" [value]="sheetIndex()" (valueChange)="sheetIndex.set($any($event))" />
            </div>
          }
          @if (error()) {
            <p class="cb-iw__error" role="alert">{{ error() }}</p>
          }
          @if (raw().length) {
            <cb-checkbox [label]="t().importHeader" [ngModel]="hasHeader()" (ngModelChange)="setHeader($event)" />
            <p class="cb-iw__info">{{ fmt(t().importRowsRead, dataRows().length, headers().length) }}</p>
            <div class="cb-iw__sample-wrap">
              <table class="cb-iw__sample" [attr.aria-label]="t().importSample">
                <thead>
                  <tr>
                    @for (h of headers(); track $index) {
                      <th scope="col">{{ h }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (r of dataRows().slice(0, 5); track $index) {
                    <tr>
                      @for (h of headers(); track $index; let c = $index) {
                        <td>{{ r[c] }}</td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
        @case ('map') {
          <p class="cb-iw__info">{{ t().importMapHint }}</p>
          <table class="cb-iw__map">
            <thead>
              <tr>
                <th scope="col">{{ t().importField }}</th>
                <th scope="col">{{ t().importColumn }}</th>
                <th scope="col">{{ t().importExample }}</th>
              </tr>
            </thead>
            <tbody>
              @for (f of fields(); track f.key) {
                <tr>
                  <th scope="row" [id]="uid + '-f-' + f.key">
                    {{ f.label }}
                    @if (f.required) {
                      <span class="cb-iw__req" aria-hidden="true">*</span>
                      <span class="cb-iw__sr">({{ t().required }})</span>
                    }
                  </th>
                  <td>
                    <cb-select [ariaLabelledBy]="uid + '-f-' + f.key" [options]="columnOptions()" optionValue="value" [value]="mapping()[f.key] ?? -1" (valueChange)="setMapping(f.key, $any($event))" [invalid]="!!f.required && mapping()[f.key] == null" />
                  </td>
                  <td class="cb-iw__example">{{ example(f.key) }}</td>
                </tr>
              }
            </tbody>
          </table>
          @if (missing().length) {
            <p class="cb-iw__error" role="alert">{{ fmt(t().importMissing, missing().join(', ')) }}</p>
          }
        }
        @case ('review') {
          <div class="cb-iw__summary" role="status">
            <span class="cb-iw__badge cb-iw__badge--ok"><cb-icon name="check" [size]="14" aria-hidden="true" /> {{ fmt(t().importValid, validCount()) }}</span>
            @if (invalidRows().size) {
              <span class="cb-iw__badge cb-iw__badge--bad"><cb-icon name="circle-alert" [size]="14" aria-hidden="true" /> {{ fmt(t().importInvalid, invalidRows().size) }}</span>
            }
          </div>
          @if (invalidRows().size) {
            <cb-checkbox [label]="t().importOnlyValid" [ngModel]="onlyValid()" (ngModelChange)="onlyValid.set($event)" />
          }
          <cb-data-grid [rows]="previewRows()" [columns]="previewColumns()" dataKey="__row" [editable]="false" [toolbar]="false" scrollHeight="20rem" [ariaLabel]="t().importPreview" />
        }
      }
    </section>

    <div class="cb-iw__actions">
      @if (step() !== 'file') {
        <cb-button variant="text" severity="secondary" (click)="back()">{{ t().importBack }}</cb-button>
      }
      <span class="cb-iw__spacer"></span>
      @if (step() !== 'review') {
        <cb-button [disabled]="!canNext()" (click)="next()">{{ t().importNext }}</cb-button>
      } @else {
        <cb-button [disabled]="!importable()" (click)="finish()">{{ fmt(t().importDo, importable()) }}</cb-button>
      }
    </div>
  `,
  styleUrl: './import-wizard.component.css',
})
export class CbImportWizard {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  protected readonly uid = `cb-import-wizard-${++nextUid}`;
  protected readonly steps: Step[] = ['file', 'map', 'review'];
  protected readonly accept = '.csv,.tsv,.txt,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  /** Campos de destino (clave, etiqueta, tipo, obligatorio, alias y validación). */
  readonly fields = input<readonly CbImportField[]>([]);
  /** Importa también las filas con errores (marcadas en `errors`). */
  readonly allowInvalid = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Filas importadas (con tipo) y errores encontrados. */
  readonly import = output<CbImportResult>();

  protected readonly step = signal<Step>('file');
  protected readonly stepIndex = computed(() => this.steps.indexOf(this.step()));
  protected readonly dragging = signal(false);
  protected readonly pasteOpen = signal(false);
  protected readonly fileName = signal('');
  protected readonly error = signal('');
  protected readonly sheets = signal<CbXlsxReadSheet[]>([]);
  protected readonly sheetIndex = signal(0);
  private readonly text = signal<CbImportCell[][]>([]);
  protected readonly hasHeader = signal(true);
  protected readonly mapping = signal<Record<string, number | null>>({});
  protected readonly onlyValid = signal(true);

  /** Filas leídas (de la hoja elegida o del texto). */
  protected readonly raw = computed<CbImportCell[][]>(() => {
    const sheets = this.sheets();
    const rows = sheets.length ? (sheets[this.sheetIndex()]?.rows ?? []) : this.text();
    return rows.filter((r) => r.some((c) => c !== null && c !== ''));
  });
  protected readonly headers = computed<string[]>(() => {
    const raw = this.raw();
    const width = Math.max(0, ...raw.map((r) => r.length));
    const first = raw[0] ?? [];
    return Array.from({ length: width }, (_, i) => (this.hasHeader() ? String(first[i] ?? '').trim() || this.columnName(i) : this.columnName(i)));
  });
  protected readonly dataRows = computed(() => (this.hasHeader() ? this.raw().slice(1) : this.raw()));

  protected readonly sheetOptions = computed(() => this.sheets().map((s, i) => ({ label: s.name, value: i })));
  protected readonly columnOptions = computed(() => [{ label: this.t().importUnmapped, value: -1 }, ...this.headers().map((h, i) => ({ label: h, value: i }))]);
  protected readonly missing = computed(() => this.fields().filter((f) => f.required && this.mapping()[f.key] == null).map((f) => f.label));

  private readonly texts = computed<ImportTexts>(() => {
    const t = this.t();
    return { required: t.importErrRequired, number: t.importErrNumber, date: t.importErrDate, boolean: t.importErrBoolean };
  });
  private readonly converted = computed(() => convertRows(this.dataRows(), this.mapping(), this.fields(), this.texts()));
  protected readonly invalidRows = computed(() => new Set(this.converted().errors.map((e) => e.row)));
  protected readonly validCount = computed(() => this.converted().rows.length - this.invalidRows().size);
  private readonly errorIndex = computed(() => {
    const map = new Map<string, string>();
    for (const e of this.converted().errors) map.set(`${e.row}|${e.field}`, e.message);
    return map;
  });

  protected readonly previewRows = computed(() =>
    this.converted().rows.map((r, i) => {
      const out: Record<string, unknown> = { __row: i + 1 };
      for (const f of this.fields()) {
        const v = r[f.key];
        out[f.key] = v instanceof Date ? `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}` : v;
      }
      return out;
    }),
  );
  protected readonly previewColumns = computed<CbDataGridColumn<Record<string, unknown>>[]>(() =>
    this.fields().map((f) => ({
      field: f.key,
      header: f.label,
      type: f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'boolean' ? 'checkbox' : 'text',
      decimals: f.type === 'number' ? 2 : undefined,
      sortable: false,
      // Los errores vienen de la conversión (el valor original se muestra tal cual).
      format: (value: unknown, row: Record<string, unknown>) => (this.errorIndex().has(`${row['__row']}|${f.key}`) ? String(value ?? '') : this.plain(value, f)),
      validate: (_: unknown, row: Record<string, unknown>) => this.errorIndex().get(`${row['__row']}|${f.key}`) ?? null,
    })),
  );
  protected readonly importable = computed(() => (this.onlyValid() && !this.allowInvalid() ? this.validCount() : this.converted().rows.length));

  protected stepLabel(step: Step): string {
    const t = this.t();
    return step === 'file' ? t.importStepFile : step === 'map' ? t.importStepMap : t.importStepReview;
  }

  protected columnName(i: number): string {
    let n = i + 1;
    let s = '';
    while (n > 0) {
      s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
      n = Math.floor((n - 1) / 26);
    }
    return cbFormat(this.t().importColumnN, s);
  }

  protected example(key: string): string {
    const col = this.mapping()[key];
    if (col == null) return '';
    const v = this.dataRows().find((r) => r[col] !== null && r[col] !== '')?.[col];
    if (v == null) return '';
    // El ejemplo se muestra ya interpretado (una fecha de Excel llega como número de serie).
    const field = this.fields().find((f) => f.key === key);
    if (field?.type === 'date') {
      const d = parseDate(v);
      if (d) return new Intl.DateTimeFormat(this.t().intlLocale, { dateStyle: 'medium' }).format(d);
    }
    return String(v);
  }

  private plain(value: unknown, f: CbImportField): string {
    if (value === null || value === undefined) return '';
    if (f.type === 'number' && typeof value === 'number') return new Intl.NumberFormat(this.t().intlLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    if (f.type === 'date' && typeof value === 'string') {
      const [y, m, d] = value.split('-').map(Number);
      return new Intl.DateTimeFormat(this.t().intlLocale, { dateStyle: 'medium' }).format(new Date(y, m - 1, d));
    }
    if (f.type === 'boolean') return value ? this.t().yes : this.t().no;
    return String(value);
  }

  // --- Archivo -----------------------------------------------------------------------------

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) void this.load(file);
  }

  protected onFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) void this.load(file);
  }

  protected onPaste(event: Event): void {
    const text = (event.target as HTMLTextAreaElement).value;
    this.fileName.set('');
    this.sheets.set([]);
    this.loadText(text);
  }

  /** Carga un archivo (.xlsx, .csv, .tsv, .txt). */
  async load(file: File): Promise<void> {
    this.error.set('');
    this.fileName.set(file.name);
    try {
      if (/\.xlsx$/i.test(file.name) || file.type.includes('spreadsheetml')) {
        const sheets = await cbReadXlsx(file);
        if (!sheets.length) throw new Error();
        this.sheets.set(sheets);
        this.sheetIndex.set(0);
        this.text.set([]);
      } else {
        this.sheets.set([]);
        this.loadText(await file.text());
      }
      this.remap();
    } catch {
      this.error.set(this.t().importErrFile);
    }
  }

  /** Carga texto delimitado (CSV, TSV o lo pegado de una hoja de cálculo). */
  loadText(text: string): void {
    this.text.set(parseDelimited(text));
    this.remap();
  }

  protected setHeader(value: boolean): void {
    this.hasHeader.set(value);
    this.remap();
  }

  protected setMapping(key: string, column: number): void {
    this.mapping.update((m) => ({ ...m, [key]: column < 0 ? null : column }));
  }

  private remap(): void {
    this.mapping.set(this.hasHeader() ? autoMap(this.headers(), this.fields()) : Object.fromEntries(this.fields().map((f) => [f.key, null])));
  }

  // --- Pasos -------------------------------------------------------------------------------

  protected canNext(): boolean {
    return this.step() === 'file' ? this.dataRows().length > 0 : this.missing().length === 0;
  }

  protected next(): void {
    if (!this.canNext()) return;
    this.step.set(this.step() === 'file' ? 'map' : 'review');
    this.focusHeading();
  }

  protected back(): void {
    this.step.set(this.step() === 'review' ? 'map' : 'file');
    this.focusHeading();
  }

  protected finish(): void {
    const only = this.onlyValid() && !this.allowInvalid();
    const { rows, errors } = this.converted();
    const invalid = this.invalidRows();
    const kept = only ? rows.filter((_, i) => !invalid.has(i + 1)) : rows;
    this.import.emit({ rows: kept, errors, skipped: rows.length - kept.length });
  }

  /** Vuelve al primer paso sin datos. */
  reset(): void {
    this.step.set('file');
    this.text.set([]);
    this.sheets.set([]);
    this.fileName.set('');
    this.error.set('');
    this.mapping.set({});
  }

  private focusHeading(): void {
    queueMicrotask(() => document.getElementById(`${this.uid}-heading`)?.focus());
  }
}
