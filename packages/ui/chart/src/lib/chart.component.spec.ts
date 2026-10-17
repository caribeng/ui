import { TestBed } from '@angular/core/testing';
import { CbChartComponent } from './chart.component';

describe('CbChartComponent', () => {
  const sampleData = {
    labels: ['Ene', 'Feb', 'Mar'],
    datasets: [{ label: 'Ventas', data: [120, 190, 150] }],
  };

  it('renderiza barras SVG para el tipo bar', () => {
    const fixture = TestBed.createComponent(CbChartComponent);
    fixture.componentRef.setInput('type', 'bar');
    fixture.componentRef.setInput('data', sampleData);
    fixture.detectChanges();

    const rects = fixture.nativeElement.querySelectorAll('rect.cb-chart__bar');
    expect(rects.length).toBe(3);
  });

  it('renderiza segmentos circulares para el tipo doughnut', () => {
    const fixture = TestBed.createComponent(CbChartComponent);
    fixture.componentRef.setInput('type', 'doughnut');
    fixture.componentRef.setInput('data', sampleData);
    fixture.detectChanges();

    const circles = fixture.nativeElement.querySelectorAll('svg circle');
    expect(circles.length).toBe(3);
  });
});
