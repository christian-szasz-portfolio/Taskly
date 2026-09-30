namespace Taskly.Web.Demo;

using Taskly.Contracts.Enums.Issues;
using Taskly.Contracts.Enums.Notifications;
using Taskly.Contracts.Enums.Projects;

// DTOs for the demo seed payload. Shapes mirror what the Angular client normalizes
// (string enums via JsonStringEnumConverter; `Variant` on a task item maps to the
// frontend's `issueType`). These are plain records — no entities, no EF.

public sealed record ProjectDto
{
    public Guid Id { get; init; }
    public string? Key { get; init; }
    public ProjectStatus Status { get; init; } = ProjectStatus.Active;
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? DueAtUtc { get; init; }
    public bool IsCompleted { get; init; }
    public string? Owner { get; init; }
    public List<string> Labels { get; init; } = [];
    public List<string> Components { get; init; } = [];
    public string CreatedAtUtc { get; init; } = string.Empty;
    public string? UpdatedAtUtc { get; init; }
    public string? CompletedAtUtc { get; init; }
}

public sealed record TaskItemDto
{
    public Guid Id { get; init; }
    public string? IssueKey { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? DueAtUtc { get; init; }
    public bool IsCompleted { get; init; }
    public string CreatedAtUtc { get; init; } = string.Empty;
    public string? UpdatedAtUtc { get; init; }
    public string? CompletedAtUtc { get; init; }
    public string? CreatedBy { get; init; }
    public string? AssignedTo { get; init; }
    public string? Category { get; init; }
    public IssuePriority Priority { get; init; } = IssuePriority.Medium;
    public IssueStatus Status { get; init; } = IssueStatus.Open;
    /// <summary>Backend "Variant" == frontend "issueType".</summary>
    public IssueType Variant { get; init; } = IssueType.Task;
    public List<string> Labels { get; init; } = [];
    public List<string> Components { get; init; } = [];
    public string? EpicKey { get; init; }
    public IssueResolution Resolution { get; init; } = IssueResolution.NotFixed;
    public string? Reporter { get; init; }
    public string? LinkedTaskId { get; init; }
    public Guid ProjectId { get; init; }
    public int Position { get; init; }
    public int TimeSpentMinutes { get; init; }
}

public sealed record SubtaskDto
{
    public Guid Id { get; init; }
    public string? IssueKey { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? DueAtUtc { get; init; }
    public bool IsCompleted { get; init; }
    public string CreatedAtUtc { get; init; } = string.Empty;
    public string? UpdatedAtUtc { get; init; }
    public string? CompletedAtUtc { get; init; }
    public string? CreatedBy { get; init; }
    public string? AssignedTo { get; init; }
    public string? Category { get; init; }
    public IssuePriority Priority { get; init; } = IssuePriority.Medium;
    public IssueStatus Status { get; init; } = IssueStatus.Open;
    public SubtaskType SubtaskType { get; init; } = SubtaskType.Development;
    public List<string> Labels { get; init; } = [];
    public List<string> Components { get; init; } = [];
    public string? EpicKey { get; init; }
    public IssueResolution Resolution { get; init; } = IssueResolution.NotFixed;
    public string? Reporter { get; init; }
    public int Position { get; init; }
    public Guid ParentTaskItemId { get; init; }
    public int TimeSpentMinutes { get; init; }
}

public sealed record TimeEntryDto
{
    public Guid Id { get; init; }
    public string? TaskKey { get; init; }
    public string? Description { get; init; }
    public string StartTimeUtc { get; init; } = string.Empty;
    public string EndTimeUtc { get; init; } = string.Empty;
    public int DurationMinutes { get; init; }
    public bool IsAllDay { get; init; }
    public string UserId { get; init; } = "demo-user";
    public Guid? TaskItemId { get; init; }
    public Guid? SubtaskId { get; init; }
    public string? TaskTitle { get; init; }
    public string CreatedAtUtc { get; init; } = string.Empty;
    public string? UpdatedAtUtc { get; init; }
}

public sealed record CommentDto
{
    public Guid Id { get; init; }
    public string Content { get; init; } = string.Empty;
    public string AuthorId { get; init; } = "demo-user";
    public string AuthorName { get; init; } = "Demo User";
    public Guid? ParentCommentId { get; init; }
    public Guid? TaskItemId { get; init; }
    public Guid? SubtaskId { get; init; }
    public bool IsEdited { get; init; }
    public string CreatedAtUtc { get; init; } = string.Empty;
    public string? UpdatedAtUtc { get; init; }
}

public sealed record NotificationDto
{
    public Guid Id { get; init; }
    public string UserId { get; init; } = "demo-user";
    public string Title { get; init; } = string.Empty;
    public string? Message { get; init; }
    public NotificationType Type { get; init; } = NotificationType.ProjectActivated;
    public bool IsRead { get; init; }
    public string CreatedAtUtc { get; init; } = string.Empty;
    public string? ReadAtUtc { get; init; }
    public string? RelatedEntityId { get; init; }
    public string? RelatedEntityType { get; init; }
}

public sealed record SystemTaskDto
{
    public Guid Id { get; init; }
    public string UserId { get; init; } = "demo-user";
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public SystemTaskState State { get; init; } = SystemTaskState.Finished;
    public string CreatedAtUtc { get; init; } = string.Empty;
    public string? CompletedAtUtc { get; init; }
    public string? RelatedEntityId { get; init; }
    public string? RelatedEntityType { get; init; }
}

/// <summary>The full demo dataset returned by GET /api/demo/seed.</summary>
public sealed record DemoSeedResponse
{
    public List<ProjectDto> Projects { get; init; } = [];
    public List<TaskItemDto> TaskItems { get; init; } = [];
    public List<SubtaskDto> Subtasks { get; init; } = [];
    public List<TimeEntryDto> TimeEntries { get; init; } = [];
    public List<CommentDto> Comments { get; init; } = [];
    public List<NotificationDto> Notifications { get; init; } = [];
    public List<SystemTaskDto> SystemTasks { get; init; } = [];
}
