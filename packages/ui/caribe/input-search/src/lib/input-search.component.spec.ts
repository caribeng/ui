import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbInputSearch } from './input-search.component';

@Component({
  imports: [CbInputSearch],
  template: `<cb-input-search [(value)]="term" [clearable]="clearable()" placeholder="Buscar movimientos" (search)="searched.push($event)" />`,
})
class HostComponent {
  term = signal('');
  clearable = signal(true);
  searched: string[] = [];
}

@Component({
  imports: [CbInputSearch, ReactiveFormsModule],
  template: `<cb-input-search [formControl]="ctrl" />`,
})
class FormHostComponent {
  ctrl = new FormControl('inicial');
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  document.body.appendChild(el);
  const field = () => el.querySelector<HTMLInputElement>('input')!;
  const clearBtn = () => el.querySelector<HTMLButtonElement>('.cb-input-search__clear');
  const type = (v: string) => {
    field().value = v;
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  return { fixture, el, field, clearBtn, type, host: fixture.componentInstance };
}

describe('CbInputSearch', () => {
  it('es un campo de búsqueda nombrado por el placeholder', () => {
    const { el, field } = setup();
    expect(field().type).toBe('search');
    expect(field().getAttribute('aria-label')).toBe('Buscar movimientos');
    expect(el.querySelector('.cb-input-search__icon')!.getAttribute('aria-hidden')).toBe('true');
    el.remove();
  });

  it('actualiza el modelo al escribir y emite search con Enter', () => {
    const { el, field, type, host } = setup();
    type('nómina');
    expect(host.term()).toBe('nómina');
    field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(host.searched).toEqual(['nómina']);
    el.remove();
  });

  it('el botón de limpiar aparece con texto, vacía, emite search vacío y devuelve el foco al campo', () => {
    const { fixture, el, field, clearBtn, type, host } = setup();
    expect(clearBtn()).toBeNull();
    type('abc');
    expect(clearBtn()!.getAttribute('aria-label')).toBeTruthy();
    clearBtn()!.click();
    fixture.detectChanges();
    expect(host.term()).toBe('');
    expect(field().value).toBe('');
    expect(host.searched).toEqual(['']);
    expect(clearBtn()).toBeNull();
    expect(document.activeElement).toBe(field());
    el.remove();
  });

  it('sin clearable no muestra el botón de limpiar', () => {
    const { fixture, el, clearBtn, type } = setup();
    fixture.componentInstance.clearable.set(false);
    type('abc');
    expect(clearBtn()).toBeNull();
    el.remove();
  });

  it('se integra con Reactive Forms: valor inicial, cambios, touched y disable()', () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const input = el.querySelector('input')!;
    const ctrl = fixture.componentInstance.ctrl;
    expect(input.value).toBe('inicial');

    input.value = 'nuevo';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    expect(ctrl.value).toBe('nuevo');
    expect(ctrl.touched).toBe(true);

    ctrl.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
    expect(el.querySelector('.cb-input-search')!.classList).toContain('cb-is-disabled');
  });
});
