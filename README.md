# TripBuddy

Find small group adventures, host a trip, and plan with your travel crew. The redesigned app includes public discovery, authenticated hosting and membership, profiles, photo uploads, and live group chat.

## Run locally

Requires Node.js 20+ and MongoDB 6+. Run commands from this nested repository directory.

```sh
npm ci --prefix server
npm ci --prefix client
npm start
```

The launcher starts MongoDB on loopback port 27018 if needed. On Windows it uses the installed MongoDB 6 path; elsewhere `mongod` must be on PATH. Set `MONGOD_PATH` for another installation. In a second terminal run `npm run seed` to add sample itineraries.

- Frontend: **http://localhost:5173**
- Backend readiness: **http://127.0.0.1:3001/healthcheck**
- Development database: `mongodb://127.0.0.1:27018/tripbuddy_dev`
- Demo login: **demo@tripbuddy.local / TripBuddy2026!**

`npm start` builds the frontend and runs its preview with the API. `npm run dev` uses Vite hot reload. Ctrl+C stops processes the launcher started; an existing MongoDB process is left running. API port 3001 avoids an existing app on 3000. Set `PORT` or `CLIENT_PORT` to override.

The repeatable seed adds six labeled demo itineraries and three sample profiles, without dropping data or resetting existing passwords. It refuses any database except loopback `tripbuddy_dev`. Photos come from existing repository assets and illustrate the sample trips.

### Environment

Copy `server/.env.example` to `server/.env`; use a random `SESSION_SECRET` to preserve sessions across restarts. Without one, development generates a per-process secret. The backend binds to loopback by default. `CLIENT_ORIGIN` must match the frontend URL; use `http://localhost:5173`. Vite proxies API/uploads/sockets through `API_PROXY_TARGET` (default `http://127.0.0.1:3001`). The root launcher overrides the backend example port 3000 with 3001.

In this restricted Windows workspace:

```powershell
$env:NODE_OPTIONS='--preserve-symlinks --preserve-symlinks-main'
node scripts/dev.js --preview
```

Preview avoids a sandbox directory restriction in Vite's dependency optimizer. Package downloads were blocked here; compatible locally installed packages were copied into the workspace and their original registry integrity metadata retained in the lockfile. On a normal machine use `npm ci`.

## Verify

```sh
npm test
npm run stress
npm run lint
npm run build
```

Backend checks require MongoDB on loopback 27018. They create their own named `_test` databases, remove those databases on completion, and refuse occupied test API ports. They never use development or hosted data. The stress workload intentionally includes successful reads, rejected invalid requests, and capacity conflicts; failure means an unexpected status, timeout or invariant violation.

With the preview running, `npm run test:ui` runs optional Playwright browser checks. Set `BROWSER_PATH` to an installed Chromium browser if needed (Windows defaults to Edge). It creates a disposable preview account, covers desktop/mobile, discovery, publishing/editing, chat, profile saving and logout, then deletes that account and its trips. Screenshots go to ignored `.local/ui/`.

Measured results: [docs/verification.md](docs/verification.md).

## Backend behavior

- Server sessions are persisted in MongoDB and regenerated at login. Browser-supplied user IDs never grant authorization.
- Only hosts edit/delete trips; profile writes require ownership; chat requires current trip membership.
- Capacity is guarded atomically in MongoDB. A per-trip queue orders membership, edits, deletion and chat operations within one API process.
- Public/personal/hosted lists filter before pagination: `limit` (max 100), `offset`, literal `q` search, and `category`.
- Images are limited to 5 MB, validated by content signature, and stored in `server/uploads/`. Back up uploads with the database. This replaces mandatory S3 setup.
- Chat retains the latest 1,000 messages and paginates reads, bounding the former unbounded embedded array.
- Sign-in and first-time account creation use Google. Configure `VITE_GOOGLE_CLIENT_ID` in `client/.env` and the matching `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `server/.env`; add `http://localhost:5173` as an authorized JavaScript origin in that Google OAuth web client. Live identity verification needs credentials and was not available for end-to-end testing. Legacy email/password API routes remain available for local development and tests, and are disabled by default in production (`ALLOW_LEGACY_PASSWORD_AUTH=true` is an explicit opt-in).

This is a single-process local setup. Multi-process hosting needs replica-set transactions or shared mutation coordination, shared rate limiting, and shared upload storage. MongoDB capacity checks stay atomic across processes; the queue does not. Production needs HTTPS and a strong session secret. If TLS terminates at a trusted reverse proxy, set `TRUST_PROXY_HOPS` to that exact hop count (default 0). Existing databases with duplicate emails, usernames or trip chats require reconciliation before unique indexes can build. Cross-document updates are not crash-atomic transactions.

Local uploads are limited to 5 MiB per file, 50 MiB per account, and 5 GiB across the API's upload directory by default. Set `USER_UPLOAD_QUOTA_BYTES` or `UPLOAD_STORAGE_QUOTA_BYTES` to adjust these limits. These filesystem quotas are coordinated within a single API process; production with multiple replicas should use shared object storage and a shared quota ledger.

## Containers and CI

`docker compose up --build` starts MongoDB, API on loopback 3000, and a static Nginx frontend on loopback 5173, with database/upload volumes and health checks. Set `VITE_GOOGLE_CLIENT_ID` in the Compose `.env` file so the production frontend build can enable Google sign-in. Put the stack behind HTTPS before exposing it publicly; the TLS ingress should add HSTS and set `TRUST_PROXY_HOPS` to the exact trusted proxy count. Docker execution may require Docker Desktop. CI installs dependencies, runs real backend tests against its Mongo service, then lints/builds the UI.

## Layout

`client/src`: React interface, routing, API helper and styling. `server/app.js`: API/session/socket boundaries. `server/models`: storage. `scripts`: launcher, restricted demo seed, isolated load test. Local workflows never deploy or commit.
