import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbFieldset } from './fieldset.component';

@Component({
  imports: [CbFieldset],
  template: `
    <cb-fieldset
      [legend]="legend()"
      [toggleable]="toggleable()"
      [(collapsed)]="collapsed"
    >
      <p class="fieldset-body">Texto dentro del fieldset</p>
    </cb-fieldset>
  `,
})
class HostComponent {
  legend = signal('Información fiscal');
  toggleable = signal(false);
  collapsed = signal(false);
}

describe('CbFieldset', () => {
  it('renderiza legend estático y contenido por defecto', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cb-fieldset__legend-label')?.textContent).toBe('Información fiscal');
    expect(el.querySelector('.fieldset-body')?.textContent).toBe('Texto dentro del fieldset');
    expect(el.querySelector('.cb-fieldset__toggler')).toBeNull();
  });

  it('cuando toggleable es true permite contraer y expandir el contenido', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.toggleable.set(true);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const btn = el.querySelector<HTMLButtonElement>('.cb-fieldset__toggler')!;
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    btn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.collapsed()).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('.cb-fieldset__content')).toBeNull();
  });
  it('con toggleable, aria-controls solo apunta al contenido visible', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.toggleable.set(true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const toggler = el.querySelector<HTMLButtonElement>('.cb-fieldset__toggler')!;
    expect(toggler.getAttribute('aria-controls')).toBe(el.querySelector('[role="region"]')!.id);
    toggler.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="region"]')).toBeNull();
    expect(toggler.hasAttribute('aria-controls')).toBe(false);
  });
});
