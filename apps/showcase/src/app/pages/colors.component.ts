import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

interface Palette {
  id: string;
  name: string;
  varBase: string;
  shades: number[];
}

const SCALE = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const SURFACE_SCALE = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

@Component({
  selector: 'doc-colors',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocSectionComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Foundations"
      title="Colors"
      lead="Paleta de design tokens (--cb-color-*). Cámbiala en vivo con el configurador de la barra superior."
    />

    @for (p of palettes; track p.id) {
      <doc-section [id]="p.id" [title]="p.name">
        <div class="swatches">
          @for (shade of p.shades; track shade) {
            <div class="swatch">
              <span
                class="swatch__chip"
                [style.background]="'var(--cb-color-' + p.varBase + '-' + shade + ')'"
              ></span>
              <span class="swatch__label">{{ shade }}</span>
            </div>
          }
        </div>
      </doc-section>
    }
  `,
  styles: [
    `
      :host { display: block; }
      .swatches {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
        gap: var(--cb-space-2);
        width: 100%;
      }
      .swatch { text-align: center; }
      .swatch__chip {
        display: block;
        height: 3rem;
        border-radius: var(--cb-radius-md);
        border: 1px solid var(--cb-color-border);
      }
      .swatch__label {
        display: block;
        font-family: var(--cb-font-mono);
        font-size: var(--cb-text-xs);
        color: var(--cb-color-text-muted);
        margin-top: var(--cb-space-1);
      }
    `,
  ],
})
export class ColorsComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly palettes: Palette[] = [
    { id: 'primary', name: 'Primary', varBase: 'primary', shades: SCALE },
    { id: 'surface', name: 'Surface', varBase: 'surface', shades: SURFACE_SCALE },
    { id: 'success', name: 'Success', varBase: 'success', shades: SCALE },
    { id: 'info', name: 'Info', varBase: 'info', shades: SCALE },
    { id: 'warning', name: 'Warning', varBase: 'warning', shades: SCALE },
    { id: 'danger', name: 'Danger', varBase: 'danger', shades: SCALE },
    { id: 'help', name: 'Help', varBase: 'help', shades: SCALE },
  ];
}
