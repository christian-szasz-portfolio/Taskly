namespace Taskly.Contracts.Enums.Notifications;

/// <summary>
/// Defines the lifecycle states for system tasks.
/// </summary>
public enum SystemTaskState
{
    /// <summary>
    /// Task is being initialized.
    /// </summary>
    Starting = 0,

    /// <summary>
    /// Task has started and is in progress.
    /// </summary>
    Started = 1,

    /// <summary>
    /// Task was cancelled before completion.
    /// </summary>
    Cancelled = 2,

    /// <summary>
    /// Task has completed successfully.
    /// </summary>
    Finished = 3,
}
