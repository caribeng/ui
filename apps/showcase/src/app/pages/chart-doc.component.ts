import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import {
  CbChart,
  CbChartAxis,
  CbChartBar,
  CbChartCandlestick,
  CbChartLine,
  CbChartRangeArea,
  CbChartReferenceBand,
  CbChartReferenceLine,
  CbChartScatter,
  type CbChartBand,
  type CbChartData,
  type CbChartItemEvent,
  type CbChartType,
} from '@caribeng/ui/chart';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'cb-chart-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbChart,
    CbChartAxis,
    CbChartBar,
    CbChartCandlestick,
    CbChartLine,
    CbChartRangeArea,
    CbChartReferenceBand,
    CbChartReferenceLine,
    CbChartScatter,
    CbButton,
    DocA11yComponent,
    DocPlaygroundComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Datos"
      title="Chart"
      lead="Gráficos SVG accesibles y sin dependencias: barras, líneas, áreas, cascada, torta, dona, radial, medidor, radar, área polar, mapa de calor y treemap, con tooltip, leyenda interactiva y tabla de datos para lectores de pantalla."
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
      id="waterfall"
      title="Cascada (waterfall)"
      description="Cada barra sube o baja desde el acumulado anterior: verde si suma, rojo si resta. Las posiciones de sums son subtotales o totales y van desde 0 hasta el acumulado."
      [code]="waterfallCode"
      [codeTs]="waterfallTs"
    >
      <div class="chart-demo">
        <cb-chart type="waterfall" [data]="cascada" [height]="240" [valueFormat]="millones" ariaLabel="Flujo de caja del trimestre" />
      </div>
    </doc-section>

    <doc-section
      id="gauge"
      title="Medidor (gauge)"
      description="Muestra un valor entre min y max (0 y 100 por defecto). bands dibuja franjas de umbral y, si la serie no tiene color, el arco toma el de la franja donde cae el valor."
      [code]="gaugeCode"
      [codeTs]="gaugeTs"
    >
      <div class="chart-demo chart-demo--grid">
        <cb-chart type="gauge" [data]="cumplimiento" [bands]="umbrales" [valueFormat]="{ maximumFractionDigits: 0 }" ariaLabel="Cumplimiento de la meta" />
        <cb-chart type="gauge" [data]="score" [min]="300" [max]="850" ariaLabel="Puntaje de crédito" />
      </div>
    </doc-section>

    <doc-section
      id="radar"
      title="Radar y área polar"
      description="radar dibuja un eje por categoría y un polígono por serie, para comparar perfiles. polarArea reparte el círculo en sectores iguales cuyo radio depende del valor."
      [code]="radarCode"
      [codeTs]="radarTs"
    >
      <div class="chart-demo chart-demo--grid">
        <cb-chart type="radar" [data]="evaluacion" [height]="260" ariaLabel="Evaluación de proveedores" />
        <cb-chart type="polarArea" [data]="canales" [height]="260" ariaLabel="Transacciones por canal" />
      </div>
    </doc-section>

    <doc-section
      id="heatmap"
      title="Mapa de calor (heatmap)"
      description="labels son las columnas y cada dataset es una fila; el color indica el valor, con la escala abajo. Las flechas izquierda y derecha recorren una fila y arriba y abajo cambian de fila."
      [code]="heatmapCode"
      [codeTs]="heatmapTs"
    >
      <div class="chart-demo chart-demo--wide">
        <cb-chart type="heatmap" [data]="actividad" [height]="250" ariaLabel="Transacciones por día y franja horaria" />
      </div>
    </doc-section>

    <doc-section
      id="treemap"
      title="Treemap"
      description="Rectángulos de área proporcional a cada valor del primer dataset; el teclado los recorre de mayor a menor y la leyenda oculta elementos."
      [code]="treemapCode"
      [codeTs]="treemapTs"
    >
      <div class="chart-demo chart-demo--wide">
        <cb-chart type="treemap" [data]="presupuesto" [height]="260" [valueFormat]="millones" ariaLabel="Presupuesto por área" />
      </div>
    </doc-section>

    <doc-section
      id="composable"
      title="Modo composable"
      description="Con series hijas, data es un array de registros y cada serie elige sus campos (x, y…). Se combinan tipos, cada serie va al eje izquierdo o derecho y se añaden ejes y referencias con sus propias etiquetas."
      [code]="composableCode"
      [codeTs]="composableTs"
    >
      <div class="chart-demo chart-demo--wide">
        <cb-chart [data]="resultados" [height]="280" [valueFormat]="millones" ariaLabel="Ingresos y margen por mes">
          <cb-chart-bar x="mes" y="ingresos" name="Ingresos" />
          <cb-chart-line x="mes" y="margen" name="Margen" axis="right" curve="smooth" />
          <cb-chart-axis position="right" label="Margen" [format]="{ style: 'percent' }" />
          <cb-chart-axis position="left" label="Ingresos" />
          <cb-chart-reference-line [value]="900" label="Meta de ingresos" />
        </cb-chart>
      </div>
    </doc-section>

    <doc-section
      id="financial"
      title="Velas, eje de tiempo y zoom"
      description="cb-chart-candlestick lee apertura, máximo, mínimo y cierre; con fechas en x el eje es de tiempo. zoom permite acercar con la rueda o con + y −, desplazarse arrastrando y volver con doble clic, 0 o el botón."
      [code]="financialCode"
      [codeTs]="financialTs"
    >
      <div class="chart-demo chart-demo--wide">
        <cb-chart [data]="velas" [height]="300" zoom [valueFormat]="{ style: 'currency', currency: 'USD' }" ariaLabel="Precio de PRIM/USD por minuto">
          <cb-chart-candlestick x="ts" name="PRIM/USD" />
          <cb-chart-line x="ts" y="media" name="Media móvil" curve="smooth" [points]="false" color="var(--cb-color-info-500)" />
          <cb-chart-axis position="right" />
          <cb-chart-reference-band axis="right" [from]="rangoObjetivo[0]" [to]="rangoObjetivo[1]" label="Rango objetivo" />
        </cb-chart>
      </div>
    </doc-section>

    <doc-section
      id="forecast"
      title="Rangos y proyecciones"
      description="cb-chart-range-area dibuja una banda entre low y high (un intervalo de confianza, un mínimo y máximo); dashed marca una proyección y points en false quita los puntos."
      [code]="forecastCode"
      [codeTs]="forecastTs"
    >
      <div class="chart-demo chart-demo--wide">
        <cb-chart [data]="pronostico" [height]="260" ariaLabel="Saldo real y proyectado">
          <cb-chart-range-area x="mes" low="min" high="max" name="Rango esperado" curve="smooth" />
          <cb-chart-line x="mes" y="real" name="Saldo real" />
          <cb-chart-line x="mes" y="proyeccion" name="Proyección" dashed [points]="false" curve="smooth" />
          <cb-chart-reference-line axis="x" value="Jul" label="Hoy" />
        </cb-chart>
      </div>
    </doc-section>

    <doc-section
      id="scatter"
      title="Dispersión"
      description="Con números en x el eje es lineal. Cada punto es un elemento: el teclado los recorre de izquierda a derecha y anuncia sus dos valores."
      [code]="scatterCode"
      [codeTs]="scatterTs"
    >
      <div class="chart-demo chart-demo--wide">
        <cb-chart [data]="clientes" [height]="260" ariaLabel="Saldo promedio según la edad">
          <cb-chart-scatter x="edad" y="saldo" name="Personas" />
          <cb-chart-scatter x="edad" y="saldoEmpresa" name="Empresas" [size]="6" />
          <cb-chart-axis position="bottom" label="Edad" />
          <cb-chart-axis position="left" label="Saldo (M)" />
        </cb-chart>
      </div>
    </doc-section>

    <doc-section
      id="parts"
      title="Piezas del modo composable"
      description="Todas las series aceptan name, x, color, axis (left o right) y data (sus propios registros). Se importan desde @caribeng/ui/chart junto a CbChart."
    >
      <div class="chart-parts">
        <table>
          <thead>
            <tr><th>{{ i18n.t('Pieza', 'Part') }}</th><th>{{ i18n.t('Inputs propios', 'Own inputs') }}</th></tr>
          </thead>
          <tbody>
            @for (part of piezas; track part.tag) {
              <tr>
                <td><code>{{ part.tag }}</code></td>
                <td>{{ part.inputs }}</td>
              </tr>
            }
          </tbody>
        </table>
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
      .chart-demo--wide {
        max-width: 760px;
      }
      .chart-parts {
        width: 100%;
        overflow-x: auto;
      }
      .chart-parts table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
      }
      .chart-parts th,
      .chart-parts td {
        padding: 0.5rem 0.75rem;
        text-align: left;
        vertical-align: top;
        border-bottom: 1px solid var(--cb-color-border);
      }
      .chart-parts th {
        font-weight: 600;
        color: var(--cb-color-text-muted);
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
  protected readonly i18n = inject(I18nService);
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

  protected readonly millones = (v: number) => `$ ${v.toLocaleString('es-CO')} M`;

  protected readonly cascada: CbChartData = {
    labels: ['Saldo inicial', 'Ingresos', 'Nómina', 'Proveedores', 'Impuestos', 'Saldo final'],
    datasets: [{ label: 'Flujo de caja', data: [420, 310, -180, -95, -60, 0], sums: [5] }],
  };

  protected readonly cumplimiento: CbChartData = { labels: ['Meta de ventas'], datasets: [{ label: 'Cumplimiento', data: [72] }] };
  protected readonly umbrales: CbChartBand[] = [
    { from: 0, to: 50, color: 'var(--cb-color-danger-500)' },
    { from: 50, to: 80, color: 'var(--cb-color-warning-500)' },
    { from: 80, to: 100, color: 'var(--cb-color-success-500)' },
  ];
  protected readonly score: CbChartData = { labels: ['Puntaje'], datasets: [{ label: 'Puntaje de crédito', data: [712], color: 'var(--cb-color-info-500)' }] };

  protected readonly evaluacion: CbChartData = {
    labels: ['Precio', 'Calidad', 'Entrega', 'Soporte', 'Seguridad', 'Innovación'],
    datasets: [
      { label: 'Proveedor A', data: [78, 85, 70, 90, 88, 65] },
      { label: 'Proveedor B', data: [90, 70, 82, 68, 75, 80] },
    ],
  };
  protected readonly canales: CbChartData = {
    labels: ['App', 'Web', 'Oficina', 'Cajero', 'Teléfono'],
    datasets: [{ label: 'Transacciones (miles)', data: [148, 96, 41, 63, 18] }],
  };

  protected readonly actividad: CbChartData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      { label: '00–06 h', data: [4, 3, 5, 4, 6, 9, 8] },
      { label: '06–12 h', data: [38, 42, 40, 44, 47, 30, 18] },
      { label: '12–18 h', data: [52, 49, 55, 58, 66, 61, 34] },
      { label: '18–24 h', data: [27, 25, 29, 31, 45, 52, 39] },
    ],
  };

  protected readonly presupuesto: CbChartData = {
    labels: ['Tecnología', 'Operaciones', 'Mercadeo', 'Talento humano', 'Riesgo', 'Jurídica', 'Otros'],
    datasets: [{ label: 'Presupuesto', data: [1850, 1320, 760, 640, 410, 230, 140] }],
  };

  protected readonly waterfallCode = `<cb-chart type="waterfall" [data]="cascada" [valueFormat]="millones" ariaLabel="Flujo de caja del trimestre" />`;
  protected readonly waterfallTs = `cascada: CbChartData = {
  labels: ['Saldo inicial', 'Ingresos', 'Nómina', 'Proveedores', 'Impuestos', 'Saldo final'],
  // sums: posiciones que son subtotales o totales (su valor se ignora).
  datasets: [{ label: 'Flujo de caja', data: [420, 310, -180, -95, -60, 0], sums: [5] }],
};`;
  protected readonly gaugeCode = `<cb-chart type="gauge" [data]="cumplimiento" [bands]="umbrales" ariaLabel="Cumplimiento de la meta" />
<cb-chart type="gauge" [data]="score" [min]="300" [max]="850" ariaLabel="Puntaje de crédito" />`;
  protected readonly gaugeTs = `cumplimiento: CbChartData = { labels: ['Meta de ventas'], datasets: [{ label: 'Cumplimiento', data: [72] }] };
umbrales: CbChartBand[] = [
  { from: 0, to: 50, color: 'var(--cb-color-danger-500)' },
  { from: 50, to: 80, color: 'var(--cb-color-warning-500)' },
  { from: 80, to: 100, color: 'var(--cb-color-success-500)' },
];`;
  protected readonly radarCode = `<cb-chart type="radar" [data]="evaluacion" ariaLabel="Evaluación de proveedores" />
<cb-chart type="polarArea" [data]="canales" ariaLabel="Transacciones por canal" />`;
  protected readonly radarTs = `evaluacion: CbChartData = {
  labels: ['Precio', 'Calidad', 'Entrega', 'Soporte', 'Seguridad', 'Innovación'],
  datasets: [
    { label: 'Proveedor A', data: [78, 85, 70, 90, 88, 65] },
    { label: 'Proveedor B', data: [90, 70, 82, 68, 75, 80] },
  ],
};`;
  protected readonly heatmapCode = `<cb-chart type="heatmap" [data]="actividad" ariaLabel="Transacciones por día y franja horaria" />`;
  protected readonly heatmapTs = `actividad: CbChartData = {
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], // columnas
  datasets: [ // filas
    { label: '00–06 h', data: [4, 3, 5, 4, 6, 9, 8] },
    { label: '06–12 h', data: [38, 42, 40, 44, 47, 30, 18] },
    // …
  ],
};`;
  protected readonly treemapCode = `<cb-chart type="treemap" [data]="presupuesto" [valueFormat]="millones" ariaLabel="Presupuesto por área" />`;
  protected readonly treemapTs = `presupuesto: CbChartData = {
  labels: ['Tecnología', 'Operaciones', 'Mercadeo', 'Talento humano', 'Riesgo', 'Jurídica', 'Otros'],
  datasets: [{ label: 'Presupuesto', data: [1850, 1320, 760, 640, 410, 230, 140] }],
};`;

  protected readonly resultados = [
    { mes: 'Ene', ingresos: 720, margen: 0.16 },
    { mes: 'Feb', ingresos: 810, margen: 0.18 },
    { mes: 'Mar', ingresos: 760, margen: 0.17 },
    { mes: 'Abr', ingresos: 930, margen: 0.21 },
    { mes: 'May', ingresos: 980, margen: 0.23 },
    { mes: 'Jun', ingresos: 890, margen: 0.2 },
  ];

  /** 90 minutos de precios simulados (deterministas, para que la demo no cambie). */
  protected readonly velas = (() => {
    const start = new Date(2026, 9, 21, 9, 30).getTime();
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let close = 178;
    const result: { ts: Date; open: number; high: number; low: number; close: number; media: number }[] = [];
    for (let i = 0; i < 90; i++) {
      const open = close;
      close = Math.round((open + (rand() - 0.48) * 2.4) * 100) / 100;
      const high = Math.round((Math.max(open, close) + rand() * 1.2) * 100) / 100;
      const low = Math.round((Math.min(open, close) - rand() * 1.2) * 100) / 100;
      const window = result.slice(-9).map((r) => r.close).concat(close);
      const media = Math.round((window.reduce((a, b) => a + b, 0) / window.length) * 100) / 100;
      result.push({ ts: new Date(start + i * 60_000), open, high, low, close, media });
    }
    return result;
  })();
  protected readonly rangoObjetivo = [177, 179] as const;

  protected readonly pronostico = [
    { mes: 'Ene', real: 12.4, min: 11.8, max: 13 },
    { mes: 'Feb', real: 13.1, min: 12.2, max: 13.8 },
    { mes: 'Mar', real: 12.8, min: 12.1, max: 13.9 },
    { mes: 'Abr', real: 14.2, min: 13, max: 14.9 },
    { mes: 'May', real: 14.9, min: 13.8, max: 15.6 },
    { mes: 'Jun', real: 15.3, min: 14.2, max: 16.4 },
    { mes: 'Jul', real: 15.8, proyeccion: 15.8, min: 14.6, max: 17 },
    { mes: 'Ago', proyeccion: 16.4, min: 14.9, max: 18 },
    { mes: 'Sep', proyeccion: 17.1, min: 15.2, max: 19.1 },
    { mes: 'Oct', proyeccion: 17.6, min: 15.4, max: 20.2 },
  ];

  protected readonly clientes = Array.from({ length: 40 }, (_, i) => {
    const edad = 20 + ((i * 37) % 45);
    const base = 2 + edad * 0.18 + ((i * 53) % 17) / 4;
    return i % 4 === 0 ? { edad, saldoEmpresa: Math.round(base * 2.4 * 10) / 10 } : { edad, saldo: Math.round(base * 10) / 10 };
  });

  protected readonly piezas = [
    { tag: '<cb-chart-bar>', inputs: 'y, stack' },
    { tag: '<cb-chart-line>', inputs: "y, curve ('linear' | 'smooth' | 'step'), dashed, points" },
    { tag: '<cb-chart-area>', inputs: 'y, curve, stack' },
    { tag: '<cb-chart-scatter>', inputs: 'y, size' },
    { tag: '<cb-chart-range-area>', inputs: 'low, high, curve' },
    { tag: '<cb-chart-candlestick>', inputs: "open, high, low, close, variant ('candle' | 'ohlc'), upColor, downColor" },
    { tag: '<cb-chart-axis>', inputs: "position ('bottom' | 'left' | 'right'), type ('auto' | 'category' | 'linear' | 'time'), min, max, label, format, grid" },
    { tag: '<cb-chart-reference-line>', inputs: "value, axis ('left' | 'right' | 'x'), label, color" },
    { tag: '<cb-chart-reference-band>', inputs: 'from, to, axis, label, color' },
  ];

  protected readonly composableCode = `<cb-chart [data]="resultados" [valueFormat]="millones" ariaLabel="Ingresos y margen por mes">
  <cb-chart-bar x="mes" y="ingresos" name="Ingresos" />
  <cb-chart-line x="mes" y="margen" name="Margen" axis="right" curve="smooth" />
  <cb-chart-axis position="right" label="Margen" [format]="{ style: 'percent' }" />
  <cb-chart-axis position="left" label="Ingresos" />
  <cb-chart-reference-line [value]="900" label="Meta de ingresos" />
</cb-chart>`;
  protected readonly composableTs = `import { CbChart, CbChartAxis, CbChartBar, CbChartLine, CbChartReferenceLine } from '@caribeng/ui/chart';

resultados = [
  { mes: 'Ene', ingresos: 720, margen: 0.16 },
  { mes: 'Feb', ingresos: 810, margen: 0.18 },
  // …
];`;
  protected readonly financialCode = `<cb-chart [data]="velas" zoom [valueFormat]="{ style: 'currency', currency: 'USD' }" ariaLabel="Precio de PRIM/USD por minuto">
  <cb-chart-candlestick x="ts" name="PRIM/USD" />
  <cb-chart-line x="ts" y="media" name="Media móvil" curve="smooth" [points]="false" />
  <cb-chart-axis position="right" />
  <cb-chart-reference-band axis="right" [from]="177" [to]="179" label="Rango objetivo" />
</cb-chart>`;
  protected readonly financialTs = `// x es una Date: el eje es de tiempo.
velas = [
  { ts: new Date(2026, 9, 21, 9, 30), open: 178, high: 178.9, low: 177.6, close: 178.4, media: 178.4 },
  // …
];`;
  protected readonly forecastCode = `<cb-chart [data]="pronostico" ariaLabel="Saldo real y proyectado">
  <cb-chart-range-area x="mes" low="min" high="max" name="Rango esperado" curve="smooth" />
  <cb-chart-line x="mes" y="real" name="Saldo real" />
  <cb-chart-line x="mes" y="proyeccion" name="Proyección" dashed [points]="false" curve="smooth" />
  <cb-chart-reference-line axis="x" value="Jul" label="Hoy" />
</cb-chart>`;
  protected readonly forecastTs = `// Los registros sin un campo no dibujan ese punto.
pronostico = [
  { mes: 'Jun', real: 15.3, min: 14.2, max: 16.4 },
  { mes: 'Jul', real: 15.8, proyeccion: 15.8, min: 14.6, max: 17 },
  { mes: 'Ago', proyeccion: 16.4, min: 14.9, max: 18 },
  // …
];`;
  protected readonly scatterCode = `<cb-chart [data]="clientes" ariaLabel="Saldo promedio según la edad">
  <cb-chart-scatter x="edad" y="saldo" name="Personas" />
  <cb-chart-scatter x="edad" y="saldoEmpresa" name="Empresas" [size]="6" />
  <cb-chart-axis position="bottom" label="Edad" />
  <cb-chart-axis position="left" label="Saldo (M)" />
</cb-chart>`;
  protected readonly scatterTs = `clientes = [
  { edad: 27, saldo: 8.1 },
  { edad: 44, saldoEmpresa: 24.6 },
  // …
];`;

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
