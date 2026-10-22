import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbKbd } from '@caribeng/ui/kbd';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-kbd-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbKbd, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Misc" title="Kbd" lead="Teclas y atajos de teclado. Con keys adapta la combinación a la plataforma: ⌘ K en Mac y Ctrl + K en Windows y Linux." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Una tecla suelta como contenido." [code]="basicCode">
      <p class="kbd-demo">Pulsa <cb-kbd>Esc</cb-kbd> para cerrar o <cb-kbd>Tab</cb-kbd> para avanzar.</p>
    </doc-section>

    <doc-section
      id="combo"
      title="Combinaciones"
      description="keys acepta nombres (mod, shift, alt, ctrl, enter, backspace, esc, space, up, down, left, right) y texto libre. mod es ⌘ en Mac y Ctrl en el resto; con platform puedes forzar una."
      [code]="comboCode"
    >
      <div class="kbd-grid">
        <span>Buscar</span> <cb-kbd [keys]="['mod', 'K']" />
        <span>Guardar</span> <cb-kbd [keys]="['mod', 'S']" />
        <span>Deshacer</span> <cb-kbd [keys]="['mod', 'shift', 'Z']" />
        <span>Mac</span> <cb-kbd [keys]="['mod', 'alt', 'enter']" platform="mac" />
        <span>Windows / Linux</span> <cb-kbd [keys]="['mod', 'alt', 'enter']" platform="other" />
        <span>Pequeño</span> <cb-kbd [keys]="['up', 'down']" size="sm" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .kbd-demo {
        margin: 0;
      }
      .kbd-grid {
        display: grid;
        grid-template-columns: max-content max-content;
        gap: 0.75rem 1.5rem;
        align-items: center;
      }
    `,
  ],
})
export class KbdDocComponent {
  protected readonly docApi = DOC_API['cb-kbd'];
  protected readonly a11y = DOC_A11Y['cb-kbd'];

  protected readonly importCode = `import { CbKbd } from '@caribeng/ui/kbd';`;
  protected readonly basicCode = `<p>Pulsa <cb-kbd>Esc</cb-kbd> para cerrar.</p>`;
  protected readonly comboCode = `<cb-kbd [keys]="['mod', 'K']" />
<cb-kbd [keys]="['mod', 'shift', 'Z']" />
<cb-kbd [keys]="['mod', 'alt', 'enter']" platform="mac" />
<cb-kbd [keys]="['up', 'down']" size="sm" />`;

  constructor() {
    inject(TocService).reset();
  }
}
