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
 * Template (receta copiable): inicio de sesión con layout "split" (imagen +
 * panel oscuro), estilo Atlantis, con componentes CaribeNG y Reactive Forms.
 */
@Component({
  selector: 'doc-login-template-page',
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
      eyebrow="Template"
      title="Login"
      lead="Inicio de sesión con layout dividido (imagen + panel oscuro), estilo Atlantis. Hecho con componentes CaribeNG y Reactive Forms."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode" [codeTs]="tsCode">
      <doc-auth-shell title="Bienvenido de vuelta" sub="Inicia sesión en tu cuenta">
        <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
          <cb-input type="email" placeholder="Correo" formControlName="email" />
          <cb-input type="password" placeholder="Contraseña" formControlName="password" />
          <cb-checkbox label="Recuérdame" formControlName="remember" />
          <a class="auth-link" href="#" (click)="$event.preventDefault()">¿Olvidaste tu contraseña?</a>
          <cb-button type="submit" [fullWidth]="true" [disabled]="form.invalid">Entrar</cb-button>
        </form>
        <p class="auth-alt">¿No tienes cuenta? <a class="auth-link" href="#" (click)="$event.preventDefault()">Regístrate</a></p>
      </doc-auth-shell>
    </doc-section>
  `,
})
export class LoginTemplateComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false],
  });

  constructor() {
    inject(TocService).reset();
  }

  protected submit(): void {
    if (this.form.invalid) return;
    // this.auth.login(this.form.getRawValue());
  }

  protected readonly htmlCode = `<div class="auth">          <!-- split: media + panel oscuro -->
  <div class="auth__media"></div>
  <div class="auth__panel">
    <div class="auth__inner">
      <h3>Bienvenido de vuelta</h3>
      <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
        <cb-input type="email" placeholder="Correo" formControlName="email" />
        <cb-input type="password" placeholder="Contraseña" formControlName="password" />
        <cb-checkbox label="Recuérdame" formControlName="remember" />
        <a class="auth-link" href="/forgot">¿Olvidaste tu contraseña?</a>
        <cb-button type="submit" [fullWidth]="true" [disabled]="form.invalid">Entrar</cb-button>
      </form>
    </div>
  </div>
</div>`;

  protected readonly tsCode = `import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbInput } from '@caribeng/ui/input';
import { CbButton } from '@caribeng/ui/button';
import { CbCheckbox } from '@caribeng/ui/checkbox';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CbInput, CbButton, CbCheckbox],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',  // layout split (.auth, .auth__panel con --cb-color-* oscuros)
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false],
  });

  submit(): void {
    if (this.form.invalid) return;
    // this.auth.login(this.form.getRawValue());
  }
}`;
}
