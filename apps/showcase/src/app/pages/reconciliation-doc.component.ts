import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbReconciliation, type CbReconItem, type CbReconMatch } from '@caribeng/ui/reconciliation';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { EXTRACTO, LIBROS } from '../data/puc';

@Component({
  selector: 'doc-reconciliation-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbReconciliation, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Contabilidad"
      title="Reconciliation"
      lead="Conciliación bancaria: el extracto del banco frente a los movimientos en libros, con emparejamiento automático por valor y fecha, emparejamiento manual y lo que queda pendiente de cada lado."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="bank"
      title="Conciliación de octubre"
      description="Conciliar automáticamente empareja los movimientos de igual valor con hasta toleranceDays días de diferencia (3 por defecto), primero los de la misma referencia. Después marca de cada lado lo que corresponde (la transferencia de La 14 cubre dos abonos en libros) y Emparejar los une cuando las sumas coinciden; la diferencia se ve mientras eliges. Las comisiones del banco no están en libros: Crear asiento emite createEntry para registrarlas. matches guarda los emparejamientos (bidireccional)."
      [code]="bankCode"
    >
      <div style="display: grid; gap: 0.5rem; width: 100%">
        <cb-reconciliation statementLabel="Extracto Banco de Bogotá" ledgerLabel="Libros · 111005" [statement]="extracto" [ledger]="libros" [(matches)]="conciliados" allowCreate (createEntry)="crear.set($event.description)" />
        <p class="rc-log">{{ crear() ? 'Crear asiento para «' + crear() + '»' : conciliados().length + ' emparejamientos' }}</p>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .rc-log {
        margin: 0;
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class ReconciliationDocComponent {
  protected readonly docApi = DOC_API['cb-reconciliation'];
  protected readonly a11y = DOC_A11Y['cb-reconciliation'];

  protected readonly extracto: CbReconItem[] = EXTRACTO;
  protected readonly libros: CbReconItem[] = LIBROS;
  protected readonly conciliados = signal<readonly CbReconMatch[]>([]);
  protected readonly crear = signal('');

  protected readonly importCode = `import { CbReconciliation, type CbReconItem, type CbReconMatch } from '@caribeng/ui/reconciliation';`;
  protected readonly bankCode = `<div style="display: grid; gap: 0.5rem; width: 100%">
  <cb-reconciliation statementLabel="Extracto Banco de Bogotá" ledgerLabel="Libros · 111005" [statement]="extracto" [ledger]="libros" [(matches)]="conciliados" allowCreate (createEntry)="crear.set($event.description)" />
  <p class="rc-log">{{ crear() ? 'Crear asiento para «' + crear() + '»' : conciliados().length + ' emparejamientos' }}</p>
</div>`;

  constructor() {
    inject(TocService).reset();
  }
}
