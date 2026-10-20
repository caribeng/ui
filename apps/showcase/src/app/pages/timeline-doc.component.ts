import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbTimeline } from '@caribeng/ui/timeline';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
@Component({selector:'doc-timeline-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[DocPlaygroundComponent, CbTimeline,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Datos" title="Timeline" lead="Componente Timeline de CaribeNG." />

    <doc-section id="import" title="Importación">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Básico" [code]="example"><div style="width:100%"><cb-timeline [value]="events" /></div></doc-section>

<doc-playground [api]="docApi" />
`})
export class TimelineDocComponent {
  protected readonly docApi = DOC_API['cb-timeline'];
 constructor(){inject(TocService).reset();} protected readonly example=`<cb-timeline [value]="events" />`; protected events = [{title: 'Pedido creado', date: 'Hoy'}]; }
