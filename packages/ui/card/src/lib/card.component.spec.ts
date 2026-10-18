import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbCard } from './card.component';

@Component({
  imports: [CbCard],
  template: `
    <cb-card header="Título" subtitle="Subtítulo">
      <p class="cuerpo">Contenido</p>
      <div cb-card-footer><button class="accion">Acción</button></div>
    </cb-card>
  `,
})
class HostComponent {}

describe('CbCard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return { el: fixture.nativeElement as HTMLElement };
  }

  it('renderiza título, subtítulo, cuerpo y footer proyectado', () => {
    const { el } = setup();
    expect(el.querySelector('.cb-card__title')?.textContent?.trim()).toBe('Título');
    expect(el.querySelector('.cb-card__subtitle')?.textContent?.trim()).toBe('Subtítulo');
    expect(el.querySelector('.cb-card__body .cuerpo')).toBeTruthy();
    expect(el.querySelector('.cb-card__footer .accion')).toBeTruthy();
  });

  it('sin header no renderiza el encabezado', () => {
    @Component({
      imports: [CbCard],
      template: `<cb-card><p>solo cuerpo</p></cb-card>`,
    })
    class Plain {}
    const fixture = TestBed.createComponent(Plain);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.cb-card__header')).toBeNull();
  });
});
