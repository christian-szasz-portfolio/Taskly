namespace Taskly.Contracts.Enums.Issues;

/// <summary>
/// Defines the task status states for issues.
/// </summary>
public enum IssueStatus
{
    /// <summary>
    /// Issue has been created but not yet triaged.
    /// </summary>
    Created = 0,

    /// <summary>
    /// Issue is open and ready to be worked on.
    /// </summary>
    Open = 1,

    /// <summary>
    /// Issue is in the to-do backlog.
    /// </summary>
    Todo = 2,

    /// <summary>
    /// Issue is actively being worked on.
    /// </summary>
    InProgress = 3,

    /// <summary>
    /// Issue is in testing/QA phase.
    /// </summary>
    Testing = 4,

    /// <summary>
    /// Issue has been completed.
    /// </summary>
    Done = 5,

    /// <summary>
    /// Administrative status for system-managed items (e.g., Epics).
    /// </summary>
    Administrative = 6,
}
