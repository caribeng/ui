import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'cb-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-footer', style: 'display: block; width: 100%' },
  template: `
    <footer
      class="cb-caribe-surface"
      style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; width: 100%; padding: 0.85rem 1.25rem; font-size: 0.8rem"
    >
      <span>{{ copyright() }}</span>
      <div><ng-content /></div>
    </footer>
  `,
  styleUrl: './footer.component.css',
})
export class CbFooter {
  readonly copyright = input<string>('© 2026 CaribeNG Design System. Todos los derechos reservados.');
}
