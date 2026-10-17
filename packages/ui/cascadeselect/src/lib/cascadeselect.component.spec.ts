import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbCascadeOption, CbCascadeSelectComponent } from './cascadeselect.component';

@Component({
  imports: [CbCascadeSelectComponent],
  template: `<cb-cascade-select [options]="opts()" [(value)]="val" />`,
})
class HostComponent {
  val = signal<string | null>(null);
  opts = signal<CbCascadeOption[]>([
    {
      label: 'Colombia',
      children: [{ label: 'Medellín', value: 'MDE' }],
    },
  ]);
}

describe('CbCascadeSelectComponent', () => {
  it('abre el grupo y selecciona una opción hija en cascada', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    el.querySelector<HTMLButtonElement>('.cb-cascade-select__trigger')!.click();
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.cb-cascade-select__option')!.click();
    fixture.detectChanges();

    const options = el.querySelectorAll<HTMLButtonElement>('.cb-cascade-select__option');
    expect(options.length).toBe(2);
    options[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.val()).toBe('MDE');
    expect(el.querySelector('.cb-cascade-select__label')?.textContent?.trim()).toBe('Colombia / Medellín');
  });
});
