import { describe, expect, it } from 'vitest';
import { cbHtmlToText, cbSanitizeHtml, imageStyle, isSafeUrl, readImageStyle } from './html-sanitizer';

describe('cbSanitizeHtml', () => {
  it('elimina scripts, eventos y elementos peligrosos', () => {
    const dirty =
      '<p onclick="alert(1)">Hola<script>alert(1)</script></p>' +
      '<img src=x onerror="alert(1)">' +
      '<iframe src="https://evil.test"></iframe>' +
      '<svg onload="alert(1)"><circle /></svg>' +
      '<style>body{display:none}</style>' +
      '<form action="/x"><input value="y"></form>';
    const clean = cbSanitizeHtml(dirty);
    expect(clean).toBe('<p>Hola</p>');
    expect(clean).not.toMatch(/onerror|onclick|script|iframe|svg|style|form|input/i);
  });

  it('quita URLs peligrosas en enlaces e imágenes, y conserva las seguras', () => {
    expect(cbSanitizeHtml('<p><a href="javascript:alert(1)">x</a></p>')).toBe('<p>x</p>');
    expect(cbSanitizeHtml('<p><a href=" JaVaScRiPt:alert(1)">x</a></p>')).toBe('<p>x</p>');
    expect(cbSanitizeHtml('<p><a href="java&#x09;script:alert(1)">x</a></p>')).toBe('<p>x</p>');
    expect(cbSanitizeHtml('<p><a href="data:text/html,<script>">x</a></p>')).toBe('<p>x</p>');
    expect(cbSanitizeHtml('<p><a href="https://banco.co" target="_blank">ok</a></p>')).toBe(
      '<p><a href="https://banco.co" target="_blank" rel="noopener noreferrer">ok</a></p>',
    );
    expect(cbSanitizeHtml('<p><a href="mailto:a@b.co">a</a></p>')).toContain('href="mailto:a@b.co"');
    expect(cbSanitizeHtml('<img src="data:image/svg+xml;base64,PHN2Zz4=">')).toBe('');
    expect(cbSanitizeHtml('<img src="data:image/png;base64,iVBORw0KGgo=" alt="logo">')).toBe(
      '<p><img src="data:image/png;base64,iVBORw0KGgo=" alt="logo"></p>',
    );
    expect(cbSanitizeHtml('<p>a<img src="https://cdn.test/a.png">b</p>', { images: false })).toBe('<p>ab</p>');
  });

  it('normaliza etiquetas equivalentes y agrupa el texto suelto en párrafos', () => {
    expect(cbSanitizeHtml('<b>uno</b> <i>dos</i> <strike>tres</strike>')).toBe('<p><strong>uno</strong> <em>dos</em> <s>tres</s></p>');
    expect(cbSanitizeHtml('<div>uno</div><div>dos</div>')).toBe('<p>uno</p><p>dos</p>');
    expect(cbSanitizeHtml('<h5>Sub</h5>')).toBe('<h4>Sub</h4>');
    expect(cbSanitizeHtml('<h4>Cuatro</h4>')).toBe('<h4>Cuatro</h4>');
    expect(cbSanitizeHtml('<ul><li>a</li><li>b</li></ul>')).toBe('<ul><li>a</li><li>b</li></ul>');
  });

  it('conserva solo la alineación de los estilos', () => {
    expect(cbSanitizeHtml('<p style="text-align: center; color: red; font-size: 40px">t</p>')).toBe('<p style="text-align: center">t</p>');
    expect(cbSanitizeHtml('<p style="position: fixed">t</p>')).toBe('<p>t</p>');
  });

  it('limpia lo que pega Word y convierte los estilos de Google Docs en etiquetas', () => {
    const word =
      '<!--[if gte mso 9]><xml><o:OfficeDocumentSettings/></xml><![endif]-->' +
      '<p class="MsoNormal" style="mso-margin-top-alt:auto"><span lang="ES" style="font-family:Calibri">Texto<o:p></o:p></span></p>';
    expect(cbSanitizeHtml(word)).toBe('<p>Texto</p>');
    const docs = '<b style="font-weight:normal" id="docs-internal-guid-1"><span style="font-weight:700">Negrita</span> <span style="font-style:italic">cursiva</span></b>';
    expect(cbSanitizeHtml(docs)).toBe('<p><strong>Negrita</strong> <em>cursiva</em></p>');
    expect(cbSanitizeHtml('<p><b>a <strong>b</strong></b></p>')).toBe('<p><strong>a b</strong></p>');
  });

  it('devuelve "" cuando no hay contenido (para Validators.required)', () => {
    expect(cbSanitizeHtml('')).toBe('');
    expect(cbSanitizeHtml('<p><br></p>')).toBe('');
    expect(cbSanitizeHtml('<p>&nbsp;</p><div><br></div>')).toBe('');
    expect(cbSanitizeHtml('<br>')).toBe('');
    expect(cbSanitizeHtml('<hr>')).toBe('<hr>');
  });

  it('el saneado es estable: sanear dos veces da lo mismo', () => {
    const html = '<h2>T</h2><p>a <a href="https://x.co">b</a></p><ul><li>c</li></ul><blockquote>d</blockquote><p><br></p><p>e</p>';
    const once = cbSanitizeHtml(html);
    expect(cbSanitizeHtml(once)).toBe(once);
  });
});

describe('isSafeUrl y cbHtmlToText', () => {
  it('acepta http, https, mailto, tel y rutas relativas', () => {
    for (const ok of ['https://a.co', 'http://a.co/x?y=1', 'mailto:a@b.co', 'tel:+573001234567', '/ayuda', '#seccion', './doc']) {
      expect(isSafeUrl(ok)).toBe(true);
    }
    for (const bad of ['javascript:alert(1)', 'vbscript:x', 'data:text/html,x', '//evil.test', 'file:///etc/passwd', '']) {
      expect(isSafeUrl(bad)).toBe(false);
    }
  });

  it('extrae el texto con saltos entre bloques', () => {
    expect(cbHtmlToText('<h2>Título</h2><p>Hola <strong>mundo</strong></p><ul><li>a</li><li>b</li></ul>')).toBe('Título\nHola mundo\na\nb');
  });
});

describe('código, tablas e imágenes', () => {
  it('lo que copia VS Code se convierte en un bloque de código con sus colores', () => {
    const vscode =
      `<div style="color: #cccccc;background-color: #1f1f1f;font-family: Consolas, 'Courier New', monospace;font-weight: normal;font-size: 14px;line-height: 19px;white-space: pre;">` +
      '<div><span style="color: #569cd6;">const</span><span style="color: #cccccc;"> </span><span style="color: #4fc1ff;">total</span><span style="color: #cccccc;"> = </span><span style="color: #b5cea8;">42</span><span style="color: #cccccc;">;</span></div>' +
      '<br>' +
      '<div><span style="color: #c586c0;font-style: italic;">return</span><span style="color: #cccccc;"> total;</span></div>' +
      '</div>';
    const clean = cbSanitizeHtml(vscode);
    expect(clean).toBe(
      '<pre style="color: #cccccc; background-color: #1f1f1f"><code>' +
        '<span style="color: #569cd6">const</span><span style="color: #cccccc"> </span><span style="color: #4fc1ff">total</span><span style="color: #cccccc"> = </span><span style="color: #b5cea8">42</span><span style="color: #cccccc">;</span>\n' +
        '\n' +
        '<span style="color: #c586c0; font-style: italic">return</span><span style="color: #cccccc"> total;</span>' +
        '</code></pre>',
    );
    // El texto se conserva tal cual, con sus líneas y espacios.
    expect(cbHtmlToText(clean)).toBe('const total = 42;\n\nreturn total;');
  });

  it('en el código no entran colores con url() ni expresiones', () => {
    const clean = cbSanitizeHtml('<pre style="background: url(https://evil.test/x.png); color: expression(alert(1))"><span style="color: url(x)">a</span><b onclick="x()">b</b></pre>');
    expect(clean).toBe('<pre><code>ab</code></pre>');
  });

  it('las tablas se conservan y se completan las celdas que faltan', () => {
    const clean = cbSanitizeHtml(
      '<table border="1" class="x" style="width:100%"><thead><tr><th>Mes</th><th>Saldo</th></tr></thead>' +
        '<tbody><tr><td onclick="x()">Ene</td><td style="text-align:right">10</td></tr><tr><td>Feb</td></tr></tbody></table>',
    );
    expect(clean).toBe(
      '<table style="width: 100%"><thead><tr><th scope="col">Mes</th><th scope="col">Saldo</th></tr></thead>' +
        '<tbody><tr><td>Ene</td><td style="text-align: right">10</td></tr><tr><td>Feb</td><td></td></tr></tbody></table>',
    );
    // Filas sueltas pasan a un <tbody>; partes de tabla fuera de una tabla, a texto.
    expect(cbSanitizeHtml('<table><tr><td>a</td></tr></table>')).toBe('<table><tbody><tr><td>a</td></tr></tbody></table>');
    expect(cbSanitizeHtml('<td>suelta</td>')).toBe('<p>suelta</p>');
    // Bordes y fondo de celda: solo valores seguros.
    expect(
      cbSanitizeHtml('<table style="border-collapse: collapse; position: absolute"><tbody><tr><td style="border: 1px solid #344054; color: red">a</td><td style="border: 1px solid url(x)">b</td><td style="border-bottom: 2px dashed rgb(0, 0, 0); background-color: #f2f4f7">c</td></tr></tbody></table>'),
    ).toBe(
      '<table style="border-collapse: collapse"><tbody><tr><td style="border: 1px solid #344054">a</td><td>b</td><td style="border-bottom: 2px dashed rgb(0, 0, 0); background-color: #f2f4f7">c</td></tr></tbody></table>',
    );
    expect(cbSanitizeHtml('<table><tbody><tr><td><br></td><td>&nbsp;</td></tr></tbody></table>')).toBe('<table><tbody><tr><td></td><td></td></tr></tbody></table>');
  });

  it('imágenes: solo ancho y alineación, normalizados', () => {
    expect(cbSanitizeHtml('<img src="https://a.co/x.png" style="width: 50%; float: left; position: fixed; top: 0" width="800">')).toBe(
      '<p><img src="https://a.co/x.png" style="width: 50%; height: auto; float: left; margin: 0 1rem 0.5rem 0"></p>',
    );
    expect(readImageStyle(imageStyle('320px', 'center'))).toEqual({ width: '320px', align: 'center' });
    expect(readImageStyle('width: calc(100% - 1px); float: none')).toEqual({ width: null, align: null });
  });
});

describe('color, tamaño, sangría y tareas', () => {
  it('conserva el color, el resaltado y el tamaño en un <span> (y nada más)', () => {
    expect(cbSanitizeHtml('<p><span style="color: #dc2626; position: absolute">rojo</span></p>')).toBe('<p><span style="color: #dc2626">rojo</span></p>');
    expect(cbSanitizeHtml('<p><span style="background-color: rgb(254, 240, 138)">marcado</span></p>')).toBe(
      '<p><span style="background-color: rgb(254, 240, 138)">marcado</span></p>',
    );
    expect(cbSanitizeHtml('<p><span style="background-color: transparent">x</span></p>')).toBe('<p>x</p>');
    expect(cbSanitizeHtml('<p><span style="color: url(x)">x</span></p>')).toBe('<p>x</p>');
    // <font> de execCommand: color y tamaño 1–7 → px.
    expect(cbSanitizeHtml('<p><font color="#2563eb" size="6">grande</font></p>')).toBe('<p><span style="color: #2563eb; font-size: 32px">grande</span></p>');
    expect(cbSanitizeHtml('<p><span style="font-size: x-large">a</span><span style="font-size: 200px">b</span></p>')).toBe(
      '<p><span style="font-size: 24px">a</span>b</p>',
    );
  });

  it('tamaño en px (8–96): los pt de Word se convierten y los em se conservan', () => {
    expect(cbSanitizeHtml('<p><span style="font-size: 18px">a</span></p>')).toBe('<p><span style="font-size: 18px">a</span></p>');
    expect(cbSanitizeHtml('<p><span style="font-size: 12pt">a</span></p>')).toBe('<p><span style="font-size: 16px">a</span></p>');
    expect(cbSanitizeHtml('<p><span style="font-size: 1.5em">a</span></p>')).toBe('<p><span style="font-size: 1.5em">a</span></p>');
    expect(cbSanitizeHtml('<p><span style="font-size: 4px">a</span><span style="font-size: calc(1px + 9em)">b</span></p>')).toBe('<p>ab</p>');
  });

  it('tipografía: solo las permitidas, guardadas con su pila completa', () => {
    expect(cbSanitizeHtml(`<p><span style="font-family: &quot;Source Sans 3&quot;">a</span></p>`)).toBe(
      `<p><span style="font-family: 'Source Sans 3', sans-serif">a</span></p>`,
    );
    expect(cbSanitizeHtml('<p><font face="Lora">a</font></p>')).toBe('<p><span style="font-family: Lora, serif">a</span></p>');
    // La de Google Docs o Word que no está en la lista se quita.
    expect(cbSanitizeHtml('<p><span style="font-family: Arial; color: red">a</span></p>')).toBe('<p><span style="color: red">a</span></p>');
    expect(cbSanitizeHtml('<p><span style="font-family: expression(alert(1))">a</span></p>')).toBe('<p>a</p>');
    // Lista propia.
    expect(cbSanitizeHtml('<p><span style="font-family: Marca, sans-serif">a</span></p>', { fonts: ['Marca, sans-serif'] })).toBe(
      '<p><span style="font-family: Marca, sans-serif">a</span></p>',
    );
    expect(cbSanitizeHtml('<p><span style="font-family: Lora">a</span></p>', { fonts: ['Marca, sans-serif'] })).toBe('<p>a</p>');
  });

  it('la sangría de los bloques va en pasos de 2rem (hasta 10rem)', () => {
    expect(cbSanitizeHtml('<p style="margin-left: 4rem; text-align: center">a</p>')).toBe('<p style="text-align: center; margin-left: 4rem">a</p>');
    expect(cbSanitizeHtml('<p style="margin-left: 40rem">a</p>')).toBe('<p style="margin-left: 10rem">a</p>');
    expect(cbSanitizeHtml('<p style="margin-left: 30px">a</p>')).toBe('<p>a</p>');
  });

  it('lista de tareas: data-type y data-checked válidos; cada tarea lleva su estado', () => {
    expect(cbSanitizeHtml('<ul data-type="taskList"><li data-checked="true">Hecho</li><li>Pendiente</li></ul>')).toBe(
      '<ul data-type="taskList"><li data-checked="true">Hecho</li><li data-checked="false">Pendiente</li></ul>',
    );
    expect(cbSanitizeHtml('<ul data-type="evil"><li data-checked="x">a</li></ul>')).toBe('<ul><li>a</li></ul>');
  });
});
