import { drop, numeric, styleClass, templateName, unsupported } from './rules';
import type { AttrRule, ChildElement, ComponentMapping, Restructure, TemplateNode } from './types';

// =============================================================================
// Timeline
// `<p-timeline [value]="events" layout="horizontal"><ng-template pTemplate="content">…</ng-template></p-timeline>`
// → `<cb-timeline [value]="events" orientation="horizontal"><ng-template cbTimelineContent>…</ng-template></cb-timeline>`
// =============================================================================

export const timeline: ComponentMapping = {
  name: 'timeline',
  entry: '@caribeng/ui/timeline',
  symbol: 'CbTimeline',
  modules: {
    'primeng/timeline': { Timeline: 'CbTimeline', TimelineModule: 'CbTimeline' },
  },
  elements: [{
    tag: 'p-timeline',
    to: 'cb-timeline',
    rules: {
      styleClass: styleClass(),
      style: drop(),
      layout: (binding, el) => {
        // PrimeNG 'layout' → CaribeNG 'orientation'
        const map: Record<string, string> = { horizontal: 'horizontal', vertical: 'vertical' };
        const v = binding.kind === 'static' ? (map[binding.value] ?? binding.value) : binding.value;
        el.attrs.push(binding.kind === 'static' ? `orientation="${v}"` : `[orientation]="${binding.value}"`);
      },
      align: (binding, el) => {
        // PrimeNG: 'left'|'right'|'top'|'bottom'|'alternate' → CaribeNG: same
        const v = binding.kind === 'static' ? `align="${binding.value}"` : `[align]="${binding.value}"`;
        el.attrs.push(v);
      },
    },
    same: ['value', 'ariaLabel'],
    child: (child) => {
      const name = templateName(child);
      if (!name) return null;
      if (name === 'content') return { tag: 'ng-template', attrs: ['cbTimelineContent', 'let-event'] };
      if (name === 'opposite') return { tag: 'ng-template', attrs: ['cbTimelineOpposite'] };
      if (name === 'marker') return { tag: 'ng-template', attrs: ['cbTimelineMarker'] };
      return { todo: `cb-timeline no tiene la plantilla pTemplate="${name}"; usa cbTimelineContent, cbTimelineOpposite o cbTimelineMarker.` };
    },
  }],
};

// =============================================================================
// Tree
// `<p-tree [value]="nodes" [(selection)]="selected" />`
// → `<cb-tree [value]="nodes" [(selection)]="selected" />`
//
// CaribeNG usa CbTreeNode[] en lugar de TreeNode[]; adapta el modelo.
// =============================================================================

export const tree: ComponentMapping = {
  name: 'tree',
  entry: '@caribeng/ui/tree',
  symbol: 'CbTree',
  modules: {
    'primeng/tree': { Tree: 'CbTree', TreeModule: 'CbTree' },
    'primeng/api': { TreeNode: 'CbTreeNode' },
  },
  elements: [{
    tag: 'p-tree',
    to: 'cb-tree',
    rules: {
      styleClass: styleClass(),
      style: drop(),
      selectionMode: unsupported('cb-tree solo admite selección de nodo único; usa [(selection)].'),
      metaKeySelection: drop(),
      scrollHeight: drop(),
      loading: drop(),
      loadingIcon: drop(),
      emptyMessage: drop(),
      filterMode: drop(),
      filterPlaceholder: drop(),
      filter: drop(),
      filterValue: drop(),
      indentation: drop(),
      propagateSelectionUp: drop(),
      propagateSelectionDown: drop(),
      draggableNodes: drop(),
      droppableNodes: drop(),
      dragdropScope: drop(),
      '(onNodeSelect)': (binding, el) => { el.attrs.push(`(nodeSelect)="${binding.value}"`); },
      '(onNodeUnselect)': drop(),
      '(onNodeExpand)': (binding, el) => { el.attrs.push(`(nodeExpand)="${binding.value}"`); },
      '(onNodeCollapse)': (binding, el) => { el.attrs.push(`(nodeCollapse)="${binding.value}"`); },
    },
    same: ['value', 'selection', 'ariaLabel'],
    child: (child) => {
      const name = templateName(child);
      if (name === 'default' || !name) return { tag: 'ng-template', attrs: ['cbTreeNode'] };
      return { todo: `cb-tree no tiene la plantilla pTemplate="${name}"; usa ng-template cbTreeNode.` };
    },
  }],
};

// =============================================================================
// DataView
// `<p-dataview [value]="products" [paginator]="true" [rows]="3">…</p-dataview>`
// → `<cb-dataview [value]="products" [rows]="3">…</cb-dataview>`
// =============================================================================

// Reglas compartidas de p-dataview → cb-dataview.
const DATA_VIEW_RULES: Record<string, AttrRule> = {
  styleClass: styleClass(),
  style: drop(),
  paginator: drop(),
  paginatorPosition: drop(),
  alwaysShowPaginator: drop(),
  paginatorDropdownScrollHeight: drop(),
  paginatorDropdownAppendTo: drop(),
  pageLinks: drop(),
  paginatorTemplate: drop(),
  rowsPerPageOptions: drop(),
  currentPageReportTemplate: drop(),
  showCurrentPageReport: drop(),
  lazy: drop(),
  emptyMessage: drop(),
  filterBy: drop(),
  sortField: drop(),
  sortOrder: drop(),
  layout: (binding, el) => {
    const v = binding.kind === 'static' ? `layout="${binding.value}"` : `[layout]="${binding.value}"`;
    el.attrs.push(v);
  },
  '(onPage)': drop(),
  '(onSort)': drop(),
  '(onChangeLayout)': drop(),
  rows: numeric(),
};

const dataViewChild = (child: ChildElement) => {
  const name = templateName(child);
  if (!name) return null;
  if (name === 'list' || name === 'grid' || name === 'item') return { tag: 'ng-template', attrs: ['cbDataViewItem', 'let-p'] };
  if (name === 'header') return { tag: 'div', attrs: ['cbDataViewHeader'] };
  return { todo: `cb-dataview no tiene pTemplate="${name}"; usa ng-template cbDataViewItem para los items.` };
};

function restructureDataView(node: TemplateNode, r: Restructure): string | null {
  // cb-dataview entrega un item por instancia (let-p): desenvuelve el @for que paginaba el array.
  for (const child of node.children) {
    if (child.kind !== 'element' || child.name !== 'ng-template') continue;
    for (const block of child.children) {
      if (block.kind === 'block' && block.name === 'for') r.unwrap(block);
    }
  }
  r.convert(node, { to: 'cb-dataview', rules: DATA_VIEW_RULES, child: dataViewChild, same: ['value', 'dataKey'] });
  return null;
}

export const dataview: ComponentMapping = {
  name: 'dataview',
  entry: '@caribeng/ui/dataview',
  symbol: 'CbDataView',
  modules: {
    'primeng/dataview': { DataView: 'CbDataView', DataViewModule: 'CbDataView' },
  },
  elements: [{
    tag: 'p-dataview',
    to: 'cb-dataview',
    rules: DATA_VIEW_RULES,
    restructure: restructureDataView,
  }],
};
