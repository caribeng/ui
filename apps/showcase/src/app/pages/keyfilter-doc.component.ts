import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbKeyFilter } from '@caribeng/ui/keyfilter';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-keyfilter-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbKeyFilter, DocA11yComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Form" title="KeyFilter" lead="Directiva que limita los caracteres que se pueden escribir o pegar en un campo." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="presets"
      title="Filtros predefinidos"
      description="int, pint (enteros positivos), num, pnum, money, alpha, alphanum, hex y email. Filtra lo tecleado, lo pegado y lo autocompletado."
      [code]="presetsCode"
    >
      <div class="kf-grid">
        <label class="kf-field">Cédula (pint)<input class="kf-input" cbKeyFilter="pint" inputmode="numeric" /></label>
        <label class="kf-field">Valor (money)<input class="kf-input" cbKeyFilter="money" inputmode="decimal" /></label>
        <label class="kf-field">Nombre (alpha)<input class="kf-input" cbKeyFilter="alpha" /></label>
        <label class="kf-field">Correo (email)<input class="kf-input" cbKeyFilter="email" inputmode="email" /></label>
      </div>
    </doc-section>

    <doc-section
      id="regexp"
      title="Expresión propia"
      description="Una RegExp que debe cumplir cada carácter; aquí, placas en mayúsculas y números."
      [code]="regexpCode"
    >
      <label class="kf-field" style="max-width: 16rem">Placa<input class="kf-input" [cbKeyFilter]="placa" maxlength="6" /></label>
    </doc-section>

    <doc-section
      id="with-input"
      title="Con cb-input"
      description="En los componentes de CaribeNG aplícala al input nativo que proyectan, o usa sus propios filtros (InputNumber, InputMask)."
    >
      <doc-code-block [code]="noteCode" lang="markup" />
    </doc-section>

    <doc-a11y [data]="a11y" />
  `,
  styles: [
    `
      .kf-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        width: 100%;
      }
      .kf-field {
        display: grid;
        gap: 0.35rem;
        font-size: 0.875rem;
        color: var(--cb-color-text);
      }
      .kf-input {
        padding: 0.5rem 0.75rem;
        font: inherit;
        color: var(--cb-color-text);
        background: var(--cb-color-bg);
        border: 1px solid var(--cb-color-border-strong);
        border-radius: var(--cb-radius-md);
      }
      .kf-input:focus-visible {
        outline: 2px solid var(--cb-color-focus-ring);
        outline-offset: 1px;
      }
    `,
  ],
})
export class KeyfilterDocComponent {
  protected readonly a11y = DOC_A11Y['cbKeyFilter'];
  protected readonly placa = /[A-Z0-9]/;

  protected readonly importCode = `import { CbKeyFilter } from '@caribeng/ui/keyfilter';`;
  protected readonly presetsCode = `<label>Cédula (pint)<input cbKeyFilter="pint" inputmode="numeric" /></label>
<label>Valor (money)<input cbKeyFilter="money" inputmode="decimal" /></label>
<label>Nombre (alpha)<input cbKeyFilter="alpha" /></label>
<label>Correo (email)<input cbKeyFilter="email" inputmode="email" /></label>`;
  protected readonly regexpCode = `<label>Placa<input [cbKeyFilter]="placa" maxlength="6" /></label>

// placa = /[A-Z0-9]/;`;
  protected readonly noteCode = `<!-- KeyFilter funciona sobre <input> y <textarea> nativos -->
<input cbKeyFilter="pint" />`;

  constructor() {
    inject(TocService).reset();
  }
}
