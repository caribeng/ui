import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbEditorComponent } from './editor.component';

@Component({
  imports: [CbEditorComponent],
  template: `<cb-editor [(value)]="html" />`,
})
class HostComponent {
  html = signal('<p>Hola</p>');
}

describe('CbEditorComponent', () => {
  it('sincroniza el valor inicial y actualiza el modelo al editar', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    TestBed.tick();

    const surface = fixture.nativeElement.querySelector('.cb-editor__surface') as HTMLElement;
    expect(surface.innerHTML).toBe('<p>Hola</p>');

    surface.innerHTML = '<p>Actualizado</p>';
    surface.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.html()).toBe('<p>Actualizado</p>');
  });
});
