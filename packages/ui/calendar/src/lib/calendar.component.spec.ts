import { TestBed } from '@angular/core/testing';
import { CbCalendarComponent } from './calendar.component';

describe('CbCalendarComponent', () => {
  it('permite seleccionar un día del calendario', () => {
    const fixture = TestBed.createComponent(CbCalendarComponent);
    fixture.detectChanges();
    fixture.componentInstance.selectDay(24);
    expect(fixture.componentInstance.selectedDay()).toBe(24);
  });
});
