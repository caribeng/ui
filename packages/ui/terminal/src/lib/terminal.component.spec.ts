import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbTerminal } from './terminal.component';

@Component({
  imports: [CbTerminal],
  template: `
    <cb-terminal
      welcomeMessage="Bienvenido"
      prompt="cb $"
      (commandEntered)="onCmd($event)"
    />
  `,
})
class HostComponent {
  term = viewChild.required(CbTerminal);
  received: string[] = [];
  onCmd(cmd: string): void {
    this.received.push(cmd);
    this.term().sendResponse(`Ejecutado: ${cmd}`);
  }
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const input = () => el.querySelector<HTMLInputElement>('.cb-terminal__input')!;
  const run = (cmd: string) => {
    input().value = cmd;
    input().dispatchEvent(new Event('input'));
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
  };
  const key = (k: string) => {
    input().dispatchEvent(new KeyboardEvent('keydown', { key: k, cancelable: true }));
    fixture.detectChanges();
  };
  const commands = () => Array.from(el.querySelectorAll('.cb-terminal__cmd')).map((c) => c.textContent);
  return { fixture, el, input, run, key, commands };
}

describe('CbTerminal', () => {
  it('procesa un comando al pulsar Enter y muestra la respuesta', () => {
    const { el, input, run } = setup();
    run('version');
    expect(el.querySelector('.cb-terminal__cmd')?.textContent).toBe('version');
    expect(el.querySelector('.cb-terminal__response')?.textContent).toBe('Ejecutado: version');
    expect(input().value).toBe('');
  });

  it('muestra el mensaje de bienvenida y nombra la entrada con el prompt', () => {
    const { el, input } = setup();
    expect(el.querySelector('.cb-terminal__welcome')!.textContent).toBe('Bienvenido');
    expect(input().getAttribute('aria-label')).toBe('cb $');
  });

  it('el historial es un log que anuncia las respuestas nuevas', () => {
    const { el } = setup();
    const history = el.querySelector('.cb-terminal__history')!;
    expect(history.getAttribute('role')).toBe('log');
    expect(history.getAttribute('aria-live')).toBe('polite');
  });

  it('ignora comandos vacíos y "clear" vacía el historial sin emitir', () => {
    const { fixture, run, commands } = setup();
    run('   ');
    run('help');
    expect(commands()).toEqual(['help']);
    run('clear');
    expect(commands()).toEqual([]);
    expect(fixture.componentInstance.received).toEqual(['help']);
  });

  it('flecha arriba / abajo recorren los comandos anteriores', () => {
    const { input, run, key } = setup();
    run('uno');
    run('dos');
    key('ArrowUp');
    expect(input().value).toBe('dos');
    key('ArrowUp');
    expect(input().value).toBe('uno');
    key('ArrowUp');
    expect(input().value).toBe('uno');
    key('ArrowDown');
    expect(input().value).toBe('dos');
    key('ArrowDown');
    expect(input().value).toBe('');
  });
});
