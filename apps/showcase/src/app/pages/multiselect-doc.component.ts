import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CbMultiSelect } from '@caribeng/ui/multiselect';
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
  selector: 'doc-multiselect-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, 
    ReactiveFormsModule,
    CbMultiSelect,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Formulario"
      title="MultiSelect"
      lead="Selección múltiple en overlay con casillas, filtro y seleccionar-todo. ControlValueAccessor (array)."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="optionLabel/optionValue para objetos." [code]="basicCode" [codeTs]="dataTs">
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

    <doc-section
      id="group"
      title="Agrupado"
      description="Con group, cada opción de primer nivel es un grupo { label, items }. Seleccionar todo marca las opciones de todos los grupos."
      [code]="groupCode"
      [codeTs]="groupTs"
    >
      <div style="width: 100%; max-width: 320px">
        <cb-multiselect [options]="paises" group optionValue="label" [(value)]="ciudadesAgrupadas" placeholder="Elige ciudades" ariaLabel="Ciudades" />
      </div>
    </doc-section>

    <doc-section
      id="virtual"
      title="Scroll virtual"
      description="virtualScroll pinta solo las opciones visibles: aquí, 10 000 clientes con filtro."
      [code]="virtualCode"
      [codeTs]="virtualTs"
    >
      <div style="width: 100%; max-width: 320px">
        <cb-multiselect
          [options]="clientes"
          optionLabel="nombre"
          optionValue="id"
          virtualScroll
          [virtualScrollItemSize]="36"
          filter
          placeholder="Elige clientes"
          ariaLabel="Clientes"
        />
      </div>
    </doc-section>

    <doc-section id="validation" title="Validación · Reactive Forms" description="Con formControl el estado de error se aplica automáticamente cuando el control es inválido y el usuario ya lo tocó." [code]="validationCode" [codeTs]="validationTs">
      <div style="width: 100%; max-width: 320px">
        <cb-multiselect
          [formControl]="requeridas"
          [options]="ciudades"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Elige al menos una"
        />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class MultiselectDocComponent {
  protected readonly ciudadesAgrupadas = signal<unknown[]>([]);
  protected readonly paises = [
    { label: 'Colombia', items: [{ label: 'Bogotá' }, { label: 'Medellín' }, { label: 'Cali' }] },
    { label: 'México', items: [{ label: 'Ciudad de México' }, { label: 'Monterrey' }] },
    { label: 'Perú', items: [{ label: 'Lima' }, { label: 'Arequipa' }] },
  ];
  protected readonly clientes = Array.from({ length: 10000 }, (_, i) => ({ nombre: `Cliente ${i + 1}`, id: i + 1 }));
  protected readonly a11y = DOC_A11Y['cb-multiselect'];
  protected readonly docApi = DOC_API['cb-multiselect'];

  protected readonly groupCode = `<cb-multiselect [options]="paises" group optionValue="label" [(value)]="ciudadesAgrupadas" placeholder="Elige ciudades" ariaLabel="Ciudades" />`;
  protected readonly virtualCode = `<cb-multiselect
  [options]="clientes"
  optionLabel="nombre"
  optionValue="id"
  virtualScroll
  [virtualScrollItemSize]="36"
  filter
  placeholder="Elige clientes"
  ariaLabel="Clientes"
/>`;
  protected readonly groupTs = `paises = [
  { label: 'Colombia', items: [{ label: 'Bogotá' }, { label: 'Medellín' }, { label: 'Cali' }] },
  { label: 'México', items: [{ label: 'Ciudad de México' }, { label: 'Monterrey' }] },
  { label: 'Perú', items: [{ label: 'Lima' }, { label: 'Arequipa' }] },
];`;
  protected readonly virtualTs = `clientes = Array.from({ length: 10000 }, (_, i) => ({ nombre: \`Cliente \${i + 1}\`, id: i + 1 }));`;

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
  [options]="ciudades" optionLabel="nombre" optionValue="id" />`;
  protected readonly validationTs = `requeridas = new FormControl<number[]>([], { nonNullable: true,
  validators: [c => c.value?.length ? null : { required: true }] });`;
}
