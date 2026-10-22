import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CbClipboard } from './clipboard.service';
import { CbCopyButton } from './copy-button.component';
import { CbCopy } from './copy.directive';

describe('CbCopyButton y cbCopy', () => {
  let copyResult = true;
  const copySpy = vi.fn(async () => copyResult);

  beforeEach(() => {
    copyResult = true;
    copySpy.mockClear();
    TestBed.configureTestingModule({ providers: [{ provide: CbClipboard, useValue: { copy: copySpy } }] });
  });
  afterEach(() => vi.useRealTimers());

  @Component({
    imports: [CbCopyButton],
    template: `<cb-copy-button [value]="value" [timeout]="1000" [showLabel]="showLabel" (copied)="copied = $event" (copyError)="failed = $event" />`,
  })
  class Host {
    value: string | number = '0012 3456';
    showLabel = false;
    copied = '';
    failed = '';
  }

  async function setup(changes: Partial<Host> = {}) {
    const fixture = TestBed.createComponent(Host);
    Object.assign(fixture.componentInstance, changes);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const button = () => el.querySelector<HTMLButtonElement>('button')!;
    const settle = async () => {
      await Promise.resolve();
      fixture.detectChanges();
      await fixture.whenStable();
    };
    return { fixture, el, button, settle, host: fixture.componentInstance };
  }

  it('es un botón de solo icono con nombre "Copiar"', async () => {
    const { button, el } = await setup();
    expect(button().getAttribute('aria-label')).toBe('Copiar');
    expect(el.querySelector('cb-icon')!.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('[role="status"]')!.textContent).toBe('');
  });

  it('copia el valor, emite copied, anuncia "Copiado" y vuelve al estado inicial', async () => {
    vi.useFakeTimers();
    const { button, el, settle, host, fixture } = await setup({ value: 123456 });
    button().click();
    await settle();
    expect(copySpy).toHaveBeenCalledWith('123456');
    expect(host.copied).toBe('123456');
    expect(el.querySelector('[role="status"]')!.textContent).toBe('Copiado');
    expect(button().classList).toContain('cb-button--success');
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(el.querySelector('[role="status"]')!.textContent).toBe('');
  });

  it('con showLabel muestra el texto y lo cambia a "Copiado"', async () => {
    const { button, settle } = await setup({ showLabel: true });
    expect(button().getAttribute('aria-label')).toBeNull();
    expect(button().textContent!.trim()).toBe('Copiar');
    button().click();
    await settle();
    expect(button().textContent!.trim()).toBe('Copiado');
  });

  it('si el navegador no deja copiar emite copyError y lo anuncia', async () => {
    copyResult = false;
    const { button, el, settle, host } = await setup();
    button().click();
    await settle();
    expect(host.failed).toBe('0012 3456');
    expect(host.copied).toBe('');
    expect(el.querySelector('[role="status"]')!.textContent).toBe('No se pudo copiar');
  });

  it('la directiva cbCopy copia al pulsar cualquier elemento', async () => {
    @Component({
      imports: [CbCopy],
      template: `<button type="button" [cbCopy]="'ABC-123'" (copied)="copied = $event">Copiar código</button>`,
    })
    class DirectiveHost {
      copied = '';
    }
    const fixture = TestBed.createComponent(DirectiveHost);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();
    await Promise.resolve();
    await Promise.resolve();
    expect(copySpy).toHaveBeenCalledWith('ABC-123');
    expect(fixture.componentInstance.copied).toBe('ABC-123');
  });
});

describe('CbClipboard', () => {
  it('usa navigator.clipboard.writeText cuando existe', async () => {
    const writeText = vi.fn(async () => undefined);
    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    try {
      const ok = await TestBed.inject(CbClipboard).copy('hola');
      expect(ok).toBe(true);
      expect(writeText).toHaveBeenCalledWith('hola');
    } finally {
      if (original) Object.defineProperty(navigator, 'clipboard', original);
      else delete (navigator as { clipboard?: unknown }).clipboard;
    }
  });
});
