import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbIconButton } from '@caribeng/ui/caribe/icon-button';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-icon-button-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbIconButton],
  template: `
    <cb-doc-page
      category="Caribe Design · Acciones"
      title="IconButton"
      subtitle="Botón compacto circular de icono con etiqueta accesible obligatoria."
      importCode="import { CbIconButton } from '@caribeng/ui/caribe/icon-button';"
    >
      <cb-doc-example title="Botones de acción rápida" description="Botón circular solo con icono; ariaLabel es obligatorio para la accesibilidad." code='<cb-icon-button icon="plus" ariaLabel="Nuevo" />'>
        <div style="display: flex; gap: 0.75rem">
          <cb-icon-button icon="plus" ariaLabel="Nuevo" />
          <cb-icon-button icon="search" ariaLabel="Buscar" />
          <cb-icon-button icon="check" ariaLabel="Confirmar" />
        </div>
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class IconButtonDocComponent {
  protected readonly docApi = DOC_API['cb-icon-button'];

}
