import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CbOffCanvas } from '@caribeng/ui/caribe/off-canvas';
import { CbButtonComponent } from '@caribeng/ui/button';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-off-canvas-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbOffCanvas, CbButtonComponent],
  template: `
    <cb-doc-page
      category="Caribe Design · Paneles"
      title="OffCanvas"
      subtitle="Panel lateral deslizable para filtros, menús contextuales y formularios secundarios."
      importCode="import { CbOffCanvas } from '@caribeng/ui/caribe/off-canvas';"
      [api]="api"
    >
      <cb-doc-example title="Panel lateral" code='<cb-off-canvas title="Filtros avanzados" [(open)]="visible">Contenido</cb-off-canvas>'>
        <div style="display: flex; flex-direction: column; gap: 0.75rem">
          <cb-button size="sm" (click)="visible.set(!visible())">Alternar OffCanvas</cb-button>
          <cb-off-canvas title="Filtros avanzados" [(open)]="visible">
            Selecciona el rango de fechas y tipo de movimiento.
          </cb-off-canvas>
        </div>
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class OffCanvasDocComponent {
  protected readonly visible = signal(true);
  protected readonly api: CbDocApiRow[] = [
    { name: 'title', type: 'string', default: "'Panel lateral'", description: 'Encabezado del panel.' },
    { name: 'position', type: "'left' | 'right' | 'bottom'", default: "'right'", description: 'Ubicación del panel.' },
    { name: 'open', type: 'boolean (model)', default: 'false', description: 'Controla su visibilidad.' },
  ];
}
