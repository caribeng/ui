import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CbThemeService } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { CodeBlockComponent } from '../shared/code-block.component';
import { I18nService } from '../services/i18n.service';
import { CARIBENG_VERSION } from '../data/versions';

interface LandingFeature {
  icon: string;
  title: string;
  titleEn: string;
  desc: [string, string];
}

interface LandingPreset {
  name: 'emerald' | 'ocean' | 'coral' | 'amber' | 'violet' | 'rose';
  color: string;
}

/**
 * Landing de bienvenida del showcase (estilo PrimeNG): hero, contadores
 * animados, features, quick-start, theming en vivo, accesibilidad y footer.
 * Vive fuera del `doc-layout` (pantalla completa, con su propia barra superior).
 */
@Component({
  selector: 'doc-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CbButton, CbIcon, CodeBlockComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly theme = inject(CbThemeService);
  private readonly el = inject(ElementRef);

  protected readonly version = CARIBENG_VERSION;

  protected readonly stats: { value: number; label: [string, string] }[] = [
    { value: 225, label: ['Componentes y directivas', 'Components & directives'] },
    { value: 173, label: ['Entry points', 'Entry points'] },
    { value: 1231, label: ['Tests en verde', 'Tests passing'] },
    { value: 2, label: ['Idiomas: ES y EN', 'Languages: EN & ES'] },
  ];

  protected readonly features: LandingFeature[] = [
    {
      icon: 'zap',
      title: 'Signals + OnPush',
      titleEn: 'Signals + OnPush',
      desc: [
        'Reactividad moderna con input(), model() y computed() en todos los componentes.',
        'Modern reactivity with input(), model() and computed() across every component.',
      ],
    },
    {
      icon: 'puzzle',
      title: 'Independiente',
      titleEn: 'Independent',
      desc: [
        'Cero dependencias de PrimeNG o Material. Solo @angular/cdk.',
        'Zero PrimeNG or Material dependencies. Only @angular/cdk.',
      ],
    },
    {
      icon: 'palette',
      title: 'Design tokens',
      titleEn: 'Design tokens',
      desc: [
        'Personaliza con variables CSS --cb-*. Tema claro y oscuro integrados.',
        'Customize with --cb-* CSS variables. Light and dark themes built in.',
      ],
    },
    {
      icon: 'tree-pine',
      title: 'Tree-shaking',
      titleEn: 'Tree-shaking',
      desc: [
        'Un solo paquete @caribeng/ui con entry points por componente: incluye solo lo que usas.',
        'One @caribeng/ui package with per-component entry points: ship only what you use.',
      ],
    },
    {
      icon: 'accessibility',
      title: 'Accesible',
      titleEn: 'Accessible',
      desc: [
        'Objetivo WCAG 2.2 AA: teclado, foco visible y ARIA correcto.',
        'WCAG 2.2 AA target: keyboard, visible focus and correct ARIA.',
      ],
    },
    {
      icon: 'plug',
      title: 'Zoneless',
      titleEn: 'Zoneless',
      desc: [
        'Compatible con zoneless y Zone.js sin configuración global.',
        'Works with zoneless and Zone.js without global configuration.',
      ],
    },
  ];

  protected readonly presets: LandingPreset[] = [
    { name: 'emerald', color: '#10b981' },
    { name: 'ocean', color: '#0284c7' },
    { name: 'coral', color: '#f43f5e' },
    { name: 'amber', color: '#f59e0b' },
    { name: 'violet', color: '#8b5cf6' },
    { name: 'rose', color: '#ec4899' },
  ];

  protected readonly marquee = [
    'button', 'table', 'dialog', 'chart', 'datepicker', 'kanban', 'gantt',
    'scheduler', 'amount', 'journal-entry', 'financial-report', 'aging',
    'reconciliation', 'pivot', 'kpi', 'audit-log', 'document', 'account-picker',
    'dynamic-form', 'datagrid', 'flow', 'editor', 'pdfviewer', 'chat',
    'mentions', 'sidebar', 'command-palette', 'qrcode', 'signature-pad',
    'comments', 'notification-center', 'masonry', 'media-player',
    'image-cropper', 'infinite-scroll', 'pricing', 'file-card', 'folder-card',
    'descriptions', 'statistic', 'result', 'empty', 'keyfilter', 'repeater',
    'phone-input', 'code-block', 'kbd',
  ];

  protected readonly installCode = `npm install @caribeng/ui`;

  protected readonly a11y: { icon: string; title: string; titleEn: string; desc: [string, string] }[] = [
    {
      icon: 'keyboard',
      title: 'Navegación por teclado',
      titleEn: 'Keyboard navigation',
      desc: [
        'Cada componente es navegable con Tab, flechas, Enter y Escape.',
        'Every component is fully navigable with Tab, arrow keys, Enter and Escape.',
      ],
    },
    {
      icon: 'eye',
      title: 'Lector de pantalla',
      titleEn: 'Screen reader',
      desc: [
        'HTML semántico y regiones en vivo para las tecnologías de asistencia.',
        'Semantic HTML and live regions for assistive technologies.',
      ],
    },
    {
      icon: 'list-checks',
      title: 'Atributos ARIA',
      titleEn: 'ARIA attributes',
      desc: [
        'Roles, estados y propiedades siguiendo los patrones WAI-ARIA.',
        'Roles, states and properties following WAI-ARIA patterns.',
      ],
    },
    {
      icon: 'scan',
      title: 'Gestión de foco',
      titleEn: 'Focus management',
      desc: [
        'Atrapado de foco, restauración e indicadores de foco visibles.',
        'Focus trapping, restoration and visible focus indicators.',
      ],
    },
  ];

  protected readonly dx: { icon: string; title: string; titleEn: string; desc: [string, string] }[] = [
    {
      icon: 'code',
      title: 'TypeScript',
      titleEn: 'TypeScript',
      desc: [
        'Tipado completo con autocompletado. Cada input, evento y modelo está tipado.',
        'Full type safety with auto-complete. Every input, event and model is typed.',
      ],
    },
    {
      icon: 'feather',
      title: 'Tree-shaking',
      titleEn: 'Tree shakeable',
      desc: [
        'Importa solo lo que usas. La eliminación de código muerto mantiene tu bundle ligero.',
        'Import only what you use. Dead-code elimination keeps your bundle lean.',
      ],
    },
    {
      icon: 'package',
      title: 'Standalone',
      titleEn: 'Standalone',
      desc: [
        'Cada componente es standalone. No necesitas NgModule.',
        'Every component is standalone. No NgModule required.',
      ],
    },
    {
      icon: 'globe',
      title: 'SSR ready',
      titleEn: 'SSR ready',
      desc: [
        'Funciona con cualquier bundler. Server-side rendering e hidratación.',
        'Works with any build tool. Server-side rendering and hydration.',
      ],
    },
  ];

  protected readonly setupCode = `import { bootstrapApplication } from '@angular/platform-browser';
import { provideCaribeNG } from '@caribeng/ui';

bootstrapApplication(AppComponent, {
  providers: [provideCaribeNG({ theme: 'light' })],
});`;

  constructor() {
    afterNextRender(() => {
      this.initReveal();
      this.initCounters();
    });
  }

  /** Revela con fade-up los elementos `.reveal` al entrar en el viewport. */
  private initReveal(): void {
    const els = this.el.nativeElement.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el: Element) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach((el: Element) => io.observe(el));
  }

  /** Anima los contadores `[data-count]` al entrar en el viewport. */
  private initCounters(): void {
    const nums = this.el.nativeElement.querySelectorAll('[data-count]');
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.animateCount(entry.target as HTMLElement);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.5 },
    );
    nums.forEach((n: Element) => io.observe(n));
  }

  private animateCount(node: HTMLElement): void {
    const target = Number(node.dataset['count'] ?? 0);
    const duration = 1400;
    const start = performance.now();
    const step = (now: number): void => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
