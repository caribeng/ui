import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CbThemeService } from '@caribeng/ui';

@Component({
  selector: 'doc-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="topbar">
      <a routerLink="/" class="topbar__brand">
        <span class="topbar__logo">cb</span>
        <span class="topbar__name">CaribeNG</span>
        <span class="topbar__version">v0.1</span>
      </a>

      <button
        type="button"
        class="topbar__menu-btn"
        aria-label="Menú"
        (click)="toggleMenu.emit()"
      >
        ☰
      </button>

      <nav class="topbar__nav">
        <a routerLink="/introduction" class="topbar__link">Docs</a>
        <a routerLink="/foundations/colors" class="topbar__link">Colors</a>
        <a routerLink="/foundations/theming" class="topbar__link">Theming</a>
      </nav>

      <div class="topbar__actions">
        <button
          type="button"
          class="topbar__icon-btn"
          [attr.aria-label]="theme.isDark() ? 'Tema claro' : 'Tema oscuro'"
          (click)="theme.toggle()"
        >
          {{ theme.isDark() ? '☀' : '🌙' }}
        </button>
        <button
          type="button"
          class="topbar__icon-btn"
          aria-label="Configurar tema"
          (click)="toggleConfig.emit()"
        >
          🎨
        </button>
        <a
          class="topbar__icon-btn"
          href="https://github.com"
          target="_blank"
          rel="noopener"
          aria-label="GitHub"
        >
          ↗
        </a>
      </div>
    </div>
  `,
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  protected readonly theme = inject(CbThemeService);
  readonly toggleConfig = output<void>();
  readonly toggleMenu = output<void>();
}
