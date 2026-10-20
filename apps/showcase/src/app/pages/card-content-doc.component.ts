import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbCardContent } from '@caribeng/ui/caribe/card-content';
import { CbStatus } from '@caribeng/ui/caribe/status';
import { CbLink } from '@caribeng/ui/caribe/link';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'doc-card-content-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbCardContent, CbStatus, CbLink, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Card Content" lead="Card Content para interfaces accesibles, con estilos basados en tokens CaribeNG." />

    <doc-section id="import" title="Importación"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Básico" [code]="exampleCode"><cb-card-content title="Producto" subtitle="Cuenta de ahorros">Consulta el detalle de tu producto.</cb-card-content></doc-section>

    <doc-section
      id="composed"
      [title]="i18n.t('Tarjeta de producto', 'Product card')"
      [description]="
        i18n.t(
          'Composición de alto nivel: la tarjeta integra un chip de status y un enlace de Caribe dentro del cuerpo.',
          'High-level composition: the card integrates a status chip and a Caribe link within its body.'
        )
      "
      [code]="composedCode"
    >
      <cb-card-content title="Premium card" subtitle="Visa · **** 4829" actionLabel="View details">
        <div class="product-card">
          <cb-status status="success" text="Active" />
          <p class="product-card__text">Your card is enabled for international purchases.</p>
          <cb-link href="#" [external]="true">Manage limits</cb-link>
        </div>
      </cb-card-content>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .product-card {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--cb-space-2, 0.5rem);
      }
      .product-card__text {
        margin: 0;
      }
    `,
  ],
})
export class CardContentDocComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly docApi = DOC_API['cb-card-content'];

  constructor() { inject(TocService).reset(); }
  protected readonly importCode = `import { CbCardContent } from '@caribeng/ui/caribe/card-content';`;
  protected readonly exampleCode = `<cb-card-content title="Producto" subtitle="Cuenta de ahorros">Consulta el detalle de tu producto.</cb-card-content>`;
  protected readonly composedCode = `<cb-card-content title="Premium card" subtitle="Visa · **** 4829" actionLabel="View details">
  <cb-status status="success" text="Active" />
  <p>Your card is enabled for international purchases.</p>
  <cb-link href="#" [external]="true">Manage limits</cb-link>
</cb-card-content>`;
}
