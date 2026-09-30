import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, HostBinding, input, output, inject } from '@angular/core';
import { ElementRef } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '../../../../core/icons/icon-registry';
import { IssueStatus } from '../../../../core/models/task.enums';
import type { TaskItem, Subtask } from '../../../../core/models/task.interfaces';
import type { KanbanColumnView } from '../../models/task-board.models';
import type { TaskCardHelpers } from '../../models/task-card.helpers';
import { formatTimeSpent } from '../../../../core/utilities/task.utility';

type BoardItem = TaskItem | Subtask;

interface DropPayload {
  event: CdkDragDrop<BoardItem[]>;
  status: IssueStatus;
}

interface CardSelectionPayload {
  task: BoardItem;
  event: Event;
}

@Component({
  selector: 'app-task-column',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, MatChipsModule, FontAwesomeModule],
  templateUrl: './task-column.component.html',
  styleUrl: './task-column.component.scss',
  host: {
    class: 'task-column-host'
  }
})
export class TaskColumnComponent {
  public readonly column = input.required<KanbanColumnView>();
  public readonly helpers = input.required<TaskCardHelpers>();
  public readonly addCardIcon = input.required<IconDefinition>();
  public readonly columnHeight = input<number | null>(null);
  /** Whether the user can write/modify items (license-based access control) */
  public readonly canWrite = input(true);

  public readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef<HTMLElement>);

  @HostBinding('style.height.px')
  public get hostHeight(): number | null {
    const height = this.columnHeight();
    return height && height > 0 ? height : null;
  }

  public readonly cardDropped = output<DropPayload>();
  public readonly cardSelected = output<CardSelectionPayload>();

  public onDrop(event: CdkDragDrop<BoardItem[]>): void {
    this.cardDropped.emit({ event, status: this.column().status });
  }

  public onCardSelected(item: BoardItem, event: Event): void {
    this.cardSelected.emit({ task: item, event });
  }

  public trackByTaskId(_: number, item: BoardItem): string {
    return item.id;
  }

  public getIssueTypeDisplay(item: BoardItem): string {
    if ('issueType' in item) {
      return this.helpers().issueTypeToken(item.issueType);
    }
    return this.helpers().subtaskTypeToken(item.subtaskType);
  }

  public getIssueTypeIcon(item: BoardItem): IconDefinition {
    if ('issueType' in item) {
      return this.helpers().issueTypeIcon(item.issueType);
    }
    return this.helpers().subtaskTypeIcon(item.subtaskType);
  }

  public isSubtask(item: BoardItem): item is Subtask {
    return 'subtaskType' in item;
  }

  public isSubtaskDone(item: BoardItem): boolean {
    return this.isSubtask(item) && item.status === IssueStatus.Done;
  }

  /**
   * Gets the display key for a subtask. Returns the issue key if available,
   * otherwise returns a shortened version of the subtask ID.
   */
  public getSubtaskDisplayKey(item: BoardItem): string | null {
    if (!this.isSubtask(item)) {
      return null;
    }
    if (item.issueKey) {
      return item.issueKey;
    }
    // Fallback: use first 8 characters of the ID as a short identifier
    return `ST-${item.id.substring(0, 8).toUpperCase()}`;
  }

  /**
   * Gets formatted time spent for display. Returns null if no time logged.
   */
  public getFormattedTimeSpent(item: BoardItem): string | null {
    return formatTimeSpent(item.timeSpentMinutes);
  }
}
