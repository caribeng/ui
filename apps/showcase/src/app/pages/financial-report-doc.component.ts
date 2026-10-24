import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbFinancialReport, type CbReportBalances, type CbReportTotal } from '@caribeng/ui/financial-report';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { PUC, SALDOS } from '../data/puc';

const UTILIDAD = [{ code: '4' }, { code: '5', sign: -1 as const }, { code: '6', sign: -1 as const }];

@Component({
  selector: 'doc-financial-report-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbFinancialReport, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Contabilidad"
      title="Financial Report"
      lead="Informe financiero jerárquico a partir del plan de cuentas y los saldos: estado de resultados, balance general y balance de prueba, con comparativo entre periodos, niveles de detalle, totales calculados, exportación a Excel e impresión."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="income"
      title="Estado de resultados comparativo"
      description="balances trae los saldos de las cuentas de movimiento (uno por periodo) y cada cuenta mayor suma a las suyas. Con comparative se añaden la variación y el % del primer periodo frente al segundo; signByNature (activo por defecto) muestra en positivo los ingresos. totals calcula filas como la utilidad (4 − 5 − 6). Los botones 1–4 abren los niveles, Ocultar cuentas en cero las quita, Excel descarga el informe con los niveles plegables e Imprimir lo imprime limpio. Clic o Enter en una cuenta de movimiento emite accountOpen."
      [code]="incomeCode"
    >
      <div style="display: grid; gap: 0.5rem; width: 100%">
        <cb-financial-report
          title="Estado de resultados"
          [subtitle]="['CaribeNG S.A.S. · NIT 901.234.567-1', 'Enero a octubre · 2026 frente a 2025']"
          [accounts]="puc"
          [balances]="saldos"
          [periods]="['2026', '2025']"
          comparative
          [classes]="['4', '5', '6']"
          [totals]="totalesResultados"
          (accountOpen)="cuenta.set($event.code + ' ' + $event.name)"
        />
        <p class="fr-log">{{ cuenta() ? 'Ver movimientos de ' + cuenta() : 'Haz clic en una cuenta de movimiento.' }}</p>
      </div>
    </doc-section>

    <doc-section
      id="balance"
      title="Balance general"
      description="classes elige las clases que se muestran (1, 2 y 3); los totales pueden usar cualquier cuenta, así que la utilidad del ejercicio (4 − 5 − 6) se suma al patrimonio y el total de pasivo y patrimonio cuadra con el activo. level fija el nivel abierto al empezar."
      [code]="balanceCode"
    >
      <cb-financial-report
        title="Balance general"
        [subtitle]="['A 31 de octubre de 2026']"
        [accounts]="puc"
        [balances]="saldos"
        [periods]="['2026', '2025']"
        [classes]="['1', '2', '3']"
        [totals]="totalesBalance"
        [level]="1"
      />
    </doc-section>

    <doc-section
      id="trial"
      title="Balance de prueba"
      description="Sin signByNature los saldos van con su signo contable (débito positivo, crédito negativo) y el total de todas las clases debe ser cero: «Sumas iguales». hideZero empieza ocultando las cuentas sin saldo."
      [code]="trialCode"
    >
      <cb-financial-report title="Balance de prueba" [accounts]="puc" [balances]="saldosPrueba" [periods]="['Octubre 2026']" [signByNature]="false" [totals]="sumasIguales" [hideZero]="true" [level]="2" negativeStyle="minus" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .fr-log {
        margin: 0;
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class FinancialReportDocComponent {
  protected readonly docApi = DOC_API['cb-financial-report'];
  protected readonly a11y = DOC_A11Y['cb-financial-report'];

  protected readonly puc = PUC;
  protected readonly saldos: CbReportBalances = SALDOS;
  protected readonly saldosPrueba: CbReportBalances = Object.fromEntries(Object.entries(SALDOS).map(([k, v]) => [k, [v[0]]]));
  protected readonly cuenta = signal('');

  protected readonly totalesResultados: CbReportTotal[] = [
    { label: 'Utilidad bruta', terms: [{ code: '4' }, { code: '6', sign: -1 }] },
    { label: 'Utilidad del ejercicio', terms: UTILIDAD },
  ];
  protected readonly totalesBalance: CbReportTotal[] = [
    { label: 'Total activo', terms: [{ code: '1' }] },
    { label: 'Total pasivo', terms: [{ code: '2' }] },
    { label: 'Utilidad del ejercicio', terms: UTILIDAD },
    { label: 'Total patrimonio', terms: [{ code: '3' }, ...UTILIDAD] },
    { label: 'Total pasivo y patrimonio', terms: [{ code: '2' }, { code: '3' }, ...UTILIDAD] },
  ];
  protected readonly sumasIguales: CbReportTotal[] = [{ label: 'Sumas iguales', terms: ['1', '2', '3', '4', '5', '6'].map((code) => ({ code })) }];

  protected readonly importCode = `import { CbFinancialReport, type CbReportBalances, type CbReportTotal } from '@caribeng/ui/financial-report';`;
  protected readonly incomeCode = `<div style="display: grid; gap: 0.5rem; width: 100%">
  <cb-financial-report
    title="Estado de resultados"
    [subtitle]="['CaribeNG S.A.S. · NIT 901.234.567-1', 'Enero a octubre · 2026 frente a 2025']"
    [accounts]="puc"
    [balances]="saldos"
    [periods]="['2026', '2025']"
    comparative
    [classes]="['4', '5', '6']"
    [totals]="totalesResultados"
    (accountOpen)="cuenta.set($event.code + ' ' + $event.name)"
  />
  <p class="fr-log">{{ cuenta() ? 'Ver movimientos de ' + cuenta() : 'Haz clic en una cuenta de movimiento.' }}</p>
</div>`;
  protected readonly balanceCode = `<cb-financial-report
  title="Balance general"
  [subtitle]="['A 31 de octubre de 2026']"
  [accounts]="puc"
  [balances]="saldos"
  [periods]="['2026', '2025']"
  [classes]="['1', '2', '3']"
  [totals]="totalesBalance"
  [level]="1"
/>`;
  protected readonly trialCode = `<cb-financial-report title="Balance de prueba" [accounts]="puc" [balances]="saldosPrueba" [periods]="['Octubre 2026']" [signByNature]="false" [totals]="sumasIguales" [hideZero]="true" [level]="2" negativeStyle="minus" />`;

  constructor() {
    inject(TocService).reset();
  }
}
