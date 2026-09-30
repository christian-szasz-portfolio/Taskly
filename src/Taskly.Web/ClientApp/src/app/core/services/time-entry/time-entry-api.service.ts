import { Injectable, inject } from '@angular/core';
import { type Observable, throwError } from 'rxjs';
import type { TimeEntry, UpdateTimeEntryPayload } from '../../models/time-tracking.interfaces';
import { DemoDataService } from '../demo/demo-data.service';
import { demoResponse } from '../demo/demo-seed';

const TIME_ENTRIES_KEY = 'timeEntries';

function durationMinutes(startIso: string, endIso: string): number {
  return Math.max(0, Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000));
}

/** The seeded time entries, kept in this browser; a visitor can edit them but not add or remove any. */
@Injectable({ providedIn: 'root' })
export class TimeEntryApiService {
  private readonly demoData = inject(DemoDataService);

  // Seeded from the backend demo dataset via DemoHydrationService; empty until hydrated.
  private read(): TimeEntry[] {
    return this.demoData.readCollection<TimeEntry>(TIME_ENTRIES_KEY, () => []);
  }

  private write(items: TimeEntry[]): void {
    this.demoData.writeCollection(TIME_ENTRIES_KEY, items);
  }

  public list(startDate: string, endDate: string): Observable<TimeEntry[]> {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const items = this.read().filter((e) => {
      const t = new Date(e.startTimeUtc).getTime();
      return t >= start && t <= end;
    });
    return demoResponse(items);
  }

  public get(id: string): Observable<TimeEntry> {
    const item = this.read().find((e) => e.id === id);
    return item ? demoResponse(item) : throwError(() => new Error('Time entry not found'));
  }

  public getTotalDuration(startDate: string, endDate: string): Observable<number> {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const total = this.read()
      .filter((e) => {
        const t = new Date(e.startTimeUtc).getTime();
        return t >= start && t <= end;
      })
      .reduce((sum, e) => sum + e.durationMinutes, 0);
    return demoResponse(total);
  }

  public update(id: string, payload: UpdateTimeEntryPayload): Observable<TimeEntry> {
    let updated: TimeEntry | undefined;
    const items = this.read().map((e) => {
      if (e.id !== id) {
        return e;
      }
      const startTimeUtc = payload.startTimeUtc ?? e.startTimeUtc;
      const endTimeUtc = payload.endTimeUtc ?? e.endTimeUtc;
      updated = {
        ...e,
        taskKey: payload.taskKey ?? e.taskKey,
        description: payload.description ?? e.description,
        startTimeUtc,
        endTimeUtc,
        durationMinutes: durationMinutes(startTimeUtc, endTimeUtc),
        isAllDay: payload.isAllDay ?? e.isAllDay,
        updatedAtUtc: new Date().toISOString(),
      };
      return updated;
    });
    if (!updated) {
      return throwError(() => new Error('Time entry not found'));
    }
    this.write(items);
    return demoResponse(updated);
  }

}
