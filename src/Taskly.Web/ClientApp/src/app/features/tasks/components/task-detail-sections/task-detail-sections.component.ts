import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '../../../../core/icons/icon-registry';
import type { TaskItem, Subtask } from '../../../../core/models/task.interfaces';
import type { TaskCardHelpers } from '../../models/task-card.helpers';
import { FileAttachmentListComponent } from '../../../../shared/components/file-attachment-list/file-attachment-list.component';
import { RichTextHtmlDirective } from '../../../../shared/directives/rich-text-html.directive';

type PanelItem = TaskItem | Subtask;

interface SectionIconMap {
  description: IconDefinition;
  people: IconDefinition;
  labels: IconDefinition;
  components: IconDefinition;
  dates: IconDefinition;
  additional?: IconDefinition;
  attachments?: IconDefinition;
}

@Component({
  selector: 'app-task-detail-sections',
  standalone: true,
  imports: [CommonModule, MatChipsModule, FontAwesomeModule, FileAttachmentListComponent, RichTextHtmlDirective],
  templateUrl: './task-detail-sections.component.html',
  styleUrl: './task-detail-sections.component.scss',
  host: {
    class: 'task-detail-sections'
  }
})
export class TaskDetailSectionsComponent {
  public readonly task = input.required<PanelItem>();
  public readonly helpers = input.required<TaskCardHelpers>();
  public readonly sectionIcons = input.required<SectionIconMap>();

  /**
   * Whether the component is in edit mode.
   * When true, attachments section will allow upload/delete.
   */
  public readonly editable = input(false);

  /**
   * Determines if the task item is a subtask based on the presence of parentTaskItemId.
   */
  public isSubtask(item: PanelItem): item is Subtask {
    return 'parentTaskItemId' in item && item.parentTaskItemId !== undefined;
  }
}
