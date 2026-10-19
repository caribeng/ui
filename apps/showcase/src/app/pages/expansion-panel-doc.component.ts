import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbExpansionPanel } from '@caribeng/ui/caribe/expansion-panel';
import { CbInlineAlert } from '@caribeng/ui/caribe/inline-alert';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-expansion-panel-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbExpansionPanel, CbInlineAlert],
  template: `
    <cb-doc-page
      category="Caribe Design · Paneles"
      title="ExpansionPanel"
      subtitle="Panel desplegable para mostrar u ocultar detalles adicionales."
      importCode="import { CbExpansionPanel } from '@caribeng/ui/caribe/expansion-panel';"
      [api]="api"
    >
      <cb-doc-example title="Panel desplegable" code='<cb-expansion-panel title="Condiciones del producto" [expanded]="true">Sin cuota de manejo.</cb-expansion-panel>'>
        <cb-expansion-panel title="Condiciones del producto" [expanded]="true">
          Exento de cuota de manejo durante los primeros 12 meses.
        </cb-expansion-panel>
      </cb-doc-example>

      <cb-doc-example title="Preguntas frecuentes" [code]="composedCode">
        <div style="width: 100%; max-width: 30rem; display: flex; flex-direction: column; gap: 0.5rem">
          <cb-inline-alert status="info" [closable]="false" title="Frequently asked questions">
            Tap a question to expand its answer.
          </cb-inline-alert>
          <cb-expansion-panel title="What is the management fee?">
            No management fee for the first 12 months.
          </cb-expansion-panel>
          <cb-expansion-panel title="How do I activate my card?">
            Open the app, go to Cards and tap Activate.
          </cb-expansion-panel>
          <cb-expansion-panel title="Can I set spending limits?">
            Yes, from Cards → Limits you can set daily and monthly limits.
          </cb-expansion-panel>
        </div>
      </cb-doc-example>

      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class ExpansionPanelDocComponent {
  protected readonly docApi = DOC_API['cb-expansion-panel'];

  protected readonly composedCode = `<cb-inline-alert status="info" [closable]="false" title="Frequently asked questions">
  Tap a question to expand its answer.
</cb-inline-alert>
<cb-expansion-panel title="What is the management fee?">…</cb-expansion-panel>
<cb-expansion-panel title="How do I activate my card?">…</cb-expansion-panel>
<cb-expansion-panel title="Can I set spending limits?">…</cb-expansion-panel>`;

  protected readonly api: CbDocApiRow[] = [
    { name: 'title', type: 'string', default: "'Detalles'", description: 'Título del encabezado.' },
    { name: 'expanded', type: 'boolean (model)', default: 'false', description: 'Estado desplegado.' },
  ];
}
