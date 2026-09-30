import { Injectable, computed, inject } from '@angular/core';
import { SessionContextService } from '../project/session-context.service';

/**
 * Service that provides task navigation routes based on the active project.
 * All task routes include the project key to ensure proper context.
 */
@Injectable({ providedIn: 'root' })
export class TaskNavigationService {
  private readonly sessionContext = inject(SessionContextService);

  /**
   * The project key of the currently active project (or ID as fallback), or null if none.
   */
  public readonly projectKey = computed(() => {
    const project = this.sessionContext.currentProject();
    return project ? (project.key ?? project.id) : null;
  });

  /**
   * Whether there is an active project that can be navigated to.
   */
  public readonly canNavigate = computed(() => this.projectKey() !== null);

  /**
   * Route to the Kanban board for the active project.
   * Returns null if no project is active.
   */
  public readonly kanbanRoute = computed(() => {
    const key = this.projectKey();
    return key ? ['/tasks', key] : null;
  });

  /**
   * Route to the Epics page for the active project.
   * Returns null if no project is active.
   */
  public readonly epicsRoute = computed(() => {
    const key = this.projectKey();
    return key ? ['/tasks', key, 'epics'] : null;
  });

  /**
   * Route to the Backlog page for the active project.
   * Returns null if no project is active.
   */
  public readonly backlogRoute = computed(() => {
    const key = this.projectKey();
    return key ? ['/tasks', key, 'backlog'] : null;
  });

  /**
   * Route to the Resolved page for the active project.
   * Returns null if no project is active.
   */
  public readonly resolvedRoute = computed(() => {
    const key = this.projectKey();
    return key ? ['/tasks', key, 'resolved'] : null;
  });

  /**
   * Gets the route to view a specific task item.
   * @param issueKey The issue key of the task item
   * @returns The route array or null if no project is active
   */
  public getDetailRoute(issueKey: string): string[] | null {
    const key = this.projectKey();
    return key ? ['/tasks', key, issueKey] : null;
  }

  /**
   * Gets the route to edit a specific task item.
   * @param issueKey The issue key of the task item
   * @returns The route array or null if no project is active
   */
  public getEditRoute(issueKey: string): string[] | null {
    const key = this.projectKey();
    return key ? ['/tasks', key, issueKey, 'edit'] : null;
  }
}
