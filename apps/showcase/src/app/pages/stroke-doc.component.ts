import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbStrokeComponent } from '@caribeng/ui/stroke';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-stroke-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbStrokeComponent],
  template: `
    <cb-doc-page
      category="Caribe Design · Identidad"
      title="Stroke"
      subtitle="Trazos decorativos SVG escalables del sistema de diseño Caribe."
      importCode="import { CbStrokeComponent } from '@caribeng/ui/stroke';"
      [api]="api"
    >
      <cb-doc-example title="Trazo decorativo" code='<cb-stroke name="01" size="240px" />'>
        <cb-stroke name="01" size="240px" />
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class StrokeDocComponent {
  protected readonly api: CbDocApiRow[] = [
    { name: 'name', type: 'string', default: "'01'", description: 'Código del trazo del catálogo (01–19).' },
    { name: 'size', type: 'string', default: "'220px'", description: 'Ancho del trazo en unidades CSS.' },
    { name: 'ariaHidden', type: 'boolean', default: 'true', description: 'Oculta el elemento puramente decorativo del árbol ARIA.' },
  ];
}
