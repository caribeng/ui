import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbMegaMenuComponent, type CbMegaMenuItem } from './megamenu.component';

@Component({ imports: [CbMegaMenuComponent], template: `<cb-megamenu [items]="items" (itemSelect)="selected=$event.label" />` })
class HostComponent {
  items: CbMegaMenuItem[] = [{ label: 'Productos', groups: [{ label: 'Audio', items: [{ label: 'Auriculares' }] }, { label: 'Video', items: [{ label: 'Monitores', url: '/monitors' }] }] }];
  selected = '';
}

describe('CbMegaMenuComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));
  it('opens category panels with grouped columns', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.cb-megamenu__group')).toHaveLength(2);
  });
  it('emits link selection and closes the panel', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click(); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('.cb-megamenu__link')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('Auriculares');
    expect(fixture.nativeElement.querySelector('.cb-megamenu__panel')).toBeNull();
  });
});
