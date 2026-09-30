import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { type Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import type { Project } from '../../models/project.interfaces';
import type { Subtask, TaskItem } from '../../models/task.interfaces';
import type { Notification } from '../../models/notification.interfaces';
import type { SystemTask } from '../../models/system-task.interfaces';
import type { TimeEntry } from '../../models/time-tracking.interfaces';
import { DEMO_COLLECTION_KEYS, DEMO_STORE_PREFIX, DemoDataService } from './demo-data.service';

// The collection-key registry lives in DemoDataService (it needs it for deletion detection).
// Re-exported here so existing importers of the hydration module are unaffected.
export { DEMO_COLLECTION_KEYS };

/**
 * Bump this whenever the seed shape/content changes so existing visitors (who already have demo
 * data in localStorage from a previous deploy) get re-hydrated instead of keeping stale data.
 */
export const DEMO_SEED_VERSION = '2';

/** Unprefixed so it survives the demo-collection wipe and records the last hydrated version. */
export const DEMO_SEED_VERSION_KEY = 'demoSeedVersion';

/** The backend `Variant` is the frontend `issueType`; everything else is a 1:1 camelCase map. */
type RawTaskItem = Omit<TaskItem, 'issueType'> & { variant: string };

/** Shape of the GET /api/demo/seed payload (DemoSeedResponse). */
interface DemoSeedResponse {
  projects: Project[];
  taskItems: RawTaskItem[];
  subtasks: Subtask[];
  timeEntries: TimeEntry[];
  comments: unknown[];
  notifications: Notification[];
  systemTasks: SystemTask[];
}

/**
 * Loads the full demo dataset produced by the backend factory orchestrator
 * (GET /api/demo/seed) and persists it into the localStorage collections the mock service
 * managers read from. The backend is the single source of truth for the seed; the client owns
 * the data thereafter (edits persist locally for the 7-day trial). SSR is skipped.
 */
@Injectable({ providedIn: 'root' })
export class DemoHydrationService {
  private readonly http = inject(HttpClient);
  private readonly demoData = inject(DemoDataService);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Hydrates the demo collections from the seed. Skips only when the data is already present AND
   * was produced by the current seed version; otherwise (missing, or an outdated version left over
   * from a previous deploy) it wipes the collections and re-hydrates so the visitor sees fresh data.
   */
  public ensureHydrated(): Observable<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(undefined);
    }
    const hasData = localStorage.getItem(DEMO_STORE_PREFIX + DEMO_COLLECTION_KEYS.projects) !== null;
    const versionMatches = localStorage.getItem(DEMO_SEED_VERSION_KEY) === DEMO_SEED_VERSION;
    if (hasData && versionMatches) {
      // Dataset is already present and current — arm deletion detection over it.
      this.demoData.armLossDetection();
      return of(undefined);
    }
    this.clearCollections();
    return this.fetchAndStore();
  }

  private clearCollections(): void {
    for (const key of Object.values(DEMO_COLLECTION_KEYS)) {
      localStorage.removeItem(DEMO_STORE_PREFIX + key);
    }
  }

  private fetchAndStore(): Observable<void> {
    return this.http.get<DemoSeedResponse>(`${environment.apiBaseUrl}/demo/seed`).pipe(
      tap((seed) => {
        this.store(seed);
        localStorage.setItem(DEMO_SEED_VERSION_KEY, DEMO_SEED_VERSION);
        // Fresh seed persisted — arm deletion detection so later external wipes are caught.
        this.demoData.armLossDetection();
      }),
      map(() => undefined),
      catchError((err) => {
        console.error('[DemoHydration] Failed to load demo seed:', err);
        return of(undefined);
      }),
    );
  }

  private store(seed: DemoSeedResponse): void {
    this.demoData.writeCollection(DEMO_COLLECTION_KEYS.projects, seed.projects ?? []);
    this.demoData.writeCollection<TaskItem>(
      DEMO_COLLECTION_KEYS.taskItems,
      (seed.taskItems ?? []).map((raw) => this.toTaskItem(raw)),
    );
    this.demoData.writeCollection(DEMO_COLLECTION_KEYS.subtasks, seed.subtasks ?? []);
    this.demoData.writeCollection(DEMO_COLLECTION_KEYS.timeEntries, seed.timeEntries ?? []);
    this.demoData.writeCollection(DEMO_COLLECTION_KEYS.comments, seed.comments ?? []);
    this.demoData.writeCollection(DEMO_COLLECTION_KEYS.notifications, seed.notifications ?? []);
    this.demoData.writeCollection(DEMO_COLLECTION_KEYS.systemTasks, seed.systemTasks ?? []);
  }

  private toTaskItem(raw: RawTaskItem): TaskItem {
    const { variant, ...rest } = raw;
    return { ...rest, issueType: variant as TaskItem['issueType'] };
  }
}
