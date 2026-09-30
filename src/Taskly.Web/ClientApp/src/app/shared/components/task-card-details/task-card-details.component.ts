import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../core/icons/icon-registry';
import type { TaskItem } from '../../../core/models/task.interfaces';
import { TaskPresentationStore } from '../../../features/tasks/services/task-presentation.service';
import { RichTextHtmlDirective } from '../../directives/rich-text-html.directive';

@Component({
  selector: 'app-task-card-details',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RichTextHtmlDirective],
  templateUrl: './task-card-details.component.html',
  styleUrl: './task-card-details.component.scss'
})
export class TaskCardDetailsComponent {
  private readonly presentationStore = inject(TaskPresentationStore);

  /** The task item to display details for */
  public readonly task = input.required<TaskItem>();

  public readonly icons = {
    assignee: Icons.user,
    dueDate: Icons.calendarDays,
    priority: Icons.flag,
    status: Icons.layers,
    labels: Icons.tags,
    components: Icons.components
  };

  public readonly formattedDueDate = computed(() => {
    const dueAtUtc = this.task().dueAtUtc;
    if (!dueAtUtc) {
      return null;
    }
    const date = new Date(dueAtUtc);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });

  public readonly hasDescription = computed(() => {
    const description = this.task().description;
    return description != null && description.length > 0;
  });

  public readonly hasLabels = computed(() => this.task().labels.length > 0);

  public readonly hasComponents = computed(() => this.task().components.length > 0);

  public readonly priorityLabel = computed(() => this.presentationStore.cardHelpers.priorityToken(this.task().priority));

  public readonly statusLabel = computed(() => this.presentationStore.cardHelpers.statusToken(this.task().status));
}
