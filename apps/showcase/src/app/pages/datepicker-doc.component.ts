import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbDatepicker, type CbDateRange } from '@caribeng/ui/datepicker';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

@Component({
  selector: 'doc-datepicker-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, 
    ReactiveFormsModule,
    CbDatepicker,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Formulario"
      title="DatePicker"
      lead="Selector de fecha con calendario en overlay, navegación por teclado y ControlValueAccessor."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
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
      id="date-range"
      title="Rango de fechas"
      description="selectionMode=&quot;range&quot;: el primer clic marca el inicio y el segundo el fin (se ordenan solos). [(range)] es [inicio, fin]."
      [code]="dateRangeCode"
      [codeTs]="dateRangeTs"
    >
      <div style="width: 100%; max-width: 320px">
        <cb-datepicker selectionMode="range" [(range)]="viaje" label="Fechas del viaje" placeholder="Inicio – fin" />
      </div>
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">Noches: {{ noches() }}</p>
    </doc-section>

    <doc-section
      id="time"
      title="Con hora"
      description="showTime añade horas y minutos; hourFormat=&quot;12&quot; usa AM/PM y stepMinute el paso de los minutos. Elegir un día no cierra el calendario."
      [code]="timeCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%; max-width: 280px">
        <cb-datepicker showTime [(value)]="cita24" label="Cita (24 h)" />
        <cb-datepicker showTime hourFormat="12" [stepMinute]="15" [(value)]="cita12" label="Cita (12 h)" />
      </div>
    </doc-section>

    <doc-section
      id="validation"
      title="Validación · Reactive Forms"
      description="Con formControl y Validators.required, el * y el mensaje de error aparecen solos; minDate limita las fechas anteriores."
      [code]="validationCode"
      [codeTs]="validationTs"
    >
      <div style="width: 100%; max-width: 280px">
        <cb-datepicker
          [formControl]="cita"
          label="Fecha de la cita"
          placeholder="Selecciona una fecha"
          [minDate]="hoy"
          error="La fecha es obligatoria."
        />
      </div>
    </doc-section>

    <doc-section id="disabled" title="Deshabilitado" description="disabled muestra el valor sin permitir cambiarlo." [code]="disabledCode">
      <div style="width: 100%; max-width: 280px">
        <cb-datepicker [disabled]="true" [value]="hoy" label="No editable" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class DatepickerDocComponent {
  protected readonly a11y = DOC_A11Y['cb-datepicker'];
  protected readonly docApi = DOC_API['cb-datepicker'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly hoy = new Date();
  protected readonly enTresSemanas = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);

  protected readonly fecha = signal<Date | null>(null);
  protected readonly fechaCo = signal<Date | null>(null);
  protected readonly fechaRango = signal<Date | null>(null);
  protected readonly viaje = signal<CbDateRange | null>(null);
  protected readonly cita24 = signal<Date | null>(null);
  protected readonly cita12 = signal<Date | null>(null);
  protected readonly noches = computed(() => {
    const v = this.viaje();
    if (!v?.[1]) return '—';
    return Math.round((v[1].getTime() - v[0].getTime()) / 86_400_000);
  });

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

  protected readonly dateRangeCode = `<cb-datepicker selectionMode="range" [(range)]="viaje" label="Fechas del viaje" placeholder="Inicio – fin" />
<p>Noches: {{ noches() }}</p>`;
  protected readonly dateRangeTs = `viaje = signal<CbDateRange | null>(null);
noches = computed(() => {
  const v = this.viaje();
  if (!v?.[1]) return '—';
  return Math.round((v[1].getTime() - v[0].getTime()) / 86_400_000);
});`;
  protected readonly timeCode = `<cb-datepicker showTime [(value)]="cita24" label="Cita (24 h)" />
<cb-datepicker showTime hourFormat="12" [stepMinute]="15" [(value)]="cita12" label="Cita (12 h)" />`;

  protected readonly validationCode = `<cb-datepicker
  [formControl]="cita"
  label="Fecha de la cita" [minDate]="hoy"
  error="La fecha es obligatoria." />`;
  protected readonly validationTs = `cita = new FormControl<Date | null>(null, [Validators.required]);`;

  protected readonly disabledCode = `<cb-datepicker [disabled]="true" [value]="hoy" label="No editable" />`;
}
