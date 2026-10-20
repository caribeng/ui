import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbPickList, CbPickListItemTemplate, type CbPickListMoveEvent } from '@caribeng/ui/picklist';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

interface Permiso {
  nombre: string;
  icono: string;
}

@Component({
  selector: 'doc-picklist-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbPickList,
    CbPickListItemTemplate,
    CbIcon,
    DocPlaygroundComponent,
    DocA11yComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Datos"
      title="PickList"
      lead="Transfiere elementos entre una lista de disponibles y otra de seleccionados con botones, doble clic o teclado."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="[(source)] y [(target)] enlazan las dos listas. Marca elementos y transfiérelos con los botones, o haz doble clic en uno."
      [code]="basicCode"
    >
      <div style="width: 100%">
        <cb-picklist [(source)]="disponibles" [(target)]="elegidas" />
      </div>
    </doc-section>

    <doc-section
      id="template"
      title="Plantilla, cabeceras y evento moved"
      description="cbPickListItem define cada elemento; sourceHeader y targetHeader cambian los títulos y moved emite los elementos transferidos."
      [code]="templateCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <cb-picklist
          [(source)]="permisos"
          [(target)]="asignados"
          sourceHeader="Permisos"
          targetHeader="Asignados al rol"
          (moved)="onMove($event)"
        >
          <ng-template cbPickListItem let-permiso>
            <span style="display: inline-flex; align-items: center; gap: 0.5rem">
              <cb-icon [name]="permiso.icono" [size]="16" aria-hidden="true" />
              {{ permiso.nombre }}
            </span>
          </ng-template>
        </cb-picklist>
        <p style="margin: 0; font-size: 0.875rem">{{ lastMove() }}</p>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class PicklistDocComponent {
  protected readonly docApi = DOC_API['cb-picklist'];
  protected readonly a11y = DOC_A11Y['cb-picklist'];

  protected readonly disponibles = signal<readonly unknown[]>(['Angular', 'TypeScript', 'RxJS', 'Signals']);
  protected readonly elegidas = signal<readonly unknown[]>(['CaribeNG']);

  protected readonly permisos = signal<readonly unknown[]>([
    { nombre: 'Ver clientes', icono: 'user' } satisfies Permiso,
    { nombre: 'Editar clientes', icono: 'settings' } satisfies Permiso,
    { nombre: 'Buscar movimientos', icono: 'search' } satisfies Permiso,
  ]);
  protected readonly asignados = signal<readonly unknown[]>([{ nombre: 'Panel de inicio', icono: 'house' } satisfies Permiso]);
  protected readonly lastMove = signal('Transfiere un permiso para ver el evento.');

  protected onMove(event: CbPickListMoveEvent): void {
    const destino = event.to === 'target' ? 'asignados' : 'disponibles';
    this.lastMove.set(`${event.items.length} permiso(s) movidos a ${destino}.`);
  }

  protected readonly importCode = `import { CbPickList, CbPickListItemTemplate } from '@caribeng/ui/picklist';`;

  protected readonly basicCode = `<cb-picklist [(source)]="disponibles" [(target)]="elegidas" />`;

  protected readonly templateCode = `<cb-picklist
  [(source)]="permisos"
  [(target)]="asignados"
  sourceHeader="Permisos"
  targetHeader="Asignados al rol"
  (moved)="onMove($event)"
>
  <ng-template cbPickListItem let-permiso>
    <cb-icon [name]="permiso.icono" [size]="16" aria-hidden="true" />
    {{ permiso.nombre }}
  </ng-template>
</cb-picklist>`;

  constructor() {
    inject(TocService).reset();
  }
}
