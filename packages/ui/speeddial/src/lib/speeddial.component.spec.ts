import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbSpeedDialComponent, type CbSpeedDialItem } from './speeddial.component';

@Component({
  imports: [CbSpeedDialComponent],
  template: `<cb-speed-dial [items]="items" direction="right" (itemSelect)="selected = $event.label" />`,
})
class HostComponent {
  items: CbSpeedDialItem[] = [
    { label: 'Crear', icon: 'plus' },
    { label: 'Eliminar', icon: 'x', disabled: true },
  ];
  selected = '';
}

describe('CbSpeedDialComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  it('opens the action list and emits the chosen action', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.cb-speed-dial__trigger') as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Crear"]')).toBeTruthy();
    (fixture.nativeElement.querySelector('[aria-label="Crear"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('Crear');
    expect(fixture.nativeElement.querySelector('.cb-speed-dial__trigger').getAttribute('aria-expanded')).toBe('false');
  });

  it('does not emit a disabled action', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.cb-speed-dial__trigger').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Eliminar"]').disabled).toBe(true);
  });
});
