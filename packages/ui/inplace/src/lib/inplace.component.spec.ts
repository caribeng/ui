import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbInplaceComponent } from './inplace.component';

@Component({
  imports: [CbInplaceComponent],
  template: `
    <cb-inplace [closable]="true">
      <span cb-inplace-display>Editar título</span>
      <input cb-inplace-content value="Nuevo título" />
    </cb-inplace>
  `,
})
class HostComponent {}

describe('CbInplaceComponent', () => {
  it('muestra el contenido al hacer clic en display y vuelve al cerrar', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    el.querySelector<HTMLButtonElement>('.cb-inplace__display')!.click();
    fixture.detectChanges();

    expect(el.querySelector('input')?.value).toBe('Nuevo título');

    el.querySelector<HTMLButtonElement>('.cb-inplace__close')!.click();
    fixture.detectChanges();

    expect(el.querySelector('.cb-inplace__display')).not.toBeNull();
  });
});
