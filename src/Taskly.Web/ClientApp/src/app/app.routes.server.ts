import { RenderMode } from '@angular/ssr';
import type { ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'home',
    renderMode: RenderMode.Server
  },
  {
    path: 'no-active-project',
    renderMode: RenderMode.Server
  },
  {
    path: 'tasks/:projectKey',
    renderMode: RenderMode.Server
  },
  {
    path: 'tasks/:projectKey/epics',
    renderMode: RenderMode.Server
  },
  {
    path: 'tasks/:projectKey/backlog',
    renderMode: RenderMode.Server
  },
  {
    path: 'tasks/:projectKey/resolved',
    renderMode: RenderMode.Server
  },
  {
    path: 'tasks/:projectKey/:issueKey/edit',
    renderMode: RenderMode.Server
  },
  {
    path: 'tasks/:projectKey/:issueKey',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
