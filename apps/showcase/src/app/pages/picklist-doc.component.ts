import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { signal } from '@angular/core';
import { CbPickListComponent } from '@caribeng/ui/picklist';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
@Component({selector:'doc-picklist-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[CbPickListComponent,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Data" title="Picklist" lead="Componente Picklist de CaribeNG." />
<doc-section id="import" title="Import">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Basic" [code]="example"><div style="width:100%"><cb-picklist [(source)]="source" [(target)]="target" /></div></doc-section>`})
export class PicklistDocComponent { constructor(){inject(TocService).reset();} protected readonly example=`<cb-picklist [(source)]="source" [(target)]="target" />`; protected source = signal(['Angular', 'TypeScript']); target = signal(['CaribeNG']); }
