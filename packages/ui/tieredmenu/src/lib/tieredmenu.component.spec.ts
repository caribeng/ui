import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbTieredMenuComponent, type CbTieredMenuItem } from './tieredmenu.component';

@Component({ imports: [CbTieredMenuComponent], template: `<cb-tieredmenu [items]="items" (itemSelect)="selected=$event.label" />` })
class HostComponent {
  items: CbTieredMenuItem[] = [{ label: 'Archivo', items: [{ label: 'Nuevo', items: [{ label: 'Proyecto' }] }, { label: 'Abrir' }] }];
  selected = '';
}

describe('CbTieredMenuComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));
  it('opens the popup and cascades into nested levels', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click(); fixture.detectChanges();
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
    document.body.querySelector<HTMLButtonElement>('.cb-tieredmenu__list > .cb-tieredmenu__entry [aria-haspopup="menu"]')!.click(); fixture.detectChanges();
    document.body.querySelector<HTMLButtonElement>('.cb-tieredmenu__submenu [aria-haspopup="menu"]')!.click(); fixture.detectChanges();
    expect(document.body.querySelectorAll('[role="menu"]')).toHaveLength(3);
  });
  it('emits a leaf selection and closes the popup', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click(); fixture.detectChanges();
    document.body.querySelector<HTMLButtonElement>('.cb-tieredmenu__list > .cb-tieredmenu__entry [aria-haspopup="menu"]')!.click(); fixture.detectChanges();
    document.body.querySelector<HTMLButtonElement>('.cb-tieredmenu__submenu [aria-haspopup="menu"]')!.click(); fixture.detectChanges();
    document.body.querySelector<HTMLButtonElement>('.cb-tieredmenu__submenu--third button')!.click(); fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('Proyecto');
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
  });
});
