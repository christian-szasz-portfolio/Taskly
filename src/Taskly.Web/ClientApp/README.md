# Taskly client

The Angular 22 client of the Taskly demo: standalone components, zoneless change detection and
signal-based stores, built with Vite through Analog.

## Where things are

| Folder | What it holds |
| --- | --- |
| `src/app/features/tasks` | The board, backlog, epics, resolved view, task detail and the task and subtask editors |
| `src/app/features/time-tracking` | The time-tracking calendar and its entry editor |
| `src/app/features/home` | The projects: the home page and its project cards |
| `src/app/features/maintenance` | The notifications page and the system tasks page |
| `src/app/features/demo` | The trial-expired page |
| `src/app/core/state` | The stores: the demo user and trial clock, projects, tasks, time entries, notifications |
| `src/app/core/services` | The API services, and under `demo/` the seed hydration and the `localStorage` data layer |
| `src/app/shared` | Components, directives and styles used across features |

## The demo data layer

On first load `DemoHydrationService` fetches `GET /api/demo/seed` and writes it into
`localStorage` collections. From then on each API service reads and writes those collections
directly, so the host is asked only once. A seed version is stored alongside, and a visitor holding
data from an older seed gets a fresh copy.

`core/state/auth.store.ts` holds the demo user and the seven-day trial clock; edits are allowed
while the trial runs. The services have no create or delete outside comments, so the UI shows
those buttons disabled; the repository README has the matrix.

## Routes

| Route | What it shows |
| --- | --- |
| `/home` | The projects |
| `/tasks/:projectKey` | The Kanban board |
| `/tasks/:projectKey/backlog` | The backlog |
| `/tasks/:projectKey/epics` | Epics |
| `/tasks/:projectKey/resolved` | Resolved items |
| `/tasks/:projectKey/:issueKey` | A task |
| `/tasks/:projectKey/:issueKey/edit` | A task, open in its editor |
| `/no-active-project` | Where the task pages send you when no project is active |
| `/time-tracking` | The time-tracking calendar |
| `/maintenance` | Notifications and system tasks |
| `/trial-expired` | Where an expired trial lands, with the button that starts a new one |

---

*This project has been co-authored by Claude Code.*
