import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbKnob } from '@caribeng/ui/knob';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-knob-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbKnob, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Formulario" title="Knob" lead="Dial circular para elegir un número. Arrastre con el puntero o teclado." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Arrastra sobre el dial o usa las flechas." [code]="basicCode">
      <cb-knob [(value)]="volumen" suffix="%" ariaLabel="Volumen" />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Valor: {{ volumen() }}
      </p>
    </doc-section>

    <doc-section id="severities" title="Severidades y tamaños" description="severity cambia el color y size el diámetro en píxeles." [code]="sevCode">
      <div style="display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap">
        <cb-knob [(value)]="a" severity="success" [size]="80" suffix="%" ariaLabel="a" />
        <cb-knob [(value)]="b" severity="warning" suffix="%" ariaLabel="b" />
        <cb-knob [(value)]="c" severity="danger" [size]="120" suffix="%" ariaLabel="c" />
      </div>
    </doc-section>

    <doc-section id="range" title="Rango y paso" description="min/max/step a medida." [code]="rangeCode">
      <cb-knob [(value)]="temp" [min]="16" [max]="30" [step]="0.5" suffix="°" severity="info" ariaLabel="Temperatura" />
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class KnobDocComponent {
  protected readonly docApi = DOC_API['cb-knob'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly volumen = signal(60);
  protected readonly a = signal(75);
  protected readonly b = signal(40);
  protected readonly c = signal(90);
  protected readonly temp = signal(22);

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbKnob } from '@caribeng/ui/knob';`;
  protected readonly basicCode = `<cb-knob [(value)]="volumen" suffix="%" />`;
  protected readonly sevCode = `<cb-knob [(value)]="a" severity="success" [size]="80" />
<cb-knob [(value)]="b" severity="danger" [size]="120" />`;
  protected readonly rangeCode = `<cb-knob [(value)]="temp" [min]="16" [max]="30" [step]="0.5" suffix="°" />`;
}
