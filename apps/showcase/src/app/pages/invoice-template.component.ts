import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbButton } from '@caribeng/ui/button';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

interface Line {
  description: string;
  qty: number;
  unit: number;
}

/** Template (receta): factura / recibo imprimible, data-driven, con componentes CaribeNG. */
@Component({
  selector: 'doc-invoice-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbIcon, CbButton, DocPageHeaderComponent, DocSectionComponent],
  template: `
    <doc-page-header
      eyebrow="Plantillas"
      title="Invoice"
      lead="Factura / recibo imprimible: encabezado con empresa y datos, destinatario, tabla de conceptos y totales. Composición con componentes CaribeNG."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode">
      <div class="inv">
        <header class="inv__head">
          <div class="inv__company">
            <span class="inv__logo"><cb-icon name="sparkles" [size]="28" aria-hidden="true" /></span>
            <div>
              <h2 class="inv__company-name">TU EMPRESA</h2>
              <p class="inv__company-addr">Calle 3 #9137, California City<br />CA 93504, USA</p>
            </div>
          </div>
          <div class="inv__meta">
            <h3 class="inv__title">FACTURA</h3>
            <dl class="inv__meta-list">
              <div><dt>Fecha</dt><dd>30/08/2027</dd></div>
              <div><dt>N.º</dt><dd>8523</dd></div>
              <div><dt>Cliente</dt><dd>C1613</dd></div>
            </dl>
          </div>
        </header>

        <div class="inv__divider"></div>

        <section class="inv__billto">
          <h4>Facturar a</h4>
          <p>Claire Williams, Calle Hope 148<br />Palo Alto, CA 94304</p>
        </section>

        <table class="inv__table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th class="inv__num">Cantidad</th>
              <th class="inv__num">Precio</th>
              <th class="inv__num">Total</th>
            </tr>
          </thead>
          <tbody>
            @for (l of lines; track l.description) {
              <tr>
                <td>{{ l.description }}</td>
                <td class="inv__num">{{ l.qty }}</td>
                <td class="inv__num">{{ money(l.unit) }}</td>
                <td class="inv__num">{{ money(l.qty * l.unit) }}</td>
              </tr>
            }
          </tbody>
        </table>

        <div class="inv__foot">
          <div class="inv__notes">
            <h4>Notas</h4>
            <p>Gracias por su compra. El pago vence a 15 días.</p>
          </div>
          <dl class="inv__totals">
            <div><dt>Subtotal</dt><dd>{{ money(subtotal) }}</dd></div>
            <div><dt>IVA (0%)</dt><dd>{{ money(0) }}</dd></div>
            <div class="inv__total"><dt>Total</dt><dd>{{ money(subtotal) }}</dd></div>
          </dl>
        </div>

        <div class="inv__actions">
          <cb-button variant="outlined" severity="secondary"><cb-icon name="download" [size]="16" aria-hidden="true" /> Descargar PDF</cb-button>
          <cb-button>Pagar ahora</cb-button>
        </div>
      </div>
    </doc-section>
  `,
  styles: [
    `
      .inv {
        width: 100%;
        max-width: 820px;
        margin: 0 auto;
        padding: 2.5rem;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg, 14px);
        background: var(--cb-color-surface);
        color: var(--cb-color-text);
        font-family: var(--cb-font-sans);
      }
      .inv__head {
        display: flex;
        justify-content: space-between;
        gap: 1.5rem;
        flex-wrap: wrap;
      }
      .inv__company {
        display: flex;
        gap: 0.9rem;
      }
      .inv__logo {
        display: inline-flex;
        color: var(--cb-color-primary-500, #10b981);
      }
      .inv__company-name {
        margin: 0;
        font-size: 1.4rem;
        letter-spacing: 0.02em;
      }
      .inv__company-addr {
        margin: 0.35rem 0 0;
        font-size: 0.82rem;
        color: var(--cb-color-text-muted);
        line-height: 1.5;
      }
      .inv__meta {
        text-align: right;
      }
      .inv__title {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
        letter-spacing: 0.08em;
        color: var(--cb-color-text-muted);
      }
      .inv__meta-list {
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        font-size: 0.85rem;
      }
      .inv__meta-list div {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
      }
      .inv__meta-list dt {
        color: var(--cb-color-text-muted);
        font-weight: 600;
      }
      .inv__meta-list dd {
        margin: 0;
        min-width: 70px;
      }
      .inv__divider {
        height: 1px;
        margin: 1.75rem 0;
        background: var(--cb-color-border);
      }
      .inv__billto h4,
      .inv__notes h4 {
        margin: 0 0 0.4rem;
        font-size: 0.8rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--cb-color-text-muted);
      }
      .inv__billto p {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.5;
      }
      .inv__table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.75rem 0;
        font-size: 0.9rem;
      }
      .inv__table th {
        text-align: left;
        padding: 0.6rem 0.4rem;
        border-bottom: 1px solid var(--cb-color-border);
        color: var(--cb-color-text-muted);
        font-weight: 600;
      }
      .inv__table td {
        padding: 0.7rem 0.4rem;
        border-bottom: 1px solid var(--cb-color-border);
      }
      .inv__num {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .inv__foot {
        display: flex;
        justify-content: space-between;
        gap: 2rem;
        flex-wrap: wrap;
      }
      .inv__notes p {
        margin: 0;
        font-size: 0.85rem;
        color: var(--cb-color-text-muted);
        max-width: 22rem;
      }
      .inv__totals {
        margin: 0;
        min-width: 15rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .inv__totals div {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
      }
      .inv__totals dt {
        color: var(--cb-color-text-muted);
        font-weight: 600;
      }
      .inv__totals dd {
        margin: 0;
        font-variant-numeric: tabular-nums;
      }
      .inv__total {
        margin-top: 0.4rem;
        padding-top: 0.6rem;
        border-top: 1px solid var(--cb-color-border);
        font-size: 1.1rem !important;
        font-weight: 700;
      }
      .inv__actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.6rem;
        margin-top: 2rem;
      }
    `,
  ],
})
export class InvoiceTemplateComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly lines: Line[] = [
    { description: 'Camiseta verde', qty: 1, unit: 49 },
    { description: 'Control de juego', qty: 2, unit: 99 },
    { description: 'Mini altavoces', qty: 1, unit: 85 },
  ];

  protected get subtotal(): number {
    return this.lines.reduce((acc, l) => acc + l.qty * l.unit, 0);
  }

  protected money(n: number): string {
    return `$${n.toFixed(2)}`;
  }

  protected readonly htmlCode = `<div class="inv">
  <header class="inv__head">
    <div class="inv__company">
      <cb-icon name="sparkles" [size]="28" /> <h2>TU EMPRESA</h2>
    </div>
    <div class="inv__meta">
      <h3>FACTURA</h3>
      <!-- Fecha / N.º / Cliente -->
    </div>
  </header>

  <table class="inv__table">
    <thead>
      <tr><th>Descripción</th><th>Cantidad</th><th>Precio</th><th>Total</th></tr>
    </thead>
    <tbody>
      @for (l of lines; track l.description) {
        <tr>
          <td>{{ l.description }}</td><td>{{ l.qty }}</td>
          <td>{{ money(l.unit) }}</td><td>{{ money(l.qty * l.unit) }}</td>
        </tr>
      }
    </tbody>
  </table>

  <!-- Totales: Subtotal / IVA / Total -->
  <div class="inv__actions">
    <cb-button variant="outlined"><cb-icon name="download" [size]="16" /> Descargar PDF</cb-button>
    <cb-button>Pagar ahora</cb-button>
  </div>
</div>`;
}
