namespace Taskly.Web.Demo;

/// <summary>
/// The mutable in-memory demo dataset. A single instance is held in <see cref="DemoStore"/>
/// (backed by IMemoryCache). There is no database — this is the backend source of truth for
/// the seed endpoint and the Managers/Providers.
/// </summary>
public sealed class DemoDataset
{
    public List<ProjectDto> Projects { get; } = [];
    public List<TaskItemDto> TaskItems { get; } = [];
    public List<SubtaskDto> Subtasks { get; } = [];
    public List<TimeEntryDto> TimeEntries { get; } = [];
    public List<CommentDto> Comments { get; } = [];
    public List<NotificationDto> Notifications { get; } = [];
    public List<SystemTaskDto> SystemTasks { get; } = [];
}
