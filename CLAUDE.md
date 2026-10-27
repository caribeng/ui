# CLAUDE.md — Instrucciones para Claude Code en CaribeNG

Lee obligatoriamente [`AGENTS.md`](./AGENTS.md) y [`PROGRESO.md`](./PROGRESO.md).

## Estado

No hay ninguna asignación por lotes abierta. El lote de 15 componentes de Caribe Design (button-group, icon-button, tag-button, fab-menu, float-menu, header, footer, link, shortcut, expansion-panel, off-canvas, dots-indicator, step-indicator, switch, progress-bar) **está terminado**, junto con los otros 30 de Caribe: viven en `packages/ui/<name>/` y se importan como `@caribeng/ui/<name>` (mismo nivel que el resto del catálogo). El estado, los pendientes y el proceso de publicación están en [`PROGRESO.md`](./PROGRESO.md).

## Reglas clave

- En Windows ejecuta `tsc` y `nx` directamente:
  - `node ./node_modules/typescript/bin/tsc -p packages/ui/tsconfig.lib.json --noEmit`
  - `node ./node_modules/typescript/bin/tsc -p packages/ui/tsconfig.spec.json --noEmit`
  - `node ./node_modules/typescript/bin/tsc -p apps/showcase/tsconfig.app.json --noEmit`
  - `NODE_OPTIONS=--dns-result-order=ipv4first .\node_modules\.bin\nx.cmd run-many -t build`
  - `NODE_OPTIONS=--dns-result-order=ipv4first .\node_modules\.bin\nx.cmd test ui`
- Usa únicamente iconos del set núcleo en los tests (`check`, `x`, `plus`, `info`, `search`, `chevron-down`, `chevron-right`, `user`, `house`, `settings`) para no emitir warnings en `stderr`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
