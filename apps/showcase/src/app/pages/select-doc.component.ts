import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbSelect } from '@caribeng/ui/select';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-select-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, 
    ReactiveFormsModule,
    CbSelect,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Formulario"
      title="Select"
      lead="Dropdown accesible (listbox) sobre CDK Overlay, con teclado, filtro y ControlValueAccessor."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="Lista simple de strings. Usa teclado: ↑ ↓ Enter Esc."
      [code]="basicCode"
      [codeTs]="basicTs"
    >
      <div style="width: 100%; max-width: 280px">
        <cb-select [options]="colores" [(value)]="color" placeholder="Elige un color" />
      </div>
    </doc-section>

    <doc-section
      id="objects"
      title="Con objetos"
      description="optionLabel y optionValue para listas de objetos."
      [code]="objectsCode"
      [codeTs]="objectsTs"
    >
      <div style="width: 100%; max-width: 280px">
        <cb-select
          [options]="ciudades"
          optionLabel="nombre"
          optionValue="codigo"
          [(value)]="ciudad"
          placeholder="Elige una ciudad"
        />
      </div>
    </doc-section>

    <doc-section
      id="filter"
      title="Filtro"
      description="Activa [filter] para buscar dentro del panel."
      [code]="filterCode"
    >
      <div style="width: 100%; max-width: 280px">
        <cb-select
          [options]="ciudades"
          optionLabel="nombre"
          optionValue="codigo"
          [filter]="true"
          placeholder="Busca una ciudad"
        />
      </div>
    </doc-section>

    <doc-section
      id="validation"
      title="Validación · Reactive Forms"
      description="Integra ControlValueAccessor: estados y errores sincronizados."
      [code]="validationCode"
      [codeTs]="validationTs"
    >
      <div style="width: 100%; max-width: 280px">
        <cb-select
          [options]="colores"
          [formControl]="colorCtrl"
          placeholder="Requerido"
        />
      </div>
    </doc-section>

    <doc-section
      id="disabled"
      title="Deshabilitado"
      description="Deshabilita el control o una opción individual."
      [code]="disabledCode"
      [codeTs]="disabledTs"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%; max-width: 280px">
        <cb-select [options]="colores" [disabled]="true" placeholder="Deshabilitado" />
        <cb-select [options]="conDeshabilitada" optionLabel="nombre" placeholder="Opción deshabilitada" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class SelectDocComponent {
  protected readonly a11y = DOC_A11Y['cb-select'];
  protected readonly docApi = DOC_API['cb-select'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly colores = ['Rojo', 'Verde', 'Azul', 'Amarillo', 'Morado'];
  protected readonly color = signal<string | null>(null);

  protected readonly ciudades = [
    { nombre: 'Cartagena', codigo: 'CTG' },
    { nombre: 'Barranquilla', codigo: 'BAQ' },
    { nombre: 'Santa Marta', codigo: 'SMR' },
    { nombre: 'Medellín', codigo: 'MDE' },
    { nombre: 'Bogotá', codigo: 'BOG' },
  ];
  protected readonly ciudad = signal<string | null>(null);

  protected readonly conDeshabilitada = [
    { nombre: 'Disponible' },
    { nombre: 'Agotado', disabled: true },
    { nombre: 'Disponible 2' },
  ];

  protected readonly colorCtrl = new FormControl<string | null>(null, {
    validators: [Validators.required],
  });

  protected readonly installCode = `npm install @caribeng/ui`;

  protected readonly importCode = `import { CbSelect } from '@caribeng/ui/select';

@Component({
  imports: [CbSelect],
  // ...
})
export class MyComponent {}`;

  protected readonly basicCode = `<cb-select [options]="colores" [(value)]="color"
  placeholder="Elige un color" />`;
  protected readonly basicTs = `colores = ['Rojo', 'Verde', 'Azul', 'Amarillo', 'Morado'];
color = signal<string | null>(null);`;

  protected readonly objectsCode = `<cb-select
  [options]="ciudades"
  optionLabel="nombre"
  optionValue="codigo"
  [(value)]="ciudad"
  placeholder="Elige una ciudad" />`;
  protected readonly objectsTs = `ciudades = [
  { nombre: 'Cartagena', codigo: 'CTG' },
  { nombre: 'Barranquilla', codigo: 'BAQ' },
  // ...
];`;

  protected readonly filterCode = `<cb-select
  [options]="ciudades"
  optionLabel="nombre"
  optionValue="codigo"
  [filter]="true"
  placeholder="Busca una ciudad" />`;

  protected readonly validationCode = `<cb-select
  [options]="colores"
  [formControl]="colorCtrl"
  placeholder="Requerido" />`;
  protected readonly validationTs = `colorCtrl = new FormControl<string | null>(null, {
  validators: [Validators.required],
});`;

  protected readonly disabledCode = `<cb-select [options]="colores" [disabled]="true"
  placeholder="Deshabilitado" />

<cb-select [options]="conDeshabilitada" optionLabel="nombre"
  placeholder="Opción deshabilitada" />`;
  protected readonly disabledTs = `conDeshabilitada = [
  { nombre: 'Disponible' },
  { nombre: 'Agotado', disabled: true },
  { nombre: 'Disponible 2' },
];`;
}
