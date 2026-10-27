import { TestBed } from '@angular/core/testing';
import { CbTagButton } from './tag-button.component';

describe('CbTagButton', () => {
  it('alterna el estado selected al hacer clic', () => {
    const fixture = TestBed.createComponent(CbTagButton);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(fixture.componentInstance.selected()).toBe(true);
  });

  it('refleja aria-pressed, emite changed y no cambia deshabilitado', () => {
    const fixture = TestBed.createComponent(CbTagButton);
    fixture.componentRef.setInput('label', 'Ahorro');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const changes: boolean[] = [];
    fixture.componentInstance.changed.subscribe((v) => changes.push(v));
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent!.trim()).toBe('Ahorro');

    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.classList).toContain('cb-tag-button--selected');
    button.click();
    expect(changes).toEqual([true, false]);

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    fixture.componentInstance.toggle();
    expect(fixture.componentInstance.selected()).toBe(false);
  });
});
