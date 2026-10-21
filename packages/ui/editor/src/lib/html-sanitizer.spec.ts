import { describe, expect, it } from 'vitest';
import { cbHtmlToText, cbSanitizeHtml, isSafeUrl } from './html-sanitizer';

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
    expect(cbSanitizeHtml('<h5>Sub</h5>')).toBe('<h3>Sub</h3>');
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
