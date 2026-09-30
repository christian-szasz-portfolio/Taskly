import { Injectable, Injector, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog, type MatDialogRef } from '@angular/material/dialog';
import { DemoStorageAlertDialogComponent } from '../../../shared/components/demo-storage-alert-dialog/demo-storage-alert-dialog.component';
import type { DemoStorageAlertData } from '../../../shared/components/demo-storage-alert-dialog/demo-storage-alert-dialog.interfaces';

/** Prefix for every localStorage key that holds demo data, so the whole demo can be wiped at once. */
export const DEMO_STORE_PREFIX = 'demo:';

/**
 * localStorage collection keys — must match the per-feature `*-api.service.manager.ts`
 * constants so the managers read what hydration writes. Lives here (rather than in the
 * hydration service) because DemoDataService needs the full registry to tell a single-key
 * deletion apart from a full wipe; hydration re-exports it for its own callers.
 */
export const DEMO_COLLECTION_KEYS = {
  projects: 'projects',
  taskItems: 'taskItems',
  subtasks: 'subtasks',
  timeEntries: 'timeEntries',
  comments: 'comments',
  notifications: 'notifications',
  systemTasks: 'systemTasks',
} as const;

/**
 * Central client-side persistence for the demo build. The mock "*ServiceManager" data
 * layers read/write their collections through this service so that:
 *  - data survives page reloads (localStorage), and
 *  - the entire dataset can be wiped + re-seeded when a new trial starts.
 *
 * The demo is the single source of truth — there is no database. Everything lives here.
 */
@Injectable({ providedIn: 'root' })
export class DemoDataService {
  private readonly platformId = inject(PLATFORM_ID);
  // Resolved lazily (only when an alert is actually shown) to avoid any construction/SSR ordering
  // concerns — mirrors GlobalErrorHandler's use of MatDialog.
  private readonly injector = inject(Injector);

  /**
   * Live "demo data was deleted externally" detection is only meaningful once the dataset has been
   * hydrated. DemoHydrationService arms it after seeding settles; a trial reset disarms it (that flow
   * wipes the keys then hard-reloads). Kept in memory — never persisted — so it can't false-fire
   * across a bootstrap or re-seed.
   */
  private detectionArmed = false;

  /** Ensures a burst of reads surfaces the data-loss modal only once. */
  private lossNotified = false;

  /** Ensures repeated failed saves surface the quota modal only once per session. */
  private quotaNotified = false;

  /** The currently-open storage alert, if any — prevents the two paths from stacking modals. */
  private alertRef: MatDialogRef<DemoStorageAlertDialogComponent, void> | null = null;

  private get browser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /** Enables on-demand detection of externally deleted demo keys. Called once hydration has settled. */
  public armLossDetection(): void {
    this.detectionArmed = true;
  }

  /**
   * Reads a persisted collection. If nothing is stored yet, lazily persists and returns
   * the provided seed (so the first read materializes the demo dataset). Once detection is armed,
   * a missing collection means the visitor cleared demo storage, so the user is alerted.
   */
  public readCollection<T>(key: string, seed: () => readonly T[]): T[] {
    if (!this.browser) {
      return [...seed()];
    }

    const storageKey = DEMO_STORE_PREFIX + key;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        return JSON.parse(raw) as T[];
      } catch {
        // Corrupt entry — fall through to re-seed.
      }
    } else if (this.detectionArmed) {
      // Armed + a previously-hydrated collection is gone → the visitor cleared demo storage.
      this.notifyDataLoss();
    }

    const seeded = [...seed()];
    this.writeCollection(key, seeded);
    return seeded;
  }

  /** Persists a collection. Surfaces a quota alert instead of throwing when storage is full. */
  public writeCollection<T>(key: string, items: readonly T[]): void {
    if (!this.browser) {
      return;
    }
    try {
      localStorage.setItem(DEMO_STORE_PREFIX + key, JSON.stringify(items));
    } catch (err) {
      if (this.isQuotaExceeded(err)) {
        this.notifyQuotaExceeded();
        return;
      }
      throw err;
    }
  }

  /**
   * Wipes all demo data + the trial timestamp so the next load starts a fresh trial.
   * The caller is responsible for re-stamping the trial start (AuthStore.startNewTrial).
   */
  public resetTrial(): void {
    if (!this.browser) {
      return;
    }
    // A reset legitimately clears every key (then hard-reloads); don't mistake it for a deletion.
    this.detectionArmed = false;
    this.lossNotified = false;
    this.quotaNotified = false;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(DEMO_STORE_PREFIX) || k === 'demoStartedAt')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }

  /** True when the error is the browser's storage-quota signal (name varies across engines). */
  private isQuotaExceeded(err: unknown): boolean {
    return (
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED' || err.code === 22)
    );
  }

  /** Warns the user that demo data was removed and offers a reload (which re-seeds from the backend). */
  private notifyDataLoss(): void {
    if (this.lossNotified) {
      return;
    }
    this.lossNotified = true;
    const cleared = this.countStoredCollections() === 0;
    this.openAlert({
      title: cleared ? 'Demo workspace cleared' : 'Demo data removed',
      message: cleared
        ? 'Your demo workspace was cleared. Reload to start fresh.'
        : 'Some demo data was removed from your browser. Reload to restore it.',
      showReload: true,
    });
  }

  /** How many demo collections still have a stored value — 0 means everything was cleared. */
  private countStoredCollections(): number {
    return Object.values(DEMO_COLLECTION_KEYS).filter(
      (k) => localStorage.getItem(DEMO_STORE_PREFIX + k) !== null,
    ).length;
  }

  /** Warns the user that a change couldn't be saved because storage is full. */
  private notifyQuotaExceeded(): void {
    if (this.quotaNotified) {
      return;
    }
    this.quotaNotified = true;
    this.openAlert({
      title: 'Storage full',
      message: "Your latest change couldn't be saved because browser storage is full.",
      showReload: false,
    });
  }

  /** Opens the shared warning modal, unless one is already open (never stack two). */
  private openAlert(data: DemoStorageAlertData): void {
    if (this.alertRef) {
      return;
    }
    this.alertRef = this.injector.get(MatDialog).open(DemoStorageAlertDialogComponent, { data });
    this.alertRef.afterClosed().subscribe(() => (this.alertRef = null));
  }
}
