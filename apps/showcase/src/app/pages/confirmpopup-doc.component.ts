import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { signal } from '@angular/core';
import { CbConfirmPopup } from '@caribeng/ui/confirmpopup';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
@Component({selector:'doc-confirmpopup-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[CbConfirmPopup,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Overlay" title="Confirmpopup" lead="Componente Confirmpopup de CaribeNG." />
<doc-section id="import" title="Import">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Basic" [code]="example"><div style="width:100%"><cb-confirm-popup [(visible)]="visible" /></div></doc-section>`})
export class ConfirmpopupDocComponent { constructor(){inject(TocService).reset();} protected readonly example=`<cb-confirm-popup [(visible)]="visible" />`; protected visible = signal(true); }
