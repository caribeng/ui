import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CbMultiSelect } from '@caribeng/ui/multiselect';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

interface Ciudad {
  nombre: string;
  id: number;
}

@Component({
  selector: 'doc-multiselect-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    ReactiveFormsModule,
    CbMultiSelect,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Form"
      title="MultiSelect"
      lead="Selección múltiple en overlay con casillas, filtro y seleccionar-todo. ControlValueAccessor (array)."
    />

    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Basic" description="optionLabel/optionValue para objetos." [code]="basicCode" [codeTs]="dataTs">
      <div style="width: 100%; max-width: 320px">
        <cb-multiselect
          [(value)]="seleccion"
          [options]="ciudades"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Elige ciudades"
        />
      </div>
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        IDs: {{ seleccion().join(', ') || '—' }}
      </p>
    </doc-section>

    <doc-section id="filter" title="Con filtro" description="filter añade un buscador en el panel." [code]="filterCode">
      <div style="width: 100%; max-width: 320px">
        <cb-multiselect
          [(value)]="seleccion2"
          [options]="ciudades"
          optionLabel="nombre"
          optionValue="id"
          filter
          placeholder="Busca y elige"
        />
      </div>
    </doc-section>

    <doc-section id="validation" title="Validación · Reactive Forms" [code]="validationCode" [codeTs]="validationTs">
      <div style="width: 100%; max-width: 320px">
        <cb-multiselect
          [formControl]="requeridas"
          [options]="ciudades"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Elige al menos una"
          [invalid]="requeridas.invalid && requeridas.touched"
        />
      </div>
    </doc-section>
  `,
})
export class MultiselectDocComponent {
  protected readonly docApi = DOC_API['cb-multiselect'];

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

  protected readonly seleccion = signal<number[]>([1]);
  protected readonly seleccion2 = signal<number[]>([]);
  protected readonly requeridas = new FormControl<number[]>([], {
    nonNullable: true,
    validators: [(c) => (c.value?.length ? null : { required: true })],
  });

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbMultiSelect } from '@caribeng/ui/multiselect';`;
  protected readonly dataTs = `ciudades = [{ nombre: 'Barranquilla', id: 1 }, /* … */];
seleccion = signal<number[]>([1]);`;
  protected readonly basicCode = `<cb-multiselect
  [(value)]="seleccion"
  [options]="ciudades"
  optionLabel="nombre" optionValue="id"
  placeholder="Elige ciudades" />`;
  protected readonly filterCode = `<cb-multiselect
  [(value)]="seleccion"
  [options]="ciudades"
  optionLabel="nombre" optionValue="id"
  filter placeholder="Busca y elige" />`;
  protected readonly validationCode = `<cb-multiselect
  [formControl]="requeridas"
  [options]="ciudades" optionLabel="nombre" optionValue="id"
  [invalid]="requeridas.invalid && requeridas.touched" />`;
  protected readonly validationTs = `requeridas = new FormControl<number[]>([], { nonNullable: true,
  validators: [c => c.value?.length ? null : { required: true }] });`;
}
