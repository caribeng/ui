import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbPanelMenuComponent, type CbPanelMenuItem } from './panelmenu.component';

@Component({ imports: [CbPanelMenuComponent], template: `<cb-panelmenu [items]="items" (itemSelect)="selected=$event.label" />` })
class HostComponent {
  items: CbPanelMenuItem[] = [{ label: 'Cuenta', items: [{ label: 'Perfil', url: '/profile' }, { label: 'Salir' }] }, { label: 'Ayuda' }];
  selected = '';
}

describe('CbPanelMenuComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));
  it('expands and collapses a section with the proper aria state', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.cb-panelmenu__trigger')!;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.click(); fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelectorAll('.cb-panelmenu__child')).toHaveLength(2);
  });
  it('emits a selected child action', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.cb-panelmenu__trigger')!.click(); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.cb-panelmenu__child')[1].click(); fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('Salir');
  });
});
