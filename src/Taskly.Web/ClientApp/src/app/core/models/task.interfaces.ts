import type { IssuePriority, IssueResolution, IssueStatus, IssueType, SubtaskType } from './task.enums';

export interface TaskItem {
  id: string;
  issueKey?: string | null;
  title: string;
  description?: string | null;
  dueAtUtc?: string | null;
  isCompleted: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  completedAtUtc?: string | null;
  createdBy: string;
  assignedTo?: string | null;
  category?: string | null;
  priority: IssuePriority;
  status: IssueStatus;
  issueType: IssueType;
  labels: string[];
  components: string[];
  epicKey?: string | null;
  resolution: IssueResolution;
  reporter?: string | null;
  linkedTaskId?: string | null;
  /** The parent project ID. Required for all task items. */
  projectId: string;
  position: number;
  /** Total time spent in minutes. Must be multiples of 30. */
  timeSpentMinutes: number;
}

export interface Subtask {
  id: string;
  issueKey?: string | null;
  title: string;
  description?: string | null;
  dueAtUtc?: string | null;
  isCompleted: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  completedAtUtc?: string | null;
  createdBy: string;
  assignedTo?: string | null;
  category?: string | null;
  priority: IssuePriority;
  status: IssueStatus;
  subtaskType: SubtaskType;
  labels: string[];
  components: string[];
  epicKey?: string | null;
  resolution: IssueResolution;
  reporter?: string | null;
  position: number;
  parentTaskItemId: string;
  /** Total time spent in minutes. Must be multiples of 30. */
  timeSpentMinutes: number;
}

export interface IssuePriorityOption {
  value: IssuePriority;
  label: string;
}
