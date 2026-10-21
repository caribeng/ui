import type { CbChartType, ChartContext, ChartScene } from '../chart-model';
import { renderCartesian, renderWaterfall } from './cartesian';
import { renderCircular, renderGauge } from './circular';
import { renderHeatmap, renderTreemap } from './grid';
import { renderPolarArea, renderRadar } from './radial';

/** Un renderer por tipo: recibe el contexto y devuelve la escena a dibujar. */
export const CHART_RENDERERS: Record<CbChartType, (ctx: ChartContext) => ChartScene> = {
  bar: renderCartesian,
  horizontalBar: renderCartesian,
  line: renderCartesian,
  area: renderCartesian,
  waterfall: renderWaterfall,
  pie: renderCircular,
  doughnut: renderCircular,
  radialBar: renderCircular,
  gauge: renderGauge,
  radar: renderRadar,
  polarArea: renderPolarArea,
  heatmap: renderHeatmap,
  treemap: renderTreemap,
};
