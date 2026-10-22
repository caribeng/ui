import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbCodeBlock } from '@caribeng/ui/code-block';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-code-block-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbCodeBlock, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Misc"
      title="CodeBlock"
      lead="Bloque de código con resaltado de sintaxis propio y sin dependencias, botón de copiar, números de línea y líneas destacadas. Sigue el tema claro u oscuro."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="language elige el resaltado (ts, js, html, css, scss, json, bash, python, sql). La cabecera muestra el lenguaje y el botón de copiar." [code]="basicCode">
      <cb-code-block style="width: 100%" language="ts" [code]="tsSample" />
    </doc-section>

    <doc-section
      id="lines"
      title="Archivo, números y líneas destacadas"
      description="filename sustituye al lenguaje en la cabecera; lineNumbers numera desde startLine y highlightLines destaca líneas (&quot;3,5-6&quot; o [3, 5, 6])."
      [code]="linesCode"
    >
      <cb-code-block style="width: 100%" language="html" filename="transfer.component.html" [code]="htmlSample" lineNumbers highlightLines="3-4" />
    </doc-section>

    <doc-section id="languages" title="Más lenguajes" description="Un lenguaje no soportado se muestra como texto. wrap parte las líneas largas y maxHeight limita el alto con scroll." [code]="langsCode">
      <div class="cbd-grid">
        <cb-code-block language="bash" [code]="bashSample" />
        <cb-code-block language="json" [code]="jsonSample" />
        <cb-code-block language="css" [code]="cssSample" />
        <cb-code-block language="sql" [code]="sqlSample" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .cbd-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
        gap: 1rem;
        width: 100%;
      }
    `,
  ],
})
export class CodeBlockDocComponent {
  protected readonly docApi = DOC_API['cb-code-block'];
  protected readonly a11y = DOC_A11Y['cb-code-block'];

  protected readonly tsSample = `import { provideCaribeNG } from '@caribeng/ui';

// Configuración global de CaribeNG
export const appConfig: ApplicationConfig = {
  providers: [provideCaribeNG({ locale: 'es', preset: 'emerald' })],
};`;
  protected readonly htmlSample = `<form [formGroup]="form" (ngSubmit)="transferir()">
  <cb-phone-input label="Celular del destinatario" formControlName="celular" />
  <cb-input-number label="Valor" formControlName="valor" mode="currency" />
  <cb-button type="submit" [disabled]="form.invalid">Transferir</cb-button>
</form>`;
  protected readonly bashSample = `# Instalar CaribeNG
npm install @caribeng/ui --save
ng add @caribeng/ui`;
  protected readonly jsonSample = `{
  "cuenta": "4829",
  "saldo": 4250000,
  "activa": true
}`;
  protected readonly cssSample = `.saldo {
  color: var(--cb-color-success-700);
  font-size: 1.5rem;
}`;
  protected readonly sqlSample = `SELECT fecha, valor
FROM movimientos
WHERE cuenta = '4829'
ORDER BY fecha DESC;`;

  protected readonly importCode = `import { CbCodeBlock, cbHighlight } from '@caribeng/ui/code-block';`;
  protected readonly basicCode = `<cb-code-block language="ts" [code]="codigo" />`;
  protected readonly linesCode = `<cb-code-block language="html" filename="transfer.component.html"
  [code]="plantilla" lineNumbers highlightLines="3-4" />`;
  protected readonly langsCode = `<cb-code-block language="bash" [code]="instalar" />
<cb-code-block language="json" [code]="respuesta" wrap maxHeight="20rem" />`;

  constructor() {
    inject(TocService).reset();
  }
}
