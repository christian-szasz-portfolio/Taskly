namespace Taskly.Contracts.Enums.Projects;

/// <summary>
/// Represents the activation status of a project in the user's session context.
/// </summary>
public enum ProjectStatus
{
    /// <summary>
    /// The project is not currently active in the user's session context.
    /// </summary>
    Inactive = 0,

    /// <summary>
    /// The project is active in the user's session context.
    /// Task items from this project are displayed in the current session.
    /// </summary>
    Active = 1,
}
