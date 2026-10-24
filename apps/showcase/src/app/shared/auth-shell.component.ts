import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Shell de layout "split" (estilo Atlantis) para las plantillas de auth:
 * media con gradiente a la izquierda + panel oscuro con marca y footer a la
 * derecha. El panel redefine --cb-color-* para que los componentes CaribeNG
 * proyectados adopten el modo oscuro. Proyecta el formulario como contenido.
 */
@Component({
  selector: 'doc-auth-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth">
      <div class="auth__media" [style.background]="media()"></div>
      <div class="auth__panel">
        <div class="auth__top"></div>
        <div class="auth__inner">
          <div class="auth__brand"><span class="auth__shield" aria-hidden="true">◆</span><span>CaribeNG</span></div>
          @if (title()) {
            <h3 class="auth__title">{{ title() }}</h3>
          }
          @if (sub()) {
            <p class="auth__sub">{{ sub() }}</p>
          }
          <ng-content />
        </div>
        <div class="auth__copy">CaribeNG · Copyright 2026</div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      .auth {
        display: flex;
        width: 100%;
        flex: 1 1 auto;
        min-height: 520px;
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
      .auth__panel {
        position: relative;
        flex: 1;
        min-width: 0;
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
      .auth__copy {
        flex: none;
        padding: 1rem 2rem;
        font-size: 0.78rem;
        color: #64748b;
      }
      /* Helpers para el formulario proyectado (contenido del padre) */
      .auth__panel ::ng-deep .auth-form {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }
      .auth__panel ::ng-deep .auth-link {
        color: var(--cb-color-primary-400, #34d399);
        text-decoration: none;
        font-size: 0.85rem;
      }
      .auth__panel ::ng-deep .auth-link:hover {
        text-decoration: underline;
      }
      .auth__panel ::ng-deep .auth-alt {
        margin: 1rem 0 0;
        font-size: 0.85rem;
        color: #94a3b8;
      }
      .auth__panel ::ng-deep .auth-actions {
        display: flex;
        gap: 0.6rem;
      }
      .auth__panel ::ng-deep .auth-otp {
        display: flex;
        gap: 0.6rem;
        justify-content: center;
      }
      .auth__panel ::ng-deep .auth-otp-box {
        /* Las casillas se estrechan en pantallas pequeñas en lugar de salirse del panel. */
        flex: 0 1 48px;
        box-sizing: border-box;
        width: 48px;
        min-width: 0;
        height: 54px;
        text-align: center;
        font-size: 1.25rem;
        color: #e8edf5;
        background: #0e1930;
        border: 1px solid #3a4761;
        border-radius: 10px;
        outline: none;
      }
      .auth__panel ::ng-deep .auth-otp-box:focus {
        border-color: var(--cb-color-primary-500, #10b981);
      }
      .auth__panel ::ng-deep .auth-user {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        margin: 0.25rem 0 0.5rem;
      }
      .auth__panel ::ng-deep .auth-user-name {
        font-weight: 600;
      }
      @media (max-width: 720px) {
        .auth__media {
          display: none;
        }
      }
      @media (max-width: 480px) {
        .auth__inner {
          padding: 0 1.25rem;
        }
        .auth__panel ::ng-deep .auth-otp {
          gap: 0.4rem;
        }
      }
    `,
  ],
})
export class AuthShellComponent {
  /** Título del panel. */
  readonly title = input<string>('');
  /** Subtítulo del panel. */
  readonly sub = input<string>('');
  /** Fondo (gradiente CSS) del panel de media. */
  readonly media = input<string>(
    'radial-gradient(120% 120% at 20% 10%, rgba(255,255,255,0.18), transparent 50%), linear-gradient(160deg, #0ea5a0 0%, #065f8a 55%, #082f49 100%)',
  );
}
