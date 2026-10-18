import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbScrollTop } from './scrolltop.component';

@Component({
  imports: [CbScrollTop],
  template: `
    <div class="scroll-box" style="height: 120px; overflow: auto">
      <div style="height: 600px">Contenido largo</div>
      <cb-scroll-top target="parent" [threshold]="50" behavior="instant" />
    </div>
  `,
})
class HostComponent {}

describe('CbScrollTop', () => {
  it('permanece oculto bajo el umbral y aparece al hacer scroll sobre el padre', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const box = fixture.nativeElement.querySelector('.scroll-box') as HTMLElement;
    expect(box.querySelector('.cb-scroll-top__button')).toBeNull();

    box.scrollTop = 100;
    box.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    const btn = box.querySelector<HTMLButtonElement>('.cb-scroll-top__button');
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute('aria-label')).toBe('Volver arriba');

    btn!.click();
    fixture.detectChanges();

    expect(box.scrollTop).toBe(0);
    expect(box.querySelector('.cb-scroll-top__button')).toBeNull();
  });
});
