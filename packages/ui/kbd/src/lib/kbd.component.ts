import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input } from '@angular/core';

/** Plataforma para la que se muestran las teclas. `auto` la detecta en el navegador. */
export type CbKbdPlatform = 'auto' | 'mac' | 'other';

interface KeyLabel {
  /** Texto visible. */
  text: string;
  /** Nombre leído por el lector de pantalla cuando el visible es un símbolo. */
  spoken?: string;
}

/** Teclas con nombre: `mod` es ⌘ en Mac y Ctrl en el resto. */
const NAMED_KEYS: Record<string, { mac: KeyLabel; other: KeyLabel }> = {
  mod: { mac: { text: '⌘', spoken: 'Command' }, other: { text: 'Ctrl' } },
  cmd: { mac: { text: '⌘', spoken: 'Command' }, other: { text: 'Win' } },
  ctrl: { mac: { text: '⌃', spoken: 'Control' }, other: { text: 'Ctrl' } },
  alt: { mac: { text: '⌥', spoken: 'Option' }, other: { text: 'Alt' } },
  shift: { mac: { text: '⇧', spoken: 'Shift' }, other: { text: 'Shift' } },
  enter: { mac: { text: '↵', spoken: 'Enter' }, other: { text: 'Enter' } },
  backspace: { mac: { text: '⌫', spoken: 'Delete' }, other: { text: 'Backspace' } },
  tab: { mac: { text: 'Tab' }, other: { text: 'Tab' } },
  esc: { mac: { text: 'Esc' }, other: { text: 'Esc' } },
  space: { mac: { text: 'Space' }, other: { text: 'Space' } },
  up: { mac: { text: '↑', spoken: 'Up' }, other: { text: '↑', spoken: 'Up' } },
  down: { mac: { text: '↓', spoken: 'Down' }, other: { text: '↓', spoken: 'Down' } },
  left: { mac: { text: '←', spoken: 'Left' }, other: { text: '←', spoken: 'Left' } },
  right: { mac: { text: '→', spoken: 'Right' }, other: { text: '→', spoken: 'Right' } },
};

/** Detecta macOS/iOS en el navegador (en SSR devuelve `false`). */
function isApplePlatform(doc: Document): boolean {
  const nav = doc.defaultView?.navigator as (Navigator & { userAgentData?: { platform?: string } }) | undefined;
  const platform = nav?.userAgentData?.platform ?? nav?.platform ?? '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/**
 * Tecla o atajo de teclado de CaribeNG. Con contenido muestra una tecla; con
 * `keys` muestra la combinación (⌘ K en Mac, Ctrl + K en el resto).
 *
 * @example
 * ```html
 * <cb-kbd>Esc</cb-kbd>
 * <cb-kbd [keys]="['mod', 'K']" />
 * ```
 */
@Component({
  selector: 'cb-kbd',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-kbd',
    '[class.cb-kbd--sm]': "size() === 'sm'",
  },
  template: `
    @if (labels().length) {
      <kbd class="cb-kbd__combo">
        @for (key of labels(); track $index) {
          @if (!$first && !isMac()) {
            <span class="cb-kbd__plus" aria-hidden="true">+</span>
          }
          <kbd class="cb-kbd__key">
            @if (key.spoken) {
              <span aria-hidden="true">{{ key.text }}</span><span class="cb-kbd__sr">{{ key.spoken }}</span>
            } @else {
              {{ key.text }}
            }
          </kbd>
        }
      </kbd>
    } @else {
      <kbd class="cb-kbd__key"><ng-content /></kbd>
    }
  `,
  styleUrl: './kbd.component.css',
})
export class CbKbd {
  private readonly doc = inject(DOCUMENT);

  /** Teclas de la combinación: nombres (`mod`, `shift`, `alt`, `enter`, `up`…) o texto libre (`K`, `F2`). */
  readonly keys = input<readonly string[]>([]);
  /** Plataforma a mostrar. `auto` la detecta (⌘ en Mac). */
  readonly platform = input<CbKbdPlatform>('auto');
  readonly size = input<'sm' | 'md'>('md');

  protected readonly isMac = computed(() => {
    const platform = this.platform();
    return platform === 'auto' ? isApplePlatform(this.doc) : platform === 'mac';
  });

  protected readonly labels = computed<KeyLabel[]>(() => {
    const mac = this.isMac();
    return this.keys().map((key) => {
      const named = NAMED_KEYS[key.toLowerCase()];
      if (named) return mac ? named.mac : named.other;
      return { text: key.length === 1 ? key.toUpperCase() : key };
    });
  });
}
