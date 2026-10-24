import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { CbDynamicForm } from './dynamic-form.component';
import { initialValue, matches, type CbFormSchema } from './dynamic-form-model';

const SCHEMA: CbFormSchema = {
  columns: 2,
  resetLabel: 'Limpiar',
  sections: [
    {
      title: 'Datos',
      fields: [
        { key: 'nombre', label: 'Nombre', required: true, minLength: 3 },
        { key: 'email', label: 'Correo', type: 'email', required: true },
        {
          key: 'tipo',
          label: 'Tipo',
          type: 'radio',
          default: 'persona',
          options: [
            { label: 'Persona', value: 'persona' },
            { label: 'Empresa', value: 'empresa' },
          ],
        },
        { key: 'nit', label: 'NIT', visibleWhen: { field: 'tipo', equals: 'empresa' }, required: true },
        { key: 'edad', label: 'Edad', type: 'number', min: 18, messages: { min: 'Debes ser mayor de edad.' } },
        { key: 'notas', label: 'Notas', type: 'textarea', colSpan: 'full' },
        { key: 'acepto', label: 'Acepto las condiciones', type: 'checkbox', required: true },
      ],
    },
  ],
};

afterEach(() => document.body.replaceChildren());

describe('modelo del formulario dinámico', () => {
  it('evalúa condiciones JSON (equals, notEquals, in, filled) y funciones', () => {
    const v = { tipo: 'empresa', pais: 'CO', notas: '', tags: ['a'] };
    expect(matches({ field: 'tipo', equals: 'empresa' }, v)).toBe(true);
    expect(matches({ field: 'tipo', notEquals: 'empresa' }, v)).toBe(false);
    expect(matches({ field: 'pais', in: ['CO', 'PA'] }, v)).toBe(true);
    expect(matches({ field: 'notas', filled: false }, v)).toBe(true);
    expect(matches({ field: 'tags', equals: 'a' }, v)).toBe(true);
    expect(matches([{ field: 'tipo', equals: 'empresa' }, { field: 'pais', equals: 'PA' }], v)).toBe(false);
    expect(matches((x) => x['pais'] === 'CO', v)).toBe(true);
  });

  it('convierte los valores iniciales al tipo de cada control', () => {
    expect(initialValue({ key: 'a', type: 'date', default: '2030-03-05' })).toEqual(new Date(2030, 2, 5));
    expect(initialValue({ key: 'a', type: 'checkbox' })).toBe(false);
    expect(initialValue({ key: 'a', type: 'multiselect' })).toEqual([]);
    expect(initialValue({ key: 'a', type: 'number' })).toBeNull();
    expect(initialValue({ key: 'a' })).toBe('');
  });
});

@Component({
  imports: [CbDynamicForm],
  template: `<cb-dynamic-form [schema]="schema()" [(value)]="value" [layout]="layout()" (formSubmit)="sent.push($event)" (formInvalid)="invalid.push($event)" />`,
})
class HostComponent {
  readonly form = viewChild.required(CbDynamicForm);
  schema = signal<CbFormSchema>(SCHEMA);
  value = signal<Record<string, unknown>>({ nombre: 'Ana' });
  layout = signal<'vertical' | 'horizontal' | undefined>(undefined);
  sent: Record<string, unknown>[] = [];
  invalid: { key: string; message: string }[][] = [];
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  document.body.appendChild(fixture.nativeElement);
  const el = fixture.nativeElement as HTMLElement;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  await settle();
  const field = (key: string) => el.querySelector<HTMLElement>(`[data-key="${key}"]`);
  const type = async (key: string, text: string) => {
    const input = field(key)!.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea')!;
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('blur'));
    await settle();
  };
  const submit = async () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await settle();
  };
  return { fixture, el, settle, field, type, submit, host: fixture.componentInstance };
}

describe('CbDynamicForm', () => {
  it('arma los campos del esquema con etiquetas, valor inicial y la rejilla de columnas', async () => {
    const { el, field, host } = await setup();
    expect(el.querySelector('legend')!.textContent).toContain('Datos');
    const grid = el.querySelector<HTMLElement>('.cb-df__grid')!;
    expect([grid.style.getPropertyValue('--df-cols-base'), grid.style.getPropertyValue('--df-cols-md')]).toEqual(['1', '2']);
    expect(field('notas')!.style.getPropertyValue('--df-col-md')).toBe('1 / -1');
    expect(field('nombre')!.style.getPropertyValue('--df-col-md')).toBe('span 1');
    const label = field('nombre')!.querySelector('label')!;
    expect(label.textContent).toContain('Nombre');
    expect(document.getElementById(label.getAttribute('for')!)!.tagName).toBe('INPUT');
    expect(field('nombre')!.querySelector('input')!.value).toBe('Ana');
    expect(field('nit')).toBeNull();
    expect(host.value()).toEqual({ nombre: 'Ana', email: '', tipo: 'persona', edad: null, notas: '', acepto: false });
  });

  it('muestra los campos condicionales y los incluye en el valor solo si se ven', async () => {
    const { field, host, settle } = await setup();
    host.form().form().controls['tipo'].setValue('empresa');
    await settle();
    expect(field('nit')).toBeTruthy();
    expect(host.value()['nit']).toBe('');
    host.form().form().controls['tipo'].setValue('persona');
    await settle();
    expect(field('nit')).toBeNull();
    expect('nit' in host.value()).toBe(false);
  });

  it('al enviar con errores lista un resumen enlazado y no emite formSubmit', async () => {
    const { el, submit, host } = await setup();
    await submit();
    const summary = el.querySelector('.cb-df__summary')!;
    expect(summary.getAttribute('role')).toBe('alert');
    expect(Array.from(summary.querySelectorAll('li')).map((li) => li.textContent!.trim())).toEqual([
      'Correo: Este campo es obligatorio.',
      'Acepto las condiciones: Este campo es obligatorio.',
    ]);
    expect(host.sent.length).toBe(0);
    expect(host.invalid[0].map((e) => e.key)).toEqual(['email', 'acepto']);
    expect(el.querySelector('[data-key="email"]')!.textContent).toContain('Este campo es obligatorio.');
  });

  it('usa los mensajes propios y envía el valor cuando todo es válido', async () => {
    const { el, type, submit, host, settle } = await setup();
    await type('nombre', 'Ana Ruiz');
    await type('email', 'ana@caribe.co');
    host.form().form().controls['edad'].setValue(15);
    host.form().form().controls['edad'].markAsTouched();
    await settle();
    expect(el.querySelector('[data-key="edad"]')!.textContent).toContain('Debes ser mayor de edad.');
    host.form().form().controls['edad'].setValue(30);
    host.form().form().controls['acepto'].setValue(true);
    await submit();
    expect(el.querySelector('.cb-df__summary')).toBeNull();
    expect(host.sent[0]).toMatchObject({ nombre: 'Ana Ruiz', email: 'ana@caribe.co', edad: 30, acepto: true });
  });

  it('el valor que llega de fuera rellena el formulario y restablecer vuelve a los iniciales', async () => {
    const { el, host, settle, field } = await setup();
    host.value.set({ nombre: 'Leo', tipo: 'empresa', nit: '900123' });
    await settle();
    expect(field('nombre')!.querySelector('input')!.value).toBe('Leo');
    expect(field('nit')!.querySelector('input')!.value).toBe('900123');
    const reset = Array.from(el.querySelectorAll('button')).find((b) => b.textContent!.includes('Limpiar'))!;
    reset.click();
    await settle();
    expect(host.value()['nombre']).toBe('');
    expect(field('nit')).toBeNull();
  });

  it('disposición horizontal y requiredWhen', async () => {
    const { el, host, settle, field } = await setup();
    host.layout.set('horizontal');
    host.schema.set({
      fields: [
        { key: 'contacto', label: 'Contactar por', type: 'select', options: [{ label: 'Correo', value: 'email' }, { label: 'Teléfono', value: 'tel' }] },
        { key: 'tel', label: 'Teléfono', type: 'tel', requiredWhen: { field: 'contacto', equals: 'tel' } },
      ],
    });
    await settle();
    expect(field('tel')!.classList).toContain('cb-df__field--left');
    expect(field('tel')!.querySelector('.cb-df__req')).toBeNull();
    host.form().form().controls['contacto'].setValue('tel');
    await settle();
    expect(field('tel')!.querySelector('.cb-df__req')).toBeTruthy();
    expect(host.form().form().controls['tel'].hasError('required')).toBe(true);
    expect(field('contacto')!.querySelector('[aria-labelledby]')!.getAttribute('aria-labelledby')).toBe(field('contacto')!.querySelector('.cb-df__label')!.id);
  });
});
