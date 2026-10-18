import { TestBed } from '@angular/core/testing';
import { CbProgressBarCaribeComponent } from './progress-bar.component';

describe('CbProgressBarCaribeComponent', () => {
  it('expone role="progressbar" con el valor acotado entre 0 y 100', () => {
    const fixture = TestBed.createComponent(CbProgressBarCaribeComponent);
    fixture.componentRef.setInput('value', 85);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')).toBe('85');
  });
});
