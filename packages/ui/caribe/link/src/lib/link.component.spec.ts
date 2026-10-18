import { TestBed } from '@angular/core/testing';
import { CbLink } from './link.component';

describe('CbLink', () => {
  it('configura rel="noopener noreferrer" cuando external es true', () => {
    const fixture = TestBed.createComponent(CbLink);
    fixture.componentRef.setInput('label', 'Términos');
    fixture.componentRef.setInput('external', true);
    fixture.detectChanges();
    const a: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(a.getAttribute('rel')).toContain('noopener');
  });
});
