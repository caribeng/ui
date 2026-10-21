import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbDescriptions, CbDescriptionsValue, type CbDescriptionItem } from './descriptions.component';

@Component({
  imports: [CbDescriptions, CbDescriptionsValue],
  template: `
    <cb-descriptions title="Detalle de la transferencia" [items]="items" [columns]="3" [bordered]="bordered()" [layout]="layout()">
      <ng-template cbDescriptionsValue="estado" let-estado><strong class="tag">{{ estado }}</strong></ng-template>
    </cb-descriptions>
  `,
})
class HostComponent {
  bordered = signal(false);
  layout = signal<'horizontal' | 'vertical'>('vertical');
  items: CbDescriptionItem[] = [
    { label: 'Origen', value: 'Ahorros **** 1234' },
    { label: 'Valor', value: 250000 },
    { label: 'Estado', key: 'estado', value: 'Aprobada' },
    { label: 'Concepto', value: null, span: 2 },
  ];
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, el, host: el.querySelector<HTMLElement>('cb-descriptions')! };
}

describe('CbDescriptions', () => {
  it('es una lista de descripción con pares dt / dd, nombrada por su título', () => {
    const { el } = setup();
    const title = el.querySelector('[role="heading"]')!;
    expect(title.textContent).toBe('Detalle de la transferencia');
    expect(title.getAttribute('aria-level')).toBe('3');
    const dl = el.querySelector('dl')!;
    expect(dl.getAttribute('aria-labelledby')).toBe(title.id);
    expect(Array.from(dl.querySelectorAll('dt')).map((d) => d.textContent)).toEqual(['Origen', 'Valor', 'Estado', 'Concepto']);
    expect(dl.querySelectorAll('dd')[1].textContent!.trim()).toBe('250000');
  });

  it('usa la plantilla por key y un guion cuando no hay valor', () => {
    const { el } = setup();
    const dds = el.querySelectorAll('dd');
    expect(dds[2].querySelector('.tag')!.textContent).toBe('Aprobada');
    expect(dds[3].textContent!.trim()).toBe('—');
  });

  it('columns, span, bordered y layout se reflejan en el estilo', () => {
    const { fixture, el, host } = setup();
    expect(host.style.getPropertyValue('--cb-descriptions-columns')).toBe('3');
    expect(el.querySelectorAll<HTMLElement>('.cb-descriptions__item')[3].style.gridColumn).toBe('span 2');
    expect(host.classList).toContain('cb-descriptions--vertical');
    fixture.componentInstance.bordered.set(true);
    fixture.componentInstance.layout.set('horizontal');
    fixture.detectChanges();
    expect(host.classList).toContain('cb-descriptions--bordered');
    expect(host.classList).not.toContain('cb-descriptions--vertical');
  });
});
