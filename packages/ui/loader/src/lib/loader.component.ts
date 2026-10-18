import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'cb-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-loader' },
  template: `
    <div class="cb-caribe-box" role="status" aria-live="polite">
      <span
        style="width: 1rem; height: 1rem; border-radius: 999px; border: 2px solid var(--cb-color-primary-500, #10b981); border-top-color: transparent; display: inline-block"
        aria-hidden="true"
      ></span>
      <span>{{ text() }}</span>
    </div>
  `,
  styleUrl: './loader.component.css',
})
export class CbLoaderComponent {
  readonly text = input<string>('Cargando información…');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
}
