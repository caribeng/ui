import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { AuthShellComponent } from '../shared/auth-shell.component';
import { TocService } from '../services/toc.service';

/** Template (receta): verificación por código (OTP) con layout split. */
@Component({
  selector: 'doc-verification-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbButton, DocPageHeaderComponent, DocSectionComponent, AuthShellComponent],
  template: `
    <doc-page-header
      eyebrow="Template"
      title="Verification (OTP)"
      lead="Verificación por código de un solo uso con layout dividido estilo Atlantis: 4 dígitos, verificar o cancelar, reenviar."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode">
      <doc-auth-shell
        title="Verificación"
        sub="Enviamos un código a tu correo"
        media="radial-gradient(120% 120% at 20% 10%, rgba(255,255,255,0.18), transparent 50%), linear-gradient(160deg, #db2777 0%, #581c87 55%, #0b1324 100%)"
      >
        <form class="auth-form" (submit)="$event.preventDefault()">
          <div class="auth-otp">
            @for (i of [0, 1, 2, 3]; track i) {
              <input class="auth-otp-box" inputmode="numeric" maxlength="1" aria-label="Dígito" />
            }
          </div>
          <div class="auth-actions">
            <cb-button type="button" variant="outlined" severity="secondary">Cancelar</cb-button>
            <cb-button type="submit" [fullWidth]="true">Verificar</cb-button>
          </div>
        </form>
        <p class="auth-alt">¿No lo recibiste? <a class="auth-link" href="#" (click)="$event.preventDefault()">Reenviar</a></p>
      </doc-auth-shell>
    </doc-section>
  `,
})
export class VerificationTemplateComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly htmlCode = `<div class="auth-otp">
  @for (i of [0,1,2,3]; track i) {
    <input class="auth-otp-box" inputmode="numeric" maxlength="1" aria-label="Dígito" />
  }
</div>
<div class="auth-actions">
  <cb-button type="button" variant="outlined" severity="secondary">Cancelar</cb-button>
  <cb-button type="submit" [fullWidth]="true">Verificar</cb-button>
</div>`;
}
