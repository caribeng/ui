import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbFieldsetComponent } from '@caribeng/ui/fieldset';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-fieldset-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbFieldsetComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Panel"
      title="Fieldset"
      lead="Agrupador semántico basado en <fieldset> y <legend> con modo colapsable opcional."
    />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" [code]="basicCode">
      <cb-fieldset legend="Información general" style="width: 100%">
        <p style="margin: 0">
          Agrupa controles o metadatos relacionados utilizando elementos nativos accesibles.
        </p>
      </cb-fieldset>
    </doc-section>

    <doc-section
      id="toggleable"
      title="Colapsable"
      description="Con toggleable la leyenda se convierte en un botón accesible con indicador visual."
      [code]="toggleableCode"
    >
      <cb-fieldset legend="Preferencias avanzadas" toggleable style="width: 100%">
        <p style="margin: 0">
          Puedes contraer o expandir esta sección pulsando sobre la leyenda o usando Enter/Espacio.
        </p>
      </cb-fieldset>
    </doc-section>
  `,
})
export class FieldsetDocComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbFieldsetComponent } from '@caribeng/ui/fieldset';`;
  protected readonly basicCode = `<cb-fieldset legend="Información general">
  <p>Contenido agrupado…</p>
</cb-fieldset>`;
  protected readonly toggleableCode = `<cb-fieldset legend="Preferencias avanzadas" toggleable>
  <p>Contenido colapsable…</p>
</cb-fieldset>`;
}
