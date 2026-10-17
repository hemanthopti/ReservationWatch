# Codex Instructions — ReservationWatch

## Mission
Build an independent, evidence-based, mobile-first portal covering India's reservation rules, reach, effects, debates, and history. Do not present the project as a government service.

## Fixed infrastructure constraint
No additional paid hosting, database, AI API, VPS, or other cloud services. Production targets the existing Hostinger shared hosting with Node.js Web Apps and MySQL. Validate actual hosting deployment capabilities before choosing runtime-specific approaches.

## Tech stack
- Frontend: React, TypeScript, Vite
- Design: Tailwind CSS, shadcn/ui, accessible UI patterns
- Backend: Node.js, Fastify, TypeScript
- Data: Prisma + MySQL
- Charts: Apache ECharts when needed
- Document previews: PDF.js where suitable
- Project: npm workspaces with apps/web, apps/api and packages/shared (adjust only with written rationale)
- API: versioned paths `/api/v1`, health check `/api/health`
- No production database work until migration strategy approved

## Engineering rules
1. Design mobile-first, keyboard accessible, with strong contrast, semantic labels and responsive tables.
2. Keep the public application readable without account creation. Restrict admin functionality server-side.
3. Store community identities separately from jurisdiction-specific official list entries and effective-dated rules.
4. Preserve source metadata, publication date, effective date, last verification date, and audit history.
5. No invented legal claims, community-category mappings, quotas, sources or research findings.
6. Use conspicuously labelled synthetic fixture data in prototypes; do not turn fixtures into official data.
7. Don't classify similarly named communities as legally equivalent merely from fuzzy search.
8. Avoid definitive personal eligibility claims.
9. Keep secrets in environment variables. Commit `.env.example`, never `.env`.
10. Keep external dependencies free/open source; avoid unnecessary runtime services.
11. Write automated tests for meaningful logic; run lint, typecheck, tests and build before PR.
12. Don't modify production settings, databases, or deploy without explicit approval.
13. Prefer feature branches and reviewable small PRs; do not force-push the default branch.
14. Track technical decisions in `docs/architecture.md`.

## Implementation priority
Start with an accessible, responsive UI shell and clearly synthetic sample data. Include Rules, Reach, Effects, Debates, History, Data & Tools, global search, community profile, jurisdiction profile and comparison views. Integrate verified data sources and MySQL only in subsequent issues.

## Handoff format
At the end of each task, report files changed, commands run, test results, assumptions and open questions.

## Mandatory per-module testing and reviewer handoff
- Read and follow `docs/quality-gates.md` **for every module**, including SETUP-001. Every feature must add relevant automated coverage and run the complete applicable check matrix after the final change.
- Verify behavior in the running application as well as in automated tests; UI modules require mobile, desktop and basic accessibility checks. Report exact test commands, counts, pass/fail/skip statuses and any remaining gaps. Never invent test execution or results.
- Describe precisely **what was built**, **how it works**, **how someone can use and reproduce it**, **what was tested**, **what failed or was skipped**, and **remaining limitations**.
- Report this in the GitHub pull request using `.github/pull_request_template.md`. Mark PR as draft if any required quality gate is incomplete or failing.
- Do not treat a pushed branch as finished; request review and pause before merge/deploy or the next issue. GitHub is the handoff path; this Codex session cannot send an unsolicited message to ChatGPT.
