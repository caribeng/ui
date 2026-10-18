import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CbThemeService } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import { I18nService } from '../services/i18n.service';
import { CURRENT_DOC_VERSION, DOC_VERSIONS } from '../data/versions';

@Component({
  selector: 'doc-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CbIcon],
  template: `
    <div class="topbar">
      <a routerLink="/" class="topbar__brand">
        <span class="topbar__logo">cb</span>
        <span class="topbar__name">CaribeNG</span>
      </a>

      <div class="topbar__version-wrap">
        <button
          type="button"
          class="topbar__version"
          [class.topbar__version--open]="versionOpen()"
          [attr.aria-expanded]="versionOpen()"
          aria-haspopup="listbox"
          [attr.aria-label]="i18n.t('Cambiar versión de documentación', 'Change documentation version')"
          (click)="versionOpen.set(!versionOpen())"
        >
          {{ current.label }}
          <cb-icon name="chevron-down" [size]="14" aria-hidden="true" />
        </button>
        @if (versionOpen()) {
          <div class="topbar__version-backdrop" (click)="versionOpen.set(false)"></div>
          <ul class="topbar__version-menu" role="listbox">
            @for (v of versions; track v.label) {
              <li role="presentation">
                <a
                  class="topbar__version-item"
                  [class.topbar__version-item--active]="v.current"
                  role="option"
                  [attr.aria-selected]="v.current"
                  [href]="v.url"
                  (click)="versionOpen.set(false)"
                >
                  <span class="topbar__version-item-label">{{ v.label }}</span>
                  <span class="topbar__version-item-meta">{{ v.angular }}</span>
                  @if (v.status === 'latest') {
                    <span class="topbar__version-tag">latest</span>
                  } @else if (v.status === 'maintenance') {
                    <span class="topbar__version-tag topbar__version-tag--muted">{{ i18n.t('mantenimiento', 'maintenance') }}</span>
                  }
                </a>
              </li>
            }
          </ul>
        }
      </div>

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

  protected readonly versions = DOC_VERSIONS;
  protected readonly current = CURRENT_DOC_VERSION;
  protected readonly versionOpen = signal(false);
}
