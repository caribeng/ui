import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbStepper, CbStep } from '@caribeng/ui/stepper';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';

@Component({
  selector: 'doc-stepper-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbStepper,
    CbStep,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Paneles" title="Stepper" lead="Asistente por pasos con indicadores, pasos completados y navegación integrada." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Usa los botones Atrás/Siguiente o haz clic en un indicador." [code]="basicCode">
      <cb-stepper style="width: 100%">
        <cb-step label="Cuenta">
          <p style="margin: 0">Crea tu cuenta con correo y contraseña.</p>
        </cb-step>
        <cb-step label="Perfil">
          <p style="margin: 0">Completa tu nombre y foto de perfil.</p>
        </cb-step>
        <cb-step label="Confirmar">
          <p style="margin: 0">Revisa los datos y finaliza el registro.</p>
        </cb-step>
      </cb-stepper>
    </doc-section>

    <doc-section id="nonav" title="Sin navegación integrada" description="showNav=false para controlar los pasos desde tu propia UI." [code]="noNavCode">
      <cb-stepper [showNav]="false" style="width: 100%">
        <cb-step label="Carrito"><p style="margin: 0">Revisa tus productos.</p></cb-step>
        <cb-step label="Pago"><p style="margin: 0">Introduce el método de pago.</p></cb-step>
      </cb-stepper>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class StepperDocComponent {
  protected readonly docApi = DOC_API['cb-stepper'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbStepper, CbStep } from '@caribeng/ui/stepper';`;
  protected readonly basicCode = `<cb-stepper>
  <cb-step label="Cuenta">…</cb-step>
  <cb-step label="Perfil">…</cb-step>
  <cb-step label="Confirmar">…</cb-step>
</cb-stepper>`;
  protected readonly noNavCode = `<cb-stepper [showNav]="false"> … </cb-stepper>
<!-- controla con stepper.next() / stepper.prev() / stepper.goTo(i) -->`;
}
