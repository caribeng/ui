import {
  Directive,
  ElementRef,
  OnDestroy,
  inject,
  input,
} from '@angular/core';
import {
  Overlay,
  type OverlayRef,
  type ConnectedPosition,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { CbTooltipContent } from './tooltip-content.component';

type CbTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

const POSITIONS: Record<CbTooltipPosition, ConnectedPosition> = {
  top: { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' },
  bottom: { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
  left: { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' },
  right: { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' },
};

/**
 * Tooltip de CaribeNG: muestra un texto flotante al pasar el cursor o enfocar.
 *
 * @example
 * ```html
 * <button cbTooltip="Guardar cambios">Guardar</button>
 * <cb-icon name="info" cbTooltip="Más información" cbTooltipPosition="right" />
 * ```
 */
@Directive({
  selector: '[cbTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focus)': 'show()',
    '(blur)': 'hide()',
  },
})
export class CbTooltipDirective implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Texto del tooltip. */
  readonly text = input.required<string>({ alias: 'cbTooltip' });
  /** Posición preferida. */
  readonly position = input<CbTooltipPosition>('top', { alias: 'cbTooltipPosition' });
  /** Desactiva el tooltip. */
  readonly disabled = input<boolean, unknown>(false, {
    alias: 'cbTooltipDisabled',
    transform: toBoolean,
  });

  private overlayRef: OverlayRef | null = null;

  show(): void {
    if (this.disabled() || !this.text() || this.overlayRef) return;

    const pos = this.position();
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.host)
      .withPositions([POSITIONS[pos], POSITIONS[opposite(pos)]]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });

    const ref = this.overlayRef.attach(new ComponentPortal(CbTooltipContent));
    ref.setInput('text', this.text());
    ref.setInput('position', pos);
  }

  hide(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  ngOnDestroy(): void {
    this.hide();
  }
}

function opposite(p: CbTooltipPosition): CbTooltipPosition {
  return { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[p] as CbTooltipPosition;
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
