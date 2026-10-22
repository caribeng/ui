import * as ts from 'typescript';
import { TODO_MARK } from '../todo';
import { SIZE_VALUES, adaptEvent, drop, event, numeric, rename, styleClass, unsupported, values } from './rules';
import { propertyName } from './service-calls';
import type { AttrRule, ComponentMapping, Restructure, SourceRewriter, TemplateNode } from './types';

/** Plantillas de p-table que se trasladan; con cualquier otra la tabla se deja para migrar a mano. */
const KNOWN_TEMPLATES = new Set(['header', 'body', 'emptymessage', 'rowexpansion', 'caption', 'summary', 'loadingbody']);

const NO_INITIAL_SORT = 'cb-table empieza sin orden; el usuario ordena desde la cabecera.';
const NO_PAGINATOR_OPTION = 'cb-table usa su propio paginador.';

/** Atributos de `<p-table>` → `<cb-table>`. */
const TABLE_RULES: Record<string, AttrRule> = {
  rows: numeric(),
  totalRecords: numeric(),
  stripedRows: rename('striped'),
  size: values('size', SIZE_VALUES),
  styleClass: styleClass(),
  // Las columnas se generan a partir de las plantillas.
  columns: drop(),
  scrollable: drop(),
  responsiveLayout: drop(),
  breakpoint: drop(),
  rowTrackBy: drop(),
  lazyLoadOnInit: drop(),
  loadingIcon: drop(),
  showLoader: drop(),
  metaKeySelection: drop(),
  compareSelectionBy: drop(),
  filterDelay: drop(),
  filterLocale: drop(),
  groupRowsByOrder: drop(),
  rowGroupMode: (binding, el) => {
    if (!(binding.kind === 'static' && binding.value === 'subheader')) el.todos.push(`${binding.source} — cb-table agrupa con cabeceras de grupo (groupRowsBy).`);
  },
  pageLinks: drop(),
  alwaysShowPaginator: drop(),
  paginatorPosition: unsupported(NO_PAGINATOR_OPTION),
  paginatorStyleClass: drop(),
  paginatorDropdownAppendTo: drop(),
  paginatorDropdownScrollHeight: drop(),
  paginatorLocale: drop(),
  currentPageReportTemplate: unsupported(NO_PAGINATOR_OPTION),
  showCurrentPageReport: drop(),
  showJumpToPageDropdown: drop(),
  showJumpToPageInput: drop(),
  showFirstLastIcon: drop(),
  showPageLinks: drop(),
  first: unsupported('cb-table empieza en la primera página.'),
  tableStyle: unsupported('ajusta el ancho mínimo con CSS sobre cb-table.'),
  tableStyleClass: unsupported('aplica las clases a cb-table.'),
  style: unsupported('personaliza la tabla con los tokens CSS de CaribeNG.'),
  showGridlines: unsupported('cb-table no tiene modo con todas las líneas; usa striped o tokens CSS.'),
  sortField: unsupported(NO_INITIAL_SORT),
  sortOrder: unsupported(NO_INITIAL_SORT),
  defaultSortOrder: unsupported(NO_INITIAL_SORT),
  sortMode: unsupported('cb-table ordena por una columna a la vez.'),
  multiSortMeta: unsupported('cb-table ordena por una columna a la vez.'),
  resetPageOnSort: drop(),
  customSort: unsupported('cb-table ordena por el valor de la columna.'),
  expandedRowKeys: unsupported('cb-table usa un array de claves en [(expandedRowKeys)], no un objeto { clave: true }.'),
  rowExpandMode: unsupported('cb-table permite varias filas expandidas.'),
  editMode: unsupported('cb-table no tiene edición en celda; usa controles en un cbTableCell.'),
  editingRowKeys: unsupported('cb-table no tiene edición en celda.'),
  virtualScroll: unsupported('cb-table pagina o usa scrollHeight; no tiene scroll virtual.'),
  virtualScrollItemSize: unsupported('cb-table no tiene scroll virtual.'),
  virtualScrollOptions: unsupported('cb-table no tiene scroll virtual.'),
  frozenColumns: unsupported('marca las columnas con frozen: true.'),
  frozenValue: unsupported('cb-table no tiene filas fijas.'),
  contextMenu: unsupported('cb-table no tiene menú contextual de fila; envuélvela en un <cb-contextmenu>.'),
  contextMenuSelection: unsupported('cb-table no tiene menú contextual de fila.'),
  reorderableColumns: unsupported('cb-table no permite reordenar columnas.'),
  csvSeparator: unsupported('pásalo en exportCSV(nombre, { separator }).'),
  exportFilename: unsupported('pásalo en exportCSV(nombre).'),
  exportHeader: unsupported('cb-table exporta el header de cada columna.'),
  exportFunction: unsupported('cb-table exporta el valor de cada columna.'),
  filters: unsupported('cb-table filtra por columna con filter: true.'),
  stateKey: unsupported('cb-table no guarda su estado.'),
  stateStorage: unsupported('cb-table no guarda su estado.'),
  rowSelectable: unsupported('cb-table permite seleccionar todas las filas.'),
  selectionPageOnly: unsupported('cb-table selecciona sobre todos los datos.'),
  '(onSort)': event('sortChange'),
  '(onLazyLoad)': event('lazyLoad', () => null),
  '(onRowExpand)': event('rowExpand', adaptEvent('data')),
  '(onRowCollapse)': event('rowCollapse', adaptEvent('data')),
  '(onRowSelect)': unsupported('escucha (selectionChange).'),
  '(onRowUnselect)': unsupported('escucha (selectionChange).'),
  '(onFilter)': unsupported('escucha (filterChange) (recibe { global, columns }).'),
  '(onPage)': unsupported('escucha (rowsChange) o usa lazy + (lazyLoad).'),
  '(firstChange)': unsupported('cb-table no expone la primera fila visible.'),
  '(onColResize)': unsupported('escucha (columnResize) (recibe { field, width }).'),
  '(onContextMenuSelect)': unsupported('cb-table no tiene menú contextual de fila.'),
  '(onEditInit)': unsupported('cb-table no tiene edición en celda.'),
  '(onEditComplete)': unsupported('cb-table no tiene edición en celda.'),
  '(onEditCancel)': unsupported('cb-table no tiene edición en celda.'),
  '(sortFunction)': unsupported('cb-table ordena por el valor de la columna.'),
};

/** Hijos que cuentan (sin el espacio en blanco). */
function significant(node: TemplateNode): TemplateNode[] {
  return node.children.filter((child) => child.kind !== 'text' || child.inner.trim() !== '');
}

/** Nombre de la plantilla: `#header` o `pTemplate="header"`. */
function templateName(node: TemplateNode): string | undefined {
  if (node.name !== 'ng-template') return undefined;
  return node.attrs.find((a) => /^#/.test(a.name))?.name.slice(1) ?? node.bindings.find((b) => b.kind === 'static' && b.name === 'pTemplate')?.value;
}

/** `let-producto` → `producto` (la variable de la fila). */
function rowVariable(template: TemplateNode): string | undefined {
  return template.attrs.find((a) => a.name.startsWith('let-') && (a.value === '' || a.value === '$implicit'))?.name.slice(4);
}

/** Otras variables de la plantilla (`let-i="rowIndex"`, `let-expanded="expanded"`). */
function otherVariables(template: TemplateNode): string[] {
  return template.attrs.filter((a) => a.name.startsWith('let-') && a.value !== '' && a.value !== '$implicit').map((a) => a.name.slice(4));
}

/** El único `<tr>` de una plantilla, o `null`. */
function singleRow(template: TemplateNode): TemplateNode | null {
  const rows = significant(template);
  return rows.length === 1 && rows[0].name === 'tr' ? rows[0] : null;
}

/** `'texto'` con comillas escapadas para un literal dentro de un atributo con comillas dobles. */
function quote(text: string): string {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;')}'`;
}

/** Texto con interpolaciones → expresión: `Total ({{ n }})` → `'Total (' + (n) + ')'`. */
function textExpression(text: string): string {
  const parts: string[] = [];
  let last = 0;
  for (const match of text.matchAll(/\{\{([\s\S]*?)\}\}/g)) {
    if (match.index! > last) parts.push(quote(text.slice(last, match.index)));
    parts.push(`(${match[1].trim()})`);
    last = match.index! + match[0].length;
  }
  if (last < text.length) parts.push(quote(text.slice(last)));
  return parts.join(' + ') || "''";
}

const SORT_ICON = /<p-sort-?[Ii]con\b[^>]*?(?:\/>|>\s*<\/p-sort-?[Ii]con>)/g;
const COLUMN_FILTER = /<p-column-?[Ff]ilter\b([^>]*?)(?:\/>|>[\s\S]*?<\/p-column-?[Ff]ilter>)/g;

/** `{ field: 'code', header: 'Código', sortable: true }` de una columna. */
interface Column {
  field: string;
  header: string;
  sortable: boolean;
  filter: boolean;
  matchMode?: string;
  width?: string;
  frozen: boolean;
}

function columnLiteral(col: Column): string {
  const props = [`field: ${quote(col.field)}`, `header: ${col.header}`];
  if (col.sortable) props.push('sortable: true');
  if (col.filter) props.push('filter: true');
  if (col.matchMode) props.push(`filterMatchMode: ${quote(col.matchMode)}`);
  if (col.width) props.push(`width: ${quote(col.width)}`);
  if (col.frozen) props.push('frozen: true');
  return `{ ${props.join(', ')} }`;
}

function isFrozen(node: TemplateNode): boolean {
  return node.bindings.some((b) => b.name === 'pFrozenColumn' && (b.kind === 'static' || b.value.trim() === 'true'));
}

/** Contenido de `<tr><td …>contenido</td></tr>` (filas de mensaje vacío y de expansión). */
function singleCellContent(template: TemplateNode): string | null {
  const row = singleRow(template);
  const cells = row ? significant(row) : [];
  return cells.length === 1 && cells[0].name === 'td' ? cells[0].inner.trim() : null;
}

/** Quita la sangría común de las líneas (la primera ya viene sin espacios al inicio). */
function dedent(content: string): string {
  const lines = content.split(/\r?\n/);
  const rest = lines.slice(1).filter((line) => line.trim());
  if (!rest.length) return content;
  const common = Math.min(...rest.map((line) => /^[ \t]*/.exec(line)![0].length));
  return [lines[0], ...lines.slice(1).map((line) => line.slice(Math.min(common, /^[ \t]*/.exec(line)![0].length)))].join(content.includes('\r\n') ? '\r\n' : '\n');
}

function todoComment(message: string): string {
  return `<!-- ${TODO_MARK}: ${message.replace(/--+/g, '-').replace(/\s+/g, ' ')} -->`;
}

/** Plantilla de una celda personalizada: `<ng-template cbTableCell="campo" let-fila [let-col="col"]>`. */
interface CellTemplate {
  readonly field: string;
  /** Contenido ya migrado. */
  readonly content: string;
  /** Variable de la columna si el contenido la usa (`let-col="col"`). */
  readonly colVariable?: string;
}

/** Columnas de la tabla migrada: un literal generado (estáticas) o la propiedad del componente (dinámicas). */
type Columns = { readonly literal: readonly Column[] } | { readonly source: string };

/** Columna que cb-table pone sola: checkbox (selección múltiple), radio (simple) o botón de expandir. */
function specialColumn(cell: TemplateNode): 'multiple' | 'single' | 'toggler' | null {
  if (/<p-table(Header)?Checkbox\b/.test(cell.inner)) return 'multiple';
  if (/<p-tableRadioButton\b/.test(cell.inner)) return 'single';
  if (/\bpRowToggler\b/.test(cell.inner)) return 'toggler';
  return null;
}

/** `@for (col of columns; …) { <th>…</th> }` o `<th *ngFor="let col of columns">`: variable, iterable y celda. */
function columnLoop(node: TemplateNode, tag: 'th' | 'td'): { variable: string; iterable: string; cell: TemplateNode } | null {
  if (node.kind === 'block' && node.name === 'for') {
    const match = /^\s*([A-Za-z_$][\w$]*)\s+of\s+(.+?)\s*$/.exec(node.parameters[0] ?? '');
    const cells = significant(node);
    if (match && cells.length === 1 && cells[0].name === tag) return { variable: match[1], iterable: match[2], cell: cells[0] };
    return null;
  }
  const ngFor = node.name === tag ? node.attrs.find((a) => a.name === '*ngFor') : undefined;
  const match = ngFor && /^\s*let\s+([A-Za-z_$][\w$]*)\s+of\s+([^;]+?)\s*(;|$)/.exec(ngFor.value);
  return match ? { variable: match[1], iterable: match[2], cell: node } : null;
}

/** Escapa un nombre para usarlo en una expresión regular. */
function re(name: string): string {
  return name.replace(/[$.]/g, (c) => `\\${c}`);
}

/**
 * Columnas dinámicas: `[columns]="cols"` + `@for (col of columns)` en cabecera y cuerpo →
 * `<cb-table [columns]="cols">`. Las ramas `@if (col.field === 'precio')` / `@switch (col.field)`
 * del cuerpo pasan a un `cbTableCell` por campo; el resto muestra `fila[col.field]`.
 */
function dynamicColumns(
  node: TemplateNode,
  r: Restructure,
  header: { variable: string; iterable: string; cell: TemplateNode },
  body: { variable: string; iterable: string; cell: TemplateNode },
  templates: { header: TemplateNode; body: TemplateNode },
  row: string,
  todos: string[],
): { columns: Columns; cells: CellTemplate[] } | string {
  // La lista de columnas: el [columns] de p-table (si los bucles recorren la variable let-columns) o la propiedad que recorren.
  const columnsBinding = node.bindings.find((b) => b.name === 'columns' && b.kind === 'property')?.value.trim();
  const templateVariables = new Set([...templates.header.attrs, ...templates.body.attrs].filter((a) => a.name.startsWith('let-')).map((a) => a.name.slice(4)));
  const sourceOf = (iterable: string) => (templateVariables.has(iterable) ? columnsBinding : iterable);
  const source = sourceOf(header.iterable);
  if (!source || source !== sourceOf(body.iterable)) return 'la cabecera y el cuerpo no recorren la misma lista de columnas.';

  // Cabecera: {{ col.header }}, con orden y filtro opcionales para todas las columnas.
  const th = header.cell;
  const col = header.variable;
  let filter = false;
  const headerText = th.inner.replace(SORT_ICON, '').replace(COLUMN_FILTER, () => ((filter = true), '')).trim();
  if (!new RegExp(`^\\{\\{\\s*${re(col)}\\.header\\s*\\}\\}$`).test(headerText)) return 'la cabecera dinámica no es {{ col.header }}.';
  const sortable = th.bindings.some((b) => b.name === 'pSortableColumn' && b.kind === 'property' && b.value.trim() === `${col}.field`);
  if (sortable || filter) {
    const flags = [sortable && 'sortable: true', filter && 'filter: true'].filter(Boolean).join(' y ');
    todos.push(`en PrimeNG la cabecera hacía ordenables/filtrables todas las columnas: el migrador añade ${flags} a ${source} si es un array del componente; si las columnas vienen de otro sitio, añádelo tú.`);
  }

  // Cuerpo: fila[col.field], o ramas por campo.
  const td = body.cell;
  const c = body.variable;
  const isDefault = (text: string) => text.trim() === '' || new RegExp(`^\\{\\{\\s*${re(row)}\\??\\.?\\[\\s*${re(c)}\\.field\\s*\\]\\s*\\}\\}$`).test(text.trim());
  if (isDefault(td.inner)) return { columns: { source }, cells: [] };

  const fieldOf = (condition: string): string | undefined =>
    new RegExp(`^\\s*${re(c)}\\.field\\s*===?\\s*'([^']+)'\\s*$`).exec(condition)?.[1] ?? new RegExp(`^\\s*'([^']+)'\\s*===?\\s*${re(c)}\\.field\\s*$`).exec(condition)?.[1];
  const branches: { field: string; inner: string }[] = [];
  let fallback = '';
  const blocks = significant(td);
  if (blocks.length === 1 && blocks[0].kind === 'block' && blocks[0].name === 'switch' && blocks[0].parameters[0]?.trim() === `${c}.field`) {
    for (const option of significant(blocks[0])) {
      const field = option.name === 'case' ? /^\s*'([^']+)'\s*$/.exec(option.parameters[0] ?? '')?.[1] : undefined;
      if (field) branches.push({ field, inner: option.inner });
      else if (option.name === 'default') fallback = option.inner;
      else return 'la celda dinámica tiene un @case que no es un campo fijo.';
    }
  } else if (blocks.length && blocks.every((b) => b.kind === 'block') && blocks[0].name === 'if') {
    for (const [i, branch] of blocks.entries()) {
      if (branch.name === 'else' && i === blocks.length - 1) {
        fallback = branch.inner;
        continue;
      }
      const field = (branch.name === 'if' ? i === 0 : branch.name === 'else if') ? fieldOf(branch.parameters[0] ?? '') : undefined;
      if (!field) return 'la celda dinámica tiene condiciones que no comparan col.field con un campo fijo.';
      branches.push({ field, inner: branch.inner });
    }
  } else {
    return 'la celda dinámica muestra algo distinto de fila[col.field] y no se separa por campo con @if/@switch.';
  }
  if (!isDefault(fallback)) return 'la rama por defecto de la celda dinámica no es solo {{ fila[col.field] }}.';

  const cells = branches.map(({ field, inner }) => {
    const content = r.migrate(dedent(inner.trim()));
    return { field, content, colVariable: new RegExp(`\\b${re(c)}\\b`).test(content) ? c : undefined };
  });
  return { columns: { source }, cells };
}

/**
 * `<p-table>` → `<cb-table [columns]>`. Columnas escritas una a una en `#header` / `#body`
 * (se genera el array) o dinámicas con `@for` (se usa el array del componente), y un
 * `cbTableCell` por cada celda personalizada.
 */
function restructureTable(node: TemplateNode, r: Restructure): string | null {
  const manual = (why: string) => `${why} Migra a <cb-table [columns]> con plantillas cbTableCell a mano.`;
  const templates = significant(node);
  if (templates.some((t) => t.name !== 'ng-template')) return manual('p-table tiene contenido fuera de sus plantillas.');
  const byName = new Map<string, TemplateNode>();
  for (const template of templates) {
    const name = templateName(template);
    if (!name || !KNOWN_TEMPLATES.has(name)) return manual(`p-table usa la plantilla "${name ?? '?'}", que cb-table no tiene.`);
    byName.set(name, template);
  }
  const header = byName.get('header');
  const body = byName.get('body');
  if (!header || !body) return manual('p-table sin plantillas header y body.');

  const headerRow = singleRow(header);
  const bodyRow = singleRow(body);
  if (!headerRow || !bodyRow) return manual('la cabecera o el cuerpo no son una sola fila <tr> (varias filas o @if).');
  const thsAll = significant(headerRow);
  const tdsAll = significant(bodyRow);
  if (thsAll.length !== tdsAll.length) return manual('la cabecera y el cuerpo no tienen el mismo número de celdas (colspan).');

  const row = rowVariable(body);
  if (!row) return manual('la plantilla body no declara la fila (let-fila).');
  const used = otherVariables(body).filter((name) => tdsAll.some((td) => new RegExp(`\\b${re(name)}\\b`).test(td.inner)));
  if (used.length) return manual(`las celdas usan ${used.join(', ')}, que cbTableCell no ofrece.`);

  // Columnas de checkbox, radio y expandir: cb-table las pone sola.
  let selection: 'multiple' | 'single' | null = null;
  const ths: TemplateNode[] = [];
  const tds: TemplateNode[] = [];
  thsAll.forEach((th, i) => {
    const special = specialColumn(th) ?? specialColumn(tdsAll[i]);
    if (special === 'multiple' || special === 'single') selection = special;
    if (special) return;
    ths.push(th);
    tds.push(tdsAll[i]);
  });

  const todos: string[] = [];
  let columns: Columns;
  let cells: CellTemplate[];
  const headerLoop = ths.length === 1 ? columnLoop(ths[0], 'th') : null;
  const bodyLoop = tds.length === 1 ? columnLoop(tds[0], 'td') : null;
  if (headerLoop && bodyLoop) {
    const dynamic = dynamicColumns(node, r, headerLoop, bodyLoop, { header, body }, row, todos);
    if (typeof dynamic === 'string') return manual(dynamic);
    ({ columns, cells } = dynamic);
  } else {
    if (ths.some((th) => th.name !== 'th') || tds.some((td) => td.name !== 'td')) return manual('las celdas se generan con @for/@if que no son de columnas.');
    const statics = staticColumns(r, ths, tds, row, todos);
    if (typeof statics === 'string') return manual(statics);
    ({ columns, cells } = statics);
  }

  const rowAttrs = bodyRow.attrs.filter((a) => !/^\[?(pSelectableRow|pSelectableRowIndex|pRowToggler|pSelectableRowDisabled)\]?$/.test(a.name));
  if (rowAttrs.length) todos.push(`la fila tenía ${rowAttrs.map((a) => a.source).join(' ')}; cb-table no admite atributos por fila.`);

  const { attrs, todos: ruleTodos } = r.rules(node, { to: 'cb-table', rules: TABLE_RULES });
  const finalAttrs = [...attrs];
  if (selection && !node.bindings.some((b) => b.name === 'selectionMode')) finalAttrs.push(`selectionMode="${selection}"`);

  const empty = byName.get('emptymessage');
  if (empty) {
    const text = singleCellContent(empty);
    if (text !== null && !/[<@]/.test(text)) finalAttrs.push(text.includes('{{') ? `[emptyMessage]="${textExpression(text)}"` : `emptyMessage="${text.replace(/"/g, '&quot;')}"`);
    else todos.push('el mensaje de tabla vacía tenía marcado; cb-table solo admite texto en emptyMessage.');
  }

  const expansionNode = byName.get('rowexpansion');
  let expansion: { variable: string; content: string } | undefined;
  if (expansionNode) {
    const content = singleCellContent(expansionNode);
    const variable = rowVariable(expansionNode);
    if (content === null || !variable) return manual('la fila de expansión no es <tr><td>…</td></tr>.');
    expansion = { variable, content: r.migrate(dedent(content)) };
  }

  const { eol } = r;
  const indent = node.indent;
  const inner = `${indent}  `;
  const fixFilterGlobal = (fragment: string) => fragment.replace(/\.filterGlobal\(([\s\S]*?),\s*['"][A-Za-z]+['"]\s*\)/g, '.filterGlobal($1)');
  const moved = (name: string, where: string): string => {
    const template = byName.get(name);
    if (!template) return '';
    todos.push(`el contenido de #${name} de p-table está ${where} de cb-table (no tiene esa zona).`);
    return fixFilterGlobal(r.migrate(template.inner.trim()));
  };
  const caption = moved('caption', 'antes');
  const summary = moved('summary', 'después');

  // Sin coma final: el parser de expresiones de Angular no la admite en todos los casos.
  const columnsAttr =
    'source' in columns
      ? `[columns]="${columns.source}"`
      : `[columns]="[${eol}${columns.literal.map((col) => `${inner}  ${columnLiteral(col)}`).join(`,${eol}`)}${eol}${inner}]"`;
  /** Contenido de una plantilla: en la misma línea si es corto, o como bloque sangrado. */
  const templateBody = (content: string): string => {
    if (!/\r?\n/.test(content)) return content;
    return eol + content.split(/\r?\n/).map((line) => (line.trim() ? `${inner}  ${line}` : '')).join(eol) + eol + inner;
  };
  const templateLines = cells.map(
    (cell) =>
      `${inner}<ng-template cbTableCell=${JSON.stringify(cell.field)} let-${row}${cell.colVariable ? ` let-${cell.colVariable}="col"` : ''}>${templateBody(cell.content)}</ng-template>`,
  );
  if (expansion) templateLines.push(`${inner}<ng-template cbTableRowExpansion let-${expansion.variable}>${templateBody(expansion.content)}</ng-template>`);

  let result = [...ruleTodos, ...todos].map((todo) => todoComment(todo) + eol + indent).join('');
  if (caption) result += caption + eol + indent;
  result += `<cb-table${finalAttrs.map((a) => eol + inner + a).join('')}${eol}${inner}${columnsAttr}${eol}${indent}>`;
  if (templateLines.length) result += eol + templateLines.join(eol) + eol + indent;
  result += '</cb-table>';
  if (summary) result += eol + indent + summary;
  r.replace(node, result);
  return null;
}

/** Columnas escritas una a una: un `<th>` y un `<td>` por columna. */
function staticColumns(
  r: Restructure,
  ths: readonly TemplateNode[],
  tds: readonly TemplateNode[],
  row: string,
  todos: string[],
): { columns: Columns; cells: CellTemplate[] } | string {
  const literal: Column[] = [];
  const cells: CellTemplate[] = [];
  const fields = new Set<string>();
  const rowPath = new RegExp(`(?<![\\w$.])${re(row)}((?:\\??\\.[A-Za-z_$][\\w$]*)+)(\\s*\\()?`);

  for (let i = 0; i < ths.length; i++) {
    const th = ths[i];
    const td = tds[i];
    const sortBinding = th.bindings.find((b) => b.name === 'pSortableColumn');
    const sortField = sortBinding?.kind === 'static' ? sortBinding.value : sortBinding && /^'([^']+)'$/.exec(sortBinding.value.trim())?.[1];
    if (sortBinding && !sortField) todos.push(`${sortBinding.source} — el campo de orden es una expresión; revisa sortable en la columna.`);

    let filter = false;
    let matchMode: string | undefined;
    const headerText = th.inner
      .replace(SORT_ICON, '')
      .replace(COLUMN_FILTER, (_match, attrs: string) => {
        filter = true;
        const mode = /matchMode="(contains|startsWith|equals)"/.exec(attrs)?.[1];
        if (mode && mode !== 'contains') matchMode = mode;
        return '';
      })
      .trim()
      .replace(/\s+/g, ' ');
    if (/[<@]/.test(headerText)) return `la cabecera "${headerText.slice(0, 40)}" tiene marcado (iconos, badges…) y cb-table solo admite texto en header.`;

    const width = /(?:^|;)\s*width\s*:\s*([^;]+?)\s*(?:;|$)/.exec(th.attrs.find((a) => a.name === 'style')?.value ?? '')?.[1];
    const content = td.inner.trim();
    const simple = new RegExp(`^\\{\\{\\s*${re(row)}\\.([A-Za-z_$][\\w$]*(?:\\.[A-Za-z_$][\\w$]*)*)\\s*\\}\\}$`).exec(content)?.[1];
    const fromContent = (() => {
      const match = rowPath.exec(content);
      if (!match) return undefined;
      const segments = match[1].replace(/\?/g, '').split('.').filter(Boolean);
      if (match[2]) segments.pop();
      return segments.join('.') || undefined;
    })();
    let field = sortField ?? simple ?? fromContent ?? `col${i + 1}`;
    if (fields.has(field)) field = `${field}_${i + 1}`;
    fields.add(field);

    const ignoredAttrs = td.attrs.filter((a) => !/^\[?pFrozenColumn\]?$/.test(a.name) && !/^\[?alignFrozen\]?$/.test(a.name));
    if (ignoredAttrs.length) todos.push(`la celda de "${headerText}" tenía ${ignoredAttrs.map((a) => a.source).join(' ')}; aplica esos estilos dentro de su cbTableCell.`);

    literal.push({ field, header: textExpression(headerText), sortable: !!sortField, filter, matchMode, width, frozen: isFrozen(th) || isFrozen(td) });
    if (!(simple && simple === field)) cells.push({ field, content: r.migrate(dedent(content)) });
  }
  return { columns: { literal }, cells };
}

/**
 * Propiedades usadas como `[columns]` de una p-table cuya cabecera dinámica hace todas las
 * columnas ordenables (`[pSortableColumn]="col.field"`) o filtrables (`<p-columnFilter [field]="col.field">`).
 */
function dynamicColumnFlags(templates: readonly string[]): Map<string, { sortable: boolean; filter: boolean }> {
  const flags = new Map<string, { sortable: boolean; filter: boolean }>();
  for (const template of templates) {
    for (const [table] of template.matchAll(/<p-table\b[\s\S]*?<\/p-table>/g)) {
      const name = /\[columns\]\s*=\s*"\s*(?:this\.)?([A-Za-z_$][\w$]*)(?:\(\))?\s*"/.exec(table)?.[1];
      if (!name) continue;
      const sortable = /\[pSortableColumn\]\s*=\s*"\s*[A-Za-z_$][\w$]*\.field\s*"/.test(table);
      const filter = /<p-column-?[Ff]ilter\b[^>]*\[field\]\s*=\s*"\s*[A-Za-z_$][\w$]*\.field\s*"/.test(table);
      if (sortable || filter) flags.set(name, { sortable, filter });
    }
  }
  return flags;
}

/**
 * Columnas dinámicas: añade `sortable: true` / `filter: true` a los objetos del array del
 * componente (en PrimeNG lo decidía la plantilla) y lo tipa como `CbTableColumn[]`.
 */
const rewriteTableColumns: SourceRewriter = (sf, context, edits) => {
  if (!context.locals.has('TableModule') && !context.locals.has('Table')) return;
  const flags = dynamicColumnFlags(context.templates);
  if (!flags.size) return;

  const addFlags = (array: ts.ArrayLiteralExpression, wanted: { sortable: boolean; filter: boolean }) => {
    for (const element of array.elements) {
      if (!ts.isObjectLiteralExpression(element)) continue;
      const names = new Set(element.properties.map((p) => propertyName(p)));
      const missing = [wanted.sortable && !names.has('sortable') && 'sortable: true', wanted.filter && !names.has('filter') && 'filter: true'].filter(Boolean);
      if (!missing.length) continue;
      const last = element.properties[element.properties.length - 1];
      if (last) edits.push({ start: last.getEnd(), end: last.getEnd(), text: `, ${missing.join(', ')}` });
      else edits.push({ start: element.getStart(sf) + 1, end: element.getEnd() - 1, text: ` ${missing.join(', ')} ` });
    }
  };
  /** `[...]` o `signal([...])`. */
  const arrayOf = (expression: ts.Expression | undefined): ts.ArrayLiteralExpression | undefined => {
    if (!expression) return undefined;
    if (ts.isArrayLiteralExpression(expression)) return expression;
    if (ts.isCallExpression(expression) && expression.arguments[0] && ts.isArrayLiteralExpression(expression.arguments[0])) return expression.arguments[0];
    return undefined;
  };
  /** `Column[]`, `Array<Column>` o `signal<Column[]>` → `CbTableColumn`. */
  const retype = (node: ts.Node) => {
    const visit = (current: ts.Node): void => {
      const element = ts.isArrayTypeNode(current) ? current.elementType : undefined;
      if (element && ts.isTypeReferenceNode(element) && ts.isIdentifier(element.typeName) && element.typeName.text !== 'CbTableColumn') {
        edits.push({ start: element.getStart(sf), end: element.getEnd(), text: 'CbTableColumn' });
        context.addImport('CbTableColumn', '@caribeng/ui/table');
        return;
      }
      ts.forEachChild(current, visit);
    };
    visit(node);
  };

  const visit = (node: ts.Node): void => {
    if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name) && flags.has(node.name.text)) {
      const array = arrayOf(node.initializer);
      if (array) addFlags(array, flags.get(node.name.text)!);
      if (node.type) retype(node.type);
      if (node.initializer && ts.isCallExpression(node.initializer)) node.initializer.typeArguments?.forEach(retype);
      return;
    }
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isPropertyAccessExpression(node.left) &&
      node.left.expression.kind === ts.SyntaxKind.ThisKeyword &&
      flags.has(node.left.name.text)
    ) {
      const array = arrayOf(node.right);
      if (array) addFlags(array, flags.get(node.left.name.text)!);
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
};

export const table: ComponentMapping = {
  name: 'table',
  entry: '@caribeng/ui/table',
  symbol: 'CbTable',
  attrs: { cbTableCell: 'CbTableCellDirective', cbTableRowExpansion: 'CbTableRowExpansion' },
  rewriteSource: rewriteTableColumns,
  modules: {
    'primeng/table': { TableModule: 'CbTable', Table: 'CbTable', TableLazyLoadEvent: 'CbTableLazyLoadEvent' },
  },
  elements: [
    {
      tag: 'p-table',
      to: 'cb-table',
      rules: TABLE_RULES,
      restructure: restructureTable,
      same: [
        'value',
        'paginator',
        'rowsPerPageOptions',
        'dataKey',
        'selection',
        'selectionMode',
        'globalFilterFields',
        'scrollHeight',
        'resizableColumns',
        'lazy',
        'loading',
        'groupRowsBy',
        'rowHover',
        'ariaLabel',
      ],
    },
  ],
};
