namespace Taskly.Web.Demo;

/// <summary>
/// Provider (read) for task items — the read half of the Managers/Providers split that
/// replaces the original CQRS query handlers. Reads from the in-memory demo store.
/// </summary>
public sealed class TaskItemProvider(IDemoStore store)
{
    public IReadOnlyList<TaskItemDto> GetAll() => store.Dataset.TaskItems;

    public TaskItemDto? GetById(Guid id) =>
        store.Dataset.TaskItems.FirstOrDefault(item => item.Id == id);
}

/// <summary>
/// Manager (write) for task items — the write half that replaces the original CQRS command
/// handlers. Mutates the in-memory demo store. (Representative example of the pattern; the demo
/// client is the source of truth, so these endpoints are optional polish.)
/// </summary>
public sealed class TaskItemManager(IDemoStore store)
{
    public TaskItemDto Create(TaskItemDto dto)
    {
        var created = dto with { Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id };
        store.Dataset.TaskItems.Insert(0, created);
        return created;
    }

    public TaskItemDto? Update(Guid id, TaskItemDto dto)
    {
        var items = store.Dataset.TaskItems;
        var index = items.FindIndex(item => item.Id == id);
        if (index < 0)
        {
            return null;
        }

        var updated = dto with { Id = id };
        items[index] = updated;
        return updated;
    }

    public bool Delete(Guid id) => store.Dataset.TaskItems.RemoveAll(item => item.Id == id) > 0;
}
