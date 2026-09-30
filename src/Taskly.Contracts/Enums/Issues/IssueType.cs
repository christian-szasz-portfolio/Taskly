namespace Taskly.Contracts.Enums.Issues;

/// <summary>
/// Defines the types of issues/work items.
/// </summary>
public enum IssueType
{
    /// <summary>
    /// A problem case requiring investigation.
    /// </summary>
    ProblemCase = 1,

    /// <summary>
    /// A software defect or bug.
    /// </summary>
    Bug = 2,

    /// <summary>
    /// An incident or outage report.
    /// </summary>
    Incident = 3,

    /// <summary>
    /// A user story describing a feature from the user's perspective.
    /// </summary>
    Story = 4,

    /// <summary>
    /// An epic - a large body of work that can be broken down into stories.
    /// </summary>
    Epic = 5,

    /// <summary>
    /// A general task or work item.
    /// </summary>
    Task = 6,

    /// <summary>
    /// A technical task for infrastructure or backend work.
    /// </summary>
    TechnicalTask = 7,

    /// <summary>
    /// An improvement to existing functionality.
    /// </summary>
    Improvement = 8,

    /// <summary>
    /// A documentation task.
    /// </summary>
    Documentation = 9,
}
