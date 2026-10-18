import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbMeterGroup, CbMeterItem } from './metergroup.component';

@Component({
  imports: [CbMeterGroup],
  template: `<cb-meter-group [values]="items" />`,
})
class HostComponent {
  items: CbMeterItem[] = [
    { label: 'Apps', value: 25 },
    { label: 'Datos', value: 40 },
  ];
}

describe('CbMeterGroup', () => {
  it('renderiza segmentos y elementos de leyenda', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.cb-meter-group__bar').length).toBe(2);
    expect(el.querySelectorAll('.cb-meter-group__item').length).toBe(2);
  });
});
