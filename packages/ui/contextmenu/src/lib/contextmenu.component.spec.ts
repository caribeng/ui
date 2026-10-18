import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbContextMenu } from './contextmenu.component';

@Component({ imports: [CbContextMenu], template: `<cb-contextmenu [items]="[{label:'Copiar'}, {label:'Bloqueado',disabled:true}]" (itemSelect)="selected=$event.label">Zona de contexto</cb-contextmenu>` })
class HostComponent { selected = ''; }

describe('CbContextMenu', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));
  it('opens at a contextmenu event and presents enabled actions', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    fixture.nativeElement.querySelector('cb-contextmenu').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 30, clientY: 20 }));
    fixture.detectChanges();
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy();
    expect(document.body.querySelectorAll('[role="menuitem"]')).toHaveLength(2);
  });
  it('emits the selected action and closes', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    fixture.nativeElement.querySelector('cb-contextmenu').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })); fixture.detectChanges();
    document.body.querySelector<HTMLButtonElement>('[role="menuitem"]')!.click(); fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('Copiar');
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
  });
});
