import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model } from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbCodeBlock } from '@caribeng/ui/code-block';
import { CbIcon } from '@caribeng/ui/icon';

/** Estado de una llamada a herramienta. */
export type CbChatToolStatus = 'running' | 'done' | 'error';

let nextUid = 0;

/** Objeto → JSON legible; texto, tal cual. */
function show(value: unknown): { code: string; language: string } | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'string') {
    try {
      return { code: JSON.stringify(JSON.parse(value), null, 2), language: 'json' };
    } catch {
      return { code: value, language: '' };
    }
  }
  try {
    return { code: JSON.stringify(value, null, 2), language: 'json' };
  } catch {
    return { code: String(value), language: '' };
  }
}

/**
 * Llamada a una herramienta (función) del asistente: nombre, estado
 * ("Usando buscar_movimientos…", "Usó…", "Falló…") y, al desplegar, la
 * entrada y el resultado como JSON resaltado.
 *
 * @example
 * ```html
 * <cb-chat-tool name="buscar_movimientos" status="done" [input]="{ cuenta: '4829' }" [output]="resultado" />
 * ```
 */
@Component({
  selector: 'cb-chat-tool',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon, CbCodeBlock],
  host: {
    class: 'cb-chat-tool',
    '[class.cb-chat-tool--running]': "status() === 'running'",
    '[class.cb-chat-tool--done]': "status() === 'done'",
    '[class.cb-chat-tool--error]': "status() === 'error'",
  },
  template: `
    <button type="button" class="cb-chat-tool__header" [attr.aria-expanded]="open()" [attr.aria-controls]="uid" (click)="open.set(!open())">
      @switch (status()) {
        @case ('running') {
          <span class="cb-chat-tool__spinner" aria-hidden="true"></span>
        }
        @case ('error') {
          <cb-icon class="cb-chat-tool__icon" name="circle-alert" [size]="16" aria-hidden="true" />
        }
        @default {
          <cb-icon class="cb-chat-tool__icon" name="check" [size]="16" aria-hidden="true" />
        }
      }
      <span class="cb-chat-tool__label">{{ label() }}</span>
      <cb-icon class="cb-chat-tool__chevron" name="chevron-down" [size]="14" aria-hidden="true" />
    </button>
    <span class="cb-chat-tool__status" role="status">{{ status() === 'running' ? '' : label() }}</span>
    @if (open()) {
      <div class="cb-chat-tool__body" [id]="uid">
        @if (shownInput(); as i) {
          <div class="cb-chat-tool__section">{{ t().chatToolInput }}</div>
          <cb-code-block [code]="i.code" [language]="i.language" [header]="false" wrap maxHeight="14rem" [ariaLabel]="t().chatToolInput" />
        }
        @if (shownOutput(); as o) {
          <div class="cb-chat-tool__section">{{ t().chatToolOutput }}</div>
          <cb-code-block [code]="o.code" [language]="o.language" [header]="false" wrap maxHeight="14rem" [ariaLabel]="t().chatToolOutput" />
        }
        <ng-content />
      </div>
    }
  `,
  styleUrl: './chat-tool.component.css',
})
export class CbChatTool {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly uid = `cb-chat-tool-${++nextUid}`;

  /** Nombre de la herramienta (`buscar_movimientos`). */
  readonly name = input<string>('');
  /** Texto que sustituye al nombre en la cabecera ("Buscando movimientos"). */
  readonly title = input<string>('');
  readonly status = input<CbChatToolStatus>('done');
  /** Argumentos (objeto o JSON). */
  readonly input = input<unknown>(undefined);
  /** Resultado (objeto, JSON o texto). */
  readonly output = input<unknown>(undefined);
  /** Desplegado. */
  readonly open = model(false);

  protected readonly shownInput = computed(() => show(this.input()));
  protected readonly shownOutput = computed(() => show(this.output()));
  protected readonly label = computed(() => {
    const name = this.title() || this.name();
    const status = this.status();
    if (status === 'running') return cbFormat(this.t().chatToolRunning, name);
    if (status === 'error') return cbFormat(this.t().chatToolError, name);
    return cbFormat(this.t().chatToolDone, name);
  });
}
