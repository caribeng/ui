import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CbInputSelectComponent } from '@caribeng/ui/input-select';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-input-select-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbInputSelectComponent],
  template: `
    <cb-doc-page
      category="Caribe Design · Formularios"
      title="InputSelect"
      subtitle="Campo desplegable de selección rápida con soporte CVA."
      importCode="import { CbInputSelectComponent } from '@caribeng/ui/input-select';"
      [api]="api"
    >
      <cb-doc-example title="Tipo de cuenta" code='<cb-input-select label="Tipo de cuenta" [options]="options" [(value)]="selected" />'>
        <cb-input-select label="Tipo de cuenta" [options]="options" [(value)]="selected" />
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class InputSelectDocComponent {
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
