import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../../core/icons/icon-registry';
import type { TaskItem, Subtask } from '../../../../core/models/task.interfaces';
import type { TaskCardHelpers } from '../../models/task-card.helpers';
import { formatTimeSpent } from '../../../../core/utilities/task.utility';

type PanelItem = TaskItem | Subtask;

@Component({
  selector: 'app-task-summary-cards',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './task-summary-cards.component.html',
  styleUrl: './task-summary-cards.component.scss',
  host: {
    class: 'task-summary-cards'
  }
})
export class TaskSummaryCardsComponent {
  public readonly task = input.required<PanelItem>();
  public readonly helpers = input.required<TaskCardHelpers>();

  public readonly isSubtask = computed(() => 'subtaskType' in this.task());
  public readonly formattedTimeSpent = computed(() => formatTimeSpent(this.task().timeSpentMinutes));
  public readonly clockIcon = Icons.clock;
}
