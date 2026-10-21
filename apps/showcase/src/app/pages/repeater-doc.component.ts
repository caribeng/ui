import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbInput } from '@caribeng/ui/input';
import { CbRepeater, CbRepeaterItem } from '@caribeng/ui/repeater';
import { CbSelect } from '@caribeng/ui/select';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-repeater-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbRepeater, CbRepeaterItem, CbInput, CbSelect, ReactiveFormsModule, DocA11yComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Form" title="Repeater" lead="Lista repetible de campos sobre un FormArray: agregar y quitar beneficiarios, teléfonos o direcciones." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="formArray y createItem (crea el control de un elemento nuevo). La plantilla cbRepeaterItem recibe el FormGroup de cada elemento; min y max limitan cuántos hay."
      [code]="basicCode"
      [codeTs]="basicTs"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%; max-width: 560px">
        <cb-repeater [formArray]="beneficiarios" [createItem]="nuevoBeneficiario" itemLabel="Beneficiario" [min]="1" [max]="4">
          <ng-template cbRepeaterItem let-grupo>
            <div [formGroup]="grupo" class="rep-grid">
              <cb-input label="Nombre completo" formControlName="nombre" />
              <cb-select [options]="parentescos" formControlName="parentesco" placeholder="Parentesco" ariaLabel="Parentesco" />
            </div>
          </ng-template>
        </cb-repeater>
        <p style="margin: 0; font-size: 0.8rem; color: var(--cb-color-text-muted)">
          {{ beneficiarios.length }} beneficiario(s) · formulario {{ beneficiarios.valid ? 'válido' : 'incompleto' }}
        </p>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />
  `,
  styles: [
    `
      .rep-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.75rem;
        align-items: end;
      }
    `,
  ],
})
export class RepeaterDocComponent {
  protected readonly a11y = DOC_A11Y['cb-repeater'];
  protected readonly parentescos = ['Cónyuge', 'Hijo(a)', 'Padre / Madre', 'Otro'];

  protected readonly nuevoBeneficiario = () =>
    new FormGroup({
      nombre: new FormControl('', { nonNullable: true, validators: Validators.required }),
      parentesco: new FormControl<string | null>(null, Validators.required),
    });
  protected readonly beneficiarios = new FormArray([this.nuevoBeneficiario()]);

  protected readonly importCode = `import { CbRepeater, CbRepeaterItem } from '@caribeng/ui/repeater';`;
  protected readonly basicCode = `<cb-repeater [formArray]="beneficiarios" [createItem]="nuevoBeneficiario" itemLabel="Beneficiario" [min]="1" [max]="4">
  <ng-template cbRepeaterItem let-grupo>
    <div [formGroup]="grupo">
      <cb-input label="Nombre completo" formControlName="nombre" />
      <cb-select [options]="parentescos" formControlName="parentesco" placeholder="Parentesco" ariaLabel="Parentesco" />
    </div>
  </ng-template>
</cb-repeater>`;
  protected readonly basicTs = `nuevoBeneficiario = () =>
  new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: Validators.required }),
    parentesco: new FormControl<string | null>(null, Validators.required),
  });
beneficiarios = new FormArray([this.nuevoBeneficiario()]);`;

  constructor() {
    inject(TocService).reset();
  }
}
