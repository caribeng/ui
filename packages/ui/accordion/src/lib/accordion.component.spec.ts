import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  CbAccordion,
  CbAccordionPanel,
} from './accordion.component';

@Component({
  imports: [CbAccordion, CbAccordionPanel],
  template: `
    <cb-accordion [multiple]="multiple()">
      <cb-accordion-panel header="Uno"><p class="c1">Contenido 1</p></cb-accordion-panel>
      <cb-accordion-panel header="Dos"><p class="c2">Contenido 2</p></cb-accordion-panel>
    </cb-accordion>
  `,
})
class HostComponent {
  multiple = signal(false);
}

describe('CbAccordion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const headers = (): HTMLButtonElement[] =>
      Array.from(el.querySelectorAll('.cb-accordion__header'));
    return { fixture, el, headers };
  }

  it('los paneles arrancan cerrados', () => {
    const { el, headers } = setup();
    expect(headers()[0].getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('.c1')).toBeNull();
  });

  it('abrir un panel muestra su contenido', () => {
    const { fixture, el, headers } = setup();
    headers()[0].click();
    fixture.detectChanges();
    expect(headers()[0].getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('.c1')).toBeTruthy();
  });

  it('en modo simple, abrir otro cierra el anterior', () => {
    const { fixture, el, headers } = setup();
    headers()[0].click();
    fixture.detectChanges();
    headers()[1].click();
    fixture.detectChanges();
    expect(el.querySelector('.c1')).toBeNull();
    expect(el.querySelector('.c2')).toBeTruthy();
  });

  it('en modo multiple, varios paneles pueden estar abiertos', () => {
    const { fixture, el, headers } = setup();
    fixture.componentInstance.multiple.set(true);
    fixture.detectChanges();
    headers()[0].click();
    headers()[1].click();
    fixture.detectChanges();
    expect(el.querySelector('.c1')).toBeTruthy();
    expect(el.querySelector('.c2')).toBeTruthy();
  });
});
