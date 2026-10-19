import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbTooltipContent } from './tooltip-content.component';

describe('CbTooltipContent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbTooltipContent] });
  });

  it('muestra el texto y el rol tooltip', () => {
    const fixture = TestBed.createComponent(CbTooltipContent);
    fixture.componentRef.setInput('text', 'Ayuda');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent?.trim()).toBe('Ayuda');
    expect(host.getAttribute('role')).toBe('tooltip');
  });

  it('aplica la clase de posición (por defecto top)', () => {
    const fixture = TestBed.createComponent(CbTooltipContent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList).toContain('cb-tooltip');
    expect(host.classList).toContain('cb-tooltip--top');

    fixture.componentRef.setInput('position', 'bottom');
    fixture.detectChanges();
    expect(host.classList).toContain('cb-tooltip--bottom');
  });
});
