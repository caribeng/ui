import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbMeterGroup, CbMeterItem } from '@caribeng/ui/metergroup';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-metergroup-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbMeterGroup, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Varios" title="MeterGroup" lead="Barra de métricas proporcional multisegmento con leyenda." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" description="values define los segmentos de la barra con su etiqueta, valor y color." [code]="basicCode">
      <cb-meter-group [values]="metrics" style="width: 100%" />
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class MetergroupDocComponent {
  protected readonly docApi = DOC_API['cb-meter-group'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly metrics: CbMeterItem[] = [
    { label: 'Componentes', value: 45 },
    { label: 'Tokens CSS', value: 20 },
    { label: 'Tests', value: 25 },
  ];
  protected readonly importCode = `import { CbMeterGroup } from '@caribeng/ui/metergroup';`;
  protected readonly basicCode = `<cb-meter-group [values]="metrics" />`;
}
