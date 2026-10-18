import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, model, output } from '@angular/core';

@Component({
  selector: 'cb-file-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-file-select' },
  template: `
    <label class="cb-caribe-box" style="cursor: pointer; flex-direction: column; align-items: flex-start; min-width: 260px">
      <span style="font-weight: 600; font-size: 0.875rem">{{ label() }}</span>
      <span style="font-size: 0.75rem; color: var(--cb-color-text-muted, #64748b)">Formatos: {{ accept() }}</span>
      <input
        type="file"
        [attr.accept]="accept()"
        [multiple]="multiple()"
        [disabled]="disabled()"
        (change)="onFileChange($event)"
        style="font-size: 0.8rem; margin-top: 0.25rem"
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
