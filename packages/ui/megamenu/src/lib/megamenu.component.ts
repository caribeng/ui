import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, inject, input, output, signal } from '@angular/core';
import { CbIconComponent } from '@caribeng/ui/icon';

export interface CbMegaMenuLink { label: string; url?: string; icon?: string; disabled?: boolean; }
export interface CbMegaMenuGroup { label: string; items: readonly CbMegaMenuLink[]; }
export interface CbMegaMenuItem { label: string; icon?: string; groups: readonly CbMegaMenuGroup[]; }

/** Horizontal category menu with multi-column panels. */
@Component({
  selector: 'cb-megamenu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
  host: { class: 'cb-megamenu', '(document:click)': 'onDocumentClick($event)', '(keydown.escape)': 'close()' },
  template: `
    <nav [attr.aria-label]="ariaLabel()">
      <ul class="cb-megamenu__bar">
        @for (item of items(); track $index; let i = $index) {
          <li><button class="cb-megamenu__trigger" type="button" [attr.aria-expanded]="openIndex() === i" aria-haspopup="true" (click)="toggle(i)">@if (item.icon) { <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" /> }{{ item.label }}<cb-icon class="cb-megamenu__chevron" [class.cb-megamenu__chevron--open]="openIndex() === i" name="chevron-down" [size]="14" aria-hidden="true" /></button></li>
        }
      </ul>
      @if (openIndex() !== null) {
        <section class="cb-megamenu__panel" role="region" [attr.aria-label]="items()[openIndex()!].label">
          @for (group of items()[openIndex()!] .groups; track $index) {
            <div class="cb-megamenu__group"><h3>{{ group.label }}</h3><ul>
              @for (link of group.items; track $index) {
                <li>@if (link.url && !link.disabled) { <a class="cb-megamenu__link" [href]="link.url" (click)="select(link)">@if (link.icon) { <cb-icon [name]="link.icon" [size]="16" aria-hidden="true" /> }{{ link.label }}</a> } @else { <button class="cb-megamenu__link" type="button" [disabled]="link.disabled" (click)="select(link)">@if (link.icon) { <cb-icon [name]="link.icon" [size]="16" aria-hidden="true" /> }{{ link.label }}</button> }</li>
              }
            </ul></div>
          }
        </section>
      }
    </nav>
  `,
  styleUrl: './megamenu.component.css',
})
export class CbMegaMenuComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly items = input<readonly CbMegaMenuItem[]>([]);
  readonly ariaLabel = input('Categories');
  readonly itemSelect = output<CbMegaMenuLink>();
  protected readonly openIndex = signal<number | null>(null);
  toggle(index: number): void { this.openIndex.update((current) => current === index ? null : index); }
  select(link: CbMegaMenuLink): void { if (!link.disabled) { this.itemSelect.emit(link); this.close(); } }
  close(): void { this.openIndex.set(null); }
  onDocumentClick(event: MouseEvent): void { if (!(this.host.nativeElement as HTMLElement).contains(event.target as Node)) this.close(); }
}
