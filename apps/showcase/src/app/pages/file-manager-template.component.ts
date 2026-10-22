import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbCard } from '@caribeng/ui/card';
import { CbButton } from '@caribeng/ui/button';
import { CbChip } from '@caribeng/ui/chip';
import { CbDialog } from '@caribeng/ui/dialog';
import { CbInput } from '@caribeng/ui/input';
import { CbFileCard } from '@caribeng/ui/file-card';
import { CbFolderCard } from '@caribeng/ui/folder-card';
import { CbMenu, type CbMenuItem } from '@caribeng/ui/menu';
import { CbTable, CbTableCellDirective, type CbTableColumn } from '@caribeng/ui/table';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

interface Cat {
  icon: string;
  color: string;
  title: string;
  /** Valor de `RecentFile.category` que muestra esta categoría. */
  category: string;
  used: string;
  files: string;
  size: string;
}
interface Folder {
  id: number;
  name: string;
  files: number;
  size: string;
}
interface Segment {
  label: string;
  pct: number;
  color: string;
}
interface RecentFile {
  id: number;
  name: string;
  icon: string;
  category: string;
  /** Tamaño en MB (numérico para ordenar). */
  sizeMb: number;
  /** Fecha ISO (ordenable). */
  date: string;
}
/** Elemento sobre el que actúan los diálogos de renombrar/eliminar. */
type Target = { kind: 'folder'; item: Folder } | { kind: 'file'; item: RecentFile };

const DATE_FORMAT = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Template (receta copiable): gestor de archivos tipo Drive compuesto con los
 * componentes genéricos cb-file-card y cb-folder-card, más un donut de
 * almacenamiento y una tabla de recientes. Las categorías filtran la tabla y
 * los menús ⋮ de carpetas y archivos renombran y eliminan de verdad.
 */
@Component({
  selector: 'doc-file-manager-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbIcon,
    CbCard,
    CbButton,
    CbChip,
    CbDialog,
    CbInput,
    CbFileCard,
    CbFolderCard,
    CbMenu,
    CbTable,
    CbTableCellDirective,
    DocPageHeaderComponent,
    DocSectionComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Plantillas"
      title="File Manager"
      lead="Gestor de archivos tipo Drive compuesto con cb-file-card y cb-folder-card, más un donut de almacenamiento y una tabla de archivos recientes."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode" [codeTs]="tsCode">
      <div class="fm">
        <div class="fm__breadcrumb">
          <cb-icon name="house" [size]="15" aria-hidden="true" />
          <span>Home</span>
          <cb-icon name="chevron-right" [size]="14" aria-hidden="true" />
          @if (currentFolder(); as folder) {
            <button type="button" class="fm__crumb-link" (click)="currentFolder.set(null)">File Manager</button>
            <cb-icon name="chevron-right" [size]="14" aria-hidden="true" />
            <span class="fm__crumb-active" aria-current="page">{{ folder.name }}</span>
          } @else {
            <span class="fm__crumb-active" aria-current="page">File Manager</span>
          }
        </div>

        <cb-card class="fm__panel">
          <div class="fm__panel-head">
            <h3 class="fm__panel-title">All Media</h3>
            <cb-button size="sm"><cb-icon name="plus" [size]="15" aria-hidden="true" /> Subir archivo</cb-button>
          </div>
          <div class="fm__cats">
            @for (c of categories; track c.title) {
              <cb-file-card
                [icon]="c.icon"
                [color]="c.color"
                [title]="c.title"
                [subtitle]="c.used"
                [value]="c.files"
                [valueSub]="c.size"
                clickable
                (open)="filterBy(c)"
              />
            }
          </div>
        </cb-card>

        <div class="fm__grid">
          <cb-card class="fm__panel">
            <div class="fm__panel-head"><h3 class="fm__panel-title">Carpetas</h3></div>
            @if (folders().length) {
              <div class="fm__folders">
                @for (f of folders(); track f.id) {
                  <cb-folder-card
                    [name]="f.name"
                    [files]="f.files"
                    [size]="f.size"
                    [actions]="folderActions"
                    clickable
                    (open)="openFolder(f)"
                    (actionSelect)="onFolderAction($event, f)"
                  />
                }
              </div>
            } @else {
              <p class="fm__empty">No quedan carpetas.</p>
            }
          </cb-card>

          <cb-card class="fm__panel">
            <div class="fm__panel-head"><h3 class="fm__panel-title">Almacenamiento</h3></div>
            <p class="fm__storage-free">585 GB libres</p>
            <div class="fm__donut" [style.background]="donutGradient">
              <div class="fm__donut-hole"><strong>135 GB</strong><span>de 720 GB</span></div>
            </div>
            <ul class="fm__legend">
              @for (s of segments; track s.label) {
                <li><span class="fm__legend-dot" [style.background]="s.color"></span>{{ s.label }}</li>
              }
            </ul>
          </cb-card>
        </div>

        <cb-card class="fm__panel">
          <div class="fm__panel-head">
            <h3 class="fm__panel-title">Archivos recientes</h3>
            @if (categoryFilter(); as cat) {
              <cb-chip [label]="cat.title" [icon]="cat.icon" [removable]="true" (removed)="categoryFilter.set(null)" />
            }
          </div>
          <cb-table
            style="width: 100%"
            [value]="visibleRecent()"
            [columns]="recentColumns"
            size="sm"
            ariaLabel="Archivos recientes"
            emptyMessage="No hay archivos en esta categoría."
          >
            <ng-template cbTableCell="name" let-row>
              <span class="fm__file"><cb-icon [name]="row.icon" [size]="16" aria-hidden="true" /> {{ row.name }}</span>
            </ng-template>
            <ng-template cbTableCell="sizeMb" let-value="value">{{ value }} MB</ng-template>
            <ng-template cbTableCell="date" let-value="value">{{ formatDate(value) }}</ng-template>
            <ng-template cbTableCell="actions" let-row>
              <button
                type="button"
                class="fm__row-menu"
                [attr.aria-label]="'Más acciones: ' + row.name"
                aria-haspopup="menu"
                [attr.aria-expanded]="menuRow()?.id === row.id"
                (click)="openRowMenu($event, row)"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
                </svg>
              </button>
            </ng-template>
          </cb-table>
          <cb-menu #rowMenu [items]="fileActions" (itemSelect)="onFileAction($event)" (hidden)="menuRow.set(null)" />
        </cb-card>

        <p class="fm__status" role="status">{{ status() }}</p>
      </div>

      <cb-dialog [visible]="renameTarget() !== null" (visibleChange)="!$event && renameTarget.set(null)" header="Renombrar" width="24rem">
        <form (submit)="$event.preventDefault(); confirmRename()">
          <cb-input
            label="Nuevo nombre"
            [(value)]="renameValue"
            [error]="renameValue().trim() ? '' : 'Escribe un nombre.'"
            required
          />
        </form>
        <div cb-dialog-footer class="fm__dialog-actions">
          <cb-button variant="text" severity="secondary" (click)="renameTarget.set(null)">Cancelar</cb-button>
          <cb-button [disabled]="!renameValue().trim()" (click)="confirmRename()">Guardar</cb-button>
        </div>
      </cb-dialog>

      <cb-dialog [visible]="deleteTarget() !== null" (visibleChange)="!$event && deleteTarget.set(null)" header="Eliminar" width="24rem">
        <p class="fm__dialog-text">
          ¿Eliminar {{ deleteTarget()?.kind === 'folder' ? 'la carpeta' : 'el archivo' }} <strong>{{ deleteTarget()?.item?.name }}</strong>? Esta acción no se puede deshacer.
        </p>
        <div cb-dialog-footer class="fm__dialog-actions">
          <cb-button variant="text" severity="secondary" (click)="deleteTarget.set(null)">Cancelar</cb-button>
          <cb-button severity="danger" (click)="confirmDelete()">Eliminar</cb-button>
        </div>
      </cb-dialog>
    </doc-section>
  `,
  styles: [
    `
      .fm {
        display: flex;
        flex-direction: column;
        gap: var(--cb-space-4, 1rem);
        width: 100%;
        font-family: var(--cb-font-sans);
      }
      .fm__breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.85rem;
        color: var(--cb-color-text-muted);
      }
      .fm__crumb-active {
        color: var(--cb-color-text);
        font-weight: 600;
      }
      .fm__crumb-link {
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-decoration: underline;
        cursor: pointer;
      }
      .fm__panel {
        display: block;
      }
      .fm__panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        margin-bottom: var(--cb-space-4, 1rem);
      }
      .fm__panel-title {
        margin: 0;
        font-size: 1rem;
      }
      .fm__cats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: var(--cb-space-3, 0.75rem);
      }
      .fm__grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: var(--cb-space-4, 1rem);
      }
      .fm__folders {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: var(--cb-space-3, 0.75rem);
      }
      .fm__empty,
      .fm__storage-free {
        margin: 0 0 1rem;
        font-size: 0.8rem;
        color: var(--cb-color-text-muted);
      }
      .fm__donut {
        width: 150px;
        height: 150px;
        margin: 0 auto;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .fm__donut-hole {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: var(--cb-color-surface-raised, #fff);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .fm__donut-hole span {
        font-size: 0.72rem;
        color: var(--cb-color-text-muted);
      }
      .fm__legend {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem 1rem;
        justify-content: center;
        margin: 1rem 0 0;
        padding: 0;
        list-style: none;
        font-size: 0.8rem;
        color: var(--cb-color-text-muted);
      }
      .fm__legend li {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
      .fm__legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      .fm__file {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
      }
      .fm__row-menu {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        padding: 0;
        border: 0;
        border-radius: var(--cb-radius-md, 8px);
        background: transparent;
        color: var(--cb-color-text-muted);
        cursor: pointer;
      }
      .fm__row-menu:hover,
      .fm__row-menu[aria-expanded='true'] {
        background: var(--cb-color-surface-hover);
        color: var(--cb-color-text);
      }
      .fm__row-menu:focus-visible {
        outline: 2px solid var(--cb-color-focus-ring);
        outline-offset: 2px;
      }
      .fm__status {
        min-height: 1.25rem;
        margin: 0;
        font-size: 0.875rem;
        color: var(--cb-color-text-muted);
      }
      .fm__dialog-text {
        margin: 0;
      }
      .fm__dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }
      @media (max-width: 760px) {
        .fm__grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class FileManagerTemplateComponent {
  constructor() {
    inject(TocService).reset();
  }

  private readonly rowMenu = viewChild.required<CbMenu>('rowMenu');

  protected readonly categories: Cat[] = [
    { icon: 'image', color: '#10b981', title: 'Imágenes', category: 'Imagen', used: '17% usado', files: '245 archivos', size: '26.4 GB' },
    { icon: 'play', color: '#ec4899', title: 'Videos', category: 'Video', used: '22% usado', files: '245 archivos', size: '26.4 GB' },
    { icon: 'bell', color: '#3b82f6', title: 'Audios', category: 'Audio', used: '23% usado', files: '830 archivos', size: '18.9 GB' },
    { icon: 'puzzle', color: '#f97316', title: 'Apps', category: 'App', used: '65% usado', files: '1200 archivos', size: '85.3 GB' },
    { icon: 'file', color: '#f59e0b', title: 'Documentos', category: 'Documento', used: '10% usado', files: '78 archivos', size: '5.4 GB' },
    { icon: 'download', color: '#8b5cf6', title: 'Descargas', category: 'Descarga', used: '16% usado', files: '245 archivos', size: '26.4 GB' },
  ];

  protected readonly folders = signal<Folder[]>([
    { id: 1, name: 'Imágenes', files: 345, size: '26.4 GB' },
    { id: 2, name: 'Documentos', files: 130, size: '26.4 GB' },
    { id: 3, name: 'Apps', files: 130, size: '26.4 GB' },
    { id: 4, name: 'Descargas', files: 345, size: '26.4 GB' },
  ]);

  protected readonly folderActions: CbMenuItem[] = [
    { label: 'Abrir', icon: 'folder' },
    { label: 'Renombrar', icon: 'pencil' },
    { label: 'Compartir', icon: 'users' },
    { label: 'Descargar', icon: 'download' },
    { label: 'Mover a…', icon: 'folder-input' },
    { label: '', separator: true },
    { label: 'Eliminar', icon: 'trash' },
  ];

  protected readonly fileActions: CbMenuItem[] = [
    { label: 'Descargar', icon: 'download' },
    { label: 'Renombrar', icon: 'pencil' },
    { label: '', separator: true },
    { label: 'Eliminar', icon: 'trash' },
  ];

  protected readonly segments: Segment[] = [
    { label: 'Descargas', pct: 30, color: '#8b5cf6' },
    { label: 'Apps', pct: 35, color: '#f97316' },
    { label: 'Documentos', pct: 20, color: '#f59e0b' },
    { label: 'Media', pct: 15, color: '#10b981' },
  ];

  protected readonly donutGradient = (() => {
    let acc = 0;
    const stops = this.segments.map((s) => {
      const from = acc;
      acc += s.pct;
      return `${s.color} ${from}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  })();

  protected readonly recent = signal<RecentFile[]>([
    { id: 1, name: 'Video_947954.mp4', icon: 'play', category: 'Video', sizeMb: 89, date: '2027-01-12' },
    { id: 2, name: 'Travel.jpg', icon: 'image', category: 'Imagen', sizeMb: 5.4, date: '2027-02-10' },
    { id: 3, name: 'Documento.pdf', icon: 'file', category: 'Documento', sizeMb: 1.2, date: '2027-03-08' },
    { id: 4, name: 'Podcast_12.mp3', icon: 'bell', category: 'Audio', sizeMb: 48, date: '2027-04-21' },
    { id: 5, name: 'Instalador.dmg', icon: 'puzzle', category: 'App', sizeMb: 312, date: '2027-05-02' },
    { id: 6, name: 'CV.pdf', icon: 'file', category: 'Documento', sizeMb: 12, date: '2027-06-17' },
    { id: 7, name: 'Factura_junio.zip', icon: 'download', category: 'Descarga', sizeMb: 3.1, date: '2027-06-30' },
  ]);

  protected readonly recentColumns: CbTableColumn[] = [
    { field: 'name', header: 'Nombre', sortable: true },
    { field: 'category', header: 'Categoría', sortable: true },
    { field: 'sizeMb', header: 'Tamaño', sortable: true, align: 'right' },
    { field: 'date', header: 'Modificado', sortable: true },
    { field: 'actions', header: '', width: '3rem', align: 'right', exportable: false },
  ];

  /** Categoría elegida en All Media; filtra la tabla de recientes. */
  protected readonly categoryFilter = signal<Cat | null>(null);
  protected readonly visibleRecent = computed(() => {
    const cat = this.categoryFilter();
    return cat ? this.recent().filter((r) => r.category === cat.category) : this.recent();
  });

  protected readonly currentFolder = signal<Folder | null>(null);
  /** Fila cuyo menú ⋮ está abierto. */
  protected readonly menuRow = signal<RecentFile | null>(null);
  protected readonly renameTarget = signal<Target | null>(null);
  protected readonly renameValue = signal('');
  protected readonly deleteTarget = signal<Target | null>(null);
  /** Última acción, anunciada a lectores de pantalla (role="status"). */
  protected readonly status = signal('');

  protected formatDate(iso: string): string {
    return DATE_FORMAT.format(new Date(`${iso}T00:00:00`));
  }

  protected filterBy(cat: Cat): void {
    this.categoryFilter.set(cat);
    this.status.set(`Mostrando ${cat.title.toLowerCase()} en archivos recientes.`);
  }

  protected openFolder(folder: Folder): void {
    this.currentFolder.set(folder);
    this.status.set(`Abriste la carpeta ${folder.name}.`);
  }

  protected onFolderAction(action: CbMenuItem, folder: Folder): void {
    switch (action.label) {
      case 'Abrir':
        this.openFolder(folder);
        break;
      case 'Renombrar':
        this.startRename({ kind: 'folder', item: folder });
        break;
      case 'Eliminar':
        this.deleteTarget.set({ kind: 'folder', item: folder });
        break;
      default:
        this.status.set(`${action.label}: ${folder.name}.`);
    }
  }

  protected openRowMenu(event: MouseEvent, row: RecentFile): void {
    // Con el menú abierto, su backdrop recibe el clic: aquí solo se abre.
    this.rowMenu().show(event.currentTarget as HTMLElement);
    this.menuRow.set(row);
  }

  protected onFileAction(action: CbMenuItem): void {
    const row = this.menuRow();
    if (!row) return;
    switch (action.label) {
      case 'Renombrar':
        this.startRename({ kind: 'file', item: row });
        break;
      case 'Eliminar':
        this.deleteTarget.set({ kind: 'file', item: row });
        break;
      default:
        this.status.set(`${action.label}: ${row.name}.`);
    }
  }

  private startRename(target: Target): void {
    this.renameValue.set(target.item.name);
    this.renameTarget.set(target);
  }

  protected confirmRename(): void {
    const target = this.renameTarget();
    const name = this.renameValue().trim();
    if (!target || !name) return;
    if (target.kind === 'folder') {
      this.folders.update((list) => list.map((f) => (f.id === target.item.id ? { ...f, name } : f)));
      if (this.currentFolder()?.id === target.item.id) this.currentFolder.update((f) => f && { ...f, name });
    } else {
      this.recent.update((list) => list.map((r) => (r.id === target.item.id ? { ...r, name } : r)));
    }
    this.status.set(`"${target.item.name}" ahora se llama "${name}".`);
    this.renameTarget.set(null);
  }

  protected confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    if (target.kind === 'folder') {
      this.folders.update((list) => list.filter((f) => f.id !== target.item.id));
      if (this.currentFolder()?.id === target.item.id) this.currentFolder.set(null);
    } else {
      this.recent.update((list) => list.filter((r) => r.id !== target.item.id));
    }
    this.status.set(`Eliminaste "${target.item.name}".`);
    this.deleteTarget.set(null);
  }

  protected readonly htmlCode = `<!-- All Media: cada categoría filtra la tabla de recientes -->
<div class="cats">
  @for (c of categories; track c.title) {
    <cb-file-card [icon]="c.icon" [color]="c.color" [title]="c.title"
      [subtitle]="c.used" [value]="c.files" [valueSub]="c.size"
      clickable (open)="categoryFilter.set(c)" />
  }
</div>

<!-- Carpetas: menú ⋮ y apertura con clic -->
<div class="folders">
  @for (f of folders(); track f.id) {
    <cb-folder-card [name]="f.name" [files]="f.files" [size]="f.size"
      [actions]="folderActions" clickable
      (open)="openFolder(f)" (actionSelect)="onFolderAction($event, f)" />
  }
</div>

<!-- Recientes: cb-table ordenable con un menú ⋮ compartido por fila -->
<cb-table [value]="visibleRecent()" [columns]="recentColumns" size="sm">
  <ng-template cbTableCell="actions" let-row>
    <button type="button" aria-haspopup="menu" [attr.aria-label]="'Más acciones: ' + row.name"
      (click)="openRowMenu($event, row)">⋮</button>
  </ng-template>
</cb-table>
<cb-menu #rowMenu [items]="fileActions" (itemSelect)="onFileAction($event)" />

<!-- Renombrar / eliminar con cb-dialog -->
<cb-dialog [visible]="renameTarget() !== null" header="Renombrar">…</cb-dialog>
<cb-dialog [visible]="deleteTarget() !== null" header="Eliminar">…</cb-dialog>`;

  protected readonly tsCode = `folderActions: CbMenuItem[] = [
  { label: 'Abrir', icon: 'folder' },
  { label: 'Renombrar', icon: 'pencil' },
  { label: 'Compartir', icon: 'users' },
  { label: 'Descargar', icon: 'download' },
  { label: 'Mover a…', icon: 'folder-input' },
  { label: '', separator: true },
  { label: 'Eliminar', icon: 'trash' },
];

onFolderAction(action: CbMenuItem, folder: Folder) {
  switch (action.label) {
    case 'Abrir': this.openFolder(folder); break;
    case 'Renombrar': this.startRename({ kind: 'folder', item: folder }); break;
    case 'Eliminar': this.deleteTarget.set({ kind: 'folder', item: folder }); break;
  }
}

openRowMenu(event: MouseEvent, row: RecentFile) {
  this.rowMenu().show(event.currentTarget as HTMLElement);
  this.menuRow.set(row);
}`;
}
