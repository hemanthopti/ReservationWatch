# Hostinger deployment approach — awaiting account validation

## Evidence and limits

Hostinger's [Node.js Web Apps guide](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)
and [version guide](https://www.hostinger.com/support/how-to-select-the-node-js-version-for-your-application/),
reviewed 2026-10-17, list Fastify and Node.js 24 support and configurable build settings.
They describe repository and ZIP upload workflows. This establishes platform-level
compatibility, not proof of the settings or resources available in this account.
No hPanel settings were accessed or changed and no deployment was performed.

Use the existing Node.js Web Apps allowance. Do not add services or upgrade the
plan. Before an explicitly approved deployment, confirm in hPanel:

- The existing plan enables Node.js Web Apps and Node 24 for build AND runtime.
- Repository-root builds support npm workspaces, installing dev dependencies for
  compilation (`npm ci --include=dev`), and `npm run build`.
- The backend entry can be `apps/api/dist/server.js`, with both `apps/api/dist`
  and `apps/web/dist` retained along with installed runtime dependencies.
- The platform's expected `PORT`, proxy routing, lifecycle/restart behavior,
  memory/build limits, HTTPS and temporary-domain settings.
- Root directory and output-directory semantics: do not configure a static-only
  deployment of `apps/web/dist`. Confirm the backend entry and sibling frontend
  build remain available in the deployed tree.

If these controls are unavailable, pause deployment and document the discrepancy;
do not substitute paid hosting or assume a VPS/process manager is available.

## Proposed settings after approval

| Setting | Value |
| --- | --- |
| Project root | Repository root (`.`) |
| Runtime | Node.js 24.x |
| Framework | Fastify, or Other with explicit backend entry |
| Install | `npm ci --include=dev` |
| Build | `npm run build` |
| Start | `npm start` (entry: `apps/api/dist/server.js`) |
| Environment | `NODE_ENV=production`, `HOST=0.0.0.0` |
| Port | Honor platform `PORT`; default 3000 only if confirmed appropriate |

Select a backend output setting that retains the workspace layout; verify its
meaning in hPanel rather than guessing a single output directory. The entry point
resolves frontend files relative to itself, independent of the working directory.
Set production environment in hPanel, without uploading a local development `.env`.
Do not connect an automatically deploying GitHub branch without approval.
For ZIP upload, include workspace manifests, lockfile and sources; exclude `.git`,
`.env`, `node_modules`, caches and logs. Have the platform install and build.

## Runtime and release checks

One Fastify process serves `/api/health` and the Vite build. Future data endpoints
use `/api/v1`. Unknown API and asset paths remain 404; HTML browser navigations
may fall back to the SPA shell. Missing frontend builds fail startup. No database,
persistent writable storage, cron, containers or additional daemon is required.
SIGINT/SIGTERM close Fastify gracefully. Health reports liveness only.

Locally run `npm ci`, lint, typecheck, tests, build and `npm run test:production`.
After an approved deployment, check `/`, generated JS/CSS, `/api/health`, an
unknown API path, process restart, HTTPS and mobile/keyboard behavior. Retain the
previous reviewed artifact for an explicitly approved rollback. MySQL integration
and its migration strategy remain separate, future work.
