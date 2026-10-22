import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbChatReasoning } from './chat-reasoning.component';
import { CbChatTool } from './chat-tool.component';
import { cbMarkdownToBlocks } from './markdown';

describe('cbMarkdownToBlocks', () => {
  it('separa los bloques de código del nivel superior y deja el resto como HTML', () => {
    expect(cbMarkdownToBlocks('Antes\n```ts\nconst a = 1;\n```\nDespués')).toEqual([
      { kind: 'html', html: '<p>Antes</p>' },
      { kind: 'code', code: 'const a = 1;', language: 'ts' },
      { kind: 'html', html: '<p>Después</p>' },
    ]);
    // Dentro de una lista o cita sigue siendo HTML.
    expect(cbMarkdownToBlocks('> ```\n> x\n> ```')[0].kind).toBe('html');
    // Bloque sin cerrar (streaming) también se separa.
    expect(cbMarkdownToBlocks('```js\nconsole.log(1)')).toEqual([{ kind: 'code', code: 'console.log(1)', language: 'js' }]);
  });
});

describe('CbChatReasoning', () => {
  function setup(inputs: Record<string, unknown>) {
    const fixture = TestBed.createComponent(CbChatReasoning);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, el, toggle: () => el.querySelector<HTMLButtonElement>('button')! };
  }

  it('mientras llega se abre ("Pensando…", aria-busy) y al terminar se pliega con la duración', () => {
    const { fixture, el, toggle } = setup({ text: 'Busco los **movimientos**', streaming: true });
    expect(toggle().textContent).toContain('Pensando…');
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    const body = el.querySelector(`#${toggle().getAttribute('aria-controls')}`)!;
    expect(body.getAttribute('aria-busy')).toBe('true');
    expect(body.querySelector('strong')!.textContent).toBe('movimientos');

    fixture.componentRef.setInput('streaming', false);
    fixture.componentRef.setInput('duration', 4.6);
    fixture.detectChanges();
    expect(toggle().textContent).toContain('Razonó durante 5 s');
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    toggle().click();
    fixture.detectChanges();
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
  });
});

describe('CbChatTool', () => {
  function setup(inputs: Record<string, unknown>) {
    const fixture = TestBed.createComponent(CbChatTool);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, el, header: () => el.querySelector<HTMLButtonElement>('.cb-chat-tool__header')! };
  }

  it('el estado cambia el texto y el icono; al desplegar muestra entrada y resultado en JSON', () => {
    const { fixture, el, header } = setup({ name: 'buscar_movimientos', status: 'running', input: { cuenta: '4829' } });
    expect(header().textContent).toContain('Usando buscar_movimientos…');
    expect(el.querySelector('.cb-chat-tool__spinner')).not.toBeNull();

    fixture.componentRef.setInput('status', 'done');
    fixture.componentRef.setInput('output', '[{"valor": 120000}]');
    fixture.detectChanges();
    expect(header().textContent).toContain('Usó buscar_movimientos');
    expect(el.querySelector('.cb-chat-tool__status')!.textContent).toBe('Usó buscar_movimientos');
    expect(header().getAttribute('aria-expanded')).toBe('false');

    header().click();
    fixture.detectChanges();
    const blocks = el.querySelectorAll('cb-code-block');
    expect(blocks).toHaveLength(2);
    expect(blocks[0].querySelector('code')!.textContent).toBe('{\n  "cuenta": "4829"\n}'.replace(/\n/g, ''));
    expect(blocks[1].querySelector('.cb-tok-number')!.textContent).toBe('120000');
  });

  it('error y título propio', () => {
    const { header } = setup({ name: 'pagar', title: 'Pagar factura', status: 'error' });
    expect(header().textContent).toContain('Falló Pagar factura');
  });
});
