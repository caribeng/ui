import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbToggleButton } from '@caribeng/ui/togglebutton';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-togglebutton-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, CbToggleButton, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Formulario" title="ToggleButton" lead="Botón de dos estados (on/off) con etiqueta e icono por estado." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="onLabel y offLabel definen el texto de cada estado; el valor se enlaza con [(value)]." [code]="basicCode">
      <cb-togglebutton [(value)]="activo" onLabel="Activado" offLabel="Desactivado" />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        {{ activo() ? 'on' : 'off' }}
      </p>
    </doc-section>

    <doc-section id="icons" title="Con iconos" description="onIcon y offIcon muestran un icono distinto según el estado." [code]="iconsCode">
      <div style="display: flex; gap: 0.75rem; align-items: center">
        <cb-togglebutton [(value)]="wifi" onIcon="check" offIcon="x" onLabel="WiFi" offLabel="WiFi" />
        <cb-togglebutton [(value)]="fav" onIcon="heart" offIcon="heart" onLabel="Favorito" offLabel="Favorito" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class TogglebuttonDocComponent {
  protected readonly a11y = DOC_A11Y['cb-togglebutton'];
  protected readonly docApi = DOC_API['cb-togglebutton'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly activo = signal(false);
  protected readonly wifi = signal(true);
  protected readonly fav = signal(false);

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbToggleButton } from '@caribeng/ui/togglebutton';`;
  protected readonly basicCode = `<cb-togglebutton [(value)]="activo" onLabel="Activado" offLabel="Desactivado" />`;
  protected readonly iconsCode = `<cb-togglebutton [(value)]="wifi" onIcon="check" offIcon="x" onLabel="WiFi" offLabel="WiFi" />`;
}
