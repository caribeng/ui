import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-theming',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Foundations"
      title="Theming"
      lead="El tema se controla con variables CSS --cb-* y el atributo data-theme. Personaliza sin tocar la librería."
    />

    <doc-section id="dark" title="Dark mode">
      <doc-code-block [code]="darkCode" lang="typescript" />
    </doc-section>

    <doc-section id="tokens" title="Personalizar tokens">
      <doc-code-block [code]="tokensCode" lang="markup" />
    </doc-section>

    <doc-section id="service" title="CbThemeService">
      <doc-code-block [code]="serviceCode" lang="typescript" />
    </doc-section>
  `,
  styles: [`:host { display: block; }`],
})
export class ThemingComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly darkCode = `// Activa el tema oscuro con el atributo del elemento raíz:
// <html data-theme="dark">
// o desde el servicio:
import { CbThemeService } from '@caribeng/core';

const theme = inject(CbThemeService);
theme.toggle();          // light <-> dark
theme.setTheme('dark');  // explícito
theme.isDark();          // signal computed`;

  protected readonly tokensCode = `<style>
  /* En el proyecto consumidor, sobrescribe cualquier token: */
  :root {
    --cb-color-primary-500: #ff6a00;
    --cb-radius-md: 4px;
  }
  :root[data-theme="dark"] {
    --cb-color-bg: #0a0a0a;
  }
</style>`;

  protected readonly serviceCode = `import { Component, inject } from '@angular/core';
import { CbThemeService } from '@caribeng/core';

@Component({ /* ... */ })
export class ThemeToggle {
  protected readonly theme = inject(CbThemeService);
  // theme.isDark() -> boolean (signal)
}`;
}
