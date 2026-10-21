import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbThemeToggle } from '@caribeng/ui/themetoggle';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-themetoggle-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbThemeToggle, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Misc" title="ThemeToggle" lead="Botón listo para usar que alterna entre tema claro y oscuro con CbThemeService." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="Cambia el tema de toda la aplicación (pruébalo: cambia también este sitio). Con provideCaribeNG({ persistTheme: true }) recuerda la elección."
      [code]="basicCode"
    >
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap">
        <cb-theme-toggle />
        <cb-theme-toggle showLabel size="sm" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class ThemetoggleDocComponent {
  protected readonly docApi = DOC_API['cb-theme-toggle'];
  protected readonly a11y = DOC_A11Y['cb-theme-toggle'];

  protected readonly importCode = `import { CbThemeToggle } from '@caribeng/ui/themetoggle';`;
  protected readonly basicCode = `<cb-theme-toggle />
<cb-theme-toggle showLabel size="sm" />`;

  constructor() {
    inject(TocService).reset();
  }
}
