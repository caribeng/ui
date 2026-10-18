import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  effect,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CbIcon } from '@caribeng/ui/icon';

type CbDrawerPosition = 'left' | 'right' | 'top' | 'bottom';

/**
 * Drawer (panel lateral) de CaribeNG sobre CDK Overlay: se desliza desde un
 * borde, con trampa de foco, bloqueo de scroll y cierre con Escape/backdrop.
 *
 * @example
 * ```html
 * <cb-button (click)="visible.set(true)">Abrir</cb-button>
 * <cb-drawer [(visible)]="visible" header="Filtros" position="right">
 *   <p>Contenido…</p>
 * </cb-drawer>
 * ```
 */
@Component({
  selector: 'cb-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [A11yModule, CbIcon],
  template: `
    <ng-template #tpl>
      <div
        class="cb-drawer"
        [class]="'cb-drawer--' + position()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="header() ? titleId : null"
        [attr.aria-label]="header() ? null : ariaLabel()"
        cdkTrapFocus
        cdkTrapFocusAutoCapture
      >
        @if (header() || closable()) {
          <header class="cb-drawer__header">
            @if (header()) {
              <h2 class="cb-drawer__title" [id]="titleId">{{ header() }}</h2>
            }
            @if (closable()) {
              <button type="button" class="cb-drawer__close" aria-label="Cerrar" (click)="close()">
                <cb-icon name="x" [size]="18" aria-hidden="true" />
              </button>
            }
          </header>
        }
        <div class="cb-drawer__body"><ng-content /></div>
        <footer class="cb-drawer__footer"><ng-content select="[cb-drawer-footer]" /></footer>
      </div>
    </ng-template>
  `,
  styleUrl: './drawer.component.css',
})
export class CbDrawer {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);

  readonly visible = model<boolean>(false);
  readonly header = input<string>('');
  readonly position = input<CbDrawerPosition>('right');
  readonly closable = input<boolean, unknown>(true, { transform: toBoolean });
  readonly dismissableMask = input<boolean, unknown>(true, { transform: toBoolean });
  readonly closeOnEscape = input<boolean, unknown>(true, { transform: toBoolean });
  readonly ariaLabel = input<string>('Panel');

  readonly onShow = output<void>();
  readonly onHide = output<void>();

  protected readonly titleId = `cb-drawer-${nextUid()}-title`;

  private readonly tpl = viewChild<TemplateRef<unknown>>('tpl');
  private overlayRef: OverlayRef | null = null;
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const visible = this.visible();
      if (visible && !this.overlayRef) this.openOverlay();
      else if (!visible && this.overlayRef) this.disposeOverlay();
    });
  }

  close(): void {
    this.visible.set(false);
  }

  private openOverlay(): void {
    const tpl = this.tpl();
    if (!tpl) return;
    this.previouslyFocused = this.document.activeElement as HTMLElement | null;

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cb-dialog-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.edgePosition(),
      panelClass: ['cb-drawer-pane', `cb-drawer-pane--${this.position()}`],
    });

    this.overlayRef.attach(new TemplatePortal(tpl, this.vcr));
    this.overlayRef.backdropClick().subscribe(() => {
      if (this.dismissableMask()) this.close();
    });
    this.overlayRef.keydownEvents().subscribe((e) => {
      if (e.key === 'Escape' && this.closeOnEscape()) {
        e.preventDefault();
        this.close();
      }
    });
    this.onShow.emit();
  }

  private edgePosition() {
    const p = this.overlay.position().global();
    switch (this.position()) {
      case 'left': return p.left('0').top('0');
      case 'top': return p.top('0').left('0');
      case 'bottom': return p.bottom('0').left('0');
      case 'right':
      default: return p.right('0').top('0');
    }
  }

  private disposeOverlay(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.previouslyFocused?.focus?.();
    this.previouslyFocused = null;
    this.onHide.emit();
  }
}

let uid = 0;
function nextUid(): number {
  return ++uid;
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
