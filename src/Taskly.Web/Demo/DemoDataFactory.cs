namespace Taskly.Web.Demo;

using Taskly.Contracts.Enums.Issues;
using Taskly.Contracts.Enums.Notifications;
using Taskly.Contracts.Enums.Projects;

/// <summary>
/// Factory for building the seeded demo dataset with consistent defaults and sequential issue
/// keys. This is the in-memory (DTO) port of the original product's CQRS demo-seed factory
/// (<c>Taskly.Logic.Domain.Licensing.Trial.DemoDataFactory</c>) — same process, no database.
/// A fixed random seed makes the cached dataset stable across requests.
/// </summary>
public sealed class DemoDataFactory(
    DateTimeOffset timestamp,
    string projectKey,
    string owner,
    Guid userId,
    int randomSeed,
    List<(DateTimeOffset Start, DateTimeOffset End)>? sharedTimeSlots = null)
{
    /// <summary>The key for the primary demo project.</summary>
    public const string DemoProjectKey = "DEMO";

    /// <summary>The key for the secondary sample project.</summary>
    public const string SampleProjectKey = "SAMPLE";

    private readonly Random random = new(randomSeed);
    private readonly List<(DateTimeOffset Start, DateTimeOffset End)> usedTimeSlots = sharedTimeSlots ?? [];
    private int issueKeyIndex = 1;

    public string Owner => owner;

    public Guid UserId => userId;

    public DateTimeOffset Timestamp => timestamp;

    public string NextIssueKey => $"{projectKey}-{this.issueKeyIndex++}";

    /// <summary>ISO-8601 round-trip string used for every timestamp in the demo payload.</summary>
    public static string Iso(DateTimeOffset value) => value.ToString("o");

    /// <summary>
    /// Generates a random time spent in minutes (multiples of 30, between 30 and maxMinutes),
    /// with a chance of returning 0 (no time logged).
    /// </summary>
    public int GetRandomTimeSpent(int maxMinutes = 480, double noTimeLoggedProbability = 0.3)
    {
        if (this.random.NextDouble() < noTimeLoggedProbability)
        {
            return 0;
        }

        var slots = maxMinutes / 30;
        var randomSlots = this.random.Next(1, slots + 1);
        return randomSlots * 30;
    }

    /// <summary>Creates the demo project.</summary>
    public ProjectDto CreateProject(string title, string description, ProjectStatus status) => new()
    {
        Id = Guid.NewGuid(),
        Key = projectKey,
        Title = title,
        Description = description,
        Status = status,
        Owner = this.Owner,
        CreatedAtUtc = Iso(this.Timestamp),
        UpdatedAtUtc = Iso(this.Timestamp),
        Labels = ["Refactoring", "Feature", "NFR"],
        Components = ["Core", "API", "Frontend", "Database", "Domain"],
    };

    /// <summary>Creates an epic task item with the next sequential issue key.</summary>
    public TaskItemDto CreateEpic(Guid projectId, string title, string description) => new()
    {
        Id = Guid.NewGuid(),
        IssueKey = this.NextIssueKey,
        Title = title,
        Description = description,
        IsCompleted = false,
        CreatedAtUtc = Iso(this.Timestamp),
        UpdatedAtUtc = Iso(this.Timestamp),
        CreatedBy = this.Owner,
        AssignedTo = this.Owner,
        Priority = IssuePriority.Medium,
        Status = IssueStatus.Administrative,
        Variant = IssueType.Epic,
        Labels = [],
        Components = [],
        Position = 0,
        ProjectId = projectId,
    };

    /// <summary>Starts building a task item.</summary>
    public TaskItemBuilder CreateTaskItem(Guid projectId, string title, string description) =>
        new(this, projectId, title, description);

    /// <summary>Starts building a subtask.</summary>
    public SubtaskBuilder CreateSubtask(Guid parentTaskItemId, string title, string description) =>
        new(this, parentTaskItemId, title, description);

    /// <summary>Starts building a system task.</summary>
    public SystemTaskBuilder CreateSystemTask(string name, string? description = null) =>
        new(this, name, description);

    /// <summary>Starts building a notification.</summary>
    public NotificationBuilder CreateNotification(string title, string? message = null) =>
        new(this, title, message);

    /// <summary>Starts building a time entry.</summary>
    public TimeEntryBuilder CreateTimeEntry() => new(this);

    /// <summary>
    /// Creates random (but deterministic, given the seed) non-overlapping time entries for a
    /// task item or subtask.
    /// </summary>
    public List<TimeEntryDto> CreateRandomTimeEntries(
        Guid? taskItemId,
        Guid? subtaskId,
        string issueKey,
        int minEntries = 1,
        int maxEntries = 5)
    {
        var count = this.random.Next(minEntries, maxEntries + 1);
        var entries = new List<TimeEntryDto>();
        var descriptions = new[]
        {
            "Implementation work",
            "Code review and testing",
            "Bug fixes and refinements",
            "Documentation updates",
            "Research and planning",
            "Team collaboration",
            "Technical investigation",
            "Feature development",
        };

        for (var i = 0; i < count; i++)
        {
            var daysAgo = this.random.Next(0, 14);
            var durationMinutes = this.GetRandomTimeSpent(240, 0.1);
            if (durationMinutes == 0)
            {
                durationMinutes = 30;
            }

            var description = descriptions[this.random.Next(descriptions.Length)];
            var baseDate = this.Timestamp.AddDays(-daysAgo).Date;

            var (startTime, endTime) = this.FindAvailableTimeSlot(baseDate, durationMinutes);
            if (startTime == default)
            {
                continue;
            }

            this.usedTimeSlots.Add((startTime, endTime));

            var builder = this.CreateTimeEntry()
                .WithDescription(description)
                .WithTimeRange(startTime, endTime)
                .DaysAgo(daysAgo);

            if (taskItemId.HasValue)
            {
                builder.ForTaskItem(taskItemId.Value, issueKey);
            }
            else if (subtaskId.HasValue)
            {
                builder.ForSubtask(subtaskId.Value, issueKey);
            }

            entries.Add(builder.Build());
        }

        return entries;
    }

    /// <summary>
    /// Finds an available (non-overlapping) time slot on the given date using deterministic
    /// gap-finding within an 08:00–18:00 workday.
    /// </summary>
    private (DateTimeOffset Start, DateTimeOffset End) FindAvailableTimeSlot(DateTime baseDate, int durationMinutes)
    {
        const int workdayStartHour = 8;
        const int workdayEndHour = 18;

        var dayStart = new DateTimeOffset(baseDate.AddHours(workdayStartHour), TimeSpan.Zero);
        var dayEnd = new DateTimeOffset(baseDate.AddHours(workdayEndHour), TimeSpan.Zero);

        var maxDuration = (workdayEndHour - workdayStartHour) * 60;
        if (durationMinutes > maxDuration)
        {
            durationMinutes = maxDuration;
        }

        var daySlots = this.usedTimeSlots
            .Where(slot => slot.Start.Date == baseDate.Date)
            .OrderBy(slot => slot.Start)
            .ToList();

        var currentStart = dayStart;

        foreach (var (existingStart, existingEnd) in daySlots)
        {
            var gapMinutes = (existingStart - currentStart).TotalMinutes;
            if (gapMinutes >= durationMinutes)
            {
                return (currentStart, currentStart.AddMinutes(durationMinutes));
            }

            currentStart = existingEnd > currentStart ? existingEnd : currentStart;
        }

        var remainingMinutes = (dayEnd - currentStart).TotalMinutes;
        if (remainingMinutes >= durationMinutes)
        {
            return (currentStart, currentStart.AddMinutes(durationMinutes));
        }

        return (default, default);
    }
}
