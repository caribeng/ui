import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input } from '@angular/core';
import { CbCopyButton } from '@caribeng/ui/copy-button';
import { cbCodeLanguageLabel, cbHighlight, cbParseLineSet } from './highlight';

/**
 * Bloque de código de CaribeNG con resaltado de sintaxis propio (sin
 * dependencias), nombre de archivo o lenguaje, botón de copiar, números de
 * línea y líneas destacadas. Sigue el tema claro u oscuro.
 *
 * El código se pinta como texto (tokens), nunca como HTML.
 *
 * @example
 * ```html
 * <cb-code-block language="ts" filename="app.config.ts" [code]="codigo" lineNumbers highlightLines="3-4" />
 * ```
 */
@Component({
  selector: 'cb-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbCopyButton],
  host: {
    class: 'cb-code-block',
    '[class.cb-code-block--wrap]': 'wrap()',
    '[class.cb-code-block--numbers]': 'lineNumbers()',
  },
  template: `
    @if (showHeader()) {
      <div class="cb-code-block__header">
        <span class="cb-code-block__title">{{ filename() || languageLabel() }}</span>
        @if (copyable()) {
          <cb-copy-button class="cb-code-block__copy" [value]="code()" size="sm" />
        }
      </div>
    }
    <pre
      class="cb-code-block__pre"
      tabindex="0"
      [style.max-height]="maxHeight() || null"
      [attr.aria-label]="ariaLabel() ?? (filename() || languageLabel() || null)"
    ><!-- En una línea: dentro de <pre> cada espacio cuenta. --><code class="cb-code-block__code">@for (line of lines(); track $index; let i = $index) {<span class="cb-code-block__line" [class.cb-code-block__line--hl]="highlighted().has(i + startLine())">@if (lineNumbers()) {<span class="cb-code-block__ln" aria-hidden="true">{{ i + startLine() }}</span>}<span class="cb-code-block__text">@for (token of line; track $index) {<span [class]="token.type === 'plain' ? null : 'cb-tok cb-tok-' + token.type">{{ token.text }}</span>}</span></span>}</code></pre>
  `,
  styleUrl: './code-block.component.css',
})
export class CbCodeBlock {
  /** Código a mostrar. */
  readonly code = input<string>('');
  /** Lenguaje (`ts`, `html`, `css`, `json`, `bash`, `python`, `sql`…). Desconocido = texto. */
  readonly language = input<string>('');
  /** Nombre de archivo en la cabecera (en lugar del lenguaje). */
  readonly filename = input<string>('');
  readonly lineNumbers = input(false, { transform: booleanAttribute });
  /** Número de la primera línea. */
  readonly startLine = input<number>(1);
  /** Líneas destacadas: `"2,5-7"` o `[2, 5, 6, 7]`. */
  readonly highlightLines = input<string | readonly number[]>('');
  /** Parte las líneas largas en lugar de hacer scroll horizontal. */
  readonly wrap = input(false, { transform: booleanAttribute });
  readonly copyable = input(true, { transform: booleanAttribute });
  /** Muestra la cabecera (lenguaje o archivo y copiar). */
  readonly header = input(true, { transform: booleanAttribute });
  /** Alto máximo con scroll (`20rem`). */
  readonly maxHeight = input<string>('');
  /** Nombre del bloque. Por defecto, el archivo o el lenguaje. */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Tokens por línea (sin la línea vacía final que deja un salto de línea al terminar). */
  protected readonly lines = computed(() => cbHighlight(this.code().replace(/\n$/, ''), this.language()));
  protected readonly highlighted = computed(() => cbParseLineSet(this.highlightLines()));
  protected readonly languageLabel = computed(() => (this.language() ? cbCodeLanguageLabel(this.language()) : ''));
  protected readonly showHeader = computed(() => this.header() && (!!this.filename() || !!this.language() || this.copyable()));
}
