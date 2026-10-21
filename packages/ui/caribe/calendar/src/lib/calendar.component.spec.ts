import { CbLocaleService } from '@caribeng/ui';
import { TestBed } from '@angular/core/testing';
import { CbCalendar } from './calendar.component';

describe('CbCalendar', () => {
  it('permite seleccionar un día del calendario', () => {
    const fixture = TestBed.createComponent(CbCalendar);
    fixture.detectChanges();
    fixture.componentInstance.selectDay(24);
    expect(fixture.componentInstance.selectedDay()).toBe(24);
  });

  it('los días son botones dentro de un grupo nombrado por el mes; el elegido tiene aria-pressed', () => {
    const fixture = TestBed.createComponent(CbCalendar);
    fixture.componentRef.setInput('monthLabel', 'Octubre 2026');
    fixture.componentRef.setInput('totalDays', 30);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const grid = el.querySelector('.cb-calendar__grid')!;
    expect(grid.getAttribute('role')).toBe('group');
    expect(grid.getAttribute('aria-label')).toBe('Octubre 2026');
    const days = Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-calendar__day'));
    expect(days).toHaveLength(30);

    days[4].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedDay()).toBe(5);
    expect(days[4].getAttribute('aria-pressed')).toBe('true');
    expect(days[16].getAttribute('aria-pressed')).toBe('false');
  });

  it('limita los días del mes entre 28 y 31', () => {
    const fixture = TestBed.createComponent(CbCalendar);
    fixture.componentRef.setInput('totalDays', 10);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.cb-calendar__day').length).toBe(28);
    fixture.componentRef.setInput('totalDays', 40);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.cb-calendar__day').length).toBe(31);
  });

  it('las iniciales de la semana siguen el idioma activo y son decorativas', () => {
    const fixture = TestBed.createComponent(CbCalendar);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cb-calendar__weekdays')!.getAttribute('aria-hidden')).toBe('true');
    const initials = Array.from(el.querySelectorAll('.cb-calendar__weekday')).map((w) => w.textContent);
    expect(initials).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D']);

    TestBed.inject(CbLocaleService).use('en');
    fixture.detectChanges();
    expect(Array.from(el.querySelectorAll('.cb-calendar__weekday')).map((w) => w.textContent)).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
  });
});
