import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbChip } from './chip.component';

@Component({
  imports: [CbChip],
  template: `<cb-chip label="Angular 22" [icon]="icon()" [image]="image()" [removable]="removable()" (removed)="count = count + 1" />`,
})
class HostComponent {
  count = 0;
  icon = signal('');
  image = signal('');
  removable = signal(true);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  return { fixture, el, host: el.querySelector<HTMLElement>('cb-chip')! };
}

describe('CbChip', () => {
  it('renderiza la etiqueta y emite removed al cerrar', () => {
    const { fixture, el, host } = setup();
    expect(el.querySelector('.cb-chip__label')?.textContent).toBe('Angular 22');

    el.querySelector<HTMLButtonElement>('.cb-chip__remove')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.count).toBe(1);
    expect(host.style.display).toBe('none');
  });

  it('el botón de quitar se nombra con la etiqueta del chip', () => {
    const { el } = setup();
    const remove = el.querySelector('.cb-chip__remove')!;
    expect(remove.getAttribute('type')).toBe('button');
    expect(remove.getAttribute('aria-label')).toContain('Angular 22');
  });

  it('sin removable no muestra el botón de quitar', () => {
    const { fixture, el } = setup();
    fixture.componentInstance.removable.set(false);
    fixture.detectChanges();
    expect(el.querySelector('.cb-chip__remove')).toBeNull();
  });

  it('muestra un icono o una imagen decorativos (la imagen tiene prioridad)', () => {
    const { fixture, el } = setup();
    fixture.componentInstance.icon.set('user');
    fixture.detectChanges();
    expect(el.querySelector('.cb-chip__icon')!.getAttribute('aria-hidden')).toBe('true');

    fixture.componentInstance.image.set('data:image/gif;base64,R0lGODlhAQABAAAAACw=');
    fixture.detectChanges();
    expect(el.querySelector('.cb-chip__icon')).toBeNull();
    expect(el.querySelector<HTMLImageElement>('.cb-chip__img')!.getAttribute('alt')).toBe('');
  });
});
