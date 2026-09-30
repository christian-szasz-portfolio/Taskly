namespace Taskly.Web.Demo;

/// <summary>
/// Provider (read) that assembles the full demo dataset for <c>GET /api/demo/seed</c>.
/// </summary>
public sealed class DemoSeedProvider(IDemoStore store)
{
    public DemoSeedResponse GetSeed()
    {
        var data = store.Dataset;
        return new DemoSeedResponse
        {
            Projects = [.. data.Projects],
            TaskItems = [.. data.TaskItems],
            Subtasks = [.. data.Subtasks],
            TimeEntries = [.. data.TimeEntries],
            Comments = [.. data.Comments],
            Notifications = [.. data.Notifications],
            SystemTasks = [.. data.SystemTasks],
        };
    }
}
