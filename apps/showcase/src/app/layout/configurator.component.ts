import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CbThemeService } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import { ConfiguratorService } from '../services/configurator.service';
import {
  PRIMARY_NAMES,
  PRIMARY_PALETTES,
  SURFACE_NAMES,
  SURFACE_PALETTES,
} from '../data/palettes';

@Component({
  selector: 'doc-configurator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbIcon],
  template: `
    @if (open()) {
      <div class="cfg__backdrop" (click)="close.emit()"></div>
    }
    <aside class="cfg" [class.cfg--open]="open()" aria-label="Configurador de tema">
      <header class="cfg__header">
        <h2 class="cfg__title">Tema</h2>
        <button type="button" class="cfg__close" (click)="close.emit()" aria-label="Cerrar">
          <cb-icon name="x" [size]="18" aria-hidden="true" />
        </button>
      </header>

      <section class="cfg__section">
        <p class="cfg__label">Modo</p>
        <div class="cfg__modes">
          <button
            type="button"
            class="cfg__mode"
            [class.cfg__mode--active]="!theme.isDark()"
            (click)="theme.setTheme('light')"
          >
            <cb-icon name="sun" [size]="16" aria-hidden="true" /> Claro
          </button>
          <button
            type="button"
            class="cfg__mode"
            [class.cfg__mode--active]="theme.isDark()"
            (click)="theme.setTheme('dark')"
          >
            <cb-icon name="moon" [size]="16" aria-hidden="true" /> Oscuro
          </button>
        </div>
      </section>

      <section class="cfg__section">
        <p class="cfg__label">Primary</p>
        <div class="cfg__swatches">
          @for (name of primaryNames; track name) {
            <button
              type="button"
              class="cfg__swatch"
              [class.cfg__swatch--active]="config.primary() === name"
              [style.background]="primary(name)"
              [attr.aria-label]="name"
              [attr.title]="name"
              (click)="config.setPrimary(name)"
            ></button>
          }
        </div>
      </section>

      <section class="cfg__section">
        <p class="cfg__label">Surface</p>
        <div class="cfg__swatches">
          @for (name of surfaceNames; track name) {
            <button
              type="button"
              class="cfg__swatch"
              [class.cfg__swatch--active]="config.surface() === name"
              [style.background]="surface(name)"
              [attr.aria-label]="name"
              [attr.title]="name"
              (click)="config.setSurface(name)"
            ></button>
          }
        </div>
      </section>
    </aside>
  `,
  styleUrl: './configurator.component.css',
})
export class ConfiguratorComponent {
  protected readonly config = inject(ConfiguratorService);
  protected readonly theme = inject(CbThemeService);

  readonly open = input<boolean>(false);
  readonly close = output<void>();

  protected readonly primaryNames = PRIMARY_NAMES;
  protected readonly surfaceNames = SURFACE_NAMES;

  protected primary(name: string): string {
    return PRIMARY_PALETTES[name][5]; // tono 500
  }
  protected surface(name: string): string {
    // Las superficies son grises casi neutros: un solo tono (700) se ve igual
    // en todas. Un degradado por la rampa (claro → medio → oscuro) revela el
    // matiz de cada paleta y las hace distinguibles.
    const p = SURFACE_PALETTES[name];
    return `linear-gradient(135deg, ${p[2]} 0%, ${p[5]} 55%, ${p[9]} 100%)`;
  }
}
