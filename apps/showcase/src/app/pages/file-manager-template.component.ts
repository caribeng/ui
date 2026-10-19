import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbCard } from '@caribeng/ui/card';
import { CbButton } from '@caribeng/ui/button';
import { CbFileCard } from '@caribeng/ui/file-card';
import { CbFolderCard } from '@caribeng/ui/folder-card';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

interface Cat {
  icon: string;
  color: string;
  title: string;
  used: string;
  files: string;
  size: string;
}
interface Folder {
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
  name: string;
  icon: string;
  category: string;
  size: string;
  date: string;
}

/**
 * Template (receta copiable): gestor de archivos tipo Drive compuesto con los
 * componentes genéricos cb-file-card y cb-folder-card, más un donut de
 * almacenamiento y una tabla de recientes.
 */
@Component({
  selector: 'doc-file-manager-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbIcon,
    CbCard,
    CbButton,
    CbFileCard,
    CbFolderCard,
    DocPageHeaderComponent,
    DocSectionComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Template"
      title="File Manager"
      lead="Gestor de archivos tipo Drive compuesto con cb-file-card y cb-folder-card, más un donut de almacenamiento y una tabla de archivos recientes."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode">
      <div class="fm">
        <div class="fm__breadcrumb">
          <cb-icon name="house" [size]="15" aria-hidden="true" />
          <span>Home</span>
          <cb-icon name="chevron-right" [size]="14" aria-hidden="true" />
          <span class="fm__crumb-active">File Manager</span>
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
              />
            }
          </div>
        </cb-card>

        <div class="fm__grid">
          <cb-card class="fm__panel">
            <div class="fm__panel-head"><h3 class="fm__panel-title">Carpetas</h3></div>
            <div class="fm__folders">
              @for (f of folders; track f.name) {
                <cb-folder-card [name]="f.name" [files]="f.files" [size]="f.size">
                  <span cb-folder-actions>⋮</span>
                </cb-folder-card>
              }
            </div>
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
          <div class="fm__panel-head"><h3 class="fm__panel-title">Archivos recientes</h3></div>
          <table class="fm__table">
            <thead>
              <tr><th>Nombre</th><th>Categoría</th><th>Tamaño</th><th>Modificado</th></tr>
            </thead>
            <tbody>
              @for (r of recent; track r.name) {
                <tr>
                  <td><span class="fm__file"><cb-icon [name]="r.icon" [size]="16" aria-hidden="true" /> {{ r.name }}</span></td>
                  <td class="fm__muted">{{ r.category }}</td>
                  <td class="fm__muted">{{ r.size }}</td>
                  <td class="fm__muted">{{ r.date }}</td>
                </tr>
              }
            </tbody>
          </table>
        </cb-card>
      </div>
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
      .fm__panel {
        display: block;
      }
      .fm__panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
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
      .fm__table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
      }
      .fm__table th {
        text-align: left;
        padding: 0.5rem 0.4rem;
        color: var(--cb-color-text-muted);
        font-weight: 600;
        border-bottom: 1px solid var(--cb-color-border);
      }
      .fm__table td {
        padding: 0.6rem 0.4rem;
        border-bottom: 1px solid var(--cb-color-border);
      }
      .fm__file {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
      }
      .fm__muted {
        color: var(--cb-color-text-muted);
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

  protected readonly categories: Cat[] = [
    { icon: 'image', color: '#10b981', title: 'Imágenes', used: '17% usado', files: '245 archivos', size: '26.4 GB' },
    { icon: 'play', color: '#ec4899', title: 'Videos', used: '22% usado', files: '245 archivos', size: '26.4 GB' },
    { icon: 'bell', color: '#3b82f6', title: 'Audios', used: '23% usado', files: '830 archivos', size: '18.9 GB' },
    { icon: 'puzzle', color: '#f97316', title: 'Apps', used: '65% usado', files: '1200 archivos', size: '85.3 GB' },
    { icon: 'file', color: '#f59e0b', title: 'Documentos', used: '10% usado', files: '78 archivos', size: '5.4 GB' },
    { icon: 'download', color: '#8b5cf6', title: 'Descargas', used: '16% usado', files: '245 archivos', size: '26.4 GB' },
  ];

  protected readonly folders: Folder[] = [
    { name: 'Imágenes', files: 345, size: '26.4 GB' },
    { name: 'Documentos', files: 130, size: '26.4 GB' },
    { name: 'Apps', files: 130, size: '26.4 GB' },
    { name: 'Descargas', files: 345, size: '26.4 GB' },
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

  protected readonly recent: RecentFile[] = [
    { name: 'Video_947954.mp4', icon: 'play', category: 'Video', size: '89 MB', date: '12 Ene 2027' },
    { name: 'Travel.jpg', icon: 'image', category: 'Imagen', size: '5.4 MB', date: '10 Feb 2027' },
    { name: 'Documento.pdf', icon: 'file', category: 'Documento', size: '1.2 MB', date: '8 Mar 2027' },
    { name: 'CV.pdf', icon: 'file', category: 'Documento', size: '12 MB', date: '17 Jun 2027' },
  ];

  protected readonly htmlCode = `<!-- All Media: rejilla de cb-file-card -->
<div class="cats">
  @for (c of categories; track c.title) {
    <cb-file-card [icon]="c.icon" [color]="c.color" [title]="c.title"
      [subtitle]="c.used" [value]="c.files" [valueSub]="c.size" />
  }
</div>

<!-- Carpetas: rejilla de cb-folder-card -->
<div class="folders">
  @for (f of folders; track f.name) {
    <cb-folder-card [name]="f.name" [files]="f.files" [size]="f.size">
      <span cb-folder-actions>⋮</span>
    </cb-folder-card>
  }
</div>

<!-- Donut de almacenamiento (conic-gradient) + tabla de recientes -->`;
}
