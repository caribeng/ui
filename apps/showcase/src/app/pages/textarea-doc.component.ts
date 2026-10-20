import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbTextarea } from '@caribeng/ui/textarea';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-textarea-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, 
    ReactiveFormsModule,
    CbTextarea,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Formulario"
      title="Textarea"
      lead="Área de texto multilínea con ControlValueAccessor, auto-resize y conteo de caracteres."
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
      <div style="width: 100%; max-width: 420px">
        <cb-textarea label="Comentario" placeholder="Escribe aquí…" [rows]="3" />
      </div>
    </doc-section>

    <doc-section
      id="auto-resize"
      title="Auto-resize y contador"
      description="autoResize crece con el contenido; maxlength muestra un contador."
      [code]="autoCode"
    >
      <div style="width: 100%; max-width: 420px">
        <cb-textarea
          label="Biografía"
          placeholder="Cuéntanos sobre ti…"
          autoResize
          [maxlength]="280"
          hint="Máximo 280 caracteres."
        />
      </div>
    </doc-section>

    <doc-section
      id="validation"
      title="Validación · Reactive Forms"
      description="Estados, errores y aria se sincronizan con el FormControl."
      [code]="validationCode"
      [codeTs]="validationTs"
    >
      <div style="width: 100%; max-width: 420px">
        <cb-textarea
          [formControl]="mensaje"
          label="Mensaje"
          placeholder="Mínimo 10 caracteres"
          [required]="true"
          [invalid]="mensaje.invalid && mensaje.touched"
          error="El mensaje debe tener al menos 10 caracteres."
        />
      </div>
    </doc-section>

    <doc-section
      id="sizes"
      title="Tamaños"
      description="sm, md (por defecto) y lg."
      [code]="sizesCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%; max-width: 420px">
        <cb-textarea size="sm" placeholder="Small" [rows]="2" />
        <cb-textarea size="md" placeholder="Medium" [rows]="2" />
        <cb-textarea size="lg" placeholder="Large" [rows]="2" />
      </div>
    </doc-section>

    <doc-section
      id="disabled"
      title="Deshabilitado"
      description="Respeta setDisabledState de Angular Forms."
      [code]="disabledCode"
    >
      <div style="width: 100%; max-width: 420px">
        <cb-textarea [disabled]="true" value="No editable" [rows]="2" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class TextareaDocComponent {
  protected readonly a11y = DOC_A11Y['cb-textarea'];
  protected readonly docApi = DOC_API['cb-textarea'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly mensaje = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(10)],
  });

  protected readonly installCode = `npm install @caribeng/ui`;

  protected readonly importCode = `import { CbTextarea } from '@caribeng/ui/textarea';

@Component({
  imports: [CbTextarea],
  // ...
})
export class MyComponent {}`;

  protected readonly basicCode = `<cb-textarea label="Comentario" placeholder="Escribe aquí…" [rows]="3" />`;

  protected readonly autoCode = `<cb-textarea
  label="Biografía"
  placeholder="Cuéntanos sobre ti…"
  autoResize
  [maxlength]="280"
  hint="Máximo 280 caracteres." />`;

  protected readonly validationCode = `<cb-textarea
  [formControl]="mensaje"
  label="Mensaje"
  placeholder="Mínimo 10 caracteres"
  [required]="true"
  [invalid]="mensaje.invalid && mensaje.touched"
  error="El mensaje debe tener al menos 10 caracteres." />`;

  protected readonly validationTs = `mensaje = new FormControl('', {
  nonNullable: true,
  validators: [Validators.required, Validators.minLength(10)],
});`;

  protected readonly sizesCode = `<cb-textarea size="sm" placeholder="Small" [rows]="2" />
<cb-textarea size="md" placeholder="Medium" [rows]="2" />
<cb-textarea size="lg" placeholder="Large" [rows]="2" />`;

  protected readonly disabledCode = `<cb-textarea [disabled]="true" value="No editable" [rows]="2" />`;
}
