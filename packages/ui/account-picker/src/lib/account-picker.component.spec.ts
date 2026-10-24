import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, describe, expect, it } from 'vitest';
import { CbAccountPicker } from './account-picker.component';
import { accountPath, cbAccountOptions, resolveAccounts, searchAccounts, type CbAccount } from './account-model';

const PUC: CbAccount[] = [
  { code: '1', name: 'Activo' },
  { code: '11', name: 'Disponible' },
  { code: '1105', name: 'Caja' },
  { code: '110505', name: 'Caja general' },
  { code: '110510', name: 'Cajas menores' },
  { code: '1110', name: 'Bancos' },
  { code: '111005', name: 'Moneda nacional' },
  { code: '4', name: 'Ingresos' },
  { code: '4135', name: 'Comercio al por mayor y al por menor' },
  { code: '413505', name: 'Venta de vehículos', disabled: true },
];

afterEach(() => document.body.replaceChildren());

describe('modelo del plan de cuentas', () => {
  it('deduce la jerarquía por el código, el nivel, la ruta y las cuentas de movimiento', () => {
    const all = resolveAccounts(PUC);
    const caja = all.find((a) => a.code === '110505')!;
    expect(caja.level).toBe(4);
    expect(accountPath(caja)).toBe('1 Activo › 11 Disponible › 1105 Caja');
    expect(all.filter((a) => a.postable).map((a) => a.code)).toEqual(['110505', '110510', '111005', '413505']);
  });

  it('busca por prefijo de código y por palabras del nombre o la ruta, sin tildes', () => {
    const all = resolveAccounts(PUC);
    expect(searchAccounts(all, '1105').map((a) => a.code)).toEqual(['1105', '110505', '110510']);
    expect(searchAccounts(all, 'vehiculos').map((a) => a.code)).toEqual(['413505']);
    expect(searchAccounts(all, 'disponible nacional').map((a) => a.code)).toEqual(['111005']);
  });

  it('cbAccountOptions da opciones de movimiento con su ruta para el Data Grid', () => {
    expect(cbAccountOptions(PUC)[0]).toEqual({ label: '110505 Caja general', value: '110505', description: '1 Activo › 11 Disponible › 1105 Caja', disabled: false });
    expect(cbAccountOptions(PUC).find((o) => o.value === '413505')!.disabled).toBe(true);
  });
});

@Component({
  imports: [CbAccountPicker, ReactiveFormsModule],
  template: `<cb-account-picker label="Cuenta" [accounts]="accounts" [formControl]="control" [allowParents]="parents()" />`,
})
class HostComponent {
  accounts = PUC;
  control = new FormControl<string | null>('110505');
  parents = signal(false);
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  document.body.appendChild(fixture.nativeElement);
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  await settle();
  const el = fixture.nativeElement as HTMLElement;
  const input = el.querySelector<HTMLInputElement>('input[role="combobox"]')!;
  const type = async (text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  };
  const key = async (k: string) => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    await settle();
  };
  const options = () => Array.from(document.querySelectorAll<HTMLElement>('.cb-ap__option'));
  return { fixture, el, input, type, key, options, settle, host: fixture.componentInstance };
}

describe('CbAccountPicker', () => {
  it('muestra la cuenta elegida con su ruta y la etiqueta enlazada', async () => {
    const { el, input } = await setup();
    expect(input.value).toBe('110505 Caja general');
    expect(el.querySelector('.cb-ap__path')!.textContent).toBe('1 Activo › 11 Disponible › 1105 Caja');
    expect(el.querySelector('label')!.getAttribute('for')).toBe(input.id);
  });

  it('al escribir filtra; las cuentas mayores no se eligen y Enter elige la resaltada', async () => {
    const { type, key, options, input, host } = await setup();
    await type('11');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(options().map((o) => o.querySelector('.cb-ap__code')!.textContent)).toEqual(['11', '1105', '110505', '110510', '1110', '111005']);
    expect(options()[0].getAttribute('aria-disabled')).toBe('true');
    expect(input.getAttribute('aria-activedescendant')).toBe(options()[2].id);
    await key('ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toBe(options()[3].id);
    await key('ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toBe(options()[5].id);
    await key('Enter');
    expect(host.control.value).toBe('111005');
    expect(input.value).toBe('111005 Moneda nacional');
  });

  it('escribir el código completo y salir lo elige; un texto que no coincide vuelve a la anterior', async () => {
    const { type, input, host, settle } = await setup();
    await type('110510');
    input.dispatchEvent(new Event('blur'));
    await settle();
    expect(host.control.value).toBe('110510');
    await type('zzz');
    input.dispatchEvent(new Event('blur'));
    await settle();
    expect(host.control.value).toBe('110510');
    expect(input.value).toBe('110510 Cajas menores');
    expect(host.control.touched).toBe(true);
  });

  it('con allowParents se eligen cuentas mayores; las inactivas nunca', async () => {
    const { type, key, host, options, fixture, settle } = await setup();
    fixture.componentInstance.parents.set(true);
    await settle();
    await type('4');
    expect(options()[0].getAttribute('aria-disabled')).toBeNull();
    expect(options().find((o) => o.textContent!.includes('413505'))!.getAttribute('aria-disabled')).toBe('true');
    await key('Enter');
    expect(host.control.value).toBe('4');
  });
});
