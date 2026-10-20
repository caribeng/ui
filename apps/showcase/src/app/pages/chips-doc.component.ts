import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbChips } from '@caribeng/ui/chips';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-chips-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    ReactiveFormsModule,
    CbChips,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Formulario"
      title="Chips"
      lead="Entrada de etiquetas: Enter o coma añade; Backspace borra la última. ControlValueAccessor (string[])."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Escribe y pulsa Enter (o coma) para crear una etiqueta." [code]="basicCode">
      <div style="max-width: 420px">
        <cb-chips [(value)]="tags" placeholder="Añade una etiqueta…" />
      </div>
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        {{ tags().length }} etiqueta(s): {{ tags().join(', ') || '—' }}
      </p>
    </doc-section>

    <doc-section id="max" title="Máximo y sin duplicados" description="max limita la cantidad; por defecto no se permiten repetidos." [code]="maxCode">
      <div style="max-width: 420px">
        <cb-chips [(value)]="limitadas" [max]="3" placeholder="Hasta 3…" />
      </div>
    </doc-section>

    <doc-section id="validation" title="Validación · Reactive Forms" description="Funciona con formControl; usa invalid para reflejar el estado de validación." [code]="validationCode" [codeTs]="validationTs">
      <div style="max-width: 420px">
        <cb-chips
          [formControl]="skills"
          placeholder="Añade al menos una skill"
          [invalid]="skills.invalid && skills.touched"
        />
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class ChipsDocComponent {
  protected readonly docApi = DOC_API['cb-chips'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly tags = signal<string[]>(['angular', 'signals']);
  protected readonly limitadas = signal<string[]>([]);
  protected readonly skills = new FormControl<string[]>([], {
    nonNullable: true,
    validators: [Validators.required, (c) => (c.value?.length ? null : { required: true })],
  });

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbChips } from '@caribeng/ui/chips';`;
  protected readonly basicCode = `<cb-chips [(value)]="tags" placeholder="Añade una etiqueta…" />`;
  protected readonly maxCode = `<cb-chips [(value)]="tags" [max]="3" [allowDuplicate]="false" />`;
  protected readonly validationCode = `<cb-chips
  [formControl]="skills"
  [invalid]="skills.invalid && skills.touched" />`;
  protected readonly validationTs = `skills = new FormControl<string[]>([], { nonNullable: true,
  validators: [c => c.value?.length ? null : { required: true }] });`;
}
