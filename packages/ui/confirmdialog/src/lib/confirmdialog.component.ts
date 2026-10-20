import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, model, output } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { injectCbTranslation } from '@caribeng/ui';

let nextUid = 0;

/**
 * Diálogo de confirmación (`role="alertdialog"`) con trampa de foco, cierre con
 * Escape (equivale a cancelar) y restauración del foco al cerrarse.
 */
@Component({
  selector: 'cb-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [A11yModule],
  host: { '(document:keydown.escape)': 'onEscape()' },
  template: `@if(visible()){<div class="cb-confirm-dialog__mask" (click)="reject()"><section class="cb-confirm-dialog" role="alertdialog" aria-modal="true" [attr.aria-labelledby]="titleId" [attr.aria-describedby]="messageId" cdkTrapFocus cdkTrapFocusAutoCapture (click)="$event.stopPropagation()"><h2 [id]="titleId">{{(header() ?? t().confirm)}}</h2><p [id]="messageId">{{(message() ?? t().confirmMessage)}}</p><footer><button type="button" (click)="reject()">{{(rejectLabel() ?? t().cancel)}}</button><button type="button" (click)="confirm()">{{(acceptLabel() ?? t().accept)}}</button></footer></section></div>}`,
  styles: [`:host{display:contents}.cb-confirm-dialog__mask{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:#0006}.cb-confirm-dialog{width:min(28rem,calc(100vw - 2rem));padding:1.25rem;border-radius:.75rem;background:var(--cb-color-surface,#fff);color:var(--cb-color-text,#111827);box-shadow:0 1rem 3rem #0003}.cb-confirm-dialog h2{margin:0 0 .75rem;font-size:1.15rem}.cb-confirm-dialog footer{display:flex;justify-content:flex-end;gap:.5rem;margin-top:1.25rem}.cb-confirm-dialog button{padding:.5rem .8rem}`],
})
export class CbConfirmDialog {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly document = inject(DOCUMENT);

  readonly visible = model(false);
  readonly header = input<string | undefined>(undefined);
  readonly message = input<string | undefined>(undefined);
  readonly acceptLabel = input<string | undefined>(undefined);
  readonly rejectLabel = input<string | undefined>(undefined);
  readonly accepted = output<void>();
  readonly rejected = output<void>();

  protected readonly titleId = `cb-confirm-dialog-${++nextUid}-title`;
  protected readonly messageId = `${this.titleId.replace('-title', '')}-message`;

  /** Elemento enfocado antes de abrir; recibe el foco de vuelta al cerrar. */
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.previouslyFocused ??= this.document.activeElement as HTMLElement | null;
      } else if (this.previouslyFocused) {
        const el = this.previouslyFocused;
        this.previouslyFocused = null;
        queueMicrotask(() => el.focus?.());
      }
    });
  }

  protected onEscape(): void {
    if (this.visible()) this.reject();
  }

  protected confirm(): void {
    this.accepted.emit();
    this.visible.set(false);
  }

  protected reject(): void {
    this.rejected.emit();
    this.visible.set(false);
  }
}
