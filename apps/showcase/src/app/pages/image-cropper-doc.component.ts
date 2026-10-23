import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbAvatar } from '@caribeng/ui/avatar';
import { CbImageCropper, type CbCropResult } from '@caribeng/ui/image-cropper';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-image-cropper-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbImageCropper, CbAvatar, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="File"
      title="ImageCropper"
      lead="Recortador de imagen para fotos de perfil y documentos: el recuadro se mueve y se redimensiona con ratón, dedo o teclado, con proporciones fijas o libre, forma circular, giro de 90°, vista previa y selección de archivo con botón o arrastrándolo. Devuelve el recorte como Blob y data URL, con el tamaño y el formato que elijas."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="avatar"
      title="Foto de perfil"
      description="shape=&quot;circle&quot; fija la proporción 1:1 y devuelve un PNG redondo con fondo transparente; preview muestra cómo quedará. output limita el tamaño (aquí, 256 px). Pulsa Recortar (o Enter en el recuadro) y el resultado aparece en el avatar."
      [code]="avatarCode"
    >
      <div class="ic-row">
        <cb-image-cropper [src]="retrato" shape="circle" preview [output]="{ maxWidth: 256 }" maxHeight="20rem" (cropped)="onAvatar($event)" />
        <div class="ic-result">
          <cb-avatar [image]="avatar()" label="AL" [size]="96" ariaLabel="Tu foto de perfil" />
          <span class="ic-meta">{{ avatarInfo() || 'Sin recortar' }}</span>
        </div>
      </div>
    </doc-section>

    <doc-section
      id="document"
      title="Documento con proporciones"
      description="La barra ofrece Libre, 1:1, 4:3 y 16:9 (ratios los cambia) y los botones giran la imagen 90°. [(rect)] da el recuadro en fracciones de la imagen (0–1), para guardarlo o recortar en el servidor. output elige el formato: aquí JPEG al 85 %."
      [code]="documentCode"
    >
      <div style="display: grid; gap: 0.5rem; width: 100%">
        <cb-image-cropper [src]="paisaje" [(rect)]="recuadro" [(ratio)]="proporcion" [output]="{ type: 'image/jpeg', quality: 0.85, maxWidth: 1200 }" (cropped)="onDocument($event)" />
        <p class="ic-meta">rect: {{ rectText() }} · {{ docInfo() || 'sin recortar' }}</p>
        @if (doc()) {
          <img [src]="doc()" alt="Recorte del documento" class="ic-doc" />
        }
      </div>
    </doc-section>

    <doc-section
      id="file"
      title="Desde un archivo"
      description="Sin src, el área invita a elegir una imagen o a soltarla encima; fileSelect da el archivo original. Un archivo que no es imagen se rechaza con un aviso."
      [code]="fileCode"
    >
      <div style="width: 100%; max-width: 36rem">
        <cb-image-cropper [ratios]="[]" (fileSelect)="archivo.set($event.name + ' · ' + kb($event.size))" />
        <p class="ic-meta">{{ archivo() }}</p>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .ic-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 1.5rem;
        width: 100%;
      }
      .ic-result {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding-top: 1.5rem;
      }
      .ic-meta {
        margin: 0;
        color: var(--cb-color-text-muted);
        font-size: 0.8125rem;
      }
      .ic-doc {
        max-width: 100%;
        max-height: 14rem;
        border: 1px solid var(--cb-color-border);
        border-radius: 6px;
        justify-self: start;
      }
    `,
  ],
})
export class ImageCropperDocComponent {
  protected readonly docApi = DOC_API['cb-image-cropper'];
  protected readonly a11y = DOC_A11Y['cb-image-cropper'];

  protected readonly retrato = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80';
  protected readonly paisaje = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80';
  protected readonly avatar = signal('');
  protected readonly avatarInfo = signal('');
  protected readonly doc = signal('');
  protected readonly docInfo = signal('');
  protected readonly recuadro = signal<{ x: number; y: number; w: number; h: number } | null>(null);
  protected readonly proporcion = signal<number | null>(4 / 3);
  protected readonly archivo = signal('');

  protected kb(bytes: number): string {
    return `${(bytes / 1024).toFixed(1)} kB`;
  }

  protected rectText(): string {
    const r = this.recuadro();
    const f = (n: number) => n.toFixed(2);
    return r ? `x ${f(r.x)}, y ${f(r.y)}, w ${f(r.w)}, h ${f(r.h)}` : '—';
  }

  protected onAvatar(result: CbCropResult): void {
    this.avatar.set(result.dataUrl);
    this.avatarInfo.set(`${result.width} × ${result.height} px · ${result.blob.type} · ${this.kb(result.blob.size)}`);
  }

  protected onDocument(result: CbCropResult): void {
    this.doc.set(result.dataUrl);
    this.docInfo.set(`${result.width} × ${result.height} px · ${result.blob.type} · ${this.kb(result.blob.size)}`);
  }

  protected readonly importCode = `import { CbImageCropper, type CbCropResult } from '@caribeng/ui/image-cropper';`;
  protected readonly avatarCode = `<div class="ic-row">
  <cb-image-cropper [src]="retrato" shape="circle" preview [output]="{ maxWidth: 256 }" maxHeight="20rem" (cropped)="onAvatar($event)" />
  <div class="ic-result">
    <cb-avatar [image]="avatar()" label="AL" [size]="96" ariaLabel="Tu foto de perfil" />
    <span class="ic-meta">{{ avatarInfo() || 'Sin recortar' }}</span>
  </div>
</div>`;
  protected readonly documentCode = `<cb-image-cropper [src]="paisaje" [(rect)]="recuadro" [(ratio)]="proporcion" [output]="{ type: 'image/jpeg', quality: 0.85, maxWidth: 1200 }" (cropped)="onDocument($event)" />
<p class="ic-meta">rect: {{ rectText() }} · {{ docInfo() || 'sin recortar' }}</p>
@if (doc()) {
  <img [src]="doc()" alt="Recorte del documento" class="ic-doc" />
}`;
  protected readonly fileCode = `<cb-image-cropper [ratios]="[]" (fileSelect)="archivo.set($event.name + ' · ' + kb($event.size))" />
<p class="ic-meta">{{ archivo() }}</p>`;

  constructor() {
    inject(TocService).reset();
  }
}
