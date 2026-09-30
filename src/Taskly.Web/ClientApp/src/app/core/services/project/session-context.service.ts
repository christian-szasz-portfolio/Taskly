import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, type Observable, of } from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  first,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import type { Project } from '../../models/project.interfaces';
import { ProjectApiService } from './project-api.service';

/**
 * Session context service that manages the currently active project.
 * This service is responsible for:
 * - Loading the active project from the backend on initialization
 * - Activating/deactivating projects (only one can be active at a time)
 * - Providing reactive access to the current project context
 * - Combining RxJS observables with Angular signals for optimal reactivity
 *
 * When auth is implemented, this service will also persist the context per user session.
 */
@Injectable({ providedIn: 'root' })
export class SessionContextService {
  private readonly api = inject(ProjectApiService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly activeProject = signal<Project | null>(null);
  private readonly loading = signal(false);
  private readonly initialized = signal(false);
  private readonly error = signal<string | null>(null);

  /**
   * BehaviorSubject to track initialization state for RxJS-based consumers (like guards).
   * Emits true once the initial load is complete.
   */
  private readonly initialized$ = new BehaviorSubject<boolean>(false);

  /**
   * BehaviorSubject to expose the active project as an observable for RxJS consumers.
   * Useful for guards and other async operations that need to wait for the context.
   */
  private readonly activeProject$ = new BehaviorSubject<Project | null>(null);

  /** The currently active project, or null if no project is active */
  public readonly currentProject = computed(() => this.activeProject());

  /** The ID of the currently active project, or null if no project is active */
  public readonly currentProjectId = computed(() => this.activeProject()?.id ?? null);

  /** Whether the active project is currently being loaded */
  public readonly isLoading = computed(() => this.loading());

  /** Whether the service has completed initial loading */
  public readonly isInitialized = computed(() => this.initialized());

  /** Any error that occurred during the last operation */
  public readonly lastError = computed(() => this.error());

  /** Whether there is an active project in the session context */
  public readonly hasActiveProject = computed(() => this.activeProject() !== null);

  /**
   * Observable that emits the current project state.
   * Waits for initialization before emitting.
   * Combines the power of RxJS for async operations with signal-based state.
   */
  public readonly project$: Observable<Project | null> = this.initialized$.pipe(
    switchMap((isInit) => (isInit ? this.activeProject$.asObservable() : of(null))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /**
   * Observable that emits true when there is an active project, false otherwise.
   * Waits for initialization before emitting.
   */
  public readonly hasActiveProject$: Observable<boolean> = this.initialized$.pipe(
    switchMap((isInit) => (isInit ? this.activeProject$.pipe(map((p) => p !== null)) : of(false))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /**
   * Observable that completes when initialization is done.
   * Useful for guards that need to wait for the session context to be ready.
   * Waits until initialized$ emits true, then completes.
   */
  public readonly whenReady$: Observable<boolean> = this.initialized$.pipe(
    filter((isInit) => isInit),
    first(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /**
   * Loads the currently active project from the backend.
   * Should be called on application initialization.
   * Returns an observable that completes when loading is done.
   * On the server, immediately marks as initialized without making API calls.
   */
  public loadActiveProject(): Observable<Project | null> {
    // On the server, skip API calls and mark as initialized immediately
    if (!this.isBrowser) {
      this.initialized.set(true);
      this.initialized$.next(true);
      return of(null);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.api.getActive().pipe(
      catchError(() => of(null)),
      tap((project: Project | null) => {
        this.activeProject.set(project);
        this.activeProject$.next(project);
        this.initialized.set(true);
        this.initialized$.next(true);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  /**
   * Initializes the session context. Call this during app startup.
   * Returns void observable for use with provideAppInitializer.
   */
  public init(): Observable<void> {
    return this.loadActiveProject().pipe(map(() => undefined));
  }

  /**
   * Activates a project, making it the current session context.
   * This will deactivate any other currently active project.
   * @param projectId The ID of the project to activate
   */
  public activateProject(projectId: string): Observable<Project> {
    // On the server, return empty observable
    if (!this.isBrowser) {
      return of({} as Project);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.api.activate(projectId).pipe(
      tap((project) => {
        this.activeProject.set(project);
        this.activeProject$.next(project);
      }),
      catchError((err: unknown) => {
        this.error.set(this.formatError(err, 'Failed to activate project'));
        throw err;
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  /**
   * Deactivates the currently active project.
   * @param projectId The ID of the project to deactivate
   */
  public deactivateProject(projectId: string): Observable<Project> {
    // On the server, return empty observable
    if (!this.isBrowser) {
      return of({} as Project);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.api.deactivate(projectId).pipe(
      tap(() => {
        // Clear the active project if it was the one being deactivated
        if (this.activeProject()?.id === projectId) {
          this.activeProject.set(null);
          this.activeProject$.next(null);
        }
      }),
      catchError((err: unknown) => {
        this.error.set(this.formatError(err, 'Failed to deactivate project'));
        throw err;
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  /**
   * Sets the active project directly (used when project list is updated).
   * This does NOT call the backend API - use activateProject for that.
   * @param project The project to set as active, or null to clear
   * @param markInitialized Whether to mark the service as initialized (default: true)
   */
  public setActiveProject(project: Project | null, markInitialized = true): void {
    this.activeProject.set(project);
    this.activeProject$.next(project);
    if (markInitialized && !this.initialized()) {
      this.initialized.set(true);
      this.initialized$.next(true);
    }
  }

  /**
   * Updates the local active project state if it matches the given project.
   * Used to sync state when projects are updated elsewhere.
   * @param project The updated project
   */
  public syncProject(project: Project): void {
    const current = this.activeProject();
    if (current?.id === project.id) {
      this.activeProject.set(project);
      this.activeProject$.next(project);
    }
  }

  /**
   * Checks if the given project is currently active.
   * @param projectId The project ID to check
   */
  public isProjectActive(projectId: string): boolean {
    return this.activeProject()?.id === projectId;
  }

  private formatError(err: unknown, fallback: string): string {
    if (err instanceof Error && err.message) {
      return err.message;
    }
    return fallback;
  }
}
