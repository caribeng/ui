import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
  output,
} from '@angular/core';

/**
 * File-select de Caribe Design: zona de selección de archivos con formatos
 * admitidos y lista de seleccionados.
 *
 * @example
 * ```html
 * <cb-file-select label="Adjuntar soporte" accept=".pdf,.png" />
 * ```
 */
@Component({
  selector: 'cb-file-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-file-select-host' },
  template: `
    <label class="cb-file-select" [class.cb-is-disabled]="disabled()">
      <span class="cb-file-select__icon" aria-hidden="true">↑</span>
      <span class="cb-file-select__title">{{ label() }}</span>
      <span class="cb-file-select__hint">Formatos: {{ accept() }}</span>
      @if (files().length) {
        <span class="cb-file-select__count">
          {{ files().length }} archivo(s) seleccionado(s)
        </span>
      }
      <input
        class="cb-file-select__input"
        type="file"
        [attr.accept]="accept()"
        [multiple]="multiple()"
        [disabled]="disabled()"
        (change)="onFileChange($event)"
      />
    </label>
  `,
  styleUrl: './file-select.component.css',
})
export class CbFileSelect {
  readonly label = input<string>('Seleccionar documento');
  readonly accept = input<string>('.pdf,.png,.jpg');
  readonly multiple = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly files = model<File[]>([]);
  readonly filesSelected = output<File[]>();

  protected onFileChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const list = inputEl.files ? Array.from(inputEl.files) : [];
    this.files.set(list);
    this.filesSelected.emit(list);
  }
}
