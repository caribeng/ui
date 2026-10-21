import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbAnchor, type CbAnchorLink } from '@caribeng/ui/anchor';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-anchor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbAnchor, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Menu" title="Anchor" lead="Índice de la página que resalta la sección visible y lleva a cada una, teniendo en cuenta la cabecera fija." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="links apunta a los id de las secciones (admite un nivel de anidación). offset es el alto de la cabecera fija; activeChange avisa de la sección visible. Este índice recorre las secciones de esta misma página."
      [code]="basicCode"
      [codeTs]="basicTs"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%; max-width: 260px">
        <cb-anchor [links]="links" [offset]="72" (activeChange)="activa.set($event ?? '—')" />
        <p style="margin: 0; font-size: 0.875rem; color: var(--cb-color-text-muted)">Sección visible: {{ activa() }}</p>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class AnchorDocComponent {
  protected readonly docApi = DOC_API['cb-anchor'];
  protected readonly a11y = DOC_A11Y['cb-anchor'];
  protected readonly activa = signal('—');

  protected readonly links: CbAnchorLink[] = [
    { label: 'Importación', href: '#import' },
    { label: 'Básico', href: '#basic' },
    { label: 'Accesibilidad', href: '#accessibility' },
    { label: 'Playground', href: '#playground' },
  ];

  protected readonly importCode = `import { CbAnchor, type CbAnchorLink } from '@caribeng/ui/anchor';`;
  protected readonly basicCode = `<cb-anchor [links]="links" [offset]="72" (activeChange)="activa.set($event ?? '—')" />
<p>Sección visible: {{ activa() }}</p>`;
  protected readonly basicTs = `links: CbAnchorLink[] = [
  { label: 'Resumen', href: '#resumen' },
  { label: 'Movimientos', href: '#movimientos', children: [{ label: 'Pendientes', href: '#pendientes' }] },
  { label: 'Configuración', href: '#configuracion' },
];`;

  constructor() {
    inject(TocService).reset();
  }
}
