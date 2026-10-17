import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CbButtonComponent } from '@caribeng/button';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-introduction',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CbButtonComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Foundations"
      title="CaribeNG"
      lead="Sistema de diseño y librería de componentes para Angular 22+, independiente de terceros. Signals, OnPush, standalone y tree-shaking por componente."
    />

    <div class="intro-actions">
      <cb-button routerLink="/components/button">Explorar Button</cb-button>
      <cb-button variant="outlined" severity="secondary" routerLink="/foundations/colors">
        Ver Colors
      </cb-button>
    </div>

    <section id="features" class="intro-grid">
      @for (f of features; track f.title) {
        <article class="intro-feature">
          <span class="intro-feature__icon">{{ f.icon }}</span>
          <h3 class="intro-feature__title">{{ f.title }}</h3>
          <p class="intro-feature__text">{{ f.text }}</p>
        </article>
      }
    </section>

    <section id="install" class="intro-block">
      <h2 class="intro-h2">Instalación</h2>
      <doc-code-block [code]="installCode" lang="bash" />
    </section>

    <section id="setup" class="intro-block">
      <h2 class="intro-h2">Configuración</h2>
      <p class="intro-p">
        Registra CaribeNG en el arranque. Funciona con Zone.js y zoneless.
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
  constructor() {
    inject(TocService).reset();
  }

  protected readonly features = [
    { icon: '⚡', title: 'Signals + OnPush', text: 'Reactividad moderna con input(), model() y computed() en todos los componentes.' },
    { icon: '🧩', title: 'Independiente', text: 'Cero dependencias de PrimeNG o Material. Solo @angular/cdk.' },
    { icon: '🎨', title: 'Design tokens', text: 'Personaliza con variables CSS --cb-*. Tema claro y oscuro integrados.' },
    { icon: '🌳', title: 'Tree-shaking', text: 'Un paquete npm por componente para incluir solo lo que usas.' },
    { icon: '♿', title: 'Accesible', text: 'Objetivo WCAG 2.2 AA: teclado, foco visible y ARIA correcto.' },
    { icon: '🔌', title: 'Zoneless', text: 'Compatible con zoneless y Zone.js sin configuración global.' },
  ];

  protected readonly installCode = `npm install @caribeng/core @caribeng/button @caribeng/input`;

  protected readonly setupCode = `import { bootstrapApplication } from '@angular/platform-browser';
import { provideCaribeNG } from '@caribeng/core';

bootstrapApplication(AppComponent, {
  providers: [provideCaribeNG({ theme: 'light' })],
});`;
}
