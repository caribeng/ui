import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CB_CONFIG, CB_DEFAULT_CONFIG, CbLocaleService } from '@caribeng/ui';
import { CbSelect } from './select.component';

@Component({
  imports: [CbSelect],
  template: `<cb-select [options]="['A', 'B']" [placeholder]="placeholder()" />`,
})
class HostComponent {
  placeholder = signal<string | undefined>(undefined);
}

function setup(locale: 'es' | 'en' = 'es') {
  TestBed.configureTestingModule({
    providers: [{ provide: CB_CONFIG, useValue: { ...CB_DEFAULT_CONFIG, locale } }],
  });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const label = () => (fixture.nativeElement as HTMLElement).querySelector('.cb-select__label')!.textContent!.trim();
  return { fixture, label };
}

describe('CbSelect · idioma', () => {
  it('el placeholder por defecto sale del idioma activo', () => {
    expect(setup('es').label()).toBe('Seleccionar');
    TestBed.resetTestingModule();
    expect(setup('en').label()).toBe('Select');
  });

  it('cambia en caliente con CbLocaleService.use()', () => {
    const { fixture, label } = setup('es');
    TestBed.inject(CbLocaleService).use('en');
    fixture.detectChanges();
    expect(label()).toBe('Select');
  });

  it('un placeholder explícito tiene prioridad sobre el idioma', () => {
    const { fixture, label } = setup('en');
    fixture.componentInstance.placeholder.set('Elige una ciudad');
    fixture.detectChanges();
    expect(label()).toBe('Elige una ciudad');
  });
});
