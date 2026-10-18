import { TestBed } from '@angular/core/testing';
import { CbLinkComponent } from './link.component';

describe('CbLinkComponent', () => {
  it('configura rel="noopener noreferrer" cuando external es true', () => {
    const fixture = TestBed.createComponent(CbLinkComponent);
    fixture.componentRef.setInput('label', 'Términos');
    fixture.componentRef.setInput('external', true);
    fixture.detectChanges();
    const a: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(a.getAttribute('rel')).toContain('noopener');
  });
});
