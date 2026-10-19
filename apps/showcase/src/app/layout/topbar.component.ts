import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CbThemeService } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'doc-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CbIcon],
  template: `
    <div class="topbar">
      <a routerLink="/" class="topbar__brand" aria-label="CaribeNG">
        <svg
          class="topbar__shield"
          width="30"
          height="32"
          viewBox="0 0 64 68"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M32 2L3 12.5L7.6 51.5L32 65.5L56.4 51.5L61 12.5L32 2Z"
            fill="var(--cb-color-primary-500, #10b981)"
          />
          <path
            d="M32 2V65.5L56.4 51.5L61 12.5L32 2Z"
            fill="var(--cb-color-primary-600, #059669)"
          />
          <path
            d="M32 6.2L7.5 15.2L11.4 48.6L32 60.5L52.6 48.6L56.5 15.2L32 6.2Z"
            stroke="#ffffff"
            stroke-opacity="0.22"
            stroke-width="1.5"
          />
          <path
            d="M32 13L18.5 41H24.2L27.1 34.4H36.9L39.8 41H45.5L32 13ZM29.3 29.2L32 22.8L34.7 29.2H29.3Z"
            fill="#ffffff"
          />
          <path
            d="M15 46.5C19.5 43.5 24.5 43.5 29 46.5C33.5 49.5 38.5 49.5 43 46.5C45.5 44.8 47.5 44.2 49.5 44.5"
            stroke="var(--cb-color-primary-200, #a7f3d0)"
            stroke-width="3.2"
            stroke-linecap="round"
          />
          <path
            d="M19 52.5C23 50 27.5 50 31.5 52.5C35.5 55 40 55 44.5 52.2"
            stroke="#ffffff"
            stroke-width="2.6"
            stroke-linecap="round"
          />
        </svg>
        <span class="topbar__name">Caribe<span class="topbar__name-accent">NG</span></span>
        <span class="topbar__version">v1.1</span>
      </a>

      <button
        type="button"
        class="topbar__menu-btn"
        aria-label="Menú"
        (click)="toggleMenu.emit()"
      >
        <cb-icon name="menu" [size]="20" aria-hidden="true" />
      </button>

      <nav class="topbar__nav">
        <a routerLink="/introduction" class="topbar__link">Docs</a>
        <a routerLink="/foundations/colors" class="topbar__link">Colors</a>
        <a routerLink="/foundations/theming" class="topbar__link">Theming</a>
        <a routerLink="/foundations/utilities" class="topbar__link">Utilities</a>
      </nav>

      <div class="topbar__actions">
        <button
          type="button"
          class="topbar__lang-btn"
          [attr.aria-label]="i18n.t('Cambiar a inglés', 'Switch to Spanish')"
          [attr.title]="i18n.t('Idioma', 'Language')"
          (click)="i18n.toggle()"
        >
          {{ i18n.isEnglish() ? 'EN' : 'ES' }}
        </button>
        <button
          type="button"
          class="topbar__icon-btn"
          [attr.aria-label]="theme.isDark() ? i18n.t('Tema claro', 'Light theme') : i18n.t('Tema oscuro', 'Dark theme')"
          (click)="theme.toggle()"
        >
          <cb-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="18" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="topbar__icon-btn"
          aria-label="Configurar tema"
          (click)="toggleConfig.emit()"
        >
          <cb-icon name="palette" [size]="18" aria-hidden="true" />
        </button>
        <a
          class="topbar__icon-btn"
          href="https://github.com"
          target="_blank"
          rel="noopener"
          aria-label="GitHub"
        >
          <cb-icon name="external-link" [size]="18" aria-hidden="true" />
        </a>
      </div>
    </div>
  `,
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  protected readonly theme = inject(CbThemeService);
  protected readonly i18n = inject(I18nService);
  readonly toggleConfig = output<void>();
  readonly toggleMenu = output<void>();
}
