import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CbDotsIndicator } from '@caribeng/ui/caribe/dots-indicator';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-dots-indicator-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbDotsIndicator],
  template: `
    <cb-doc-page
      category="Caribe Design · Indicadores"
      title="DotsIndicator"
      subtitle="Indicador de paginación por puntos para carruseles y flujos de onboarding."
      importCode="import { CbDotsIndicator } from '@caribeng/ui/caribe/dots-indicator';"
      [api]="api"
    >
      <cb-doc-example title="Puntos interactivos" code='<cb-dots-indicator [count]="4" [(activeIndex)]="page" />'>
        <cb-dots-indicator [count]="4" [(activeIndex)]="page" />
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class DotsIndicatorDocComponent {
  protected readonly page = signal(1);
  protected readonly api: CbDocApiRow[] = [
    { name: 'count', type: 'number', default: '4', description: 'Número total de pasos o vistas.' },
    { name: 'activeIndex', type: 'number (model)', default: '0', description: 'Índice activo (base 0).' },
  ];
}
