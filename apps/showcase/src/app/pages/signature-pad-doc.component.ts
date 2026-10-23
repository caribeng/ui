import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbSignaturePad } from '@caribeng/ui/signature-pad';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-signature-pad-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbSignaturePad, ReactiveFormsModule, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Form"
      title="SignaturePad"
      lead="Firma digital para contratos, recibos o autorizaciones: se firma con el ratón, el dedo o un lápiz (el trazo se afina con la velocidad y engorda con la presión) o, como alternativa accesible, escribiendo el nombre en letra manuscrita. Devuelve la firma como PNG, JPEG o SVG y funciona con Angular Forms."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Firmar un documento"
      description="[(value)] recibe la firma como data URL (PNG por defecto) al terminar cada trazo, listo para enviarlo a tu API o incrustarlo en un PDF. Deshacer quita el último trazo y Borrar, toda la firma. «Escribir» cambia al nombre tecleado."
      [code]="basicCode"
    >
      <div class="sg-grid">
        <cb-signature-pad [(value)]="firma" />
        <div class="sg-out">
          <span class="sg-label">value ({{ firma() ? kb(firma()) : 'vacío' }})</span>
          @if (firma()) {
            <img [src]="firma()" alt="Vista previa de la firma" class="sg-preview" />
          } @else {
            <p class="sg-empty">Firma en el área para ver aquí la imagen.</p>
          }
        </div>
      </div>
    </doc-section>

    <doc-section
      id="svg"
      title="SVG, sin fondo y otra tinta"
      description="format=&quot;svg&quot; da un SVG vectorial, que se ve nítido a cualquier tamaño; background=&quot;transparent&quot; lo deja sin fondo y penColor cambia la tinta. minWidth y maxWidth ajustan el grosor del trazo."
      [code]="svgCode"
    >
      <div style="width: 100%; max-width: 32rem">
        <cb-signature-pad [(value)]="firmaSvg" format="svg" background="transparent" penColor="#1d4ed8" [minWidth]="1.5" [maxWidth]="4.5" [typing]="false" height="9rem" />
      </div>
    </doc-section>

    <doc-section
      id="forms"
      title="Con formularios"
      description="Con [formControl] (o ngModel) el valor es la firma en el formato elegido y Validators.required pide que no esté vacía; el área se marca en rojo cuando el control es inválido y se ha tocado. disable() la desactiva."
      [code]="formsCode"
    >
      <form class="sg-form" (submit)="enviar($event)">
        <cb-signature-pad [formControl]="control" />
        @if (control.invalid && control.touched) {
          <p class="sg-error" role="alert">La firma es obligatoria.</p>
        }
        <div class="sg-actions">
          <button type="submit" class="sg-btn sg-btn--primary">Aceptar y firmar</button>
          <button type="button" class="sg-btn" (click)="control.disabled ? control.enable() : control.disable()">
            {{ control.disabled ? 'Activar' : 'Desactivar' }}
          </button>
        </div>
        <p class="sg-log">{{ estado() }}</p>
      </form>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .sg-grid {
        display: grid;
        grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
        gap: 1rem;
        width: 100%;
      }
      @media (max-width: 48rem) {
        .sg-grid {
          grid-template-columns: 1fr;
        }
      }
      .sg-out {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: 0;
      }
      .sg-label {
        color: var(--cb-color-text-muted);
        font-size: 0.75rem;
        font-family: var(--cb-font-mono);
      }
      .sg-preview {
        width: 100%;
        border: 1px dashed var(--cb-color-border-strong);
        border-radius: 8px;
        background: #fff;
      }
      .sg-empty,
      .sg-log {
        margin: 0;
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
      .sg-form {
        display: grid;
        gap: 0.75rem;
        width: 100%;
        max-width: 32rem;
      }
      .sg-error {
        margin: 0;
        color: var(--cb-color-danger);
        font-size: 0.875rem;
      }
      .sg-actions {
        display: flex;
        gap: 0.5rem;
      }
      .sg-btn {
        padding: 0.5rem 1rem;
        border: 1px solid var(--cb-color-border-strong);
        border-radius: 6px;
        background: transparent;
        color: var(--cb-color-text);
        font: inherit;
        cursor: pointer;
      }
      .sg-btn--primary {
        border-color: var(--cb-color-primary);
        background: var(--cb-color-primary);
        color: var(--cb-color-primary-contrast);
      }
    `,
  ],
})
export class SignaturePadDocComponent {
  protected readonly docApi = DOC_API['cb-signature-pad'];
  protected readonly a11y = DOC_A11Y['cb-signature-pad'];

  protected readonly firma = signal('');
  protected readonly firmaSvg = signal('');
  protected readonly control = new FormControl('', { nonNullable: true, validators: Validators.required });
  protected readonly estado = signal('');

  protected kb(url: string): string {
    return `${(url.length / 1024).toFixed(1)} kB`;
  }

  protected enviar(event: Event): void {
    event.preventDefault();
    this.control.markAsTouched();
    this.estado.set(this.control.valid ? `Firma enviada (${this.kb(this.control.value)}).` : '');
  }

  protected readonly importCode = `import { CbSignaturePad } from '@caribeng/ui/signature-pad';`;
  protected readonly basicCode = `<div class="sg-grid">
  <cb-signature-pad [(value)]="firma" />
  <div class="sg-out">
    <span class="sg-label">value ({{ firma() ? kb(firma()) : 'vacío' }})</span>
    @if (firma()) {
      <img [src]="firma()" alt="Vista previa de la firma" class="sg-preview" />
    } @else {
      <p class="sg-empty">Firma en el área para ver aquí la imagen.</p>
    }
  </div>
</div>`;
  protected readonly svgCode = `<cb-signature-pad [(value)]="firmaSvg" format="svg" background="transparent" penColor="#1d4ed8" [minWidth]="1.5" [maxWidth]="4.5" [typing]="false" height="9rem" />`;
  protected readonly formsCode = `<form class="sg-form" (submit)="enviar($event)">
  <cb-signature-pad [formControl]="control" />
  @if (control.invalid && control.touched) {
    <p class="sg-error" role="alert">La firma es obligatoria.</p>
  }
  <div class="sg-actions">
    <button type="submit" class="sg-btn sg-btn--primary">Aceptar y firmar</button>
    <button type="button" class="sg-btn" (click)="control.disabled ? control.enable() : control.disable()">
      {{ control.disabled ? 'Activar' : 'Desactivar' }}
    </button>
  </div>
  <p class="sg-log">{{ estado() }}</p>
</form>`;

  constructor() {
    inject(TocService).reset();
  }
}
