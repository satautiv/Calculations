# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A single-page static web app: a strength training calculator suite (One-Rep Max, Training %, Wilks Strength Score, Plate Loading). No build system, no package manager, no framework — plain HTML/CSS/JS served directly by a browser.

## Running

To view changes, open `index.html` directly in a browser, or serve the directory with any static file server (e.g. `python3 -m http.server`) and visit it. Or via Docker: `docker compose up --build` then visit `http://localhost:8080`.

## Testing

`npm test` runs the Jest suite in `tests/`. Tests exercise `js/calc-lib.js` directly (via `require`, Node environment — no DOM needed) rather than driving the UI. When adding a calculator, put its pure math in `calc-lib.js` and cover it with a test there; keep `calculators.js` limited to DOM wiring/validation, which isn't unit-tested.

## Architecture

- `index.html` — a `#calculator-index` section (search input + category grid, built from the registry) sits alongside every calculator's `<section class="view tab-panel">` inside `<main>`. Adding a new calculator means adding a panel with a unique `id`, wiring it in `calculators.js`, and adding one entry to `js/calculators-registry.js` — no manual nav markup to touch.
- `js/calculators-registry.js` — the single source of truth listing every calculator (`id`, `name`, `category`, `description`, `keywords`). Both the index/search UI and the router read from this list.
- `js/calc-lib.js` — pure calculation functions (Epley formula, Wilks coefficients, plate-loading greedy algorithm, etc.), no DOM access. Exported via a `typeof module !== 'undefined'` guard so the same file works as a plain browser `<script>` and as a CommonJS `require()` target in tests.
- `js/calculators.js` — top section renders the category/search index from the registry and does hash-based routing (`#calc/<id>`): toggling `.active` on whichever `.view` matches the current hash (or `#calculator-index` when there's none), and showing/hiding the header's "back to calculators" button accordingly. Below that, one self-contained block per calculator wires its own `-calc` button's click handler: reads inputs, validates, calls into `calc-lib.js`, writes to its own `-result` div via `showError()` or a template string. There's no shared state between calculators.
- `css/style.css` — dark theme via CSS custom properties on `:root` (`--bg`, `--panel`, `--accent`, etc.). Reuse these variables rather than hardcoding colors. `.view` controls show/hide (used by both the index and every calculator panel); `.tab-panel` only adds the calculator's boxed card styling.
- `js/i18n.js` — translation lookup keyed by literal English source text (not abstract keys), so existing markup doesn't need per-element key attributes. `t(text)` looks up the active language's dictionary and falls back to `text` unchanged when untranslated. `applyTranslations()` walks every leaf DOM element (no element children) plus `input`/`textarea` placeholders and rewrites their text via `t()`, skipping anything inside `.result` (calculated output, not static UI). The header's `#lang-select` is populated from `SUPPORTED_LANGUAGES` and drives `setLanguage(code)`, which persists the choice to `localStorage` (`calc-suite-lang`) and re-renders the calculator index (its cards are built from the registry at render time, not static markup, so they go through `t()` directly in `renderCalculatorIndex()` rather than the leaf-element pass). Adding a language: add its `{code, name}` to `SUPPORTED_LANGUAGES`, create `js/i18n/<code>.js` calling `registerTranslations('<code>', {"English string": "Translated string", ...})`, and add its `<script>` tag after `js/i18n.js` in `index.html`.

## Docker

`Dockerfile` serves the static files through `nginx:alpine`. `docker-compose.yml` builds it and publishes port 8080. No backend/app server exists yet — if a Python backend is added later, it should become its own service in `docker-compose.yml` alongside `web`, not folded into the nginx image.

## CI/CD (GitHub Actions, `.github/workflows/ci.yml`)

- `test` job: runs `npm ci && npm test` on every push/PR to `main`.
- `docker-build` job: verifies the `Dockerfile` still builds.
- `deploy` job: on push to `main` only, copies `index.html`, `css/`, `js/` into `dist/` and publishes to GitHub Pages via `actions/deploy-pages`. Pages must be set to "GitHub Actions" as its source once in repo Settings.
- `.github/dependabot.yml` opens weekly PRs for npm, Docker base image, and GitHub Actions updates. A `pip` entry is pre-configured too — it's a no-op until a `requirements.txt` exists, so a future Python backend's dependencies get automatically audited/updated with no extra setup.

## Conventions

- Each calculator validates its own inputs inline and calls `showError(elId, message)` on invalid input rather than throwing or using alerts.
- Result rendering is done via `innerHTML` template strings directly into the `.result` div (headline + description, or a table, depending on calculator).
