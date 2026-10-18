import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbToggleButton } from '@caribeng/ui/togglebutton';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-togglebutton-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbToggleButton, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Form" title="ToggleButton" lead="Botón de dos estados (on/off) con etiqueta e icono por estado." />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Basic" [code]="basicCode">
      <cb-togglebutton [(value)]="activo" onLabel="Activado" offLabel="Desactivado" />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        {{ activo() ? 'on' : 'off' }}
      </p>
    </doc-section>

    <doc-section id="icons" title="Con iconos" [code]="iconsCode">
      <div style="display: flex; gap: 0.75rem; align-items: center">
        <cb-togglebutton [(value)]="wifi" onIcon="check" offIcon="x" onLabel="WiFi" offLabel="WiFi" />
        <cb-togglebutton [(value)]="fav" onIcon="heart" offIcon="heart" onLabel="Favorito" offLabel="Favorito" />
      </div>
    </doc-section>
  `,
})
export class TogglebuttonDocComponent {
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
