import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbVoucher } from './voucher.component';

describe('CbVoucher', () => {
  it('creates the standalone component and renders its host', async () => {
    await TestBed.configureTestingModule({ imports: [CbVoucher] }).compileComponents();
    const fixture = TestBed.createComponent(CbVoucher);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('presenta los datos como lista de descripción (admite etiquetas repetidas) y emite copy', () => {
    const fixture = TestBed.createComponent(CbVoucher);
    fixture.componentRef.setInput('title', 'Transferencia exitosa');
    fixture.componentRef.setInput('rows', [
      { label: 'Valor', value: '$50.000' },
      { label: 'Valor', value: '$1.000 (comisión)' },
    ]);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h2')!.textContent).toBe('Transferencia exitosa');
    expect(Array.from(el.querySelectorAll('dd')).map((d) => d.textContent)).toEqual(['$50.000', '$1.000 (comisión)']);
    expect(el.querySelector('.cb-voucher__check')!.getAttribute('aria-hidden')).toBe('true');
    let copies = 0;
    fixture.componentInstance.copy.subscribe(() => copies++);
    el.querySelector<HTMLButtonElement>('.cb-voucher__action')!.click();
    expect(copies).toBe(1);
  });
});
