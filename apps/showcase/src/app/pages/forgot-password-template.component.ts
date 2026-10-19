import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbInput } from '@caribeng/ui/input';
import { CbButton } from '@caribeng/ui/button';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { AuthShellComponent } from '../shared/auth-shell.component';
import { TocService } from '../services/toc.service';

/** Template (receta): recuperar contraseña con layout split estilo Atlantis. */
@Component({
  selector: 'doc-forgot-password-template-page',
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
      title="Forgot Password"
      lead="Recuperar contraseña con layout dividido estilo Atlantis: ingresa el correo para recibir el enlace de restablecimiento."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode">
      <doc-auth-shell
        title="Olvidé mi contraseña"
        sub="Ingresa tu correo para restablecerla"
        media="radial-gradient(120% 120% at 20% 10%, rgba(255,255,255,0.18), transparent 50%), linear-gradient(160deg, #e11d48 0%, #7c1d4e 55%, #1e1b4b 100%)"
      >
        <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
          <cb-input type="email" placeholder="Correo" formControlName="email" />
          <cb-button type="submit" [fullWidth]="true" [disabled]="form.invalid">Enviar enlace</cb-button>
        </form>
        <p class="auth-alt"><a class="auth-link" href="#" (click)="$event.preventDefault()">← Volver a iniciar sesión</a></p>
      </doc-auth-shell>
    </doc-section>
  `,
})
export class ForgotPasswordTemplateComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    inject(TocService).reset();
  }

  protected submit(): void {
    if (this.form.invalid) return;
    // this.auth.sendReset(this.form.getRawValue().email);
  }

  protected readonly htmlCode = `<div class="auth__inner">
  <h3>Olvidé mi contraseña</h3>
  <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
    <cb-input type="email" placeholder="Correo" formControlName="email" />
    <cb-button type="submit" [fullWidth]="true" [disabled]="form.invalid">Enviar enlace</cb-button>
  </form>
  <a class="auth-link" href="/login">← Volver a iniciar sesión</a>
</div>`;
}
