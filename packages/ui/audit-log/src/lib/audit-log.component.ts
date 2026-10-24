import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, output, signal } from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { CbSelect } from '@caribeng/ui/select';
import { cbDownloadXlsx, type CbXlsxSheet } from '@caribeng/ui/xlsx';

/** Cambio de un campo en un registro de auditoría. */
export interface CbAuditChange {
  readonly field: string;
  readonly label?: string;
  readonly before: unknown;
  readonly after: unknown;
}

/** Registro de auditoría: quién hizo qué, cuándo y sobre qué. */
export interface CbAuditEntry {
  readonly id: string | number;
  /** `Date` o texto ISO (`2026-10-23T14:05`). */
  readonly date: Date | string;
  readonly user: string;
  /** `create`, `update`, `delete` u otra acción (se muestra tal cual). */
  readonly action: string;
  /** Sobre qué («Comprobante CE-000124»). */
  readonly entity: string;
  readonly changes?: readonly CbAuditChange[];
  readonly note?: string;
}

const toDate = (d: Date | string) => (d instanceof Date ? d : new Date(d));
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

let nextUid = 0;

/**
 * Visor de auditoría de CaribeNG: el historial de cambios (quién, cuándo, qué
 * acción y sobre qué registro), agrupado por día, con la diferencia antes /
 * después de cada campo.
 *
 * - Búsqueda y filtros por usuario y acción; cada registro con cambios se abre
 *   para ver la tabla Campo · Antes · Después.
 * - `format` da el texto de los valores (importes, fechas, cuentas); Excel descarga el historial.
 *
 * @example
 * ```html
 * <cb-audit-log [entries]="historial" [format]="formatoValor" />
 * ```
 */
@Component({
  selector: 'cb-audit-log',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbButton, CbIcon, CbSelect],
  host: { class: 'cb-audit-log' },
  template: `
    <div class="cb-al__filters" role="search">
      <label class="cb-al__search">
        <cb-icon name="search" [size]="15" aria-hidden="true" />
        <input type="search" [placeholder]="t().auditSearch" [attr.aria-label]="t().auditSearch" [value]="query()" (input)="query.set($any($event.target).value)" />
      </label>
      <cb-select [options]="userOptions()" optionValue="value" [value]="user()" (valueChange)="user.set($any($event))" [ariaLabel]="t().auditUser" />
      <cb-select [options]="actionOptions()" optionValue="value" [value]="action()" (valueChange)="action.set($any($event))" [ariaLabel]="t().auditAction" />
      <span class="cb-al__spacer"></span>
      <span class="cb-al__count" aria-live="polite">{{ fmt(t().auditCount, filtered().length) }}</span>
      <cb-button size="sm" variant="outlined" (click)="exportExcel()">
        <cb-icon name="download" [size]="15" aria-hidden="true" />
        {{ t().reportExcel }}
      </cb-button>
    </div>

    @for (group of groups(); track group.day) {
      <section class="cb-al__day" [attr.aria-labelledby]="uid + '-' + group.day">
        <h3 class="cb-al__day-title" [id]="uid + '-' + group.day">{{ group.label }}</h3>
        <ol class="cb-al__list">
          @for (e of group.entries; track e.id) {
            <li class="cb-al__entry" [class]="'cb-al__entry--' + e.action">
              <span class="cb-al__avatar" aria-hidden="true">{{ initials(e.user) }}</span>
              <div class="cb-al__body">
                <p class="cb-al__line">
                  <strong>{{ e.user }}</strong> {{ actionName(e.action) }} <span class="cb-al__entity">{{ e.entity }}</span>
                  <time class="cb-al__time" [attr.datetime]="iso(e.date)">{{ time(e.date) }}</time>
                </p>
                @if (e.note) {
                  <p class="cb-al__note">{{ e.note }}</p>
                }
                @if (e.changes?.length) {
                  <button type="button" class="cb-al__toggle" [attr.aria-expanded]="isOpen(e.id)" [attr.aria-controls]="uid + '-c-' + e.id" (click)="toggle(e.id)">
                    <cb-icon name="chevron-right" [size]="13" [class.cb-is-open]="isOpen(e.id)" aria-hidden="true" />
                    {{ fmt(t().auditChanges, e.changes!.length) }}
                  </button>
                  @if (isOpen(e.id)) {
                    <table class="cb-al__diff" [id]="uid + '-c-' + e.id" [attr.aria-label]="fmt(t().auditChangesOf, e.entity)">
                      <thead>
                        <tr>
                          <th scope="col">{{ t().auditField }}</th>
                          <th scope="col">{{ t().auditBefore }}</th>
                          <th scope="col">{{ t().auditAfter }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (c of e.changes; track c.field) {
                          <tr>
                            <th scope="row">{{ c.label || c.field }}</th>
                            <td class="cb-al__before">
                              @if (isEmpty(c.before)) {
                                <span class="cb-al__empty">{{ t().auditEmpty }}</span>
                              } @else {
                                <del>{{ show(c.field, c.before) }}</del>
                              }
                            </td>
                            <td class="cb-al__after">
                              @if (isEmpty(c.after)) {
                                <span class="cb-al__empty">{{ t().auditEmpty }}</span>
                              } @else {
                                <ins>{{ show(c.field, c.after) }}</ins>
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  }
                }
              </div>
            </li>
          }
        </ol>
      </section>
    } @empty {
      <p class="cb-al__none">{{ t().auditNone }}</p>
    }
  `,
  styleUrl: './audit-log.component.css',
})
export class CbAuditLog {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  protected readonly uid = `cb-audit-log-${++nextUid}`;

  /** Registros de auditoría (en cualquier orden: se muestran del más reciente al más antiguo). */
  readonly entries = input<readonly CbAuditEntry[]>([]);
  /** Texto de un valor según su campo (importes, fechas, códigos…). */
  readonly format = input<((field: string, value: unknown) => string) | null>(null);
  /** Nombres de las acciones propias (`{ approve: 'aprobó' }`). */
  readonly actionLabels = input<Readonly<Record<string, string>>>({});

  readonly entryOpen = output<CbAuditEntry>();

  protected readonly query = signal('');
  protected readonly user = signal('');
  protected readonly action = signal('');
  private readonly open = signal<ReadonlySet<string | number>>(new Set());

  protected readonly userOptions = computed(() => [{ label: this.t().auditAllUsers, value: '' }, ...[...new Set(this.entries().map((e) => e.user))].sort().map((u) => ({ label: u, value: u }))]);
  protected readonly actionOptions = computed(() => [{ label: this.t().auditAllActions, value: '' }, ...[...new Set(this.entries().map((e) => e.action))].map((a) => ({ label: this.actionName(a), value: a }))]);

  protected readonly filtered = computed(() => {
    const q = fold(this.query().trim());
    const user = this.user();
    const action = this.action();
    return [...this.entries()]
      .filter((e) => (!user || e.user === user) && (!action || e.action === action))
      .filter((e) => !q || fold(`${e.user} ${e.entity} ${e.note ?? ''} ${(e.changes ?? []).map((c) => `${c.label ?? c.field} ${this.show(c.field, c.before)} ${this.show(c.field, c.after)}`).join(' ')}`).includes(q))
      .sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime());
  });

  protected readonly groups = computed(() => {
    const out: { day: string; label: string; entries: CbAuditEntry[] }[] = [];
    const fmt = new Intl.DateTimeFormat(this.t().intlLocale, { dateStyle: 'full' });
    for (const e of this.filtered()) {
      const d = toDate(e.date);
      const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      let g = out.find((x) => x.day === day);
      if (!g) {
        const label = fmt.format(d);
        g = { day, label: label.charAt(0).toLocaleUpperCase() + label.slice(1), entries: [] };
        out.push(g);
      }
      g.entries.push(e);
    }
    return out;
  });

  protected actionName(action: string): string {
    const t = this.t();
    const custom = this.actionLabels()[action];
    if (custom) return custom;
    return action === 'create' ? t.auditCreated : action === 'update' ? t.auditUpdated : action === 'delete' ? t.auditDeleted : action;
  }

  protected initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('');
  }

  protected time(d: Date | string): string {
    return new Intl.DateTimeFormat(this.t().intlLocale, { hour: '2-digit', minute: '2-digit' }).format(toDate(d));
  }

  protected iso(d: Date | string): string {
    return toDate(d).toISOString();
  }

  protected isEmpty(v: unknown): boolean {
    return v === null || v === undefined || v === '';
  }

  protected show(field: string, value: unknown): string {
    if (this.isEmpty(value)) return '';
    const f = this.format();
    if (f) return f(field, value);
    if (value instanceof Date) return new Intl.DateTimeFormat(this.t().intlLocale, { dateStyle: 'medium' }).format(value);
    if (typeof value === 'boolean') return value ? this.t().yes : this.t().no;
    return String(value);
  }

  protected isOpen(id: string | number): boolean {
    return this.open().has(id);
  }

  protected toggle(id: string | number): void {
    const next = new Set(this.open());
    if (next.has(id)) next.delete(id);
    else {
      next.add(id);
      const e = this.entries().find((x) => x.id === id);
      if (e) this.entryOpen.emit(e);
    }
    this.open.set(next);
  }

  /** Hoja de Excel con un renglón por campo cambiado (o por registro, si no hay cambios). */
  toExcelSheet(): CbXlsxSheet {
    const t = this.t();
    const rows: unknown[][] = [];
    for (const e of this.filtered()) {
      const base = [toDate(e.date), this.time(e.date), e.user, this.actionName(e.action), e.entity];
      if (e.changes?.length) for (const c of e.changes) rows.push([...base, c.label || c.field, this.show(c.field, c.before), this.show(c.field, c.after), e.note ?? '']);
      else rows.push([...base, '', '', '', e.note ?? '']);
    }
    return {
      name: t.auditTitle,
      columns: [{ header: t.agingDate, type: 'date' }, { header: t.auditTime }, { header: t.auditUser }, { header: t.auditAction }, { header: t.auditEntity }, { header: t.auditField }, { header: t.auditBefore }, { header: t.auditAfter }, { header: t.auditNote }],
      rows,
    };
  }

  exportExcel(filename?: string): void {
    cbDownloadXlsx(filename ?? this.t().auditTitle, this.toExcelSheet());
  }
}
