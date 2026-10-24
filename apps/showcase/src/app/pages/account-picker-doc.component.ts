import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbAccountPicker, cbAccountOptions, type CbAccount } from '@caribeng/ui/account-picker';
import { CbDataGrid, type CbDataGridColumn } from '@caribeng/ui/datagrid';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { PUC } from '../data/puc';

interface Distribucion {
  id: number;
  cuenta: string | null;
  porcentaje: number | null;
}

@Component({
  selector: 'doc-account-picker-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbAccountPicker, CbDataGrid, ReactiveFormsModule, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Contabilidad"
      title="Account Picker"
      lead="Selector de cuenta contable: busca en el plan de cuentas (PUC) por código o por nombre, muestra la jerarquía de cada cuenta y solo deja elegir cuentas de movimiento."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="accounts recibe el plan de cuentas como lista plana: la jerarquía se deduce del código (110505 cuelga de 1105) o de parent. Escribe un código (1105) o una palabra (energía, bancos nacional); las cuentas mayores aparecen como contexto pero no se eligen. Escribir el código completo y salir del campo lo elige; bajo el campo se ve la ruta."
      [code]="basicCode"
    >
      <div style="display: grid; gap: 0.5rem; width: min(100%, 28rem)">
        <cb-account-picker label="Cuenta" [accounts]="puc" [(value)]="cuenta" />
        <span class="ap-value">Valor: {{ cuenta() ?? 'null' }}</span>
      </div>
    </doc-section>

    <doc-section
      id="form"
      title="En un formulario"
      description="Funciona con Angular Forms: el valor es el código de la cuenta, required marca el campo y error muestra el mensaje al tocarlo sin elegir."
      [code]="formCode"
    >
      <div style="width: min(100%, 28rem)">
        <cb-account-picker label="Cuenta de gasto" [accounts]="puc" [formControl]="gasto" error="Elige la cuenta de gasto." hint="Solo cuentas de movimiento." />
      </div>
    </doc-section>

    <doc-section
      id="parents"
      title="Cuentas mayores e inactivas"
      description="allowParents deja elegir también cuentas mayores (útil en filtros de informes). Las cuentas con disabled: true (como 530515 Comisiones) se ven pero nunca se eligen."
      [code]="parentsCode"
    >
      <div style="width: min(100%, 28rem)">
        <cb-account-picker label="Filtrar por cuenta" [accounts]="puc" allowParents [(value)]="filtro" />
      </div>
    </doc-section>

    <doc-section
      id="grid"
      title="En el Data Grid"
      description="cbAccountOptions(puc) convierte el plan de cuentas en opciones para una columna autocomplete del Data Grid: etiqueta código y nombre, ruta como descripción y solo cuentas de movimiento. Así se busca la cuenta escribiendo dentro de la celda, y pegar un código desde Excel la encuentra."
      [code]="gridCode"
    >
      <cb-data-grid [(rows)]="distribucion" [columns]="columnas" ariaLabel="Distribución de gastos" scrollHeight="14rem" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .ap-value {
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class AccountPickerDocComponent {
  protected readonly docApi = DOC_API['cb-account-picker'];
  protected readonly a11y = DOC_A11Y['cb-account-picker'];

  protected readonly puc: CbAccount[] = PUC;
  protected readonly cuenta = signal<string | null>('513530');
  protected readonly filtro = signal<string | null>(null);
  protected readonly gasto = new FormControl<string | null>(null, Validators.required);

  protected readonly columnas: CbDataGridColumn<Distribucion>[] = [
    { field: 'cuenta', header: 'Cuenta', type: 'autocomplete', options: cbAccountOptions(PUC), required: true, width: '20rem' },
    { field: 'porcentaje', header: '% del gasto', type: 'number', min: 0, max: 100, summary: 'sum', width: '9rem' },
  ];
  protected readonly distribucion = signal<readonly Distribucion[]>([
    { id: 1, cuenta: '512010', porcentaje: 60 },
    { id: 2, cuenta: '513530', porcentaje: 25 },
    { id: 3, cuenta: '513540', porcentaje: 15 },
  ]);

  protected readonly importCode = `import { CbAccountPicker, cbAccountOptions, type CbAccount } from '@caribeng/ui/account-picker';`;
  protected readonly basicCode = `<div style="display: grid; gap: 0.5rem; width: min(100%, 28rem)">
  <cb-account-picker label="Cuenta" [accounts]="puc" [(value)]="cuenta" />
  <span class="ap-value">Valor: {{ cuenta() ?? 'null' }}</span>
</div>`;
  protected readonly formCode = `<div style="width: min(100%, 28rem)">
  <cb-account-picker label="Cuenta de gasto" [accounts]="puc" [formControl]="gasto" error="Elige la cuenta de gasto." hint="Solo cuentas de movimiento." />
</div>`;
  protected readonly parentsCode = `<div style="width: min(100%, 28rem)">
  <cb-account-picker label="Filtrar por cuenta" [accounts]="puc" allowParents [(value)]="filtro" />
</div>`;
  protected readonly gridCode = `<cb-data-grid [(rows)]="distribucion" [columns]="columnas" ariaLabel="Distribución de gastos" scrollHeight="14rem" />`;

  constructor() {
    inject(TocService).reset();
  }
}
