import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbTimeline } from '@caribeng/ui/timeline';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
@Component({selector:'doc-timeline-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[CbTimeline,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Data" title="Timeline" lead="Componente Timeline de CaribeNG." />
<doc-section id="import" title="Import">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Basic" [code]="example"><div style="width:100%"><cb-timeline [value]="events" /></div></doc-section>`})
export class TimelineDocComponent { constructor(){inject(TocService).reset();} protected readonly example=`<cb-timeline [value]="events" />`; protected events = [{title: 'Pedido creado', date: 'Hoy'}]; }
