import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbFileCard } from './file-card.component';

describe('CbFileCard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbFileCard] });
  });

  it('muestra título, subtítulo y valores', () => {
    const fixture = TestBed.createComponent(CbFileCard);
    fixture.componentRef.setInput('icon', 'image');
    fixture.componentRef.setInput('title', 'Imágenes');
    fixture.componentRef.setInput('subtitle', '17% usado');
    fixture.componentRef.setInput('value', '245 archivos');
    fixture.componentRef.setInput('valueSub', '26.4 GB');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.cb-file-card__title')!.textContent).toContain('Imágenes');
    expect(el.querySelector('.cb-file-card__subtitle')!.textContent).toContain('17% usado');
    expect(el.querySelector('.cb-file-card__value')!.textContent).toContain('245 archivos');
    expect(el.querySelector('.cb-file-card__value-sub')!.textContent).toContain('26.4 GB');
  });
});
