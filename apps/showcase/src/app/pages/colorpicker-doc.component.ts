import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CbColorPicker } from '@caribeng/ui/colorpicker';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-colorpicker-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    ReactiveFormsModule,
    CbColorPicker,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Form"
      title="ColorPicker"
      lead="Selector de color en overlay: área saturación/valor, barra de matiz, hex y presets. ControlValueAccessor (hex)."
    />

    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Basic" description="El modelo es un color hex. Arrastra en el área y el matiz, o escribe el hex." [code]="basicCode">
      <cb-colorpicker [(value)]="color" />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Valor: {{ color() }}
      </p>
    </doc-section>

    <doc-section id="presets" title="Presets personalizados" description="presets define los colores rápidos; [] los oculta." [code]="presetsCode">
      <cb-colorpicker [(value)]="marca" [presets]="paleta" />
    </doc-section>

    <doc-section id="compact" title="Compacto" description="showValue oculta el texto del hex en el trigger." [code]="compactCode">
      <div style="display: flex; align-items: center; gap: 1rem">
        <cb-colorpicker [(value)]="c1" [showValue]="false" size="sm" />
        <cb-colorpicker [(value)]="c2" [showValue]="false" />
        <cb-colorpicker [(value)]="c3" [showValue]="false" size="lg" />
      </div>
    </doc-section>

    <doc-section id="disabled" title="Deshabilitado · Reactive Forms" [code]="disabledCode" [codeTs]="disabledTs">
      <cb-colorpicker [formControl]="bloqueado" />
    </doc-section>
  `,
})
export class ColorpickerDocComponent {
  protected readonly docApi = DOC_API['cb-colorpicker'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly color = signal('#10b981');
  protected readonly marca = signal('#6366f1');
  protected readonly c1 = signal('#ef4444');
  protected readonly c2 = signal('#f59e0b');
  protected readonly c3 = signal('#3b82f6');
  protected readonly bloqueado = new FormControl({ value: '#8b5cf6', disabled: true });

  protected readonly paleta = [
    '#0ea5e9', '#14b8a6', '#22c55e', '#eab308', '#f97316', '#e11d48',
  ];

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbColorPicker } from '@caribeng/ui/colorpicker';`;
  protected readonly basicCode = `<cb-colorpicker [(value)]="color" />`;
  protected readonly presetsCode = `<cb-colorpicker [(value)]="color" [presets]="['#0ea5e9', '#14b8a6', '#22c55e', '#eab308', '#f97316', '#e11d48']" />`;
  protected readonly compactCode = `<cb-colorpicker [(value)]="color" [showValue]="false" size="sm" />
<cb-colorpicker [(value)]="color" [showValue]="false" />
<cb-colorpicker [(value)]="color" [showValue]="false" size="lg" />`;
  protected readonly disabledCode = `<cb-colorpicker [formControl]="bloqueado" />`;
  protected readonly disabledTs = `bloqueado = new FormControl({ value: '#8b5cf6', disabled: true });`;
}
