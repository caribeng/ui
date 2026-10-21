import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbCountdown, CbStatistic } from '@caribeng/ui/statistic';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-statistic-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbStatistic, CbCountdown, CbButton, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Data" title="Statistic" lead="Cifras destacadas para dashboards, con formato, tendencia y cuenta regresiva." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="format recibe opciones de Intl.NumberFormat (moneda, porcentaje, decimales) y locale el idioma del formato; prefix y suffix añaden texto alrededor."
      [code]="basicCode"
    >
      <div class="stat-row">
        <cb-statistic title="Saldo disponible" [value]="12450000" locale="es-CO" [format]="{ style: 'currency', currency: 'COP', maximumFractionDigits: 0 }" />
        <cb-statistic title="Tasa efectiva anual" [value]="11.25" suffix="% E.A." />
        <cb-statistic title="Clientes activos" [value]="48213" locale="es-CO" />
      </div>
    </doc-section>

    <doc-section
      id="trend"
      title="Tendencia"
      description="trend añade flecha, color y el texto &quot;aumenta&quot; / &quot;disminuye&quot; para el lector de pantalla; trendLabel, el detalle."
      [code]="trendCode"
    >
      <div class="stat-row">
        <cb-statistic title="Ingresos del mes" [value]="5800000" locale="es-CO" [format]="{ style: 'currency', currency: 'COP', notation: 'compact' }" trend="up" trendLabel="+12 % vs. septiembre" />
        <cb-statistic title="Gastos del mes" [value]="3500000" locale="es-CO" [format]="{ style: 'currency', currency: 'COP', notation: 'compact' }" trend="down" trendLabel="-4 % vs. septiembre" />
      </div>
    </doc-section>

    <doc-section
      id="countdown"
      title="Cuenta regresiva"
      description="cb-countdown cuenta hasta target (una fecha) y emite finished al llegar a cero. Es un role=&quot;timer&quot;: no anuncia cada segundo."
      [code]="countdownCode"
    >
      <div class="stat-row">
        <cb-countdown title="Tu código vence en" [target]="vence()" (finished)="vencido.set(true)" />
        <cb-countdown title="Cierre de la oferta" [target]="oferta" />
      </div>
      <div style="display: flex; gap: 0.75rem; align-items: center; margin-top: 0.75rem">
        <cb-button size="sm" variant="outlined" (click)="reiniciar()">Reiniciar código (30 s)</cb-button>
        @if (vencido()) {
          <span style="font-size: 0.875rem; color: var(--cb-color-text-muted)">El código venció.</span>
        }
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .stat-row {
        display: flex;
        flex-wrap: wrap;
        gap: 2.5rem;
      }
    `,
  ],
})
export class StatisticDocComponent {
  protected readonly docApi = DOC_API['cb-statistic'];
  protected readonly a11y = DOC_A11Y['cb-statistic'];

  protected readonly vence = signal(Date.now() + 30_000);
  protected readonly vencido = signal(false);
  protected readonly oferta = Date.now() + 2 * 86_400_000 + 5 * 3_600_000;

  protected reiniciar(): void {
    this.vencido.set(false);
    this.vence.set(Date.now() + 30_000);
  }

  protected readonly importCode = `import { CbStatistic, CbCountdown } from '@caribeng/ui/statistic';`;
  protected readonly basicCode = `<cb-statistic title="Saldo disponible" [value]="12450000" locale="es-CO" [format]="{ style: 'currency', currency: 'COP', maximumFractionDigits: 0 }" />
<cb-statistic title="Tasa efectiva anual" [value]="11.25" suffix="% E.A." />
<cb-statistic title="Clientes activos" [value]="48213" locale="es-CO" />`;
  protected readonly trendCode = `<cb-statistic title="Ingresos del mes" [value]="5800000" locale="es-CO" [format]="{ style: 'currency', currency: 'COP', notation: 'compact' }" trend="up" trendLabel="+12 % vs. septiembre" />`;
  protected readonly countdownCode = `<cb-countdown title="Tu código vence en" [target]="vence()" (finished)="vencido.set(true)" />`;

  constructor() {
    inject(TocService).reset();
  }
}
