import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { afterEach, describe, expect, it } from 'vitest';
import { CbDynamicForm, CbFormFieldTemplate, type CbFormOptionsLoader } from './dynamic-form.component';
import { checkRules, evaluateFormula, ordered, responsive, type CbFormSchema } from './dynamic-form-model';

afterEach(() => document.body.replaceChildren());

describe('modelo avanzado del formulario', () => {
  it('fórmulas seguras con campos, listas y funciones', () => {
    expect(evaluateFormula('cantidad * precio', { cantidad: 3, precio: 1500.5 })).toBe(4501.5);
    expect(evaluateFormula('round(base * 0.19, 0)', { base: 1001 })).toBe(190);
    expect(evaluateFormula('sum(lineas.subtotal) - descuento', { lineas: [{ subtotal: 100 }, { subtotal: 250 }], descuento: 50 })).toBe(300);
    expect(evaluateFormula('-(a + 2) / 4', { a: 6 })).toBe(-2);
    expect(evaluateFormula('a / b', { a: 5, b: 0 })).toBe(0);
    expect(() => evaluateFormula('alert(1); x', {})).toThrow();
  });

  it('reglas entre campos, columnas por tamaño y orden', () => {
    expect(checkRules([{ equalsField: 'clave' }], 'abc', { clave: 'abd' })).toBeTruthy();
    expect(checkRules([{ equalsField: 'clave' }], 'abc', { clave: 'abc' })).toBeNull();
    expect(checkRules([{ gteField: 'inicio' }], new Date(2026, 0, 1), { inicio: new Date(2026, 1, 1) })).toBeTruthy();
    expect(checkRules([{ gteField: 'minimo' }], 10, { minimo: 5 })).toBeNull();
    expect(responsive({ base: 1, md: 3 }, 1)).toEqual({ base: 1, sm: 1, md: 3, lg: 3 });
    expect(ordered([{ key: 'a' }, { key: 'b', order: -1 }, { key: 'c' }]).map((f) => f.key)).toEqual(['b', 'a', 'c']);
  });
});

const PAISES = [
  { label: 'Colombia', value: 'CO' },
  { label: 'Panamá', value: 'PA' },
];

@Component({
  imports: [CbDynamicForm, CbFormFieldTemplate, ReactiveFormsModule],
  template: `
    <cb-dynamic-form [schema]="schema()" [(value)]="value" [loaders]="loaders" (formSubmit)="sent.push($event)">
      <ng-template cbFormField="firma" let-control let-id="id">
        <input class="firma" [id]="id" [formControl]="control" />
      </ng-template>
    </cb-dynamic-form>
  `,
})
class HostComponent {
  readonly form = viewChild.required(CbDynamicForm);
  schema = signal<CbFormSchema>({ fields: [] });
  value = signal<Record<string, unknown>>({});
  sent: Record<string, unknown>[] = [];
  loaders: Record<string, CbFormOptionsLoader> = {
    ciudades: ({ value }) => Promise.resolve(value['pais'] === 'CO' ? [{ label: 'Bogotá', value: 'BOG' }, { label: 'Cali', value: 'CLO' }] : [{ label: 'Ciudad de Panamá', value: 'PTY' }]),
  };
}

async function setup(schema: CbFormSchema, value: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.schema.set(schema);
  fixture.componentInstance.value.set(value);
  document.body.appendChild(fixture.nativeElement);
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r));
    fixture.detectChanges();
  };
  await settle();
  const el = fixture.nativeElement as HTMLElement;
  const field = (key: string) => el.querySelector<HTMLElement>(`[data-key="${key}"]`);
  const ctrl = (path: string) => fixture.componentInstance.form().form().get(path)!;
  const button = (text: string) => Array.from(el.querySelectorAll('button')).find((b) => b.textContent!.trim().startsWith(text))!;
  return { fixture, el, settle, field, ctrl, button, host: fixture.componentInstance };
}

describe('CbDynamicForm avanzado', () => {
  it('posición de la etiqueta por formulario, sección y campo, y textos traducibles', async () => {
    const { field } = await setup({
      labelPosition: 'left',
      sections: [
        { fields: [{ key: 'a', label: { es: 'Nombre', en: 'Name' } }, { key: 'b', label: 'Derecha', labelPosition: 'right', labelAlign: 'end' }] },
        { labelPosition: 'floating', fields: [{ key: 'c', label: 'Flotante', placeholder: 'no se ve' }, { key: 'd', label: 'Oculta', labelPosition: 'hidden' }, { key: 'e', label: 'Lista', type: 'radio', options: PAISES }] },
      ],
    });
    expect(field('a')!.classList).toContain('cb-df__field--left');
    expect(field('a')!.querySelector('label')!.textContent!.trim()).toBe('Nombre');
    expect(field('b')!.classList).toContain('cb-df__field--right');
    expect(field('b')!.classList).toContain('cb-df__field--end');
    expect(field('c')!.classList).toContain('cb-df__field--floating');
    expect(field('c')!.querySelector('input')!.placeholder).toBe('');
    expect(field('d')!.querySelector('label')!.classList).toContain('cb-df__sr');
    // Un radio no admite etiqueta flotante: va encima.
    expect(field('e')!.classList).toContain('cb-df__field--top');
  });

  it('diseño: títulos, textos, separadores, ancho por tamaño, filas nuevas y orden', async () => {
    const { el, field } = await setup({
      columns: { base: 1, sm: 2, lg: 4 },
      fields: [
        { type: 'heading', content: 'Datos' },
        { key: 'b', label: 'B', order: 2 },
        { key: 'a', label: 'A', order: 1, colSpan: { base: 'full', lg: 2 } },
        { type: 'divider' },
        { type: 'paragraph', content: 'Texto de ayuda' },
        { key: 'c', label: 'C', newRow: true },
      ],
    });
    expect(el.querySelector('.cb-df__heading')!.textContent!.trim()).toBe('Datos');
    expect(el.querySelector('hr.cb-df__divider')).toBeTruthy();
    expect(el.querySelector('.cb-df__paragraph')!.textContent!.trim()).toBe('Texto de ayuda');
    const keys = Array.from(el.querySelectorAll<HTMLElement>('.cb-df__field')).map((n) => n.dataset['key']);
    expect(keys).toEqual(['a', 'b', 'c']);
    expect(['base', 'sm', 'md', 'lg'].map((bp) => field('a')!.style.getPropertyValue(`--df-col-${bp}`))).toEqual(['1 / -1', '1 / -1', '1 / -1', 'span 2']);
    expect(field('c')!.style.getPropertyValue('--df-col-lg')).toBe('1 / span 1');
  });

  it('opciones según otro campo, opciones de un cargador y limpieza al cambiar', async () => {
    const { ctrl, settle, host } = await setup({
      fields: [
        { key: 'pais', label: 'País', type: 'select', options: PAISES, default: 'CO' },
        { key: 'region', label: 'Región', type: 'select', optionsFrom: { field: 'pais', map: { CO: [{ label: 'Caribe', value: 'car' }], PA: [{ label: 'Chiriquí', value: 'chi' }] } } },
        { key: 'ciudad', label: 'Ciudad', type: 'select', optionsLoader: 'ciudades', dependsOn: ['pais'] },
      ],
    });
    const form = host.form();
    expect(form['optionsOf']([], { key: 'region', optionsFrom: { field: 'pais', map: {} } })).toEqual([{ label: 'Caribe', value: 'car', disabled: undefined }]);
    expect(form['optionsOf']([], { key: 'ciudad', optionsLoader: 'ciudades' }).map((o) => o.value)).toEqual(['BOG', 'CLO']);
    ctrl('region').setValue('car');
    ctrl('ciudad').setValue('CLO');
    await settle();
    ctrl('pais').setValue('PA');
    await settle();
    expect(ctrl('region').value).toBeNull();
    expect(ctrl('ciudad').value).toBeNull();
    expect(form['optionsOf']([], { key: 'ciudad', optionsLoader: 'ciudades' }).map((o) => o.value)).toEqual(['PTY']);
  });

  it('campos calculados y grupos repetibles con su total', async () => {
    const { ctrl, settle, host, button, el } = await setup({
      fields: [
        {
          key: 'lineas',
          label: 'línea',
          type: 'group',
          repeatable: true,
          minItems: 1,
          itemLabel: 'Línea {n}',
          fields: [
            { key: 'cantidad', label: 'Cantidad', type: 'number', default: 1 },
            { key: 'precio', label: 'Precio', type: 'number' },
            { key: 'subtotal', label: 'Subtotal', type: 'number', formula: 'cantidad * precio' },
          ],
        },
        { key: 'total', label: 'Total', type: 'number', formula: 'sum(lineas.subtotal)' },
        { key: 'iva', label: 'IVA', type: 'number', formula: 'round(total * 0.19, 0)' },
        { key: 'pagar', label: 'A pagar', type: 'number', formula: 'total + iva' },
      ],
    });
    expect(el.querySelectorAll('.cb-df__item').length).toBe(1);
    expect(el.querySelector('.cb-df__item-title')!.textContent!.trim()).toBe('Línea 1');
    ctrl('lineas.0.precio').setValue(1000);
    await settle();
    expect(ctrl('lineas.0.subtotal').value).toBe(1000);
    button('Añadir línea').click();
    await settle();
    ctrl('lineas.1.cantidad').setValue(3);
    ctrl('lineas.1.precio').setValue(500);
    await settle();
    expect(ctrl('total').value).toBe(2500);
    expect(host.value()).toEqual({ lineas: [{ cantidad: 1, precio: 1000, subtotal: 1000 }, { cantidad: 3, precio: 500, subtotal: 1500 }], total: 2500, iva: 475, pagar: 2975 });
    const remove = Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-df__item-head button'));
    expect(remove[0].getAttribute('aria-label')).toBe('Quitar Línea 1');
    remove[0].click();
    await settle();
    expect(ctrl('total').value).toBe(1500);
    // Con el mínimo de 1, el último no se puede quitar.
    expect(el.querySelector<HTMLButtonElement>('.cb-df__item-head button')!.disabled).toBe(true);
  });

  it('grupo anidado, reglas entre campos y prefijo / sufijo', async () => {
    const { ctrl, settle, el, host, field } = await setup({
      fields: [
        { key: 'cuenta', type: 'group', label: 'Acceso', fields: [{ key: 'clave', label: 'Clave', type: 'password' }, { key: 'repetir', label: 'Repetir', type: 'password', rules: [{ equalsField: 'clave', message: 'Las claves no coinciden.' }] }] },
        { key: 'valor', label: 'Valor', type: 'number', prefix: '$', suffix: 'COP' },
      ],
    });
    ctrl('cuenta.clave').setValue('abc123');
    ctrl('cuenta.repetir').setValue('abc124');
    ctrl('cuenta.repetir').markAsTouched();
    await settle();
    expect(el.querySelector('[data-key="cuenta.repetir"]')!.textContent).toContain('Las claves no coinciden.');
    ctrl('cuenta.repetir').setValue('abc123');
    await settle();
    expect(host.value()['cuenta']).toEqual({ clave: 'abc123', repetir: 'abc123' });
    expect(Array.from(field('valor')!.querySelectorAll('.cb-df__addon')).map((a) => a.textContent!.trim())).toEqual(['$', 'COP']);
  });

  it('formulario por pasos: no avanza con errores y envía al final', async () => {
    const { el, button, ctrl, settle, host } = await setup({
      steps: [
        { title: 'Datos', fields: [{ key: 'nombre', label: 'Nombre', required: true }] },
        { title: 'Contacto', fields: [{ key: 'correo', label: 'Correo', type: 'email', required: true }] },
      ],
    });
    expect(Array.from(el.querySelectorAll('.cb-df__step')).map((s) => s.getAttribute('aria-current'))).toEqual(['step', null]);
    expect(el.querySelector('[data-key="correo"]')).toBeNull();
    button('Siguiente').click();
    await settle();
    expect(el.querySelector('.cb-df__summary')!.textContent).toContain('Nombre');
    ctrl('nombre').setValue('Ana');
    button('Siguiente').click();
    await settle();
    expect(el.querySelector('[data-key="correo"]')).toBeTruthy();
    expect(el.querySelector('.cb-df__step-heading')!.textContent).toContain('Paso 2 de 2');
    ctrl('correo').setValue('ana@caribe.co');
    el.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await settle();
    expect(host.sent[0]).toEqual({ nombre: 'Ana', correo: 'ana@caribe.co' });
    button('Atrás').click();
    await settle();
    expect(el.querySelector('[data-key="nombre"]')).toBeTruthy();
  });

  it('máscara y tipo propio con plantilla', async () => {
    const { el, ctrl, settle, field } = await setup({
      fields: [
        { key: 'telefono', label: 'Teléfono', type: 'mask', mask: '(999) 999-9999' },
        { key: 'firma', label: 'Firma', type: 'firma' },
      ],
    });
    expect(field('telefono')!.querySelector('cb-input-mask')).toBeTruthy();
    const input = el.querySelector<HTMLInputElement>('input.firma')!;
    expect(field('firma')!.querySelector('label')!.getAttribute('for')).toBe(input.id);
    input.value = 'Ana Ruiz';
    input.dispatchEvent(new Event('input'));
    await settle();
    expect(ctrl('firma').value).toBe('Ana Ruiz');
  });
});
