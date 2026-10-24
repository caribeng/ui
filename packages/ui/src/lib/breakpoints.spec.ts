import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CbBreakpoints } from './breakpoints';

describe('CbBreakpoints', () => {
  // jsdom no tiene matchMedia: uno de prueba que evalúa min-width y max-width contra `width`.
  let width = 1024;
  const lists: { query: string; listeners: ((e: { matches: boolean }) => void)[]; last: boolean }[] = [];
  const evaluate = (query: string) => {
    const min = /min-width: ([\d.]+)px/.exec(query);
    const max = /max-width: ([\d.]+)px/.exec(query);
    if (!min && !max) return query === '(orientation: portrait)' && width < 600;
    return (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]));
  };
  const resize = (w: number) => {
    width = w;
    for (const l of lists) {
      const matches = evaluate(l.query);
      if (matches !== l.last) {
        l.last = matches;
        l.listeners.forEach((fn) => fn({ matches }));
      }
    }
  };
  const original = globalThis.matchMedia;

  beforeEach(() => {
    width = 1024;
    lists.length = 0;
    globalThis.matchMedia = ((query: string) => {
      const entry = { query, listeners: [] as ((e: { matches: boolean }) => void)[], last: evaluate(query) };
      lists.push(entry);
      return {
        get matches() {
          return evaluate(query);
        },
        addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => entry.listeners.push(fn),
      };
    }) as unknown as typeof matchMedia;
  });
  afterEach(() => {
    globalThis.matchMedia = original;
  });

  it('current es el breakpoint mayor que se cumple y sigue al ancho', () => {
    const bp = TestBed.inject(CbBreakpoints);
    expect(bp.current()).toBe('lg');
    resize(500);
    expect(bp.current()).toBe('xs');
    resize(768);
    expect(bp.current()).toBe('md');
    resize(1400);
    expect(bp.current()).toBe('2xl');
  });

  it('up, down y between, con el borde en el ancho mínimo', () => {
    const bp = TestBed.inject(CbBreakpoints);
    const upMd = bp.up('md');
    const downMd = bp.down('md');
    const tablet = bp.between('sm', 'lg');
    resize(767);
    expect([upMd(), downMd(), tablet()]).toEqual([false, true, true]);
    resize(768);
    expect([upMd(), downMd(), tablet()]).toEqual([true, false, true]);
    resize(992);
    expect(tablet()).toBe(false);
    expect(bp.up('xs')()).toBe(true);
    expect(bp.down('xs')()).toBe(false);
  });

  it('reutiliza el mismo signal por consulta y acepta cualquier media query', () => {
    const bp = TestBed.inject(CbBreakpoints);
    expect(bp.up('md')).toBe(bp.up('md'));
    const portrait = bp.matches('(orientation: portrait)');
    expect(portrait()).toBe(false);
    resize(400);
    expect(portrait()).toBe(true);
    expect(lists.filter((l) => l.query === '(min-width: 768px)')).toHaveLength(1);
  });

  it('en el servidor todo es false y current es xs', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const bp = TestBed.inject(CbBreakpoints);
    expect(bp.up('md')()).toBe(false);
    expect(bp.current()).toBe('xs');
    expect(lists).toHaveLength(0);
  });
});
