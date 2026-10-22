import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { cbRunCommand, cbVisibleItems, injectCbTranslation, type CbMenuCommandEvent } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

export interface CbMegaMenuLink {
  label: string;
  url?: string;
  icon?: string;
  disabled?: boolean;
  /** Acción al elegir el item (además del evento de selección), como `command` en PrimeNG. */
  command?: (event: CbMenuCommandEvent<CbMegaMenuLink>) => void;
  /** `false` oculta el item. */
  visible?: boolean;
}

export interface CbMegaMenuGroup {
  label: string;
  items: readonly CbMegaMenuLink[];
  /** `false` oculta el elemento. */
  visible?: boolean;
}

export interface CbMegaMenuItem {
  label: string;
  icon?: string;
  groups: readonly CbMegaMenuGroup[];
  /** `false` oculta el elemento. */
  visible?: boolean;
}

let nextUid = 0;

/**
 * Menú de categorías con paneles de varias columnas (patrón *disclosure
 * navigation* de WAI-ARIA). Teclado: ←/→ entre categorías, ↓ abre el panel y
 * entra al primer enlace, ↑/↓ recorre los enlaces y Escape cierra devolviendo
 * el foco a la categoría.
 *
 * @example
 * ```html
 * <cb-megamenu [items]="categorias" (itemSelect)="navegar($event)" />
 * ```
 */
@Component({
  selector: 'cb-megamenu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-megamenu',
    '(document:click)': 'onDocumentClick($event)',
    '(focusout)': 'onFocusOut($event)',
  },
  template: `
    <nav [attr.aria-label]="ariaLabel() ?? t().categories">
      <ul class="cb-megamenu__bar">
        @for (item of visibleItems(); track $index; let i = $index) {
          <li>
            <button
              class="cb-megamenu__trigger"
              type="button"
              [attr.aria-expanded]="openIndex() === i"
              [attr.aria-controls]="openIndex() === i ? panelId : null"
              (click)="toggle(i)"
              (keydown)="onTriggerKeydown($event, i)"
            >
              @if (item.icon) {
                <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" />
              }
              {{ item.label }}
              <cb-icon
                class="cb-megamenu__chevron"
                [class.cb-megamenu__chevron--open]="openIndex() === i"
                name="chevron-down"
                [size]="14"
                aria-hidden="true"
              />
            </button>
          </li>
        }
      </ul>
      @if (openIndex() !== null) {
        <section
          class="cb-megamenu__panel"
          [id]="panelId"
          role="region"
          [attr.aria-label]="visibleItems()[openIndex()!].label"
          (keydown)="onPanelKeydown($event)"
        >
          @for (group of visibleItems()[openIndex()!].groups; track $index) {
            <div class="cb-megamenu__group">
              <h3>{{ group.label }}</h3>
              <ul>
                @for (link of group.items; track $index) {
                  <li>
                    @if (link.url && !link.disabled) {
                      <a class="cb-megamenu__link" [href]="link.url" (click)="select(link)">
                        @if (link.icon) {
                          <cb-icon [name]="link.icon" [size]="16" aria-hidden="true" />
                        }
                        {{ link.label }}
                      </a>
                    } @else {
                      <button class="cb-megamenu__link" type="button" [disabled]="link.disabled" (click)="select(link)">
                        @if (link.icon) {
                          <cb-icon [name]="link.icon" [size]="16" aria-hidden="true" />
                        }
                        {{ link.label }}
                      </button>
                    }
                  </li>
                }
              </ul>
            </div>
          }
        </section>
      }
    </nav>
  `,
  styleUrl: './megamenu.component.css',
})
export class CbMegaMenu {
  protected readonly t = injectCbTranslation();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  protected readonly panelId = `cb-megamenu-${++nextUid}-panel`;

  /** Categorías con sus grupos de enlaces. */
  readonly items = input<readonly CbMegaMenuItem[]>([]);
  /** Items sin los de `visible: false`. */
  protected readonly visibleItems = computed(() => cbVisibleItems(this.items()));
  /** Nombre accesible de la navegación. Por defecto, "Categorías" del idioma activo. */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Se emite al elegir un enlace. */
  readonly itemSelect = output<CbMegaMenuLink>();

  protected readonly openIndex = signal<number | null>(null);

  toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? null : index));
  }

  select(link: CbMegaMenuLink): void {
    if (link.disabled) return;
    cbRunCommand(link);
    this.itemSelect.emit(link);
    this.close();
  }

  close(): void {
    this.openIndex.set(null);
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  /** Al salir el foco del componente (p. ej. con Tab), se cierra el panel. */
  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && !this.host.nativeElement.contains(next)) this.close();
  }

  protected onTriggerKeydown(event: KeyboardEvent, index: number): void {
    const count = this.visibleItems().length;
    switch (event.key) {
      case 'ArrowRight':
        this.focusTrigger((index + 1) % count);
        break;
      case 'ArrowLeft':
        this.focusTrigger((index - 1 + count) % count);
        break;
      case 'Home':
        this.focusTrigger(0);
        break;
      case 'End':
        this.focusTrigger(count - 1);
        break;
      case 'ArrowDown':
        this.openIndex.set(index);
        afterNextRender(() => this.links()[0]?.focus(), { injector: this.injector });
        break;
      case 'Escape':
        this.close();
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    const links = this.links();
    const current = links.indexOf(document.activeElement as HTMLElement);
    switch (event.key) {
      case 'ArrowDown':
        links[Math.min(links.length - 1, current + 1)]?.focus();
        break;
      case 'ArrowUp':
        if (current <= 0) this.focusTrigger(this.openIndex()!);
        else links[current - 1].focus();
        break;
      case 'Home':
        links[0]?.focus();
        break;
      case 'End':
        links[links.length - 1]?.focus();
        break;
      case 'Escape': {
        const index = this.openIndex()!;
        this.close();
        this.focusTrigger(index);
        break;
      }
      default:
        return;
    }
    event.preventDefault();
  }

  /** Enlaces navegables del panel abierto, en orden de lectura. */
  private links(): HTMLElement[] {
    return Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>('.cb-megamenu__panel .cb-megamenu__link:not([disabled])'),
    );
  }

  private focusTrigger(index: number): void {
    this.host.nativeElement.querySelectorAll<HTMLElement>('.cb-megamenu__trigger')[index]?.focus();
  }
}
