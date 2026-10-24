import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbDocument, type CbDocumentIssuer, type CbDocumentLine } from '@caribeng/ui/document';
import { CbIcon } from '@caribeng/ui/icon';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-document-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocument, CbButton, CbIcon, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Contabilidad"
      title="Document"
      lead="Documento imprimible: factura, cotización, comprobante o recibo con la empresa, el tercero, las líneas, los impuestos, las retenciones, el total en letras, notas y firmas, listo para imprimir o guardar en PDF."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="invoice"
      title="Factura de venta"
      description="lines calcula cada valor con su descuento; los impuestos se agrupan por tarifa (IVA 19 %) y adjustments resta retenciones o suma cargos después de impuestos. El total va también en letras. fields añade datos de la cabecera y signatures las firmas. print() imprime solo el documento con sus estilos (o lo guarda como PDF desde el diálogo de impresión)."
      [code]="invoiceCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <div>
          <cb-button size="sm" (click)="factura.print()">
            <cb-icon name="file" [size]="15" aria-hidden="true" />
            Imprimir o guardar en PDF
          </cb-button>
        </div>
        <cb-document
          #factura
          title="Factura electrónica de venta"
          number="FV-1252"
          [date]="fecha"
          [issuer]="empresa"
          [party]="{ name: 'Ferretería Bolívar S.A.S.', taxId: '800.123.456-7', address: 'Cra. 17 # 25-40, Santa Marta', email: 'compras@ferrebolivar.co' }"
          [fields]="[{ label: 'Vence', value: '19 de noviembre de 2026' }, { label: 'Forma de pago', value: 'Crédito 30 días' }, { label: 'Orden de compra', value: 'OC-4471' }]"
          [lines]="items"
          [adjustments]="[{ label: 'Retención en la fuente 2,5 %', amount: -55250 }]"
          notes="Consignar en la cuenta de ahorros 123-456789-01 del Banco de Bogotá a nombre de CaribeNG S.A.S."
          [signatures]="['Elaboró', 'Recibí conforme']"
          footer="Factura electrónica de venta · Resolución DIAN 18764000001 del 1 de enero de 2026 · Rango FV-1000 a FV-5000"
        />
      </div>
    </doc-section>

    <doc-section
      id="voucher"
      title="Comprobante de egreso"
      description="Sin líneas, el documento sirve como recibo o comprobante: el contenido propio va entre las etiquetas (ng-content) y se mantienen la cabecera, el tercero, los datos y las firmas."
      [code]="voucherCode"
    >
      <cb-document
        title="Comprobante de egreso"
        number="CE-000124"
        [date]="fecha"
        [issuer]="empresa"
        [party]="{ label: 'Pagado a', name: 'Enel Colombia S.A.', taxId: '860.063.875-8' }"
        [fields]="[{ label: 'Valor', value: '$ 971.750' }, { label: 'Banco', value: 'Banco de Bogotá' }, { label: 'Transferencia', value: '000874512' }]"
        [signatures]="['Elaboró', 'Aprobó', 'Recibí']"
      >
        <p class="doc-concept"><strong>Concepto:</strong> pago de la factura de energía de octubre de 2026, menos retención en la fuente del 4 %.</p>
      </cb-document>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .doc-concept {
        margin: 0;
      }
    `,
  ],
})
export class DocumentDocComponent {
  protected readonly docApi = DOC_API['cb-document'];
  protected readonly a11y = DOC_A11Y['cb-document'];

  protected readonly fecha = new Date(2026, 9, 20);
  protected readonly empresa: CbDocumentIssuer = { name: 'CaribeNG S.A.S.', taxId: '901.234.567-1', address: 'Calle 72 # 54-35, Barranquilla', phone: '(605) 385 0000', email: 'facturacion@caribeng.co' };
  protected readonly items: CbDocumentLine[] = [
    { code: 'P-1024', description: 'Silla ergonómica con apoyabrazos', quantity: 4, unitPrice: 450000, tax: 0.19 },
    { code: 'P-2210', description: 'Escritorio elevable 140 × 70 cm', quantity: 2, unitPrice: 1200000, discount: 0.1, tax: 0.19 },
    { code: 'P-3107', description: 'Lámpara LED de escritorio', quantity: 4, unitPrice: 85000, tax: 0.19 },
    { code: 'S-0001', description: 'Transporte e instalación', quantity: 1, unitPrice: 150000 },
  ];

  protected readonly importCode = `import { CbDocument, cbPrintElement, type CbDocumentLine } from '@caribeng/ui/document';`;
  protected readonly invoiceCode = `<div style="display: grid; gap: 0.75rem; width: 100%">
  <div>
    <cb-button size="sm" (click)="factura.print()">
      <cb-icon name="file" [size]="15" aria-hidden="true" />
      Imprimir o guardar en PDF
    </cb-button>
  </div>
  <cb-document
    #factura
    title="Factura electrónica de venta"
    number="FV-1252"
    [date]="fecha"
    [issuer]="empresa"
    [party]="{ name: 'Ferretería Bolívar S.A.S.', taxId: '800.123.456-7', address: 'Cra. 17 # 25-40, Santa Marta', email: 'compras@ferrebolivar.co' }"
    [fields]="[{ label: 'Vence', value: '19 de noviembre de 2026' }, { label: 'Forma de pago', value: 'Crédito 30 días' }, { label: 'Orden de compra', value: 'OC-4471' }]"
    [lines]="items"
    [adjustments]="[{ label: 'Retención en la fuente 2,5 %', amount: -55250 }]"
    notes="Consignar en la cuenta de ahorros 123-456789-01 del Banco de Bogotá a nombre de CaribeNG S.A.S."
    [signatures]="['Elaboró', 'Recibí conforme']"
    footer="Factura electrónica de venta · Resolución DIAN 18764000001 del 1 de enero de 2026 · Rango FV-1000 a FV-5000"
  />
</div>`;
  protected readonly voucherCode = `<cb-document
  title="Comprobante de egreso"
  number="CE-000124"
  [date]="fecha"
  [issuer]="empresa"
  [party]="{ label: 'Pagado a', name: 'Enel Colombia S.A.', taxId: '860.063.875-8' }"
  [fields]="[{ label: 'Valor', value: '$ 971.750' }, { label: 'Banco', value: 'Banco de Bogotá' }, { label: 'Transferencia', value: '000874512' }]"
  [signatures]="['Elaboró', 'Aprobó', 'Recibí']"
>
  <p class="doc-concept"><strong>Concepto:</strong> pago de la factura de energía de octubre de 2026, menos retención en la fuente del 4 %.</p>
</cb-document>`;

  constructor() {
    inject(TocService).reset();
  }
}
