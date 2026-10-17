# Technical architecture (draft)

## Constraints
Existing Hostinger plan: 5 Web Apps, 50 GB NVMe, managed MySQL and advertised Node.js app support. Verify effective Node.js versions, build process, runtime lifecycle, process memory, filesystem persistence, database quota and custom subdomain configuration in hPanel before live deployment. Do not assume local filesystem survives redeploys.

## Preferred stack
React + Vite + TypeScript + Tailwind + shadcn/ui; Fastify + Node.js; Prisma + MySQL. All dependencies free or open source. Build local UI against fixtures before integrating the database.

## Monorepo concept
```
apps/web           # public portal + protected admin UI
apps/api           # Fastify server and REST APIs
packages/shared    # shared types, validation and view models
docs               # product, architecture, evidence standards
```
Hostinger deployment target: one Node.js web app serving built React SPA/static assets plus `/api`, if build/runtime validation confirms feasibility.

## Core domain concepts
`Community` (neutral identity), `CommunityAlias` (name and language; no assumed legal equivalence), `Jurisdiction`, `OfficialList`, `OfficialListEntry`, `ReservationRule`, `Sector`, `SourceDocument`, `SourceExcerpt`, `EvidenceStudy`, `ResearchClaim`, `ObservationDataset`, `VerificationRecord` and `ChangeEvent`.

Scope and date facts by jurisdiction and sector; track published, effective-from, effective-to, recorded and last-verified timestamps separately. Keep historic records; mark superseded versions rather than silently overwriting them.

## Search and performance
Start with indexed normalized aliases and MySQL full-text search. Use pagination, cache suitable public endpoints and keep expensive OCR/indexing outside the HTTP request path. Don't introduce additional paid search infrastructure.

## Operational safeguards
Use environment variables, parameterized ORM queries, rate limiting, admin authentication, backups independent of the hosting account and restrictive upload validation. Avoid storing private applicant caste certificates in the MVP.

## Development
Local development -> GitHub feature branch -> reviewed PR -> tested Hostinger deploy. Never merge/provision real production data without owner approval.

## Decision: issue #1 scaffold (2026-10-17)

Use Node.js 24 and npm workspaces with one lockfile. React/Vite and Tailwind CSS
provide the minimal public homepage; native semantic elements suffice at this
stage, with shadcn/ui deferred until interactive components require it. No records,
legal claims or community fixtures are introduced. Shared API types live in
`packages/shared`; type-only consumption allows development without a separate
shared-package watcher. Builds still compile that package first.

Vite proxies `/api` in development. In production, Fastify serves the Vite output
and health route in one process, using a path relative to the compiled server.
This avoids CORS configuration and an additional production frontend service.
Unrecognized API/asset requests remain 404; browser HTML requests can receive the
SPA shell. Configuration uses environment variables and validates PORT. Node's
environment-file support is used locally; hosting supplies production variables.

Hostinger documentation confirms platform support for Fastify and Node 24. Actual
account settings, workspace build/artifact retention and runtime behavior still
need hPanel validation before deployment; see [deployment approach](deployment.md).
No production access, database integration, migrations or deployment are included.
Tests cover health, routing boundaries and configuration; a separate smoke command
exercises the compiled server and real built assets over HTTP.


## Review correction: development binding and browser checks

When HOST is absent, non-production binds to 127.0.0.1; production binds to
0.0.0.0 for the hosting proxy. Explicit HOST remains authoritative. Regression
tests cover unset/development/test/production environments and overrides.
A small Playwright harness verifies the scaffold in desktop and mobile-sized
Chromium, including the Vite health proxy, status states and keyboard navigation.
Browser binaries and screenshots stay local and ignored; no runtime service is added.
Health status ignores settled requests from cleaned-up effects so development
StrictMode cancellation cannot replace the current loading/success state.


## Decision: UI-001 interactive frontend (2026-10-17)

Extend the existing React/Vite application with React Router (`BrowserRouter`) for
nested pages, HTML deep links and browser history. Home ships in the main bundle;
other sections are lazy-loaded behind a shared Suspense skeleton. No backend
endpoints, runtime services or database work are added; Fastify stays health-only.

**URL state.** Filters, selections and expanded records live in query parameters
(`useQueryState`) so every view is shareable and survives reloads. Filter changes
replace the history entry; page navigation pushes. React Router applies URL updates
in a transition, so the hook keeps an optimistic copy until the URL catches up;
otherwise controlled checkboxes revert momentarily and rapid typing can be lost.

**Data model.** Typed fixtures (`apps/web/src/data/types.ts`, `fixtures.ts`) mirror
the planned domain: `Community` (with typed aliases and explicit look-alike links),
independent `ListEntry` records per jurisdiction with effective-from/exclusive
effective-to dates, versioned `Rule` records, `Observation` numerators/denominators,
studies, debate claims tagged normative/empirical, timeline events and `Source`
records with published/effective/recorded/last-verified dates and audit history.
Superseded versions are kept, never overwritten. Pure query helpers in `explore.ts`
(search, effective-date resolution, comparison, aggregation, exports) are unit-tested
without a browser. Everything is fictional; Centre/Karnataka are navigation labels.
Rule "placeholder units" are deliberately not percentages or quotas.

**Search.** Literal, case-insensitive word-prefix matching; single characters must
equal a whole word (so "Example Community A" does not match "alias"). No fuzzy or
phonetic matching, so similar names are never conflated (AGENTS.md rule 7).
The header/hero/menu search is a WAI-ARIA 1.2 combobox with keyboard navigation.

**Charts.** Small dependency-free components (horizontal bars, single-series trend
line, paired bars). Marks are native buttons with hover/focus tooltips and visible
selection; every chart has a table equivalent. The paired chart uses validated
categorical slots (blue/orange; CVD ΔE 24.7) with a legend and direct labels.
ECharts would add ~300 kB for interactions this small. shadcn/ui remains
unnecessary; native form controls and `<details>` keep keyboard behaviour predictable.

**Styling.** Tailwind provides the reset; a single token-based, mobile-first
stylesheet defines components. Narrow screens turn data tables into labelled cards
(`.stack-on-mobile`) instead of horizontal scrolling. Light theme only for now.

**Safety labels.** A persistent "Independent project · Not a government website"
bar and a synthetic-data banner appear on every route; data screens add limits
callouts. Exports put the disclaimer at file level and on every record. Source
detail explains why no document preview or link exists. Admin is labelled
"Coming later" and is not simulated.

**Testing.** Node tests cover search, filters, effective dates, rule versions,
comparison, aggregation, exports and fixture invariants. Playwright covers every
navigation item, search combobox, filters/reset, community profiles, jurisdiction
as-of history, comparison guidance, chart selection, studies, debates, timeline,
exports, deep links/back/forward/404, skip link and the mobile menu on desktop and
mobile viewports. Production smoke checks SPA deep links on the compiled server.
Hostinger account validation remains a separate pre-deployment requirement.
