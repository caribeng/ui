import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbButton } from '@caribeng/ui/button';
import { CbAvatar } from '@caribeng/ui/avatar';
import { CbBadge } from '@caribeng/ui/badge';
import { CbMenubar, type CbMenubarItem } from '@caribeng/ui/menubar';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

/**
 * Template (receta copiable): barra de navegación de aplicación — marca, menú
 * principal con submenú (cb-menubar), búsqueda, notificaciones, CTA y avatar.
 */
@Component({
  selector: 'doc-navbar-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbIcon,
    CbButton,
    CbAvatar,
    CbBadge,
    CbMenubar,
    DocPageHeaderComponent,
    DocSectionComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Plantillas"
      title="Navbar"
      lead="Barra de navegación de aplicación: marca, menú principal con submenú desplegable (cb-menubar), búsqueda, notificaciones, CTA y avatar. Responsive."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode" [codeTs]="tsCode">
      <div class="nb-demo">
        <header class="nb">
          <a class="nb__brand" href="#" (click)="$event.preventDefault()">
            <cb-icon name="sparkles" [size]="20" aria-hidden="true" />
            <span>CaribeNG</span>
          </a>

          <cb-menubar class="nb__menu" [items]="items" ariaLabel="Principal" />

          <div class="nb__actions">
            <span class="nb__icon-btn" aria-label="Buscar">
              <cb-icon name="search" [size]="18" aria-hidden="true" />
            </span>
            <span class="nb__icon-btn" aria-label="Notificaciones">
              <cb-icon name="bell" [size]="18" aria-hidden="true" />
              <cb-badge value="5" severity="danger" size="sm" class="nb__badge" />
            </span>
            <cb-button size="sm" variant="solid">Comenzar</cb-button>
            <cb-avatar label="MA" severity="primary" size="md" ariaLabel="Mi cuenta" />
          </div>
        </header>
      </div>
    </doc-section>
  `,
  styles: [
    `
      .nb-demo {
        width: 100%;
        padding: var(--cb-space-4, 1rem);
      }
      .nb {
        display: flex;
        align-items: center;
        gap: var(--cb-space-4, 1rem);
        padding: 0 var(--cb-space-4, 1rem);
        height: 60px;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg, 12px);
        background: var(--cb-color-surface);
        font-family: var(--cb-font-sans);
      }
      .nb__brand {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 700;
        color: var(--cb-color-primary-600, #059669);
        text-decoration: none;
      }
      .nb__menu {
        display: block;
      }
      /* El menubar embebido se funde con la barra: sin caja propia (ul) */
      .nb__menu ::ng-deep .cb-menubar__list {
        background: transparent;
        border: 0;
        padding: 0;
      }
      .nb__actions {
        display: flex;
        align-items: center;
        gap: var(--cb-space-3, 0.75rem);
        margin-left: auto;
      }
      .nb__icon-btn {
        position: relative;
        display: inline-flex;
        color: var(--cb-color-text-muted);
        cursor: pointer;
      }
      .nb__icon-btn:hover {
        color: var(--cb-color-text);
      }
      .nb__badge {
        position: absolute;
        top: -8px;
        right: -8px;
      }
      @media (max-width: 760px) {
        .nb__menu {
          display: none;
        }
      }
    `,
  ],
})
export class NavbarTemplateComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly items: CbMenubarItem[] = [
    { label: 'Inicio', icon: 'house', url: '#' },
    {
      label: 'Productos',
      icon: 'compass',
      items: [
        { label: 'Overview', url: '#' },
        { label: 'Componentes', url: '#' },
        { label: 'Templates', url: '#' },
      ],
    },
    { label: 'Documentación', icon: 'file', url: '#' },
    { label: 'Soporte', icon: 'mail', url: '#' },
  ];

  protected readonly htmlCode = `<header class="nb">
  <a class="nb__brand" href="/"><cb-icon name="sparkles" [size]="20" /> CaribeNG</a>

  <cb-menubar class="nb__menu" [items]="items" ariaLabel="Principal" />

  <div class="nb__actions">
    <span class="nb__icon-btn"><cb-icon name="search" [size]="18" /></span>
    <span class="nb__icon-btn">
      <cb-icon name="bell" [size]="18" />
      <cb-badge value="5" severity="danger" size="sm" class="nb__badge" />
    </span>
    <cb-button size="sm">Comenzar</cb-button>
    <cb-avatar label="MA" severity="primary" />
  </div>
</header>`;

  protected readonly tsCode = `import { Component } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbButton } from '@caribeng/ui/button';
import { CbAvatar } from '@caribeng/ui/avatar';
import { CbBadge } from '@caribeng/ui/badge';
import { CbMenubar, CbMenubarItem } from '@caribeng/ui/menubar';

@Component({
  selector: 'app-navbar',
  imports: [CbIcon, CbButton, CbAvatar, CbBadge, CbMenubar],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  readonly items: CbMenubarItem[] = [
    { label: 'Inicio', icon: 'house', url: '/' },
    {
      label: 'Productos',
      icon: 'compass',
      items: [
        { label: 'Overview', url: '/overview' },
        { label: 'Componentes', url: '/components' },
        { label: 'Templates', url: '/templates' },
      ],
    },
    { label: 'Documentación', icon: 'file', url: '/docs' },
    { label: 'Soporte', icon: 'mail', url: '/support' },
  ];
}`;
}
