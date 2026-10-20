import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbTooltipDirective } from './tooltip.directive';

@Component({
  imports: [CbTooltipDirective],
  template: `<button [cbTooltip]="text()" [cbTooltipDisabled]="disabled()">Hover</button>`,
})
class HostComponent {
  text = signal('Ayuda');
  disabled = signal(false);
}

describe('CbTooltipDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const btn = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');
    const tip = (): HTMLElement | null => document.querySelector('.cb-tooltip');
    return { fixture, btn, tip };
  }

  it('muestra el tooltip al pasar el cursor y lo oculta al salir', () => {
    const { fixture, btn, tip } = setup();
    expect(tip()).toBeNull();

    btn().dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(tip()).toBeTruthy();
    expect(tip()!.getAttribute('role')).toBe('tooltip');
    expect(tip()!.textContent?.trim()).toBe('Ayuda');

    btn().dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(tip()).toBeNull();
  });

  it('enlaza el tooltip con aria-describedby mientras está visible', () => {
    const { fixture, btn, tip } = setup();
    btn().setAttribute('aria-describedby', 'hint');

    btn().dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    const ids = btn().getAttribute('aria-describedby')!.split(' ');
    expect(ids).toContain('hint');
    expect(ids).toContain(tip()!.id);

    btn().dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(btn().getAttribute('aria-describedby')).toBe('hint');
  });

  it('se oculta con Escape', () => {
    const { fixture, btn, tip } = setup();
    btn().dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(tip()).toBeTruthy();

    btn().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(tip()).toBeNull();
    expect(btn().hasAttribute('aria-describedby')).toBe(false);
  });

  it('no muestra nada cuando está deshabilitado', () => {
    const { fixture, btn, tip } = setup();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    btn().dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(tip()).toBeNull();
  });
});
