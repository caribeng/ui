import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbSelectButton } from '@caribeng/ui/selectbutton';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-selectbutton-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbSelectButton, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Formulario" title="SelectButton" lead="Grupo de botones segmentados para elegir una o varias opciones." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="single" title="Selección simple" [code]="singleCode">
      <cb-selectbutton [(value)]="vista" [options]="vistas" />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Valor: {{ vista() ?? '—' }}
      </p>
    </doc-section>

    <doc-section id="multiple" title="Selección múltiple" [code]="multiCode">
      <cb-selectbutton [(value)]="dias" [options]="opcionesDias" multiple />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        {{ dias().join(', ') || '—' }}
      </p>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class SelectbuttonDocComponent {
  protected readonly docApi = DOC_API['cb-selectbutton'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly vistas = ['Día', 'Semana', 'Mes'];
  protected readonly opcionesDias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  protected readonly vista = signal<unknown>('Semana');
  protected readonly dias = signal<unknown[]>(['L', 'X']);

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbSelectButton } from '@caribeng/ui/selectbutton';`;
  protected readonly singleCode = `<cb-selectbutton [(value)]="vista" [options]="['Día','Semana','Mes']" />`;
  protected readonly multiCode = `<cb-selectbutton [(value)]="dias" [options]="opcionesDias" multiple />`;
}
