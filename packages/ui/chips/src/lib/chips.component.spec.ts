import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbChips } from './chips.component';

@Component({
  imports: [ReactiveFormsModule, CbChips],
  template: `<cb-chips [formControl]="control" placeholder="Añade" />`,
})
class HostComponent {
  control = new FormControl<string[]>([]);
}

describe('CbChips', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const chips = (): HTMLElement[] => Array.from(el.querySelectorAll('.cb-chips__chip'));
    const input = (): HTMLInputElement => el.querySelector('input.cb-chips__input')!;
    return { fixture, el, chips, input };
  }

  it('renderiza los chips del FormControl (writeValue)', () => {
    const { fixture, chips } = setup();
    fixture.componentInstance.control.setValue(['a', 'b']);
    fixture.detectChanges();
    expect(chips().length).toBe(2);
    expect(chips()[0].textContent).toContain('a');
  });

  it('Enter añade un chip y limpia el input', () => {
    const { fixture, input } = setup();
    input().value = 'nuevo';
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(fixture.componentInstance.control.value).toEqual(['nuevo']);
    expect(input().value).toBe('');
  });

  it('no añade duplicados por defecto', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.setValue(['x']);
    fixture.detectChanges();
    input().value = 'x';
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(fixture.componentInstance.control.value).toEqual(['x']);
  });

  it('el botón de quitar elimina el chip', () => {
    const { fixture, el } = setup();
    fixture.componentInstance.control.setValue(['a', 'b']);
    fixture.detectChanges();
    const remove = el.querySelector<HTMLButtonElement>('.cb-chips__remove')!;
    remove.click();
    expect(fixture.componentInstance.control.value).toEqual(['b']);
  });

  it('Backspace con input vacío quita el último chip', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.setValue(['a', 'b']);
    fixture.detectChanges();
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    expect(fixture.componentInstance.control.value).toEqual(['a']);
  });
});
