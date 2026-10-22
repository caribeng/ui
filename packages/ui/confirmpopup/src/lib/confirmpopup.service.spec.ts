import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbConfirmationService } from '@caribeng/ui';
import { describe, expect, it, vi } from 'vitest';
import { CbConfirmPopup } from './confirmpopup.component';

@Component({
  imports: [CbConfirmPopup],
  template: `
    <button type="button" class="trigger" (click)="borrar($event)">Eliminar</button>
    <cb-confirm-popup service />
  `,
})
class HostComponent {
  private readonly confirmation = inject(CbConfirmationService);
  accept = vi.fn();
  reject = vi.fn();

  borrar(event: Event): void {
    this.confirmation.confirm({ target: event.currentTarget, message: '¿Eliminar el archivo?', accept: this.accept, reject: this.reject });
  }
}

function setup() {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const fixture = TestBed.createComponent(HostComponent);
  document.body.appendChild(fixture.nativeElement);
  fixture.detectChanges();
  const panel = () => document.querySelector<HTMLElement>('.cb-confirm-popup');
  const buttons = () => Array.from(panel()!.querySelectorAll<HTMLElement>('button'));
  const trigger = fixture.nativeElement.querySelector('.trigger') as HTMLElement;
  return { fixture, host: fixture.componentInstance, panel, buttons, trigger, service: TestBed.inject(CbConfirmationService) };
}

describe('CbConfirmPopup con CbConfirmationService', () => {
  it('se abre anclada al target y ejecuta accept', () => {
    const { fixture, host, panel, buttons, trigger, service } = setup();
    trigger.click();
    fixture.detectChanges();
    expect(panel()?.textContent).toContain('¿Eliminar el archivo?');
    buttons()[1].click();
    fixture.detectChanges();
    expect(host.accept).toHaveBeenCalledOnce();
    expect(panel()).toBeNull();
    expect(service.request()).toBeNull();
  });

  it('ejecuta reject al cancelar', () => {
    const { fixture, host, buttons, trigger } = setup();
    trigger.click();
    fixture.detectChanges();
    buttons()[0].click();
    fixture.detectChanges();
    expect(host.reject).toHaveBeenCalledOnce();
    expect(host.accept).not.toHaveBeenCalled();
  });

  it('sin target no se abre (la atiende cb-confirm-dialog)', () => {
    const { fixture, panel, service } = setup();
    service.confirm({ message: 'Sin ancla' });
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });
});
