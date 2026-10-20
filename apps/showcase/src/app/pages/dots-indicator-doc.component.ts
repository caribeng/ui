import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbDotsIndicator } from '@caribeng/ui/caribe/dots-indicator';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-dots-indicator-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbDotsIndicator],
  template: `
    <cb-doc-page
      category="Caribe Design · Indicadores"
      title="DotsIndicator"
      subtitle="Indicador de paginación por puntos para carruseles y flujos de onboarding."
      importCode="import { CbDotsIndicator } from '@caribeng/ui/caribe/dots-indicator';"
    >
      <cb-doc-example title="Puntos interactivos" code='<cb-dots-indicator [count]="4" [(activeIndex)]="page" />'>
        <cb-dots-indicator [count]="4" [(activeIndex)]="page" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class DotsIndicatorDocComponent {
  protected readonly docApi = DOC_API['cb-dots-indicator'];

  protected readonly page = signal(1);
}
