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

This repository is being initialized with instructions and architecture documents before implementation. See `AGENTS.md` for Codex conventions and `docs/` for product and technical specifications.

## Working practices

- Keep production secrets out of Git and never commit `.env` files.
- Use source-verified legal information; keep synthetic demonstration content visibly labelled.
- Develop in branches and review pull requests before merging.
- Keep the site usable without sign-in; require login only for editorial/admin functions.
- Favor accessible mobile-first interfaces and efficient server resource consumption.

## Next steps

See GitHub issues for the implementation backlog. Initial code should be developed locally and submitted as a pull request.
