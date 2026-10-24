import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CbAmount, cbAmountInWords } from '@caribeng/ui/amount';
import { CbInputNumber } from '@caribeng/ui/input-number';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-amount-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbAmount, CbInputNumber, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Contabilidad"
      title="Amount"
      lead="Importe con su moneda, negativos en rojo (con signo o entre paréntesis), equivalente en otra moneda con la tasa de cambio e importe en letras para cheques, recibos y facturas."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Importes y negativos"
      description="currency elige la moneda (si no, la de provideCaribeNG({ currency })); negative escribe los negativos con signo o entre paréntesis, siempre en rojo; showCode añade el código ISO y size el tamaño."
      [code]="basicCode"
    >
      <div class="am-grid">
        <cb-amount [value]="1250000.5" />
        <cb-amount [value]="-48750" negative="parens" />
        <cb-amount [value]="312.45" currency="USD" showCode />
        <cb-amount [value]="9800" currency="EUR" />
        <cb-amount [value]="62230000" size="xl" />
      </div>
    </doc-section>

    <doc-section
      id="words"
      title="Importe en letras"
      description="words muestra el importe en letras debajo: en estilo cheque (mayúsculas, centavos como 50/100 y M/CTE para pesos colombianos) o en texto. cbAmountInWords() da el mismo texto desde código, en español o inglés y para pesos, dólares, euros y otras monedas. Escribe un valor para verlo."
      [code]="wordsCode"
    >
      <div style="display: grid; gap: 0.75rem; width: min(100%, 34rem)">
        <cb-input-number label="Valor" [(value)]="valor" [min]="0" mode="currency" currency="COP" locale="es-CO" />
        <cb-amount [value]="valor()" words size="lg" />
        <p class="am-text">{{ enTexto() }}</p>
      </div>
    </doc-section>

    <doc-section
      id="convert"
      title="Equivalente en otra moneda"
      description="convert muestra el valor en otra moneda con su tasa: aquí, pesos a dólares dividiendo por la TRM, y dólares a pesos multiplicando."
      [code]="convertCode"
    >
      <div class="am-grid">
        <cb-amount [value]="4580000" [convert]="{ currency: 'USD', rate: 3950.25, divide: true, label: 'TRM' }" />
        <cb-amount [value]="1200" currency="USD" [convert]="{ currency: 'COP', rate: 3950.25, label: 'TRM' }" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .am-grid {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 1.25rem 2.5rem;
      }
      .am-text {
        margin: 0;
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class AmountDocComponent {
  protected readonly docApi = DOC_API['cb-amount'];
  protected readonly a11y = DOC_A11Y['cb-amount'];

  protected readonly valor = signal<number | null>(1250000.5);
  protected readonly enTexto = computed(() => {
    const v = this.valor();
    return v === null ? '' : `En texto: ${cbAmountInWords(v, { style: 'text' })} · In English: ${cbAmountInWords(v, { language: 'en', style: 'text' })}`;
  });

  protected readonly importCode = `import { CbAmount, cbAmountInWords } from '@caribeng/ui/amount';`;
  protected readonly basicCode = `<div class="am-grid">
  <cb-amount [value]="1250000.5" />
  <cb-amount [value]="-48750" negative="parens" />
  <cb-amount [value]="312.45" currency="USD" showCode />
  <cb-amount [value]="9800" currency="EUR" />
  <cb-amount [value]="62230000" size="xl" />
</div>`;
  protected readonly wordsCode = `<div style="display: grid; gap: 0.75rem; width: min(100%, 34rem)">
  <cb-input-number label="Valor" [(value)]="valor" [min]="0" mode="currency" currency="COP" locale="es-CO" />
  <cb-amount [value]="valor()" words size="lg" />
  <p class="am-text">{{ enTexto() }}</p>
</div>`;
  protected readonly convertCode = `<div class="am-grid">
  <cb-amount [value]="4580000" [convert]="{ currency: 'USD', rate: 3950.25, divide: true, label: 'TRM' }" />
  <cb-amount [value]="1200" currency="USD" [convert]="{ currency: 'COP', rate: 3950.25, label: 'TRM' }" />
</div>`;

  constructor() {
    inject(TocService).reset();
  }
}
