import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { CbAppShell, CbSidebar, type CbSidebarGroup, CbSidebarToggle } from '@caribeng/ui/sidebar';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-sidebar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbSidebar, CbAppShell, CbSidebarToggle, CbIcon, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Menu"
      title="Sidebar y AppShell"
      lead="Menú lateral con secciones, badges y grupos desplegables, que se contrae a iconos. Con cb-app-shell forma el esqueleto de una aplicación y en móvil pasa a ser un panel deslizante."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="shell"
      title="App shell"
      description="cb-app-shell coloca el sidebar, la cabecera [cb-app-shell-header] y el contenido. cbSidebarToggle convierte cualquier botón en el control del menú. Por debajo de breakpoint (medido en el propio shell) el menú se desliza sobre el contenido."
      [code]="shellCode"
    >
      <label class="sb-switch"><input type="checkbox" [checked]="mobile()" (change)="mobile.set(!mobile())" /> Ver como móvil</label>
      <div class="sb-frame" [class.sb-frame--mobile]="mobile()">
        <cb-app-shell [forceMobile]="mobile()">
          <cb-sidebar [groups]="groups" [(active)]="active">
            <div cb-sidebar-header class="sb-brand">
              <span class="sb-logo" aria-hidden="true">C</span><span class="sb-brand-name">Caribe Bank</span>
            </div>
            <div cb-sidebar-footer class="sb-user">
              <span class="sb-avatar" aria-hidden="true">LG</span><span class="sb-user-name">Laura Gómez</span>
            </div>
          </cb-sidebar>
          <header cb-app-shell-header class="sb-header">
            <button type="button" class="sb-toggle" cbSidebarToggle><cb-icon name="menu" [size]="20" aria-hidden="true" /></button>
            <strong>{{ title() }}</strong>
          </header>
          <div class="sb-content">
            <p>Sección activa: <code>{{ active() }}</code></p>
            <p class="sb-muted">Contrae el menú con el botón de la cabecera o con el del pie del sidebar.</p>
          </div>
        </cb-app-shell>
      </div>
    </doc-section>

    <doc-section
      id="standalone"
      title="Solo el sidebar"
      description="Fuera del shell, [(collapsed)] controla el modo contraído. Los enlaces usan href; pasa [navigate] para navegar con el router sin recargar."
      [code]="standaloneCode"
    >
      <div class="sb-standalone">
        <cb-sidebar [groups]="groups" [(collapsed)]="collapsed" [(active)]="active" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .sb-switch {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
        font-size: 0.875rem;
      }
      .sb-frame {
        height: 26rem;
        width: 100%;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg);
        overflow: hidden;
      }
      .sb-frame--mobile {
        max-width: 24rem;
      }
      .sb-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        height: 3.5rem;
        padding: 0 1rem;
        border-bottom: 1px solid var(--cb-color-border);
      }
      .sb-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.25rem;
        height: 2.25rem;
        border: 0;
        border-radius: var(--cb-radius-md);
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      .sb-toggle:hover {
        background: var(--cb-color-surface-hover);
      }
      .sb-toggle:focus-visible {
        outline: 2px solid var(--cb-color-focus-ring);
        outline-offset: 2px;
      }
      .sb-content {
        padding: 1.25rem;
      }
      .sb-muted {
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
      .sb-brand,
      .sb-user {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        min-width: 0;
        font-weight: 600;
      }
      .sb-logo,
      .sb-avatar {
        display: inline-flex;
        flex: none;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border-radius: var(--cb-radius-md);
        background: var(--cb-color-primary);
        color: var(--cb-color-primary-contrast);
        font-size: 0.8rem;
      }
      .sb-avatar {
        border-radius: 50%;
        background: var(--cb-color-surface-hover);
        color: var(--cb-color-text);
      }
      .sb-brand-name,
      .sb-user-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .sb-standalone {
        height: 24rem;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg);
        overflow: hidden;
        width: fit-content;
      }
    `,
  ],
})
export class SidebarDocComponent {
  protected readonly docApi = DOC_API['cb-sidebar'];
  protected readonly a11y = DOC_A11Y['cb-sidebar'];

  protected readonly mobile = signal(false);
  protected readonly collapsed = signal(false);
  protected readonly active = signal<string | null>('inicio');
  protected readonly title = () => this.findLabel(this.active()) ?? 'Inicio';

  protected readonly groups: CbSidebarGroup[] = [
    {
      label: 'General',
      items: [
        { id: 'inicio', label: 'Inicio', icon: 'house' },
        { id: 'movimientos', label: 'Movimientos', icon: 'clock', badge: 4 },
        { id: 'tarjetas', label: 'Tarjetas', icon: 'credit-card-reader' },
        {
          id: 'pagos',
          label: 'Pagos',
          icon: 'landmark',
          children: [
            { id: 'servicios', label: 'Servicios' },
            { id: 'impuestos', label: 'Impuestos' },
            { id: 'programados', label: 'Programados', badge: 'Nuevo' },
          ],
        },
      ],
    },
    {
      label: 'Cuenta',
      items: [
        { id: 'configuracion', label: 'Configuración', icon: 'settings' },
        { id: 'ayuda', label: 'Ayuda', icon: 'info', url: 'https://caribeng.dev', target: '_blank' },
      ],
    },
  ];

  private findLabel(id: string | null): string | undefined {
    for (const group of this.groups) {
      for (const item of group.items) {
        if (item.id === id) return item.label;
        const child = item.children?.find((c) => c.id === id);
        if (child) return child.label;
      }
    }
    return undefined;
  }

  protected readonly importCode = `import { CbAppShell, CbSidebar, CbSidebarToggle, type CbSidebarGroup } from '@caribeng/ui/sidebar';`;
  protected readonly shellCode = `<cb-app-shell [forceMobile]="mobile()" style="height: 26rem">
  <cb-sidebar [groups]="groups" [(active)]="active">
    <div cb-sidebar-header>Caribe Bank</div>
    <div cb-sidebar-footer>Laura Gómez</div>
  </cb-sidebar>
  <header cb-app-shell-header>
    <button type="button" cbSidebarToggle><cb-icon name="menu" [size]="20" aria-hidden="true" /></button>
    <strong>{{ title() }}</strong>
  </header>
  <p>Sección activa: {{ active() }}</p>
</cb-app-shell>`;
  protected readonly standaloneCode = `<cb-sidebar [groups]="groups" [(collapsed)]="collapsed" [(active)]="active" />`;

  constructor() {
    inject(TocService).reset();
  }
}
