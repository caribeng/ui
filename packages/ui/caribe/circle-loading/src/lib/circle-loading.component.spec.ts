import { TestBed } from '@angular/core/testing';
import { CbCircleLoading } from './circle-loading.component';

describe('CbCircleLoading', () => {
  it('expone role="progressbar" con el porcentaje actual', () => {
    const fixture = TestBed.createComponent(CbCircleLoading);
    fixture.componentRef.setInput('progress', 80);
    fixture.detectChanges();
    const pb = fixture.nativeElement.querySelector('[role="progressbar"]');
    expect(pb.getAttribute('aria-valuenow')).toBe('80');
  });
});
