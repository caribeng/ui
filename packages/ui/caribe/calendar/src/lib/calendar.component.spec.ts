import { TestBed } from '@angular/core/testing';
import { CbCalendar } from './calendar.component';

describe('CbCalendar', () => {
  it('permite seleccionar un día del calendario', () => {
    const fixture = TestBed.createComponent(CbCalendar);
    fixture.detectChanges();
    fixture.componentInstance.selectDay(24);
    expect(fixture.componentInstance.selectedDay()).toBe(24);
  });
});
