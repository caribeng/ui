import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbDatepicker, type CbDatePreset, type CbDatePresetKey, type CbDateRange } from '@caribeng/ui/datepicker';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';
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
      lead="Selector de fecha, rango, mes o año con calendario en overlay, hora, formato configurable, escritura directa, navegación por teclado y ControlValueAccessor."
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
      description="selectionMode=&quot;range&quot;: el primer clic marca el inicio y el segundo el fin (se ordenan solos). [(range)] es [inicio, fin]. Muestra dos meses a la vez; numberOfMonths cambia cuántos."
      [code]="dateRangeCode"
      [codeTs]="dateRangeTs"
    >
      <div style="width: 100%; max-width: 360px">
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
      id="presets"
      title="Atajos"
      description="presets añade atajos junto al calendario: claves listas y traducidas (today, yesterday, last7Days, last30Days, thisMonth, lastMonth, thisYear, lastYear) u objetos { label, value } propios. El atajo aplicado queda marcado y los que caen fuera de minDate / maxDate se desactivan."
      [code]="presetsCode"
      [codeTs]="presetsTs"
    >
      <div style="width: 100%; max-width: 360px">
        <cb-datepicker selectionMode="range" [presets]="atajos" [maxDate]="hoy" [(range)]="periodoMovimientos" label="Periodo de movimientos" placeholder="Inicio – fin" />
      </div>
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        {{ i18n.t('Movimientos en el periodo', 'Transactions in the period') }}: {{ movimientosEnPeriodo() }}
      </p>
    </doc-section>

    <doc-section
      id="range-time"
      title="Rango con hora"
      description="Con showTime, un rango tiene hora de inicio y de fin; el calendario sigue abierto tras elegir el fin para ajustarlas."
      [code]="rangeTimeCode"
    >
      <div style="width: 100%; max-width: 360px">
        <cb-datepicker selectionMode="range" showTime [(range)]="turno" label="Turno" placeholder="Inicio – fin" />
      </div>
    </doc-section>

    <doc-section
      id="views"
      title="Mes o año"
      description="view=&quot;month&quot; elige un mes (el valor es el día 1) y view=&quot;year&quot; un año (el 1 de enero). En la vista de días, el título del mes también lleva a los meses y los años para saltar rápido."
      [code]="viewsCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%; max-width: 280px">
        <cb-datepicker view="month" dateFormat="mm/y" [(value)]="vencimiento" label="Vencimiento de la tarjeta" placeholder="mm/aa" />
        <cb-datepicker view="year" [(value)]="anio" label="Año fiscal" />
        <cb-datepicker view="month" selectionMode="range" [(range)]="periodo" label="Periodo del extracto" />
      </div>
    </doc-section>

    <doc-section
      id="format"
      title="Formato"
      description="dateFormat define cómo se escribe la fecha, con la misma sintaxis que PrimeNG. Sin él, el campo usa el formato largo del locale."
      [code]="formatCode"
    >
      <div style="display: grid; gap: 1rem; width: 100%">
        <div style="display: grid; gap: 0.75rem; max-width: 320px">
          <cb-datepicker dateFormat="dd/mm/yy" [(value)]="fechaFormato" label="dd/mm/yy" />
          <cb-datepicker dateFormat="DD d 'de' MM 'de' yy" [(value)]="fechaFormato" label="DD d 'de' MM 'de' yy" />
          <cb-datepicker dateFormat="yy-mm-dd" [(value)]="fechaFormato" label="yy-mm-dd (ISO)" />
        </div>
        <div class="dp-tokens">
          <table>
            <thead>
              <tr><th>{{ i18n.t('Símbolo', 'Token') }}</th><th>{{ i18n.t('Significado', 'Meaning') }}</th></tr>
            </thead>
            <tbody>
              @for (token of simbolos; track token.code) {
                <tr><td><code>{{ token.code }}</code></td><td>{{ i18n.auto(token.text) }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </doc-section>

    <doc-section
      id="editable"
      title="Escribir la fecha"
      description="editable permite teclear la fecha con dateFormat (o el formato numérico del locale); se aplica con Enter o al salir del campo, y si no es válida avisa del formato esperado. El calendario se abre con el botón o con la flecha abajo."
      [code]="editableCode"
    >
      <div style="width: 100%; max-width: 280px">
        <cb-datepicker editable dateFormat="dd/mm/yy" [maxDate]="hoy" [(value)]="nacimiento" label="Fecha de nacimiento" hint="Ejemplo: 24/07/1990" />
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
  styles: `
    .dp-tokens {
      max-width: 520px;
      overflow-x: auto;
    }
    .dp-tokens table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    .dp-tokens th,
    .dp-tokens td {
      padding: 0.4rem 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--cb-color-border);
    }
    .dp-tokens th {
      font-weight: 600;
      color: var(--cb-color-text-muted);
    }
  `,
})
export class DatepickerDocComponent {
  protected readonly i18n = inject(I18nService);
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

  protected readonly atajos: (CbDatePresetKey | CbDatePreset)[] = [
    'today',
    'yesterday',
    'last7Days',
    'last30Days',
    'thisMonth',
    'lastMonth',
    { label: 'Último corte (día 15)', value: () => this.ultimoCorte() },
  ];
  protected readonly periodoMovimientos = signal<CbDateRange | null>(null);
  /** 120 movimientos simulados, uno cada ~1,5 días hacia atrás desde hoy. */
  private readonly movimientos = Array.from({ length: 120 }, (_, i) => new Date(Date.now() - i * 1.5 * 86_400_000));
  protected readonly movimientosEnPeriodo = computed(() => {
    const periodo = this.periodoMovimientos();
    if (!periodo?.[1]) return '—';
    const fin = new Date(periodo[1].getFullYear(), periodo[1].getMonth(), periodo[1].getDate() + 1);
    return this.movimientos.filter((m) => m >= periodo[0] && m < fin).length;
  });
  /** Del día 16 del mes anterior al 15 de este (o del anterior si aún no llega). */
  private ultimoCorte(): CbDateRange {
    const hoy = new Date();
    const mes = hoy.getDate() >= 15 ? hoy.getMonth() : hoy.getMonth() - 1;
    return [new Date(hoy.getFullYear(), mes - 1, 16), new Date(hoy.getFullYear(), mes, 15)];
  }
  protected readonly turno = signal<CbDateRange | null>(null);
  protected readonly vencimiento = signal<Date | null>(null);
  protected readonly anio = signal<Date | null>(new Date(new Date().getFullYear(), 0, 1));
  protected readonly periodo = signal<CbDateRange | null>(null);
  protected readonly fechaFormato = signal<Date | null>(new Date());
  protected readonly nacimiento = signal<Date | null>(null);
  protected readonly simbolos = [
    { code: 'd / dd', text: 'Día del mes (sin cero / dos dígitos)' },
    { code: 'o / oo', text: 'Día del año (sin ceros / tres dígitos)' },
    { code: 'D / DD', text: 'Nombre del día (corto / largo)' },
    { code: 'm / mm', text: 'Mes (sin cero / dos dígitos)' },
    { code: 'M / MM', text: 'Nombre del mes (corto / largo)' },
    { code: 'y / yy', text: 'Año (dos / cuatro dígitos)' },
    { code: '@', text: 'Marca de tiempo Unix (ms desde 01/01/1970)' },
    { code: '!', text: 'Ticks de Windows (100 ns desde 01/01/0001)' },
    { code: "'…'", text: 'Texto literal' },
    { code: "''", text: 'Comilla simple' },
  ];

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

  protected readonly presetsCode = `<cb-datepicker
  selectionMode="range"
  [presets]="atajos"
  [maxDate]="hoy"
  [(range)]="periodo"
  label="Periodo de movimientos" />`;
  protected readonly presetsTs = `import type { CbDatePreset, CbDatePresetKey, CbDateRange } from '@caribeng/ui/datepicker';

atajos: (CbDatePresetKey | CbDatePreset)[] = [
  'today', 'yesterday', 'last7Days', 'last30Days', 'thisMonth', 'lastMonth',
  // Propio: la función se evalúa al abrir, así "hoy" siempre es hoy.
  { label: 'Último corte (día 15)', value: () => this.ultimoCorte() },
];`;
  protected readonly rangeTimeCode = `<cb-datepicker selectionMode="range" showTime [(range)]="turno" label="Turno" />`;
  protected readonly viewsCode = `<cb-datepicker view="month" dateFormat="mm/y" [(value)]="vencimiento" label="Vencimiento de la tarjeta" />
<cb-datepicker view="year" [(value)]="anio" label="Año fiscal" />
<cb-datepicker view="month" selectionMode="range" [(range)]="periodo" label="Periodo del extracto" />`;
  protected readonly formatCode = `<cb-datepicker dateFormat="dd/mm/yy" [(value)]="fecha" />
<cb-datepicker dateFormat="DD d 'de' MM 'de' yy" [(value)]="fecha" />
<cb-datepicker dateFormat="yy-mm-dd" [(value)]="fecha" />`;
  protected readonly editableCode = `<cb-datepicker
  editable
  dateFormat="dd/mm/yy"
  [maxDate]="hoy"
  [(value)]="nacimiento"
  label="Fecha de nacimiento"
  hint="Ejemplo: 24/07/1990" />`;

  protected readonly disabledCode = `<cb-datepicker [disabled]="true" [value]="hoy" label="No editable" />`;
}
