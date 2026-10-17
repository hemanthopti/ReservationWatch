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
