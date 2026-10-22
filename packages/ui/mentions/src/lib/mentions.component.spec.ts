import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbMentions, type CbMention, type CbMentionItem, type CbMentionSearch } from './mentions.component';

const PEOPLE: CbMentionItem[] = [
  { id: 'u1', label: 'Laura Gómez', description: 'Gerente' },
  { id: 'u2', label: 'Andrés Pérez' },
  { id: 'u3', label: 'Ángela Ruiz' },
  { id: 't1', label: 'urgente', trigger: '#' },
];

@Component({
  imports: [CbMentions, ReactiveFormsModule],
  template: `<cb-mentions label="Comentario" [suggestions]="people" [triggers]="['@', '#']" [formControl]="control" (mentionsChange)="mentions = $event" (search)="searches.push($event)" />`,
})
class Host {
  people = PEOPLE;
  control = new FormControl('', { nonNullable: true });
  mentions: CbMention[] = [];
  searches: CbMentionSearch[] = [];
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  document.body.appendChild(fixture.nativeElement);
  const el = fixture.nativeElement as HTMLElement;
  const field = () => el.querySelector<HTMLTextAreaElement>('textarea')!;
  const type = (text: string) => {
    field().value = text;
    field().setSelectionRange(text.length, text.length);
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const key = (k: string) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    field().dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };
  const options = () => Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container [role="option"]'));
  return { fixture, el, field, type, key, options, host: fixture.componentInstance };
}

describe('CbMentions', () => {
  it('al escribir @ muestra sugerencias, filtra sin tildes y anuncia la cantidad', () => {
    const { type, options, field, el, host, fixture } = setup();
    expect(field().getAttribute('aria-autocomplete')).toBe('list');
    type('Hola @');
    expect(options()).toHaveLength(3);
    expect(field().getAttribute('aria-controls')).toBe(document.querySelector('[role="listbox"]')!.id);
    expect(el.querySelector('[role="status"]')!.textContent).toBe('3 sugerencias');
    type('Hola @ange');
    expect(options().map((o) => o.querySelector('.cb-mentions__name')!.textContent)).toEqual(['Ángela Ruiz']);
    expect(host.searches.at(-1)).toEqual({ trigger: '@', query: 'ange' });
    fixture.nativeElement.remove();
  });

  it('flechas mueven aria-activedescendant y Enter inserta la mención, actualiza el formulario y emite', () => {
    const { type, key, field, host, options, fixture } = setup();
    type('Revisa @');
    expect(field().getAttribute('aria-activedescendant')).toBe(options()[0].id);
    key('ArrowDown');
    expect(field().getAttribute('aria-activedescendant')).toBe(options()[1].id);
    expect(key('Enter').defaultPrevented).toBe(true);
    expect(field().value).toBe('Revisa @Andrés Pérez ');
    expect(host.control.value).toBe('Revisa @Andrés Pérez ');
    expect(host.mentions).toEqual([{ id: 'u2', label: 'Andrés Pérez', trigger: '@' }]);
    expect(options()).toHaveLength(0);
    fixture.nativeElement.remove();
  });

  it('otros disparadores (#), Escape cierra y borrar la mención la quita de la lista', () => {
    const { type, key, field, host, options, fixture } = setup();
    type('Tema #urg');
    expect(options().map((o) => o.querySelector('.cb-mentions__name')!.textContent)).toEqual(['urgente']);
    key('Tab');
    expect(field().value).toBe('Tema #urgente ');
    expect(host.mentions).toEqual([{ id: 't1', label: 'urgente', trigger: '#' }]);

    type('Tema #urgente @la');
    // "Laura" empieza por "la" y va primero; "Ángela" lo contiene.
    expect(options().map((o) => o.querySelector('.cb-mentions__name')!.textContent)).toEqual(['Laura Gómez', 'Ángela Ruiz']);
    key('Escape');
    expect(options()).toHaveLength(0);

    type('Tema ');
    expect(host.mentions).toEqual([]);
    fixture.nativeElement.remove();
  });

  it('no se abre con @ dentro de una palabra (correos) ni tras un nombre sin coincidencias', () => {
    const { type, options, fixture } = setup();
    type('escribe a laura@banco.com');
    expect(options()).toHaveLength(0);
    type('@zzz qq');
    expect(options()).toHaveLength(0);
    fixture.nativeElement.remove();
  });
});
