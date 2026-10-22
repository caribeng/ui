import * as ts from 'typescript';
import { TODO_MARK } from '../todo';
import type { SourceEdit } from './types';

/** El tipo es una referencia a `local` (`ms: MessageService`). */
function isTypeOf(type: ts.TypeNode | undefined, local: string): boolean {
  return !!type && ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName) && type.typeName.text === local;
}

/** `inject(MessageService)`. */
function isInjectOf(expression: ts.Expression | undefined, local: string): boolean {
  return (
    !!expression &&
    ts.isCallExpression(expression) &&
    ts.isIdentifier(expression.expression) &&
    expression.expression.text === 'inject' &&
    expression.arguments.some((arg) => ts.isIdentifier(arg) && arg.text === local)
  );
}

/**
 * Recorre los usos de un servicio PrimeNG en el archivo: propiedades,
 * parámetros y variables tipadas con él o creadas con `inject(Servicio)`, y
 * llama a `visit` por cada acceso `this.ms.metodo` / `ms.metodo`.
 */
export function forEachServiceCall(
  sf: ts.SourceFile,
  local: string,
  visit: (method: string, access: ts.PropertyAccessExpression, call: ts.CallExpression | undefined) => void,
): void {
  const receivers = new Set<string>();
  const collect = (node: ts.Node): void => {
    if ((ts.isPropertyDeclaration(node) || ts.isParameter(node) || ts.isVariableDeclaration(node)) && ts.isIdentifier(node.name)) {
      if (isTypeOf(node.type, local) || isInjectOf(node.initializer, local)) receivers.add(node.name.text);
    }
    ts.forEachChild(node, collect);
  };
  collect(sf);
  if (!receivers.size) return;

  const isReceiver = (expression: ts.Expression): boolean =>
    (ts.isIdentifier(expression) && receivers.has(expression.text)) ||
    (ts.isPropertyAccessExpression(expression) && expression.expression.kind === ts.SyntaxKind.ThisKeyword && receivers.has(expression.name.text));

  const walk = (node: ts.Node): void => {
    if (ts.isPropertyAccessExpression(node) && isReceiver(node.expression)) {
      const call = ts.isCallExpression(node.parent) && node.parent.expression === node ? node.parent : undefined;
      visit(node.name.text, node, call);
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
}

/** Nombre de una propiedad de un objeto literal (`severity`, `'severity'`). */
export function propertyName(property: ts.ObjectLiteralElementLike): string | undefined {
  return property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : undefined;
}

/** Reescribe un objeto literal con estas propiedades, conservando si estaba en una línea o en varias. */
export function rebuildObject(sf: ts.SourceFile, object: ts.ObjectLiteralExpression, properties: readonly string[]): string {
  if (!object.getText(sf).includes('\n')) return properties.length ? `{ ${properties.join(', ')} }` : '{}';
  const first = object.properties[0];
  const indent = /[ \t]*$/.exec(sf.text.slice(0, first.getStart(sf)))?.[0] ?? '  ';
  const closing = /[ \t]*$/.exec(sf.text.slice(0, object.getEnd() - 1))?.[0] ?? '';
  const eol = sf.text.includes('\r\n') ? '\r\n' : '\n';
  return `{${eol}${properties.map((p) => indent + p).join(`,${eol}`)},${eol}${closing}}`;
}

/** Comentarios `TODO(caribeng)` justo antes de `node`. */
export function todoBefore(sf: ts.SourceFile, node: ts.Node, messages: readonly string[]): SourceEdit {
  const start = node.getStart(sf);
  return { start, end: start, text: messages.map((m) => `/* ${TODO_MARK}: ${m} */ `).join('') };
}
