import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbInput } from '@caribeng/ui/input';
import { CbButton } from '@caribeng/ui/button';
import { CbCheckbox } from '@caribeng/ui/checkbox';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { AuthShellComponent } from '../shared/auth-shell.component';
import { TocService } from '../services/toc.service';

/**
 * Template (receta copiable): registro con layout "split" estilo Atlantis —
 * usuario, correo, contraseña y aceptación de términos, con componentes CaribeNG.
 */
@Component({
  selector: 'doc-register-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CbInput,
    CbButton,
    CbCheckbox,
    DocPageHeaderComponent,
    DocSectionComponent,
    AuthShellComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Plantillas"
      title="Register"
      lead="Registro con layout dividido estilo Atlantis: usuario, correo, contraseña y aceptación de términos. Con componentes CaribeNG y Reactive Forms."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode" [codeTs]="tsCode">
      <doc-auth-shell
        title="Registro"
        sub="Empecemos"
        media="radial-gradient(120% 120% at 20% 10%, rgba(255,255,255,0.18), transparent 50%), linear-gradient(160deg, #10b981 0%, #065f46 55%, #062a3a 100%)"
      >
        <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
          <cb-input placeholder="Usuario" formControlName="username" />
          <cb-input type="email" placeholder="Correo" formControlName="email" />
          <cb-input type="password" placeholder="Contraseña" formControlName="password" />
          <cb-checkbox label="He leído los términos y condiciones" formControlName="terms" />
          <div class="auth-actions">
            <cb-button type="button" variant="outlined" severity="danger">Cancelar</cb-button>
            <cb-button type="submit" [fullWidth]="true" [disabled]="form.invalid">Enviar</cb-button>
          </div>
        </form>
        <p class="auth-alt">¿Ya tienes cuenta? <a class="auth-link" href="#" (click)="$event.preventDefault()">Inicia sesión</a></p>
      </doc-auth-shell>
    </doc-section>
  `,
})
export class RegisterTemplateComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    terms: [false, Validators.requiredTrue],
  });

  constructor() {
    inject(TocService).reset();
  }

  protected submit(): void {
    if (this.form.invalid) return;
    // this.auth.register(this.form.getRawValue());
  }

  protected readonly htmlCode = `<div class="auth__panel">
  <div class="auth__inner">
    <h3>Registro</h3>
    <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
      <cb-input placeholder="Usuario" formControlName="username" />
      <cb-input type="email" placeholder="Correo" formControlName="email" />
      <cb-input type="password" placeholder="Contraseña" formControlName="password" />
      <cb-checkbox label="He leído los términos y condiciones" formControlName="terms" />
      <div class="auth-actions">
        <cb-button type="button" variant="outlined" severity="danger">Cancelar</cb-button>
        <cb-button type="submit" [fullWidth]="true" [disabled]="form.invalid">Enviar</cb-button>
      </div>
    </form>
  </div>
</div>`;

  protected readonly tsCode = `readonly form = this.fb.nonNullable.group({
  username: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  terms: [false, Validators.requiredTrue],
});`;
}
