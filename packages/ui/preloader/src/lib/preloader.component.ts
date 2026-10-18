import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'cb-preloader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-preloader' },
  template: `
    @if (active()) {
      <div
        class="cb-caribe-box"
        role="alert"
        aria-busy="true"
        style="padding: 1rem 1.5rem; flex-direction: column; text-align: center"
      >
        <strong style="font-size: 0.9rem">{{ title() }}</strong>
        <span style="font-size: 0.8rem; color: var(--cb-color-text-muted, #64748b)">{{ label() }}</span>
      </div>
    }
  `,
  styleUrl: './preloader.component.css',
})
export class CbPreloaderComponent {
  readonly active = input<boolean>(true);
  readonly title = input<string>('CaribeNG');
  readonly label = input<string>('Preparando tu sesión segura…');
}
