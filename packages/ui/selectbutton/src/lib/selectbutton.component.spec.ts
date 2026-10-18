import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbSelectButton } from './selectbutton.component';

@Component({
  imports: [ReactiveFormsModule, CbSelectButton],
  template: `<cb-selectbutton [formControl]="control" [options]="opts" [multiple]="multiple()" />`,
})
class HostComponent {
  control = new FormControl<unknown>(null);
  opts = ['Día', 'Semana', 'Mes'];
  multiple = signal(false);
}

describe('CbSelectButton', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const btns = (): HTMLButtonElement[] => Array.from(el.querySelectorAll('.cb-selectbutton__btn'));
    return { fixture, el, btns };
  }

  it('renderiza un botón por opción con role=group', () => {
    const { el, btns } = setup();
    expect(el.querySelector('cb-selectbutton')!.getAttribute('role')).toBe('group');
    expect(btns().map((b) => b.textContent!.trim())).toEqual(['Día', 'Semana', 'Mes']);
  });

  it('single: seleccionar fija el valor y marca aria-pressed', () => {
    const { fixture, btns } = setup();
    btns()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('Semana');
    expect(btns()[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('single: volver a hacer clic deselecciona', () => {
    const { fixture, btns } = setup();
    btns()[0].click();
    btns()[0].click();
    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('multiple: acumula valores en un array', () => {
    const { fixture, btns } = setup();
    fixture.componentInstance.multiple.set(true);
    fixture.componentInstance.control.setValue([]);
    fixture.detectChanges();
    btns()[0].click();
    btns()[2].click();
    expect(fixture.componentInstance.control.value).toEqual(['Día', 'Mes']);
  });
});
