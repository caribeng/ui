import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbInput } from '@caribeng/ui/input';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-input-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    ReactiveFormsModule,
    CbInput,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Form"
      title="Input"
      lead="Campo de texto integrado con Angular Forms mediante ControlValueAccessor."
    />

    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Basic"
      description="Enlázalo con two-way binding o con Angular Forms."
      [code]="basicCode"
    >
      <div style="width: 100%; max-width: 320px">
        <cb-input placeholder="Escribe aquí…" />
      </div>
    </doc-section>

    <doc-section
      id="label-hint"
      title="Label y Hint"
      description="Etiqueta asociada y texto de ayuda accesible (aria-describedby)."
      [code]="labelCode"
    >
      <div style="width: 100%; max-width: 320px">
        <cb-input
          label="Usuario"
          placeholder="tu-usuario"
          hint="Visible para otros miembros."
          [required]="true"
        />
      </div>
    </doc-section>

    <doc-section
      id="validation"
      title="Validación · Reactive Forms"
      description="Implementa ControlValueAccessor: estados, errores y aria se sincronizan con el FormControl."
      [code]="validationCode"
      [codeTs]="validationTs"
    >
      <div style="width: 100%; max-width: 320px">
        <cb-input
          [formControl]="email"
          type="email"
          label="Correo"
          placeholder="correo@dominio.com"
          [required]="true"
          [invalid]="email.invalid && email.touched"
          error="Ingresa un correo válido."
        />
      </div>
    </doc-section>

    <doc-section
      id="sizes"
      title="Sizes"
      description="sm, md (por defecto) y lg."
      [code]="sizesCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%; max-width: 320px">
        <cb-input size="sm" placeholder="Small" />
        <cb-input size="md" placeholder="Medium" />
        <cb-input size="lg" placeholder="Large" />
      </div>
    </doc-section>

    <doc-section
      id="disabled"
      title="Disabled"
      description="Respeta setDisabledState de Angular Forms."
      [code]="disabledCode"
    >
      <div style="width: 100%; max-width: 320px">
        <cb-input [disabled]="true" value="No editable" />
      </div>
    </doc-section>
  `,
})
export class InputDocComponent {
  protected readonly docApi = DOC_API['cb-input'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  protected readonly installCode = `npm install @caribeng/ui`;

  protected readonly importCode = `import { CbInput } from '@caribeng/ui/input';

@Component({
  imports: [CbInput],
  // ...
})
export class MyComponent {}`;

  protected readonly basicCode = `<cb-input placeholder="Escribe aquí…" />`;

  protected readonly labelCode = `<cb-input
  label="Usuario"
  placeholder="tu-usuario"
  hint="Visible para otros miembros."
  [required]="true" />`;

  protected readonly validationCode = `<cb-input
  [formControl]="email"
  type="email"
  label="Correo"
  placeholder="correo@dominio.com"
  [required]="true"
  [invalid]="email.invalid && email.touched"
  error="Ingresa un correo válido." />`;

  protected readonly validationTs = `email = new FormControl('', {
  nonNullable: true,
  validators: [Validators.required, Validators.email],
});`;

  protected readonly sizesCode = `<cb-input size="sm" placeholder="Small" />
<cb-input size="md" placeholder="Medium" />
<cb-input size="lg" placeholder="Large" />`;

  protected readonly disabledCode = `<cb-input [disabled]="true" value="No editable" />`;
}
