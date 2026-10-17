import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbIconComponent } from './icon.component';
import { CbIconRegistry, provideCbIcons } from './icon-registry';

describe('CbIconComponent', () => {
  function setup() {
    const fixture = TestBed.createComponent(CbIconComponent);
    const svg = (): SVGElement | null => fixture.nativeElement.querySelector('svg');
    return { fixture, svg };
  }

  describe('render', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [CbIconComponent] });
    });

    it('pinta un SVG del set núcleo por nombre', () => {
      const { fixture, svg } = setup();
      fixture.componentRef.setInput('name', 'check');
      fixture.detectChanges();
      expect(svg()).toBeTruthy();
      expect(svg()!.getAttribute('stroke')).toBe('currentColor');
      expect(svg()!.querySelector('path')).toBeTruthy();
    });

    it('mapea size a píxeles (md=20, lg=24, número directo)', () => {
      const { fixture, svg } = setup();
      fixture.componentRef.setInput('name', 'x');
      fixture.detectChanges();
      expect(svg()!.getAttribute('width')).toBe('20');

      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(svg()!.getAttribute('width')).toBe('24');

      fixture.componentRef.setInput('size', 40);
      fixture.detectChanges();
      expect(svg()!.getAttribute('width')).toBe('40');
    });

    it('no pinta nada si el icono no existe', () => {
      const { fixture, svg } = setup();
      fixture.componentRef.setInput('name', 'no-existe-xyz');
      fixture.detectChanges();
      expect(svg()).toBeNull();
    });

    it('spin añade la clase de animación', () => {
      const { fixture } = setup();
      fixture.componentRef.setInput('name', 'loader');
      fixture.componentRef.setInput('spin', true);
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).classList).toContain('cb-icon--spin');
    });

    it('expone role/aria-label cuando ariaLabel está presente; decorativo si no', () => {
      const { fixture } = setup();
      const host = fixture.nativeElement as HTMLElement;
      fixture.componentRef.setInput('name', 'info');
      fixture.detectChanges();
      expect(host.getAttribute('aria-hidden')).toBe('true');
      expect(host.getAttribute('role')).toBeNull();

      fixture.componentRef.setInput('ariaLabel', 'Información');
      fixture.detectChanges();
      expect(host.getAttribute('role')).toBe('img');
      expect(host.getAttribute('aria-label')).toBe('Información');
      expect(host.getAttribute('aria-hidden')).toBeNull();
    });
  });

  describe('registro extensible', () => {
    it('provideCbIcons registra iconos propios del consumidor', () => {
      TestBed.configureTestingModule({
        imports: [CbIconComponent],
        providers: [provideCbIcons({ 'mi-logo': '<path d="M4 4h16v16H4z"/>' })],
      });
      const registry = TestBed.inject(CbIconRegistry);
      expect(registry.has('mi-logo')).toBe(true);
      // el núcleo sigue presente
      expect(registry.has('check')).toBe(true);

      const fixture = TestBed.createComponent(CbIconComponent);
      fixture.componentRef.setInput('name', 'mi-logo');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('svg path')).toBeTruthy();
    });
  });
});
