import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbInput } from '@caribeng/ui/input';
import { CbQrcode } from '@caribeng/ui/qrcode';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

/** Logo de ejemplo (SVG en línea) para la demo. */
const DEMO_LOGO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#059669"/><path d="M7 12.5l3 3 7-7" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');

@Component({
  selector: 'doc-qrcode-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbQrcode, CbInput, CbButton, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Media"
      title="QRCode"
      lead="Código QR en SVG con un codificador propio, sin dependencias: elige solo la versión y la máscara, y admite color, margen y logo."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="basic" title="Básico" description="value es el texto o la URL. Escribe para ver cómo cambia." [code]="basicCode">
      <div class="qr-row">
        <cb-qrcode [value]="text()" [size]="180" />
        <cb-input class="qr-input" label="Contenido" [(value)]="text" />
      </div>
    </doc-section>

    <doc-section
      id="levels"
      title="Corrección de errores"
      description="L, M (por defecto), Q y H recuperan ~7, 15, 25 y 30 % del código si se daña o se tapa. Más corrección = más módulos. Usa M o más en impresos y pantallas."
      [code]="levelsCode"
    >
      <div class="qr-row">
        @for (level of levels; track level) {
          <figure class="qr-fig">
            <cb-qrcode value="https://caribeng.dev/components/qrcode" [errorCorrection]="level" [size]="120" />
            <figcaption>{{ level }}</figcaption>
          </figure>
        }
      </div>
    </doc-section>

    <doc-section
      id="style"
      title="Color y logo"
      description="color y background aceptan cualquier color CSS (mantén buen contraste). image centra un logo; combínalo con errorCorrection=&quot;H&quot;."
      [code]="styleCode"
    >
      <div class="qr-row">
        <cb-qrcode value="Pago · ref 48213 · $ 120.000" color="#065f46" background="#ecfdf5" [size]="150" />
        <cb-qrcode #logoQr value="https://caribeng.dev" errorCorrection="H" [image]="logo" [size]="150" ariaLabel="QR de caribeng.dev" />
        <cb-button variant="outlined" size="sm" (click)="download()">Descargar SVG</cb-button>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .qr-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1.5rem;
      }
      .qr-input {
        flex: 1 1 16rem;
        max-width: 24rem;
      }
      .qr-fig {
        display: grid;
        justify-items: center;
        gap: 0.25rem;
        margin: 0;
      }
      .qr-fig figcaption {
        font-size: 0.8rem;
        color: var(--cb-color-text-muted);
      }
    `,
  ],
})
export class QrcodeDocComponent {
  protected readonly docApi = DOC_API['cb-qrcode'];
  protected readonly a11y = DOC_A11Y['cb-qrcode'];
  private readonly logoQr = viewChild.required<CbQrcode>('logoQr');

  protected readonly text = signal('https://caribeng.dev');
  protected readonly levels = ['L', 'M', 'Q', 'H'] as const;
  protected readonly logo = DEMO_LOGO;

  protected readonly importCode = `import { CbQrcode, cbQrEncode } from '@caribeng/ui/qrcode';`;
  protected readonly basicCode = `<cb-qrcode [value]="text()" [size]="180" />
<cb-input label="Contenido" [(value)]="text" />`;
  protected readonly levelsCode = `@for (level of levels; track level) {
  <figure>
    <cb-qrcode value="https://caribeng.dev/components/qrcode" [errorCorrection]="level" [size]="120" />
    <figcaption>{{ level }}</figcaption>
  </figure>
}`;
  protected readonly styleCode = `<cb-qrcode value="Pago · ref 48213 · $ 120.000" color="#065f46" background="#ecfdf5" [size]="150" />
<cb-qrcode #logoQr value="https://caribeng.dev" errorCorrection="H" [image]="logo" [size]="150" ariaLabel="QR de caribeng.dev" />
<cb-button variant="outlined" size="sm" (click)="download()">Descargar SVG</cb-button>`;

  constructor() {
    inject(TocService).reset();
  }

  protected download(): void {
    const blob = new Blob([this.logoQr().toSvg()], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'caribeng-qr.svg';
    a.click();
    URL.revokeObjectURL(url);
  }
}
