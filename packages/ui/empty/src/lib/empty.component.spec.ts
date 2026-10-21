import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbEmpty } from './empty.component';

@Component({
  imports: [CbEmpty],
  template: `
    <cb-empty title="Aún no tienes movimientos" description="Cuando hagas tu primera compra aparecerá aquí.">
      <button type="button" class="action">Transferir</button>
    </cb-empty>
  `,
})
class HostComponent {}

describe('CbEmpty', () => {
  it('muestra título, descripción, icono decorativo y las acciones proyectadas', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.cb-empty__title')!.textContent).toBe('Aún no tienes movimientos');
    expect(el.querySelector('.cb-empty__description')!.textContent).toContain('primera compra');
    expect(el.querySelector('.cb-empty__icon')!.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('.cb-empty__actions .action')).not.toBeNull();
  });

  it('sin título usa "Sin datos" del idioma activo y sin descripción no la pinta', () => {
    const fixture = TestBed.createComponent(CbEmpty);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.cb-empty__title')!.textContent).toBe('Sin datos');
    expect(el.querySelector('.cb-empty__description')).toBeNull();
  });

  it('con image muestra una ilustración decorativa en lugar del icono, y size="sm" reduce el bloque', () => {
    const fixture = TestBed.createComponent(CbEmpty);
    fixture.componentRef.setInput('image', 'data:image/gif;base64,R0lGODlhAQABAAAAACw=');
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.cb-empty__icon')).toBeNull();
    expect(el.querySelector('img')!.getAttribute('alt')).toBe('');
    expect(el.classList).toContain('cb-empty--sm');
  });
});
