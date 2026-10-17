import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbGalleriaComponent, CbGalleriaItem } from './galleria.component';

@Component({
  imports: [CbGalleriaComponent],
  template: `<cb-galleria [value]="images()" [(activeIndex)]="idx" />`,
})
class HostComponent {
  idx = signal(0);
  images = signal<CbGalleriaItem[]>([
    { itemImageSrc: 'img1.jpg', title: 'Foto 1' },
    { itemImageSrc: 'img2.jpg', title: 'Foto 2' },
  ]);
}

describe('CbGalleriaComponent', () => {
  it('cambia la imagen activa al hacer clic en una miniatura', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const thumbs = el.querySelectorAll<HTMLButtonElement>('.cb-galleria__thumb');
    expect(thumbs.length).toBe(2);

    thumbs[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.idx()).toBe(1);
    expect(el.querySelector('.cb-galleria__caption')?.textContent).toBe('Foto 2');
  });
});
