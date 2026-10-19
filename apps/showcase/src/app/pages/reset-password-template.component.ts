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
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { AuthShellComponent } from '../shared/auth-shell.component';
import { TocService } from '../services/toc.service';

/** Valida que `password` y `confirm` coincidan. */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pwd = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return pwd && confirm && pwd !== confirm ? { mismatch: true } : null;
}

/** Template (receta): establecer nueva contraseña con layout split estilo Atlantis. */
@Component({
  selector: 'doc-reset-password-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CbInput,
    CbButton,
    DocPageHeaderComponent,
    DocSectionComponent,
    AuthShellComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Template"
      title="Reset Password"
      lead="Establecer una nueva contraseña (tras el enlace de recuperación), con layout dividido estilo Atlantis y validación de confirmación."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode">
      <doc-auth-shell
        title="Nueva contraseña"
        sub="Elige una contraseña segura para tu cuenta"
        media="radial-gradient(120% 120% at 20% 10%, rgba(255,255,255,0.18), transparent 50%), linear-gradient(160deg, #6366f1 0%, #4338ca 55%, #1e1b4b 100%)"
      >
        <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
          <cb-input type="password" placeholder="Nueva contraseña" formControlName="password" />
          <cb-input
            type="password"
            placeholder="Confirmar contraseña"
            formControlName="confirm"
            [invalid]="form.hasError('mismatch') && !!form.get('confirm')?.touched"
            [error]="form.hasError('mismatch') && form.get('confirm')?.touched ? 'Las contraseñas no coinciden' : ''"
          />
          <cb-button type="submit" [fullWidth]="true" [disabled]="form.invalid">Restablecer contraseña</cb-button>
        </form>
        <p class="auth-alt"><a class="auth-link" href="#" (click)="$event.preventDefault()">← Volver a iniciar sesión</a></p>
      </doc-auth-shell>
    </doc-section>
  `,
})
export class ResetPasswordTemplateComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  constructor() {
    inject(TocService).reset();
  }

  protected submit(): void {
    if (this.form.invalid) return;
    // this.auth.resetPassword(this.form.getRawValue().password);
  }

  protected readonly htmlCode = `<div class="auth__inner">
  <h3>Nueva contraseña</h3>
  <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
    <cb-input type="password" placeholder="Nueva contraseña" formControlName="password" />
    <cb-input type="password" placeholder="Confirmar contraseña" formControlName="confirm"
      [invalid]="form.hasError('mismatch') && form.get('confirm')?.touched"
      [error]="form.hasError('mismatch') && form.get('confirm')?.touched ? 'Las contraseñas no coinciden' : ''" />
    <cb-button type="submit" [fullWidth]="true" [disabled]="form.invalid">Restablecer contraseña</cb-button>
  </form>
</div>`;
}
