import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { signal } from '@angular/core';
import { CbPickList } from '@caribeng/ui/picklist';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
@Component({selector:'doc-picklist-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[DocPlaygroundComponent, CbPickList,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Datos" title="Picklist" lead="Componente Picklist de CaribeNG." />

    <doc-section id="import" title="Importación">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Básico" [code]="example"><div style="width:100%"><cb-picklist [(source)]="source" [(target)]="target" /></div></doc-section>

<doc-playground [api]="docApi" />
`})
export class PicklistDocComponent {
  protected readonly docApi = DOC_API['cb-picklist'];
 constructor(){inject(TocService).reset();} protected readonly example=`<cb-picklist [(source)]="source" [(target)]="target" />`; protected source = signal(['Angular', 'TypeScript']); target = signal(['CaribeNG']); }
