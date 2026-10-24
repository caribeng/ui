import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbAuditLog, type CbAuditEntry } from '@caribeng/ui/audit-log';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

const PESOS = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

@Component({
  selector: 'doc-audit-log-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbAuditLog, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Contabilidad"
      title="Audit Log"
      lead="Visor de auditoría: el historial de quién creó, modificó, aprobó o eliminó cada registro y cuándo, con la diferencia antes y después de cada campo."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="history"
      title="Historial de un comprobante"
      description="entries son los registros (fecha, usuario, acción, registro, cambios y nota); se muestran por día, del más reciente al más antiguo. Los que tienen cambios se abren para ver Campo · Antes · Después. format da el texto de los valores (aquí, los importes en pesos) y actionLabels nombra acciones propias como aprobó o anuló. La búsqueda recorre usuarios, registros, notas y valores; Excel descarga lo filtrado."
      [code]="historyCode"
    >
      <cb-audit-log [entries]="historial" [format]="formato" [actionLabels]="{ approve: 'aprobó', void: 'anuló' }" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class AuditLogDocComponent {
  protected readonly docApi = DOC_API['cb-audit-log'];
  protected readonly a11y = DOC_A11Y['cb-audit-log'];

  protected readonly formato = (field: string, value: unknown) => (['debito', 'credito', 'valor'].includes(field) && typeof value === 'number' ? PESOS.format(value) : String(value));

  protected readonly historial: CbAuditEntry[] = [
    { id: 1, date: '2026-10-20T08:42:00', user: 'Ana Ruiz', action: 'create', entity: 'Comprobante CE-000124', note: 'Pago factura de energía octubre.' },
    {
      id: 2,
      date: '2026-10-20T09:05:00',
      user: 'Ana Ruiz',
      action: 'update',
      entity: 'Comprobante CE-000124',
      changes: [
        { field: 'debito', label: 'Débito · 513530 Energía', before: 800000, after: 845000 },
        { field: 'cuenta', label: 'Cuenta línea 3', before: '236540 Compras', after: '236525 Servicios' },
      ],
    },
    { id: 3, date: '2026-10-21T15:30:00', user: 'Leo Mora', action: 'approve', entity: 'Comprobante CE-000124', note: 'Revisado con la factura y el soporte de pago.' },
    {
      id: 4,
      date: '2026-10-22T10:12:00',
      user: 'Marta Gil',
      action: 'update',
      entity: 'Tercero 860063875 Enel Colombia S.A.',
      changes: [
        { field: 'email', label: 'Correo', before: 'facturas@enel.com', after: 'facturacion.co@enel.com' },
        { field: 'retencion', label: 'Agente retenedor', before: false, after: true },
      ],
    },
    { id: 5, date: '2026-10-23T11:48:00', user: 'Leo Mora', action: 'void', entity: 'Recibo de caja RC-000090', note: 'Duplicado del RC-000089.' },
    { id: 6, date: '2026-10-23T16:20:00', user: 'Marta Gil', action: 'delete', entity: 'Borrador NC-000015', changes: [{ field: 'valor', label: 'Valor', before: 120000, after: null }] },
  ];

  protected readonly importCode = `import { CbAuditLog, type CbAuditEntry } from '@caribeng/ui/audit-log';`;
  protected readonly historyCode = `<cb-audit-log [entries]="historial" [format]="formato" [actionLabels]="{ approve: 'aprobó', void: 'anuló' }" />`;

  constructor() {
    inject(TocService).reset();
  }
}
