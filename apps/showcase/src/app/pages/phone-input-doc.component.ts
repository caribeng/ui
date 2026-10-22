import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { type CbPhoneChange, CbPhoneInput } from '@caribeng/ui/phone-input';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-phone-input-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbPhoneInput, ReactiveFormsModule, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Form"
      title="PhoneInput"
      lead="Teléfono internacional: selector de país con bandera, nombre y prefijo, y número que se formatea al escribir. Entrega el valor en E.164 (+573001234567), listo para guardar o enviar."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="forms"
      title="Con Angular Forms"
      description="Funciona con formControlName, [formControl] y ngModel. Añade el error { phone: true } si el número está incompleto o no es válido para el país. Prueba a pegar +52 55 1234 5678: cambia de país solo."
      [code]="formsCode"
      [codeTs]="formsTs"
    >
      <div class="ph-demo">
        <cb-phone-input
          label="Celular"
          hint="Te enviaremos un código por SMS."
          [formControl]="phone"
          [(country)]="country"
          [preferredCountries]="['CO', 'MX', 'US', 'ES']"
          (phoneChange)="last.set($event)"
        />
        <dl class="ph-state">
          <dt>Valor (E.164)</dt><dd><code>{{ phone.value || '—' }}</code></dd>
          <dt>País</dt><dd><code>{{ country() }}</code></dd>
          <dt>Válido</dt><dd>{{ phone.valid ? 'Sí' : 'No' }}</dd>
          <dt>Nacional</dt><dd><code>{{ last()?.national || '—' }}</code></dd>
        </dl>
      </div>
    </doc-section>

    <doc-section
      id="options"
      title="Países y tamaños"
      description="countries limita la lista (códigos ISO o tus propios datos CbPhoneCountry), countryLocked fija el país y showFlag oculta la bandera. Los tamaños son los de cb-input."
      [code]="optionsCode"
    >
      <div class="ph-grid">
        <cb-phone-input label="Solo Centroamérica" size="sm" country="CR" [countries]="['CR', 'GT', 'HN', 'NI', 'PA', 'SV']" />
        <cb-phone-input label="Solo España" country="ES" countryLocked />
        <cb-phone-input label="Sin bandera" size="lg" country="US" [showFlag]="false" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .ph-demo {
        display: grid;
        grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
        gap: 1.5rem;
        width: 100%;
        align-items: start;
      }
      .ph-state {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 0.375rem 1rem;
        margin: 0;
        font-size: 0.875rem;
      }
      .ph-state dt {
        color: var(--cb-color-text-muted);
      }
      .ph-state dd {
        margin: 0;
      }
      .ph-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
        gap: 1rem;
        width: 100%;
      }
      @media (max-width: 640px) {
        .ph-demo {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class PhoneInputDocComponent {
  protected readonly docApi = DOC_API['cb-phone-input'];
  protected readonly a11y = DOC_A11Y['cb-phone-input'];

  protected readonly phone = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  protected readonly country = signal('CO');
  protected readonly last = signal<CbPhoneChange | null>(null);

  protected readonly importCode = `import { CbPhoneInput, CB_PHONE_COUNTRIES, type CbPhoneCountry } from '@caribeng/ui/phone-input';`;
  protected readonly formsCode = `<cb-phone-input
  label="Celular"
  hint="Te enviaremos un código por SMS."
  formControlName="celular"
  country="CO"
  [preferredCountries]="['CO', 'MX', 'US', 'ES']"
  (phoneChange)="onTelefono($event)" />`;
  protected readonly formsTs = `form = new FormGroup({
  // El valor es E.164: '+573001234567'
  celular: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
});

// form.controls.celular.errors → { phone: true } si está incompleto`;
  protected readonly optionsCode = `<cb-phone-input country="CR" [countries]="['CR', 'GT', 'HN', 'NI', 'PA', 'SV']" size="sm" />
<cb-phone-input country="ES" countryLocked />
<cb-phone-input country="US" [showFlag]="false" size="lg" />

<!-- Países propios -->
<cb-phone-input [countries]="[...CB_PHONE_COUNTRIES, { iso: 'XK', dial: '383', lengths: [8] }]" />`;

  constructor() {
    inject(TocService).reset();
  }
}
