import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbInputNumber } from '@caribeng/ui/input-number';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-input-number-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    ReactiveFormsModule,
    CbInputNumber,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Formulario"
      title="InputNumber"
      lead="Campo numérico con botones de paso, formato por locale/moneda y ControlValueAccessor."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="El modelo es number | null. Usa las flechas del teclado para subir/bajar."
      [code]="basicCode"
    >
      <div style="width: 100%; max-width: 240px">
        <cb-input-number [(value)]="cantidad" label="Cantidad" />
      </div>
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Valor: {{ cantidad() ?? '—' }}
      </p>
    </doc-section>

    <doc-section
      id="buttons"
      title="Botones y rango"
      description="showButtons añade el spinner; min/max/step acotan el valor."
      [code]="buttonsCode"
    >
      <div style="width: 100%; max-width: 240px">
        <cb-input-number [(value)]="stock" showButtons [min]="0" [max]="10" [step]="1" label="Stock (0–10)" />
      </div>
    </doc-section>

    <doc-section
      id="currency"
      title="Moneda"
      description="mode=&quot;currency&quot; con el código ISO y el locale deseados."
      [code]="currencyCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%; max-width: 280px">
        <cb-input-number [(value)]="precioCo" mode="currency" currency="COP" locale="es-CO" [min]="0" label="Precio (COP)" />
        <cb-input-number [(value)]="precioUs" mode="currency" currency="USD" locale="en-US" [min]="0" label="Price (USD)" />
      </div>
    </doc-section>

    <doc-section
      id="decimals"
      title="Decimales y sufijo"
      description="Controla los decimales y añade prefijo/sufijo visual."
      [code]="decimalsCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%; max-width: 240px">
        <cb-input-number [(value)]="temp" [minFractionDigits]="1" [maxFractionDigits]="2" suffix=" °C" label="Temperatura" />
        <cb-input-number [(value)]="pct" [min]="0" [max]="100" suffix=" %" label="Porcentaje" />
      </div>
    </doc-section>

    <doc-section
      id="validation"
      title="Validación · Reactive Forms"
      description="Con formControl, min, max y required se valida el rango; error muestra el mensaje."
      [code]="validationCode"
      [codeTs]="validationTs"
    >
      <div style="width: 100%; max-width: 240px">
        <cb-input-number
          [formControl]="edad"
          label="Edad"
          [min]="0"
          [max]="120"
          [required]="true"
          [invalid]="edad.invalid && edad.touched"
          error="Ingresa una edad válida (18+)."
        />
      </div>
    </doc-section>

    <doc-section id="disabled" title="Deshabilitado" description="disabled muestra el valor sin permitir editarlo, incluidos los botones." [code]="disabledCode">
      <div style="width: 100%; max-width: 240px">
        <cb-input-number [disabled]="true" [value]="42" showButtons label="No editable" />
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class InputNumberDocComponent {
  protected readonly docApi = DOC_API['cb-input-number'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly cantidad = signal<number | null>(1);
  protected readonly stock = signal<number | null>(3);
  protected readonly precioCo = signal<number | null>(1250000);
  protected readonly precioUs = signal<number | null>(1299.99);
  protected readonly temp = signal<number | null>(21.5);
  protected readonly pct = signal<number | null>(75);

  protected readonly edad = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(18),
  ]);

  protected readonly installCode = `npm install @caribeng/ui`;

  protected readonly importCode = `import { CbInputNumber } from '@caribeng/ui/input-number';

@Component({
  imports: [CbInputNumber],
  // ...
})
export class MyComponent {}`;

  protected readonly basicCode = `<cb-input-number [(value)]="cantidad" label="Cantidad" />`;

  protected readonly buttonsCode = `<cb-input-number [(value)]="stock" showButtons
  [min]="0" [max]="10" [step]="1" label="Stock (0–10)" />`;

  protected readonly currencyCode = `<cb-input-number mode="currency" currency="COP" locale="es-CO" [min]="0" label="Precio (COP)" />
<cb-input-number mode="currency" currency="USD" locale="en-US" [min]="0" label="Price (USD)" />`;

  protected readonly decimalsCode = `<cb-input-number [minFractionDigits]="1" [maxFractionDigits]="2" suffix=" °C" />
<cb-input-number [min]="0" [max]="100" suffix=" %" />`;

  protected readonly validationCode = `<cb-input-number
  [formControl]="edad"
  label="Edad" [min]="0" [max]="120" [required]="true"
  [invalid]="edad.invalid && edad.touched"
  error="Ingresa una edad válida (18+)." />`;
  protected readonly validationTs = `edad = new FormControl<number | null>(null, [
  Validators.required, Validators.min(18),
]);`;

  protected readonly disabledCode = `<cb-input-number [disabled]="true" [value]="42" showButtons label="No editable" />`;
}
