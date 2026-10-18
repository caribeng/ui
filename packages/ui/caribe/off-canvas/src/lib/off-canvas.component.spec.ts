import { TestBed } from '@angular/core/testing';
import { CbOffCanvas } from './off-canvas.component';

describe('CbOffCanvas', () => {
  it('muestra el diálogo lateral cuando open es true', () => {
    const fixture = TestBed.createComponent(CbOffCanvas);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
  });
});
