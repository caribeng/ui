import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbAccordion, CbAccordionPanel } from '@caribeng/ui/accordion';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-accordion-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    CbAccordion,
    CbAccordionPanel,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Panel" title="Accordion" lead="Paneles colapsables. Por defecto solo uno abierto; multiple permite varios." />

    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Basic" [code]="basicCode">
      <cb-accordion style="width: 100%">
        <cb-accordion-panel header="¿Qué es CaribeNG?">
          Una librería de componentes Angular con signals, OnPush y tokens CSS.
        </cb-accordion-panel>
        <cb-accordion-panel header="¿Necesito PrimeNG?">
          No. CaribeNG es independiente; solo usa @angular/cdk.
        </cb-accordion-panel>
        <cb-accordion-panel header="¿Es accesible?">
          Sí, el objetivo es WCAG 2.2 AA con teclado y ARIA correctos.
        </cb-accordion-panel>
      </cb-accordion>
    </doc-section>

    <doc-section id="multiple" title="Múltiple" description="multiple deja abiertos varios paneles a la vez." [code]="multipleCode">
      <cb-accordion multiple style="width: 100%">
        <cb-accordion-panel header="Envío">Entrega en 2–4 días hábiles.</cb-accordion-panel>
        <cb-accordion-panel header="Devoluciones">30 días para devolver sin coste.</cb-accordion-panel>
        <cb-accordion-panel header="Garantía" disabled>No disponible.</cb-accordion-panel>
      </cb-accordion>
    </doc-section>
  `,
})
export class AccordionDocComponent {
  protected readonly docApi = DOC_API['cb-accordion'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbAccordion, CbAccordionPanel } from '@caribeng/ui/accordion';`;
  protected readonly basicCode = `<cb-accordion>
  <cb-accordion-panel header="Sección 1">Contenido…</cb-accordion-panel>
  <cb-accordion-panel header="Sección 2">Contenido…</cb-accordion-panel>
</cb-accordion>`;
  protected readonly multipleCode = `<cb-accordion multiple>
  <cb-accordion-panel header="Envío">…</cb-accordion-panel>
  <cb-accordion-panel header="Garantía" disabled>…</cb-accordion-panel>
</cb-accordion>`;
}
