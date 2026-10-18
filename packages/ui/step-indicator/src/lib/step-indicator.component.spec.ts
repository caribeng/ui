import { TestBed } from '@angular/core/testing';
import { CbStepIndicatorComponent } from './step-indicator.component';

describe('CbStepIndicatorComponent', () => {
  it('muestra el paso actual y el total', () => {
    const fixture = TestBed.createComponent(CbStepIndicatorComponent);
    fixture.componentRef.setInput('currentStep', 2);
    fixture.componentRef.setInput('totalSteps', 4);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Paso 2 de 4');
  });
});
