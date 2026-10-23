import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbAvatar } from './avatar.component';

describe('CbAvatar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbAvatar] });
  });

  function setup() {
    const fixture = TestBed.createComponent(CbAvatar);
    const host = (): HTMLElement => fixture.nativeElement;
    return { fixture, host };
  }

  it('muestra iniciales cuando no hay imagen ni icono', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('label', 'AP');
    fixture.componentRef.setInput('severity', 'info');
    fixture.detectChanges();
    expect(host().querySelector('.cb-avatar__label')?.textContent?.trim()).toBe('AP');
    expect(host().classList).toContain('cb-avatar--info');
    expect(host().classList).toContain('cb-avatar--circle');
  });

  it('muestra una imagen cuando se provee image', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('image', '/u/ana.jpg');
    fixture.detectChanges();
    const img = host().querySelector('img.cb-avatar__img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('/u/ana.jpg');
  });

  it('muestra un icono cuando se provee icon', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('icon', 'user');
    fixture.componentRef.setInput('shape', 'square');
    fixture.detectChanges();
    expect(host().querySelector('cb-icon svg')).toBeTruthy();
    expect(host().classList).toContain('cb-avatar--square');
  });

  it('aplica el tamaño al host', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('size', 64);
    fixture.detectChanges();
    expect(host().style.width).toBe('64px');
    expect(host().style.height).toBe('64px');
  });
  it('con ariaLabel e imagen, el nombre está solo en el host (la imagen tiene alt vacío)', () => {
    const { fixture, host } = setup();
    fixture.componentRef.setInput('image', '/u/ana.jpg');
    fixture.componentRef.setInput('ariaLabel', 'Ana Pérez');
    fixture.detectChanges();
    expect(host().getAttribute('role')).toBe('img');
    expect(host().getAttribute('aria-label')).toBe('Ana Pérez');
    expect(host().querySelector('img')!.getAttribute('alt')).toBe('');
  });
});
