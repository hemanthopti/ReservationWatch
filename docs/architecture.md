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
