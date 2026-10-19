import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbToast } from './toast.component';
import { CbToastService } from './toast.service';

describe('CbToast', () => {
  let service: CbToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbToast] });
    service = TestBed.inject(CbToastService);
    service.clear();
  });

  function setup() {
    const fixture = TestBed.createComponent(CbToast);
    fixture.detectChanges();
    const el = () => fixture.nativeElement as HTMLElement;
    return { fixture, el };
  }

  it('renderiza los toasts del servicio con su severidad', () => {
    const { fixture, el } = setup();
    expect(el().querySelectorAll('.cb-toast').length).toBe(0);
    service.success('Guardado', 'Todo bien', { life: 0 });
    fixture.detectChanges();
    const toast = el().querySelector('.cb-toast')!;
    expect(toast).toBeTruthy();
    expect(toast.classList).toContain('cb-toast--success');
    expect(el().querySelector('.cb-toast__summary')!.textContent).toContain('Guardado');
    expect(el().querySelector('.cb-toast__detail')!.textContent).toContain('Todo bien');
  });

  it('aplica la posición en el contenedor', () => {
    const { fixture, el } = setup();
    fixture.componentRef.setInput('position', 'bottom-left');
    fixture.detectChanges();
    expect(el().querySelector('.cb-toast-wrap')!.classList).toContain('cb-toast-wrap--bottom-left');
  });

  it('el botón cerrar elimina el toast', () => {
    const { fixture, el } = setup();
    service.add({ severity: 'info', summary: 'Hola', closable: true, life: 0 });
    fixture.detectChanges();
    expect(el().querySelectorAll('.cb-toast').length).toBe(1);
    el().querySelector<HTMLButtonElement>('.cb-toast__close')!.click();
    fixture.detectChanges();
    expect(el().querySelectorAll('.cb-toast').length).toBe(0);
  });
});
