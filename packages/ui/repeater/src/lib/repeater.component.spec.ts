import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CbRepeater, CbRepeaterItem } from './repeater.component';

@Component({
  imports: [CbRepeater, CbRepeaterItem, ReactiveFormsModule],
  template: `
    <cb-repeater [formArray]="beneficiarios" [createItem]="nuevo" itemLabel="Beneficiario" [min]="1" [max]="3">
      <ng-template cbRepeaterItem let-grupo let-i="index">
        <ng-container [formGroup]="grupo">
          <input class="nombre" formControlName="nombre" [attr.aria-label]="'Nombre ' + (i + 1)" />
        </ng-container>
      </ng-template>
    </cb-repeater>
  `,
})
class HostComponent {
  beneficiarios = new FormArray([new FormGroup({ nombre: new FormControl('Ana') })]);
  nuevo = () => new FormGroup({ nombre: new FormControl('') });
}

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  document.body.appendChild(fixture.nativeElement);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const items = () => Array.from(el.querySelectorAll<HTMLElement>('.cb-repeater__item'));
  const addBtn = () => el.querySelector<HTMLButtonElement>('.cb-repeater__add button')!;
  const removeBtn = (i: number) => items()[i].querySelector<HTMLButtonElement>('.cb-repeater__remove button')!;
  const live = () => el.querySelector('[aria-live="polite"]')!.textContent;
  const click = async (b: HTMLButtonElement) => {
    b.click();
    fixture.detectChanges();
    await fixture.whenStable();
  };
  return { fixture, el, items, addBtn, removeBtn, live, click, host: fixture.componentInstance };
}

describe('CbRepeater', () => {
  it('cada elemento es un grupo nombrado con su botón de quitar y la plantilla de campos', async () => {
    const { items, removeBtn, addBtn, el } = await setup();
    expect(items()).toHaveLength(1);
    expect(items()[0].getAttribute('role')).toBe('group');
    expect(items()[0].getAttribute('aria-label')).toBe('Beneficiario 1');
    expect(removeBtn(0).getAttribute('aria-label')).toBe('Quitar Beneficiario 1');
    expect(addBtn().textContent!.trim()).toBe('Agregar beneficiario');
    expect(items()[0].querySelector<HTMLInputElement>('.nombre')!.value).toBe('Ana');
    el.remove();
  });

  it('agregar crea el control, enfoca su primer campo y lo anuncia', async () => {
    const { items, addBtn, live, click, host, el } = await setup();
    await click(addBtn());
    expect(host.beneficiarios.length).toBe(2);
    expect(items()).toHaveLength(2);
    expect(document.activeElement).toBe(items()[1].querySelector('.nombre'));
    expect(live()).toBe('Beneficiario 2 agregado');
    el.remove();
  });

  it('respeta min (no se puede quitar el último) y max (se deshabilita agregar)', async () => {
    const { addBtn, removeBtn, click, el } = await setup();
    expect(removeBtn(0).disabled).toBe(true);
    await click(addBtn());
    await click(addBtn());
    expect(addBtn().disabled).toBe(true);
    expect(removeBtn(0).disabled).toBe(false);
    el.remove();
  });

  it('quitar elimina el control, mueve el foco al elemento anterior y lo anuncia', async () => {
    const { items, addBtn, removeBtn, live, click, host, el } = await setup();
    await click(addBtn());
    await click(addBtn());
    host.beneficiarios.at(2).setValue({ nombre: 'Carlos' });
    await click(removeBtn(1));
    expect(host.beneficiarios.length).toBe(2);
    expect(items().map((i) => i.querySelector<HTMLInputElement>('.nombre')!.value)).toEqual(['Ana', 'Carlos']);
    expect(document.activeElement).toBe(removeBtn(0));
    expect(live()).toBe('Beneficiario 2 eliminado');
    el.remove();
  });

  it('refleja los cambios hechos en el FormArray desde fuera', async () => {
    const { fixture, items, host, el } = await setup();
    host.beneficiarios.push(new FormGroup({ nombre: new FormControl('Desde fuera') }));
    fixture.detectChanges();
    expect(items()).toHaveLength(2);
    el.remove();
  });
});
