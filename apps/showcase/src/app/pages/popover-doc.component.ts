import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbPopover } from '@caribeng/ui/popover';
import { CbButton } from '@caribeng/ui/button';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-popover-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbPopover,
    CbButton,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Overlay" title="Popover" lead="Panel flotante con contenido libre, anclado a un disparador. Se cierra al hacer clic fuera o con Escape." />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Basic" description="Llama a toggle($event) desde el disparador." [code]="basicCode">
      <cb-button (click)="op.toggle($event)">Opciones</cb-button>
      <cb-popover #op ariaLabel="Opciones">
        <div style="padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; min-width: 12rem">
          <strong style="font-size: 0.875rem">Exportar</strong>
          <cb-button variant="text" size="sm" (click)="op.hide()">Como PDF</cb-button>
          <cb-button variant="text" size="sm" (click)="op.hide()">Como CSV</cb-button>
        </div>
      </cb-popover>
    </doc-section>

    <doc-section id="rich" title="Contenido enriquecido" [code]="richCode">
      <cb-button severity="secondary" variant="outlined" (click)="info.toggle($event)">Detalles del perfil</cb-button>
      <cb-popover #info>
        <div style="padding: 1rem; max-width: 18rem">
          <p style="margin: 0 0 0.5rem; font-weight: 600">María Pérez</p>
          <p style="margin: 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
            Diseñadora de producto. Trabaja en el equipo de design system desde 2024.
          </p>
        </div>
      </cb-popover>
    </doc-section>
  `,
})
export class PopoverDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly installCode = `npm install @caribeng/ui @angular/cdk`;
  protected readonly importCode = `import { CbPopover } from '@caribeng/ui/popover';`;
  protected readonly basicCode = `<cb-button (click)="op.toggle($event)">Opciones</cb-button>
<cb-popover #op>
  <div style="padding: 1rem">…</div>
</cb-popover>`;
  protected readonly richCode = `<cb-button (click)="info.toggle($event)">Detalles</cb-button>
<cb-popover #info>
  <div style="padding: 1rem; max-width: 18rem">…</div>
</cb-popover>`;
}
