import { TestBed } from '@angular/core/testing';
import { TaskPresentationStore, TaskSectionKey } from './task-presentation.service';
import { IssuePriority, IssueResolution, IssueStatus, IssueType, SubtaskType } from '../../../core/models/task.enums';

describe('TaskPresentationStore', () => {
  let service: TaskPresentationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskPresentationStore]
    });

    service = TestBed.inject(TaskPresentationStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('icons', () => {
    it('should provide action icons', () => {
      const icons = service.icons();
      expect(icons.actions).toBeDefined();
      expect(icons.actions.edit).toBeTruthy();
      expect(icons.actions.view).toBeTruthy();
      expect(icons.actions.add).toBeTruthy();
      expect(icons.actions.refresh).toBeTruthy();
    });

    it('should provide hero icons', () => {
      const icons = service.icons();
      expect(icons.hero).toBeDefined();
      expect(icons.hero.sparkles).toBeTruthy();
      expect(icons.hero.create).toBeTruthy();
      expect(icons.hero.calendar).toBeTruthy();
    });

    it('should provide card icons', () => {
      const icons = service.icons();
      expect(icons.cards).toBeDefined();
      expect(icons.cards.total).toBeTruthy();
      expect(icons.cards.open).toBeTruthy();
      expect(icons.cards.completed).toBeTruthy();
    });

    it('should provide section icons', () => {
      const icons = service.icons();
      expect(icons.sections).toBeDefined();
      expect(icons.sections.description).toBeTruthy();
      expect(icons.sections.people).toBeTruthy();
      expect(icons.sections.labels).toBeTruthy();
    });

    it('should provide panel icons', () => {
      expect(service.panelIcons).toBeDefined();
      expect(service.panelIcons.edit).toBeTruthy();
      expect(service.panelIcons.close).toBeTruthy();
    });
  });

  describe('sectionIcon', () => {
    it('should return icon for description section', () => {
      expect(service.sectionIcon(TaskSectionKey.Description)).toBeTruthy();
    });

    it('should return icon for people section', () => {
      expect(service.sectionIcon(TaskSectionKey.People)).toBeTruthy();
    });

    it('should return icon for labels section', () => {
      expect(service.sectionIcon(TaskSectionKey.Labels)).toBeTruthy();
    });

    it('should return icon for components section', () => {
      expect(service.sectionIcon(TaskSectionKey.Components)).toBeTruthy();
    });

    it('should return icon for dates section', () => {
      expect(service.sectionIcon(TaskSectionKey.Dates)).toBeTruthy();
    });

    it('should return icon for additional section', () => {
      expect(service.sectionIcon(TaskSectionKey.Additional)).toBeTruthy();
    });
  });

  describe('labelChipStyle', () => {
    it('should return default style for regular labels', () => {
      const style = service.labelChipStyle('Feature');
      expect(style.backgroundColor).toBeDefined();
      expect(style.color).toBeDefined();
    });

    it('should return NFR style for NFR labels', () => {
      const style = service.labelChipStyle('NFR-Performance');
      expect(style.backgroundColor).toContain('249');
    });

    it('should be case insensitive for NFR detection', () => {
      const style = service.labelChipStyle('nfr-label');
      expect(style.backgroundColor).toContain('249');
    });
  });

  describe('priorityToken', () => {
    it('should return readable token for High priority', () => {
      expect(service.priorityToken(IssuePriority.High)).toBe('High');
    });

    it('should return readable token for Medium priority', () => {
      expect(service.priorityToken(IssuePriority.Medium)).toBe('Medium');
    });

    it('should return readable token for Low priority', () => {
      expect(service.priorityToken(IssuePriority.Low)).toBe('Low');
    });
  });

  describe('priorityIcon', () => {
    it('should return icon for High priority', () => {
      expect(service.priorityIcon(IssuePriority.High)).toBeTruthy();
    });

    it('should return icon for Medium priority', () => {
      expect(service.priorityIcon(IssuePriority.Medium)).toBeTruthy();
    });

    it('should return icon for Low priority', () => {
      expect(service.priorityIcon(IssuePriority.Low)).toBeTruthy();
    });
  });

  describe('priorityColor', () => {
    it('should return color for each priority', () => {
      expect(service.priorityColor(IssuePriority.High)).toMatch(/^#[0-9a-f]{6}$/i);
      expect(service.priorityColor(IssuePriority.Medium)).toMatch(/^#[0-9a-f]{6}$/i);
      expect(service.priorityColor(IssuePriority.Low)).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('statusToken', () => {
    it('should return readable tokens for all statuses', () => {
      expect(service.statusToken(IssueStatus.Created)).toBe('Created');
      expect(service.statusToken(IssueStatus.Open)).toBe('Open');
      expect(service.statusToken(IssueStatus.Todo)).toBe('To-Do');
      expect(service.statusToken(IssueStatus.InProgress)).toBe('In Progress');
      expect(service.statusToken(IssueStatus.Testing)).toBe('Testing');
      expect(service.statusToken(IssueStatus.Done)).toBe('Done');
      expect(service.statusToken(IssueStatus.Administrative)).toBe('Administrative');
    });
  });

  describe('statusIcon', () => {
    it('should return icon for each status', () => {
      expect(service.statusIcon(IssueStatus.Open)).toBeTruthy();
      expect(service.statusIcon(IssueStatus.InProgress)).toBeTruthy();
      expect(service.statusIcon(IssueStatus.Done)).toBeTruthy();
      expect(service.statusIcon(IssueStatus.Testing)).toBeTruthy();
    });
  });

  describe('statusColor', () => {
    it('should return hex color for each status', () => {
      expect(service.statusColor(IssueStatus.Open)).toMatch(/^#[0-9a-f]{6}$/i);
      expect(service.statusColor(IssueStatus.InProgress)).toMatch(/^#[0-9a-f]{6}$/i);
      expect(service.statusColor(IssueStatus.Done)).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('issueTypeToken', () => {
    it('should return readable tokens for all issue types', () => {
      expect(service.issueTypeToken(IssueType.Task)).toBe('Task');
      expect(service.issueTypeToken(IssueType.Bug)).toBe('Bug');
      expect(service.issueTypeToken(IssueType.Story)).toBe('Story');
      expect(service.issueTypeToken(IssueType.Epic)).toBe('Epic');
      expect(service.issueTypeToken(IssueType.TechnicalTask)).toBe('Technical Task');
      expect(service.issueTypeToken(IssueType.ProblemCase)).toBe('Problem Case');
      expect(service.issueTypeToken(IssueType.Improvement)).toBe('Improvement');
      expect(service.issueTypeToken(IssueType.Documentation)).toBe('Documentation');
    });
  });

  describe('issueTypeIcon', () => {
    it('should return icon for each issue type', () => {
      expect(service.issueTypeIcon(IssueType.Task)).toBeTruthy();
      expect(service.issueTypeIcon(IssueType.Bug)).toBeTruthy();
      expect(service.issueTypeIcon(IssueType.Story)).toBeTruthy();
      expect(service.issueTypeIcon(IssueType.Epic)).toBeTruthy();
    });
  });

  describe('issueTypeColor', () => {
    it('should return hex color for each issue type', () => {
      expect(service.issueTypeColor(IssueType.Task)).toMatch(/^#[0-9a-f]{6}$/i);
      expect(service.issueTypeColor(IssueType.Bug)).toMatch(/^#[0-9a-f]{6}$/i);
      expect(service.issueTypeColor(IssueType.Epic)).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('subtaskTypeToken', () => {
    it('should return readable tokens for subtask types', () => {
      expect(service.subtaskTypeToken(SubtaskType.Development)).toBe('Development');
      expect(service.subtaskTypeToken(SubtaskType.Translations)).toBe('Translations');
      expect(service.subtaskTypeToken(SubtaskType.BugInDevelopment)).toBe('Bug in Development');
    });
  });

  describe('subtaskTypeIcon', () => {
    it('should return icon for each subtask type', () => {
      expect(service.subtaskTypeIcon(SubtaskType.Development)).toBeTruthy();
      expect(service.subtaskTypeIcon(SubtaskType.Translations)).toBeTruthy();
      expect(service.subtaskTypeIcon(SubtaskType.BugInDevelopment)).toBeTruthy();
    });
  });

  describe('subtaskTypeColor', () => {
    it('should return hex color for each subtask type', () => {
      expect(service.subtaskTypeColor(SubtaskType.Development)).toMatch(/^#[0-9a-f]{6}$/i);
      expect(service.subtaskTypeColor(SubtaskType.Translations)).toMatch(/^#[0-9a-f]{6}$/i);
      expect(service.subtaskTypeColor(SubtaskType.BugInDevelopment)).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('resolutionToken', () => {
    it('should return readable tokens for resolutions', () => {
      expect(service.resolutionToken(IssueResolution.NotFixed)).toBe('Not Fixed');
      expect(service.resolutionToken(IssueResolution.Fixed)).toBe('Fixed');
      expect(service.resolutionToken(IssueResolution.Closed)).toBe('Closed');
    });
  });

  describe('resolutionIcon', () => {
    it('should return icon for each resolution', () => {
      expect(service.resolutionIcon(IssueResolution.NotFixed)).toBeTruthy();
      expect(service.resolutionIcon(IssueResolution.Fixed)).toBeTruthy();
      expect(service.resolutionIcon(IssueResolution.Closed)).toBeTruthy();
    });
  });

  describe('resolutionColor', () => {
    it('should return hex color for each resolution', () => {
      expect(service.resolutionColor(IssueResolution.NotFixed)).toMatch(/^#[0-9a-f]{6}$/i);
      expect(service.resolutionColor(IssueResolution.Fixed)).toMatch(/^#[0-9a-f]{6}$/i);
      expect(service.resolutionColor(IssueResolution.Closed)).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('cardHelpers', () => {
    it('should expose all helper functions', () => {
      expect(typeof service.cardHelpers.labelChipStyle).toBe('function');
      expect(typeof service.cardHelpers.statusIcon).toBe('function');
      expect(typeof service.cardHelpers.statusToken).toBe('function');
      expect(typeof service.cardHelpers.statusColor).toBe('function');
      expect(typeof service.cardHelpers.issueTypeIcon).toBe('function');
      expect(typeof service.cardHelpers.issueTypeToken).toBe('function');
      expect(typeof service.cardHelpers.issueTypeColor).toBe('function');
      expect(typeof service.cardHelpers.priorityIcon).toBe('function');
      expect(typeof service.cardHelpers.priorityToken).toBe('function');
      expect(typeof service.cardHelpers.priorityColor).toBe('function');
      expect(typeof service.cardHelpers.resolutionIcon).toBe('function');
      expect(typeof service.cardHelpers.resolutionToken).toBe('function');
      expect(typeof service.cardHelpers.resolutionColor).toBe('function');
    });

    it('should return correct values through helper interface', () => {
      expect(service.cardHelpers.priorityToken(IssuePriority.High)).toBe('High');
      expect(service.cardHelpers.statusToken(IssueStatus.Done)).toBe('Done');
      expect(service.cardHelpers.issueTypeToken(IssueType.Bug)).toBe('Bug');
    });
  });
});
