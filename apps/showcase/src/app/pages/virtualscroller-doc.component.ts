import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbAvatar } from '@caribeng/ui/avatar';
import { CbButton } from '@caribeng/ui/button';
import { CbVirtualItemTemplate, CbVirtualScroller } from '@caribeng/ui/virtualscroller';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

interface Cliente {
  id: number;
  nombre: string;
  ciudad: string;
}

const NOMBRES = ['Ana', 'Luis', 'María', 'Carlos', 'Sofía', 'Andrés', 'Valentina', 'Jorge'];
const CIUDADES = ['Cartagena', 'Barranquilla', 'Medellín', 'Bogotá', 'Santa Marta'];

@Component({
  selector: 'doc-virtualscroller-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbVirtualScroller,
    CbVirtualItemTemplate,
    CbAvatar,
    CbButton,
    DocPlaygroundComponent,
    DocA11yComponent,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Datos"
      title="VirtualScroller"
      lead="Lista virtualizada: muestra miles de elementos pintando solo los visibles, para que el desplazamiento sea fluido."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="items recibe la lista completa; itemSize es el alto fijo de cada fila y viewportHeight el alto visible, ambos en píxeles."
      [code]="basicCode"
    >
      <div style="width: 100%; max-width: 360px">
        <cb-virtualscroller [items]="rows" [itemSize]="40" [viewportHeight]="240" ariaLabel="Filas" />
      </div>
    </doc-section>

    <doc-section
      id="template"
      title="Plantilla de elemento"
      description="ng-template cbVirtualItem define cómo se pinta cada elemento; recibe el elemento y su índice real. Aquí, 10 000 clientes."
      [code]="templateCode"
    >
      <div style="width: 100%; max-width: 420px">
        <cb-virtualscroller [items]="clientes" [itemSize]="56" [viewportHeight]="280" ariaLabel="Clientes">
          <ng-template cbVirtualItem let-cliente let-i="index">
            <div style="display: flex; align-items: center; gap: 0.75rem">
              <cb-avatar [label]="cliente.nombre[0]" size="sm" />
              <div>
                <strong>{{ cliente.nombre }}</strong>
                <div style="font-size: 0.75rem; opacity: 0.7">#{{ i + 1 }} · {{ cliente.ciudad }}</div>
              </div>
            </div>
          </ng-template>
        </cb-virtualscroller>
      </div>
    </doc-section>

    <doc-section
      id="scroll-to"
      title="Ir a un elemento"
      description="scrollToIndex() desplaza la lista hasta el elemento indicado, a través de una referencia de plantilla."
      [code]="scrollCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%; max-width: 360px">
        <div style="display: flex; gap: 0.5rem">
          <cb-button size="sm" variant="outlined" (click)="list.scrollToIndex(0)">Inicio</cb-button>
          <cb-button size="sm" variant="outlined" (click)="list.scrollToIndex(4999)">Fila 5000</cb-button>
        </div>
        <cb-virtualscroller #list [items]="rows" [itemSize]="40" [viewportHeight]="200" ariaLabel="Filas" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class VirtualscrollerDocComponent {
  protected readonly docApi = DOC_API['cb-virtualscroller'];
  protected readonly a11y = DOC_A11Y['cb-virtualscroller'];

  protected readonly rows = Array.from({ length: 10000 }, (_, i) => `Fila ${i + 1}`);

  protected readonly clientes: Cliente[] = Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    nombre: NOMBRES[i % NOMBRES.length],
    ciudad: CIUDADES[i % CIUDADES.length],
  }));

  protected readonly importCode = `import { CbVirtualScroller, CbVirtualItemTemplate } from '@caribeng/ui/virtualscroller';`;

  protected readonly basicCode = `<cb-virtualscroller [items]="rows" [itemSize]="40" [viewportHeight]="240" ariaLabel="Filas" />`;

  protected readonly templateCode = `<cb-virtualscroller [items]="clientes" [itemSize]="56" [viewportHeight]="280" ariaLabel="Clientes">
  <ng-template cbVirtualItem let-cliente let-i="index">
    <cb-avatar [label]="cliente.nombre[0]" size="sm" />
    <strong>{{ cliente.nombre }}</strong> #{{ i + 1 }} · {{ cliente.ciudad }}
  </ng-template>
</cb-virtualscroller>`;

  protected readonly scrollCode = `<cb-button size="sm" variant="outlined" (click)="list.scrollToIndex(0)">Inicio</cb-button>
<cb-button size="sm" variant="outlined" (click)="list.scrollToIndex(4999)">Fila 5000</cb-button>
<cb-virtualscroller #list [items]="rows" [itemSize]="40" [viewportHeight]="200" ariaLabel="Filas" />`;

  constructor() {
    inject(TocService).reset();
  }
}
