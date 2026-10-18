import { TestBed } from '@angular/core/testing';
import { CbOffCanvasComponent } from './off-canvas.component';

describe('CbOffCanvasComponent', () => {
  it('muestra el diálogo lateral cuando open es true', () => {
    const fixture = TestBed.createComponent(CbOffCanvasComponent);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
  });
});
