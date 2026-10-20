import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  CbTimeline,
  CbTimelineContentTemplate,
  CbTimelineMarkerTemplate,
  CbTimelineOppositeTemplate,
  type CbTimelineAlign,
  type CbTimelineEvent,
} from './timeline.component';

const EVENTS: CbTimelineEvent[] = [
  { title: 'Pedido creado', date: '20 oct, 10:30', datetime: '2026-10-20T10:30', icon: 'check', color: '#10b981' },
  { title: 'En camino', date: '21 oct', description: 'Salió del centro de distribución' },
  { title: 'Entregado' },
];

@Component({
  imports: [CbTimeline, CbTimelineContentTemplate, CbTimelineOppositeTemplate, CbTimelineMarkerTemplate],
  template: `
    <cb-timeline [value]="events" [align]="align()" [orientation]="orientation()">
      @if (custom()) {
        <ng-template cbTimelineContent let-event let-i="index">{{ i }}-{{ event.title }}</ng-template>
        <ng-template cbTimelineOpposite let-event>{{ event.date }}</ng-template>
        <ng-template cbTimelineMarker><b class="marker">●</b></ng-template>
      }
    </cb-timeline>
  `,
})
class HostComponent {
  events = EVENTS;
  align = signal<CbTimelineAlign>('left');
  orientation = signal<'vertical' | 'horizontal'>('vertical');
  custom = signal(false);
}

describe('CbTimeline', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HostComponent] }));

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const events = () => Array.from(el.querySelectorAll<HTMLElement>('.cb-timeline__event'));
    return { fixture, el, events, host: fixture.componentInstance };
  }

  it('muestra los eventos como lista con nombre accesible del idioma', () => {
    const { el, events } = setup();
    expect(el.querySelector('ol')!.getAttribute('aria-label')).toBe('Cronología');
    expect(events().length).toBe(3);
    expect(events()[1].textContent).toContain('Salió del centro de distribución');
  });

  it('usa datetime legible por máquina, icono y color del marcador', () => {
    const { events } = setup();
    expect(events()[0].querySelector('time')!.getAttribute('datetime')).toBe('2026-10-20T10:30');
    expect(events()[1].querySelector('time')!.hasAttribute('datetime')).toBe(false);
    const marker = events()[0].querySelector<HTMLElement>('.cb-timeline__marker')!;
    expect(marker.querySelector('cb-icon')).toBeTruthy();
    expect(marker.style.getPropertyValue('--cb-timeline-color')).toBe('#10b981');
  });

  it('el último evento no tiene conector', () => {
    const { events } = setup();
    expect(events()[1].querySelector('.cb-timeline__connector')).toBeTruthy();
    expect(events()[2].querySelector('.cb-timeline__connector')).toBeNull();
  });

  it('alterna los lados en modo alternate', () => {
    const { fixture, el, events, host } = setup();
    host.align.set('alternate');
    fixture.detectChanges();
    expect(el.querySelector('ol')!.classList).toContain('cb-timeline--alternate');
    expect(events().map((e) => e.classList.contains('cb-timeline__event--alt'))).toEqual([false, true, false]);
  });

  it('usa las plantillas de contenido, lado opuesto y marcador', () => {
    const { fixture, events, host } = setup();
    host.custom.set(true);
    fixture.detectChanges();
    expect(events()[0].querySelector('.cb-timeline__content')!.textContent!.trim()).toBe('0-Pedido creado');
    expect(events()[0].querySelector('.cb-timeline__opposite')!.textContent!.trim()).toBe('20 oct, 10:30');
    expect(events()[0].querySelector('.marker')).toBeTruthy();
  });
});
