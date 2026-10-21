# CLAUDE.md — Instrucciones para Claude Code en CaribeNG

Lee obligatoriamente [`AGENTS.md`](./AGENTS.md) y [`PROGRESO.md`](./PROGRESO.md).

## Tu Asignación Actual (En `C:\DEVELOPER\CaribeNG\caribeng-claude`, rama `feat/v1.1-claude-caribe-nav-actions`)

Debes implementar tu lote exclusivo de **15 componentes de Caribe Design** tomando como referencia funcional `C:\DEVELOPER\DATA_COPY\NU0065001_WebComponents_Lib\packages\caribe-design-system\<name>` y `C:\DEVELOPER\DATA_COPY\DOCUMENTACION CARIBE\COMPONENTS`:

1. `@caribeng/ui/button-group` (`<cb-button-group>`, `CbButtonGroupComponent`)
2. `@caribeng/ui/icon-button` (`<cb-icon-button>`, `CbIconButtonComponent`)
3. `@caribeng/ui/tag-button` (`<cb-tag-button>`, `CbTagButtonComponent`)
4. `@caribeng/ui/fab-menu` (`<cb-fab-menu>`, `CbFabMenuComponent`)
5. `@caribeng/ui/float-menu` (`<cb-float-menu>`, `CbFloatMenuComponent`)
6. `@caribeng/ui/header` (`<cb-header>`, `CbHeaderComponent`)
7. `@caribeng/ui/footer` (`<cb-footer>`, `CbFooterComponent`)
8. `@caribeng/ui/link` (`<cb-link>`, `CbLinkComponent`)
9. `@caribeng/ui/shortcut` (`<cb-shortcut>`, `CbShortcutComponent`)
10. `@caribeng/ui/expansion-panel` (`<cb-expansion-panel>`, `CbExpansionPanelComponent`)
11. `@caribeng/ui/off-canvas` (`<cb-off-canvas>`, `CbOffCanvasComponent`)
12. `@caribeng/ui/dots-indicator` (`<cb-dots-indicator>`, `CbDotsIndicatorComponent`)
13. `@caribeng/ui/step-indicator` (`<cb-step-indicator>`, `CbStepIndicatorComponent`)
14. `@caribeng/ui/switch` (`<cb-switch>`, `CbSwitchComponent` — CVA)
15. `@caribeng/ui/progress-bar` (`<cb-progress-bar>`, `CbProgressBarCaribeComponent` o `CbProgressBarComponent`)

### Reglas clave en este worktree:
- Como `node_modules` es un junction en Windows, ejecuta `tsc` y `nx` directamente:
  - `node ./node_modules/typescript/bin/tsc -p packages/ui/tsconfig.lib.json --noEmit`
  - `node ./node_modules/typescript/bin/tsc -p packages/ui/tsconfig.spec.json --noEmit`
  - `node ./node_modules/typescript/bin/tsc -p apps/showcase/tsconfig.app.json --noEmit`
  - `NODE_OPTIONS=--dns-result-order=ipv4first .\node_modules\.bin\nx.cmd run-many -t build`
  - `NODE_OPTIONS=--dns-result-order=ipv4first .\node_modules\.bin\nx.cmd test ui`
- Usa únicamente iconos del set núcleo en los tests (`check`, `x`, `plus`, `info`, `search`, `chevron-down`, `chevron-right`, `user`, `house`, `settings`) para no emitir warnings en `stderr`.
- Cuando los 15 componentes pasen el Pre-Commit Gate, haz commit en `feat/v1.1-claude-caribe-nav-actions`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
