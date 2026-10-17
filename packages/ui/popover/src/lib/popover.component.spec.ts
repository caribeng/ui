import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbPopoverComponent } from './popover.component';

@Component({
  imports: [CbPopoverComponent],
  template: `
    <button class="trigger" (click)="op.toggle($event)">Abrir</button>
    <cb-popover #op ariaLabel="Opciones">
      <div class="pc">Contenido del popover</div>
    </cb-popover>
  `,
})
class HostComponent {}

describe('CbPopoverComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger = (): HTMLButtonElement => fixture.nativeElement.querySelector('.trigger');
    const panel = (): HTMLElement | null => document.querySelector('.cb-popover__panel');
    return { fixture, trigger, panel };
  }

  it('abre el panel con el contenido proyectado al hacer toggle', () => {
    const { fixture, trigger, panel } = setup();
    expect(panel()).toBeNull();
    trigger().click();
    fixture.detectChanges();
    expect(panel()).toBeTruthy();
    expect(panel()!.getAttribute('role')).toBe('dialog');
    expect(panel()!.querySelector('.pc')?.textContent).toContain('Contenido del popover');
  });

  it('un segundo toggle lo cierra', () => {
    const { fixture, trigger, panel } = setup();
    trigger().click();
    fixture.detectChanges();
    expect(panel()).toBeTruthy();
    trigger().click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });
});
