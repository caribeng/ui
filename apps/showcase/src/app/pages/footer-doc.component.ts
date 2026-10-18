import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbFooterComponent } from '@caribeng/ui/footer';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-footer-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbFooterComponent],
  template: `
    <cb-doc-page
      category="Caribe Design · Navegación"
      title="Footer"
      subtitle="Pie de página institucional con texto legal y ranura para enlaces."
      importCode="import { CbFooterComponent } from '@caribeng/ui/footer';"
      [api]="api"
    >
      <cb-doc-example title="Pie institucional" code='<cb-footer />'>
        <cb-footer />
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class FooterDocComponent {
  protected readonly api: CbDocApiRow[] = [
    { name: 'copyright', type: 'string', default: "'© 2026 CaribeNG...'", description: 'Texto de derechos de autor.' },
  ];
}
