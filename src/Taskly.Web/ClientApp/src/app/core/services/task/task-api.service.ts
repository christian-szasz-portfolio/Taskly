import { Injectable, inject, signal } from '@angular/core';
import { delay, of, throwError, type Observable } from 'rxjs';
import type { TaskItem } from '../../models/task.interfaces';
import type { UpdateTaskPayload, UpdateTaskTransitionPayload } from '../../models/task.types';
import { IssueResolution, IssueStatus, IssueType } from '../../models/task.enums';
import { normalizeComponents, normalizeLabels, normalizeNullableText } from '../../utilities/task.utility';
import { Guid } from '../../utilities/global.utility';
import { DemoDataService } from '../demo/demo-data.service';

const SYSTEM_USER = 'System';
const TASK_ITEMS_KEY = 'taskItems';

/** The seeded tasks, kept in this browser; a visitor can edit and move them but not add or remove any. */
@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly demoData = inject(DemoDataService);
  // Seeded from the backend demo dataset via DemoHydrationService; empty until hydrated.
  private readonly mockStore = signal<TaskItem[]>(
    this.demoData.readCollection<TaskItem>(TASK_ITEMS_KEY, () => [])
  );

  /** Persists the current store to localStorage so demo edits survive reloads. */
  private persist(): void {
    this.demoData.writeCollection(TASK_ITEMS_KEY, this.mockStore());
  }

  public list(projectId?: string): Observable<TaskItem[]> {
    // Scope to the active project — the demo seeds two projects (active DEMO + inactive SAMPLE)
    // and, like the real API, only the active project's items should be returned.
    const items = projectId ? this.mockStore().filter((task) => task.projectId === projectId) : this.mockStore();
    return this.mockResponse(items);
  }

  public get(id: string): Observable<TaskItem> {
    const item = this.mockStore().find((task) => task.id === id);
    if (!item) {
      return throwError(() => new Error('Item not found'));
    }

    return this.mockResponse(item);
  }

  public getByIssueKey(issueKey: string): Observable<TaskItem> {
    const normalizedKey = normalizeNullableText(issueKey);
    if (!normalizedKey) {
      return throwError(() => new Error('Issue key is required'));
    }

    const item = this.mockStore().find((task) => (task.issueKey ?? '').toLowerCase() === normalizedKey.toLowerCase());
    if (!item) {
      return throwError(() => new Error('Item not found'));
    }

    return this.mockResponse(item);
  }

  /** Finds a task by its id or by its issue key, whichever the reference is */
  public getByReference(reference: string): Observable<TaskItem> {
    const normalized = reference?.trim();
    if (!normalized) {
      return throwError(() => new Error('Task reference is required.'));
    }

    return Guid.isGuidReference(normalized) ? this.get(normalized) : this.getByIssueKey(normalized);
  }

  public update(id: string, payload: UpdateTaskPayload): Observable<TaskItem> {
    let updatedItem: TaskItem | undefined;
    this.mockStore.update((items) =>
      items.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const now = new Date().toISOString();
        const nextStatus = payload.status
          ?? (payload.isCompleted === true
            ? IssueStatus.Done
            : payload.isCompleted === false
              ? IssueStatus.Open
              : item.status);
        const resolvedIsCompleted = payload.isCompleted ?? (nextStatus === IssueStatus.Done);
        let nextEpicKey = item.epicKey;
        if (payload.epicKey !== undefined) {
          nextEpicKey = normalizeNullableText(payload.epicKey);
        }
        let nextLabels = item.labels;
        if (payload.labels !== undefined) {
          nextLabels = normalizeLabels(payload.labels);
        }
        let nextComponents = item.components;
        if (payload.components !== undefined) {
          nextComponents = normalizeComponents(payload.components);
        }
        let nextReporter = item.reporter;
        if (payload.reporter !== undefined) {
          nextReporter = normalizeNullableText(payload.reporter);
        }
        let nextLinkedTaskId = item.linkedTaskId;
        if (payload.linkedTaskId !== undefined) {
          nextLinkedTaskId = normalizeNullableText(payload.linkedTaskId);
        }

        updatedItem = {
          ...item,
          ...payload,
          title: payload.title?.trim() ?? item.title,
          description: normalizeNullableText(payload.description) ?? null,
          assignedTo: normalizeNullableText(payload.assignedTo),
          category: normalizeNullableText(payload.category),
          status: nextStatus,
          updatedAtUtc: now,
          issueType: payload.issueType ?? item.issueType,
          issueKey: item.issueKey, // Issue key is immutable after creation
          labels: nextLabels,
          epicKey: nextEpicKey,
          components: nextComponents,
          resolution: this.resolveResolution(nextStatus, item.resolution, payload.resolution),
          reporter: nextReporter,
          linkedTaskId: nextLinkedTaskId,
          isCompleted: resolvedIsCompleted,
          completedAtUtc: resolvedIsCompleted ? item.completedAtUtc ?? now : null
        };
        this.applyEpicRules(updatedItem);
        // Recalculate isCompleted after epic rules may have changed status
        updatedItem.isCompleted = updatedItem.status === IssueStatus.Done;
        if (!updatedItem.isCompleted) {
          updatedItem.completedAtUtc = null;
        }
        return updatedItem;
      })
    );

    if (!updatedItem) {
      return throwError(() => new Error('Item not found'));
    }

    this.persist();
    return this.mockResponse(updatedItem);
  }

  public updateTask(id: string, payload: UpdateTaskTransitionPayload): Observable<TaskItem> {
    let updatedItem: TaskItem | undefined;
    this.mockStore.update((items) =>
      items.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const now = new Date().toISOString();
        const nextStatus = payload.status;
        let nextEpicKey = item.epicKey;
        if (payload.epicKey !== undefined) {
          nextEpicKey = normalizeNullableText(payload.epicKey);
        }
        let nextLabels = item.labels;
        if (payload.labels !== undefined) {
          nextLabels = normalizeLabels(payload.labels);
        }
        updatedItem = {
          ...item,
          status: nextStatus,
          priority: payload.priority ?? item.priority,
          issueType: payload.issueType ?? item.issueType,
          labels: nextLabels,
          epicKey: nextEpicKey,
          resolution: this.resolveResolution(nextStatus, item.resolution, payload.resolution),
          isCompleted: nextStatus === IssueStatus.Done,
          completedAtUtc: nextStatus === IssueStatus.Done ? item.completedAtUtc ?? now : null,
          updatedAtUtc: now
        };
        this.applyEpicRules(updatedItem);
        // Recalculate isCompleted after epic rules may have changed status
        updatedItem.isCompleted = updatedItem.status === IssueStatus.Done;
        if (!updatedItem.isCompleted) {
          updatedItem.completedAtUtc = null;
        }

        return updatedItem;
      })
    );

    if (!updatedItem) {
      return throwError(() => new Error('Item not found'));
    }

    this.persist();
    return this.mockResponse(updatedItem);
  }

  public reorder(id: string, targetIndex: number): Observable<TaskItem> {
    let reorderedItem: TaskItem | undefined;

    this.mockStore.update((items) => {
      const item = items.find((i) => i.id === id);
      if (!item) {
        return items;
      }

      // Get all items in the same column
      const columnItems = items.filter((i) => i.status === item.status);
      const otherItems = items.filter((i) => i.status !== item.status);

      // Find current index and remove item
      const currentIndex = columnItems.findIndex((i) => i.id === id);
      if (currentIndex === -1) {
        return items;
      }

      columnItems.splice(currentIndex, 1);

      // Insert at target position
      const clampedIndex = Math.max(0, Math.min(targetIndex, columnItems.length));
      columnItems.splice(clampedIndex, 0, item);

      // Update positions sequentially
      const now = new Date().toISOString();
      columnItems.forEach((columnItem, index) => {
        columnItem.position = index;
        if (columnItem.id === id) {
          columnItem.updatedAtUtc = now;
          reorderedItem = columnItem;
        }
      });

      return [...otherItems, ...columnItems];
    });

    if (!reorderedItem) {
      return throwError(() => new Error('Item not found'));
    }

    this.persist();
    return this.mockResponse(reorderedItem);
  }

  private mockResponse<T>(value: T): Observable<T> {
    return of(structuredClone(value)).pipe(delay(250));
  }

  private applyEpicRules(item: TaskItem): void {
    if (item.issueType !== IssueType.Epic) {
      return;
    }

    item.status = IssueStatus.Administrative;
    item.assignedTo = SYSTEM_USER;
    item.reporter = SYSTEM_USER;
    item.labels = [];
    item.components = [];
    item.epicKey = null;
    item.linkedTaskId = null;
  }

  /**
   * Derives the resolution from the status, but lets an explicit request win. Closing an item is a
   * user decision, not a consequence of its status: the board's "Close Item?" prompt and the
   * editor's Resolution field both send one, and with no backend in the demo this method is the
   * only thing that can honour it.
   */
  private resolveResolution(
    status: IssueStatus,
    current: IssueResolution = IssueResolution.NotFixed,
    requested?: IssueResolution
  ): IssueResolution {
    if (status === IssueStatus.Done) {
      // Only two resolutions are meaningful once an item is done: Fixed keeps it on the board,
      // Closed moves it to the resolved list. With nothing requested, an already-closed item stays
      // closed so an unrelated edit (a rename, say) cannot quietly put it back on the board.
      if (requested === IssueResolution.Closed || requested === IssueResolution.Fixed) {
        return requested;
      }

      return current === IssueResolution.Closed ? IssueResolution.Closed : IssueResolution.Fixed;
    }

    if (
      status === IssueStatus.Open ||
      status === IssueStatus.Todo ||
      status === IssueStatus.InProgress ||
      status === IssueStatus.Testing ||
      status === IssueStatus.Created
    ) {
      return IssueResolution.NotFixed;
    }

    return current;
  }
}
