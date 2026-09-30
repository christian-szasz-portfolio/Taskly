import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import type { TimeEntry, UpdateTimeEntryPayload } from '../models/time-tracking.interfaces';
import { TimeEntryApiService } from '../services/time-entry/time-entry-api.service';

/**
 * Signal-based state store for time tracking entries.
 */
@Injectable({ providedIn: 'root' })
export class TimeEntryStore {
  private readonly api = inject(TimeEntryApiService);

  private readonly entries = signal<TimeEntry[]>([]);
  private readonly loading = signal(false);
  private readonly saving = signal(false);
  private readonly error = signal<string | null>(null);
  private readonly currentDateRange = signal<{ start: string; end: string } | null>(null);

  /**
   * View model exposing reactive state to components.
   */
  public readonly vm = computed(() => ({
    entries: this.entries(),
    loading: this.loading(),
    saving: this.saving(),
    error: this.error(),
    currentDateRange: this.currentDateRange()
  }));

  /**
   * Computed total duration in minutes for the current date range.
   */
  public readonly totalDurationMinutes = computed(() => {
    return this.entries().reduce((sum, entry) => sum + (entry.durationMinutes ?? 0), 0);
  });

  /**
   * Computed total duration formatted as "Xh Ym".
   */
  public readonly totalDurationFormatted = computed(() => {
    const minutes = this.totalDurationMinutes();
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  });

  /**
   * Loads time entries for the specified date range.
   * @param startDate The start of the date range (ISO string).
   * @param endDate The end of the date range (ISO string).
   */
  public load(startDate: string, endDate: string): void {
    this.loading.set(true);
    this.currentDateRange.set({ start: startDate, end: endDate });

    this.api
      .list(startDate, endDate)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (items) => {
          this.entries.set(items);
          this.error.set(null);
        },
        error: (err: unknown) => this.error.set(this.formatError(err, 'Failed to load time entries'))
      });
  }

  /**
   * Reloads entries for the current date range.
   */
  public reload(): void {
    const range = this.currentDateRange();
    if (range) {
      this.load(range.start, range.end);
    }
  }

  /**
   * Updates an existing time entry.
   * @param id The time entry ID.
   * @param payload The update payload.
   */
  public update(id: string, payload: UpdateTimeEntryPayload): void {
    this.saving.set(true);
    this.api
      .update(id, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (item) => {
          this.entries.update((items) => items.map((existing) => (existing.id === id ? item : existing)));
          this.error.set(null);
        },
        error: (err: unknown) => this.error.set(this.formatError(err, 'Failed to update time entry'))
      });
  }

  /**
   * Clears all entries from the store.
   */
  public clear(): void {
    this.entries.set([]);
    this.currentDateRange.set(null);
    this.error.set(null);
  }

  /**
   * Gets a time entry by ID from the current store.
   * @param id The time entry ID.
   * @returns The time entry or undefined if not found.
   */
  public getById(id: string): TimeEntry | undefined {
    return this.entries().find((entry) => entry.id === id);
  }

  private formatError(err: unknown, fallback: string): string {
    if (err instanceof Error) {
      return err.message || fallback;
    }
    if (typeof err === 'object' && err !== null && 'message' in err) {
      return (err as { message: string }).message || fallback;
    }
    return fallback;
  }
}
