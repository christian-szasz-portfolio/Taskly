import { CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, DestroyRef, HostListener, viewChild, computed, effect, EnvironmentInjector, inject, signal, type EffectRef, PLATFORM_ID, runInInjectionContext, type ElementRef } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { timer, animationFrameScheduler } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthStore } from '../../../core/state/auth.store';
import { TaskStore } from '../../../core/state/task.store';
import { TaskApiService } from '../../../core/services/task/task-api.service';
import type { TaskItem, Subtask } from '../../../core/models/task.interfaces';
import { IssueStatus, IssueType, IssueResolution, CardTheme } from '../../../core/models/task.enums';
import { SubtaskApiService } from '../../../core/services/subtask/subtask-api.service';
import { SubtaskEditorDialogComponent, type SubtaskEditorDialogData, type SubtaskEditorDialogResult } from '../subtask-editor-dialog/subtask-editor-dialog.component';
import { TaskHeroSectionComponent } from '../components/task-hero-section/task-hero-section.component';
import { TaskDetailPanelComponent } from '../components/task-detail-panel/task-detail-panel.component';
import { KanbanParentRowComponent } from '../components/kanban-parent-row/kanban-parent-row.component';
import { KanbanOtherRowComponent } from '../components/kanban-other-row/kanban-other-row.component';
import type { KanbanColumnDefinition, KanbanColumnView, TaskHeroCard, TaskHeroIcons } from '../models/task-board.models';
import type { TaskCardHelpers } from '../models/task-card.helpers';
import { TaskPresentationStore } from '../services/task-presentation.service';
import { EventBus } from '../../../core/utilities/event-bus.utility';
import { observeElementHeight } from '../utilities/element-size.utility';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import type { ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.interfaces';
import { TaskNavigationService } from '../../../core/services/task/task-navigation.service';
import { UserPreferencesService } from '../../../core/services/user/user-preferences.service';
import { TITLE_EVENT_NAME } from '../../../core/constants/global.constants';

export interface BoardRow {
  type: 'parent-with-subtasks' | 'other-issues';
  parent?: TaskItem;
  subtasks?: Subtask[];
  tasks?: TaskItem[];
  isExpanded: boolean;
}

@Component({
  selector: 'app-task-kanban-board',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropListGroup,
    MatDialogModule,
    FontAwesomeModule,
    TaskHeroSectionComponent,
    TaskDetailPanelComponent,
    KanbanParentRowComponent,
    KanbanOtherRowComponent
  ],
  templateUrl: './task-kanban-board.component.html',
  styleUrl: './task-kanban-board.component.scss'
})
export class TaskKanbanBoardComponent {
  private readonly destroyRef = inject(DestroyRef);

  private readonly dialog = inject(MatDialog);
  private readonly store = inject(TaskStore);
  private readonly api = inject(TaskApiService);
  private readonly subtaskApi = inject(SubtaskApiService);
  private readonly presentation = inject(TaskPresentationStore);
  private readonly authStore = inject(AuthStore);
  private readonly iconRegistry = this.presentation.icons;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly taskNav = inject(TaskNavigationService);
  private readonly userPreferences = inject(UserPreferencesService);

  // License-based access control
  public readonly canWrite = computed(() => this.authStore.canWrite());

  // Subtasks data
  private readonly subtasksByParent = signal<Map<string, Subtask[]>>(new Map<string, Subtask[]>());
  private readonly loadingSubtasks = signal(false);
  private subtaskLoadEffect?: EffectRef;

  public readonly insightCards = computed<TaskHeroCard[]>(() => {
    const metrics = this.stats();
    const icons = this.cardIcons();
    return [
      // { label: 'Total Issues', value: metrics.total.toString(), icon: icons.total },
      { label: 'Open', value: metrics.open.toString(), icon: icons.open },
      { label: 'To-Do', value: metrics.toDo.toString(), icon: icons.toDo },
      { label: 'In Progress', value: metrics.inProgress.toString(), icon: icons.inProgress },
      { label: 'Testing', value: metrics.testing.toString(), icon: icons.testing },
      { label: 'Completed', value: metrics.completed.toString(), icon: icons.completed },
      { label: 'Completion', value: `${metrics.completionRate}%`, icon: icons.completion }
    ];
  });

  public readonly vm = this.store.vm;
  public readonly icons = computed(() => this.iconRegistry().actions);

  public readonly panelIcons = computed(() => this.iconRegistry().panel);

  public readonly heroIcons = computed<TaskHeroIcons>(() => this.iconRegistry().hero);

  private readonly cardIcons = computed(() => this.iconRegistry().cards);

  public readonly columnsAreaHeight = signal<number | null>(null);
  public readonly columnHeight = signal<number | null>(null);

  private readonly boardEligibleTasks = computed(() =>
    this.vm().todos.filter((task) =>
      task.issueType !== IssueType.Epic &&
      !(task.status === IssueStatus.Done && task.resolution === IssueResolution.Closed)
    )
  );

  // Compute board rows - parents with subtasks get their own row, others go to "Other issues"
  public readonly boardRows = computed<BoardRow[]>(() => {
    const tasks = this.boardEligibleTasks();
    const subtasksMap = this.subtasksByParent();
    // Access the collapsedPanels signal to trigger reactivity when it changes
    this.userPreferences.collapsedPanels();
    const rows: BoardRow[] = [];

    // Find all parents that have subtasks
    const parentsWithSubtasks = new Set<string>();
    subtasksMap.forEach((subtasks, parentId) => {
      if (subtasks.length > 0) {
        parentsWithSubtasks.add(parentId);
      }
    });

    // Create a row for each parent with subtasks
    tasks.forEach((task) => {
      if (parentsWithSubtasks.has(task.id)) {
        const subtasks = subtasksMap.get(task.id) ?? [];
        const rowKey = task.issueKey ?? task.id;
        rows.push({
          type: 'parent-with-subtasks',
          parent: task,
          subtasks,
          isExpanded: this.userPreferences.isPanelExpanded(rowKey)
        });
      }
    });

    // Collect all tasks without subtasks into "Other issues" row
    const tasksWithoutSubtasks = tasks.filter(w => !parentsWithSubtasks.has(w.id));
    if (tasksWithoutSubtasks.length > 0) {
      rows.push({
        type: 'other-issues',
        tasks: tasksWithoutSubtasks,
        isExpanded: this.userPreferences.isPanelExpanded('other-issues')
      });
    }
    return rows;
  });

  public readonly stats = computed(() => {
    const tasks = this.boardEligibleTasks();
    const total = tasks.length;
    const completed = tasks.filter((task) => task.isCompleted).length;
    const open = tasks.filter((task) => task.status === IssueStatus.Open).length;
    const toDo = tasks.filter((task) => task.status === IssueStatus.Todo).length;
    const inProgress = tasks.filter((task) => task.status === IssueStatus.InProgress).length;
    const testing = tasks.filter((task) => task.status === IssueStatus.Testing).length;
    // Completion is measured against the statuses the board actually shows, not every eligible
    // task. IssueStatus also has Created / Done / Administrative, which land in `total` but in
    // none of the five buckets above — dividing by `total` produced a Completion figure that
    // disagreed with the status chart beside it (the chart sums the same five buckets).
    const trackedTotal = open + toDo + inProgress + testing + completed;
    const completionRate = trackedTotal === 0 ? 0 : Math.round((completed / trackedTotal) * 100);
    return { open, toDo, inProgress, testing, completed, total, completionRate };
  });

  private readonly columns = signal<KanbanColumnDefinition[]>([
    { status: IssueStatus.Open, title: 'Open', subtitle: 'Intake + triage', accent: 'mint' },
    { status: IssueStatus.Todo, title: 'To-Do', subtitle: 'Ready for sprint', accent: CardTheme.Sky },
    { status: IssueStatus.InProgress, title: 'In Progress', subtitle: 'Active builders', accent: CardTheme.Amber },
    { status: IssueStatus.Testing, title: 'Testing', subtitle: 'Validation + QA', accent: 'plum' },
    { status: IssueStatus.Done, title: 'Done', subtitle: 'Ship-ready', accent: CardTheme.Emerald }
  ]);

  public readonly cardHelpers: TaskCardHelpers = this.presentation.cardHelpers;

  // Detail panel state
  public readonly selectedTask = signal<TaskItem | Subtask | null>(null);
  public readonly isPanelOpen = signal(false);
  public readonly panelWidth = signal(420);
  public readonly panelHeight = signal<number | null>(null);
  private readonly minPanelWidth = 320;
  private readonly maxPanelWidth = 600;
  private readonly isResizing = signal(false);
  private resizeStartX = 0;
  private resizeStartWidth = this.panelWidth();

  private readonly columnsArea = viewChild<ElementRef<HTMLElement>>('columnsArea');
  private disposeHeightObserver: (() => void) | null = null;
  private columnHeightEffect?: EffectRef;
  private panelStateEffect?: EffectRef;
  private columnComponentsEffect?: EffectRef;
  private pendingHeightFrame: number | null = null;

  public readonly board = computed<KanbanColumnView[]>(() => {
    const tasks = this.boardEligibleTasks();
    return this.columns().map((column) => ({
      ...column,
      items: tasks.filter((task) => task.status === column.status)
    }));
  });

  public constructor() {
    this.store.load();
    EventBus.send(TITLE_EVENT_NAME, 'Kanban Board');

    // Setup effect to reload subtasks when tasks change
    this.subtaskLoadEffect = runInInjectionContext(this.environmentInjector, () =>
      effect(() => {
        this.boardEligibleTasks();
        this.loadAllSubtasks();
      })
    );

    afterNextRender(() => {
      queueMicrotask(() => this.initializeColumnsHeightObserver());
      this.setupColumnHeightSync();
    });

    this.destroyRef.onDestroy(() => {
      this.disposeHeightObserver?.();
      this.columnHeightEffect?.destroy();
      this.panelStateEffect?.destroy();
      this.columnComponentsEffect?.destroy();
      this.subtaskLoadEffect?.destroy();
      if (this.pendingHeightFrame !== null) {
        cancelAnimationFrame(this.pendingHeightFrame);
        this.pendingHeightFrame = null;
      }
    });
  }

  public refresh(): void {
    this.store.load();
    // Effect will automatically reload subtasks when tasks change
  }

  public toggleRowExpansion(rowId: string): void {
    this.userPreferences.togglePanel(rowId);
  }

  public onResolveParent(task: TaskItem): void {
    this.api.updateTask(task.id, { status: IssueStatus.Done, resolution: IssueResolution.Closed }).subscribe({
      next: () => {
        this.store.load();
        this.loadAllSubtasks();
      },
      error: (err) => {
        console.error('[Kanban] Failed to resolve task', err);
      }
    });
  }

  public getRowColumns(row: BoardRow): KanbanColumnView[] {
    const items = row.type === 'parent-with-subtasks' ? (row.subtasks ?? []) : (row.tasks ?? []);
    return this.columns().map((column) => ({
      ...column,
      items: items.filter((item) => item.status === column.status)
    }));
  }

  private loadAllSubtasks(): void {
    const tasks = this.boardEligibleTasks();

    if (tasks.length === 0) {
      this.subtasksByParent.set(new Map());
      return;
    }

    this.loadingSubtasks.set(true);

    // Fetch all subtasks in a single batch request
    const parentIds = tasks.map(w => w.id);
    this.subtaskApi.listByParents(parentIds).subscribe({
      next: (subtasksMap) => {
        this.subtasksByParent.set(subtasksMap);
        this.loadingSubtasks.set(false);
      },
      error: () => {
        this.loadingSubtasks.set(false);
      }
    });
  }

  public drop(event: CdkDragDrop<(TaskItem | Subtask)[]>, status: IssueStatus): void {
    const item = this.extractItemFromDrag(event.item.data);
    if (!item) {
      return;
    }

    // Handle subtask drag-and-drop
    if ('subtaskType' in item) {
      const subtask = item;

      // Same column reordering
      if (event.previousContainer === event.container) {
        if (event.previousIndex !== event.currentIndex) {
          // Update the UI immediately for better UX
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
          // Persist the new position to backend and reload subtasks
          this.subtaskApi.reorder(subtask.id, event.currentIndex).subscribe({
            next: () => {
              this.loadAllSubtasks();
            },
            error: (err) => {
              console.error('[Kanban] Failed to reorder subtask', err);
              this.loadAllSubtasks(); // Reload to revert UI changes
            }
          });
        }
        return;
      }

      // Cross-column movement - update status and reorder in the UI
      if (subtask.status !== status) {
        // Update UI optimistically
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );

        this.subtaskApi.update(subtask.id, { status }).subscribe({
          next: () => {
            this.loadAllSubtasks();
          },
          error: (err) => {
            console.error('[Kanban] Failed to update subtask status', err);
            // Reload to revert any optimistic updates
            this.loadAllSubtasks();
          }
        });
      }
      return;
    }

    const task = item;

    // Same column reordering
    if (event.previousContainer === event.container) {
      if (event.previousIndex !== event.currentIndex) {
        // Update the UI immediately
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        // Persist the new position to backend and reload to get updated display order
        this.api.reorder(task.id, event.currentIndex).subscribe({
          next: () => {
            this.store.load();
          },
          error: (err) => {
            console.error('[Kanban] Failed to reorder task', err);
            this.store.load(); // Reload to revert UI changes
          }
        });
      }
      return;
    }

    // Cross-column movement - update UI then persist
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    // Cross-column movement to Done - show close confirmation dialog
    if (status === IssueStatus.Done && task.status !== IssueStatus.Done) {
      this.showCloseConfirmationDialog(task, status);
      return;
    }

    // Cross-column movement - update status
    this.store.updateTask(task.id, { status });
  }

  private showCloseConfirmationDialog(task: TaskItem, status: IssueStatus): void {
    const dialogData: ConfirmDialogData = {
      title: 'Close Item?',
      message: `Would you like to close "${task.title}"? Closed items will be moved to the resolved items list and won't appear on the board.`,
      confirmLabel: 'Close Item',
      cancelLabel: 'Keep Open'
    };

    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        width: '420px',
        data: dialogData
      }
    );

    dialogRef.afterClosed().subscribe((shouldClose) => {
      if (shouldClose === undefined) {
        // Dialog was dismissed without a decision - still move to Done but keep it visible
        this.store.updateTask(task.id, { status, resolution: IssueResolution.Fixed });
        return;
      }

      const resolution = shouldClose ? IssueResolution.Closed : IssueResolution.Fixed;
      this.store.updateTask(task.id, { status, resolution });
    });
  }

  public trackById(_: number, task: TaskItem): string {
    return task.id;
  }

  public trackByStatus(_: number, column: KanbanColumnView): IssueStatus {
    return column.status;
  }

  public openDetailPanel(item: TaskItem | Subtask, event?: Event): void {
    event?.stopPropagation();

    // Set the selected item (either TaskItem or Subtask)
    this.selectedTask.set(item);

    this.snapshotColumnHeight();
    this.isPanelOpen.set(true);
  }

  public closeDetailPanel(): void {
    this.isPanelOpen.set(false);
    timer(300).pipe(take(1)).subscribe(() => this.selectedTask.set(null));
  }

  public editFromPanel(item: TaskItem | Subtask): void {
    if ('subtaskType' in item) {
      this.openEditSubtaskDialog(item);
    } else {
      this.openTaskDetail(item, true);
    }
  }

  private openEditSubtaskDialog(subtask: Subtask): void {
    const dialogData: SubtaskEditorDialogData = { subtask };

    const dialogRef = this.dialog.open<SubtaskEditorDialogComponent, SubtaskEditorDialogData, SubtaskEditorDialogResult>(
      SubtaskEditorDialogComponent,
      {
        data: dialogData,
        width: 'calc(100vw / 1.25)',
        maxWidth: '60rem',
        autoFocus: 'first-tabbable'
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.subtaskApi.update(subtask.id, result).subscribe({
        next: (updated) => {
          this.loadAllSubtasks();
          // Update the panel with the new subtask data
          this.selectedTask.set(updated);
        },
        error: (err: unknown) => {
          console.error('[KanbanBoard] Failed to update subtask:', err);
        }
      });
    });
  }

  public statusToken(status: IssueStatus): string {
    return this.presentation.statusToken(status);
  }

  public startResize(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing.set(true);
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = this.panelWidth();
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  @HostListener('document:mousemove', ['$event'])
  public handleResizeMove(event: MouseEvent): void {
    if (!this.isResizing()) {
      return;
    }

    const delta = this.resizeStartX - event.clientX;
    const nextWidth = Math.min(this.maxPanelWidth, Math.max(this.minPanelWidth, this.resizeStartWidth + delta));
    this.panelWidth.set(nextWidth);
  }

  @HostListener('document:mouseup')
  public stopResizing(): void {
    if (!this.isResizing()) {
      return;
    }

    this.isResizing.set(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  @HostListener('window:resize')
  public handleWindowResize(): void {
    this.scheduleColumnHeightMeasurement();
  }

  private openTaskDetail(task: TaskItem, edit = false): void {
    if (typeof window === 'undefined') {
      return;
    }

    const issueKey = task.issueKey ?? task.id;
    const routeSegments = edit
      ? this.taskNav.getEditRoute(issueKey)
      : this.taskNav.getDetailRoute(issueKey);

    if (!routeSegments) {
      return;
    }

    const url = routeSegments.join('/');
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private initializeColumnsHeightObserver(): void {
    if (!this.isBrowser) {
      return;
    }

    const element = this.columnsArea()?.nativeElement;
    if (!element) {
      return;
    }

    this.disposeHeightObserver = observeElementHeight(element, (height) => {
      this.panelHeight.set(height);
    });
  }

  private snapshotColumnHeight(): void {
    if (!this.isBrowser) {
      return;
    }

    const element = this.columnsArea()?.nativeElement;
    if (!element) {
      return;
    }

    this.panelHeight.set(Math.round(element.getBoundingClientRect().height));
  }

  private setupColumnHeightSync(): void {
    if (!this.isBrowser) {
      return;
    }

    this.columnHeightEffect = runInInjectionContext(this.environmentInjector, () =>
      effect(() => {
        this.board();
        this.scheduleColumnHeightMeasurement();
      })
    );

    this.panelStateEffect = runInInjectionContext(this.environmentInjector, () =>
      effect(() => {
        this.isPanelOpen();
        this.scheduleColumnHeightMeasurement();
      })
    );

    this.scheduleColumnHeightMeasurement();
  }

  private scheduleColumnHeightMeasurement(): void {
    if (!this.isBrowser) {
      return;
    }

    if (this.pendingHeightFrame !== null) {
      cancelAnimationFrame(this.pendingHeightFrame);
      this.pendingHeightFrame = null;
    }

    // Use animationFrameScheduler for optimal timing
    timer(0, animationFrameScheduler).pipe(take(1)).subscribe(() => {
      this.applyMeasuredColumnHeight();
    });
  }

  private applyMeasuredColumnHeight(): void {
    // Column height measurement is now simplified since columns are in child components
    this.applyMeasuredHeights(null);
  }

  private applyMeasuredHeights(height: number | null): void {
    this.columnsAreaHeight.set(height);
    if (!this.isBrowser) {
      this.columnHeight.set(height);
      return;
    }

    queueMicrotask(() => {
      this.columnHeight.set(height);
    });
  }

  private extractItemFromDrag(data: unknown): TaskItem | Subtask | null {
    if (data && typeof data === 'object' && 'id' in data && 'title' in data && 'status' in data) {
      return data as TaskItem | Subtask;
    }
    return null;
  }
}
