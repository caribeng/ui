import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import {
  CbOrganizationChart,
  type CbOrganizationChartNode,
} from '@caribeng/ui/organizationchart';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-organizationchart-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbOrganizationChart, CodeBlockComponent, DocPageHeaderComponent, DocSectionComponent],
  template: `
    <doc-page-header eyebrow="Datos" title="OrganizationChart" lead="Organigrama jerárquico con expansión de ramas y selección de nodos." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" description="Expande los nodos para recorrer la estructura y selecciona una tarjeta." [code]="basicCode" [codeTs]="dataCode">
      <cb-organization-chart style="width:100%" [value]="organization" [(selection)]="selection" />
      <p style="margin:.75rem 0 0;color:var(--cb-color-text-muted)">Selección: {{ selection()?.label ?? 'ninguna' }}</p>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class OrganizationChartDocComponent {
  protected readonly docApi = DOC_API['cb-organization-chart'];

  constructor() { inject(TocService).reset(); }

  protected readonly organization: CbOrganizationChartNode[] = [
    {
      key: 'ceo', label: 'Ana Ríos', title: 'Dirección general', icon: 'building-2', children: [
        { key: 'cto', label: 'Luis Mora', title: 'Tecnología', icon: 'code-xml', children: [
          { key: 'design', label: 'Equipo de diseño', subtitle: '4 personas', icon: 'palette' },
          { key: 'engineering', label: 'Ingeniería', subtitle: '12 personas', icon: 'settings' },
        ] },
        { key: 'coo', label: 'Eva Gil', title: 'Operaciones', icon: 'briefcase-business', children: [
          { key: 'support', label: 'Atención al cliente', subtitle: '8 personas', icon: 'headset' },
        ] },
      ],
    },
  ];
  protected readonly selection = signal<CbOrganizationChartNode | null>(null);
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbOrganizationChart } from '@caribeng/ui/organizationchart';`;
  protected readonly dataCode = `const organization = [{
  key: 'ceo', label: 'Dirección general', children: [
    { key: 'tech', label: 'Tecnología', children: [
      { key: 'design', label: 'Diseño' },
    ] },
  ],
}];`;
  protected readonly basicCode = `<cb-organization-chart
  [value]="organization"
  [(selection)]="selection"
/>`;
}
