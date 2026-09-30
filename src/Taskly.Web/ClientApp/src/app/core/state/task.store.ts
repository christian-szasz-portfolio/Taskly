import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import type { TaskItem } from '../models/task.interfaces';
import type { UpdateTaskPayload, UpdateTaskTransitionPayload } from '../models/task.types';
import { IssueStatus } from '../models/task.enums';
import { TaskApiService } from '../services/task/task-api.service';
import { SessionContextService } from '../services/project/session-context.service';

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly api = inject(TaskApiService);
  private readonly sessionContext = inject(SessionContextService);
  private readonly tasks = signal<TaskItem[]>([]);
  private readonly loading = signal(false);
  private readonly saving = signal(false);
  private readonly error = signal<string | null>(null);

  public readonly vm = computed(() => ({
    todos: this.tasks(),
    loading: this.loading(),
    saving: this.saving(),
    error: this.error()
  }));

  /** The currently active project ID from session context */
  public readonly currentProjectId = this.sessionContext.currentProjectId;

  /** Whether there is an active project in the session context */
  public readonly hasActiveProject = this.sessionContext.hasActiveProject;

  public load(): void {
    this.loading.set(true);

    // Get the current project ID from session context
    const projectId = this.sessionContext.currentProjectId();

    this.api
      .list(projectId ?? undefined)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (items) => {
          this.tasks.set(items);
          this.error.set(null);
        },
        error: (err: unknown) => this.error.set(this.formatError(err, 'Failed to load items'))
      });
  }

  public update(id: string, payload: UpdateTaskPayload): void {
    this.saving.set(true);
    this.api
      .update(id, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (item) => {
          this.tasks.update((items) => items.map((existing) => (existing.id === id ? item : existing)));
          this.error.set(null);
        },
        error: (err: unknown) => this.error.set(this.formatError(err, 'Unable to update item'))
      });
  }

  public toggleStatus(id: string, isCompleted: boolean): void {
    const status = isCompleted ? IssueStatus.Done : IssueStatus.Open;
    this.updateTask(id, { status });
  }

  public updateTask(id: string, payload: UpdateTaskTransitionPayload): void {
    this.api.updateTask(id, payload).subscribe({
      next: (item) => {
        this.tasks.update((items) => items.map((existing) => (existing.id === id ? item : existing)));
        this.error.set(null);
      },
      error: (err: unknown) => this.error.set(this.formatError(err, 'Unable to update task'))
    });
  }

  public reorderTask(id: string, targetIndex: number): void {
    this.api.reorder(id, targetIndex).subscribe({
      next: (item) => {
        this.tasks.update((items) => items.map((existing) => (existing.id === id ? item : existing)));
        this.error.set(null);
      },
      error: (err: unknown) => this.error.set(this.formatError(err, 'Unable to reorder item'))
    });
  }

  private formatError(err: unknown, fallback: string): string {
    if (err instanceof Error && err.message) {
      return err.message;
    }

    return fallback;
  }
}
