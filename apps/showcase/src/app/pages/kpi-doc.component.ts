import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbKpi } from '@caribeng/ui/kpi';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-kpi-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbKpi, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Contabilidad"
      title="KPI"
      lead="Indicador para tableros contables: valor, variación frente al periodo anterior (con su color según si subir es bueno o malo), minigráfica de tendencia y avance hacia una meta."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="dashboard"
      title="Tablero del mes"
      description="previous calcula la variación sola; better dice si subir es bueno (up, ingresos) o malo (down, gastos y cartera vencida), y la variación se lee con texto («sube 24,4 %»). series dibuja la tendencia y target el avance hacia la meta. format elige currency, number, integer o percent."
      [code]="dashboardCode"
    >
      <div class="kpi-grid">
        <cb-kpi label="Ingresos" [value]="208330000" [previous]="167440000" [series]="ingresos" compareLabel="Octubre 2025" [target]="250000000" />
        <cb-kpi label="Gastos operacionales" [value]="47700000" [previous]="58110000" better="down" [series]="gastos" compareLabel="Octubre 2025" />
        <cb-kpi label="Cartera vencida" [value]="19350000" [previous]="15800000" better="down" [series]="cartera" compareLabel="Mes anterior" />
        <cb-kpi label="Margen neto" [value]="0.2987" [previous]="0.1477" format="percent" [series]="margen" compareLabel="Octubre 2025" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
        gap: 1rem;
        width: 100%;
      }
    `,
  ],
})
export class KpiDocComponent {
  protected readonly docApi = DOC_API['cb-kpi'];
  protected readonly a11y = DOC_A11Y['cb-kpi'];

  protected readonly ingresos = [142, 151, 149, 160, 171, 168, 180, 186, 195, 208];
  protected readonly gastos = [58, 57, 59, 55, 53, 52, 50, 49, 48, 47.7];
  protected readonly cartera = [12, 13.5, 13, 14.2, 15.1, 15.8, 16.4, 17.9, 15.8, 19.35];
  protected readonly margen = [0.18, 0.2, 0.19, 0.22, 0.24, 0.23, 0.26, 0.27, 0.28, 0.2987];

  protected readonly importCode = `import { CbKpi } from '@caribeng/ui/kpi';`;
  protected readonly dashboardCode = `<div class="kpi-grid">
  <cb-kpi label="Ingresos" [value]="208330000" [previous]="167440000" [series]="ingresos" compareLabel="Octubre 2025" [target]="250000000" />
  <cb-kpi label="Gastos operacionales" [value]="47700000" [previous]="58110000" better="down" [series]="gastos" compareLabel="Octubre 2025" />
  <cb-kpi label="Cartera vencida" [value]="19350000" [previous]="15800000" better="down" [series]="cartera" compareLabel="Mes anterior" />
  <cb-kpi label="Margen neto" [value]="0.2987" [previous]="0.1477" format="percent" [series]="margen" compareLabel="Octubre 2025" />
</div>`;

  constructor() {
    inject(TocService).reset();
  }
}
