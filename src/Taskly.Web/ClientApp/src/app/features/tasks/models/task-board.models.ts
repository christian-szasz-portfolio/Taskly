import type { IconDefinition } from '../../../core/icons/icon-registry';
import type { IssueStatus, CardTheme } from '../../../core/models/task.enums';
import type { TaskItem, Subtask } from '../../../core/models/task.interfaces';

export interface KanbanColumnDefinition {
  status: IssueStatus;
  title: string;
  subtitle: string;
  accent: CardTheme | 'mint' | 'plum';
}

export interface KanbanColumnView extends KanbanColumnDefinition {
  items: (TaskItem | Subtask)[];
}

export interface TaskHeroCard {
  label: string;
  value: string;
  icon: IconDefinition;
}

export interface TaskHeroIcons {
  sparkles: IconDefinition;
  create: IconDefinition;
  refresh: IconDefinition;
  calendar: IconDefinition;
  edit: IconDefinition;
  sync: IconDefinition;
}
