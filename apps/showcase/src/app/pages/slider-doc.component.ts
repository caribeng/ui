import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CbSlider, type CbSliderRange } from '@caribeng/ui/slider';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-slider-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, 
    ReactiveFormsModule,
    CbSlider,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Formulario"
      title="Slider"
      lead="Control deslizante con arrastre de puntero y teclado (flechas, PageUp/Down, Home/End). ControlValueAccessor."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Arrastra el thumb o usa las flechas." [code]="basicCode">
      <div style="width: 320px">
        <cb-slider [(value)]="volumen" ariaLabel="Volumen" />
      </div>
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Valor: {{ volumen() }}
      </p>
    </doc-section>

    <doc-section id="step" title="min / max / step" description="Acota el rango y el incremento." [code]="stepCode">
      <div style="width: 320px">
        <cb-slider [(value)]="temp" [min]="16" [max]="30" [step]="0.5" ariaLabel="Temperatura" />
      </div>
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        {{ temp() }} °C
      </p>
    </doc-section>

    <doc-section
      id="range"
      title="Rango"
      description="range añade un segundo tirador y [(rangeValue)] enlaza el par [mínimo, máximo]; los tiradores no se cruzan. valueFormat da formato al valor visible (showValue) y al que anuncia el lector de pantalla."
      [code]="rangeCode"
      [codeTs]="rangeTs"
    >
      <div style="display: grid; gap: 0.5rem; width: 100%; max-width: 420px">
        <cb-slider
          range
          [(rangeValue)]="precio"
          [min]="0"
          [max]="2000000"
          [step]="50000"
          showValue
          locale="es-CO"
          [valueFormat]="{ style: 'currency', currency: 'COP', maximumFractionDigits: 0 }"
          ariaLabel="Precio"
        />
        <p style="margin: 0; font-size: 0.875rem; color: var(--cb-color-text-muted)">Rango: {{ precio()[0] }} – {{ precio()[1] }}</p>
      </div>
    </doc-section>

    <doc-section id="sizes" title="Tamaños" description="Tres tamaños con size: sm, md (por defecto) y lg." [code]="sizesCode">
      <div style="display: flex; flex-direction: column; gap: 1rem; width: 320px">
        <cb-slider [(value)]="a" size="sm" ariaLabel="sm" />
        <cb-slider [(value)]="b" ariaLabel="md" />
        <cb-slider [(value)]="c" size="lg" ariaLabel="lg" />
      </div>
    </doc-section>

    <doc-section id="disabled" title="Deshabilitado · Reactive Forms" description="Al deshabilitar el FormControl, el slider se bloquea automáticamente." [code]="disabledCode" [codeTs]="disabledTs">
      <div style="width: 320px">
        <cb-slider [formControl]="bloqueado" ariaLabel="Deshabilitado" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class SliderDocComponent {
  protected readonly a11y = DOC_A11Y['cb-slider'];
  protected readonly docApi = DOC_API['cb-slider'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly volumen = signal(40);
  protected readonly precio = signal<CbSliderRange>([300000, 1200000]);
  protected readonly temp = signal(22);
  protected readonly a = signal(30);
  protected readonly b = signal(50);
  protected readonly c = signal(70);
  protected readonly bloqueado = new FormControl({ value: 60, disabled: true });

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbSlider } from '@caribeng/ui/slider';`;
  protected readonly rangeCode = `<cb-slider
  range
  [(rangeValue)]="precio"
  [min]="0"
  [max]="2000000"
  [step]="50000"
  showValue
  locale="es-CO"
  [valueFormat]="{ style: 'currency', currency: 'COP', maximumFractionDigits: 0 }"
  ariaLabel="Precio"
/>
<p>Rango: {{ precio()[0] }} – {{ precio()[1] }}</p>`;
  protected readonly rangeTs = `precio = signal<CbSliderRange>([300000, 1200000]);`;
  protected readonly basicCode = `<cb-slider [(value)]="volumen" ariaLabel="Volumen" />`;
  protected readonly stepCode = `<cb-slider [(value)]="temp" [min]="16" [max]="30" [step]="0.5" />`;
  protected readonly sizesCode = `<cb-slider [(value)]="a" size="sm" />
<cb-slider [(value)]="b" />
<cb-slider [(value)]="c" size="lg" />`;
  protected readonly disabledCode = `<cb-slider [formControl]="bloqueado" />`;
  protected readonly disabledTs = `bloqueado = new FormControl({ value: 60, disabled: true });`;
}
