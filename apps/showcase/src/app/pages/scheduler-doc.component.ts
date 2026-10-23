import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbDialog } from '@caribeng/ui/dialog';
import { CbInput } from '@caribeng/ui/input';
import { CbScheduler, type CbSchedulerChange, type CbSchedulerEvent, type CbSchedulerSlot, type CbSchedulerView } from '@caribeng/ui/scheduler';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

/** Fecha y hora local (`AAAA-MM-DDTHH:mm`) a `days` días de hoy, a la hora indicada. */
function at(days: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:${pad(minute)}`;
}

/** Día `AAAA-MM-DD` a `days` días de hoy. */
function day(days: number): string {
  return at(days, 0).slice(0, 10);
}

let nextId = 100;

@Component({
  selector: 'doc-scheduler-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbScheduler, CbDialog, CbInput, CbButton, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Data"
      title="Scheduler"
      lead="Calendario de eventos con vistas de mes, semana, día y agenda. Los eventos con hora se colocan en su franja (los que se solapan, uno al lado del otro) y los de día completo arriba; se mueven y se les cambia la duración arrastrando o con el teclado, y al elegir un hueco se crea un evento."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="calendar"
      title="Calendario completo"
      description="Arrastra un evento para moverlo (también a otro día) y su borde inferior para cambiar la duración; el paso es slotMinutes (30 min). Arrastra sobre una franja vacía, haz clic en ella o pulsa + junto a un día para elegir un hueco: slotSelect devuelve inicio y fin, y aquí crea un evento y abre su ficha. Clic (o Enter) en un evento emite eventOpen. Cambia de vista con la barra; los días del mes y las cabeceras de la semana abren ese día."
      [code]="calendarCode"
    >
      <div style="display: grid; gap: 0.5rem; width: 100%">
        <cb-scheduler [(events)]="eventos" [(view)]="vista" (slotSelect)="crear($event)" (eventOpen)="abrir($event)" (eventChange)="onChange($event)" />
        <p class="sc-log">{{ ultimo() }}</p>
      </div>

      <cb-dialog [visible]="editando() !== null" (visibleChange)="!$event && editando.set(null)" header="Evento" width="26rem">
        <form (submit)="$event.preventDefault(); guardar()">
          <cb-input label="Título" [(value)]="titulo" required />
        </form>
        <div cb-dialog-footer class="sc-actions">
          <cb-button variant="text" severity="danger" (click)="eliminar()">Eliminar</cb-button>
          <span style="flex: 1"></span>
          <cb-button variant="text" severity="secondary" (click)="editando.set(null)">Cancelar</cb-button>
          <cb-button [disabled]="!titulo().trim()" (click)="guardar()">Guardar</cb-button>
        </div>
      </cb-dialog>
    </doc-section>

    <doc-section
      id="month"
      title="Mes"
      description="En el mes, los eventos con hora llevan un punto y su hora; los de día completo y los que duran varios días, una barra de color. Si no caben, «+N más» abre ese día. Arrastra un evento a otro día para moverlo."
      [code]="monthCode"
    >
      <cb-scheduler [(events)]="eventos" view="month" height="34rem" />
    </doc-section>

    <doc-section
      id="agenda"
      title="Agenda"
      description="La agenda lista los eventos de los próximos agendaDays días (14 por defecto), agrupados por día: útil en móvil y para lectores de pantalla."
      [code]="agendaCode"
    >
      <cb-scheduler [events]="eventos()" view="agenda" [views]="['agenda', 'month']" height="22rem" [editable]="false" />
    </doc-section>

    <doc-section
      id="readonly"
      title="Solo lectura y semana desde el domingo"
      description="Con [editable]=&quot;false&quot; no se mueve ni se crea nada (los eventos se siguen abriendo). firstDayOfWeek=&quot;0&quot; empieza la semana el domingo, scrollHour fija la hora visible al abrir y views elige las vistas de la barra."
      [code]="readonlyCode"
    >
      <cb-scheduler [events]="eventos()" [editable]="false" firstDayOfWeek="0" scrollHour="12" [views]="['week', 'day']" height="26rem" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .sc-log {
        min-height: 1.25rem;
        margin: 0;
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
      .sc-actions {
        display: flex;
        gap: 0.5rem;
        width: 100%;
      }
    `,
  ],
})
export class SchedulerDocComponent {
  protected readonly docApi = DOC_API['cb-scheduler'];
  protected readonly a11y = DOC_A11Y['cb-scheduler'];

  protected readonly vista = signal<CbSchedulerView>('week');
  protected readonly ultimo = signal('');
  protected readonly editando = signal<CbSchedulerEvent | null>(null);
  protected readonly titulo = signal('');

  protected readonly eventos = signal<readonly CbSchedulerEvent[]>([
    { id: '1', title: 'Comité de crédito', start: at(0, 9), end: at(0, 10, 30), location: 'Sala 3', color: '#2563eb' },
    { id: '2', title: 'Revisión de diseño', start: at(0, 10), end: at(0, 11), location: 'Meet', color: '#8b5cf6' },
    { id: '3', title: 'Almuerzo con cliente', start: at(0, 13), end: at(0, 14, 30), location: 'Restaurante El Muelle', color: '#f59e0b' },
    { id: '4', title: 'Daily', start: at(1, 9), end: at(1, 9, 15), color: '#10b981' },
    { id: '5', title: 'Taller de accesibilidad', start: at(1, 15), end: at(1, 17), location: 'Auditorio', color: '#ec4899' },
    { id: '6', title: 'Cierre contable', start: day(2), end: day(3), allDay: true, color: '#ef4444' },
    { id: '7', title: 'Visita a la oficina de Cartagena', start: day(-1), allDay: true, color: '#0ea5e9' },
    { id: '8', title: 'Entrevista', start: at(-1, 11), end: at(-1, 12), color: '#8b5cf6' },
    { id: '9', title: 'Formación interna', start: at(3, 8), end: at(3, 12), location: 'Sala 1', color: '#2563eb' },
    { id: '10', title: 'Daily', start: at(2, 9), end: at(2, 9, 15), color: '#10b981' },
    { id: '11', title: 'Daily', start: at(3, 9), end: at(3, 9, 15), color: '#10b981' },
    { id: '12', title: 'Revisión trimestral', start: at(6, 10), end: at(6, 12), color: '#0ea5e9' },
  ]);

  /** Al elegir un hueco se crea el evento y se abre su ficha. */
  protected crear(slot: CbSchedulerSlot): void {
    const pad = (n: number) => String(n).padStart(2, '0');
    const local = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const evento: CbSchedulerEvent = slot.allDay
      ? { id: String(++nextId), title: 'Nuevo evento', start: local(slot.start).slice(0, 10), allDay: true }
      : { id: String(++nextId), title: 'Nuevo evento', start: local(slot.start), end: local(slot.end) };
    this.eventos.update((list) => [...list, evento]);
    this.abrir(evento);
  }

  protected abrir(evento: CbSchedulerEvent): void {
    this.titulo.set(evento.title);
    this.editando.set(evento);
  }

  protected guardar(): void {
    const evento = this.editando();
    const titulo = this.titulo().trim();
    if (!evento || !titulo) return;
    this.eventos.update((list) => list.map((e) => (e.id === evento.id ? { ...e, title: titulo } : e)));
    this.ultimo.set(`Guardado «${titulo}».`);
    this.editando.set(null);
  }

  protected eliminar(): void {
    const evento = this.editando();
    if (!evento) return;
    this.eventos.update((list) => list.filter((e) => e.id !== evento.id));
    this.ultimo.set(`Eliminado «${evento.title}».`);
    this.editando.set(null);
  }

  protected onChange(change: CbSchedulerChange): void {
    this.ultimo.set(`«${change.event.title}»: ${String(change.event.start).replace('T', ' ')} → ${String(change.event.end ?? '').replace('T', ' ')}`);
  }

  protected readonly importCode = `import { CbScheduler, type CbSchedulerEvent } from '@caribeng/ui/scheduler';`;
  protected readonly calendarCode = `<div style="display: grid; gap: 0.5rem; width: 100%">
  <cb-scheduler [(events)]="eventos" [(view)]="vista" (slotSelect)="crear($event)" (eventOpen)="abrir($event)" (eventChange)="onChange($event)" />
  <p class="sc-log">{{ ultimo() }}</p>
</div>

<cb-dialog [visible]="editando() !== null" (visibleChange)="!$event && editando.set(null)" header="Evento" width="26rem">
  <form (submit)="$event.preventDefault(); guardar()">
    <cb-input label="Título" [(value)]="titulo" required />
  </form>
  <div cb-dialog-footer class="sc-actions">
    <cb-button variant="text" severity="danger" (click)="eliminar()">Eliminar</cb-button>
    <span style="flex: 1"></span>
    <cb-button variant="text" severity="secondary" (click)="editando.set(null)">Cancelar</cb-button>
    <cb-button [disabled]="!titulo().trim()" (click)="guardar()">Guardar</cb-button>
  </div>
</cb-dialog>`;
  protected readonly monthCode = `<cb-scheduler [(events)]="eventos" view="month" height="34rem" />`;
  protected readonly agendaCode = `<cb-scheduler [events]="eventos()" view="agenda" [views]="['agenda', 'month']" height="22rem" [editable]="false" />`;
  protected readonly readonlyCode = `<cb-scheduler [events]="eventos()" [editable]="false" firstDayOfWeek="0" scrollHour="12" [views]="['week', 'day']" height="26rem" />`;

  constructor() {
    inject(TocService).reset();
  }
}
