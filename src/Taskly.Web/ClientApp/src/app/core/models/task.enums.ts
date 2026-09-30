export enum IssuePriority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum IssueStatus {
  Created = 'Created',
  Open = 'Open',
  Todo = 'Todo',
  InProgress = 'InProgress',
  Testing = 'Testing',
  Done = 'Done',
  Administrative = 'Administrative',
}

export enum IssueResolution {
  NotFixed = 'NotFixed',
  Fixed = 'Fixed',
  Closed = 'Closed',
}

export enum IssueType {
  ProblemCase = 'ProblemCase',
  Bug = 'Bug',
  Incident = 'Incident',
  Story = 'Story',
  Epic = 'Epic',
  Task = 'Task',
  TechnicalTask = 'TechnicalTask',
  Improvement = 'Improvement',
  Documentation = 'Documentation',
}

export enum SubtaskType {
  Development = 'Development',
  Translations = 'Translations',
  BugInDevelopment = 'BugInDevelopment',
}

export enum ProjectStatus {
  Inactive = 'Inactive',
  Active = 'Active',
}

/**
 * Source from which project data is being imported.
 */
/**
 * Role of a contributor within a project.
 */
export enum ProjectContributorRole {
  Owner = 'Owner',
  Contributor = 'Contributor',
}

/**
 * Theme colors for UI components like cards and catalogs.
 */
export enum CardTheme {
  Indigo = 'indigo',
  Sky = 'sky',
  Emerald = 'emerald',
  Amber = 'amber',
  Rose = 'rose',
  Slate = 'slate',
}
