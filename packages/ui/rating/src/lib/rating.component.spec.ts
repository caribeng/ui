import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbRatingComponent } from './rating.component';

@Component({
  imports: [ReactiveFormsModule, CbRatingComponent],
  template: `<cb-rating [formControl]="control" [stars]="5" ariaLabel="Puntuación" />`,
})
class HostComponent {
  control = new FormControl(0);
}

describe('CbRatingComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const stars = (): HTMLButtonElement[] =>
      Array.from(el.querySelectorAll('button.cb-rating__star'));
    const host = (): HTMLElement => el.querySelector('cb-rating')!;
    return { fixture, el, stars, host };
  }

  it('renderiza N estrellas con role=slider', () => {
    const { stars, host } = setup();
    expect(stars().length).toBe(5);
    expect(host().getAttribute('role')).toBe('slider');
    expect(host().getAttribute('aria-valuemax')).toBe('5');
  });

  it('refleja el valor del FormControl (writeValue)', () => {
    const { fixture, stars, host } = setup();
    fixture.componentInstance.control.setValue(3);
    fixture.detectChanges();
    const on = stars().filter((s) => s.classList.contains('cb-rating__star--on'));
    expect(on.length).toBe(3);
    expect(host().getAttribute('aria-valuenow')).toBe('3');
  });

  it('hacer clic en una estrella fija el valor', () => {
    const { fixture, stars } = setup();
    stars()[3].click();
    expect(fixture.componentInstance.control.value).toBe(4);
  });

  it('volver a hacer clic en el valor actual lo limpia', () => {
    const { fixture, stars } = setup();
    fixture.componentInstance.control.setValue(2);
    fixture.detectChanges();
    stars()[1].click(); // la 2ª estrella = valor actual
    expect(fixture.componentInstance.control.value).toBe(0);
  });

  it('las flechas incrementan/decrementan', () => {
    const { fixture, host } = setup();
    host().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(fixture.componentInstance.control.value).toBe(1);
    host().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(fixture.componentInstance.control.value).toBe(0);
  });
});
