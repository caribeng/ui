import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CB_LOCALE_EN, CB_LOCALE_ES, type CbTranslation } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';
import { CbInput } from '@caribeng/ui/input';
import { CbPaginator } from '@caribeng/ui/paginator';
import { CbSelect } from '@caribeng/ui/select';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { I18nService } from '../services/i18n.service';
import { TocService } from '../services/toc.service';

/** Guía del sistema de idioma de la librería (textos de interfaz de los componentes). */
@Component({
  selector: 'doc-i18n-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent, CbButton, CbInput, CbPaginator, CbSelect],
  template: `
    <doc-page-header
      eyebrow="Configuración"
      title="Idioma (i18n)"
      lead="Los componentes traen sus textos de interfaz (etiquetas accesibles, botones, placeholders y mensajes) en español e inglés, y puedes traducirlos o personalizarlos."
    />

    <doc-section
      id="config"
      title="Configuración"
      description="Elige el idioma una vez para toda la app con provideCaribeNG(). Por defecto es español (es)."
    >
      <doc-code-block [code]="configCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="live"
      title="Cambio en caliente"
      description="CbLocaleService.use() cambia el idioma sin recargar: los componentes leen sus textos como signal. Pruébalo: el selector, el paginador y sus etiquetas accesibles cambian de idioma."
      [code]="liveCode"
      [codeTs]="liveTs"
    >
      <div style="display: grid; gap: 1rem; width: 100%">
        <div style="display: flex; gap: 0.5rem">
          <cb-button size="sm" [variant]="i18n.isEnglish() ? 'outlined' : 'solid'" (click)="i18n.setLang('es')">Español</cb-button>
          <cb-button size="sm" [variant]="i18n.isEnglish() ? 'solid' : 'outlined'" (click)="i18n.setLang('en')">English</cb-button>
        </div>
        <div style="max-width: 280px">
          <cb-select [options]="['Cartagena', 'Medellín', 'Bogotá']" [filter]="true" />
        </div>
        <cb-paginator [totalRecords]="120" />
      </div>
    </doc-section>

    <doc-section
      id="custom"
      title="Personalizar textos"
      description="translation sobrescribe solo las claves que indiques sobre el idioma elegido; en caliente, usa setTranslation()."
    >
      <doc-code-block [code]="customCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="new-language"
      title="Otro idioma"
      description="Para un idioma que no viene incluido, pasa un objeto CbTranslation completo. TypeScript te avisa si falta alguna clave."
    >
      <doc-code-block [code]="newLanguageCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="keys"
      title="Claves disponibles"
      description="Todos los textos que puedes traducir. Las partes {0}, {1}… se rellenan con valores como el número de página o el nombre de un elemento."
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <div style="max-width: 320px">
          <cb-input type="search" [placeholder]="i18n.t('Filtrar claves…', 'Filter keys…')" [(value)]="query" />
        </div>
        <div class="keys-wrap">
          <table class="keys">
            <thead>
              <tr>
                <th>{{ i18n.t('Clave', 'Key') }}</th>
                <th>Español (es)</th>
                <th>English (en)</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.key) {
                <tr>
                  <td><code>{{ row.key }}</code></td>
                  <td>{{ row.es }}</td>
                  <td>{{ row.en }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <p class="keys-count">{{ rows().length }} / {{ total }}</p>
      </div>
    </doc-section>
  `,
  styles: [`
    .keys-wrap { overflow-x: auto; max-height: 28rem; border: 1px solid var(--cb-color-border); border-radius: var(--cb-radius-lg, .75rem); }
    .keys { width: 100%; border-collapse: collapse; font-size: var(--cb-text-sm, .875rem); }
    .keys th, .keys td { padding: .5rem .85rem; text-align: left; border-bottom: 1px solid var(--cb-color-border); }
    .keys th { position: sticky; top: 0; background: var(--cb-color-surface-raised); font-size: var(--cb-text-xs, .72rem); text-transform: uppercase; letter-spacing: .06em; color: var(--cb-color-text-muted); }
    .keys tr:last-child td { border-bottom: none; }
    .keys code { font-size: .85em; color: var(--cb-color-text-strong); }
    .keys-count { margin: 0; color: var(--cb-color-text-muted); font-size: var(--cb-text-xs, .75rem); }
  `],
})
export class I18nComponent {
  protected readonly i18n = inject(I18nService);

  protected readonly query = signal('');
  protected readonly total = Object.keys(CB_LOCALE_ES).length;
  protected readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    return (Object.keys(CB_LOCALE_ES) as (keyof CbTranslation)[])
      .map((key) => ({ key, es: CB_LOCALE_ES[key], en: CB_LOCALE_EN[key] }))
      .filter((r) => !q || `${r.key} ${r.es} ${r.en}`.toLowerCase().includes(q));
  });

  protected readonly configCode = `// app.config.ts
import { provideCaribeNG } from '@caribeng/ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCaribeNG({ locale: 'en' }), // 'es' (por defecto) | 'en' | CbTranslation
  ],
};`;

  protected readonly liveCode = `<cb-button (click)="locale.use('es')">Español</cb-button>
<cb-button (click)="locale.use('en')">English</cb-button>`;

  protected readonly liveTs = `import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbLocaleService } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';

@Component({
  selector: 'app-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbButton],
  template: \`
    <cb-button (click)="locale.use('es')">Español</cb-button>
    <cb-button (click)="locale.use('en')">English</cb-button>
  \`,
})
export class LanguageSwitcher {
  protected readonly locale = inject(CbLocaleService);
}`;

  protected readonly customCode = `// Al configurar: solo cambian las claves indicadas
provideCaribeNG({
  locale: 'es',
  translation: { noResults: 'No encontramos coincidencias', close: 'Salir' },
});

// En caliente (por ejemplo, tras cargar los textos de tu backend)
inject(CbLocaleService).setTranslation({ today: 'Hoy mismo' });`;

  protected readonly newLanguageCode = `import { CB_LOCALE_EN, type CbTranslation } from '@caribeng/ui';

// Parte de un idioma incluido y traduce todas las claves
export const CB_LOCALE_PT: CbTranslation = {
  ...CB_LOCALE_EN,
  close: 'Fechar',
  search: 'Pesquisar…',
  noResults: 'Nenhum resultado',
  // …
};

provideCaribeNG({ locale: CB_LOCALE_PT });`;

  constructor() {
    inject(TocService).reset();
  }
}
