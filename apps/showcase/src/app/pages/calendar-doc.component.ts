import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbCalendar } from '@caribeng/ui/caribe/calendar';
import { CbDocPageComponent } from '../components/doc-page.component';
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
    >
      <cb-doc-example title="Calendario mensual" description="Muestra un mes completo; el día elegido se enlaza con [(selectedDay)] y monthLabel define el encabezado." code='<cb-calendar [(selectedDay)]="day" monthLabel="Octubre 2026" />'>
        <cb-calendar [(selectedDay)]="day" monthLabel="Octubre 2026" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class CalendarDocComponent {
  protected readonly docApi = DOC_API['cb-calendar'];

  protected readonly day = signal(17);
}
