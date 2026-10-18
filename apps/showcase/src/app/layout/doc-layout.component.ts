import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './topbar.component';
import { SidebarComponent } from './sidebar.component';
import { TocComponent } from './toc.component';
import { ConfiguratorComponent } from './configurator.component';

@Component({
  selector: 'doc-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    TopbarComponent,
    SidebarComponent,
    TocComponent,
    ConfiguratorComponent,
  ],
  template: `
    <doc-topbar (toggleConfig)="configOpen.set(true)" (toggleMenu)="toggleMenu()" />

    <div class="layout">
      <aside class="layout__sidebar" [class.layout__sidebar--open]="menuOpen()">
        <doc-sidebar (navigate)="menuOpen.set(false)" />
      </aside>
      @if (menuOpen()) {
        <div class="layout__scrim" (click)="menuOpen.set(false)"></div>
      }

      <main class="layout__main">
        <router-outlet />
      </main>

      <aside class="layout__toc">
        <doc-toc />
      </aside>
    </div>

    <doc-configurator [open]="configOpen()" (close)="configOpen.set(false)" />
  `,
  styleUrl: './doc-layout.component.css',
})
export class DocLayoutComponent {
  protected readonly configOpen = signal(false);
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }
}
