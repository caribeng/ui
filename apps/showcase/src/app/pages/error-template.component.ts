import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

/**
 * Template (receta): pantallas de estado (Access Denied y Error) estilo Atlantis
 * — mensaje grande centrado sobre fondo oscuro con un botón de volver al inicio.
 */
@Component({
  selector: 'doc-error-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbButton, CbIcon, DocPageHeaderComponent, DocSectionComponent],
  template: `
    <doc-page-header
      eyebrow="Template"
      title="Error Pages"
      lead="Pantallas de estado estilo Atlantis: Access Denied y Error, con mensaje grande centrado sobre fondo oscuro y botón de regreso."
    />

    <doc-section id="denied" title="Access Denied" [code]="deniedCode">
      <div class="err">
        <div class="err__scales"></div>
        <h2 class="err__big err__big--info">
          ACCESS<span class="err__sub">denied</span>
        </h2>
        <p class="err__text">No tienes permiso para ver esta página.</p>
        <cb-button>Volver al inicio</cb-button>
        <div class="err__brand">◆ CaribeNG</div>
      </div>
    </doc-section>

    <doc-section id="error" title="Error" [code]="errorCode">
      <div class="err">
        <div class="err__scales"></div>
        <h2 class="err__big err__big--danger">
          ERROR<span class="err__sub">algo salió mal</span>
        </h2>
        <cb-button>Volver al inicio</cb-button>
        <div class="err__brand">◆ CaribeNG</div>
      </div>
    </doc-section>

    <doc-section id="notfound" title="404 · Not Found" [code]="notFoundCode">
      <div class="err">
        <div class="err__scales"></div>
        <h2 class="err__big err__big--brand">404</h2>
        <p class="err__text">Página no encontrada. El enlace puede estar roto o la página fue movida.</p>
        <cb-button>Volver al inicio</cb-button>
        <div class="err__brand">◆ CaribeNG</div>
      </div>
    </doc-section>

    <doc-section id="maintenance" title="Maintenance" [code]="maintenanceCode">
      <div class="err">
        <div class="err__scales"></div>
        <span class="err__icon" aria-hidden="true">
          <cb-icon name="settings" [size]="64" spin />
        </span>
        <h2 class="err__title">En mantenimiento</h2>
        <p class="err__text">Estamos haciendo mejoras. Volvemos en un momento.</p>
        <cb-button variant="outlined">Reintentar</cb-button>
        <div class="err__brand">◆ CaribeNG</div>
      </div>
    </doc-section>
  `,
  styles: [
    `
      .err {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        width: 100%;
        min-height: 420px;
        padding: 3rem 1rem;
        border-radius: var(--cb-radius-lg, 14px);
        background: #0b1120;
        color: #e8edf5;
        overflow: hidden;
      }
      .err__scales {
        position: absolute;
        inset: 0 0 auto 0;
        height: 120px;
        background:
          radial-gradient(12px 12px at 12px 18px, rgba(255, 255, 255, 0.04) 60%, transparent 62%) 0 0/32px 32px;
      }
      .err__big {
        position: relative;
        margin: 0;
        font-size: clamp(3rem, 12vw, 7rem);
        font-weight: 800;
        line-height: 0.9;
        text-align: center;
      }
      .err__big--info {
        color: #3b82f6;
      }
      .err__big--danger {
        color: #f87171;
      }
      .err__big--brand {
        color: var(--cb-color-primary-400, #34d399);
      }
      .err__icon {
        position: relative;
        display: inline-flex;
        color: var(--cb-color-primary-400, #34d399);
      }
      .err__title {
        position: relative;
        margin: 0;
        font-size: 1.6rem;
        text-align: center;
      }
      .err__sub {
        position: absolute;
        left: 50%;
        top: 55%;
        transform: translate(-50%, -50%);
        font-size: clamp(1.1rem, 4vw, 2.2rem);
        font-weight: 700;
        white-space: nowrap;
      }
      .err__big--danger .err__sub {
        color: #fecaca;
      }
      .err__text {
        position: relative;
        margin: 0;
        text-align: center;
        color: #cbd5e1;
      }
      .err__brand {
        position: relative;
        margin-top: 1.5rem;
        font-weight: 700;
        color: #94a3b8;
      }
    `,
  ],
})
export class ErrorTemplateComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly deniedCode = `<div class="err">
  <h2 class="err__big err__big--info">ACCESS<span class="err__sub">denied</span></h2>
  <p>No tienes permiso para ver esta página.</p>
  <cb-button>Volver al inicio</cb-button>
</div>`;

  protected readonly errorCode = `<div class="err">
  <h2 class="err__big err__big--danger">ERROR<span class="err__sub">algo salió mal</span></h2>
  <cb-button>Volver al inicio</cb-button>
</div>`;

  protected readonly notFoundCode = `<div class="err">
  <h2 class="err__big err__big--brand">404</h2>
  <p>Página no encontrada.</p>
  <cb-button>Volver al inicio</cb-button>
</div>`;

  protected readonly maintenanceCode = `<div class="err">
  <cb-icon name="settings" [size]="64" spin />
  <h2>En mantenimiento</h2>
  <p>Estamos haciendo mejoras. Volvemos en un momento.</p>
  <cb-button variant="outlined">Reintentar</cb-button>
</div>`;
}
