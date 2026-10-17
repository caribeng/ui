import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbTerminalComponent } from './terminal.component';

@Component({
  imports: [CbTerminalComponent],
  template: `
    <cb-terminal
      welcomeMessage="Bienvenido"
      prompt="cb $"
      (commandEntered)="onCmd($event)"
    />
  `,
})
class HostComponent {
  term = viewChild.required(CbTerminalComponent);
  onCmd(cmd: string): void {
    this.term().sendResponse(`Ejecutado: ${cmd}`);
  }
}

describe('CbTerminalComponent', () => {
  it('procesa un comando al pulsar Enter y muestra la respuesta', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const input = el.querySelector<HTMLInputElement>('.cb-terminal__input')!;
    input.value = 'version';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(el.querySelector('.cb-terminal__cmd')?.textContent).toBe('version');
    expect(el.querySelector('.cb-terminal__response')?.textContent).toBe('Ejecutado: version');
  });
});
