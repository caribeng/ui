import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbDescriptions, CbDescriptionsValue, type CbDescriptionItem } from '@caribeng/ui/descriptions';
import { CbTag } from '@caribeng/ui/tag';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-descriptions-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDescriptions, CbDescriptionsValue, CbTag, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Data" title="Descriptions" lead="Lista de pares etiqueta / valor para mostrar el detalle de un registro: un cliente, una cuenta o una transacción." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="items define los pares; columns, las columnas en pantallas anchas (en móvil siempre una). span hace que un elemento ocupe varias."
      [code]="basicCode"
      [codeTs]="basicTs"
    >
      <cb-descriptions style="width: 100%" title="Detalle de la transferencia" [columns]="3" [items]="detalle">
        <ng-template cbDescriptionsValue="estado" let-estado>
          <cb-tag [value]="estado" severity="success" />
        </ng-template>
      </cb-descriptions>
    </doc-section>

    <doc-section
      id="bordered"
      title="Con bordes y en horizontal"
      description="bordered separa los elementos en celdas; layout=&quot;horizontal&quot; pone la etiqueta junto al valor."
      [code]="borderedCode"
    >
      <div style="display: grid; gap: 1.25rem; width: 100%">
        <cb-descriptions bordered [columns]="2" [items]="cliente" />
        <cb-descriptions layout="horizontal" [columns]="1" [items]="clienteResumen" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class DescriptionsDocComponent {
  protected readonly docApi = DOC_API['cb-descriptions'];
  protected readonly a11y = DOC_A11Y['cb-descriptions'];

  protected readonly detalle: CbDescriptionItem[] = [
    { label: 'Cuenta de origen', value: 'Ahorros **** 1234' },
    { label: 'Cuenta de destino', value: 'Corriente **** 9876' },
    { label: 'Valor', value: '$ 250.000' },
    { label: 'Fecha', value: '20 oct 2026, 10:32' },
    { label: 'Estado', key: 'estado', value: 'Aprobada' },
    { label: 'Comprobante', value: '#48213' },
    { label: 'Concepto', value: 'Pago de arriendo de octubre', span: 3 },
  ];
  protected readonly cliente: CbDescriptionItem[] = [
    { label: 'Nombre', value: 'Laura Gómez' },
    { label: 'Documento', value: 'CC 1.020.304.050' },
    { label: 'Correo', value: 'laura@ejemplo.com' },
    { label: 'Teléfono', value: '+57 300 123 4567' },
  ];

  protected readonly clienteResumen = this.cliente.slice(0, 3);

  protected readonly importCode = `import { CbDescriptions, CbDescriptionsValue, type CbDescriptionItem } from '@caribeng/ui/descriptions';`;
  protected readonly basicCode = `<cb-descriptions title="Detalle de la transferencia" [columns]="3" [items]="detalle">
  <ng-template cbDescriptionsValue="estado" let-estado>
    <cb-tag [value]="estado" severity="success" />
  </ng-template>
</cb-descriptions>`;
  protected readonly basicTs = `detalle: CbDescriptionItem[] = [
  { label: 'Cuenta de origen', value: 'Ahorros **** 1234' },
  { label: 'Valor', value: '$ 250.000' },
  { label: 'Estado', key: 'estado', value: 'Aprobada' },
  { label: 'Concepto', value: 'Pago de arriendo de octubre', span: 3 },
];`;
  protected readonly borderedCode = `<cb-descriptions bordered [columns]="2" [items]="cliente" />
<cb-descriptions layout="horizontal" [columns]="1" [items]="clienteResumen" />`;

  constructor() {
    inject(TocService).reset();
  }
}
