import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbMeterGroupComponent, CbMeterItem } from '@caribeng/ui/metergroup';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-metergroup-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbMeterGroupComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Misc" title="MeterGroup" lead="Barra de métricas proporcional multisegmento con leyenda." />
    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <cb-meter-group [values]="metrics" style="width: 100%" />
    </doc-section>
  `,
})
export class MetergroupDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly metrics: CbMeterItem[] = [
    { label: 'Componentes', value: 45 },
    { label: 'Tokens CSS', value: 20 },
    { label: 'Tests', value: 25 },
  ];
  protected readonly importCode = `import { CbMeterGroupComponent } from '@caribeng/ui/metergroup';`;
  protected readonly basicCode = `<cb-meter-group [values]="metrics" />`;
}
