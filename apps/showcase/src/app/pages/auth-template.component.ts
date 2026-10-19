import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbInput } from '@caribeng/ui/input';
import { CbButton } from '@caribeng/ui/button';
import { CbCheckbox } from '@caribeng/ui/checkbox';
import { CbAvatar } from '@caribeng/ui/avatar';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

/**
 * Template (receta copiable): pantallas de autenticación con layout "split"
 * (imagen + panel oscuro), estilo Atlantis. Sign In, recuperar contraseña,
 * verificación OTP y bloqueo de pantalla, con componentes CaribeNG.
 */
@Component({
  selector: 'doc-auth-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbInput,
    CbButton,
    CbCheckbox,
    CbAvatar,
    DocPageHeaderComponent,
    DocSectionComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Template"
      title="Auth (split)"
      lead="Pantallas de autenticación con layout dividido (imagen + panel oscuro), estilo Atlantis: inicio de sesión, recuperar contraseña, verificación OTP y bloqueo de pantalla."
    />

    <!-- Sign In -->
    <doc-section id="signin" title="Iniciar sesión" [code]="signinCode">
      <div class="auth">
        <div class="auth__media"></div>
        <div class="auth__panel">
          <div class="auth__top"></div>
          <div class="auth__inner">
            <div class="auth__brand">
              <span class="auth__shield" aria-hidden="true">◆</span>
              <span>CaribeNG</span>
            </div>
            <h3 class="auth__title">Bienvenido de vuelta</h3>
            <p class="auth__sub">Inicia sesión en tu cuenta</p>
            <form class="auth__form" (submit)="$event.preventDefault()">
              <cb-input type="email" placeholder="Correo" />
              <cb-input type="password" placeholder="Contraseña" />
              <a class="auth__link" href="#" (click)="$event.preventDefault()">¿Olvidaste tu contraseña?</a>
              <cb-button type="submit" [fullWidth]="true">Entrar</cb-button>
            </form>
            <p class="auth__alt">¿No tienes cuenta? <a class="auth__link" href="#" (click)="$event.preventDefault()">Regístrate</a></p>
          </div>
          <div class="auth__copy">CaribeNG · Copyright 2026</div>
        </div>
      </div>
    </doc-section>

    <!-- Forgot password -->
    <doc-section id="forgot" title="Recuperar contraseña" [code]="forgotCode">
      <div class="auth">
        <div class="auth__media auth__media--2"></div>
        <div class="auth__panel">
          <div class="auth__top"></div>
          <div class="auth__inner">
            <div class="auth__brand"><span class="auth__shield" aria-hidden="true">◆</span><span>CaribeNG</span></div>
            <h3 class="auth__title">Olvidé mi contraseña</h3>
            <p class="auth__sub">Ingresa tu correo para restablecerla</p>
            <form class="auth__form" (submit)="$event.preventDefault()">
              <cb-input type="email" placeholder="Correo" />
              <cb-button type="submit" [fullWidth]="true">Enviar enlace</cb-button>
            </form>
            <p class="auth__alt"><a class="auth__link" href="#" (click)="$event.preventDefault()">← Volver a iniciar sesión</a></p>
          </div>
          <div class="auth__copy">CaribeNG · Copyright 2026</div>
        </div>
      </div>
    </doc-section>

    <!-- OTP verification -->
    <doc-section id="otp" title="Verificación (OTP)" [code]="otpCode">
      <div class="auth">
        <div class="auth__media auth__media--3"></div>
        <div class="auth__panel">
          <div class="auth__top"></div>
          <div class="auth__inner">
            <div class="auth__brand"><span class="auth__shield" aria-hidden="true">◆</span><span>CaribeNG</span></div>
            <h3 class="auth__title">Verificación</h3>
            <p class="auth__sub">Enviamos un código a tu correo</p>
            <form class="auth__form" (submit)="$event.preventDefault()">
              <div class="auth__otp">
                @for (i of [0, 1, 2, 3]; track i) {
                  <input class="auth__otp-box" inputmode="numeric" maxlength="1" aria-label="Dígito" />
                }
              </div>
              <div class="auth__actions">
                <cb-button variant="outlined" severity="secondary">Cancelar</cb-button>
                <cb-button type="submit" [fullWidth]="true">Verificar</cb-button>
              </div>
            </form>
            <p class="auth__alt">¿No lo recibiste? <a class="auth__link" href="#" (click)="$event.preventDefault()">Reenviar</a></p>
          </div>
          <div class="auth__copy">CaribeNG · Copyright 2026</div>
        </div>
      </div>
    </doc-section>

    <!-- Lock screen -->
    <doc-section id="lock" title="Bloqueo de pantalla" [code]="lockCode">
      <div class="auth">
        <div class="auth__media auth__media--4"></div>
        <div class="auth__panel">
          <div class="auth__top"></div>
          <div class="auth__inner">
            <div class="auth__brand"><span class="auth__shield" aria-hidden="true">◆</span><span>CaribeNG</span></div>
            <h3 class="auth__title">Pantalla bloqueada</h3>
            <p class="auth__sub">Ingresa tu contraseña para continuar</p>
            <div class="auth__user">
              <cb-avatar label="IA" severity="primary" size="lg" ariaLabel="Isabella Andolini" />
              <span class="auth__user-name">Isabella Andolini</span>
            </div>
            <form class="auth__form" (submit)="$event.preventDefault()">
              <cb-input type="password" placeholder="Contraseña" />
              <cb-button type="submit" [fullWidth]="true">Desbloquear</cb-button>
            </form>
          </div>
          <div class="auth__copy">CaribeNG · Copyright 2026</div>
        </div>
      </div>
    </doc-section>
  `,
  styles: [
    `
      .auth {
        display: flex;
        width: 100%;
        height: 520px;
        overflow: hidden;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg, 14px);
      }
      .auth__media {
        width: 42%;
        flex: none;
        background:
          radial-gradient(120% 120% at 20% 10%, rgba(255, 255, 255, 0.18), transparent 50%),
          linear-gradient(160deg, #0ea5a0 0%, #065f8a 55%, #082f49 100%);
      }
      .auth__media--2 {
        background:
          radial-gradient(120% 120% at 20% 10%, rgba(255, 255, 255, 0.18), transparent 50%),
          linear-gradient(160deg, #e11d48 0%, #7c1d4e 55%, #1e1b4b 100%);
      }
      .auth__media--3 {
        background:
          radial-gradient(120% 120% at 20% 10%, rgba(255, 255, 255, 0.18), transparent 50%),
          linear-gradient(160deg, #db2777 0%, #581c87 55%, #0b1324 100%);
      }
      .auth__media--4 {
        background:
          radial-gradient(120% 120% at 20% 10%, rgba(255, 255, 255, 0.2), transparent 50%),
          linear-gradient(160deg, #0891b2 0%, #0c4a6e 55%, #082f49 100%);
      }
      /* Panel oscuro: redefine tokens → los componentes CaribeNG adoptan dark */
      .auth__panel {
        position: relative;
        flex: 1;
        display: flex;
        flex-direction: column;
        background: #0b1324;
        color: #e8edf5;
        --cb-color-bg: #0e1930;
        --cb-color-surface: #0e1930;
        --cb-color-surface-raised: #152037;
        --cb-color-text: #e8edf5;
        --cb-color-text-muted: #94a3b8;
        --cb-color-border: #273246;
        --cb-color-border-strong: #3a4761;
      }
      .auth__top {
        height: 92px;
        flex: none;
        background:
          radial-gradient(10px 10px at 10px 16px, rgba(255, 255, 255, 0.05) 60%, transparent 62%) 0 0/28px 28px,
          #0a1120;
      }
      .auth__inner {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.65rem;
        max-width: 22rem;
        width: 100%;
        margin: 0 auto;
        padding: 0 2rem;
      }
      .auth__brand {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 700;
        font-size: 1.15rem;
        margin-bottom: 0.5rem;
      }
      .auth__shield {
        color: var(--cb-color-primary-400, #34d399);
        font-size: 1.3rem;
      }
      .auth__title {
        margin: 0;
        font-size: 1.3rem;
      }
      .auth__sub {
        margin: 0 0 0.75rem;
        font-size: 0.875rem;
        color: #94a3b8;
      }
      .auth__form {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }
      .auth__link {
        color: var(--cb-color-primary-400, #34d399);
        text-decoration: none;
        font-size: 0.85rem;
      }
      .auth__link:hover {
        text-decoration: underline;
      }
      .auth__alt {
        margin: 1rem 0 0;
        font-size: 0.85rem;
        color: #94a3b8;
      }
      .auth__actions {
        display: flex;
        gap: 0.6rem;
      }
      .auth__otp {
        display: flex;
        gap: 0.6rem;
        justify-content: center;
      }
      .auth__otp-box {
        width: 48px;
        height: 54px;
        text-align: center;
        font-size: 1.25rem;
        color: #e8edf5;
        background: #0e1930;
        border: 1px solid #3a4761;
        border-radius: 10px;
        outline: none;
      }
      .auth__otp-box:focus {
        border-color: var(--cb-color-primary-500, #10b981);
      }
      .auth__user {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        margin: 0.25rem 0 0.5rem;
      }
      .auth__user-name {
        font-weight: 600;
      }
      .auth__copy {
        flex: none;
        padding: 1rem 2rem;
        font-size: 0.78rem;
        color: #64748b;
      }
      @media (max-width: 720px) {
        .auth__media {
          display: none;
        }
      }
    `,
  ],
})
export class AuthTemplateComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly signinCode = `<div class="auth">
  <div class="auth__media"></div>
  <div class="auth__panel">  <!-- redefine --cb-color-* para modo oscuro -->
    <div class="auth__inner">
      <div class="auth__brand">◆ CaribeNG</div>
      <h3>Bienvenido de vuelta</h3>
      <form (submit)="$event.preventDefault()">
        <cb-input type="email" placeholder="Correo" />
        <cb-input type="password" placeholder="Contraseña" />
        <a href="/forgot">¿Olvidaste tu contraseña?</a>
        <cb-button type="submit" [fullWidth]="true">Entrar</cb-button>
      </form>
    </div>
  </div>
</div>`;

  protected readonly forgotCode = `<div class="auth__panel">
  <div class="auth__inner">
    <h3>Olvidé mi contraseña</h3>
    <form (submit)="$event.preventDefault()">
      <cb-input type="email" placeholder="Correo" />
      <cb-button type="submit" [fullWidth]="true">Enviar enlace</cb-button>
    </form>
    <a href="/login">← Volver a iniciar sesión</a>
  </div>
</div>`;

  protected readonly otpCode = `<div class="otp">
  @for (i of [0,1,2,3]; track i) {
    <input class="otp-box" inputmode="numeric" maxlength="1" aria-label="Dígito" />
  }
</div>
<div class="actions">
  <cb-button variant="outlined" severity="secondary">Cancelar</cb-button>
  <cb-button type="submit" [fullWidth]="true">Verificar</cb-button>
</div>`;

  protected readonly lockCode = `<div class="user">
  <cb-avatar label="IA" severity="primary" size="lg" ariaLabel="Isabella Andolini" />
  <span>Isabella Andolini</span>
</div>
<form (submit)="$event.preventDefault()">
  <cb-input type="password" placeholder="Contraseña" />
  <cb-button type="submit" [fullWidth]="true">Desbloquear</cb-button>
</form>`;
}
