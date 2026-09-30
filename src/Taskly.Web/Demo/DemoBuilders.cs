namespace Taskly.Web.Demo;

using Taskly.Contracts.Enums.Issues;
using Taskly.Contracts.Enums.Notifications;

// Fluent builders that emit demo DTOs. Ported from the original product's CQRS demo-seed
// builders (Taskly.Logic.Domain.Licensing.Trial.Builders.*), adapted to produce the in-memory
// records consumed by the seed endpoint instead of EF entities.

/// <summary>Fluent builder for creating task items.</summary>
public sealed class TaskItemBuilder(DemoDataFactory factory, Guid projectId, string title, string description)
{
    private int daysUntilDue;
    private string assignedTo = "dev.team@taskplanner.local";
    private string? category;
    private IssuePriority priority = IssuePriority.Medium;
    private IssueStatus status = IssueStatus.Open;
    private IssueType variant = IssueType.Task;
    private List<string> labels = [];
    private List<string> components = [];
    private int position;
    private string? epicKey;
    private IssueResolution resolution = IssueResolution.NotFixed;
    private int timeSpentMinutes;

    public TaskItemBuilder DueInDays(int days)
    {
        this.daysUntilDue = days;
        return this;
    }

    public TaskItemBuilder AssignedTo(string assignee)
    {
        this.assignedTo = assignee;
        return this;
    }

    public TaskItemBuilder Category(string category)
    {
        this.category = category;
        return this;
    }

    public TaskItemBuilder WithPriority(IssuePriority priority)
    {
        this.priority = priority;
        return this;
    }

    public TaskItemBuilder HavingStatus(IssueStatus status)
    {
        this.status = status;
        return this;
    }

    public TaskItemBuilder OfType(IssueType variant)
    {
        this.variant = variant;
        return this;
    }

    public TaskItemBuilder WithLabels(params string[] labels)
    {
        this.labels = [.. labels];
        return this;
    }

    public TaskItemBuilder HavingComponents(params string[] components)
    {
        this.components = [.. components];
        return this;
    }

    public TaskItemBuilder AtBoardPosition(int position)
    {
        this.position = position;
        return this;
    }

    public TaskItemBuilder LinkedToEpic(string? epicKey)
    {
        this.epicKey = epicKey;
        return this;
    }

    public TaskItemBuilder Resolution(IssueResolution resolution)
    {
        this.resolution = resolution;
        return this;
    }

    public TaskItemBuilder WithTimeSpent(int minutes)
    {
        this.timeSpentMinutes = minutes;
        return this;
    }

    public TaskItemDto Build() => new()
    {
        Id = Guid.NewGuid(),
        IssueKey = factory.NextIssueKey,
        Title = title,
        Description = description,
        DueAtUtc = DemoDataFactory.Iso(factory.Timestamp.AddDays(this.daysUntilDue)),
        IsCompleted = this.status == IssueStatus.Done,
        CreatedAtUtc = DemoDataFactory.Iso(factory.Timestamp),
        UpdatedAtUtc = DemoDataFactory.Iso(factory.Timestamp),
        CreatedBy = factory.Owner,
        AssignedTo = this.assignedTo,
        Category = this.category,
        Priority = this.priority,
        Status = this.status,
        Variant = this.variant,
        Labels = this.labels,
        Components = this.components,
        Position = this.position,
        ProjectId = projectId,
        EpicKey = this.epicKey,
        Resolution = this.resolution,
        TimeSpentMinutes = this.timeSpentMinutes,
    };
}

/// <summary>Fluent builder for creating subtasks.</summary>
public sealed class SubtaskBuilder(DemoDataFactory factory, Guid parentTaskItemId, string title, string description)
{
    private int daysUntilDue;
    private string assignedTo = "dev.team@taskplanner.local";
    private IssuePriority priority = IssuePriority.Medium;
    private IssueStatus status = IssueStatus.Open;
    private SubtaskType subtaskType = SubtaskType.Development;
    private List<string> labels = [];
    private List<string> components = [];
    private int position;
    private string? epicKey;
    private int timeSpentMinutes;

    public SubtaskBuilder DueInDays(int days)
    {
        this.daysUntilDue = days;
        return this;
    }

    public SubtaskBuilder AssignedTo(string assignee)
    {
        this.assignedTo = assignee;
        return this;
    }

    public SubtaskBuilder WithPriority(IssuePriority priority)
    {
        this.priority = priority;
        return this;
    }

    public SubtaskBuilder HavingStatus(IssueStatus status)
    {
        this.status = status;
        return this;
    }

    public SubtaskBuilder OfType(SubtaskType subtaskType)
    {
        this.subtaskType = subtaskType;
        return this;
    }

    public SubtaskBuilder WithLabels(params string[] labels)
    {
        this.labels = [.. labels];
        return this;
    }

    public SubtaskBuilder HavingComponents(params string[] components)
    {
        this.components = [.. components];
        return this;
    }

    public SubtaskBuilder AtBoardPosition(int position)
    {
        this.position = position;
        return this;
    }

    public SubtaskBuilder LinkedToEpic(string? epicKey)
    {
        this.epicKey = epicKey;
        return this;
    }

    public SubtaskBuilder WithTimeSpent(int minutes)
    {
        this.timeSpentMinutes = minutes;
        return this;
    }

    public SubtaskDto Build() => new()
    {
        Id = Guid.NewGuid(),
        IssueKey = factory.NextIssueKey,
        Title = title,
        Description = description,
        DueAtUtc = DemoDataFactory.Iso(factory.Timestamp.AddDays(this.daysUntilDue)),
        IsCompleted = this.status == IssueStatus.Done,
        CreatedAtUtc = DemoDataFactory.Iso(factory.Timestamp),
        UpdatedAtUtc = DemoDataFactory.Iso(factory.Timestamp),
        CreatedBy = factory.Owner,
        AssignedTo = this.assignedTo,
        Priority = this.priority,
        Status = this.status,
        SubtaskType = this.subtaskType,
        Labels = this.labels,
        Components = this.components,
        ParentTaskItemId = parentTaskItemId,
        EpicKey = this.epicKey,
        Position = this.position,
        TimeSpentMinutes = this.timeSpentMinutes,
    };
}

/// <summary>Fluent builder for creating system tasks (the activity feed).</summary>
public sealed class SystemTaskBuilder(DemoDataFactory factory, string name, string? description)
{
    private SystemTaskState state = SystemTaskState.Finished;
    private int daysAgo;
    private Guid? relatedEntityId;
    private string? relatedEntityType;

    public SystemTaskBuilder WithState(SystemTaskState state)
    {
        this.state = state;
        return this;
    }

    public SystemTaskBuilder CreatedDaysAgo(int days)
    {
        this.daysAgo = days;
        return this;
    }

    public SystemTaskBuilder ForEntity(Guid entityId, string entityType)
    {
        this.relatedEntityId = entityId;
        this.relatedEntityType = entityType;
        return this;
    }

    public SystemTaskDto Build()
    {
        var createdAt = factory.Timestamp.AddDays(-this.daysAgo);
        var completedAt = this.state == SystemTaskState.Finished ? createdAt.AddMinutes(1) : (DateTimeOffset?)null;

        return new SystemTaskDto
        {
            Id = Guid.NewGuid(),
            UserId = factory.UserId.ToString(),
            Name = name,
            Description = description,
            State = this.state,
            CreatedAtUtc = DemoDataFactory.Iso(createdAt),
            CompletedAtUtc = completedAt.HasValue ? DemoDataFactory.Iso(completedAt.Value) : null,
            RelatedEntityId = this.relatedEntityId?.ToString(),
            RelatedEntityType = this.relatedEntityType,
        };
    }
}

/// <summary>Fluent builder for creating notifications.</summary>
public sealed class NotificationBuilder(DemoDataFactory factory, string title, string? message)
{
    private NotificationType type = NotificationType.ItemCreated;
    private bool isRead;
    private int daysAgo;
    private Guid? relatedEntityId;
    private string? relatedEntityType;

    public NotificationBuilder OfType(NotificationType type)
    {
        this.type = type;
        return this;
    }

    public NotificationBuilder AsRead()
    {
        this.isRead = true;
        return this;
    }

    public NotificationBuilder CreatedDaysAgo(int days)
    {
        this.daysAgo = days;
        return this;
    }

    public NotificationBuilder ForEntity(Guid entityId, string entityType)
    {
        this.relatedEntityId = entityId;
        this.relatedEntityType = entityType;
        return this;
    }

    public NotificationDto Build()
    {
        var createdAt = factory.Timestamp.AddDays(-this.daysAgo);

        return new NotificationDto
        {
            Id = Guid.NewGuid(),
            UserId = factory.UserId.ToString(),
            Title = title,
            Message = message,
            Type = this.type,
            IsRead = this.isRead,
            CreatedAtUtc = DemoDataFactory.Iso(createdAt),
            ReadAtUtc = this.isRead ? DemoDataFactory.Iso(createdAt.AddMinutes(5)) : null,
            RelatedEntityId = this.relatedEntityId?.ToString(),
            RelatedEntityType = this.relatedEntityType,
        };
    }
}

/// <summary>Fluent builder for creating time entries.</summary>
public sealed class TimeEntryBuilder(DemoDataFactory factory)
{
    private string? taskKey;
    private string? description;
    private string? taskTitle;
    private DateTimeOffset startTimeUtc;
    private DateTimeOffset endTimeUtc;
    private Guid? taskItemId;
    private Guid? subtaskId;
    private int daysAgo;

    public TimeEntryBuilder WithDescription(string description)
    {
        this.description = description;
        this.taskTitle = description;
        return this;
    }

    public TimeEntryBuilder WithTimeRange(DateTimeOffset start, DateTimeOffset end)
    {
        this.startTimeUtc = start;
        this.endTimeUtc = end;
        return this;
    }

    public TimeEntryBuilder DaysAgo(int days)
    {
        this.daysAgo = days;
        return this;
    }

    public TimeEntryBuilder ForTaskItem(Guid taskItemId, string issueKey)
    {
        this.taskItemId = taskItemId;
        this.subtaskId = null;
        this.taskKey = issueKey;
        return this;
    }

    public TimeEntryBuilder ForSubtask(Guid subtaskId, string issueKey)
    {
        this.subtaskId = subtaskId;
        this.taskItemId = null;
        this.taskKey = issueKey;
        return this;
    }

    public TimeEntryDto Build()
    {
        if (this.startTimeUtc == default)
        {
            var baseTime = factory.Timestamp.AddDays(-this.daysAgo).Date.AddHours(9);
            this.startTimeUtc = new DateTimeOffset(baseTime, TimeSpan.Zero);
            this.endTimeUtc = this.startTimeUtc.AddHours(1);
        }

        var duration = this.endTimeUtc - this.startTimeUtc;

        return new TimeEntryDto
        {
            Id = Guid.NewGuid(),
            TaskKey = this.taskKey,
            Description = this.description,
            TaskTitle = this.taskTitle,
            StartTimeUtc = DemoDataFactory.Iso(this.startTimeUtc),
            EndTimeUtc = DemoDataFactory.Iso(this.endTimeUtc),
            DurationMinutes = (int)duration.TotalMinutes,
            IsAllDay = false,
            UserId = factory.UserId.ToString(),
            TaskItemId = this.taskItemId,
            SubtaskId = this.subtaskId,
            CreatedAtUtc = DemoDataFactory.Iso(factory.Timestamp.AddDays(-this.daysAgo)),
        };
    }
}
