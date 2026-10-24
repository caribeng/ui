import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbPivot, type CbPivotField } from '@caribeng/ui/pivot';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { CENTROS_COSTO, MOVIMIENTOS_GASTO, PUC } from '../data/puc';

const NOMBRES = new Map(PUC.map((a) => [a.code, `${a.code} ${a.name}`]));
const CENTROS = new Map(CENTROS_COSTO.map((c) => [c.value, c.label]));
const MES = new Intl.DateTimeFormat('es-CO', { month: 'short', year: 'numeric' });

@Component({
  selector: 'doc-pivot-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbPivot, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Contabilidad"
      title="Pivot"
      lead="Tabla dinámica: cruza los movimientos por cuenta, centro de costo, tercero o mes y agrega sus valores, con subtotales, totales por fila y columna y exportación a Excel."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="expenses"
      title="Gastos por centro de costo y mes"
      description="data son los registros, fields las dimensiones con el texto de sus valores (el nombre de la cuenta a partir del código), rows y columns qué dimensiones van en filas y columnas, y values qué se agrega. Con configurable se eligen desde la tabla: prueba poner Cuenta en filas y Centro de costo en columnas, o cambiar Suma por Promedio. Las filas con hijos se contraen y Excel descarga la tabla con los niveles plegables."
      [code]="expensesCode"
    >
      <cb-pivot [data]="movimientos" [fields]="dimensiones" [(rows)]="filas" [(columns)]="columnas" [values]="[{ field: 'valor' }]" configurable ariaLabel="Gastos por centro de costo" />
    </doc-section>

    <doc-section
      id="collapsed"
      title="Resumen contraído"
      description="collapsed empieza con las filas de primer nivel contraídas, para ver solo los totales por cuenta y abrir las que interesen."
      [code]="collapsedCode"
    >
      <cb-pivot [data]="movimientos" [fields]="dimensiones" [rows]="['cuenta', 'centro']" [columns]="['mes']" [values]="[{ field: 'valor' }]" collapsed ariaLabel="Gastos por cuenta" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class PivotDocComponent {
  protected readonly docApi = DOC_API['cb-pivot'];
  protected readonly a11y = DOC_A11Y['cb-pivot'];

  protected readonly movimientos = MOVIMIENTOS_GASTO;
  protected readonly dimensiones: CbPivotField[] = [
    { key: 'cuenta', label: 'Cuenta', format: (v) => NOMBRES.get(String(v)) ?? String(v) },
    { key: 'centro', label: 'Centro de costo', format: (v) => CENTROS.get(String(v)) ?? String(v) },
    {
      key: 'mes',
      label: 'Mes',
      format: (v) => {
        const [y, m] = String(v).split('-').map(Number);
        return MES.format(new Date(y, m - 1, 1)).replace('.', '');
      },
    },
  ];
  protected readonly filas = signal<readonly string[]>(['centro', 'cuenta']);
  protected readonly columnas = signal<readonly string[]>(['mes']);

  protected readonly importCode = `import { CbPivot, type CbPivotField, type CbPivotValue } from '@caribeng/ui/pivot';`;
  protected readonly expensesCode = `<cb-pivot [data]="movimientos" [fields]="dimensiones" [(rows)]="filas" [(columns)]="columnas" [values]="[{ field: 'valor' }]" configurable ariaLabel="Gastos por centro de costo" />`;
  protected readonly collapsedCode = `<cb-pivot [data]="movimientos" [fields]="dimensiones" [rows]="['cuenta', 'centro']" [columns]="['mes']" [values]="[{ field: 'valor' }]" collapsed ariaLabel="Gastos por cuenta" />`;

  constructor() {
    inject(TocService).reset();
  }
}
