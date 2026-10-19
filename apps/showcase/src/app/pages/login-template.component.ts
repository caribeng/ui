import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbInput } from '@caribeng/ui/input';
import { CbButton } from '@caribeng/ui/button';
import { CbCheckbox } from '@caribeng/ui/checkbox';
import { CbCard } from '@caribeng/ui/card';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

/**
 * Template (receta copiable): pantalla de inicio de sesión centrada, construida
 * con componentes CaribeNG (card, input, checkbox, button) + Reactive Forms.
 */
@Component({
  selector: 'doc-login-template-page',
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
      title="Login"
      lead="Pantalla de inicio de sesión lista para copiar: card centrada con email, contraseña, recordarme y acceso. Hecha solo con componentes CaribeNG y Reactive Forms."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode" [codeTs]="tsCode">
      <div class="tpl-auth">
        <cb-card
          header="Inicia sesión"
          subtitle="Accede a tu cuenta de CaribeNG"
          class="tpl-auth__card"
        >
          <form class="tpl-auth__form" [formGroup]="form" (ngSubmit)="submit()">
            <cb-input
              label="Correo"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              formControlName="email"
            />
            <cb-input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              formControlName="password"
            />
            <div class="tpl-auth__row">
              <cb-checkbox label="Recuérdame" formControlName="remember" />
              <a class="tpl-auth__link" href="#" (click)="$event.preventDefault()">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <cb-button type="submit" [fullWidth]="true" [disabled]="form.invalid">
              Entrar
            </cb-button>
          </form>
          <p class="tpl-auth__foot">
            ¿No tienes cuenta?
            <a class="tpl-auth__link" href="#" (click)="$event.preventDefault()">Regístrate</a>
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
        max-width: 24rem;
      }
      .tpl-auth__form {
        display: flex;
        flex-direction: column;
        gap: var(--cb-space-4, 1rem);
      }
      .tpl-auth__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--cb-space-3, 0.75rem);
        font-size: 0.875rem;
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
    // Aquí llamarías a tu servicio de autenticación con this.form.getRawValue().
  }

  protected readonly htmlCode = `<cb-card header="Inicia sesión" subtitle="Accede a tu cuenta">
  <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
    <cb-input label="Correo" type="email" placeholder="tucorreo@ejemplo.com" formControlName="email" />
    <cb-input label="Contraseña" type="password" placeholder="••••••••" formControlName="password" />
    <div class="auth-row">
      <cb-checkbox label="Recuérdame" formControlName="remember" />
      <a href="/forgot">¿Olvidaste tu contraseña?</a>
    </div>
    <cb-button type="submit" [fullWidth]="true" [disabled]="form.invalid">Entrar</cb-button>
  </form>
</cb-card>`;

  protected readonly tsCode = `import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CbInput } from '@caribeng/ui/input';
import { CbButton } from '@caribeng/ui/button';
import { CbCheckbox } from '@caribeng/ui/checkbox';
import { CbCard } from '@caribeng/ui/card';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CbInput, CbButton, CbCheckbox, CbCard],
  templateUrl: './login.component.html',
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
