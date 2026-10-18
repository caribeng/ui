import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { CbPassword } from './password.component';

@Component({
  imports: [CbPassword, ReactiveFormsModule],
  template: `<cb-password [formControl]="ctrl" />`,
})
class HostComponent {
  ctrl = new FormControl('ClaveSegura123!');
}

describe('CbPassword', () => {
  it('alterna entre tipo password y text al pulsar el botón de visibilidad', () => {
    const fixture = TestBed.createComponent(CbPassword);
    fixture.componentRef.setInput('value', 'secreto');
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const toggleBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.cb-password__toggle');
    expect(input.type).toBe('password');

    toggleBtn.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
  });

  it('calcula la fortaleza de la contraseña e integra con ReactiveForms', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const label: HTMLElement = fixture.nativeElement.querySelector('.cb-password__label');
    expect(label.textContent).toContain('Fuerte');
  });
});
