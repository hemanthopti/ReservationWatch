# ReservationWatch

**Independent, sourced, nonpartisan exploration of reservation policy in India.**

ReservationWatch is a planned mobile-first research and public-information application to explore:

1. **Rules** — who is listed under which jurisdiction, category, sector, notification and effective date.
2. **Reach** — quotas compared with observed admissions, recruitment, representation and backlog data.
3. **Effects** — what empirical research does and does not establish.
4. **Debates** — evidence-linked arguments and policy disagreements presented fairly.
5. **History** — constitutional provisions, commissions, statutes, government orders and court judgments.
6. **Data & Tools** — comparisons, exports, timelines, and source-document inspection.

> **Independent project; not a government website.** No sample classification, benefit, percentage or source citation may be portrayed as verified. The application is informational and must not give definitive individual eligibility determinations.

## Zero-additional-infrastructure-cost MVP

The initial implementation must fit within the owner's existing Hostinger plan (5 Web Apps, 50 GB NVMe, MySQL), with no paid Supabase, VPS, AI APIs or managed search service.

**Preferred stack:** React + TypeScript + Vite; Tailwind CSS + shadcn/ui; Node.js + Fastify; Prisma + Hostinger MySQL. Serve the built frontend, protected admin console and `/api` through one Hostinger-compatible Node.js application if deployment validation confirms support.

Develop locally in VS Code, use Codex for implementation, review changes in GitHub pull requests, and deploy tested releases to Hostinger. A domain is **not required** to begin local development.

## Project setup status

Issues #1 and #2 provide a local-first workspace and a complete interactive frontend demonstration. See `AGENTS.md` for conventions and `docs/` for product and technical specifications.

## Working practices

- Keep production secrets out of Git and never commit `.env` files.
- Use source-verified legal information; keep synthetic demonstration content visibly labelled.
- Develop in branches and review pull requests before merging.
- Keep the site usable without sign-in; require login only for editorial/admin functions.
- Favor accessible mobile-first interfaces and efficient server resource consumption.

## Next steps

See GitHub issues for the implementation backlog. Initial code should be developed locally and submitted as a pull request.

## Local development (Node.js 24)

From the repository root, with Node.js 24 and npm installed:

```sh
npm ci
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to Fastify at
http://127.0.0.1:3000; `GET /api/health` returns
`{"status":"ok","service":"reservation-watch-api"}`. Stop both with Ctrl+C.
No database, credentials or external services are required.

Optional: copy `.env.example` to `.env` in the repository root to change API
`PORT` or `HOST`. Without HOST, the API binds to loopback in development and all interfaces in production. An explicit HOST overrides either default. Both dev processes use the root configuration; leave
`NODE_ENV=development` locally. Vite uses port 5173 and fails clearly if occupied.
Do not store secrets in `VITE_*` variables (they are public browser configuration).

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:production
NODE_ENV=production npm start
```

The last command serves both the frontend and API at http://localhost:3000
(or the configured port). Build first. `npm run test:production` starts and stops
the compiled production server on port 43189; set `SMOKE_PORT` if occupied.
`npm start` does not build or run a Vite development server.

## Workspace layout

- `apps/web`: React, TypeScript, Vite, React Router and Tailwind CSS research prototype.
- `apps/api`: Fastify health endpoint, production static serving and tests.
- `packages/shared`: shared API contracts; consumed as types in this scaffold.
- `scripts/smoke-production.mjs`: real HTTP smoke check of compiled outputs.

All portal sections are interactive against fictional local fixtures. No records
represent real communities, classifications, quotas, research or legal history.
The admin interface is explicitly coming later. See [deployment instructions](docs/deployment.md) for the proposed
single-process Hostinger setup and the checks still needed in hPanel.


### Prototype browser checks

After `npm ci`, install the test browser once (free; local download), then run:

```sh
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx playwright install chromium
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run test:browser
```

The harness starts isolated development
processes on ports 43190 (API) and 43191 (Vite), then stops them. Desktop (1440×900)
and mobile-sized Chromium (375×812) checks cover API status, navigation, search and filters, independent community
records, comparison, chart selection, study details, debate selection, timeline,
exports, horizontal overflow, skip link and keyboard navigation. Screenshots are
written to ignored `test-results/`. These are representative Chromium workflows, not a full accessibility audit or
physical-device/browser compatibility certification.


## Interactive prototype walkthrough (UI-001)

All content is **synthetic demonstration only**. Centre and Karnataka are navigation
labels; the prototype does not describe their actual laws or policies. No account,
new API endpoint, external data service or database is needed.

| Route | Try it |
| --- | --- |
| `/` | Type `example d` in the hero or header search; use ↑/↓ and Enter on suggestions |
| `/search?q=imaginary` | Filter global results by record type; try a no-match query |
| `/rules` | Switch jurisdiction and sector; expand a rule's version history |
| `/jurisdictions/karnataka` | Change sector and the synthetic "as of" date; include superseded records |
| `/communities` | Search, filter by jurisdiction/sector/category, sort, reset; open an identity |
| `/communities/example-d` | Independent entries (one superseded) and a similar-name warning |
| `/compare` | Swap sides, pick the same jurisdiction twice (guidance appears), toggle sectors, change chart metric, select a bar |
| `/reach` | Change year/sector/institution; select bars and trend points; read the table equivalents |
| `/effects` | Filter imaginary studies by topic/design/jurisdiction; expand methods, results and limitations |
| `/debates` | Change the question; show normative-only or empirical-only statements |
| `/history` | Use the year rail, subject/jurisdiction/year-range filters; expand an event |
| `/data` | Filter the source registry; export filtered sources or full datasets as labelled CSV/JSON |
| `/data/demo-register` | Provenance, separate dates, usage counts and audit history; no fake document |

Filter state is stored in URL query parameters; details and selected panels can be
bookmarked. Browser back/forward and production HTML deep links are supported.
Document previews explicitly explain that no real document exists. Exports are
browser-generated, label every record as synthetic, and are disabled when empty.

`npm test` runs API/configuration and data utility tests. Browser screenshots are
saved under ignored `test-results/` (home, comparison and reach). Run the browser suite above, then open the PNGs locally to review desktop
and mobile layouts. The existing API remains health-only. GitHub Actions (Issue #5)
is deferred; this sprint does not add workflows.
