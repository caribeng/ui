import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbInputDate } from '@caribeng/ui/caribe/input-date';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-input-date-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbInputDate],
  template: `
    <cb-doc-page
      category="Caribe Design · Formularios"
      title="InputDate"
      subtitle="Campo de captura de fecha con límites min/max e integración CVA."
      importCode="import { CbInputDate } from '@caribeng/ui/caribe/input-date';"
    >
      <cb-doc-example title="Selector de fecha" description="label define la etiqueta y la fecha se enlaza con [(value)]." code='<cb-input-date label="Fecha de programación" [(value)]="date" />'>
        <cb-input-date label="Fecha de programación" [(value)]="date" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class InputDateDocComponent {
  protected readonly docApi = DOC_API['cb-input-date'];

  protected readonly date = signal('2026-10-17');
}
