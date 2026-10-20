import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CB_CONFIG, CB_DEFAULT_CONFIG } from '@caribeng/ui';
import { CbPaginator } from './paginator.component';

describe('CbPaginator · idioma', () => {
  it('las etiquetas accesibles salen del idioma configurado', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: CB_CONFIG, useValue: { ...CB_DEFAULT_CONFIG, locale: 'en' } }],
    });
    const fixture = TestBed.createComponent(CbPaginator);
    fixture.componentRef.setInput('totalRecords', 50);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.getAttribute('aria-label')).toBe('Pagination');
    const labels = Array.from(el.querySelectorAll('button[aria-label]')).map((b) => b.getAttribute('aria-label'));
    expect(labels).toContain('First page');
    expect(labels).toContain('Next page');
  });
});
