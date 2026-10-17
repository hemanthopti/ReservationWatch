# Quality gates and Codex → ChatGPT handoff

This policy applies to **every module, feature, fix, and pull request** in ReservationWatch, starting with SETUP-001. Follow `AGENTS.md`. This project is independent, nonpartisan, source-first, mobile-first, and must not add paid infrastructure.

## Completion protocol

**Never treat "code written" as "module completed."** A module is ready for review only after implementation, repeatable tests, behavior verification, a written handoff, and a GitHub pull request.

1. Read the relevant GitHub issue, documentation, and acceptance criteria.
2. Work only inside `/home/hemanthtn/projects/ReservationWatch` / repository `hemanthopti/ReservationWatch`. Do not inspect or change other repos.
3. Implement in a dedicated feature branch; make no production changes.
4. Add or update automated tests that cover success paths, edge cases, invalid inputs and regressions.
5. Execute applicable quality gates **after the final code change**, record actual commands and outcome. A prior successful run is not evidence for later changes.
6. Independently exercise critical user workflows and document observed behavior and limitations.
7. Audit intended changes; do not commit `.env`, credentials, `node_modules`, logs, generated build files, or private user data.
8. Push only the feature branch, open a pull request referencing the issue, and put the full report described below into the PR description. If blocked or tests fail, open a **draft PR** with the blocker instead of declaring completion.
9. **Stop.** Do not merge, deploy, or begin the next module before an explicit approval. Review feedback is answered on the PR with fixes and fresh test results.

## Minimum verification matrix

| Gate | Expectations |
|---|---|
| Fresh install and reproducibility | `npm ci` succeeds from lockfile, where feasible. Do not delete/update lockfile to conceal failures. |
| Static checks | `npm run lint`, `npm run typecheck`, `git diff --check`, and relevant formatting checks. |
| Unit tests | Test utilities, transforms, filters, date-scope logic, data normalization, and all introduced business logic. |
| API/integration tests | Test route contracts, valid/invalid requests, error handling, authorization boundaries, and data boundaries (use isolated fixture data; never production DB). |
| UI/component tests | Validate loading, empty/error/success states, filter changes, keyboard interaction, rendering and navigation where applicable. |
| Browser end-to-end tests | Test critical user journeys (e.g. find a community, compare jurisdictions, view evidence) with Playwright or equivalent once installed. At least one desktop and one mobile-sized viewport for UI modules. |
| Accessibility/responsiveness | Check semantic controls, labels, keyboard focus, contrast, overflow, small-screen layout. Report tool-assisted and manual checks separately. |
| Data/legal integrity | Synthetic content is visibly labelled; claims carry citations when verified. No inferred legal equivalence of caste names and no definitive eligibility verdict. Verify jurisdiction, sector, dates and source scope. |
| Production smoke | `npm run build` and `npm run test:production` (or documented successors); verify frontend assets and `/api/health`. |
| Security basics | No secrets in commits; check inputs, output encoding, dependencies, and protected admin endpoints where relevant. |

Tests **must be relevant**. For a pure documentation change, explain why a browser test is not applicable. For a UI module, do not skip visual/manual/browser verification without marking that explicitly. For a data module, add substantive correctness/temporal tests. If a required script or test harness doesn't exist, first add it in scope if reasonable; otherwise mark **NOT IMPLEMENTED / BLOCKED**, explain why and propose a follow-up issue.

**Never fabricate test runs, screenshots, coverage figures, official sources, or browser results.** Distinguish PASS / FAIL / SKIPPED / NOT RUN / NOT APPLICABLE.

## Mandatory pull-request completion report

### 1. Scope and ticket
- Issue number and module:
- Branch / commit SHA:
- What was requested:
- What was implemented (routes, pages, components, business logic, database changes):

### 2. How it works
- User journey in numbered steps:
- API endpoints and example requests/responses if applicable:
- Data flow, state management and major architectural decisions:
- Demo/sample-data disclaimers and relevant constraints:

### 3. How to run and reproduce
- Local prerequisites:
- Exact install/start commands:
- Browser URLs and test steps:
- Configuration or migration changes (without secrets):

### 4. Test evidence
| Test / check | Command or method | Result | Notes / evidence |
|---|---|---|---|
| Clean dependency install | | PASS/FAIL/... | |
| Lint | | | |
| Typecheck | | | |
| Unit | | | |
| Integration/API | | | |
| UI/component | | | |
| Browser E2E desktop | | | |
| Browser E2E mobile | | | |
| Accessibility | | | |
| Build | | | |
| Production smoke | | | |
| Security/secret audit | | | |

Include actual test totals where available and meaningful failure logs (redacted), not only "all good." Screenshots are recommended for significant UI changes, with synthetic demonstration data only.

### 5. Acceptance criteria
- Each issue criterion with **PASS / PARTIAL / FAIL** and supporting location/test.

### 6. Risks, limitations, open questions
- Known defects and untested behavior:
- Performance/security/deployment caveats:
- Follow-up work:

### 7. Handoff to reviewer
- Files that deserve special review:
- Decision requested from ChatGPT / owner:
- **Status: READY FOR REVIEW** only when applicable gates pass; else **BLOCKED**.
- **Do not merge or deploy** until explicitly authorized.

## Communication limitations

Codex **cannot directly message ChatGPT in this chat** from the local VS Code extension. The GitHub issue + pull request + review comments are the durable handoff. ChatGPT can inspect the PR when the user returns to this conversation and asks for a review, or as part of a separately configured scheduled check. Publishing a PR does **not** automatically wake or notify this chat. Keep the owner informed with the PR link.
