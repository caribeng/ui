import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CbCheckboxComponent } from '@caribeng/ui/checkbox';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-checkbox-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CbCheckboxComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Form"
      title="Checkbox"
      lead="Casilla con ControlValueAccessor en modo binario o de lista de valores."
    />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Basic"
      description="Modo binario: el modelo es un boolean."
      [code]="basicCode"
      [codeTs]="basicTs"
    >
      <cb-checkbox [formControl]="acepto" label="Acepto los términos y condiciones" />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Valor: {{ acepto.value }}
      </p>
    </doc-section>

    <doc-section
      id="group"
      title="Grupo (lista de valores)"
      description="Si el modelo enlazado es un array, cada checkbox añade o quita su value."
      [code]="groupCode"
      [codeTs]="groupTs"
    >
      <div style="display: grid; gap: 0.5rem">
        <cb-checkbox [formControl]="gustos" value="cafe" label="Café" />
        <cb-checkbox [formControl]="gustos" value="te" label="Té" />
        <cb-checkbox [formControl]="gustos" value="mate" label="Mate" />
      </div>
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Seleccionados: {{ gustos.value.join(', ') || '—' }}
      </p>
    </doc-section>

    <doc-section
      id="indeterminate"
      title="Indeterminado"
      description="Estado visual intermedio (aria-checked=&quot;mixed&quot;) para selecciones parciales."
      [code]="indeterminateCode"
    >
      <cb-checkbox [indeterminate]="true" label="Seleccionar todo" />
    </doc-section>

    <doc-section
      id="sizes"
      title="Sizes"
      description="sm, md (por defecto) y lg."
      [code]="sizesCode"
    >
      <div style="display: grid; gap: 0.5rem">
        <cb-checkbox size="sm" label="Small" [value]="true" />
        <cb-checkbox size="md" label="Medium" [value]="true" />
        <cb-checkbox size="lg" label="Large" [value]="true" />
      </div>
    </doc-section>

    <doc-section
      id="states"
      title="Inválido y deshabilitado"
      [code]="statesCode"
    >
      <div style="display: grid; gap: 0.5rem">
        <cb-checkbox [invalid]="true" label="Campo requerido" />
        <cb-checkbox [disabled]="true" label="Deshabilitado" />
      </div>
    </doc-section>
  `,
})
export class CheckboxDocComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly acepto = new FormControl(false, { nonNullable: true });
  protected readonly gustos = new FormControl<string[]>(['cafe'], { nonNullable: true });

  protected readonly installCode = `npm install @caribeng/ui`;

  protected readonly importCode = `import { CbCheckboxComponent } from '@caribeng/ui/checkbox';

@Component({
  imports: [CbCheckboxComponent],
  // ...
})
export class MyComponent {}`;

  protected readonly basicCode = `<cb-checkbox [formControl]="acepto" label="Acepto los términos y condiciones" />`;
  protected readonly basicTs = `acepto = new FormControl(false, { nonNullable: true });`;

  protected readonly groupCode = `<cb-checkbox [formControl]="gustos" value="cafe" label="Café" />
<cb-checkbox [formControl]="gustos" value="te" label="Té" />
<cb-checkbox [formControl]="gustos" value="mate" label="Mate" />`;
  protected readonly groupTs = `// El modelo es un array → modo lista
gustos = new FormControl<string[]>(['cafe'], { nonNullable: true });`;

  protected readonly indeterminateCode = `<cb-checkbox [indeterminate]="true" label="Seleccionar todo" />`;

  protected readonly sizesCode = `<cb-checkbox size="sm" label="Small" />
<cb-checkbox size="md" label="Medium" />
<cb-checkbox size="lg" label="Large" />`;

  protected readonly statesCode = `<cb-checkbox [invalid]="true" label="Campo requerido" />
<cb-checkbox [disabled]="true" label="Deshabilitado" />`;
}
