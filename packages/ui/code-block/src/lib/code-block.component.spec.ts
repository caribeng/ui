import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbCodeBlock } from './code-block.component';
import { cbHighlight, cbParseLineSet } from './highlight';

const types = (code: string, lang: string) =>
  cbHighlight(code, lang)
    .flat()
    .filter((t) => t.type !== 'plain')
    .map((t) => `${t.type}:${t.text}`);

describe('cbHighlight', () => {
  it('TypeScript: palabras clave, strings, números, funciones, comentarios y decoradores', () => {
    expect(types("@Component({}) export const total = sumar(1, 'a'); // fin", 'ts')).toEqual([
      'keyword:@Component',
      'punctuation:({})',
      'keyword:export',
      'keyword:const',
      'variable:total',
      'operator:=',
      'function:sumar',
      'punctuation:(',
      'number:1',
      'punctuation:,',
      "string:'a'",
      'punctuation:);',
      'comment:// fin',
    ]);
  });

  it('HTML: etiquetas, atributos y valores; el texto entre etiquetas queda sin color', () => {
    expect(types('<cb-button [disabled]="x" (click)="ir()">Hola mundo</cb-button>', 'html')).toEqual([
      'tag:<cb-button',
      'attr:[disabled]',
      'operator:=',
      'string:"x"',
      'attr:(click)',
      'operator:=',
      'string:"ir()"',
      'tag:>',
      'tag:</cb-button',
      'tag:>',
    ]);
  });

  it('CSS, JSON y Bash', () => {
    expect(types('.a { color: #fff; --x: 2rem; }', 'css')).toEqual(
      expect.arrayContaining(['property:color', 'number:#fff', 'variable:--x', 'number:2rem']),
    );
    expect(types('{ "ok": true, "n": 2 }', 'json')).toEqual(['punctuation:{', 'property:"ok"', 'punctuation::', 'builtin:true', 'punctuation:,', 'property:"n"', 'punctuation::', 'number:2', 'punctuation:}']);
    expect(types('npm install --save @caribeng/ui # hola', 'bash')).toEqual(expect.arrayContaining(['builtin:npm', 'attr:--save', 'comment:# hola']));
  });

  it('parte en líneas los tokens de varias líneas y deja el lenguaje desconocido como texto', () => {
    const lines = cbHighlight('/* uno\ndos */\nx', 'js');
    expect(lines).toHaveLength(3);
    expect(lines[0][0]).toEqual({ type: 'comment', text: '/* uno' });
    expect(lines[1][0]).toEqual({ type: 'comment', text: 'dos */' });
    expect(cbHighlight('<b>x</b>', 'brainfuck')).toEqual([[{ type: 'plain', text: '<b>x</b>' }]]);
  });

  it('cbParseLineSet acepta rangos y listas', () => {
    expect([...cbParseLineSet('1, 3-5')]).toEqual([1, 3, 4, 5]);
    expect([...cbParseLineSet([2, 4])]).toEqual([2, 4]);
  });
});

describe('CbCodeBlock', () => {
  function setup(inputs: Record<string, unknown>) {
    const fixture = TestBed.createComponent(CbCodeBlock);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('pinta el código como texto (no HTML), con cabecera, copiar y región enfocable', () => {
    const el = setup({ code: '<script>alert(1)</script>\n', language: 'html' });
    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('code')!.textContent).toBe('<script>alert(1)</script>');
    expect(el.querySelector('.cb-code-block__title')!.textContent!.trim()).toBe('HTML');
    expect(el.querySelector('cb-copy-button')).not.toBeNull();
    const pre = el.querySelector('pre')!;
    expect(pre.getAttribute('tabindex')).toBe('0');
    expect(pre.getAttribute('aria-label')).toBe('HTML');
  });

  it('números de línea (ocultos al lector), inicio propio y líneas destacadas', () => {
    const el = setup({ code: 'a\nb\nc', language: 'ts', filename: 'app.ts', lineNumbers: true, startLine: 10, highlightLines: '11' });
    expect(el.querySelector('.cb-code-block__title')!.textContent!.trim()).toBe('app.ts');
    const numbers = Array.from(el.querySelectorAll('.cb-code-block__ln'));
    expect(numbers.map((n) => n.textContent)).toEqual(['10', '11', '12']);
    expect(numbers[0].getAttribute('aria-hidden')).toBe('true');
    const lines = el.querySelectorAll('.cb-code-block__line');
    expect(lines[1].classList).toContain('cb-code-block__line--hl');
    expect(lines[0].classList).not.toContain('cb-code-block__line--hl');
  });

  it('sin cabecera ni copiar cuando se desactivan', () => {
    const el = setup({ code: 'x', header: false });
    expect(el.querySelector('.cb-code-block__header')).toBeNull();
  });
});
