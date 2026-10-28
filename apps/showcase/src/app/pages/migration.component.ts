import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'doc-migration',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Getting Started"
      title="{{ i18n.t('Migración desde PrimeNG', 'Migrate from PrimeNG') }}"
      lead="{{ i18n.t('Convierte un proyecto PrimeNG a CaribeNG con un schematic que reescribe imports, plantillas, estilos y el proveedor. Lo que no puede traducir con seguridad lo marca para revisión.', 'Convert a PrimeNG project to CaribeNG with a schematic that rewrites imports, templates, styles and the provider. Anything it cannot translate safely is flagged for review.') }}"
    />

    <section id="prereq" class="mig-block">
      <h2 class="mig-h2">{{ i18n.t('Requisitos', 'Prerequisites') }}</h2>
      <p class="mig-p">
        {{ i18n.t('El migrador admite PrimeNG 18 o superior y un proyecto Angular 22+ (Zone.js o zoneless).', 'The migrator supports PrimeNG 18+ and an Angular 22+ project (Zone.js or zoneless).') }}
      </p>
    </section>

    <section id="install" class="mig-block">
      <h2 class="mig-h2">{{ i18n.t('1. Instala CaribeNG', '1. Install CaribeNG') }}</h2>
      <doc-code-block [code]="installCode" lang="bash" />
    </section>

    <section id="run" class="mig-block">
      <h2 class="mig-h2">{{ i18n.t('2. Ejecuta la migración', '2. Run the migration') }}</h2>
      <p class="mig-p">
        {{ i18n.t('Genera la migración desde la raíz del proyecto:', 'Run the migration from the project root:') }}
      </p>
      <doc-code-block [code]="migrateCode" lang="bash" />
    </section>

    <section id="what" class="mig-block">
      <h2 class="mig-h2">{{ i18n.t('Qué migra', 'What it migrates') }}</h2>
      <ul class="mig-list">
        <li>{{ i18n.t('Imports de TypeScript: primeng/* → @caribeng/ui/* y renombres de símbolos.', 'TypeScript imports: primeng/* → @caribeng/ui/* with symbol renames.') }}</li>
        <li>{{ i18n.t('Plantillas: selectores p-* → cb-*, atributos adaptados e iconos pi pi-* → cb-icon.', 'Templates: p-* selectors → cb-*, adapted attributes and pi pi-* → cb-icon.') }}</li>
        <li>{{ i18n.t('Configuración: providePrimeNG() → provideCaribeNG() y estilos.', 'Configuration: providePrimeNG() → provideCaribeNG() and styles.') }}</li>
        <li>{{ i18n.t('package.json: quita primeng, primeicons y @primeuix/* cuando ya no quedan referencias.', 'package.json: removes primeng, primeicons and @primeuix/* once no references remain.') }}</li>
      </ul>
    </section>

    <section id="review" class="mig-block">
      <h2 class="mig-h2">{{ i18n.t('Revisa el informe', 'Review the report') }}</h2>
      <p class="mig-p">
        {{ i18n.t('La migración genera un informe con los puntos que necesitan una decisión:', 'The migration generates a report with the points that need a decision:') }}
      </p>
      <doc-code-block [code]="reportCode" lang="bash" />
      <p class="mig-p">
        {{ i18n.t('Los avisos TODO(caribeng) marcan componentes sin equivalente directo (p. ej. p-stepper, p-knob) o cambios estructurales (radios sueltos → cb-radio-group). Resuélvelos y compila.', 'The TODO(caribeng) notices mark components without a direct equivalent (e.g. p-stepper, p-knob) or structural changes (loose radios → cb-radio-group). Resolve them and build.') }}
      </p>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .mig-block { margin-bottom: var(--cb-space-8); }
      .mig-h2 {
        font-size: var(--cb-text-xl);
        font-weight: var(--cb-font-weight-semibold);
        color: var(--cb-color-text-strong);
        margin: 0 0 var(--cb-space-3);
      }
      .mig-p {
        color: var(--cb-color-text-muted);
        margin: 0 0 var(--cb-space-4);
      }
      .mig-list {
        color: var(--cb-color-text-muted);
        margin: 0 0 var(--cb-space-4);
        padding-left: var(--cb-space-5);
      }
      .mig-list li { margin-bottom: var(--cb-space-2); }
    `,
  ],
})
export class MigrationComponent {
  protected readonly i18n = inject(I18nService);

  constructor() {
    inject(TocService).reset();
  }

  protected readonly installCode = `ng add @caribeng/ui`;

  protected readonly migrateCode = `ng generate @caribeng/ui:migrate-from-primeng --skip-install`;

  protected readonly reportCode = `caribeng-migration-report.md
├── Archivos modificados
├── Avisos para revisar (TODO(caribeng))
└── Referencias a PrimeNG sin migrar`;
}
