import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { signal } from '@angular/core';
import { CbConfirmPopup } from '@caribeng/ui/confirmpopup';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
@Component({selector:'doc-confirmpopup-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[DocPlaygroundComponent, CbConfirmPopup,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Overlays" title="Confirmpopup" lead="Componente Confirmpopup de CaribeNG." />

    <doc-section id="import" title="Importación">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Básico" [code]="example"><div style="width:100%"><cb-confirm-popup [(visible)]="visible" /></div></doc-section>

<doc-playground [api]="docApi" />
`})
export class ConfirmpopupDocComponent {
  protected readonly docApi = DOC_API['cb-confirm-popup'];
 constructor(){inject(TocService).reset();} protected readonly example=`<cb-confirm-popup [(visible)]="visible" />`; protected visible = signal(true); }
