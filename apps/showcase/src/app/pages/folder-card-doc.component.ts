import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbFolderCard } from '@caribeng/ui/folder-card';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { TocService } from '../services/toc.service';

interface Folder {
  name: string;
  files: number;
  size: string;
}

@Component({
  selector: 'doc-folder-card-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbFolderCard, DocPageHeaderComponent, DocSectionComponent, CodeBlockComponent],
  template: `
    <doc-page-header
      eyebrow="File"
      title="FolderCard"
      lead="Tarjeta de carpeta genérica: icono de carpeta, nombre y una fila con número de archivos y tamaño. Proyecta un menú de acciones por [cb-folder-actions]."
    />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="Nombre, número de archivos y tamaño. Un botón de acciones proyectado en la esquina."
      [code]="basicCode"
    >
      <cb-folder-card name="Imágenes" [files]="345" size="26.4 GB" style="max-width: 260px">
        <button cb-folder-actions type="button" class="fcd-menu" aria-label="Opciones">⋮</button>
      </cb-folder-card>
    </doc-section>

    <doc-section
      id="grid"
      title="Rejilla de carpetas"
      description="Varias folder-card forman la sección 'All Folders' de un gestor de archivos."
      [code]="gridCode"
    >
      <div class="fcd-grid">
        @for (f of folders; track f.name) {
          <cb-folder-card [name]="f.name" [files]="f.files" [size]="f.size">
            <button cb-folder-actions type="button" class="fcd-menu" aria-label="Opciones">⋮</button>
          </cb-folder-card>
        }
      </div>
    </doc-section>
  `,
  styles: [
    `
      .fcd-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 0.75rem;
      }
      .fcd-menu {
        border: 0;
        background: transparent;
        color: inherit;
        font-size: 1.1rem;
        line-height: 1;
        cursor: pointer;
      }
    `,
  ],
})
export class FolderCardDocComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly folders: Folder[] = [
    { name: 'Imágenes', files: 345, size: '26.4 GB' },
    { name: 'Documentos', files: 130, size: '26.4 GB' },
    { name: 'Apps', files: 130, size: '26.4 GB' },
    { name: 'Descargas', files: 345, size: '26.4 GB' },
  ];

  protected readonly importCode = `import { CbFolderCard } from '@caribeng/ui/folder-card';`;

  protected readonly basicCode = `<cb-folder-card name="Imágenes" [files]="345" size="26.4 GB">
  <button cb-folder-actions aria-label="Opciones">⋮</button>
</cb-folder-card>`;

  protected readonly gridCode = `<div class="grid">
  @for (f of folders; track f.name) {
    <cb-folder-card [name]="f.name" [files]="f.files" [size]="f.size">
      <button cb-folder-actions aria-label="Opciones">⋮</button>
    </cb-folder-card>
  }
</div>`;
}
