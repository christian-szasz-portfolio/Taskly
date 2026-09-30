import { Injectable, inject } from '@angular/core';
import { type Observable, throwError } from 'rxjs';
import type { Subtask } from '../../models/task.interfaces';
import type { UpdateSubtaskPayload } from '../../models/task.types';
import { IssueResolution, IssueStatus } from '../../models/task.enums';
import { DemoDataService } from '../demo/demo-data.service';
import { demoResponse } from '../demo/demo-seed';

const SUBTASKS_KEY = 'subtasks';

/** Subtasks grouped by the id of their parent task */
export type SubtasksByParent = Map<string, Subtask[]>;

/** The seeded subtasks, kept in this browser; a visitor can edit them but not add or remove any. */
@Injectable({ providedIn: 'root' })
export class SubtaskApiService {
  private readonly demoData = inject(DemoDataService);

  private read(): Subtask[] {
    return this.demoData.readCollection<Subtask>(SUBTASKS_KEY, () => []);
  }

  private write(items: Subtask[]): void {
    this.demoData.writeCollection(SUBTASKS_KEY, items);
  }

  public listByParent(parentTaskItemId: string): Observable<Subtask[]> {
    return demoResponse(this.read().filter((s) => s.parentTaskItemId === parentTaskItemId));
  }

  public listByParents(parentTaskItemIds: readonly string[]): Observable<SubtasksByParent> {
    const map: SubtasksByParent = new Map<string, Subtask[]>();
    const all = this.read();
    for (const pid of parentTaskItemIds) {
      map.set(pid, all.filter((s) => s.parentTaskItemId === pid));
    }
    return demoResponse(map);
  }

  public get(id: string): Observable<Subtask> {
    const item = this.read().find((s) => s.id === id);
    return item ? demoResponse(item) : throwError(() => new Error('Subtask not found'));
  }

  public update(id: string, payload: UpdateSubtaskPayload): Observable<Subtask> {
    let updated: Subtask | undefined;
    const items = this.read().map((s) => {
      if (s.id !== id) {
        return s;
      }
      const status = payload.status ?? s.status;
      updated = {
        ...s,
        ...payload,
        title: payload.title?.trim() ?? s.title,
        labels: payload.labels ? [...payload.labels] : s.labels,
        components: payload.components ? [...payload.components] : s.components,
        status,
        isCompleted: payload.isCompleted ?? status === IssueStatus.Done,
        resolution: payload.resolution ?? (status === IssueStatus.Done ? IssueResolution.Fixed : s.resolution),
        updatedAtUtc: new Date().toISOString(),
      };
      return updated;
    });
    if (!updated) {
      return throwError(() => new Error('Subtask not found'));
    }
    this.write(items);
    return demoResponse(updated);
  }

  public reorder(id: string, targetIndex: number): Observable<Subtask> {
    const items = this.read();
    const item = items.find((s) => s.id === id);
    if (!item) {
      return throwError(() => new Error('Subtask not found'));
    }
    const siblings = items.filter((s) => s.parentTaskItemId === item.parentTaskItemId);
    const others = items.filter((s) => s.parentTaskItemId !== item.parentTaskItemId);
    const currentIndex = siblings.findIndex((s) => s.id === id);
    siblings.splice(currentIndex, 1);
    siblings.splice(Math.max(0, Math.min(targetIndex, siblings.length)), 0, item);
    siblings.forEach((s, index) => (s.position = index));
    item.updatedAtUtc = new Date().toISOString();
    this.write([...others, ...siblings]);
    return demoResponse(item);
  }

}
