import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCardPrimary } from './card-primary.component';

describe('CbCardPrimary', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbCardPrimary] }).compileComponents();
    const fixture = TestBed.createComponent(CbCardPrimary);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('subtítulo y valor son opcionales; la insignia es decorativa', () => {
    const fixture = TestBed.createComponent(CbCardPrimary);
    fixture.componentRef.setInput('title', 'Puntos');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cb-card-primary__subtitle')).toBeNull();
    expect(el.querySelector('.cb-card-primary__value')).toBeNull();
    expect(el.querySelector('.cb-card-primary__badge')!.getAttribute('aria-hidden')).toBe('true');
    fixture.componentRef.setInput('value', '1.250');
    fixture.detectChanges();
    expect(el.querySelector('.cb-card-primary__value')!.textContent).toBe('1.250');
  });
});
