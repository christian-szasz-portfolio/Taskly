namespace Taskly.Contracts.Enums.Issues;

/// <summary>
/// Defines the resolution states for completed issues.
/// </summary>
public enum IssueResolution
{
    /// <summary>
    /// The issue was not fixed or resolved.
    /// </summary>
    NotFixed = 0,

    /// <summary>
    /// The issue was successfully fixed.
    /// </summary>
    Fixed = 1,

    /// <summary>
    /// The issue was closed without being fixed (e.g., duplicate, won't fix).
    /// </summary>
    Closed = 2,
}
