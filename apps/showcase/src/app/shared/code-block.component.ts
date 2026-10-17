import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CbIconComponent } from '@caribeng/ui/icon';
import { HighlightService, type CodeLang } from './highlight.service';

/** Bloque de código resaltado con botón de copiar. */
@Component({
  selector: 'doc-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbIconComponent],
  template: `
    <div class="doc-code">
      <button
        type="button"
        class="doc-code__copy"
        style="display: inline-flex; align-items: center; gap: 0.35rem"
        (click)="copy()"
        [attr.aria-label]="copied() ? 'Copiado' : 'Copiar código'"
      >
        <cb-icon [name]="copied() ? 'check' : 'copy'" [size]="14" aria-hidden="true" />
        {{ copied() ? 'Copiado' : 'Copiar' }}
      </button>
      <pre class="doc-code__pre"><code
        class="doc-code__code"
        [class]="'language-' + lang()"
        [innerHTML]="highlighted()"
      ></code></pre>
    </div>
  `,
  styleUrl: './code-block.component.css',
})
export class CodeBlockComponent {
  private readonly highlighter = inject(HighlightService);

  readonly code = input.required<string>();
  readonly lang = input<CodeLang>('markup');

  protected readonly copied = signal(false);
  protected readonly highlighted = computed(() =>
    this.highlighter.highlight(this.code(), this.lang()),
  );

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code().trim());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1600);
    } catch {
      /* clipboard no disponible */
    }
  }
}
