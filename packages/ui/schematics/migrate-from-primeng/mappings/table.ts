import { TODO_MARK } from '../todo';
import { SIZE_VALUES, adaptEvent, drop, event, numeric, rename, styleClass, unsupported, values } from './rules';
import type { AttrRule, ComponentMapping, Restructure, TemplateNode } from './types';

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
  /** Contenido de la celda (ya migrado) si no es solo `{{ fila.campo }}`. */
  template?: string;
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

/**
 * `<p-table>` con columnas escritas en `#header` / `#body` → `<cb-table [columns]>` con
 * un `cbTableCell` por cada celda que no es solo `{{ fila.campo }}`.
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
  if (!headerRow || !bodyRow) return manual('la cabecera o el cuerpo no son una sola fila <tr> (varias filas, @for o @if).');
  const ths = significant(headerRow);
  const tds = significant(bodyRow);
  if (ths.some((th) => th.name !== 'th') || tds.some((td) => td.name !== 'td')) return manual('las celdas se generan con @for/@if (columnas dinámicas).');
  if (ths.length !== tds.length) return manual('la cabecera y el cuerpo no tienen el mismo número de celdas (colspan).');

  const row = rowVariable(body);
  if (!row) return manual('la plantilla body no declara la fila (let-fila).');
  const used = otherVariables(body).filter((name) => tds.some((td) => new RegExp(`\\b${name}\\b`).test(td.inner)));
  if (used.length) return manual(`las celdas usan ${used.join(', ')}, que cbTableCell no ofrece.`);

  const todos: string[] = [];
  const columns: Column[] = [];
  const fields = new Set<string>();
  let selection: 'multiple' | 'single' | null = null;
  const rowPath = new RegExp(`(?<![\\w$.])${row.replace(/\$/g, '\\$')}((?:\\??\\.[A-Za-z_$][\\w$]*)+)(\\s*\\()?`);

  for (let i = 0; i < ths.length; i++) {
    const th = ths[i];
    const td = tds[i];
    // Columnas que cb-table pone sola.
    if (/<p-table(Header)?Checkbox\b/.test(th.inner + td.inner)) {
      selection = 'multiple';
      continue;
    }
    if (/<p-tableRadioButton\b/.test(td.inner)) {
      selection = 'single';
      continue;
    }
    if (/\bpRowToggler\b/.test(td.inner)) continue;

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
    if (/[<@]/.test(headerText)) return manual(`la cabecera "${headerText.slice(0, 40)}" tiene marcado (iconos, badges…) y cb-table solo admite texto en header.`);

    const width = /(?:^|;)\s*width\s*:\s*([^;]+?)\s*(?:;|$)/.exec(th.attrs.find((a) => a.name === 'style')?.value ?? '')?.[1];
    const content = td.inner.trim();
    const simple = new RegExp(`^\\{\\{\\s*${row.replace(/\$/g, '\\$')}\\.([A-Za-z_$][\\w$]*(?:\\.[A-Za-z_$][\\w$]*)*)\\s*\\}\\}$`).exec(content)?.[1];
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

    columns.push({
      field,
      header: textExpression(headerText),
      sortable: !!sortField,
      filter,
      matchMode,
      width,
      frozen: isFrozen(th) || isFrozen(td),
      template: simple && simple === field ? undefined : r.migrate(dedent(content)),
    });
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
  const columnLines = columns.map((col) => `${inner}  ${columnLiteral(col)}`).join(`,${eol}`);
  /** Contenido de una plantilla: en la misma línea si es corto, o como bloque sangrado. */
  const templateBody = (content: string): string => {
    if (!/\r?\n/.test(content)) return content;
    return eol + content.split(/\r?\n/).map((line) => (line.trim() ? `${inner}  ${line}` : '')).join(eol) + eol + inner;
  };
  const cellTemplates = columns
    .filter((col) => col.template !== undefined)
    .map((col) => `${inner}<ng-template cbTableCell=${JSON.stringify(col.field)} let-${row}>${templateBody(col.template!)}</ng-template>`);
  if (expansion) cellTemplates.push(`${inner}<ng-template cbTableRowExpansion let-${expansion.variable}>${templateBody(expansion.content)}</ng-template>`);

  const lines = [...ruleTodos, ...todos].map((todo) => todoComment(todo) + eol + indent);
  let result = lines.join('');
  if (caption) result += caption + eol + indent;
  result += `<cb-table${finalAttrs.map((a) => eol + inner + a).join('')}${eol}${inner}[columns]="[${eol}${columnLines}${eol}${inner}]"${eol}${indent}>`;
  if (cellTemplates.length) result += eol + cellTemplates.join(eol) + eol + indent;
  result += '</cb-table>';
  if (summary) result += eol + indent + summary;
  r.replace(node, result);
  return null;
}

export const table: ComponentMapping = {
  name: 'table',
  entry: '@caribeng/ui/table',
  symbol: 'CbTable',
  attrs: { cbTableCell: 'CbTableCellDirective', cbTableRowExpansion: 'CbTableRowExpansion' },
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
