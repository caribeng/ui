import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbAvatar } from '@caribeng/ui/avatar';
import { CbOrderList, CbOrderListItemTemplate, type CbOrderListReorderEvent } from '@caribeng/ui/orderlist';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

interface Aprobador {
  nombre: string;
  cargo: string;
}

@Component({
  selector: 'doc-orderlist-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbOrderList,
    CbOrderListItemTemplate,
    CbAvatar,
    DocPlaygroundComponent,
    DocA11yComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Datos"
      title="OrderList"
      lead="Lista reordenable: selecciona un elemento y muévelo con los botones o con Alt + flechas."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="El orden se enlaza con [(value)]; header pone un título visible que también nombra la lista."
      [code]="basicCode"
    >
      <div style="width: 100%; max-width: 360px">
        <cb-orderlist [(value)]="prioridades" header="Prioridades" />
        <p style="margin: 0.75rem 0 0; font-size: 0.875rem">{{ prioridades().join(' → ') }}</p>
      </div>
    </doc-section>

    <doc-section
      id="template"
      title="Plantilla y evento reorder"
      description="cbOrderListItem define cada elemento y reorder emite la posición de origen, la de destino y la lista nueva."
      [code]="templateCode"
    >
      <div style="width: 100%; max-width: 380px">
        <cb-orderlist [(value)]="aprobadores" header="Orden de aprobación" (reorder)="onReorder($event)">
          <ng-template cbOrderListItem let-persona let-i="index">
            <span style="display: flex; align-items: center; gap: 0.6rem">
              <cb-avatar [label]="persona.nombre[0]" size="sm" />
              <span>{{ i + 1 }}. {{ persona.nombre }} <small style="opacity: 0.7">· {{ persona.cargo }}</small></span>
            </span>
          </ng-template>
        </cb-orderlist>
        <p style="margin: 0.75rem 0 0; font-size: 0.875rem">{{ lastMove() }}</p>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class OrderlistDocComponent {
  protected readonly docApi = DOC_API['cb-orderlist'];
  protected readonly a11y = DOC_A11Y['cb-orderlist'];

  protected readonly prioridades = signal<readonly unknown[]>(['Seguridad', 'Rendimiento', 'Accesibilidad', 'Diseño']);

  protected readonly aprobadores = signal<readonly unknown[]>([
    { nombre: 'Laura', cargo: 'Analista' } satisfies Aprobador,
    { nombre: 'Diego', cargo: 'Gerente' } satisfies Aprobador,
    { nombre: 'Marta', cargo: 'Directora' } satisfies Aprobador,
  ]);
  protected readonly lastMove = signal('Mueve un elemento para ver el evento.');

  protected onReorder(event: CbOrderListReorderEvent): void {
    this.lastMove.set(`Movido de la posición ${event.from + 1} a la ${event.to + 1}.`);
  }

  protected readonly importCode = `import { CbOrderList, CbOrderListItemTemplate } from '@caribeng/ui/orderlist';`;

  protected readonly basicCode = `<cb-orderlist [(value)]="prioridades" header="Prioridades" />`;

  protected readonly templateCode = `<cb-orderlist [(value)]="aprobadores" header="Orden de aprobación" (reorder)="onReorder($event)">
  <ng-template cbOrderListItem let-persona let-i="index">
    <cb-avatar [label]="persona.nombre[0]" size="sm" />
    {{ i + 1 }}. {{ persona.nombre }} · {{ persona.cargo }}
  </ng-template>
</cb-orderlist>`;

  constructor() {
    inject(TocService).reset();
  }
}
