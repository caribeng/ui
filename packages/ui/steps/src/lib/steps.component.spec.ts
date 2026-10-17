import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbStepsComponent, type CbStepItem } from './steps.component';

@Component({ imports: [CbStepsComponent], template: `<cb-steps [steps]="steps" [(activeIndex)]="active" />` })
class HostComponent { steps: CbStepItem[] = [{ label: 'Cuenta' }, { label: 'Entrega' }, { label: 'Pago', disabled: true }]; active = signal(0); }

describe('CbStepsComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));
  it('marks the active step accessibly', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-current="step"]')?.getAttribute('aria-label')).toBe('Cuenta');
  });
  it('updates activeIndex and does not select disabled steps', () => {
    const fixture = TestBed.createComponent(HostComponent); fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.cb-steps__button')[1].click(); fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe(1);
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.cb-steps__button')[2].click();
    expect(fixture.componentInstance.active()).toBe(1);
  });
});
