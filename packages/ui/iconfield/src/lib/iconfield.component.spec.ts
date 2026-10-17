import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbIconFieldComponent, CbInputIconComponent } from './iconfield.component';

@Component({
  imports: [CbIconFieldComponent, CbInputIconComponent],
  template: `
    <cb-icon-field iconPosition="right">
      <cb-input-icon><span>🔍</span></cb-input-icon>
      <input type="text" />
    </cb-icon-field>
  `,
})
class HostComponent {}

describe('CbIconFieldComponent', () => {
  it('aplica la clase de posición al contenedor y renderiza cb-input-icon', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const field = fixture.nativeElement.querySelector('cb-icon-field') as HTMLElement;
    expect(field.classList.contains('cb-icon-field--right')).toBe(true);
    expect(field.querySelector('cb-input-icon')?.getAttribute('aria-hidden')).toBe('true');
  });
});
