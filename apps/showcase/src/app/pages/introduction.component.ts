import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'doc-introduction',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CbButton, CbIcon, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Foundations"
      title="CaribeNG"
      lead="Sistema de diseño y librería de componentes para Angular 22+, independiente de terceros. Signals, OnPush, standalone y tree-shaking por componente."
    />

    <div class="intro-actions">
      <cb-button routerLink="/components/button">{{ i18n.t('Explorar Button', 'Explore Button') }}</cb-button>
      <cb-button variant="outlined" severity="secondary" routerLink="/foundations/colors">
        {{ i18n.t('Ver Colors', 'View Colors') }}
      </cb-button>
    </div>

    <section id="features" class="intro-grid">
      @for (f of features; track f.title) {
        <article class="intro-feature">
          <cb-icon class="intro-feature__icon" [name]="f.icon" [size]="28" aria-hidden="true" />
          <h3 class="intro-feature__title">{{ i18n.auto(f.title) }}</h3>
          <p class="intro-feature__text">{{ i18n.auto(f.text) }}</p>
        </article>
      }
    </section>

    <section id="install" class="intro-block">
      <h2 class="intro-h2">{{ i18n.t('Instalación', 'Installation') }}</h2>
      <doc-code-block [code]="installCode" lang="bash" />
    </section>

    <section id="setup" class="intro-block">
      <h2 class="intro-h2">{{ i18n.t('Configuración', 'Setup') }}</h2>
      <p class="intro-p">
        {{
          i18n.t(
            'Registra CaribeNG en el arranque. Funciona con Zone.js y zoneless.',
            'Register CaribeNG at bootstrap. Works with Zone.js and zoneless.'
          )
        }}
      </p>
      <doc-code-block [code]="setupCode" lang="typescript" />
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .intro-actions {
        display: flex;
        gap: var(--cb-space-3);
        flex-wrap: wrap;
        margin-bottom: var(--cb-space-10);
      }
      .intro-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: var(--cb-space-4);
        margin-bottom: var(--cb-space-10);
      }
      .intro-feature {
        padding: var(--cb-space-5);
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg);
        background: var(--cb-color-surface-raised);
      }
      .intro-feature__icon { font-size: 1.5rem; }
      .intro-feature__title {
        font-size: var(--cb-text-base);
        font-weight: var(--cb-font-weight-semibold);
        color: var(--cb-color-text-strong);
        margin: var(--cb-space-3) 0 var(--cb-space-2);
      }
      .intro-feature__text {
        font-size: var(--cb-text-sm);
        color: var(--cb-color-text-muted);
        margin: 0;
      }
      .intro-block { margin-bottom: var(--cb-space-8); }
      .intro-h2 {
        font-size: var(--cb-text-xl);
        font-weight: var(--cb-font-weight-semibold);
        color: var(--cb-color-text-strong);
        margin: 0 0 var(--cb-space-3);
      }
      .intro-p {
        color: var(--cb-color-text-muted);
        margin: 0 0 var(--cb-space-4);
      }
    `,
  ],
})
export class IntroductionComponent {
  protected readonly i18n = inject(I18nService);

  constructor() {
    inject(TocService).reset();
  }

  protected readonly features = [
    { icon: 'zap', title: 'Signals + OnPush', text: 'Reactividad moderna con input(), model() y computed() en todos los componentes.' },
    { icon: 'puzzle', title: 'Independiente', text: 'Cero dependencias de PrimeNG o Material. Solo @angular/cdk.' },
    { icon: 'palette', title: 'Design tokens', text: 'Personaliza con variables CSS --cb-*. Tema claro y oscuro integrados.' },
    { icon: 'tree-pine', title: 'Tree-shaking', text: 'Un solo paquete @caribeng/ui con entry points por componente: incluye solo lo que usas.' },
    { icon: 'accessibility', title: 'Accesible', text: 'Objetivo WCAG 2.2 AA: teclado, foco visible y ARIA correcto.' },
    { icon: 'plug', title: 'Zoneless', text: 'Compatible con zoneless y Zone.js sin configuración global.' },
  ];

  protected readonly installCode = `npm install @caribeng/ui`;

  protected readonly setupCode = `import { bootstrapApplication } from '@angular/platform-browser';
import { provideCaribeNG } from '@caribeng/ui';

bootstrapApplication(AppComponent, {
  providers: [provideCaribeNG({ theme: 'light' })],
});`;
}
