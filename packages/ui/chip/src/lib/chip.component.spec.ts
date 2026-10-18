import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbChip } from './chip.component';

@Component({
  imports: [CbChip],
  template: `<cb-chip label="Angular 22" [removable]="true" (removed)="count = count + 1" />`,
})
class HostComponent {
  count = 0;
}

describe('CbChip', () => {
  it('renderiza la etiqueta y emite removed al cerrar', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cb-chip__label')?.textContent).toBe('Angular 22');

    el.querySelector<HTMLButtonElement>('.cb-chip__remove')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.count).toBe(1);
  });
});
