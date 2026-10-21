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

  it('tiñe el fondo del icono con cualquier color CSS y oculta los textos opcionales vacíos', () => {
    const fixture = TestBed.createComponent(CbFileCard);
    fixture.componentRef.setInput('title', 'Vídeos');
    fixture.componentRef.setInput('color', 'var(--cb-color-primary-500)');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const icon = el.querySelector<HTMLElement>('.cb-file-card__icon')!;
    expect(icon.getAttribute('style')).toContain('color-mix(in srgb, var(--cb-color-primary-500) 12%, transparent)');
    expect(el.querySelector('.cb-file-card__subtitle')).toBeNull();
    expect(el.querySelector('.cb-file-card__value-sub')).toBeNull();
    expect(el.querySelector('cb-icon')!.getAttribute('aria-hidden')).toBe('true');
  });
});
