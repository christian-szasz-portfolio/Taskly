namespace Taskly.Web.Demo;

using Taskly.Contracts.Enums.Issues;
using Taskly.Contracts.Enums.Notifications;
using Taskly.Contracts.Enums.Projects;

/// <summary>
/// Builds the seeded demo dataset entirely in memory. This is the in-memory (DTO) port of the
/// original product's CQRS demo-seed orchestrator
/// (<c>Taskly.Logic.Domain.Licensing.TrialDemoDataHandler</c>): it creates a DEMO project (active)
/// and a SAMPLE project (inactive), each with an epic, standalone items, items-with-subtasks,
/// backlog and resolved items plus time entries, and — for the DEMO project — a system-task
/// activity feed and notifications. The only deviation from the original is persistence: there is
/// no database, the result is cached (<see cref="DemoStore"/>) and served to the client.
/// </summary>
public sealed class DemoSeedManager
{
    // The demo "current user" — project owner and creator of every item. Assignees use the
    // original product's @taskplanner.local team addresses (mirrored verbatim below).
    private const string DemoOwner = "you@taskly.demo";
    private static readonly Guid DemoUserId = new("d3000000-0000-0000-0000-000000000001");

    public DemoDataset Build()
    {
        var timestamp = DateTimeOffset.UtcNow;
        var dataset = new DemoDataset();

        // Shared time slots prevent overlapping time entries across the two project factories.
        var sharedTimeSlots = new List<(DateTimeOffset Start, DateTimeOffset End)>();

        // DEMO project (active) — the rich, primary workspace.
        var demoFactory = new DemoDataFactory(
            timestamp, DemoDataFactory.DemoProjectKey, DemoOwner, DemoUserId, randomSeed: 1, sharedTimeSlots);
        var demoProject = demoFactory.CreateProject(
            "Demo Project", "A demo project for testing task management.", ProjectStatus.Active);
        dataset.Projects.Add(demoProject);
        var demoTaskItems = SeedProjectData(demoFactory, demoProject.Id, dataset);

        // SAMPLE project (inactive) — same structure, shares time slots to avoid overlaps.
        var sampleFactory = new DemoDataFactory(
            timestamp, DemoDataFactory.SampleProjectKey, DemoOwner, DemoUserId, randomSeed: 2, sharedTimeSlots);
        var sampleProject = sampleFactory.CreateProject(
            "Sample Project", "A sample project with the same structure as the demo project.", ProjectStatus.Inactive);
        dataset.Projects.Add(sampleProject);
        SeedProjectData(sampleFactory, sampleProject.Id, dataset);

        // System tasks + notifications reference the DEMO project's entities.
        dataset.SystemTasks.AddRange(CreateDemoSystemTasks(demoFactory, demoProject, demoTaskItems));
        dataset.Notifications.AddRange(CreateDemoNotifications(demoFactory, demoProject, demoTaskItems));

        return dataset;
    }

    /// <summary>
    /// Seeds all task items, subtasks and time entries for a single project and returns the
    /// project's task items (used to build the activity feed for the DEMO project).
    /// </summary>
    private static List<TaskItemDto> SeedProjectData(DemoDataFactory factory, Guid projectId, DemoDataset dataset)
    {
        var allTaskItems = new List<TaskItemDto>();

        // Epic first — every item references this.
        var techDebtEpic = factory.CreateEpic(
            projectId, "Tech Debt", "Epic for tracking technical debt, refactoring, and code quality improvements.");
        dataset.TaskItems.Add(techDebtEpic);
        allTaskItems.Add(techDebtEpic);
        var epicKey = techDebtEpic.IssueKey!;

        // 5 standalone items.
        var standaloneItems = CreateStandaloneTaskItems(factory, projectId, epicKey);
        dataset.TaskItems.AddRange(standaloneItems);
        allTaskItems.AddRange(standaloneItems);

        // 2 items that own subtasks.
        var dashboardItem = factory
            .CreateTaskItem(projectId, "Build user dashboard feature", "Create a comprehensive user dashboard with widgets and analytics.")
            .DueInDays(14)
            .AssignedTo("dev.team@taskplanner.local")
            .Category("Feature")
            .WithPriority(IssuePriority.High)
            .HavingStatus(IssueStatus.InProgress)
            .OfType(IssueType.Story)
            .WithLabels("Feature")
            .HavingComponents("Frontend", "Domain")
            .AtBoardPosition(1)
            .LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent())
            .Build();

        var notificationItem = factory
            .CreateTaskItem(projectId, "Implement notification system", "Build a real-time notification system with email and push notifications.")
            .DueInDays(21)
            .AssignedTo("backend.team@taskplanner.local")
            .Category("Feature")
            .WithPriority(IssuePriority.Medium)
            .HavingStatus(IssueStatus.Todo)
            .OfType(IssueType.Story)
            .WithLabels("Feature")
            .HavingComponents("Domain", "API")
            .AtBoardPosition(4)
            .LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent())
            .Build();

        dataset.TaskItems.Add(dashboardItem);
        dataset.TaskItems.Add(notificationItem);
        allTaskItems.Add(dashboardItem);
        allTaskItems.Add(notificationItem);

        var dashboardSubtasks = CreateDashboardSubtasks(factory, dashboardItem.Id, epicKey);
        dataset.Subtasks.AddRange(dashboardSubtasks);

        var notificationSubtasks = CreateNotificationSubtasks(factory, notificationItem.Id, epicKey);
        dataset.Subtasks.AddRange(notificationSubtasks);

        // 2 backlog items (Created) + 2 resolved items (Done).
        var backlogItems = CreateBacklogItems(factory, projectId, epicKey);
        dataset.TaskItems.AddRange(backlogItems);
        allTaskItems.AddRange(backlogItems);

        var resolvedItems = CreateResolvedItems(factory, projectId, epicKey);
        dataset.TaskItems.AddRange(resolvedItems);
        allTaskItems.AddRange(resolvedItems);

        // Time entries for the temporal calendar.
        foreach (var item in standaloneItems.Where(w => w.TimeSpentMinutes > 0))
        {
            dataset.TimeEntries.AddRange(factory.CreateRandomTimeEntries(item.Id, null, item.IssueKey!, 1, 3));
        }

        if (dashboardItem.TimeSpentMinutes > 0)
        {
            dataset.TimeEntries.AddRange(factory.CreateRandomTimeEntries(dashboardItem.Id, null, dashboardItem.IssueKey!, 2, 4));
        }

        if (notificationItem.TimeSpentMinutes > 0)
        {
            dataset.TimeEntries.AddRange(factory.CreateRandomTimeEntries(notificationItem.Id, null, notificationItem.IssueKey!, 1, 3));
        }

        foreach (var subtask in dashboardSubtasks.Where(s => s.TimeSpentMinutes > 0).Take(3))
        {
            dataset.TimeEntries.AddRange(factory.CreateRandomTimeEntries(null, subtask.Id, subtask.IssueKey!, 1, 2));
        }

        foreach (var subtask in notificationSubtasks.Where(s => s.TimeSpentMinutes > 0).Take(3))
        {
            dataset.TimeEntries.AddRange(factory.CreateRandomTimeEntries(null, subtask.Id, subtask.IssueKey!, 1, 2));
        }

        foreach (var item in resolvedItems)
        {
            dataset.TimeEntries.AddRange(factory.CreateRandomTimeEntries(item.Id, null, item.IssueKey!, 3, 6));
        }

        return allTaskItems;
    }

    /// <summary>Creates the 5 standalone task items with no subtasks.</summary>
    private static List<TaskItemDto> CreateStandaloneTaskItems(DemoDataFactory factory, Guid projectId, string epicKey) =>
    [
        factory
            .CreateTaskItem(projectId, "Set up development environment", "Configure local development environment with all necessary tools and dependencies.")
            .DueInDays(3).AssignedTo("dev.team@taskplanner.local").Category("Setup")
            .WithPriority(IssuePriority.High).HavingStatus(IssueStatus.Todo).OfType(IssueType.Task)
            .WithLabels("Feature").HavingComponents("Core").AtBoardPosition(0).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),

        factory
            .CreateTaskItem(projectId, "Review API documentation", "Review and update the API documentation to ensure accuracy.")
            .DueInDays(5).AssignedTo("docs.team@taskplanner.local").Category("Documentation")
            .WithPriority(IssuePriority.Medium).HavingStatus(IssueStatus.Open).OfType(IssueType.Task)
            .WithLabels("NFR").HavingComponents("API").AtBoardPosition(1).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),

        factory
            .CreateTaskItem(projectId, "Fix login page styling issue", "The login button is misaligned on mobile devices.")
            .DueInDays(2).AssignedTo("frontend.team@taskplanner.local").Category("UI/UX")
            .WithPriority(IssuePriority.High).HavingStatus(IssueStatus.InProgress).OfType(IssueType.Bug)
            .WithLabels("Refactoring").HavingComponents("Frontend").AtBoardPosition(0).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),

        factory
            .CreateTaskItem(projectId, "Implement user authentication", "Add JWT-based authentication to the application.")
            .DueInDays(10).AssignedTo("security.team@taskplanner.local").Category("Security")
            .WithPriority(IssuePriority.Medium).HavingStatus(IssueStatus.Todo).OfType(IssueType.Story)
            .WithLabels("Feature").HavingComponents("Core", "API").AtBoardPosition(2).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),

        factory
            .CreateTaskItem(projectId, "Database performance optimization", "Analyze and optimize slow database queries.")
            .DueInDays(7).AssignedTo("dba.team@taskplanner.local").Category("Performance")
            .WithPriority(IssuePriority.Medium).HavingStatus(IssueStatus.Open).OfType(IssueType.TechnicalTask)
            .WithLabels("Refactoring").HavingComponents("Database").AtBoardPosition(3).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),
    ];

    /// <summary>Creates the subtasks for the dashboard feature task item.</summary>
    private static List<SubtaskDto> CreateDashboardSubtasks(DemoDataFactory factory, Guid dashboardItemId, string epicKey) =>
    [
        factory
            .CreateSubtask(dashboardItemId, "Design dashboard wireframes", "Create wireframes for the dashboard layout.")
            .DueInDays(3).AssignedTo("design.team@taskplanner.local").WithPriority(IssuePriority.High)
            .HavingStatus(IssueStatus.Done).OfType(SubtaskType.Development).WithLabels("Feature")
            .HavingComponents("Frontend").AtBoardPosition(0).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),

        factory
            .CreateSubtask(dashboardItemId, "Implement dashboard API endpoints", "Create REST API endpoints for dashboard data.")
            .DueInDays(7).AssignedTo("backend.team@taskplanner.local").WithPriority(IssuePriority.High)
            .HavingStatus(IssueStatus.InProgress).OfType(SubtaskType.Development).WithLabels("Feature")
            .HavingComponents("API", "Domain").AtBoardPosition(1).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),

        factory
            .CreateSubtask(dashboardItemId, "Build dashboard UI components", "Implement Angular components for the dashboard.")
            .DueInDays(10).AssignedTo("frontend.team@taskplanner.local").WithPriority(IssuePriority.Medium)
            .HavingStatus(IssueStatus.Todo).OfType(SubtaskType.Development).WithLabels("Feature")
            .HavingComponents("Frontend").AtBoardPosition(2).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),

        factory
            .CreateSubtask(dashboardItemId, "Add dashboard translations", "Translate dashboard text to supported languages.")
            .DueInDays(12).AssignedTo("localization.team@taskplanner.local").WithPriority(IssuePriority.Low)
            .HavingStatus(IssueStatus.Open).OfType(SubtaskType.Translations).WithLabels("NFR")
            .HavingComponents("Frontend").AtBoardPosition(3).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),

        factory
            .CreateSubtask(dashboardItemId, "Write dashboard unit tests", "Create comprehensive unit tests for dashboard functionality.")
            .DueInDays(13).AssignedTo("qa.team@taskplanner.local").WithPriority(IssuePriority.Medium)
            .HavingStatus(IssueStatus.Open).OfType(SubtaskType.Development).WithLabels("NFR")
            .HavingComponents("Frontend", "API").AtBoardPosition(4).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),
    ];

    /// <summary>Creates the subtasks for the notification system task item.</summary>
    private static List<SubtaskDto> CreateNotificationSubtasks(DemoDataFactory factory, Guid notificationItemId, string epicKey) =>
    [
        factory
            .CreateSubtask(notificationItemId, "Design the database schema for notifications.", "Create the database schema for the notification system.")
            .DueInDays(5).AssignedTo("dba.team@taskplanner.local").WithPriority(IssuePriority.High)
            .HavingStatus(IssueStatus.Open).OfType(SubtaskType.Development).WithLabels("Feature")
            .HavingComponents("Database").AtBoardPosition(0).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),

        factory
            .CreateSubtask(notificationItemId, "Implement email notification service", "Create service for sending email notifications.")
            .DueInDays(10).AssignedTo("backend.team@taskplanner.local").WithPriority(IssuePriority.High)
            .HavingStatus(IssueStatus.Open).OfType(SubtaskType.Development).WithLabels("Feature")
            .HavingComponents("Domain", "API").AtBoardPosition(1).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),

        factory
            .CreateSubtask(notificationItemId, "Implement push notification service", "Create service for sending push notifications.")
            .DueInDays(15).AssignedTo("backend.team@taskplanner.local").WithPriority(IssuePriority.Medium)
            .HavingStatus(IssueStatus.Open).OfType(SubtaskType.Development).WithLabels("Feature")
            .HavingComponents("Domain", "API").AtBoardPosition(2).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),

        factory
            .CreateSubtask(notificationItemId, "Add notification translations", "Translate notification messages to supported languages.")
            .DueInDays(18).AssignedTo("localization.team@taskplanner.local").WithPriority(IssuePriority.Low)
            .HavingStatus(IssueStatus.Open).OfType(SubtaskType.Translations).WithLabels("NFR")
            .HavingComponents("Frontend", "Domain").AtBoardPosition(3).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),

        factory
            .CreateSubtask(notificationItemId, "Build notification preferences UI", "Create UI for users to manage notification preferences.")
            .DueInDays(20).AssignedTo("frontend.team@taskplanner.local").WithPriority(IssuePriority.Medium)
            .HavingStatus(IssueStatus.Open).OfType(SubtaskType.Development).WithLabels("Feature")
            .HavingComponents("Frontend").AtBoardPosition(4).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),
    ];

    /// <summary>Creates the 2 backlog items with Created status.</summary>
    private static List<TaskItemDto> CreateBacklogItems(DemoDataFactory factory, Guid projectId, string epicKey) =>
    [
        factory
            .CreateTaskItem(projectId, "Research caching strategies", "Investigate caching options for improving application performance.")
            .DueInDays(30).AssignedTo("dev.team@taskplanner.local").Category("Research")
            .WithPriority(IssuePriority.Low).HavingStatus(IssueStatus.Created).OfType(IssueType.Task)
            .WithLabels("NFR").HavingComponents("Core").AtBoardPosition(0).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),

        factory
            .CreateTaskItem(projectId, "Plan mobile app integration", "Create a roadmap for integrating mobile app support.")
            .DueInDays(45).AssignedTo("product.team@taskplanner.local").Category("Planning")
            .WithPriority(IssuePriority.Low).HavingStatus(IssueStatus.Created).OfType(IssueType.Story)
            .WithLabels("Feature").HavingComponents("Frontend", "API").AtBoardPosition(1).LinkedToEpic(epicKey)
            .WithTimeSpent(factory.GetRandomTimeSpent()).Build(),
    ];

    /// <summary>Creates the 2 resolved items with Done status and resolution.</summary>
    private static List<TaskItemDto> CreateResolvedItems(DemoDataFactory factory, Guid projectId, string epicKey) =>
    [
        factory
            .CreateTaskItem(projectId, "Set up CI/CD pipeline", "Configure continuous integration and deployment pipelines.")
            .DueInDays(-7).AssignedTo("devops.team@taskplanner.local").Category("DevOps")
            .WithPriority(IssuePriority.High).HavingStatus(IssueStatus.Done).OfType(IssueType.Task)
            .WithLabels("NFR").HavingComponents("Core").AtBoardPosition(0).LinkedToEpic(epicKey)
            .Resolution(IssueResolution.Fixed).WithTimeSpent(factory.GetRandomTimeSpent()).Build(),

        factory
            .CreateTaskItem(projectId, "Initial project scaffolding", "Create the initial project structure and configuration.")
            .DueInDays(-14).AssignedTo("dev.team@taskplanner.local").Category("Setup")
            .WithPriority(IssuePriority.Low).HavingStatus(IssueStatus.Done).OfType(IssueType.Task)
            .WithLabels("Feature").HavingComponents("Core", "Domain").AtBoardPosition(1).LinkedToEpic(epicKey)
            .Resolution(IssueResolution.Closed).WithTimeSpent(factory.GetRandomTimeSpent()).Build(),
    ];

    /// <summary>Creates the demo system-task activity feed for the DEMO project.</summary>
    private static List<SystemTaskDto> CreateDemoSystemTasks(DemoDataFactory factory, ProjectDto demoProject, List<TaskItemDto> taskItems)
    {
        var tasks = new List<SystemTaskDto>
        {
            factory
                .CreateSystemTask("Created project 'Demo Project'", "Successfully created the demo project with initial configuration.")
                .WithState(SystemTaskState.Finished).CreatedDaysAgo(7).ForEntity(demoProject.Id, "Project").Build(),
        };

        var epic = taskItems.FirstOrDefault(w => w.Variant == IssueType.Epic);
        if (epic != null)
        {
            tasks.Add(factory
                .CreateSystemTask($"Created epic '{epic.Title}'", "Successfully created the Tech Debt epic for tracking technical improvements.")
                .WithState(SystemTaskState.Finished).CreatedDaysAgo(6).ForEntity(epic.Id, "TaskItem").Build());
        }

        var storyItems = taskItems.Where(w => w.Variant == IssueType.Story).Take(2).ToList();
        for (var i = 0; i < storyItems.Count; i++)
        {
            var item = storyItems[i];
            tasks.Add(factory
                .CreateSystemTask($"Created story '{item.Title}'", $"Successfully created story {item.IssueKey} with {(item.Status == IssueStatus.InProgress ? "in progress" : "todo")} status.")
                .WithState(SystemTaskState.Finished).CreatedDaysAgo(5 - i).ForEntity(item.Id, "TaskItem").Build());
        }

        var bugItem = taskItems.FirstOrDefault(w => w.Variant == IssueType.Bug);
        if (bugItem != null)
        {
            tasks.Add(factory
                .CreateSystemTask($"Created bug '{bugItem.Title}'", $"Reported bug {bugItem.IssueKey} for the login page styling issue.")
                .WithState(SystemTaskState.Finished).CreatedDaysAgo(4).ForEntity(bugItem.Id, "TaskItem").Build());
        }

        var resolvedItems = taskItems.Where(w => w.Status == IssueStatus.Done).Take(2).ToList();
        for (var i = 0; i < resolvedItems.Count; i++)
        {
            var item = resolvedItems[i];
            tasks.Add(factory
                .CreateSystemTask($"Resolved '{item.Title}'", $"Successfully completed and closed {item.IssueKey}.")
                .WithState(SystemTaskState.Finished).CreatedDaysAgo(3 - i).ForEntity(item.Id, "TaskItem").Build());
        }

        var inProgressItem = taskItems.FirstOrDefault(w => w.Status == IssueStatus.InProgress);
        if (inProgressItem != null)
        {
            tasks.Add(factory
                .CreateSystemTask($"Started work on '{inProgressItem.Title}'", $"Moved {inProgressItem.IssueKey} to In Progress status.")
                .WithState(SystemTaskState.Finished).CreatedDaysAgo(1).ForEntity(inProgressItem.Id, "TaskItem").Build());
        }

        tasks.Add(factory
            .CreateSystemTask("Syncing project data", "Synchronizing task items with external systems.")
            .WithState(SystemTaskState.Started).CreatedDaysAgo(0).ForEntity(demoProject.Id, "Project").Build());

        return tasks;
    }

    /// <summary>Creates the demo notifications for the DEMO project.</summary>
    private static List<NotificationDto> CreateDemoNotifications(DemoDataFactory factory, ProjectDto demoProject, List<TaskItemDto> taskItems)
    {
        var notifications = new List<NotificationDto>
        {
            factory
                .CreateNotification("Project Activated", $"The project '{demoProject.Title}' has been activated and is ready for use.")
                .OfType(NotificationType.ProjectActivated).AsRead().CreatedDaysAgo(7).ForEntity(demoProject.Id, "Project").Build(),
        };

        var recentItems = taskItems.Where(w => w.Variant != IssueType.Epic).Take(3).ToList();
        for (var i = 0; i < recentItems.Count; i++)
        {
            var item = recentItems[i];
            notifications.Add(factory
                .CreateNotification($"New {item.Variant} Created", $"'{item.Title}' ({item.IssueKey}) has been added to the project.")
                .OfType(NotificationType.ItemCreated).AsRead().CreatedDaysAgo(6 - i).ForEntity(item.Id, "TaskItem").Build());
        }

        var resolvedItems = taskItems.Where(w => w.Status == IssueStatus.Done).Take(2).ToList();
        foreach (var item in resolvedItems)
        {
            notifications.Add(factory
                .CreateNotification("Item Resolved", $"'{item.Title}' ({item.IssueKey}) has been marked as done.")
                .OfType(NotificationType.ItemResolved).AsRead().CreatedDaysAgo(2).ForEntity(item.Id, "TaskItem").Build());
        }

        var upcomingDeadlineItem = taskItems.FirstOrDefault(w => w.Status == IssueStatus.InProgress && w.DueAtUtc != null);
        if (upcomingDeadlineItem != null)
        {
            notifications.Add(factory
                .CreateNotification("Deadline Approaching", $"'{upcomingDeadlineItem.Title}' ({upcomingDeadlineItem.IssueKey}) is due soon. Please review the progress.")
                .OfType(NotificationType.DeadlineApproaching).CreatedDaysAgo(1).ForEntity(upcomingDeadlineItem.Id, "TaskItem").Build());
        }

        var overdueItem = taskItems.FirstOrDefault(w =>
            w.DueAtUtc != null &&
            DateTimeOffset.TryParse(w.DueAtUtc, out var due) && due < factory.Timestamp &&
            w.Status != IssueStatus.Done);
        if (overdueItem != null)
        {
            notifications.Add(factory
                .CreateNotification("Deadline Overdue", $"'{overdueItem.Title}' ({overdueItem.IssueKey}) has passed its due date. Immediate attention required.")
                .OfType(NotificationType.DeadlineOverdue).CreatedDaysAgo(0).ForEntity(overdueItem.Id, "TaskItem").Build());
        }

        notifications.Add(factory
            .CreateNotification("Weekly Activity Digest", "Your weekly summary is ready. You have 12 active items across 2 projects with 3 items completed this week.")
            .OfType(NotificationType.WeeklyDigestReady).CreatedDaysAgo(0).ForEntity(demoProject.Id, "Project").Build());

        var backloggedItem = taskItems.FirstOrDefault(w => w.Status == IssueStatus.Created);
        if (backloggedItem != null)
        {
            notifications.Add(factory
                .CreateNotification("Item Backlogged", $"'{backloggedItem.Title}' ({backloggedItem.IssueKey}) has been moved to the backlog for future planning.")
                .OfType(NotificationType.ItemBacklogged).AsRead().CreatedDaysAgo(3).ForEntity(backloggedItem.Id, "TaskItem").Build());
        }

        return notifications;
    }
}
