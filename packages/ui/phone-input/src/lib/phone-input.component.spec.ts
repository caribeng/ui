import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbPhoneInput } from './phone-input.component';
import { CB_PHONE_COUNTRIES, cbFormatNational, cbIsValidPhone, cbParsePhone, cbToE164 } from './phone-countries';

const byIso = (iso: string) => CB_PHONE_COUNTRIES.find((c) => c.iso === iso)!;

describe('datos de países', () => {
  it('cada país tiene un ejemplo válido, con un formato que usa todos sus dígitos', () => {
    const isos = new Set<string>();
    for (const c of CB_PHONE_COUNTRIES) {
      expect(isos.has(c.iso), `ISO repetido ${c.iso}`).toBe(false);
      isos.add(c.iso);
      expect(c.example, c.iso).toBeTruthy();
      expect(cbIsValidPhone(c, c.example!), `${c.iso} ${c.example}`).toBe(true);
      for (const [len, pattern] of Object.entries(c.formats ?? {})) {
        expect((pattern.match(/#/g) ?? []).length, `${c.iso} formato ${len}`).toBe(Number(len));
        expect(c.lengths, `${c.iso} longitud ${len}`).toContain(Number(len));
      }
    }
  });

  it('formatea a medio escribir y completo', () => {
    const co = byIso('CO');
    expect(cbFormatNational(co, '300')).toBe('300');
    expect(cbFormatNational(co, '3001')).toBe('300 1');
    expect(cbFormatNational(co, '3001234567')).toBe('300 123 4567');
    expect(cbFormatNational(byIso('US'), '201555')).toBe('(201) 555');
    expect(cbFormatNational(byIso('BR'), '11912345678')).toBe('(11) 91234-5678');
  });

  it('detecta el país por el prefijo, distingue los que comparten +1 y quita el 0 nacional', () => {
    const co = byIso('CO');
    expect(cbParsePhone('+57 300 123 4567', null, CB_PHONE_COUNTRIES)).toEqual({ country: co, national: '3001234567' });
    expect(cbParsePhone('0034 612 34 56 78', co, CB_PHONE_COUNTRIES).country!.iso).toBe('ES');
    expect(cbParsePhone('+1 809 234 5678', co, CB_PHONE_COUNTRIES).country!.iso).toBe('DO');
    expect(cbParsePhone('+1 201 555 0123', co, CB_PHONE_COUNTRIES).country!.iso).toBe('US');
    expect(cbParsePhone('+1 416 555 0123', co, CB_PHONE_COUNTRIES).country!.iso).toBe('CA');
    expect(cbParsePhone('+593 99 123 4567', co, CB_PHONE_COUNTRIES).country!.iso).toBe('EC');
    expect(cbParsePhone('06 12 34 56 78', byIso('FR'), CB_PHONE_COUNTRIES).national).toBe('612345678');
    expect(cbToE164(co, '3001234567')).toBe('+573001234567');
    expect(cbToE164(co, '')).toBe('');
  });
});

@Component({
  imports: [CbPhoneInput, ReactiveFormsModule],
  template: `<cb-phone-input label="Celular" [formControl]="control" [(country)]="country" [preferredCountries]="['MX', 'CO']" />`,
})
class Host {
  control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  country = signal('CO');
}

describe('CbPhoneInput', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    const el = fixture.nativeElement as HTMLElement;
    const field = () => el.querySelector<HTMLInputElement>('.cb-phone-input__field')!;
    const trigger = () => el.querySelector<HTMLButtonElement>('.cb-phone-input__country')!;
    const type = (text: string) => {
      field().value = text;
      field().dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    return { fixture, el, field, trigger, type, settle, host: fixture.componentInstance };
  }

  it('tiene etiqueta, indicador de requerido, tel/inputmode y nombre accesible del país', () => {
    const { el, field, trigger, fixture } = setup();
    expect(el.querySelector('label')!.getAttribute('for')).toBe(field().id);
    // Validators.required llega al campo (el indicador visual está desactivado por defecto).
    expect(field().required).toBe(true);
    expect(field().type).toBe('tel');
    expect(field().getAttribute('inputmode')).toBe('tel');
    expect(field().placeholder).toBe('300 123 4567');
    expect(trigger().getAttribute('aria-label')).toBe('País: Colombia (+57)');
    expect(trigger().getAttribute('aria-haspopup')).toBe('listbox');
    fixture.nativeElement.remove();
  });

  it('formatea al escribir y entrega E.164 al formulario con su validación', () => {
    const { field, type, host, fixture } = setup();
    type('300123');
    expect(field().value).toBe('300 123');
    expect(host.control.value).toBe('+57300123');
    expect(host.control.hasError('phone')).toBe(true);
    type('3001234567');
    expect(field().value).toBe('300 123 4567');
    expect(host.control.value).toBe('+573001234567');
    expect(host.control.valid).toBe(true);
    type('30012345678999');
    expect(host.control.value).toBe('+573001234567');
    fixture.nativeElement.remove();
  });

  it('al pegar un número internacional cambia de país', () => {
    const { type, host, field, fixture } = setup();
    type('+52 55 1234 5678');
    expect(host.country()).toBe('MX');
    expect(field().value).toBe('55 1234 5678');
    expect(host.control.value).toBe('+525512345678');
    fixture.nativeElement.remove();
  });

  it('writeValue interpreta E.164 y muestra el error al salir si está incompleto', () => {
    const { el, field, host, fixture } = setup();
    host.control.setValue('+34612345678');
    fixture.detectChanges();
    expect(host.country()).toBe('ES');
    expect(field().value).toBe('612 34 56 78');
    host.control.setValue('+3461');
    fixture.detectChanges();
    field().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(field().getAttribute('aria-invalid')).toBe('true');
    expect(el.querySelector('[role="alert"]')!.textContent).toContain('Número de teléfono incompleto o no válido');
    fixture.nativeElement.remove();
  });

  it('la lista de países: preferidos primero, búsqueda sin tildes, teclado y Escape', async () => {
    const { trigger, settle, host, field, fixture } = await (async () => setup())();
    trigger().click();
    await settle();
    const search = document.querySelector<HTMLInputElement>('.cb-phone-input__search')!;
    expect(document.activeElement).toBe(search);
    const options = () => Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container [role="option"]'));
    expect(options()[0].textContent).toContain('México');
    expect(options()[1].textContent).toContain('Colombia');
    expect(options()[1].getAttribute('aria-selected')).toBe('true');

    search.value = 'peru';
    search.dispatchEvent(new Event('input'));
    await settle();
    expect(options().map((o) => o.querySelector('.cb-phone-input__name')!.textContent)).toEqual(['Perú']);
    expect(search.getAttribute('aria-activedescendant')).toBe(options()[0].id);
    search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await settle();
    expect(host.country()).toBe('PE');
    expect(document.activeElement).toBe(field());

    trigger().click();
    await settle();
    document.querySelector<HTMLInputElement>('.cb-phone-input__search')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await settle();
    expect(options()).toHaveLength(0);
    expect(document.activeElement).toBe(trigger());
    fixture.nativeElement.remove();
  });
});
