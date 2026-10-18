import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbChart, CbChartData, CbChartType } from '@caribeng/ui/chart';
import { CbButton } from '@caribeng/ui/button';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

const BASIC_CODE = `<cb-chart [type]="chartType()" [data]="salesData" />`;

@Component({
  selector: 'cb-chart-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbChart, CbButton],
  template: `
    <cb-doc-page
      category="Data & Media"
      title="Chart"
      subtitle="Gráficos vectoriales SVG accesibles sin dependencias externas (bar, line, doughnut, pie)."
      importCode="import { CbChart } from '@caribeng/ui/chart';"
      [api]="api"
    >
      <cb-doc-example
        title="Gráfico interactivo multimodo"
        description="Alterna entre barras, líneas y anillo usando el mismo dataset reactivo."
        [code]="basicCode"
      >
        <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 560px">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
            <cb-button size="sm" [variant]="chartType() === 'bar' ? 'solid' : 'outlined'" (click)="chartType.set('bar')">Barras</cb-button>
            <cb-button size="sm" [variant]="chartType() === 'line' ? 'solid' : 'outlined'" (click)="chartType.set('line')">Líneas</cb-button>
            <cb-button size="sm" [variant]="chartType() === 'doughnut' ? 'solid' : 'outlined'" (click)="chartType.set('doughnut')">Anillo</cb-button>
          </div>
          <cb-chart [type]="chartType()" [data]="salesData" />
        </div>
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class ChartDocComponent {
  protected readonly docApi = DOC_API['cb-chart'];

  protected readonly basicCode = BASIC_CODE;
  protected readonly chartType = signal<CbChartType>('bar');

  protected readonly salesData: CbChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
    datasets: [
      { label: 'Caribe Norte', data: [65, 84, 72, 95, 110] },
      { label: 'Caribe Sur', data: [48, 62, 58, 79, 92] },
    ],
  };

  protected readonly api: CbDocApiRow[] = [
    { name: 'type', type: "'bar' | 'line' | 'doughnut' | 'pie'", default: "'bar'", description: 'Tipo de visualización SVG.' },
    { name: 'data', type: 'CbChartData', default: '{ labels: [], datasets: [] }', description: 'Etiquetas y series numéricas.' },
    { name: 'height', type: 'number', default: '220', description: 'Alto del lienzo SVG en píxeles.' },
    { name: 'showLegend', type: 'boolean', default: 'true', description: 'Muestra la leyenda inferior.' },
  ];
}
