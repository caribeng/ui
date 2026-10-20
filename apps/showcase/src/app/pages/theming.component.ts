import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CB_COLOR_PRESETS, CbColorPreset, CbThemeService } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-theming',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent, CbButton],
  template: `
    <doc-page-header
      eyebrow="Fundamentos"
      title="Theming"
      lead="El tema se controla con variables CSS --cb-*, presets de paleta en vivo y el atributo data-theme. Personaliza sin tocar la librería."
    />

    <doc-section id="presets" title="Presets de paleta en vivo">
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-bottom: 1rem">
        @for (p of presets; track p.id) {
          <cb-button
            size="sm"
            [variant]="theme.preset() === p.id ? 'solid' : 'outlined'"
            (click)="theme.setPreset(p.id)"
          >
            <span
              style="display: inline-block; width: 0.75rem; height: 0.75rem; border-radius: 999px; margin-right: 0.35rem"
              [style.background]="p.swatch"
            ></span>
            {{ p.label }}
          </cb-button>
        }
      </div>
      <doc-code-block [code]="presetCode" lang="typescript" />
    </doc-section>

    <doc-section id="dark" title="Modo oscuro">
      <doc-code-block [code]="darkCode" lang="typescript" />
    </doc-section>

    <doc-section id="tokens" title="Personalizar tokens">
      <doc-code-block [code]="tokensCode" lang="markup" />
    </doc-section>

    <doc-section id="service" title="CbThemeService">
      <doc-code-block [code]="serviceCode" lang="typescript" />
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
  styles: [`:host { display: block; }`],
})
export class ThemingComponent {
  protected readonly docApi = DOC_API['cb-button'];

  protected readonly theme = inject(CbThemeService);

  protected readonly presets: { id: CbColorPreset; label: string; swatch: string }[] = [
    { id: 'emerald', label: 'Emerald (Aura)', swatch: CB_COLOR_PRESETS.emerald[500] },
    { id: 'ocean', label: 'Ocean', swatch: CB_COLOR_PRESETS.ocean[500] },
    { id: 'coral', label: 'Coral', swatch: CB_COLOR_PRESETS.coral[500] },
    { id: 'amber', label: 'Amber', swatch: CB_COLOR_PRESETS.amber[500] },
    { id: 'violet', label: 'Violet', swatch: CB_COLOR_PRESETS.violet[500] },
    { id: 'rose', label: 'Rose', swatch: CB_COLOR_PRESETS.rose[500] },
  ];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly presetCode = `import { inject } from '@angular/core';
import { CbThemeService } from '@caribeng/ui';

const theme = inject(CbThemeService);
theme.setPreset('ocean'); // 'emerald' | 'ocean' | 'coral' | 'amber' | 'violet' | 'rose'`;

  protected readonly darkCode = `// Activa el tema oscuro con el atributo del elemento raíz:
// <html data-theme="dark">
// o desde el servicio:
import { CbThemeService } from '@caribeng/ui';

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
import { CbThemeService } from '@caribeng/ui';

@Component({ /* ... */ })
export class ThemeToggle {
  protected readonly theme = inject(CbThemeService);
  // theme.isDark() -> boolean (signal)
  // theme.preset() -> CbColorPreset (signal)
}`;
}
