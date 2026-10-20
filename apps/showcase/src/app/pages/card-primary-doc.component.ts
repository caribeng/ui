import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbCardPrimary } from '@caribeng/ui/caribe/card-primary';
import { CbShortcut } from '@caribeng/ui/caribe/shortcut';
import { CbProgressBar } from '@caribeng/ui/caribe/progress-bar';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'doc-card-primary-page', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbCardPrimary, CbShortcut, CbProgressBar, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Caribe Design" title="Card Primary" lead="Card Primary para interfaces accesibles, con estilos basados en tokens CaribeNG." />

    <doc-section id="import" title="Importación"><doc-code-block [code]="importCode" lang="typescript" /></doc-section>
    <doc-section id="basic" title="Básico" [code]="exampleCode"><cb-card-primary title="Cuenta de ahorros" subtitle="**** 2048" value="$ 2.450.000" /></doc-section>

    <doc-section
      id="composed"
      [title]="i18n.t('Panel de cuenta', 'Account dashboard')"
      [description]="
        i18n.t(
          'Composición de alto nivel: la tarjeta principal junto a accesos directos (shortcut) y una barra de progreso de meta de ahorro.',
          'High-level composition: the primary card together with shortcuts and a savings-goal progress bar.'
        )
      "
      [code]="composedCode"
    >
      <div class="account-dashboard">
        <cb-card-primary title="Savings account" subtitle="**** 4829" value="$ 4,250,000" />
        <div class="account-dashboard__shortcuts">
          <cb-shortcut icon="arrow-right" label="Transfer" />
          <cb-shortcut icon="plus" label="Top up" />
          <cb-shortcut icon="settings" label="Manage" />
        </div>
        <cb-progress-bar [value]="68" label="Savings goal" />
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .account-dashboard {
        display: flex;
        flex-direction: column;
        gap: var(--cb-space-4, 1rem);
        width: 100%;
        max-width: 22rem;
      }
      .account-dashboard__shortcuts {
        display: flex;
        gap: var(--cb-space-3, 0.75rem);
      }
      .account-dashboard__shortcuts cb-shortcut {
        flex: 1;
      }
    `,
  ],
})
export class CardPrimaryDocComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly docApi = DOC_API['cb-card-primary'];

  constructor() { inject(TocService).reset(); }
  protected readonly importCode = `import { CbCardPrimary } from '@caribeng/ui/caribe/card-primary';`;
  protected readonly exampleCode = `<cb-card-primary title="Cuenta de ahorros" subtitle="**** 2048" value="$ 2.450.000" />`;
  protected readonly composedCode = `<cb-card-primary title="Savings account" subtitle="**** 4829" value="$ 4,250,000" />

<div class="shortcuts">
  <cb-shortcut icon="arrow-right" label="Transfer" />
  <cb-shortcut icon="plus" label="Top up" />
  <cb-shortcut icon="settings" label="Manage" />
</div>

<cb-progress-bar [value]="68" label="Savings goal" />`;
}
