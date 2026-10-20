import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { AuthShellComponent } from '../shared/auth-shell.component';
import { TocService } from '../services/toc.service';

/** Template (receta): autenticación de dos factores (2FA) con layout split. */
@Component({
  selector: 'doc-two-factor-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbButton, DocPageHeaderComponent, DocSectionComponent, AuthShellComponent],
  template: `
    <doc-page-header
      eyebrow="Plantillas"
      title="Two-Factor (2FA)"
      lead="Verificación en dos pasos con layout dividido estilo Atlantis: código de 6 dígitos de la app de autenticación."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode">
      <doc-auth-shell
        title="Autenticación en dos pasos"
        sub="Introduce el código de 6 dígitos de tu app de autenticación"
        media="radial-gradient(120% 120% at 20% 10%, rgba(255,255,255,0.18), transparent 50%), linear-gradient(160deg, #0891b2 0%, #155e75 55%, #0b1324 100%)"
      >
        <form class="auth-form" (submit)="$event.preventDefault()">
          <div class="auth-otp">
            @for (i of [0, 1, 2, 3, 4, 5]; track i) {
              <input class="auth-otp-box" inputmode="numeric" maxlength="1" aria-label="Dígito" />
            }
          </div>
          <cb-button type="submit" [fullWidth]="true">Verificar</cb-button>
        </form>
        <p class="auth-alt">¿Problemas? <a class="auth-link" href="#" (click)="$event.preventDefault()">Usa un código de respaldo</a></p>
      </doc-auth-shell>
    </doc-section>
  `,
})
export class TwoFactorTemplateComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly htmlCode = `<div class="auth-otp">
  @for (i of [0,1,2,3,4,5]; track i) {
    <input class="auth-otp-box" inputmode="numeric" maxlength="1" aria-label="Dígito" />
  }
</div>
<cb-button type="submit" [fullWidth]="true">Verificar</cb-button>`;
}
