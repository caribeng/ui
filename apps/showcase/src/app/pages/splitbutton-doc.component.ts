import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import type { CbMenuItem } from '@caribeng/ui/menu';
import { CbSplitButton } from '@caribeng/ui/splitbutton';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-splitbutton-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbSplitButton, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Button"
      title="SplitButton"
      lead="Una acción principal y un menú con acciones secundarias relacionadas, en un solo control."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="primaryClick se emite al pulsar la acción principal; la flecha abre el menú con items e itemSelect avisa de la opción elegida."
      [code]="basicCode"
      [codeTs]="basicTs"
    >
      <div style="display: grid; gap: 0.75rem">
        <cb-split-button label="Guardar" icon="check" [items]="opciones" (primaryClick)="ultima.set('Guardar')" (itemSelect)="ultima.set($event.label)" />
        <p style="margin: 0; font-size: 0.875rem; color: var(--cb-color-text-muted)">Última acción: {{ ultima() }}</p>
      </div>
    </doc-section>

    <doc-section
      id="variants"
      title="Severidad, variante y tamaño"
      description="Acepta las mismas severity, variant y size que Button."
      [code]="variantsCode"
    >
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center">
        <cb-split-button label="Exportar" severity="secondary" [items]="exportar" />
        <cb-split-button label="Aprobar" severity="success" variant="outlined" [items]="opciones" />
        <cb-split-button label="Eliminar" severity="danger" size="sm" [items]="opciones" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class SplitbuttonDocComponent {
  protected readonly docApi = DOC_API['cb-split-button'];
  protected readonly a11y = DOC_A11Y['cb-split-button'];

  protected readonly ultima = signal('—');
  protected readonly opciones: CbMenuItem[] = [
    { label: 'Guardar como borrador', icon: 'file' },
    { label: 'Guardar y enviar', icon: 'check' },
    { separator: true, label: '' },
    { label: 'Descartar', icon: 'x' },
  ];
  protected readonly exportar: CbMenuItem[] = [{ label: 'Excel (.csv)' }, { label: 'PDF' }];

  protected readonly importCode = `import { CbSplitButton } from '@caribeng/ui/splitbutton';`;
  protected readonly basicCode = `<cb-split-button label="Guardar" icon="check" [items]="opciones" (primaryClick)="ultima.set('Guardar')" (itemSelect)="ultima.set($event.label)" />
<p>Última acción: {{ ultima() }}</p>`;
  protected readonly basicTs = `opciones: CbMenuItem[] = [
  { label: 'Guardar como borrador', icon: 'file' },
  { label: 'Guardar y enviar', icon: 'check' },
  { separator: true, label: '' },
  { label: 'Descartar', icon: 'x' },
];`;
  protected readonly variantsCode = `<cb-split-button label="Exportar" severity="secondary" [items]="exportar" />
<cb-split-button label="Aprobar" severity="success" variant="outlined" [items]="opciones" />
<cb-split-button label="Eliminar" severity="danger" size="sm" [items]="opciones" />`;

  constructor() {
    inject(TocService).reset();
  }
}
