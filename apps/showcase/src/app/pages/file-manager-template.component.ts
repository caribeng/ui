import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal, viewChild } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbCard } from '@caribeng/ui/card';
import { CbButton } from '@caribeng/ui/button';
import { CbBreadcrumb, type CbBreadcrumbItem } from '@caribeng/ui/breadcrumb';
import { CbChip } from '@caribeng/ui/chip';
import { CbDialog } from '@caribeng/ui/dialog';
import { CbInput } from '@caribeng/ui/input';
import { CbSelect } from '@caribeng/ui/select';
import { CbFileCard } from '@caribeng/ui/file-card';
import { CbFolderCard } from '@caribeng/ui/folder-card';
import { CbMenu, type CbMenuItem } from '@caribeng/ui/menu';
import { CbTable, CbTableCellDirective, type CbTableColumn } from '@caribeng/ui/table';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

type Category = 'Imagen' | 'Video' | 'Audio' | 'App' | 'Documento' | 'Descarga';

interface Cat {
  icon: string;
  color: string;
  title: string;
  category: Category;
}
interface Folder {
  id: string;
  name: string;
  /** Carpeta que la contiene (`null` = Mi unidad). */
  parentId: string | null;
}
interface FileItem {
  id: string;
  name: string;
  category: Category;
  bytes: number;
  /** Fecha ISO (ordenable). */
  date: string;
  folderId: string | null;
  /** URL local de los archivos subidos (permite descargarlos). */
  url?: string;
}
/** Elemento sobre el que actúan los diálogos. */
type Target = { kind: 'folder'; item: Folder } | { kind: 'file'; item: FileItem };

const MB = 1024 * 1024;
/** Capacidad de la unidad de la demo. */
const CAPACITY = 2 * 1024 * MB;
const DATE_FORMAT = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' });
const SIZE_FORMAT = new Intl.NumberFormat('es', { maximumFractionDigits: 1 });

/** "820 B", "14 KB", "2,3 MB", "1,1 GB". */
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${SIZE_FORMAT.format(unit === 0 ? value : Math.round(value * 10) / 10)} ${units[unit]}`;
}

/** Categoría según el tipo MIME o la extensión. */
function categoryOf(name: string, type: string): Category {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (type.startsWith('image/')) return 'Imagen';
  if (type.startsWith('video/')) return 'Video';
  if (type.startsWith('audio/')) return 'Audio';
  if (['dmg', 'exe', 'msi', 'apk', 'app', 'deb', 'pkg'].includes(ext)) return 'App';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'Descarga';
  return 'Documento';
}

let nextId = 100;

/**
 * Template (receta copiable): gestor de archivos tipo Drive compuesto con
 * cb-file-card, cb-folder-card, cb-breadcrumb y cb-table. Las carpetas se
 * anidan y se navegan con la ruta; se suben archivos (botón o arrastrándolos),
 * se crean carpetas y los menús ⋮ renombran, mueven, descargan y eliminan.
 */
@Component({
  selector: 'doc-file-manager-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbIcon,
    CbCard,
    CbButton,
    CbBreadcrumb,
    CbChip,
    CbDialog,
    CbInput,
    CbSelect,
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
      lead="Gestor de archivos tipo Drive con carpetas anidadas, ruta navegable, subida de archivos (botón o arrastrándolos), almacenamiento por categoría y acciones para renombrar, mover, descargar y eliminar."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode">
      <div
        class="fm"
        [class.fm--dragging]="dragging()"
        (dragenter)="onDragEnter($event)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave()"
        (drop)="onDrop($event)"
      >
        <div class="fm__top">
          <cb-breadcrumb [items]="crumbs()" />
          <div class="fm__actions">
            <cb-button size="sm" variant="outlined" severity="secondary" (click)="startCreateFolder()">
              <cb-icon name="folder" [size]="15" aria-hidden="true" /> Nueva carpeta
            </cb-button>
            <cb-button size="sm" (click)="fileInput.click()">
              <cb-icon name="upload" [size]="15" aria-hidden="true" /> Subir archivos
            </cb-button>
            <input #fileInput type="file" multiple hidden (change)="upload(fileInput.files); fileInput.value = ''" />
          </div>
        </div>

        @if (!currentFolder()) {
          <cb-card class="fm__panel">
            <div class="fm__panel-head"><h3 class="fm__panel-title">Por categoría</h3></div>
            <div class="fm__cats">
              @for (c of categoryCards(); track c.title) {
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
        }

        <div class="fm__grid" [class.fm__grid--single]="currentFolder()">
          <cb-card class="fm__panel">
            <div class="fm__panel-head">
              <h3 class="fm__panel-title">{{ currentFolder() ? 'Subcarpetas' : 'Carpetas' }}</h3>
            </div>
            @if (childFolders().length) {
              <div class="fm__folders">
                @for (f of childFolders(); track f.id) {
                  <cb-folder-card
                    [name]="f.name"
                    [files]="folderStats(f).files"
                    [filesLabel]="folderStats(f).files === 1 ? 'archivo' : 'archivos'"
                    [size]="folderStats(f).size"
                    [actions]="folderMenu(f)"
                    clickable
                    (open)="openFolder(f)"
                  />
                }
              </div>
            } @else {
              <p class="fm__empty">No hay carpetas aquí. Crea una con «Nueva carpeta».</p>
            }
          </cb-card>

          @if (!currentFolder()) {
            <cb-card class="fm__panel">
              <div class="fm__panel-head"><h3 class="fm__panel-title">Almacenamiento</h3></div>
              <p class="fm__storage-free">{{ storage().free }} libres</p>
              <div class="fm__donut" [style.background]="storage().gradient">
                <div class="fm__donut-hole"><strong>{{ storage().used }}</strong><span>de {{ storage().capacity }}</span></div>
              </div>
              <ul class="fm__legend">
                @for (s of storage().segments; track s.label) {
                  <li><span class="fm__legend-dot" [style.background]="s.color"></span>{{ s.label }}</li>
                }
              </ul>
            </cb-card>
          }
        </div>

        <cb-card class="fm__panel">
          <div class="fm__panel-head">
            <h3 class="fm__panel-title">{{ currentFolder() ? 'Archivos' : 'Archivos recientes' }}</h3>
            @if (categoryFilter(); as cat) {
              <cb-chip [label]="cat.title" [icon]="cat.icon" [removable]="true" (removed)="categoryFilter.set(null)" />
            }
          </div>
          <cb-table
            style="width: 100%"
            [value]="visibleFiles()"
            [columns]="fileColumns()"
            size="sm"
            [ariaLabel]="currentFolder() ? 'Archivos de ' + currentFolder()!.name : 'Archivos recientes'"
            emptyMessage="No hay archivos. Súbelos con el botón o arrástralos aquí."
          >
            <ng-template cbTableCell="name" let-row>
              <span class="fm__file"><cb-icon [name]="iconOf(row.category)" [size]="16" aria-hidden="true" /> {{ row.name }}</span>
            </ng-template>
            <ng-template cbTableCell="folderId" let-value="value">{{ folderName(value) }}</ng-template>
            <ng-template cbTableCell="bytes" let-value="value">{{ size(value) }}</ng-template>
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
          <cb-menu #rowMenu [items]="rowMenuItems()" (hidden)="menuRow.set(null)" />
        </cb-card>

        <p class="fm__status" role="status">{{ status() }}</p>

        @if (dragging()) {
          <div class="fm__dropzone" aria-hidden="true">
            <cb-icon name="cloud-upload" [size]="36" />
            <span>Suelta para subir a {{ currentFolder()?.name ?? 'Mi unidad' }}</span>
          </div>
        }
      </div>

      <cb-dialog [visible]="nameDialog() !== null" (visibleChange)="!$event && nameDialog.set(null)" [header]="nameDialog()?.title ?? ''" width="24rem">
        <form (submit)="$event.preventDefault(); confirmName()">
          <cb-input label="Nombre" [(value)]="nameValue" [error]="nameValue().trim() ? '' : 'Escribe un nombre.'" required />
        </form>
        <div cb-dialog-footer class="fm__dialog-actions">
          <cb-button variant="text" severity="secondary" (click)="nameDialog.set(null)">Cancelar</cb-button>
          <cb-button [disabled]="!nameValue().trim()" (click)="confirmName()">Guardar</cb-button>
        </div>
      </cb-dialog>

      <cb-dialog [visible]="moveTarget() !== null" (visibleChange)="!$event && moveTarget.set(null)" header="Mover a…" width="26rem">
        <span class="fm__label" id="fm-move-label">Carpeta de destino</span>
        <cb-select [options]="moveOptions()" optionLabel="label" optionValue="id" [(value)]="moveDestination" ariaLabelledBy="fm-move-label" />
        <div cb-dialog-footer class="fm__dialog-actions">
          <cb-button variant="text" severity="secondary" (click)="moveTarget.set(null)">Cancelar</cb-button>
          <cb-button (click)="confirmMove()">Mover</cb-button>
        </div>
      </cb-dialog>

      <cb-dialog [visible]="deleteTarget() !== null" (visibleChange)="!$event && deleteTarget.set(null)" header="Eliminar" width="24rem">
        <p class="fm__dialog-text">{{ deleteMessage() }}</p>
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
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--cb-space-4, 1rem);
        width: 100%;
        font-family: var(--cb-font-sans);
      }
      .fm__top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .fm__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
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
      .fm__grid--single {
        grid-template-columns: 1fr;
      }
      .fm__folders {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
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
      .fm__dropzone {
        position: absolute;
        inset: 0;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        border: 2px dashed var(--cb-color-primary);
        border-radius: var(--cb-radius-lg, 12px);
        background: color-mix(in srgb, var(--cb-color-primary) 10%, var(--cb-color-surface-raised, #fff));
        color: var(--cb-color-primary);
        font-weight: 600;
        pointer-events: none;
      }
      .fm__label {
        display: block;
        margin-bottom: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
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
    // Las URL locales de los archivos subidos se liberan al salir de la página.
    inject(DestroyRef).onDestroy(() => this.files().forEach((f) => f.url && URL.revokeObjectURL(f.url)));
  }

  private readonly rowMenu = viewChild.required<CbMenu>('rowMenu');

  protected readonly categories: Cat[] = [
    { icon: 'image', color: '#10b981', title: 'Imágenes', category: 'Imagen' },
    { icon: 'play', color: '#ec4899', title: 'Videos', category: 'Video' },
    { icon: 'bell', color: '#3b82f6', title: 'Audios', category: 'Audio' },
    { icon: 'puzzle', color: '#f97316', title: 'Apps', category: 'App' },
    { icon: 'file', color: '#f59e0b', title: 'Documentos', category: 'Documento' },
    { icon: 'download', color: '#8b5cf6', title: 'Descargas', category: 'Descarga' },
  ];

  protected readonly folders = signal<Folder[]>([
    { id: 'img', name: 'Imágenes', parentId: null },
    { id: 'docs', name: 'Documentos', parentId: null },
    { id: 'apps', name: 'Apps', parentId: null },
    { id: 'dl', name: 'Descargas', parentId: null },
    { id: 'bills', name: 'Facturas', parentId: 'docs' },
    { id: 'bills-2026', name: '2026', parentId: 'bills' },
    { id: 'trips', name: 'Viajes', parentId: 'img' },
  ]);

  protected readonly files = signal<FileItem[]>([
    { id: 'f1', name: 'Video_947954.mp4', category: 'Video', bytes: 89 * MB, date: '2026-09-12', folderId: null },
    { id: 'f2', name: 'Cartagena.jpg', category: 'Imagen', bytes: 5.4 * MB, date: '2026-10-10', folderId: 'trips' },
    { id: 'f3', name: 'Contrato.pdf', category: 'Documento', bytes: 1.2 * MB, date: '2026-10-08', folderId: 'docs' },
    { id: 'f4', name: 'Podcast_12.mp3', category: 'Audio', bytes: 48 * MB, date: '2026-08-21', folderId: null },
    { id: 'f5', name: 'Instalador.dmg', category: 'App', bytes: 312 * MB, date: '2026-07-02', folderId: 'apps' },
    { id: 'f6', name: 'CV.pdf', category: 'Documento', bytes: 0.4 * MB, date: '2026-10-17', folderId: 'docs' },
    { id: 'f7', name: 'Factura_septiembre.pdf', category: 'Documento', bytes: 0.3 * MB, date: '2026-10-01', folderId: 'bills-2026' },
    { id: 'f8', name: 'Fotos_backup.zip', category: 'Descarga', bytes: 640 * MB, date: '2026-09-30', folderId: 'dl' },
  ]);

  private readonly allColumns: CbTableColumn[] = [
    { field: 'name', header: 'Nombre', sortable: true },
    { field: 'folderId', header: 'Ubicación' },
    { field: 'bytes', header: 'Tamaño', sortable: true, align: 'right' },
    { field: 'date', header: 'Modificado', sortable: true },
    { field: 'actions', header: '', width: '3rem', align: 'right', exportable: false },
  ];

  protected readonly currentFolder = signal<Folder | null>(null);
  /** Dentro de una carpeta, la columna Ubicación sobra. */
  protected readonly fileColumns = computed(() =>
    this.currentFolder() ? this.allColumns.filter((c) => c.field !== 'folderId') : this.allColumns,
  );
  /** Categoría elegida; filtra la tabla. */
  protected readonly categoryFilter = signal<Cat | null>(null);
  /** Fila cuyo menú ⋮ está abierto. */
  protected readonly menuRow = signal<FileItem | null>(null);
  protected readonly rowMenuItems = signal<CbMenuItem[]>([]);
  protected readonly nameDialog = signal<{ title: string; target: Target | null } | null>(null);
  protected readonly nameValue = signal('');
  protected readonly moveTarget = signal<Target | null>(null);
  protected readonly moveDestination = signal<string>('root');
  protected readonly deleteTarget = signal<Target | null>(null);
  protected readonly dragging = signal(false);
  private dragDepth = 0;
  /** Última acción, anunciada a lectores de pantalla (role="status"). */
  protected readonly status = signal('');

  // --- Navegación -----------------------------------------------------------------
  /** Carpeta y sus antecesoras, de la raíz hacia abajo. */
  private pathOf(folder: Folder | null): Folder[] {
    const byId = new Map(this.folders().map((f) => [f.id, f]));
    const path: Folder[] = [];
    for (let f = folder; f; f = f.parentId ? (byId.get(f.parentId) ?? null) : null) path.unshift(f);
    return path;
  }

  protected readonly crumbs = computed<CbBreadcrumbItem[]>(() => [
    { label: 'Mi unidad', icon: 'house', command: () => this.goTo(null) },
    ...this.pathOf(this.currentFolder()).map((f) => ({ label: f.name, command: () => this.goTo(f) })),
  ]);

  protected readonly childFolders = computed(() => {
    const id = this.currentFolder()?.id ?? null;
    return this.folders().filter((f) => f.parentId === id);
  });

  protected openFolder(folder: Folder): void {
    this.goTo(folder);
  }

  private goTo(folder: Folder | null): void {
    this.currentFolder.set(folder);
    this.categoryFilter.set(null);
    this.status.set(folder ? `Abriste ${this.pathOf(folder).map((f) => f.name).join(' / ')}.` : 'Estás en Mi unidad.');
  }

  /** Ids de la carpeta y de todas sus subcarpetas. */
  private subtree(id: string): Set<string> {
    const ids = new Set([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const f of this.folders()) {
        if (f.parentId && ids.has(f.parentId) && !ids.has(f.id)) {
          ids.add(f.id);
          grew = true;
        }
      }
    }
    return ids;
  }

  protected folderStats(folder: Folder): { files: number; size: string } {
    const ids = this.subtree(folder.id);
    const inside = this.files().filter((f) => f.folderId && ids.has(f.folderId));
    return { files: inside.length, size: formatBytes(inside.reduce((sum, f) => sum + f.bytes, 0)) };
  }

  protected folderName(id: string | null): string {
    if (!id) return 'Mi unidad';
    return this.pathOf(this.folders().find((f) => f.id === id) ?? null).map((f) => f.name).join(' / ');
  }

  // --- Tabla y categorías ---------------------------------------------------------
  /** En Mi unidad, todos los archivos por fecha; dentro de una carpeta, los suyos. */
  protected readonly visibleFiles = computed(() => {
    const folder = this.currentFolder();
    const cat = this.categoryFilter();
    let list = folder ? this.files().filter((f) => f.folderId === folder.id) : [...this.files()].sort((a, b) => b.date.localeCompare(a.date));
    if (cat) list = list.filter((f) => f.category === cat.category);
    return list;
  });

  protected readonly categoryCards = computed(() =>
    this.categories.map((c) => {
      const inCat = this.files().filter((f) => f.category === c.category);
      const bytes = inCat.reduce((sum, f) => sum + f.bytes, 0);
      return {
        ...c,
        used: `${Math.round((bytes / CAPACITY) * 100)}% usado`,
        files: `${inCat.length} ${inCat.length === 1 ? 'archivo' : 'archivos'}`,
        size: formatBytes(bytes),
      };
    }),
  );

  protected readonly storage = computed(() => {
    const used = this.files().reduce((sum, f) => sum + f.bytes, 0);
    let acc = 0;
    const segments = this.categories
      .map((c) => ({ label: c.title, color: c.color, bytes: this.files().filter((f) => f.category === c.category).reduce((s, f) => s + f.bytes, 0) }))
      .filter((s) => s.bytes > 0);
    const stops = segments.map((s) => {
      const from = acc;
      acc += (s.bytes / CAPACITY) * 100;
      return `${s.color} ${from}% ${acc}%`;
    });
    stops.push(`var(--cb-color-surface-hover) ${acc}% 100%`);
    return {
      used: formatBytes(used),
      free: formatBytes(Math.max(0, CAPACITY - used)),
      capacity: formatBytes(CAPACITY),
      gradient: `conic-gradient(${stops.join(', ')})`,
      segments,
    };
  });

  protected iconOf(category: Category): string {
    return this.categories.find((c) => c.category === category)?.icon ?? 'file';
  }

  protected size(bytes: number): string {
    return formatBytes(bytes);
  }

  protected formatDate(iso: string): string {
    return DATE_FORMAT.format(new Date(`${iso}T00:00:00`));
  }

  protected filterBy(cat: Cat): void {
    this.categoryFilter.set(cat);
    this.status.set(`Mostrando ${cat.title.toLowerCase()}.`);
  }

  // --- Subir archivos ---------------------------------------------------------------
  protected upload(list: FileList | null): void {
    const chosen = list ? Array.from(list) : [];
    if (!chosen.length) return;
    const folderId = this.currentFolder()?.id ?? null;
    const today = new Date().toISOString().slice(0, 10);
    const added: FileItem[] = chosen.map((file) => ({
      id: `f${++nextId}`,
      name: file.name,
      category: categoryOf(file.name, file.type),
      bytes: file.size,
      date: today,
      folderId,
      url: URL.createObjectURL(file),
    }));
    this.files.update((files) => [...added, ...files]);
    this.categoryFilter.set(null);
    const where = this.currentFolder()?.name ?? 'Mi unidad';
    this.status.set(added.length === 1 ? `Subiste «${added[0].name}» a ${where}.` : `Subiste ${added.length} archivos a ${where}.`);
  }

  private hasFiles(event: DragEvent): boolean {
    return !!event.dataTransfer?.types.includes('Files');
  }

  protected onDragEnter(event: DragEvent): void {
    if (!this.hasFiles(event)) return;
    this.dragDepth++;
    this.dragging.set(true);
  }

  protected onDragOver(event: DragEvent): void {
    if (!this.hasFiles(event)) return;
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  protected onDragLeave(): void {
    if (this.dragDepth > 0 && --this.dragDepth === 0) this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    if (!this.hasFiles(event)) return;
    event.preventDefault();
    this.dragDepth = 0;
    this.dragging.set(false);
    this.upload(event.dataTransfer!.files);
  }

  // --- Menús ⋮ (acciones con command) -------------------------------------------------
  private readonly folderMenus = computed(
    () =>
      new Map(
        this.folders().map((f) => [
          f.id,
          [
            { label: 'Abrir', icon: 'folder', command: () => this.openFolder(f) },
            { label: 'Renombrar', icon: 'pencil', command: () => this.startRename({ kind: 'folder', item: f }) },
            { label: 'Mover a…', icon: 'folder-input', command: () => this.startMove({ kind: 'folder', item: f }) },
            { label: '', separator: true },
            { label: 'Eliminar', icon: 'trash', command: () => this.deleteTarget.set({ kind: 'folder', item: f }) },
          ] satisfies CbMenuItem[],
        ]),
      ),
  );

  protected folderMenu(folder: Folder): CbMenuItem[] {
    return this.folderMenus().get(folder.id) ?? [];
  }

  protected openRowMenu(event: MouseEvent, row: FileItem): void {
    this.rowMenuItems.set([
      { label: 'Descargar', icon: 'download', disabled: !row.url, command: () => this.download(row) },
      { label: 'Renombrar', icon: 'pencil', command: () => this.startRename({ kind: 'file', item: row }) },
      { label: 'Mover a…', icon: 'folder-input', command: () => this.startMove({ kind: 'file', item: row }) },
      { label: '', separator: true },
      { label: 'Eliminar', icon: 'trash', command: () => this.deleteTarget.set({ kind: 'file', item: row }) },
    ]);
    // Con el menú abierto, su backdrop recibe el clic: aquí solo se abre.
    this.rowMenu().show(event.currentTarget as HTMLElement);
    this.menuRow.set(row);
  }

  /** Descarga un archivo subido (los de ejemplo no tienen contenido). */
  private download(file: FileItem): void {
    if (!file.url) return;
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
    this.status.set(`Descargando «${file.name}».`);
  }

  // --- Crear y renombrar -------------------------------------------------------------
  protected startCreateFolder(): void {
    this.nameValue.set('Nueva carpeta');
    this.nameDialog.set({ title: 'Nueva carpeta', target: null });
  }

  private startRename(target: Target): void {
    this.nameValue.set(target.item.name);
    this.nameDialog.set({ title: 'Renombrar', target });
  }

  protected confirmName(): void {
    const dialog = this.nameDialog();
    const name = this.nameValue().trim();
    if (!dialog || !name) return;
    const target = dialog.target;
    if (!target) {
      const folder: Folder = { id: `d${++nextId}`, name, parentId: this.currentFolder()?.id ?? null };
      this.folders.update((list) => [...list, folder]);
      this.status.set(`Creaste la carpeta «${name}».`);
    } else if (target.kind === 'folder') {
      this.folders.update((list) => list.map((f) => (f.id === target.item.id ? { ...f, name } : f)));
      if (this.currentFolder()?.id === target.item.id) this.currentFolder.update((f) => f && { ...f, name });
      this.status.set(`«${target.item.name}» ahora se llama «${name}».`);
    } else {
      this.files.update((list) => list.map((f) => (f.id === target.item.id ? { ...f, name } : f)));
      this.status.set(`«${target.item.name}» ahora se llama «${name}».`);
    }
    this.nameDialog.set(null);
  }

  // --- Mover -----------------------------------------------------------------------------
  /** Destinos posibles: Mi unidad y las carpetas (sin la propia ni sus subcarpetas). */
  protected readonly moveOptions = computed(() => {
    const target = this.moveTarget();
    const excluded = target?.kind === 'folder' ? this.subtree(target.item.id) : new Set<string>();
    return [
      { id: 'root', label: 'Mi unidad' },
      ...this.folders()
        .filter((f) => !excluded.has(f.id))
        .map((f) => ({ id: f.id, label: this.folderName(f.id) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];
  });

  private startMove(target: Target): void {
    const current = target.kind === 'folder' ? target.item.parentId : target.item.folderId;
    this.moveDestination.set(current ?? 'root');
    this.moveTarget.set(target);
  }

  protected confirmMove(): void {
    const target = this.moveTarget();
    if (!target) return;
    const dest = this.moveDestination() === 'root' ? null : this.moveDestination();
    if (target.kind === 'folder') {
      this.folders.update((list) => list.map((f) => (f.id === target.item.id ? { ...f, parentId: dest } : f)));
    } else {
      this.files.update((list) => list.map((f) => (f.id === target.item.id ? { ...f, folderId: dest } : f)));
    }
    this.status.set(`Moviste «${target.item.name}» a ${this.folderName(dest)}.`);
    this.moveTarget.set(null);
  }

  // --- Eliminar ------------------------------------------------------------------------
  protected readonly deleteMessage = computed(() => {
    const target = this.deleteTarget();
    if (!target) return '';
    if (target.kind === 'file') return `¿Eliminar el archivo «${target.item.name}»? Esta acción no se puede deshacer.`;
    const { files } = this.folderStats(target.item);
    const subfolders = this.subtree(target.item.id).size - 1;
    const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
    const parts = [files && count(files, 'archivo', 'archivos'), subfolders && count(subfolders, 'subcarpeta', 'subcarpetas')].filter(Boolean);
    const extra = parts.length ? ` con ${parts.join(' y ')}` : '';
    return `¿Eliminar la carpeta «${target.item.name}»${extra}? Esta acción no se puede deshacer.`;
  });

  protected confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    const removed =
      target.kind === 'folder'
        ? ((ids) => {
            this.folders.update((list) => list.filter((f) => !ids.has(f.id)));
            const gone = this.files().filter((f) => f.folderId && ids.has(f.folderId));
            const current = this.currentFolder();
            if (current && ids.has(current.id)) this.goTo(this.folders().find((f) => f.id === target.item.parentId) ?? null);
            return gone;
          })(this.subtree(target.item.id))
        : [target.item];
    const goneIds = new Set(removed.map((f) => f.id));
    removed.forEach((f) => f.url && URL.revokeObjectURL(f.url));
    this.files.update((list) => list.filter((f) => !goneIds.has(f.id)));
    this.status.set(`Eliminaste «${target.item.name}».`);
    this.deleteTarget.set(null);
  }

  protected readonly htmlCode = `<div
  class="fm"
  [class.fm--dragging]="dragging()"
  (dragenter)="onDragEnter($event)"
  (dragover)="onDragOver($event)"
  (dragleave)="onDragLeave()"
  (drop)="onDrop($event)"
>
  <div class="fm__top">
    <cb-breadcrumb [items]="crumbs()" />
    <div class="fm__actions">
      <cb-button size="sm" variant="outlined" severity="secondary" (click)="startCreateFolder()">
        <cb-icon name="folder" [size]="15" aria-hidden="true" /> Nueva carpeta
      </cb-button>
      <cb-button size="sm" (click)="fileInput.click()">
        <cb-icon name="upload" [size]="15" aria-hidden="true" /> Subir archivos
      </cb-button>
      <input #fileInput type="file" multiple hidden (change)="upload(fileInput.files); fileInput.value = ''" />
    </div>
  </div>

  @if (!currentFolder()) {
    <cb-card class="fm__panel">
      <div class="fm__panel-head"><h3 class="fm__panel-title">Por categoría</h3></div>
      <div class="fm__cats">
        @for (c of categoryCards(); track c.title) {
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
  }

  <div class="fm__grid" [class.fm__grid--single]="currentFolder()">
    <cb-card class="fm__panel">
      <div class="fm__panel-head">
        <h3 class="fm__panel-title">{{ currentFolder() ? 'Subcarpetas' : 'Carpetas' }}</h3>
      </div>
      @if (childFolders().length) {
        <div class="fm__folders">
          @for (f of childFolders(); track f.id) {
            <cb-folder-card
              [name]="f.name"
              [files]="folderStats(f).files"
              [filesLabel]="folderStats(f).files === 1 ? 'archivo' : 'archivos'"
              [size]="folderStats(f).size"
              [actions]="folderMenu(f)"
              clickable
              (open)="openFolder(f)"
            />
          }
        </div>
      } @else {
        <p class="fm__empty">No hay carpetas aquí. Crea una con «Nueva carpeta».</p>
      }
    </cb-card>

    @if (!currentFolder()) {
      <cb-card class="fm__panel">
        <div class="fm__panel-head"><h3 class="fm__panel-title">Almacenamiento</h3></div>
        <p class="fm__storage-free">{{ storage().free }} libres</p>
        <div class="fm__donut" [style.background]="storage().gradient">
          <div class="fm__donut-hole"><strong>{{ storage().used }}</strong><span>de {{ storage().capacity }}</span></div>
        </div>
        <ul class="fm__legend">
          @for (s of storage().segments; track s.label) {
            <li><span class="fm__legend-dot" [style.background]="s.color"></span>{{ s.label }}</li>
          }
        </ul>
      </cb-card>
    }
  </div>

  <cb-card class="fm__panel">
    <div class="fm__panel-head">
      <h3 class="fm__panel-title">{{ currentFolder() ? 'Archivos' : 'Archivos recientes' }}</h3>
      @if (categoryFilter(); as cat) {
        <cb-chip [label]="cat.title" [icon]="cat.icon" [removable]="true" (removed)="categoryFilter.set(null)" />
      }
    </div>
    <cb-table
      style="width: 100%"
      [value]="visibleFiles()"
      [columns]="fileColumns()"
      size="sm"
      [ariaLabel]="currentFolder() ? 'Archivos de ' + currentFolder()!.name : 'Archivos recientes'"
      emptyMessage="No hay archivos. Súbelos con el botón o arrástralos aquí."
    >
      <ng-template cbTableCell="name" let-row>
        <span class="fm__file"><cb-icon [name]="iconOf(row.category)" [size]="16" aria-hidden="true" /> {{ row.name }}</span>
      </ng-template>
      <ng-template cbTableCell="folderId" let-value="value">{{ folderName(value) }}</ng-template>
      <ng-template cbTableCell="bytes" let-value="value">{{ size(value) }}</ng-template>
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
    <cb-menu #rowMenu [items]="rowMenuItems()" (hidden)="menuRow.set(null)" />
  </cb-card>

  <p class="fm__status" role="status">{{ status() }}</p>

  @if (dragging()) {
    <div class="fm__dropzone" aria-hidden="true">
      <cb-icon name="cloud-upload" [size]="36" />
      <span>Suelta para subir a {{ currentFolder()?.name ?? 'Mi unidad' }}</span>
    </div>
  }
</div>

<cb-dialog [visible]="nameDialog() !== null" (visibleChange)="!$event && nameDialog.set(null)" [header]="nameDialog()?.title ?? ''" width="24rem">
  <form (submit)="$event.preventDefault(); confirmName()">
    <cb-input label="Nombre" [(value)]="nameValue" [error]="nameValue().trim() ? '' : 'Escribe un nombre.'" required />
  </form>
  <div cb-dialog-footer class="fm__dialog-actions">
    <cb-button variant="text" severity="secondary" (click)="nameDialog.set(null)">Cancelar</cb-button>
    <cb-button [disabled]="!nameValue().trim()" (click)="confirmName()">Guardar</cb-button>
  </div>
</cb-dialog>

<cb-dialog [visible]="moveTarget() !== null" (visibleChange)="!$event && moveTarget.set(null)" header="Mover a…" width="26rem">
  <span class="fm__label" id="fm-move-label">Carpeta de destino</span>
  <cb-select [options]="moveOptions()" optionLabel="label" optionValue="id" [(value)]="moveDestination" ariaLabelledBy="fm-move-label" />
  <div cb-dialog-footer class="fm__dialog-actions">
    <cb-button variant="text" severity="secondary" (click)="moveTarget.set(null)">Cancelar</cb-button>
    <cb-button (click)="confirmMove()">Mover</cb-button>
  </div>
</cb-dialog>

<cb-dialog [visible]="deleteTarget() !== null" (visibleChange)="!$event && deleteTarget.set(null)" header="Eliminar" width="24rem">
  <p class="fm__dialog-text">{{ deleteMessage() }}</p>
  <div cb-dialog-footer class="fm__dialog-actions">
    <cb-button variant="text" severity="secondary" (click)="deleteTarget.set(null)">Cancelar</cb-button>
    <cb-button severity="danger" (click)="confirmDelete()">Eliminar</cb-button>
  </div>
</cb-dialog>`;
}
