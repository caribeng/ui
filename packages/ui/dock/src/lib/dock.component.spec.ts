import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbDockComponent, type CbDockItem } from './dock.component';

@Component({ imports: [CbDockComponent], template: `<cb-dock [items]="items" position="left" (itemSelect)="selected=$event.label" />` })
class HostComponent { items: CbDockItem[] = [{ label: 'Inicio', icon: 'house' }, { label: 'Ayuda', icon: 'info', disabled: true }]; selected = ''; }

describe('CbDockComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));
  it('exposes vertical orientation for side dock positions', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="toolbar"]').getAttribute('aria-orientation')).toBe('vertical');
  });
  it('emits enabled application actions', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.cb-dock__item')!.click(); fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('Inicio');
  });
});
