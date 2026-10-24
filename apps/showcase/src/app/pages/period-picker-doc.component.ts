import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbPeriodPicker, presetPeriod, type CbPeriod } from '@caribeng/ui/period-picker';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { MESES_CERRADOS } from '../data/puc';

@Component({
  selector: 'doc-period-picker-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbPeriodPicker, ReactiveFormsModule, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Contabilidad"
      title="Period Picker"
      lead="Selector de periodo contable: mes, trimestre o año fiscal, con atajos como «Mes anterior» o «Año a la fecha» y los meses cerrados marcados con un candado."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="El valor es un CbPeriod con kind, from, to y key (2026-10, 2026-Q3, 2026 o un rango). El panel tiene atajos a la izquierda y la cuadrícula de meses, trimestres o años; las flechas recorren la cuadrícula, RePág / AvPág cambian de año y Escape cierra. closed marca los meses cerrados con un candado, pero se pueden consultar."
      [code]="basicCode"
    >
      <div style="display: grid; gap: 0.5rem; width: min(100%, 22rem)">
        <cb-period-picker label="Periodo del informe" [(value)]="periodo" [closed]="cerrados" />
        <span class="pp-value">{{ resumen() }}</span>
      </div>
    </doc-section>

    <doc-section
      id="posting"
      title="Al contabilizar: periodos cerrados bloqueados"
      description="Con disableClosed no se pueden elegir meses cerrados (ni trimestres o años que los incluyan, ni los atajos que caen en ellos). Funciona con Angular Forms: required y error como en cualquier campo."
      [code]="postingCode"
    >
      <div style="width: min(100%, 22rem)">
        <cb-period-picker label="Periodo contable" [formControl]="contable" [closed]="cerrados" disableClosed [modes]="['month']" [presets]="['thisMonth', 'lastMonth']" error="Elige un periodo abierto." />
      </div>
    </doc-section>

    <doc-section
      id="fiscal"
      title="Año fiscal que no empieza en enero"
      description="fiscalYearStart mueve el inicio del año fiscal: con 7 (julio), el año fiscal 2026 va de julio de 2025 a junio de 2026 y sus trimestres siguen ese calendario («T2 AF 2026» es octubre–diciembre de 2025)."
      [code]="fiscalCode"
    >
      <div style="width: min(100%, 22rem)">
        <cb-period-picker label="Periodo fiscal" [(value)]="fiscal" [fiscalYearStart]="7" mode="quarter" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .pp-value {
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class PeriodPickerDocComponent {
  protected readonly docApi = DOC_API['cb-period-picker'];
  protected readonly a11y = DOC_A11Y['cb-period-picker'];

  protected readonly cerrados = MESES_CERRADOS;
  protected readonly periodo = signal<CbPeriod | null>(presetPeriod('thisMonth', new Date()));
  protected readonly contable = new FormControl<CbPeriod | null>(null, Validators.required);
  protected readonly fiscal = signal<CbPeriod | null>(null);
  protected readonly resumen = computed(() => {
    const p = this.periodo();
    const d = (x: Date) => x.toLocaleDateString('es-CO');
    return p ? `${p.key}: del ${d(p.from)} al ${d(p.to)}` : 'Sin periodo';
  });

  protected readonly importCode = `import { CbPeriodPicker, presetPeriod, type CbPeriod } from '@caribeng/ui/period-picker';`;
  protected readonly basicCode = `<div style="display: grid; gap: 0.5rem; width: min(100%, 22rem)">
  <cb-period-picker label="Periodo del informe" [(value)]="periodo" [closed]="cerrados" />
  <span class="pp-value">{{ resumen() }}</span>
</div>`;
  protected readonly postingCode = `<div style="width: min(100%, 22rem)">
  <cb-period-picker label="Periodo contable" [formControl]="contable" [closed]="cerrados" disableClosed [modes]="['month']" [presets]="['thisMonth', 'lastMonth']" error="Elige un periodo abierto." />
</div>`;
  protected readonly fiscalCode = `<div style="width: min(100%, 22rem)">
  <cb-period-picker label="Periodo fiscal" [(value)]="fiscal" [fiscalYearStart]="7" mode="quarter" />
</div>`;

  constructor() {
    inject(TocService).reset();
  }
}
