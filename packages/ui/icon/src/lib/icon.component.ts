import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  isDevMode,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { CbIconRegistry } from './icon-registry';

/** Tamaños predefinidos o un número en píxeles. */
export type CbIconSize = 'sm' | 'md' | 'lg' | 'xl' | number;

const SIZE_PX: Record<string, number> = { sm: 16, md: 20, lg: 24, xl: 32 };

const warned = new Set<string>();

/**
 * Icono de CaribeNG. Pinta un SVG inline del registro (`CbIconRegistry`) por
 * nombre, heredando el color del texto (`currentColor`) y escalando con `size`.
 *
 * Los iconos son propios de la librería (set núcleo) y el consumidor puede
 * añadir los suyos con `provideCbIcons({ ... })`.
 *
 * @example
 * ```html
 * <cb-icon name="chevron-down" />
 * <cb-icon name="check" size="lg" />
 * <cb-icon name="loader" spin ariaLabel="Cargando" />
 * ```
 */
@Component({
  selector: 'cb-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-icon',
    '[class.cb-icon--spin]': 'spin()',
    '[attr.role]': 'ariaLabel() ? "img" : null',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-hidden]': 'ariaLabel() ? null : "true"',
  },
  template: `<span class="cb-icon__box" [innerHTML]="svg()"></span>`,
  styleUrl: './icon.component.css',
})
export class CbIconComponent {
  private readonly registry = inject(CbIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  /** Nombre del icono en el registro (p. ej. `chevron-down`). */
  readonly name = input.required<string>();
  /** Tamaño: `sm` (16) · `md` (20) · `lg` (24) · `xl` (32) o un número en px. */
  readonly size = input<CbIconSize>('md');
  /** Anima el icono girando (útil con `loader`). */
  readonly spin = input<boolean, unknown>(false, { transform: toBoolean });
  /** Nombre accesible. Si se omite, el icono es decorativo (`aria-hidden`). */
  readonly ariaLabel = input<string>('');

  protected readonly px = computed(() => {
    const s = this.size();
    return typeof s === 'number' ? s : (SIZE_PX[s] ?? SIZE_PX['md']);
  });

  protected readonly svg = computed<SafeHtml>(() => {
    const name = this.name();
    const body = this.registry.get(name);
    if (!body) {
      if (isDevMode() && !warned.has(name)) {
        warned.add(name);
        console.warn(`[CbIcon] icono no registrado: "${name}".`);
      }
      return '';
    }
    const p = this.px();
    const markup =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ` +
      `width="${p}" height="${p}" fill="none" stroke="currentColor" ` +
      `stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ` +
      `aria-hidden="true" focusable="false">${body}</svg>`;
    // Datos propios y constantes (no entrada del usuario): es seguro confiar.
    return this.sanitizer.bypassSecurityTrustHtml(markup);
  });
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
