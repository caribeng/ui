import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import type { CbMenuItem } from '@caribeng/ui/menu';
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
      eyebrow="Archivos"
      title="FolderCard"
      lead="Tarjeta de carpeta genérica: icono de carpeta, nombre y una fila con número de archivos y tamaño. Con actions muestra un menú ⋮ de acciones; con clickable, toda la tarjeta abre la carpeta."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Menú de acciones"
      description="actions recibe items de cb-menu (icono, disabled, separator…). El botón ⋮ abre el menú y actionSelect avisa de la acción elegida."
      [code]="basicCode"
      [codeTs]="basicTs"
    >
      <div style="display: grid; gap: 0.75rem; max-width: 260px">
        <cb-folder-card name="Imágenes" [files]="345" size="26.4 GB" [actions]="acciones" (actionSelect)="ultima.set($event.label + ' · Imágenes')" />
        <p class="fcd-log">Última acción: {{ ultima() }}</p>
      </div>
    </doc-section>

    <doc-section
      id="clickable"
      title="Tarjeta pulsable"
      description="Con clickable, el nombre es un botón que cubre toda la tarjeta y emite open (clic, Enter o Espacio). El botón ⋮ queda por encima y no abre la carpeta."
      [code]="gridCode"
    >
      <div style="display: grid; gap: 0.75rem">
        <div class="fcd-grid">
          @for (f of folders; track f.name) {
            <cb-folder-card
              [name]="f.name"
              [files]="f.files"
              [size]="f.size"
              [actions]="acciones"
              clickable
              (open)="ultima.set('Abrir · ' + f.name)"
              (actionSelect)="ultima.set($event.label + ' · ' + f.name)"
            />
          }
        </div>
        <p class="fcd-log">Última acción: {{ ultima() }}</p>
      </div>
    </doc-section>

    <doc-section
      id="custom"
      title="Contenido propio en la esquina"
      description="Sin actions, [cb-folder-actions] proyecta cualquier contenido en la esquina (p. ej. un botón propio o un badge)."
      [code]="customCode"
    >
      <cb-folder-card name="Proyectos" [files]="12" size="1.2 GB" style="max-width: 260px">
        <span cb-folder-actions class="fcd-badge">Compartida</span>
      </cb-folder-card>
    </doc-section>
  `,
  styles: [
    `
      .fcd-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 0.75rem;
      }
      .fcd-log {
        margin: 0;
        font-size: 0.875rem;
        color: var(--cb-color-text-muted);
      }
      .fcd-badge {
        padding: 0.125rem 0.5rem;
        border-radius: 999px;
        background: var(--cb-color-surface-hover);
        font-size: 0.75rem;
      }
    `,
  ],
})
export class FolderCardDocComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly ultima = signal('—');

  protected readonly acciones: CbMenuItem[] = [
    { label: 'Abrir', icon: 'folder' },
    { label: 'Renombrar', icon: 'pencil' },
    { label: 'Compartir', icon: 'users' },
    { label: 'Descargar', icon: 'download' },
    { label: 'Mover a…', icon: 'folder-input' },
    { label: '', separator: true },
    { label: 'Eliminar', icon: 'trash' },
  ];

  protected readonly folders: Folder[] = [
    { name: 'Imágenes', files: 345, size: '26.4 GB' },
    { name: 'Documentos', files: 130, size: '26.4 GB' },
    { name: 'Apps', files: 130, size: '26.4 GB' },
    { name: 'Descargas', files: 345, size: '26.4 GB' },
  ];

  protected readonly importCode = `import { CbFolderCard } from '@caribeng/ui/folder-card';`;

  protected readonly basicCode = `<cb-folder-card name="Imágenes" [files]="345" size="26.4 GB"
  [actions]="acciones" (actionSelect)="onAccion($event)" />`;

  protected readonly basicTs = `acciones: CbMenuItem[] = [
  { label: 'Abrir', icon: 'folder' },
  { label: 'Renombrar', icon: 'pencil' },
  { label: 'Compartir', icon: 'users' },
  { label: 'Descargar', icon: 'download' },
  { label: 'Mover a…', icon: 'folder-input' },
  { label: '', separator: true },
  { label: 'Eliminar', icon: 'trash' },
];

onAccion(item: CbMenuItem) {
  console.log(item.label);
}`;

  protected readonly gridCode = `<div class="grid">
  @for (f of folders; track f.name) {
    <cb-folder-card [name]="f.name" [files]="f.files" [size]="f.size"
      [actions]="acciones" clickable
      (open)="abrir(f)" (actionSelect)="onAccion($event, f)" />
  }
</div>`;

  protected readonly customCode = `<cb-folder-card name="Proyectos" [files]="12" size="1.2 GB">
  <span cb-folder-actions class="badge">Compartida</span>
</cb-folder-card>`;
}
