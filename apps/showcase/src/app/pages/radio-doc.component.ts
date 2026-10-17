import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CbRadioComponent, CbRadioGroupComponent } from '@caribeng/ui/radio';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-radio-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CbRadioGroupComponent,
    CbRadioComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Form"
      title="Radio"
      lead="Selección única con un grupo (CbRadioGroup) que actúa como ControlValueAccessor."
    />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Basic"
      description="Coloca varios cb-radio dentro de un cb-radio-group. Navega con las flechas."
      [code]="basicCode"
      [codeTs]="basicTs"
    >
      <cb-radio-group [formControl]="plan" ariaLabel="Plan">
        <cb-radio value="free" label="Gratis" />
        <cb-radio value="pro" label="Pro" />
        <cb-radio value="team" label="Equipo" />
      </cb-radio-group>
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Valor: {{ plan.value }}
      </p>
    </doc-section>

    <doc-section
      id="horizontal"
      title="Horizontal"
      description="orientation=&quot;horizontal&quot; dispone los items en fila."
      [code]="horizontalCode"
    >
      <cb-radio-group [formControl]="envio" orientation="horizontal" ariaLabel="Envío">
        <cb-radio value="normal" label="Normal" />
        <cb-radio value="express" label="Express" />
      </cb-radio-group>
    </doc-section>

    <doc-section
      id="sizes"
      title="Sizes"
      description="El tamaño se define en el grupo y lo heredan los items."
      [code]="sizesCode"
    >
      <div style="display: grid; gap: 1rem">
        <cb-radio-group size="sm" [formControl]="sizeSm" ariaLabel="Small">
          <cb-radio value="a" label="Small A" />
          <cb-radio value="b" label="Small B" />
        </cb-radio-group>
        <cb-radio-group size="lg" [formControl]="sizeLg" ariaLabel="Large">
          <cb-radio value="a" label="Large A" />
          <cb-radio value="b" label="Large B" />
        </cb-radio-group>
      </div>
    </doc-section>

    <doc-section
      id="disabled"
      title="Deshabilitado"
      description="Deshabilita todo el grupo o un item concreto."
      [code]="disabledCode"
    >
      <cb-radio-group [formControl]="deshabilitado" ariaLabel="Grupo deshabilitado">
        <cb-radio value="a" label="Opción A" />
        <cb-radio value="b" label="Opción B" />
      </cb-radio-group>
    </doc-section>
  `,
})
export class RadioDocComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly plan = new FormControl('pro', { nonNullable: true });
  protected readonly envio = new FormControl('normal', { nonNullable: true });
  protected readonly sizeSm = new FormControl('a', { nonNullable: true });
  protected readonly sizeLg = new FormControl('a', { nonNullable: true });
  protected readonly deshabilitado = new FormControl(
    { value: 'a', disabled: true },
    { nonNullable: true },
  );

  protected readonly installCode = `npm install @caribeng/ui`;

  protected readonly importCode = `import { CbRadioGroupComponent, CbRadioComponent } from '@caribeng/ui/radio';

@Component({
  imports: [CbRadioGroupComponent, CbRadioComponent],
  // ...
})
export class MyComponent {}`;

  protected readonly basicCode = `<cb-radio-group [formControl]="plan" ariaLabel="Plan">
  <cb-radio value="free" label="Gratis" />
  <cb-radio value="pro" label="Pro" />
  <cb-radio value="team" label="Equipo" />
</cb-radio-group>`;
  protected readonly basicTs = `plan = new FormControl('pro', { nonNullable: true });`;

  protected readonly horizontalCode = `<cb-radio-group [formControl]="envio" orientation="horizontal" ariaLabel="Envío">
  <cb-radio value="normal" label="Normal" />
  <cb-radio value="express" label="Express" />
</cb-radio-group>`;

  protected readonly sizesCode = `<cb-radio-group size="sm" ariaLabel="Small"> … </cb-radio-group>
<cb-radio-group size="lg" ariaLabel="Large"> … </cb-radio-group>`;

  protected readonly disabledCode = `<!-- Todo el grupo: deshabilita el control (o usa [disabled]="true" sin Forms) -->
<cb-radio-group [formControl]="deshabilitado" ariaLabel="Grupo deshabilitado">
  <cb-radio value="a" label="Opción A" />
  <cb-radio value="b" label="Opción B" />
</cb-radio-group>

<!-- deshabilitado = new FormControl({ value: 'a', disabled: true }); -->`;
}
