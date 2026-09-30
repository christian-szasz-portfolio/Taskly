import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '../../../../core/icons/icon-registry';
import { IssueType } from '../../../../core/models/task.enums';
import type { IssueResolution } from '../../../../core/models/task.enums';
import type { TaskItem, Subtask } from '../../../../core/models/task.interfaces';
import { TaskNavigationService } from '../../../../core/services/task/task-navigation.service';
import type { TaskCardHelpers } from '../../models/task-card.helpers';
import { TaskPresentationStore } from '../../services/task-presentation.service';
import { TaskSummaryCardsComponent } from '../task-summary-cards/task-summary-cards.component';
import { TaskDetailSectionsComponent } from '../task-detail-sections/task-detail-sections.component';

type PanelItem = TaskItem | Subtask;

interface PanelIcons {
  gripLines: IconDefinition;
  edit: IconDefinition;
  close: IconDefinition;
  externalLink: IconDefinition;
  addSubtask: IconDefinition;
}

@Component({
  selector: 'app-task-detail-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    FontAwesomeModule,
    TaskSummaryCardsComponent,
    TaskDetailSectionsComponent,
  ],
  templateUrl: './task-detail-panel.component.html',
  styleUrl: './task-detail-panel.component.scss',
  host: {
    class: 'task-detail-panel-host',
    '[style.flex-basis.px]': 'panelWidth()',
  },
})
export class TaskDetailPanelComponent {
  private static readonly SUBTASK_ALLOWED_TYPES: readonly IssueType[] = [
    IssueType.Task,
    IssueType.Story,
    IssueType.Bug,
  ];

  private readonly presentation = inject(TaskPresentationStore);
  private readonly taskNav = inject(TaskNavigationService);

  public readonly panelWidth = input(420);
  public readonly panelHeight = input<number | null>(null);
  public readonly task = input<PanelItem | null>(null);
  public readonly helpers = input.required<TaskCardHelpers>();
  public readonly panelIcons = input.required<PanelIcons>();
  /** Whether the user can write/modify items (license-based access control) */
  public readonly canWrite = input(true);

  public readonly sectionIcons = computed(() => this.presentation.icons().sections);
  public readonly isSubtask = computed(() => {
    const current = this.task();
    return current ? 'subtaskType' in current : false;
  });
  public readonly canHaveSubtasks = computed(() => {
    const current = this.task();
    if (!current || this.isSubtask()) {
      return false;
    }
    return TaskDetailPanelComponent.SUBTASK_ALLOWED_TYPES.includes(
      (current as TaskItem).issueType,
    );
  });
  public readonly editTooltip = computed(() =>
    this.canWrite() ? 'Edit' : 'Read-only mode: cannot edit',
  );
  public readonly createSubtaskDisabledNote = 'The demo does not allow creating subtasks.';

  public readonly startResize = output<MouseEvent>();
  public readonly closePanel = output<void>();
  public readonly editTask = output<PanelItem>();

  public onEdit(item: PanelItem): void {
    this.editTask.emit(item);
  }

  public detailUrl(item: PanelItem): string {
    const issueKey = item.issueKey ?? item.id;
    const routeSegments = this.taskNav.getDetailRoute(issueKey);
    if (!routeSegments) {
      // Fallback if no active project
      return `/tasks/${encodeURIComponent(issueKey)}`;
    }
    return routeSegments.join('/');
  }

  public resolutionLabel(resolution: IssueResolution | null | undefined): string {
    return resolution ? this.presentation.resolutionToken(resolution) : '';
  }
}
