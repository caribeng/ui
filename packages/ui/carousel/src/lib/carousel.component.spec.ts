import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbCarouselComponent, CbCarouselItem } from './carousel.component';

@Component({
  imports: [CbCarouselComponent],
  template: `<cb-carousel [items]="items()" [(page)]="page" />`,
})
class HostComponent {
  page = signal(0);
  items = signal<CbCarouselItem[]>([
    { title: 'Slide 1', description: 'Uno' },
    { title: 'Slide 2', description: 'Dos' },
  ]);
}

describe('CbCarouselComponent', () => {
  it('navega entre diapositivas con los botones siguiente y anterior', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cb-carousel__title')?.textContent).toBe('Slide 1');

    el.querySelector<HTMLButtonElement>('.cb-carousel__nav--next')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.page()).toBe(1);
    expect(el.querySelector('.cb-carousel__title')?.textContent).toBe('Slide 2');
  });
});
