import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbInput } from '@caribeng/ui/input';
import { CbButton } from '@caribeng/ui/button';
import { CbAvatar } from '@caribeng/ui/avatar';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { AuthShellComponent } from '../shared/auth-shell.component';
import { TocService } from '../services/toc.service';

/** Template (receta): bloqueo de pantalla con layout split estilo Atlantis. */
@Component({
  selector: 'doc-lock-screen-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbInput, CbButton, CbAvatar, DocPageHeaderComponent, DocSectionComponent, AuthShellComponent],
  template: `
    <doc-page-header
      eyebrow="Template"
      title="Lock Screen"
      lead="Bloqueo de pantalla con layout dividido estilo Atlantis: avatar del usuario y contraseña para desbloquear."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode">
      <doc-auth-shell
        title="Pantalla bloqueada"
        sub="Ingresa tu contraseña para continuar"
        media="radial-gradient(120% 120% at 20% 10%, rgba(255,255,255,0.2), transparent 50%), linear-gradient(160deg, #0891b2 0%, #0c4a6e 55%, #082f49 100%)"
      >
        <div class="auth-user">
          <cb-avatar label="IA" severity="primary" size="lg" ariaLabel="Isabella Andolini" />
          <span class="auth-user-name">Isabella Andolini</span>
        </div>
        <form class="auth-form" (submit)="$event.preventDefault()">
          <cb-input type="password" placeholder="Contraseña" />
          <cb-button type="submit" [fullWidth]="true">Desbloquear</cb-button>
        </form>
      </doc-auth-shell>
    </doc-section>
  `,
})
export class LockScreenTemplateComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly htmlCode = `<div class="auth-user">
  <cb-avatar label="IA" severity="primary" size="lg" ariaLabel="Isabella Andolini" />
  <span class="auth-user-name">Isabella Andolini</span>
</div>
<form class="auth-form" (submit)="$event.preventDefault()">
  <cb-input type="password" placeholder="Contraseña" />
  <cb-button type="submit" [fullWidth]="true">Desbloquear</cb-button>
</form>`;
}
