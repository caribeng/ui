import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { CbChatInput, type CbChatSendEvent } from './chat-input.component';
import { CbChatMessage } from './chat-message.component';
import { CbChatMessages } from './chat-messages.component';

describe('CbChatMessage', () => {
  function setup(inputs: Record<string, unknown>) {
    const fixture = TestBed.createComponent(CbChatMessage);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('es un article con nombre (autor y hora) y pinta el markdown seguro', () => {
    const { el } = setup({ role: 'assistant', text: '**Hola** <b>x</b>', time: '10:30' });
    expect(el.getAttribute('role')).toBe('article');
    expect(el.getAttribute('aria-label')).toBe('Asistente, 10:30');
    const md = el.querySelector('.cb-chat-message__markdown')!;
    expect(md.querySelector('strong')!.textContent).toBe('Hola');
    expect(md.querySelector('b')).toBeNull();
    expect(md.textContent).toContain('<b>x</b>');
  });

  it('el sanitizador de Angular conserva todo el markdown (sin avisos ni contenido eliminado)', () => {
    const warn = vi.spyOn(console, 'warn');
    const md = [
      '| Mes | Saldo |',
      '|:--|--:|',
      '| Ene | $ 10 |',
      '',
      '- [x] hecho',
      '- [ ] no',
      '',
      '> cita',
      '',
      '[enlace](https://caribeng.dev) y `código`',
      '',
      '```ts',
      'const a = 1;',
      '```',
    ].join('\n');
    const { el } = setup({ text: md });
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('sanitizing HTML stripped'));
    warn.mockRestore();
    expect(el.querySelector('td.cb-md-right')!.textContent).toBe('$ 10');
    expect(el.querySelectorAll('.cb-md-check')).toHaveLength(2);
    expect(el.querySelector('a')!.getAttribute('rel')).toBe('noopener noreferrer');
    expect(el.querySelector('a')!.getAttribute('target')).toBe('_blank');
    expect(el.querySelector('pre code.language-ts')!.textContent).toBe('const a = 1;');
  });

  it('el usuario se alinea a la derecha con sus iniciales y markdown=false muestra texto plano', () => {
    const { el } = setup({ role: 'user', author: 'Laura Gómez', text: '**no**', markdown: false });
    expect(el.classList).toContain('cb-chat-message--user');
    expect(el.querySelector('.cb-chat-message__avatar')!.textContent!.trim()).toBe('LG');
    expect(el.querySelector('.cb-chat-message__plain')!.textContent).toBe('**no**');
  });

  it('streaming marca aria-busy, muestra el cursor y oculta el botón de copiar hasta terminar', () => {
    const { el, fixture } = setup({ text: 'Pensando', streaming: true, copyable: true });
    expect(el.getAttribute('aria-busy')).toBe('true');
    expect(el.querySelector('.cb-chat-message__caret')).not.toBeNull();
    expect(el.querySelector('cb-copy-button')).toBeNull();
    fixture.componentRef.setInput('streaming', false);
    fixture.detectChanges();
    expect(el.getAttribute('aria-busy')).toBeNull();
    expect(el.querySelector('cb-copy-button')).not.toBeNull();
  });

  it('con error muestra el aviso y "Reintentar" emite retry', () => {
    const { el, fixture } = setup({ role: 'user', text: 'Hola', status: 'error' });
    let retried = 0;
    fixture.componentInstance.retry.subscribe(() => retried++);
    expect(el.querySelector('.cb-chat-message__status--error')!.textContent).toContain('No se pudo enviar');
    el.querySelector<HTMLButtonElement>('.cb-chat-message__action')!.click();
    expect(retried).toBe(1);
  });
});

@Component({
  imports: [CbChatMessages, CbChatMessage],
  template: `
    <cb-chat-messages [busy]="busy()" [typing]="typing()" style="display:flex;height:200px">
      @for (m of messages(); track $index) {
        <cb-chat-message [text]="m" />
      }
    </cb-chat-messages>
  `,
})
class MessagesHost {
  messages = signal(['Hola']);
  busy = signal(false);
  typing = signal(false);
}

describe('CbChatMessages', () => {
  it('es un log nombrado, muestra "Escribiendo…" y anuncia la respuesta al terminar', async () => {
    const fixture = TestBed.createComponent(MessagesHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const log = el.querySelector('[role="log"]')!;
    expect(log.getAttribute('aria-label')).toBe('Conversación');

    fixture.componentInstance.typing.set(true);
    fixture.componentInstance.busy.set(true);
    fixture.detectChanges();
    expect(log.getAttribute('aria-busy')).toBe('true');
    expect(el.querySelector('.cb-chat-messages__typing')!.textContent).toContain('Escribiendo…');

    fixture.componentInstance.typing.set(false);
    fixture.componentInstance.busy.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(log.getAttribute('aria-busy')).toBeNull();
    expect(el.querySelector('.cb-chat-messages__status')!.textContent).toBe('Respuesta lista');
  });

  it('si el usuario sube, deja de seguir y ofrece ir al último mensaje', async () => {
    const fixture = TestBed.createComponent(MessagesHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const scroller = el.querySelector<HTMLElement>('.cb-chat-messages__scroller')!;
    Object.defineProperty(scroller, 'scrollHeight', { configurable: true, value: 1000 });
    Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 200 });
    scroller.scrollTop = 100;
    scroller.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    const jump = el.querySelector<HTMLButtonElement>('.cb-chat-messages__jump')!;
    expect(jump.textContent).toContain('Ir al último mensaje');
    jump.click();
    fixture.detectChanges();
    expect(el.querySelector('.cb-chat-messages__jump')).toBeNull();
  });
});

@Component({
  imports: [CbChatInput],
  template: `
    <cb-chat-input
      [(value)]="value"
      [(files)]="files"
      [streaming]="streaming()"
      [suggestions]="suggestions"
      attachments
      accept="image/*,.pdf"
      (send)="sent.push($event)"
      (stop)="stopped = stopped + 1"
    />
  `,
})
class InputHost {
  value = signal('');
  files = signal<readonly File[]>([]);
  streaming = signal(false);
  suggestions = ['¿Cuál es mi saldo?'];
  sent: CbChatSendEvent[] = [];
  stopped = 0;
}

describe('CbChatInput', () => {
  function setup() {
    const fixture = TestBed.createComponent(InputHost);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const textarea = () => el.querySelector<HTMLTextAreaElement>('textarea')!;
    const send = () => el.querySelector<HTMLButtonElement>('.cb-chat-input__send')!;
    const type = (text: string) => {
      textarea().value = text;
      textarea().dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    const key = (init: KeyboardEventInit) => {
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, ...init });
      textarea().dispatchEvent(event);
      fixture.detectChanges();
      return event;
    };
    return { fixture, el, textarea, send, type, key, host: fixture.componentInstance };
  }

  it('el campo y el botón tienen nombre; Enviar está desactivado sin texto', () => {
    const { textarea, send } = setup();
    expect(textarea().getAttribute('aria-label')).toBe('Mensaje');
    expect(send().getAttribute('aria-label')).toBe('Enviar');
    expect(send().disabled).toBe(true);
  });

  it('Enter envía el texto recortado y vacía el campo; Shift+Enter y la composición IME no envían', () => {
    const { type, key, host, send } = setup();
    type('  Hola  ');
    expect(send().disabled).toBe(false);
    expect(key({ shiftKey: true }).defaultPrevented).toBe(false);
    expect(key({ isComposing: true }).defaultPrevented).toBe(false);
    expect(host.sent).toHaveLength(0);
    expect(key({}).defaultPrevented).toBe(true);
    expect(host.sent).toEqual([{ text: 'Hola', files: [] }]);
    expect(host.value()).toBe('');
  });

  it('las sugerencias se muestran con el campo vacío y se envían al pulsarlas', () => {
    const { el, host, fixture } = setup();
    el.querySelector<HTMLButtonElement>('.cb-chat-input__suggestion')!.click();
    fixture.detectChanges();
    expect(host.sent[0].text).toBe('¿Cuál es mi saldo?');
  });

  it('adjunta archivos aceptados, permite quitarlos y los envía', () => {
    const { el, host, fixture, send } = setup();
    const input = el.querySelector<HTMLInputElement>('input[type="file"]')!;
    const pdf = new File(['%PDF'], 'extracto.pdf', { type: 'application/pdf' });
    const exe = new File(['MZ'], 'virus.exe', { type: 'application/octet-stream' });
    Object.defineProperty(input, 'files', { configurable: true, value: [pdf, exe] });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.files().map((f) => f.name)).toEqual(['extracto.pdf']);
    const remove = el.querySelector<HTMLButtonElement>('.cb-chat-input__file-remove')!;
    expect(remove.getAttribute('aria-label')).toBe('Quitar extracto.pdf');
    expect(send().disabled).toBe(false);
    send().click();
    fixture.detectChanges();
    expect(host.sent[0].files.map((f) => f.name)).toEqual(['extracto.pdf']);
    expect(host.files()).toHaveLength(0);
  });

  it('mientras se genera, Enviar pasa a Detener y emite stop', () => {
    const { el, host, fixture, type, key } = setup();
    host.streaming.set(true);
    fixture.detectChanges();
    type('otra');
    key({});
    expect(host.sent).toHaveLength(0);
    const stop = el.querySelector<HTMLButtonElement>('.cb-chat-input__send--stop')!;
    expect(stop.getAttribute('aria-label')).toBe('Detener');
    stop.click();
    expect(host.stopped).toBe(1);
  });
});
