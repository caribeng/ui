import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbListBox } from './listbox.component';

@Component({
  imports: [ReactiveFormsModule, CbListBox],
  template: `<cb-listbox [formControl]="control" [options]="opts" [multiple]="multiple()" />`,
})
class HostComponent {
  control = new FormControl<unknown>(null);
  opts = ['Rojo', 'Verde', 'Azul'];
  multiple = signal(false);
}

describe('CbListBox', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const opts = (): HTMLElement[] => Array.from(el.querySelectorAll('.cb-listbox__option'));
    return { fixture, el, opts };
  }

  it('renderiza un listbox con las opciones', () => {
    const { el, opts } = setup();
    expect(el.querySelector('[role="listbox"]')).toBeTruthy();
    expect(opts().length).toBe(3);
  });

  it('single: seleccionar fija el valor y aria-selected', () => {
    const { fixture, opts } = setup();
    opts()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('Verde');
    expect(opts()[1].getAttribute('aria-selected')).toBe('true');
  });

  it('multiple: acumula y deselecciona', () => {
    const { fixture, el, opts } = setup();
    fixture.componentInstance.multiple.set(true);
    fixture.componentInstance.control.setValue([]);
    fixture.detectChanges();
    expect(el.querySelector('[role="listbox"]')!.getAttribute('aria-multiselectable')).toBe('true');
    opts()[0].click();
    opts()[2].click();
    expect(fixture.componentInstance.control.value).toEqual(['Rojo', 'Azul']);
    opts()[0].click();
    expect(fixture.componentInstance.control.value).toEqual(['Azul']);
  });
});
