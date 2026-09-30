import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import type { Project } from '../models/project.interfaces';
import { ProjectStatus } from '../models/task.enums';
import { ProjectApiService } from '../services/project/project-api.service';
import { SessionContextService } from '../services/project/session-context.service';

@Injectable({ providedIn: 'root' })
export class ProjectStore {
  private readonly api = inject(ProjectApiService);
  private readonly sessionContext = inject(SessionContextService);
  private readonly projects = signal<Project[]>([]);
  private readonly loading = signal(false);
  private readonly saving = signal(false);
  private readonly error = signal<string | null>(null);

  public readonly vm = computed(() => ({
    projects: this.projects(),
    loading: this.loading(),
    saving: this.saving(),
    error: this.error()
  }));

  public readonly activeProjects = computed(() =>
    this.projects().filter((project) => !project.isCompleted)
  );

  public readonly ownedProjects = computed(() =>
    this.activeProjects()
  );

  /** The currently active project in session context */
  public readonly currentProject = this.sessionContext.currentProject;

  /** The ID of the currently active project */
  public readonly currentProjectId = this.sessionContext.currentProjectId;

  public load(includeCompleted = false): void {
    this.loading.set(true);
    this.api
      .list(includeCompleted)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (items) => {
          this.projects.set(items);
          this.error.set(null);

          // Sync the active project state from the loaded list
          const activeProject = items.find((p) => p.status === ProjectStatus.Active);
          if (activeProject) {
            this.sessionContext.setActiveProject(activeProject);
          }
        },
        error: (err: unknown) => this.error.set(this.formatError(err, 'Failed to load projects'))
      });
  }

  public getById(id: string): Project | undefined {
    return this.projects().find((project) => project.id === id);
  }

  /**
   * Activates a project, making it the current session context.
   * @param id The ID of the project to activate
   */
  public activate(id: string): void {
    this.saving.set(true);
    this.api
      .activate(id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (activatedProject) => {
          // Update all projects in the list to reflect status changes
          this.projects.update((items) =>
            items.map((existing) => {
              if (existing.id === id) {
                return activatedProject;
              }
              // Deactivate all other projects
              if (existing.status === ProjectStatus.Active) {
                return { ...existing, status: ProjectStatus.Inactive };
              }
              return existing;
            })
          );
          this.error.set(null);

          // Update session context
          this.sessionContext.setActiveProject(activatedProject);
        },
        error: (err: unknown) => this.error.set(this.formatError(err, 'Unable to activate project'))
      });
  }

  /**
   * Deactivates a project, removing it from the current session context.
   * @param id The ID of the project to deactivate
   */
  public deactivate(id: string): void {
    this.saving.set(true);
    this.api
      .deactivate(id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (deactivatedProject) => {
          this.projects.update((items) =>
            items.map((existing) => (existing.id === id ? deactivatedProject : existing))
          );
          this.error.set(null);

          // Clear session context if this was the active project
          if (this.sessionContext.isProjectActive(id)) {
            this.sessionContext.setActiveProject(null);
          }
        },
        error: (err: unknown) => this.error.set(this.formatError(err, 'Unable to deactivate project'))
      });
  }

  private formatError(err: unknown, fallback: string): string {
    if (err instanceof Error && err.message) {
      return err.message;
    }

    return fallback;
  }
}
