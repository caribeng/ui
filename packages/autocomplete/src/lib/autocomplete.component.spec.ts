import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CbAutocompleteComponent } from './autocomplete.component';

@Component({
  imports: [ReactiveFormsModule, CbAutocompleteComponent],
  template: `<cb-autocomplete
    [formControl]="ctrl"
    [suggestions]="sug"
    [delay]="100"
    (complete)="lastQuery = $event"
    placeholder="Escribe"
  />`,
})
class HostComponent {
  ctrl = new FormControl<string | null>(null);
  sug: string[] = ['Colombia', 'Costa Rica'];
  lastQuery: string | null = null;
}

describe('CbAutocompleteComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const field = (): HTMLInputElement => el.querySelector('input.cb-autocomplete__field')!;
    const optionEls = (): HTMLElement[] =>
      Array.from(document.querySelectorAll('.cb-autocomplete__option'));
    return { fixture, el, field, optionEls };
  }

  it('el campo es un combobox con aria-autocomplete="list"', () => {
    const { field } = setup();
    expect(field().getAttribute('role')).toBe('combobox');
    expect(field().getAttribute('aria-autocomplete')).toBe('list');
  });

  it('emite (complete) con el texto tras el debounce', () => {
    vi.useFakeTimers();
    const { fixture, field } = setup();
    field().value = 'co';
    field().dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.lastQuery).toBeNull();
    vi.advanceTimersByTime(100);
    expect(fixture.componentInstance.lastQuery).toBe('co');
  });

  it('seleccionar una sugerencia fija el valor y el texto', () => {
    const { fixture, field, optionEls } = setup();
    // ArrowDown abre el panel de inmediato cuando hay sugerencias
    field().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    const opciones = optionEls();
    expect(opciones.map((o) => o.textContent!.trim())).toEqual([
      'Colombia',
      'Costa Rica',
    ]);
    opciones[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.ctrl.value).toBe('Colombia');
    expect(field().value).toBe('Colombia');
  });

  it('forceSelection revierte el texto si no coincide al salir', () => {
    const { fixture, field } = setup();
    field().value = 'xyz';
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges(); // Angular observa query='xyz' (como el CD real entre tecla y blur)
    field().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(field().value).toBe('');
    expect(fixture.componentInstance.ctrl.value).toBeNull();
  });
});
