import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type ValidationErrors,
} from '@angular/forms';
import { CbInput } from '@caribeng/ui/input';
import { CbButton } from '@caribeng/ui/button';
import { CbCheckbox } from '@caribeng/ui/checkbox';
import { CbCard } from '@caribeng/ui/card';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

/** Valida que `password` y `confirm` coincidan. */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pwd = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return pwd && confirm && pwd !== confirm ? { mismatch: true } : null;
}

/**
 * Template (receta copiable): pantalla de registro centrada, construida con
 * componentes CaribeNG (card, input, checkbox, button) + Reactive Forms, con
 * validación de confirmación de contraseña y aceptación de términos.
 */
@Component({
  selector: 'doc-register-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CbInput,
    CbButton,
    CbCheckbox,
    CbCard,
    DocPageHeaderComponent,
    DocSectionComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Template"
      title="Register"
      lead="Pantalla de registro lista para copiar: nombre, correo, contraseña con confirmación y aceptación de términos. Hecha solo con componentes CaribeNG y Reactive Forms."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode" [codeTs]="tsCode">
      <div class="tpl-auth">
        <cb-card
          header="Crea tu cuenta"
          subtitle="Empieza a construir con CaribeNG"
          class="tpl-auth__card"
        >
          <form class="tpl-auth__form" [formGroup]="form" (ngSubmit)="submit()">
            <cb-input label="Nombre" placeholder="Tu nombre" formControlName="name" />
            <cb-input
              label="Correo"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              formControlName="email"
            />
            <cb-input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              formControlName="password"
            />
            <cb-input
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite la contraseña"
              formControlName="confirm"
              [invalid]="form.hasError('mismatch') && !!form.get('confirm')?.touched"
              [error]="
                form.hasError('mismatch') && form.get('confirm')?.touched
                  ? 'Las contraseñas no coinciden'
                  : ''
              "
            />
            <cb-checkbox
              label="Acepto los términos y la política de privacidad"
              formControlName="terms"
            />
            <cb-button type="submit" [fullWidth]="true" [disabled]="form.invalid">
              Crear cuenta
            </cb-button>
          </form>
          <p class="tpl-auth__foot">
            ¿Ya tienes cuenta?
            <a class="tpl-auth__link" href="#" (click)="$event.preventDefault()">Inicia sesión</a>
          </p>
        </cb-card>
      </div>
    </doc-section>
  `,
  styles: [
    `
      .tpl-auth {
        display: flex;
        justify-content: center;
        width: 100%;
        padding: var(--cb-space-6, 1.5rem);
      }
      .tpl-auth__card {
        width: 100%;
        max-width: 26rem;
      }
      .tpl-auth__form {
        display: flex;
        flex-direction: column;
        gap: var(--cb-space-4, 1rem);
      }
      .tpl-auth__link {
        color: var(--cb-color-primary-600, #059669);
        text-decoration: none;
      }
      .tpl-auth__link:hover {
        text-decoration: underline;
      }
      .tpl-auth__foot {
        margin: var(--cb-space-4, 1rem) 0 0;
        text-align: center;
        font-size: 0.875rem;
        color: var(--cb-color-text-muted);
      }
    `,
  ],
})
export class RegisterTemplateComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
      terms: [false, Validators.requiredTrue],
    },
    { validators: passwordsMatch },
  );

  constructor() {
    inject(TocService).reset();
  }

  protected submit(): void {
    if (this.form.invalid) return;
    // Aquí registrarías al usuario con this.form.getRawValue().
  }

  protected readonly htmlCode = `<cb-card header="Crea tu cuenta" subtitle="Empieza a construir con CaribeNG">
  <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
    <cb-input label="Nombre" placeholder="Tu nombre" formControlName="name" />
    <cb-input label="Correo" type="email" placeholder="tucorreo@ejemplo.com" formControlName="email" />
    <cb-input label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" formControlName="password" />
    <cb-input
      label="Confirmar contraseña"
      type="password"
      formControlName="confirm"
      [invalid]="form.hasError('mismatch') && form.get('confirm')?.touched"
      [error]="form.hasError('mismatch') && form.get('confirm')?.touched ? 'Las contraseñas no coinciden' : ''"
    />
    <cb-checkbox label="Acepto los términos y la política de privacidad" formControlName="terms" />
    <cb-button type="submit" [fullWidth]="true" [disabled]="form.invalid">Crear cuenta</cb-button>
  </form>
</cb-card>`;

  protected readonly tsCode = `import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { CbInput } from '@caribeng/ui/input';
import { CbButton } from '@caribeng/ui/button';
import { CbCheckbox } from '@caribeng/ui/checkbox';
import { CbCard } from '@caribeng/ui/card';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pwd = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return pwd && confirm && pwd !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CbInput, CbButton, CbCheckbox, CbCard],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
    terms: [false, Validators.requiredTrue],
  }, { validators: passwordsMatch });

  submit(): void {
    if (this.form.invalid) return;
    // this.auth.register(this.form.getRawValue());
  }
}`;
}
