import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
import type { CbSeverity } from '@caribeng/ui';
import { CbInput } from '@caribeng/ui/input';
import { CbSelectButton } from '@caribeng/ui/selectbutton';
import { CbTag } from '@caribeng/ui/tag';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { I18nService } from '../services/i18n.service';
import { TocService } from '../services/toc.service';
import { CHANGELOG } from '../data/changelog.generated';
import type { CbChangeType, CbChangelogRelease } from '../data/changelog.model';

/** Orden de las secciones y su presentación. */
const TYPES: readonly { type: CbChangeType; es: string; en: string; severity: CbSeverity }[] = [
  { type: 'breaking', es: 'Cambios incompatibles', en: 'Breaking changes', severity: 'danger' },
  { type: 'added', es: 'Novedades', en: 'Features', severity: 'success' },
  { type: 'changed', es: 'Mejoras', en: 'Enhancements', severity: 'info' },
  { type: 'fixed', es: 'Correcciones', en: 'Defect fixes', severity: 'warning' },
  { type: 'deprecated', es: 'Obsoleto', en: 'Deprecated', severity: 'secondary' },
  { type: 'removed', es: 'Eliminado', en: 'Removed', severity: 'secondary' },
  { type: 'security', es: 'Seguridad', en: 'Security', severity: 'danger' },
];

/** Total de cambios de un tipo en todas las versiones. */
function countOf(type: CbChangeType): number {
  return CHANGELOG.reduce((n, r) => n + (r.sections.find((s) => s.type === type)?.items.length ?? 0), 0);
}

/** Fragmento de texto: lo que va entre comillas invertidas se pinta como código. */
interface Part {
  code: boolean;
  text: string;
}

/**
 * Changelog de CaribeNG (al estilo de primeng.dev/changelog), generado desde
 * CHANGELOG.md por `scripts/gen-changelog.mjs`. Permite buscar por palabra clave
 * y filtrar por tipo de cambio.
 */
@Component({
  selector: 'doc-changelog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPageHeaderComponent, CbInput, CbSelectButton, CbTag],
  template: `
    <doc-page-header
      eyebrow="Versiones"
      title="Changelog"
      lead="Novedades, mejoras y correcciones de cada versión de CaribeNG. Busca por palabra clave o filtra por tipo de cambio."
    />

    <div class="cl-toolbar">
      <div class="cl-search">
        <cb-input
          type="search"
          [label]="i18n.t('Buscar', 'Search')"
          [placeholder]="i18n.t('Componente o palabra clave…', 'Component or keyword…')"
          [(value)]="query"
        />
      </div>
      <cb-selectbutton
        [options]="typeOptions()"
        optionLabel="label"
        optionValue="value"
        multiple
        size="sm"
        [ariaLabel]="i18n.t('Filtrar por tipo de cambio', 'Filter by change type')"
        [(value)]="types"
      />
    </div>

    <p class="cl-summary" aria-live="polite">
      {{ visible().length }} {{ i18n.t('versiones', 'releases') }} · {{ entryCount() }}
      {{ i18n.t('cambios', 'entries') }}
    </p>

    @for (release of visible(); track release.anchor) {
      <section class="cl-release" [id]="release.anchor">
        <header class="cl-release__head">
          <h2 class="cl-release__title">
            <a [href]="'#' + release.anchor">{{ release.title }}</a>
          </h2>
          @if (!release.version) {
            <cb-tag [value]="i18n.t('Sin publicar', 'Unreleased')" severity="warning" rounded />
          } @else if (release.latest) {
            <cb-tag [value]="i18n.t('Última', 'Latest')" severity="success" rounded />
          }
          @if (release.date) {
            <time class="cl-release__date" [attr.datetime]="release.date">{{ formatDate(release.date) }}</time>
          }
        </header>

        @for (section of release.sections; track section.type) {
          <h3 class="cl-section__title">
            <cb-tag [value]="label(section.type)" [severity]="severity(section.type)" />
            <span class="cl-section__count">({{ section.items.length }})</span>
          </h3>
          <ul class="cl-items">
            @for (item of section.items; track $index) {
              <li class="cl-item">
                @if (item.component) {
                  <span class="cl-item__component">{{ item.component }}</span>
                }
                <span class="cl-item__text">
                  @for (part of parts(item.text); track $index) {
                    @if (part.code) { <code>{{ part.text }}</code> } @else { {{ part.text }} }
                  }
                </span>
              </li>
            }
          </ul>
        }
      </section>
    } @empty {
      <p class="cl-empty">{{ i18n.t('No hay cambios que coincidan con la búsqueda.', 'No changes match your search.') }}</p>
    }
  `,
  styles: [`
    :host { display:block; }
    .cl-toolbar { display:flex; flex-wrap:wrap; align-items:flex-end; gap:var(--cb-space-4, 1rem); margin:var(--cb-space-6, 1.5rem) 0 var(--cb-space-3, .75rem); }
    .cl-search { flex:1 1 16rem; max-width:24rem; }
    .cl-summary { margin:0 0 var(--cb-space-8, 2rem); color:var(--cb-color-text-muted); font-size:var(--cb-text-sm, .875rem); }
    .cl-release { scroll-margin-top:5rem; padding-bottom:var(--cb-space-8, 2rem); margin-bottom:var(--cb-space-8, 2rem); border-bottom:1px solid var(--cb-color-border); }
    .cl-release:last-of-type { border-bottom:none; }
    .cl-release__head { display:flex; flex-wrap:wrap; align-items:center; gap:var(--cb-space-3, .75rem); margin-bottom:var(--cb-space-4, 1rem); }
    .cl-release__title { margin:0; font-size:var(--cb-text-2xl, 1.5rem); font-weight:var(--cb-font-weight-bold, 700); color:var(--cb-color-text-strong); }
    .cl-release__title a { color:inherit; text-decoration:none; }
    .cl-release__title a:hover { color:var(--cb-color-primary-500); }
    .cl-release__date { color:var(--cb-color-text-muted); font-size:var(--cb-text-sm, .875rem); }
    .cl-section__title { display:flex; align-items:center; gap:var(--cb-space-2, .5rem); margin:var(--cb-space-5, 1.25rem) 0 var(--cb-space-2, .5rem); font-size:var(--cb-text-sm, .875rem); font-weight:var(--cb-font-weight-medium, 500); }
    .cl-section__count { color:var(--cb-color-text-muted); }
    .cl-items { list-style:none; margin:0; padding:0; border:1px solid var(--cb-color-border); border-radius:var(--cb-radius-lg, .75rem); overflow:hidden; }
    .cl-item { display:flex; flex-direction:column; gap:.15rem; padding:.7rem 1rem; border-bottom:1px solid var(--cb-color-border); }
    .cl-item:last-child { border-bottom:none; }
    .cl-item__component { font-weight:var(--cb-font-weight-semibold, 600); color:var(--cb-color-text-strong); }
    .cl-item__text { color:var(--cb-color-text-muted); line-height:1.55; }
    code { font-size:.85em; padding:.1em .35em; border-radius:var(--cb-radius-sm, 4px); background:var(--cb-color-surface-100); color:var(--cb-color-text); }
    .cl-empty { color:var(--cb-color-text-muted); }
  `],
})
export class ChangelogComponent {
  protected readonly i18n = inject(I18nService);
  private readonly toc = inject(TocService);

  protected readonly query = signal('');
  protected readonly types = signal<CbChangeType[]>([]);

  /** Versiones con ancla, título y marca de "última" ya calculados. */
  private readonly releases = CHANGELOG.map((r: CbChangelogRelease) => ({
    ...r,
    anchor: r.version ? `v${r.version.replace(/\./g, '-')}` : 'unreleased',
    title: r.version ?? '',
    latest: r.version !== null && r.version === CHANGELOG.find((x) => x.version)?.version,
  }));

  /** Opciones de filtro con el total de cambios de cada tipo. */
  protected readonly typeOptions = computed(() =>
    TYPES.map((t) => ({ t, count: countOf(t.type) }))
      .filter(({ count }) => count > 0)
      .map(({ t, count }) => ({ value: t.type, label: `${this.i18n.t(t.es, t.en)} (${count})` })),
  );

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const types = this.types();
    const order = TYPES.map((t) => t.type);
    return this.releases
      .map((r) => ({
        ...r,
        title: r.version ?? this.i18n.t('Próxima versión', 'Next release'),
        sections: r.sections
          .filter((s) => !types.length || types.includes(s.type))
          .map((s) => ({
            ...s,
            items: s.items.filter((i) => !q || `${i.component} ${i.text}`.toLowerCase().includes(q)),
          }))
          .filter((s) => s.items.length)
          .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type)),
      }))
      .filter((r) => r.sections.length);
  });

  protected readonly entryCount = computed(() =>
    this.visible().reduce((n, r) => n + r.sections.reduce((m, s) => m + s.items.length, 0), 0),
  );

  constructor() {
    this.toc.reset();
    afterNextRender(() => {
      for (const r of this.releases) {
        this.toc.register({ id: r.anchor, label: r.version ?? 'Próxima versión' });
      }
    });
  }

  protected label(type: CbChangeType): string {
    const t = TYPES.find((x) => x.type === type)!;
    return this.i18n.t(t.es, t.en);
  }

  protected severity(type: CbChangeType): CbSeverity {
    return TYPES.find((x) => x.type === type)!.severity;
  }

  protected formatDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat(this.i18n.isEnglish() ? 'en-US' : 'es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(y, m - 1, d));
  }

  protected parts(text: string): Part[] {
    return text
      .split('`')
      .map((t, i) => ({ code: i % 2 === 1, text: t }))
      .filter((p) => p.text);
  }
}
