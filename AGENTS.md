# Mini Finance — AGENTS.md

Vanilla HTML/CSS/JS personal budget simulator. Static site, no build tools, no package manager.

## Commands

- **Serve** (required — ES modules block `file://`): `pnpx serve .` or `python -m http.server 8000` or VS Code Live Server
- No `p npm install`, no tests, no linter, no CI

## Architecture

| Layer | Files |
|-------|-------|
| Entrypoint | `index.html` → `<script type="module" src="assets/scripts/main.js">` |
| Bootstrap order | `theme.js` → `carrusel.js` → `auth.js` → `transition.js` → `router.js` |
| Pages | `index.html` (landing), `pages/dashboard.html` (panel), `pages/resumen.html` (goals + history) |
| Router | `router.js` reads `document.body.dataset.page` — values: `dashboard`, `resumen` |
| CSS | `main.css` imports layers: `reset → variables → layout → components → pages → responsive` |
| Auth | localStorage keys `mf-accounts` + `mf-active-account`. Plaintext passwords (academic scope). |
| Storage | Per-user namespaced: `mf-movements-{userId}`, `mf-goals-{userId}` |
| Theme | `data-theme` on `<html>`, persisted as `mf-theme` |
| Currency | `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })` |
| Dates | ISO stored, displayed as DD/MM/AAAA via `es-AR` locale |
| Responsive | Mobile-first, breakpoint `768px` |
| Page transitions | `transition.js` intercepts all `<a>` clicks → 260ms CSS fade-out |

## Key gotchas

- **Protected routes**: `dashboard.html` and `resumen.html` redirect to `../index.html` if `isLoggedIn()` is false
- **Modals**: assign funds, edit goal, confirm delete — all in `resumen.html` with `modal-overlay` class toggle
- **Goals filter**: toggle between active/completed via `goals-filter-btn` (click delegation on `#goals-filter-toggle`)
- **Category-based description**: categories `ingreso-extra`, `servicios`, `otros-ingreso`, `otros-gasto` show a description field
- **Branch workflow**: `main` → `develop` → `feature/*` (e.g. `feature/storage`)

## Design specs

UI/UX reference in `C:\Users\matia\OneDrive\Escritorio\Proyecto\recursos\` (`Spec.txt`, `des.txt`, PDFs). Update JS UI and CSS to match those specs when adding features.
