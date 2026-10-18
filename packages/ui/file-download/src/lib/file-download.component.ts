import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from '@angular/core';

@Component({
  selector: 'cb-file-download',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-file-download' },
  template: `
    <div class="cb-caribe-box" style="justify-content: space-between; min-width: 260px">
      <div style="display: flex; flex-direction: column">
        <strong style="font-size: 0.875rem">{{ fileName() }}</strong>
        <span style="font-size: 0.75rem; color: var(--cb-color-text-muted, #64748b)">{{ fileSize() }}</span>
      </div>
      <button
        type="button"
        (click)="onDownload()"
        [disabled]="disabled()"
        style="padding: 0.35rem 0.75rem; border-radius: 0.375rem; border: 1px solid var(--cb-color-primary-500, #10b981); background: var(--cb-color-primary-500, #10b981); color: #fff; cursor: pointer; font-size: 0.8rem"
      >
        {{ buttonLabel() }}
      </button>
    </div>
  `,
  styleUrl: './file-download.component.css',
})
export class CbFileDownloadComponent {
  readonly fileName = input<string>('Certificado_Bancario.pdf');
  readonly fileSize = input<string>('420 KB');
  readonly href = input<string>('');
  readonly buttonLabel = input<string>('Descargar');
  readonly disabled = input<boolean>(false);

  readonly download = output<string>();

  protected onDownload(): void {
    if (this.disabled()) return;
    this.download.emit(this.fileName());
  }
}
