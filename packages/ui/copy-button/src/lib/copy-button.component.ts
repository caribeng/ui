import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { type CbSeverity, type CbSize, injectCbTranslation } from '@caribeng/ui';
import { CbButton, type CbButtonVariant } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { CbClipboard } from './clipboard.service';

/**
 * Botón que copia un texto al portapapeles y confirma con un ✓ durante unos
 * segundos. El resultado se anuncia a los lectores de pantalla.
 *
 * @example
 * ```html
 * <span>0012 3456 7890</span> <cb-copy-button value="001234567890" />
 * <cb-copy-button [value]="apiKey" showLabel variant="outlined" />
 * ```
 */
@Component({
  selector: 'cb-copy-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbButton, CbIcon],
  host: { class: 'cb-copy-button' },
  template: `
    <cb-button
      [variant]="variant()"
      [severity]="state() === 'copied' ? 'success' : severity()"
      [size]="size()"
      [disabled]="disabled()"
      [ariaLabel]="showLabel() ? undefined : buttonLabel()"
      (click)="copy()"
    >
      <cb-icon [name]="state() === 'copied' ? 'check' : 'copy'" [size]="iconSize()" aria-hidden="true" />
      @if (showLabel()) {
        <span>{{ visibleLabel() }}</span>
      }
    </cb-button>
    <span class="cb-copy-button__status" role="status">{{ announcement() }}</span>
  `,
  styleUrl: './copy-button.component.css',
})
export class CbCopyButton {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly clipboard = inject(CbClipboard);
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** Texto que se copia. */
  readonly value = input<string | number | null | undefined>('');
  /** Muestra el texto ("Copiar" / "Copiado") junto al icono. */
  readonly showLabel = input(false, { transform: booleanAttribute });
  /** Texto del botón y nombre accesible. Por defecto, "Copiar" del idioma activo. */
  readonly label = input<string | undefined>(undefined);
  /** Texto tras copiar. Por defecto, "Copiado". */
  readonly copiedLabel = input<string | undefined>(undefined);
  /** Milisegundos que dura la confirmación. */
  readonly timeout = input<number>(2000);
  readonly variant = input<CbButtonVariant>('text');
  readonly severity = input<CbSeverity>('secondary');
  readonly size = input<CbSize>('sm');
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Texto copiado. */
  readonly copied = output<string>();
  /** El navegador no permitió copiar. */
  readonly copyError = output<string>();

  protected readonly state = signal<'idle' | 'copied' | 'error'>('idle');
  protected readonly buttonLabel = computed(() => this.label() ?? this.t().copy);
  protected readonly visibleLabel = computed(() =>
    this.state() === 'copied' ? (this.copiedLabel() ?? this.t().copied) : this.buttonLabel(),
  );
  protected readonly announcement = computed(() => {
    const state = this.state();
    if (state === 'copied') return this.copiedLabel() ?? this.t().copied;
    if (state === 'error') return this.t().copyFailed;
    return '';
  });
  protected readonly iconSize = computed(() => (this.size() === 'lg' ? 18 : this.size() === 'sm' ? 14 : 16));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimer());
  }

  /** Copia el valor y muestra la confirmación. Resuelve `true` si lo consiguió. */
  async copy(): Promise<boolean> {
    if (this.disabled()) return false;
    const text = String(this.value() ?? '');
    const ok = await this.clipboard.copy(text);
    this.state.set(ok ? 'copied' : 'error');
    if (ok) this.copied.emit(text);
    else this.copyError.emit(text);
    this.clearTimer();
    this.timer = setTimeout(() => this.state.set('idle'), Math.max(0, this.timeout()));
    return ok;
  }

  private clearTimer(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }
}
