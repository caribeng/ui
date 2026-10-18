import { TestBed } from '@angular/core/testing';
import { CbCircleLoadingComponent } from './circle-loading.component';

describe('CbCircleLoadingComponent', () => {
  it('expone role="progressbar" con el porcentaje actual', () => {
    const fixture = TestBed.createComponent(CbCircleLoadingComponent);
    fixture.componentRef.setInput('progress', 80);
    fixture.detectChanges();
    const pb = fixture.nativeElement.querySelector('[role="progressbar"]');
    expect(pb.getAttribute('aria-valuenow')).toBe('80');
  });
});
