/*
 * Resaltado de sintaxis propio de CaribeNG, ligero y sin dependencias.
 * Devuelve tokens (no HTML): quien los pinta decide cómo, sin innerHTML.
 * Lenguajes: TypeScript/JavaScript, HTML/XML (y plantillas Angular), CSS/SCSS,
 * JSON, Bash, Python y SQL. Un lenguaje desconocido se devuelve como texto.
 */

export type CbCodeTokenType =
  | 'plain'
  | 'keyword'
  | 'builtin'
  | 'string'
  | 'number'
  | 'comment'
  | 'function'
  | 'operator'
  | 'punctuation'
  | 'tag'
  | 'attr'
  | 'property'
  | 'variable';

export interface CbCodeToken {
  readonly type: CbCodeTokenType;
  readonly text: string;
}

/** Estado mínimo del tokenizador (p. ej. "dentro de una etiqueta HTML"). */
interface RuleState {
  /** Solo se aplica en este estado. */
  in?: string;
  /** Pasa a este estado tras coincidir. */
  enter?: string;
  /** Vuelve al estado inicial tras coincidir. */
  exit?: boolean;
}

type Rule = readonly [CbCodeTokenType, RegExp, RuleState?];

const words = (list: string) => new RegExp(`\\b(?:${list.trim().split(/\s+/).join('|')})\\b`, 'y');
const STRING_DQ = /"(?:\\.|[^"\\\n])*"?/y;
const STRING_SQ = /'(?:\\.|[^'\\\n])*'?/y;
const NUMBER = /\b(?:0x[\da-fA-F_]+|0b[01_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?n?)\b/y;
const SPACE = /\s+/y;

const JS: Rule[] = [
  ['comment', /\/\/.*/y],
  ['comment', /\/\*[\s\S]*?(?:\*\/|$)/y],
  ['string', /`(?:\\[\s\S]|[^`\\])*`?/y],
  ['string', STRING_DQ],
  ['string', STRING_SQ],
  ['keyword', /@[A-Za-z_]\w*/y],
  [
    'keyword',
    words(`abstract as async await break case catch class const constructor continue debugger declare default delete do else enum
      export extends finally for from function get if implements import in instanceof interface is keyof let namespace new of
      override private protected public readonly return satisfies set static super switch throw try type typeof var void while with yield`),
  ],
  ['builtin', words('true false null undefined this NaN Infinity console window document Math JSON Promise Array Object String Number Boolean Date Map Set Error any unknown never string number boolean symbol bigint')],
  ['number', NUMBER],
  ['function', /[A-Za-z_$][\w$]*(?=\s*(?:<[^>()]*>)?\()/y],
  ['variable', /[A-Za-z_$][\w$]*/y],
  ['operator', /=>|\?\?=?|\?\.|\.{3}|[=!]==?|[<>]=?|&&|\|\||[-+*/%&|^~!?:=]+/y],
  ['punctuation', /[{}()[\];,.<>]/y],
];

const HTML: Rule[] = [
  // Dentro de una etiqueta: atributos, valores y cierre.
  ['tag', /\/?>/y, { in: 'tag', exit: true }],
  ['string', /"[^"]*"?/y, { in: 'tag' }],
  ['string', /'[^']*'?/y, { in: 'tag' }],
  ['operator', /=/y, { in: 'tag' }],
  ['attr', /[^\s=/>"']+/y, { in: 'tag' }],
  // Fuera: comentarios, etiquetas, interpolación y bloques de control de Angular.
  ['comment', /<!--[\s\S]*?(?:-->|$)/y],
  ['keyword', /<!DOCTYPE[^>]*>/iy],
  ['tag', /<\/?[A-Za-z][\w:.-]*/y, { enter: 'tag' }],
  ['variable', /\{\{[\s\S]*?(?:\}\}|$)/y],
  ['keyword', /@(?:if|else if|else|for|empty|switch|case|default|defer|placeholder|loading|let)\b/y],
  ['plain', /[^<{@\s]+/y],
];

const CSS: Rule[] = [
  ['comment', /\/\*[\s\S]*?(?:\*\/|$)/y],
  ['comment', /\/\/.*/y],
  ['string', STRING_DQ],
  ['string', STRING_SQ],
  ['keyword', /@[\w-]+/y],
  ['variable', /--[\w-]+|\$[\w-]+/y],
  ['number', /#[\da-fA-F]{3,8}\b/y],
  ['number', /-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|%|vh|vw|vmin|vmax|s|ms|deg|fr|ch|ex|dvh|svh|lh)?\b/y],
  ['function', /[\w-]+(?=\()/y],
  ['property', /[\w-]+(?=\s*:(?!:))/y],
  ['keyword', words('!important important')],
  ['punctuation', /[{}()[\];:,>+~*]/y],
  ['plain', /[\w-]+|[.#&]/y],
];

const JSON_RULES: Rule[] = [
  ['property', /"(?:\\.|[^"\\\n])*"(?=\s*:)/y],
  ['string', STRING_DQ],
  ['number', /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y],
  ['builtin', words('true false null')],
  ['punctuation', /[{}[\]:,]/y],
];

const BASH: Rule[] = [
  ['comment', /#.*/y],
  ['string', STRING_DQ],
  ['string', STRING_SQ],
  ['variable', /\$\{[^}]*\}?|\$[\w@#?*!$-]/y],
  ['keyword', words('if then else elif fi for while until do done case esac in function return export local readonly unset source exit')],
  ['builtin', words('echo cd ls cat cp mv rm mkdir touch grep sed awk curl wget sudo npm npx pnpm yarn node ng nx git docker kubectl')],
  ['attr', /(?<=\s)--?[\w-]+/y],
  ['number', /\b\d+\b/y],
  ['operator', /&&|\|\||[|&;<>]+|=/y],
];

const PYTHON: Rule[] = [
  ['comment', /#.*/y],
  ['string', /[rbfu]{0,2}(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$))/iy],
  ['string', /[rbfu]{0,2}(?:"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)/iy],
  ['keyword', /@[A-Za-z_][\w.]*/y],
  ['keyword', words('and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case')],
  ['builtin', words('True False None self print len range dict list set tuple str int float bool open super isinstance enumerate zip map filter')],
  ['number', NUMBER],
  ['function', /[A-Za-z_]\w*(?=\s*\()/y],
  ['variable', /[A-Za-z_]\w*/y],
  ['operator', /\*\*=?|\/\/=?|->|[-+*/%@&|^~<>!=]=?/y],
  ['punctuation', /[{}()[\];,.:]/y],
];

const SQL: Rule[] = [
  ['comment', /--.*/y],
  ['comment', /\/\*[\s\S]*?(?:\*\/|$)/y],
  ['string', STRING_SQ],
  ['property', /"(?:[^"]|"")*"?/y],
  [
    'keyword',
    new RegExp(
      `\\b(?:${'select from where and or not insert into values update set delete create table alter drop index view join left right inner outer full on as group by order having limit offset distinct union all case when then else end is null in between like exists primary key foreign references default returning with desc asc'.split(' ').join('|')})\\b`,
      'iy',
    ),
  ],
  ['function', /[A-Za-z_]\w*(?=\s*\()/y],
  ['number', /\b\d+(?:\.\d+)?\b/y],
  ['operator', /<>|[<>!]=?|[-+*/%=|]+/y],
  ['punctuation', /[(),;.]/y],
];

const LANGUAGES: Record<string, Rule[]> = {
  ts: JS,
  typescript: JS,
  js: JS,
  javascript: JS,
  jsx: JS,
  tsx: JS,
  mjs: JS,
  html: HTML,
  xml: HTML,
  svg: HTML,
  angular: HTML,
  css: CSS,
  scss: CSS,
  sass: CSS,
  less: CSS,
  json: JSON_RULES,
  jsonc: JSON_RULES,
  bash: BASH,
  sh: BASH,
  shell: BASH,
  zsh: BASH,
  console: BASH,
  py: PYTHON,
  python: PYTHON,
  sql: SQL,
};

/** Nombre visible de un lenguaje ("ts" → "TypeScript"). */
export function cbCodeLanguageLabel(language: string): string {
  const key = language.toLowerCase();
  const names: Record<string, string> = {
    ts: 'TypeScript', typescript: 'TypeScript', tsx: 'TSX', js: 'JavaScript', javascript: 'JavaScript', jsx: 'JSX', mjs: 'JavaScript',
    html: 'HTML', xml: 'XML', svg: 'SVG', angular: 'Angular', css: 'CSS', scss: 'SCSS', sass: 'Sass', less: 'Less',
    json: 'JSON', jsonc: 'JSON', bash: 'Bash', sh: 'Shell', shell: 'Shell', zsh: 'Zsh', console: 'Consola',
    py: 'Python', python: 'Python', sql: 'SQL', text: 'Texto', txt: 'Texto', plaintext: 'Texto',
  };
  return names[key] ?? language;
}

/** Si hay reglas de resaltado para el lenguaje. */
export function cbCodeSupports(language: string): boolean {
  return !!LANGUAGES[language.toLowerCase()];
}

function tokenize(code: string, rules: readonly Rule[]): CbCodeToken[] {
  const tokens: CbCodeToken[] = [];
  const push = (type: CbCodeTokenType, text: string) => {
    const last = tokens[tokens.length - 1];
    if (last && last.type === type && (type === 'plain' || type === 'punctuation')) tokens[tokens.length - 1] = { type, text: last.text + text };
    else tokens.push({ type, text });
  };
  let pos = 0;
  let state: string | null = null;
  outer: while (pos < code.length) {
    SPACE.lastIndex = pos;
    const space = SPACE.exec(code);
    if (space) {
      push('plain', space[0]);
      pos += space[0].length;
      continue;
    }
    for (const [type, re, opts] of rules) {
      // Las reglas sin `in` solo valen en el estado inicial.
      if ((opts?.in ?? null) !== state) continue;
      re.lastIndex = pos;
      const m = re.exec(code);
      if (m && m[0].length) {
        push(type, m[0]);
        pos += m[0].length;
        if (opts?.enter) state = opts.enter;
        if (opts?.exit) state = null;
        continue outer;
      }
    }
    push('plain', code[pos]);
    pos++;
  }
  return tokens;
}

/**
 * Tokeniza `code` y lo reparte en líneas (los comentarios y strings de varias
 * líneas se parten en cada salto). Lenguaje desconocido = texto plano.
 */
export function cbHighlight(code: string, language = ''): CbCodeToken[][] {
  const source = (code ?? '').replace(/\r\n?/g, '\n');
  const rules = LANGUAGES[language.toLowerCase()];
  const tokens = rules ? tokenize(source, rules) : [{ type: 'plain' as const, text: source }];
  const lines: CbCodeToken[][] = [[]];
  for (const token of tokens) {
    const parts = token.text.split('\n');
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ type: token.type, text: part });
    });
  }
  return lines;
}

/** Interpreta `"1,3-5"` o `[1, 3, 4, 5]` como conjunto de números de línea. */
export function cbParseLineSet(value: string | readonly number[] | null | undefined): ReadonlySet<number> {
  if (!value) return new Set();
  if (Array.isArray(value)) return new Set(value);
  const set = new Set<number>();
  for (const part of String(value).split(',')) {
    const [a, b] = part.split('-').map((n) => Number(n.trim()));
    if (!Number.isFinite(a)) continue;
    const end = Number.isFinite(b) ? b : a;
    for (let n = Math.min(a, end); n <= Math.max(a, end); n++) set.add(n);
  }
  return set;
}
