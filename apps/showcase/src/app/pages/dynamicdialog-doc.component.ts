import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { signal } from '@angular/core';
import { CbDynamicDialogComponent } from '@caribeng/ui/dynamicdialog';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
@Component({selector:'doc-dynamicdialog-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[CbDynamicDialogComponent,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Overlay" title="Dynamicdialog" lead="Componente Dynamicdialog de CaribeNG." />
<doc-section id="import" title="Import">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Basic" [code]="example"><div style="width:100%"><cb-dynamic-dialog [(visible)]="visible" header="Detalle" content="Contenido din?mico" /></div></doc-section>`})
export class DynamicdialogDocComponent { constructor(){inject(TocService).reset();} protected readonly example=`<cb-dynamic-dialog [(visible)]="visible" header="Detalle" content="Contenido din?mico" />`; protected visible = signal(true); }
