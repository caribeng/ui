import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbCard } from '@caribeng/ui/card';
import { CbButton } from '@caribeng/ui/button';
import { CbAvatar } from '@caribeng/ui/avatar';
import { CbTag } from '@caribeng/ui/tag';
import { CbBadge } from '@caribeng/ui/badge';
import type { CbSeverity } from '@caribeng/ui';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocSectionComponent } from '../shared/doc-section.component';
import { TocService } from '../services/toc.service';

interface NavLink {
  label: string;
  icon: string;
  active?: boolean;
}
interface Stat {
  label: string;
  value: string;
  trend: string;
  up: boolean;
}
interface ActivityRow {
  name: string;
  email: string;
  role: string;
  status: string;
  severity: CbSeverity;
  date: string;
}

/**
 * Template (receta copiable): shell de dashboard completo — navbar superior,
 * sidebar de navegación, tarjetas de métricas y tabla de actividad reciente,
 * todo con componentes CaribeNG.
 */
@Component({
  selector: 'doc-dashboard-template-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbIcon,
    CbCard,
    CbButton,
    CbAvatar,
    CbTag,
    CbBadge,
    DocPageHeaderComponent,
    DocSectionComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Plantillas"
      title="Dashboard"
      lead="Shell de panel de administración: navbar superior, sidebar de navegación, tarjetas de métricas y tabla de actividad. Composición completa con componentes CaribeNG."
    />

    <doc-section id="preview" title="Vista previa" [code]="htmlCode" [codeTs]="tsCode">
      <div class="dash">
        <!-- Navbar superior -->
        <header class="dash__topbar">
          <div class="dash__brand">
            <cb-icon name="sparkles" [size]="20" aria-hidden="true" />
            <span>CaribeNG</span>
          </div>
          <div class="dash__search">
            <cb-icon name="search" [size]="16" aria-hidden="true" />
            <input type="text" placeholder="Buscar…" aria-label="Buscar" />
          </div>
          <div class="dash__topbar-actions">
            <span class="dash__icon-btn">
              <cb-icon name="bell" [size]="18" aria-hidden="true" />
              <cb-badge value="3" severity="danger" size="sm" class="dash__bell-badge" />
            </span>
            <cb-avatar label="MA" severity="primary" size="md" ariaLabel="Mi cuenta" />
          </div>
        </header>

        <div class="dash__body">
          <!-- Sidebar -->
          <aside class="dash__sidebar">
            <nav aria-label="Principal">
              @for (link of navLinks; track link.label) {
                <a
                  class="dash__nav-link"
                  [class.dash__nav-link--active]="link.active"
                  href="#"
                  (click)="$event.preventDefault()"
                >
                  <cb-icon [name]="link.icon" [size]="18" aria-hidden="true" />
                  <span>{{ link.label }}</span>
                </a>
              }
            </nav>
            <a class="dash__nav-link dash__nav-link--foot" href="#" (click)="$event.preventDefault()">
              <cb-icon name="log-out" [size]="18" aria-hidden="true" />
              <span>Salir</span>
            </a>
          </aside>

          <!-- Contenido -->
          <main class="dash__main">
            <div class="dash__head">
              <h3 class="dash__title">Resumen</h3>
              <cb-button size="sm">
                <cb-icon name="plus" [size]="16" aria-hidden="true" />
                Nuevo
              </cb-button>
            </div>

            <!-- Métricas -->
            <div class="dash__stats">
              @for (s of stats; track s.label) {
                <cb-card class="dash__stat">
                  <div class="dash__stat-inner">
                    <span class="dash__stat-label">{{ s.label }}</span>
                    <strong class="dash__stat-value">{{ s.value }}</strong>
                    <span class="dash__stat-trend" [class.dash__stat-trend--down]="!s.up">
                      <cb-icon name="trending-up" [size]="14" aria-hidden="true" />
                      {{ s.trend }}
                    </span>
                  </div>
                </cb-card>
              }
            </div>

            <!-- Actividad -->
            <cb-card header="Actividad reciente" class="dash__panel">
              <table class="dash__table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of rows; track row.email) {
                    <tr>
                      <td>
                        <div class="dash__user">
                          <cb-avatar [label]="initials(row.name)" size="sm" [ariaLabel]="row.name" />
                          <div>
                            <div class="dash__user-name">{{ row.name }}</div>
                            <div class="dash__user-mail">{{ row.email }}</div>
                          </div>
                        </div>
                      </td>
                      <td>{{ row.role }}</td>
                      <td><cb-tag [value]="row.status" [severity]="row.severity" /></td>
                      <td class="dash__muted">{{ row.date }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </cb-card>
          </main>
        </div>
      </div>
    </doc-section>
  `,
  styles: [
    `
      .dash {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 560px;
        overflow: hidden;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg, 12px);
        background: var(--cb-color-bg);
        font-family: var(--cb-font-sans);
      }
      .dash__topbar {
        display: flex;
        align-items: center;
        gap: var(--cb-space-4, 1rem);
        padding: 0 var(--cb-space-4, 1rem);
        height: 56px;
        border-bottom: 1px solid var(--cb-color-border);
        background: var(--cb-color-surface);
      }
      .dash__brand {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 700;
        color: var(--cb-color-primary-600, #059669);
      }
      .dash__search {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        flex: 1;
        max-width: 22rem;
        padding: 0.4rem 0.7rem;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-md);
        color: var(--cb-color-text-muted);
        background: var(--cb-color-bg);
      }
      .dash__search input {
        border: 0;
        outline: 0;
        background: transparent;
        color: var(--cb-color-text);
        font: inherit;
        width: 100%;
      }
      .dash__topbar-actions {
        display: flex;
        align-items: center;
        gap: var(--cb-space-3, 0.75rem);
        margin-left: auto;
      }
      .dash__icon-btn {
        position: relative;
        display: inline-flex;
        color: var(--cb-color-text-muted);
        cursor: pointer;
      }
      .dash__bell-badge {
        position: absolute;
        top: -8px;
        right: -8px;
      }
      .dash__body {
        display: flex;
        flex: 1;
        min-height: 0;
      }
      .dash__sidebar {
        display: flex;
        flex-direction: column;
        width: 220px;
        padding: var(--cb-space-3, 0.75rem);
        border-right: 1px solid var(--cb-color-border);
        background: var(--cb-color-surface);
      }
      .dash__sidebar nav {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .dash__nav-link {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.55rem 0.7rem;
        border-radius: var(--cb-radius-md);
        color: var(--cb-color-text-muted);
        text-decoration: none;
        font-size: 0.9rem;
      }
      .dash__nav-link:hover {
        background: var(--cb-color-surface-hover, rgba(0, 0, 0, 0.04));
        color: var(--cb-color-text);
      }
      .dash__nav-link--active {
        background: var(--cb-color-primary-50, #ecfdf5);
        color: var(--cb-color-primary-700, #047857);
        font-weight: 600;
      }
      .dash__nav-link--foot {
        margin-top: auto;
      }
      .dash__main {
        flex: 1;
        min-width: 0;
        padding: var(--cb-space-5, 1.25rem);
        overflow: auto;
      }
      .dash__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cb-space-4, 1rem);
      }
      .dash__title {
        margin: 0;
        font-size: 1.1rem;
      }
      .dash__stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--cb-space-3, 0.75rem);
        margin-bottom: var(--cb-space-4, 1rem);
      }
      .dash__stat-inner {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      .dash__stat-label {
        font-size: 0.8rem;
        color: var(--cb-color-text-muted);
      }
      .dash__stat-value {
        font-size: 1.6rem;
        font-weight: 700;
      }
      .dash__stat-trend {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.8rem;
        color: var(--cb-color-success-600, #16a34a);
      }
      .dash__stat-trend--down {
        color: var(--cb-color-danger-600, #dc2626);
      }
      .dash__table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
      }
      .dash__table th {
        text-align: left;
        padding: 0.5rem 0.4rem;
        color: var(--cb-color-text-muted);
        font-weight: 600;
        border-bottom: 1px solid var(--cb-color-border);
      }
      .dash__table td {
        padding: 0.6rem 0.4rem;
        border-bottom: 1px solid var(--cb-color-border);
      }
      .dash__user {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }
      .dash__user-name {
        font-weight: 600;
      }
      .dash__user-mail {
        font-size: 0.78rem;
        color: var(--cb-color-text-muted);
      }
      .dash__muted {
        color: var(--cb-color-text-muted);
      }
      @media (max-width: 720px) {
        .dash__sidebar {
          display: none;
        }
        .dash__search {
          display: none;
        }
      }
    `,
  ],
})
export class DashboardTemplateComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly navLinks: NavLink[] = [
    { label: 'Dashboard', icon: 'house', active: true },
    { label: 'Analítica', icon: 'trending-up' },
    { label: 'Usuarios', icon: 'users' },
    { label: 'Archivos', icon: 'folder' },
    { label: 'Ajustes', icon: 'settings' },
  ];

  protected readonly stats: Stat[] = [
    { label: 'Ingresos', value: '$48.2k', trend: '+12.5%', up: true },
    { label: 'Usuarios', value: '2,340', trend: '+8.1%', up: true },
    { label: 'Pedidos', value: '1,120', trend: '-3.2%', up: false },
    { label: 'Conversión', value: '4.7%', trend: '+1.4%', up: true },
  ];

  protected readonly rows: ActivityRow[] = [
    { name: 'María Álvarez', email: 'maria@ejemplo.com', role: 'Admin', status: 'Activo', severity: 'success', date: 'Hace 2 h' },
    { name: 'Juan Pérez', email: 'juan@ejemplo.com', role: 'Editor', status: 'Pendiente', severity: 'warning', date: 'Hace 5 h' },
    { name: 'Lucía Gómez', email: 'lucia@ejemplo.com', role: 'Viewer', status: 'Inactivo', severity: 'secondary', date: 'Ayer' },
    { name: 'Carlos Ruiz', email: 'carlos@ejemplo.com', role: 'Editor', status: 'Activo', severity: 'success', date: 'Ayer' },
  ];

  protected readonly menuOpen = signal(false);

  protected initials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  protected readonly htmlCode = `<div class="dash">
  <header class="dash__topbar">
    <div class="dash__brand"><cb-icon name="sparkles" [size]="20" /> CaribeNG</div>
    <div class="dash__search"><cb-icon name="search" [size]="16" /><input placeholder="Buscar…" /></div>
    <div class="dash__topbar-actions">
      <span class="dash__icon-btn"><cb-icon name="bell" [size]="18" /><cb-badge value="3" severity="danger" size="sm" /></span>
      <cb-avatar label="MA" severity="primary" />
    </div>
  </header>

  <div class="dash__body">
    <aside class="dash__sidebar">
      <nav>
        @for (link of navLinks; track link.label) {
          <a class="dash__nav-link" [class.dash__nav-link--active]="link.active" href="#">
            <cb-icon [name]="link.icon" [size]="18" /> {{ link.label }}
          </a>
        }
      </nav>
    </aside>

    <main class="dash__main">
      <div class="dash__head">
        <h3>Resumen</h3>
        <cb-button size="sm"><cb-icon name="plus" [size]="16" /> Nuevo</cb-button>
      </div>

      <div class="dash__stats">
        @for (s of stats; track s.label) {
          <cb-card class="dash__stat">
            <span class="dash__stat-label">{{ s.label }}</span>
            <strong class="dash__stat-value">{{ s.value }}</strong>
            <span class="dash__stat-trend"><cb-icon name="trending-up" [size]="14" /> {{ s.trend }}</span>
          </cb-card>
        }
      </div>

      <cb-card header="Actividad reciente">
        <table class="dash__table">
          <!-- @for (row of rows) ... avatar + nombre + <cb-tag [value]="row.status" [severity]="row.severity" /> -->
        </table>
      </cb-card>
    </main>
  </div>
</div>`;

  protected readonly tsCode = `import { Component } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbCard } from '@caribeng/ui/card';
import { CbButton } from '@caribeng/ui/button';
import { CbAvatar } from '@caribeng/ui/avatar';
import { CbTag } from '@caribeng/ui/tag';
import { CbBadge } from '@caribeng/ui/badge';

@Component({
  selector: 'app-dashboard',
  imports: [CbIcon, CbCard, CbButton, CbAvatar, CbTag, CbBadge],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  readonly navLinks = [
    { label: 'Dashboard', icon: 'house', active: true },
    { label: 'Analítica', icon: 'trending-up' },
    { label: 'Usuarios', icon: 'users' },
    { label: 'Archivos', icon: 'folder' },
    { label: 'Ajustes', icon: 'settings' },
  ];

  readonly stats = [
    { label: 'Ingresos', value: '$48.2k', trend: '+12.5%', up: true },
    { label: 'Usuarios', value: '2,340', trend: '+8.1%', up: true },
    { label: 'Pedidos', value: '1,120', trend: '-3.2%', up: false },
    { label: 'Conversión', value: '4.7%', trend: '+1.4%', up: true },
  ];

  readonly rows = [
    { name: 'María Álvarez', email: 'maria@ejemplo.com', role: 'Admin', status: 'Activo', severity: 'success', date: 'Hace 2 h' },
    // …
  ];
}

/* El CSS del shell (.dash, .dash__topbar, .dash__sidebar, …) acompaña al componente. */`;
}
