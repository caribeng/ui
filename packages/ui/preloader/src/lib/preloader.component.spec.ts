import { TestBed } from '@angular/core/testing';
import { CbPreloaderComponent } from './preloader.component';

describe('CbPreloaderComponent', () => {
  it('renderiza la pantalla de preloader cuando active es true', () => {
    const fixture = TestBed.createComponent(CbPreloaderComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-busy="true"]')).toBeTruthy();
  });
});
