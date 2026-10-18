import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbDatepicker } from '@caribeng/ui/datepicker';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-datepicker-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    ReactiveFormsModule,
    CbDatepicker,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Form"
      title="DatePicker"
      lead="Selector de fecha con calendario en overlay, navegación por teclado y ControlValueAccessor."
    />

    <doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Basic"
      description="El modelo es Date | null. Abre con clic o teclado (↓/Enter) y navega con las flechas."
      [code]="basicCode"
    >
      <div style="width: 100%; max-width: 280px">
        <cb-datepicker [(value)]="fecha" label="Fecha" placeholder="dd/mm/aaaa" />
      </div>
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Valor: {{ fecha() ? fecha()!.toLocaleDateString() : '—' }}
      </p>
    </doc-section>

    <doc-section
      id="locale"
      title="Locale y primer día"
      description="locale cambia nombres/formato; firstDayOfWeek=1 inicia la semana en lunes."
      [code]="localeCode"
    >
      <div style="width: 100%; max-width: 280px">
        <cb-datepicker [(value)]="fechaCo" locale="es-CO" [firstDayOfWeek]="1" label="Fecha (es-CO, lun)" />
      </div>
    </doc-section>

    <doc-section
      id="range"
      title="Rango min/max"
      description="Deshabilita las fechas fuera de [minDate, maxDate]."
      [code]="rangeCode"
    >
      <div style="width: 100%; max-width: 280px">
        <cb-datepicker [(value)]="fechaRango" [minDate]="hoy" [maxDate]="enTresSemanas" label="Próximas 3 semanas" />
      </div>
    </doc-section>

    <doc-section
      id="validation"
      title="Validación · Reactive Forms"
      [code]="validationCode"
      [codeTs]="validationTs"
    >
      <div style="width: 100%; max-width: 280px">
        <cb-datepicker
          [formControl]="cita"
          label="Fecha de la cita"
          placeholder="Selecciona una fecha"
          [minDate]="hoy"
          [required]="true"
          [invalid]="cita.invalid && cita.touched"
          error="La fecha es obligatoria."
        />
      </div>
    </doc-section>

    <doc-section id="disabled" title="Disabled" [code]="disabledCode">
      <div style="width: 100%; max-width: 280px">
        <cb-datepicker [disabled]="true" [value]="hoy" label="No editable" />
      </div>
    </doc-section>
  `,
})
export class DatepickerDocComponent {
  protected readonly docApi = DOC_API['cb-datepicker'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly hoy = new Date();
  protected readonly enTresSemanas = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);

  protected readonly fecha = signal<Date | null>(null);
  protected readonly fechaCo = signal<Date | null>(null);
  protected readonly fechaRango = signal<Date | null>(null);

  protected readonly cita = new FormControl<Date | null>(null, [Validators.required]);

  protected readonly installCode = `npm install @caribeng/ui`;

  protected readonly importCode = `import { CbDatepicker } from '@caribeng/ui/datepicker';

@Component({
  imports: [CbDatepicker],
  // ...
})
export class MyComponent {}`;

  protected readonly basicCode = `<cb-datepicker [(value)]="fecha" label="Fecha" placeholder="dd/mm/aaaa" />`;

  protected readonly localeCode = `<cb-datepicker [(value)]="fecha" locale="es-CO" [firstDayOfWeek]="1" label="Fecha" />`;

  protected readonly rangeCode = `<cb-datepicker [(value)]="fecha"
  [minDate]="hoy" [maxDate]="enTresSemanas" label="Próximas 3 semanas" />`;

  protected readonly validationCode = `<cb-datepicker
  [formControl]="cita"
  label="Fecha de la cita" [minDate]="hoy" [required]="true"
  [invalid]="cita.invalid && cita.touched"
  error="La fecha es obligatoria." />`;
  protected readonly validationTs = `cita = new FormControl<Date | null>(null, [Validators.required]);`;

  protected readonly disabledCode = `<cb-datepicker [disabled]="true" [value]="hoy" label="No editable" />`;
}
