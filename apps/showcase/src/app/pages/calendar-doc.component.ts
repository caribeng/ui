import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbCalendar } from '@caribeng/ui/caribe/calendar';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-calendar-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbCalendar],
  template: `
    <cb-doc-page
      category="Caribe Design · Formularios"
      title="Calendar"
      subtitle="Vista de calendario mensual inline para selección directa de día."
      importCode="import { CbCalendar } from '@caribeng/ui/caribe/calendar';"
      [api]="api"
    >
      <cb-doc-example title="Calendario mensual" code='<cb-calendar [(selectedDay)]="day" monthLabel="Octubre 2026" />'>
        <cb-calendar [(selectedDay)]="day" monthLabel="Octubre 2026" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class CalendarDocComponent {
  protected readonly docApi = DOC_API['cb-calendar'];

  protected readonly day = signal(17);
  protected readonly api: CbDocApiRow[] = [
    { name: 'monthLabel', type: 'string', default: "'Octubre 2026'", description: 'Título del mes visible.' },
    { name: 'selectedDay', type: 'number (model)', default: '17', description: 'Día seleccionado del mes.' },
  ];
}
