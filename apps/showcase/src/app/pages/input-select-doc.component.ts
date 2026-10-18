import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbInputSelect } from '@caribeng/ui/caribe/input-select';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-input-select-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbInputSelect],
  template: `
    <cb-doc-page
      category="Caribe Design · Formularios"
      title="InputSelect"
      subtitle="Campo desplegable de selección rápida con soporte CVA."
      importCode="import { CbInputSelect } from '@caribeng/ui/caribe/input-select';"
      [api]="api"
    >
      <cb-doc-example title="Tipo de cuenta" code='<cb-input-select label="Tipo de cuenta" [options]="options" [(value)]="selected" />'>
        <cb-input-select label="Tipo de cuenta" [options]="options" [(value)]="selected" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class InputSelectDocComponent {
  protected readonly docApi = DOC_API['cb-input-select'];

  protected readonly selected = signal('ahorros');
  protected readonly options = [
    { label: 'Cuenta de Ahorros', value: 'ahorros' },
    { label: 'Cuenta Corriente', value: 'corriente' },
  ];
  protected readonly api: CbDocApiRow[] = [
    { name: 'label', type: 'string', default: "''", description: 'Etiqueta del campo.' },
    { name: 'options', type: 'readonly CbInputSelectOption[]', default: '[]', description: 'Opciones disponibles.' },
    { name: 'value', type: 'string (model)', default: "''", description: 'Valor seleccionado.' },
  ];
}
