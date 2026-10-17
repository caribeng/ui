import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CbToastService } from './toast.service';

describe('CbToastService', () => {
  let service: CbToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CbToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('add agrega un toast y devuelve su id', () => {
    const id = service.add({ summary: 'Hola' });
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].id).toBe(id);
    expect(service.toasts()[0].severity).toBe('info');
  });

  it('los atajos fijan la severidad correspondiente', () => {
    service.success('ok');
    service.error('mal');
    const sevs = service.toasts().map((t) => t.severity);
    expect(sevs).toContain('success');
    expect(sevs).toContain('danger');
  });

  it('remove cierra el toast por id', () => {
    const id = service.add({ summary: 'A', life: 0 });
    service.add({ summary: 'B', life: 0 });
    service.remove(id);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].summary).toBe('B');
  });

  it('clear elimina todos los toasts', () => {
    service.add({ summary: 'A', life: 0 });
    service.add({ summary: 'B', life: 0 });
    service.clear();
    expect(service.toasts().length).toBe(0);
  });

  it('auto-cierra tras el tiempo de vida (life)', () => {
    service.add({ summary: 'Temporal', life: 3000 });
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(3000);
    expect(service.toasts().length).toBe(0);
  });

  it('life=0 mantiene el toast de forma permanente', () => {
    service.add({ summary: 'Fijo', life: 0 });
    vi.advanceTimersByTime(10000);
    expect(service.toasts().length).toBe(1);
  });
});
