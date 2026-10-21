import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbScrollTop } from './scrolltop.component';

@Component({
  imports: [CbScrollTop],
  template: `
    <div class="scroll-box" style="height: 120px; overflow: auto">
      <div style="height: 600px">Contenido largo</div>
      <cb-scroll-top target="parent" [threshold]="threshold()" behavior="instant" [ariaLabel]="label()" icon="chevron-down" />
    </div>
  `,
})
class HostComponent {
  threshold = signal(50);
  label = signal<string | undefined>(undefined);
}

@Component({
  imports: [CbScrollTop],
  template: `<cb-scroll-top [threshold]="100" behavior="instant" />`,
})
class WindowHostComponent {}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  const box = fixture.nativeElement.querySelector('.scroll-box') as HTMLElement;
  const button = () => box.querySelector<HTMLButtonElement>('.cb-scroll-top__button');
  const scroll = (top: number) => {
    box.scrollTop = top;
    box.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  };
  return { fixture, box, button, scroll };
}

describe('CbScrollTop', () => {
  it('permanece oculto bajo el umbral y aparece al hacer scroll sobre el padre', async () => {
    const { box, button, scroll, fixture } = await setup();
    expect(button()).toBeNull();
    scroll(100);
    expect(button()).not.toBeNull();
    expect(button()!.getAttribute('aria-label')).toBe('Volver arriba');

    button()!.click();
    fixture.detectChanges();
    expect(box.scrollTop).toBe(0);
    expect(button()).toBeNull();
  });

  it('acepta etiqueta e icono propios', async () => {
    const { fixture, button, scroll } = await setup();
    fixture.componentInstance.label.set('Ir al inicio');
    scroll(100);
    expect(button()!.getAttribute('aria-label')).toBe('Ir al inicio');
    expect(button()!.getAttribute('type')).toBe('button');
  });

  it('recalcula la visibilidad al cambiar el umbral', async () => {
    const { fixture, button, scroll } = await setup();
    scroll(100);
    expect(button()).not.toBeNull();
    fixture.componentInstance.threshold.set(300);
    fixture.detectChanges();
    expect(button()).toBeNull();
  });

  it('con target window escucha el desplazamiento de la ventana', async () => {
    const fixture = TestBed.createComponent(WindowHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('cb-scroll-top')!.classList).toContain('cb-scroll-top--window');

    Object.defineProperty(window, 'scrollY', { value: 150, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(el.querySelector('.cb-scroll-top__button')).not.toBeNull();

    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(el.querySelector('.cb-scroll-top__button')).toBeNull();
  });
});
