import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CbInputDateComponent } from '@caribeng/ui/input-date';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-input-date-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbInputDateComponent],
  template: `
    <cb-doc-page
      category="Caribe Design · Formularios"
      title="InputDate"
      subtitle="Campo de captura de fecha con límites min/max e integración CVA."
      importCode="import { CbInputDateComponent } from '@caribeng/ui/input-date';"
      [api]="api"
    >
      <cb-doc-example title="Selector de fecha" code='<cb-input-date label="Fecha de programación" [(value)]="date" />'>
        <cb-input-date label="Fecha de programación" [(value)]="date" />
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class InputDateDocComponent {
  protected readonly date = signal('2026-10-17');
  protected readonly api: CbDocApiRow[] = [
    { name: 'label', type: 'string', default: "''", description: 'Etiqueta superior del campo.' },
    { name: 'value', type: 'string (model)', default: "''", description: 'Fecha en formato ISO YYYY-MM-DD.' },
    { name: 'min', type: 'string', default: "''", description: 'Fecha mínima permitida.' },
    { name: 'max', type: 'string', default: "''", description: 'Fecha máxima permitida.' },
  ];
}
