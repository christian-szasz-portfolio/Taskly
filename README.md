# Taskly (demo)

Taskly is a task tracker I built: a Kanban board with a backlog, epics, a resolved view and time
tracking, on Angular 22 and ASP.NET Core (.NET 10). This repository is the source of its public
demo, a cut-down version that anyone can try at the address below without signing up, and that costs
next to nothing to keep online.

- **Live demo:** https://taskly.christianszasz.dev (once it is deployed)
- **Case study:** https://christianszasz.dev/work/taskly

## What a visitor gets

You land on a workspace that is already in use: two projects with their epics, tasks and subtasks,
two weeks of logged time, and a few notifications waiting to be read. You can open any task,
rewrite it, move it across the board, change its priority or assignee, correct the time logged
against it and start a comment thread on it. The data is yours alone and stays in your browser, so
nothing you do reaches another visitor.

The demo runs for seven days. After that the workspace turns read-only and offers a fresh trial,
which clears your copy and seeds a new one.

## How it differs from the full product

The full Taskly has accounts, a SQL Server database, CQRS handlers, real-time updates over SignalR
and runs under .NET Aspire. The demo keeps the product a visitor sees and drops the machinery
behind it:

- **No sign-in.** Every visitor is the same demo user.
- **No database.** The server hands out one seeded dataset (`GET /api/demo/seed`). From then on
  the browser owns the data, in `localStorage`.
- **Edit, but never create or delete.** The seeded workspace stays whole, whatever a visitor
  changes in it.

| Area | Create | Edit | Delete |
| --- | --- | --- | --- |
| Tasks and subtasks | no | yes | no |
| Time entries | no | yes | no |
| Projects | no | no | no |
| Notifications | no | read or unread | no |
| Comments | yes | yes | yes |

Comments are the exception on purpose: the thread is the one place a visitor can write something
new, and it only ever lives in their own browser. Where the full product has a button for
something the demo does not do, such as uploading an attachment or importing a project, the button
is still there, disabled, with the reason in its tooltip.

## How it is built

| Path | What it holds |
| --- | --- |
| `src/Taskly.Web/ClientApp` | The Angular 22 client: standalone components, zoneless change detection, signal-based stores in `core/state`, built with Vite through Analog |
| `src/Taskly.Web` | The ASP.NET Core host: serves the built client, the seed endpoint and the health probes |
| `src/Taskly.Web/Demo` | The in-memory demo backend: the seed, split into managers (writes) and providers (reads) |
| `src/Taskly.Contracts` | Enums shared by the host and the client's contracts (issue status, type and so on) |
| `src/Taskly.Common` | The security option types the host binds its settings to |
| `test/` | MSTest projects for `Taskly.Common` and `Taskly.Web` |

The client's API services work on `localStorage` directly, and they carry only what a visitor can
do: there is no HTTP code for the full product's API, no create or delete path outside comments,
and no import, export, trash or contributor management.

The host is small, but I kept the security work from the full product, since a public demo is
exactly where it gets tested:

- A Content Security Policy with a fresh nonce per request. The page is written by
  `IndexHtmlNonceWriter` rather than served from disk, so the inline scripts the Angular build
  emits carry the same nonce as the header.
- Security headers on every response, and HSTS outside development.
- A rate limit of 200 requests a minute per caller. Forwarded headers are read first, so behind a
  reverse proxy the limit applies to each visitor rather than to the proxy.
- CORS closed by default. The client is served from the same origin, so it needs none.
- `/health` for liveness and `/health/ready` for readiness. The readiness probe reads the demo
  data, which also warms it, so the first visitor after a cold start does not wait for the seed.
- Log capture into Azure Table Storage for a daily digest email, when a storage connection is
  configured. Without one it registers nothing and logging stays on the console.

## Tests and checks

StyleCop and the .NET analyzers run in every build, and the build is kept at zero warnings. The
client adds ESLint, Vitest unit tests, and Playwright tests that walk the demo in a browser.

## Hosting

The `Dockerfile` at the root builds the client and the host into one image, which serves plain
HTTP behind a proxy that terminates TLS. Nothing in it keeps it busy between requests, so it can
scale to zero. Its one optional secret, the storage connection for the daily digest, comes from the
environment and is never written in a committed file.

## Known limitations

- **It does not build from a clone.** The code depends on private packages from my Common library
  (log capture and the daily digest email), which live on a private package feed. Without access
  to that feed the restore fails, so a clone is for reading the code. The live demo is the way to
  try it.
- **The policy still allows inline styles.** The page's scripts carry the nonce, but the styles
  Angular adds at runtime do not yet, so switching `Security:Csp:AllowInlineStyles` off today
  would leave the app unstyled.
- **Each visitor's changes live in their browser only.** Clearing site data or switching browsers
  starts a new trial.

## Licence

All rights reserved. You may read, clone and run the code to evaluate my work; any other use needs
my permission. See [LICENSE](LICENSE).

---

*This project has been co-authored by Claude Code.*
