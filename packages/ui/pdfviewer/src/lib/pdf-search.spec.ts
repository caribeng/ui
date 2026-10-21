import { describe, expect, it } from 'vitest';
import { buildTextIndex, findMatches, highlightMatches, normalizeQuery } from './pdf-search';

describe('búsqueda en PDF', () => {
  it('normaliza tildes, mayúsculas, ligaduras y espacios', () => {
    expect(normalizeQuery('  Dirección   ÚNICA ')).toBe('direccion unica');
    expect(buildTextIndex([{ str: 'ﬁnanzas' }]).text).toBe('finanzas');
  });

  it('encuentra coincidencias que cruzan elementos y saltos de línea', () => {
    const index = buildTextIndex([{ str: 'Saldo ', hasEOL: false }, { str: 'dispo', hasEOL: false }, { str: 'nible', hasEOL: true }, { str: 'total' }]);
    expect(index.text).toBe('saldo disponible total');
    expect(findMatches(index, 'disponible total', 4)).toEqual([{ page: 4, start: { item: 1, offset: 0 }, end: { item: 3, offset: 5 } }]);
  });

  it('ignora el contenido marcado (sin str), como la capa de texto de pdf.js', () => {
    const index = buildTextIndex([{ str: 'uno' }, {}, { str: 'dos' }]);
    expect(findMatches(index, 'dos', 1)[0].start).toEqual({ item: 1, offset: 0 });
  });

  it('resalta varias coincidencias en un mismo elemento y restaura el texto', () => {
    const div = document.createElement('span');
    div.textContent = 'casa y casa';
    const index = buildTextIndex([{ str: 'casa y casa' }]);
    const matches = findMatches(index, 'casa', 1);
    const selected = highlightMatches([div], ['casa y casa'], matches, matches[1]);
    expect(div.innerHTML).toBe('<span class="cb-pdf__hl">casa</span> y <span class="cb-pdf__hl cb-is-selected">casa</span>');
    expect(selected?.textContent).toBe('casa');
    highlightMatches([div], ['casa y casa'], [], null);
    expect(div.innerHTML).toBe('casa y casa');
  });
});
