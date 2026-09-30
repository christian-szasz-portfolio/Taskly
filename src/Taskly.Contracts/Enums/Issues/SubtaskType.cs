namespace Taskly.Contracts.Enums.Issues;

/// <summary>
/// Defines the types of subtasks.
/// </summary>
public enum SubtaskType
{
    /// <summary>
    /// Development work subtask.
    /// </summary>
    Development = 1,

    /// <summary>
    /// Translation/localization subtask.
    /// </summary>
    Translations = 2,

    /// <summary>
    /// Bug fix during development subtask.
    /// </summary>
    BugInDevelopment = 3,
}
