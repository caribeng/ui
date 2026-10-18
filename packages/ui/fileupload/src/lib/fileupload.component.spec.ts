import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbFileUpload } from './fileupload.component';

@Component({
  imports: [CbFileUpload],
  template: `<cb-file-upload [multiple]="true" />`,
})
class HostComponent {}

describe('CbFileUpload', () => {
  it('agrega y elimina archivos de la lista', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const cmp = fixture.debugElement.children[0].componentInstance as CbFileUpload;
    cmp.addFiles([new File(['hola'], 'reporte.txt', { type: 'text/plain' })]);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cb-file-upload__name')?.textContent).toBe('reporte.txt');

    el.querySelector<HTMLButtonElement>('.cb-file-upload__remove')!.click();
    fixture.detectChanges();

    expect(el.querySelector('.cb-file-upload__item')).toBeNull();
  });
});
