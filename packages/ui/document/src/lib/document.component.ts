import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, booleanAttribute, computed, inject, input, viewChild } from '@angular/core';
import { CB_CONFIG, cbFormatAmount, injectCbTranslation } from '@caribeng/ui';
import { cbAmountInWords } from '@caribeng/ui/amount';
import { cbPrintElement } from './print';

/** Empresa que emite el documento. */
export interface CbDocumentIssuer {
  readonly name: string;
  /** NIT u otra identificación. */
  readonly taxId?: string;
  readonly address?: string;
  readonly phone?: string;
  readonly email?: string;
  /** URL del logo. */
  readonly logo?: string;
}

/** Tercero del documento (cliente, proveedor, beneficiario). */
export interface CbDocumentParty {
  /** Rótulo («Cliente», «Pagado a»). */
  readonly label?: string;
  readonly name: string;
  readonly taxId?: string;
  readonly address?: string;
  readonly phone?: string;
  readonly email?: string;
}

/** Línea del documento. */
export interface CbDocumentLine {
  readonly description: string;
  readonly code?: string;
  readonly quantity: number;
  readonly unitPrice: number;
  /** Descuento (0–1). */
  readonly discount?: number;
  /** Impuesto (0–1, p. ej. 0.19 para IVA del 19 %). */
  readonly tax?: number;
}

/** Ajuste después de impuestos (retenciones con importe negativo, cargos con positivo). */
export interface CbDocumentAdjustment {
  readonly label: string;
  readonly amount: number;
}

/** Dato suelto de la cabecera (vencimiento, forma de pago, orden de compra…). */
export interface CbDocumentField {
  readonly label: string;
  readonly value: string;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Totales de un documento a partir de sus líneas. */
export function documentTotals(lines: readonly CbDocumentLine[], adjustments: readonly CbDocumentAdjustment[] = []) {
  let subtotal = 0;
  let discount = 0;
  const taxes = new Map<number, { base: number; amount: number }>();
  for (const l of lines) {
    const gross = l.quantity * l.unitPrice;
    const disc = gross * (l.discount ?? 0);
    const base = gross - disc;
    subtotal += gross;
    discount += disc;
    if (l.tax) {
      const t = taxes.get(l.tax) ?? { base: 0, amount: 0 };
      t.base += base;
      t.amount += base * l.tax;
      taxes.set(l.tax, t);
    }
  }
  const taxList = [...taxes].sort(([a], [b]) => b - a).map(([rate, t]) => ({ rate, base: round(t.base), amount: round(t.amount) }));
  const taxTotal = round(taxList.reduce((s, t) => s + t.amount, 0));
  const adjustmentTotal = round(adjustments.reduce((s, a) => s + a.amount, 0));
  const net = round(subtotal - discount);
  return { subtotal: round(subtotal), discount: round(discount), net, taxes: taxList, taxTotal, adjustments, total: round(net + taxTotal + adjustmentTotal) };
}

/**
 * Documento imprimible de CaribeNG: factura, cotización, comprobante o recibo con
 * cabecera de la empresa, tercero, líneas, impuestos, retenciones, total en letras,
 * notas y firmas.
 *
 * - Calcula subtotales, descuentos, impuestos por tarifa y ajustes (retenciones).
 * - `print()` imprime solo el documento (o lo guarda en PDF) con sus estilos.
 *
 * @example
 * ```html
 * <cb-document #doc title="Factura de venta" number="FV-1252" [issuer]="empresa" [party]="cliente" [lines]="items" />
 * <button (click)="doc.print()">Imprimir</button>
 * ```
 */
@Component({
  selector: 'cb-document',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-document' },
  template: `
    <article #sheet class="cb-doc" [attr.aria-label]="title() + (number() ? ' ' + number() : '')">
      <header class="cb-doc__head">
        <div class="cb-doc__issuer">
          @if (issuer().logo) {
            <img class="cb-doc__logo" [src]="issuer().logo" alt="" />
          }
          <div>
            <p class="cb-doc__issuer-name">{{ issuer().name }}</p>
            @if (issuer().taxId) {
              <p>{{ t().documentTaxId }} {{ issuer().taxId }}</p>
            }
            @if (issuer().address) {
              <p>{{ issuer().address }}</p>
            }
            @if (issuer().phone || issuer().email) {
              <p>{{ join(issuer().phone, issuer().email) }}</p>
            }
          </div>
        </div>
        <div class="cb-doc__title-box">
          <h2 class="cb-doc__title">{{ title() }}</h2>
          @if (number()) {
            <p class="cb-doc__number">{{ number() }}</p>
          }
          @if (date()) {
            <p>{{ t().documentDate }}: {{ longDate(date()!) }}</p>
          }
        </div>
      </header>

      @if (party() || fields().length) {
        <section class="cb-doc__meta">
          @if (party(); as p) {
            <div class="cb-doc__party">
              <p class="cb-doc__caption">{{ p.label || t().documentParty }}</p>
              <p class="cb-doc__party-name">{{ p.name }}</p>
              @if (p.taxId) {
                <p>{{ t().documentTaxId }} {{ p.taxId }}</p>
              }
              @if (p.address) {
                <p>{{ p.address }}</p>
              }
              @if (p.phone || p.email) {
                <p>{{ join(p.phone, p.email) }}</p>
              }
            </div>
          }
          @if (fields().length) {
            <dl class="cb-doc__fields">
              @for (f of fields(); track f.label) {
                <div>
                  <dt>{{ f.label }}</dt>
                  <dd>{{ f.value }}</dd>
                </div>
              }
            </dl>
          }
        </section>
      }

      @if (lines().length) {
        <table class="cb-doc__lines" role="table">
          <thead role="rowgroup">
            <tr role="row">
              @if (hasCodes()) {
                <th scope="col" role="columnheader">{{ t().documentCode }}</th>
              }
              <th scope="col" role="columnheader">{{ t().documentDescription }}</th>
              <th scope="col" role="columnheader" class="cb-doc__num">{{ t().documentQuantity }}</th>
              <th scope="col" role="columnheader" class="cb-doc__num">{{ t().documentUnitPrice }}</th>
              @if (hasDiscounts()) {
                <th scope="col" role="columnheader" class="cb-doc__num">{{ t().documentDiscount }}</th>
              }
              @if (hasTaxes()) {
                <th scope="col" role="columnheader" class="cb-doc__num">{{ t().documentTax }}</th>
              }
              <th scope="col" role="columnheader" class="cb-doc__num">{{ t().documentAmount }}</th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            @for (l of lines(); track $index) {
              <tr role="row">
                @if (hasCodes()) {
                  <td class="cb-doc__code" role="cell" [attr.data-label]="t().documentCode">{{ l.code }}</td>
                }
                <td class="cb-doc__desc" role="cell">{{ l.description }}</td>
                <td class="cb-doc__num" role="cell" [attr.data-label]="t().documentQuantity">{{ qty(l.quantity) }}</td>
                <td class="cb-doc__num" role="cell" [attr.data-label]="t().documentUnitPrice">{{ money(l.unitPrice) }}</td>
                @if (hasDiscounts()) {
                  <td class="cb-doc__num" role="cell" [attr.data-label]="t().documentDiscount">{{ l.discount ? pct(l.discount) : '' }}</td>
                }
                @if (hasTaxes()) {
                  <td class="cb-doc__num" role="cell" [attr.data-label]="t().documentTax">{{ l.tax ? pct(l.tax) : '' }}</td>
                }
                <td class="cb-doc__num cb-doc__amount" role="cell" [attr.data-label]="t().documentAmount">{{ money(l.quantity * l.unitPrice * (1 - (l.discount ?? 0))) }}</td>
              </tr>
            }
          </tbody>
        </table>

        <div class="cb-doc__bottom">
          <div class="cb-doc__left">
            @if (words()) {
              <p class="cb-doc__caption">{{ t().documentInWords }}</p>
              <p class="cb-doc__words">{{ inWords() }}</p>
            }
            @if (notes()) {
              <p class="cb-doc__caption">{{ t().documentNotes }}</p>
              <p class="cb-doc__notes">{{ notes() }}</p>
            }
          </div>
          <dl class="cb-doc__totals">
            <div>
              <dt>{{ t().documentSubtotal }}</dt>
              <dd>{{ money(totals().subtotal) }}</dd>
            </div>
            @if (totals().discount) {
              <div>
                <dt>{{ t().documentDiscount }}</dt>
                <dd>{{ money(-totals().discount) }}</dd>
              </div>
            }
            @for (tx of totals().taxes; track tx.rate) {
              <div>
                <dt>{{ taxLabel() }} {{ pct(tx.rate) }}</dt>
                <dd>{{ money(tx.amount) }}</dd>
              </div>
            }
            @for (a of totals().adjustments; track a.label) {
              <div>
                <dt>{{ a.label }}</dt>
                <dd>{{ money(a.amount) }}</dd>
              </div>
            }
            <div class="cb-doc__grand">
              <dt>{{ t().documentTotal }}</dt>
              <dd>{{ money(totals().total) }}</dd>
            </div>
          </dl>
        </div>
      }

      <ng-content />

      @if (signatures().length) {
        <div class="cb-doc__signs">
          @for (s of signatures(); track $index) {
            <div class="cb-doc__sign">
              <span class="cb-doc__sign-line"></span>
              <span>{{ s }}</span>
            </div>
          }
        </div>
      }
      @if (footer()) {
        <footer class="cb-doc__footer">{{ footer() }}</footer>
      }
    </article>
  `,
  styleUrl: './document.component.css',
})
export class CbDocument {
  protected readonly t = injectCbTranslation();
  private readonly config = inject(CB_CONFIG);
  private readonly sheet = viewChild.required<ElementRef<HTMLElement>>('sheet');

  /** Título («Factura electrónica de venta», «Comprobante de egreso»). */
  readonly title = input<string>('');
  readonly number = input<string>('');
  readonly date = input<Date | null>(null);
  readonly issuer = input<CbDocumentIssuer>({ name: '' });
  readonly party = input<CbDocumentParty | null>(null);
  /** Datos sueltos de la cabecera (vencimiento, forma de pago…). */
  readonly fields = input<readonly CbDocumentField[]>([]);
  readonly lines = input<readonly CbDocumentLine[]>([]);
  /** Retenciones (negativas) u otros cargos después de impuestos. */
  readonly adjustments = input<readonly CbDocumentAdjustment[]>([]);
  /** Nombre del impuesto en los totales («IVA»). */
  readonly taxLabel = input<string>('IVA');
  /** Muestra el total en letras. */
  readonly words = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly notes = input<string>('');
  /** Rótulos de las firmas («Elaboró», «Aprobó», «Recibí conforme»). */
  readonly signatures = input<readonly string[]>([]);
  readonly footer = input<string>('');
  readonly currency = input<string | undefined>(undefined);

  /** Subtotal, descuentos, impuestos por tarifa, ajustes y total. */
  readonly totals = computed(() => documentTotals(this.lines(), this.adjustments()));
  protected readonly hasCodes = computed(() => this.lines().some((l) => l.code));
  protected readonly hasDiscounts = computed(() => this.lines().some((l) => l.discount));
  protected readonly hasTaxes = computed(() => this.lines().some((l) => l.tax));

  private readonly locale = computed(() => this.config.numberLocale ?? this.t().intlLocale);
  private readonly code = computed(() => this.currency() ?? this.config.currency ?? 'COP');

  protected join(...parts: (string | undefined)[]): string {
    return parts.filter((p) => !!p).join(' · ');
  }

  protected money(v: number): string {
    return cbFormatAmount(v, this.locale(), { currency: this.code(), negative: 'minus' });
  }

  protected qty(v: number): string {
    return new Intl.NumberFormat(this.locale(), { maximumFractionDigits: 3 }).format(v);
  }

  protected pct(v: number): string {
    return new Intl.NumberFormat(this.locale(), { style: 'percent', maximumFractionDigits: 2 }).format(v);
  }

  protected longDate(d: Date): string {
    return new Intl.DateTimeFormat(this.t().intlLocale, { dateStyle: 'long' }).format(d);
  }

  protected readonly inWords = computed(() => cbAmountInWords(this.totals().total, { language: this.t().intlLocale.startsWith('en') ? 'en' : 'es', currency: this.code() }));

  /** Imprime solo el documento (o lo guarda como PDF desde el diálogo de impresión). */
  print(): void {
    cbPrintElement(this.sheet().nativeElement, [this.title(), this.number()].filter(Boolean).join(' '));
  }
}
