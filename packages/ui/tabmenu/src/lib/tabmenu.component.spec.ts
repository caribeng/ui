import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbTabMenu, type CbTabMenuItem } from './tabmenu.component';

@Component({ imports: [CbTabMenu], template: `<cb-tabmenu [items]="items" [(activeIndex)]="active" />` })
class HostComponent {
  items: CbTabMenuItem[] = [{ label: 'Resumen' }, { label: 'Detalles', url: '#details' }, { label: 'Bloqueado', disabled: true }];
  active = signal(0);
}

describe('CbTabMenu', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));
  it('renders navigation and marks the current item', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-current="page"]')?.textContent).toContain('Resumen');
  });
  it('updates activeIndex and ignores disabled entries', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.cb-tabmenu__link')[1].click(); fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe(1);
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.cb-tabmenu__link')[2].click();
    expect(fixture.componentInstance.active()).toBe(1);
  });
});
