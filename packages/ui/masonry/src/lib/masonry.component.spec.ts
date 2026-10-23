import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbMasonry, masonrySpan } from './masonry.component';

@Component({
  imports: [CbMasonry],
  template: `
    <cb-masonry [columns]="columns()" gap="12px" role="list">
      @for (i of items; track i) {
        <div role="listitem">Tarjeta {{ i }}</div>
      }
    </cb-masonry>
  `,
})
class HostComponent {
  columns = signal(0);
  items = [1, 2, 3];
}

describe('CbMasonry', () => {
  it('conserva el orden del DOM y da a cada elemento sus filas de la rejilla', async () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('cb-masonry')!;
    expect(host.getAttribute('role')).toBe('list');
    const items = Array.from(host.children) as HTMLElement[];
    expect(items.map((i) => i.textContent!.trim())).toEqual(['Tarjeta 1', 'Tarjeta 2', 'Tarjeta 3']);
    // jsdom no maqueta (alto 0): una fila como mínimo.
    expect(items.every((i) => /^span \d+$/.test(i.style.gridRowEnd))).toBe(true);
  });

  it('columns fija el número de columnas; sin él, caben las que permite minColumnWidth', () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('cb-masonry')!;
    expect(host.style.getPropertyValue('--cb-masonry-columns')).toBe('repeat(auto-fill, minmax(min(16rem, 100%), 1fr))');
    fixture.componentInstance.columns.set(3);
    fixture.detectChanges();
    expect(host.style.getPropertyValue('--cb-masonry-columns')).toBe('repeat(3, minmax(0, 1fr))');
    expect(host.style.getPropertyValue('--cb-masonry-gap')).toBe('12px');
  });

  it('masonrySpan reparte el alto más el hueco en filas de 4 px', () => {
    expect(masonrySpan(100, 12)).toBe(28);
    expect(masonrySpan(0, 0)).toBe(1);
  });
});
