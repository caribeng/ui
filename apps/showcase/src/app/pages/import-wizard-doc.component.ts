import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { CbImportWizard, type CbImportField, type CbImportResult } from '@caribeng/ui/import-wizard';
import { cbDownloadXlsx } from '@caribeng/ui/xlsx';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-import-wizard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbImportWizard, CbButton, CbIcon, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Contabilidad"
      title="Import Wizard"
      lead="Asistente de importación: un archivo de Excel o CSV (o datos pegados), la asignación de columnas y una revisión con validación fila a fila antes de importar terceros, saldos iniciales o extractos."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="parties"
      title="Importar terceros"
      description="fields define los campos de destino: tipo (text, number, date, boolean), required, aliases para asignar solas las columnas y validate para reglas propias (aquí, el NIT solo con números). Descarga la plantilla, cámbiala en Excel (o pega filas desde una hoja de cálculo) y súbela: se interpretan importes como $ 1.234,56 o (1.234), fechas DD/MM/AAAA y Sí / No. En la revisión, las celdas con error se marcan y se importan solo las filas válidas."
      [code]="partiesCode"
    >
      <div style="display: grid; gap: 1rem; width: 100%">
        <div>
          <cb-button size="sm" variant="outlined" (click)="plantilla()">
            <cb-icon name="download" [size]="15" aria-hidden="true" />
            Descargar plantilla de ejemplo
          </cb-button>
        </div>
        <cb-import-wizard [fields]="campos" (import)="resultado.set($event)" />
        @if (resultado()) {
          <p class="iw-result" role="status">{{ resumen() }}</p>
        }
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .iw-result {
        margin: 0;
        padding: 0.6rem 0.85rem;
        border-radius: var(--cb-radius-md);
        background: var(--cb-color-surface-subtle);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class ImportWizardDocComponent {
  protected readonly docApi = DOC_API['cb-import-wizard'];
  protected readonly a11y = DOC_A11Y['cb-import-wizard'];

  protected readonly campos: CbImportField[] = [
    { key: 'nit', label: 'NIT', required: true, aliases: ['documento', 'identificacion', 'cedula'], validate: (v) => (/^\d{5,12}$/.test(String(v ?? '')) ? null : 'Solo números, sin puntos ni dígito de verificación.') },
    { key: 'nombre', label: 'Razón social', required: true, aliases: ['nombre', 'cliente', 'proveedor'] },
    { key: 'ciudad', label: 'Ciudad', aliases: ['municipio'] },
    { key: 'saldo', label: 'Saldo inicial', type: 'number', aliases: ['saldo', 'valor'] },
    { key: 'fecha', label: 'Fecha del saldo', type: 'date', aliases: ['fecha', 'corte'] },
    { key: 'activo', label: 'Activo', type: 'boolean' },
  ];

  protected readonly resultado = signal<CbImportResult | null>(null);
  protected readonly resumen = computed(() => {
    const r = this.resultado();
    return r ? `Importadas ${r.rows.length} filas${r.skipped ? `; descartadas ${r.skipped} con errores` : ''}.` : '';
  });

  /** Plantilla con algunas filas correctas y otras con errores para probar la revisión. */
  protected plantilla(): void {
    cbDownloadXlsx('plantilla-terceros', {
      name: 'Terceros',
      columns: [{ header: 'Documento' }, { header: 'Nombre' }, { header: 'Ciudad' }, { header: 'Saldo', type: 'number' }, { header: 'Fecha', type: 'date' }, { header: 'Activo' }],
      rows: [
        ['901234567', 'Distribuidora El Caribe S.A.S.', 'Barranquilla', 3250000, new Date(2026, 9, 31), 'Sí'],
        ['52876543', 'Ana Ruiz Mendoza', 'Cartagena', 450000, new Date(2026, 9, 31), 'Sí'],
        ['890.900.608', 'Supermercados La 14', 'Cali', 980000, new Date(2026, 9, 31), 'Sí'],
        ['', 'Ferretería sin NIT', 'Santa Marta', 1360000, new Date(2026, 9, 31), 'No'],
        ['800123456', 'Hotel Las Américas', 'Cartagena', -120000, new Date(2026, 9, 31), 'Sí'],
      ],
    });
  }

  protected readonly importCode = `import { CbImportWizard, type CbImportField, type CbImportResult } from '@caribeng/ui/import-wizard';`;
  protected readonly partiesCode = `<div style="display: grid; gap: 1rem; width: 100%">
  <div>
    <cb-button size="sm" variant="outlined" (click)="plantilla()">
      <cb-icon name="download" [size]="15" aria-hidden="true" />
      Descargar plantilla de ejemplo
    </cb-button>
  </div>
  <cb-import-wizard [fields]="campos" (import)="resultado.set($event)" />
  @if (resultado()) {
    <p class="iw-result" role="status">{{ resumen() }}</p>
  }
</div>`;

  constructor() {
    inject(TocService).reset();
  }
}
