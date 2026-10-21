import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbExpansionPanel } from './expansion-panel.component';

@Component({
  imports: [CbExpansionPanel],
  template: `
    <cb-expansion-panel title="Detalle del crédito" [(expanded)]="expanded"><p class="body">Tasa 1,2 % E.M.</p></cb-expansion-panel>
    <cb-expansion-panel />
  `,
})
class HostComponent {
  expanded = signal(false);
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const headers = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-expansion-panel__header'));
  const click = (b: HTMLElement) => {
    b.click();
    fixture.detectChanges();
  };
  return { fixture, el, headers, click };
}

describe('CbExpansionPanel', () => {
  it('alterna expanded al pulsar el encabezado', () => {
    const { fixture, el, headers, click } = setup();
    expect(el.querySelector('.body')).toBeNull();
    click(headers()[0]);
    expect(fixture.componentInstance.expanded()).toBe(true);
    expect(el.querySelector('.body')!.textContent).toBe('Tasa 1,2 % E.M.');
    click(headers()[0]);
    expect(fixture.componentInstance.expanded()).toBe(false);
  });

  it('el encabezado controla una región nombrada por él', () => {
    const { el, headers, click } = setup();
    const header = headers()[0];
    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(header.hasAttribute('aria-controls')).toBe(false);
    click(header);
    const region = el.querySelector<HTMLElement>('[role="region"]')!;
    expect(header.getAttribute('aria-expanded')).toBe('true');
    expect(header.getAttribute('aria-controls')).toBe(region.id);
    expect(region.getAttribute('aria-labelledby')).toBe(header.id);
  });

  it('cada panel tiene ids únicos y título por defecto del idioma activo', () => {
    const { headers } = setup();
    expect(headers()[0].id).not.toBe(headers()[1].id);
    expect(headers()[0].textContent).toContain('Detalle del crédito');
    expect(headers()[1].textContent).toContain('Detalles');
  });

  it('[(expanded)] abre el panel desde fuera', () => {
    const { fixture, el } = setup();
    fixture.componentInstance.expanded.set(true);
    fixture.detectChanges();
    expect(el.querySelector('.cb-expansion-panel')!.classList).toContain('cb-is-open');
  });
});
