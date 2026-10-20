import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbImage } from './image.component';

@Component({
  imports: [CbImage],
  template: `<cb-image src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Paisaje" [preview]="preview()" width="200px" />`,
})
class HostComponent {
  preview = signal(true);
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  document.body.appendChild(el);
  const overlay = () => el.querySelector<HTMLButtonElement>('.cb-image__overlay');
  const lightbox = () => el.querySelector<HTMLElement>('.cb-image__lightbox');
  const lightboxImg = () => el.querySelector<HTMLImageElement>('.cb-image__lightbox-img')!;
  const tool = (label: string) =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-image__tool')).find(
      (b) => b.getAttribute('aria-label') === label,
    )!;
  const open = async () => {
    overlay()!.click();
    fixture.detectChanges();
    await fixture.whenStable();
  };
  return { fixture, el, overlay, lightbox, lightboxImg, tool, open };
}

describe('CbImage', () => {
  it('renderiza la imagen con alt y tamaño', async () => {
    const { el } = await setup();
    const img = el.querySelector<HTMLImageElement>('.cb-image__img')!;
    expect(img.alt).toBe('Paisaje');
    expect(img.style.width).toBe('200px');
    el.remove();
  });

  it('sin preview no muestra el botón de ampliar', async () => {
    const { fixture, el, overlay } = await setup();
    fixture.componentInstance.preview.set(false);
    fixture.detectChanges();
    expect(overlay()).toBeNull();
    el.remove();
  });

  it('abre un diálogo modal con nombre accesible y botones etiquetados', async () => {
    const { el, overlay, lightbox, open } = await setup();
    expect(overlay()!.getAttribute('aria-label')).toContain('Paisaje');
    await open();
    expect(lightbox()!.getAttribute('role')).toBe('dialog');
    expect(lightbox()!.getAttribute('aria-modal')).toBe('true');
    expect(lightbox()!.getAttribute('aria-label')).toBe('Paisaje');
    const tools = Array.from(el.querySelectorAll('.cb-image__tool'));
    expect(tools.every((b) => b.getAttribute('aria-label'))).toBe(true);
    expect(document.activeElement!.getAttribute('aria-label')).toBe('Cerrar');
    el.remove();
  });

  it('rota, voltea, hace zoom (con límites) y restablece', async () => {
    const { fixture, el, tool, lightboxImg, open } = await setup();
    await open();
    const click = (label: string, times = 1) => {
      for (let i = 0; i < times; i++) tool(label).click();
      fixture.detectChanges();
    };
    click('Rotar a la derecha');
    click('Voltear horizontal');
    click('Acercar');
    expect(lightboxImg().style.transform).toBe('rotate(90deg) scale(-1.25, 1.25)');

    click('Acercar', 10);
    expect(lightboxImg().style.transform).toContain('scale(-3, 3)');
    click('Alejar', 20);
    expect(lightboxImg().style.transform).toContain('scale(-0.5, 0.5)');
    expect(tool('Alejar').disabled).toBe(true);

    click('Restablecer');
    expect(lightboxImg().style.transform).toBe('rotate(0deg) scale(1, 1)');
    el.remove();
  });

  it('se cierra con Escape y devuelve el foco al botón de ampliar', async () => {
    const { fixture, el, overlay, lightbox, open } = await setup();
    await open();
    lightbox()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(lightbox()).toBeNull();
    expect(document.activeElement).toBe(overlay());
    el.remove();
  });

  it('se cierra al pulsar el fondo pero no al pulsar la imagen', async () => {
    const { fixture, el, lightbox, lightboxImg, open } = await setup();
    await open();
    lightboxImg().click();
    fixture.detectChanges();
    expect(lightbox()).not.toBeNull();
    lightbox()!.click();
    fixture.detectChanges();
    expect(lightbox()).toBeNull();
    el.remove();
  });

  it('reabrir restablece las transformaciones', async () => {
    const { fixture, el, tool, lightboxImg, open } = await setup();
    await open();
    tool('Rotar a la izquierda').click();
    tool('Cerrar').click();
    fixture.detectChanges();
    await open();
    expect(lightboxImg().style.transform).toBe('rotate(0deg) scale(1, 1)');
    el.remove();
  });
});
