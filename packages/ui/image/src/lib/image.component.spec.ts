import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbImageComponent } from './image.component';

@Component({
  imports: [CbImageComponent],
  template: `<cb-image src="https://picsum.photos/200" alt="Paisaje" [preview]="true" />`,
})
class HostComponent {}

describe('CbImageComponent', () => {
  it('renderiza la imagen y abre el lightbox al pulsar preview', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    el.querySelector<HTMLButtonElement>('.cb-image__overlay')!.click();
    fixture.detectChanges();

    expect(el.querySelector('.cb-image__lightbox')).not.toBeNull();
  });
});
