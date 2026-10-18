import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbInputMask } from './inputmask.component';

@Component({
  imports: [CbInputMask],
  template: `<cb-input-mask [mask]="mask()" [(value)]="val" />`,
})
class HostComponent {
  mask = signal('999-999');
  val = signal('');
}

describe('CbInputMask', () => {
  it('aplica la máscara numérica e ignora letras', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '12a3456';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('123-456');
    expect(fixture.componentInstance.val()).toBe('123-456');
  });
});
