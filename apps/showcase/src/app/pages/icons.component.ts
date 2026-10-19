import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CbIcon, cbCoreIcons } from '@caribeng/ui/icon';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-icons-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbIcon,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Foundations"
      title="Icons"
      lead="Iconos de CaribeNG (derivados de Lucide, ISC) en SVG inline. Heredan el color del texto (currentColor) y escalan con el tamaño. Sin dependencia en runtime."
    />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Basic"
      description="Usa name con cualquier icono del set núcleo. Toma el color del texto."
      [code]="basicCode"
    >
      <div style="display: flex; align-items: center; gap: 1.25rem; font-size: 1.25rem">
        <cb-icon name="check" />
        <cb-icon name="calendar" />
        <cb-icon name="search" />
        <cb-icon name="eye" ariaLabel="Ver" />
        <span style="color: var(--cb-color-primary-500)"><cb-icon name="circle-check" /></span>
      </div>
    </doc-section>

    <doc-section
      id="sizes"
      title="Tamaños"
      description="size = sm (16) · md (20) · lg (24) · xl (32) o un número en px."
      [code]="sizesCode"
    >
      <div style="display: flex; align-items: center; gap: 1.25rem">
        <cb-icon name="calendar" size="sm" />
        <cb-icon name="calendar" size="md" />
        <cb-icon name="calendar" size="lg" />
        <cb-icon name="calendar" size="xl" />
        <cb-icon name="calendar" [size]="48" />
      </div>
    </doc-section>

    <doc-section
      id="spin"
      title="Animación (spin)"
      description="spin gira el icono; ideal para 'loader'."
      [code]="spinCode"
    >
      <div style="display: flex; align-items: center; gap: 1.25rem; font-size: 1.5rem">
        <cb-icon name="loader" spin ariaLabel="Cargando" />
      </div>
    </doc-section>

    <doc-section
      id="color"
      title="Color por severidad"
      description="currentColor hace que el icono tome el color del contenedor."
      [code]="colorCode"
    >
      <div style="display: flex; align-items: center; gap: 1.5rem; font-size: 1.5rem">
        <span style="color: var(--cb-color-info-500)"><cb-icon name="info" /></span>
        <span style="color: var(--cb-color-success-500)"><cb-icon name="circle-check" /></span>
        <span style="color: var(--cb-color-warning-500)"><cb-icon name="triangle-alert" /></span>
        <span style="color: var(--cb-color-danger-500)"><cb-icon name="circle-x" /></span>
      </div>
    </doc-section>

    <doc-section
      id="catalog"
      title="Catálogo completo (1891)"
      description="¿Falta uno? Importa cualquiera de los 1891 iconos desde @caribeng/ui/icons (tree-shakeable: solo entra al bundle lo que importas) y regístralo."
      [code]="catalogCode"
    />

    <doc-section
      id="custom"
      title="Añadir iconos propios"
      description="El registro es extensible: registra tus SVG con provideCbIcons."
      [code]="customCode"
    />

    <doc-section
      id="gallery"
      title="Set núcleo"
      [description]="galleryDescription"
    >
      <div class="icon-search-wrap">
        <cb-icon name="search" [size]="16" aria-hidden="true" />
        <input
          type="search"
          class="icon-search"
          placeholder="Buscar icono por nombre…"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
          aria-label="Buscar icono"
        />
        <span class="icon-search-count">{{ filtered().length }}</span>
      </div>
      <div class="icon-gallery">
        @for (name of filtered(); track name) {
          <figure class="icon-cell">
            <cb-icon [name]="name" size="lg" />
            <figcaption>{{ name }}</figcaption>
          </figure>
        } @empty {
          <p class="icon-empty">Sin resultados para «{{ query() }}».</p>
        }
      </div>
    </doc-section>
  `,
  styles: [
    `
      .icon-search-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        margin-bottom: 1rem;
        padding: 0.5rem 0.85rem;
        border: 1px solid var(--cb-color-border-strong, var(--cb-color-border));
        border-radius: var(--cb-radius-md);
        background: var(--cb-color-bg);
        color: var(--cb-color-text-muted);
      }
      .icon-search {
        flex: 1;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: var(--cb-color-text);
        font: inherit;
      }
      .icon-search-count {
        flex: none;
        font-size: 0.8rem;
        color: var(--cb-color-text-muted);
        font-variant-numeric: tabular-nums;
      }
      .icon-empty {
        grid-column: 1 / -1;
        margin: 0;
        padding: 1.5rem;
        text-align: center;
        color: var(--cb-color-text-muted);
      }
      .icon-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
        gap: 0.75rem;
        width: 100%;
      }
      .icon-cell {
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 0.5rem;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-md);
        background: var(--cb-color-bg);
        color: var(--cb-color-text);
      }
      .icon-cell cb-icon {
        color: var(--cb-color-text);
      }
      .icon-cell figcaption {
        font-size: 0.75rem;
        color: var(--cb-color-text-muted);
        font-family: var(--cb-font-mono, monospace);
        text-align: center;
        word-break: break-word;
      }
    `,
  ],
})
export class IconsComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly iconNames = Object.keys(cbCoreIcons).sort();
  protected readonly galleryDescription = `${this.iconNames.length} iconos en el set núcleo (auto-registrados) · 1891 disponibles en el catálogo. Usa cualquiera del núcleo por su nombre.`;

  protected readonly query = signal('');
  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.iconNames.filter((n) => n.includes(q)) : this.iconNames;
  });

  protected readonly catalogCode = `import { heartPulse, wifi } from '@caribeng/ui/icons';
import { provideCbIcons } from '@caribeng/ui/icon';

bootstrapApplication(App, {
  providers: [
    provideCaribeNG(),
    provideCbIcons({ 'heart-pulse': heartPulse, wifi }),
  ],
});

// luego:  <cb-icon name="heart-pulse" />  ·  <cb-icon name="wifi" />`;

  protected readonly installCode = `npm install @caribeng/ui`;

  protected readonly importCode = `import { CbIcon } from '@caribeng/ui/icon';

@Component({
  imports: [CbIcon],
  // ...
})
export class MyComponent {}`;

  protected readonly basicCode = `<cb-icon name="check" />
<cb-icon name="calendar" />
<cb-icon name="search" />`;

  protected readonly sizesCode = `<cb-icon name="calendar" size="sm" />   <!-- 16px -->
<cb-icon name="calendar" size="md" />   <!-- 20px (def.) -->
<cb-icon name="calendar" size="lg" />   <!-- 24px -->
<cb-icon name="calendar" size="xl" />   <!-- 32px -->
<cb-icon name="calendar" [size]="48" /> <!-- px exactos -->`;

  protected readonly spinCode = `<cb-icon name="loader" spin ariaLabel="Cargando" />`;

  protected readonly colorCode = `<!-- El icono hereda el color del contenedor (currentColor) -->
<span style="color: var(--cb-color-success-500)">
  <cb-icon name="circle-check" />
</span>`;

  protected readonly customCode = `import { provideCbIcons } from '@caribeng/ui/icon';

bootstrapApplication(App, {
  providers: [
    provideCaribeNG(),
    // registra tus propios iconos (contenido interno del SVG, grilla 24x24)
    provideCbIcons({
      'mi-logo': '<path d="M4 4h16v16H4z" />',
    }),
  ],
});

// luego:  <cb-icon name="mi-logo" />`;
}
