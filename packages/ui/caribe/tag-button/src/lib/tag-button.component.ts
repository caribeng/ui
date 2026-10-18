import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
  output,
} from '@angular/core';

/**
 * Tag-button de Caribe Design: píldora pulsable usada como filtro o chip de
 * acción. Alterna su estado seleccionado y emite el cambio.
 *
 * @example
 * ```html
 * <cb-tag-button label="Todos" [(selected)]="activo" />
 * ```
 */
@Component({
  selector: 'cb-tag-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-tag-button-host' },
  template: `
    <button
      type="button"
      class="cb-tag-button"
      [class.cb-tag-button--selected]="selected()"
      [disabled]="disabled()"
      [attr.aria-pressed]="selected()"
      (click)="toggle()"
    >
      <span class="cb-tag-button__label">{{ label() }}</span>
    </button>
  `,
  styleUrl: './tag-button.component.css',
})
export class CbTagButton {
  /** Texto del tag. */
  readonly label = input<string>('Filtro');
  /** Deshabilita la interacción. */
  readonly disabled = input<boolean>(false);
  /** Estado seleccionado (two-way: `[(selected)]`). */
  readonly selected = model<boolean>(false);
  /** Emite el nuevo estado al pulsar. */
  readonly changed = output<boolean>();

  toggle(): void {
    if (this.disabled()) return;
    const next = !this.selected();
    this.selected.set(next);
    this.changed.emit(next);
  }
}
