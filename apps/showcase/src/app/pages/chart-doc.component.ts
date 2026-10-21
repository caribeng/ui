import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbChart, type CbChartData, type CbChartItemEvent, type CbChartType } from '@caribeng/ui/chart';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'cb-chart-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbChart, CbButton, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Datos"
      title="Chart"
      lead="Gráficos SVG accesibles y sin dependencias: barras, líneas, áreas, torta, dona y radial, con tooltip, leyenda interactiva y tabla de datos para lectores de pantalla."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Tipos cartesianos"
      description="El mismo data sirve para bar, horizontalBar, line y area. Pasa el ratón por el gráfico o enfócalo y usa las flechas."
      [code]="basicCode"
      [codeTs]="dataTs"
    >
      <div class="chart-demo">
        <div class="chart-demo__switch" role="group" aria-label="Tipo de gráfico">
          @for (option of cartesianTypes; track option.type) {
            <cb-button size="sm" [variant]="tipo() === option.type ? 'solid' : 'outlined'" [attr.aria-pressed]="tipo() === option.type" (click)="tipo.set(option.type)">
              {{ option.label }}
            </cb-button>
          }
        </div>
        <cb-chart [type]="tipo()" [data]="ventas" ariaLabel="Ventas por región" />
      </div>
    </doc-section>

    <doc-section
      id="stacked"
      title="Apilado"
      description="stacked apila las series de barras o de áreas; la escala se ajusta a la suma."
      [code]="stackedCode"
    >
      <div class="chart-demo chart-demo--grid">
        <cb-chart type="bar" stacked [data]="ventas" ariaLabel="Ventas apiladas por región" />
        <cb-chart type="area" stacked [data]="ventas" ariaLabel="Ventas acumuladas por región" />
      </div>
    </doc-section>

    <doc-section
      id="combo"
      title="Combinado y moneda"
      description="En un gráfico bar, una serie con type: 'line' se dibuja como línea. valueFormat acepta opciones de Intl.NumberFormat (moneda, porcentaje…) o una función; los negativos crecen hacia abajo desde el 0."
      [code]="comboCode"
      [codeTs]="comboTs"
    >
      <div class="chart-demo">
        <cb-chart
          type="bar"
          [data]="flujo"
          locale="es-CO"
          [valueFormat]="{ style: 'currency', currency: 'COP', notation: 'compact' }"
          ariaLabel="Flujo de caja mensual"
        />
      </div>
    </doc-section>

    <doc-section
      id="circular"
      title="Torta, dona y radial"
      description="pie y doughnut usan el primer dataset (colors fija un color por elemento); la dona muestra el total. radialBar dibuja un anillo por elemento respecto a max (100 por defecto)."
      [code]="circularCode"
      [codeTs]="circularTs"
    >
      <div class="chart-demo chart-demo--grid3">
        <cb-chart type="pie" [data]="gastos" ariaLabel="Gastos por categoría" />
        <cb-chart type="doughnut" [data]="gastos" ariaLabel="Gastos por categoría" />
        <cb-chart type="radialBar" [data]="metas" [valueFormat]="{ maximumFractionDigits: 0 }" ariaLabel="Avance de metas de ahorro" />
      </div>
    </doc-section>

    <doc-section
      id="sparkline"
      title="Sparkline"
      description="sparkline quita ejes, rejilla, leyenda y tarjeta: un minigráfico para tarjetas de resumen o celdas de tabla."
      [code]="sparklineCode"
    >
      <div class="chart-demo chart-demo--grid3">
        @for (card of tarjetas; track card.title) {
          <div class="chart-kpi">
            <span class="chart-kpi__title">{{ card.title }}</span>
            <strong class="chart-kpi__value">{{ card.value }}</strong>
            <cb-chart type="area" sparkline [height]="56" [data]="card.data" [ariaLabel]="'Tendencia de ' + card.title" />
          </div>
        }
      </div>
    </doc-section>

    <doc-section
      id="events"
      title="Selección"
      description="itemSelect se emite al hacer clic en una categoría o un segmento, o al pulsar Enter mientras se recorre con el teclado."
      [code]="eventsCode"
    >
      <div class="chart-demo">
        <cb-chart type="bar" [data]="ventas" (itemSelect)="onSelect($event)" ariaLabel="Ventas por región" />
        <p class="chart-demo__note">{{ seleccion() }}</p>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .chart-demo {
        display: grid;
        gap: 1rem;
        width: 100%;
        max-width: 640px;
      }
      .chart-demo--grid {
        max-width: none;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      }
      .chart-demo--grid3 {
        max-width: none;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
      .chart-demo__switch {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .chart-demo__note {
        margin: 0;
        font-size: 0.875rem;
        color: var(--cb-color-text-muted);
      }
      .chart-kpi {
        display: grid;
        gap: 0.25rem;
        padding: 1rem;
        background: var(--cb-color-surface-raised);
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg, 0.75rem);
      }
      .chart-kpi__title {
        font-size: 0.8rem;
        color: var(--cb-color-text-muted);
      }
      .chart-kpi__value {
        font-size: 1.35rem;
      }
    `,
  ],
})
export class ChartDocComponent {
  protected readonly docApi = DOC_API['cb-chart'];
  protected readonly a11y = DOC_A11Y['cb-chart'];

  protected readonly tipo = signal<CbChartType>('bar');
  protected readonly seleccion = signal('Haz clic en un mes o pulsa Enter sobre él.');
  protected readonly cartesianTypes: { type: CbChartType; label: string }[] = [
    { type: 'bar', label: 'Barras' },
    { type: 'horizontalBar', label: 'Horizontal' },
    { type: 'line', label: 'Líneas' },
    { type: 'area', label: 'Área' },
  ];

  protected readonly ventas: CbChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      { label: 'Caribe Norte', data: [65, 84, 72, 95, 110, 104] },
      { label: 'Caribe Sur', data: [48, 62, 58, 79, 92, 88] },
    ],
  };

  protected readonly flujo: CbChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      { label: 'Flujo neto', data: [12_500_000, -4_200_000, 8_900_000, 15_300_000, -2_100_000, 9_800_000] },
      { label: 'Promedio', data: [6_000_000, 6_000_000, 6_000_000, 6_000_000, 6_000_000, 6_000_000], type: 'line', color: 'var(--cb-color-danger-500)' },
    ],
  };

  protected readonly gastos: CbChartData = {
    labels: ['Vivienda', 'Transporte', 'Alimentación', 'Ocio'],
    datasets: [{ label: 'Gastos', data: [1_800_000, 450_000, 900_000, 350_000] }],
  };

  protected readonly metas: CbChartData = {
    labels: ['Viaje', 'Carro', 'Emergencias'],
    datasets: [{ label: 'Avance', data: [82, 45, 64] }],
  };

  protected readonly tarjetas = [
    { title: 'Saldo', value: '$ 12,4 M', data: { labels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'], datasets: [{ label: 'Saldo', data: [9, 10, 9.5, 11, 12, 11.8, 12.4] }] } },
    { title: 'Gastos', value: '$ 3,5 M', data: { labels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'], datasets: [{ label: 'Gastos', data: [4, 3.2, 3.8, 3.1, 3.6, 3.3, 3.5], color: 'var(--cb-color-danger-500)' }] } },
    { title: 'Inversión', value: '$ 8,1 M', data: { labels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'], datasets: [{ label: 'Inversión', data: [7, 7.2, 7.5, 7.4, 7.8, 8, 8.1], color: 'var(--cb-color-success-500)' }] } },
  ];

  protected onSelect(event: CbChartItemEvent): void {
    this.seleccion.set(`Elegiste ${event.label} (posición ${event.index + 1}).`);
  }

  protected readonly importCode = `import { CbChart, type CbChartData } from '@caribeng/ui/chart';`;

  protected readonly basicCode = `<cb-chart [type]="tipo()" [data]="ventas" ariaLabel="Ventas por región" />`;
  protected readonly dataTs = `ventas: CbChartData = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [
    { label: 'Caribe Norte', data: [65, 84, 72, 95, 110, 104] },
    { label: 'Caribe Sur', data: [48, 62, 58, 79, 92, 88] },
  ],
};`;
  protected readonly stackedCode = `<cb-chart type="bar" stacked [data]="ventas" ariaLabel="Ventas apiladas por región" />
<cb-chart type="area" stacked [data]="ventas" ariaLabel="Ventas acumuladas por región" />`;
  protected readonly comboCode = `<cb-chart
  type="bar"
  [data]="flujo"
  locale="es-CO"
  [valueFormat]="{ style: 'currency', currency: 'COP', notation: 'compact' }"
  ariaLabel="Flujo de caja mensual"
/>`;
  protected readonly comboTs = `flujo: CbChartData = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [
    { label: 'Flujo neto', data: [12_500_000, -4_200_000, 8_900_000, 15_300_000, -2_100_000, 9_800_000] },
    { label: 'Promedio', data: [6_000_000, 6_000_000, 6_000_000, 6_000_000, 6_000_000, 6_000_000], type: 'line' },
  ],
};`;
  protected readonly circularCode = `<cb-chart type="pie" [data]="gastos" ariaLabel="Gastos por categoría" />
<cb-chart type="doughnut" [data]="gastos" ariaLabel="Gastos por categoría" />
<cb-chart type="radialBar" [data]="metas" [valueFormat]="{ maximumFractionDigits: 0 }" ariaLabel="Avance de metas de ahorro" />`;
  protected readonly circularTs = `gastos: CbChartData = {
  labels: ['Vivienda', 'Transporte', 'Alimentación', 'Ocio'],
  datasets: [{ label: 'Gastos', data: [1_800_000, 450_000, 900_000, 350_000] }],
};
metas: CbChartData = {
  labels: ['Viaje', 'Carro', 'Emergencias'],
  datasets: [{ label: 'Avance', data: [82, 45, 64] }], // % sobre max = 100
};`;
  protected readonly sparklineCode = `<cb-chart type="area" sparkline [height]="56" [data]="saldoSemana" ariaLabel="Tendencia del saldo" />`;
  protected readonly eventsCode = `<cb-chart type="bar" [data]="ventas" (itemSelect)="onSelect($event)" ariaLabel="Ventas por región" />
<p>{{ seleccion() }}</p>`;

  constructor() {
    inject(TocService).reset();
  }
}
