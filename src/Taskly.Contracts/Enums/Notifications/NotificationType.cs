namespace Taskly.Contracts.Enums.Notifications;

/// <summary>
/// Defines the types of notifications that can be sent to users.
/// </summary>
public enum NotificationType
{
    /// <summary>
    /// A project was activated or deactivated.
    /// </summary>
    ProjectActivated = 0,

    /// <summary>
    /// A new item (project, task item, subtask, epic) was created.
    /// </summary>
    ItemCreated = 1,

    /// <summary>
    /// An item was moved to resolved/done status.
    /// </summary>
    ItemResolved = 2,

    /// <summary>
    /// An item was moved back to the backlog.
    /// </summary>
    ItemBacklogged = 3,

    /// <summary>
    /// An item's deadline is approaching (within 24 hours).
    /// </summary>
    DeadlineApproaching = 4,

    /// <summary>
    /// An item's deadline has passed.
    /// </summary>
    DeadlineOverdue = 5,

    /// <summary>
    /// The weekly activity digest is ready.
    /// </summary>
    WeeklyDigestReady = 6,

    /// <summary>
    /// A user was added as a contributor to a project.
    /// </summary>
    ContributorAdded = 7,

    /// <summary>
    /// A user was removed as a contributor from a project.
    /// </summary>
    ContributorRemoved = 8,
}
