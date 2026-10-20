import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CbAutocomplete } from '@caribeng/ui/autocomplete';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';

const PAISES = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
  'Ecuador', 'El Salvador', 'España', 'Guatemala', 'Honduras', 'México',
  'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Portugal', 'Puerto Rico',
  'República Dominicana', 'Uruguay', 'Venezuela',
];

@Component({
  selector: 'doc-autocomplete-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, 
    ReactiveFormsModule,
    CbAutocomplete,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Formulario"
      title="Autocomplete"
      lead="Campo de texto con sugerencias en overlay. El filtrado lo resuelve tu app vía (complete)."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="Escribe para disparar (complete); actualiza suggestions con el resultado filtrado."
      [code]="basicCode"
      [codeTs]="basicTs"
    >
      <div style="width: 100%; max-width: 320px">
        <cb-autocomplete
          [(value)]="pais"
          [suggestions]="sugeridos()"
          placeholder="Escribe un país…"
          (complete)="buscar($event)"
        />
      </div>
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Valor: {{ pais() ?? '—' }}
      </p>
    </doc-section>

    <doc-section
      id="dropdown"
      title="Con botón desplegable"
      description="dropdown muestra un botón que despliega todas las sugerencias actuales."
      [code]="dropdownCode"
    >
      <div style="width: 100%; max-width: 320px">
        <cb-autocomplete
          [(value)]="pais2"
          [suggestions]="sugeridos2()"
          dropdown
          placeholder="Busca o despliega…"
          (complete)="buscar2($event)"
        />
      </div>
    </doc-section>

    <doc-section
      id="validation"
      title="Validación · Reactive Forms"
      description="forceSelection (por defecto) revierte el texto si no coincide con una opción."
      [code]="validationCode"
      [codeTs]="validationTs"
    >
      <div style="width: 100%; max-width: 320px">
        <cb-autocomplete
          [formControl]="paisCtrl"
          [suggestions]="sugeridos3()"
          label="País"
          placeholder="Elige un país"
          error="Selecciona un país de la lista."
          (complete)="buscar3($event)"
        />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />
  `,
})
export class AutocompleteDocComponent {
  protected readonly a11y = DOC_A11Y['cb-autocomplete'];
  constructor() {
    inject(TocService).reset();
  }

  protected readonly pais = signal<unknown>(null);
  protected readonly pais2 = signal<unknown>(null);
  protected readonly sugeridos = signal<string[]>([]);
  protected readonly sugeridos2 = signal<string[]>([]);
  protected readonly sugeridos3 = signal<string[]>([]);

  protected readonly paisCtrl = new FormControl<string | null>(null, {
    validators: (c) => (c.value ? null : { required: true }),
  });

  private filtrar(q: string): string[] {
    const t = q.trim().toLowerCase();
    if (!t) return PAISES.slice(0, 8);
    return PAISES.filter((p) => p.toLowerCase().includes(t));
  }

  protected buscar(q: string): void {
    this.sugeridos.set(this.filtrar(q));
  }
  protected buscar2(q: string): void {
    this.sugeridos2.set(this.filtrar(q));
  }
  protected buscar3(q: string): void {
    this.sugeridos3.set(this.filtrar(q));
  }

  protected readonly installCode = `npm install @caribeng/ui`;

  protected readonly importCode = `import { CbAutocomplete } from '@caribeng/ui/autocomplete';

@Component({
  imports: [CbAutocomplete],
  // ...
})
export class MyComponent {}`;

  protected readonly basicCode = `<cb-autocomplete
  [(value)]="pais"
  [suggestions]="sugeridos()"
  placeholder="Escribe un país…"
  (complete)="buscar($event)" />`;
  protected readonly basicTs = `sugeridos = signal<string[]>([]);

buscar(q: string) {
  const t = q.trim().toLowerCase();
  this.sugeridos.set(PAISES.filter(p => p.toLowerCase().includes(t)));
}`;

  protected readonly dropdownCode = `<cb-autocomplete
  [(value)]="pais"
  [suggestions]="sugeridos()"
  dropdown
  placeholder="Busca o despliega…"
  (complete)="buscar($event)" />`;

  protected readonly validationCode = `<cb-autocomplete
  [formControl]="paisCtrl"
  [suggestions]="sugeridos()"
  label="País"
  error="Selecciona un país de la lista."
  (complete)="buscar($event)" />`;
  protected readonly validationTs = `// forceSelection=true (por defecto): si el texto no coincide
// con una opción, al salir del campo se revierte al valor válido.`;
}
