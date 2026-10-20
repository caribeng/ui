import { ChangeDetectionStrategy, Component, afterNextRender, inject, input } from '@angular/core';
import { I18nService } from '../services/i18n.service';
import { TocService } from '../services/toc.service';
import type { DocA11y } from './doc-a11y-registry';

/** Fragmento de texto: el código (entre comillas invertidas) se muestra como `<code>`. */
interface Part {
  code: boolean;
  text: string;
}

/**
 * Sección "Accesibilidad" de una página de componente: lector de pantalla y
 * tabla de soporte de teclado. Va antes del playground.
 */
@Component({
  selector: 'doc-a11y',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="accessibility" class="a11y">
      <h2 class="a11y__title"><a href="#accessibility">{{ i18n.t('Accesibilidad', 'Accessibility') }}</a></h2>

      <h3 class="a11y__subtitle">{{ i18n.t('Lector de pantalla', 'Screen reader') }}</h3>
      @for (p of data().screenReader; track $index) {
        <p class="a11y__text">
          @for (part of parts(p); track $index) {
            @if (part.code) { <code>{{ part.text }}</code> } @else { {{ part.text }} }
          }
        </p>
      }

      @if (data().keyboard?.length) {
        <h3 class="a11y__subtitle">{{ i18n.t('Soporte de teclado', 'Keyboard support') }}</h3>
        <div class="a11y__table-wrap">
          <table class="a11y__table">
            <thead>
              <tr>
                <th>{{ i18n.t('Tecla', 'Key') }}</th>
                <th>{{ i18n.t('Función', 'Function') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of data().keyboard ?? []; track $index) {
                <tr>
                  <td>
                    @for (key of keys(row.keys); track $index; let last = $last) {
                      <kbd>{{ key }}</kbd>@if (!last) { <span class="a11y__sep">/</span> }
                    }
                  </td>
                  <td>
                    @for (part of parts(row.action); track $index) {
                      @if (part.code) { <code>{{ part.text }}</code> } @else { {{ part.text }} }
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
  styles: [`
    :host { display:block; }
    .a11y { scroll-margin-top:5rem; margin-bottom:var(--cb-space-10, 2.5rem); }
    .a11y__title { font-size:var(--cb-text-xl, 1.25rem); font-weight:var(--cb-font-weight-semibold, 600); color:var(--cb-color-text-strong); margin:0 0 var(--cb-space-2, .5rem); }
    .a11y__title a { color:inherit; text-decoration:none; }
    .a11y__title a:hover { color:var(--cb-color-primary-500); }
    .a11y__subtitle { font-size:var(--cb-text-base, 1rem); font-weight:var(--cb-font-weight-semibold, 600); color:var(--cb-color-text-strong); margin:var(--cb-space-5, 1.25rem) 0 var(--cb-space-2, .5rem); }
    .a11y__text { color:var(--cb-color-text-muted); margin:0 0 var(--cb-space-3, .75rem); max-width:75ch; line-height:1.6; }
    code { font-size:.85em; padding:.1em .35em; border-radius:var(--cb-radius-sm, 4px); background:var(--cb-color-surface-100); color:var(--cb-color-text); }
    .a11y__table-wrap { overflow-x:auto; border:1px solid var(--cb-color-border); border-radius:var(--cb-radius-lg, .75rem); }
    .a11y__table { width:100%; border-collapse:collapse; font-size:var(--cb-text-sm, .875rem); }
    .a11y__table th, .a11y__table td { padding:.6rem .85rem; text-align:left; border-bottom:1px solid var(--cb-color-border); vertical-align:top; }
    .a11y__table tr:last-child td { border-bottom:none; }
    .a11y__table th { font-size:var(--cb-text-xs, .72rem); text-transform:uppercase; letter-spacing:.06em; color:var(--cb-color-text-muted); }
    .a11y__table td:first-child { white-space:nowrap; }
    kbd { display:inline-block; padding:.1em .45em; font-family:var(--cb-font-mono, monospace); font-size:.8em; border:1px solid var(--cb-color-border); border-bottom-width:2px; border-radius:var(--cb-radius-sm, 4px); background:var(--cb-color-surface-raised); color:var(--cb-color-text); }
    .a11y__sep { margin:0 .3rem; color:var(--cb-color-text-muted); }
  `],
})
export class DocA11yComponent {
  protected readonly i18n = inject(I18nService);

  readonly data = input.required<DocA11y>();

  constructor() {
    const toc = inject(TocService);
    afterNextRender(() => toc.register({ id: 'accessibility', label: 'Accesibilidad' }));
  }

  /** Traduce el texto y lo separa en fragmentos de texto y código. */
  protected parts(text: string): Part[] {
    return this.i18n
      .auto(text)
      .split('`')
      .map((t, i) => ({ code: i % 2 === 1, text: t }))
      .filter((p) => p.text);
  }

  /** Separa "Enter / Espacio" en teclas individuales (ya traducidas). */
  protected keys(text: string): string[] {
    return this.i18n.auto(text).split(' / ');
  }
}
