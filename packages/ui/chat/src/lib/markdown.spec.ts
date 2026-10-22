import { describe, expect, it } from 'vitest';
import { cbMarkdownToHtml, cbSafeUrl } from './markdown';

describe('cbMarkdownToHtml', () => {
  it('escapa todo el HTML de entrada (nunca lo interpreta)', () => {
    const html = cbMarkdownToHtml('<script>alert(1)</script> <img src=x onerror="alert(1)"> & "comillas"');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp; &quot;comillas&quot;');
  });

  it('solo enlaza URLs seguras y abre las externas en otra pestaña', () => {
    expect(cbMarkdownToHtml('[sitio](https://caribeng.dev)')).toBe(
      '<p><a href="https://caribeng.dev" target="_blank" rel="noopener noreferrer">sitio</a></p>',
    );
    expect(cbMarkdownToHtml('[ruta](/cuentas)')).toBe('<p><a href="/cuentas">ruta</a></p>');
    expect(cbMarkdownToHtml('[mal](javascript:alert(1))')).not.toContain('<a');
    expect(cbMarkdownToHtml('[mal](data:text/html,hola)')).not.toContain('<a');
    expect(cbMarkdownToHtml('[mal](//evil.com)')).not.toContain('<a');
    expect(cbMarkdownToHtml('[x](https://a.com" onclick="alert(1))')).not.toContain('onclick="');
    expect(cbSafeUrl('mailto:hola@caribeng.dev')).toBe('mailto:hola@caribeng.dev');
    expect(cbSafeUrl('vbscript:x')).toBeNull();
  });

  it('formatea énfasis, código en línea y URLs sueltas', () => {
    expect(cbMarkdownToHtml('**negrita**, *cursiva*, *a*, ~~tachado~~ y `x < y`')).toBe(
      '<p><strong>negrita</strong>, <em>cursiva</em>, <em>a</em>, <del>tachado</del> y <code>x &lt; y</code></p>',
    );
    expect(cbMarkdownToHtml('`**no**`')).toBe('<p><code>**no**</code></p>');
    expect(cbMarkdownToHtml('Ver https://caribeng.dev.')).toContain('<a href="https://caribeng.dev" target="_blank" rel="noopener noreferrer">https://caribeng.dev</a>.');
    expect(cbMarkdownToHtml('[usa `npm i`](https://npmjs.com)')).toContain('<code>npm i</code>');
  });

  it('párrafos con saltos de línea, encabezados, citas y separadores', () => {
    expect(cbMarkdownToHtml('línea 1\nlínea 2\n\notro')).toBe('<p>línea 1<br>línea 2</p><p>otro</p>');
    expect(cbMarkdownToHtml('## Resumen')).toBe('<h2>Resumen</h2>');
    expect(cbMarkdownToHtml('> cita\n> **dos**')).toBe('<blockquote><p>cita<br><strong>dos</strong></p></blockquote>');
    expect(cbMarkdownToHtml('---')).toBe('<hr />');
  });

  it('listas con viñetas, numeradas, de tareas y anidadas', () => {
    expect(cbMarkdownToHtml('- uno\n- dos')).toBe('<ul><li>uno</li><li>dos</li></ul>');
    expect(cbMarkdownToHtml('3. tres\n4. cuatro')).toBe('<ol start="3"><li>tres</li><li>cuatro</li></ol>');
    expect(cbMarkdownToHtml('- [x] hecho\n- [ ] pendiente')).toBe(
      '<ul><li class="cb-md-task"><span class="cb-md-check">☑</span> hecho</li><li class="cb-md-task"><span class="cb-md-check">☐</span> pendiente</li></ul>',
    );
    expect(cbMarkdownToHtml('- padre\n  - hijo')).toBe('<ul><li>padre<ul><li>hijo</li></ul></li></ul>');
  });

  it('bloques de código con lenguaje, también sin cerrar (streaming)', () => {
    expect(cbMarkdownToHtml('```ts\nconst a = 1 < 2;\n```')).toBe(
      '<pre><span class="cb-md-lang">ts</span><code class="language-ts">const a = 1 &lt; 2;</code></pre>',
    );
    expect(cbMarkdownToHtml('Mira:\n```js\nconsole.log(1)')).toBe(
      '<p>Mira:</p><pre><span class="cb-md-lang">js</span><code class="language-js">console.log(1)</code></pre>',
    );
  });

  it('tablas con alineación', () => {
    expect(cbMarkdownToHtml('| Mes | Saldo |\n|:--|--:|\n| Ene | $ 10 |')).toBe(
      '<div class="cb-md-table"><table><thead><tr><th class="cb-md-left">Mes</th><th class="cb-md-right">Saldo</th></tr></thead>' +
        '<tbody><tr><td class="cb-md-left">Ene</td><td class="cb-md-right">$ 10</td></tr></tbody></table></div>',
    );
  });
});
