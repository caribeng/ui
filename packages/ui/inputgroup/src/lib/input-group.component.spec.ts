import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  CbInputGroupComponent,
  CbInputGroupAddonComponent,
} from './input-group.component';

@Component({
  imports: [CbInputGroupComponent, CbInputGroupAddonComponent],
  template: `
    <cb-input-group>
      <cb-input-group-addon>@</cb-input-group-addon>
      <input class="cb-input__field" />
      <cb-input-group-addon [button]="true">x</cb-input-group-addon>
    </cb-input-group>
  `,
})
class HostComponent {}

describe('CbInputGroupComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('renderiza el contenedor y proyecta los hijos', () => {
    const { el } = setup();
    expect(el.querySelector('cb-input-group.cb-input-group')).toBeTruthy();
    expect(el.querySelectorAll('cb-input-group-addon').length).toBe(2);
    expect(el.querySelector('input.cb-input__field')).toBeTruthy();
  });

  it('el addon con button aplica su modificador', () => {
    const { el } = setup();
    const addons = el.querySelectorAll('cb-input-group-addon');
    expect(addons[0].classList.contains('cb-input-group-addon--button')).toBe(false);
    expect(addons[1].classList.contains('cb-input-group-addon--button')).toBe(true);
  });
});
