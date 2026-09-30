import { IssuePriority } from '../../../core/models/task.enums';
import type { IssuePriorityOption } from '../../../core/models/task.interfaces';

export const TASK_EDITOR_PRIORITY_OPTIONS: readonly IssuePriorityOption[] = [
  { value: IssuePriority.High, label: '🔥 High' },
  { value: IssuePriority.Medium, label: '⏱️ Medium' },
  { value: IssuePriority.Low, label: '📥 Low' }
];
