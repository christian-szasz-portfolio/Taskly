import type { IssuePriority, IssueResolution, IssueStatus, IssueType, SubtaskType } from './task.enums';

interface TaskBasePayload {
  title: string;
  description?: string | null;
  dueAtUtc?: string | null;
  assignedTo?: string | null;
  reporter?: string | null;
  category?: string | null;
  components?: string[] | null;
  labels?: string[] | null;
  epicKey?: string | null;
  linkedTaskId?: string | null;
}

export interface UpdateTaskPayload extends Partial<TaskBasePayload> {
  /** The parent project ID. */
  projectId?: string;
  priority?: IssuePriority;
  status?: IssueStatus;
  issueType?: IssueType;
  isCompleted?: boolean;
  resolution?: IssueResolution;
}

export interface UpdateTaskTransitionPayload {
  status: IssueStatus;
  priority?: IssuePriority;
  issueType?: IssueType;
  resolution?: IssueResolution;
  labels?: string[] | null;
  epicKey?: string | null;
}

interface SubtaskBasePayload {
  title: string;
  description?: string | null;
  dueAtUtc?: string | null;
  assignedTo?: string | null;
  reporter?: string | null;
  category?: string | null;
  components?: string[] | null;
  labels?: string[] | null;
  epicKey?: string | null;
}

export interface UpdateSubtaskPayload extends Partial<SubtaskBasePayload> {
  title?: string;
  priority?: IssuePriority;
  status?: IssueStatus;
  subtaskType?: SubtaskType;
  isCompleted?: boolean;
  resolution?: IssueResolution;
}
