import type { IconDefinition } from '../../../core/icons/icon-registry';
import type { IssuePriority, IssueResolution, IssueStatus, IssueType, SubtaskType } from '../../../core/models/task.enums';

export interface TaskChipStyle {
  backgroundColor: string;
  color: string;
}

export interface TaskCardHelpers {
  labelChipStyle(label: string): TaskChipStyle;
  statusIcon(status: IssueStatus): IconDefinition;
  statusToken(status: IssueStatus): string;
  statusColor(status: IssueStatus): string;
  issueTypeIcon(type: IssueType): IconDefinition;
  issueTypeToken(type: IssueType): string;
  issueTypeColor(type: IssueType): string;
  subtaskTypeIcon(type: SubtaskType): IconDefinition;
  subtaskTypeToken(type: SubtaskType): string;
  subtaskTypeColor(type: SubtaskType): string;
  priorityIcon(priority: IssuePriority): IconDefinition;
  priorityToken(priority: IssuePriority): string;
  priorityColor(priority: IssuePriority): string;
  resolutionIcon(resolution: IssueResolution): IconDefinition;
  resolutionToken(resolution: IssueResolution): string;
  resolutionColor(resolution: IssueResolution): string;
}
