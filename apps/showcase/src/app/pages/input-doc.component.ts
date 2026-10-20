import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbInput } from '@caribeng/ui/input';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-input-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, 
    ReactiveFormsModule,
    CbInput,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Formulario"
      title="Input"
      lead="Campo de texto integrado con Angular Forms mediante ControlValueAccessor."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
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
          error="Ingresa un correo válido."
        />
      </div>
    </doc-section>

    <doc-section
      id="sizes"
      title="Tamaños"
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
      title="Deshabilitado"
      description="Respeta setDisabledState de Angular Forms."
      [code]="disabledCode"
    >
      <div style="width: 100%; max-width: 320px">
        <cb-input [disabled]="true" value="No editable" />
      </div>
    </doc-section>

    <doc-section
      id="required-indicator"
      title="Indicador de obligatoriedad"
      description="requiredIndicator elige cómo se señala en la etiqueta: asterisk (*), text (requerido), optional (marca los opcionales) o none (nada visible). El campo siempre expone aria-required."
      [code]="indicatorCode"
    >
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1rem; width: 100%">
        <cb-input label="Correo" [required]="true" requiredIndicator="asterisk" />
        <cb-input label="Correo" [required]="true" requiredIndicator="text" />
        <cb-input label="Teléfono" requiredIndicator="optional" />
        <cb-input label="Correo" [required]="true" requiredIndicator="none" />
      </div>
    </doc-section>

    <doc-section
      id="required-indicator-global"
      title="Indicador global"
      description="Configúralo una vez para toda la app con provideCaribeNG(); por defecto es none. Cada campo puede sobrescribirlo con requiredIndicator."
    >
      <doc-code-block [code]="indicatorConfigCode" lang="typescript" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class InputDocComponent {
  protected readonly a11y = DOC_A11Y['cb-input'];
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
  error="Ingresa un correo válido." />`;

  protected readonly indicatorCode = `<cb-input label="Correo" [required]="true" requiredIndicator="asterisk" />
<cb-input label="Correo" [required]="true" requiredIndicator="text" />
<cb-input label="Teléfono" requiredIndicator="optional" />
<cb-input label="Correo" [required]="true" requiredIndicator="none" />`;

  protected readonly indicatorConfigCode = `// app.config.ts
import { provideCaribeNG } from '@caribeng/ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCaribeNG({
      requiredIndicator: 'optional', // 'asterisk' | 'text' | 'optional' | 'none' (por defecto)
      requiredText: 'requerido',     // texto del modo 'text'
      optionalText: 'opcional',      // texto del modo 'optional'
    }),
  ],
};`;

  protected readonly validationTs = `email = new FormControl('', {
  nonNullable: true,
  validators: [Validators.required, Validators.email],
});`;

  protected readonly sizesCode = `<cb-input size="sm" placeholder="Small" />
<cb-input size="md" placeholder="Medium" />
<cb-input size="lg" placeholder="Large" />`;

  protected readonly disabledCode = `<cb-input [disabled]="true" value="No editable" />`;
}
