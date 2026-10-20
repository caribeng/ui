import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { signal } from '@angular/core';
import { CbConfirmDialog } from '@caribeng/ui/confirmdialog';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
@Component({selector:'doc-confirmdialog-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[DocA11yComponent, DocPlaygroundComponent, CbConfirmDialog,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Overlays" title="Confirmdialog" lead="Componente Confirmdialog de CaribeNG." />

    <doc-section id="import" title="Importación">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Básico" description="Diálogo de confirmación controlado con [(visible)]; header define el título." [code]="example"><div style="width:100%"><cb-confirm-dialog [(visible)]="visible" header="Eliminar" /></div></doc-section>

<doc-a11y [data]="a11y" />

<doc-playground [api]="docApi" />
`})
export class ConfirmdialogDocComponent {
  protected readonly a11y = DOC_A11Y['cb-confirm-dialog'];
  protected readonly docApi = DOC_API['cb-confirm-dialog'];
 constructor(){inject(TocService).reset();} protected readonly example=`<cb-confirm-dialog [(visible)]="visible" header="Eliminar" />`; protected visible = signal(true); }
