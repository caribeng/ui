import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, inject, input, output, signal } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { injectCbTranslation } from '@caribeng/ui';

export type CbDockPosition = 'top' | 'right' | 'bottom' | 'left';
export interface CbDockItem { label: string; icon: string; url?: string; disabled?: boolean; }

/**
 * Compact application launcher with configurable orientation.
 *
 * Sigue el patrón WAI-ARIA *toolbar*: un solo elemento entra en el orden de
 * tabulación y las flechas (según la orientación), Inicio y Fin recorren el resto.
 */
@Component({
  selector: 'cb-dock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-dock',
    '[class.cb-dock--top]': 'position() === "top"',
    '[class.cb-dock--right]': 'position() === "right"',
    '[class.cb-dock--bottom]': 'position() === "bottom"',
    '[class.cb-dock--left]': 'position() === "left"',
  },
  template: `
    <nav [attr.aria-label]="(ariaLabel() ?? t().appDock)">
      <ul class="cb-dock__list" role="toolbar" [attr.aria-orientation]="vertical() ? 'vertical' : 'horizontal'" (keydown)="onKeydown($event)">
        @for (item of items(); track $index; let i = $index) {
          <li role="none">
            @if (item.url && !item.disabled) {
              <a class="cb-dock__item" [href]="item.url" [attr.tabindex]="i === tabStop() ? 0 : -1" [attr.aria-label]="item.label" [title]="item.label" (click)="select(item)" (focus)="active.set(i)"><cb-icon [name]="item.icon" [size]="22" aria-hidden="true" /></a>
            } @else {
              <button class="cb-dock__item" type="button" [disabled]="item.disabled" [attr.tabindex]="i === tabStop() ? 0 : -1" [attr.aria-label]="item.label" [title]="item.label" (click)="select(item)" (focus)="active.set(i)"><cb-icon [name]="item.icon" [size]="22" aria-hidden="true" /></button>
            }
          </li>
        }
      </ul>
    </nav>
  `,
  styleUrl: './dock.component.css',
})
export class CbDock {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly items = input<readonly CbDockItem[]>([]);
  readonly position = input<CbDockPosition>('bottom');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly itemSelect = output<CbDockItem>();

  protected readonly vertical = computed(() => this.position() === 'left' || this.position() === 'right');
  /** Último elemento enfocado (el que recibe Tab al volver). */
  protected readonly active = signal(0);
  /** Elemento con `tabindex="0"`: el activo si se puede enfocar, si no el primero habilitado. */
  protected readonly tabStop = computed(() => {
    const items = this.items();
    if (items[this.active()] && !items[this.active()].disabled) return this.active();
    return items.findIndex((item) => !item.disabled);
  });

  select(item: CbDockItem): void { if (!item.disabled) this.itemSelect.emit(item); }

  protected onKeydown(event: KeyboardEvent): void {
    const [prev, next] = this.vertical() ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
    const enabled = this.items().flatMap((item, i) => (item.disabled ? [] : [i]));
    if (!enabled.length) return;
    const at = enabled.indexOf(this.tabStop());
    let target: number;
    if (event.key === next) target = enabled[(at + 1) % enabled.length];
    else if (event.key === prev) target = enabled[(at - 1 + enabled.length) % enabled.length];
    else if (event.key === 'Home') target = enabled[0];
    else if (event.key === 'End') target = enabled[enabled.length - 1];
    else return;
    event.preventDefault();
    this.active.set(target);
    this.host.nativeElement.querySelectorAll<HTMLElement>('.cb-dock__item')[target]?.focus();
  }
}
