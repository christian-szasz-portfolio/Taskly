import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router, type ActivatedRouteSnapshot, type CanActivateFn, type UrlTree } from '@angular/router';
import { map, of, type Observable } from 'rxjs';
import { SessionContextService } from '../services/project/session-context.service';

/**
 * Route guard that prevents access to task pages when no project is active,
 * or when the project key in the URL doesn't match the active project.
 *
 * This guard ensures users can only access task-related features when they
 * have an active project selected in their session context AND the URL contains
 * the correct project key.
 *
 * The guard waits for the session context to be initialized before making
 * a decision, combining RxJS for async operations with signal-based state.
 *
 * Note: On the server (SSR), this guard always allows access to prevent
 * route extraction errors during build time.
 *
 * Usage in routes:
 * ```typescript
 * {
 *   path: ':projectKey',
 *   canActivate: [activeProjectGuard],
 *   loadComponent: () => import('./task-kanban-board')
 * }
 * ```
 */
export const activeProjectGuard: CanActivateFn = (route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> => {
  const platformId = inject(PLATFORM_ID);

  // On the server, always allow access (SSR route extraction)
  if (!isPlatformBrowser(platformId)) {
    return of(true);
  }

  const sessionContext = inject(SessionContextService);
  const router = inject(Router);

  // Wait for the session context to be ready, then check if there's an active project
  return sessionContext.whenReady$.pipe(
    map(() => {
      const activeProject = sessionContext.currentProject();

      // No active project - redirect to no-active-project page
      if (!activeProject) {
        return router.createUrlTree(['/no-active-project']);
      }

      // Use project key if available, otherwise fall back to ID
      const activeProjectKey = activeProject.key ?? activeProject.id;

      // Get the project key from the route parameters
      const routeProjectKey = route.paramMap.get('projectKey');

      // If there's a project key in the route, validate it matches the active project
      if (routeProjectKey && routeProjectKey.toUpperCase() !== activeProjectKey.toUpperCase()) {
        // Project key mismatch - redirect to the correct project key
        const currentUrl = route.url.map((s) => s.path);

        // Replace the wrong project key with the correct one
        if (currentUrl.length > 0) {
          currentUrl[0] = activeProjectKey;
        }

        return router.createUrlTree(['/tasks', ...currentUrl]);
      }

      return true;
    })
  );
};

/**
 * Guard that allows access only when there is NO active project.
 * Used for the no-active-project page to prevent access when a project is active.
 *
 * Note: On the server (SSR), this guard always allows access to prevent
 * route extraction errors during build time.
 */
export const noActiveProjectGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const platformId = inject(PLATFORM_ID);

  // On the server, always allow access (SSR route extraction)
  if (!isPlatformBrowser(platformId)) {
    return of(true);
  }

  const sessionContext = inject(SessionContextService);
  const router = inject(Router);

  return sessionContext.whenReady$.pipe(
    map(() => {
      const activeProject = sessionContext.currentProject();
      if (!activeProject) {
        return true;
      }

      // Redirect to the kanban board with the active project key (or ID as fallback)
      const projectKey = activeProject.key ?? activeProject.id;
      return router.createUrlTree(['/tasks', projectKey]);
    })
  );
};
