import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbPaginatorComponent, type CbPaginatorState } from './paginator.component';

describe('CbPaginatorComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbPaginatorComponent] });
  });

  function setup(total = 25) {
    const fixture = TestBed.createComponent(CbPaginatorComponent);
    fixture.componentRef.setInput('totalRecords', total);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const pages = (): HTMLButtonElement[] => Array.from(el.querySelectorAll('.cb-paginator__page'));
    const report = (): string => el.querySelector('.cb-paginator__report')!.textContent!.trim();
    return { fixture, el, pages, report };
  }

  it('renderiza un enlace por página y el reporte', () => {
    const { pages, report } = setup(25);
    expect(pages().map((p) => p.textContent!.trim())).toEqual(['1', '2', '3']);
    expect(report()).toBe('1–10 de 25');
  });

  it('ir a una página actualiza first, el reporte y emite pageChange', () => {
    const { fixture, pages, report } = setup(25);
    const states: CbPaginatorState[] = [];
    fixture.componentInstance.pageChange.subscribe((s) => states.push(s));
    pages()[2].click(); // página 3
    fixture.detectChanges();
    expect(fixture.componentInstance.first()).toBe(20);
    expect(report()).toBe('21–25 de 25');
    expect(states.at(-1)).toMatchObject({ first: 20, page: 2, pageCount: 3 });
  });

  it('los botones anterior/siguiente navegan y respetan los límites', () => {
    const { fixture, el, report } = setup(25);
    const next = el.querySelector<HTMLButtonElement>('[aria-label="Página siguiente"]')!;
    const first = el.querySelector<HTMLButtonElement>('[aria-label="Primera página"]')!;
    expect(first.disabled).toBe(true);
    next.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.first()).toBe(10);
    expect(report()).toBe('11–20 de 25');
    expect(first.disabled).toBe(false);
  });
});
