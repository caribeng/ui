import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbTabsComponent, CbTabComponent } from './tabs.component';

@Component({
  imports: [CbTabsComponent, CbTabComponent],
  template: `
    <cb-tabs>
      <cb-tab label="Uno"><p class="c1">Contenido 1</p></cb-tab>
      <cb-tab label="Dos"><p class="c2">Contenido 2</p></cb-tab>
      <cb-tab label="Tres"><p class="c3">Contenido 3</p></cb-tab>
    </cb-tabs>
  `,
})
class HostComponent {}

describe('CbTabsComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const tabs = (): HTMLButtonElement[] =>
      Array.from(el.querySelectorAll('.cb-tabs__tab'));
    return { fixture, el, tabs };
  }

  it('renderiza una pestaña por cada cb-tab y activa la primera', () => {
    const { el, tabs } = setup();
    expect(tabs().map((t) => t.textContent!.trim())).toEqual(['Uno', 'Dos', 'Tres']);
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    expect(el.querySelector('.c1')).toBeTruthy();
    expect(el.querySelector('.c2')).toBeNull();
  });

  it('seleccionar una pestaña muestra su contenido', () => {
    const { fixture, el, tabs } = setup();
    tabs()[1].click();
    fixture.detectChanges();
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    expect(el.querySelector('.c2')).toBeTruthy();
    expect(el.querySelector('.c1')).toBeNull();
  });

  it('las flechas navegan entre pestañas', () => {
    const { fixture, el, tabs } = setup();
    tabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(el.querySelector('.c2')).toBeTruthy();
  });
});
