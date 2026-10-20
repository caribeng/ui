import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CbRating } from '@caribeng/ui/rating';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-rating-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, 
    ReactiveFormsModule,
    CbRating,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Formulario"
      title="Rating"
      lead="Valoración con estrellas. ControlValueAccessor, teclado (flechas, Home/End) y vista previa al pasar el cursor."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="Haz clic en una estrella; vuelve a hacer clic en la misma para limpiar." [code]="basicCode">
      <cb-rating [formControl]="valor" ariaLabel="Puntuación" />
      <p style="margin: 0.75rem 0 0; color: var(--cb-color-text-muted); font-size: 0.875rem">
        Valor: {{ valor.value }}
      </p>
    </doc-section>

    <doc-section id="stars" title="Número de estrellas" description="stars define cuántas estrellas se muestran." [code]="starsCode">
      <cb-rating [formControl]="diez" [stars]="10" ariaLabel="Puntuación sobre 10" />
    </doc-section>

    <doc-section id="sizes" title="Tamaños" description="Tres tamaños con size: sm, md (por defecto) y lg." [code]="sizesCode">
      <div style="display: flex; align-items: center; gap: 1.5rem">
        <cb-rating [(value)]="sm" size="sm" ariaLabel="sm" />
        <cb-rating [(value)]="md" ariaLabel="md" />
        <cb-rating [(value)]="lg" size="lg" ariaLabel="lg" />
      </div>
    </doc-section>

    <doc-section id="readonly" title="Solo lectura / Deshabilitado" description="readonly muestra el valor sin permitir cambios; disabled además atenúa el control." [code]="readonlyCode">
      <div style="display: flex; align-items: center; gap: 2rem">
        <cb-rating [(value)]="fijo" [readonly]="true" ariaLabel="Solo lectura" />
        <cb-rating [(value)]="fijo" [disabled]="true" ariaLabel="Deshabilitado" />
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class RatingDocComponent {
  protected readonly docApi = DOC_API['cb-rating'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly valor = new FormControl(3);
  protected readonly diez = new FormControl(7);
  protected readonly sm = signal(4);
  protected readonly md = signal(4);
  protected readonly lg = signal(4);
  protected readonly fijo = signal(4);

  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbRating } from '@caribeng/ui/rating';`;
  protected readonly basicCode = `<cb-rating formControlName="puntuacion" />`;
  protected readonly starsCode = `<cb-rating formControlName="puntuacion" [stars]="10" />`;
  protected readonly sizesCode = `<cb-rating [(value)]="sm" size="sm" />
<cb-rating [(value)]="md" />
<cb-rating [(value)]="lg" size="lg" />`;
  protected readonly readonlyCode = `<cb-rating [(value)]="fijo" [readonly]="true" />
<cb-rating [(value)]="fijo" [disabled]="true" />`;
}
