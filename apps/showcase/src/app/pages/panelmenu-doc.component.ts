import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbPanelMenu, type CbPanelMenuItem } from '@caribeng/ui/panelmenu';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({ selector: 'doc-panelmenu-page', changeDetection: ChangeDetectionStrategy.OnPush, imports: [DocPlaygroundComponent, CbPanelMenu, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent], template: `
  <doc-page-header eyebrow="Menús" title="PanelMenu" lead="Navegación vertical con grupos que se pueden expandir." />

    <doc-section id="import" title="Importación"><doc-code-block [code]="installCode" lang="bash" /><br /><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
  <doc-section id="basic" title="Básico" description="multiple permite mantener abiertos varios grupos." [code]="basicCode" [codeTs]="itemsCode">
    <cb-panelmenu style="width:100%" [items]="items" [multiple]="true" (itemSelect)="selected.set($event.label)" />
    <p style="margin:.75rem 0 0;color:var(--cb-color-text-muted)">Seleccionado: {{ selected() || 'ninguno' }}</p>
  </doc-section>

  <doc-playground [api]="docApi" />
` })
export class PanelmenuDocComponent {
  protected readonly docApi = DOC_API['cb-panelmenu'];

  constructor() { inject(TocService).reset(); }
  protected readonly selected = signal('');
  protected readonly items: CbPanelMenuItem[] = [
    { label: 'Cuenta', icon: 'user', items: [{ label: 'Perfil', url: '#perfil' }, { label: 'Seguridad' }] },
    { label: 'Preferencias', icon: 'settings', items: [{ label: 'Apariencia' }, { label: 'Notificaciones' }] },
    { label: 'Ayuda', items: [{ label: 'Centro de ayuda' }] },
  ];
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbPanelMenu } from '@caribeng/ui/panelmenu';`;
  protected readonly basicCode = `<cb-panelmenu [items]="items" [multiple]="true" />`;
  protected readonly itemsCode = `items: CbPanelMenuItem[] = [
  { label: 'Cuenta', items: [
    { label: 'Perfil', url: '/profile' },
    { label: 'Seguridad' },
  ] },
];`;
}
