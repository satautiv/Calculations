# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A single-page static web app: a strength training calculator suite (One-Rep Max, Training %, Wilks Strength Score, Plate Loading). No build system, no package manager, no framework — plain HTML/CSS/JS served directly by a browser.

## Running

To view changes, open `index.html` directly in a browser, or serve the directory with any static file server (e.g. `python3 -m http.server`) and visit it. Or via Docker: `docker compose up --build` then visit `http://localhost:8080`.

## Testing

`npm test` runs the Jest suite in `tests/`. Tests exercise `js/calc-lib.js` directly (via `require`, Node environment — no DOM needed) rather than driving the UI. When adding a calculator, put its pure math in `calc-lib.js` and cover it with a test there; keep `calculators.js` limited to DOM wiring/validation, which isn't unit-tested.

## Architecture

- `index.html` — a `#calculator-index` section (search input + category grid, built from the registry) sits alongside every calculator's `<section class="view tab-panel">` inside `<main>`. Adding a new calculator means adding a panel with a unique `id`, wiring it in `calculators.js`, and adding one entry to `js/calculators-registry.js` — no manual nav markup to touch. A static `.suggest-calculator` card (a plain link to a pre-filled `github.com/.../issues/new?title=...&body=...` URL, `target="_blank"`) sits below the dynamically-rendered `#calc-categories`, always visible regardless of the active search filter — there's deliberately no email fallback (a decision made with the user, to avoid publishing a personal address on the live site).
- `js/calculators-registry.js` — the single source of truth listing every calculator (`id`, `name`, `category`, `description`, `keywords`). Both the index/search UI and the router read from this list.
- `js/calc-lib.js` — pure calculation functions (Epley formula, Wilks coefficients, plate-loading greedy algorithm, etc.), no DOM access. Exported via a `typeof module !== 'undefined'` guard so the same file works as a plain browser `<script>` and as a CommonJS `require()` target in tests.
- `js/calculators.js` — top section renders the category/search index from the registry and does hash-based routing (`#calc/<id>`): toggling `.active` on whichever `.view` matches the current hash (or `#calculator-index` when there's none), and showing/hiding the header's "back to calculators" button accordingly. Each card is a `.calc-card-wrap` (search/hide unit) containing the clickable `.calc-card` button plus a sibling `.calc-favorite-btn` star toggle — kept as siblings rather than nesting the star inside the card button, since a `<button>` can't contain another `<button>`. Favorited ids persist to `localStorage` (`calc-suite-favorites`); opening any calculator (a valid `#calc/<id>` hash) records it to a capped, deduplicated, most-recent-first `localStorage` list (`calc-suite-recent`, 8 entries via `addRecentId` in `calc-lib.js`). `renderCalculatorIndex()` prepends a "Favorites" and "Recently Used" `.category-group` (same markup/behavior as a real category, so search-filtering and empty-hiding fall out of the existing per-group logic with no special-casing) before the registry's normal categories, omitting either one entirely when its list is empty. Below that, one self-contained block per calculator wires its own `-calc` button's click handler: reads inputs, validates, calls into `calc-lib.js`, writes to its own `-result` div via `showError()` or a template string. There's no shared state between calculators.
- `css/style.css` — dark theme via CSS custom properties on `:root` (`--bg`, `--panel`, `--accent`, etc.). Reuse these variables rather than hardcoding colors. `.view` controls show/hide (used by both the index and every calculator panel); `.tab-panel` only adds the calculator's boxed card styling.
- `js/i18n.js` — translation lookup keyed by literal English source text (not abstract keys), so existing markup doesn't need per-element key attributes. `t(text)` looks up the active language's dictionary and falls back to `text` unchanged when untranslated. `applyTranslations()` walks every leaf DOM element (no element children) plus `input`/`textarea` placeholders and rewrites their text via `t()`, skipping anything inside `.result` (calculated output, not static UI). The header's `#lang-select` is populated from `SUPPORTED_LANGUAGES` and drives `setLanguage(code)`, which persists the choice to `localStorage` (`calc-suite-lang`) and re-renders the calculator index (its cards are built from the registry at render time, not static markup, so they go through `t()` directly in `renderCalculatorIndex()` rather than the leaf-element pass). Adding a language: add its `{code, name}` to `SUPPORTED_LANGUAGES`, create `js/i18n/<code>.js` calling `registerTranslations('<code>', {"English string": "Translated string", ...})`, and add its `<script>` tag after `js/i18n.js` in `index.html`.

## PWA

The site is an installable, offline-capable PWA. `manifest.json` (name, icons in `icons/`, `theme_color`/`background_color` matching `css/style.css`'s `--bg`) is linked from `index.html` along with an `apple-touch-icon`. `sw.js` is a cache-first service worker, registered from an inline script at the bottom of `index.html` (guarded by `if ('serviceWorker' in navigator)`). Its `CACHE_NAME` embeds `CACHE_VERSION`, a `'dev'` placeholder in the source that the CI `deploy` job (see below) replaces with the deploy commit SHA via `sed` before publishing — this means every deploy gets a distinct cache name, and the `activate` handler deletes any cache that doesn't match the current version, so returning visitors pick up new JS/CSS instead of being stuck on a stale cache. `sw.js` explicitly lists every file to precache (`index.html`, `manifest.json`, `css/style.css`, every `js/*.js` and `js/i18n/*.js` file, and the two non-maskable icons) — a new calculator's own markup lives in `index.html` so no list update is needed for that, but a new top-level JS or i18n file must be added to `PRECACHE_URLS`. Lighthouse's "pwa" category/audits were removed upstream in Lighthouse 10+, so PWA correctness is verified instead via `tests/e2e/pwa.spec.js` (manifest fetch/shape, service-worker activation, and a real offline reload+calculation) and, for installability specifically, Chrome DevTools Protocol's `Page.getInstallabilityErrors` (expect `[]`).

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
- Some calculators (currently One-Rep Max, Compound Interest, Baker's Percentage, BMI, Concrete, Stopping Distance, Sunrise/Sunset, CIDR/Subnet, Moon Phase — one per category, added for #454) end with a `<details class="how-it-works"><summary>How this works</summary>...</details>` block explaining the actual formula/method in plain language, collapsed by default. This is static content (verify any claims against the real `calc-lib.js` implementation before writing it, not from general knowledge) rather than DOM wiring, so it isn't unit-tested — `tests/e2e/how-it-works.spec.js` covers presence/expand behavior instead. Not yet translated (falls back to English via `t()` like any untranslated string) — adding a new one doesn't require touching `js/i18n/*.js`.
