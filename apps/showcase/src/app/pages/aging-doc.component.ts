import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbAging, type CbAgingBucket, type CbAgingDocument } from '@caribeng/ui/aging';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { CARTERA } from '../data/puc';

@Component({
  selector: 'doc-aging-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbAging, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Contabilidad"
      title="Aging"
      lead="Antigüedad de cartera: cuentas por cobrar o por pagar repartidas en tramos de vencimiento, por tercero, con la composición de la deuda y el detalle de cada documento."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="receivable"
      title="Cartera por edades"
      description="documents trae las facturas pendientes (tercero, número, fecha, vencimiento y saldo) y asOf la fecha de corte. La barra muestra la composición por tramo; cada cliente se abre para ver sus facturas con los días vencidos. Los encabezados ordenan (por defecto, por total) y Excel descarga el resumen y el detalle en dos hojas. Con documentLinks, el número de cada factura emite documentOpen."
      [code]="receivableCode"
    >
      <div style="display: grid; gap: 0.5rem; width: 100%">
        <cb-aging title="Cartera por edades" partyHeader="Cliente" [documents]="cartera" [asOf]="corte" [documentLinks]="true" (documentOpen)="abierto.set($event.number ?? '')" />
        <p class="ag-log">{{ abierto() ? 'Abrir la factura ' + abierto() : '' }}</p>
      </div>
    </doc-section>

    <doc-section
      id="buckets"
      title="Tramos propios"
      description="buckets cambia los tramos: aquí, por vencer, hasta 15 días, de 16 a 45 y más de 45, para una política de cobro más estricta."
      [code]="bucketsCode"
    >
      <cb-aging [documents]="cartera" [asOf]="corte" [buckets]="tramos" partyHeader="Cliente" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .ag-log {
        min-height: 1.25rem;
        margin: 0;
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class AgingDocComponent {
  protected readonly docApi = DOC_API['cb-aging'];
  protected readonly a11y = DOC_A11Y['cb-aging'];

  protected readonly cartera: CbAgingDocument[] = CARTERA;
  protected readonly corte = new Date(2026, 9, 31);
  protected readonly abierto = signal('');
  protected readonly tramos: CbAgingBucket[] = [
    { key: 'current', label: 'Por vencer', from: null, to: 0 },
    { key: 'd15', label: '1–15 días', from: 1, to: 15 },
    { key: 'd45', label: '16–45 días', from: 16, to: 45 },
    { key: 'over', label: 'Más de 45 días', from: 46, to: null },
  ];

  protected readonly importCode = `import { CbAging, type CbAgingDocument, type CbAgingBucket } from '@caribeng/ui/aging';`;
  protected readonly receivableCode = `<div style="display: grid; gap: 0.5rem; width: 100%">
  <cb-aging title="Cartera por edades" partyHeader="Cliente" [documents]="cartera" [asOf]="corte" [documentLinks]="true" (documentOpen)="abierto.set($event.number ?? '')" />
  <p class="ag-log">{{ abierto() ? 'Abrir la factura ' + abierto() : '' }}</p>
</div>`;
  protected readonly bucketsCode = `<cb-aging [documents]="cartera" [asOf]="corte" [buckets]="tramos" partyHeader="Cliente" />`;

  constructor() {
    inject(TocService).reset();
  }
}
