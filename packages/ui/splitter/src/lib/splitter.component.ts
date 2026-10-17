import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export type CbSplitterLayout = 'horizontal' | 'vertical';

export interface CbSplitterResizeEndEvent {
  sizes: number[];
}

let nextSplitterPanelUid = 0;

/**
 * Splitter de CaribeNG: divide un contenedor en dos o más paneles redimensionables
 * mediante barras separadoras (`role="separator"`) con soporte de puntero y teclado.
 *
 * @example
 * ```html
 * <cb-splitter style="height: 220px">
 *   <cb-splitter-panel [size]="35">Panel izquierdo</cb-splitter-panel>
 *   <cb-splitter-panel [size]="65">Panel derecho</cb-splitter-panel>
 * </cb-splitter>
 * ```
 */
@Component({
  selector: 'cb-splitter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-splitter',
    '[class.cb-splitter--vertical]': 'layout() === "vertical"',
    '[class.cb-splitter--horizontal]': 'layout() === "horizontal"',
  },
  template: `
    <ng-content />
    @for (idx of gutterIndices(); track idx) {
      <div
        class="cb-splitter__gutter"
        role="separator"
        tabindex="0"
        [style.order]="idx * 2 + 1"
        [style.flexBasis.px]="gutterSize()"
        [attr.aria-orientation]="layout() === 'horizontal' ? 'vertical' : 'horizontal'"
        [attr.aria-valuenow]="Math.round(effectiveSizes()[idx])"
        [attr.aria-valuemin]="panelMinSize(idx)"
        [attr.aria-valuemax]="100 - panelMinSize(idx + 1)"
        aria-label="Redimensionar paneles"
        (pointerdown)="onGutterPointerDown($event, idx)"
        (keydown)="onGutterKeydown($event, idx)"
      >
        <span class="cb-splitter__handle" aria-hidden="true"></span>
      </div>
    }
  `,
  styleUrl: './splitter.component.css',
})
export class CbSplitterComponent {
  protected readonly Math = Math;
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Orientación de la división: `'horizontal'` (lado a lado) o `'vertical'` (apilados). */
  readonly layout = input<CbSplitterLayout>('horizontal');
  /** Grosor del separador en píxeles. */
  readonly gutterSize = input<number>(8);
  /** Paso porcentual al redimensionar con teclado. */
  readonly step = input<number>(5);
  /** Emitido al finalizar un ajuste de tamaño. */
  readonly resizeEnd = output<CbSplitterResizeEndEvent>();

  readonly panels = contentChildren(CbSplitterPanelComponent);

  private readonly customSizes = signal<number[] | null>(null);

  readonly effectiveSizes = computed<number[]>(() => {
    const list = this.panels();
    const count = list.length;
    if (count === 0) return [];
    const custom = this.customSizes();
    if (custom && custom.length === count) {
      return custom;
    }
    const declared = list.map((p) => p.size());
    const totalDeclared = declared.reduce<number>((acc, v) => acc + (v ?? 0), 0);
    const undeclaredCount = declared.filter((v) => v == null).length;
    const fallbackEach =
      undeclaredCount > 0 ? Math.max(0, (100 - totalDeclared) / undeclaredCount) : 100 / count;
    return declared.map((v) => (v != null ? v : fallbackEach));
  });

  protected readonly gutterIndices = computed<number[]>(() => {
    const count = this.panels().length;
    if (count <= 1) return [];
    return Array.from({ length: count - 1 }, (_, i) => i);
  });

  panelIndex(panelId: number): number {
    return this.panels().findIndex((p) => p.panelId === panelId);
  }

  panelSize(panelId: number): number {
    const idx = this.panelIndex(panelId);
    if (idx < 0) return 50;
    return this.effectiveSizes()[idx] ?? 100 / Math.max(1, this.panels().length);
  }

  protected panelMinSize(idx: number): number {
    return this.panels()[idx]?.minSize() ?? 5;
  }

  adjustPair(gutterIdx: number, deltaPercent: number): void {
    const sizes = [...this.effectiveSizes()];
    if (gutterIdx < 0 || gutterIdx >= sizes.length - 1) return;

    const minA = this.panelMinSize(gutterIdx);
    const minB = this.panelMinSize(gutterIdx + 1);
    const pairTotal = sizes[gutterIdx] + sizes[gutterIdx + 1];

    let nextA = sizes[gutterIdx] + deltaPercent;
    nextA = Math.max(minA, Math.min(pairTotal - minB, nextA));
    const nextB = pairTotal - nextA;

    sizes[gutterIdx] = Number(nextA.toFixed(2));
    sizes[gutterIdx + 1] = Number(nextB.toFixed(2));
    this.customSizes.set(sizes);
  }

  protected onGutterKeydown(event: KeyboardEvent, gutterIdx: number): void {
    const isHoriz = this.layout() === 'horizontal';
    const step = this.step();
    let delta = 0;

    if ((isHoriz && event.key === 'ArrowRight') || (!isHoriz && event.key === 'ArrowDown')) {
      delta = step;
    } else if ((isHoriz && event.key === 'ArrowLeft') || (!isHoriz && event.key === 'ArrowUp')) {
      delta = -step;
    } else if (event.key === 'Home') {
      delta = -100;
    } else if (event.key === 'End') {
      delta = 100;
    } else {
      return;
    }

    event.preventDefault();
    this.adjustPair(gutterIdx, delta);
    this.resizeEnd.emit({ sizes: [...this.effectiveSizes()] });
  }

  protected onGutterPointerDown(event: PointerEvent, gutterIdx: number): void {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement | null;
    target?.setPointerCapture?.(event.pointerId);

    const rect = this.hostRef.nativeElement.getBoundingClientRect();
    const totalPx = this.layout() === 'horizontal' ? rect.width : rect.height;
    const startPos = this.layout() === 'horizontal' ? event.clientX : event.clientY;
    const startSizes = [...this.effectiveSizes()];

    const onMove = (moveEvt: PointerEvent) => {
      if (totalPx <= 0) return;
      const currentPos = this.layout() === 'horizontal' ? moveEvt.clientX : moveEvt.clientY;
      const deltaPercent = ((currentPos - startPos) / totalPx) * 100;
      this.customSizes.set([...startSizes]);
      this.adjustPair(gutterIdx, deltaPercent);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      this.resizeEnd.emit({ sizes: [...this.effectiveSizes()] });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }
}

/** Panel individual dentro de `<cb-splitter>`. */
@Component({
  selector: 'cb-splitter-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-splitter-panel',
    '[style.order]': 'order()',
    '[style.flexBasis.%]': 'basis()',
  },
  template: `<ng-content />`,
  styleUrl: './splitter-panel.component.css',
})
export class CbSplitterPanelComponent {
  private readonly splitter = inject(CbSplitterComponent);

  readonly panelId = ++nextSplitterPanelUid;
  /** Tamaño inicial del panel en porcentaje (0–100). */
  readonly size = input<number | undefined>(undefined);
  /** Tamaño mínimo permitido en porcentaje (0–100). */
  readonly minSize = input<number>(10);

  protected readonly order = computed(() => {
    const idx = this.splitter.panelIndex(this.panelId);
    return idx >= 0 ? idx * 2 : 0;
  });

  protected readonly basis = computed(() => this.splitter.panelSize(this.panelId));
}
