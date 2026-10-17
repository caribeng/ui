import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbCascadeOption, CbCascadeSelectComponent } from '@caribeng/ui/cascadeselect';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-cascadeselect-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbCascadeSelectComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Form" title="CascadeSelect" lead="Selector multinivel en cascada para estructuras anidadas." />
    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Básico" [code]="basicCode">
      <div style="width: 280px">
        <cb-cascade-select [options]="options" [(value)]="selected" />
      </div>
    </doc-section>
  `,
})
export class CascadeselectDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly selected = signal<string | null>(null);
  protected readonly options: CbCascadeOption[] = [
    {
      label: 'Colombia',
      children: [
        { label: 'Medellín', value: 'MDE' },
        { label: 'Bogotá', value: 'BOG' },
      ],
    },
    {
      label: 'México',
      children: [{ label: 'Ciudad de México', value: 'CDMX' }],
    },
  ];
  protected readonly importCode = `import { CbCascadeSelectComponent } from '@caribeng/ui/cascadeselect';`;
  protected readonly basicCode = `<cb-cascade-select [options]="options" [(value)]="selected" />`;
}
