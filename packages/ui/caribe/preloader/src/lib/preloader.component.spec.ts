import { TestBed } from '@angular/core/testing';
import { CbPreloader } from './preloader.component';

describe('CbPreloader', () => {
  it('renderiza la pantalla de preloader cuando active es true', () => {
    const fixture = TestBed.createComponent(CbPreloader);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-busy="true"]')).toBeTruthy();
  });
});
