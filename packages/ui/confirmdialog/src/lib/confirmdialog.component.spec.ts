import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { CbConfirmDialog } from './confirmdialog.component';

function setup() {
  TestBed.configureTestingModule({ imports: [CbConfirmDialog] });
  const f = TestBed.createComponent(CbConfirmDialog);
  document.body.appendChild(f.nativeElement);
  return f;
}

describe('CbConfirmDialog', () => {
  it('emits acceptance and closes', () => {
    const f = setup();
    f.componentInstance.visible.set(true);
    const spy = vi.fn();
    f.componentInstance.accepted.subscribe(spy);
    f.detectChanges();
    f.nativeElement.querySelectorAll('button')[1].click();
    expect(spy).toHaveBeenCalledOnce();
    expect(f.componentInstance.visible()).toBe(false);
  });

  it('is named by its header and described by its message', () => {
    const f = setup();
    f.componentRef.setInput('header', 'Eliminar');
    f.componentRef.setInput('message', 'No se puede deshacer');
    f.componentInstance.visible.set(true);
    f.detectChanges();
    const dialog: HTMLElement = f.nativeElement.querySelector('[role="alertdialog"]');
    const title = document.getElementById(dialog.getAttribute('aria-labelledby')!);
    const message = document.getElementById(dialog.getAttribute('aria-describedby')!);
    expect(title?.textContent).toBe('Eliminar');
    expect(message?.textContent).toBe('No se puede deshacer');
  });

  it('rejects and closes on Escape', () => {
    const f = setup();
    f.componentInstance.visible.set(true);
    const spy = vi.fn();
    f.componentInstance.rejected.subscribe(spy);
    f.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(spy).toHaveBeenCalledOnce();
    expect(f.componentInstance.visible()).toBe(false);
  });

  it('ignores Escape while closed', () => {
    const f = setup();
    const spy = vi.fn();
    f.componentInstance.rejected.subscribe(spy);
    f.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns focus to the element that opened it', async () => {
    const f = setup();
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    f.componentInstance.visible.set(true);
    f.detectChanges();
    f.componentInstance.visible.set(false);
    f.detectChanges();
    await Promise.resolve();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});
