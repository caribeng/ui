import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbStepsComponent, type CbStepItem } from '@caribeng/ui/steps';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({ selector: 'doc-steps-page', changeDetection: ChangeDetectionStrategy.OnPush, imports: [CbStepsComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent], template: `
  <doc-page-header eyebrow="Menu" title="Steps" lead="Indicador interactivo del avance en un flujo de varios pasos." />
  <doc-section id="import" title="Import"><doc-code-block [code]="installCode" lang="bash" /><br /><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
  <doc-section id="basic" title="Basic" description="Selecciona un paso para actualizar el índice actual." [code]="basicCode">
    <cb-steps style="width:100%" [steps]="steps" [(activeIndex)]="active" (activeChange)="changed.set($event)" />
    <p style="margin:.75rem 0 0;color:var(--cb-color-text-muted)">Paso actual: {{ active() + 1 }} · último cambio: {{ changed() + 1 }}</p>
  </doc-section>
` })
export class StepsDocComponent {
  constructor() { inject(TocService).reset(); }
  protected readonly active = signal(0);
  protected readonly changed = signal(0);
  protected readonly steps: CbStepItem[] = [{ label: 'Cuenta' }, { label: 'Entrega' }, { label: 'Pago' }, { label: 'Confirmación' }];
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbStepsComponent } from '@caribeng/ui/steps';`;
  protected readonly basicCode = `<cb-steps [steps]="steps" [(activeIndex)]="activeIndex" />`;
}
