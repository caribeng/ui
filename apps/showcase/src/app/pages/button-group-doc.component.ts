import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbButtonGroup } from '@caribeng/ui/caribe/button-group';
import { CbButton } from '@caribeng/ui/button';
import { CbIconButton } from '@caribeng/ui/caribe/icon-button';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-button-group-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbButtonGroup, CbButton, CbIconButton],
  template: `
    <cb-doc-page
      category="Caribe Design · Acciones"
      title="ButtonGroup"
      subtitle="Agrupador accesible de botones con orientación horizontal o vertical."
      importCode="import { CbButtonGroup } from '@caribeng/ui/caribe/button-group';"
      [api]="api"
    >
      <cb-doc-example title="Grupo horizontal" code='<cb-button-group><cb-button size="sm">Día</cb-button><cb-button size="sm" variant="outlined">Mes</cb-button></cb-button-group>'>
        <cb-button-group>
          <cb-button size="sm">Día</cb-button>
          <cb-button size="sm" variant="outlined">Mes</cb-button>
          <cb-button size="sm" variant="outlined">Año</cb-button>
        </cb-button-group>
      </cb-doc-example>

      <cb-doc-example title="Barra de herramientas" [code]="composedCode">
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap">
          <cb-button-group ariaLabel="View">
            <button type="button" [attr.aria-pressed]="view() === 'day'" [class.is-active]="view() === 'day'" (click)="view.set('day')">Day</button>
            <button type="button" [attr.aria-pressed]="view() === 'week'" [class.is-active]="view() === 'week'" (click)="view.set('week')">Week</button>
            <button type="button" [attr.aria-pressed]="view() === 'month'" [class.is-active]="view() === 'month'" (click)="view.set('month')">Month</button>
          </cb-button-group>
          <cb-icon-button icon="search" ariaLabel="Search" variant="ghost" />
          <cb-icon-button icon="settings" ariaLabel="Settings" variant="ghost" />
        </div>
      </cb-doc-example>

      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class ButtonGroupDocComponent {
  protected readonly docApi = DOC_API['cb-button-group'];
  protected readonly view = signal<'day' | 'week' | 'month'>('week');
  protected readonly composedCode = `<cb-button-group ariaLabel="View">
  <button [attr.aria-pressed]="view() === 'day'" (click)="view.set('day')">Day</button>
  <button [attr.aria-pressed]="view() === 'week'" (click)="view.set('week')">Week</button>
  <button [attr.aria-pressed]="view() === 'month'" (click)="view.set('month')">Month</button>
</cb-button-group>
<cb-icon-button icon="search" ariaLabel="Search" variant="ghost" />
<cb-icon-button icon="settings" ariaLabel="Settings" variant="ghost" />`;

  protected readonly api: CbDocApiRow[] = [
    { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Dirección del grupo de botones.' },
    { name: 'ariaLabel', type: 'string', default: "'Grupo de acciones'", description: 'Nombre accesible del grupo.' },
  ];
}
