import { Injectable, computed, signal } from '@angular/core';
import { Icons, type IconDefinition } from '../../../core/icons/icon-registry';
import type { TaskCardHelpers, TaskChipStyle } from '../models/task-card.helpers';
import { IssuePriority, IssueResolution, IssueStatus, IssueType, SubtaskType } from '../../../core/models/task.enums';

export enum TaskSectionKey {
  Description = 'description',
  People = 'people',
  Labels = 'labels',
  Components = 'components',
  Dates = 'dates',
  Additional = 'additional',
  Attachments = 'attachments',
}

interface TaskStatusColors {
  readonly [IssueStatus.Created]: string;
  readonly [IssueStatus.Open]: string;
  readonly [IssueStatus.Todo]: string;
  readonly [IssueStatus.InProgress]: string;
  readonly [IssueStatus.Testing]: string;
  readonly [IssueStatus.Done]: string;
  readonly [IssueStatus.Administrative]: string;
}

interface TaskPriorityColors {
  readonly [IssuePriority.High]: string;
  readonly [IssuePriority.Medium]: string;
  readonly [IssuePriority.Low]: string;
}

interface TaskResolutionColors {
  readonly [IssueResolution.NotFixed]: string;
  readonly [IssueResolution.Fixed]: string;
  readonly [IssueResolution.Closed]: string;
}

interface TaskIssueTypeColors {
  readonly [IssueType.ProblemCase]: string;
  readonly [IssueType.Bug]: string;
  readonly [IssueType.Incident]: string;
  readonly [IssueType.Story]: string;
  readonly [IssueType.Epic]: string;
  readonly [IssueType.Task]: string;
  readonly [IssueType.TechnicalTask]: string;
  readonly [IssueType.Improvement]: string;
  readonly [IssueType.Documentation]: string;
}

interface TaskSubtaskTypeColors {
  readonly [SubtaskType.Development]: string;
  readonly [SubtaskType.Translations]: string;
  readonly [SubtaskType.BugInDevelopment]: string;
}

interface TaskIconRegistry {
  actions: {
    edit: IconDefinition;
    view: IconDefinition;
    add: IconDefinition;
    addCard: IconDefinition;
    refresh: IconDefinition;
    chevronDown: IconDefinition;
    chevronRight: IconDefinition;
    externalLink: IconDefinition;
    resolve: IconDefinition;
  };
  hero: {
    sparkles: IconDefinition;
    create: IconDefinition;
    refresh: IconDefinition;
    calendar: IconDefinition;
    edit: IconDefinition;
    sync: IconDefinition;
  };
  cards: {
    total: IconDefinition;
    open: IconDefinition;
    toDo: IconDefinition;
    inProgress: IconDefinition;
    testing: IconDefinition;
    completed: IconDefinition;
    completion: IconDefinition;
  };
  sections: Record<TaskSectionKey, IconDefinition>;
  panel: {
    gripLines: IconDefinition;
    edit: IconDefinition;
    close: IconDefinition;
    externalLink: IconDefinition;
    addSubtask: IconDefinition;
  };
}

@Injectable({ providedIn: 'root' })
export class TaskPresentationStore {
  private readonly iconRegistry = signal<TaskIconRegistry>({
    actions: {
      edit: Icons.edit,
      view: Icons.eye,
      add: Icons.plus,
      addCard: Icons.addCard,
      refresh: Icons.sync,
      chevronDown: Icons.chevronDown,
      chevronRight: Icons.chevronRight,
      externalLink: Icons.externalLinkAlt,
      resolve: Icons.success
    },
    hero: {
      sparkles: Icons.sparkles,
      create: Icons.addCard,
      refresh: Icons.rotateRight,
      calendar: Icons.calendarDays,
      edit: Icons.edit,
      sync: Icons.sync
    },
    cards: {
      total: Icons.listCheck,
      open: Icons.circle,
      toDo: Icons.clipboardList,
      inProgress: Icons.inProgress,
      testing: Icons.flask,
      completed: Icons.circleCheck,
      completion: Icons.finished
    },
    sections: {
      description: Icons.description,
      people: Icons.users,
      labels: Icons.tags,
      components: Icons.clipboardCheck,
      dates: Icons.calendarDays,
      additional: Icons.info,
      attachments: Icons.attachment
    },
    panel: {
      gripLines: Icons.gripLines,
      edit: Icons.edit,
      close: Icons.times,
      externalLink: Icons.externalLinkAlt,
      addSubtask: Icons.sitemap
    }
  });

  private readonly priorityIconMap: Record<IssuePriority, IconDefinition> = {
    [IssuePriority.High]: Icons.priorityHigh,
    [IssuePriority.Medium]: Icons.priorityMedium,
    [IssuePriority.Low]: Icons.priorityLow
  };

  private readonly resolutionIconMap: Record<IssueResolution, IconDefinition> = {
    [IssueResolution.NotFixed]: Icons.times,
    [IssueResolution.Fixed]: Icons.circleCheck,
    [IssueResolution.Closed]: Icons.finished
  };

  private readonly statusIconMap: Record<IssueStatus, IconDefinition> = {
    [IssueStatus.Created]: Icons.circle,
    [IssueStatus.Open]: Icons.circle,
    [IssueStatus.Todo]: Icons.clipboardList,
    [IssueStatus.InProgress]: Icons.inProgress,
    [IssueStatus.Testing]: Icons.flask,
    [IssueStatus.Done]: Icons.success,
    [IssueStatus.Administrative]: Icons.info
  };

  private readonly issueTypeIconMap: Record<IssueType, IconDefinition> = {
    [IssueType.ProblemCase]: Icons.fire,
    [IssueType.Bug]: Icons.bug,
    [IssueType.Incident]: Icons.error,
    [IssueType.Story]: Icons.story,
    [IssueType.Epic]: Icons.epic,
    [IssueType.Task]: Icons.clipboardCheck,
    [IssueType.TechnicalTask]: Icons.wrench,
    [IssueType.Improvement]: Icons.lightbulb,
    [IssueType.Documentation]: Icons.file
  };

  private readonly subtaskTypeIconMap: Record<SubtaskType, IconDefinition> = {
    [SubtaskType.Development]: Icons.code,
    [SubtaskType.Translations]: Icons.language,
    [SubtaskType.BugInDevelopment]: Icons.bug
  };

  private readonly priorityLookup: Record<IssuePriority, string> = {
    [IssuePriority.High]: 'High',
    [IssuePriority.Medium]: 'Medium',
    [IssuePriority.Low]: 'Low'
  };

  private readonly issueTypeLookup: Record<IssueType, string> = {
    [IssueType.ProblemCase]: 'Problem Case',
    [IssueType.Bug]: 'Bug',
    [IssueType.Incident]: 'Incident',
    [IssueType.Story]: 'Story',
    [IssueType.Epic]: 'Epic',
    [IssueType.Task]: 'Task',
    [IssueType.TechnicalTask]: 'Technical Task',
    [IssueType.Improvement]: 'Improvement',
    [IssueType.Documentation]: 'Documentation'
  };

  private readonly subtaskTypeLookup: Record<SubtaskType, string> = {
    [SubtaskType.Development]: 'Development',
    [SubtaskType.Translations]: 'Translations',
    [SubtaskType.BugInDevelopment]: 'Bug in Development'
  };

  private readonly resolutionLookup: Record<IssueResolution, string> = {
    [IssueResolution.NotFixed]: 'Not Fixed',
    [IssueResolution.Fixed]: 'Fixed',
    [IssueResolution.Closed]: 'Closed'
  };

  private readonly statusLookup: Record<IssueStatus, string> = {
    [IssueStatus.Created]: 'Created',
    [IssueStatus.Open]: 'Open',
    [IssueStatus.Todo]: 'To-Do',
    [IssueStatus.InProgress]: 'In Progress',
    [IssueStatus.Testing]: 'Testing',
    [IssueStatus.Done]: 'Done',
    [IssueStatus.Administrative]: 'Administrative'
  };

  private readonly statusColors: TaskStatusColors = {
    [IssueStatus.Created]: '#6366f1',
    [IssueStatus.Open]: '#0ea5e9',
    [IssueStatus.Todo]: '#2563eb',
    [IssueStatus.InProgress]: '#f97316',
    [IssueStatus.Testing]: '#a855f7',
    [IssueStatus.Done]: '#22c55e',
    [IssueStatus.Administrative]: '#475569'
  };

  private readonly priorityColors: TaskPriorityColors = {
    [IssuePriority.High]: '#dc2626',
    [IssuePriority.Medium]: '#d97706',
    [IssuePriority.Low]: '#0f766e'
  };

  private readonly issueTypeColors: TaskIssueTypeColors = {
    [IssueType.ProblemCase]: '#f97316',
    [IssueType.Bug]: '#ef4444',
    [IssueType.Incident]: '#941616ff',
    [IssueType.Story]: '#14b8a6',
    [IssueType.Epic]: '#a855f7',
    [IssueType.Task]: '#2563eb',
    [IssueType.TechnicalTask]: '#475569',
    [IssueType.Improvement]: '#22c55e',
    [IssueType.Documentation]: '#0ea5e9'
  };

  private readonly subtaskTypeColors: TaskSubtaskTypeColors = {
    [SubtaskType.Development]: '#2563eb',
    [SubtaskType.Translations]: '#8b5cf6',
    [SubtaskType.BugInDevelopment]: '#ef4444'
  };

  private readonly resolutionColors: TaskResolutionColors = {
    [IssueResolution.NotFixed]: '#dc2626',
    [IssueResolution.Fixed]: '#22c55e',
    [IssueResolution.Closed]: '#475569'
  };

  private readonly chipPalette: Record<'default' | 'nfr', TaskChipStyle> = {
    default: { backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#312e81' },
    nfr: { backgroundColor: 'rgba(249, 115, 22, 0.15)', color: '#c2410c' }
  };

  public readonly icons = computed(() => this.iconRegistry());

  public get panelIcons(): TaskIconRegistry['panel'] {
    return this.iconRegistry().panel;
  }

  public readonly cardHelpers: TaskCardHelpers = {
    labelChipStyle: (label) => this.labelChipStyle(label),
    statusIcon: (status) => this.statusIcon(status),
    statusToken: (status) => this.statusToken(status),
    statusColor: (status) => this.statusColor(status),
    issueTypeIcon: (type) => this.issueTypeIcon(type),
    issueTypeToken: (type) => this.issueTypeToken(type),
    issueTypeColor: (type) => this.issueTypeColor(type),
    subtaskTypeIcon: (type) => this.subtaskTypeIcon(type),
    subtaskTypeToken: (type) => this.subtaskTypeToken(type),
    subtaskTypeColor: (type) => this.subtaskTypeColor(type),
    priorityIcon: (priority) => this.priorityIcon(priority),
    priorityToken: (priority) => this.priorityToken(priority),
    priorityColor: (priority) => this.priorityColor(priority),
    resolutionIcon: (resolution) => this.resolutionIcon(resolution),
    resolutionToken: (resolution) => this.resolutionToken(resolution),
    resolutionColor: (resolution) => this.resolutionColor(resolution)
  };

  public sectionIcon(section: TaskSectionKey): IconDefinition {
    return this.iconRegistry().sections[section];
  }

  public labelChipStyle(label: string): TaskChipStyle {
    const palette = label.toLowerCase().includes('nfr') ? this.chipPalette.nfr : this.chipPalette.default;
    return { ...palette };
  }

  public priorityToken(priority: IssuePriority): string {
    return this.priorityLookup[priority] ?? priority;
  }

  public issueTypeToken(variant: IssueType): string {
    return this.issueTypeLookup[variant] ?? variant;
  }

  public statusToken(status: IssueStatus): string {
    return this.statusLookup[status] ?? status;
  }

  public resolutionToken(resolution: IssueResolution): string {
    return this.resolutionLookup[resolution] ?? resolution;
  }

  public resolutionIcon(resolution: IssueResolution): IconDefinition {
    return this.resolutionIconMap[resolution] ?? Icons.info;
  }

  public resolutionColor(resolution: IssueResolution): string {
    return this.resolutionColors[resolution] ?? '#0f172a';
  }

  public priorityIcon(priority: IssuePriority): IconDefinition {
    return this.priorityIconMap[priority] ?? Icons.priorityMedium;
  }

  public statusIcon(status: IssueStatus): IconDefinition {
    return this.statusIconMap[status] ?? Icons.circle;
  }

  public issueTypeIcon(variant: IssueType): IconDefinition {
    return this.issueTypeIconMap[variant] ?? Icons.clipboardCheck;
  }

  public statusColor(status: IssueStatus): string {
    return this.statusColors[status] ?? '#0f172a';
  }

  public priorityColor(priority: IssuePriority): string {
    return this.priorityColors[priority] ?? '#0f172a';
  }

  public issueTypeColor(variant: IssueType): string {
    return this.issueTypeColors[variant] ?? '#0f172a';
  }

  public subtaskTypeIcon(subtaskType: SubtaskType): IconDefinition {
    return this.subtaskTypeIconMap[subtaskType] ?? Icons.code;
  }

  public subtaskTypeToken(subtaskType: SubtaskType): string {
    return this.subtaskTypeLookup[subtaskType] ?? subtaskType;
  }

  public subtaskTypeColor(subtaskType: SubtaskType): string {
    return this.subtaskTypeColors[subtaskType] ?? '#0f172a';
  }
}
