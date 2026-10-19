import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbCard } from '@caribeng/ui/card';
import { CbButton } from '@caribeng/ui/button';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

interface MediaCat {
  name: string;
  icon: string;
  tint: string;
  files: number;
  used: number;
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
 * Template (receta copiable): gestor de archivos tipo Drive — tarjetas por
 * categoría de media, carpetas, detalle de almacenamiento (donut) y tabla de
 * archivos recientes. Composición con componentes CaribeNG.
 */
@Component({
  selector: 'doc-file-manager-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbIcon, CbCard, CbButton, DocPageHeaderComponent, DocSectionComponent],
  template: `
    <doc-page-header
      eyebrow="Template"
      title="File Manager"
      lead="Gestor de archivos tipo Drive: categorías de media, carpetas, detalle de almacenamiento y archivos recientes. Composición con componentes CaribeNG."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode" [codeTs]="tsCode">
      <div class="fm">
        <div class="fm__breadcrumb">
          <cb-icon name="house" [size]="15" aria-hidden="true" />
          <span>Home</span>
          <cb-icon name="chevron-right" [size]="14" aria-hidden="true" />
          <span class="fm__crumb-active">File Manager</span>
        </div>

        <!-- All Media -->
        <cb-card class="fm__panel">
          <div class="fm__panel-head">
            <h3 class="fm__panel-title">All Media</h3>
            <div class="fm__panel-actions">
              <span class="fm__search">
                <cb-icon name="search" [size]="15" aria-hidden="true" />
                <input type="text" placeholder="Buscar…" aria-label="Buscar archivos" />
              </span>
              <cb-button size="sm">
                <cb-icon name="plus" [size]="15" aria-hidden="true" />
                Subir archivo
              </cb-button>
            </div>
          </div>
          <div class="fm__cats">
            @for (c of categories; track c.name) {
              <div class="fm__cat">
                <span class="fm__cat-icon" [style.background]="c.tint + '22'" [style.color]="c.tint">
                  <cb-icon [name]="c.icon" [size]="18" aria-hidden="true" />
                </span>
                <div class="fm__cat-body">
                  <div class="fm__cat-row">
                    <span class="fm__cat-name">{{ c.name }}</span>
                    <span class="fm__cat-files">{{ c.files }} archivos</span>
                  </div>
                  <div class="fm__cat-row fm__cat-row--muted">
                    <span>{{ c.used }}% usado</span>
                    <span>{{ c.size }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </cb-card>

        <div class="fm__grid">
          <!-- Folders -->
          <cb-card class="fm__panel">
            <div class="fm__panel-head">
              <h3 class="fm__panel-title">Carpetas</h3>
              <a class="fm__link" href="#" (click)="$event.preventDefault()">
                Ver todo <cb-icon name="chevron-right" [size]="14" aria-hidden="true" />
              </a>
            </div>
            <div class="fm__folders">
              @for (f of folders; track f.name) {
                <div class="fm__folder">
                  <div class="fm__folder-top">
                    <cb-icon name="folder" [size]="26" class="fm__folder-icon" aria-hidden="true" />
                    <span class="fm__dots" aria-hidden="true">⋮</span>
                  </div>
                  <div class="fm__folder-name">{{ f.name }}</div>
                  <div class="fm__folder-row fm__cat-row--muted">
                    <span>{{ f.files }} archivos</span>
                    <span>{{ f.size }}</span>
                  </div>
                </div>
              }
            </div>
          </cb-card>

          <!-- Storage -->
          <cb-card class="fm__panel">
            <div class="fm__panel-head">
              <h3 class="fm__panel-title">Almacenamiento</h3>
            </div>
            <p class="fm__storage-free">585 GB libres</p>
            <div class="fm__donut" [style.background]="donutGradient">
              <div class="fm__donut-hole">
                <strong>135 GB</strong>
                <span>de 720 GB</span>
              </div>
            </div>
            <ul class="fm__legend">
              @for (s of segments; track s.label) {
                <li>
                  <span class="fm__legend-dot" [style.background]="s.color"></span>
                  {{ s.label }}
                </li>
              }
            </ul>
          </cb-card>
        </div>

        <!-- Recent -->
        <cb-card class="fm__panel">
          <div class="fm__panel-head">
            <h3 class="fm__panel-title">Archivos recientes</h3>
            <a class="fm__link" href="#" (click)="$event.preventDefault()">
              Ver todo <cb-icon name="chevron-right" [size]="14" aria-hidden="true" />
            </a>
          </div>
          <table class="fm__table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Tamaño</th>
                <th>Modificado</th>
                <th class="fm__th-action">Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (r of recent; track r.name) {
                <tr>
                  <td>
                    <span class="fm__file">
                      <cb-icon [name]="r.icon" [size]="16" aria-hidden="true" />
                      {{ r.name }}
                    </span>
                  </td>
                  <td class="fm__muted">{{ r.category }}</td>
                  <td class="fm__muted">{{ r.size }}</td>
                  <td class="fm__muted">{{ r.date }}</td>
                  <td>
                    <span class="fm__row-actions">
                      <button type="button" class="fm__icon-btn" aria-label="Ver"><cb-icon name="eye" [size]="16" aria-hidden="true" /></button>
                      <button type="button" class="fm__icon-btn" aria-label="Eliminar"><cb-icon name="trash" [size]="16" aria-hidden="true" /></button>
                    </span>
                  </td>
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
        gap: var(--cb-space-3, 0.75rem);
        margin-bottom: var(--cb-space-4, 1rem);
        flex-wrap: wrap;
      }
      .fm__panel-title {
        margin: 0;
        font-size: 1rem;
      }
      .fm__panel-actions {
        display: flex;
        align-items: center;
        gap: var(--cb-space-3, 0.75rem);
      }
      .fm__search {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.4rem 0.7rem;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-md);
        color: var(--cb-color-text-muted);
      }
      .fm__search input {
        border: 0;
        outline: 0;
        background: transparent;
        color: var(--cb-color-text);
        font: inherit;
      }
      .fm__cats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: var(--cb-space-3, 0.75rem);
      }
      .fm__cat {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.85rem;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-md);
      }
      .fm__cat-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        border-radius: var(--cb-radius-md);
        flex: none;
      }
      .fm__cat-body {
        flex: 1;
        min-width: 0;
      }
      .fm__cat-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        font-size: 0.85rem;
      }
      .fm__cat-name {
        font-weight: 600;
      }
      .fm__cat-row--muted {
        color: var(--cb-color-text-muted);
        font-size: 0.78rem;
        margin-top: 0.15rem;
      }
      .fm__grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: var(--cb-space-4, 1rem);
      }
      .fm__link {
        display: inline-flex;
        align-items: center;
        gap: 0.2rem;
        font-size: 0.82rem;
        color: var(--cb-color-primary-600, #059669);
        text-decoration: none;
      }
      .fm__folders {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: var(--cb-space-3, 0.75rem);
      }
      .fm__folder {
        padding: 0.85rem;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-md);
      }
      .fm__folder-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .fm__folder-icon {
        color: #f5b301;
      }
      .fm__dots {
        color: var(--cb-color-text-muted);
        cursor: pointer;
        line-height: 1;
      }
      .fm__folder-name {
        margin: 0.6rem 0 0.2rem;
        font-weight: 600;
        font-size: 0.9rem;
      }
      .fm__folder-row {
        display: flex;
        justify-content: space-between;
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
        gap: 0.1rem;
      }
      .fm__donut-hole strong {
        font-size: 1.05rem;
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
      .fm__th-action {
        text-align: right;
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
      .fm__row-actions {
        display: flex;
        gap: 0.35rem;
        justify-content: flex-end;
      }
      .fm__icon-btn {
        display: inline-flex;
        padding: 0.3rem;
        border: 0;
        border-radius: var(--cb-radius-sm);
        background: transparent;
        color: var(--cb-color-text-muted);
        cursor: pointer;
      }
      .fm__icon-btn:hover {
        background: var(--cb-color-surface-hover, rgba(0, 0, 0, 0.05));
        color: var(--cb-color-text);
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

  protected readonly categories: MediaCat[] = [
    { name: 'Imágenes', icon: 'image', tint: '#10b981', files: 245, used: 17, size: '26.4 GB' },
    { name: 'Videos', icon: 'play', tint: '#ec4899', files: 245, used: 22, size: '26.4 GB' },
    { name: 'Audios', icon: 'bell', tint: '#3b82f6', files: 830, used: 23, size: '18.9 GB' },
    { name: 'Apps', icon: 'puzzle', tint: '#f97316', files: 1200, used: 65, size: '85.3 GB' },
    { name: 'Documentos', icon: 'file', tint: '#f59e0b', files: 78, used: 10, size: '5.4 GB' },
    { name: 'Descargas', icon: 'download', tint: '#8b5cf6', files: 245, used: 16, size: '26.4 GB' },
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

  /** conic-gradient del donut a partir de los segmentos. */
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
    { name: 'Mountain.png', icon: 'image', category: 'Imagen', size: '5.4 MB', date: '10 Feb 2027' },
    { name: 'CV.pdf', icon: 'file', category: 'Documento', size: '12 MB', date: '17 Jun 2027' },
  ];

  protected readonly htmlCode = `<cb-card>
  <div class="panel-head">
    <h3>All Media</h3>
    <div class="actions">
      <span class="search"><cb-icon name="search" [size]="15" /><input placeholder="Buscar…" /></span>
      <cb-button size="sm"><cb-icon name="plus" [size]="15" /> Subir archivo</cb-button>
    </div>
  </div>
  <div class="cats">
    @for (c of categories; track c.name) {
      <div class="cat">
        <span class="cat-icon" [style.background]="c.tint + '22'" [style.color]="c.tint">
          <cb-icon [name]="c.icon" [size]="18" />
        </span>
        <div>
          <div class="row"><b>{{ c.name }}</b><span>{{ c.files }} archivos</span></div>
          <div class="row muted"><span>{{ c.used }}% usado</span><span>{{ c.size }}</span></div>
        </div>
      </div>
    }
  </div>
</cb-card>

<!-- Donut de almacenamiento: conic-gradient a partir de los segmentos -->
<div class="donut" [style.background]="donutGradient"><div class="hole"><b>135 GB</b></div></div>

<!-- Tabla de recientes: nombre + icono por tipo, categoría, tamaño, fecha, acciones (eye/trash) -->`;

  protected readonly tsCode = `import { Component } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbCard } from '@caribeng/ui/card';
import { CbButton } from '@caribeng/ui/button';

@Component({
  selector: 'app-file-manager',
  imports: [CbIcon, CbCard, CbButton],
  templateUrl: './file-manager.component.html',
  styleUrl: './file-manager.component.css',
})
export class FileManagerComponent {
  readonly categories = [
    { name: 'Imágenes', icon: 'image', tint: '#10b981', files: 245, used: 17, size: '26.4 GB' },
    { name: 'Videos', icon: 'play', tint: '#ec4899', files: 245, used: 22, size: '26.4 GB' },
    // …
  ];

  readonly segments = [
    { label: 'Descargas', pct: 30, color: '#8b5cf6' },
    { label: 'Apps', pct: 35, color: '#f97316' },
    { label: 'Documentos', pct: 20, color: '#f59e0b' },
    { label: 'Media', pct: 15, color: '#10b981' },
  ];

  // conic-gradient acumulando los porcentajes
  readonly donutGradient = (() => {
    let acc = 0;
    return 'conic-gradient(' + this.segments.map(s => {
      const from = acc; acc += s.pct; return \`\${s.color} \${from}% \${acc}%\`;
    }).join(', ') + ')';
  })();
}`;
}
