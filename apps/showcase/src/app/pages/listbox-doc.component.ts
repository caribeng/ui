import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbListBox } from '@caribeng/ui/listbox';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

interface Ciudad {
  nombre: string;
  id: number;
}

@Component({
  selector: 'doc-listbox-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, CbListBox, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Formulario" title="ListBox" lead="Lista de opciones siempre visible. Simple o múltiple, con filtro." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="single" title="Selección simple" description="Lista de opciones visible; el valor elegido se enlaza con [(value)]." [code]="singleCode" [codeTs]="dataTs">
      <div style="max-width: 18rem">
        <cb-listbox [(value)]="ciudad" [options]="ciudades" optionLabel="nombre" optionValue="id" />
      </div>
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        ID: {{ ciudad() ?? '—' }}
      </p>
    </doc-section>

    <doc-section id="multiple" title="Múltiple con filtro" description="Con multiple se eligen varias opciones y filter añade un buscador." [code]="multiCode">
      <div style="max-width: 18rem">
        <cb-listbox [(value)]="seleccion" [options]="ciudades" optionLabel="nombre" optionValue="id" multiple filter />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class ListboxDocComponent {
  protected readonly a11y = DOC_A11Y['cb-listbox'];
  protected readonly docApi = DOC_API['cb-listbox'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly ciudades: Ciudad[] = [
    { nombre: 'Barranquilla', id: 1 },
    { nombre: 'Cartagena', id: 2 },
    { nombre: 'Santa Marta', id: 3 },
    { nombre: 'Montería', id: 4 },
    { nombre: 'Sincelejo', id: 5 },
  ];
  protected readonly ciudad = signal<unknown>(2);
  protected readonly seleccion = signal<unknown[]>([1, 3]);

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbListBox } from '@caribeng/ui/listbox';`;
  protected readonly dataTs = `ciudades = [{ nombre: 'Barranquilla', id: 1 }, /* … */];`;
  protected readonly singleCode = `<cb-listbox [(value)]="ciudad" [options]="ciudades"
  optionLabel="nombre" optionValue="id" />`;
  protected readonly multiCode = `<cb-listbox [(value)]="seleccion" [options]="ciudades"
  optionLabel="nombre" optionValue="id" multiple filter />`;
}
