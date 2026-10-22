import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbCopy, CbCopyButton } from '@caribeng/ui/copy-button';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-copy-button-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbCopyButton, CbCopy, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Button"
      title="CopyButton"
      lead="Copia un texto al portapapeles y confirma con un ✓. Incluye la directiva cbCopy para cualquier elemento y el servicio CbClipboard para copiar desde código."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Botón de solo icono junto al dato. Al copiar muestra ✓ durante timeout milisegundos y lo anuncia a los lectores de pantalla." [code]="basicCode">
      <div class="cpy-row">
        <span class="cpy-label">Cuenta de ahorros</span>
        <code class="cpy-value">0012 3456 7890</code>
        <cb-copy-button value="001234567890" />
      </div>
    </doc-section>

    <doc-section id="label" title="Con texto" description="showLabel muestra &quot;Copiar&quot; / &quot;Copiado&quot;; label y copiedLabel cambian los textos." [code]="labelCode">
      <div class="cpy-row">
        <code class="cpy-value">sk_test_51H8x…f2Q</code>
        <cb-copy-button value="sk_test_51H8xexamplef2Q" showLabel variant="outlined" />
        <cb-copy-button value="https://caribeng.dev/invite/48213" showLabel label="Copiar enlace" copiedLabel="¡Enlace copiado!" />
      </div>
    </doc-section>

    <doc-section id="directive" title="Directiva cbCopy" description="Copia al pulsar cualquier elemento propio; reacciona a copied o copyError." [code]="directiveCode">
      <div class="cpy-row">
        <button type="button" class="cpy-chip" [cbCopy]="'CARIBE-2026'" (copied)="last.set($event)">Código: CARIBE-2026</button>
        <span class="cpy-label">Último copiado: {{ last() }}</span>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .cpy-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
      }
      .cpy-label {
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
      .cpy-value {
        font-family: var(--cb-font-mono);
        font-size: 0.95rem;
      }
      .cpy-chip {
        padding: 0.35rem 0.75rem;
        border: 1px dashed var(--cb-color-border-strong);
        border-radius: var(--cb-radius-full);
        background: var(--cb-color-surface);
        color: var(--cb-color-text);
        font: inherit;
        cursor: pointer;
      }
      .cpy-chip:focus-visible {
        outline: 2px solid var(--cb-color-focus-ring);
        outline-offset: 2px;
      }
    `,
  ],
})
export class CopyButtonDocComponent {
  protected readonly docApi = DOC_API['cb-copy-button'];
  protected readonly a11y = DOC_A11Y['cb-copy-button'];
  protected readonly last = signal('—');

  protected readonly importCode = `import { CbCopyButton, CbCopy, CbClipboard } from '@caribeng/ui/copy-button';`;
  protected readonly basicCode = `<code>0012 3456 7890</code>
<cb-copy-button value="001234567890" />`;
  protected readonly labelCode = `<cb-copy-button [value]="apiKey" showLabel variant="outlined" />
<cb-copy-button [value]="enlace" showLabel label="Copiar enlace" copiedLabel="¡Enlace copiado!" />`;
  protected readonly directiveCode = `<button type="button" [cbCopy]="'CARIBE-2026'" (copied)="avisar($event)">
  Código: CARIBE-2026
</button>

// Desde código:
const ok = await inject(CbClipboard).copy(texto);`;

  constructor() {
    inject(TocService).reset();
  }
}
