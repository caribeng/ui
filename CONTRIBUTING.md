# Contributing to CaribeNG

Thanks for your interest in contributing! This guide covers how to set up the project and submit changes.

## Prerequisites

- [Node.js](https://nodejs.org/) 20.19 or higher
- [pnpm](https://pnpm.io/) 11
- [Git](https://git-scm.com/)

## Setup

1. [Fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) the `caribeng/ui` repository.
2. Clone your fork and install the dependencies:

   ```bash
   git clone https://github.com/<your-username>/ui.git
   cd ui
   pnpm install
   ```

## Development

| Command | What it does |
| --- | --- |
| `pnpm showcase` | Serves the documentation site locally (the URL is printed in the terminal). |
| `pnpm build` | Builds every project (`nx run-many -t build`). |
| `pnpm test` | Runs every unit test suite (`nx run-many -t test`). |
| `pnpm typecheck` | Type-checks the library and the showcase. |
| `pnpm lint` | Lints every project. |

Make sure `pnpm typecheck` and `pnpm test` pass with no errors before opening a pull request.

## Making changes

1. Keep your fork up to date:

   ```bash
   git pull https://github.com/caribeng/ui.git main
   ```

2. Create a branch from `main`:

   ```bash
   git checkout main
   git checkout -b your-change
   ```

3. Commit your changes using the [Conventional Commits](https://www.conventionalcommits.org/) style the project follows (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`…).

4. Push to your fork and open a pull request against `main`.

## Notes

- Don't commit build artifacts (`dist/`, `coverage/`) or `node_modules/`.
- If you change a component's behavior, add or update its unit tests.
- Documentation examples are generated from source: if you change a component's public API, run `pnpm docs:code` and commit the regenerated examples.
- Reference related issues in commit messages or the PR description (e.g. `#123`) so GitHub cross-references them.
- If you're unsure whether a change is wanted, open an issue first to discuss it.

This project is mostly maintained in spare time, so feedback can take a little while. Thanks for your patience!
