import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CbToggleComponent } from '@caribeng/toggle';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-toggle-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CbToggleComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Form"
      title="Toggle"
      lead="Switch booleano con ControlValueAccessor y role=&quot;switch&quot; para accesibilidad."
    />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Basic"
      description="Enlázalo con Angular Forms o two-way binding."
      [code]="basicCode"
      [codeTs]="basicTs"
    >
      <cb-toggle [formControl]="notificaciones" label="Recibir notificaciones" />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Estado: {{ notificaciones.value ? 'activado' : 'desactivado' }}
      </p>
    </doc-section>

    <doc-section
      id="sizes"
      title="Sizes"
      description="sm, md (por defecto) y lg."
      [code]="sizesCode"
    >
      <div style="display: grid; gap: 0.75rem">
        <cb-toggle size="sm" label="Small" />
        <cb-toggle size="md" label="Medium" />
        <cb-toggle size="lg" label="Large" />
      </div>
    </doc-section>

    <doc-section
      id="disabled"
      title="Deshabilitado"
      description="Respeta setDisabledState de Angular Forms."
      [code]="disabledCode"
    >
      <div style="display: grid; gap: 0.75rem">
        <cb-toggle [disabled]="true" label="Apagado y deshabilitado" />
        <cb-toggle [formControl]="encendidoFijo" label="Encendido y deshabilitado" />
      </div>
    </doc-section>
  `,
})
export class ToggleDocComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly notificaciones = new FormControl(true, { nonNullable: true });
  protected readonly encendidoFijo = new FormControl(
    { value: true, disabled: true },
    { nonNullable: true },
  );

  protected readonly installCode = `npm install @caribeng/core @caribeng/toggle`;

  protected readonly importCode = `import { CbToggleComponent } from '@caribeng/toggle';

@Component({
  imports: [CbToggleComponent],
  // ...
})
export class MyComponent {}`;

  protected readonly basicCode = `<cb-toggle [formControl]="notificaciones" label="Recibir notificaciones" />`;
  protected readonly basicTs = `notificaciones = new FormControl(true, { nonNullable: true });`;

  protected readonly sizesCode = `<cb-toggle size="sm" label="Small" />
<cb-toggle size="md" label="Medium" />
<cb-toggle size="lg" label="Large" />`;

  protected readonly disabledCode = `<!-- Sin Forms: usa [disabled]="true" -->
<cb-toggle [disabled]="true" label="Apagado y deshabilitado" />

<!-- Con Forms: deshabilita el control al crearlo -->
<cb-toggle [formControl]="encendidoFijo" label="Encendido y deshabilitado" />
<!-- encendidoFijo = new FormControl({ value: true, disabled: true }); -->`;
}
